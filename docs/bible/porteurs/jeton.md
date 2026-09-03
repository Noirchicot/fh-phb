# Le jeton

Le jeton est l'objet qu'on glisse : un rectangle très arrondi de `87 × 48`, doré, à libellé `T1`.
Il n'en existe **qu'un seul modèle** — la seule exception admise est le jeton craft.

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### La forme du jeton { #jeton-forme }

**Un jeton est un rectangle très arrondi, et sa forme ne change jamais.**

??? note "Pourquoi, et depuis quand"
    *« UN ORGANE SE RECONNAÎT À SA FORME, PAS À SA COULEUR. La couleur peut changer, la forme ne change jamais. Deux organes qui se ressemblent sont deux organes qu'on confondra. »* La coupe d'angle appartient au bouton seul.

    Valeur : `--organe-rayon` · Source : NORMES.md § « 2. LES ORGANES », validé 2026-08-26 sur maquette · Statut : ratifié

### L'habit du jeton { #jeton-habit }

**Un jeton porte la couleur de base (le doré) et le relief — rien d'autre.**

⚠️ Cette règle se contredit elle-même dans le corpus — voir [C2](../a-trancher.md#c2).

??? note "Pourquoi, et depuis quand"
    *« Le jeton unique se construit d'abord ; tout le reste se pose PAR-DESSUS sans le redessiner. »* ⛔ *« Ce n'est pas de la dette, c'est une séquence »* : la couleur de base et le relief sont ce dont tous les jetons auront besoin, quelle que soit leur famille.

    Valeur : `--jeton-teinte` · `--relief` · +20 % d'accent sur sa dalle · Source : NORMES.md § « 2 bis », Eric 2026-08-26 : *« on ne fait rien pour le moment, juste la couleur de base et le relief »* · Statut : ratifié (⚠️ le voile cumulé est contradictoire — voir [C2](../a-trancher.md#c2))

### Il n'y a pas de variantes de jeton { #jeton-modele-unique }

**Il n'y a pas de variantes de jeton — une seule exception, les jetons craft.**

??? note "Pourquoi, et depuis quand"
    Eric : *« il n'y a pas de variantes de jetons (juste une exception : les jetons craft) »*. *« C'EST LA DÉCISION QUI FERME LE PLUS GROS NŒUD DE LA NOMENCLATURE »* — quatre points ouverts depuis des jours tombent ensemble *« parce qu'il n'y a rien à distinguer »*. Feat, feature, trait, training, skill, tool, équipement : le même jeton. Un objet rare n'a pas un bord différent.

    Valeur : ⛔ pas de liseré par famille · ⛔ pas d'échelle de valeur sur l'équipement · ⛔ le fond ne code rien · Source : NORMES.md § « 2 bis — IL N'Y A PAS DE VARIANTES DE JETON », tranché 2026-08-26 · Statut : ratifié

### La forme du jeton craft { #jeton-forme-du-craft }

⏳ **À trancher.**

**La forme du jeton CRAFT, seule exception admise, n'est pas décrite.**

??? note "Pourquoi, et depuis quand"
    c'est la seule exception admise par la décision « il n'y a pas de variantes de jetons » (26/08) — Eric l'a nommée, il ne l'a pas décrite : ⏳ « leur forme n'est pas décrite ».

    Source : NORMES.md § « 2 bis », 2026-08-26 · Statut : à trancher

### L'habit de la case de grille { #jeton-case-de-grille-habit-non-tranche }

⏳ **À trancher.**

**L'habit de la case de grille reste différent de celui du jeton, et ce n'est pas tranché.**

??? note "Pourquoi, et depuis quand"
    *« Eric a tranché LE CORPS, pas l'habit complet. ⛔ Ne pas aligner le reste sans lui. »*

    Valeur : elle porte `--radius-sm` (le jeton a `--organe-rayon`), `--surface` opaque (le jeton a `--jeton-teinte`), **aucun `--relief`** · Source : NORMES.md § « 2 bis », mesuré 2026-08-26 · Statut : à trancher

### Le texte sur un jeton reste en encre { #jeton-texte-en-encre }

**Le texte SUR un jeton reste en encre, jamais en bleu de lien.**

??? note "Pourquoi, et depuis quand"
    *« l'organe dit déjà qu'il répond »*.

    Valeur : `--text` · Source : NORMES.md § « 1 ter bis³ », Eric 2026-08-28 : *« pas besoin de mettre le texte des tokens en bleu, la carac d'un token est déjà de l'interactif sur un clic »* · Statut : ratifié

## Mesures

*ses cotes, et ce qui les calcule.*

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
<svg viewBox="0 0 420 280" role="img"
     aria-label="Le jeton mesure 87 sur 48 blg ; trois jetons et deux gouttières de 8
                 font 277 dans les 278 que la rangée offre à 360.">
  <text x="24" y="26" class="gras">Le jeton, et la rangée de trois — cotes en blg</text>
  <text x="24" y="42" class="mou">3 × 87 + 2 × 8 = 277, dans les 278 que la rangée offre à 360</text>
    <rect class="plein" x="46" y="82" width="87" height="48" rx="14"/>
  <text x="89.5" y="110.0" text-anchor="middle">jeton</text>
  <text x="137.0" y="144" text-anchor="middle" class="mou">8</text>
  <rect class="plein" x="141" y="82" width="87" height="48" rx="14"/>
  <text x="184.5" y="110.0" text-anchor="middle">jeton</text>
  <text x="232.0" y="144" text-anchor="middle" class="mou">8</text>
  <rect class="plein" x="236" y="82" width="87" height="48" rx="14"/>
  <text x="279.5" y="110.0" text-anchor="middle">jeton</text>
  <!-- cote d'un jeton -->
  <line class="cote" x1="46" y1="72" x2="133" y2="72"/>
  <line class="cote" x1="46" y1="68" x2="46" y2="76"/>
  <line class="cote" x1="133" y1="68" x2="133" y2="76"/>
  <text x="89.5" y="66" text-anchor="middle" class="gras">87</text>
  <line class="cote" x1="36" y1="82" x2="36" y2="130"/>
  <line class="cote" x1="32" y1="82" x2="40" y2="82"/>
  <line class="cote" x1="32" y1="130" x2="40" y2="130"/>
  <text x="30" y="110.0" text-anchor="end" class="gras">48</text>
  <!-- cote de la rangée -->
  <line class="cote" x1="46" y1="160" x2="323" y2="160"/>
  <line class="cote" x1="46" y1="156" x2="46" y2="164"/>
  <line class="cote" x1="323" y1="156" x2="323" y2="164"/>
  <text x="184.5" y="176" text-anchor="middle" class="gras">277</text>
  <line class="fuite" x1="323" y1="160" x2="324" y2="160"/>
  <text x="330" y="164" class="mou">278 · il reste 1</text>
  <!-- le collecteur, même cote -->
  <rect class="creux" x="46" y="192" width="87" height="48" rx="14"/>
  <text x="89.5" y="220.0" text-anchor="middle" class="mou">drop it here</text>
  <text x="145" y="214.0" class="mou">le collecteur a la MÊME cote —</text>
  <text x="145" y="228.0" class="mou">un seul jeton de mesure les sert tous deux</text>
</svg>
</div>

*La rangée est bornée à trois, à toute largeur — le blanc aux deux bouts est assumé ([`jeton.trois-colonnes-toujours`](#jeton-trois-colonnes-toujours)).*


### La cote du jeton { #jeton-cote }

**Un jeton mesure 87 × 48 blg.**

??? note "Pourquoi, et depuis quand"
    mesuré et écrit dans `tokens.css:228` — *« à 360 px la rangée dispose de 278, moins deux gouttières de 8, soit 87,3 pour trois ; 87 est donc la cote qui tient la promesse à la largeur cible, et un pixel de plus et on retombe à deux par ligne »*. Eric, en quatre messages : *« tous les tokens et leurs collecteurs, taille standard »* · *« Identity : taille token = taille collecteur ! »*

    Valeur : `--glisse-case` 87 · `--glisse-h` 48 · Source : NORMES.md § « LA TAILLE STANDARD — le token ET son collecteur », ratifié 2026-08-26 · Statut : ratifié

### Le corps du jeton : T1 { #jeton-corps-t1 }

**Le libellé d'un jeton est en T1.**

??? note "Pourquoi, et depuis quand"
    le moindre regret — *« à T1 tout rentre, donc aucun nom ne force à inventer une abréviation aujourd'hui »*. Mesuré dans la case réelle (87 px dont **77** utiles) : `Prestidigitation` fait 85 px à T2 (⛔) et **73 px à T1** (✅). Sur les 3 831 mots distincts du corpus, le seuil d'abréviation coupait **435** mots à T2 et **3** à T1, *« et zéro en anglais — la langue par défaut du Seuil »*.

    Valeur : `--t1` = 10 blg · `.choix-glisse .glisse-jeton` **et** `.glisse-jeton` nue · garde `tests/jeton-corps.test.mjs` · Source : NORMES.md § « LE CORPS DU JETON EST T1 », Eric 2026-08-26 : *« 13 T1 on aura moins d'enmerdes on jugera apres coup »* · Statut : ratifié

### La spécificité qui décide du corps { #jeton-specificite-du-corps }

**La règle nue ne dit pas le corps rendu : `.choix-glisse .glisse-jeton` (0,0,2,0) bat `.glisse-jeton` (0,0,1,0).**

??? note "Pourquoi, et depuis quand"
    *« §0 Google Headless, le même piège que le rayon de 4 px du lignage. »*

    Valeur : le jeton rendait 12 px pendant que sa règle nue en annonçait 14 · Source : NORMES.md § « LE CORPS DU JETON EST T1 — deux pièges mesurés », 2026-08-26 · Statut : ratifié

### Le seuil d'abréviation : 16 { #jeton-abrege-16 }

**Le seuil d'abréviation est de 16 caractères.**

??? note "Pourquoi, et depuis quand"
    le corps est passé à T1, donc le seuil devait suivre — *« garder une conséquence après avoir retiré sa cause, c'est laisser le code mentir »*. La méthode du 19/08 (« un cran sous le dernier qui passe ») donnait 15, mais **15 abrégerait le mot-témoin lui-même** : *« Le seuil aurait annulé le bénéfice qu'il était censé servir. »* À 16 : 3 mots abrégés sur 3 831, tous français.

    Valeur : `ABREGE_MAX = 16` (valait 10, déduit de `--t2`) · Source : NORMES.md § « LE SEUIL D'ABRÉVIATION SUIT LE CORPS », Eric 2026-08-26 : *« 16 — garde ce que tu as fait »* · Statut : ratifié

### Un compte de caractères n'est pas une largeur { #jeton-un-compte-n-est-pas-une-largeur }

**Aucun seuil en caractères ne sépare deux mots de même longueur : le repli `overflow-wrap: break-word` rattrape le cas.**

??? note "Pourquoi, et depuis quand"
    *« ⛔ Aucun seuil en caractères ne sépare ces deux-là. »* La case garde ses 48 px.

    Valeur : `supplémentaires` 15 car. = 80 px (sort) · `Prestidigitation` 16 car. = 73 px (tient) · Source : NORMES.md § « 2 bis », mesuré 2026-08-26 · Statut : ratifié

### Deux lecteurs, un seul jeton de mesure { #jeton-deux-lecteurs-un-jeton-de-mesure }

**Le jeton et son collecteur lisent le MÊME jeton de mesure, jamais deux nombres égaux.**

??? note "Pourquoi, et depuis quand"
    *« deux nombres égaux divergent au premier qui bouge, et personne ne voit le jour où ils l'ont fait »*.

    Valeur : `flex: 0 0 var(--glisse-case); max-width: var(--glisse-case)` sur `.glisse-vivier > li` et `.glisse-creneaux:not(.ability-creneaux) > .glisse-creneau` · Source : NORMES.md § « LA TAILLE STANDARD », 2026-08-26 · Statut : ratifié

### Trois jetons par ligne au vivier { #jeton-trois-par-ligne }

**Un vivier ne dépasse jamais trois jetons par ligne, à toute largeur.**

??? note "Pourquoi, et depuis quand"
    mesuré avant la coupure — *« même base, même borne » donnait la borne des collecteurs au vivier — Alignment rendait 9 jetons en 4+4+1 »*.

    Valeur : borne câblée en dur dans le vivier (≠ `--par-rangee`, qui est la loi des collecteurs) · Source : NORMES.md § « TROIS MAX POUR UNE SÉLECTION », Eric 2026-08-26 : *« oui, 4 collecteurs à côté sur une ligne on peut ; mais pas une SÉLECTION de 4 tokens, là c'est 3 max »* ; précisé le 29/08 : *« jamais plus, jamais moins »* · Statut : ratifié

### Trois colonnes, toujours { #jeton-trois-colonnes-toujours }

**La rangée reste à trois colonnes même sur écran large, et le blanc aux deux bouts est assumé.**

⚠️ En contradiction avec [`liste.trois-par-rangee-etait-un-accident`](../general/listes.md#liste-trois-par-rangee-etait-un-accident) · [`panneau.reflux-oui-redimensionnement-non`](../general/panneau.md#panneau-reflux-oui-redimensionnement-non) — voir [C17](../a-trancher.md#c17).

??? note "Pourquoi, et depuis quand"
    la loi A (*« la rangée en met autant qu'elle peut : 3 dès 277 · 4 dès 372 · 5 dès 467 »*) vivait dans le vivier pendant que la grille de R imposait déjà trois. *« Les deux ne peuvent pas être vraies en même temps. »* Sa raison est écrite dans le code depuis le 23/08 : *« R est une grille à position stable — un objet ne change pas de place selon l'écran »* ; sinon *« le joueur perd le seul repère qu'il a »*. ⚠️ Ce que ça coûte, dit plutôt que masqué : du blanc aux deux bouts.

    Valeur : rangée = `3 × --glisse-case + 2 × --sp-8` = **277**, `margin-inline: auto` · Source : NORMES.md § « 1 quater », **renversement du 2026-08-26** — Eric : *« trois colonnes, toujours »* · Statut : ratifié — renverse la loi A du 19/08

<!-- DESSIN À FAIRE — la rangée à trois colonnes sur écran large, et le blanc aux deux bouts — le coût, montré plutôt que masqué -->

### La case ne s'étire pas { #jeton-la-case-ne-s-etire-pas }

**La case ne grandit pas pour remplir sa rangée.**

??? note "Pourquoi, et depuis quand"
    *« une case qui s'étire ne laisse RIEN à centrer »*, et le centrage du reliquat (§5) disparaîtrait.

    Source : NORMES.md § « 1 quater », 2026-08-26 · Statut : ratifié

### Jamais de base en pourcentage { #jeton-jamais-de-base-en-pourcentage }

**Une case ne prend jamais une base en pourcentage : c'est la RANGÉE qu'on borne, pas la case.**

??? note "Pourquoi, et depuis quand"
    un vivier n'a pas de largeur imposée, il se mesure sur son contenu — la base en pourcentage y est **circulaire**, et les bonus tokens `+1` / `+2` d'*Ability boosts* sont tombés à **12 × 48 px**. ⚠️ *« ET ELLE PASSAIT SIX MESURES JUSTES »* (Lineage à 360, 372, 467, 900, 1100, 1600) : *« le NOMBRE de mesures ne rachète pas un témoin unique »*.

    Valeur : ⛔ `flex: 0 1 calc((100% − 2 gouttières) / 3)` — déployé une journée (v311, 26/08) · Source : NORMES.md § « TROIS MAX POUR UNE SÉLECTION », 2026-08-26 · Statut : ratifié

### Un organe ne rétrécit jamais { #jeton-un-organe-ne-retrecit-jamais }

**Un organe ne rétrécit jamais sous sa cote : `flex: 0 0`, jamais `0 1`.**

??? note "Pourquoi, et depuis quand"
    *« Un `shrink` non nul rend la cote partagée décorative. »*

    Valeur : mesuré — un jeton en `flex: 0 1` s'écrasait à **10 px** contre 74 · Source : NORMES.md § « 1 ter bis », 2026-08-29 · Statut : ratifié

### La case cède en pagination { #jeton-la-case-cede-en-pagination }

**Sous pagination, la case cède sa largeur — elle ne passe pas à la ligne.**

??? note "Pourquoi, et depuis quand"
    deux gouttières de chevron coûtent `2 × --touch + 2 × --sp-4` = **96 px**, il ne reste que 201 pour trois cases qui en demandent 277. Sinon la rangée retombe à deux par ligne, *« ce qui contredit « trois colonnes, toujours » et rend la pagination inutile : quinze jetons sur deux colonnes pèsent 440 px, autant que trente-et-un sur trois »*.

    Valeur : sans pagination **87** · tambour d'Équipement **75** (mesuré, en production depuis le 24/08) · vivier paginé **62** · Source : NORMES.md § « 1 quater — le budget d'une page de jetons », mesuré par le lot A 2026-08-26 · Statut : ratifié

### La base en tiers de rangée { #jeton-base-en-tiers-de-rangee }

**Pour qu'une ligne contienne trois cases par construction, on donne à la case un tiers de la rangée comme base.**

??? note "Pourquoi, et depuis quand"
    *« `flex-shrink` seul n'y suffit pas — un conteneur qui enveloppe passe à la ligne AVANT de rétrécir. Le découpage en lignes se fait sur la taille hypothétique de chaque case ; le rétrécissement ne travaille que sur une ligne déjà trop pleine. »*

    Source : NORMES.md § « 1 quater », loi du souple mesurée par le lot A 2026-08-26 · Statut : ratifié

### Six dés sur une ligne { #jeton-six-des-sur-une-ligne }

**Les dés d'Ability rolls tiennent à SIX sur une ligne, jetons comme collecteurs, dans leur organe propre.**

??? note "Pourquoi, et depuis quand"
    exception nommée à `jeton.trois-par-ligne`. Et la taille ne bouge jamais : un collecteur = un jeton.

    Valeur : 1 dé = 1 jeton · `fs-rangee` / `ability-creneaux`, hors vivier · Source : NORMES.md § « 1 ter ter », 2026-08-29 au soir · Statut : ratifié

### Jetons et boutons sont sacrés { #jeton-sacre }

**Les jetons et les boutons sont SACRÉS : leur cote et leur corps ne cèdent jamais.**

??? note "Pourquoi, et depuis quand"
    *« LOI DE DERNIER RECOURS, ET ELLE SE DÉCLENCHE EXACTEMENT QUAND ON EN A BESOIN »* — deux pixels de moins ne se voient pas *sur une case*, *« ils se voient sur toutes »*. Éprouvé sur Identity : 78 px de trop au départ, **0** à l'arrivée, sans qu'un jeton ni un bouton bouge. ⛔ Ce qui a été refusé et qui aurait « marché » : descendre le corps du jeton — *« ça n'aurait d'ailleurs rien rendu : la case mesure 48 px par GABARIT, quel que soit le corps qu'elle porte »*.

    Valeur : sacré = cote 87 × 48, corps T1, cible tactile 44, gabarit d'un bouton libellé · pas sacré = écarts, corps des titres, marges d'un champ, gouttières · Source : NORMES.md § « LES JETONS ET LES BOUTONS SONT SACRÉS », Eric 2026-08-26 : *« les jetons et les boutons sont sacrés »* · *« on les laisse en paix »* · Statut : ratifié

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Le vocabulaire des abrégés { #jeton-standard-d-abreviations }

⏳ **À trancher.**

**Le vocabulaire des abrégés n'existe pas — le seuil est tranché, pas le vocabulaire.**

??? note "Pourquoi, et depuis quand"
    Eric : *« saves pourrait s'écrire SV, advantage ADV »*.

    Valeur : deux abréviations ratifiées seulement : **ADV** (advantage), **SV** (saves) · Source : NORMES.md § « 2 bis » + § « 4 quater », 2026-08-26 / 2026-08-27 · Statut : à trancher

### La case de grille est un jeton { #jeton-case-de-grille-est-un-jeton }

**La case du tambour d'Équipement (`.grille-jeton`) est un jeton, et porte T1.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« ET J'AVAIS SOUTENU L'INVERSE, À TORT »* — la feuille disait déjà le contraire : `.carte-r .grille-jeton { touch-action: none }`, et son propre commentaire l'écrit. *« Elle se glisse. C'est un jeton. »* Leçon : *« j'ai tiré une distinction d'un RAISONNEMENT sur les gestes au lieu de lire ce que le code FAIT du geste »*.

    Valeur : `--t1` · Source : NORMES.md § « LA CASE DE LA GRILLE EST UN JETON », Eric 2026-08-26 : *« c'est un jeton — aligne-la sur T1 »* · Statut : ratifié

### Le bonus token { #jeton-bonus-token }

**Un bonus token est un jeton ordinaire dont le libellé est un nombre.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« Ce n'est pas une variante de jeton (il n'y en a pas). »*

    Valeur : `+1`, `+2`, `+x` · Source : NORMES.md § « LA TAILLE STANDARD — Vocabulaire », Eric 2026-08-26 : *« les +1 / +2 / +x sont des tokens »* · *« on va les appeler des BONUS TOKENS, taille standard »* · Statut : ratifié

### Les exceptions nommées { #jeton-exceptions-nommees }

**Les exceptions de jeton et de collecteur sont nommées par Eric : les augmentations de caractéristique et les ability rolls.**

??? note "Pourquoi, et depuis quand"
    les six collecteurs de caracs — *« leur nombre est dicté par la fiche, pas par la mise en page »* ; l'ability roll — *« l'objet qu'on prend est un dé, pas un jeton : il porte `fs-de` et non `glisse-jeton`, et sa forme dit qu'il a été jeté »*.

    Valeur : `data-rangs="caracs"` · `fs-rangee` / `ability-creneaux` · Source : NORMES.md § « LES EXCEPTIONS EXISTENT », Eric 2026-08-26 : *« il y aura des exceptions pour tokens et collecteurs, mais ils doivent être argumentés. Notamment pour les augmentations des caractéristiques, ou les ability rolls. »* · Statut : ratifié
