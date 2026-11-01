import {QUIZZES,getQuiz,scoreQuiz} from './quiz-personnalites-data.js';
import {addHistory} from './user-data.js?v=fix20261101';

const $=id=>document.getElementById(id);
const catalog=$('quiz-catalogue');
let active=null;
let step=0;
let answers=[];
let lastResult=null;
const node=(tag,text,cls)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el;
};
function scrollToSection(el){el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function populateCatalog(){
 for(const quiz of QUIZZES){
  const card=node('article',undefined,'quiz-choice');
  card.dataset.accent=quiz.accent;
  const badge=node('span',quiz.icon,'quiz-choice-icon');
  const header=node('div',undefined,'quiz-choice-header');
  header.append(badge,node('small',quiz.questions.length+' questions · '+quiz.duration));
  const title=node('h3',quiz.title),desc=node('p',quiz.short);
  const button=node('button','Commencer ce quiz →');
  button.type='button';
  button.addEventListener('click',()=>start(quiz.id));
  card.append(header,title,desc,button);
  catalog.append(card);
 }
}
function navigate(id){const url=new URL(location.href);url.searchParams.delete('test');if(id)url.searchParams.set('test',id);history.replaceState(null,'',url);}
function start(id,updateUrl=true){
 const quiz=getQuiz(id);if(!quiz)return;
 active=quiz;step=0;answers=Array(quiz.questions.length).fill(null);lastResult=null;
 $('quiz-selection-title').textContent='Choisis le quiz qui te plaît';
 $('quiz-play').hidden=false;
 $('quiz-result').hidden=true;
 $('quiz-save-message').replaceChildren();
 if(updateUrl)navigate(id);
 renderQuestion();scrollToSection($('quiz-play'));
}
function selectedOption(){
 const question=active.questions[step];
 return question.options.find(o=>o.label===answers[step])||null;
}
function renderQuestion(){
 if(!active)return;
 const question=active.questions[step];
 const completed=step+1;
 const percent=Math.round((step/active.questions.length)*100);
 $('quiz-count').textContent='Question '+completed+' sur '+active.questions.length;
 $('quiz-progress').setAttribute('aria-valuenow',String(Math.round(step/active.questions.length*100)));
 $('quiz-progress-fill').style.width=(step/active.questions.length*100)+'%';
 $('quiz-category').textContent=active.label+' · Gratuit';
 $('quiz-title').textContent=active.title;
 $('quiz-instructions').textContent=active.intro;
 $('quiz-question').textContent=question.prompt;
 const options=$('quiz-options');options.replaceChildren();
 question.options.forEach((choice,index)=>{
  const label=node('label',undefined,'quiz-option');
  const radio=document.createElement('input');
  radio.type='radio';
  radio.name='quiz-answer';
  radio.value=String(index);
  radio.checked=answers[step]===choice.label;
  radio.required=true;
  radio.addEventListener('change',()=>{
   answers[step]=choice.label;
   $('quiz-next').disabled=false;
  });
  label.append(radio,node('span',choice.label,'quiz-option-text'));
  options.append(label);
 });
 $('quiz-back').disabled=step===0;
 $('quiz-next').textContent=step===active.questions.length-1?'Voir mon résultat ✨':'Continuer →';
 $('quiz-next').disabled=!selectedOption();
 $('quiz-question').focus({preventScroll:true});
}
function finish(){
 const result=scoreQuiz(active.id,answers);
 if(!result)return;
 lastResult=result;
 $('quiz-play').hidden=true;
 const quiz=active;
 $('result-title').textContent=result.isTie?'Deux envies ressortent de tes réponses !':'Ta piste du moment : '+result.main.title;
 $('result-lead').textContent='Dans ce quiz « '+quiz.title+' », tu as surtout choisi des activités liées à '+result.main.title.toLowerCase()+'. Voici d’autres idées à tester, sans te limiter.';
 const traits=$('result-traits');traits.replaceChildren();
 const selectedTraits=[result.primary,...(result.secondary!==result.primary?[result.secondary]:[])];
 selectedTraits.forEach((id,index)=>{
  const value=result.primary===id?result.main:result.complement;
  const card=node('article',undefined,'quiz-trait');
  card.append(node('span',value.icon,'trait-icon'),node('strong',index===0?'Une envie qui ressort':'Une autre piste'),node('h3',value.title),node('p',value.summary),node('p','À essayer : '+value.action));
  traits.append(card);
 });
 $('result-note').textContent=result.summary+' Les goûts de vidéos ou de films ne suffisent pas à déterminer une orientation.';
 const careers=$('result-careers');careers.replaceChildren();
 result.careers.forEach(career=>{
  const link=node('a',undefined,'quiz-career');
  link.href='./explorer.html?metier='+encodeURIComponent(career.id);
  link.append(node('span',career.emoji),node('strong',career.name+' →'));
  careers.append(link);
 });
 $('quiz-save').disabled=false;
 $('quiz-save').textContent='Enregistrer le résumé dans Mon espace';
 $('quiz-save-message').replaceChildren();
 $('quiz-result').hidden=false;
 navigate(quiz.id);
 scrollToSection($('quiz-result'));
 $('result-title').focus({preventScroll:true});
}
$('quiz-form').addEventListener('submit',event=>{
 event.preventDefault();
 if(!selectedOption())return;
 if(step<active.questions.length-1){step++;renderQuestion();scrollToSection($('quiz-play'));}
 else finish();
});
$('quiz-back').addEventListener('click',()=>{if(step>0){step--;renderQuestion();}});
$('quiz-exit').addEventListener('click',()=>{
 active=null;answers=[];lastResult=null;
 $('quiz-play').hidden=true;$('quiz-result').hidden=true;
 navigate(null);scrollToSection($('quiz-selection-title'));
});
$('quiz-restart').addEventListener('click',()=>{if(active)start(active.id);});
$('quiz-save').addEventListener('click',async()=>{
 if(!active||!lastResult)return;
 const button=$('quiz-save'),msg=$('quiz-save-message');
 button.disabled=true;
 msg.textContent='Enregistrement en cours…';
 try{
  const summary=active.title+' : '+lastResult.main.title+(lastResult.isTie?' et '+lastResult.complement.title:'');
  const saved=await addHistory('personality',null,summary.slice(0,160),null);
  if(!saved){
   msg.replaceChildren(document.createTextNode('Pour conserver un résumé, il faut un compte adulte connecté. '));
   const link=node('a','Se connecter →');link.href='./auth.html?next=mon-espace.html';msg.append(link);
   button.disabled=false;
   return;
  }
  msg.replaceChildren(document.createTextNode('Ton résumé général est enregistré dans Mon espace. Les réponses détaillées ne sont pas enregistrées.'));
  button.textContent='Résumé enregistré ✓';
 }catch{
  msg.textContent='Enregistrement indisponible. Aucun détail de tes réponses n’a été envoyé. Réessaie plus tard.';
  button.disabled=false;
 }
});
populateCatalog();
const requested=new URLSearchParams(location.search).get('test');
if(getQuiz(requested))start(requested,false);
