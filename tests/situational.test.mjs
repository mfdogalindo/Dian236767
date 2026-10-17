import test from 'node:test';
import assert from 'node:assert/strict';
import { situationalBank } from '../src/situational.js';
import { prepareQuestions, grade } from '../src/core.js';
import { sources } from '../src/content.js';
test('24 casos completos, dos bloques y referencias resolubles',()=>{
  assert.equal(situationalBank.length,24);
  assert.equal(new Set(situationalBank.map(q=>q.id)).size,24);
  for(const form of ['PJS1','PJS2']) assert.equal(situationalBank.filter(q=>q.form===form).length,12);
  for(const q of situationalBank){
    assert.ok(q.scenario.length>250,q.id);
    assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);
    assert.equal(q.rationales.length,3);assert.ok(q.rationales.every(r=>r.length>40));
    assert.ok(q.sourceRefs.every(id=>sources[id]));assert.ok(q.reference);assert.ok(q.skill);
  }
});
test('mezclar preserva explicación de cada distractor, clave y contexto',()=>{
  for(const seed of [0,.3,.8]){
    const mixed=prepareQuestions(situationalBank,()=>seed);
    mixed.forEach((q,n)=>{
      const original=situationalBank[n];assert.equal(q.scenario,original.scenario);
      q.options.forEach((o,i)=>assert.equal(q.rationales[i],original.rationales[original.options.indexOf(o)]));
      assert.equal(q.options[q.correct],original.options[original.correct]);
    });
    assert.equal(grade({questions:mixed,answers:Object.fromEntries(mixed.map(q=>[q.id,q.correct]))}).percentage,100);
    assert.equal(grade({questions:mixed,answers:{}}).omitted,24);
  }
});
