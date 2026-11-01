import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.MOI_DEMAIN_URL||'http://127.0.0.1:3000/';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const failures=[];
async function check(name,run){try{await run();console.log('OK',name);}catch(error){failures.push(name+': '+error.message);}}
try{
 await check('Menu mobile, favoris invités et comparaison gratuite',async()=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('moidemain-favorites',JSON.stringify(['dev','paysage'])));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const menu=page.locator('#site-menu-toggle');await menu.waitFor();
  await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');
  assert.ok(await page.locator('#site-mobile-menu a').first().evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');
  await menu.click();await page.locator('#site-mobile-menu a').filter({hasText:'Mes favoris'}).click();
  await page.waitForURL('**/explorer.html?vue=favoris');
  await page.locator('.job').first().waitFor();assert.equal(await page.locator('.job').count(),2);
  await page.goto(base+'comparer.html?un=dev&deux=paysage');
  assert.equal(await page.locator('#comparison article').count(),2);
  assert.ok((await page.locator('#comparison').textContent()).includes('BTS SIO'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.selectOption('#compare-second','dev');assert.equal(await page.locator('#comparison article').count(),0);
  assert.match(await page.locator('#compare-feedback').textContent(),/différents/);
  await page.locator('#compare-favorites').click();assert.equal(await page.locator('#compare-second').inputValue(),'paysage');
  const premium=await page.locator('#compare-second option').evaluateAll(opts=>opts.find(o=>o.textContent.includes('Premium')).value);
  await page.selectOption('#compare-second',premium);assert.match(await page.locator('#comparison article').nth(1).textContent(),/nécessite un accès Premium/);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('denied'))}}));
  await page.locator('#compare-share').click();assert.ok(await page.locator('#share-link').isVisible());
  assert.ok((await page.locator('#share-link').inputValue()).includes('un=dev'));
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('#compare-form').isVisible(),false);
  assert.equal(await page.locator('#comparison article').count(),2);
  assert.deepEqual(errors,[]);await page.close();
 });
 await check('Réinitialisation : validation, erreur, nouveau mot de passe et nettoyage du lien',async()=>{
  const page=await browser.newPage();const requests=[];let attempt=0;
  await page.route('https://*.supabase.co/auth/v1/**',async route=>{
   const req=route.request();requests.push({method:req.method(),url:req.url(),data:req.postDataJSON()});
   const status=req.method()==='PUT'&&attempt++===0?500:200;
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===500?{message:'Temporary'}:{id:'test-user'})});
  });
  await page.goto(base+'reset-password.html#type=recovery&access_token=test-recovery-token');
  await page.locator('#recovery-form').waitFor({state:'visible'});
  assert.equal(new URL(page.url()).hash,'');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('moidemain-auth-v1')),null);
  await page.fill('#new-password','new-password-123');await page.fill('#confirm-password','different-password');
  await page.click('#recovery-submit');assert.match(await page.locator('#recovery-status').textContent(),/identiques/);
  assert.equal(requests.filter(r=>r.method==='PUT').length,0);
  await page.fill('#confirm-password','new-password-123');await page.click('#recovery-submit');
  await page.waitForFunction(()=>document.querySelector('#recovery-status').textContent.includes('échoué'));
  assert.ok(await page.locator('#recovery-form').isVisible());
  await page.click('#recovery-submit');
  await page.waitForFunction(()=>document.querySelector('#recovery-status').textContent.includes('a été modifié'));
  assert.equal(await page.locator('#recovery-form').isVisible(),false);
  assert.deepEqual(requests.find(r=>r.method==='PUT').data,{password:'new-password-123'});
  assert.equal(await page.locator('#new-password').inputValue(),'');
  await page.goto(base+'reset-password.html');assert.match(await page.locator('#recovery-status').textContent(),/absent ou invalide/);
  assert.equal(await page.locator('#recovery-form').isVisible(),false);
  await page.route('https://*.supabase.co/auth/v1/user',route=>route.fulfill({status:401,contentType:'application/json',body:'{"message":"Expired"}'}));
  await page.goto(base+'reset-password.html#type=recovery&access_token=expired');
  await page.waitForFunction(()=>document.querySelector('#recovery-status').textContent.includes('expiré'));
  assert.equal(await page.locator('#recovery-form').isVisible(),false);await page.close();
 });
}finally{await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
