import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './auth-client.js';
async function showAnnouncements(){
 const target=document.getElementById('site-announcements');if(!target)return;
 try{
  const r=await fetch(SUPABASE_URL+'/rest/v1/site_announcements?select=title,body&published=eq.true&order=created_at.desc&limit=3',{headers:{apikey:SUPABASE_PUBLISHABLE_KEY},cache:'no-store'});
  if(!r.ok)return;
  const items=await r.json();if(!items.length)return;
  target.replaceChildren();target.hidden=false;
  for(const item of items){
   const c=document.createElement('article');c.className='site-announcement';
   const title=document.createElement('strong');title.textContent=item.title;
   const body=document.createElement('p');body.textContent=item.body;
   c.append(title,body);target.append(c);
  }
 }catch{/* Site remains usable when information feed is unavailable. */}
}
void showAnnouncements();
