// Couche d'expérience : retours visuels et confort de navigation, sans dépendance.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Notifications discrètes (toasts)
let region;
function toast(message, kind = 'ok') {
  if (!region) {
    region = document.createElement('div');
    region.className = 'ux-toasts';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  const t = document.createElement('div');
  t.className = 'ux-toast ux-toast-' + kind;
  t.textContent = message;
  region.append(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2600);
}
window.moiDemainToast = toast;

// Favoris : confirmer l'action (le bouton est redessiné par l'application)
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-save], button[data-save-result]');
  if (!b) return;
  const wasSaved = b.getAttribute('aria-pressed') === 'true' || /retirer/i.test(b.textContent);
  toast(wasSaved ? 'Retiré de tes favoris' : 'Ajouté à tes favoris ♥');
}, true);

// 2. Page active dans la navigation
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('body > header nav a[href]').forEach((a) => {
  const file = new URL(a.href, location.href).pathname.split('/').pop() || 'index.html';
  if (file === here && !a.hash) a.setAttribute('aria-current', 'page');
});

// 3. En-tête : ombre au défilement
const header = document.querySelector('body > header');
const onScroll = () => {
  if (header) header.classList.toggle('is-scrolled', scrollY > 8);
  top_.classList.toggle('show', scrollY > 700);
  if (cta) {
    const hero = document.querySelector('.landing-hero');
    const footer = document.querySelector('body > footer');
    const pastHero = hero ? hero.getBoundingClientRect().bottom < 0 : false;
    const nearFooter = footer ? footer.getBoundingClientRect().top < innerHeight : false;
    cta.classList.toggle('show', pastHero && !nearFooter);
  }
};

// 4. Retour en haut
const top_ = document.createElement('button');
top_.type = 'button';
top_.className = 'ux-top';
top_.setAttribute('aria-label', 'Retour en haut de la page');
top_.textContent = '↑';
top_.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
document.body.append(top_);

// 5. Bouton d'action fixe sur mobile (page d'accueil)
let cta = null;
if (document.querySelector('.landing-hero')) {
  cta = document.createElement('a');
  cta.className = 'ux-cta';
  cta.href = './explorer.html?quiz=1';
  cta.innerHTML = 'Découvrir mon profil <span aria-hidden="true">→</span>';
  document.body.append(cta);
}

addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 6. Raccourci « / » pour chercher un métier
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  const field = document.querySelector('#search');
  if (field && !/input|textarea|select/i.test(document.activeElement.tagName)) {
    e.preventDefault();
    field.focus();
  }
});
