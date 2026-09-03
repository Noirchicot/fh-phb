# Le budget

Cette page dit qui porte sa cote et qui la déduit, puis donne les budgets déjà mesurés — la page de quinze jetons, Entrée › R, les gabarits B et SB, la carte du rang R. Sa loi centrale tient en une phrase : quand un écran déborde, ce sont les VIDES qui cèdent, jamais les organes.

## Qui porte sa cote, qui la déduit

### Un contenant se déduit { #budget-contenant-se-deduit }

**Une cote de contenant ne s'écrit pas, elle se déduit d'avance — de la police, l'interligne, le `padding` et le `gap`.**

??? note "Pourquoi, et depuis quand"
    *« Une cote figée MENT. Le jour où un libellé grandit d'un point, la ceinture change de hauteur et le jeton ne le sait pas : tout le budget vertical se décale sous celui qui l'avait calculé. La déduction, elle, reste vraie — elle suit la cause. »* ⭐ *« Et c'est ce qui rend le budget prévisible SANS mesurer. »*

    Valeur : ⛔ figer `--belt-h: 60px` · Source : NORMES.md § « 1 ter », Eric 2026-08-26 : *« on ne note pas la cote dans le code, mais on doit chercher à la déduire à l'avance »* · Statut : ratifié

### Un organe porte sa cote { #budget-un-organe-porte-sa-cote }

**Un ORGANE porte sa cote, un CONTENANT la déduit.**

??? note "Pourquoi, et depuis quand"
    « La règle se lit en une phrase », et c'est elle qui départage ce qui se déduit (ceinture, bande de boutons, dalle) de ce qui reste écrit (`--touch`, `--glisse-case`, `--glisse-h`, `--measure`, `--fiche-h`).

    Valeur : cotes écrites — `--touch: 44` · `--glisse-case: 87` · `--glisse-h: 48` · `--measure: 62ch` · `--fiche-h: 440` · Source : NORMES.md § « 1 ter — la distinction », 2026-08-26 · Statut : ratifié

### Une cote donnée bat une cote déduite { #budget-cote-donnee-bat-cote-deduite }

**Une cote DONNÉE bat toujours une cote DÉDUITE : si Eric a dit un nombre, il gagne.**

??? note "Pourquoi, et depuis quand"
    c'est la clause d'arbitrage de §1 ter : une déduction est une prévision, un nombre dicté par Eric est une décision — et « si Eric a dit un nombre, il gagne ».

    Source : NORMES.md § « 1 ter », 2026-08-26 · Statut : ratifié

## Les budgets mesurés

### La table des hauteurs { #budget-table-des-hauteurs }

**La table des hauteurs permet de calculer un budget sans rien mesurer.**

??? note "Pourquoi, et depuis quand"
    *« Un budget se compte donc en multiples de 44 et 48, et il se calcule de tête. »* Exemple : bande basse d'un écran d'équipement = collecteurs 48 + écart 8 + boutons 44 = **100 px**, toujours.

    Valeur : rangée de jetons 48 · écart 8 · collecteur 48 · bouton un étage 44 · bouton deux étages 48 (T3) / 56 (T4) · `+`/`−` 44 de cible · dropdown 44 · zone d'écriture 44 · ceinture ≈60 (déduite) · titre + consigne ≈40 (déduit) · Source : NORMES.md § « LA TABLE DES HAUTEURS », 2026-08-26 · Statut : ratifié

### Le budget d'une page de jetons { #budget-page-de-jetons }

**Une page de 15 jetons pèse 508 sur 553 — il reste 45.**

??? note "Pourquoi, et depuis quand"
    *« 45 px, c'est mince — une ligne de plus les mange, et la réponse n'est JAMAIS un défilement. »*

    Valeur : ceinture 60 · titre + consigne 40 · 15 jetons (5 × 48 + 4 × 8) = 272 · collecteurs 48 · boutons 44 · 4 écarts + marge basse 44 · Source : NORMES.md § « Le budget d'une page de jetons », 2026-08-26 · Statut : ratifié

<!-- DESSIN À FAIRE — la barre de budget d'une page de 15 jetons — 508 empilés sur 553, les 45 qui restent en clair -->

### Trois jetons à 360 { #budget-trois-jetons-a-360 }

**Trois jetons à 360, et c'est juste : la rangée dispose de 278, trois en prennent 277 — il reste 1 px.**

??? note "Pourquoi, et depuis quand"
    « Il reste 1 px. ⛔ Quatre en demanderaient 372 — impossible à la cible. » C'est ce calcul qui a fabriqué la cote 87, et c'est lui qui interdit d'y toucher.

    Valeur : 3 × 87 + 2 × 8 = 277 · quatre en demanderaient **372** · Source : NORMES.md § « Le budget d'une page de jetons », 2026-08-26 · Statut : ratifié

### Le budget d'Entrée › R { #budget-entree-r }

⏳ **À trancher.** Le budget est ratifié, la ligne de flottaison ne l'est pas.

**Entrée › R pèse ≈380 sur 553 — il reste 173, et 125 dans le cas le plus étroit.**

⚠️ Cette règle se contredit elle-même dans le corpus — voir [C21](../a-trancher.md#c21).

??? note "Pourquoi, et depuis quand"
    *« Il ne peut que descendre. »* ⚠️ Et depuis que le Seuil défile, ce 380 *« cesse d'être une contrainte dure : il devient la hauteur du premier écran vu »* — ⏳ ce qui doit tenir au-dessus de la ligne de flottaison n'est pas tranché.

    Valeur : plafond **prudent**, pas une mesure : les sept blocs sont comptés à `--touch` 44 alors que quatre n'en sont pas · Source : NORMES.md § « Le budget de Entrée › R », 2026-08-26 · Statut : ratifié (le budget) / à trancher (la ligne de flottaison)

<!-- DESSIN À FAIRE — la même barre pour Entrée › R — ≈380 sur 553, et le cas le plus étroit à 125 -->

## Ce qui cède quand ça déborde

### Les vides cèdent, jamais les organes { #budget-les-vides-cedent }

**Quand un écran déborde, ce sont les VIDES qui cèdent, jamais les ORGANES.**

??? note "Pourquoi, et depuis quand"
    *« un jeton porte un mot qui doit rester lisible et une cible que le pouce doit atteindre ; un écart ne porte rien »*.

    Valeur : éprouvé sur Identity — marges entre champs (16→8→4) 24 · `Name` dans l'encart 21 · quatre écarts à −4 : 16 · titres descendus d'un T (t3→t2) ~6 · écarts internes d'un choix (12→8) 16 = **78 px, du dépassement à 0** · Source : NORMES.md § « LES JETONS ET LES BOUTONS SONT SACRÉS », 2026-08-26 · Statut : ratifié

### Ce que la page porte en trop { #budget-en-trop }

⏳ **À trancher.** Le principe est ratifié, le choix non.

**Un contenu qui ne tient pas pose la question « qu'est-ce que la page porte EN TROP ? » — jamais « ajoutons un défilement ».**

??? note "Pourquoi, et depuis quand"
    « La réponse n'est JAMAIS un défilement. La réponse est : qu'est-ce que la page porte EN TROP ? » — même loi que « la marge est une respiration, pas une réserve de place ».

    Valeur : trois candidats mesurés, ⏳ **aucun choisi** — le titre + consigne (40) · la ceinture réduite aux numéros (−16) · les collecteurs (48), *« qui disparaissent d'eux-mêmes sur un écran où chaque emplacement porte un nom »* (mesuré sur Species : zéro collecteur) · Source : NORMES.md § « Le budget d'une page de jetons » + § « 1 bis », 2026-08-26 · Statut : à trancher (le principe est ratifié, le choix non)

### Les chevrons ne sont pas comptés { #budget-chevrons-non-comptes }

**Le budget de la page de jetons ne compte pas les chevrons : dès qu'une liste pagine, elle perd 96 px de largeur.**

??? note "Pourquoi, et depuis quand"
    « ⚠️ MAIS CE BUDGET NE COMPTE PAS LES CHEVRONS, et le lot A l'a mesuré le 26/08 » — un budget établi sur une liste non paginée ne vaut pas pour la même liste paginée.

    Valeur : il ne reste que **201** pour trois cases qui en demandent 277 · Source : NORMES.md § « 1 quater », mesuré par le lot A 2026-08-26 · Statut : ratifié

### La dette de l'abrégé à 62 { #budget-dette-de-l-abrege-a-62 }

⏳ **À trancher.**

**À 62 px de case, `ABREGE_MAX = 16` ne promet plus rien : c'est une dette ouverte.**

??? note "Pourquoi, et depuis quand"
    *« le repli tient, mais un nom long y prend trois lignes »*. ⛔ *« Ça touche la géométrie de la dalle, pas la pagination : décision d'Eric. »*

    Valeur : le seuil était calibré sur **77 px utiles** · piste mesurée non prise : rendre la rangée **saignante** (`--saignee-debord`) pour occuper les 329 de la carte au lieu des 297 de l'item → la case remonterait à **72** · Source : NORMES.md § « 1 quater », 2026-08-26 · Statut : à trancher

### Le titre est un nom de secours { #budget-titre-de-secours }

**Le titre est un nom de SECOURS, pas un nom par défaut : on ne nomme pas deux fois.**

??? note "Pourquoi, et depuis quand"
    *« Un titre posé au-dessus d'un objet qui dit déjà de quoi il s'agit coûte 40 px pour ne rien apprendre — et sur une page qui ne défile pas, 40 px, c'est presque une rangée de jetons. »* Sur le Seuil, *« le titre n'est pas du gras : c'est la seule chose qui dise où on est »*.

    Valeur : Équipement › R → le tambour nomme, ⛔ pas de titre · Entrée › R → rien ne nomme, ✅ titre · une étape → la ceinture nomme, ⛔ pas de titre · Source : NORMES.md § « 1 quinquies », Eric 2026-08-26 : *« le seuil a un titre quand un autre objet ne le désigne pas : exemple équipement, où le tambour désigne »* · Statut : ratifié

### Le guide est hors budget { #budget-guide-hors-budget }

**Aucun écran ne compte plus le guide dans sa hauteur.**

??? note "Pourquoi, et depuis quand"
    *« Le budget §1 quater s'allège d'autant, partout, sans rien retirer au joueur. »*

    Source : NORMES.md § « LE GUIDE EST UN POPUP », 2026-08-26 · Statut : ratifié

## Les gabarits B et SB

### Le gabarit du rang B { #budget-gabarit-du-rang-b }

⏳ **À trancher.** Preuve de concept.

**Le gabarit du rang B (le menu d'étape) est dicté cote par cote, mais c'est une PREUVE DE CONCEPT, pas une cote gravée.**

??? note "Pourquoi, et depuis quand"
    *« LA CLEF DE CE GABARIT EST À LA LIGNE 5 : tout ce qui est resserré au-dessus va à la fenêtre »* — Eric : *« on fait de l'espace pour la fenêtre, laisse ceux du bas où ils sont »*. 📏 Mesuré : **78 px au départ, 184 à l'arrivée**. ⛔ Ne pas le citer comme ratifié tant que l'épreuve n'est pas faite (une espèce sans lignage, une espèce à `skill_points`, Class).

    Valeur : rembourrage de dalle 4 haut / 16 côtés / 4 bas · titre T5 à 4 du haut · saignée collée sous le titre, 8 avant la suite · portes 8 entre elles, écart interne 4 · bloc sans porte 0 avant, 9 avant son texte · fenêtre = tout le reste, elle défile · bande d'aiguilleur 12 avant, 3 lignes T1, 8 après · pied 8 dessous · Source : NORMES.md § « 4 ter », Eric 2026-08-27 : *« note bien aussi toutes les cotes de ce niveau B : tout Species va en hériter »* · *« c'est proof of concept À METTRE À L'ÉPREUVE »* · Statut : à trancher (preuve de concept)

<!-- DESSIN À FAIRE — le gabarit du rang B coté poste par poste -->

### Ce qui ne se négocie pas dans le B { #budget-gabarit-b-non-negociable }

**Trois choses du gabarit B ne se négocient pas : la porte (44 de cible, T3), le `?` et le livre (22 dans 44), la fenêtre (elle défile, elle ne se tronque pas).**

??? note "Pourquoi, et depuis quand"
    *« Ce qui est déjà sûr, ce sont les LOIS — le sacré, les trois âges de la porte, la paire, le défilement unique. Elles ne dépendent d'aucune cote. »*

    Source : NORMES.md § « 4 ter », 2026-08-27 · Statut : ratifié

### Deux marges qui s'additionnent { #budget-deux-marges-qui-s-additionnent }

**Un gabarit se mesure, il ne se relit pas : trois postes du B étaient deux marges légitimes qui s'additionnaient.**

??? note "Pourquoi, et depuis quand"
    *« chacune juste de son côté. On ne les voit qu'en décomposant l'écart : « 32 = 16 + 16 ». »*

    Valeur : saignée 17 → **8** (*« 17 px pour un trait »*) · tête d'un bloc sans porte 44 → **auto** (*« `--touch` protégeait un bouton ABSENT »*) · rembourrage bas de dalle 16 → 4 · marge du titre 8 → 0 · Source : NORMES.md § « 4 ter — Les postes qui ont payé », 2026-08-27 · Statut : ratifié

<!-- DESSIN À FAIRE — les trois postes du B où deux marges légitimes s'additionnaient, mesurées côte à côte -->

### Le gabarit du SB { #budget-gabarit-du-sb }

**Le gabarit du SB est le squelette du B transposé, et c'est le scroll qui récupère le rab.**

??? note "Pourquoi, et depuis quand"
    un SB **sans** prose laisse le rab entre la bande et le pied.

    Valeur : titre à 4 du haut, 4 px avant les jetons · organes du glisser sacrés · la fenêtre prend tout ce qui reste · bande d'aiguilleur 12 / 3 lignes T1 / 8 · pied à 8 du bord · harmonie mesurée B 8/12/8, SB1 8/12/8, SB2 8/12/rab · Source : NORMES.md § « 4 quinquies », Eric 2026-08-27 : *« en SB lineage : le texte doit être dans une fenêtre scroll »* · *« une harmonie de principe B, SB1 et SB2 »* · *« c'est le scroll qui récupère le rab »* · Statut : ratifié

### Ce qui a dégagé du SB { #budget-sb-ancienne-consigne-degagee }

🧊 **Renversée le 2026-08-27** — remplacée par le gabarit du SB tel qu'il est écrit aujourd'hui : voir [`budget.gabarit-du-sb`](#budget-gabarit-du-sb).

**L'ancienne consigne du glisser et la saignée d'avant-pied ont dégagé du SB.**

??? note "Pourquoi, et depuis quand"
    *« l'aiguilleur est le seul texte de guidage du SB »* · *« le B n'a pas de trait là »*.

    Valeur : la saignée rendait 17 px pour un gabarit à 12 · Source : NORMES.md § « 4 quinquies », Eric 2026-08-27 : *« ça dégage »* · Statut : renversé le 2026-08-27

## La carte du rang R

### La carte du rang R est un dessin { #budget-carte-r-est-un-dessin }

**La carte du rang R est un DESSIN proportionnel, pas une somme de cotes.**

⚠️ En contradiction avec [`ecriture.corps-de-lecture-ne-se-met-pas-a-l-echelle`](ecriture.md#ecriture-corps-de-lecture-ne-se-met-pas-a-l-echelle) — voir [C11](../a-trancher.md#c11).

??? note "Pourquoi, et depuis quand"
    *« Le nombre de caractères par ligne est constant, donc les retours à la ligne — et les proportions — sont les mêmes de 375 à 1920. »* Avec la police embarquée, *« le rendu cesse aussi de dépendre de la machine : c'est ce qui a fermé le débordement des blocs 2/3 vu sur le PC d'un ami d'Eric »*.

    Valeur : **269 × 440** en portrait (dicté) · **625 × 440** en paysage (validé), en blg · police embarquée Inter (lot 57) · Source : NORMES.md § « 4 quater », Eric 2026-08-27 : *« je voudrais que les blocs gardent leurs proportions d'un écran à l'autre »* · *« chaque élément se pose là où il faut et à la bonne proportion : sur iPad, sur Mac, sur iPhone »* · Statut : ratifié

### La hauteur de la carte R { #budget-carte-r-hauteur }

**La carte du rang R fait 440 blg : 396 de dessin + 44 de rangée tactile, et la loi dit « jamais moins », pas « fixe ».**

⚠️ En contradiction avec [`cadre.carte-hauteur-imposee`](cadres.md#cadre-carte-hauteur-imposee) — voir [C20](../a-trancher.md#c20).

??? note "Pourquoi, et depuis quand"
    *« la hauteur s'écrivait `396u + 44px` parce que l'échelle locale pouvait rétrécir ; le zoom global ne descend jamais sous 1, donc 44 blg valent toujours ≥ 44 px. Même promesse au doigt, un seul nombre. »*

    Valeur : `height = 440 blg` · Source : NORMES.md § « 4 quater », 2026-08-30 · Statut : ratifié

<!-- DESSIN À FAIRE — la carte du rang R en paysage coté — 220 image | bloc | 200 texte | 16 respiration, et 396 + 44 = 440 -->

### Pas de seconde échelle { #budget-pas-de-seconde-echelle }

**Il est interdit qu'une SECONDE échelle réapparaisse dans un dessin.**

??? note "Pourquoi, et depuis quand"
    c'est ce que le retrait de `--u` a coûté à apprendre : « deux échelles qui se croisent » rendaient la dalle non monotone (625 → 781 → 937 → 1420 → 920). Un garde le mesure désormais.

    Valeur : garde `tests/fiche-moule.test.mjs` · Source : NORMES.md § « 4 quater », 2026-08-30 · Statut : ratifié

### Le paysage de la carte R { #budget-paysage-de-la-carte-r }

**Le paysage de la carte R se règle en `220 (image) | bloc 1 | 200 (texte) | 16 (respiration)`.**

??? note "Pourquoi, et depuis quand"
    « une symétrie entre la largeur du blurb et le png » (Eric) ; le corps de la colonne texte est descendu avec sa largeur — « même ratio, les lignes qui tenaient tiennent ». L'interligne est unique parce que « espacement pas homogène, ça fait chelou ».

    Valeur : image **220 × 340** · corps de la colonne texte **10,5u** · interligne **unique 1,2** sur tout le bloc 1 · Source : NORMES.md § « 4 quater — Le paysage », Eric 2026-08-27 : *« une symétrie entre la largeur du blurb et le png »* puis *« rapetisser un peu le blurb, agrandir un peu le barbare »* · *« espacement pas homogène, ça fait chelou »* · Statut : ratifié

## Trois cas mesurés

### Le halo du scrollspy { #budget-halo-du-scrollspy }

**Le scrollspy porte un halo de luminance : lueur blanche la nuit, encre le jour.**

??? note "Pourquoi, et depuis quand"
    *« une lueur sur parchemin clair serait invisible »*.

    Valeur : jeton `--spy-halo` · `box-shadow: 0 0 6px 1px` sur `[aria-current="true"]` du rail · Source : NORMES.md § « 4 quater — Le halo du scrollspy », Eric 2026-08-27 : *« le scrollspy n'est pas assez visible — un halo de luminance autour de Elf dans les tuiles à gauche »*, puis *« pas mal mais un peu moins large »* · Statut : ratifié

### Une rangée vide garde ses gouttières { #budget-rangee-vide-garde-ses-gouttieres }

**Une rangée vide garde ses DEUX gouttières : le voisin doit ENJAMBER la rangée vide.**

??? note "Pourquoi, et depuis quand"
    *« sans bande, la rangée `auto → 0` volait un gap au bloc voisin. La symétrie revient par construction. »*

    Valeur : 11 px d'asymétrie mesurés (les 7 « bloc 3 mal centré » de l'audit d'Eric) · parade `grid-row: n / m` · Source : NORMES.md § « 4 quater — Deux pièges de géométrie », 2026-08-27 · Statut : ratifié

<!-- DESSIN À FAIRE — avant / après — le voisin qui ENJAMBE la rangée vide sans manger ses deux gouttières -->

### Une règle d'habit se borne à son media { #budget-une-regle-d-habit-se-borne-a-son-media }

**Une règle propre à un habit se borne à son media query, sinon elle fuit dans l'autre.**

??? note "Pourquoi, et depuis quand"
    la règle portrait, écrite nue à (0,4,0), battait la règle paysage (0,3,0) : « une règle d'un habit FUIT dans l'autre ». C'est le même piège de spécificité que « nommer n'est pas mettre à l'abri ».

    Valeur : l'enjambement portrait, écrit nu à (0,4,0), battait la règle paysage (0,3,0) — *« bloc 1 trop haut »*, vu par Eric avant moi · Source : NORMES.md § « 4 quater — Deux pièges de géométrie », 2026-08-27 · Statut : ratifié
