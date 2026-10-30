import {getUser,signOut,SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,getSession} from './auth-client.js';
import {readMyProfile,saveMyProfile,readHistory,readFavorites,readAvatars,deleteHistory,deleteAvatar,deleteMyJourney} from './user-data.js';
import {extraFreeJobs,premiumPreviews} from './catalogue-extra.js';
import {ANIMALS} from './personnages.js';
const careers=[
 {id:'designer',name:'Designer UX / UI',category:'Création'},
 {id:'dev',name:'Développeur web',category:'Technologie'},
 {id:'educ',name:'Éducateur spécialisé',category:'Lien humain'},
 {id:'paysage',name:'Paysagiste',category:'Nature & terrain'},
 {id:'data',name:'Analyste de données',category:'Technologie'},
 {id:'communication',name:'Chargé de communication',category:'Création'},
 {id:'infirmier',name:'Infirmier / infirmière',category:'Lien humain'},
 {id:'artisan',name:'Menuisier / menuisière',category:'Nature & terrain'},
 ...extraFreeJobs,...premiumPreviews
];
const $=id=>document.getElementById(id);
const status=$('account-status');
let snapshot={profile:null,favorites:[],history:[],avatars:[]};
function paragraph(text,cls='journey-empty'){const p=document.createElement('p');p.className=cls;p.textContent=text;return p;}
function make(tag,text,cls){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;}
function clearAndMessage(parent,text){parent.replaceChildren(paragraph(text));}
function stats(){
 const container=$('journey-stats');container.replaceChildren();
 for(const [label,value] of [['Métiers favoris',snapshot.favorites.length],['Quiz terminés',snapshot.history.length],['Compagnons',snapshot.avatars.length]]){
  const c=make('article',null,'experience-card');
  c.append(make('span',String(value),'experience-icon'),make('h3',label));
  container.append(c);
 }
}
function renderFavorites(){
 const wrap=$('journey-favorites');wrap.replaceChildren();
 if(!snapshot.favorites.length){clearAndMessage(wrap,'Aucun favori synchronisé. Découvre les métiers dans le catalogue.');return;}
 for(const id of snapshot.favorites){
  const career=careers.find(c=>c.id===id);if(!career)continue;
  const card=make('article',null,'experience-card');card.append(make('span',career.emoji||'💡','experience-icon'),make('h3',career.name),make('p',career.category));
  const a=make('a','Voir dans les métiers →','experience-secondary');a.href='./explorer.html?metier='+encodeURIComponent(id);card.append(a);wrap.append(card);
 }
}
function renderHistory(){
 const wrap=$('journey-history');wrap.replaceChildren();
 if(!snapshot.history.length){clearAndMessage(wrap,'Ton prochain quiz apparaîtra ici après une connexion.');return;}
 for(const item of snapshot.history){
  const row=make('article',null,'journey-row'),info=make('div');
  info.append(make('strong',item.quiz_type==='personality'?'Quiz de découverte':'Mini-quiz métier'));
  info.append(make('p',item.outcome+' · '+new Date(item.created_at).toLocaleDateString('fr-FR')));
  const btn=make('button','Effacer');btn.type='button';btn.addEventListener('click',async()=>{
   if(!confirm('Effacer ce résultat de quiz ?'))return;
   try{await deleteHistory(item.id);snapshot.history=snapshot.history.filter(x=>x.id!==item.id);renderHistory();stats();}catch(e){status.textContent=e.message;}
  });
  row.append(info,btn);wrap.append(row);
 }
}
function renderAvatars(){
 const wrap=$('journey-avatars');wrap.replaceChildren();
 if(!snapshot.avatars.length){clearAndMessage(wrap,'Aucun personnage synchronisé. Crée-en un dans « Mes personnages ».');return;}
 for(const a of snapshot.avatars){
  const card=make('article',null,'experience-card'),animal=ANIMALS.find(x=>x.id===a.animal);
  card.append(make('span',animal?.symbol||'🐰','account-avatar'),make('h3',a.name),make('span',animal?.label||'Compagnon','account-pill'));
  const btn=make('button','Supprimer ce personnage','experience-secondary small-button');
  btn.type='button';btn.addEventListener('click',async()=>{if(!confirm('Supprimer ce personnage synchronisé ?'))return;try{await deleteAvatar(a.id);snapshot.avatars=snapshot.avatars.filter(x=>x.id!==a.id);renderAvatars();stats();}catch(e){status.textContent=e.message;}});
  card.append(btn);wrap.append(card);
 }
}
function buildCompare(){
 const options=careers.map(c=>({value:c.id,label:c.name}));
 for(const id of ['compare-one','compare-two']){
  const select=$(id);select.replaceChildren();
  for(const o of options){const opt=new Option(o.label,o.value);select.append(opt);}
 }
 $('compare-two').selectedIndex=1;
}
function compare(){
 const out=$('compare-results');out.replaceChildren();
 for(const id of [$('compare-one').value,$('compare-two').value]){
  const c=careers.find(x=>x.id===id);if(!c)continue;
  const card=make('article',null,'experience-card');
  card.append(make('span',c.emoji||'🔎','experience-icon'),make('h3',c.name),make('p',c.category),make('p',c.desc||'Découvre cette activité et son quotidien.'));
  const a=make('a',c.premium?'Fiche Premium verrouillée →':'Découvrir ce métier →','experience-secondary');
  a.href=c.premium?'./premium.html':'./explorer.html?metier='+encodeURIComponent(id);card.append(a);out.append(card);
 }
}
async function load(){
 const user=await getUser();
 if(!user){status.textContent='Ton parcours reste disponible gratuitement dans le navigateur. Pour le synchroniser, connecte-toi avec un compte géré par un adulte. ';const link=make('a','Se connecter ou créer un compte →');link.href='./auth.html?next=mon-espace.html';status.append(link);return;}
 status.textContent='Compte connecté : '+user.email+'. Les données ci-dessous sont accessibles uniquement à ce compte.';
 $('account-dashboard').hidden=false;
 const results=await Promise.allSettled([readMyProfile(),readFavorites(),readHistory(),readAvatars()]);
 if(results[0].status==='fulfilled')snapshot.profile=results[0].value;
 if(results[1].status==='fulfilled')snapshot.favorites=results[1].value.map(x=>x.job_id);
 if(results[2].status==='fulfilled')snapshot.history=results[2].value;
 if(results[3].status==='fulfilled')snapshot.avatars=results[3].value;
 if(results.some(x=>x.status==='rejected'))status.textContent+=' Certaines données n’ont pas pu être chargées : réessayez après actualisation.';
 $('profile-name').value=snapshot.profile?.display_name||'';
 $('profile-age').value=snapshot.profile?.age_group||'non_renseigne';
 stats();renderFavorites();renderHistory();renderAvatars();buildCompare();
}
$('profile-form').addEventListener('submit',async event=>{
 event.preventDefault();
 try{await saveMyProfile({display_name:$('profile-name').value,age_group:$('profile-age').value});$('profile-status').textContent='Profil enregistré de manière privée.';}
 catch(e){$('profile-status').textContent=e.message;}
});
$('compare-go').addEventListener('click',compare);
$('sign-out').addEventListener('click',async()=>{await signOut();location.assign('./');});
$('clear-journey').addEventListener('click',async()=>{
 if(!confirm('Effacer tous les favoris synchronisés, résultats de quiz et personnages de ce compte ?'))return;
 try{await deleteMyJourney();snapshot.favorites=[];snapshot.history=[];snapshot.avatars=[];stats();renderFavorites();renderHistory();renderAvatars();$('security-status').textContent='Parcours effacé.';}
 catch(e){$('security-status').textContent=e.message;}
});
$('export-data').addEventListener('click',()=>{
 const raw=JSON.stringify({exported_at:new Date().toISOString(),...snapshot},null,2);
 const blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='moi-demain-mes-donnees.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
});
$('delete-account').addEventListener('click',async()=>{
 const text=$('delete-confirm').value;
 if(text!=='SUPPRIMER'){$('security-status').textContent='Saisis exactement SUPPRIMER pour confirmer.';return;}
 if(!confirm('Supprimer définitivement le compte, son profil et ses droits Premium ? Cette action est irréversible.'))return;
 const session=await getSession();if(!session){$('security-status').textContent='Session expirée : reconnectez-vous.';return;}
 try{
  const r=await fetch(SUPABASE_URL+'/functions/v1/delete-my-account',{
   method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:JSON.stringify({confirm:'SUPPRIMER'})
  });
  if(!r.ok)throw Error('Suppression impossible actuellement. Contactez le support et réessayez.');
  await signOut();location.assign('./?compte=supprime');
 }catch(e){$('security-status').textContent=e.message;}
});
void load().catch(()=>{status.textContent='Le compte n’a pas pu être chargé. Vérifiez votre connexion puis actualisez.';});
