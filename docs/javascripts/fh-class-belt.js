/* ══ LE BELT DU CHAPITRE CLASSES — la ceinture du builder, portée au livre ══
   Eric, 2026-08-28 : *« se présente comme le belt du builder, sauf que ça varie
   en fonction du chapitre »* · *« pas de distinctions, juste des tuiles qui
   s'enchaînent »* · *« possible de remonter d'un cran, au menu général, et
   naviguer dans les sous-sections »* · *« le quality of life jour/nuit :
   dalles rondes »*.

   La règle : UNE SEULE RANGÉE DE TUILES, sans hiérarchie visible. « Menu »
   remonte au site, « Classes » au chapitre, le nom de la classe au haut de la
   page, puis les sections de la page — et la dalle ronde bascule jour/nuit.
   Un lecteur ne distingue pas un chemin d'une ancre : il tape, il y va.

   ⛔ BORNÉ AU CHAPITRE CLASSES : le motif d'URL est le seul garde. Les autres
   chapitres ne portent pas ce belt tant qu'Eric ne l'a pas étendu.

   ⚠️ LES CIBLES SONT LUES DANS LA PAGE, JAMAIS DÉDUITES : une tuile n'existe
   que si sa section existe (`#progression`, la première aptitude, la
   sous-classe, l'encadré FH). Une classe sans sous-classe n'aura pas la
   tuile — une absence de section n'est pas une erreur, c'est une page plus
   courte. */
(() => {
  "use strict";

  const m = location.pathname.match(/\/chapters\/classes\/(?:([a-z-]+)\/)?(?:index\.html)?$/);
  if (!m) return;
  const slug = m[1] || null; // null = la page d'index du chapitre

  const init = () => {
    const entete = document.querySelector(".md-header");
    const contenu = document.querySelector(".md-content__inner");
    if (!entete || !contenu) return;
    document.body.classList.add("fh-classbelt-page");

    const nav = document.createElement("nav");
    nav.className = "fh-classbelt";
    nav.setAttribute("aria-label", "Class navigation");
    const piste = document.createElement("div");
    piste.className = "fh-classbelt__track";
    nav.appendChild(piste);

    const tuile = (mot, opts = {}) => {
      const t = document.createElement(opts.href ? "a" : "button");
      if (opts.href) t.href = opts.href;
      else t.type = "button";
      t.className = "fh-classbelt__tuile" + (opts.ronde ? " fh-classbelt__tuile--ronde" : "");
      t.textContent = mot;
      piste.appendChild(t);
      return t;
    };

    // Repli du seuil de l'espion quand aucune cible ne porte de scroll-margin.
    const DEGAGEMENT = 100;
    const espions = []; // [cible dans la page, tuile]
    /* ⚠️ LES TUILES DE SECTION SONT DES ANCRES NATIVES, PAS DU scrollTo.
       Mesuré dans le pane, en deux temps : `scrollTo({behavior:"smooth"})`
       est inerte dans ce moteur ; et une fois `scroll-behavior: smooth` posé
       sur la racine, MÊME `scrollTo(0, y)` devient lisse, donc inerte. Le
       saut d'ancre du navigateur, lui, marche partout depuis toujours —
       `scroll-margin-top` paie le dégagement de l'entête, et le lissage
       reste une politesse CSS pour les moteurs qui savent. */

    tuile("Menu", { href: slug ? "../../../" : "../../" });

    const nomPropre = (el) => (el ? el.textContent.replace(/¶/g, "").trim() : "");

    if (!slug) {
      /* La page d'index : le chapitre lui-même, puis les douze classes.
         Les tuiles sont LUES dans les <h2> de la page — le jour où une
         treizième classe paraît, le belt la porte sans qu'on y revienne. */
      const ici = tuile("Classes", { href: "#" });
      ici.dataset.status = "current";
      contenu.querySelectorAll("h2[id]").forEach((h) => {
        tuile(nomPropre(h), { href: h.id + "/" });
      });
    } else {
      tuile("Classes", { href: "../" });
      const nom = nomPropre(contenu.querySelector("h1")) || slug;
      const haut = tuile(nom, { href: "#" });
      espions.push([contenu, haut]);

      /* Les libellés sont la dictée d'Eric : « Wizard chart / Wizard
         features / Wizard subclasses / Fate's hand changes ». */
      const titreFH = [...contenu.querySelectorAll(".admonition.note > .admonition-title")]
        .find((t) => /What Fate/.test(t.textContent));
      const sections = [
        [nom + " chart", contenu.querySelector("#progression"), "progression"],
        [nom + " features", contenu.querySelector(".fh-pcfh__feature"), "features"],
        [nom + " subclasses", contenu.querySelector(".fh-pcfh__subclass"), "subclass"],
        ["Fate's Hand changes", titreFH ? titreFH.parentElement : null, "fh-changes"],
      ];
      for (const [mot, cible, ancre] of sections) {
        if (!cible) continue;
        if (!cible.id) cible.id = ancre; // la sous-classe et l'encadré n'en ont pas
        const t = tuile(mot, { href: "#" + cible.id });
        espions.push([cible, t]);
      }
    }

    /* ── LA DALLE RONDE JOUR/NUIT ─────────────────────────────────────────
       Elle montre l'ASTRE QU'ON VA CHERCHER (soleil en pleine nuit), comme le
       bouton Material qu'elle remplace sur ces pages. La bascule passe par
       les inputs de Material eux-mêmes : c'est lui qui repeint et qui
       retient le choix — on ne double pas sa mémoire. */
    const ronde = tuile("", { ronde: true });
    const peindre = () => {
      const nuit = document.body.getAttribute("data-md-color-scheme") === "slate";
      ronde.textContent = nuit ? "☀" : "☾";
      const mot = nuit ? "Switch to light mode" : "Switch to dark mode";
      ronde.setAttribute("aria-label", mot);
      ronde.title = mot;
    };
    peindre();
    ronde.addEventListener("click", () => {
      const inputs = [...document.querySelectorAll('input[name="__palette"]')];
      if (!inputs.length) return;
      /* ⚠️ PAR L'ÉTAT, PAS PAR L'INDEX : tant que le lecteur n'a jamais
         choisi, AUCUN input n'est coché (le média décide) — « l'input
         suivant » partait alors de -1 et re-sélectionnait le thème courant.
         Mesuré : la première bascule ne faisait rien. On vise l'input dont
         le schéma DIFFÈRE de celui que le corps porte en ce moment. */
      const actuel = document.body.getAttribute("data-md-color-scheme");
      const suivant = inputs.find(
        (x) => x.getAttribute("data-md-color-scheme") !== actuel) || inputs[0];
      const label = document.querySelector('label[for="' + suivant.id + '"]');
      if (label) label.click();
      else {
        suivant.checked = true;
        suivant.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    new MutationObserver(peindre)
      .observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });

    entete.after(nav);

    /* ── L'ESPION DE SECTION — le cran courant suit la lecture ──────────── */
    if (espions.length) {
      let demande = false;
      /* ⚠️ LE SEUIL SE LIT SUR LA CIBLE, IL NE SE DEVINE PAS. Deviné à 120,
         il jugeait chaque section « pas encore atteinte » alors qu'on venait
         d'y sauter : `scroll-margin-top: 6.4rem` vaut 128 px ici — la racine
         Material est à 20 px, pas 16. Huit pixels de retard perpétuel, et
         l'espion montrait toujours la section PRÉCÉDENTE. */
      const premiere = espions[1] ? espions[1][0] : null;
      const marge = premiere
        ? parseFloat(getComputedStyle(premiere).scrollMarginTop) || DEGAGEMENT : DEGAGEMENT;
      const relever = () => {
        demande = false;
        const y = window.scrollY + marge + 12;
        let elu = espions[0][1];
        for (const [cible, t] of espions) {
          if (cible.getBoundingClientRect().top + window.scrollY <= y) elu = t;
        }
        /* ⚠️ EN BAS DE PAGE, LA DERNIÈRE TUILE GAGNE. Mesuré chez le magicien :
           le défilement s'arrête à 6643 quand l'encadré FH voudrait 6771 pour
           franchir le seuil — la dernière section d'une page ne PEUT jamais
           atteindre le haut de l'écran. Un témoin qui ne peut jamais accuser
           est le pire des témoins : quand le bas est atteint, c'est le bas
           qui est vrai. */
        const doc = document.documentElement;
        if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
          elu = espions[espions.length - 1][1];
        }
        for (const [, t] of espions) {
          if (t === elu) t.dataset.status = "current";
          else delete t.dataset.status;
        }
      };
      /* ⚠️ MINUTERIE, PAS requestAnimationFrame : un onglet masqué ne peint
         jamais, donc un rAF n'y court jamais — mesuré dans le pane : la
         position avançait, l'espion dormait, et le loquet `demande` restait
         verrouillé pour toujours. Le lecteur qui change d'onglet pendant un
         défilement aurait gelé le sien pareil. Une minuterie court partout. */
      addEventListener("scroll", () => {
        if (!demande) { demande = true; setTimeout(relever, 60); }
      }, { passive: true });
      /* ⚠️ ET DEUX RELEVÉS DE PLUS, MESURÉS NÉCESSAIRES : un saut d'ancre ne
         publie pas d'événement `scroll` dans tous les moteurs (constaté dans
         le pane — la position bougeait, l'espion dormait). `hashchange` couvre
         le saut, et le relevé différé après un geste sur la piste couvre le
         défilement lissé, qui n'a pas fini au moment du hashchange. */
      addEventListener("hashchange", () => setTimeout(relever, 30));
      piste.addEventListener("click", () => {
        setTimeout(relever, 80);
        setTimeout(relever, 450);
        setTimeout(relever, 900);
      });
      relever();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
