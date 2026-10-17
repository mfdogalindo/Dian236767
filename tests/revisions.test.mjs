import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractBank} from '../scripts/extract.mjs';
import {extractProcessBank} from '../scripts/extract-process.mjs';
import {revisePractice,revisedPractice} from '../src/revised-practice.js';
import {findQuestionVersion,prepareQuestions,grade} from '../src/core.js';
import {sources} from '../src/content.js';
const old=[...extractBank(await readFile('deep-research-report.md','utf8')),...extractProcessBank(await readFile('proceso.md','utf8'))];
const updated=revisePractice(old);
test('revisa 20 preguntas en su lugar, sin duplicar ni alterar los originales',()=>{
  assert.equal(Object.keys(revisedPractice).length,20);
  assert.equal(updated.length,old.length);
  assert.deepEqual(updated.map(q=>q.id),old.map(q=>q.id));
  assert.ok(old.every(q=>q.revision===undefined));
  for(const q of updated){
    const before=old.find(o=>o.id===q.id);
    if(!q.revision){assert.deepEqual(q,before);continue;}
    assert.equal(q.form,before.form);assert.equal(q.topic,before.topic);
    assert.ok(q.scenario.length>250,q.id);
    assert.equal(q.options.length,3);assert.equal(q.rationales.length,3);
    assert.ok(q.rationales.every(r=>r.length>40));
    assert.ok(q.sourceRefs.every(id=>sources[id]));
    assert.notEqual(q.prompt,before.prompt);
  }
  assert.ok(updated.filter(q=>q.type==='functional').every(q=>q.options.length===3));
});
test('versiones anteriores y nuevas se resuelven sin recalificar con otra clave',()=>{
  for(const id of Object.keys(revisedPractice)){
    const original=old.find(q=>q.id===id),revised=updated.find(q=>q.id===id);
    assert.equal(findQuestionVersion(original,updated,old),original);
    assert.equal(findQuestionVersion(revised,updated,old),revised);
    assert.equal(findQuestionVersion({...original,prompt:'Pregunta alterada'},updated,old),undefined);
    assert.equal(findQuestionVersion({...revised,revision:99},updated,old),undefined);
    for(const q of [original,revised]){
      const [mixed]=prepareQuestions([q],()=>0);
      assert.equal(grade({questions:[mixed],answers:{[id]:mixed.correct}}).percentage,100);
      if(mixed.rationales)mixed.options.forEach((o,i)=>assert.equal(mixed.rationales[i],q.rationales[q.options.indexOf(o)]));
    }
  }
});
test('la revisión falla si una pregunta de origen desaparece',()=>{
  assert.throws(()=>revisePractice(old.filter(q=>q.id!=='P3-6')),/P3-6/);
});
