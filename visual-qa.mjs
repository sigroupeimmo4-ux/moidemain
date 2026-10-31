import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.MOI_DEMAIN_URL||'https://sigroupeimmo4-ux.github.io/moidemain/';
const browser=await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}), args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
mkdirSync('qa-screenshots',{recursive:true});
const failures=[];
for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
 const context=await browser.newContext({viewport});
 for(const route of ['','explorer.html','a-propos.html','cgu.html','cgv.html','confidentialite.html','mon-espace.html','personnages.html','premium.html','quiz-personnalites.html','quiz-personnalites.html?test=ecrans']){
  const page=await context.newPage();
  await page.addInitScript(()=>{
    const getContext=HTMLCanvasElement.prototype.getContext;
    const seen=new WeakSet();
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      const context=getContext.call(this,type,...args);
      if(context&&/^webgl/.test(type)&&!seen.has(context)){
        seen.add(context);
        this.fulltaDrawCount=0;
        for(const method of ['drawElements','drawArrays']){
          const draw=context[method];
          context[method]=(...values)=>{this.fulltaDrawCount++;return draw.apply(context,values);};
        }
      }
      return context;
    };
  });
  const name=(route||'accueil').replace(/[^a-z0-9]+/gi,'-');
  try{
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
   if(!response?.ok())throw Error('HTTP '+response?.status());
   await page.locator('body').waitFor();
   await page.screenshot({path:'qa-screenshots/'+viewport.width+'-'+name+'.png',fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+4);
   if(overflow)throw Error('Débordement horizontal de la page');
   if(['a-propos.html','cgu.html','cgv.html','confidentialite.html'].includes(route)){
    const check=await page.evaluate(()=>{
     const nav=document.querySelector('.legal-sidebar'),links=[...nav.querySelectorAll('a')],doc=document.querySelector('.legal-document');
     const box=nav.getBoundingClientRect(),body=doc.getBoundingClientRect();
     return {display:getComputedStyle(nav).display,
      vertical:links.every((a,i)=>i===0||a.getBoundingClientRect().top>=links[i-1].getBoundingClientRect().bottom-2),
      nonoverlap:body.top>=box.bottom-2||body.left>=box.right-2};
    });
    if(!check.vertical||!check.nonoverlap)throw Error('Sommaire chevauché : '+JSON.stringify(check));
   }
   if(route==='mon-espace.html'&&!await page.locator('#account-status').count())throw Error('Statut compte absent');
   if(route==='explorer.html'&&!await page.locator('.fullta-launch').count())throw Error('Mascotte Fullta absente');
   if(route==='explorer.html'||route===''){
     const mascot=page.locator('.fullta-launch');
     await mascot.waitFor({timeout:6000});
     await page.locator('.has-webgl canvas.fullta-webgl').waitFor({timeout:10000});
     const canvas=mascot.locator('canvas');
     assert.ok(await canvas.evaluate(el=>el.width>0&&el.height>0),'Canvas 3D vide');
     await mascot.focus();
     await page.waitForTimeout(250);
     const before=await canvas.evaluate(el=>el.fulltaDrawCount);
     await page.waitForTimeout(400);
     assert.ok(await canvas.evaluate(el=>el.fulltaDrawCount)>before,'Le lapin 3D ne s’anime pas');
     await mascot.click();
     await page.locator('#fullta-panel:not([hidden])').waitFor({timeout:3000});
     if(await mascot.getAttribute('aria-expanded')!=='true')throw Error('Fullta ne reflète pas le chat ouvert');
     await page.screenshot({path:'qa-screenshots/'+viewport.width+'-'+name+'-fullta-open.png',fullPage:true});
     await page.keyboard.press('Escape');
     if(await mascot.getAttribute('aria-expanded')!=='false')throw Error('Le chat ne se referme pas');
     await page.emulateMedia({reducedMotion:'reduce'});
     const noMotion=await mascot.locator('.fullta-mascot-art').evaluate(node=>getComputedStyle(node).animationName);
     if(noMotion!=='none')throw Error('Préférence de mouvement réduit ignorée');
     // Laisser finir le redimensionnement dû à la transition du bouton.
     await page.waitForTimeout(600);
     const still=await canvas.evaluate(el=>el.fulltaDrawCount);
     await page.waitForTimeout(350);
     assert.equal(await canvas.evaluate(el=>el.fulltaDrawCount),still,'Le rendu 3D bouge malgré le mouvement réduit');
     await page.emulateMedia({reducedMotion:'no-preference'});
   }

   if(route===''&&!await page.locator('.quiz-home-cta').count())throw Error('Nouveau quiz non visible sur accueil');
   if(route==='quiz-personnalites.html?test=ecrans'){
     if(await page.locator('#quiz-play').getAttribute('hidden')!==null)throw Error('Quiz vidéo ne démarre pas');
     for(let i=0;i<8;i++){
       await page.locator('#quiz-options input[type=radio]').first().check();
       await page.locator('#quiz-next').click();
     }
     await page.locator('#quiz-result:not([hidden])').waitFor({timeout:7000});
     const links=await page.locator('#result-careers a').count();
     if(links<3)throw Error('Résultat sans métiers suggérés');
     await page.screenshot({path:'qa-screenshots/'+viewport.width+'-quiz-result.png',fullPage:true});
     if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+4))
      throw Error('Débordement du résultat de quiz');
   }
   console.log('OK',viewport.width,route||'accueil');
  }catch(e){failures.push(viewport.width+'px '+(route||'accueil')+' : '+e.message);}
  await page.close();
 }
 await context.close();
}
// Sans WebGL, le bouton conserve son illustration et son fonctionnement.
{
 const page=await browser.newPage();
 await page.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){
     return /^webgl|experimental-webgl/.test(type)?null:original.call(this,type,...args);
   };
 });
 try{
   await page.goto(base,{waitUntil:'networkidle'});
   const button=page.locator('.fullta-launch');
   assert.equal(await button.evaluate(el=>el.classList.contains('has-webgl')),false);
   assert.ok(await button.locator('img').isVisible());
   await button.focus();
   await page.keyboard.press('Enter');
   await page.locator('#fullta-panel:not([hidden])').waitFor();
   assert.equal(await button.getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Escape');
   assert.equal(await button.getAttribute('aria-expanded'),'false');
   console.log('OK secours sans WebGL et clavier');
 }catch(e){failures.push('Secours WebGL : '+e.message);}
 await page.close();
}
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
