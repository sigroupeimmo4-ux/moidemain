// Clé PUBLlABLE Supabase uniquement ; jamais de clé service_role dans le navigateur.
export const SUPABASE_URL='https://sjhvaaaiwijhcykznfqn.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY='sb_publishable_kOrQsuO2iFTMl25Y92R7sQ_zdWA6cTM';
const SESSION_KEY='moidemain-auth-v1';
const SESSION_TOLERANCE=60;
function getStored(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function saveSession(value){
 if(!value?.access_token||!value?.refresh_token)return;
 const expires_at=Math.floor(Date.now()/1000)+(Number(value.expires_in)||3600);
 sessionStorage.setItem(SESSION_KEY,JSON.stringify({access_token:value.access_token,refresh_token:value.refresh_token,expires_at,user:value.user||null}));
}
export function clearSession(){try{sessionStorage.removeItem(SESSION_KEY)}catch{}}
async function authFetch(path,{method='POST',token,body}={}){
 const response=await fetch(SUPABASE_URL+'/auth/v1/'+path,{
  method,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 let data={};try{data=await response.json()}catch{}
 if(!response.ok){const error=new Error(data.msg||data.error_description||data.message||'Le service de connexion est indisponible.');error.status=response.status;throw error;}
 return data;
}
export async function signIn(email,password){
 const data=await authFetch('token?grant_type=password',{body:{email,password}});
 saveSession(data);return data;
}
export async function signUp(email,password){
 const data=await authFetch('signup',{body:{email,password}});
 if(data.access_token)saveSession(data);
 return data;
}
export async function recoverPassword(email){
 const redirect=new URL('./reset-password.html',location.href).href;
 return authFetch('recover?redirect_to='+encodeURIComponent(redirect),{body:{email}});
}
let refreshInFlight=null;
export async function getSession(){
 const session=getStored();if(!session)return null;
 if((session.expires_at||0)>Date.now()/1000+SESSION_TOLERANCE)return session;
 if(!refreshInFlight){
  refreshInFlight=(async()=>{
   try{
    const data=await authFetch('token?grant_type=refresh_token',{body:{refresh_token:session.refresh_token}});
    // Une déconnexion effectuée entre-temps ne doit pas être annulée par cette réponse.
    if(getStored()?.refresh_token!==session.refresh_token)return null;
    saveSession(data);return getStored();
   }catch(error){
    if([400,401,403].includes(error.status)){
     if(getStored()?.refresh_token===session.refresh_token)clearSession();
     return null;
    }
    // Réseau indisponible ou erreur temporaire : conserver la session pour réessayer.
    throw error;
   }finally{refreshInFlight=null;}
  })();
 }
 return refreshInFlight;
}
export async function getUser(){
 const session=await getSession();if(!session)return null;
 try{return await authFetch('user',{method:'GET',token:session.access_token})}
 catch(error){if([401,403].includes(error.status)){clearSession();return null;}throw error;}
}
export async function signOut(){
 try{
  const session=getStored();
  if(session?.access_token)await authFetch('logout?scope=local',{token:session.access_token});
 }catch{}finally{clearSession();}
}
export async function checkPremium(){
 const session=await getSession();if(!session)return false;
 const response=await fetch(SUPABASE_URL+'/rest/v1/premium_access?select=active&limit=1',{
  headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token}
 });
 if(!response.ok)return false;
 const data=await response.json();return data?.[0]?.active===true;
}
export async function fetchPremiumCareer(id){
 if(!/^[a-z_]+$/.test(id))return null;
 const session=await getSession();if(!session)return null;
 const response=await fetch(SUPABASE_URL+'/rest/v1/premium_careers?select=id,name,category,emoji,detail,training,tasks&id=eq.'+encodeURIComponent(id)+'&limit=1',{
  headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token}
 });
 if(!response.ok)return null;
 const rows=await response.json();return Array.isArray(rows)?rows[0]||null:null;
}

export function verifyRecoveryToken(token){
 return authFetch('user',{method:'GET',token});
}
export function updateRecoveredPassword(token,password){
 return authFetch('user',{method:'PUT',token,body:{password}});
}
export function revokeRecoveryToken(token){
 return authFetch('logout?scope=local',{token});
}
