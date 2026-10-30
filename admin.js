import {getSession} from './auth-client.js';
import {api} from './user-data.js';
const $=id=>document.getElementById(id);
const note=$('admin-status'),panel=$('admin-content'),feedback=$('admin-feedback');
let careers=[];
const el=(tag,text)=>{const d=document.createElement(tag);if(text!==undefined)d.textContent=text;return d;};
function report(message){feedback.textContent=message;}
async function loadAnnouncements(){
 const list=await api('site_announcements',{query:'select=id,title,body,published,created_at&order=created_at.desc&limit=60'});
 const parent=$('admin-announcements');parent.replaceChildren();
 for(const item of list){
  const row=el('article');row.className='journey-row';
  const info=el('div');info.append(el('strong',item.title),el('p',item.body),el('p',item.published?'Publié':'Brouillon'));
  const actions=el('div');
  const toggle=el('button',item.published?'Dépublier':'Publier'),remove=el('button','Supprimer');
  toggle.addEventListener('click',async()=>{try{await api('site_announcements',{method:'PATCH',query:'id=eq.'+item.id,data:{published:!item.published}});await loadAnnouncements();}catch(e){report(e.message);}});
  remove.addEventListener('click',async()=>{if(!confirm('Supprimer cette annonce ?'))return;try{await api('site_announcements',{method:'DELETE',query:'id=eq.'+item.id});await loadAnnouncements();}catch(e){report(e.message);}});
  actions.append(toggle,remove);row.append(info,actions);parent.append(row);
 }
 if(!list.length)parent.append(el('p','Aucune annonce pour le moment.'));
}
async function loadCareers(){
 careers=await api('premium_careers',{query:'select=id,name,category,emoji,detail,training,tasks&order=name.asc&limit=100'});
 const select=$('admin-career');select.replaceChildren();
 for(const c of careers){const option=el('option',c.name);option.value=c.id;select.append(option);}
 displayCareer();
}
function displayCareer(){
 const c=careers.find(x=>x.id===$('admin-career').value);if(!c)return;
 $('career-detail').value=c.detail;$('career-training').value=c.training;$('career-tasks').value=c.tasks.join('\n');
}
$('admin-career').addEventListener('change',displayCareer);
$('announcement-form').addEventListener('submit',async e=>{
 e.preventDefault();
 try{
  await api('site_announcements',{method:'POST',data:{title:$('announce-title').value.trim(),body:$('announce-body').value.trim(),published:$('announce-publish').checked}});
  $('announcement-form').reset();report('Annonce enregistrée.');await loadAnnouncements();
 }catch(e){report(e.message);}
});
$('career-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const id=$('admin-career').value;
 const c=careers.find(x=>x.id===id);if(!c)return;
 const tasks=$('career-tasks').value.split('\n').map(x=>x.trim()).filter(Boolean);
 if(tasks.length!==3||tasks.some(x=>x.length>300)){report('Indique exactement trois situations, de 300 caractères maximum chacune.');return;}
 try{
  await api('premium_careers',{method:'PATCH',query:'id=eq.'+encodeURIComponent(id),data:{detail:$('career-detail').value.trim(),training:$('career-training').value.trim(),tasks}});
  report('Fiche Premium enregistrée.');await loadCareers();
 }catch(e){report(e.message);}
});
async function init(){
 if(!await getSession()){note.textContent='Accès réservé. Connectez-vous avec un compte administrateur.';return;}
 try{
  const admins=await api('admin_users',{query:'select=user_id&limit=1'});
  if(!admins.length){note.textContent='Accès refusé : ce compte ne possède aucun rôle administrateur.';return;}
  note.textContent='Accès administrateur vérifié. Les changements restent soumis aux règles RLS.';
  panel.hidden=false;
  await Promise.all([loadAnnouncements(),loadCareers()]);
 }catch(e){note.textContent=e.message;}
}
void init();
