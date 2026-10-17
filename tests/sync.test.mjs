import test from 'node:test';
import assert from 'node:assert/strict';
import {ProgressSync,accountKey,GUEST_KEY,decodeProgress,encodeProgress} from '../src/sync.js';

const empty=()=>({history:[],read:[],completed:[],notes:{},active:null});
const validate=s=>Boolean(s&&Array.isArray(s.history)&&Array.isArray(s.read)&&Array.isArray(s.completed)&&s.notes);
const state=n=>({...empty(),completed:[n]});
const value=s=>({version:1,payload:JSON.stringify(s),updatedAt:100});
const user=uid=>({uid});
function setup(){
  const memory=new Map(),remote=new Map();let calls=0;
  const storage={getItem:key=>memory.get(key)??null,setItem:(key,v)=>memory.set(key,v)};
  const transport={
    async read(u){return structuredClone(remote.get(u.uid)??{value:null,etag:'empty'});},
    async write(u,v,etag){
      calls++;
      const previous=remote.get(u.uid)??{value:null,etag:'empty'};
      if(etag!==previous.etag){const e=Error();e.remote=structuredClone(previous);throw e;}
      const result={value:{...v,updatedAt:100},etag:`revision-${calls}`};remote.set(u.uid,result);return structuredClone(result);
    }
  };
  const engine=new ProgressSync({storage,transport,initial:empty(),empty,validate,delay:60000});
  return {engine,storage,memory,remote,transport};
}
test('el avance de invitado no se publica al iniciar sesión y cada cuenta tiene su copia',async()=>{
  const {engine,storage,remote}=setup();
  engine.save(state(1));assert.deepEqual(JSON.parse(storage.getItem(GUEST_KEY)),state(1));
  await engine.enter(user('alice'));assert.deepEqual(engine.local.state,empty());assert.equal(remote.size,0);
  engine.save(state(2));await engine.sync();
  await engine.enter(user('bob'));assert.deepEqual(engine.local.state,empty());
  engine.save(state(3));await engine.sync();
  assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(2));
  assert.deepEqual(JSON.parse(remote.get('bob').value.payload),state(3));
  await engine.enter(null);assert.deepEqual(engine.local.state,state(1));
  await engine.enter(user('alice'));assert.deepEqual(engine.local.state,state(2));
  assert.ok(storage.getItem(accountKey('bob')));engine.stop();
});
test('copiar el invitado es explícito y conserva la copia original',async()=>{
  const {engine,storage,remote}=setup();engine.save(state(7));
  await engine.enter(user('alice'));engine.adoptGuest();await engine.sync();
  assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(7));
  assert.deepEqual(JSON.parse(storage.getItem(GUEST_KEY)),state(7));engine.stop();
});
test('recupera avance remoto y conserva arrays vacíos en la serialización',async()=>{
  const {engine,remote}=setup();remote.set('alice',{value:value(empty()),etag:'1'});
  await engine.enter(user('alice'));assert.deepEqual(engine.local.state,empty());assert.equal(engine.phase,'synced');
  assert.deepEqual(decodeProgress(value(empty()),validate),empty());engine.stop();
});
test('un fallo de red conserva cambios sucios y los reintenta tras recargar',async()=>{
  const ctx=setup();const {engine,transport,storage}=ctx;
  await engine.enter(user('alice'));engine.save(state(4));
  const original=transport.write;transport.write=async()=>{throw Error('offline');};
  await engine.sync();assert.equal(engine.phase,'error');assert.equal(engine.local.dirty,true);
  engine.stop();transport.write=original;
  const restored=new ProgressSync({storage,transport,initial:empty(),empty,validate,delay:60000});
  await restored.enter(user('alice'));assert.equal(restored.local.dirty,false);
  assert.deepEqual(restored.local.state,state(4));restored.stop();
});
test('cambios de dos dispositivos exigen elegir versión',async()=>{
  const {engine,remote}=setup();
  await engine.enter(user('alice'));engine.save(state(1));await engine.sync();
  engine.save(state(2));remote.set('alice',{value:value(state(3)),etag:'other'});
  await engine.sync();assert.equal(engine.phase,'conflict');assert.deepEqual(engine.local.state,state(2));
  assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(3));
  await engine.resolve('remote');assert.deepEqual(engine.local.state,state(3));assert.equal(engine.local.dirty,false);engine.stop();
});
test('conservar local requiere la versión remota que el usuario pudo revisar',async()=>{
  const {engine,remote}=setup();await engine.enter(user('alice'));engine.save(state(1));
  remote.set('alice',{value:value(state(2)),etag:'2'});await engine.sync();
  remote.set('alice',{value:value(state(3)),etag:'3'});await engine.resolve('local');
  assert.equal(engine.phase,'conflict');assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(3));
  await engine.resolve('local');assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(1));engine.stop();
});
test('una actualización concurrente durante PUT produce conflicto sin sobrescritura',async()=>{
  const {engine,remote,transport}=setup();await engine.enter(user('alice'));engine.save(state(1));
  const original=transport.write;transport.write=async(...args)=>{
    remote.set('alice',{value:value(state(9)),etag:'concurrent'});return original(...args);
  };
  await engine.sync();assert.equal(engine.phase,'conflict');assert.deepEqual(engine.local.state,state(1));
  assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(9));engine.stop();
});
test('una lectura de una cuenta anterior no cambia el usuario actual',async()=>{
  const {engine,transport}=setup();let finish;
  const read=transport.read;transport.read=u=>u.uid==='alice'?new Promise(resolve=>{finish=resolve;}):read(u);
  const pending=engine.enter(user('alice'));await engine.enter(user('bob'));
  finish({value:value(state(8)),etag:'8'});await pending;
  assert.equal(engine.user.uid,'bob');assert.deepEqual(engine.local.state,empty());engine.stop();
});
test('cambios durante una escritura quedan pendientes para la siguiente',async()=>{
  const {engine,transport,remote}=setup();await engine.enter(user('alice'));
  let release;const original=transport.write;
  transport.write=(...args)=>new Promise(resolve=>{release=async()=>resolve(await original(...args));});
  engine.save(state(1));const pending=engine.sync();
  await new Promise(resolve=>setImmediate(resolve));engine.save(state(2));await release();await pending;
  assert.equal(engine.local.dirty,true);assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(1));
  transport.write=original;await engine.sync();assert.deepEqual(JSON.parse(remote.get('alice').value.payload),state(2));engine.stop();
});
test('una sesión activa no se reemplaza automáticamente desde otro dispositivo',async()=>{
  const {engine,remote}=setup();await engine.enter(user('alice'));
  engine.save({...state(1),active:{id:'practice'}});await engine.sync();
  remote.set('alice',{value:value(state(2)),etag:'new'});await engine.sync();
  assert.equal(engine.phase,'conflict');assert.equal(engine.local.state.active.id,'practice');engine.stop();
});
test('rechaza datos incompatibles y avances demasiado grandes',()=>{
  assert.throws(()=>decodeProgress({version:2,payload:'{}'},validate));
  assert.throws(()=>decodeProgress({version:1,payload:'{}'},validate));
  assert.throws(()=>encodeProgress({text:'x'.repeat(4_000_001)}));
});
