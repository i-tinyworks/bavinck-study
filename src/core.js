import { passages, topics } from './data.js';
export const normalize = s => String(s).normalize('NFKC').toLowerCase().replace(/\s/g,'').replace(/[–—~]/g,'-');
export const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function searchPassages(query) {
 const q=normalize(query);
 if(!q) return [];
 const m=q.match(/^([^\d:]+|1thess)(\d+)(?:장)?(?::(\d+)(?:-(\d+))?)?(?:절)?$/);
 if(m) {
  const [,book,ch,lo,hi]=m; const start=lo?Number(lo):1,end=hi?Number(hi):lo?Number(lo):999;
  if(start<1||end<start) return [];
  return passages.filter(p=>p.aliases.some(a=>normalize(a)===book)&&p.chapter===Number(ch)&&p.start<=end&&p.end>=start);
 }
 return passages.filter(p=>normalize(p.ref).includes(q)||p.aliases.some(a=>normalize(a)===q));
}
export function searchTopics(q) { const n=normalize(q); return n?topics.filter(t=>normalize(t.id+' '+t.en).includes(n)):topics; }
export function emptyState() {return {version:1,notes:{},bookmarks:[],recent:[]};}
export function validateState(data) {
 if(!data||data.version!==1||!data.notes||typeof data.notes!=='object'||Array.isArray(data.notes)||!Array.isArray(data.bookmarks)||!Array.isArray(data.recent)) throw Error('지원하지 않는 백업 형식입니다.');
 const result=emptyState();
 for(const [id,n] of Object.entries(data.notes)) {
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||!n||typeof n!=='object') throw Error('노트 식별자가 올바르지 않습니다.');
  for(const key of ['title','passage','observation','theology','application','outline','edition','page','updated']) if(typeof n[key]!=='string'||n[key].length>200000) throw Error('노트 내용이 올바르지 않습니다.');
  if(!Array.isArray(n.sources)||n.sources.some(s=>typeof s!=='string'||!topics.some(t=>t.id===s))) throw Error('출처 목록이 올바르지 않습니다.');
  result.notes[id]=Object.fromEntries(['title','passage','observation','theology','application','outline','edition','page','updated','sources'].map(k=>[k,n[k]]));
 }
 result.bookmarks=[...new Set(data.bookmarks.filter(id=>topics.some(t=>t.id===id)))];
 result.recent=[...new Set(data.recent.filter(id=>passages.some(p=>p.id===id)))].slice(0,8);
 return result;
}
export function newNote(passage='') { return {title:passage?`${passage} 연구`:'새 연구 노트',passage,observation:'',theology:'',application:'',outline:'',edition:'',page:'',updated:new Date().toISOString(),sources:[]}; }
export function noteMarkdown(note) {
 return `# ${note.title}\n\n본문: ${note.passage}\n\n## 본문 관찰\n${note.observation}\n\n## 교리 연구\n${note.theology}\n\n## 적용과 질문\n${note.application}\n\n## 설교 구성\n${note.outline}\n\n## 참고 주제 (편집 예시 · 원문 미검증)\n${note.sources.map(s=>'- '+s).join('\n')}\n\n판본: ${note.edition}\n페이지: ${note.page}\n`;
}
