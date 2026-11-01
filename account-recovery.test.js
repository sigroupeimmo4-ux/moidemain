import test from 'node:test';
import assert from 'node:assert/strict';
import {recoverPassword,verifyRecoveryToken,updateRecoveredPassword,revokeRecoveryToken} from './auth-client.js';
import {jobs} from './catalogue.js';

test('Le catalogue partagé conserve les 20 fiches gratuites et ne divulgue pas les détails Premium',()=>{
 assert.equal(jobs.length,36);assert.equal(new Set(jobs.map(j=>j.id)).size,36);
 for(const job of jobs){
  if(job.premium){assert.equal(job.detail,undefined);assert.equal(job.training,undefined);assert.equal(job.tasks,undefined);}
  else{assert.ok(job.detail&&job.training);assert.equal(job.tasks.length,3);}
 }
});
test('La récupération conserve le sous-chemin GitHub Pages dans son URL de retour',async t=>{
 const previous=globalThis.location;globalThis.location=new URL('https://example.test/moidemain/auth.html?mode=login');
 t.after(()=>{if(previous===undefined)delete globalThis.location;else globalThis.location=previous;});
 let request;
 t.mock.method(globalThis,'fetch',async(url,options)=>{request={url,options};return new Response('{}');});
 await recoverPassword('adult@example.test');
 const url=new URL(request.url);
 assert.equal(url.pathname,'/auth/v1/recover');
 assert.equal(url.searchParams.get('redirect_to'),'https://example.test/moidemain/reset-password.html');
 assert.deepEqual(JSON.parse(request.options.body),{email:'adult@example.test'});
});
test('La modification exige le jeton vérifié et transmet seulement le nouveau mot de passe',async t=>{
 const requests=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{requests.push({url,options});return new Response('{"id":"test-user"}');});
 await verifyRecoveryToken('test-token');
 await updateRecoveredPassword('test-token','new-password-123');
 await revokeRecoveryToken('test-token');
 assert.equal(requests[0].options.method,'GET');
 assert.equal(requests[1].options.method,'PUT');
 assert.equal(requests[1].options.headers.Authorization,'Bearer test-token');
 assert.deepEqual(JSON.parse(requests[1].options.body),{password:'new-password-123'});
 assert.ok(requests[2].url.endsWith('/logout?scope=local'));
});
test('Un lien expiré ne peut pas être considéré comme vérifié',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response('{"message":"Expired"}',{status:401}));
 await assert.rejects(verifyRecoveryToken('expired-token'),/Expired/);
});
