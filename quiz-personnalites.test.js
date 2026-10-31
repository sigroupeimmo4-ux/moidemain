import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {QUIZZES,TRAITS,getQuiz,scoreQuiz} from './quiz-personnalites-data.js';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');

test('Quatre nouveaux quiz indépendants dont un sur les vidéos et films',()=>{
 assert.equal(QUIZZES.length,4);
 assert.deepEqual(QUIZZES.map(q=>q.id),['ecrans','moi','passions','apprendre']);
 assert.equal(new Set(QUIZZES.map(q=>q.id)).size,4);
 assert.equal(getQuiz('ecrans').questions.length,8);
 assert.equal(getQuiz('moi').questions.length,7);
 assert.equal(getQuiz('apprendre').questions.length,7);
 assert.equal(getQuiz('passions').questions.length,7);
 for(const word of ['YouTube','TikTok','Shorts','film'])assert.ok(JSON.stringify(getQuiz('ecrans')).toLowerCase().includes(word.toLowerCase()),word);
});
test('Chaque quiz est lisible, sans réponse objectivement bonne ou mauvaise',()=>{
 for(const quiz of QUIZZES){
  assert.ok(quiz.title&&quiz.short&&quiz.intro&&quiz.questions.length>=6);
  for(const question of quiz.questions){
   assert.ok(question.prompt.length>15);
   assert.equal(question.options.length,4);
   assert.equal(new Set(question.options.map(o=>o.label)).size,4);
   for(const o of question.options){
    assert.ok(o.label.length>=8);
    assert.ok(o.trait in TRAITS);
   }
  }
 }
});
test('Le score propose des pistes et refuse les réponses absentes, inventées ou incomplètes',()=>{
 for(const quiz of QUIZZES){
  const responses=quiz.questions.map(q=>q.options[0].label);
  const result=scoreQuiz(quiz.id,responses);
  assert.ok(result);
  assert.equal(Object.values(result.scores).reduce((a,b)=>a+b,0),quiz.questions.length);
  assert.ok(result.main.summary&&result.main.action&&result.complement.summary);
  assert.ok(result.careers.length>=3);
  for(const item of result.careers)assert.match(item.id,/^[a-z_]+$/);
  assert.equal(scoreQuiz(quiz.id,responses.slice(1)),null);
  assert.equal(scoreQuiz(quiz.id,["Inconnu",...responses.slice(1)]),null);
  assert.equal(scoreQuiz(quiz.id,{}),null);
 }
 assert.equal(scoreQuiz('inconnu',[]),null);
});
test('Le quiz vidéo est directement visible sur l’accueil, les autres parcours sont accessibles',()=>{
 const home=read('index.html'),html=read('quiz-personnalites.html');
 assert.match(home,/quiz-home-spotlight/);
 assert.match(home,/quiz-personnalites\.html\?test=ecrans/);
 for(const id of QUIZZES.map(q=>q.id)){
  assert.ok(home.includes('test='+id)||id==='ecrans');
  assert.ok(html.includes('quiz-catalogue'));
 }
 for(const file of ['index.html','explorer.html','conseils.html','personnages.html','mon-espace.html'])
  assert.ok(read(file).includes('quiz-personnalites.html'),file);
});
test('Les réponses des médias restent uniquement en mémoire et le résumé est enregistré sur action explicite',()=>{
 const ui=read('quiz-personnalites.js'),page=read('quiz-personnalites.html');
 assert.ok(ui.includes("$('quiz-save').addEventListener('click',async()=>"));
 assert.match(ui,/addHistory\('personality'/);
 assert.ok(!ui.includes('localStorage'));
 assert.ok(!ui.includes('getYouTubeHistory'));
 assert.ok(!ui.includes('getTikTokHistory'));
 assert.ok(!ui.includes('JSON.stringify(answers)'));
 assert.ok(page.includes('sans donner ton pseudo')&&page.includes('ne sont pas envoyées au serveur'));
 assert.ok(!page.includes('connecter tes réseaux sociaux'));
});
