import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractBank } from '../scripts/extract.mjs';
import { prepareQuestions, grade, remaining, duration, escapeHTML } from '../src/core.js';
const bank=extractBank(await readFile('deep-research-report.md','utf8'));
test('el banco conserva 3 formas completas y claves del informe',()=>{
  assert.equal(bank.length,180);
  for(const form of ['A','B','C']){
    const questions=bank.filter(q=>q.form===form);
    assert.equal(questions.length,60);
    assert.equal(questions.filter(q=>q.type==='functional').length,40);
    assert.equal(questions.filter(q=>q.type==='behavioral').length,12);
    assert.equal(questions.filter(q=>q.type==='integrity').length,8);
    for(const q of questions){assert.ok(q.prompt.length>0);assert.ok(q.options.every(o=>o.length>0));if(q.type==='functional'){assert.equal(q.options.length,3);assert.ok(q.explanation);assert.ok(q.correct>=0&&q.correct<3);}else{assert.equal(q.correct,undefined);}}
  }
  assert.equal(bank.find(q=>q.id==='A1').correct,1);
  assert.equal(bank.find(q=>q.id==='A2').correct,0);
  assert.equal(bank.find(q=>q.id==='A40').correct,1);
  assert.equal(bank.find(q=>q.id==='C40').options[0],'omisiones y corrimientos.');
});
test('mezclar opciones conserva la respuesta correcta y no cambia el banco',()=>{
  const before=JSON.stringify(bank);
  const mixed=prepareQuestions(bank,()=>0);
  for(let i=0;i<bank.length;i++){
    if(bank[i].type==='functional')assert.equal(mixed[i].options[mixed[i].correct],bank[i].options[bank[i].correct]);
    else assert.deepEqual(mixed[i].options,bank[i].options);
  }
  assert.equal(JSON.stringify(bank),before);
  assert.notEqual(mixed[1].correct,bank[1].correct);
});
test('los autoinformes no afectan la nota y las omisiones funcionales cuentan',()=>{
  const questions=prepareQuestions(bank.filter(q=>q.form==='A'));
  const answers={};for(const q of questions.slice(0,36))answers[q.id]=q.correct;
  answers.A41=3;answers.A53=0;
  const result=grade({questions,answers});
  assert.equal(result.correct,36);assert.equal(result.total,40);assert.equal(result.percentage,90);assert.equal(result.answered,38);assert.equal(result.omitted,22);
  assert.equal(Object.values(result.topics).reduce((s,t)=>s+t.total,0),40);
  assert.equal(grade({questions:questions.filter(q=>q.type!=='functional'),answers}).percentage,null);
});
test('porcentajes se truncan a dos decimales',()=>{
  const questions=bank.slice(0,3);const answers={[questions[0].id]:questions[0].correct};
  assert.equal(grade({questions,answers}).percentage,33.33);
});
test('reloj por fecha absoluta sobrevive a recargas y no se vuelve negativo',()=>{
  const deadline=10000;
  assert.equal(remaining({deadline},1000),9);
  assert.equal(remaining(JSON.parse(JSON.stringify({deadline})),15000),0);
  assert.equal(remaining({deadline:null}),null);
  assert.equal(duration(14400),'04:00:00');assert.equal(duration(65),'00:01:05');
});
test('el contenido de las notas se escapa para renderizar HTML',()=>{assert.equal(escapeHTML('<script>"x" & \'y\'</script>'),'&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;');});
