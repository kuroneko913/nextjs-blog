const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);

// Exercise the real route handlers and transaction logic without writing to the live blog.
const records = new Map();
const snap = (key) => ({ id: key.split('/').at(-1), exists: records.has(key), data: () => records.get(key) });
const db = {
  collection(name) {
    const collection = {
      doc(id) { const key = `${name}/${id}`; return { key, get: async () => snap(key), delete: async () => records.delete(key) }; },
      orderBy() {
        let limit = Infinity; let after;
        const query = {
          orderBy() { return query; }, limit(value) { limit = value; return query; }, startAfter(snapshot) { after = snapshot.id; return query; },
          async get() {
            let entries = [...records].filter(([key]) => key.startsWith(`${name}/`)).sort((a,b) => b[1].createdAt.localeCompare(a[1].createdAt) || b[0].localeCompare(a[0]));
            if (after) entries = entries.slice(entries.findIndex(([key]) => key.endsWith(`/${after}`)) + 1);
            const docs = entries.slice(0,limit).map(([key]) => snap(key)); return { docs, size: docs.length };
          }
        }; return query;
      }
    }; return collection;
  },
  async runTransaction(callback) { return callback({ get: async ref => snap(ref.key), create(ref, value) { assert.equal(records.has(ref.key),false); records.set(ref.key,value); }, set(ref,value) { records.set(ref.key,value); } }); }
};
const dbPath = path.join(root, 'src/notes/db.ts');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { getNotesDb: () => db } };
const { NextRequest } = require('next/server');
const model = require('../src/notes/model.ts');
const auth = require('../src/notes/auth.ts');
const routes = require('../app/api/notes/route.ts');
const sessions = require('../app/api/notes/session/route.ts');
const { middleware } = require('../middleware.ts');
const origin = 'https://myblackcat913.com';
const note = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', body: '音声入力を試した。\n次は技術用語。', title: '', tags: [] };
function request(url, { method = 'GET', body, token, requestOrigin = origin } = {}) {
  const headers = { origin: requestOrigin, 'content-type': 'application/json' };
  if (token) headers.cookie = `${auth.SESSION_COOKIE}=${token}`;
  return new NextRequest(origin + url, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
}
beforeEach(() => { records.clear(); process.env.NOTES_ADMIN_KEY = 'test-only-key-with-at-least-32-characters'; });

test('anonymous and cross-origin callers cannot publish', async () => {
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:note}))).status,401);
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:note,token:auth.createSession(),requestOrigin:'https://other.example'}))).status,403);
  assert.equal(records.size,0);
});
test('signed sessions reject tampering, expiry, and key rotation', () => {
  const token = auth.createSession();
  assert.equal(auth.authenticated(request('/api/notes',{token})),true);
  assert.equal(auth.authenticated(request('/api/notes',{token:token.slice(0,-1)+(token.endsWith('0')?'1':'0')})),false);
  assert.equal(auth.authenticated(request('/api/notes',{token:'0000000000'+token.slice(10)})),false);
  process.env.NOTES_ADMIN_KEY += '-rotated';
  assert.equal(auth.authenticated(request('/api/notes',{token})),false);
});
test('body-only publish survives retry exactly once and appears publicly', async () => {
  const token = auth.createSession();
  const first = await routes.POST(request('/api/notes',{method:'POST',body:note,token}));
  assert.equal(first.status,201);
  const retry = await routes.POST(request('/api/notes',{method:'POST',body:note,token}));
  assert.equal(retry.status,200);
  assert.equal(records.size,1);
  const changed = await routes.POST(request('/api/notes',{method:'POST',body:{...note,body:'別の本文'},token}));
  assert.equal(changed.status,409);
  const listing = await routes.GET(request('/api/notes'));
  assert.equal(listing.headers.get('cache-control'),'no-store');
  const data = await listing.json();
  assert.equal(data.notes[0].body,note.body);
  assert.equal(data.nextCursor,null);
});
test('empty, excessive, malformed, and injected input is rejected or treated as text', async () => {
  const token = auth.createSession();
  for (const input of [{...note,body:'   '},{...note,body:'x'.repeat(10001)},{...note,id:'../../private'},{...note,title:'x'.repeat(101)},{...note,tags:['a'.repeat(31)]},{...note,tags:new Array(6).fill('tag')}]) {
    assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:input,token}))).status,400);
  }
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:{...note,body:'x'.repeat(70000)},token}))).status,413);
  assert.equal(model.parseNote({...note,body:'<script>alert(1)</script>'}).body,'<script>alert(1)</script>');
});
test('login sets an HttpOnly scoped cookie and logout clears it', async () => {
  const response = await sessions.POST(request('/api/notes/session',{method:'POST',body:{key:process.env.NOTES_ADMIN_KEY}}));
  assert.equal(response.status,200);
  assert.match(response.headers.get('set-cookie'),/HttpOnly/i);
  assert.match(response.headers.get('set-cookie'),/SameSite=strict/i);
  assert.match(response.headers.get('set-cookie'),/Path=\/api\/notes/i);
  assert.equal((await sessions.DELETE(request('/api/notes/session',{method:'DELETE'}))).cookies.get(auth.SESSION_COOKIE).value,'');
});
test('login attempts are limited across requests and missing setup fails closed', async () => {
  for(let i=0;i<10;i++) assert.equal((await sessions.POST(request('/api/notes/session',{method:'POST',body:{key:'wrong'}}))).status,401);
  assert.equal((await sessions.POST(request('/api/notes/session',{method:'POST',body:{key:'wrong'}}))).status,429);
  delete process.env.NOTES_ADMIN_KEY;
  assert.equal((await sessions.POST(request('/api/notes/session',{method:'POST',body:{key:'wrong'}}))).status,503);
});
test('pagination returns every note once even with identical timestamps', async () => {
  for(let i=0;i<45;i++) {
    const id = `aaaaaaaa-aaaa-4aaa-8aaa-${String(i).padStart(12,'0')}`;
    records.set(`experiment-notes/${id}`,{...note,id,createdAt:'2026-10-01T00:00:00.000Z'});
  }
  const seen = []; let cursor = null;
  do {
    const response = await routes.GET(request(`/api/notes${cursor?'?cursor='+cursor:''}`));
    const data = await response.json(); seen.push(...data.notes.map(note=>note.id)); cursor=data.nextCursor;
  } while(cursor);
  assert.equal(seen.length,45); assert.equal(new Set(seen).size,45);
});
test('export keeps source links, chronology, and draft status', () => {
  const result = model.articleDraft([{...note,title:'title: "quote"',createdAt:'2026-10-01T00:00:00Z'}]);
  const matter = require('gray-matter')(result);
  assert.equal(matter.data.draft,true); assert.equal(matter.data.title,'title: "quote"');
  assert.match(result,new RegExp(`/notes/${note.id}`)); assert.ok(result.includes(note.body));
});
test('PWA and notes routes bypass legacy redirects, legacy articles keep redirecting', () => {
  for(const url of ['/notes','/notes/new','/sw.js','/manifest.webmanifest','/icons/icon-192x192.png']) assert.equal(middleware(request(url)).headers.get('location'),null);
  assert.equal(middleware(request('/old-article')).headers.get('location'),origin+'/blog/old-article');
});
