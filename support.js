import {getSession} from './auth-client.js';
import {api,userId} from './user-data.js';
const area=document.getElementById('support-form-area');
if(area){
 const status=document.getElementById('support-form-status');
 async function init(){
  if(!await getSession()){
   const link=document.createElement('a');link.href='./auth.html?next=mon-espace.html';link.textContent='Se connecter avec un compte adulte pour envoyer un signalement';
   area.append(link);return;
  }
  const form=document.createElement('form');
  form.className='experience-card account-form';
  const label=document.createElement('label');label.textContent='Type de demande';
  const select=document.createElement('select');select.required=true;
  const types=[['bug','Problème technique'],['contenu','Erreur dans un métier'],['compte','Compte'],['vie_privee','Vie privée'],['premium','Premium'],['autre','Autre']];
  for(const [v,t] of types){const o=document.createElement('option');o.value=v;o.textContent=t;select.append(o);}
  label.append(select);
  const message=document.createElement('label');message.textContent='Votre message (10 à 800 caractères)';
  const textarea=document.createElement('textarea');textarea.maxLength=800;textarea.minLength=10;textarea.required=true;textarea.rows=5;textarea.placeholder='Décrivez le problème sans données personnelles sensibles…';
  message.append(textarea);
  const button=document.createElement('button');button.type='submit';button.className='experience-cta';button.textContent='Envoyer le signalement';
  form.append(label,message,button);
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const uid=await userId();if(!uid){status.textContent='Votre session a expiré.';return;}
   button.disabled=true;
   try{
    await api('support_tickets',{method:'POST',data:{user_id:uid,category:select.value,message:textarea.value.trim()}});
    textarea.value='';status.textContent='Signalement enregistré. L’équipe devra consulter le tableau d’administration pour le traiter.';
   }catch(e){status.textContent=e.message;}
   finally{button.disabled=false;}
  });
  area.append(form);
 }
 void init().catch(()=>{status.textContent='Le formulaire est temporairement indisponible.';});
}
