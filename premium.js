import {premiumPreviews} from './catalogue-extra.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,getSession,checkPremium} from './auth-client.js?v=fix20261101';

const root=document.querySelector('#premium-cards');
const buy=document.querySelector('#premium-purchase');
const login=document.querySelector('#premium-login');
const status=document.querySelector('#premium-status');
const pricing=document.querySelector('#premium-pricing');
const configUrl=SUPABASE_URL+'/functions/v1/premium-checkout';
const DEFAULT_PREVIEW_PRICE=2500;
let config={available:false,mode:'test',proposed_price_xof:DEFAULT_PREVIEW_PRICE,currency:'XOF'};

function message(text,type=''){
 status.textContent=text;status.className='premium-status'+(type?' '+type:'');
}
function price(amount){return new Intl.NumberFormat('fr-SN').format(amount)+' FCFA';}
function decorate(){
 const active=config.available===true;
 const official=active&&Number.isInteger(config.price_xof);
 const amount=official?config.price_xof:config.proposed_price_xof||DEFAULT_PREVIEW_PRICE;
 pricing.replaceChildren();
 const label=document.createElement('span');
 label.className='experience-eyebrow';
 label.textContent=official?'Tarif configuré':'Proposition de tarif · non validée';
 const sum=document.createElement('strong');
 sum.className='premium-price';
 sum.textContent=price(amount);
 const explanation=document.createElement('p');
 explanation.textContent=official?'Paiement unique, sans renouvellement automatique.':'Paiement unique envisagé ; tarif définitif à confirmer avant toute vente.';
 pricing.append(label,sum,explanation);
}
for(const job of premiumPreviews){
 const card=document.createElement('article');card.className='premium-preview';
 const emoji=document.createElement('span');emoji.className='icon';emoji.textContent=job.emoji;
 const title=document.createElement('strong');title.textContent=job.name;
 const desc=document.createElement('p');desc.textContent=job.desc;
 const lock=document.createElement('small');lock.textContent='🔒 Fiche Premium';
 card.append(emoji,title,desc,lock);root.append(card);
}
function disable(text){buy.disabled=true;buy.textContent=text;buy.removeAttribute('data-mode');}
async function init(){
 decorate();
 const session=await getSession();
 if(session){login.textContent='Mon compte';}
 if(session&&await checkPremium().catch(()=>false)){
  message('Votre compte dispose déjà de Premium. Les dossiers complets sont disponibles dans le catalogue.','success');
  buy.disabled=false;buy.dataset.mode='explore';buy.textContent='Explorer mes métiers Premium';
  return;
 }
 try{
  const response=await fetch(configUrl,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY},cache:'no-store'});
  if(response.ok){const data=await response.json();if(data&&data.provider==='PayDunya')config=data;}
 }catch{}
 decorate();
 const query=new URLSearchParams(location.search);
 if(query.get('token')&&session){
  await verifyReturnedPayment(query.get('token'),session);
  history.replaceState(null,'',location.pathname);
  if(await checkPremium().catch(()=>false)){
   message('Paiement confirmé par PayDunya : votre accès Premium est actif !','success');
   buy.disabled=false;buy.dataset.mode='explore';buy.textContent='Explorer mes métiers Premium';
   return;
  }
 }else if(query.get('checkout')==='cancel'){
  message('Le paiement a été annulé. Aucun accès Premium n’a été activé.');
  history.replaceState(null,'',location.pathname);
 }
 if(!config.available){
  message('Les paiements sont en préparation avec PayDunya. Aucun débit n’est possible pour le moment.');
  disable('Paiement bientôt disponible');
  return;
 }
 if(config.mode==='test'){
  message('Mode de test PayDunya : les paiements sont simulés et ne débloquent pas un accès commercial.');
  buy.disabled=false;buy.dataset.mode='sandbox';buy.textContent=session?'Tester le paiement (simulation)':'Se connecter pour tester';
 }else{
  message(session?'Paiement sécurisé disponible. Un adulte doit confirmer le montant avant de poursuivre.':'Connectez-vous avec un compte adulte pour accéder au paiement sécurisé.');
  buy.disabled=false;buy.dataset.mode='buy';buy.textContent=session?'Payer '+price(config.price_xof):'Se connecter pour acheter';
 }
}
async function verifyReturnedPayment(token,session){
 if(!/^[A-Za-z0-9_-]{6,150}$/.test(token))return;
 try{
  const response=await fetch(configUrl,{
   method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:JSON.stringify({action:'verify',token})
  });
  const result=await response.json();
  if(response.ok&&result.status==='test_completed'){
   message('Paiement de test vérifié. Aucun accès Premium réel n’a été créé.');
  }else if(!response.ok||result.status==='pending'){
   message('Paiement en cours de confirmation. Revenez vérifier votre accès plus tard.');
  }
 }catch{message('La vérification est momentanément indisponible. Actualisez cette page plus tard.');}
}
buy.addEventListener('click',async()=>{
 if(buy.dataset.mode==='explore'){location.assign('./explorer.html?premium=1');return;}
 if(!config.available)return;
 let session;
 try{session=await getSession();}catch{message('Connexion indisponible : réessayez lorsque le réseau est rétabli.','error');return;}
 if(!session){location.assign('./auth.html?next=premium.html');return;}
 if(!document.querySelector('#adult-confirm')?.checked){
  message('Un parent ou un responsable légal majeur doit confirmer l’achat.','error');return;
 }
 buy.disabled=true;buy.textContent='Ouverture de PayDunya…';
 try{
  const response=await fetch(configUrl,{
   method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:JSON.stringify({action:'checkout',confirmAdult:true})
  });
  const data=await response.json();
  const target=new URL(data.url||'https://invalid.example');
  if(!response.ok||target.protocol!=='https:'||target.hostname!=='app.paydunya.com')
   throw Error(data.error||'Le service de paiement est indisponible.');
  location.assign(data.url);
 }catch(error){
  message(error.message||'Impossible de préparer le paiement. Aucun débit n’a eu lieu.','error');
  buy.disabled=false;buy.textContent=config.mode==='test'?'Réessayer la simulation':'Réessayer le paiement';
 }
});
void init().catch(()=>{disable('Réessayez après actualisation');message('Le service est temporairement indisponible. Votre session a été conservée ; réessayez après actualisation.','error');});
