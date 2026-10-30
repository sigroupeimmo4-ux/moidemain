import {configured,json,validPaydunyaHash,verifyOrder} from '../_shared/premium-payment.ts';
// PayDunya sends form-urlencoded data[invoice][token] and data[hash].
// Never trust IPN values for entitlements: always re-check via PayDunya's authenticated confirm API.
Deno.serve(async(req)=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(!configured())return json({error:'Provider unavailable'},503);
 const contentType=req.headers.get('content-type')||'';
 if(!contentType.includes('application/x-www-form-urlencoded'))return json({error:'Invalid content type'},415);
 try{
  const raw=await req.text();
  if(raw.length>30000)return json({error:'Payload too long'},413);
  const form=new URLSearchParams(raw);
  const token=form.get('data[invoice][token]')||form.get('data[invoice][token][]')||'';
  const hash=form.get('data[hash]')||'';
  if(!await validPaydunyaHash(hash))return json({error:'Invalid signature'},403);
  if(!/^[A-Za-z0-9_-]{6,150}$/.test(token))return json({error:'Invalid token'},400);
  const status=await verifyOrder(token);
  return json({received:true,status});
 }catch{return json({error:'Unable to verify the transaction'},503)}
});
