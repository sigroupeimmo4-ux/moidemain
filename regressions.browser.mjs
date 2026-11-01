import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.MOI_DEMAIN_URL||'http://127.0.0.1:3000/';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const failures=[];
async function scenario(name,run){const context=await browser.newContext();try{await run(context);console.log('OK',name);}catch(e){failures.push(name+': '+e.message);}finally{await context.close();}}
async function account(context){
 await context.addInitScript(()=>sessionStorage.setItem('moidemain-auth-v1',JSON.stringify({access_token:'test-token',refresh_token:'test-refresh',expires_at:Date.now()/1000+3600,user:{id:'test-user'}})));
 await context.route('https://*.supabase.co/**',async route=>{
  const u=new URL(route.request().url());let data=[];
  if(u.pathname==='/auth/v1/user')data={id:'test-user',email:'adult@example.test'};
  if(u.pathname.endsWith('/premium_access'))data=[{active:true}];
  if(u.pathname.endsWith('/premium_careers'))data=[{id:u.searchParams.get('id').replace('eq.',''),name:'Métier Premium test',category:'Technologie',emoji:'🔎',detail:'Contenu Premium autorisé',training:'Parcours de test',tasks:['Observer','Essayer','Découvrir']}];
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
}
try{
 await scenario('Premium actif : accès au catalogue puis à une fiche',async context=>{
  await account(context);const page=await context.newPage();await page.goto(base+'premium.html');
  await page.locator('#premium-purchase[data-mode=explore]').click();await page.waitForURL('**/explorer.html?premium=1');
  await page.locator('#job-list').waitFor({timeout:3000});assert.equal(await page.locator('.job').count(),16);
  await page.locator('.job .text-btn').first().click();await page.locator('#modal[open]').waitFor({timeout:3000});
  assert.match(await page.locator('#modal-content').textContent(),/Contenu Premium autorisé/);
 });
 await scenario('Le bouton de favori ne réenregistre pas un résultat de quiz',async context=>{
  await account(context);let writes=0;
  await context.route('https://*.supabase.co/rest/v1/quiz_history**',async route=>{if(route.request().method()==='POST')writes++;await route.fulfill({status:200,contentType:'application/json',body:'[]'});});
  const page=await context.newPage();await page.goto(base+'explorer.html?metier=dev');
  await page.locator('[data-job-quiz=dev]').click();
  for(let i=0;i<3;i++)await page.locator('#modal .option').first().click();
  await page.locator('.result-score').waitFor();await page.locator('[data-save-result=dev]').click();await page.locator('[data-save-result=dev]').click();
  await page.waitForTimeout(200);assert.equal(writes,1);
 });
 await scenario('Les favoris locaux invalides et les doublons sont ignorés',async context=>{
  await context.addInitScript(()=>localStorage.setItem('moidemain-favorites',JSON.stringify(['dev','dev','ghost',{id:'bad'}])));
  const page=await context.newPage();await page.goto(base+'explorer.html?vue=favoris');await page.locator('.job').waitFor();
  assert.equal(await page.locator('#fav-count').textContent(),'1');assert.equal(await page.locator('.job').count(),1);
 });
 await scenario('Une ancienne sauvegarde de conseils invalide ne bloque pas les cases',async context=>{
  await context.addInitScript(()=>localStorage.setItem('moidemain-advice-v1','7'));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'conseils.html');
  await page.locator('[data-check=curiosity]').check();await page.waitForTimeout(100);
  assert.deepEqual(errors,[]);assert.match(await page.locator('#checklist-feedback').textContent(),/1\/3/);
 });
 await scenario('Un invité ne peut pas ouvrir un contenu Premium',async context=>{
  const page=await context.newPage();await page.goto(base+'explorer.html?premium=1');await page.locator('#job-list').waitFor({timeout:3000});
  await page.locator('.job .text-btn').first().click();await page.waitForURL('**/premium.html?metier=*');
  assert.equal(await page.locator('#modal[open]').count(),0);
 });
 await scenario('Personnage : personnalisation, sauvegarde et réinitialisation',async context=>{
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'personnages.html');await page.locator('[data-field=animal][data-value=renard]').click();
  await page.fill('#avatar-name','Compagnon test');await page.locator('#avatar-editor button[type=submit]').click();
  await page.reload();assert.equal(await page.locator('#avatar-name').inputValue(),'Compagnon test');
  assert.equal(await page.locator('[data-field=animal][data-value=renard]').getAttribute('aria-pressed'),'true');
  await page.locator('#avatar-reset').click();assert.equal(await page.evaluate(()=>localStorage.getItem('moidemain-avatar-v1')),null);
  assert.deepEqual(errors,[]);
 });
 await scenario('Fullta exécute une commande locale depuis l’accueil',async context=>{
  const page=await context.newPage();await page.goto(base);await page.locator('.fullta-launch').click();
  await page.locator('[data-prompt="Montre les métiers technologie"]').click();
  await page.waitForURL('**/explorer.html?fullta=1');await page.locator('#job-list').waitFor();
  const categories=await page.locator('#job-list .tag').allTextContents();
  assert.ok(categories.length>0&&categories.every(x=>x==='Technologie'));
 });
 await scenario('Inscription : confirmation adulte requise, erreurs de connexion lisibles',async context=>{
  let registrations=0;
  await context.route('https://*.supabase.co/auth/v1/**',async route=>{
   const signup=new URL(route.request().url()).pathname.endsWith('/signup');
   if(signup)registrations++;
   await route.fulfill({status:signup?200:401,contentType:'application/json',body:signup?'{}':'{"message":"Identifiants invalides"}'});
  });
  const page=await context.newPage();await page.goto(base+'auth.html?mode=signup');
  await page.fill('#email','adult@example.test');await page.fill('#password','test-password-123');await page.click('#auth-submit');
  assert.equal(registrations,0);assert.match(await page.locator('#auth-feedback').textContent(),/réservée/);
  await page.locator('#adult-registration').check();await page.fill('#password','test-password-123');await page.click('#auth-submit');
  await page.waitForFunction(()=>document.querySelector('#auth-feedback').textContent.includes('Compte créé'));assert.equal(registrations,1);
  await page.locator('#tab-login').click();await page.fill('#password','test-password-123');await page.click('#auth-submit');
  await page.waitForFunction(()=>document.querySelector('#auth-feedback').textContent.includes('Identifiants invalides'));
 });
 await scenario('Premium hors ligne : erreur contrôlée et session conservée',async context=>{
  await context.addInitScript(()=>sessionStorage.setItem('moidemain-auth-v1',JSON.stringify({access_token:'test',refresh_token:'test-refresh',expires_at:0,user:{id:'test-user'}})));
  await context.route('https://*.supabase.co/**',route=>route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'premium.html');
  await page.waitForFunction(()=>document.querySelector('#premium-status').textContent.includes('temporairement indisponible'));
  assert.ok(await page.evaluate(()=>sessionStorage.getItem('moidemain-auth-v1')));
  assert.equal(await page.locator('#premium-purchase').isDisabled(),true);assert.deepEqual(errors,[]);
 });
 await scenario('Un chargement lent ne rétablit pas un favori retiré',async context=>{
  await account(context);
  await context.addInitScript(()=>localStorage.setItem('moidemain-favorites','["dev"]'));
  let release,started;const loading=new Promise(resolve=>started=resolve);
  await context.route('https://*.supabase.co/rest/v1/user_favorites**',async route=>{
   if(route.request().method()==='GET'){
    release=()=>route.fulfill({status:200,contentType:'application/json',body:'[{"job_id":"dev"}]'});started();
   }else await route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  const page=await context.newPage();await page.goto(base+'explorer.html?vue=favoris');await loading;
  await page.locator('[data-save=dev]').click();assert.equal(await page.locator('.job').count(),0);
  await release();await page.waitForTimeout(150);assert.equal(await page.locator('.job').count(),0);
 });
}finally{await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
