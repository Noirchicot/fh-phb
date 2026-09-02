# Les cadres

Cette page dit dans quelle BOÎTE un écran est rendu : les trois écrans F / FF / FS, les trois objets carte / dalle / tuile, leurs largeurs, leurs marges et leurs voiles. Elle couvre aussi ce que le cadre ne dit pas — l'habillage, `data-bleed`, et le Seuil, qui est un plein écran à part.

## Les trois écrans et les trois objets

### Les trois écrans : F, FF, FS { #cadre-trois-ecrans }

**Il y a trois écrans — F, FF, FS — et seul l'écran porte la lettre.**

??? note "Pourquoi, et depuis quand"
    F = belt + menu latéral + une colonne · FF = belt + contenu sur toute la scène · FS = plein écran, ni belt ni menu. La grille à deux chiffres qu'il remplace *« collait une propriété d'ÉCRAN (le rail) à une propriété de DALLE (la hauteur) en une étiquette, et la faisait porter par la dalle — qui ne peut pas connaître le rail »*.

    Valeur : `data-ecran="F|FF|FS"` posé par `paintAside` (shell.mjs) · Source : CADRES.md § « 2. LE MODÈLE RATIFIÉ », Eric 2026-08-19 · Statut : ratifié

### Les trois objets : carte, dalle, tuile { #cadre-trois-objets }

**Il y a trois objets — carte, dalle, tuile — et aucun ne porte jamais de lettre.**

??? note "Pourquoi, et depuis quand"
    les trois défauts qui ont tué la grille sont tous nés de la confusion : *« le chapeau de chapitre déclarait FF3 sur les huit chapitres et était un F3 sur quatre »* · *« deux F1 portaient deux mesures »* · *« le guide général déclaré F1 faisait 275 px au lieu de 440 »*.

    Valeur : `data-objet="carte|dalle|tuile"` · Source : CADRES.md § « 2 — Deux niveaux, deux mots », 2026-08-19 · Statut : ratifié

### La traduction de l'ancien vocabulaire { #cadre-traduction-ancien-vocabulaire }

**F1/FF1 = carte · F2/FF2 = dalle · F3/FF3 = dalle saignante · l'ancien FS (l'îlot) = tuile · FS = plein écran (sens neuf).**

??? note "Pourquoi, et depuis quand"
    *« FS N'EST PLUS L'ÎLOT »* — le nom reprend le sens qu'Eric lui donnait en parlant de `Rules` : *« détacher un chapitre entier du player et l'afficher en FS »*, *« on recouvre tout »*.

    Source : CADRES.md § « 2 — La traduction de l'ancien vocabulaire », 2026-08-19 · Statut : ratifié

### Un FS porte une sortie nommée { #cadre-fs-sortie-nommee }

**Un plein écran (FS) DOIT porter une sortie nommée.**

??? note "Pourquoi, et depuis quand"
    il recouvre tout, belt comprise — sans sortie explicite, on ne peut plus revenir.

    Source : CADRES.md § « 2 », 2026-08-19 · Statut : ratifié

## La carte, la dalle, la tuile

### La hauteur imposée de la carte { #cadre-carte-hauteur-imposee }

**Une carte a une hauteur IMPOSÉE : `--fiche-h` = 440.**

⚠️ En contradiction avec [`budget.carte-r-hauteur`](budget.md#budget-carte-r-hauteur) — voir [C20](a-trancher.md#c20).

??? note "Pourquoi, et depuis quand"
    *« une fiche fait un écran, ni plus ni moins »*. C'est ce qui rend le défilement aimanté honnête (`scroll-snap-type: y mandatory`, gardé par `snap.test.mjs`).

    Valeur : `--fiche-h: 440` (⚠️ écrit « 440 px » dans CADRES, « 440 blg » dans NORMES §4 quater) · Source : CADRES.md § « 3. LA CARTE », décision d'Eric du 2026-08-15 · Statut : ratifié

### La largeur d'une carte { #cadre-carte-largeur }

**La largeur d'une carte a un plancher calculé de 242 et un plafond `--measure`.**

??? note "Pourquoi, et depuis quand"
    *« Le plancher est calculé, pas choisi. »*

    Valeur : plancher `242` = 360 − 16 marge − 78 rail − 8 écart − 16 marge · plafond `--measure` 62ch · Source : CADRES.md § « 3. LA CARTE », 2026-08-16 · Statut : ratifié

### Ce que la hauteur imposée achète { #cadre-carte-achete-la-regularite }

**La hauteur imposée de la carte n'achète pas de la hauteur, elle achète de la RÉGULARITÉ.**

??? note "Pourquoi, et depuis quand"
    *« En F3, le catalogue d'espèces montrerait deux tailles de carte (392 et 440) au défilement. C'est ça qu'on perdrait — pas des pixels. »* La cause est nommée : la bande d'infos (`data-infos="oui"`, 14 px) redistribue le reste. Sur les classes, elle serre les douze de 15 px — *« le signe qu'elles sont à la limite : un mot de plus dans un blurb sortira par là »*.

    Valeur : 12 classes → 455 naturel comprimé à 440 · 5 espèces → 440 pile · 7 espèces → 392 + 48 de vide · Source : CADRES.md § « 3 — CE QUE LA COTE IMPOSÉE ACHÈTE », mesuré 2026-08-16 à 375 × 553 · Statut : ratifié

### La dalle a la hauteur de son contenu { #cadre-dalle-hauteur-libre }

**Une dalle a la hauteur de son contenu ; sa largeur est plafonnée par `--measure`.**

??? note "Pourquoi, et depuis quand"
    c'est tout ce qui la sépare de la carte. *« tout ce qui n'est pas une fiche est un 2 aujourd'hui »*.

    Valeur : écart 8 · Source : CADRES.md § « 2 » et § « 4 », 2026-08-19 · Statut : ratifié

### La tuile n'a que des marges { #cadre-tuile-n-a-que-des-marges }

**Une tuile n'a ni largeur ni hauteur écrite : seulement un nombre de colonnes, un écart et une forme.**

??? note "Pourquoi, et depuis quand"
    Eric : *« les petits îlots sur lesquels étaient les dés, ils ont seulement des marges, il faut s'en souvenir »*. La hauteur vient du contenu et les six s'égalisent parce qu'une ligne de grille prend la hauteur de sa plus haute cellule.

    Valeur : `repeat(6, 1fr)` · écart `4` · Source : CADRES.md § « 7. LA TUILE », Eric 2026-08-19 · Statut : ratifié

### L'écart entre tuiles : 4 { #cadre-tuile-ecart-4 }

**L'écart entre tuiles est de 4, et c'est l'arithmétique de 360 qui l'impose.**

⚠️ En contradiction avec le corpus — aucune autre règle ne porte l'autre camp — voir [C19](a-trancher.md#c19).

??? note "Pourquoi, et depuis quand"
    à 8, l'îlot vaut 50,7 et son dé 42 — *« deux pixels sous `--touch` (44) »*. Et ce n'est pas rattrapable : six cases de 52 plus cinq écarts de 8 demandent 352 px pour 344 disponibles.

    Valeur : écart `4` → îlot 54, dé 46 · Source : CADRES.md § « 7 », mesuré 2026-08-16 · Statut : ratifié

### La taille du dé se déduit { #cadre-tuile-taille-du-de-deduite }

**La taille du dé est écrite (le moteur 3D veut des pixels) mais elle se déduit de la largeur mesurée d'un îlot, jamais d'une constante.**

??? note "Pourquoi, et depuis quand"
    c'est `budget.contenant-se-deduit` appliqué à un cas où le pixel est obligatoire.

    Valeur : dé `46` à écart 4 · Source : CADRES.md § « 7 », 2026-08-16 · Statut : ratifié

## Les largeurs

### `--measure`, un seul plafond { #cadre-measure-unique }

**`--measure` vaut 62ch, c'est un plafond et il n'y en a qu'un.**

⚠️ En contradiction avec [`cadre.trois-largeurs`](#cadre-trois-largeurs) — voir [C12](a-trancher.md#c12).

??? note "Pourquoi, et depuis quand"
    Eric : *« 62 fonctionne sur le plus petit comme le plus grand, avec et sans rail »*. Un `--measure-f` a vécu une heure avant d'être tué : *« deux noms pour une valeur, c'est la divergence garantie au premier réglage »*.

    Valeur : `--measure: 62ch` · Source : CADRES.md § « 2 », Eric 2026-08-19 · Statut : ratifié (⚠️ voir contradiction [C12](a-trancher.md#c12) — « il n'y a pas une mesure, il y en a trois »)

### Les trois largeurs max { #cadre-trois-largeurs }

**Trois largeurs max cohabitent : carte 625, panneau 625, grille 605 — leur nature diffère (carte, contrôles, grille).**

⚠️ En contradiction avec [`cadre.measure-unique`](#cadre-measure-unique) — voir [C12](a-trancher.md#c12).

??? note "Pourquoi, et depuis quand"
    *« une grille de compétences n'est pas un paragraphe, une rangée de caractéristiques non plus. Le cadre dit la marge ; c'est l'ÉCRAN qui dit de quelle nature est sa largeur. »*

    Valeur : `--card-w` 625 blg · `--panel-w` 625 blg · `--grid-w` 605 blg (60 ch de raison) · Source : CADRES.md § « 2 bis. LES COTES, EN CHIFFRES », 2026-08-30 · Statut : ratifié

### Une seule colonne de cotes { #cadre-une-seule-colonne }

🧊 **Renversée le 2026-08-30** — remplacée par l'échelle : le grand écran est servi par des pixels plus gros, pas par des cotes plus grandes : voir [`panneau.zoom-universel`](panneau.md#panneau-zoom-universel).

**La table des cotes n'a plus qu'une colonne : les mêmes valeurs à tous les crans, en blg.**

??? note "Pourquoi, et depuis quand"
    *« Une largeur qui double sur grand écran pendant que `--sp-8` ne bouge pas change un rapport. »* Ce qui remplace la seconde colonne : l'échelle. *« Au cran 2 elle rend 1 250 pixels, bien au-delà des 766 que le desktop obtenait. Le grand écran n'est plus servi par des cotes plus grandes, il est servi par des pixels plus gros. »*

    Valeur : 766 et 887 n'existent plus · Source : CADRES.md § « 2 bis — UNE SEULE COLONNE DEPUIS LE 2026-08-30 » · Statut : renversé le 2026-08-30 (la seconde colonne)

### Une cote de cadre se fige en pixels { #cadre-cote-en-px-le-ch-est-la-raison }

**Une cote de CADRE se fige en pixels ; le `ch` ne reste légitime que pour borner de la prose.**

??? note "Pourquoi, et depuis quand"
    157 px d'écart pour la MÊME déclaration — *« `ch` est la largeur du « 0 » de la police résolue au point d'usage »*. Coût : cinq correctifs de largeur *« tous vérifiés justes ici et tous faux chez Eric »*, deux états du même écran rendant 904 puis 690 px sur ses captures. *« Google Headless ne protège que du moteur qu'on regarde. »*

    Valeur : `76ch` → 765 px (Inter), 766 (système), **608** (police de repli) · Source : CADRES.md § « 2 bis — LA COTE EST EN PIXELS », 2026-08-29 · Statut : ratifié

### Le format ne dit pas la largeur { #cadre-largeur-n-est-pas-une-propriete-du-format }

**Le format ne dit pas la largeur : deux écrans du même format peuvent en avoir des différentes.**

??? note "Pourquoi, et depuis quand"
    *« le chiffre du barème ne dit QUE la hauteur ; la lettre ne dit QUE le menu latéral. Aucun des deux ne dit la largeur. »* Ce que §4 et §6 donnent est *« ce que leur utilisateur actuel emploie, pas une contrainte du format »*.

    Valeur : les 7 « FF2 » emploient trois largeurs — `--grid-w` (Compétences, Équipement), `--panel-w` (Caractéristiques), `--measure` (Concept, Destinée) · Source : CADRES.md § « 2 bis », question d'Eric 2026-08-16 · Statut : ratifié

## Les marges et la saignante

### Les marges sur les quatre côtés { #cadre-marges-quatre-cotes }

**Les marges sont sur les quatre côtés, systématiquement, avec un seul jeton pour tout le vocabulaire.**

??? note "Pourquoi, et depuis quand"
    *« elles ne font donc pas partie du barème »*. Défaut antérieur corrigé : le pied n'avait aucune gouttière latérale — il touchait les deux bords pendant que la carte gardait ses 8 px.

    Valeur : `--sp-8` = 8 blg · `--sp-16` = 16 blg · Source : CADRES.md § « 2 bis », 2026-08-16 · Statut : ratifié

### La gouttière cède la dernière { #cadre-marge-cede-la-derniere }

**La gouttière ne cède que si un organe ne rentre pas sans elle — et à 360 la mesure dit qu'elle reste.**

??? note "Pourquoi, et depuis quand"
    Eric en deux temps le même jour : *« pour les 360 on se passe de marge, mais faut que ça rentre »*, puis *« si en 360 la marge est possible sans impacter tout le monde, on l'applique »*. Mesuré : aucun écran ne déborde, les skills tiennent leur 4 + 3 et les six caracs leur ligne unique — **la marge reste**.

    Valeur : 8 écrans rendent 352 dans 360 · Source : NORMES.md § « 1 ter quater », 2026-08-29 · Statut : ratifié

### Pas de `width: 100%` sur une boîte à marge { #cadre-pas-de-width-100-sur-boite-a-marge }

**On ne remplit pas une largeur avec `width: 100%` sur une boîte qui porte une marge : les gouttières se portent sur le CADRE.**

??? note "Pourquoi, et depuis quand"
    *« Un pourcentage se calcule sur le contenant sans déduire les marges. »* Et `margin-inline: auto` **désactive** l'étirement en cross-axis : remplir ET centrer demande de porter les gouttières sur le cadre.

    Valeur : mesuré — la carte demandait 360 + 8 et sortait de 4 px · Source : NORMES.md § « 1 ter quater », 2026-08-29 · Statut : ratifié

### La marque `saignante` { #cadre-saignante }

**`saignante` est la seule marque : une dalle finit par un filet débordant de −16 pour dire qu'une autre suit — jamais la dernière dalle d'un écran.**

??? note "Pourquoi, et depuis quand"
    *« Jamais sur la dernière dalle d'un écran : elle n'aurait rien à séparer. »*

    Valeur : `--saignee-debord` = −16 · `data-saigne="oui"` · Source : CADRES.md § « 2 », 2026-08-19 · Statut : ratifié

### Le cadre d'écran est nu { #cadre-cadre-d-ecran-nu }

**Le cadre d'écran ne porte ni fond, ni liseré, ni rembourrage — il ne garde que sa marge.**

⚠️ En contradiction avec [`cadre.data-bleed`](#cadre-data-bleed) — voir [C14](a-trancher.md#c14).

??? note "Pourquoi, et depuis quand"
    Eric devant v298 : *« le cadre en blanc pourquoi ? derrière la dalle que fait-il là ? »* — **Rien.** *« Il dessinait une boîte autour du vide. »* La marge reste, et c'est sa phrase du 17/08 : *« sans elle, les dalles toucheraient les bords de l'écran. C'est la carte qui s'efface, pas ses gouttières. »* ⛔ *« UN CONTOUR EST UNE PEINTURE »* — appliquer la règle à moitié (retirer le fond, garder `border` et `padding`) *« donne la confiance de l'avoir appliquée »*.

    Valeur : `.decision-card` — fond transparent · liseré 0 · rayon 0 · rembourrage 0 · marge 16 · écart cadre → dalle = 0 des trois côtés · Source : NORMES.md § « 1 quinquies bis », Eric 2026-08-26 · Statut : ratifié

### Rien dans la marge { #cadre-rien-dans-la-marge }

**Rien n'est jamais dans la marge, à part une dalle ou une tuile.**

??? note "Pourquoi, et depuis quand"
    *« RIEN ne doit jamais être dans la marge !!! »* · *« à part des dalles et des tuiles »*. *« La marge est une RESPIRATION, pas une réserve de place. Le jour où un contrôle y déborde, c'est que la page porte quelque chose en trop. »* ⛔ Cette loi annule *« le chevron apparaît dans une marge si possible »*, corrigé par Eric le jour même.

    Valeur : ⛔ bouton · jeton · chevron · `?` · popup · texte · Source : NORMES.md § « 1 bis », Eric 2026-08-26 en majuscules · Statut : ratifié — annule toute formulation antérieure

## La ceinture et le menu latéral

### La ceinture est toujours visible { #cadre-belt-toujours-visible }

**La ceinture n'est jamais couverte par aucun cadre : elle n'est pas un cadre, c'est la coquille, et un cadre commence sous elle.**

⚠️ En contradiction avec [`budget.entree-r-sans-ceinture`](budget.md#budget-entree-r-sans-ceinture) · [`cadre.seuil-est-un-fs`](#cadre-seuil-est-un-fs) — voir [C10](a-trancher.md#c10).

??? note "Pourquoi, et depuis quand"
    elle n'est pas un cadre : c'est la coquille, et « un cadre commence sous elle ». La constante est écrite en tête de CADRES sous le titre « LA CONSTANTE, ET ELLE EST AU-DESSUS DE TOUT ».

    Valeur : hauteur mesurée **60** (375 × 553, 2026-08-16) · Source : CADRES.md § « 0. LA CONSTANTE », première ligne du croquis : *« BELT IS ALWAYS VISIBLE »* · Statut : ratifié (⚠️ voir contradiction [C10](a-trancher.md#c10) — FS recouvre tout, et Entrée › R n'a pas de ceinture)

### Le menu latéral : 90 blg { #cadre-rail }

**Le menu latéral vaut 90 blg partout, et n'existe que là où il y a une liste à suivre.**

??? note "Pourquoi, et depuis quand"
    les douze classes, les douze espèces, les 22 arcanes. Il valait 90 à l'étroit et 120 en grandeur Large jusqu'au 30/08 : *« c'était un rapport qui changeait avec la place — 11,25 fois `--sp-8` d'un côté, 15 de l'autre »*. Sur un 1920 au cran 2 le rail rend 180 pixels, bien au-delà des 120 que le desktop obtenait.

    Valeur : `--rail-w: 90` blg · `.stage-aside` · Source : CADRES.md § « 1. LES DEUX FAMILLES », 2026-08-30 · Statut : ratifié (le 120 en Large est renversé le 2026-08-30)

### Qui porte le menu latéral { #cadre-qui-porte-le-rail }

**Portent le menu (F) : Species, Class, le don d'origine panneau ouvert, Destiny en mode choix. Tout le reste est FF.**

??? note "Pourquoi, et depuis quand"
    *« la famille F N'A QU'UN SEUL FORMAT EN SERVICE, ET C'EST F1 : tout ce qui porte le menu est une fiche de catalogue. »* C'est Eric qui l'a relevé — *« Concept c'est du FF1 car pas de barre latérale »* — et le code lui donne raison.

    Valeur : relevé dans `catalogueCourant` (shell.mjs), 2026-08-16 · Source : CADRES.md § « 3 bis » · Statut : ratifié

### Le menu de Destiny en mode choix { #cadre-destiny-menu-en-mode-choix }

⏳ **À trancher.**

**Destiny n'a de menu qu'en mode choix ; le mettre en FF reviendrait à retirer le menu du mode qui en a le plus besoin.**

??? note "Pourquoi, et depuis quand"
    *« À trancher avant de le faire. »*

    Valeur : 22 arcanes · Source : CADRES.md § « 5 », 2026-08-16 · Statut : à trancher

### La dalle en écran F, place réservée { #cadre-f2-place-reservee }

**La dalle dans un écran F (ex-F2) n'a aucun utilisateur et rien ne l'implémente : c'est une place réservée.**

??? note "Pourquoi, et depuis quand"
    *« aucun écran du builder ne pose sa hauteur aujourd'hui »*.

    Valeur : `--card-w` = `--measure` · Source : CADRES.md § « 4 », 2026-08-16 · Statut : ratifié (place réservée)

## Le budget d'une fenêtre et le pied

### La promesse de l'air { #cadre-promesse-de-l-air }

⏳ **À trancher.** Le plafond structurel n'est pas posé.

**Toute fenêtre flottante promet de l'AIR en haut et en bas — c'est un plafond qu'il lui faut, jamais une hauteur imposée.**

??? note "Pourquoi, et depuis quand"
    Eric : *« Je l'ai conçue pour qu'elle puisse ressembler à une CARTE : marges au-dessus ET en dessous, sur mon portable. »* *« Une carte qui touche les deux bords n'est plus une carte, c'est une page. »* Mesuré : à 667 × 375 (SE couché) Concept demande 255 et Universe 301 pour 223 disponibles — les deux débordent. ⛔ *« Ce n'est PAS un défaut de contenu. Les deux écrans sont sobres. »*

    Valeur : budget réel = `champ − 76 − 16` · Source : CADRES.md § « 4 — CE QUE TOUTE FENÊTRE FLOTTANTE PROMET », Eric 2026-08-16 · Statut : à trancher (le plafond structurel n'est pas posé)

### Un plafond, seulement en secours { #cadre-plafond-en-secours }

⏳ **À trancher.**

**Un plafond sur la carte n'est légitime qu'en secours : il ne mord que quand la carte allait déborder.**

??? note "Pourquoi, et depuis quand"
    Eric : *« Si ton tweak n'intervient qu'en urgence oui, sinon non. »* — *« c'est exactement ce que fait un `max-height` … Rien à inventer, il est natif. »* ⏳ Non posé pour autant. Prix connu : un second défilement dans la scène.

    Valeur : `max-height` · Source : CADRES.md § « 0 bis, décision 3 », Eric 2026-08-16 · Statut : à trancher

### Le téléphone couché n'est pas une cible { #cadre-telephone-couche-hors-cible }

**Le téléphone COUCHÉ n'est pas une cible ; l'iPad couché en reste une.**

??? note "Pourquoi, et depuis quand"
    Eric mot pour mot : *« mon petit portable en mode paysage on s'en fout »*. ⛔ *« Cela ne dit RIEN de l'iPad couché, qui reste une cible (c'est lui qui a imposé la composition à trois colonnes de F1). »*

    Source : CADRES.md § « 0 bis, décision 2 », Eric 2026-08-16 · Statut : ratifié

### `Validate` a disparu { #cadre-validate-disparu }

**`Validate` a disparu partout, remplacé par la paire `BACK` / `DONE` produite une seule fois par la coquille.**

??? note "Pourquoi, et depuis quand"
    *« ce n'était pas un réglage : c'est la barre qui pesait 76 px dans le champ de chaque écran »*. `BACK` recule d'un palier quand il y en a un, d'une étape sinon. ⛔ Les écrans à fiche restent l'exception : `CHOOSE` valide chez eux, et le pied ne s'y pose qu'au 2ᵉ palier.

    Valeur : `renderSortieEtape` (shell.mjs) · lot 80 · Source : CADRES.md § « 0 bis, décision 1 », 2026-08-16 · Statut : ratifié

### Le pied fait 76 { #cadre-pied-76 }

**Le pied fait 76 blg de haut, et cette cote ne bouge pas tant que la paire tient sur UNE ligne.**

??? note "Pourquoi, et depuis quand"
    *« Deux boutons côte à côte coûtent ce qu'un seul coûtait. »* Le budget est de **24 caractères de libellé** contre 8 aujourd'hui. ⛔ *« Un troisième bouton coûterait en plus son propre rembourrage (42 px), donc c'est LUI le vrai risque, pas la longueur d'un mot. »* Gardé par `tests/shell-wiring.test.mjs` — *« une condition que personne ne teste est une condition qui rouille »*.

    Valeur : champ intérieur 344 (à 360) · `BACK` 79 + `DONE` 82 + écart 8 = 169 · **mou restant 175** · Source : CADRES.md § « 0 bis, décision 1 », mesuré après bascule 2026-08-16 · Statut : ratifié

### La prédiction fausse du 16/08 { #cadre-prediction-fausse-du-16-08 }

🧊 **Renversée le 2026-08-16** — remplacée par la décision « le téléphone couché n'est pas une cible », qui seule retire le cas du chemin — la cote de 76, elle, ne bouge pas : voir [`cadre.telephone-couche-hors-cible`](#cadre-telephone-couche-hors-cible).

**Le départ de `Validate` ne rend pas ses 76 px : le budget de F2 est inchangé et le cas qui débordait déborderait encore.**

??? note "Pourquoi, et depuis quand"
    *« La raison qui était écrite ici était FAUSSE. »* Ce qui retire réellement le cas du chemin, c'est la décision « le téléphone couché n'est pas une cible », et elle seule. *« Une prédiction qui se vérifie doit être vérifiée : celle-ci ne tenait pas. »*

    Valeur : 76 avant, 76 après · Source : CADRES.md § « 0 bis, décision 3 », vérifié 2026-08-16 · Statut : renversé le 2026-08-16 (la raison, pas la cote)

## L'habillage

### L'habillage `D-…` { #cadre-habillage-d }

**L'habillage se nomme `D-<format>-<variante>-<plateforme>` : le cadre dit la BOÎTE, l'habillage dit ce qu'il y a dedans.**

??? note "Pourquoi, et depuis quand"
    Eric : *« c'est comment on organise les boîtes de texte dans une fenêtre, et aussi son background »*. *« Les deux variantes sont identiques aujourd'hui — et le nom existe justement pour qu'elles puissent cesser de l'être sans rien renommer. »*

    Valeur : `D-F1-1-d` / `D-F1-1-m` (species) · `D-F1-2-d` / `D-F1-2-m` (classes) · Source : CADRES.md § « 8 », Eric 2026-08-16 · Statut : ratifié

### Une boîte achète une cote réservée { #cadre-boite-achete-une-cote-reservee }

**Une boîte n'achète pas une proportion, elle achète une COTE RÉSERVÉE.**

??? note "Pourquoi, et depuis quand"
    mesuré sur la même fiche (Barbarian) à 375 × 553 et 1280 × 800 : la dalle gagne ×2,32 en largeur pendant que TEXTE 1 **rétrécit** (145 → 106). Le dépôt l'a déjà payé : *« en la laissant se partager la place, la première vraie image l'a fait tomber à 203,6 et les lignes de sous-classe se sont repliées »* — `fiche.css`, *« une cote de lecture ne recule pas devant un décor »*. **C'est l'image qui cède, jamais le texte.**

    Valeur : colonne de lecture **226 px** · corps **16 px** · hauteur **440** · Source : CADRES.md § « 8 — LA BOÎTE DONNE-T-ELLE LE CONTRÔLE ? », mesuré 2026-08-16 · Statut : ratifié

### La continuité de forme n'est pas gardée { #cadre-forme-non-gardee }

⏳ **À trancher.**

**La continuité de FORME entre écrans n'est tenue par aucune règle : si elle doit l'être, il faut l'écrire.**

??? note "Pourquoi, et depuis quand"
    la lecture par forme d'Eric trouvait ce que « ×larg / ×haut » cachait — *« Ma formule précédente (« rien n'est proportionnel ») était trop large : elle comparait des facteurs d'axe, jamais des formes. »* Mais un troisième écran le démentit : *« L'accord vu entre A et B est une coïncidence de ces deux écrans-là. »* Il faudrait un `aspect-ratio` sur la dalle.

    Valeur : dérive de forme dalle 0,430 vs écran 0,424 (1,4 %) à deux écrans · **10 %** au troisième (1280 × 1000) · Source : CADRES.md § « 8 — REPRIS AXE PAR AXE », 2026-08-16 · Statut : à trancher

## `data-bleed`

### `data-bleed` { #cadre-data-bleed }

**`data-bleed` efface la carte pour faire passer le fond entre deux dalles.**

⚠️ En contradiction avec [`cadre.cadre-d-ecran-nu`](#cadre-cadre-d-ecran-nu) — voir [C14](a-trancher.md#c14).

??? note "Pourquoi, et depuis quand"
    Eric : *« démerde-toi comme tu veux mais je veux voir du background entre ces deux dalles »*, puis *« un truc important à retenir, ce data-bleed, à noter pour faire des séparations »*. ⛔ *« AUCUNE MARGE NE PEUT RÉPARER ÇA »* — mesuré sur Abilities : à 12 px comme à 24 le résultat est identique, *« le problème n'est pas la TAILLE de l'intervalle, c'est CE QU'ON VOIT DEDANS »*. Employeurs : Class, Species (palier 1), Skills.

    Valeur : `data-bleed="true"` sur `.decision-card` — fond, bordure et rembourrage retirés · Source : CADRES.md § « 8 bis », Eric 2026-08-16 · Statut : ratifié

### `data-bleed` porte aussi la hauteur { #cadre-data-bleed-porte-aussi-la-hauteur }

**`data-bleed` porte aussi `height: 100%`, et ce n'est pas toujours souhaitable : un écran à hauteur de contenu ne doit pas la recevoir.**

??? note "Pourquoi, et depuis quand"
    *« Le jour où un troisième écran a le même besoin, c'est le drapeau qu'il faut scinder en deux (transparence · hauteur), pas la règle qu'il faut recopier. »*

    Valeur : Abilities emploie `.decision-card:has(> .abilities-step)` — transparence sans hauteur · Source : CADRES.md § « 8 bis », 2026-08-16 · Statut : ratifié

### L'effacement garde les gouttières { #cadre-bleed-garde-les-gouttieres }

**L'effacement de la carte ne retire pas ses 8 px de marge : c'est la SURFACE qui disparaît.**

??? note "Pourquoi, et depuis quand"
    « la marge de la carte survit à l'effacement » — ce sont « les 8 px qui empêchent les dalles de toucher le bord de l'écran » (§2 bis : les marges sont sur les quatre côtés, systématiquement).

    Valeur : marge 8 conservée · Source : CADRES.md § « 8 bis », 2026-08-16 · Statut : ratifié

## Les voiles

### Le voile de la dalle : 50 % { #cadre-voile-de-la-dalle }

**La norme du site est un voile de 50 % sur la dalle.**

⚠️ En contradiction avec [`cadre.voile-des-blocs-interieurs`](#cadre-voile-des-blocs-interieurs) — voir [C13](a-trancher.md#c13).

??? note "Pourquoi, et depuis quand"
    Eric : *« voilà c'est ça la norme du site en terme de transparence : 50 % (c'est pas 35 %) »*. Et c'est mesuré, pas un goût : la **fiche d'espèce** — la carte que le joueur regarde le plus longtemps — porte 50 % depuis toujours, et Eric l'a désignée : *« on part de ça, état actuel »*. Le document affirmait *« 50 % → aucun organe aujourd'hui »* : c'était faux, et c'est le document qui a été corrigé, pas la fiche.

    Valeur : `--voile-inter` → `--dalle-inter` · Source : NORMES.md § « 4. LES VOILES », Eric 2026-08-26 devant v299 · Statut : ratifié

### Le fond ne porte aucun voile { #cadre-voile-du-fond }

**Le fond (le cadre d'écran) ne porte AUCUN voile.**

??? note "Pourquoi, et depuis quand"
    voir `cadre.cadre-d-ecran-nu`. *« Ce n'est pas une surface, c'est une respiration. »*

    Source : NORMES.md § « 4 », 2026-08-26 · Statut : ratifié

### Le voile des blocs intérieurs : 35 % { #cadre-voile-des-blocs-interieurs }

**35 % est le voile des petits blocs posés DANS une dalle.**

⚠️ En contradiction avec [`cadre.voile-de-la-dalle`](#cadre-voile-de-la-dalle) — voir [C13](a-trancher.md#c13).

??? note "Pourquoi, et depuis quand"
    *« Un bloc intérieur plus léger que sa dalle se lit comme un creux ; l'inverse ferait une tache. »* 35 *« n'est ni mort ni gardé au cas où »*.

    Valeur : `--voile-simple` · quatre porteurs mesurés : `ability-methodes`, `card-reveal`, `card-action`, `inheritance-panel` · Source : NORMES.md § « 4 », 2026-08-26 · Statut : ratifié

### Jamais deux voiles empilés { #cadre-jamais-deux-voiles-empiles }

**Jamais deux voiles empilés : pas de conteneur d'écran, des dalles autonomes.**

??? note "Pourquoi, et depuis quand"
    *« LES ALPHAS S'ADDITIONNENT. »*

    Valeur : 35 % dans 35 % rend **57,7 %** · Source : NORMES.md § « 4 », 2026-08-26 · Statut : ratifié

### Une règle par ressemblance nomme sa source { #cadre-regle-par-ressemblance-nomme-sa-source }

**Une règle écrite par ressemblance doit NOMMER sa source, jamais recopier sa valeur.**

??? note "Pourquoi, et depuis quand"
    *« CETTE RÈGLE N'ÉTAIT PAS FAUSSE LE JOUR OÙ ELLE A ÉTÉ ÉCRITE, C'EST TOUT LE PIÈGE. »* Le 20/08 « les autres » étaient opaques ; depuis v298 ils sont à 50 %. *« La règle a continué de dire la même chose pendant que son référent bougeait. »* **La parade est de ne rien écrire du tout.** La même faute a été refaite trois minutes plus tard sur la colonne du `?` : Identity réservait 60 là où Destiny et Skills réservent 52.

    Valeur : `.concept-step { background: var(--surface) }` retiré — Identity porte déjà `dalle-intermediaire` · Source : NORMES.md § « 4 », Eric 2026-08-26 : *« Identity n'a pas sa transparence ni ses boutons »* · Statut : ratifié

### L'encre sur du verre { #cadre-encre-sur-verre }

**Sur du verre, seule l'encre `--text` tient les 4,5:1 — un habillage qui passe en verre ne peut pas garder son texte gris.**

??? note "Pourquoi, et depuis quand"
    « Un habillage qui passe en verre ne peut pas garder son texte gris » — mesuré dans les deux thèmes, avec le fond d'écran réel de chacun.

    Valeur : `--text-muted` rend 3,0 à 3,6 · Source : CADRES.md § « 8 — Le fond », vérifié par `tests/decor.test.mjs` dans les deux thèmes · Statut : ratifié

### Le modèle d'une norme bien câblée { #cadre-modele-a-copier }

**Le modèle d'une norme bien câblée est `--voile-simple/inter/majeure` : jeton au socle, dalles calculées par `color-mix`, garde sur la valeur ET l'absence de littéral.**

??? note "Pourquoi, et depuis quand"
    *« C'est le modèle à copier pour toute nouvelle norme. »*

    Valeur : `tokens.css` + `tests/decor.test.mjs` · Source : NORMES.md § « 4 », 2026-08-26 · Statut : ratifié

## Le Seuil

### Le Seuil est un FS { #cadre-seuil-est-un-fs }

**Le Seuil est un FS : plein écran, ni ceinture ni menu latéral, et son titre EST sa sortie.**

⚠️ En contradiction avec [`cadre.belt-toujours-visible`](#cadre-belt-toujours-visible) · [`budget.entree-r-sans-ceinture`](budget.md#budget-entree-r-sans-ceinture) — voir [C10](a-trancher.md#c10).

??? note "Pourquoi, et depuis quand"
    Eric : *« Le titre est la sortie = économie d'espace, donc OK. »* Il **ouvre une autre fenêtre**, il ne quitte pas le Companion — *« Un joueur qui va lire une règle sur FH Web ne perd pas son personnage à moitié créé. »*

    Valeur : ~40 px au lieu de 40 + 52 · Source : NORMES.md § « 1 sexies », tranché 2026-08-26 · Statut : ratifié

### L'ordre des blocs du Seuil { #cadre-seuil-ordre-des-blocs }

**L'ordre du Seuil est : sortie collée en haut · Nom de joueur · Connecter mon coffre · New character · My characters · DM · Langue · Unités · le `?` collé en bas à droite.**

??? note "Pourquoi, et depuis quand"
    *« La lecture : je me déclare, j'entre, je me règle. »* Langue et Unités descendent parce qu'ils sont **prévalidés** — Eric : *« en bas de page, PRÉVALIDÉS, pour ne pas surcharger le joueur »*. ⛔ `Connecter mon coffre` ne descend pas : sans coffre, c'est l'action principale de l'écran. ⚠️ Point faible dit d'avance : `New character` passe avant les deux portes muettes, *« donc les deux refus tombent au MILIEU de l'écran »* — ⏳ à regarder au doigt.

    Valeur : option ② du 26/08 · Source : NORMES.md § « 1 sexies — L'ORDRE DES BLOCS », tranché 2026-08-26 · Statut : ratifié (le point faible reste ⏳)

### La pastille de coffre { #cadre-pastille-de-coffre }

**Le bloc coffre du Seuil porte une pastille de 8 px + le mot de l'état + « depuis quand ».**

??? note "Pourquoi, et depuis quand"
    *« la date seule est muette sur l'état ; la pastille seule est muette sur le temps »*. La pastille signale, la date explique.

    Valeur : `🟢 Vivant · vu il y a 3 jours` · `🔴 Injoignable` · `🟠 Changé` · Source : NORMES.md § « LE TROISIÈME SENS DU VERT », Eric 2026-08-26 : *« C — la pastille et la date »* · Statut : ratifié

## Le `?` sur la dalle

### Le `?` en haut à droite { #cadre-question-en-haut-a-droite }

**Le `?` est sur la dalle, tout à droite, au même niveau que le titre.**

⚠️ En contradiction avec [`aide.bas-a-droite`](organes.md#aide-bas-a-droite) · [`aide.entre-dans-la-rangee`](organes.md#aide-entre-dans-la-rangee) — voir [C1](a-trancher.md#c1).

??? note "Pourquoi, et depuis quand"
    Eric, après l'avoir vu à gauche : *« le ? est sur la dalle tout à droite au même niveau que le titre »*. Il est **posé par la coquille**, une fois, sur toutes les étapes — *« jamais par un écran, qui pourrait l'oublier »*. C'est le filet de sécurité de `Turn tutorials off` : *« sans lui ce bouton serait irréversible »*.

    Valeur : le coin haut-droit lui appartient · Source : CADRES.md § « 2 quinquies », Eric 2026-08-19 · Statut : ⚠️ **contredit** par `aide.bas-a-droite` (NORMES, 26/08) — voir [C1](a-trancher.md#c1)
