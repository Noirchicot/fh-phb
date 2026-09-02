# Les organes

Cette page décrit les pièces qu'on touche : le jeton et son collecteur, le bouton et ses quatre couleurs, puis l'interrupteur, le voyant, le chevron, le popup, le `?`, le livre, le dropdown et la zone de saisie. Un organe se reconnaît à sa forme, jamais à sa couleur — c'est la loi qui tient toute la page.

## Le jeton

### La cote du jeton { #jeton-cote }

**Un jeton mesure 87 × 48 blg.**

??? note "Pourquoi, et depuis quand"
    mesuré et écrit dans `tokens.css:228` — *« à 360 px la rangée dispose de 278, moins deux gouttières de 8, soit 87,3 pour trois ; 87 est donc la cote qui tient la promesse à la largeur cible, et un pixel de plus et on retombe à deux par ligne »*. Eric, en quatre messages : *« tous les tokens et leurs collecteurs, taille standard »* · *« Identity : taille token = taille collecteur ! »*

    Valeur : `--glisse-case` 87 · `--glisse-h` 48 · Source : NORMES.md § « LA TAILLE STANDARD — le token ET son collecteur », ratifié 2026-08-26 · Statut : ratifié

### La forme du jeton { #jeton-forme }

**Un jeton est un rectangle très arrondi, et sa forme ne change jamais.**

??? note "Pourquoi, et depuis quand"
    *« UN ORGANE SE RECONNAÎT À SA FORME, PAS À SA COULEUR. La couleur peut changer, la forme ne change jamais. Deux organes qui se ressemblent sont deux organes qu'on confondra. »* La coupe d'angle appartient au bouton seul.

    Valeur : `--organe-rayon` · Source : NORMES.md § « 2. LES ORGANES », validé 2026-08-26 sur maquette · Statut : ratifié

### L'habit du jeton { #jeton-habit }

**Un jeton porte la couleur de base (le doré) et le relief — rien d'autre.**

⚠️ Cette règle se contredit elle-même dans le corpus — voir [C2](a-trancher.md#c2).

??? note "Pourquoi, et depuis quand"
    *« Le jeton unique se construit d'abord ; tout le reste se pose PAR-DESSUS sans le redessiner. »* ⛔ *« Ce n'est pas de la dette, c'est une séquence »* : la couleur de base et le relief sont ce dont tous les jetons auront besoin, quelle que soit leur famille.

    Valeur : `--jeton-teinte` · `--relief` · +20 % d'accent sur sa dalle · Source : NORMES.md § « 2 bis », Eric 2026-08-26 : *« on ne fait rien pour le moment, juste la couleur de base et le relief »* · Statut : ratifié (⚠️ le voile cumulé est contradictoire — voir [C2](a-trancher.md#c2))

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

### L'habit de la case de grille { #jeton-case-de-grille-habit-non-tranche }

⏳ **À trancher.**

**L'habit de la case de grille reste différent de celui du jeton, et ce n'est pas tranché.**

??? note "Pourquoi, et depuis quand"
    *« Eric a tranché LE CORPS, pas l'habit complet. ⛔ Ne pas aligner le reste sans lui. »*

    Valeur : elle porte `--radius-sm` (le jeton a `--organe-rayon`), `--surface` opaque (le jeton a `--jeton-teinte`), **aucun `--relief`** · Source : NORMES.md § « 2 bis », mesuré 2026-08-26 · Statut : à trancher

### Deux lecteurs, un seul jeton de mesure { #jeton-deux-lecteurs-un-jeton-de-mesure }

**Le jeton et son collecteur lisent le MÊME jeton de mesure, jamais deux nombres égaux.**

??? note "Pourquoi, et depuis quand"
    *« deux nombres égaux divergent au premier qui bouge, et personne ne voit le jour où ils l'ont fait »*.

    Valeur : `flex: 0 0 var(--glisse-case); max-width: var(--glisse-case)` sur `.glisse-vivier > li` et `.glisse-creneaux:not(.ability-creneaux) > .glisse-creneau` · Source : NORMES.md § « LA TAILLE STANDARD », 2026-08-26 · Statut : ratifié

### Le bonus token { #jeton-bonus-token }

**Un bonus token est un jeton ordinaire dont le libellé est un nombre.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« Ce n'est pas une variante de jeton (il n'y en a pas). »*

    Valeur : `+1`, `+2`, `+x` · Source : NORMES.md § « LA TAILLE STANDARD — Vocabulaire », Eric 2026-08-26 : *« les +1 / +2 / +x sont des tokens »* · *« on va les appeler des BONUS TOKENS, taille standard »* · Statut : ratifié

### Trois jetons par ligne au vivier { #jeton-trois-par-ligne }

**Un vivier ne dépasse jamais trois jetons par ligne, à toute largeur.**

??? note "Pourquoi, et depuis quand"
    mesuré avant la coupure — *« même base, même borne » donnait la borne des collecteurs au vivier — Alignment rendait 9 jetons en 4+4+1 »*.

    Valeur : borne câblée en dur dans le vivier (≠ `--par-rangee`, qui est la loi des collecteurs) · Source : NORMES.md § « TROIS MAX POUR UNE SÉLECTION », Eric 2026-08-26 : *« oui, 4 collecteurs à côté sur une ligne on peut ; mais pas une SÉLECTION de 4 tokens, là c'est 3 max »* ; précisé le 29/08 : *« jamais plus, jamais moins »* · Statut : ratifié

### Trois colonnes, toujours { #jeton-trois-colonnes-toujours }

**La rangée reste à trois colonnes même sur écran large, et le blanc aux deux bouts est assumé.**

⚠️ En contradiction avec [`liste.trois-par-rangee-etait-un-accident`](listes.md#liste-trois-par-rangee-etait-un-accident) · [`panneau.reflux-oui-redimensionnement-non`](panneau.md#panneau-reflux-oui-redimensionnement-non) — voir [C17](a-trancher.md#c17).

??? note "Pourquoi, et depuis quand"
    la loi A (*« la rangée en met autant qu'elle peut : 3 dès 277 · 4 dès 372 · 5 dès 467 »*) vivait dans le vivier pendant que la grille de R imposait déjà trois. *« Les deux ne peuvent pas être vraies en même temps. »* Sa raison est écrite dans le code depuis le 23/08 : *« R est une grille à position stable — un objet ne change pas de place selon l'écran »* ; sinon *« le joueur perd le seul repère qu'il a »*. ⚠️ Ce que ça coûte, dit plutôt que masqué : du blanc aux deux bouts.

    Valeur : rangée = `3 × --glisse-case + 2 × --sp-8` = **277**, `margin-inline: auto` · Source : NORMES.md § « 1 quater », **renversement du 2026-08-26** — Eric : *« trois colonnes, toujours »* · Statut : ratifié — renverse la loi A du 19/08

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

### Les exceptions nommées { #jeton-exceptions-nommees }

**Les exceptions de jeton et de collecteur sont nommées par Eric : les augmentations de caractéristique et les ability rolls.**

??? note "Pourquoi, et depuis quand"
    les six collecteurs de caracs — *« leur nombre est dicté par la fiche, pas par la mise en page »* ; l'ability roll — *« l'objet qu'on prend est un dé, pas un jeton : il porte `fs-de` et non `glisse-jeton`, et sa forme dit qu'il a été jeté »*.

    Valeur : `data-rangs="caracs"` · `fs-rangee` / `ability-creneaux` · Source : NORMES.md § « LES EXCEPTIONS EXISTENT », Eric 2026-08-26 : *« il y aura des exceptions pour tokens et collecteurs, mais ils doivent être argumentés. Notamment pour les augmentations des caractéristiques, ou les ability rolls. »* · Statut : ratifié

### Six dés sur une ligne { #jeton-six-des-sur-une-ligne }

**Les dés d'Ability rolls tiennent à SIX sur une ligne, jetons comme collecteurs, dans leur organe propre.**

??? note "Pourquoi, et depuis quand"
    exception nommée à `jeton.trois-par-ligne`. Et la taille ne bouge jamais : un collecteur = un jeton.

    Valeur : 1 dé = 1 jeton · `fs-rangee` / `ability-creneaux`, hors vivier · Source : NORMES.md § « 1 ter ter », 2026-08-29 au soir · Statut : ratifié

### Le texte sur un jeton reste en encre { #jeton-texte-en-encre }

**Le texte SUR un jeton reste en encre, jamais en bleu de lien.**

??? note "Pourquoi, et depuis quand"
    *« l'organe dit déjà qu'il répond »*.

    Valeur : `--text` · Source : NORMES.md § « 1 ter bis³ », Eric 2026-08-28 : *« pas besoin de mettre le texte des tokens en bleu, la carac d'un token est déjà de l'interactif sur un clic »* · Statut : ratifié

### Jetons et boutons sont sacrés { #jeton-sacre }

**Les jetons et les boutons sont SACRÉS : leur cote et leur corps ne cèdent jamais.**

??? note "Pourquoi, et depuis quand"
    *« LOI DE DERNIER RECOURS, ET ELLE SE DÉCLENCHE EXACTEMENT QUAND ON EN A BESOIN »* — deux pixels de moins ne se voient pas *sur une case*, *« ils se voient sur toutes »*. Éprouvé sur Identity : 78 px de trop au départ, **0** à l'arrivée, sans qu'un jeton ni un bouton bouge. ⛔ Ce qui a été refusé et qui aurait « marché » : descendre le corps du jeton — *« ça n'aurait d'ailleurs rien rendu : la case mesure 48 px par GABARIT, quel que soit le corps qu'elle porte »*.

    Valeur : sacré = cote 87 × 48, corps T1, cible tactile 44, gabarit d'un bouton libellé · pas sacré = écarts, corps des titres, marges d'un champ, gouttières · Source : NORMES.md § « LES JETONS ET LES BOUTONS SONT SACRÉS », Eric 2026-08-26 : *« les jetons et les boutons sont sacrés »* · *« on les laisse en paix »* · Statut : ratifié

## Le collecteur

### La cote du collecteur { #collecteur-cote }

**Un collecteur a toujours exactement la taille d'un jeton, partout.**

⚠️ En contradiction avec [`collecteur.equipement-44`](#collecteur-equipement-44) — voir [C3](a-trancher.md#c3).

??? note "Pourquoi, et depuis quand"
    la cote ne s'écrit nulle part, elle se **déduit du cadre** une seule fois et les deux organes la lisent. *« Deux nombres égaux divergent au premier qui bouge ; un jeton de mesure partagé ne peut pas diverger. »*

    Valeur : `--collecteur-case`, déclarée sur `.choix-glisse` · garde `tests/collecteur-jeton.test.mjs` · Source : NORMES.md § « 1 ter bis », Eric 2026-08-29 : *« taille du collecteur toujours la même que le jeton, partout »* puis *« règle universelle : un collecteur = un jeton en taille. Ne varie jamais. »* · Statut : ratifié (⚠️ contredit par le collecteur d'Équipement à 44 — voir [C3](a-trancher.md#c3))

### La cote se déclare sur l'ancêtre commun { #collecteur-cote-sur-l-ancetre-commun }

**Une cote partagée se déclare sur l'ANCÊTRE COMMUN des deux organes, jamais sur l'un des deux.**

??? note "Pourquoi, et depuis quand"
    *« LE TROISIÈME EST LE PLUS RETORS, ET C'EST UNE LOI GÉNÉRALE : un pourcentage se résout chez celui qui l'utilise. Une cote partagée n'est partagée que si sa BASE l'est. »*

    Valeur : mesuré — la cote à `25%` rendait 63 contre 74 (vivier 277, rangée 320) · Source : NORMES.md § « 1 ter bis — trois façons de la faire diverger », 2026-08-29 · Statut : ratifié

### Une cote dictée par un voisin n'est pas une cote { #collecteur-cote-dictee-par-un-voisin }

**Une cote dictée par un voisin n'est pas une cote : le vivier se centre dans sa rangée au lieu de s'étirer.**

??? note "Pourquoi, et depuis quand"
    ce n'était pas le nom qui poussait — *« la colonne du chevron (flèche + compte, 60 px) étirait le vivier par le `align-items: stretch` de la rangée, et le jeton suivait »*. L'égalisation par CONTENU (deux jetons côte à côte, un nom qui se replie) vit un niveau plus bas et reste intacte.

    Valeur : mesuré — jeton **87 × 60** contre case **87 × 48** ; parade `align-self: center` (`listes.css`) · Source : NORMES.md § « La leçon d'« Unseen Servant » », 2026-08-29 · Statut : ratifié

### Un collecteur vide est creux { #collecteur-vide-est-creux-et-sans-lisere }

**Un collecteur vide est creux, sans aucun liseré visible.**

??? note "Pourquoi, et depuis quand"
    la cible s'allume au moment où on l'approche (`[data-vise]`) — *« un contour qui crie en permanence pour un rôle qu'il ne joue qu'à l'instant du dépôt ajoute une boîte à un écran qui en porte déjà douze »*. 🔴 Mais la bordure RESTE en transparent : *« un `border-style: none` ferait disparaître 2 px de chaque côté : la case sauterait au moment où elle se remplit, et le geste le plus important de l'écran ferait bouger ce qu'on vient de viser. »*

    Valeur : `--creux` · bordure **transparente**, jamais `border-style: none` · Source : NORMES.md § « 2 ter — précision ② », Eric 2026-08-26 : *« on voit bien le liseré quand il est rempli, ton pointillé sert à rien »* · Statut : ratifié

### « drop it here » { #collecteur-drop-it-here }

**Un collecteur vide affiche « drop it here » en T1 minuscules, italique, à la couleur du libellé — et le mot s'efface au remplissage.**

??? note "Pourquoi, et depuis quand"
    le contour tireté parti, *« un tiret seul ne dit plus ce qu'on attend de vous »*. Le mot occupe la ligne que le tiret occupait déjà, dans le même corps : il ne coûte rien. L'italique et la couleur d'étiquette le rangent du bon côté : sans eux il se lisait comme une réponse — *« comme si le personnage s'appelait « drop it here » »*. Les minuscules sont garanties par la règle : le nom porte `text-transform: uppercase`, la valeur porte `none`.

    Valeur : `--text-muted` italique (`rgb(146,140,127)`) vide → `rgb(216,211,201)` droit rempli · `[data-rempli="false"]` · Source : NORMES.md § « 2 ter — précisions ③ et ④ », Eric 2026-08-26 : *« drop it here en T1 dans le collecteur, ça disparaît quand c'est rempli »* · *« en minuscules bien sûr »* · *« de la même couleur qu'Alignment, et en italique »* · Statut : ratifié

### Rempli, il prend l'habit du jeton { #collecteur-rempli-prend-l-habit-du-jeton }

**Rempli, un collecteur prend le doré ET le relief du jeton.**

??? note "Pourquoi, et depuis quand"
    ⛔ **ce que ça répare** : avant le 26/08 l'état peignait le FOND — *« un créneau invalide effaçait le doré sous un lavis rouge. Le joueur perdait l'information « il y a un objet là-dedans » au moment précis où il en a le plus besoin pour le retirer. »*

    Valeur : `--jeton-teinte` + `--relief` · Source : NORMES.md § « 2 ter », Eric 2026-08-26 : *« rempli prend le doré ET LE RELIEF du jeton, juste un liseré bleu autour pour rappeler que c'est un collecteur »* · Statut : ratifié

### Deux canaux : le remplissage et le liseré { #collecteur-deux-canaux }

**Le REMPLISSAGE dit ce que le collecteur porte, le LISERÉ dit son état.**

??? note "Pourquoi, et depuis quand"
    *« DEUX CANAUX, DEUX MESSAGES, ET C'EST LA TROUVAILLE. »*

    Source : NORMES.md § « 2 ter », 2026-08-26 · Statut : ratifié

### Les couleurs du liseré { #collecteur-lisere-etats }

**Le liseré porte les codes couleur : bleu = pose valide, rouge = mauvaise pose, vert = tout posé.**

??? note "Pourquoi, et depuis quand"
    *« une pose valide = récepteur BLEU, une mauvaise pose = ROUGE, toutes les poses valides = tous VERTS »*, et la raison d'Eric tient avec : *« un vert posé dès le premier dépôt ne laisse plus rien à dire quand tout est fini — il dépense la récompense trop tôt »*.

    Valeur : 2 px · `--creneau-lisere-rempli` · Source : NORMES.md § « 2 ter », Eric 2026-08-26 ; échelle du 2026-08-19 · Statut : ratifié

### Le liseré rempli : 2 px { #collecteur-lisere-2px }

**Le liseré rempli vaut 2 px, et 2 px est un JETON, pas un littéral.**

??? note "Pourquoi, et depuis quand"
    à 1 px il se confondait avec le liseré que tout organe porte, *« alors qu'il est le seul trait de l'écran qui dise « cette case a reçu quelque chose » »*. ⚠️ Première lecture fausse : *« j'avais épaissi la bordure de BASE, donc le pointillé d'attente en même temps. Une case vide n'a rien à crier ; une case remplie, si. »*

    Valeur : `--creneau-lisere-rempli: 2px` · Source : NORMES.md § « 2 ter — précision ① », Eric 2026-08-26 : *« le collecteur doit doubler son épaisseur de liseré, trop fin pas assez visible »* · Statut : ratifié

### Le liseré entoure, il ne recouvre pas { #collecteur-lisere-entoure-ne-recouvre-pas }

**Le liseré entoure le jeton, il ne le recouvre pas.**

??? note "Pourquoi, et depuis quand"
    *« Rien du jeton n'est mangé. »* Mesuré à 375 × 553 : `2px solid rgb(70,157,106)` contre `2px solid transparent`, **tous deux 87 × 48** — aucun saut.

    Valeur : sonde horizontale — fond de page · **1 seul pixel de liseré** · une transition · le doré, stable · Source : NORMES.md § « 2 ter », mesuré 2026-08-26 à la demande d'Eric · Statut : ratifié

### Le relief remplace le creux { #collecteur-relief-remplace-le-creux }

**Le relief REMPLACE le creux, il ne s'y ajoute pas.**

??? note "Pourquoi, et depuis quand"
    *« un creux dit « pose ici », un relief dit « quelque chose est posé ». Les garder tous les deux ferait un organe qui demande et qui a reçu en même temps. »*

    Source : NORMES.md § « 2 ter », 2026-08-26 · Statut : ratifié

### Quatre collecteurs par ligne { #collecteur-quatre-par-ligne }

**Les collecteurs ne dépassent jamais quatre par ligne ; au-delà on passe à la ligne, et une ligne incomplète se centre.**

??? note "Pourquoi, et depuis quand"
    ⚠️ *« LES DEUX RÈGLES DE LARGEUR SE CONTREDISENT SI ON LES ÉCRIT EN NOMBRES. À 360 la rangée offre 320, et quatre cases pleines plus leurs gouttières en demandent 372. »* C'est la cote déduite qui les réconcilie — *« sur un grand écran le socle plafonne, à l'étroit le quart gagne et le vide cède, jamais l'organe »*.

    Valeur : `--par-rangee` = 4 · formule `min(socle, (100% − gouttières) / 4)` · Source : NORMES.md § « 1 ter ter », Eric 2026-08-29 : *« pour tous les collecteurs de skills se limiter à des lignes de 4 »* · Statut : ratifié

### Les six caractéristiques sur une ligne { #collecteur-six-caracs-une-ligne }

**Les six caractéristiques tiennent sur UNE ligne de collecteurs, jamais de retour.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« LA RANGÉE DES SIX SE NOMME, ELLE NE SE COMPTE PAS. La classe vient de l'appelant, pas d'un `:nth-child(6)` qui aurait rangé sur une ligne n'importe quel écran à six créneaux. »*

    Valeur : `data-rangs="caracs"` · `renderChoixGlisses({ rangee: "caracs" })` · Source : NORMES.md § « 1 ter ter », Eric 2026-08-29 : *« STR DEX CON INT WIS CHA — règle spécifique, là on met tout sur une ligne ! »* · Statut : ratifié

### Le nombre d'une rangée est dicté par l'étape { #collecteur-rangee-libre-en-nombre }

**Le nombre de collecteurs d'une rangée est dicté par ce que l'étape demande — c'est le vivier qui est borné, pas eux.**

??? note "Pourquoi, et depuis quand"
    *« le vivier — ce qui PROPOSE — trois colonnes toujours ; la rangée de collecteurs — ce qui REÇOIT — libre »*.

    Valeur : `.glisse-creneaux` libre · `.glisse-vivier` = 3 colonnes · Source : NORMES.md § « TROIS MAX POUR UNE SÉLECTION », Eric 2026-08-26 · Statut : ratifié (⚠️ borné à 4 depuis le 29/08 — voir `collecteur.quatre-par-ligne`)

### La même écriture que le jeton { #collecteur-ecriture-comme-le-jeton }

**Les mêmes règles d'écriture s'appliquent au jeton et au collecteur : valeur en T1, nom en T1 capitales.**

??? note "Pourquoi, et depuis quand"
    *« UN COLLECTEUR REMPLI PORTE LE MOT DU JETON DÉPOSÉ. Deux corps pour le même mot selon qu'il est tenu ou posé, ce serait deux modèles pour un organe dont §2 dit qu'il n'en a qu'un. »* La capitale distingue l'étiquette de la valeur, **jamais la taille**. ⛔ Et l'écart était **dormant** : une règle plus spécifique rattrapait à T1 dans les écrans de choix. *« Une valeur qui n'est juste que parce qu'une autre la corrige plus loin n'est pas juste, elle est couverte. »*

    Valeur : `.glisse-creneau-valeur` ramené de `--t3` à `--t1` · Source : NORMES.md § « 1 ter bis² », Eric 2026-08-29 : *« les mêmes règles d'écriture s'appliquent aux tokens et aux collecteurs »* · *« comme les collecteurs se transforment en token »* · Statut : ratifié

### La zone de drop { #collecteur-zone-de-drop }

**Une zone de drop est un rectangle très arrondi, creux, dont le liseré porte la couleur du corps du jeton attendu.**

??? note "Pourquoi, et depuis quand"
    *« la cible annonce ce qu'elle accepte avant qu'on lâche »*.

    Valeur : voile max, voire nulle · Source : NORMES.md § « 2. LES ORGANES », validé 2026-08-26 · Statut : ratifié

### Le collecteur d'Équipement : 44 { #collecteur-equipement-44 }

**Le collecteur de l'Équipement garde une hauteur de 44, pas 48.**

⚠️ En contradiction avec [`collecteur.cote`](#collecteur-cote) — voir [C3](a-trancher.md#c3).

??? note "Pourquoi, et depuis quand"
    *« un collecteur n'est pas un jeton qu'on glisse, c'est une cible qu'on VISE, et son plancher est le pouce »*. ⛔ Le doré du rempli ne change pas cette cote.

    Valeur : `.carte-r-collecteur` → `--touch` 44 · Source : NORMES.md § « 2 ter — ce qui reste vrai de la cote », 2026-08-26 · Statut : ⚠️ **contredit** par `collecteur.cote` (29/08, « ne varie jamais ») — voir [C3](a-trancher.md#c3)

## Le bouton

### L'octogone à coupe { #bouton-octogone }

**Un bouton à libellé est un OCTOGONE à coupe, et la coupe d'angle lui appartient seul.**

??? note "Pourquoi, et depuis quand"
    *« La coupe d'angle appartient au bouton SEUL. C'est ce qui interdit de le confondre avec un jeton, quelle que soit la couleur. »* ⚠️ Mais *« « bouton » ne veut pas dire « octogone » : l'octogone est l'habit des trois gabarits À LIBELLÉ ; un bouton qui porte un glyphe ou un dessin n'a pas de mot à cadrer, donc pas de coupe à porter »*.

    Source : NORMES.md § « 2. LES ORGANES », validé 2026-08-26 sur maquette · Statut : ratifié

### Un bouton est opaque { #bouton-opaque }

**Un bouton est OPAQUE — 100 %, et il ne porte jamais l'habit d'une dalle.**

??? note "Pourquoi, et depuis quand"
    *« un signal qui se voile cesse d'être un signal »*. Le rouge voilé à 35 % rend `#74493b` de nuit — un brun. ⛔ *« Un bouton ne porte JAMAIS l'habit d'une dalle — c'est ce qui les rendait anonymes. »*

    Valeur : opaque → contraste étiquette **6,07–6,13** jour, **5,59–5,61** nuit ✓ · voilé 50 % → 3,63 / 3,00 ✗ · voilé 35 % → 3,12 / **2,47** ✗ · Source : NORMES.md § « 3. LE BOUTON EST OPAQUE — mesuré, pas préféré », 2026-08-26 · Statut : ratifié (⏳ à remesurer sur une dalle à 50, la mesure datait d'une dalle à 35)

### Les pans coupés sont nus { #bouton-pans-coupes-nus }

**Les quatre pans coupés ne portent pas d'arête, et c'est voulu.**

??? note "Pourquoi, et depuis quand"
    *« c'est la limite du médium : un `linear-gradient` éclaire des bandes DROITES. La diagonale d'un pan tombe hors des 1,5 px du haut comme des 1,5 px du côté — aucun stop ne peut l'atteindre. »* ⛔ *« AUCUN LOT NE ROUVRE CETTE QUESTION. Un futur siège qui verra les pans nus croira à un défaut : il n'en est pas un. »*

    Valeur : pixels de diagonale à **158-160** entre fond 243 et corps 98 — de l'anticrénelage · haut/bas blanc .58 · noir .45 · côtés blanc .16 · noir .20 · Source : NORMES.md § « LES QUATRE PANS COUPÉS », Eric 2026-08-26 la mesure posée devant lui : *« non, ça me va »* · Statut : ratifié

### L'ombre devient une lueur la nuit { #bouton-ombre-devient-lueur-la-nuit }

**L'ombre du bouton devient une LUEUR la nuit : c'est le fond qui décide de la direction.**

??? note "Pourquoi, et depuis quand"
    *« LA RAISON EST PHYSIQUE, PAS DÉCORATIVE : un objet posé sur une surface claire se détache par l'ombre qu'il projette ; sur une surface sombre, par la lumière qu'il renvoie. »* Le jour il reste 45 points de marge sous le fond ; la nuit il n'en reste que 18 avant le noir absolu. ⛔ Ne pas remonter l'alpha du noir « pour compenser » : *« il n'y a rien à compenser, la marge n'existe pas »*.

    Valeur : jour Δ 45,8 (243,1 → 197,3) ✅ · nuit avant Δ 2,9 ⛔ · nuit lueur blanc 22 % Δ **32,8** ✅ · Source : NORMES.md § « L'OMBRE DU BOUTON DEVIENT UNE LUEUR LA NUIT », Eric 2026-08-26 : *« une lueur claire la nuit »* · Statut : ratifié

### Les trois gabarits à libellé { #bouton-trois-gabarits }

**Il y a trois gabarits à libellé : small (6 caractères), medium (12), no constraint.**

??? note "Pourquoi, et depuis quand"
    *« Chaque gabarit a son MOT-TÉMOIN — un mot réel qui prouve la cote, jamais un compte abstrait. »*

    Valeur : mots-témoins **`CANCEL`** (6) et **`COMPANIONS`** (10) · Source : NORMES.md § « 6. LES BOUTONS », 2026-08-26 · Statut : ratifié

### `large` s'appelle `medium` { #bouton-large-renomme-medium }

**`large` s'appelle désormais `medium`.**

??? note "Pourquoi, et depuis quand"
    *« Sur trois gabarits, « large » se lisait comme le plus grand alors que c'est celui du milieu. L'ordre se lit tout seul, et un lot ne peut plus se tromper de gabarit. »*

    Valeur : small · medium · no constraint · Source : NORMES.md § « 6 », Eric 2026-08-26 · Statut : ratifié

### Un gabarit est un compte de caractères { #bouton-gabarit-est-un-compte-de-caracteres }

**Un gabarit est un compte de caractères, pas une largeur en pixels — la largeur se déduit.**

??? note "Pourquoi, et depuis quand"
    *« Écrire `width: 96px` figerait un gabarit qui mentirait au premier changement de corps. »*

    Valeur : ⛔ `width: 96px` · Source : NORMES.md § « 6 », 2026-08-26 · Statut : ratifié

### Les cotes extrapolées { #bouton-cotes-extrapolees }

⏳ **À trancher.** Extrapolation non vérifiée.

**small = 87, medium = 135, no constraint = 278 — extrapolés, pas mesurés.**

??? note "Pourquoi, et depuis quand"
    tout se déduit de la rangée de 278 et de la gouttière de 8, sous la règle *« même largeur sur une ligne »*. ⭐ *« UN PETIT BOUTON FAIT 87 — EXACTEMENT LA LARGEUR D'UN JETON. Ce n'est pas une coïncidence : boutons et jetons partagent une seule grille, et une bande de boutons s'aligne sous une rangée de jetons sans réglage. »* 🔴 À vérifier au navigateur sans écran avant d'être gravée.

    Valeur : ratio de **0,58 em par caractère** (semi-gras, casse mixte) · 3 / 2 / 1 par ligne · Source : NORMES.md § « LES COTES DES BOUTONS — extrapolées le 26/08 » · Statut : à trancher (extrapolation non vérifiée)

### Le corps du texte d'un bouton { #bouton-corps-du-texte }

⏳ **À trancher.** ⚠️ mais T3 est ratifié pour les portes — voir [C8](a-trancher.md#c8).

**Aucun corps de texte n'est déclaré pour un bouton, donc les largeurs de small et medium ne sont pas calculables.**

⚠️ En contradiction avec [`bouton.gabarit-des-deux-lignes`](#bouton-gabarit-des-deux-lignes) — voir [C8](a-trancher.md#c8).

??? note "Pourquoi, et depuis quand"
    *« À T4, `medium` n'a plus que 8 px — un mot un peu large déborde, et le déficit ne se verrait que sur ce gabarit-là. »* T3 est le corps **recommandé**.

    Valeur : `.species-done` porte `font: inherit` · T3 laisse la même marge de 22 px aux deux gabarits · à T4, `medium` n'a plus que **8 px** · Source : NORMES.md § « 6 — Le corps du texte », 2026-08-26 · Statut : à trancher (⚠️ mais T3 est ratifié pour les portes — voir [C8](a-trancher.md#c8))

### La hauteur d'un bouton { #bouton-hauteur }

**Un bouton fait 44 à un étage, 48 à deux étages en T3, 56 à deux étages en T4.**

??? note "Pourquoi, et depuis quand"
    *« Le plancher tactile gouverne la hauteur d'un bouton à un étage : la typographie n'y arrive pas. C'est encore « un contrôle ne se laisse jamais dimensionner par un dessin ». »*

    Valeur : `--touch` 44 (le texte n'en demande que ~33) · Source : NORMES.md § « 6 — La hauteur », 2026-08-26 · Statut : ratifié

### Même largeur sur une même ligne { #bouton-meme-largeur-par-ligne }

**Tous les boutons d'une même ligne ont la même largeur, et la rangée se pose en bas de page, centrée.**

??? note "Pourquoi, et depuis quand"
    c'est la règle d'Eric « même largeur sur une ligne », celle dont se déduisent les cotes 87 / 135 / 278 : « tout se déduit de la rangée de 278 et de la gouttière de 8 ».

    Source : NORMES.md § « 6 », 2026-08-26 · Statut : ratifié

### Les boutons `+` et `−` { #bouton-plus-moins }

**`+` et `−` sont un quatrième gabarit : carré ou petit cercle, `+` vert et `−` rouge.**

??? note "Pourquoi, et depuis quand"
    *« C'est le cas où les deux divergent le plus, et il est voulu : un contrôle ne se laisse jamais dimensionner par un dessin. ⛔ Réduire la cible pour l'accorder au dessin serait exactement la faute inverse. »* 📏 Défaut mesuré en écrivant la table : `.pipeline-pas` servait le `+` et le `−` avec `border: 1px solid var(--critical)` — **le `+` était rouge**, *« il disait « ce n'est pas bon » au moment précis où le joueur AJOUTE quelque chose »*. Corrigé le 26/08.

    Valeur : dessin **le plus petit possible** (le rond peut faire 24) · cible **`--touch` 44** · Source : NORMES.md § « LE QUATRIÈME GABARIT », Eric 2026-08-26 : *« boutons + / − : le plus petit possible / minimum acceptable sur tactile »* · *« ce sont des boutons »* · Statut : ratifié

### Les quatre couleurs sont une échelle { #bouton-echelle-des-quatre-couleurs }

**Les quatre couleurs sont UNE échelle d'avancement que le bouton parcourt : gris rien fait · bleu mouvement non impactant · vert fini · rouge pas bon.**

??? note "Pourquoi, et depuis quand"
    *« Ce ne sont donc pas quatre couleurs de boutons : c'est UNE échelle, et le bouton la PARCOURT. »* Et c'est la MÊME échelle que la signalisation du cercle d'étape — *« une seule échelle, deux porteurs »*. Elle a corrigé la dictée d'Eric (« le done est vert, le next est bleu » — l'inverse de ce qu'il avait dicté) : *« `done` est VERT parce que c'est FINI, `next` est BLEU parce qu'on CONTINUE »*.

    Valeur : gris = `--text-muted` · Source : NORMES.md § « LES QUATRE COULEURS SONT UNE ÉCHELLE D'AVANCEMENT », Eric 2026-08-26 : *« le bleu on garde, ce sont les actions sous les états intermédiaires. Un bouton va passer de bleu à vert voire à rouge dans les zones de choix — quand on prend +4 alors qu'on a droit à +2. »* · Statut : ratifié

### La définition du bleu { #bouton-definition-du-bleu }

**Bleu = mouvement non impactant : après ce clic, le document n'a pas changé.**

??? note "Pourquoi, et depuis quand"
    *« Le test tient en une question : après ce clic, le document a-t-il changé ? Non → bleu. Oui et c'est fini → vert. Oui et c'est faux → rouge. Oui et ça efface → rouge avec popup. »*

    Source : NORMES.md § « LA DÉFINITION DU BLEU », Eric 2026-08-26 : *« bleu = mouvement non impactant »* · Statut : ratifié

### Deux axes : le libellé et la couleur { #bouton-deux-axes }

**Le libellé dit ce que fait le bouton et ne change jamais ; la couleur dit où on en est et change à chaque acte.**

??? note "Pourquoi, et depuis quand"
    *« « `done` = vert » ne veut PAS dire « le bouton Done est vert ». Ça veut dire : un `Done` est vert quand l'étape est finie. »* Le joueur voit **où il en est** avant même de lire ce qu'il peut faire — *« la couleur porte l'avancement, le mot porte l'acte : deux informations, aucune redondance »*.

    Source : NORMES.md § « LE LIBELLÉ ET LA COULEUR SONT DEUX AXES INDÉPENDANTS », Eric 2026-08-26 : *« mais un même bouton peut changer de couleur, à voir dans l'acte »* · Statut : ratifié

### Jamais de couleur dans le balisage { #bouton-jamais-de-couleur-dans-le-balisage }

**Un lot ne déclare jamais `class="bouton-vert"` : il déclare un bouton, et l'état peint.**

??? note "Pourquoi, et depuis quand"
    *« Une couleur écrite dans le balisage est un bogue — elle mentira au premier changement d'état. »* ⛔ *« Deux dérivations séparées finiraient par diverger — c'est la faute des deux échelles typographiques que le dépôt paie encore. »*

    Valeur : la couleur se dérive du MÊME état que le cercle de signalisation · Source : NORMES.md § « LE LIBELLÉ ET LA COULEUR », 2026-08-26 · Statut : ratifié

### La famille DÉFAIRE { #bouton-famille-defaire }

**La famille DÉFAIRE est rouge, toujours, quel que soit l'état, et toujours accompagnée d'un popup.**

??? note "Pourquoi, et depuis quand"
    *« C'est la seule famille où la couleur ne dit PAS où on en est — elle dit ce que le bouton FAIT. Un bouton qui défait ne doit jamais pouvoir être appuyé par distraction. ⛔ Un `Cancel` gris, ça s'appuie sans le vouloir. »* Rouge **et** confirmé, jamais l'un sans l'autre.

    Valeur : `Cancel` · `I changed my mind` · « je veux refaire mon perso » · Source : NORMES.md § « LA FAMILLE DÉFAIRE », Eric 2026-08-26 : *« le cancel est rouge »* · *« j'ai changé d'avis est rouge »* · Statut : ratifié

### Le critère est le coût du geste { #bouton-critere-du-cout }

**Ce n'est pas le mot qui décide de la couleur, c'est ce que le geste COÛTE — et « détruit » se mesure au travail perdu.**

??? note "Pourquoi, et depuis quand"
    ⛔ **AMENDÉ le 26/08** : *« J'avais écrit ici que « `Back` a la couleur de sa conséquence ». C'est caduc : un `Back` ne coûte rien par définition, et un bouton qui détruit porte un autre mot. Le critère du coût reste vrai — il ne s'applique simplement plus à `Back`, mais au choix du LIBELLÉ. »*

    Valeur : ne coûte rien → bleu · détruit du travail → rouge + popup, **et il ne s'appelle pas `Back`** · Source : NORMES.md § « LE CRITÈRE », Eric 2026-08-26 : *« un bouton back sera bleu je pense, s'il n'impacte rien »* · Statut : ratifié (amendé le 26/08)

### Les trois verbes { #bouton-trois-verbes }

**Trois familles, trois verbes, aucun recouvrement : `Back`/`Next` NAVIGUENT (bleu), `Done` VALIDE (vert), `Cancel`/`I changed my mind` DÉFAIT (rouge + popup).**

⚠️ En contradiction avec [`bouton.done-signe`](#bouton-done-signe) — voir [C16](a-trancher.md#c16).

??? note "Pourquoi, et depuis quand"
    *« Un bouton qui fait deux de ces choses est un bouton mal nommé — c'est la discipline qu'Eric applique depuis le 17/08 : il ne règle pas le cas ambigu, il sépare les mots. »*

    Source : NORMES.md § « LES TROIS VERBES », Eric 2026-08-26 : *« `Done` valide les choix · `I changed my mind` les annule · `Next` : navigation »* · *« back et next = navigation uniquement »* · *« done = validation »* · Statut : ratifié

### `Back` et `Next` n'écrivent jamais { #bouton-back-next-n-ecrivent-jamais }

**Un `Back` ou un `Next` ne modifie jamais le document : ni valider, ni écrire, ni effacer, ni signer.**

??? note "Pourquoi, et depuis quand"
    *« Ce n'est pas une préférence de dessin : c'est ce que ces deux mots ont le droit de faire. Un `Back` ne coûte rien, par définition. S'il coûte, ce n'est pas un `Back`. »*

    Valeur : vérifiable mécaniquement · Source : NORMES.md § « BACK ET NEXT NE FONT QUE NAVIGUER », Eric 2026-08-26 · Statut : ratifié

### `Back` en sous-menu seulement { #bouton-back-dans-les-sous-menus-seulement }

**`Back` n'existe qu'en sous-menu ; il ne paraît jamais à l'entrée d'une étape (rang R).**

??? note "Pourquoi, et depuis quand"
    *« Au rang R, on ne revient de nulle part : la ceinture d'étapes EST la navigation de ce niveau. »* La norme *« nomme ce que le code faisait déjà sans que ce soit écrit, ce qui est exactement ce qui permet à un lot de ne pas le défaire par erreur »*.

    Valeur : `renderSortieEtape` ne produit un retour que si `state.palier > 1` ou dans un item de parcours · Source : NORMES.md § « LES TROIS VERBES », Eric 2026-08-26 : *« le back c'est uniquement dans les sous-menus »* · Statut : ratifié

### `Done` et `Next` jamais ensemble { #bouton-done-et-next-jamais-ensemble }

**`Done` et `Next` ne coexistent jamais : c'est le même moment vu avant et après.**

??? note "Pourquoi, et depuis quand"
    *« Tant que les choix ne sont pas validés, la rangée offre de VALIDER ; une fois validés, il n'y a plus rien à valider et elle offre de NAVIGUER. »* ⚠️ `I changed my mind` ne bouge pas entre les deux : *« c'est la seule porte ouverte dans tous les états, celle qui défait »*.

    Valeur : rang R en cours → `I changed my mind` · `Done` · rang R validé → `I changed my mind` · `Next` · sous-menu → `Back` · `Done` · Source : NORMES.md § « LES TROIS VERBES », 2026-08-26 · Statut : ratifié

### `I changed my mind` n'est jamais seul { #bouton-i-changed-my-mind-jamais-seul }

**`I changed my mind` n'est jamais seul dans sa rangée : `Next` si l'étape est réglée, `Done` sinon.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« CE QUI MANQUAIT ÉTAIT UN QUATRIÈME ÉTAT, ET IL NE SE VOYAIT PAS »* — le cas `acheve && conclu`, *« celui où le joueur REVIENT sur un chapitre fini »*, ne tombait dans aucune branche : *« La seule porte offerte à qui relit une étape achevée était de la démolir. »* Leçon : *« un `else if` sans `else` ne prévient jamais qu'il ne couvre pas tout. Il rend simplement moins que prévu, et se tait. »*

    Valeur : le garde **refuse le trou** (`if/else` complet), il ne compte pas les boutons · Source : NORMES.md § « I CHANGED MY MIND N'EST JAMAIS SEUL », Eric 2026-08-26 : *« la bonne chose à faire, toujours un Next à côté de I changed my mind »* · Statut : ratifié

### Un `Done` inachevé est gris { #bouton-done-gris-inacheve }

**Un `Done` sur une étape inachevée est GRIS, jamais bleu, et il passe au vert quand elle est achevée.**

??? note "Pourquoi, et depuis quand"
    *« L'argument est de sens, pas de lisibilité : le bleu veut dire « mouvement non impactant » — or un `Done` sur une étape inachevée ne bouge pas, il attend. Le peindre en bleu lui prêterait une activité qu'il n'a pas. »* ⭐ *« Un bouton gris doit rester LISIBLE : « rien n'est fait » n'est pas « désactivé au point d'être illisible ». »* Aucune teinte n'a été inventée.

    Valeur : `--text-muted` — contraste **6,06** jour / **5,59** nuit, dans la bande des autres boutons (5,6–6,1) · ⛔ pas `--border-strong` (4,09 / 3,73, hors bande) · Source : NORMES.md § « LE GRIS EST `--text-muted` », Eric 2026-08-26 : *« gris c'est mieux, le bleu impliquerait un mouvement »* · Statut : ratifié

### `Back` bleu, `Done` vert { #bouton-back-bleu-done-vert }

**`Back` est bleu et `Done` est vert — le commentaire « aucune couleur dans back et done » du 17/08 est renversé.**

??? note "Pourquoi, et depuis quand"
    *« le 17/08, l'échelle des quatre couleurs n'existait pas — « aucune couleur » était alors la seule façon de ne pas mentir. Depuis qu'une échelle dit ce que chaque teinte signifie, une couleur n'est plus du bruit : c'est une information. »* ⛔ Mais le 17/08 **survit** sur l'INTERRUPTEUR. 📌 Leçon pour les prochains renversements : *« une règle ancienne ne tombe pas en bloc. Elle tombe là où la raison qui la fondait a disparu, et tient partout ailleurs. »*

    Valeur : `shell.css` porte encore le commentaire daté du 2026-08-17 · Source : NORMES.md § « BACK ET DONE PRENNENT LEUR COULEUR », Eric 2026-08-26 : *« back bleu, done vert »* · Statut : renverse le 2026-08-17 (pour ces deux boutons seulement)

### `Done` signe { #bouton-done-signe }

**`Done` signe ce qui est là, puis remonte d'un cran.**

⚠️ En contradiction avec [`bouton.trois-verbes`](#bouton-trois-verbes) — voir [C16](a-trancher.md#c16).

??? note "Pourquoi, et depuis quand"
    ⚠️ **amende une ligne gravée le matin même** — *« J'avais écrit : « `Done` ne signe rien, c'est la TUILE qui signe », en m'appuyant sur `shell.mjs:600`. J'avais sur-lu : ce commentaire dit que le PALIER avance par la tuile — il ne dit pas que `Done` ne valide pas. »* Leçon : *« Un commentaire de code dit comment ça marche, pas ce que ça veut dire. »*

    Source : NORMES.md § « LES TROIS VERBES », 2026-08-26 ; phrase d'Eric du 20/08 citée dans `catalogue.mjs:573` : *« si je dis à BS Done, direction R POUR VALIDER la… »* · Statut : ratifié (⚠️ voir contradiction [C16](a-trancher.md#c16) — « il ne fait pas avancer »)

### La porte à deux âges { #bouton-porte-a-deux-ages }

**Le bouton de menu de création est UN bouton à deux âges : proposition tant que la condition n'est pas remplie, résolution dès qu'elle l'est.**

??? note "Pourquoi, et depuis quand"
    *« C'EST LE BOUTON LE PLUS FRÉQUENT DU BUILDER, ET IL MANQUAIT À CE REGISTRE. »* ⛔ *« Ne pas en faire deux composants : le jour où ils divergeraient, un menu montrerait une proposition résolue. »*

    Valeur : proposition = nom de la question (« Lineage »), voyant ⚪ vide · résolution = la résolution (« High Elf ») + sous-titre T1 italique, voyant 🟢 vert · Source : NORMES.md § « LES DEUX BOUTONS DE MENU DE CRÉATION », Eric 2026-08-27 : *« nouvelles normes aussi pour les boutons de menus de création : bouton de PROPOSITION / bouton de RÉSOLUTION »* · Statut : ratifié

### Le troisième âge est l'absence { #bouton-troisieme-age-est-l-absence }

**Une fois l'étape validée par le `Done` du pied, la porte disparaît et le résumé prend sa place.**

??? note "Pourquoi, et depuis quand"
    « une fois l'étape entière validée par le `Done` du pied, le bouton disparaît et son résumé prend sa place » — sans ce troisième âge, un menu réglé continuerait d'offrir des portes à une question déjà close.

    Valeur : proposition → résolution → plus de porte du tout · Source : NORMES.md § « LES DEUX BOUTONS DE MENU DE CRÉATION » + § « soit la porte, soit le résumé », 2026-08-27 · Statut : ratifié

### La loi de la porte { #bouton-loi-de-la-porte }

**Le voyant et le texte d'une porte disent la MÊME chose : condition remplie → voyant vert + texte de résolution ; non remplie → voyant vide + texte de proposition.**

??? note "Pourquoi, et depuis quand"
    ⛔ le défaut qui a fait écrire la loi : *« le 27/08, les portes annonçaient « High Elf » et « spent » pendant que les voyants à leur gauche étaient vides »*. La cause était une confusion de notions : *« l'écran d'appel savait ce qui était POSÉ (`answered >= expected`), le voyant disait ce qui était CONFIRMÉ (passé par son `Done`). On peut poser un lignage sans valider son écran. »* Parade : *« l'appelant sait QUELLE est la résolution, l'écran sait SI elle compte »*.

    Source : NORMES.md § « LA LOI DE LA PORTE », Eric 2026-08-27 · Statut : ratifié

### Une résolution n'est pas toujours un nom { #bouton-resolution-n-est-pas-toujours-un-nom }

**Une résolution dit que c'est résolu ; elle ne dit pas forcément par quoi.**

??? note "Pourquoi, et depuis quand"
    *« `Skill budget` n'a pas UNE réponse — il en a autant que de compétences dotées (« Survival +1, Vigilance +1 »), et aucune ne tient dans une porte. »* C'est ce que le vocabulaire proposition/résolution règle et que « question/réponse » ne réglait pas.

    Valeur : `Skill budget` → état `spent`, pas un nom · Source : NORMES.md § « LA LOI DE LA PORTE », 2026-08-27 · Statut : ratifié

### Le gabarit des deux lignes { #bouton-gabarit-des-deux-lignes }

**Une porte porte sa résolution en T3 et sa proposition dessous en T1 italique.**

⚠️ En contradiction avec [`bouton.corps-du-texte`](#bouton-corps-du-texte) — voir [C8](a-trancher.md#c8).

??? note "Pourquoi, et depuis quand"
    *« la résolution : c'est elle qu'on vient lire »* · la proposition porte *« le même habit que « drop it here » dans un collecteur vide — l'italique dit « je ne suis pas une donnée » »*.

    Valeur : T3 · T1 italique · Source : NORMES.md § « LE GABARIT DES DEUX LIGNES », ratifié 2026-08-27 · Statut : ratifié

### Le verrou du noyau { #bouton-verrou }

**Un verrou du noyau prime sur une signature : sous verrou, `Done` et `Next` sont désarmés ET rouges, la porte fautive devient un octogone rouge plein, et le gendarme parle.**

??? note "Pourquoi, et depuis quand"
    *« LES DEUX ROUGES NE DISENT PAS LE MÊME GESTE, et c'est le curseur qui les sépare : le bouton désarmé montre la MAIN D'ARRÊT (tu ne passes pas par là), la porte accusée offre le DOIGT (c'est par ici). »* ⛔ Le bug (lot 67) : *« le noyau posait le verrou, et l'écran testait `answered >= expected` — trois novices passaient pour « spent ». Un dépassement n'est pas une réponse. »* Le compte d'une bourse est EXACT (`===`).

    Valeur : `skill-budget.overspent` · curseur `not-allowed` sur les boutons, **doigt** sur la porte · crochet `cfg.gendarme(ctx) → {mot, chemin}` · garde `tests/budget-verrou.test.mjs` · Source : NORMES.md § « LE VERROU, LE GENDARME, ET LES BOUTONS BLOQUÉS », Eric 2026-08-27 : *« tu peux bloquer le Next et faire parler le gendarme en rouge à la place de l'aiguilleur »* · *« il faut bloquer le Done aussi, et laisser le bouton visible pour pouvoir retourner dans Skill budget »* · *« sur Wood Elf j'ai pas le bouton pour revenir en arrière »* · Statut : ratifié

### La tête de bilan redevient une porte { #bouton-tete-de-bilan-redevient-une-porte }

**Même conclue, une étape verrouillée redonne sa tête de bilan sous forme de porte rouge.**

??? note "Pourquoi, et depuis quand"
    *« une étape verrouillée offre son chemin de retour, sans démolir le reste »*.

    Source : NORMES.md § « LE VERROU », Eric 2026-08-27 : *« j'ai pas le bouton pour revenir en arrière »* · Statut : ratifié

### Le gendarme ne parle que quand ça bloque { #bouton-gendarme-quand-ca-bloque }

**Le gendarme ne parle que quand le rouge EMPÊCHE d'avancer.**

??? note "Pourquoi, et depuis quand"
    *« Un rouge qu'on peut corriger soi-même en un geste n'a besoin de personne ; un rouge qui ferme la route doit dire pourquoi, sinon le joueur cherche. »* ⛔ *« un gendarme sur chaque rouge serait pire que pas de gendarme du tout : une interruption qui survient tout le temps cesse d'être lue »*.

    Valeur : choix hors droit (+4 pour un droit de +2) → rouge, ⛔ pas de gendarme · ça bloque → rouge + gendarme · Source : NORMES.md § « QUAND LE GENDARME PARLE », Eric 2026-08-26 : *« le gendarme quand ça risque de bloquer, pas tout rouge je pense »* · Statut : ratifié

### Le rouge signale, le gendarme explique { #bouton-rouge-signale-violet-explique }

**Un bouton rouge dit qu'il y a un problème ; le gendarme dit lequel.**

??? note "Pourquoi, et depuis quand"
    *« la couleur se voit d'un coup d'œil et ne prend pas de place ; le gendarme prend la parole et coûte une interruption »*.

    Source : NORMES.md § « Le rouge peut être accompagné », Eric : *« le rouge c'est pas bon — tu peux me mettre un flic en même temps »* · Statut : ratifié

### Sur une dalle, jamais sur le fond { #bouton-sur-une-dalle-jamais-sur-le-fond }

**Un bouton se pose sur une dalle, jamais sur le fond.**

??? note "Pourquoi, et depuis quand"
    *« le fond ne peint rien. Ce n'est pas une surface, c'est une respiration — un contrôle posé dessus n'a rien sous lui. »* Mesuré : `Draw again` et `Choose yourself` étaient posés dans `.card-step` — *« Tant que le cadre peignait, ils avaient l'air d'être sur quelque chose. Depuis que le fond est nu, ils flottent sur l'image. »* ⚠️ Le cas sans dalle est **nommé, pas masqué** : on les garde visibles, *« un écran qui perd ses gestes est pire qu'un écran mal rangé »*.

    Source : NORMES.md § « UN BOUTON SE POSE SUR UNE DALLE », Eric 2026-08-26 : *« aucun bouton dans le fond »* · *« Destiny, la carte TEXTE doit avoir sa rangée de boutons »* · Statut : ratifié

### Le flux ne porte aucun bouton { #bouton-le-flux-ne-porte-aucun-bouton }

**Le flux ne porte aucun contrôle d'écran : ce sont les bandes fixes (tête et pied), qui sont des dalles, qui les portent.**

??? note "Pourquoi, et depuis quand"
    *« un contrôle qui défile s'en va. Le joueur qui cherche `Done` doit alors se rappeler où il l'a laissé — un bouton qu'il faut retrouver n'est plus un bouton, c'est une chasse. Ce qui commande reste ; ce qui se lit défile. »* 📏 La barre blanche vivait dans `.stage-topbar`, le slot horizontal du CADRE — donc hors de toute dalle. *« Le slot ne disparaît pas, il se vide »* (loi B0.19).

    Valeur : tête fixe = titre, onglets, compteurs, `?`, livre · flux = aucun contrôle, *« son bord est invisible »* · pied fixe = la rangée de boutons · Source : NORMES.md § « LE FLUX NE PORTE AUCUN BOUTON », Eric 2026-08-26 : *« les listes restent identiques et scrollables. Exception : elles ne portent pas de bouton. C'est la carte FIXE qui les porte. »* · *« la barre blanche doit totalement disparaître »* · Statut : ratifié

### Les lignes gardent leurs commandes { #bouton-les-lignes-gardent-leurs-commandes }

**Les lignes d'une liste gardent leurs propres commandes : la règle ne vise que ce qui commande la PAGE.**

??? note "Pourquoi, et depuis quand"
    *« Ce sont des organes DE LA LIGNE, pas des contrôles DE L'ÉCRAN. »*

    Valeur : les trois crans de palier d'une compétence, le `+`/`−` d'une quantité · Source : NORMES.md § « LE FLUX NE PORTE AUCUN BOUTON », 2026-08-26 · Statut : ratifié

### Le tarot, bouton d'exception { #bouton-tarot-exception }

**Le tarot est un bouton d'exception : une CARTE rectangulaire, opaque, sans texte.**

??? note "Pourquoi, et depuis quand"
    trois normes cèdent, chacune avec son argument — l'octogone (*« la carte EST l'objet. Un octogone la découperait — on ne rogne pas un tarot pour qu'il ressemble à un bouton »*), le voile de 50 % (*« Un voile sur une illustration la salit »*), le titre (*« on ne nomme pas deux fois »*, son nom accessible est sur le bouton). ⭐ *« une norme qui n'admet aucune exception se fait contourner en silence. Écrite avec son argument, l'exception se relit. »*

    Valeur : `.card-face` — un `<button>` qui ne contient qu'une image · Source : NORMES.md § « L'EXCEPTION DU TAROT », Eric 2026-08-26 : *« les normes peuvent avoir des exceptions, elles sont argumentées »* · *« tu as raison, le tarot est un bouton exception »* · Statut : ratifié

### Les deux dalles de Destiny { #bouton-deux-dalles-de-destiny }

**La dalle tarot ne porte aucun autre bouton que le tarot ; c'est la dalle TEXTE qui porte les éléments classiques.**

??? note "Pourquoi, et depuis quand"
    la règle se referme d'elle-même — *« le `?` et le livre SONT des boutons, donc « aucun autre bouton que le tarot » les exclut par construction »*. 📏 Ce qu'il en coûtait de ne pas l'écrire : *« le `?` était appendu dans la carte du tarot — un `<button>` DANS un `<button>`, du HTML invalide, et surtout un clic qui remonte : demander de l'aide RETOURNAIT LA CARTE. »* ⚠️ *« l'exclusion des boutons est un EFFET, pas la règle »* : le jour où une dalle-image ne serait pas un bouton, elle recevrait le `?` sans que rien ne proteste.

    Valeur : dalle texte = rangée de boutons, Score, `?`, livre · garde `tests/destiny-deux-dalles.test.mjs` · Source : NORMES.md § « LA RÈGLE DES DEUX DALLES », Eric 2026-08-26 mot pour mot · Statut : ratifié

### La paire qui encadre la rangée { #bouton-la-paire-encadre-la-rangee }

**Le livre à gauche et le `?` à droite encadrent la rangée de boutons, à la même cote, hors du centrage.**

??? note "Pourquoi, et depuis quand"
    *« L'ÉGALITÉ EST CE QUI FAIT LA PAIRE : deux ronds de tailles différentes aux deux bouts d'une rangée se lisent comme deux objets sans rapport. À la même cote, ils se lisent comme les deux bornes d'un même geste — ⭕ à gauche on LIT · au centre on AGIT · ⭕ à droite on demande de l'AIDE. »*

    Valeur : **22 px de dessin, 44 de cible**, des deux côtés · Source : NORMES.md § « LA PAIRE », Eric 2026-08-26 : *« ils sont tous deux cadrés à gauche et à droite de la rangée de boutons »* · Statut : ratifié

### Dans la rangée, sans son habit { #bouton-dans-la-rangee-mais-pas-de-son-habit }

**Le livre et le `?` sont DANS la rangée mais n'ont pas son habit : l'octogone est réservé aux gabarits à libellé.**

??? note "Pourquoi, et depuis quand"
    ⛔ mesuré le 27/08 — *« le livre posé au pied du parcours est sorti en LOSANGE. `.parcours-pied button` figurait dans la liste des sélecteurs octogonaux, et le livre l'a hérité sans que rien ne le demande — il n'existait pas quand cette liste a été écrite. »* 📌 *« Un sélecteur écrit par POSITION attrape ce qui arrivera plus tard, et il ne prévient pas. »*

    Valeur : sélecteur `:not(.fiche-livre)` ou par classe de gabarit, **jamais par l'endroit** · Source : NORMES.md § « LA PAIRE », Eric 2026-08-27 : *« ce sont des boutons SPÉCIAUX, mais ils rentrent dans leur rangée quand même »* · *« le livre est un cercle »* · Statut : ratifié

### La réserve symétrique { #bouton-reserve-symetrique }

**La rangée réserve `--touch` de chaque côté et se centre sur ce qui reste : c'est l'arithmétique, pas un arbitrage.**

⚠️ En contradiction avec le corpus — aucune autre règle ne porte l'autre camp — voir [C15](a-trancher.md#c15).

??? note "Pourquoi, et depuis quand"
    *« Tant qu'un seul bout était occupé, le centrage était FAUX par construction »* — `Done` tombait 26 px à gauche du milieu. ⚠️ *« DEUX PIEDS, UNE SEULE LOI »* : `.sortie` (Identity, Destiny, Skills) et `.parcours-pied` (Species, Inheritance, Class) *« sont deux pieds nés séparément qui font le même métier ; ils avaient divergé sans que rien ne le dise »*. Les deux chiffres diffèrent et c'est argumenté (`.sortie` réserve `--sp-16 + --touch` au bas de la SCÈNE, `.parcours-pied` réserve `--touch` seul car il vit dans une dalle qui porte son rembourrage) — *« ce qui compte n'est pas le chiffre, c'est qu'il soit LE MÊME à gauche et à droite »*.

    Valeur : mesuré à 900 px — Identity `60/60` écart **0** · Species, Inheritance, Class `44/44` écart **0** · rembourrage à 360 : gauche 8, droite 52 · Source : NORMES.md § « LA RÉSERVE EST SYMÉTRIQUE », Eric 2026-08-26 : *« bien mais Done centré »* puis *« fais comme pour tous les panels »* · Statut : ratifié

### Borner la largeur ne réparait rien { #bouton-borner-la-largeur-ne-reparait-rien }

**Rétrécir la rangée ne résout pas le recouvrement du `?` : c'est `space-between` qui collait le dernier bouton au bord.**

??? note "Pourquoi, et depuis quand"
    *« le bouton de droite EST le bord droit, quel que soit son mot. Le nombre ne bougeait pas, parce que les deux objets visaient le même coin par construction. »* ⭐ *« On n'a rien inventé : on a étendu une recette qui marchait sur un écran à celle qui ne l'avait pas. »*

    Valeur : recouvrement **44 px, à 360 comme à 375** · `.parcours-pied` porte `center` + `padding-right: var(--touch)` depuis le 19/08 sans jamais avoir le conflit · Source : NORMES.md § « POURQUOI BORNER LA LARGEUR NE RÉPARAIT RIEN », mesuré 2026-08-26 · Statut : ratifié — annule la consigne « borner la largeur par calcul »

## L'interrupteur

### Un `on/off` n'est pas un bouton { #interrupteur-n-est-pas-un-bouton }

**Un `on/off` n'est pas un bouton : c'est un organe distinct, au même titre que le jeton ou le collecteur.**

??? note "Pourquoi, et depuis quand"
    *« La raison est mécanique, pas esthétique : les quatre couleurs sont une ÉCHELLE D'AVANCEMENT — et un interrupteur ne la parcourt pas. Il n'est ni « en cours » ni « fini » : il est dans une position, et il y reste. Son rouge ne dit pas « c'est faux », il dit « c'est éteint ». »* ➡️ *« Deux sens du rouge sur le même écran, c'est un rouge qui ne signale plus rien. »* La collision se règle par la FORME.

    Source : NORMES.md § « L'INTERRUPTEUR — un organe à part entière », Eric 2026-08-26 : *« les boutons on/off, il y en a plein dans le menu »* · *« on/off interrupteur, oui »* · Statut : ratifié

### Les deux espèces d'interrupteur { #interrupteur-deux-especes }

**Il y a deux espèces d'interrupteur : le sélecteur exclusif et la bascule simple.**

??? note "Pourquoi, et depuis quand"
    « et une seule pose une question » : le sélecteur exclusif conditionne l'éteinte de l'autre ligne, la bascule simple n'a qu'un état. ⭐ Les deux espèces divergent aussi par le dessin, « et c'est cette divergence qui les rend reconnaissables ».

    Valeur : sélecteur exclusif = `Langue` fr/en, `Unités` impérial/métrique, `SRD`/`SRD+FH` · bascule simple = l'activation du guide · Source : NORMES.md § « DEUX ESPÈCES D'INTERRUPTEUR », Eric 2026-08-26 : *« certains s'allument et conditionnent l'éteinte de l'autre : langues, impérial/métrique »* · Statut : ratifié

### Le sélecteur exclusif ne porte aucune couleur { #interrupteur-selecteur-sans-couleur }

**Le sélecteur exclusif ne porte AUCUNE couleur : l'allumé se dit par la position du pouce et l'encre pleine.**

??? note "Pourquoi, et depuis quand"
    *« un organe qui n'emprunte aucune couleur ne peut pas contredire une échelle de couleurs. La formulation d'Eric du 17/08 — « un état, pas deux actions » — avait nommé le problème neuf jours avant qu'il n'apparaisse. »* **Deux canaux, pas un.**

    Valeur : `shell.css:803` · `aria-pressed` le dit une troisième fois · Source : NORMES.md § « SA RÈGLE DE DESSIN », décision d'Eric du 2026-08-17 citée dans `shell.css:792` : *« SRD et SRD + FH sont des sélecteurs, PAS des boutons… quand l'un s'allume, l'autre s'éteint »* · Statut : ratifié — le 17/08 survit ici alors qu'il est renversé pour `Back`/`Done`

### La piste et le pouce sont dessinés { #interrupteur-dessine-jamais-un-glyphe }

**La piste et le pouce sont DESSINÉS, jamais un glyphe.**

??? note "Pourquoi, et depuis quand"
    *« un glyphe change de forme selon la police installée »*. ⛔ Il ne porte aucun mot : *« son nom vient du texte à sa gauche »*.

    Valeur : ligne **44** · piste **44 × 24** en `--radius-pill` · pouce **18 × 18** · écrivain unique `markPressed`, garde `tests/aria-pressed-guard.test.mjs` · Source : NORMES.md § « SA RÈGLE DE DESSIN », 2026-08-26 · Statut : ratifié

### La bascule simple { #interrupteur-bascule-simple }

**La bascule simple garde son bouton : 72 × 44, rayon 8, libellé `On`/`Off`, liseré vert allumé.**

??? note "Pourquoi, et depuis quand"
    *« un « éteint » n'est pas un « pas bon » »*.

    Valeur : 72 × 44 (cote du 19/08) · ⛔ le rouge de la dictée est **supprimé** · Source : NORMES.md § « LA BASCULE SIMPLE GARDE SON BOUTON », Eric 2026-08-26 : *« bouton On/Off (19/08, 72 × 44, liseré vert) »*, puis l'objection du vert posée : *« a »* — on l'assume · Statut : ratifié

### Les trois sens du vert { #interrupteur-trois-sens-du-vert }

**Le vert porte trois sens, et c'est le PORTEUR qui les sépare : « fini » sur un bouton, « en marche » sur un On/Off, « vivant » sur une pastille de coffre.**

??? note "Pourquoi, et depuis quand"
    *« Un bouton qu'on appuie · un interrupteur qu'on bascule · un point qu'on ne touche pas. ⛔ Ne jamais « corriger » l'un d'après un autre : ils ne dérivent pas de la même source et n'ont aucune raison de converger. »* ⛔ *« Un lot ne doit JAMAIS dériver l'état d'un On/Off de la même source que la couleur d'un bouton de parcours. »*

    Source : NORMES.md § « LA BASCULE SIMPLE » + § « LE TROISIÈME SENS DU VERT », tranchés 2026-08-26 · Statut : ratifié

## Le voyant

### Le voyant est le cran de la ceinture { #voyant-est-le-cran-de-la-ceinture }

**Le voyant d'avancement EST `.belt-index`, le chiffre d'un cran de ceinture — on n'en fabrique pas un second.**

??? note "Pourquoi, et depuis quand"
    ⛔ « Ce n'est pas un organe de plus. Le « cercle avec numéro d'étape » de la dictée EST `.belt-index`, le chiffre d'un cran de ceinture. ⛔ Ne pas en fabriquer un second. »

    Valeur : `.belt-index` · `.belt-item[data-fait="true"]` · Source : NORMES.md § « LE VOYANT D'AVANCEMENT », Eric 2026-08-26 : *« le voyant d'avancement (dans le belt) : rouge erreur / bleu avancement / vert fin »* · Statut : ratifié

### Le voyant ne se touche pas { #voyant-non-cliquable }

**Le voyant ne se touche pas : ne pas lui donner l'apparence d'un contrôle.**

??? note "Pourquoi, et depuis quand"
    il fait partie des deux organes qui ne se touchent pas, avec le popup : « ⛔ Ne pas leur donner l'apparence d'un contrôle. » Un voyant porte un état, il n'offre pas un geste.

    Source : NORMES.md § « LES AUTRES ORGANES », 2026-08-26 · Statut : ratifié

### L'anneau et le disque { #voyant-anneau-vs-disque }

**Un anneau se lit « en cours », un disque PLEIN se lit « fait » — et la règle vaut pour les quatre états.**

??? note "Pourquoi, et depuis quand"
    *« C'est la différence entre un contour et un état. »* ⚠️ L'encre du chiffre est celle du FOND, pas du texte : *« sur un disque plein, `--text` (clair de nuit) tomberait sous le seuil »*.

    Valeur : chiffre en `--on-accent` sur un disque plein · Source : NORMES.md § « LE VOYANT D'AVANCEMENT », règle d'Eric du 2026-08-19 : *« le 1 dans le belt doit être TOTALEMENT vert, et on doit voir le chiffre dessus »* · Statut : ratifié

### Traverser n'est pas finir { #voyant-traverser-n-est-pas-finir }

**Le vert du voyant vit sur `data-fait`, prononcé par le juge de Review, pas sur `data-status="done"`.**

??? note "Pourquoi, et depuis quand"
    *« `data-status="done"` veut dire « tu es passé devant » — un chapitre traversé sans rien y poser s'allumait quand même. Traverser n'est pas finir, et le bleu ne devra pas retomber dans le même piège : « en cours » n'est pas « ouvert une fois ». »*

    Source : NORMES.md § « LE VOYANT D'AVANCEMENT », 2026-08-26 · Statut : ratifié

### Le bleu et le rouge restent à construire { #voyant-bleu-et-rouge-a-construire }

⏳ **À trancher.**

**Le bleu (avancement) et le rouge (erreur) du voyant n'existent pas encore, et le juge qui prononce « erreur » n'est pas désigné.**

??? note "Pourquoi, et depuis quand"
    « ⏳ Reste à construire : le bleu et le rouge. ⏳ Et à trancher : quel juge prononce « erreur » sur une étape ? » — la règle de dessin (anneau / disque plein) est déjà écrite pour eux, l'organe non.

    Valeur : ✅ le vert existe · 🔴 bleu et rouge absents · Source : NORMES.md § « LE VOYANT D'AVANCEMENT », 2026-08-26 · Statut : à trancher

## Le chevron

### Un objet, deux rôles { #chevron-un-objet-deux-roles }

**Le chevron est un seul objet : il amorce le défilement ET il fait naviguer dans une liste paginée.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« Ne pas en fabriquer deux. »*

    Source : NORMES.md § « LES CHEVRONS », Eric 2026-08-26 : *« pour le moment le chevron est une aide à la navigation latérale AUSSI »* · Statut : ratifié

### À gauche et à droite { #chevron-gauche-et-droite }

**Les chevrons se posent à GAUCHE et à DROITE, jamais au-dessus, sur la dalle et au ras de son bord.**

⚠️ En contradiction avec [`chevron.ecart-avec-le-code`](#chevron-ecart-avec-le-code) — voir [C6](a-trancher.md#c6).

??? note "Pourquoi, et depuis quand"
    il vient de la loi §1 bis : « il se pose SUR la dalle, au ras de son bord », parce que « rien n'est jamais dans la marge ». La position latérale est ce qui lui permet de porter son compte dessous.

    Valeur : ⛔ pas dans la marge · Source : NORMES.md § « LES CHEVRONS », 2026-08-26 · Statut : ⚠️ ratifié mais **en écart avec le code** — voir [C6](a-trancher.md#c6)

### Le compte sous le chevron { #chevron-compte-sous-le-chevron }

**Sous chaque chevron figurent le nombre de pages et le nombre d'items.**

??? note "Pourquoi, et depuis quand"
    *« le compte sous le chevron est ce qui accomplit la norme des listes : sans lui, une liste paginée est un défilement sans fin ; avec lui, toute liste a une taille connue et le joueur sait toujours où il en est »*.

    Valeur : ex. `31` sous le chevron gauche, `1/3` sous le droit · Source : NORMES.md § « LES CHEVRONS », 2026-08-26 · Statut : ratifié

### L'apparition et la zone { #chevron-apparition-et-zone }

**Le chevron apparaît à l'approche du doigt ou de la souris (500 ms de présence suffisent), s'efface, mais sa zone reste cliquable.**

??? note "Pourquoi, et depuis quand"
    Eric : *« Pas besoin d'être efficace au tactile — surtout utile pour la souris. »*

    Valeur : allure **petite et discrète** · effet : scroll / page suivante · Source : NORMES.md § « LES CHEVRONS », 2026-08-26 · Statut : ratifié

### Le coût en largeur : 96 { #chevron-cout-en-largeur }

**Une paire de chevrons coûte 96 px de largeur à la rangée.**

??? note "Pourquoi, et depuis quand"
    c'est ce qui fait tomber la case de 87 à 62 dans un vivier paginé.

    Valeur : `2 × --touch + 2 × --sp-4` = 96 · Source : NORMES.md § « 1 quater », mesuré par le lot A 2026-08-26 · Statut : ratifié

### L'écart du chevron avec le code { #chevron-ecart-avec-le-code }

⏳ **À trancher.**

**Le code du 15/08 pose `.stage-chevrons` en haut et en bas, en 36 × 14, non tactile.**

⚠️ En contradiction avec [`chevron.gauche-et-droite`](#chevron-gauche-et-droite) — voir [C6](a-trancher.md#c6).

??? note "Pourquoi, et depuis quand"
    la cote et le refus du 44 *« datent d'un objet qui n'était QU'une amorce — une amorce redondante avec le geste de défilement, pas un contrôle »*. ⏳ *« à revérifier maintenant qu'il devient aussi un contrôle de pagination »*.

    Valeur : `position: absolute; inset: 0` · 36 × 14 · refus du `--touch` 44 · Source : NORMES.md § « LES CHEVRONS — écart mesuré », 2026-08-26 · Statut : à trancher

### Le chevron sur une zone de prose { #chevron-sur-une-zone-de-prose }

⏳ **À trancher.**

**Il n'est pas dit si le chevron s'applique aussi à une zone de prose qui défile.**

??? note "Pourquoi, et depuis quand"
    le garde-fou est posé (*« On doit VOIR qu'il y a plus — sinon le joueur croit avoir tout lu »*), l'organe qui le porte ne l'est pas.

    Source : NORMES.md § « 5 bis — deux gardes-fous », 2026-08-26 · Statut : à trancher

## Le popup

### Trois rôles, trois couleurs { #popup-trois-roles-trois-couleurs }

**Il y a trois popups : le GUIDE (parchemin, optionnel), l'AIGUILLEUR (bleu, il prévient), le GENDARME (rouge, il dit l'erreur).**

??? note "Pourquoi, et depuis quand"
    *« Le temps les sépare : l'aiguilleur parle AVANT (ça va coincer), le gendarme parle APRÈS (ça a coincé, voilà quoi). Un aiguilleur qui constate arrive trop tard, un gendarme qui anticipe crie pour rien. »* Le guide n'a pas de couleur de signal *« et c'est ce qui le rend optionnel : il ne réclame rien. Les deux autres portent un signal, donc ils interrompent. »*

    Valeur : la plomberie `.popup` existe déjà — un composant, trois teintes · Source : NORMES.md § « 7. LES TROIS POPUPS », Eric 2026-08-26 : *« le gendarme dit l'erreur »* · *« l'aiguilleur prévient »* · Statut : ratifié (l'APPLICATION est en standby)

### Le violet est pris par la magie { #popup-violet-est-pris-par-la-magie }

**Le violet ne peut pas servir à un popup : violet = MAGIE.**

??? note "Pourquoi, et depuis quand"
    *« LE VIOLET EST PRIS. Le gendarme redevient rouge. »*

    Valeur : voyants d'attunement et tout le magique de l'Équipement · Source : NORMES.md § « 7 », Eric 2026-08-26 · Statut : ratifié

### `--magie`, une teinte à créer { #popup-magie-teinte-a-creer }

⏳ **À trancher.** Travail réel, pas une convention à écrire.

**`--magie` est une teinte à créer, et la pastille d'attunement doit la porter.**

??? note "Pourquoi, et depuis quand"
    *« Les croquis d'Eric priment sur le texte et sur le code. »* Leçon de la façon dont on l'a trouvé : *« j'ai d'abord écrit « elle porte `--accent`, pas du violet » — en lisant le NOM du jeton, pas sa VALEUR. Aucun de nous deux ne lisait la même chose. »*

    Valeur : `.b3-attune` porte aujourd'hui `--accent` = `#845933`, mesuré **teinte 28°**, un brun-cuivre · ⛔ aucun violet dans `tokens.css` · Source : NORMES.md § « Le code est en ÉCART sur ce point », 2026-08-26 · Statut : à trancher (⏳ travail réel, pas une convention à écrire)

### Un seul popup, trois pastilles { #popup-pile-et-pastilles }

**Un seul popup à l'écran, trois pastilles : le rouge est au-dessus, le bleu au-dessus du parchemin, et on navigue de l'un à l'autre SANS FERMER.**

⚠️ En contradiction avec [`popup.parle-on-ne-l-appuie-pas`](#popup-parle-on-ne-l-appuie-pas) · [`popup.aiguilleur-nom-et-critere`](#popup-aiguilleur-nom-et-critere) — voir [C18](a-trancher.md#c18).

??? note "Pourquoi, et depuis quand"
    trois choses réglées d'un coup — ⛔ jamais trois bulles empilées · *« la hiérarchie est portée par LA PILE, pas par la couleur : le plus urgent est devant, et ça se voit sans lire »* · *« un popup qui en cacherait un autre ferait disparaître une information ; la pastille prouve qu'elle existe »*. ⭐ *« « sans fermer » est le mot qui compte : fermer pour rouvrir ferait perdre le fil. »*

    Valeur : ordre 🔴 gendarme › 🔵 aiguilleur › 📜 guide · Source : NORMES.md § « LES TROIS COEXISTENT », Eric 2026-08-26 : *« c'est le vrai problème, ça. Le rouge est au-dessus, le bleu au-dessus du parchemin. Une pastille permet de naviguer d'une couleur à l'autre SANS FERMER »* · Statut : ratifié

### Une pastille seulement si l'autre parle { #popup-pastille-seulement-si-l-autre-parle }

**Une pastille n'apparaît que si l'autre voix a quelque chose à dire.**

??? note "Pourquoi, et depuis quand"
    *« Une pastille qui ne mène à rien est un bouton qui ment — et le joueur cesserait de les regarder. »*

    Source : NORMES.md § « LES TROIS COEXISTENT », 2026-08-26 · Statut : ratifié

### Les trois points ouverts { #popup-points-non-tranches }

⏳ **À trancher.**

**Trois points restent ouverts : si le gendarme se ferme tout seul, la FORME de la pastille, et ce qu'on voit quand un seul des trois parle.**

??? note "Pourquoi, et depuis quand"
    le corpus les laisse ouverts explicitement : « ⏳ Non tranché : si le gendarme se ferme tout seul · la FORME de la pastille · ce qu'on voit quand un seul des trois parle (zéro pastille, sans doute). »

    Valeur : zéro pastille, sans doute · Source : NORMES.md § « LES TROIS COEXISTENT », 2026-08-26 · Statut : à trancher

### L'application est en standby, pas la norme { #popup-application-en-standby }

⏸️ **En standby.**

**C'est l'APPLICATION des trois voix qui est en standby, pas la norme : un lot LIT cette section et l'applique, il ne PART PAS en chantier dessus.**

??? note "Pourquoi, et depuis quand"
    *« Une norme en standby resterait une norme non écrite — celle-ci ne l'est pas. »* ✅ Une pièce sort du standby : *« le point d'entrée au guide `?` doit être fait par contre »*.

    Valeur : chantier au vault, `0.TASKS/Tasks RPG.md` — *« FHPC : les trois voix »* · Source : NORMES.md § « 7 », Eric 2026-08-26 : *« les guide gendarme aiguilleur, toujours en standby et à l'étude »*, puis *« c'est juste son APPLICATION qui est en standby »* · Statut : en standby

### Ce qu'un popup pose derrière lui { #popup-fenetres-derriere-non-reglees }

⏸️ **En standby.**

**Ce qu'un popup pose derrière lui n'est réglé par aucune règle — trois objets, trois traitements mesurés.**

??? note "Pourquoi, et depuis quand"
    ⚠️ ce qu'un lot doit savoir quand même : *« le `.popup` a une raison DURE de ne rien poser derrière — ancré `bottom: 0`, il est là où vivent les récepteurs du glisser, et un dépôt atterrissait dessus (défaut mesuré le 20/08, payé par `pointer-events: none`). ⛔ Ne pas lui ajouter un voile « pour faire comme l'aiguilleur ». »*

    Valeur : `.popup` ne voile **rien** · `.aiguilleur` du départ voile **tout l'écran à 72 %** · `.confirm-dialog` vit **dans le flux** · Source : NORMES.md § « 7 », mesuré 2026-08-26 ; Eric : *« ça fait partie du standby »* · Statut : en standby

### Un popup parle, on ne l'appuie pas { #popup-parle-on-ne-l-appuie-pas }

**Un popup parle, on ne l'appuie pas.**

⚠️ En contradiction avec [`popup.pile-et-pastilles`](#popup-pile-et-pastilles) · [`popup.aiguilleur-nom-et-critere`](#popup-aiguilleur-nom-et-critere) — voir [C18](a-trancher.md#c18).

??? note "Pourquoi, et depuis quand"
    « deux d'entre eux ne se touchent pas : le voyant (non cliquable) et le popup (il parle, on ne l'appuie pas). ⛔ Ne pas leur donner l'apparence d'un contrôle. »

    Source : NORMES.md § « 2. LES ORGANES », 2026-08-26 · Statut : ⚠️ ratifié mais ouvert — l'aiguilleur porte **deux boutons**, et *« à Eric de dire si ce sont deux organes ou un seul »* (voir [C18](a-trancher.md#c18))

### L'aiguilleur n'est pas une aide { #popup-aiguilleur-nom-et-critere }

**Ce qu'on ne peut pas refuser n'est pas une aide : la fenêtre du départ est un AIGUILLEUR, pas un guide.**

⚠️ En contradiction avec [`popup.parle-on-ne-l-appuie-pas`](#popup-parle-on-ne-l-appuie-pas) · [`popup.pile-et-pastilles`](#popup-pile-et-pastilles) — voir [C18](a-trancher.md#c18).

??? note "Pourquoi, et depuis quand"
    *« le guide est défini par son caractère OPTIONNEL — « il ne réclame rien », on le congédie, on le rouvre au `?`. Celui-ci ne se congédie pas : sans réponse, l'étape n'a pas de point de départ. »*

    Valeur : « guide obligatoire » → `decision-kit` → `aiguilleur`, trois noms en un jour · Source : NORMES.md § « CE QUI EST TRANCHÉ MALGRÉ LE STANDBY », Eric 2026-08-26 : *« c'est plutôt un aiguilleur, on a TOUJOURS besoin de lui »* · Statut : ratifié

### Le guide est un popup { #popup-guide-est-un-popup }

**Le guide est un popup : il ne vit jamais dans le flux et ne prend aucune place dans le budget vertical.**

??? note "Pourquoi, et depuis quand"
    *« la réponse n'est pas « on enlève quelque chose », c'est « ce quelque chose n'avait rien à faire dans le flux ». Un contenu optionnel qui occupe une place fixe n'est pas optionnel. »* ⚠️ Ce que ça n'autorise pas : ⛔ *« sortir du flux tout ce qui gêne. Le guide en sort parce qu'il est optionnel, pas parce qu'il est encombrant. »*

    Valeur : mesuré — le mot du guide valait **63 px sur Class**, et `.parcours-resume` de Species **448 px** à lui seul · Source : NORMES.md § « LE GUIDE EST UN POPUP », Eric 2026-08-26 : *« le guide devient un popup, donc il ne déborde pas »* · Statut : ratifié

## L'aide — le `?`

### Le `?` en bas à droite { #aide-bas-a-droite }

**Le `?` est en bas à droite, fixe, sur la dalle — jamais dans la marge.**

⚠️ En contradiction avec [`cadre.question-en-haut-a-droite`](cadres.md#cadre-question-en-haut-a-droite) · [`aide.entre-dans-la-rangee`](#aide-entre-dans-la-rangee) — voir [C1](a-trancher.md#c1).

??? note "Pourquoi, et depuis quand"
    « un rappel qui défile n'est plus un rappel » (§1 sexies) : sur un écran qui défile, le `?` est collé en bas à droite, hors du flux. Et il est « sur la dalle », jamais dans la marge (§1 bis).

    Valeur : `--touch` 44 ne cède **jamais** · Source : NORMES.md § « Le `?` — le rappel permanent », 2026-08-26 · Statut : ⚠️ **contredit** `cadre.question-en-haut-a-droite` — voir [C1](a-trancher.md#c1)

### Le `?` entre dans la rangée { #aide-entre-dans-la-rangee }

**Le `?` entre dans la rangée de boutons, collé à droite, et il ne participe pas au centrage.**

⚠️ En contradiction avec [`cadre.question-en-haut-a-droite`](cadres.md#cadre-question-en-haut-a-droite) · [`aide.bas-a-droite`](#aide-bas-a-droite) — voir [C1](a-trancher.md#c1).

??? note "Pourquoi, et depuis quand"
    « il n'entre pas en conflit avec le centrage des boutons, il sera toujours collé à droite » (Eric) — la rangée réserve une colonne de `--touch` de chaque côté et les boutons se centrent sur ce qui reste. ⛔ `--touch` 44 ne cède jamais.

    Valeur : colonne réservée de `--touch` · Source : NORMES.md § « Le `?` », tranché 2026-08-26 — Eric : *« il n'entre pas en conflit avec le centrage des boutons, il sera toujours collé à droite »* · Statut : ratifié

### Le cycle de vie du `?` { #aide-cycle-de-vie }

**Le `?` apparaît de base, propose systématiquement d'être désactivé totalement, un `ok` le fait partir pour cette fois, il revient à chaque nouveau personnage sauf désactivation, et la réactivation est toujours possible.**

??? note "Pourquoi, et depuis quand"
    *« Le `?` est ce qui autorise le guide à disparaître : on ne ferme franchement une aide que si l'on sait la retrouver. »* *« La seconde est la seule qui survit au personnage suivant. »*

    Valeur : deux sorties distinctes — `ok` = « pas maintenant » · désactivation = « plus jamais, et c'est dans le menu » · Source : NORMES.md § « Le `?` », 2026-08-26 · Statut : ratifié

### Borné aux écrans qui ont un guide { #aide-borne-aux-ecrans-qui-ont-un-guide }

**Le `?` n'apparaît que sur les écrans qui ONT un guide.**

??? note "Pourquoi, et depuis quand"
    *« Un `?` qui n'ouvre rien apprend à ne plus le regarder. »*

    Source : NORMES.md § « Le `?` », 2026-08-26 · Statut : ratifié

### L'aspect du `?` { #aide-aspect }

**Le `?` est plein en parchemin quand le guide n'a jamais été vu, un simple cercle quand il l'a été.**

??? note "Pourquoi, et depuis quand"
    *« C'est la loi du voyant de la ceinture, appliquée à un autre organe : plein = il y a quelque chose pour toi, contour = tu l'as lu, je reste là. »* Le vert avait été envisagé puis écarté : *« dans l'échelle il dit « fini », ce qui est l'inverse de « jamais vu » »*. ⛔ Et ça ne crie pas : *« un `?` en couleur de signal réclamerait l'attention qu'il a précisément le droit de ne pas prendre »*.

    Valeur : rond de **22 px** · ⛔ aucune couleur de l'échelle · Source : NORMES.md § « SON ASPECT », Eric 2026-08-26 : *« le `?` en parchemin quand jamais vu, juste un cercle quand consommé »* · Statut : ratifié

## Le livre

### Le livre, jumeau gauche du `?` { #livre-jumelle-gauche-du-question }

**Le livre est un rond de 22 px, à la cote exacte du `?`, collé en bas à GAUCHE.**

??? note "Pourquoi, et depuis quand"
    ⭐ *« CE QUE ÇA RANGE DÉPASSE LA PLACE : le pied portait deux mots pour deux gestes de nature différente — `LORE` ouvre une lecture, `CHOOSE` écrit dans le document. Au même habit, côte à côte, ils disaient qu'ils se valaient. »* ➡️ *« ⭕ à gauche on LIT · le bouton au centre on CHOISIT · ⭕ à droite on demande de l'AIDE. »*

    Valeur : dessin 22 · cible `--touch` 44 · Source : NORMES.md § « 7 bis — LE LIVRE », Eric 2026-08-26 : *« plutôt qu'un bouton rules ou lore, on crée un bouton de même dimension que `?` mais à ma gauche, il contient un livre… et exit le bouton lore »* · *« le livre doit être dans un bouton rond, même taille que `?` »* · Statut : ratifié

### Le livre est dessiné { #livre-dessine-pas-un-glyphe }

**Le livre est dessiné, jamais écrit avec un glyphe 📖.**

??? note "Pourquoi, et depuis quand"
    *« un glyphe 📖 change de forme selon la police installée et rend une couleur qui n'est pas la nôtre — même raison qu'au pouce de l'interrupteur »*.

    Valeur : cercle 28 px, un livre à couverture et **dos** · Source : NORMES.md § « 7 bis » et § « LES AUTRES ORGANES », 2026-08-26 · Statut : ratifié

### Un organe sans texte se nomme { #livre-aria-label }

**Un organe sans texte doit se nommer par `aria-label`.**

??? note "Pourquoi, et depuis quand"
    *« sinon il disparaît de la page pour qui ne voit pas le dessin »*.

    Valeur : le garde l'exige · Source : NORMES.md § « 7 bis », 2026-08-26 · Statut : ratifié

### Le livre peut exister sans être câblé { #livre-peut-exister-sans-etre-cable }

**Le livre peut exister sans être câblé — exception nommée, et seulement pendant la construction.**

??? note "Pourquoi, et depuis quand"
    c'est une exception à *« un `?` qui n'ouvre rien apprend à ne plus le regarder »*. ⏳ *« Un livre qui n'ouvrirait toujours rien le jour où le reste est fini serait le défaut que cette règle-là interdit. »*

    Source : NORMES.md § « LA PAIRE », Eric 2026-08-26 : *« le livre n'est pas toujours câblé, il le sera »* · Statut : ratifié (exception bornée dans le temps)

### Sur Abilities, `INFO` devient un livre { #livre-abilities-info-devient-livre }

**Sur Abilities, le bouton `INFO` devient un livre et le mot quitte l'écran.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« Il portait `ability-entry` — donc le gabarit, l'octogone et le pan coupé des quatre méthodes. Un cinquième bouton identique proposait quelque chose qui n'est pas un choix. »* La feuille l'admettait à demi-mot le 16/08 : *« il ne se distingue plus par sa forme »*, et il fallait une phrase sous la rangée *« dont le seul travail était de rattraper une confusion de forme »*. ⚠️ Il garde `aria-pressed` (c'est un interrupteur : le panneau est ouvert, ou non) et un `aria-label`.

    Valeur : mesuré à 1100 px (v313) — livre **44 × 44** à gauche, `?` **44 × 44** à droite, les quatre méthodes centrées entre eux · Source : NORMES.md § « PREMIER CÂBLAGE RÉEL DU LIVRE », Eric 2026-08-26, deux fois : *« Info doit devenir un livre et disparaître »* · *« Abilities : info doit disparaître et devenir un bouton livre ! »* · Statut : ratifié

### Un déplacement rend faux un texte { #livre-un-deplacement-rend-faux-un-texte }

**Un déplacement peut rendre faux un texte qu'on n'a pas touché.**

??? note "Pourquoi, et depuis quand"
    *« la phrase ne parlait pas d'elle-même, elle POINTAIT »*.

    Valeur : *« pick one of the methods ABOVE »* remonté au-dessus de la rangée désignait la barre d'étapes · Source : NORMES.md § « PREMIER CÂBLAGE RÉEL DU LIVRE », 2026-08-26 · Statut : ratifié

### La rangée est encore vide { #livre-rangee-encore-vide }

⏳ **À trancher.**

**La rangée réserve bien sa colonne mais elle est vide sur les dix écrans : le `?` vit encore au coin bas-droit d'une dalle, et cinq écrans sur dix n'ont aucune rangée.**

??? note "Pourquoi, et depuis quand"
    *« Le déplacer demande de changer l'ordre de rendu (la rangée est posée APRÈS la carte, le `?` ne peut pas la voir depuis là) et de répondre pour les cinq écrans sans rangée. C'est un lot, pas une retouche. »*

    Valeur : mesuré par le lot G le 2026-08-26 · Source : NORMES.md § « LA PAIRE — ce qui reste à faire » · Statut : à trancher

## Le dropdown

### Les deux métiers du dropdown { #dropdown-deux-metiers }

**Il y a deux dropdowns : celui de CHOIX (on y prend une valeur) et le DIRECTIONNEL (il dit où va l'objet).**

??? note "Pourquoi, et depuis quand"
    « ils ne font pas le même métier » : l'un sert à prendre une valeur, l'autre à dire où va l'objet — et c'est cette différence de métier qui rend la valeur par défaut obligatoire sur le second seulement.

    Valeur : directionnel = le collecteur d'équipement, dropdown `backpack` par défaut + bouton `Send` · Source : NORMES.md § « LES DEUX DROPDOWNS », tranché 2026-08-26 · Statut : ratifié

### Un directionnel a un défaut obligatoire { #dropdown-defaut-obligatoire-au-directionnel }

**Un dropdown directionnel a OBLIGATOIREMENT une valeur par défaut.**

??? note "Pourquoi, et depuis quand"
    *« il répond à une question que le joueur ne s'est pas posée. Sans défaut, l'objet reste en l'air et le geste échoue en silence — avec `backpack` déjà là, `Send` marche du premier coup. »* C'est la règle des **prévalidés** : *« un réglage qui a un bon défaut se montre sans se demander »*.

    Valeur : `backpack` · Source : NORMES.md § « LES DEUX DROPDOWNS », 2026-08-26 · Statut : ratifié

### L'habit du dropdown { #dropdown-habit }

**Un dropdown est rectangulaire, très large et peu haut, sans aucun liseré, à 20 % de transparence, en caractères gras contrastants.**

⚠️ En contradiction avec [`dropdown.ecart-avec-le-code`](#dropdown-ecart-avec-le-code) — voir [C7](a-trancher.md#c7).

??? note "Pourquoi, et depuis quand"
    *« c'est un contrôle qu'on touche »*, donc 44.

    Valeur : hauteur `--touch` **44** · Source : NORMES.md § « LES DEUX DROPDOWNS », Eric 2026-08-26 — *« PAS DE LISERÉ sur un dropdown »*, corrigeant sa propre dictée · Statut : ratifié

### L'écart du dropdown avec le code { #dropdown-ecart-avec-le-code }

⏳ **À trancher.** Écart connu.

**Le code est en écart sur trois points : liseré 1 px (et même vert conditionnel), fond opaque, pas de gras.**

⚠️ En contradiction avec [`dropdown.habit`](#dropdown-habit) — voir [C7](a-trancher.md#c7).

??? note "Pourquoi, et depuis quand"
    ⏳ *« Trois corrections à faire quand les organes seront refaits. La hauteur, elle, n'a pas à bouger. »*

    Valeur : `.pipeline-dropdown` porte `--ok`, *« exactement le liseré vert supprimé »* · fond `--surface` / `--sunken` · `font: inherit` · Source : NORMES.md § « Le dropdown : la hauteur est juste, le reste est en écart », 2026-08-26 · Statut : à trancher (⏳ écart connu)

## La saisie

### La zone d'écriture { #saisie-zone-d-ecriture }

**Il n'y a rien à normer sur la zone d'écriture : elle est bien par défaut.**

??? note "Pourquoi, et depuis quand"
    Eric le 26/08, annulant sa propre dictée : « rien à normer, elle est bien par défaut » — le liseré rose dicté « n'existait dans aucune palette ».

    Valeur : hauteur `--touch` 44 · ⛔ le liseré rose de la dictée est annulé (*« il n'existait dans aucune palette »*) · Source : NORMES.md § « 8 », Eric 2026-08-26 · Statut : ratifié
