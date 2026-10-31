import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const base=process.env.MOI_DEMAIN_URL||'https://sigroupeimmo4-ux.github.io/moidemain/';
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const failures=[];
for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
 const context=await browser.newContext({viewport});
 for(const route of ['','explorer.html','a-propos.html','cgu.html','cgv.html','confidentialite.html','mon-espace.html','personnages.html','premium.html','quiz-personnalites.html','quiz-personnalites.html?test=ecrans']){
  const page=await context.newPage();
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
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
