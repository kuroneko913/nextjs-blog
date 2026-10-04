const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root,id.slice(2)) : id, ...args); };
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText, filename);
const records = new Map();
let dbCalls = 0;
let aggregateCalls = 0;
const doc = key => ({key});
const snapshot = ref => ({ exists: records.has(ref.key), data: () => records.get(ref.key) });
function collection(name) {
  const makeQuery = (filters=[]) => ({
    query: true, name, filters,
    where(field, op, value) { return makeQuery([...filters,[field,value]]); },
    limit() { return this; },
    count() { return {get: async()=>{ aggregateCalls++; return {data:()=>({count:matching(this).length})}; }}; },
    get() { throw new Error('Full collection reads are forbidden'); }
  });
  return {...makeQuery(),doc:id=>doc(`${name}/${id}`)};
}
function matching(query) {return [...records].filter(([key,data])=>key.startsWith(query.name+'/') && query.filters.every(([field,value])=>data[field]===value));}
const db = {
 collection,
 async runTransaction(callback) {
  return callback({
   get:async ref=>ref.query ? {empty:matching(ref).length===0,docs:matching(ref).slice(0,1).map(([key])=>({ref:doc(key)}))} : snapshot(ref),
   set:(ref,data)=>records.set(ref.key,data),
   delete:ref=>records.delete(ref.key)
  });
 }
};
const load = Module._load;
Module._load = function(id,...args) {
 if(id==='@/src/notes/db') return {getNotesDb:()=>{dbCalls++;return db;}};
 if(id==='@/src/fetch') return {getAllPosts:()=>[{slug:'public-article'}]};
 return load.call(this,id,...args);
};
const {NextRequest}=require('next/server');
const route=require('../app/api/blog-like/route.tsx');
const {consumeLikeBudget,LikeLimitError}=require('../src/security/likeBudget.ts');
const request=(body,headers={})=>new NextRequest('https://myblackcat913.com/api/blog-like',{method:'POST',headers:{origin:'https://myblackcat913.com','x-nf-client-connection-ip':'127.0.0.1',...headers},body});
beforeEach(()=>{records.clear();dbCalls=0;aggregateCalls=0;});
test('untrusted Origin, unknown slug, invalid JSON and oversized streamed body never reach Firestore',async()=>{
 for(const [req,status] of [[request('{"slug":"public-article"}',{origin:'https://evil.example'}),403],[request('{"slug":"invented"}'),400],[request('{'),400],[request('x'.repeat(2049)),413]]) assert.equal((await route.POST(req)).status,status);
 assert.equal(dbCalls,0);
});
test('known votes toggle atomically, preserve old vote and do not store plaintext client IP',async()=>{
 const first=await route.POST(request('{"slug":"public-article"}'));assert.equal((await first.json()).liked,true);
 const votes=[...records].filter(([key])=>key.startsWith('blog-likes/'));assert.equal(votes.length,1);assert.equal(votes[0][1].ip,undefined);
 assert.equal((await (await route.POST(request('{"slug":"public-article"}'))).json()).liked,false);
 records.set('blog-likes/old',{ 'article-slug':'public-article',ip:'127.0.0.1'});
 assert.equal((await (await route.POST(request('{"slug":"public-article"}'))).json()).liked,false);assert.equal(records.has('blog-likes/old'),false);
});
test('read counts only public slugs via aggregate, ignores arbitrary records, caches reads',async()=>{
 records.set('blog-likes/old',{'article-slug':'public-article'});records.set('blog-likes/garbage',{'article-slug':'invented'});
 assert.equal((await route.GET(new NextRequest('https://myblackcat913.com/api/blog-like?slug=invented'))).status,400);assert.equal(dbCalls,0);
 const result=await (await route.GET(new NextRequest('https://myblackcat913.com/api/blog-like'))).json();assert.deepEqual(result,{result:{'public-article':1}});
 await route.GET(new NextRequest('https://myblackcat913.com/api/blog-like?slug=public-article'));assert.equal(aggregateCalls,1);
});
test('shared minute and day budgets fail closed, use only fixed documents, and reset',async()=>{
 const now=(Math.floor(Date.now()/86400000)+1)*86400000;
 for(let i=0;i<60;i++) await consumeLikeBudget('read',now);
 await assert.rejects(()=>consumeLikeBudget('read',now),LikeLimitError);
 await consumeLikeBudget('read',now+86400000);
 for(let i=0;i<500;i++) await consumeLikeBudget('write',now+i*60000);
 await assert.rejects(()=>consumeLikeBudget('write',now+500*60000),LikeLimitError);
 assert.equal([...records.keys()].filter(key=>key.startsWith('blog-like-private/')).length,2);
});
test('retired MCP routes and upstream weather implementation are removed',()=>{
 assert.equal(fs.existsSync(path.join(root,'src/security/closedMcp.ts')),false);
 for(const file of ['route.ts','weather/route.tsx','clock/route.tsx','weather/logic.ts','clock/logic.ts']) assert.equal(fs.existsSync(path.join(root,'app/api/labs/mcp-tools',file)),false);
});
test('external media cannot inject URLs and uses no parent-page widget script',()=>{
 const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
 const CodeBlock=require('../app/modules/CodeBlock.tsx').default;
 const render=(language,id)=>renderToStaticMarkup(React.createElement(CodeBlock,{className:'language-'+language},id));
 assert.match(render('youtube','dQw4w9WgXcQ'),/https:\/\/www.youtube-nocookie.com\/embed\/dQw4w9WgXcQ/);
 assert.doesNotMatch(render('youtube','"><script>alert(1)</script>'),/<iframe|<script/);
 assert.match(render('twitter','123456'),/https:\/\/x.com\/i\/status\/123456/);
 assert.doesNotMatch(render('twitter','javascript:alert(1)'),/<a /);
 assert.equal(renderToStaticMarkup(React.createElement(require('../app/modules/SiteScripts.tsx').default)),'');
});
test('CSP only allows same-origin script sources in production',async()=>{
 const config=(await import('../next.config.mjs')).default;
 const csp=(await config.headers()).find(item=>item.source==='/:path*').headers.find(item=>item.key==='Content-Security-Policy').value;
 assert.match(csp,/script-src 'self' 'unsafe-inline'/);
 assert.doesNotMatch(csp,/https:|platform.twitter|googlesyndication|youtube/);
 if(process.env.NODE_ENV==='production') assert.doesNotMatch(csp,/unsafe-eval/);
});
