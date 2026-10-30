import {premiumPreviews} from './catalogue-extra.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,getSession,getUser,checkPremium} from './auth-client.js';
const container=document.querySelector('#premium-cards');
const purchase=document.querySelector('#premium-purchase');
const login=document.querySelector('#premium-login');
const status=document.querySelector('#premium-status');
let configured=false;
function message(text,type=''){
 status.textContent=text;status.className='premium-status'+(type?' '+type:'');
}
for(const job of premiumPreviews){
 const card=document.createElement('article');card.className='premium-preview';
 const emoji=document.createElement('span');emoji.className='icon';emoji.textContent=job.emoji;
 const title=document.createElement('strong');title.textContent=job.name;
 const desc=document.createElement('p');desc.textContent=job.desc;
 const lock=document.createElement('small');lock.textContent='🔒 Fiche Premium';
 card.append(emoji,title,desc,lock);container.append(card);
}
async function init(){
 const session=await getSession();
 if(session){
  login.textContent='Mon compte';login.href='./auth.html?next=premium.html';
  try{
   if(await checkPremium()){
    message('Ton compte possède déjà un accès Premium actif. Tu peux ouvrir les fiches depuis le catalogue.','success');
    purchase.disabled=false;purchase.textContent='Explorer mes métiers Premium';purchase.dataset.mode='explore';
    return;
   }
  }catch{}
 }
 try{
  const response=await fetch(SUPABASE_URL+'/functions/v1/premium-checkout',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});
  if(response.ok){
   const data=await response.json();
   configured=data.available===true;
  }
 }catch{}
 if(!configured){
  message('Le catalogue Premium est préparé, mais le paiement n’est pas encore activé. Aucun achat ni débit n’est possible pour le moment.');
  purchase.disabled=true;purchase.textContent='Paiement bientôt disponible';
 }else{
  message(session?'Tu peux accéder au paiement sécurisé. Le tarif sera présenté avant validation.':'Connecte-toi avec un compte adulte pour accéder au paiement sécurisé.');
  purchase.disabled=false;purchase.textContent=session?'Continuer vers le paiement':'Me connecter pour acheter';
 }
}
purchase.addEventListener('click',async()=>{
 if(purchase.dataset.mode==='explore'){location.assign('./explorer.html?premium=1');return;}
 const session=await getSession();
 if(!session){location.assign('./auth.html?next=premium.html');return;}
 if(!configured)return;
 if(!document.querySelector('#adult-confirm')?.checked){message('Un adulte doit confirmer qu’il réalise cet achat.','error');return;}
 purchase.disabled=true;purchase.textContent='Ouverture du paiement…';
 try{
  const response=await fetch(SUPABASE_URL+'/functions/v1/premium-checkout',{
   method:'POST',
   headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:JSON.stringify({confirmAdult:true})
  });
  const data=await response.json();
  if(!response.ok||!data.url||!/^https:\/\/checkout\.stripe\.com\//.test(data.url))throw Error(data.error||'Paiement indisponible');
  location.assign(data.url);
 }catch(error){
  message(error.message||'Le paiement ne peut pas être lancé. Réessaie plus tard.','error');
  purchase.disabled=false;purchase.textContent='Réessayer le paiement';
 }
});
init();
