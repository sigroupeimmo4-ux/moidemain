const LINKS=[
 ['./','Accueil'],['./explorer.html','Explorer les métiers'],['./quiz-personnalites.html','Mes quiz'],
 ['./explorer.html?vue=favoris','Mes favoris'],['./comparer.html','Comparer des métiers'],
 ['./conseils.html','Conseils'],['./personnages.html','Mes personnages'],
 ['./mon-espace.html','Mon espace'],['./parents.html','Espace parents'],['./contact.html','Contact']
];
export function mountSiteNavigation(){
 const header=document.querySelector('body > header');
 if(!header||document.getElementById('site-menu-toggle'))return;
 const toggle=document.createElement('button');
 toggle.id='site-menu-toggle';toggle.className='site-menu-toggle';toggle.type='button';
 toggle.textContent='☰ Menu';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','site-mobile-menu');
 const nav=document.createElement('nav');nav.id='site-mobile-menu';nav.className='site-mobile-menu';
 nav.setAttribute('aria-label','Menu principal');nav.hidden=true;
 for(const [href,label] of LINKS){
  const a=document.createElement('a');a.href=href;a.textContent=label;
  const url=new URL(href,location.href);
  if(url.pathname===location.pathname&&url.search===location.search)a.setAttribute('aria-current','page');
  nav.append(a);
 }
 function close(focus=false){nav.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
 toggle.addEventListener('click',()=>{
  const open=nav.hidden;nav.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
  if(open)nav.querySelector('a').focus();
 });
 document.addEventListener('click',e=>{if(!nav.hidden&&!nav.contains(e.target)&&!toggle.contains(e.target))close();});
 header.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){e.preventDefault();close(true);}});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
 const mobile=matchMedia('(max-width:900px)');mobile.addEventListener('change',()=>close());
 header.append(toggle,nav);
 // A visible shortcut also makes the new public comparison discoverable on desktop.
 const existing=header.querySelector('nav:not(.site-mobile-menu)');
 if(existing&&!existing.querySelector('a[href="./comparer.html"]')){
  const a=document.createElement('a');a.href='./comparer.html';a.textContent='Comparer';existing.append(a);
 }
}
