/* ══ LE BUILDER S'OUVRE EN FENÊTRE — lot 113, 2026-08-31 ═══════════════════
   Eric : « donc ceci est la nouvelle homepage FH : grande image, quelques
   boutons, et un highlight si y'a besoin. »

   🔴 UN VRAI GESTE, TOUJOURS. `window.open` n'est autorisé que depuis un clic
   du joueur : appelé au chargement, sur un `resize` ou dans un `setTimeout`, il
   est bloqué EN SILENCE, et Safari iOS est le plus strict. C'est donc un
   écouteur de clic, jamais une conséquence de la largeur.
   ⛔ À ne pas confondre avec `window.resizeTo`, refusé partout : on ouvre une
   fenêtre, on ne dimensionne jamais celle du joueur.

   ⭐ LA DIMENSION SE CALCULE, ELLE NE S'INVENTE PAS. Le panneau du builder a un
   ratio sacré — 375 × 560 blg, soit 0,670 (lot 112) — et sa règle est « la
   hauteur décide, la largeur suit ». On lui donne donc toute la hauteur
   disponible, et sa largeur en découle.
   ⚠️ Sur iPadOS, iOS et Android la chaîne de dimensions est IGNORÉE : ça ouvre
   un onglet plein écran. Ce n'est pas une dégradation — le builder y remplit
   tout, à sa proportion. Aucune branche à écrire pour ce cas. */
(function () {
  var RATIO = 375 / 560;        /* lot 112 — la règle sacrée */
  var MARGE_CHROME = 120;       /* barre de titre + onglets, mesuré au large */

  function dimensions() {
    var h = Math.max(400, (window.screen.availHeight || window.innerHeight) - MARGE_CHROME);
    var l = Math.round(h * RATIO);
    /* On ne demande jamais plus large que l'écran : le navigateur borne de
       toute façon, mais une demande absurde se voit dans le code. */
    var lMax = (window.screen.availWidth || window.innerWidth);
    if (l > lMax) { l = lMax; h = Math.round(l / RATIO); }
    return { l: l, h: Math.round(h) };
  }

  function ouvrir(url) {
    var d = dimensions();
    /* ⭐ UN NOM DE FENÊTRE STABLE : un second clic REVIENT sur la fenêtre déjà
       ouverte au lieu d'en empiler une seconde, qui porterait un autre
       personnage et ferait diverger deux états du même builder. */
    var f = window.open(url, "fhpc-builder",
      "width=" + d.l + ",height=" + d.h + ",menubar=no,toolbar=no,location=no,status=no");
    if (f && typeof f.focus === "function") { try { f.focus(); } catch (_) { /* rien */ } }
    return f;
  }

  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[data-fh-widget]") : null;
    if (!a) return;
    var url = a.getAttribute("href");
    if (!url) return;
    /* ⚠️ Si le navigateur refuse (bloqueur, réglage « ouvrir en onglet »), on
       ne fait RIEN de spécial : on laisse le lien suivre son cours normal.
       Un bouton qui ne mène nulle part serait pire que deux comportements. */
    if (ouvrir(url)) ev.preventDefault();
  });

  /* ── LE HIGHLIGHT — Eric : « avec un gros highlight pour éviter de me
     disperser ». Le favori porte `?resume` ; la page arrive avec le bouton
     allumé. ⛔ Un perso n'a PAS d'url : ce marqueur dit « reprends ce qui est
     ici », jamais « reprends CE perso ». */
  function armerLaReprise() {
    if (window.location.search.indexOf("resume") < 0) return;
    var b = document.querySelector("[data-fh-resume]");
    if (!b) return;
    b.setAttribute("data-vise", "oui");
    /* ⛔ ON NE DÉFILE QUE S'IL LE FAUT — mesuré au banc : sur un écran où la
       page tient entière, un `scrollIntoView` centrait le bouton et poussait le
       hero hors du champ. Arriver sur l'accueil en ayant perdu la grande image
       n'est pas « éviter de se disperser », c'est se disperser autrement. */
    var r = b.getBoundingClientRect();
    var dehors = r.top < 0 || r.bottom > (window.innerHeight || 0);
    if (dehors && b.scrollIntoView) b.scrollIntoView({ block: "center", behavior: "instant" });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", armerLaReprise);
  else armerLaReprise();
})();
