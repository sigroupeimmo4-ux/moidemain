import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,getSession} from './auth-client.js?v=fix20261101';

export async function api(table,{method='GET',query='',data,prefer='return=representation'}={}){
 const session=await getSession();
 if(!session)throw Error('Connectez-vous pour synchroniser votre parcours.');
 const response=await fetch(SUPABASE_URL+'/rest/v1/'+table+(query?'?'+query:''),{
  method,
  headers:{
   apikey:SUPABASE_PUBLISHABLE_KEY,
   Authorization:'Bearer '+session.access_token,
   'Content-Type':'application/json',
   Prefer:prefer
  },
  ...(data!==undefined?{body:JSON.stringify(data)}:{})
 });
 let body;
 try{body=await response.json()}catch{body=[]}
 if(!response.ok)throw Error('Impossible de synchroniser. Vérifiez votre connexion et réessayez.');
 return body;
}
export async function userId(){
 const session=await getSession();
 return session?.user?.id||null;
}
export async function readMyProfile(){
 const uid=await userId();if(!uid)return null;
 const rows=await api('user_profiles',{query:'user_id=eq.'+encodeURIComponent(uid)+'&select=user_id,display_name,age_group,updated_at&limit=1'});
 return rows[0]||{user_id:uid,display_name:'',age_group:'non_renseigne'};
}
export async function saveMyProfile(profile){
 const uid=await userId();if(!uid)throw Error('Connexion requise');
 return api('user_profiles',{
  method:'POST',query:'on_conflict=user_id',prefer:'resolution=merge-duplicates,return=representation',
  data:{user_id:uid,display_name:String(profile.display_name||'').trim().slice(0,30),age_group:['8-11','12-15','16-18','adulte'].includes(profile.age_group)?profile.age_group:'non_renseigne'}
 });
}
export async function readHistory(){
 return api('quiz_history',{query:'select=id,quiz_type,job_id,outcome,score,created_at&order=created_at.desc&limit=100'});
}
export async function addHistory(type,job,outcome,score){
 const uid=await userId();if(!uid)return false;
 if(!['personality','job'].includes(type))return false;
 await api('quiz_history',{method:'POST',data:{user_id:uid,quiz_type:type,job_id:job||null,outcome:String(outcome||'Exploration terminée').slice(0,160),score:Number.isInteger(score)?score:null}});
 return true;
}
export async function deleteHistory(id){return api('quiz_history',{method:'DELETE',query:'id=eq.'+encodeURIComponent(id)});}
export async function readFavorites(){
 return api('user_favorites',{query:'select=job_id&limit=100'});
}
export async function writeFavorite(jobId,active){
 const uid=await userId();if(!uid)return false;
 if(!/^[a-z_]{2,40}$/.test(jobId))return false;
 if(active)await api('user_favorites',{method:'POST',query:'on_conflict=user_id,job_id',prefer:'resolution=ignore-duplicates,return=representation',data:{user_id:uid,job_id:jobId}});
 else await api('user_favorites',{method:'DELETE',query:'job_id=eq.'+encodeURIComponent(jobId)});
 return true;
}
export async function readAvatars(){return api('user_avatars',{query:'select=id,name,animal,color,accessory,outfit,created_at&order=created_at.desc&limit=15'});}
export async function saveAvatar(avatar){
 const uid=await userId();if(!uid)return false;
 const {validateAvatar}=await import('./personnages.js');
 const v=validateAvatar(avatar);
 await api('user_avatars',{method:'POST',data:{user_id:uid,name:v.name,animal:v.animal,color:v.color,accessory:v.accessory,outfit:v.outfit}});
 return true;
}
export async function deleteAvatar(id){return api('user_avatars',{method:'DELETE',query:'id=eq.'+encodeURIComponent(id)});}
export async function deleteMyJourney(){
 const uid=await userId();if(!uid)throw Error('Connexion requise');
 await api('quiz_history',{method:'DELETE',query:'user_id=eq.'+encodeURIComponent(uid)});
 await api('user_favorites',{method:'DELETE',query:'user_id=eq.'+encodeURIComponent(uid)});
 await api('user_avatars',{method:'DELETE',query:'user_id=eq.'+encodeURIComponent(uid)});
}
