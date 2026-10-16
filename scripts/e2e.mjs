import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('.cache/browsers');
  const { chromium }=await import('@playwright/test');
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','inherit']});
await new Promise((done,fail)=>{server.stdout.on('data',chunk=>{if(chunk.toString().includes('Local:'))done();});server.on('error',fail);server.on('exit',code=>{if(code)fail(Error(`Servidor: ${code}`));});});
await mkdir('artifacts',{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,channel:'chromium'});
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const open=async(hash='')=>{await page.goto(`http://127.0.0.1:4173/${hash}`);await page.waitForSelector('.page-heading');};
  await open();
  assert.match(await page.locator('h1').innerText(),/Tu próxima meta/);
  assert.equal(await page.locator('.stat-card strong').nth(1).innerText(),'0');
  await page.screenshot({path:'artifacts/escritorio.png',fullPage:true});
  console.log('✓ Panel inicial y captura de escritorio');

  await page.click('[data-action="quick"]');
  await page.waitForSelector('.question-card');
  await page.locator('.option').first().click();
  await page.click('[data-action="flag"]');
  await page.click('[data-action="next"]');
  await page.reload();await page.waitForSelector('.resume-banner');
  await page.click('[data-action="resume"]');
  assert.equal(await page.locator('.map-button.answered').count(),1);
  assert.equal(await page.locator('.map-button.marked').count(),1);
  assert.equal(await page.locator('.map-button.current').innerText(),'2');
  await page.click('[data-action="finish"]');
  assert.match(await page.locator('dialog').innerText(),/9 preguntas sin responder/);
  await page.click('[data-action="confirm-finish"]');
  await page.waitForSelector('.result-summary');
  assert.equal(await page.locator('.review-card').count(),10);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1')));
  assert.equal(stored.history[0].score.omitted,9);
  assert.equal(stored.active,null);
  console.log('✓ Respuestas, marcas, recarga, omisiones y cierre');

  await page.goto('http://127.0.0.1:4173/#notebook');
  await page.waitForSelector('.error-card');
  await page.locator('[data-cause]').first().selectOption({label:'Lectura del caso'});
  await page.locator('[data-note]').first().fill('Revisar competencia antes de decidir.');
  await page.locator('[data-resolved]').first().check();
  await page.reload();await page.waitForSelector('.error-card');
  assert.equal(await page.locator('[data-note]').first().inputValue(),'Revisar competencia antes de decidir.');
  assert.equal(await page.locator('[data-resolved]').first().isChecked(),true);
  console.log('✓ Bitácora, notas y persistencia');

  await open('#plan');
  await page.locator('[data-plan="0"]').check();
  await page.locator('#target-date').fill('2026-11-08');
  await page.reload();await page.waitForSelector('.plan-summary');
  assert.equal(await page.locator('[data-plan="0"]').isChecked(),true);
  assert.equal(await page.locator('#target-date').inputValue(),'2026-11-08');
  await open('#topics');await page.locator('[data-action="lesson"]').first().click();
  await page.locator('[data-read]').first().check();
  console.log('✓ Plan y lecturas completadas');

  await open('#simulators');
  await page.locator('[data-action="start-form"]').first().click();
  await page.click('[data-action="confirm-start"]');
  await page.waitForSelector('#timer');
  assert.match(await page.locator('#timer').innerText(),/0[34]:/);
  assert.equal(await page.locator('.map-button').count(),60);
  await page.locator('[data-action="jump"][data-index="40"]').click();
  assert.equal(await page.locator('.option').count(),4);
  await page.locator('.option').first().click();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.option[aria-checked="true"] .option-letter').innerText(),'2');
  await page.reload();await page.waitForSelector('.resume-banner');
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('rumbo-236767-v1'));s.active.deadline=Date.now()-1000;localStorage.setItem('rumbo-236767-v1',JSON.stringify(s));});
  await page.reload();await page.waitForSelector('.result-summary');
  const expired=await page.evaluate(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1')).history.at(-1));
  assert.equal(expired.score.total,40);assert.equal(expired.score.correct,0);assert.equal(expired.score.percentage,0);
  console.log('✓ 60 ítems, autoinforme sin nota, teclado y vencimiento del reloj');

  await open('#library');
  const downloaded=page.waitForEvent('download');await page.click('[data-action="export"]');
  const backup=await downloaded;const backupPath=await backup.path();
  const payload=JSON.parse(await readFile(backupPath,'utf8'));
  assert.equal(payload.version,1);assert.equal(payload.state.history.length,2);
  await page.locator('#import-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"state":{}}')});
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('no es válida'));
  await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
  await page.waitForSelector('dialog[open]');
  await page.click('[data-action="confirm-import"]');await page.waitForSelector('.hero');
  assert.equal(await page.locator('.stat-card strong').nth(1).innerText(),'2');
  console.log('✓ Exportar e importar progreso, rechazo de archivo inválido');

  for(const width of [320,375,390,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of ['dashboard','simulators','topics','plan','notebook','library']){
      await open('#'+route);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      assert.equal(overflow,false,`Desbordamiento en ${route}, ${width}px`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await open('#simulators');
  await page.locator('#practice-form select[name="topic"]').selectOption('comportamental');
  await page.locator('#practice-form button[type="submit"]').click();
  await page.waitForSelector('.question-card');
  assert.equal(await page.locator('.option').count(),4);
  await page.screenshot({path:'artifacts/sesion-movil.png',fullPage:true});
  for(const width of [320,390,768,1024]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Desbordamiento de sesión a ${width}px`);
  }
  await page.click('[data-action="finish"]');await page.click('[data-action="confirm-finish"]');
  await page.waitForSelector('.result-summary');
  assert.match(await page.locator('.result-summary').innerText(),/sin equivalencia|No equivale/);
  assert.equal(await page.locator('.result-ring').innerText(),'✓');
  await page.setViewportSize({width:320,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Desbordamiento en resultados a 320px');
  const mobile=await browser.newPage({viewport:{width:390,height:844}});
  await mobile.goto('http://127.0.0.1:4173/');await mobile.waitForSelector('.hero');
  await mobile.screenshot({path:'artifacts/movil.png',fullPage:true});
  await mobile.close();
  assert.deepEqual(errors,[]);
  console.log('✓ Seis pantallas en 6 tamaños, sesión y resultados móviles, sin desbordamientos ni errores JS');
}finally{await browser?.close();server.kill();}
