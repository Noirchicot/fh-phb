# Lot 95 — le tambour lit le rangement d'Eric, plus les genres de la donnée

**En clair :** le premier niveau du tambour affiche aujourd'hui `Armor · Gear · Item · Weapon`.
Ce sont des **genres de données**, pas des rayons. Eric, 23/08 : *« je devais pas voir armor au
premier niveau, elles sont notées, on les respecte »*. Son rangement existe, il est complet, il
est **dans la donnée depuis le lot 90** — et l'écran ne le lit pas.

- **Dépôt :** `~/tools/fhpc` · **branche `95-tambour-rangement`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

## 🔴 CE LOT NE DÉMARRE PAS AVANT QUE **93 ET 94** SOIENT FUSIONNÉS

- le **93** réécrit `src/tools/gen-srd-layer.mjs` — tu vas travailler juste à côté ;
- le **94** réécrit `ui/builder/equipment-step.mjs` — **c'est ton fichier principal**.

⛔ Démarrer avant, c'est deux lots qui écrivent le même fichier.

---

## 1. Les trois niveaux, et ce que la donnée en porte

```
niveau 1   LE RAYON      roue du haut — 7, TOUJOURS LES MÊMES
niveau 2   L'ÉTAGÈRE     roue du bas  — 1 à 7, elles changent avec le rayon
niveau 3   LA GRILLE     les objets   — 15 par page, rien ne défile
```

**Ordre alphabétique aux deux niveaux, et le premier est celui qui s'ouvre** *(Eric, 22/08)*.
**Chaque cran affiche son compte** — *« Vêtements 32 »*, jamais *« Vêtements »* seul.

📌 La source : `~/tools/fh-srd/exports/srfh/en/shelving.json`, **416 records**, chacun portant
`data.shelf = { aisle, shelf, provenance }` et `data.extends` vers son record SRD.

---

## 2. Ce que tu fais

1. **Importer la couche `srfh`** dans `fhpc` (rang 15, au-dessus du SRD). ⚠️ Elle est **EN
   seulement** — dis ce que devient le français, ne le devine pas.
2. **`rayonsEtEtageres()` lit `shelf.aisle` puis `shelf.shelf`**, plus jamais le genre du record.
   ⛔ La table `ETAGERE_DE` (`weapon → weapon_category`, `item → category`) **disparaît** : c'est
   elle qui fabrique les faux rayons.
3. **Le compte sur chaque cran**, aux deux niveaux.
4. **Un rayon vide reste affiché.** `companions` porte **0 objet** et c'est prévu (familiers et
   hommes de main à 0). ⛔ Un rayon qui disparaît quand il se vide fait sauter la roue.

⚠️ **Le nombre de pages se dérive du compte, TOUJOURS, sans plafond.** *« Un jour y'aura plus
que 35 s'il y a un homebrew »* — ⛔ jamais de garde qui affirme « au plus trois pages ».

---

## 3. 🔴 DEUX ÉCARTS MESURÉS ENTRE LE DOCUMENT ET LA DONNÉE — ne les répare pas, NOMME-les

| | le document décide | la donnée porte |
|---|---|---|
| **Marvels** | **7 étagères** (Vêtements 32 · Anneaux 22 · Bijoux 15 · Casques & lunettes 8 · Consommables 15 · Conteneurs & véhicules 24 · Focus & curiosités 33) | **2** : `wondrous` **127** · `rings` 22 |
| **Battlefield** | 4 étagères | **6** — `magic-weapons` 33 et `magic-armor` 19 en plus |
| **Crafting** | 3 étagères (Gemmes 0 · Ingrédients 0 · Outils 25) | **1** : `tools` 25 |
| **Projectiles** | 5 | **1** *(« 5 à écrire » — les munitions n'ont pas de record)* |

🔴 **Le premier est le seul qui casse quelque chose** : `wondrous` à **127** fait **9 pages** et
crève la cible des 35. C'est le trou connu — `merveilleux-ranges.json` **n'existe sur aucun
disque**, et c'est lui qui portait le découpage des 149 merveilleux.

➡️ **Affiche la donnée telle qu'elle est**, `wondrous` à 127 compris. ⛔ Ne recoupe rien toi-même :
le découpage des merveilleux est une décision d'Eric, pas une réparation d'écran.

---

## 4. Ce que tu rends

- **le tambour ouvert sur `Adventuring › Camp`** (alphabétique aux deux niveaux) et une capture ;
- **les 6 rayons peuplés + `companions` vide et affiché** ;
- le compte visible sur chaque cran, aux deux niveaux ;
- **416 objets atteignables** — la somme des étagères, comptée à l'écran ;
- ce que devient le **français** ;
- la suite complète verte, avec le compte affiché ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
