import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractProcessBank } from '../scripts/extract-process.mjs';
import { extractBank } from '../scripts/extract.mjs';
import { prepareQuestions, grade } from '../src/core.js';
import { drills, flashcards, longPlan, enrichTopics } from '../src/process-content.js';
import { topics, sources } from '../src/content.js';
import { studyDay, scheduleReview, dueCards } from '../src/review.js';

const report=await readFile('proceso.md','utf8');
const bank=extractProcessBank(report);
test('extrae 50 ítems de proceso.md con las cinco claves completas',()=>{
  const expected=['BACBBBACBB','AAABABABBB','ABBAAABBBB','AAABAAAABA','BBBBBBBBBB'];
  assert.equal(bank.length,50);
  for(const [i,drill] of drills.entries()){
    const block=bank.filter(q=>q.form===drill.id);
    assert.equal(block.length,10);
    assert.equal(block.map(q=>'ABC'[q.correct]).join(''),expected[i]);
    assert.deepEqual(block.map(q=>q.number),[1,2,3,4,5,6,7,8,9,10]);
    for(const q of block){assert.ok(q.explanation.length>40);assert.equal(q.origin,3);assert.ok(q.prompt);assert.ok(!q.prompt.includes('A)'));assert.ok(q.sourceRefs.every(id=>sources[id]));}
  }
  assert.equal(bank.filter(q=>q.options.length===2).length,3);
});
test('mezcla también los ítems de dos alternativas conservando la clave',()=>{
  const mixed=prepareQuestions(bank,()=>0);
  for(const [i,q] of mixed.entries())assert.equal(q.options[q.correct],bank[i].options[bank[i].correct]);
  const answers=Object.fromEntries(mixed.map(q=>[q.id,q.correct]));
  assert.equal(grade({questions:mixed,answers}).percentage,100);
});
test('el banco ampliado tiene 230 identificadores únicos y conserva A/B/C',async()=>{
  const old=extractBank(await readFile('deep-research-report.md','utf8'));
  const combined=[...old,...bank];
  assert.equal(combined.length,230);assert.equal(new Set(combined.map(q=>q.id)).size,230);
  assert.equal(combined.filter(q=>q.type==='functional').length,170);
});
test('el extractor falla ante una clave o sección incompleta',()=>{
  assert.throws(()=>extractProcessBank(report.replace('1-B; 2-A; 3-C','1-B; 3-C')),/Claves incompletas/);
  assert.throws(()=>extractProcessBank(report.replace('### Simulacro de fiscalización aduanera','### Otra sección')),/No se encontró/);
});
test('las lecturas previas conservan sus índices y las nuevas fuentes existen',()=>{
  const copy=structuredClone(topics);const before=structuredClone(copy);enrichTopics(copy);
  for(const t of before)assert.deepEqual(copy.find(x=>x.id===t.id).lessons.slice(0,t.lessons.length),t.lessons);
  assert.ok(copy.reduce((n,t)=>n+t.lessons.length,0)>before.reduce((n,t)=>n+t.lessons.length,0));
  assert.equal(longPlan.length,12);
  assert.equal(flashcards.length,16);assert.equal(new Set(flashcards.map(c=>c.id)).size,16);
  assert.ok(flashcards.every(c=>sources[c.source]&&topics.some(t=>t.id===c.topic)));
});
test('el calendario usa el cambio de día en Colombia',()=>{
  assert.equal(studyDay(Date.parse('2026-10-16T04:59:59Z')),studyDay(Date.parse('2026-10-15T12:00:00Z')));
  assert.equal(studyDay(Date.parse('2026-10-16T05:00:00Z')),studyDay(Date.parse('2026-10-15T12:00:00Z'))+1);
});
test('repasos progresan a 1, 3, 7 y 14 días y un fallo reinicia',()=>{
  let entry;let today=20000;
  for(const interval of [1,3,7,14,14]){entry=scheduleReview(entry,true,today);assert.equal(entry.due-today,interval);today=entry.due;}
  entry=scheduleReview(entry,false,today);
  assert.equal(entry.step,0);assert.equal(entry.due,today+1);assert.equal(entry.reviews,6);
  assert.deepEqual(dueCards([{id:'a'},{id:'b'}],{a:{due:today+1}},today),[{id:'b'}]);
  assert.equal(dueCards([{id:'a'}],{a:{due:today}},today).length,1);
});
