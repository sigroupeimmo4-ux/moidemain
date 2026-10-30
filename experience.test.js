import test from 'node:test';
import assert from 'node:assert/strict';
import {extraFreeJobs,premiumPreviews} from './catalogue-extra.js';
import {ANIMALS,COLORS,validateAvatar,characterSVG} from './personnages.js';
import {adviceByAge} from './conseils.js';
import {publicJobs,sanitizeFulltaAction} from './floating-chat.js';

test('12 métiers gratuits supplémentaires ont des fiches et quiz complets',()=>{
 assert.equal(extraFreeJobs.length,12);
 for(const job of extraFreeJobs){
  assert.ok(job.id&&job.name&&job.detail&&job.training&&job.category);
  assert.equal(job.tasks.length,3);
  assert.equal(job.premium,undefined);
 }
});
test('16 aperçus premium sans aucun contenu payant côté navigateur',()=>{
 assert.equal(premiumPreviews.length,16);
 for(const job of premiumPreviews){
  assert.equal(job.premium,true);
  assert.equal(job.detail,undefined);
  assert.equal(job.training,undefined);
  assert.equal(job.tasks,undefined);
 }
});
test('36 métiers distincts reconnus par Fullta',()=>{
 assert.equal(publicJobs.length,36);
 assert.equal(new Set(publicJobs.map(x=>x.id)).size,36);
 assert.deepEqual(sanitizeFulltaAction({type:'open_job',jobId:'meteorologue'},publicJobs),{type:'open_job',jobId:'meteorologue'});
 assert.equal(sanitizeFulltaAction({type:'open_job',jobId:'fake'},publicJobs),null);
});
test('4 animaux et couleurs validées contre les entrées non reconnues',()=>{
 assert.equal(ANIMALS.length,4);
 assert.equal(COLORS.length,4);
 const safe=validateAvatar({animal:'<img onerror=alert(1)>',color:'red',accessory:'unknown',name:'F'.repeat(100)});
 assert.equal(safe.animal,'lapin');
 assert.equal(safe.color,'lavande');
 assert.ok(safe.name.length<=24);
 for(const species of ANIMALS){
  const svg=characterSVG({animal:species.id});
  assert.match(svg,/^<svg/);
  assert.match(svg,/<\/svg>$/);
  assert.doesNotMatch(svg,/script|onerror=/);
 }
});
test('conseils adaptés à chaque tranche d’âge',()=>{
 assert.deepEqual(Object.keys(adviceByAge),['8-11','12-15','16-18']);
 for(const value of Object.values(adviceByAge)){
  assert.equal(value.length,4);
  assert.ok(value.every(x=>x.title&&x.body&&x.icon));
 }
});
