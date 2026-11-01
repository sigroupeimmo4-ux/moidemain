import {chromium} from 'playwright';
import {readdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base=process.env.MOI_DEMAIN_URL||'http://127.0.0.1:3000/';
const routes=(await readdir(process.cwd())).filter(f=>f.endsWith('.html'));
if(!routes.length)throw Error('Aucune page HTML à vérifier');
const failures=[];let checked=0;
for(const width of [390,1280]){
 for(const route of routes){
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
  await page.route('https://*.supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
  try{
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
   if(response.status()!==200)throw Error('HTTP '+response.status());
   if(route!=='reset-password.html')await page.locator('.fullta-launch').waitFor();
   else await page.locator('#recovery-status').waitFor();
   await page.waitForTimeout(60);
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+4))errors.push('Débordement horizontal');
   if(errors.length)throw Error(errors.join(' ; '));
   checked++;
  }catch(e){failures.push(width+' '+route+': '+e.message);}
  await page.close();
 }
 console.log('Pages vérifiées à',width,'px');
}
await browser.close();console.log('Contrôles réussis :',checked,'sur',routes.length*2);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
