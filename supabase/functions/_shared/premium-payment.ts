// Payment-only server code. Never import into browser JavaScript.
export const env=(name)=>Deno.env.get(name)||'';
export const cfg={
 url:env('SUPABASE_URL'),
 anon:env('SUPABASE_ANON_KEY'),
 admin:env('SUPABASE_SERVICE_ROLE_KEY'),
 master:env('PAYDUNYA_MASTER_KEY'),
 privateKey:env('PAYDUNYA_PRIVATE_KEY'),
 token:env('PAYDUNYA_TOKEN'),
 mode:env('PAYDUNYA_MODE')==='live'?'live':'test',
 amount:Number(env('PAYDUNYA_PRICE_XOF')),
 enabled:env('PAYDUNYA_ENABLE_CHECKOUT')==='true'
};
export const SITE='https://sigroupeimmo4-ux.github.io/moidemain/';
export const endpoint='https://app.paydunya.com/'+(cfg.mode==='live'?'api':'sandbox-api')+'/v1/checkout-invoice/';
export const configured=()=>Boolean(cfg.enabled&&cfg.master&&cfg.privateKey&&cfg.token&&cfg.url&&cfg.anon&&cfg.admin&&Number.isInteger(cfg.amount)&&cfg.amount>=100&&cfg.amount<=1000000&&(cfg.mode==='test'||env('PAYDUNYA_LIVE_APPROVED')==='true'));
export const allowOrigin=o=>['https://sigroupeimmo4-ux.github.io','http://localhost:3000','http://127.0.0.1:3000'].includes(o||'');
export function headers(origin){
 return {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin',
  'Access-Control-Allow-Origin':allowOrigin(origin)?origin:'https://sigroupeimmo4-ux.github.io',
  'Access-Control-Allow-Headers':'authorization,apikey,content-type',
  'Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
}
export const json=(body,status=200,origin)=>new Response(JSON.stringify(body),{status,headers:headers(origin)});
const staffHeaders={'apikey':cfg.admin,'Authorization':'Bearer '+cfg.admin,'Content-Type':'application/json'};
export async function db(path,init={}){
 if(!cfg.admin||!cfg.url)throw Error('Database is not configured');
 const r=await fetch(cfg.url+'/rest/v1/'+path,{...init,headers:{...staffHeaders,Prefer:'return=representation',...(init.headers||{})}});
 if(!r.ok)throw Error('Database operation failed: '+r.status);
 if(r.status===204)return [];
 return r.json();
}
export async function getBuyer(authorization){
 if(!/^Bearer \S+$/.test(authorization||'')||!cfg.url||!cfg.anon)return null;
 const res=await fetch(cfg.url+'/auth/v1/user',{headers:{apikey:cfg.anon,Authorization:authorization}});
 if(!res.ok)return null;
 const user=await res.json();
 return /^[0-9a-f-]{36}$/i.test(user?.id||'')&&typeof user?.email==='string'?user:null;
}
export async function paydunya(path,init={}){
 const res=await fetch(endpoint+path,{...init,headers:{
  'Content-Type':'application/json',
  'PAYDUNYA-MASTER-KEY':cfg.master,
  'PAYDUNYA-PRIVATE-KEY':cfg.privateKey,
  'PAYDUNYA-TOKEN':cfg.token,
  ...(init.headers||{})
 },signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw Error('Payment provider unavailable');
 const data=await res.json();
 if(data.response_code!=='00')throw Error('Payment provider refused request');
 return data;
}
export async function validPaydunyaHash(received){
 if(typeof received!=='string'||!cfg.master)return false;
 const bytes=await crypto.subtle.digest('SHA-512',new TextEncoder().encode(cfg.master));
 const expected=[...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');
 if(received.length!==expected.length)return false;
 let diff=0;
 for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^received.toLowerCase().charCodeAt(i);
 return diff===0;
}
export async function verifyOrder(token){
 if(!/^[A-Za-z0-9_-]{6,150}$/.test(token||''))throw Error('Invalid payment reference');
 const orders=await db('premium_orders?provider_token=eq.'+encodeURIComponent(token)+'&select=*');
 const order=orders[0];
 if(!order||order.provider!=='paydunya')throw Error('Unknown payment reference');
 if(order.mode!==cfg.mode)throw Error('Payment mode mismatch');
 if(order.status==='completed'||order.status==='test_completed')return order.status;
 const confirmed=await paydunya('confirm/'+encodeURIComponent(token));
 const invoice=confirmed.invoice||{};
 const meta=confirmed.custom_data||{};
 if(!await validPaydunyaHash(confirmed.hash)||
   invoice.token!==order.provider_token||
   invoice.token!==token||
   Number(invoice.total_amount)!==order.amount_xof||
   (invoice.currency&&invoice.currency!=='XOF')||
   meta.order_id!==order.id||
   meta.user_id!==order.user_id||
   confirmed.mode!==order.mode){
  throw Error('Payment verification rejected');
 }
 const status=String(confirmed.status||'').toLowerCase();
 if(status==='completed'){
  const finalStatus=cfg.mode==='live'?'completed':'test_completed';
  await db('premium_orders?id=eq.'+encodeURIComponent(order.id),{
   method:'PATCH',body:JSON.stringify({status:finalStatus,updated_at:new Date().toISOString()})
  });
  if(cfg.mode==='live'){
   await db('premium_access?on_conflict=user_id',{
    method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify({user_id:order.user_id,active:true,purchased_at:new Date().toISOString(),payment_provider:'paydunya',payment_token:token,amount_xof:order.amount_xof})
   });
  }
  return finalStatus;
 }
 if(['cancelled','failed'].includes(status)){
  await db('premium_orders?id=eq.'+encodeURIComponent(order.id),{method:'PATCH',body:JSON.stringify({status,updated_at:new Date().toISOString()})});
  return status;
 }
 return 'pending';
}
