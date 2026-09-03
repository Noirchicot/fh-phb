# Le panneau

Cette page porte l'écran de référence du builder — 360 blg de large, deux hauteurs témoins, aucun défilement — et la loi du zoom qui fait tenir tout le reste à l'échelle. On y trouve aussi ce que le zoom a supprimé le 30 août : la grandeur « Large », l'homothétie locale `--u` et les crans manuels du Menu.

## L'écran de référence

<style>
.fh-croquis { margin: 1.2em 0; overflow-x: auto; }
.fh-croquis svg { max-width: 100%; height: auto; display: block; }
.fh-croquis .trait  { fill: none; stroke: var(--md-default-fg-color); stroke-width: 1.5; }
.fh-croquis .creux  { fill: var(--md-default-fg-color--lightest);
                      stroke: var(--md-default-fg-color--light); stroke-width: 1.5; }
.fh-croquis .plein  { fill: var(--md-default-fg-color--lighter);
                      stroke: var(--md-default-fg-color); stroke-width: 1.5; }
.fh-croquis .cote   { fill: none; stroke: var(--md-default-fg-color--light);
                      stroke-width: 1; }
.fh-croquis .fuite  { fill: none; stroke: var(--md-default-fg-color--lighter);
                      stroke-width: 1; stroke-dasharray: 3 3; }
.fh-croquis text    { fill: var(--md-default-fg-color); font-size: 11px;
                      font-family: system-ui, sans-serif; }
.fh-croquis .mou    { fill: var(--md-default-fg-color--light); font-size: 10px; }
.fh-croquis .gras   { font-weight: 700; }
</style>
<div class="fh-croquis">
<svg viewBox="0 0 490 640" role="img"
     aria-label="L'écran de référence du builder : 360 blg de large, 553 ou 667 de haut,
                 avec la ceinture de 60 en haut et le pied de 76 en bas.">
  <!-- la fenêtre jusqu'à 667 -->
  <rect class="fuite" x="132" y="56" width="288.0" height="533.6" rx="10"/>
  <!-- l'écran témoin 553 -->
  <rect class="trait" x="132" y="56" width="288.0" height="442.40000000000003" rx="10"/>
  <!-- ceinture -->
  <rect class="plein" x="132" y="56" width="288.0" height="48.0"/>
  <text x="276.0" y="84.0" text-anchor="middle" class="gras">ceinture ≈60</text>
  <!-- pied -->
  <rect class="plein" x="132" y="437.6" width="288.0" height="60.800000000000004"/>
  <text x="276.0" y="472.00000000000006" text-anchor="middle" class="gras">pied 76</text>
  <!-- contenu -->
  <text x="276.0" y="270.8" text-anchor="middle">le cadre d'écran</text>
  <text x="276.0" y="286.8" text-anchor="middle" class="mou">
    il commence SOUS la ceinture</text>
  <text x="276.0" y="304.8" text-anchor="middle" class="mou">
    ⛔ ne défile jamais</text>

  <!-- cote de largeur -->
  <line class="cote" x1="132" y1="40" x2="420.0" y2="40"/>
  <line class="cote" x1="132" y1="35" x2="132" y2="45"/>
  <line class="cote" x1="420.0" y1="35" x2="420.0" y2="45"/>
  <text x="276.0" y="32" text-anchor="middle" class="gras">360 blg</text>
  <text x="428.0" y="36" class="mou">⚠️ C4 : 375 ?</text>

  <!-- cotes de hauteur -->
  <line class="cote" x1="114" y1="56" x2="114" y2="498.40000000000003"/>
  <line class="cote" x1="109" y1="56" x2="119" y2="56"/>
  <line class="cote" x1="109" y1="498.40000000000003" x2="119" y2="498.40000000000003"/>
  <text x="106" y="277.20000000000005" text-anchor="end" class="gras">553</text>
  <text x="106" y="291.20000000000005" text-anchor="end" class="mou">Safari</text>
  <line class="fuite" x1="80" y1="56" x2="80" y2="589.6"/>
  <text x="76" y="583.6" text-anchor="end" class="gras">667</text>
  <text x="76" y="597.6" text-anchor="end" class="mou">plein écran</text>
  <line class="fuite" x1="76" y1="589.6" x2="420.0" y2="589.6"/>
</svg>
</div>

*Le croquis ne tranche rien : il montre les cotes telles que le corpus les écrit, ⚠️ [C4](../a-trancher.md#c4) comprise.*


### La largeur cible : 360 { #panneau-largeur-cible }

**La largeur cible du builder est 360, pas 375.**

⚠️ En contradiction avec le corpus — aucune autre règle ne porte l'autre camp — voir [C4](../a-trancher.md#c4).

??? note "Pourquoi, et depuis quand"
    *« 🔴 LA LARGEUR CIBLE — 360 px — ⛔ pas 375. C'est la base sur laquelle tout est dessiné. »* Et ce n'est pas une préférence : c'est ce qui a fabriqué la cote du jeton (`tokens.css:228`). *« Changer la cible change le jeton. Tout budget calculé sur 375 est faux : il donne du mou qui n'existe pas. »* Le « mou » de 58 px annoncé un jour venait d'un calcul à 375 — *« il n'existe pas »*.

    Valeur : `360` blg · rangée utile `278` · Source : NORMES.md § « 1 quater. LE BUDGET DE LA PAGE — la cible », 2026-08-26 · Statut : ratifié

### Toute mesure se prend à 360 { #panneau-compatibilite-360 }

**Toute mesure de largeur se prend à 360, et les grands écrans sont normalisés sur une largeur max.**

⚠️ En contradiction avec le corpus — aucune autre règle ne porte l'autre camp — voir [C4](../a-trancher.md#c4).

??? note "Pourquoi, et depuis quand"
    Eric : *« on vise toujours la compatibilité avec 360 sur tout le site »* · *« que ça tienne toujours en largeur sur 360, et que les grands écrans soient normalisés sur une largeur max »*. Un garde vérifie la largeur du banc — *« si le banc changeait de largeur en silence, toutes les mesures du dépôt parleraient d'un autre écran »*.

    Valeur : banc `banc-listes.html` à 360 · Source : NORMES.md § « 1 ter quater. 360 EST LA LARGEUR DE RÉFÉRENCE », 2026-08-29 · Statut : ratifié

### Les deux hauteurs de référence { #panneau-hauteurs-de-reference }

**Deux hauteurs servent de référence : ≈553 (Safari, barres visibles) et 667 (plein écran) ; toute conclusion de budget dit sur laquelle elle repose.**

??? note "Pourquoi, et depuis quand"
    *« Une conclusion qui tient sur 553 tient partout ; une conclusion qui n'a besoin que de 667 est fragile. »* ⚠️ Le 553 est marqué *« valeur courante, NON mesurée sur l'appareil »*.

    Valeur : `553` · `667` · Source : NORMES.md § « 1 quater. LE BUDGET DE LA PAGE — la cible », 2026-08-26 · Statut : ratifié (le 553 reste ⏳ non mesuré)

### La page ne défile jamais { #panneau-jamais-de-defilement }

**La page ne défile jamais — c'est structurel.**

??? note "Pourquoi, et depuis quand"
    c'est la contrainte qui donne son sens à tout le budget vertical : ce qui ne tient pas ne descend pas plus bas, il **passe à la page suivante** (§ `liste.pagination`) ou il **est en trop** (§ `budget.en-trop`). Deux exceptions nommées : le Seuil et le dressing (`geste.seuil-defile`, `geste.dressing-defile`).

    Valeur : `.app { height: 100dvh; overflow: hidden }` · Source : NORMES.md § « 1 quater », 2026-08-26 ; rappelé § « 5 bis » · Statut : ratifié

## Le `blg` et le zoom

### Le `blg`, unité de dessin { #panneau-blg }

**Le `blg` (« blurg ») est l'unité de dessin du builder : ce que vaut un `px` de feuille de style une fois le zoom appliqué.**

??? note "Pourquoi, et depuis quand"
    *« Le nombre de blg ne change JAMAIS ; c'est le pixel qui bouge sous lui. »* Deux organes à 8 et 16 blg restent dans un rapport de 1 à 2 sur n'importe quel écran, à n'importe quel cran.

    Valeur : `--t4: 16px` se lit « T4 = 16 blg » · rail = 90 blg · 10 blg = 10 px à ×1, 15 à ×1,5, 30 à ×3 · Source : NORMES.md § « 0 bis. LE ZOOM, ET LE `blg` — Le mot », 2026-08-30 · Statut : ratifié

### `blg` à l'écrit { #panneau-blg-a-l-ecrit }

**À l'écrit on écrit `blg` ; `bg` et `px` sont tolérés à l'oral seulement.**

??? note "Pourquoi, et depuis quand"
    Eric autorise `bg` ou `px` à l'oral — *« si je suis feignant »*. *« un nom qui dit deux choses n'a pas sa place ici »*.

    Valeur : `--bg` est déjà le parchemin (`tokens.css`) · Source : NORMES.md § « 0 bis — Le mot », 2026-08-30 · Statut : ratifié

### Tout le builder suit le zoom { #panneau-zoom-universel }

**Tout le builder suit le zoom ; aucun ratio ne change nulle part.**

??? note "Pourquoi, et depuis quand"
    Eric, en majuscules : *« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE PART. Tout grandit de manière proportionnelle. »* Et ça ne supprime aucune cote : *« Les 265 valeurs en pixels du dépôt étaient déjà des blg ; il leur manquait la déclaration qui le dit. »*

    Valeur : `zoom: var(--echelle)` sur `.app` — **une ligne** · Source : NORMES.md § « 0 bis », 2026-08-30 · Statut : ratifié

### Aucune valeur n'échappe au zoom { #panneau-zoom-sans-exception }

**Aucune valeur n'échappe au zoom — ni les filets d'un blg, ni les ombres, ni `--touch`.**

??? note "Pourquoi, et depuis quand"
    *« Une valeur qui resterait fixe pendant que le reste grandit change un rapport — c'est ce que la loi interdit. »*

    Source : NORMES.md § « 0 bis — Les six lois », 2026-08-30 · Statut : ratifié

### Le plancher de l'échelle { #panneau-plancher }

**Le plancher de l'échelle est 1 : rien ne rétrécit sous le barème ratifié, et aucun texte ne peut passer sous T1.**

??? note "Pourquoi, et depuis quand"
    *« le plancher c'est la taille 360 sur laquelle on travaille »* (Eric).

    Valeur : échelle ≥ 1 · plancher de 340 blg cité dans le repli · Source : NORMES.md § « 0 bis — Les six lois », 2026-08-30 · Statut : ratifié

### `--touch` sans `max()` { #panneau-touch-sans-max }

**`--touch` n'a plus de `max()` : 44 blg valent toujours ≥ 44 px.**

??? note "Pourquoi, et depuis quand"
    *« sur une échelle qui ne descend jamais. La loi d'Apple et celle d'Eric disent la même chose — tant que le plancher tient, et un garde le mesure. »*

    Valeur : `--touch: 44` · Source : NORMES.md § « 0 bis — Les six lois », 2026-08-30 · Statut : ratifié

### Le reflux oui, le redimensionnement non { #panneau-reflux-oui-redimensionnement-non }

**Le reflux survit, le redimensionnement meurt : une rangée peut passer de 4 cases à 3, une cote ne peut pas doubler sur grand écran.**

⚠️ En contradiction avec [`jeton.trois-colonnes-toujours`](../porteurs/jeton.md#jeton-trois-colonnes-toujours) · [`liste.trois-par-rangee-etait-un-accident`](listes.md#liste-trois-par-rangee-etait-un-accident) — voir [C17](../a-trancher.md#c17).

??? note "Pourquoi, et depuis quand"
    *« une rangée qui passe de 4 cases à 3 ne change aucun rapport (loi du 19/08, « si on peut faire 4, on fait 4 »). Une cote qui double sur grand écran, si. »*

    Source : NORMES.md § « 0 bis — Les six lois », 2026-08-30 ; loi du 19/08 · Statut : ratifié

### Jamais un `@media` de largeur { #panneau-jamais-de-media-largeur }

**Jamais un `@media` de largeur : la grandeur passe par `data-grandeur`, calculé sur `innerWidth / échelle`.**

??? note "Pourquoi, et depuis quand"
    un `@media` **ne se réévalue pas** sous `zoom` — *« mesuré au banc : à 1920 au cran 5, `min-width: 1140px` matchait encore et le rail rendait 600 px réels »*.

    Valeur : `data-grandeur` sur `<html>` · Source : NORMES.md § « 0 bis — Les six lois », 2026-08-30 · Statut : ratifié

### Les crans manuels retirés { #panneau-crans-manuels-retires }

🧊 **Renversée le 2026-09-02** — remplacée par l'échelle automatique, qui se règle sur la fenêtre : voir [`panneau.zoom-universel`](#panneau-zoom-universel).

**La rampe de crans manuels du Menu n'existe plus : la taille se règle en redimensionnant la fenêtre, et sur téléphone/tablette l'appareil décide.**

??? note "Pourquoi, et depuis quand"
    Eric : *« si l'auto fait bien son travail, effectivement les boutons sont obsolètes »*. Mesuré à 1366 × 1024 : Auto ×1,83, « Large » ×1,25 — *« le libellé mentait »*. Un cran manuel ne pouvait que rapetisser.

    Valeur : clefs `fhpc.echelle.cran*` effacées à chaque lecture (lot 118) · Source : NORMES.md § « 0 bis — Les six lois », **renversé le 2026-09-02** · Statut : renversé le 2026-09-02 — remplace la ligne « le cran est borné, jamais clampé »

## Le repli en `transform`

### Le repli en `transform: scale()` { #panneau-repli-transform }

⏸️ **En standby.** Mesure non faite.

**Un repli en `transform: scale()` est écrit mais NON construit, et il ne doit pas l'être avant mesure sur appareil.**

??? note "Pourquoi, et depuis quand"
    `zoom` vient d'IE, WebKit l'implémente depuis toujours, Firefox depuis la 126. Une détection automatique serait *« exactement le code mort que la loi §0.6 interdit »* : indistinguable au cran 1, elle doublerait le sens de chaque lecture géométrique. *« Si le verdict tombe mal, on substitue — quatre lignes contre quatre lignes. »* Instrument prêt : `ui/builder/diag.html`, cinq minutes sur l'appareil.

    Valeur : `.app { transform: scale(var(--echelle)); transform-origin: top left; width: calc(100%/E); height: calc(100%/E) }` · Source : NORMES.md § « 0 bis — Le repli désigné », 2026-08-30 au soir · Statut : en standby (⏳ mesure non faite)

### Ce que le repli changerait { #panneau-repli-ce-qui-change }

⏸️ **En standby.**

**Sous le repli, un `position: fixed` viserait `.app` et non la fenêtre, `.app` deviendrait un contexte d'empilement, et la netteté passerait au compositeur.**

??? note "Pourquoi, et depuis quand"
    mesuré — *« le GPU ÉTIRE LA TEXTURE… ça frise à l'œil »*. Le repli ne réserve aucune place de mise en page : un hôte `<div>` à hauteur `auto` recevrait `calc(100%/E)` résolu en `auto`.

    Valeur : `will-change: transform` déjà retiré de `.roue-cran` · Source : NORMES.md § « 0 bis — Le repli désigné », 2026-08-30 · Statut : en standby

## Ce que le zoom a supprimé

### La grandeur « Large » supprimée { #panneau-grandeur-large-supprimee }

🧊 **Renversée le 2026-08-30** — remplacée par le zoom global : voir [`panneau.zoom-universel`](#panneau-zoom-universel).

**La grandeur « Large » n'existe plus : `@media (min-width: 1140px)` et ses rehaussements de cotes sont retirés.**

??? note "Pourquoi, et depuis quand"
    *« elle rehaussait `--t6` de 22 à 28 pendant que `--t4` restait à 16 : le rapport titre/corps sautait de 1,375 à 1,75. Même métier que le zoom, fait deux fois et à moitié. »* Avec elle tombe la ligne *« T1–T4 ne bougent pas »* de `tokens.css` §69 : au cran 3 le corps vaut 48 blg.

    Valeur : `--t6` ne passe plus de 22 à 28 · `--rail-w` reste 90 · `--card-w`/`--panel-w` ne passent plus à 766/887 · Source : NORMES.md § « 0 bis — Ce que ça supprime » + CADRES.md § « 2 bis », **2026-08-30** · Statut : renversé le 2026-08-30

### L'homothétie `--u` retirée { #panneau-homothetie-u-retiree }

🧊 **Renversée le 2026-08-30** — remplacée par le zoom global : voir [`panneau.zoom-universel`](#panneau-zoom-universel).

**L'échelle locale `--u` de la carte-résumé est retirée : c'est le CRAN qui s'adapte à la fenêtre, plus chaque organe à sa boîte.**

??? note "Pourquoi, et depuis quand"
    Eric : *« la carte s'adaptait car je voulais que ça soit joli sur 2 proportionnalités différentes, donc là ça devient hors sujet »*. Et la mesure précédait l'argument : sous `zoom`, l'échelle locale devenait **non monotone** — à 1920 la dalle rendait `625 → 781 → 937 → 1420 → 920` aux cinq crans. *« Elle rétrécissait en zoomant. »*

    Valeur : garde `tests/fiche-moule.test.mjs` · Source : NORMES.md § « 4 quater — `--u` A ÉTÉ RETIRÉE », 2026-08-30 · Statut : renversé le 2026-08-30 — remplacé par le zoom global

### Le plafond `u = 1` levé { #panneau-plafond-u-leve }

🧊 **Renversée le 2026-08-30** — remplacée par le zoom global, qui est une croissance choisie : voir [`panneau.zoom-universel`](#panneau-zoom-universel).

**Le plafond d'échelle `u = 1` est levé.**

??? note "Pourquoi, et depuis quand"
    *« Il bornait une croissance SUBIE (le conteneur gonflait un dessin de téléphone en poster) ; le zoom est une croissance CHOISIE. Même goût, mécanisme opposé. »*

    Source : NORMES.md § « 4 quater », 2026-08-30 · Statut : renversé le 2026-08-30
