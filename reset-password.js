import {verifyRecoveryToken,updateRecoveredPassword,revokeRecoveryToken,clearSession} from './auth-client.js?v=app20261101';
import {mountSiteNavigation} from './site-navigation.js';
const form=document.getElementById('recovery-form'),status=document.getElementById('recovery-status');
const password=document.getElementById('new-password'),confirm=document.getElementById('confirm-password');
const button=document.getElementById('recovery-submit');
let token=null;
mountSiteNavigation();
function message(text){status.textContent=text;status.focus();}
async function initialize(){
 const fragment=new URLSearchParams(location.hash.slice(1));
 const candidate=fragment.get('type')==='recovery'?fragment.get('access_token'):null;
 token=candidate;form.hidden=true;password.value='';confirm.value='';
 // Supprimer les jetons de l’adresse, même si un nouveau lien arrive dans cet onglet.
 history.replaceState(null,'',location.pathname);
 if(!token){message('Ce lien de réinitialisation est absent ou invalide. Demande un nouveau lien depuis la connexion.');return;}
 try{
  const user=await verifyRecoveryToken(candidate);
  if(token!==candidate)return;
  if(!user?.id)throw Error();
  form.hidden=false;status.textContent='Choisis un nouveau mot de passe d’au moins 8 caractères.';password.focus();
 }catch{if(token!==candidate)return;token=null;message('Ce lien a expiré ou ne peut pas être vérifié. Demande un nouveau lien depuis la connexion.');}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!token||!form.reportValidity())return;
 if(password.value!==confirm.value){message('Les deux mots de passe doivent être identiques.');confirm.focus();return;}
 button.disabled=true;status.textContent='Modification en cours…';
 try{
  await updateRecoveredPassword(token,password.value);
  // La session de récupération n’est jamais conservée dans le navigateur.
  try{await revokeRecoveryToken(token);}catch{}
  token=null;clearSession();password.value='';confirm.value='';form.hidden=true;
  message('Ton mot de passe a été modifié. Tu peux maintenant te connecter avec le nouveau mot de passe.');
 }catch{message('La modification a échoué. Réessaie ou demande un nouveau lien si le précédent a expiré.');}
 finally{button.disabled=false;}
});
window.addEventListener('hashchange',()=>{if(location.hash)void initialize();});
void initialize();
