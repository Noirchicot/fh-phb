# Lot 84 — porter le tambour dans le vrai écran Équipement

**En clair :** le picker à roues existe et il est réglé, mais il ne vit que dans deux bancs.
`equipment-step.mjs` — le vrai écran, celui que le joueur voit — affiche encore une
recherche textuelle. Ce lot fait passer le tambour du banc au produit.

- **Dépôt :** `~/tools/fhpc` · **branche `84-roue-dans-equipment-step`**, dans un worktree.
- ⛔ **Ne travaille jamais sur `main`, ne pousse rien.** Tu commites sur ta branche ;
  l'architecte fusionne, Eric pousse.

> 🔧 **COMMANDE AMENDÉE LE 2026-08-23** (croquis d'Eric du jour). Ce qui a changé :
>
> | | avant (22/08) | maintenant (23/08) |
> |---|---|---|
> | la structure | **trois roues** A → B → C | **deux roues** A → B, puis une **grille paginée** 5 × 3 |
> | les crans visibles | ⚠️ « 5 ou 3 ? à faire trancher » | ✅ **TROIS**, tranché par Eric — §1 |
> | le fondu des bords | un demi-cran + un cran de marge | **10 px**, et **pas** de cran de marge — §5 |
> | le glisser dans R | supprimé, 250 lignes retirées | il **revient**, mais vers des cibles — et **pas dans ce lot** (§9) |
> | le trou de donnée | non nommé | 🔴 **nommé et mesuré** — §4, et c'est la pièce qui décide de la forme du lot |
>
> **Ce qui n'a pas bougé, et qui reste la matière du lot** : les valeurs de roue (§1), les
> huit pièges payés (§5), la loi de fluidité (§6), la cascade des 500 ms (§7).

---


📐 **RÈGLES DE STRUCTURE — bloc obligatoire.** Lis `~/tools/fh-phb/REGLES-DE-STRUCTURE.md`
et les canons qu'il nomme. ⭐ **Dans ton inventaire, NOMME les règles de structure que tu as
appliquées et où** — et celles que tu as écartées, avec la mesure qui le justifie. *« Lis le
canon » ne se vérifie pas ; rendre compte, si.*

---

## 1. Ce qui existe déjà, et qu'il ne faut PAS réinventer

| | |
|---|---|
| `ui/builder/roue-lab.html` | la géométrie seule, **six curseurs**, un relevé qui se juge lui-même |
| `ui/builder/equipement-lab.html` | l'écran complet en banc : cascade, viseur, marqueurs d'attente |
| tag `roue-3x3` | l'état ratifié, trois crans |
| tag `avant-la-roue-2026-08-22` | le point de retour, avant tout ça |
| vault `FHPC — la roue de sélection` | **les cinq passes de réglage et les huit pièges payés** |
| vault `FHPCv2 ecrans equipement` + les 2 croquis du 23/08 | **le modèle d'écrans, et le dessin fait foi** |

⭐ **Lis les deux fichiers du vault AVANT de coder.** Ils portent huit défauts déjà payés,
tous muets. Les repayer coûterait la journée qu'ils ont déjà coûtée.

**Les valeurs ratifiées** (5ᵉ passe, 2026-08-22) — **elles restent vraies pour A et B** :

```
courbure 3,36 × pas   angle max 61°   fuite 12,9 × pas
cran 117 × 60         écart 4         → pas 121, R 407 px, un cran 17,1°
```

✅ **L'écart « 5 crans ou 3 » EST TRANCHÉ, et par Eric lui-même** — la version précédente de
cette commande te demandait de le lui poser, ne le fais pas. Sa phrase du 23/08 :
*« on ne voyait que trois crans par étage, suis-je clair ou pas ? »*

> **TROIS crans visibles exactement, par étage.** Pas de cran de marge ajouté pour le fondu ;
> le fondu vaut **10 px**. Une marge exprimée en cran fabrique une piste à quatre crans, et
> il le voit tout de suite. ⚠️ Cela **corrige** la parade « masque en pourcentage » de §5 —
> lis les deux ensemble.

---

## 2. L'objectif — R en trois pièces, plus une quatrième qui ne change pas

**Le catalogue de `equipment-step.mjs` devient un tambour à deux étages, suivi d'une grille
paginée** — rayon → étagère → objet — sans que rien d'autre change de comportement.

| pièce | ce que c'est | d'où ça vient |
|---|---|---|
| **A · rayons** | une roue, 3 crans, **ses propres flèches `‹ ›`** | le banc, valeurs §1 |
| **B · étagères** | une roue, 3 crans, **ses propres flèches `‹ ›`** | le banc, valeurs §1 |
| **C · objets** | 🔴 **une grille paginée 5 × 3**, avec sa barre `‹ TITRE › x/x ›` | §3, pièce neuve |
| **la recherche** | reste ce qu'elle est aujourd'hui | ⛔ n'y touche pas |

⚠️ **Les flèches sont NEUVES** — mesuré : le banc n'en a aucune (zéro occurrence de flèche
dans `equipement-lab.html`). Le croquis en pose une paire **par étage**, hors du bloc sombre.
Motif évident et à respecter : au doigt on lance la roue, à la souris on n'a rien pour
avancer d'un cran. Une flèche = **un cran**, et elle passe par le même chemin d'animation que
le geste (§6), sinon les deux entrées divergeront au premier réglage.

### ⛔ Ce qui ne bouge pas, et c'est le cœur du lot

| | |
|---|---|
| **les neuf exports** | 🔧 *la version précédente disait « cinq », c'est faux — mesuré : le module en exporte **neuf**, et **huit** ont un consommateur hors du module* |
| leurs contrats | `shell.mjs` en importe 6 (`renderEquipmentStep`, `renderEquipmentBar`, `equipmentValidate`, `currentCurrency`, `nextGearIndex`, `INHERITED_PURSE_GP`), les suites en atteignent 2 de plus (`whatYouHave`, `currentGearLines`) — **aucune signature ne change** |
| `EQUIPMENT_CATEGORIES` | 🔍 le neuvième : **exporté, et personne au monde ne le lit** (mesuré sur tout le dépôt). C'est la molette All/Weapons/Armor/Gear que les roues remplacent. **Ne le supprime pas dans ce lot** — un export public se retire dans un lot qui ne fait que ça. Signale-le dans ton inventaire |
| l'identité des lignes | ⭐ *« l'index est une identité, pas une position »* — retirer un objet ne renumérote pas. Cette propriété tient par la forme de trois lignes et un test d'absence ; elle **mérite un garde nommé**, et ce lot est l'occasion |
| la bourse, la validation, la phrase de classe | hors périmètre |
| **le geste sur un objet** | ⛔ **il garde l'action d'aujourd'hui** (`+` ajoute une ligne, `👁` ouvre le popup). Le croquis dit « tap → la fiche B1 » — **B1 n'existe pas**, ne l'invente pas |

**Les cinq suites qui couvrent le fichier doivent rester vertes** : `equipment-step.test.mjs`,
`gear-index-identite.test.mjs`, `aria-pressed-guard.test.mjs`, `ui-player-facing-language.test.mjs`,
`popup.test.mjs`.

---

## 3. 🔴 LA GRILLE — la pièce neuve, et ce que le croquis en dit

**Le troisième niveau n'est plus une roue.** La roue de C construite le 22/08 est **à jeter**.

```
(←)   [ ————— TITRE ————— ]   [x/x]   (→)
┌────────┬────────┬────────┐
│ TOKEN  │ TOKEN  │ TOKEN  │   5 lignes × 3 colonnes = 15 cases par page
├────────┼────────┼────────┤
│  …     │  …     │  …     │
└────────┴────────┴────────┘
```

| | |
|---|---|
| la barre | flèche gauche · **titre de la page** · **compteur `x/x`** · flèche droite |
| la grille | **5 lignes × 3 colonnes**, soit **15 cases** ; une case = un **jeton d'objet** |
| la pagination | dérivée : `ceil(n / 15)`. ⛔ Jamais un nombre de pages écrit à côté du compte — le banc a déjà la bonne discipline (*« un compte écrit deux fois est un compte qui finit par se contredire »*) |

### ⏳ Ce que le croquis NE tranche pas — et que tu ne tranches pas non plus

**Une case porte-t-elle le NOM de l'objet, ou son IMAGE ?** Eric l'a laissé ouvert (§5.2 du
fichier vault) et ça décide de la taille des cases.

➡️ **Ta réponse d'ingénieur, pas d'arbitre** : le contenu d'une case sort d'**une seule
fonction nommée**, et la taille de case est **une seule variable CSS**. Le jour où Eric
tranche, on change deux endroits, pas quinze. Rends la case au **nom** en attendant, puisque
c'est ce que le produit sait déjà afficher — et **dis-le** dans ton inventaire.

⚠️ **La grille se teste PLEINE, pas courante.** C'est le piège n°4 de §5, et il a déjà mordu
exactement ici : une piste qui grandit avec son contenu a l'air d'une piste qui se borne tant
qu'elle n'a que 3 objets. Le rayon le plus gros fait **82 objets** = 6 pages ; l'étagère la
plus petite en fait **1** (§4). Éprouve les deux.

---

## 4. 🔴 LE TROU DE DONNÉE — les deux roues n'ont aucune taxonomie à afficher

**C'est la mesure qui décide de la forme de ce lot ; lis-la avant tout le reste.**

Le banc affiche des rayons et des étagères parce qu'il les a **écrits à la main**, en
français, en dur (`RAYONS` dans `equipement-lab.html` : *« Contenants »*, *« Écrire &
lire »*, *« Vêtements »*). **Les vrais records n'ont pas ça.** Mesuré sur
`layers/srd-5.2.1-en.layer.json` :

| genre | n | champ de 2ᵉ niveau disponible |
|---|---|---|
| `gear` | **82** | 🔴 **AUCUN** — les records ne portent que `cost`, `name`, `weight` |
| `weapon` | **38** | `weapon_category` (martial 24 · simple 14) · `weapon_range` (melee 28 · ranged 10) |
| `armor` | **13** | 🟡 **VIDE DANS LA COUCHE, MAIS PAS ABSENT DE LA SOURCE** — voir ci-dessous |
| `item` *(objets magiques)* | **253** | ✅ `category` — wondrous-item 127 · weapon 28 · potion 24 · ring 22 · armor 19 · wand 13 · staff 12 · rod 7 · **scroll 1** |

**Le catalogue d'aujourd'hui = 133 records** (`EQUIPMENT_RECORD_KINDS = ["gear","weapon","armor"]`)
— et `item`, les 253 objets magiques, **n'y est pas**.

### 🔴 `armor` et `gear` ne sont PAS dans le même état — corrigé le 23/08

*La première version de ce §4 les mettait tous deux à « AUCUN ». C'était lire un champ vide et
en conclure que la donnée n'existe pas. Elle existe pour l'un, pas pour l'autre. Mesuré dans
`fh-srd` par le siège VERSATILITY, et **revérifié ligne à ligne depuis ce siège**.*

| | ce qui se passe vraiment | ce qu'il faut pour l'avoir |
|---|---|---|
| **`armor` 13** | 🟡 **la catégorie EST dans le SRD, et le parser l'enjambe exprès.** Le PDF anglais p. 92 imprime `Light Armor (1 Minute to Don or Doff)`, `Medium Armor…`, `Heavy Armor…`, `Shield…` en tête de leurs blocs — `src/parse_armor_en.py:71` les franchit avec `skip_subheading` et son propre commentaire le dit : *« Stepped over, never counted as a row »* | **un petit lot d'extraction dans `fh-srd`**, avec un patron qui existe déjà (le lot 19 a fait exactement ça pour les propriétés d'arme) |
| **`gear` 82** | 🔴 **il n'y a rien en amont.** La table Adventuring Gear (p. 95-96) est **plate** : `Item / Weight / Cost`, 82 lignes, aucune sous-section. `parse_gear_en.py` n'utilise même pas `skip_subheading` — il n'a rien à enjamber | **un import externe** (les codes `type` de 5eTools, ou `DND5E.equipmentTypes` de Foundry). Un chantier, pas une extraction — et **la décision d'Eric** sur la source |

⏳ **Et l'horizon, dit sans fard par VERSATILITY** : l'étape 3 de la route versatilité **n'a
pas été touchée d'une ligne**, aucun lot ne la lui commande, et il ne l'ouvrira pas de
lui-même. ➡️ **Ta couture provisoire n'est pas une cale de trois jours.** Écris-la pour durer.

### ⭐ Et du coup elle rétrécit — borne-la à `gear`

`weapon` a ses deux axes aujourd'hui. `item` a sa `category`. `armor` l'aura dès qu'un petit
lot d'extraction sera commandé. **Seul `gear` est réellement sans matière** — et c'est ton plus
gros rayon. Une `rayonsEtEtageres(query)` qui ne triche que sur `gear` est bien plus petite que
celle que ce document décrivait ce matin : partout ailleurs, elle **lit** au lieu d'inventer.

⭐ **CE QUE LE CROQUIS DIT, ET C'EST UNE LECTURE, PAS UN ORDRE D'ERIC.** Ses étagères dessinées
sont *Potions · Parchemins · Baguettes*, sous le rayon *Arcana* — ce sont **exactement** trois
valeurs de `item.category` (`potion`, `scroll`, `wand`). Ses rayons *Adventuring · Arcana ·
Battlefield* se lisent alors comme un niveau **au-dessus** des genres. Dis-le comme une
lecture dans ton inventaire ; ne la grave pas.

### ⛔ Faire entrer `item` dans le catalogue N'EST PAS À TOI

Le croquis dessine le rayon *Arcana* avec des potions, des parchemins et des baguettes — donc
des `item`. Mais `item` n'est **pas** dans `EQUIPMENT_RECORD_KINDS`, et **fondre les objets
magiques dans le même catalogue que gear/weapon/armor est une décision d'architecture que
personne n'a rendue** — ni Eric, ni la route versatilité. ➡️ **Ne l'ajoute pas de ta main.**
Si ta couture ne peut pas remplir un rayon sans `item`, **dis-le et arrête-toi là** ; c'est une
question pour Eric, pas une inconnue technique.

### 🔴 ET SI `item` ENTRE UN JOUR : dix records mentent, et ton œil les montrera

Cinq objets magiques anglais **n'existent pas** parce que leur texte a été **avalé par le
record qui les précède alphabétiquement**. Mesuré des deux côtés (ce siège, puis VERSATILITY) :

| avalé — aucun record anglais | par |
|---|---|
| Dancing Sword | **Dagger of Venom** *(1437 car. au lieu de 436)* |
| Frost Brand | **Folding Boat** |
| Luck Blade | **Lantern of Revealing** |
| Sword of Life Stealing | **Sun Blade** |
| Sword of Wounding | **Sword of Sharpness** *(710 car. au lieu de 279)* |

⚠️ **Le piège est pour TON écran, précisément** : `recordProse()` (ligne ~352) lit
`data.description` **en premier**, et c'est ce que le `👁` affiche. Le jour où `item` entre au
catalogue, l'œil sur *Dagger of Venom* montre **deux objets dans un seul**, sans rien qui
rougisse. Ce n'est pas visible aujourd'hui **uniquement** parce que `item` est hors catalogue.

📌 `fh-srd` connaît déjà le défaut et l'a **gravé** : garde `POLLUTED_BY_EXTRACTION`
(`src/correspond.py:630`) et test `acceptance_item_orphans_are_the_parser_bug`
(`tests/test_correspond.py:545`) — ce test **cassera** le jour où l'extraction sera réparée,
et c'est son signal de réussite. ⛔ **Tu ne répares rien de tout ça** : c'est `fh-srd`, un
autre dépôt, un autre lot.

### ➡️ Ce que tu fais de ce trou : une couture, pas un analyseur

⛔ **N'écris AUCUN analyseur de prose.** Ni sur `cost`, ni sur `weight`, ni sur `rarity`, ni
sur les noms (*« ça commence par "Potion of" donc c'est une potion »*). L'étape 3 de la route
versatilité (`FH-WEB/FHPC/FHPCv2 route versatilite.md`) va typer ces champs, et **tout
analyseur écrit cette semaine est à jeter** — c'est écrit noir sur blanc dans le tableau de
bord.

✅ **Ce que tu écris à la place : UNE fonction nommée, et une seule**, qui rend l'arbre à deux
niveaux et qui est le **seul** endroit du fichier à savoir d'où vient la taxonomie :

```js
/** L'arbre du tambour : rayons → étagères → objets.
 *  ⏳ PROVISOIRE — la taxonomie n'existe pas encore dans les records
 *  (lot 84, §4). Quand l'étape 3 de la route versatilité type les champs,
 *  SEULE cette fonction change. */
function rayonsEtEtageres(query) → [{ id, label, etageres: [{ id, label, objets: [...] }] }]
```

Trois règles sur son contenu, et elles sont vérifiables :

1. **Elle ne lit que des champs qui existent** — les genres, `item.category`,
   `weapon_category`. Un rayon sans étagère rend **une seule étagère**, celle du rayon.
2. **Elle est en anglais**, et c'est une **décision d'Eric du 23/08**, pas une déduction :
   *« ici pour le moment on construit autour de l'anglais »*. ⚠️ *Parchemins* et *Baguettes*
   sont des mots du croquis, pas de l'interface. 🔍 **Et aucun test ne t'attrapera** : mesuré,
   `ui-player-facing-language.test.mjs` cherche le vocabulaire de chantier (`LOT-`, `.md`,
   `TODO`), **pas le français**. C'est une règle du chantier tenue à l'œil, pas un garde.
   📌 La couche française reste des **libellés par-dessus** — jamais un second jeu
   d'identifiants (décision de la route versatilité, lot 83).
3. **Le cas dégénéré est réel, pas théorique** : `scroll` = **1 objet**. Une étagère à un cran
   doit se tenir — le banc a déjà une cale d'un tiers pour ça, ne la jette pas.

---

## 5. Les huit pièges déjà payés — ne les repaie pas

| piège | ce qu'il produit | la parade |
|---|---|---|
| `perspective` un niveau trop haut | des crans **plats** alors que tout a l'air branché | elle ne descend qu'aux **enfants directs** : sur la piste, jamais sur son parent |
| `scroll-snap-stop: always` | « ça ne roule pas » — un geste ample n'avance que d'un cran | le retirer ; `mandatory` seul ne bride rien |
| recouture dans la même tâche | **l'écran saute** | restaurer `scroll-snap-type` à l'image SUIVANTE |
| bloc de roue trop court | une roue fluide et sa voisine qui clignote, **à code identique** | répéter la liste dans le bloc jusqu'à ≥ 12 crans |
| `min-width: auto` | un item à 120 px quand ses voisins font 114, même `flex-basis` | `min-width: 0` |
| `box-sizing` hérité | tuiles à 53 px au lieu de 44 → bandes de hauteur variable → saut | `border-box` explicite |
| masque en pourcentage | le nombre de crans réglé n'est pas celui qu'on voit | 🔧 **AMENDÉ 23/08** — fondu **fixe de 10 px**, et **TROIS crans exactement**. ⛔ Pas de cran de marge : il en fait voir quatre, et Eric le voit tout de suite |
| throttle par drapeau booléen | la roue **meurt pour de bon** si son rAF est demandé onglet caché | `cancelAnimationFrame` + replanification |

⭐ **La leçon commune** : aucun ne fait rougir un test. Un défaut de débordement ne se teste
pas sur le cas courant — il se teste sur le cas **plein** (82 objets, pas 3).

---

## 6. Ce qui décide de la fluidité, et ce n'est pas la vitesse

🔴 **Le défilement est composité sur un thread séparé.** Du JS qui repeint les
transformations est structurellement **en retard d'une image ou deux** — pas trop lent,
DÉSYNCHRONISÉ. Mesuré : passer de 0,448 ms à 0,050 ms par image n'a rien changé à l'œil.

➡️ La rotation doit venir de `animation-timeline: view()`, évaluée par le compositeur.
⚠️ **Support : Chrome 115+, Safari 26+.** Sur un Safari plus ancien la déclaration est
ignorée et les crans restent plats — dégradation propre. **Fais dire à l'écran ce qu'il a
obtenu** plutôt que de laisser deviner.

⛔ **Pas de `will-change: transform` sur les crans** : il fige la rasterisation, et un cran
qui change d'échelle voit sa texture étirée au lieu d'être redessinée. C'est ce qui « frise ».

📌 **La grille, elle, ne tourne pas.** Elle n'a ni perspective, ni aimantation, ni
`animation-timeline` — n'étends pas la mécanique de la roue à un objet qui pagine. Deux
pièces différentes, deux mécaniques différentes, et c'est voulu.

---

## 7. La cascade, et la règle d'Eric qui ne doit pas casser

```
une roue tourne          →  tout l'aval montre ses marqueurs ☆ ☉ ☾, fixes
500 ms d'immobilité      →  le niveau suivant se remplit
```

Le compte se réarme à chaque geste : il mesure **l'immobilité**, pas le temps. Et il ne
s'arme **que sur un geste** — nos propres écritures de `scrollLeft` émettent un `scroll`
indistinguable, et sans drapeau l'aval se révèle tout seul une seconde plus tard.

🔧 **AMENDÉ 23/08 — l'attente s'étend à la grille.** Dans le banc, seuls les niveaux-roues
attendaient. Maintenant :

| | à l'attente |
|---|---|
| A · rayons | remplie |
| B · étagères | ☆ ☉ ☾ |
| **C · la grille** | **☆ ☉ ☾ répartis dans les 15 cases** |

⏳ **Et un point qu'Eric n'a pas tranché** (§5.3 du fichier vault) : ce tirage se refait-il à
**chaque** attente, ou une fois pour toutes ? Sa propre inquiétude, à respecter : *un tirage
qui change à chaque geste attire l'œil sur du bruit.* ➡️ **Tire une fois par montage de
l'écran**, pas à chaque geste, et **dis que c'est ton choix par défaut** — c'est le
comportement le plus calme, et il se renverse en une ligne.

⛔ **En C, rien ne s'achète en passant.** La règle d'Eric du 22/08 —
*« le joueur aurait acheté l'objet devant lequel il s'est arrêté »* — doit rester impossible.
La grille n'a pas de viseur : elle **montre**, elle ne désigne pas. En A et B, se poser sur un
cran EST le choix — la ceinture le faisait déjà.

---

## 8. ⛔ Hors périmètre — et lis-le, parce que le piège est là

Le croquis du 23/08 décrit **sept écrans** (R · B1 · B2 · B3 · B4 · SB3.1/2/3). **Ce lot en
fait un seul, et pas en entier.**

| ce que le croquis montre dans R | dans ce lot ? |
|---|---|
| les 2 roues, la grille paginée, la cascade | ✅ **oui** |
| la recherche | ✅ oui — **inchangée**, on la garde telle quelle |
| les 3 collecteurs bleus (`CRAFT DROP` · `SHOPPING LIST` · `TO GEAR DROP`) | ⛔ **non** — §8b |
| la barre du bas `GEAR · CART · CRAFT · NEXT` | ⛔ **non** — elle pointe vers B2/B3/B4, qui n'existent pas |
| B1 la fiche d'objet, B2 le panier, B3 l'équipé, B4 le craft, SB3.x | ⛔ **non** — lots à venir |

### 8b. 🔴 Le glisser revient dans R — et c'est un piège à 250 lignes

Le 22/08, le lot précédent a **retiré 250 lignes** de glisser dans R : garde d'axe, seuil,
réglage `k`, fantôme, deux curseurs. Retirées, pas désactivées. Le croquis du 23/08 fait
revenir un glisser — **et ce n'est pas le même**.

| | le glisser retiré le 22/08 | celui du croquis du 23/08 |
|---|---|---|
| ce qu'on tire | la **piste** elle-même, pour la faire défiler | un **jeton d'objet** |
| vers où | nulle part, c'était un défilement | vers **une cible nommée** |
| lâcher à vide | — | ⭐ **il ne se passe RIEN** (Eric, 23/08 : *« glisser sans déposer → rien »*) |
| qui le porte | le code supprimé | **`glisser.mjs`**, qui est resté entier |

⛔ **Donc : ne ressuscite pas les 250 lignes.** Elles ne feraient pas ce travail-là. Et
n'écris pas non plus le nouveau glisser dans ce lot : sa cible `TO GEAR DROP` **attend une
décision d'Eric** (§5.1 du fichier vault — passe-t-elle par la fiche pour la quantité, ou
saute-t-elle comme `CRAFT` ?). Un lot qui code une cible non tranchée code deux fois.

📌 Le glisser reste entier dans `glisser.mjs` : Eric le garde au niveau B3.

---

## 9. Ce que tu rends

- l'inventaire au format du chantier : ce qui marche, ce qui reste, **ce que tu as refusé de
  faire et pourquoi** ;
- les cinq suites vertes, rejouées **dans un clone indépendant** ;
- ⭐ le **garde nommé** sur l'identité des index, s'il tient dans le périmètre ;
- **la couture de §4 nommée et isolée** : dis en une ligne ce qu'il faudra changer, et où,
  quand l'étape 3 typera les champs ;
- tes trois défauts par défaut assumés, chacun en une ligne : la case au **nom**, le tirage
  des symboles **une fois par montage**, `EQUIPMENT_CATEGORIES` **gardé** ;
- toute contradiction entre ce document et ce que tu mesures : **ta mesure gagne**, dis-le.

⚠️ **Et une chose que personne n'a encore faite** : la roue n'a jamais été vue sur iPad DANS
l'écran réel. Ne déclare rien de fluide sans qu'Eric l'ait touchée — la moitié des défauts de
cette journée ne se voyaient qu'au doigt.
