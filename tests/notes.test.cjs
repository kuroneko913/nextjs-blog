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
let failTransaction = false;
const snap = (key) => ({ id: key.split('/').at(-1), exists: records.has(key), data: () => records.get(key) });
const db = {
  collection(name) {
    const collection = {
      doc(id) { const key = `${name}/${id}`; return { key, get: async () => snap(key), delete: async () => records.delete(key) }; },
      orderBy(field) {
        let limit = Infinity; let after;
        const query = {
          orderBy() { return query; }, limit(value) { limit = value; return query; }, startAfter(value, id) { after = id ? {value,id} : {value:value.data()[field],id:value.id}; return query; },
          async get() {
            let entries = [...records].filter(([key]) => key.startsWith(`${name}/`)).sort((a,b) => b[1][field].localeCompare(a[1][field]) || b[0].localeCompare(a[0]));
            if (after) entries = entries.filter(([key, value]) => value[field] < after.value || (value[field] === after.value && key.split('/').at(-1) < after.id));
            const docs = entries.slice(0,limit).map(([key]) => snap(key)); return { docs, size: docs.length };
          }
        }; return query;
      }
    }; return collection;
  },
  async runTransaction(callback) {
    const writes = [];
    const result = await callback({
      get: async ref => { assert.equal(writes.length,0,'all reads must precede writes'); return snap(ref.key); },
      create(ref,value) { assert.equal(records.has(ref.key),false); writes.push(()=>records.set(ref.key,value)); },
      set(ref,value) { writes.push(()=>records.set(ref.key,value)); },
      delete(ref) { writes.push(()=>records.delete(ref.key)); }
    });
    if (failTransaction) throw new Error('Simulated commit failure');
    writes.forEach(write=>write()); return result;
  }
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
beforeEach(() => { failTransaction=false; records.clear(); process.env.NOTES_ADMIN_KEY = 'test-only-key-with-at-least-32-characters'; });

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

test('X share links preserve Japanese, emoji, and reserved characters without adding parameters', () => {
  const { xShareUrl } = require('../src/notes/sharing.ts');
  const body = '音声入力 & "実験" #メモ 🐈\n次は https://example.com/?a=1&b=2';
  const url = new URL(xShareUrl({ ...note, body }));
  assert.equal(url.origin, 'https://twitter.com');
  assert.equal(url.pathname, '/intent/tweet');
  assert.deepEqual([...url.searchParams.keys()], ['text', 'url']);
  assert.equal(url.searchParams.get('text'), body.replace(/\s+/g, ' '));
  assert.equal(url.searchParams.get('url'), `${origin}/notes/${note.id}`);
  const long = new URL(xShareUrl({ ...note, body: '🐈'.repeat(150) })).searchParams.get('text');
  assert.equal(Array.from(long).length, 100);
  assert.equal(long, '🐈'.repeat(99) + '…');
});
test('shared cards identify the individual note, including when it has no title', () => {
  const { noteMetadata, xShareUrl } = require('../src/notes/sharing.ts');
  const published = { ...note, createdAt: '2026-10-03T10:23:00.000Z' };
  const metadata = noteMetadata(published);
  assert.equal(metadata.alternates.canonical, `${origin}/notes/${note.id}`);
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.twitter.card, 'summary');
  assert.ok(metadata.title.startsWith('音声入力を試した。 次は技術用語。'));
  assert.equal(metadata.twitter.title, metadata.title);
  assert.equal(metadata.twitter.description, metadata.description);
  assert.equal(metadata.openGraph.images[0].type, 'image/png');
  assert.equal(metadata.twitter.images[0].url, metadata.openGraph.images[0].url);
  assert.equal(new URL(xShareUrl({ ...note, title: '短いタイトル' })).searchParams.get('text'), '短いタイトル');
});


const discardRoute = require('../app/api/notes/[id]/route.ts');
const restoreRoute = require('../app/api/notes/[id]/restore/route.ts');
const trashRoute = require('../app/api/notes/trash/route.ts');
const store = require('../src/notes/store.ts');
const context = { params: { id: note.id } };
async function publishFixture() {
  const token = await auth.createSession(auth.OWNER_GITHUB_ID);
  await routes.POST(request('/api/notes',{method:'POST',body:note,token}));
  return token;
}

test('only the owner can discard, restore, or read discarded notes', async () => {
  const token = await publishFixture();
  for (const [route,method] of [[discardRoute,'DELETE'],[restoreRoute,'POST']]) {
    assert.equal((await route[method](request('/api/notes/'+note.id,{method}),context)).status,401);
    assert.equal((await route[method](request('/api/notes/'+note.id,{method,token,requestOrigin:'https://attacker.example'}),context)).status,403);
  }
  assert.equal((await trashRoute.GET(request('/api/notes/trash'))).status,401);
  assert.ok(await store.getNote(note.id));
});

test('discard preserves body, dates and tags privately and retries cannot republish it', async () => {
  const token = await publishFixture();
  const original = await store.getNote(note.id);
  const first = await discardRoute.DELETE(request('/api/notes/'+note.id,{method:'DELETE',token}),context);
  assert.equal(first.status,200);
  const discarded = (await first.json()).note;
  assert.equal(discarded.body,original.body);
  assert.equal(discarded.createdAt,original.createdAt);
  assert.ok(discarded.discardedAt);
  const retry = await discardRoute.DELETE(request('/api/notes/'+note.id,{method:'DELETE',token}),context);
  assert.equal((await retry.json()).note.discardedAt,discarded.discardedAt);
  assert.equal(await store.getNote(note.id),null);
  assert.deepEqual((await (await routes.GET(request('/api/notes'))).json()).notes,[]);
  const privateResponse = await trashRoute.GET(request('/api/notes/trash',{token}));
  assert.equal(privateResponse.headers.get('cache-control'),'no-store');
  assert.equal((await privateResponse.json()).notes[0].body,original.body);
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:note,token}))).status,409);
  assert.equal(await store.getNote(note.id),null);
});

test('restore republishes the same URL and original date exactly once', async () => {
  const token = await publishFixture();
  const original = await store.getNote(note.id);
  await store.discardNote(note.id);
  for(let i=0;i<2;i++) {
    const response = await restoreRoute.POST(request('/api/notes/'+note.id+'/restore',{method:'POST',token}),context);
    assert.equal(response.status,200);
    assert.deepEqual((await response.json()).note,original);
  }
  assert.deepEqual(await store.getNote(note.id),original);
  assert.deepEqual((await store.listDiscardedNotes()).notes,[]);
  assert.equal([...records.keys()].filter(key=>key.startsWith('experiment-notes/')).length,1);
});

test('failed discard and restore transactions keep the only copy intact', async () => {
  const token = await publishFixture();
  failTransaction=true;
  assert.equal((await discardRoute.DELETE(request('/api/notes/'+note.id,{method:'DELETE',token}),context)).status,503);
  assert.ok(await store.getNote(note.id));
  assert.equal((await store.listDiscardedNotes()).notes.length,0);
  failTransaction=false;
  await store.discardNote(note.id);
  failTransaction=true;
  assert.equal((await restoreRoute.POST(request('/api/notes/'+note.id+'/restore',{method:'POST',token}),context)).status,503);
  assert.equal(await store.getNote(note.id),null);
  assert.equal((await store.listDiscardedNotes()).notes.length,1);
});

test('public pagination still advances after the cursor note is discarded', async () => {
  for(let i=0;i<45;i++) {
    const id=`bbbbbbbb-bbbb-4bbb-8bbb-${String(i).padStart(12,'0')}`;
    records.set(`experiment-notes/${id}`,{...note,id,createdAt:'2026-10-04T00:00:00.000Z'});
  }
  const first = await store.listNotes();
  await store.discardNote(first.nextCursor);
  const second = await store.listNotes(first.nextCursor);
  const third = await store.listNotes(second.nextCursor);
  const ids=[...first.notes,...second.notes,...third.notes].map(note=>note.id);
  assert.equal(ids.length,45); assert.equal(new Set(ids).size,45);
  assert.equal(third.nextCursor,null);
});

test('trash pagination remains private and works after its cursor note is restored', async () => {
  for(let i=0;i<45;i++) {
    const id=`cccccccc-cccc-4ccc-8ccc-${String(i).padStart(12,'0')}`;
    records.set(`experiment-notes-trash/${id}`,{...note,id,createdAt:'2026-10-03T00:00:00.000Z',discardedAt:'2026-10-04T00:00:00.000Z'});
  }
  const first=await store.listDiscardedNotes();
  await store.restoreNote(first.notes.at(-1).id);
  const second=await store.listDiscardedNotes(first.nextCursor);
  const third=await store.listDiscardedNotes(second.nextCursor);
  const ids=[...first.notes,...second.notes,...third.notes].map(note=>note.id);
  assert.equal(ids.length,45); assert.equal(new Set(ids).size,45);
  assert.equal(third.nextCursor,null);
  await assert.rejects(store.listDiscardedNotes('invalid'),{status:400});
  await assert.rejects(store.discardNote('../private'),{status:400});
  await assert.rejects(store.discardNote(note.id),{status:404});
  await assert.rejects(store.restoreNote(note.id),{status:404});
});
