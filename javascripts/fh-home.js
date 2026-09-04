/* Fate's Hand TOC extras:
   1. "⌂ Home" link at the top of the table of contents (every page).
   2. Destiny-group cross TOC: on the three Destiny System pages, the TOC
      lists all three chapter H1s with their key H2s; the current page's
      native TOC is nested under its own H1. */
/* Fate's Hand — le menu de la marge droite.

   🔴 CE QUI A ÉTÉ RETIRÉ ICI, ET POURQUOI. Ce fichier portait une table `GROUPS`
      écrite à la main qui doublait l'arborescence du site : chaque page, chacun
      de ses titres, chacune de ses ancres, recopiés. Audit du 2026-09-04 contre
      les ancres du site CONSTRUIT : 12 ancres mortes sur 26 entrées, dont les
      CINQ du groupe Destiny, et un libellé périmé. Rien ne rougissait — une
      ancre morte ne casse pas une page, elle mène ailleurs.

   ⭐ CE QUI LA REMPLACE. `window.FH_NAV`, écrit par `build_nav.py`, dérivé du
      `nav:` de mkdocs.yml et des titres de `docs/`. Aucun nom n'est recopié,
      aucune ancre n'est devinée : un titre Markdown passe par le `slugify` de
      Python-Markdown (celui que MkDocs emploie), un titre HTML porte déjà son
      `id`. Épreuve à la génération : 586 ancres confrontées au site construit,
      zéro introuvable.

   📐 LES RANGS SONT CEUX D'ERIC (2026-09-04) : `R` un menu racine, `B` une page,
      `SB` une page-fille, et les titres d'une page en dessous. ⛔ Un rang dit une
      PROFONDEUR, jamais le nom d'une page.

   ⭐ CE QU'ON VOIT AU PREMIER COUP D'ŒIL : les menus racine, repliés. Seul celui
      où l'on se trouve s'ouvre, et dedans seule la page courante détaille ses
      titres. Eric : « ne présenter au premier coup d'oeil que les menus non
      developpés du dessus, en dessous un détail de ce qui est dans chaque page ». */
(function () {
  var NAV = window.FH_NAV || [];

  function elt(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  /* La racine du site, lue sur le logo : le livre vit sous /fh-phb/, jamais à
     la racine du domaine. ⛔ Ne pas écrire ce préfixe en dur — il changerait le
     jour d'un domaine propre, et personne ne se souviendrait de ce fichier. */
  function base() {
    var logo = document.querySelector(".md-header__button.md-logo");
    return logo ? logo.href.replace(/[^/]*$/, "") : "/";
  }

  /* Où sommes-nous ? On compare les URL de l'arbre au chemin courant, et on
     garde la PLUS LONGUE qui corresponde : `chapters/classes/` et
     `chapters/classes/sorcerer/` matchent tous deux la seconde. */
  function situer(path) {
    var trouve = null;
    NAV.forEach(function (r) {
      r.pages.forEach(function (p) {
        if (p.url && path.indexOf("/" + p.url) !== -1)
          if (!trouve || p.url.length > trouve.page.url.length) trouve = {racine: r, page: p, fille: null};
        (p.filles || []).forEach(function (sb) {
          if (sb.url && path.indexOf("/" + sb.url) !== -1)
            if (!trouve || sb.url.length > (trouve.fille ? trouve.fille.url.length : trouve.page.url.length))
              trouve = {racine: r, page: p, fille: sb};
        });
      });
    });
    return trouve;
  }

  function listeTitres(url, titres, limite) {
    if (!titres || !titres.length) return null;
    var ul = elt("ul", "md-nav__list fh-group__subs");
    titres.forEach(function (t) {
      if (limite && t.n > limite) return;
      var li = elt("li", "md-nav__item");
      var a = elt("a", "md-nav__link fh-nav__t" + t.n, t.titre);
      a.href = base() + url + "#" + t.ancre;
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul.children.length ? ul : null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".fh-toc")) document.body.classList.add("fh-home-page");

    var logoBtn = document.querySelector(".md-header__button.md-logo");
    if (!document.querySelector(".fh-toc")) {
      var fab = elt("a", "fh-home--fab");
      fab.href = logoBtn ? logoBtn.href : "/";
      fab.setAttribute("aria-label", "Home");
      fab.innerHTML = "&#8962;";
      document.body.appendChild(fab);
    }

    var toc = document.querySelector(".md-sidebar--secondary .md-nav--secondary");
    if (!toc) return;

    if (!document.querySelector("main .fh-home")) {
      var homeLink = elt("a", "fh-home fh-home--toc");
      homeLink.href = logoBtn ? logoBtn.href : "/";
      homeLink.innerHTML = "&#8962; Home";
      toc.insertBefore(homeLink, toc.firstChild);
    }

    var ici = situer(window.location.pathname);
    if (!ici) return;

    var natif = toc.querySelector("ul.md-nav__list");
    if (natif) natif.remove();          /* l'arbre le remplace entièrement */

    var arbre = elt("ul", "md-nav__list fh-nav");

    NAV.forEach(function (r) {
      if (!r.pages.length) return;
      var courante = (r === ici.racine);
      var liR = elt("li", "md-nav__item fh-nav__r" + (courante ? " fh-nav__r--ouvert" : ""));
      var aR = elt("a", "md-nav__link fh-group__h1", r.titre);
      aR.href = base() + (r.pages[0].url || "");
      liR.appendChild(aR);

      /* ⛔ UN MENU REPLIÉ NE REND PAS SES ENFANTS. Les masquer en CSS les
         laisserait dans le document — lus par la recherche du navigateur et par
         un lecteur d'écran, alors qu'ils ne sont pas là pour l'œil. */
      if (courante) {
        var ulB = elt("ul", "md-nav__list fh-group__subs");
        r.pages.forEach(function (p) {
          var estIci = (p === ici.page);
          var liB = elt("li", "md-nav__item fh-nav__b" + (estIci ? " fh-nav__b--ici" : ""));
          var aB = elt("a", "md-nav__link fh-nav__lien" + (estIci ? " fh-group__h1--current" : ""), p.titre);
          aB.href = base() + p.url;
          liB.appendChild(aB);

          if (estIci) {
            var t = listeTitres(p.url, p.titres, 3);
            if (t) liB.appendChild(t);
            if (p.filles && p.filles.length) {
              var ulSB = elt("ul", "md-nav__list fh-group__subs");
              p.filles.forEach(function (sb) {
                var estFille = (ici.fille === sb);
                var liSB = elt("li", "md-nav__item fh-nav__sb" + (estFille ? " fh-nav__b--ici" : ""));
                var aSB = elt("a", "md-nav__link fh-nav__lien" + (estFille ? " fh-group__h1--current" : ""), sb.titre);
                aSB.href = base() + sb.url;
                liSB.appendChild(aSB);
                if (estFille) {
                  var ts = listeTitres(sb.url, sb.titres, 4);
                  if (ts) liSB.appendChild(ts);
                }
                ulSB.appendChild(liSB);
              });
              liB.appendChild(ulSB);
            }
          }
          ulB.appendChild(liB);
        });
        liR.appendChild(ulB);
      }
      arbre.appendChild(liR);
    });

    toc.appendChild(arbre);
  });

  /* Fast rules lookup during play: / and Ctrl/Cmd+K open and focus Material's
     native indexed search. Ignore / while the player is typing in a field. */
  document.addEventListener("keydown", function (event) {
    var tag = event.target && event.target.tagName;
    var isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (event.target && event.target.isContentEditable);
    var slash = event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey;
    var commandK = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);
    if (!slash && !commandK) return;

    var toggle = document.getElementById("__search");
    var query = document.querySelector('[data-md-component="search-query"]');
    if (!toggle || !query) return;

    event.preventDefault();
    toggle.checked = true;
    window.setTimeout(function () { query.focus(); }, 0);
  });
})();
