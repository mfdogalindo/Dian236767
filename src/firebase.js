import {firebaseConfig} from './firebase-cfg.js';

// Se carga al iniciar sesión; estudiar como invitado no requiere conectarse a Firebase.
let authModules;
export function loadGoogleAuth(){
  if(!authModules)authModules=Promise.all([
    import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js')
  ]).then(async([appSDK,authSDK,databaseSDK])=>{
    const app=appSDK.getApps().find(a=>a.name==='rumbo')??appSDK.initializeApp(firebaseConfig,'rumbo');
    const auth=authSDK.getAuth(app);
    try{await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);}
    catch{await authSDK.setPersistence(auth,authSDK.inMemoryPersistence);}
    const provider=new authSDK.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
    return {
      observe:callback=>authSDK.onAuthStateChanged(auth,callback),
      login:()=>authSDK.signInWithPopup(auth,provider),logout:()=>authSDK.signOut(auth),
      watch:(user,onChange,onError)=>databaseSDK.onValue(
        databaseSDK.ref(databaseSDK.getDatabase(app),`users/${user.uid}/progress/updatedAt`),onChange,onError)
    };
  }).catch(error=>{authModules=null;throw error;});
  return authModules;
}

export function firebaseError(error){
  const messages={
    'auth/unauthorized-domain':'Autoriza este dominio en Firebase Authentication → Configuración → Dominios autorizados.',
    'auth/operation-not-allowed':'Habilita Google como proveedor en Firebase Authentication.',
    'auth/popup-blocked':'El navegador bloqueó la ventana. Permite ventanas emergentes y pulsa Entrar con Google otra vez.',
    'auth/popup-closed-by-user':'La ventana se cerró antes de terminar. Puedes volver a entrar con Google.',
    'auth/cancelled-popup-request':'Hay otra ventana de acceso en curso. Termínala antes de volver a intentarlo.',
    'auth/network-request-failed':'No se pudo conectar con Google. Tu avance local se conserva.'
  };
  return messages[error.code]??'No se pudo completar la conexión con Firebase. Revisa la conexión y la configuración del proyecto.';
}

// La API REST permite escrituras condicionales (ETag), evitando reemplazos silenciosos
// entre dispositivos. Se usa un ID token del usuario, nunca credenciales administrativas.
export const progressTransport={
  async request(user,method,body,etag,signal){
    const token=await user.getIdToken();
    const url=new URL(`${firebaseConfig.databaseURL.replace(/\/$/,'')}/users/${encodeURIComponent(user.uid)}/progress.json`);
    url.searchParams.set('auth',token);
    const headers={'X-Firebase-ETag':'true'};
    if(method==='PUT'){headers['Content-Type']='application/json';headers['if-match']=etag;}
    let response;
    try{response=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined,signal,cache:'no-store',referrerPolicy:'no-referrer'});}
    catch(error){if(error.name==='AbortError')throw error;throw Error('Sin conexión con la nube. Tu avance sigue guardado en este navegador.');}
    const value=await response.json();
    const result={value,etag:response.headers.get('ETag')};
    if(response.status===412){const error=Error('Otra sesión actualizó tu avance.');error.remote=result;throw error;}
    if(!response.ok)throw Error(response.status===401||response.status===403?'Firebase no permite acceder a tu avance. Revisa las reglas y vuelve a iniciar sesión.':'No se pudo sincronizar. Tu copia local se conserva.');
    if(!result.etag)throw Error('Firebase no devolvió una versión del avance. Reintenta la sincronización.');
    return result;
  },
  read(user,signal){return this.request(user,'GET',null,null,signal);},
  write(user,value,etag,signal){return this.request(user,'PUT',value,etag,signal);}
};
