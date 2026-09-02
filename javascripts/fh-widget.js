/* ══ LE BUILDER S'OUVRE EN FENÊTRE — lot 113, 2026-08-31 ═══════════════════
   Eric : « donc ceci est la nouvelle homepage FH : grande image, quelques
   boutons, et un highlight si y'a besoin. »

   🔴 UN VRAI GESTE, TOUJOURS. `window.open` n'est autorisé que depuis un clic
   du joueur : appelé au chargement, sur un `resize` ou dans un `setTimeout`, il
   est bloqué EN SILENCE, et Safari iOS est le plus strict. C'est donc un
   écouteur de clic, jamais une conséquence de la largeur.
   ⛔ À ne pas confondre avec `window.resizeTo`, refusé partout : on ouvre une
   fenêtre, on ne dimensionne jamais celle du joueur.

   ⭐ LA DIMENSION SE CALCULE, ELLE NE S'INVENTE PAS — et depuis le 02/09 elle
   vient du PARTAGE d'Eric, plus de la hauteur d'écran.
   🔴 *« Tout passe en mode widget pour desktops. »* · *« Donc largeur plutôt
   basée sur la largeur, et un plancher à la hauteur ; si ça passe pas on
   saute un cran en dessous. »*

   ⛔ CE QUI ÉTAIT ÉCRIT ICI ÉTAIT UN ORPHELIN : *« la hauteur décide, la
   largeur suit »* datait du 31/08 et de l'architecture côte-à-côte, qu'Eric a
   tuée le soir même (*« usine à gaz »*) ; la formule a été recopiée sans être
   redérivée. Mesuré, elle ouvrait 643 × 960 sur un 1920 × 1080 et 884 × 1320
   sur un 2560 × 1440 — **neuf dixièmes de la hauteur d'écran**, quelle que
   soit la machine. C'est ça qu'Eric a appelé *« plus du tout respectée »*.

   🔴 LES DEUX PORTES DISENT LA MÊME CHOSE. Celle-ci ouvre une fenêtre à la
   taille du partage ; l'autre — l'adresse tapée directement — ne peut PAS
   redimensionner la fenêtre du joueur (`window.resizeTo` est refusé partout),
   alors elle **se dessine** à sa fraction, centrée sur le décor. Même règle,
   deux mécanismes.

   ⚠️ ET C'EST UNE COPIE DÉLIBÉRÉE, LA SEULE DU CHANTIER. La source est
   `ui/builder/echelle.mjs` du dépôt `fhpc` (`BARREAUX`) ; deux dépôts séparés
   ne partagent pas de module, et une page d'accueil ne peut pas importer le
   builder. ⛔ Les NOMS des crans ne sont donc PAS recopiés ici — seulement les
   deux nombres dont l'ouverture a besoin. Un test garde l'invariant, pas la
   table.
   ⚠️ Sur iPadOS, iOS et Android la chaîne de dimensions est IGNORÉE : ça ouvre
   un onglet plein écran. Ce n'est pas une dégradation — le builder y remplit
   tout, à sa proportion, et le partage y est rendu par l'app elle-même. */
(function () {
  var RATIO = 375 / 560;        /* lot 112 — la règle sacrée */
  var PANNEAU = 375;            /* `--panneau-l` : le dessin, et le plancher */
  var MARGE_CHROME = 120;       /* barre de titre + onglets, mesuré au large */

  /* Le partage, du plus généreux au plus serré. ⛔ COPIE de `BARREAUX`
     (`fhpc/ui/builder/echelle.mjs`), noms exclus : `depuis` = la largeur
     d'écran qui pose le cran, `part` = le dénominateur d'Eric. */
  var CRANS = [
    { depuis: 0,    part: 1 },
    { depuis: 768,  part: 2 },
    { depuis: 1367, part: 3 },
    { depuis: 1680, part: 4 },
    { depuis: 2200, part: 5 },
    { depuis: 3000, part: 6 }
  ];

  function dimensions() {
    /* ⚠️ L'ÉCRAN, PAS LA FENÊTRE : c'est l'écran du joueur qui pose le cran,
       puisque c'est lui qui doit porter la fenêtre qu'on va ouvrir. */
    var lEcran = window.screen.availWidth || window.innerWidth;
    var hEcran = (window.screen.availHeight || window.innerHeight) - MARGE_CHROME;

    var i = 0;
    for (var k = 0; k < CRANS.length; k++) if (lEcran >= CRANS[k].depuis) i = k;

    /* ① la largeur vient du cran · ② la hauteur ne fait que faire DESCENDRE.
       ⛔ Le plancher du dessin ne s'applique pas au plein écran (`part` 1) :
       c'est là que vit le cran réduit, `360 / 375 = 0,96`. */
    var taille = function (k) {
      return CRANS[k].part === 1 ? lEcran : Math.max(PANNEAU, lEcran / CRANS[k].part);
    };
    var l = taille(i);
    /* ⚠️ « UN CRAN EN DESSOUS » SE COMPTE EN TAILLE RENDUE, PAS EN INDICE :
       le cran qui rétrécit est celui dont la PART est plus grande, donc le
       SUIVANT dans la liste. Compter à l'envers ferait grossir la fenêtre au
       lieu de la faire descendre — le témoin est l'écran de 1180 × 820, le
       seul de la table où le saut se déclenche. */
    while (l / RATIO > hEcran && i < CRANS.length - 1) {
      i += 1;
      var moindre = taille(i);
      if (moindre < l) l = moindre;
    }
    return { l: Math.round(l), h: Math.round(l / RATIO) };
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
