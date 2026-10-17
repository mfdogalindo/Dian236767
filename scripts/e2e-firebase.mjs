import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('.cache/browsers');
const {chromium}=await import('@playwright/test');
const port=4174;
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','inherit']});
await new Promise((done,fail)=>{server.stdout.on('data',chunk=>{if(chunk.toString().includes('Local:'))done();});server.on('error',fail);server.on('exit',code=>fail(Error(`Servidor: ${code}`)));});
const appSDK=`export const getApps=()=>[];export const initializeApp=(config,name)=>({config,name});`;
const authSDK=`
const listeners=new Set();
const user=id=>id?{uid:id,displayName:id,email:id+'@example.test',getIdToken:async()=>'fake-'+id}:null;
export const browserLocalPersistence={};export const inMemoryPersistence={};
export const setPersistence=async()=>{};export const getAuth=()=>({});
export class GoogleAuthProvider{setCustomParameters(){}}
export function onAuthStateChanged(auth,callback){listeners.add(callback);queueMicrotask(()=>callback(user(sessionStorage.getItem('test-uid'))));return ()=>listeners.delete(callback);}
export async function signInWithPopup(){
  if(window.__testLoginError){const e=Error();e.code=window.__testLoginError;throw e;}
  const id=window.__testNextUid||'alice';sessionStorage.setItem('test-uid',id);
  listeners.forEach(callback=>callback(user(id)));return {user:user(id)};
}
export async function signOut(){sessionStorage.removeItem('test-uid');listeners.forEach(callback=>callback(null));}
`;
const databaseSDK=`export const getDatabase=()=>({});export const ref=(db,path)=>({path});
export function onValue(ref,callback){const listener=()=>callback({});window.addEventListener('test-rtdb',listener);queueMicrotask(listener);return ()=>window.removeEventListener('test-rtdb',listener);}`;
const remote=new Map();let revision=0,denied=false,sdkRequests=0;
let browser;
try{
  browser=await chromium.launch({headless:true,channel:'chromium'});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  page.setDefaultTimeout(15000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://www.gstatic.com/firebasejs/13.0.0/*',async route=>{
    sdkRequests++;
    const file=new URL(route.request().url()).pathname.split('/').at(-1);
    const source={'firebase-app.js':appSDK,'firebase-auth.js':authSDK,'firebase-database.js':databaseSDK}[file];
    assert.ok(source,`Importación Firebase no prevista: ${file}`);
    await route.fulfill({status:200,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'},body:source});
  });
  await page.route('https://dian-236767-default-rtdb.firebaseio.com/**',async route=>{
    const request=route.request(),url=new URL(request.url());
    const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-expose-headers':'ETag','content-type':'application/json'};
    if(request.method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
    const uid=url.pathname.match(/^\/users\/([^/]+)\/progress\.json$/)?.[1];
    assert.ok(uid,'El cliente debe acceder únicamente al avance del UID autenticado');
    if(denied||url.searchParams.get('auth')!==`fake-${uid}`){await route.fulfill({status:401,headers,body:'{"error":"Permission denied"}'});return;}
    const current=remote.get(uid)??{value:null,etag:'"empty"'};
    if(request.method()==='PUT'){
      if(request.headers()['if-match']!==current.etag){await route.fulfill({status:412,headers:{...headers,ETag:current.etag},body:JSON.stringify(current.value)});return;}
      const value=request.postDataJSON();assert.equal(value.version,1);assert.deepEqual(value.updatedAt,{'.sv':'timestamp'});
      remote.set(uid,{value:{...value,updatedAt:Date.now()},etag:`"r${++revision}"`});
    }
    const result=remote.get(uid)??current;
    await route.fulfill({status:200,headers:{...headers,ETag:result.etag},body:JSON.stringify(result.value)});
  });
  const open=async hash=>{await page.goto(`http://127.0.0.1:${port}/#${hash}`);await page.waitForSelector('[data-cloud-panel] button');};
  const signed=async name=>page.waitForFunction(name=>document.querySelector('[data-cloud-panel]')?.textContent.includes(name+'@example.test'),name);
  const synced=async()=>page.waitForFunction(()=>document.querySelector('.account-message')?.textContent.includes('Avance sincronizado'));
  await open('dashboard');assert.equal(sdkRequests,0);
  await page.goto(`http://127.0.0.1:${port}/#plan`);await page.locator('[data-plan="0"]').check();
  await open('library');await page.click('[data-action="cloud-login"]');await signed('alice');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1:user:alice'))?.base!==null);
  assert.equal(remote.size,0,'No debe publicar automáticamente el avance del invitado');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1:user:alice')).state.completed),[]);
  await page.click('[data-action="cloud-adopt"]');await page.click('[data-action="cloud-confirm-adopt"]');await synced();
  assert.deepEqual(JSON.parse(remote.get('alice').value.payload).completed,[0]);
  console.log('✓ Google, copia explícita de invitado y guardado autenticado');

  await page.click('[data-action="cloud-logout"]');await page.waitForSelector('[data-action="cloud-login"]');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1')).completed),[0]);
  await page.evaluate(()=>{window.__testNextUid='bob';});await page.click('[data-action="cloud-login"]');await signed('bob');
  await page.goto(`http://127.0.0.1:${port}/#plan`);await page.locator('[data-plan="1"]').check();
  await page.goto(`http://127.0.0.1:${port}/#library`);await synced();
  assert.deepEqual(JSON.parse(remote.get('bob').value.payload).completed,[1]);
  assert.deepEqual(JSON.parse(remote.get('alice').value.payload).completed,[0]);
  await page.reload();await signed('bob');await synced();
  console.log('✓ Cuentas independientes y recuperación de sesión tras recarga');

  const remoteState=JSON.parse(remote.get('bob').value.payload);remoteState.completed=[2];
  remote.set('bob',{value:{version:1,payload:JSON.stringify(remoteState),updatedAt:Date.now()},etag:'"other-device"'});
  await page.evaluate(()=>window.dispatchEvent(new Event('test-rtdb')));
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1:user:bob')).state.completed[0]===2);
  await page.goto(`http://127.0.0.1:${port}/#plan`);await page.locator('[data-plan="3"]').check();
  const concurrent=structuredClone(remoteState);concurrent.completed=[4];
  remote.set('bob',{value:{version:1,payload:JSON.stringify(concurrent),updatedAt:Date.now()},etag:'"concurrent"'});
  await page.evaluate(()=>window.dispatchEvent(new Event('test-rtdb')));
  await page.goto(`http://127.0.0.1:${port}/#library`);await page.waitForSelector('.cloud-conflict');
  await page.click('[data-action="cloud-remote"]');await page.click('[data-action="cloud-confirm-remote"]');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1:user:bob')).state.completed[0]===4);
  assert.deepEqual(JSON.parse(remote.get('bob').value.payload).completed,[4]);
  console.log('✓ Aviso RTDB, conflicto entre dispositivos y elección de versión');

  denied=true;await page.click('[data-action="cloud-sync"]');
  await page.waitForFunction(()=>document.querySelector('.account-message').textContent.includes('Firebase no permite'));
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('rumbo-236767-v1:user:bob')).state.completed),[4]);
  denied=false;await page.click('[data-action="cloud-sync"]');await synced();
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Cuenta a ${width}px`);
  }
  await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/firebase-cuenta.png',fullPage:true});
  await page.click('[data-action="cloud-logout"]');await page.waitForSelector('[data-action="cloud-login"]');
  await page.evaluate(()=>{window.__testLoginError='auth/unauthorized-domain';});
  await page.click('[data-action="cloud-login"]');
  await page.waitForFunction(()=>document.querySelector('.account-message').textContent.includes('Autoriza este dominio'));
  assert.deepEqual(errors,[]);
  console.log('✓ Denegación de permisos sin pérdida local, errores de acceso e interfaz móvil');
}finally{await browser?.close();server.kill();}
