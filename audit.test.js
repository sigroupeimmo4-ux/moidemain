import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(file)=>readFileSync(new URL(file,import.meta.url),'utf8');

test('Le parcours personnel est accessible et limité aux comptes connectés',()=>{
 const html=read('mon-espace.html'),js=read('mon-espace.js');
 assert.ok(html.includes('profile-form')&&html.includes('journey-history'));
 assert.ok(html.includes('export-data')&&html.includes('delete-account'));
 assert.ok(js.includes('getUser()'));
 assert.ok(js.includes("if(!user)"));
 assert.ok(js.includes("confirm('Supprimer définitivement"));
});
test('Les contenus transmis par le catalogue sont échappés avant injection HTML',()=>{
 const src=read('app.js');
 assert.ok(src.includes('const safe=v=>escapeHtml(v)'));
 for(const token of ['safe(j.name)','safe(j.desc)','safe(j.category)','safe(title)','safe(full.name)','safe(full.training)','safe(j.detail)'])assert.ok(src.includes(token),token);
});
test('Les actions IA gardent le mode local, avec consentement et connexion pour le modèle',()=>{
 const src=read('floating-chat.js');
 const edge=read('supabase/functions/fullta-chat/index.ts');
 assert.ok(src.includes('fullta-ai-allowed'));
 assert.ok(src.includes('await getSession()'));
 assert.ok(src.includes('planLocalAction'));
 assert.ok(edge.includes('authenticatedUser(req)'));
 assert.ok(edge.includes('takeQuota(user.id)'));
 assert.ok(edge.includes('moderation(data.message'));
 assert.ok(edge.includes('moderation(answer.reply'));
});
test('Les avatars peuvent être synchronisés et la connexion est réservée aux adultes responsables',()=>{
 assert.ok(read('personnages.html').includes('avatar-cloud'));
 assert.ok(read('personnages.js').includes("import('./user-data.js')"));
 assert.ok(read('auth.html').includes('adult-registration'));
 assert.ok(read('auth.js').includes('adult-registration'));
});
test('Administration sous contrôle RLS et suppression de compte côté serveur',()=>{
 const src=read('admin.js');
 assert.ok(src.includes("api('admin_users'"));
 assert.ok(src.includes('if(!admins.length)'));
 assert.ok(read('supabase/functions/delete-my-account/index.ts').includes("body.confirm!=='SUPPRIMER'"));
 assert.ok(read('supabase/functions/delete-my-account/index.ts').includes("'/auth/v1/admin/users/'"));
});
test('Navigation vers mon espace sur les pages clés',()=>{
 for(const file of ['index.html','explorer.html','premium.html','auth.html']){
  assert.ok(read(file).includes('mon-espace.html'),file);
 }
});
