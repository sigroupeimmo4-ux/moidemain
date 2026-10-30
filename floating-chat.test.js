import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFulltaAction, publicJobs } from './floating-chat.js';
import { planLocalAction } from './fullta.js';

test('Fullta accepte des actions explicites et une catégorie connue',()=>{
  assert.deepEqual(sanitizeFulltaAction({type:'open_job',jobId:'dev'}),{type:'open_job',jobId:'dev'});
  assert.deepEqual(sanitizeFulltaAction({type:'filter_jobs',category:'Technologie'}),{type:'filter_jobs',category:'Technologie'});
  assert.deepEqual(sanitizeFulltaAction({type:'start_personality_quiz'}),{type:'start_personality_quiz'});
});
test('Fullta refuse les actions et paramètres inconnus',()=>{
  assert.equal(sanitizeFulltaAction({type:'run_script',code:'alert(1)'}),null);
  assert.equal(sanitizeFulltaAction({type:'open_job',jobId:'introuvable'}),null);
  assert.equal(sanitizeFulltaAction({type:'filter_jobs',category:'Privé'}),null);
  assert.equal(sanitizeFulltaAction({type:'search_jobs',query:'x'.repeat(101)}),null);
  assert.equal(sanitizeFulltaAction(null),null);
});
test('Le catalogue public correspond aux commandes disponibles',()=>{
  assert.equal(publicJobs.length,8);
  assert.deepEqual(planLocalAction('ajoute paysagiste aux favoris',publicJobs),{type:'add_favorite',jobId:'paysage'});
  assert.deepEqual(planLocalAction('Lance le quiz développeur web',publicJobs),{type:'start_job_quiz',jobId:'dev'});
  assert.deepEqual(planLocalAction('Montre les métiers technologie',publicJobs),{type:'filter_jobs',category:'Technologie'});
  assert.deepEqual(planLocalAction('Montre mes favoris',publicJobs),{type:'show_favorites'});
});
