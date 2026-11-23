// ===== Rideau à tirer =====
const rideau = document.getElementById('rideau');
const compteur = document.getElementById('compteur');
const tirer = document.getElementById('tirer');
const DUREE = 1800;   // durée du compteur en millisecondes
const SEUIL = 0.3;    // part du chemin à parcourir pour que le rideau finisse de s’ouvrir
const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pret = false, ouvert = false, x0 = 0, dx = 0, deplace = false;

const progres = () => Math.min(dx / (window.innerWidth * 0.4), 1);

function ouvrir() {
  if (ouvert) return;
  ouvert = true;
  rideau.classList.remove('glisse', 'tire');
  rideau.classList.add('fin', 'ouvert');
  rideau.style.setProperty('--p', 1);           // les pans s’écartent
  document.body.classList.remove('charge');     // la page peut défiler
  setTimeout(() => rideau.remove(), 1800);
}

function pretATirer() {
  pret = true;
  rideau.classList.add('fin', 'pret');
  tirer.hidden = false;
  tirer.focus({ preventScroll: true });
  setTimeout(ouvrir, 8000);                      // si personne ne tire, il s’ouvre seul
}

function lancer() {
  if (reduit) { ouvrir(); return; }
  let debut = null;
  function tick(t) {
    if (debut === null) debut = t;
    const p = Math.min((t - debut) / DUREE, 1);
    compteur.textContent = String(Math.round(p * 100)).padStart(3, '0');
    if (p < 1) requestAnimationFrame(tick); else pretATirer();
  }
  requestAnimationFrame(tick);
}

rideau.addEventListener('pointerdown', (e) => {
  if (!pret || ouvert) return;
  deplace = true; x0 = e.clientX; dx = 0;
  rideau.classList.add('glisse', 'tire');
  rideau.setPointerCapture(e.pointerId);
});
rideau.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') {               // la bulle « TIRER » suit la souris
    rideau.style.setProperty('--x', e.clientX + 'px');
    rideau.style.setProperty('--y', e.clientY + 'px');
  }
  if (!deplace) return;
  dx = Math.abs(e.clientX - x0);
  rideau.style.setProperty('--p', progres());
});
rideau.addEventListener('pointerup', () => {
  if (!deplace) return;
  deplace = false;
  rideau.classList.remove('glisse', 'tire');
  if (progres() >= SEUIL || dx < 8) ouvrir();    // geste assez long, ou simple clic
  else rideau.style.setProperty('--p', 0);       // sinon le rideau revient
});
rideau.addEventListener('pointercancel', () => {
  deplace = false;
  rideau.classList.remove('glisse', 'tire');
  if (!ouvert) rideau.style.setProperty('--p', 0);
});
tirer.addEventListener('click', ouvrir);         // clavier : Entrée ou Espace

window.addEventListener('load', lancer);
setTimeout(ouvrir, 12000);                       // sécurité si le chargement traîne

// ===== Texte surligné : aperçu au survol =====
const apercu = document.getElementById('apercu');
let minuteur;
document.querySelectorAll('.mot').forEach((mot) => {
  const placer = (x, y) => { apercu.style.left = x + 'px'; apercu.style.top = y + 'px'; };
  const montrer = () => {
    clearTimeout(minuteur);
    const r = mot.getBoundingClientRect();
    placer(r.left + r.width / 2, r.top);
    apercu.src = mot.dataset.img;
    apercu.alt = mot.dataset.alt || '';
    apercu.classList.add('visible');
  };
  const cacher = () => apercu.classList.remove('visible');
  mot.addEventListener('pointerenter', montrer);
  mot.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') placer(e.clientX, e.clientY - 12); });
  mot.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') minuteur = setTimeout(cacher, 2000); else cacher();
  });
  mot.addEventListener('focus', montrer);
  mot.addEventListener('blur', cacher);
});

// ===== Heure de Paris dans le pied de page =====
const heure = document.getElementById('heure');
function majHeure() {
  heure.textContent = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris'
  }).format(new Date());
}
majHeure();
setInterval(majHeure, 30000);
