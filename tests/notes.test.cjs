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
      doc(id) { const key = `${name}/${id}`; return { key, get: async () => snap(key), delete: async () => records.delete(key), create: async value => { assert.equal(records.has(key), false); records.set(key, value); } }; },
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
const oauth = require('../src/notes/oauth.ts');
const oauthStart = require('../app/api/notes/oauth/start/route.ts');
const oauthCallback = require('../app/api/notes/oauth/callback/route.ts');
const { middleware } = require('../middleware.ts');
const origin = 'https://myblackcat913.com';
const note = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', body: '音声入力を試した。\n次は技術用語。', title: '', tags: [] };
function request(url, { method = 'GET', body, token, cookie, requestOrigin = origin } = {}) {
  const headers = { origin: requestOrigin, 'content-type': 'application/json' };
  if (token) headers.cookie = `${auth.SESSION_COOKIE}=${token}`;
  if (cookie) headers.cookie = cookie;
  return new NextRequest(origin + url, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
}
beforeEach(() => {
  failTransaction = false;
  records.clear();
  process.env.NOTES_GITHUB_CLIENT_ID = 'test-client-id';
  process.env.NOTES_GITHUB_CLIENT_SECRET = 'test-only-github-secret-at-least-32-characters';
  process.env.NOTES_ADMIN_KEY = 'test-only-retired-admin-key-at-least-32-characters';
});

test('anonymous and cross-origin callers cannot publish', async () => {
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:note}))).status,401);
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:note,token:await auth.createSession(auth.OWNER_GITHUB_ID),requestOrigin:'https://other.example'}))).status,403);
  assert.equal([...records.keys()].filter(key=>key.startsWith('experiment-notes/')).length,0);
});
test('sessions reject tampering, expiry, other owners, missing records and credential rotation', async () => {
  const token = await auth.createSession(auth.OWNER_GITHUB_ID);
  assert.equal(await auth.authenticated(request('/api/notes',{token})),true);
  assert.equal(await auth.authenticated(request('/api/notes',{token:token.slice(0,-1)+(token.endsWith('0')?'1':'0')})),false);
  const record = [...records.values()][0];
  const originalExpiry = record.expiresAt;
  record.expiresAt = new Date(Date.now()-1);
  assert.equal(await auth.authenticated(request('/api/notes',{token})),false);
  record.expiresAt = { toDate: () => originalExpiry }; // Real Firestore Timestamp shape.
  record.githubId = 123;
  assert.equal(await auth.authenticated(request('/api/notes',{token})),false);
  record.githubId = auth.OWNER_GITHUB_ID;
  assert.equal(await auth.authenticated(request('/api/notes',{token})),true);
  process.env.NOTES_GITHUB_CLIENT_SECRET += '-rotated';
  assert.equal(await auth.authenticated(request('/api/notes',{token})),false);
  delete process.env.NOTES_GITHUB_CLIENT_SECRET;
  assert.equal(await auth.authenticated(request('/api/notes',{token})),false);
  await assert.rejects(auth.createSession(123), { status: 403 });
});
test('body-only publish survives retry exactly once and appears publicly', async () => {
  const token = await auth.createSession(auth.OWNER_GITHUB_ID);
  const first = await routes.POST(request('/api/notes',{method:'POST',body:note,token}));
  assert.equal(first.status,201);
  const retry = await routes.POST(request('/api/notes',{method:'POST',body:note,token}));
  assert.equal(retry.status,200);
  assert.equal([...records.keys()].filter(key=>key.startsWith('experiment-notes/')).length,1);
  const changed = await routes.POST(request('/api/notes',{method:'POST',body:{...note,body:'別の本文'},token}));
  assert.equal(changed.status,409);
  const listing = await routes.GET(request('/api/notes'));
  assert.equal(listing.headers.get('cache-control'),'no-store');
  const data = await listing.json();
  assert.equal(data.notes[0].body,note.body);
  assert.equal(data.nextCursor,null);
});
test('empty, excessive, malformed, and injected input is rejected or treated as text', async () => {
  const token = await auth.createSession(auth.OWNER_GITHUB_ID);
  for (const input of [{...note,body:'   '},{...note,body:'x'.repeat(10001)},{...note,id:'../../private'},{...note,title:'x'.repeat(101)},{...note,tags:['a'.repeat(31)]},{...note,tags:new Array(6).fill('tag')}]) {
    assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:input,token}))).status,400);
  }
  assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:{...note,body:'x'.repeat(70000)},token}))).status,413);
  assert.equal(model.parseNote({...note,body:'<script>alert(1)</script>'}).body,'<script>alert(1)</script>');
});
test('logout revokes the server session, including a copied cookie', async () => {
  const token = await auth.createSession(auth.OWNER_GITHUB_ID);
  assert.equal(await auth.authenticated(request('/api/notes',{token})),true);
  assert.equal((await sessions.DELETE(request('/api/notes/session',{method:'DELETE',token,requestOrigin:'https://other.example'}))).status,403);
  assert.equal(await auth.authenticated(request('/api/notes',{token})),true);
  const response = await sessions.DELETE(request('/api/notes/session',{method:'DELETE',token}));
  assert.equal(response.cookies.get(auth.SESSION_COOKIE).value,'');
  assert.equal(await auth.authenticated(request('/api/notes',{token})),false);
});
test('old keys and old sessions cannot authenticate, even before OAuth is configured', async () => {
  const { createHmac } = require('node:crypto');
  const payload = `${Math.floor(Date.now()/1000)+3600}.${'a'.repeat(32)}`;
  const legacy = `${payload}.${createHmac('sha256',process.env.NOTES_ADMIN_KEY).update(`session:${payload}`).digest('hex')}`;
  for(const cookie of [`${auth.LEGACY_SESSION_COOKIE}=${legacy}`, `${auth.SESSION_COOKIE}=${legacy}`]) {
    assert.equal((await routes.POST(request('/api/notes',{method:'POST',body:note,cookie}))).status,401);
  }
  for(const key of [process.env.NOTES_ADMIN_KEY, process.env.NOTES_GITHUB_CLIENT_SECRET]) {
    assert.equal((await sessions.POST(request('/api/notes/session',{method:'POST',body:{key}}))).status,410);
  }
  delete process.env.NOTES_GITHUB_CLIENT_SECRET;
  assert.equal((await sessions.POST(request('/api/notes/session',{method:'POST',body:{key:process.env.NOTES_ADMIN_KEY}}))).status,410);
  const unavailable = await oauthStart.POST(request('/api/notes/oauth/start',{method:'POST'}));
  assert.equal(unavailable.status,503);
  assert.match((await unavailable.json()).error,/設定中/);
  assert.equal(records.size,0);
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

async function beginOAuth() {
  const response = await oauthStart.POST(request('/api/notes/oauth/start',{method:'POST'}));
  const url = new URL((await response.clone().json()).url);
  const cookie = response.cookies.get(oauth.OAUTH_COOKIE).value;
  return { response, url, cookie, state: url.searchParams.get('state') };
}
function callbackRequest(flow, { state = flow.state, code = 'test-code', cookie = flow.cookie, extra = '' } = {}) {
  return request(`${oauth.CALLBACK_PATH}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}${extra}`, {
    cookie: `${oauth.OAUTH_COOKIE}=${cookie}`,
  });
}
function provider(t, { id = auth.OWNER_GITHUB_ID, scope = '', tokenOk = true, profileOk = true } = {}) {
  const calls = [];
  t.mock.method(globalThis,'fetch',async (url, options) => {
    calls.push({ url, options });
    if(url === 'https://github.com/login/oauth/access_token') return Response.json(tokenOk ? { access_token:'test-token', token_type:'bearer', scope } : { error:'bad_verification_code' });
    assert.equal(url,'https://api.github.com/user');
    assert.equal(options.headers.Authorization,'Bearer test-token');
    return Response.json({ id, login: 'kuroneko913' }, { status: profileOk ? 200 : 401 });
  });
  return calls;
}

test('OAuth requires same-origin POST, canonical origin, random state and S256 PKCE with no scopes', async () => {
  assert.equal((await oauthStart.POST(request('/api/notes/oauth/start',{method:'POST',requestOrigin:'https://other.example'}))).status,403);
  const preview = await oauthStart.POST(new NextRequest('https://preview.example/api/notes/oauth/start', { method:'POST', headers:{origin:'https://preview.example'} }));
  assert.equal(preview.status,403);
  const first = await beginOAuth(); const second = await beginOAuth();
  assert.equal(first.response.status,200);
  assert.equal(first.url.origin,'https://github.com');
  assert.equal(first.url.pathname,'/login/oauth/authorize');
  assert.equal(first.url.searchParams.get('scope'),'');
  assert.equal(first.url.searchParams.get('redirect_uri'),origin+oauth.CALLBACK_PATH);
  assert.equal(first.url.searchParams.get('code_challenge_method'),'S256');
  assert.notEqual(first.state,second.state);
  const verifier = oauth.oauthVerifier(callbackRequest(first));
  assert.equal(first.url.searchParams.get('code_challenge'),require('node:crypto').createHash('sha256').update(verifier).digest('base64url'));
  assert.equal(first.url.toString().includes(verifier),false);
  assert.equal(first.response.headers.get('cache-control'),'no-store');
  assert.match(first.response.headers.get('set-cookie'),/HttpOnly/i);
  assert.match(first.response.headers.get('set-cookie'),/SameSite=lax/i);
  assert.equal(first.response.cookies.get(oauth.OAUTH_COOKIE).maxAge,600);
  assert.equal(records.size,0);
});

test('OAuth rejects missing, mismatched, tampered and expired state before contacting GitHub', async t => {
  const calls = provider(t); const flow = await beginOAuth();
  const requests = [callbackRequest(flow,{state:'wrong'}), callbackRequest(flow,{cookie:''}), callbackRequest(flow,{cookie:flow.cookie.slice(0,-1)+(flow.cookie.endsWith('0')?'1':'0')}), callbackRequest(flow,{cookie:'0000000000'+flow.cookie.slice(10)})];
  for(const req of requests) {
    const response = await oauthCallback.GET(req);
    assert.equal(new URL(response.headers.get('location')).searchParams.get('login'),'expired');
    assert.equal(response.cookies.get(oauth.OAUTH_COOKIE).value,'');
    assert.equal(response.cookies.get(auth.SESSION_COOKIE),undefined);
  }
  const now = Date.now(); t.mock.method(Date,'now',()=>now+601000);
  assert.equal(new URL((await oauthCallback.GET(callbackRequest(flow))).headers.get('location')).searchParams.get('login'),'expired');
  assert.equal(calls.length,0); assert.equal(records.size,0);
});

test('only the immutable GitHub owner ID gets a private revocable session', async t => {
  const calls = provider(t); const flow = await beginOAuth();
  const response = await oauthCallback.GET(callbackRequest(flow));
  assert.equal(response.headers.get('location'),origin+'/notes/new?login=success');
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  assert.equal(response.headers.get('cache-control'),'no-store');
  const cookie = response.cookies.get(auth.SESSION_COOKIE);
  assert.equal(cookie.httpOnly,true); assert.equal(cookie.sameSite,'strict');
  assert.equal(cookie.path,'/api/notes'); assert.equal(cookie.maxAge,30*86400);
  if(process.env.NODE_ENV === 'production') assert.equal(cookie.secure,true);
  assert.equal(response.cookies.get(oauth.OAUTH_COOKIE).value,'');
  assert.equal(response.cookies.get(auth.LEGACY_SESSION_COOKIE).value,'');
  assert.equal(calls.length,2);
  assert.equal(calls[0].options.body.get('code_verifier'),oauth.oauthVerifier(callbackRequest(flow)));
  assert.equal(calls[0].options.body.get('redirect_uri'),origin+oauth.CALLBACK_PATH);
  assert.equal(calls[0].options.redirect,'error');
  assert.equal(calls[1].options.cache,'no-store');
  assert.equal(await auth.authenticated(request('/api/notes',{token:cookie.value})),true);
  assert.equal(JSON.stringify([...records]).includes(cookie.value),false);
  assert.equal(JSON.stringify([...records]).includes('test-token'),false);
  assert.equal(JSON.stringify([...records]).includes(process.env.NOTES_GITHUB_CLIENT_SECRET),false);
  assert.equal((await sessions.GET(request('/api/notes/session',{token:cookie.value}))).status,200);
});

test('a matching login name does not let another GitHub ID publish', async t => {
  provider(t,{id:123}); const flow = await beginOAuth();
  const response = await oauthCallback.GET(callbackRequest(flow));
  assert.equal(response.headers.get('location'),origin+'/notes/new?login=denied');
  assert.equal(response.cookies.get(auth.SESSION_COOKIE),undefined);
  assert.equal(records.size,0);
});

test('cancelled authorization, invalid codes and unrequested scopes never create sessions', async t => {
  const flow = await beginOAuth(); const calls = provider(t,{tokenOk:false});
  const cancelled = await oauthCallback.GET(callbackRequest(flow,{extra:'&error=access_denied'}));
  assert.equal(cancelled.headers.get('location'),origin+'/notes/new?login=cancelled');
  assert.equal(calls.length,0);
  const failed = await oauthCallback.GET(callbackRequest(flow));
  assert.equal(failed.headers.get('location'),origin+'/notes/new?login=failed');
  assert.equal(failed.cookies.get(auth.SESSION_COOKIE),undefined);
  assert.equal(calls.length,1);
  t.mock.restoreAll();
  const broad = provider(t,{scope:'repo'});
  assert.equal((await oauthCallback.GET(callbackRequest(flow))).headers.get('location'),origin+'/notes/new?login=failed');
  assert.equal(broad.length,1); assert.equal(records.size,0);
});

test('provider failures and replayed authorization codes fail closed without exposing tokens', async t => {
  const flow = await beginOAuth(); provider(t,{profileOk:false});
  let response = await oauthCallback.GET(callbackRequest(flow));
  assert.equal(response.headers.get('location'),origin+'/notes/new?login=failed');
  assert.equal(records.size,0);
  t.mock.restoreAll();
  let exchanged = false;
  t.mock.method(globalThis,'fetch',async url => {
    if(url === 'https://api.github.com/user') return Response.json({id:auth.OWNER_GITHUB_ID});
    if(exchanged) return Response.json({error:'bad_verification_code'});
    exchanged = true;
    return Response.json({access_token:'test-token',token_type:'bearer',scope:''});
  });
  response = await oauthCallback.GET(callbackRequest(flow));
  assert.equal(response.headers.get('location'),origin+'/notes/new?login=success');
  const replay = await oauthCallback.GET(callbackRequest(flow));
  assert.equal(replay.headers.get('location'),origin+'/notes/new?login=failed');
  assert.equal(replay.cookies.get(auth.SESSION_COOKIE),undefined);
  assert.equal(records.size,1);
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
