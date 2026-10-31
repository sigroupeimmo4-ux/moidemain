import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const js=read('floating-chat.js');
const css=read('floating-chat.css');
test('Fullta garde son bouton flottant 3D et cliquable',()=>{
 assert.match(js,/<button class="fullta-launch"/);
 assert.match(js,/fullta-mascot-art/);
 assert.match(js,/fullta-detailed\.png/);
 assert.match(js,/fullta-blink-eyes/);
 assert.match(js,/svg class="fullta-blink-eyes"/);
 assert.match(js,/ellipse cx="69" cy="83"/);
 assert.match(js,/fullta-hello/);
 assert.match(css,/@keyframes fullta-visible-blink/);
 assert.match(css,/fullta-idle-shine/);
 assert.match(js,/firstBlink\?950/);

 assert.match(js,/launch\.addEventListener\('click',\(\)=>setOpen\(!opened\)\)/);
 assert.match(js,/aria-expanded/);
});
test('Clignement périodique et réactions à la souris, au clavier, et aux réponses',()=>{
 for(const token of ['function blink()','scheduleBlink()','is-blinking','pointerenter','pointerleave','pointermove',"'focus',blink","is-reacting","is-thinking","is-chatting"])assert.ok(js.includes(token),token);
 assert.match(css,/@keyframes fullta-eyelid-close/);
 assert.match(css,/@keyframes fullta-sparkle-pop/);
 assert.match(css,/@keyframes fullta-thinking/);
 assert.match(css,/fullta-blink-eye-left/);
 assert.match(css,/fullta-blink-eye-right/);
});
test('Les préférences de mouvement et les onglets inactifs sont respectés',()=>{
 assert.match(js,/prefers-reduced-motion: reduce/);
 assert.match(js,/visibilitychange/);
 assert.match(js,/pagehide/);
 assert.match(js,/document.hidden/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:none!important/);
});
test('Cache-busting identique sur les modules et toutes les pages avec Fullta',()=>{
 assert.match(read('app.js'),/floating-chat\.js\?v=fullta-webgl-v4/);
 assert.match(read('floating-chat-entry.js'),/floating-chat\.js\?v=fullta-webgl-v4/);
 for(const page of ['index.html','explorer.html','a-propos.html','conseils.html','premium.html','quiz-personnalites.html','mon-espace.html']){
  assert.ok(read(page).includes('floating-chat.css?v=fullta-webgl-v4'),page+' CSS');
 }
 for(const page of ['index.html','a-propos.html','conseils.html','premium.html','quiz-personnalites.html','mon-espace.html']){
  assert.ok(read(page).includes('floating-chat-entry.js?v=fullta-webgl-v4'),page+' script');
 }
 assert.match(read('explorer.html'),/app\.js\?v=fullta-webgl-v4/);
});
