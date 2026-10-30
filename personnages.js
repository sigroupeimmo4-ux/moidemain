// Atelier de personnages : tout reste sur cet appareil, aucun envoi réseau.
export const ANIMALS=[{id:'lapin',label:'Lapin',symbol:'🐰'},{id:'renard',label:'Renard',symbol:'🦊'},{id:'chat',label:'Chat',symbol:'🐱'},{id:'hibou',label:'Hibou',symbol:'🦉'}];
export const COLORS=[{id:'lavande',label:'Lavande',color:'#d9c6f5'},{id:'rose',label:'Rose',color:'#f7c6d9'},{id:'menthe',label:'Menthe',color:'#bce8d8'},{id:'ciel',label:'Bleu ciel',color:'#c5e2f9'}];
export const ACCESSORIES=[{id:'aucun',label:'Naturel',symbol:'✨'},{id:'noeud',label:'Nœud',symbol:'🎀'},{id:'lunettes',label:'Lunettes',symbol:'👓'},{id:'couronne',label:'Couronne',symbol:'👑'}];
export const OUTFITS=[{id:'peche',label:'Pêche',color:'#f3a6a8'},{id:'violet',label:'Violet',color:'#9d89ca'},{id:'menthe',label:'Menthe',color:'#89cbb9'},{id:'bleu',label:'Bleu',color:'#8fbde9'}];
export const defaults={animal:'lapin',color:'lavande',accessory:'aucun',outfit:'violet',name:'Mon compagnon'};
const key='moidemain-avatar-v1',find=(arr,id)=>arr.find(x=>x.id===id);
export function validateAvatar(raw){
 const out={...defaults};
 if(!raw||typeof raw!=='object')return out;
 for(const [f,arr] of [['animal',ANIMALS],['color',COLORS],['accessory',ACCESSORIES],['outfit',OUTFITS]])if(find(arr,raw[f]))out[f]=raw[f];
 if(typeof raw.name==='string')out.name=raw.name.trim().slice(0,24)||defaults.name;
 return out;
}
export function characterSVG(raw){
 const v=validateAvatar(raw),fur=find(COLORS,v.color).color,shirt=find(OUTFITS,v.outfit).color;
 const ears={
  lapin:'<path d="M83 111C53 63 53 15 75 15c21 0 37 53 42 86M171 107c5-50 22-96 43-91 25 5 7 62-20 99" fill="'+fur+'" stroke="#b5a0ca" stroke-width="4"/><path d="M82 33c-4 17 6 43 20 60M208 33c-2 16-12 42-24 59" stroke="#f19dbc" stroke-width="13" stroke-linecap="round"/>',
  renard:'<path d="m63 122 12-98 61 69 57-69 18 98" fill="'+fur+'" stroke="#b5a0ca" stroke-width="4"/><path d="m82 51 4 45 28-17M187 50l-7 44-22-16" fill="#f5a7c3"/>',
  chat:'<path d="m61 126 4-96 65 49 64-49 13 96" fill="'+fur+'" stroke="#b5a0ca" stroke-width="4"/><path d="m78 57 5 46 32-22M183 56l-6 46-30-20" fill="#f5a7c3"/>',
  hibou:'<path d="M62 112 78 66l25 22 37-37 37 37 26-22 17 49" fill="'+fur+'" stroke="#b5a0ca" stroke-width="4"/>'
 }[v.animal];
 const accessories={
  aucun:'',
  noeud:'<path d="M159 97q-42-30-35 4-34-12-28 17 17 11 33-2 13 13 32 6 6-19-2-25" fill="#f193bd" stroke="#ce6fa6" stroke-width="3"/><circle cx="129" cy="110" r="8" fill="#f8d2e9"/>',
  lunettes:'<g fill="none" stroke="#634b81" stroke-width="5"><circle cx="103" cy="161" r="26"/><circle cx="174" cy="161" r="26"/><path d="M129 155q9-10 18 0M77 151l-20-5M200 151l20-5"/></g>',
  couronne:'<path d="M99 106 91 65l27 19 17-36 19 36 28-20-7 41Z" fill="#ffe494" stroke="#d5ad60" stroke-width="4"/><circle cx="136" cy="96" r="6" fill="#f49fc4"/>'
 };
 const muzzle=v.animal==='hibou'?'<path d="m132 185 8 7 9-7-9 16Z" fill="#eea56f"/>':'<ellipse cx="140" cy="192" rx="25" ry="17" fill="#fff7fc"/><path d="M134 185q6-7 12 0l-6 6Z" fill="#ce82a4"/><path d="M140 190v7m0 0q-7 11-17 2m17-2q8 11 18 2" stroke="#785574" stroke-width="3" fill="none"/>';
 return ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 320" aria-hidden="true">',
 '<ellipse cx="140" cy="307" rx="79" ry="10" fill="#9c82a8" opacity=".16"/>',
 '<g stroke-linejoin="round">',ears,
 '<ellipse cx="141" cy="263" rx="81" ry="54" fill="',shirt,'" stroke="#8b78ab" stroke-width="4"/>',
 '<path d="M71 252q-27 7-22 31 4 23 35 23h21v-33M210 251q27 9 21 31-4 23-35 23h-21v-33" fill="',fur,'" stroke="#b5a0ca" stroke-width="4"/>',
 '<ellipse cx="139" cy="163" rx="100" ry="92" fill="',fur,'" stroke="#b5a0ca" stroke-width="4"/>',
 '<ellipse cx="78" cy="196" rx="17" ry="10" fill="#eea5c8" opacity=".65"/><ellipse cx="205" cy="196" rx="17" ry="10" fill="#eea5c8" opacity=".65"/>',
 '<ellipse cx="103" cy="161" rx="13" ry="18" fill="#3d344f"/><ellipse cx="176" cy="161" rx="13" ry="18" fill="#3d344f"/>',
 '<ellipse cx="107" cy="156" rx="5" ry="7" fill="white"/><ellipse cx="180" cy="156" rx="5" ry="7" fill="white"/>',
 muzzle,accessories[v.accessory],
 '<path d="M107 251q31 16 67 0" stroke="#fff" stroke-opacity=".65" stroke-width="5" fill="none"/>',
 '<path d="m137 252 4 10 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1Z" fill="#ffe7a0"/>',
 '</g></svg>'].join('');
}
if(typeof document!=='undefined'){
 const form=document.querySelector('#avatar-editor');
 if(form){
  let current=validateAvatar((()=>{try{return JSON.parse(localStorage.getItem(key))}catch{return null}})());
  const options=[['animal',ANIMALS,'animal-options'],['color',COLORS,'color-options'],['accessory',ACCESSORIES,'accessory-options'],['outfit',OUTFITS,'outfit-options']];
  const name=document.querySelector('#avatar-name'),feedback=document.querySelector('#avatar-feedback');
  function render(){
   for(const [field,items,id] of options){
    const container=document.getElementById(id);container.replaceChildren();
    for(const item of items){
     const button=document.createElement('button');button.type='button';button.dataset.field=field;button.dataset.value=item.id;
     button.setAttribute('aria-pressed',String(current[field]===item.id));
     const mark=document.createElement('span');mark.className=item.color?'avatar-swatch':'option-symbol';
     if(item.color)mark.style.background=item.color;else mark.textContent=item.symbol;
     button.append(mark,document.createTextNode(item.label));container.append(button);
    }
   }
   name.value=current.name===defaults.name?'':current.name;
   document.querySelector('#avatar-display-name').textContent=current.name;
   document.querySelector('#avatar-art').innerHTML=characterSVG(current);
   document.querySelector('#avatar-art').setAttribute('aria-label',find(ANIMALS,current.animal).label+' '+find(COLORS,current.color).label);
  }
  form.addEventListener('click',e=>{
   const b=e.target.closest('button[data-field]');if(!b)return;
   const items=options.find(o=>o[0]===b.dataset.field)?.[1]||[];
   if(!find(items,b.dataset.value))return;
   current[b.dataset.field]=b.dataset.value;feedback.textContent='';render();
  });
  name.addEventListener('input',()=>{current.name=name.value.trim().slice(0,24)||defaults.name;document.querySelector('#avatar-display-name').textContent=current.name;});
  form.addEventListener('submit',e=>{
   e.preventDefault();current.name=name.value.trim().slice(0,24)||defaults.name;
   try{localStorage.setItem(key,JSON.stringify(current));feedback.textContent='Ton personnage a bien été enregistré sur cet appareil !';}
   catch{feedback.textContent='La sauvegarde est bloquée par ton navigateur.';}
   render();
  });
  document.querySelector('#avatar-cloud').addEventListener('click',async()=>{
   const b=document.querySelector('#avatar-cloud');
   b.disabled=true;
   try{
    const {saveAvatar}=await import('./user-data.js');
    const value={...current,name:name.value.trim().slice(0,24)||defaults.name};
    if(!await saveAvatar(value))throw Error('Connexion nécessaire : ouvrez Mon espace pour vous connecter.');
    feedback.textContent='Ton personnage est sauvegardé dans Mon espace !';
   }catch(e){feedback.textContent=e.message||'Sauvegarde indisponible.';}
   finally{b.disabled=false;}
  });
  document.querySelector('#avatar-reset').addEventListener('click',()=>{
   current={...defaults};try{localStorage.removeItem(key)}catch{}
   feedback.textContent='Le personnage a été réinitialisé.';render();
  });
  render();
 }
}
