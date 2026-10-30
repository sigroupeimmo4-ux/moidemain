import {signIn,signUp,recoverPassword,getSession} from './auth-client.js';
const form=document.querySelector('#auth-form');
const password=document.querySelector('#password'),feedback=document.querySelector('#auth-feedback');
const nameInput=document.querySelector('#name');
const email=document.querySelector('#email'),submit=document.querySelector('#auth-submit');
let mode='login';
const next=new URLSearchParams(location.search).get('next')||'';
const destination=/^(premium\.html|explorer\.html|personnages\.html|conseils\.html|mon-espace\.html|admin\.html)$/.test(next)?'./'+next:'./mon-espace.html';
function notice(message){feedback.textContent=message;feedback.hidden=false;feedback.focus();}
function setMode(nextMode){
 mode=nextMode==='signup'?'signup':'login';
 const signup=mode==='signup';
 document.title=(signup?'Inscription':'Connexion')+' — Moi Demain';
 document.querySelector('#auth-title').textContent=signup?'Créons votre compte.':'Heureux de vous retrouver.';
 document.querySelector('#auth-description').textContent=signup?'Un espace personnel pour votre avenir.':'Reprenez votre exploration à votre rythme.';
 document.querySelectorAll('[data-mode]').forEach(b=>{
  const selected=b.dataset.mode===mode;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;
 });
 form.setAttribute('aria-labelledby',signup?'tab-signup':'tab-login');
 document.querySelector('#name-field').hidden=true; // Pseudonyme facultatif à renseigner depuis Mon espace, sans collecter de vrai prénom lors de l'inscription.
 nameInput.required=false;
 document.querySelector('#forgot').hidden=signup;
 document.querySelector('#password-hint').hidden=!signup;
 document.querySelector('#signup-notice').hidden=!signup;
 document.querySelector('#adult-registration-field').hidden=!signup;
 password.autocomplete=signup?'new-password':'current-password';
 password.minLength=signup?8:1;password.value='';password.type='password';
 document.querySelector('#toggle-password').textContent='Afficher';
 document.querySelector('#toggle-password').setAttribute('aria-pressed','false');
 submit.textContent=signup?'Créer mon compte →':'Se connecter →';
 feedback.hidden=true;
 const url=new URL(location.href);url.searchParams.set('mode',mode);history.replaceState(null,'',url.pathname+url.search);
}
document.querySelectorAll('[data-mode]').forEach(b=>{
 b.addEventListener('click',()=>setMode(b.dataset.mode));
 b.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();setMode(e.key==='Home'?'login':e.key==='End'?'signup':mode==='login'?'signup':'login');
  document.querySelector('[data-mode="'+mode+'"]').focus();
 });
});
document.querySelector('#toggle-password').addEventListener('click',e=>{
 const show=password.type==='password';password.type=show?'text':'password';e.currentTarget.textContent=show?'Masquer':'Afficher';
 e.currentTarget.setAttribute('aria-pressed',String(show));
 e.currentTarget.setAttribute('aria-label',show?'Masquer le mot de passe':'Afficher le mot de passe');
});
form.addEventListener('submit',async e=>{
 e.preventDefault();
 submit.disabled=true;
 feedback.hidden=true;
 const pass=password.value;
 try{
  if(mode==='signup'){
   if(!document.getElementById('adult-registration').checked){notice('La création de compte est actuellement réservée à un parent ou un adulte responsable.');return;}
   const data=await signUp(email.value.trim(),pass);
   if(data.access_token){
    notice('Compte créé. Redirection vers votre espace…');
    location.assign(destination);
   }else{
    notice('Compte créé. Vérifiez votre boîte mail et confirmez votre adresse si demandé, puis connectez-vous.');
   }
  }else{
   await signIn(email.value.trim(),pass);
   notice('Connexion réussie. Ouverture de votre espace…');
   location.assign(destination);
  }
 }catch(error){notice(error.message||'Impossible de se connecter actuellement. Réessayez plus tard.');}
 finally{password.value='';submit.disabled=false;}
});
document.querySelector('#forgot').addEventListener('click',async()=>{
 const emailValue=email.value.trim();
 if(!emailValue){notice('Indiquez votre adresse e-mail pour recevoir les instructions.');return;}
 try{await recoverPassword(emailValue);notice('Si un compte existe pour cette adresse, un message de réinitialisation a été envoyé.');}
 catch{notice('La demande de réinitialisation n’a pas pu être effectuée.');}
});
setMode(new URLSearchParams(location.search).get('mode')==='signup'?'signup':'login');
getSession().then(session=>{if(session)notice('Vous êtes déjà connecté. Vous pouvez continuer vers votre espace.')}).catch(()=>{});
