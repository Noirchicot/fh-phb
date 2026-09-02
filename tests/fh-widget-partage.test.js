"use strict";

/* Le partage d'écran, côté PORTE D'ACCUEIL — lot 133, 2026-09-02.

   Eric : « Tout passe en mode widget pour desktops. » · « Donc largeur plutôt
   basée sur la largeur, et un plancher à la hauteur ; si ça passe pas on
   saute un cran en dessous. »

   Ce que ce fichier garde, et il ne garde QUE ça : l'INVARIANT de la fenêtre
   qu'on ouvre. La table des crans vit dans l'autre dépôt (fhpc,
   ui/builder/echelle.mjs, BARREAUX) et elle est copiée ici parce que deux
   dépôts ne partagent pas de module — un garde qui la réciterait ne garderait
   que lui-même.

   Ce qu'il empêche de revenir, mesuré : la formule orpheline du 31/08
   (« la hauteur décide, la largeur suit ») ouvrait 643 x 960 sur un
   1920 x 1080 et 884 x 1320 sur un 2560 x 1440 — neuf dixièmes de la hauteur
   d'écran, quelle que soit la machine. */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const SRC = path.join(__dirname, "..", "docs", "javascripts", "fh-widget.js");
const RATIO = 375 / 560;
const PANNEAU = 375;

/** Charge le script dans un faux navigateur et rend les dimensions qu'il
 *  demanderait pour un écran donné. On lui vole `window.open`. */
function fenetrePour(largeurEcran, hauteurEcran) {
  let demande = null;
  const sandbox = {
    window: {
      screen: { availWidth: largeurEcran, availHeight: hauteurEcran },
      innerWidth: largeurEcran,
      innerHeight: hauteurEcran,
      location: { search: "" },
      open(url, nom, specs) { demande = specs; return { focus() {} }; }
    },
    document: {
      readyState: "complete",
      addEventListener(type, fn) { if (type === "click") sandbox.__clic = fn; },
      querySelector() { return null; }
    }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(SRC, "utf8"), sandbox);

  const lien = {
    getAttribute: () => "/builder/",
    closest: (sel) => (sel === "a[data-fh-widget]" ? lien : null)
  };
  sandbox.__clic({ target: lien, preventDefault() {} });

  assert.ok(demande, "le clic doit ouvrir une fenetre — sinon rien n'est mesure");
  const nb = (clef) => Number(/(?:^|,)(?:width|height)=/.test(demande)
    ? demande.match(new RegExp(clef + "=(\\d+)"))[1] : NaN);
  return { l: nb("width"), h: nb("height") };
}

test("la fenetre garde le ratio sacre du panneau", () => {
  for (const [w, h] of [[1440, 900], [1920, 1080], [2560, 1440], [3440, 1440], [1366, 1024]]) {
    const f = fenetrePour(w, h);
    assert.ok(Math.abs(f.l / f.h - RATIO) < 0.01,
      `${w}x${h} ouvre ${f.l}x${f.h} — rapport ${(f.l / f.h).toFixed(3)} au lieu de ${RATIO.toFixed(3)}`);
  }
});

test("la fenetre est un WIDGET : elle laisse toujours du decor a cote d'elle", () => {
  /* Le defaut repare : 89 % et 92 % de la hauteur d'ecran, et une bande haute
     et etroite. Un widget laisse de la place des DEUX cotes. */
  for (const [w, h] of [[1440, 900], [1920, 1080], [2560, 1440], [3440, 1440]]) {
    const f = fenetrePour(w, h);
    assert.ok(f.l <= w / 2.5, `${w}x${h} : ${f.l} de large, ce n'est plus un widget`);
    assert.ok(f.h <= h * 0.85, `${w}x${h} : ${f.h} de haut, soit ${Math.round(100 * f.h / h)} % de l'ecran`);
  }
});

test("la fenetre ne descend jamais sous le dessin", () => {
  for (const [w, h] of [[768, 1024], [1024, 1366], [1366, 1024], [1440, 900], [3440, 1440]]) {
    const f = fenetrePour(w, h);
    assert.ok(f.l >= PANNEAU, `${w}x${h} ouvre ${f.l} de large — sous le panneau nu, le builder serait coupe`);
  }
});

test("le saut de cran : la fenetre plus son cadre tiennent sur l'ecran", () => {
  /* L'invariant reel : ce n'est pas un pourcentage, c'est que la fenetre plus
     la barre de titre tiennent. Le temoin est 1180 x 820 — au demi il
     demanderait 881 de haut pour 700 utiles, il saute un cran et rend 393. */
  const CADRE = 120;
  for (const [w, h] of [[1180, 820], [1366, 900], [1440, 900], [1920, 1080]]) {
    const f = fenetrePour(w, h);
    assert.ok(f.h + CADRE <= h, `${w}x${h} ouvre ${f.h} de haut — avec son cadre, ca ne tient pas`);
  }
  assert.equal(fenetrePour(1180, 820).l, 393,
    "le saut doit RETRECIR : 393, pas les 590 du demi");

  /* Le residu, nomme plutot que masque, et il est le meme que dans fhpc :
     quand meme le DERNIER cran ne tient pas en hauteur, la descente n'a plus
     rien sous elle. Mesure : un 3440 x 800 demande 856. Aucun huitieme cran
     n'est invente ici — c'est un cas a signaler a Eric. */
  const residu = fenetrePour(3440, 800);
  assert.ok(residu.h + CADRE > 800,
    "si ce cas cesse de deborder, c'est que le residu a ete repare — mets a jour la note plutot que ce test");
  assert.equal(residu.l, Math.round(3440 / 6),
    "et il deborde AU BOUT de l'echelle, sur le cran le plus serre, pas au milieu");
});
