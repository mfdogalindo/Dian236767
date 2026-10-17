import {escapeHTML as esc} from './core.js';

const button=(label,action,disabled=false)=>`<button class="btn outline" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
function summary(state){return `${state.history.length} prácticas terminadas · ${state.read.length} lecturas · bloques ${state.completed.length?state.completed.map(i=>i+1).join(', '):'ninguno'} · ${Object.keys(state.notes).length} notas · ${state.active?'en curso: '+state.active.name:'sin práctica en curso'}`;}
export function accountMarkup(sync){
  if(!sync)return '<p>Preparando el guardado del avance…</p>';
  const busy=sync.busy;
  const signed=Boolean(sync.user);
  let conflict='';
  if(sync.conflict){
    let remoteSummary='La versión de la nube no se pudo resumir.';
    try{const s=JSON.parse(sync.conflict.value.payload);remoteSummary=summary(s);}catch{}
    const updated=sync.conflict.value?.updatedAt;
    conflict=`<div class="cloud-conflict"><h3>Elige qué versión conservar</h3><p>Este dispositivo: ${esc(summary(sync.local.state))}.</p><p>Nube: ${esc(remoteSummary)}.${Number.isFinite(updated)?` Actualizada: ${esc(new Date(updated).toLocaleString('es-CO',{timeZone:'America/Bogota'}))}.`:''}</p><p>La elección reemplaza el avance completo, incluidas notas y práctica en curso. Puedes descargar ambas versiones antes de elegir.</p><div class="account-actions">${button('Exportar copia local','export')}${sync.conflict.value?button('Descargar copia de la nube','cloud-export-remote'):''}${button('Conservar este dispositivo','cloud-local',busy)}${button('Usar el avance de la nube','cloud-remote',busy)}</div></div>`;
  }
  return `<h2>${signed?'Tu cuenta y tu avance':'Lleva tu avance a otros dispositivos'}</h2>
    ${signed?`<p><strong>${esc(sync.user.displayName||'Cuenta de Google')}</strong>${sync.user.email?` · ${esc(sync.user.email)}`:''}</p>`:'<p>Entra con Google para guardar prácticas, lecturas, notas, planes y repasos en tu cuenta.</p>'}
    <p role="status" aria-live="polite" class="account-message">${esc(sync.message)}</p>
    <div class="account-actions">${signed?`${button('Sincronizar ahora','cloud-sync',busy||Boolean(sync.conflict))}${button('Copiar avance de invitado a mi cuenta','cloud-adopt',busy||Boolean(sync.conflict))}${button('Cerrar sesión','cloud-logout')}`:button('Entrar con Google','cloud-login',busy)}</div>
    ${conflict}<p class="small-text muted">${signed?'Se conserva una copia por cuenta en este navegador. En equipos compartidos, exporta lo necesario y borra los datos del sitio al terminar.':'Puedes continuar como invitado. Al entrar, el avance de invitado queda separado y podrás copiarlo a tu cuenta.'}</p>`;
}
