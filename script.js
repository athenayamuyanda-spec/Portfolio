// ===== Rideau de chargement =====
const rideau = document.getElementById('rideau');
const compteur = document.getElementById('compteur');
const DUREE = 1800; // durée du compteur en millisecondes (garde moins de 2 s)
const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ouvrirRideau() {
  rideau.classList.add('fin');                       // le sceau s’efface
  setTimeout(() => {
    rideau.classList.add('ouvert');                  // les pans s’écartent
    document.body.classList.remove('charge');        // la page peut défiler
    setTimeout(() => rideau.remove(), 1800);         // on retire le rideau du DOM
  }, reduit ? 0 : 450);
}

function lancerRideau() {
  if (reduit) { ouvrirRideau(); return; }
  let debut = null;
  function tick(t) {
    if (debut === null) debut = t;
    const p = Math.min((t - debut) / DUREE, 1);
    compteur.textContent = String(Math.round(p * 100)).padStart(3, '0');
    if (p < 1) requestAnimationFrame(tick); else ouvrirRideau();
  }
  requestAnimationFrame(tick);
}

// On attend que la page soit chargée (images comprises)
window.addEventListener('load', lancerRideau);
// Sécurité : si le chargement traîne, on ouvre quand même au bout de 6 s
setTimeout(() => { if (document.body.classList.contains('charge')) ouvrirRideau(); }, 6000);

// ===== Heure de Paris dans le pied de page =====
const heure = document.getElementById('heure');
function majHeure() {
  heure.textContent = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris'
  }).format(new Date());
}
majHeure();
setInterval(majHeure, 30000);
