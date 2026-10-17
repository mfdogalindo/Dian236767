// Auth simulado exclusivamente en Playwright. No se copia al sitio publicado.
export async function authenticateStudyPage(page){
  const app=`export const getApps=()=>[];export const initializeApp=()=>({});`;
  const auth=`
    const user={uid:'study-test',displayName:'Estudiante',email:'study@example.test',getIdToken:async()=>'test',getIdTokenResult:async()=>({claims:{firebase:{sign_in_provider:'google.com'}}})};
    export const getAuth=()=>({});export const browserLocalPersistence={};export const inMemoryPersistence={};export const setPersistence=async()=>{};
    export class GoogleAuthProvider{setCustomParameters(){}}
    export const onAuthStateChanged=(auth,callback)=>{queueMicrotask(()=>callback(user));return ()=>{};};
    export const signInWithPopup=async()=>({user});export const signOut=async()=>{};
  `;
  const database=`export const getDatabase=()=>({});export const ref=()=>({});export const onValue=()=>()=>{};`;
  await page.route('https://www.gstatic.com/firebasejs/13.0.0/*',route=>{
    const file=new URL(route.request().url()).pathname.split('/').at(-1);
    const source={'firebase-app.js':app,'firebase-auth.js':auth,'firebase-database.js':database}[file];
    return route.fulfill({status:200,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'},body:source});
  });
  // Ejercita la persistencia autenticada local sin tocar el proyecto real.
  await page.route('https://dian-236767-default-rtdb.firebaseio.com/**',route=>route.fulfill({status:401,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"error":"Permission denied"}'}));
}
