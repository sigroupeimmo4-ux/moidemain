import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';

const legalPages=['a-propos.html','contact.html','cgu.html','cgv.html','confidentialite.html','cookies.html','mentions-legales.html'];
const existingPages=['index.html','explorer.html','auth.html','personnages.html','conseils.html','premium.html'];
const read=filename=>readFileSync(new URL(filename,import.meta.url),'utf8');

test('Les 7 pages légales et institutionnelles sont complètes et consultables',()=>{
 for(const file of legalPages){
  const html=read(file);
  assert.match(html,/<html lang="fr">/);
  assert.match(html,/<h1>.+<\/h1>/);
  assert.match(html,/<main class="legal-wrap">/);
  assert.match(html,/<nav class="legal-sidebar"/);
  assert.match(html,/<title>.+ — Moi Demain<\/title>/);
  for(const linked of legalPages)assert.ok(html.includes('href="./'+linked+'"'),file+' doit inclure '+linked);
 }
});
test('Chaque page publique contient les liens CGU, CGV, confidentialité et à propos',()=>{
 for(const file of [...legalPages,...existingPages]){
  const html=read(file);
  for(const linked of ['a-propos.html','cgu.html','cgv.html','confidentialite.html','mentions-legales.html']){
   assert.ok(html.includes('href="./'+linked+'"'),file+' manque '+linked);
  }
  assert.ok(html.includes('legal.css'),file+' ne charge pas la feuille de style légale');
 }
});
test('Aucun lien local des pages légales ne pointe vers un fichier absent',()=>{
 for(const file of legalPages){
  const html=read(file);
  for(const [,href] of html.matchAll(/href="\.\/([^"#?]+)(?:\?[^"]*)?"/g)){
   assert.ok(existsSync(path.join(process.cwd(),href)),file+' → '+href);
  }
 }
});
test('Les documents n’inventent pas de coordonnées légales et maintiennent le paiement inactif',()=>{
 assert.match(read('mentions-legales.html'),/\[À COMPLÉTER\]/);
 assert.match(read('contact.html'),/\[e-mail professionnel à renseigner/);
 assert.match(read('cgv.html'),/Aucune vente Premium réelle n’est activée/);
 assert.match(read('confidentialite.html'),/Supabase Auth/);
 assert.match(read('cookies.html'),/moidemain-favorites/);
});
