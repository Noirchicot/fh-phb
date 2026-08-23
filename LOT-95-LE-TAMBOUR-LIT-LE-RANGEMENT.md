# Lot 95 — le tambour lit le rangement d'Eric, plus les genres du SRD

**En clair :** le premier niveau du tambour affiche `Armor · Gear · Item · Weapon`. Ce sont des
**genres de données**, pas des rayons. Eric : *« je devais pas voir armor au premier niveau,
elles sont notées, on les respecte »*. Son rangement existe, il est complet, il est **dans la
donnée depuis le lot 90** — et l'écran ne le lit pas.

- **Dépôt :** `~/tools/fhpc` · **branche `95-tambour-rangement`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

## 🔴 CE LOT NE DÉMARRE PAS AVANT LA RÉGÉNÉRATION DES COUCHES

La suite de `fhpc` porte **2 rouges** : les couches sont périmées depuis les lots 97 et 98.
⛔ **Un lot ne peut pas se vérifier sur une suite rouge.** Eric lance
`node src/tools/gen-srd-layer.mjs` ; le lot part après.

⭐ **Et ce n'est pas qu'une question de vert** : la régénération fait entrer `armor_category`
(`medium 5 · heavy 4 · light 3 · shield 1`) dans la couche. **C'est une des données dont tu as
besoin.**

---

## 0. 🔴🔴 LE CRITÈRE — il prime sur la taxonomie

> Eric, 2026-08-24, mot pour mot : *« l'organisation de l'équipement permet toujours d'arriver à
> **moins de 35 items sur la dernière catégorie**, c'est l'idée »*.

⭐ **Les sept rayons ne sont pas une classification pour elle-même.** Ils existent pour qu'au
bout de la descente le joueur tombe sur une étagère qu'il peut **embrasser** — moins de 35, soit
deux ou trois pages de quinze. ⛔ **Un rangement élégant qui laisse une étagère à 127 a raté son
unique raison d'être.**

⛔ **35 est une CIBLE DE DÉCOUPAGE, jamais un plafond de donnée.** Un contenu maison peut faire
déborder une étagère : c'est **le découpage** qu'on refait, jamais la donnée qu'on refuse.
➡️ `pages = ceil(objets ÷ 15)`, **toujours, sans plafond**. Un contenant à 200 objets fait
14 pages et l'écran ne bronche pas.

---

## 1. Les trois niveaux, et l'état mesuré

```
niveau 1   LE RAYON      roue du haut — 7, TOUJOURS LES MÊMES
niveau 2   L'ÉTAGÈRE     roue du bas  — 1 à 7, elles changent avec le rayon
niveau 3   LA GRILLE     les objets   — 15 par page, rien ne défile
```

**Ordre alphabétique aux deux niveaux, et le premier est celui qui s'ouvre** *(Eric, 22/08)*.

**Mesuré sur le catalogue en ligne (version 282) :**

```
4 rayons · 13 étagères · 391 objets · médiane 19
⛔ au-dessus de 35    Magic Items › Wondrous Item 127   ·   Gear › Gear 82
⚠️ absents            les 25 OUTILS — `EQUIPMENT_RECORD_KINDS` ne liste que
                      gear · weapon · armor · item
```

⭐ **La médiane à 19 dit que le reste tient déjà.** Le travail est **ciblé** : deux étagères à
casser, un genre à faire entrer. Ce n'est pas un chantier global.

📌 **Le total est 416, pas 411.** Vérifié : `gear 82 + weapon 38 + armor 13 + item 258 = 391`,
plus `tool 25`. Le 411 traîne dans le vault et **précède les cinq objets rendus par le lot 86**.

---

## 2. Ce que tu fais

1. **Importer la couche `srfh`** — `~/tools/fh-srd/exports/srfh/en/shelving.json`, **416 records**,
   chacun portant `data.shelf = { aisle, shelf, provenance }` et `data.extends` vers son record
   SRD. ⚠️ Elle est **EN seulement** : dis ce que devient le français, ne le devine pas.
2. **`rayonsEtEtageres()` lit `shelf.aisle` puis `shelf.shelf`**, plus jamais le genre du record.
   ⛔ La table `ETAGERE_DE` (`weapon → weapon_category`, `item → category`) **disparaît** : c'est
   elle qui fabrique les faux rayons.
3. **Faire entrer les 25 outils** dans le catalogue — ils sont rangés (`crafting › tools`) et
   invisibles.
4. **Un rayon vide reste affiché.** `companions` porte **0** objet et c'est prévu. ⛔ Un rayon qui
   disparaît quand il se vide fait sauter la roue.

⭐ **Le lot 97 a déjà cassé les 149 merveilleux** en sept étagères (la plus grosse : 33). Donc
`wondrous 127` tombe **tout seul** dès que tu lis `srfh`. **Il te reste `Gear 82`** — et le
rangement le découpe déjà en six étagères (Campement 3 · Cordes 8 · Forcer 10 · Lumière 6 ·
Observer 5 · Packs 7).

---

## 3. 🔴 DEUX PIÈGES DE LECTURE, PAYÉS DANS LA NUIT DU 23 AU 24

**⛔ `FHPCv2 rangement equipement.md` a DEUX étages, et un seul est vivant.** Eric : *« ça a été
fait la veille, j'ai changé certaines choses depuis »*. **La TAXONOMIE vit** ; **la PRÉSENTATION
est périmée** — le « double carrousel » de deux `.belt` empilés et le *« plus de flèches »* ont
été remplacés par la roue du 22/08 puis le croquis du 23/08 (tambour à deux étages + grille
paginée). Un en-tête daté a été posé sur le fichier. ⛔ **Un paragraphe non marqué n'est pas
forcément à jour.**

**⛔ LE COMPTE A CHANGÉ DE PLACE, ET IL ÉTAIT FAUX.** Le fichier dit *« Vêtements 32, pas
Vêtements »* — **vrai sur le besoin, faux sur la place** : depuis le 23/08 au soir, les chiffres
vivent **sous le chevron gauche de la grille** (total à gauche, page à droite), plus sur le cran.

🔴 **Et le compte porté par le cran était faux, pour une raison qui est la leçon de tout ce
chantier** : les tables étaient indexées **par LIBELLÉ**, or **« Armor » nomme DEUX étagères** —
une dans Battlefield (13) et une dans Marvels (19). L'écran affichait **« Armor 19 » au-dessus
d'une grille de 13**. ⭐ **Un libellé n'est pas une identité.** Indexe par `aisle:shelf`, jamais
par le mot affiché.

---

## 4. Deux dettes à solder au passage — elles sont dans TON fichier

Elles ont été **mesurées et délibérément laissées** par le lot 94, pour ne pas te faire de
conflit :

- ⛔ **`aria-current` en NEUF exemplaires.** `troisTours` répète la liste et `faireCran` marque
  **chaque copie** du cran courant — 9 sur la roue A, 6 sur la B. Vérifié : jamais lu comme
  source de vérité (ses 4 occurrences sont des sélecteurs CSS), donc **borné à
  l'accessibilité** — mais un lecteur d'écran annonce **neuf fois « courant »**.
- ⛔ **`--roue-fondu` figé à 10 px** dans une roue devenue fluide : le `min()` fait tomber le cran
  de 117 à **73,8**, donc le fondu mange **13,5 %** au lieu de 8,5 %. ➡️ L'exprimer **en rapport
  du pas**, comme tout le reste de la roue.

---

## 5. ⛔ Ce que tu ne répares PAS

**`Arcana` et `Marvels` sont des noms proposés, pas ratifiés** — le fichier le dit lui-même.
**La structure est ferme, les deux noms ne le sont pas.** Affiche-les tels quels et signale-le.

**Le second axe n'est pas le tien.** `rayon/étagère` = *où je le CHERCHE* (le tambour) ;
`emplacement` = *où je le PORTE* (la silhouette B3). ⭐ Le fichier insiste : **les deux se lisent
dans le même passage** — mais ce lot ne touche qu'au premier.

---

## 6. Ce que tu rends

- **le tambour ouvert sur `Adventuring › Camp`** (alphabétique aux deux niveaux) et une capture ;
- **les 6 rayons peuplés + `companions` vide et affiché** ;
- 🔴 **le compte de la plus grosse étagère** — c'est le critère du §0, et le seul chiffre qui dit
  si le lot a réussi ;
- **416 objets atteignables**, les 25 outils compris — la somme comptée à l'écran ;
- ce que devient le **français** ;
- la suite complète verte dans un clone indépendant, avec le compte ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
