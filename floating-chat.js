import { planLocalAction } from './fullta.js';

// Public catalogue pour que Fullta reconnaisse les métiers sur toutes les pages.
export const publicJobs = [
  {id:'designer',name:'Designer UX / UI',category:'Création'},
  {id:'dev',name:'Développeur web',category:'Technologie'},
  {id:'educ',name:'Éducateur spécialisé',category:'Lien humain'},
  {id:'paysage',name:'Paysagiste',category:'Nature & terrain'},
  {id:'data',name:'Analyste de données',category:'Technologie'},
  {id:'communication',name:'Chargé de communication',category:'Création'},
  {id:'infirmier',name:'Infirmier / infirmière',category:'Lien humain'},
  {id:'artisan',name:'Menuisier / menuisière',category:'Nature & terrain'}
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
    '<button class="fullta-launch" type="button" aria-expanded="false" aria-controls="fullta-panel">',
      '<img class="fullta-launch-icon" src="./assets/fullta-avatar.webp" width="42" height="42" alt="" aria-hidden="true">',
      '<span class="fullta-launch-copy"><strong>Parler à Fullta</strong><small>Votre copilote</small></span>',
    '</button>',
    '<section id="fullta-panel" class="fullta-panel" role="dialog" aria-modal="false" aria-labelledby="fullta-title" hidden>',
      '<div class="fullta-head"><img class="fullta-avatar" src="./assets/fullta-avatar.webp" width="42" height="42" alt="Fullta, le petit lapin pastel">',
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
      '<p class="fullta-footnote">Fullta ne choisit pas votre avenir à votre place. Ne partagez pas de données personnelles sensibles.</p>',
    '</section>'
  ].join('');
  document.body.append(widget);

  const launch=widget.querySelector('.fullta-launch');
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

  function addMessage(message,role='assistant') {
    const p=document.createElement('p');
    p.className='fullta-message'+(role==='user'?' user':'');
    p.textContent=String(message).slice(0,1500);
    log.append(p);
    log.scrollTop=log.scrollHeight;
    history.push({role,content:p.textContent});
    if(history.length>12)history.shift();
  }
  function setOpen(value,focus=true) {
    opened=Boolean(value);
    panel.hidden=!opened;
    launch.setAttribute('aria-expanded',String(opened));
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
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    const endpoint=document.querySelector('meta[name="fullta-endpoint"]')?.content || DEFAULT_ENDPOINT;
    try {
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
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
        } catch {
          useLocalMode();
          addMessage(action.message+' Le mode discussion libre nécessite l’activation du service IA.');
        }
      } else addMessage(action.message);
    } catch {
      addMessage('Je n’ai pas pu effectuer cette demande. Essayez une suggestion ou utilisez les boutons du site.');
    } finally {
      pending=false;
      send.disabled=false;
      form.removeAttribute('aria-busy');
      if(opened && !document.querySelector('#modal')?.open)input.focus();
    }
  }

  launch.addEventListener('click',()=>setOpen(!opened));
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
