import {jobs} from './catalogue.js';
const $=id=>document.getElementById(id);
const first=$('compare-first'),second=$('compare-second'),out=$('comparison');
const feedback=$('compare-feedback'),share=$('compare-share'),print=$('compare-print');
function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
for(const select of [first,second])for(const job of jobs)select.add(new Option(job.name+(job.premium?' · Premium':''),job.id));
const params=new URLSearchParams(location.search);
first.value=jobs.some(j=>j.id===params.get('un'))?params.get('un'):'dev';
second.value=jobs.some(j=>j.id===params.get('deux'))?params.get('deux'):'designer';
function render(){
 out.replaceChildren();feedback.textContent='';$('share-link-wrap').hidden=true;
 const identical=first.value===second.value;share.disabled=identical;print.disabled=identical;
 if(identical){feedback.textContent='Choisis deux métiers différents pour les comparer.';return;}
 const url=new URL(location.href);url.searchParams.set('un',first.value);url.searchParams.set('deux',second.value);history.replaceState(null,'',url);
 for(const id of [first.value,second.value]){
  const job=jobs.find(j=>j.id===id),card=el('article');card.className='experience-card';
  const icon=el('span',job.emoji);icon.className='experience-icon';icon.setAttribute('aria-hidden','true');
  card.append(icon,el('h2',job.name),el('p',job.category),el('p',job.desc));
  const dl=el('dl');
  for(const [title,key] of [['Le quotidien','detail'],['Pistes de formation','training']]){
   dl.append(el('dt',title),el('dd',job.premium?'Le contenu détaillé de cette fiche nécessite un accès Premium.':job[key]));
  }
  dl.append(el('dt','Des activités à essayer'));
  const activities=el('dd');
  if(job.premium)activities.textContent='Les activités détaillées sont réservées à la fiche Premium.';
  else{const list=el('ul');for(const task of job.tasks)list.append(el('li',task));activities.append(list);}
  dl.append(activities);card.append(dl);
  const a=el('a',job.premium?'Voir les conditions Premium →':'Ouvrir la fiche métier →');a.className='experience-secondary';
  a.href=(job.premium?'./premium.html?metier=':'./explorer.html?metier=')+encodeURIComponent(id);card.append(a);out.append(card);
 }
}
$('compare-form').addEventListener('submit',event=>{event.preventDefault();render();});
for(const select of [first,second])select.addEventListener('change',render);
share.addEventListener('click',async()=>{
 const url=location.href;
 try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(url);feedback.textContent='Lien de comparaison copié !';}
 catch{$('share-link').value=url;$('share-link-wrap').hidden=false;$('share-link').focus();$('share-link').select();feedback.textContent='Copie ce lien pour retrouver ou partager cette comparaison.';}
});
print.addEventListener('click',()=>window.print());
$('compare-favorites').addEventListener('click',()=>{
 let ids=[];try{const stored=JSON.parse((localStorage.getItem('moidemain-favorites')??localStorage.getItem('mondemain-favorites')??localStorage.getItem('cap-favorites'))||'[]');if(Array.isArray(stored))ids=[...new Set(stored)].filter(id=>jobs.some(j=>j.id===id));}catch{}
 if(ids.length<2){feedback.textContent='Ajoute au moins deux métiers aux favoris dans le catalogue, puis reviens ici.';return;}
 [first.value,second.value]=ids;render();
});
render();
