const url=Deno.env.get('SUPABASE_URL')||'';
const anon=Deno.env.get('SUPABASE_ANON_KEY')||'';
const admin=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const allowed=new Set(['https://sigroupeimmo4-ux.github.io','http://localhost:3000','http://127.0.0.1:3000']);
function hdr(origin){return {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Origin':allowed.has(origin||'')?origin:'https://sigroupeimmo4-ux.github.io','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};}
function send(data,status=200,origin){return new Response(JSON.stringify(data),{status,headers:hdr(origin)});}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(origin&&!allowed.has(origin))return send({error:'Origine non autorisée'},403,origin);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:hdr(origin)});
 if(req.method!=='POST')return send({error:'Méthode non autorisée'},405,origin);
 if(!url||!anon||!admin)return send({error:'Service non configuré'},503,origin);
 const authorization=req.headers.get('authorization')||'';
 if(!/^Bearer \S+$/.test(authorization))return send({error:'Connexion obligatoire'},401,origin);
 const auth=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:authorization}});
 if(!auth.ok)return send({error:'Connexion expirée'},401,origin);
 const user=await auth.json();
 if(!/^[0-9a-f-]{36}$/i.test(user?.id||''))return send({error:'Compte invalide'},403,origin);
 let body={};
 try{
  if(!req.headers.get('content-type')?.includes('application/json'))return send({error:'Format invalide'},415,origin);
  const text=await req.text();if(text.length>100)return send({error:'Requête invalide'},413,origin);
  body=JSON.parse(text);
 }catch{return send({error:'Requête invalide'},400,origin)}
 if(body.confirm!=='SUPPRIMER')return send({error:'Confirmation manquante'},400,origin);
 // Admin route is server-only; deleting auth.users cascades into all user-owned tables.
 const response=await fetch(url+'/auth/v1/admin/users/'+user.id,{
  method:'DELETE',headers:{apikey:admin,Authorization:'Bearer '+admin}
 });
 if(!response.ok)return send({error:'Suppression non disponible pour le moment'},503,origin);
 return send({deleted:true},200,origin);
});
