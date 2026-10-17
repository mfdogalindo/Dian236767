// Sin dependencias de navegador/Firebase: permite comprobar cambios de usuario y concurrencia.
export const GUEST_KEY='rumbo-236767-v1';
export const accountKey=uid=>`${GUEST_KEY}:user:${uid}`;
export const MAX_PAYLOAD_LENGTH=4_000_000;
export const MAX_PAYLOAD_BYTES=8_000_000;

export function encodeProgress(state){
  const payload=JSON.stringify(state);
  if(payload.length>MAX_PAYLOAD_LENGTH||new TextEncoder().encode(payload).length>MAX_PAYLOAD_BYTES){
    throw Error('El avance supera el tamaño de sincronización. Exporta una copia y conserva tu progreso local.');
  }
  return payload;
}
export function decodeProgress(value,validate){
  if(!value||value.version!==1||typeof value.payload!=='string'||value.payload.length>MAX_PAYLOAD_LENGTH)throw Error('El avance de la nube tiene un formato incompatible. Tu copia local se conserva.');
  const state=JSON.parse(value.payload);
  if(!validate(state))throw Error('El avance de la nube no corresponde al banco actual. Tu copia local se conserva.');
  return state;
}

export class ProgressSync{
  constructor({storage,initial,empty,validate,transport,onState=()=>{},onStatus=()=>{},delay=1000}){
    Object.assign(this,{storage,empty,validate,transport,onState,onStatus,delay});
    this.user=null;this.local={state:initial,base:null,dirty:false};this.epoch=0;
    this.busy=false;this.conflict=null;this.phase='guest';this.message='Avance de invitado guardado en este navegador.';
  }
  status(phase,message){this.phase=phase;this.message=message;this.onStatus(this);}
  persist(){
    try{this.storage.setItem(this.user?accountKey(this.user.uid):GUEST_KEY,JSON.stringify(this.user?this.local:this.local.state));return true;}
    catch{this.status('error','No se pudo guardar la copia local. Exporta el avance antes de cerrar.');return false;}
  }
  save(state){
    this.local.state=state;
    if(this.user)this.local.dirty=true;
    const saved=this.persist();
    if(this.user&&!this.conflict){this.status('pending','Cambios pendientes de sincronizar.');this.schedule();}
    return saved;
  }
  schedule(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),this.delay);}
  readCache(key){
    try{return JSON.parse(this.storage.getItem(key)||'null');}catch{return null;}
  }
  async enter(user){
    clearTimeout(this.timer);this.abort?.abort();this.epoch++;this.busy=false;this.again=false;this.conflict=null;this.user=user;
    let cache=user?this.readCache(accountKey(user.uid)):null;
    if(!cache||!this.validate(cache.state)||!(cache.base===null||typeof cache.base==='string'))cache=null;
    const guest=this.readCache(GUEST_KEY);
    this.local=user?(cache??{state:this.empty(),base:null,dirty:false}):{state:guest&&this.validate(guest)?guest:this.empty(),base:null,dirty:false};
    this.onState(this.local.state);
    if(!user){this.status('guest','Modo invitado. El avance de tu cuenta queda separado.');return;}
    this.status('loading','Consultando tu avance…');
    await this.sync();
  }
  adoptGuest(){
    const guest=this.readCache(GUEST_KEY);
    if(!this.user||!guest||!this.validate(guest))throw Error('No hay una copia de invitado válida para copiar.');
    this.local.state=guest;this.local.dirty=true;this.persist();this.onState(guest);
    if(!this.conflict)this.schedule();
    this.status(this.conflict?'conflict':'pending',this.conflict?'Resuelve primero qué versión conservar.':'Avance de invitado copiado a esta cuenta; pendiente de sincronizar.');
  }
  showConflict(remote){
    this.conflict=remote;
    this.status('conflict','Hay otra versión del avance. Elige cuál conservar antes de sincronizar.');
  }
  async sync(resolution=null){
    if(!this.user||this.conflict&&!resolution)return;
    if(this.busy){this.again=true;return;}
    clearTimeout(this.timer);
    const user=this.user,epoch=this.epoch;
    this.abort=new AbortController();const signal=this.abort.signal;
    const timeout=setTimeout(()=>this.abort?.signal===signal&&this.abort.abort(),15000);
    const stillHere=()=>this.epoch===epoch;
    this.busy=true;
    this.status('loading','Sincronizando tu avance…');
    try{
      const remote=await this.transport.read(user,signal);
      if(!stillHere())return;
      const remoteState=remote.value===null?null:decodeProgress(remote.value,this.validate);
      const payload=encodeProgress(this.local.state);
      const equal=remote.value?.payload===payload;
      if(resolution&&remote.etag!==resolution.etag){this.showConflict(remote);return;}
      if(!resolution&&remote.value===null&&this.local.base!==null&&this.local.base!==remote.etag){
        this.showConflict(remote);return;
      }
      // Cambios sobre una versión distinta requieren una elección explícita. También se
      // protege una sesión activa aunque sus últimas respuestas ya estén sincronizadas.
      if(!resolution&&!equal&&remoteState&&(this.local.dirty&&this.local.base!==remote.etag||this.local.state.active)){
        this.showConflict(remote);return;
      }
      if(resolution?.choice==='remote'||!this.local.dirty&&!resolution&&!equal){
        this.local={state:remoteState??this.empty(),base:remote.etag,dirty:false};
        this.conflict=null;this.persist();this.onState(this.local.state);
        this.status('synced',remoteState?'Avance recuperado de tu cuenta.':'Tu cuenta está lista para guardar el avance.');return;
      }
      if(equal){
        this.local.base=remote.etag;this.local.dirty=false;this.conflict=null;this.persist();
        this.status('synced','Avance sincronizado.');return;
      }
      if(!this.local.dirty&&!resolution){this.local.base=remote.etag;this.persist();this.status('synced','Tu cuenta está lista para guardar el avance.');return;}
      const saved=await this.transport.write(user,{version:1,payload,updatedAt:{'.sv':'timestamp'}},remote.etag,signal);
      if(!stillHere())return;
      this.local.base=saved.etag;this.local.dirty=encodeProgress(this.local.state)!==payload;
      this.conflict=null;this.persist();
      this.status(this.local.dirty?'pending':'synced',this.local.dirty?'Hay nuevos cambios pendientes.':'Avance sincronizado.');
      if(this.local.dirty)this.schedule();
    }catch(error){
      if(!stillHere())return;
      if(error.remote)this.showConflict(error.remote);
      else this.status('error',error.name==='AbortError'?'La conexión tardó demasiado. Tu copia local se conserva; vuelve a sincronizar.':error.message||'Sin conexión. Tu copia local se conserva; vuelve a sincronizar.');
    }finally{clearTimeout(timeout);if(stillHere()){
      this.busy=false;this.onStatus(this);
      if(this.again&&!this.conflict){this.again=false;this.schedule();}
    }}
  }
  resolve(choice){
    if(!this.conflict||!['local','remote'].includes(choice))return;
    return this.sync({choice,etag:this.conflict.etag});
  }
  stop(){clearTimeout(this.timer);this.abort?.abort();this.epoch++;}
}
