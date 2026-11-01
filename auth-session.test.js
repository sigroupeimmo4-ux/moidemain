import test from 'node:test';
import assert from 'node:assert/strict';
import {getSession,getUser} from './auth-client.js?v=fix20261101';
function setup(t){
 const previous=globalThis.sessionStorage,data=new Map();
 globalThis.sessionStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 t.after(()=>{if(previous===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=previous;});
 const session={access_token:'old-test',refresh_token:'test-refresh',expires_at:0,user:{id:'test-user'}};
 data.set('moidemain-auth-v1',JSON.stringify(session));return data;
}
test('Les lectures simultanées de session partagent un seul rafraîchissement',async t=>{
 setup(t);let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{calls++;await new Promise(r=>setTimeout(r,10));return new Response(JSON.stringify({access_token:'new-test',refresh_token:'new-refresh',expires_in:3600,user:{id:'test-user'}}));});
 const sessions=await Promise.all([getSession(),getSession(),getSession()]);
 assert.equal(calls,1);assert.ok(sessions.every(s=>s.access_token==='new-test'));
});
test('Une panne réseau ne supprime pas les identifiants de session',async t=>{
 const data=setup(t);t.mock.method(globalThis,'fetch',async()=>{throw Error('Network offline')});
 await assert.rejects(getSession(),/Network offline/);assert.ok(data.has('moidemain-auth-v1'));
});
test('Un rafraîchissement refusé invalide la session expirée',async t=>{
 const data=setup(t);t.mock.method(globalThis,'fetch',async()=>new Response('{"message":"Invalid refresh token"}',{status:400}));
 assert.equal(await getSession(),null);assert.equal(data.has('moidemain-auth-v1'),false);
});
test('La lecture du profil conserve la session si le service est temporairement indisponible',async t=>{
 const data=setup(t),session=JSON.parse(data.get('moidemain-auth-v1'));session.expires_at=Date.now()/1000+3600;data.set('moidemain-auth-v1',JSON.stringify(session));
 t.mock.method(globalThis,'fetch',async()=>new Response('{"message":"Unavailable"}',{status:503}));
 await assert.rejects(getUser(),/Unavailable/);assert.ok(data.has('moidemain-auth-v1'));
});
test('Une déconnexion reste possible hors ligne',async t=>{
 const data=setup(t);t.mock.method(globalThis,'fetch',async()=>{throw Error('Offline')});
 const {signOut}=await import('./auth-client.js?v=fix20261101');await signOut();
 assert.equal(data.has('moidemain-auth-v1'),false);
});
test('Un rafraîchissement en attente ne rétablit pas une session après déconnexion',async t=>{
 const data=setup(t);let finish;
 t.mock.method(globalThis,'fetch',async()=>new Promise(resolve=>{finish=()=>resolve(new Response('{"access_token":"new","refresh_token":"new-refresh","expires_in":3600}'))}));
 const pending=getSession();data.delete('moidemain-auth-v1');finish();
 assert.equal(await pending,null);assert.equal(data.has('moidemain-auth-v1'),false);
});
