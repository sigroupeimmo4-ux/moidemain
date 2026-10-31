import { planLocalAction } from './fullta.js';
import {getSession,SUPABASE_PUBLISHABLE_KEY} from './auth-client.js';
import {extraFreeJobs,premiumPreviews} from './catalogue-extra.js';

// Public catalogue pour que Fullta reconnaisse les métiers sur toutes les pages.
export const publicJobs = [
  {id:'designer',name:'Designer UX / UI',category:'Création'},
  {id:'dev',name:'Développeur web',category:'Technologie'},
  {id:'educ',name:'Éducateur spécialisé',category:'Lien humain'},
  {id:'paysage',name:'Paysagiste',category:'Nature & terrain'},
  {id:'data',name:'Analyste de données',category:'Technologie'},
  {id:'communication',name:'Chargé de communication',category:'Création'},
  {id:'infirmier',name:'Infirmier / infirmière',category:'Lien humain'},
  {id:'artisan',name:'Menuisier / menuisière',category:'Nature & terrain'},
  ...extraFreeJobs,
  ...premiumPreviews
];

const CATEGORIES = ['Création', 'Technologie', 'Lien humain', 'Nature & terrain'];
const ACTIONS = new Set([
  'start_personality_quiz', 'start_job_quiz', 'open_job', 'add_favorite',
  'remove_favorite', 'show_favorites', 'go_home', 'filter_jobs', 'search_jobs'
]);
const PENDING_KEY = 'moidemain-fullta-pending';
const DEFAULT_ENDPOINT = 'https://sjhvaaaiwijhcykznfqn.supabase.co/functions/v1/fullta-chat';

export function sanitizeFulltaAction(raw, jobs = publicJobs) {
  if (!raw || typeof raw !== 'object' || !ACTIONS.has(raw.type)) return null;
  if (['open_job','start_job_quiz','add_favorite','remove_favorite'].includes(raw.type)) {
    return jobs.some(job => job.id === raw.jobId) ? {type:raw.type,jobId:raw.jobId} : null;
  }
  if (raw.type === 'filter_jobs') {
    return CATEGORIES.includes(raw.category) ? {type:raw.type,category:raw.category} : null;
  }
  if (raw.type === 'search_jobs') {
    return typeof raw.query === 'string' && raw.query.length <= 100
      ? {type:raw.type,query:raw.query.trim()} : null;
  }
  return {type:raw.type};
}

export function mountFullta({jobs=publicJobs,onAction=null}={}) {
  if (document.querySelector('.fullta-widget')) return null;
  const widget=document.createElement('aside');
  widget.className='fullta-widget';
  widget.setAttribute('aria-label','Assistant Fullta');
  widget.innerHTML=[
    '<button class="fullta-launch" type="button" aria-label="Ouvrir le chat avec Fullta" aria-expanded="false" aria-controls="fullta-panel">',
      '<span class="fullta-mascot-art" aria-hidden="true">',
        '<img class="fullta-launch-icon" src="./assets/fullta-detailed.png" width="150" height="188" alt="">',
        '<svg class="fullta-blink-eyes" viewBox="0 0 150 188" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">',
          '<defs>',
            '<linearGradient id="fullta-eyelid-fur" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c7aede"/><stop offset="58%" stop-color="#e9d9ef"/><stop offset="100%" stop-color="#f4e3ef"/></linearGradient>',
            '<radialGradient id="fullta-eyelid-feather"><stop offset="0%" stop-color="white"/><stop offset="65%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient>',
            '<mask id="fullta-eyelid-mask" maskUnits="userSpaceOnUse" x="48" y="63" width="43" height="43"><ellipse cx="69" cy="83" rx="17.5" ry="18.3" fill="url(#fullta-eyelid-feather)"/></mask>',
          '</defs>',
          '<rect x="48" y="63" width="43" height="43" fill="url(#fullta-eyelid-fur)" mask="url(#fullta-eyelid-mask)"/>',
          '<path d="M56 83 Q68 70 83 82" fill="none" stroke="#4b3750" stroke-width="2.4" stroke-linecap="round"/>',
          '<path d="M57 82 l-3 -4 M61 77 l-1 -3 M81 81 l4 -3" fill="none" stroke="#513953" stroke-width="1.2" stroke-linecap="round"/>',
        '</svg>',
      '</span>',
      '<span class="fullta-sparkle fullta-sparkle-one" aria-hidden="true">✦</span>',
      '<span class="fullta-sparkle fullta-sparkle-two" aria-hidden="true">✧</span>',
      '<span class="fullta-sparkle fullta-sparkle-three" aria-hidden="true">✦</span>',
      '<span class="fullta-hello" aria-hidden="true">👋 Coucou !</span>',
      '<span class="fullta-launch-copy sr-only">Parler à Fullta</span>',
    '</button>',
    '<section id="fullta-panel" class="fullta-panel" role="dialog" aria-modal="false" aria-labelledby="fullta-title" hidden>',
      '<div class="fullta-head"><img class="fullta-avatar" src="./assets/fullta-detailed-avatar.png" width="42" height="42" alt="Fullta, le petit lapin pastel en 3D">',
        '<div class="fullta-head-copy"><strong id="fullta-title">Fullta</strong><small>Votre copilote dans Moi Demain</small></div>',
        '<button type="button" class="fullta-close" aria-label="Fermer le chat">×</button>',
      '</div>',
      '<p class="fullta-status" role="status"><span class="fullta-dot" aria-hidden="true"></span><span class="fullta-mode">Actions disponibles · IA à activer</span></p>',
      '<div class="fullta-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation avec Fullta"></div>',
      '<div class="fullta-suggestions" aria-label="Suggestions">',
        '<button type="button" data-prompt="Lance le quiz de personnalité">Mon profil</button>',
        '<button type="button" data-prompt="Montre les métiers technologie">Métiers tech</button>',
        '<button type="button" data-prompt="Montre mes favoris">Mes favoris</button>',
      '</div>',
      '<form class="fullta-form"><label class="sr-only" for="fullta-input">Votre message à Fullta</label>',
        '<input id="fullta-input" name="message" maxlength="400" placeholder="Écrivez votre demande…" autocomplete="off" required>',
        '<button type="submit" aria-label="Envoyer le message">➜</button>',
      '</form>',
      '<label class="fullta-ai-consent"><input type="checkbox" id="fullta-ai-allowed"> J’autorise le traitement de mes messages libres par le service IA externe, lorsque celui-ci est activé.</label>',
      '<p class="fullta-footnote">Fullta ne choisit pas votre avenir à votre place. Ne partagez pas de données personnelles sensibles.</p>',
    '</section>'
  ].join('');
  document.body.append(widget);

  const launch=widget.querySelector('.fullta-launch');
  // Chargement différé : le chat reste utilisable si WebGL est indisponible.
  import('./fullta-3d.js?v=webgl-v3').then(({mountRabbit})=>mountRabbit(launch)).catch(()=>{});
  const panel=widget.querySelector('.fullta-panel');
  const input=widget.querySelector('#fullta-input');
  const log=widget.querySelector('.fullta-messages');
  const form=widget.querySelector('.fullta-form');
  const mode=widget.querySelector('.fullta-mode');
  const send=form.querySelector('button');
  const history=[];
  let pending=false;
  let aiUnavailable=false;
  let opened=false;
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let blinkTimer=null;
  let blinkEndTimer=null;
  let reactionTimer=null;
  let greetingTimer=null;
  let firstBlink=true;
  const canAnimate=()=>!motionPreference.matches && !document.hidden;

  // L'illustration 3D reste le seul bouton : yeux et réactions sont décoratifs.
  function blink(){
    if(!canAnimate() || launch.classList.contains('is-blinking'))return;
    launch.classList.add('is-blinking');
    clearTimeout(blinkEndTimer);
    blinkEndTimer=setTimeout(()=>launch.classList.remove('is-blinking'),650);
  }
  function scheduleBlink(){
    clearTimeout(blinkTimer);
    if(!canAnimate())return;
    const delay=firstBlink?950:2200+Math.round(Math.random()*2200);
    firstBlink=false;
    blinkTimer=setTimeout(()=>{
      blink();
      scheduleBlink();
    },delay);
  }
  function react(){
    if(!canAnimate())return;
    launch.classList.remove('is-reacting');
    void launch.offsetWidth;
    launch.classList.add('is-reacting');
    clearTimeout(reactionTimer);
    reactionTimer=setTimeout(()=>launch.classList.remove('is-reacting'),1050);
  }
  function onVisibilityChange(){
    if(document.hidden){
      clearTimeout(blinkTimer);
      launch.classList.remove('is-blinking','is-reacting');
    }else scheduleBlink();
  }
  document.addEventListener('visibilitychange',onVisibilityChange);
  motionPreference.addEventListener('change',onVisibilityChange);
  window.addEventListener('pagehide',()=>{
    clearTimeout(blinkTimer);
    clearTimeout(blinkEndTimer);
    clearTimeout(reactionTimer);
    clearTimeout(greetingTimer);
  },{once:true});
  scheduleBlink();
  if(canAnimate()){
    launch.classList.add('is-greeting');
    greetingTimer=setTimeout(()=>launch.classList.remove('is-greeting'),4200);
  }

  function addMessage(message,role='assistant') {
    const p=document.createElement('p');
    p.className='fullta-message'+(role==='user'?' user':'');
    p.textContent=String(message).slice(0,1500);
    log.append(p);
    log.scrollTop=log.scrollHeight;
    if(role==='assistant')react();
    history.push({role,content:p.textContent});
    if(history.length>12)history.shift();
  }
  function setOpen(value,focus=true) {
    opened=Boolean(value);
    panel.hidden=!opened;
    launch.classList.toggle('is-chatting',opened);
    if(opened){blink();react();launch.classList.remove('is-greeting');}
    launch.setAttribute('aria-expanded',String(opened));
    launch.setAttribute('aria-label',opened?'Fermer le chat avec Fullta':'Ouvrir le chat avec Fullta');
    if (focus) (opened?input:launch).focus();
  }
  function useLocalMode() {
    aiUnavailable=true;
    mode.textContent='Commandes locales actives · IA non configurée';
  }
  function execute(action) {
    const safe=sanitizeFulltaAction(action,jobs);
    if(!safe)return 'Cette action n’est pas autorisée dans Moi Demain.';
    if(typeof onAction==='function') {
      const result=onAction(safe);
      if(document.querySelector('#modal')?.open)setOpen(false,false);
      return result;
    }
    if(safe.type==='go_home' && (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html'))) {
      return 'Vous êtes déjà sur la page d’accueil.';
    }
    // Ne transporter que des actions validées, jamais un prompt ni une clé API.
    try { sessionStorage.setItem(PENDING_KEY,JSON.stringify(safe)); }
    catch { return 'Ouvrez la page « Explorer les métiers » pour continuer.'; }
    location.assign('./explorer.html?fullta=1');
    return 'J’ouvre l’espace d’exploration pour effectuer votre demande.';
  }

  async function askAI(message,context) {
    if(!widget.querySelector('#fullta-ai-allowed').checked)throw new Error('Activez l’option IA pour autoriser l’envoi de messages à un service externe.');
    const session=await getSession();
    if(!session)throw new Error('La discussion IA nécessite un compte connecté. Les actions locales restent gratuites.');
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    const endpoint=document.querySelector('meta[name="fullta-endpoint"]')?.content || DEFAULT_ENDPOINT;
    try {
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token},
        body:JSON.stringify({message,history:context}),
        signal:controller.signal
      });
      if(!response.ok)throw new Error('Service indisponible');
      const result=await response.json();
      if(!result || typeof result.reply!=='string' || result.reply.length>1500)throw new Error('Réponse incorrecte');
      mode.textContent='Discussion IA et actions disponibles';
      return result;
    } finally {clearTimeout(timeout);}
  }

  async function sendMessage(message) {
    const value=String(message).trim().slice(0,400);
    if(!value || pending)return;
    const context=history.slice(-8);
    addMessage(value,'user');
    input.value='';
    pending=true;
    launch.classList.add('is-thinking');
    send.disabled=true;
    form.setAttribute('aria-busy','true');
    try {
      const action=planLocalAction(value,jobs);
      if(action.type!=='clarify') {
        addMessage(execute(action));
      } else if (!aiUnavailable) {
        try {
          const answer=await askAI(value,context);
          const safe=sanitizeFulltaAction(answer.action,jobs);
          if(safe) {
            const outcome=execute(safe);
            addMessage(outcome);
          } else {
            addMessage(answer.reply);
          }
        } catch (error) {
          if(/Service indisponible|Service not configured|Failed to fetch|Le modèle IA/.test(error.message))useLocalMode();
          addMessage(action.message+' '+(error.message||'Service IA indisponible.'));
        }
      } else addMessage(action.message);
    } catch {
      addMessage('Je n’ai pas pu effectuer cette demande. Essayez une suggestion ou utilisez les boutons du site.');
    } finally {
      pending=false;
      launch.classList.remove('is-thinking');
      send.disabled=false;
      form.removeAttribute('aria-busy');
      if(opened && !document.querySelector('#modal')?.open)input.focus();
    }
  }

  launch.addEventListener('click',()=>setOpen(!opened));
  launch.addEventListener('pointerenter',event=>{
    if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
    launch.classList.add('is-curious','is-greeting');
    blink();
  });
  launch.addEventListener('pointerleave',()=>{
    launch.classList.remove('is-curious','is-greeting');
    launch.style.removeProperty('--fullta-tilt');
  });
  launch.addEventListener('pointermove',event=>{
    if(!canAnimate()||event.pointerType!=='mouse')return;
    const rect=launch.getBoundingClientRect();
    const offset=(event.clientX-rect.left)/rect.width-0.5;
    launch.style.setProperty('--fullta-tilt',(offset*8).toFixed(1)+'deg');
  });
  launch.addEventListener('focus',blink);
  widget.querySelector('.fullta-close').addEventListener('click',()=>setOpen(false));
  widget.addEventListener('keydown',event=>{
    if(event.key==='Escape' && opened){event.preventDefault();setOpen(false);}
  });
  form.addEventListener('submit',event=>{event.preventDefault();void sendMessage(input.value);});
  widget.querySelectorAll('[data-prompt]').forEach(button=>{
    button.addEventListener('click',()=>void sendMessage(button.dataset.prompt));
  });
  addMessage('Coucou ! 🐰 Je suis Fullta, ton petit compagnon pour explorer les métiers. Je peux lancer un quiz, ouvrir une fiche ou garder tes favoris. Par quoi commence-t-on ?');

  if(typeof onAction==='function') {
    let stored=null;
    try {
      stored=JSON.parse(sessionStorage.getItem(PENDING_KEY)||'null');
      sessionStorage.removeItem(PENDING_KEY);
    } catch { try{sessionStorage.removeItem(PENDING_KEY);}catch{} }
    const safe=sanitizeFulltaAction(stored,jobs);
    if(safe) {
      addMessage(execute(safe));
    }
    if(new URLSearchParams(location.search).get('fullta')==='1' && !document.querySelector('#modal')?.open) {
      setOpen(true,false);
    }
  }
  return {open:()=>setOpen(true),close:()=>setOpen(false,false),sendMessage};
}
