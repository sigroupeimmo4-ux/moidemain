// Replace this local planner with an API adapter later. Keep the action executor
// in the browser: the planner returns structured, allowlisted actions only.
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function planLocalAction(message, jobs) {
  const text = normalize(message).trim();
  const job = jobs.find(j => text.includes(normalize(j.name)) || text.includes(j.id) || normalize(j.name).split(/[ /]+/).some(word => word.length >= 5 && text.includes(word)));
  const remove = /retir|supprim|enlev/.test(text);
  if (/favori/.test(text) && (remove || /ajout|gard|sauv|enregistr/.test(text))) {
    return job ? {type: remove ? 'remove_favorite' : 'add_favorite', jobId: job.id} : {type:'clarify', message:'Quel métier voulez-vous ajouter ou retirer ? Par exemple : « Ajoute développeur web aux favoris ».'};
  }
  if (/quiz|test/.test(text)) {
    if (job) return {type:'start_job_quiz', jobId:job.id};
    if (/personnal|profil|orientation|general|ma voie/.test(text)) return {type:'start_personality_quiz'};
    return {type:'clarify', message:'Vous préférez le quiz de personnalité ou le mini-quiz d’un métier ? Précisez par exemple « Lance le quiz développeur web ».'};
  }
  if (/favori/.test(text)) return {type:'show_favorites'};
  if (/accueil/.test(text)) return {type:'go_home'};
  if (job) return {type:'open_job', jobId:job.id};
  const category = ['Création','Technologie','Lien humain','Nature & terrain'].find(c => text.includes(normalize(c))) || (/creati|dessin|design/.test(text)?'Création':/informati|techn|cod|numerique/.test(text)?'Technologie':/aid|social|humain|soin/.test(text)?'Lien humain':/nature|dehors|jardin|manuel/.test(text)?'Nature & terrain':null);
  if (category) return {type:'filter_jobs',category};
  if (/cherch|trouv|metier|explor|montre/.test(text)) {
    const query=text.replace(/^(recherche|cherche|trouve|montre)(-moi)?\s*/,'').replace(/^(les|des|un|une)\s+/,'').replace(/^metiers?\s*/,'').trim();
    return {type:'search_jobs',query: /^(tous|tout|explorer|explore|voir)?$/.test(query)?'':query};
  }
  return {type:'clarify',message:'Je peux agir dans moidemain : lancer votre quiz, ouvrir une fiche, filtrer les métiers ou gérer vos favoris. Essayez une des actions ci-dessous.'};
}
