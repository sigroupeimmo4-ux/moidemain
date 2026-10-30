import {cfg,configured,SITE,json,headers,allowOrigin,db,getBuyer,paydunya,verifyOrder} from '../_shared/premium-payment.ts';
Deno.serve(async(req)=>{
 const origin=req.headers.get('origin');
 if(origin&&!allowOrigin(origin))return json({error:'Origine non autorisée'},403,origin);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(origin)});
 // Price in UI is indicative until a merchant config is present and enabled.
 if(req.method==='GET'){
  return json({
   provider:'PayDunya',available:configured(),mode:cfg.mode,
   price_xof:configured()?cfg.amount:null,
   proposed_price_xof:2500,
   currency:'XOF',payment_methods:['Wave','Orange Money','Free Money','Carte bancaire']
  },200,origin);
 }
 if(req.method!=='POST')return json({error:'Méthode non autorisée'},405,origin);
 if(!configured())return json({error:'Le paiement n’est pas encore activé.'},503,origin);
 if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'Format invalide'},415,origin);
 const user=await getBuyer(req.headers.get('authorization'));
 if(!user)return json({error:'Vous devez vous connecter.'},401,origin);
 let body={};
 try{const raw=await req.text();if(raw.length>350)return json({error:'Requête trop longue'},413,origin);body=JSON.parse(raw);}catch{return json({error:'Requête invalide'},400,origin)}
 if(body.action==='verify'){
  if(!/^[A-Za-z0-9_-]{6,150}$/.test(body.token||''))return json({error:'Référence de paiement invalide'},400,origin);
  try{
   const list=await db('premium_orders?provider_token=eq.'+encodeURIComponent(body.token)+'&user_id=eq.'+user.id+'&select=id');
   if(!list.length)return json({error:'Cette transaction n’appartient pas à ce compte.'},403,origin);
   const status=await verifyOrder(body.token);
   return json({status,active:status==='completed'},200,origin);
  }catch{return json({error:'Vérification indisponible, veuillez réessayer.'},503,origin)}
 }
 if(body.action!=='checkout'||body.confirmAdult!==true)return json({error:'Un adulte responsable doit confirmer l’achat.'},400,origin);
 try{
  const own=await db('premium_access?user_id=eq.'+user.id+'&active=eq.true&select=user_id');
  if(own.length)return json({error:'Ce compte dispose déjà de Premium.'},409,origin);
  const order_id=crypto.randomUUID();
  await db('premium_orders',{
   method:'POST',body:JSON.stringify({id:order_id,user_id:user.id,mode:cfg.mode,amount_xof:cfg.amount,status:'pending'})
  });
  const payload={
   invoice:{
    total_amount:cfg.amount,
    description:'Accès unique aux 16 fiches Premium — Moi Demain',
    customer:{email:user.email},
    items:{item_0:{name:'Moi Demain Premium',quantity:1,unit_price:cfg.amount,total_price:cfg.amount}}
   },
   store:{name:'Moi Demain',tagline:'Explore ton avenir',website_url:SITE},
   custom_data:{order_id,user_id:user.id},
   actions:{
    cancel_url:SITE+'premium.html?checkout=cancel',
    return_url:SITE+'premium.html?checkout=return',
    callback_url:cfg.url+'/functions/v1/premium-payments-webhook'
   }
  };
  const payment=await paydunya('create',{method:'POST',body:JSON.stringify(payload)});
  const checkoutUrl=String(payment.response_text||'');
  const target=new URL(checkoutUrl);
  if(target.protocol!=='https:'||target.hostname!=='app.paydunya.com'||!/^[A-Za-z0-9_-]{6,150}$/.test(payment.token||''))throw Error('Invalid checkout response');
  await db('premium_orders?id=eq.'+order_id,{method:'PATCH',body:JSON.stringify({provider_token:payment.token,updated_at:new Date().toISOString()})});
  return json({url:checkoutUrl,mode:cfg.mode,currency:'XOF',price_xof:cfg.amount},200,origin);
 }catch{
  return json({error:'La page de paiement n’a pas pu être préparée. Aucun achat confirmé.'},502,origin);
 }
});
