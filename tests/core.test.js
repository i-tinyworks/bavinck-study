import test from 'node:test';
import assert from 'node:assert/strict';
import {searchPassages,searchTopics,emptyState,validateState,newNote,escapeHTML,noteMarkdown} from '../src/core.js';
import {createAppServer} from '../server.mjs';

test('본문 표기와 구간 중첩을 처리하고 다른 절은 매칭하지 않는다',()=>{
 for(const q of ['히브리서 12:1–2','히 12:2','히브리서12장','heb12:1-2']) assert.equal(searchPassages(q)[0]?.id,'heb12');
 assert.equal(searchPassages('창세기 15장')[0]?.id,'gen15');
 assert.equal(searchPassages('롬 8:29')[0]?.id,'rom8');
 for(const q of ['롬 8:1','히 12:3','롬 8:30-28','요한복음 3:16','']) assert.equal(searchPassages(q).length,0);
});
test('한글·영문 교리 검색',()=>{
 assert.equal(searchTopics('Justification')[0].id,'칭의');
 assert.equal(searchTopics('하나님의형상')[0].id,'하나님의 형상');
});
test('노트와 출처를 백업 후 복원하고 잘못된 형식을 거부한다',()=>{
 const data=emptyState();data.notes.demo=newNote('히브리서 12:1–2');
 data.notes.demo.observation='인내로 경주함';data.notes.demo.sources=['견인'];data.bookmarks=['견인'];
 assert.deepEqual(validateState(JSON.parse(JSON.stringify(data))),data);
 assert.match(noteMarkdown(data.notes.demo),/인내로 경주함/);
 assert.throws(()=>validateState({version:2}));
 assert.throws(()=>validateState({...data,notes:{bad:{...data.notes.demo,sources:['가짜']}}}));
 assert.throws(()=>validateState({...data,notes:{bad:{...data.notes.demo,title:32}}}));
});
test('사용자 텍스트는 HTML로 실행되지 않는다',()=>{
 assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('웹 서버는 앱 파일만 노출한다',async()=>{
 const server=createAppServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  const home=await fetch(origin);assert.equal(home.status,200);assert.match(await home.text(),/Bavinck Study/);
  assert.match(home.headers.get('content-security-policy'),/script-src 'self'/);
  assert.equal((await fetch(origin+'/src/app.js')).status,200);
  assert.equal((await fetch(origin+'/health')).status,200);
  for(const path of ['/package.json','/.env','/server.mjs','/../README.md','/src/../../.env']) assert.equal((await fetch(origin+path)).status,404);
  assert.equal((await fetch(origin,{method:'POST'})).status,405);
 }finally{await new Promise(r=>server.close(r));}
});
