import test from 'node:test';
import assert from 'node:assert/strict';
import {planLocalAction} from './fullta.js';
const jobs=[{id:'dev',name:'Développeur web'},{id:'paysage',name:'Paysagiste'}];
test('Fullta prépare des actions précises pour les quiz, fiches et filtres',()=>{
assert.deepEqual(planLocalAction('Lance le quiz de personnalité',jobs),{type:'start_personality_quiz'});
assert.deepEqual(planLocalAction('Lance le quiz développeur web',jobs),{type:'start_job_quiz',jobId:'dev'});
assert.deepEqual(planLocalAction('Ouvre paysagiste',jobs),{type:'open_job',jobId:'paysage'});
assert.deepEqual(planLocalAction('Montre les métiers technologie',jobs),{type:'filter_jobs',category:'Technologie'});
});
test('Fullta distingue ajout, retrait et consultation des favoris',()=>{
assert.deepEqual(planLocalAction('Ajoute développeur web aux favoris',jobs),{type:'add_favorite',jobId:'dev'});
assert.deepEqual(planLocalAction('Retire paysagiste des favoris',jobs),{type:'remove_favorite',jobId:'paysage'});
assert.deepEqual(planLocalAction('Montre mes favoris',jobs),{type:'show_favorites'});
});
test('Fullta demande une précision pour les demandes ambiguës ou non supportées',()=>{
for(const message of ['Ajoute aux favoris','Lance un quiz','Publie le site','<script>alert(1)</script>']) assert.equal(planLocalAction(message,jobs).type,'clarify');
});
