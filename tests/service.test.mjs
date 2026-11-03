import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {serviceBank,serviceCards,serviceTopic} from '../src/service-content.js';
import {topics,sources} from '../src/content.js';
import {flashcards} from '../src/process-content.js';
import {prepareQuestions,grade,findQuestionVersion} from '../src/core.js';
import {dueCards,scheduleReview} from '../src/review.js';

test('atención ofrece dos bloques completos con claves, distractores y páginas trazables',()=>{
  assert.equal(serviceBank.length,20);
  assert.equal(new Set(serviceBank.map(q=>q.id)).size,20);
  for(const form of ['AT1','AT2'])assert.equal(serviceBank.filter(q=>q.form===form).length,10);
  for(const q of serviceBank){
    assert.equal(q.topic,'atencion');assert.equal(q.type,'functional');assert.equal(q.options.length,3);
    assert.equal(new Set(q.options).size,3);assert.equal(q.rationales.length,3);
    assert.ok(q.rationales.every(r=>r.length>40));assert.ok(q.scenario.length>140);
    assert.ok(q.sourceRefs.every(id=>sources[id]));assert.match(q.reference,/CT-CAC-0054.*2025.*pp\./);
  }
});
test('mezclar y calificar el tema conserva contexto, clave y explicación de cada opción',()=>{
  for(const seed of [0,.4,.9]){
    const questions=prepareQuestions(serviceBank,()=>seed);
    for(const [i,q] of questions.entries()){
      const original=serviceBank[i];assert.equal(q.options[q.correct],original.options[original.correct]);
      q.options.forEach((o,j)=>assert.equal(q.rationales[j],original.rationales[original.options.indexOf(o)]));
      assert.equal(findQuestionVersion(q,serviceBank),original);
    }
    const score=grade({questions,answers:Object.fromEntries(questions.map(q=>[q.id,q.correct]))});
    assert.equal(score.percentage,100);assert.deepEqual(score.topics.atencion,{correct:20,total:20});
    assert.equal(grade({questions,answers:{}}).omitted,20);
  }
});
test('lecturas y tarjetas se integran al catálogo y al calendario sin perder las existentes',()=>{
  assert.equal(topics.find(t=>t.id==='atencion'),serviceTopic);assert.equal(serviceTopic.lessons.length,12);
  assert.ok(serviceTopic.lessons.every(l=>l.length===4&&l[3]));
  assert.equal(serviceCards.length,12);assert.equal(flashcards.filter(c=>c.topic==='atencion').length,12);
  assert.equal(flashcards.filter(c=>/^f\d+$/.test(c.id)).length,16);
  const reviews={};reviews[serviceCards[0].id]=scheduleReview(undefined,true,20000);
  assert.equal(dueCards(serviceCards,reviews,20000).length,11);
  assert.equal(dueCards(serviceCards,reviews,20001).length,12);
});
test('el build publica el PDF y agrega el banco sin modificar los simulacros A/B/C',async()=>{
  await import('../scripts/build.mjs');
  const built=JSON.parse(await readFile('dist/assets/questions.json','utf8'));
  assert.equal(built.length,274);assert.equal(new Set(built.map(q=>q.id)).size,274);
  assert.equal(built.filter(q=>q.topic==='atencion').length,20);
  for(const form of ['A','B','C'])assert.equal(built.filter(q=>q.form===form).length,60);
  assert.deepEqual(await readFile('dist/assets/CT-CAC-0054.pdf'),await readFile('CT-CAC-0054.pdf'));
});
