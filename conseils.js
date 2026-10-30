export const adviceByAge={
 '8-11':[
  {icon:'🔍',title:'Explore ce que tu aimes',body:'Dessiner, réparer, raconter, jardiner, aider : note ce qui te plaît et essaie une activité différente chaque semaine.'},
  {icon:'🎨',title:'Teste, même si tu ne sais pas encore',body:'Il n’est pas nécessaire d’être déjà bon dans quelque chose pour l’essayer. La curiosité compte plus que la perfection.'},
  {icon:'🤝',title:'Pose des questions aux adultes',body:'Demande à un adulte comment se passe sa journée de travail, ce qu’il préfère et ce qui le surprend.'},
  {icon:'🌈',title:'Tous les métiers sont ouverts à ta curiosité',body:'Aucun métier n’est réservé aux filles ou aux garçons. Découvre ce qui te donne envie d’apprendre.'}
 ],
 '12-15':[
  {icon:'🧭',title:'Repère tes centres d’intérêt',body:'Observe les matières, activités et sujets qui t’attirent, y compris en dehors de l’école.'},
  {icon:'🛠️',title:'Fabrique un petit projet',body:'Écris un article, crée une vidéo, programme un mini-jeu ou organise une action collective pour découvrir tes préférences.'},
  {icon:'🎤',title:'Rencontre des professionnels',body:'Profite des forums, visites et stages de découverte quand ils sont proposés. Prépare quelques questions à poser.'},
  {icon:'🌱',title:'Garde plusieurs pistes',body:'Ne choisis pas trop tôt une seule voie. Compare plusieurs métiers et leurs conditions réelles.'}
 ],
 '16-18':[
  {icon:'📚',title:'Compare les parcours de formation',body:'Vérifie les programmes, les prérequis, la durée des études et les modalités d’admission sur les sites officiels.'},
  {icon:'🗺️',title:'Construis un plan A et un plan B',body:'Un projet solide laisse de la place aux imprévus. Prévois des alternatives qui t’intéressent vraiment.'},
  {icon:'💬',title:'Parle de tes questions',body:'Échange avec des enseignants, des conseillers d’orientation et des étudiants dans les filières envisagées.'},
  {icon:'⚖️',title:'Regarde les réalités du métier',body:'Renseigne-toi sur les activités quotidiennes, les contraintes, le contexte de travail et les évolutions possibles.'}
 ]
};
if(typeof document!=='undefined'){
 const wrap=document.querySelector('#advice-cards'),selector=document.querySelector('#age-selector');
 if(wrap&&selector){
  function render(age){
   wrap.replaceChildren();
   adviceByAge[age].forEach(item=>{
    const article=document.createElement('article');article.className='advice-step';
    const icon=document.createElement('span');icon.className='experience-icon';icon.textContent=item.icon;
    const text=document.createElement('div'),title=document.createElement('h3'),body=document.createElement('p');
    title.textContent=item.title;body.textContent=item.body;text.append(title,body);article.append(icon,text);wrap.append(article);
   });
   selector.querySelectorAll('[data-age]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.age===age)));
  }
  selector.addEventListener('click',e=>{
   const b=e.target.closest('[data-age]');if(b&&adviceByAge[b.dataset.age])render(b.dataset.age);
  });render('8-11');
 }
 const checks=document.querySelector('#advice-checklist');
 if(checks){
  let progress={};try{progress=JSON.parse(localStorage.getItem('moidemain-advice-v1')||'{}')||{}}catch{}
  checks.querySelectorAll('[data-check]').forEach(input=>{
   input.checked=progress[input.dataset.check]===true;
   input.addEventListener('change',()=>{
    progress[input.dataset.check]=input.checked;
    try{localStorage.setItem('moidemain-advice-v1',JSON.stringify(progress))}catch{}
    document.querySelector('#checklist-feedback').textContent=[...checks.querySelectorAll('[data-check]')].filter(x=>x.checked).length+'/3 petits pas réalisés. Bravo pour ta curiosité !';
   });
  });
 }
}
