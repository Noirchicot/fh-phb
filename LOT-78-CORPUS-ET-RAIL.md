═══ PROMPT DE LOT → ouvrir un fil neuf en **SONNET 5 · effort HIGH** ═══

# LOT 78 — Le corpus des traits, les blurbs à 320, et le rail à T2

**En clair : Eric a tranché trois choses le 2026-08-15. Deux d'entre elles
demandent d'ÉCRIRE du texte avant de toucher au code — quatre blurbs à
raccourcir, et une cinquantaine de lignes de trait d'espèce qui n'existent
nulle part. La troisième est un réglage de géométrie de trois lignes.**

Tu reprends le builder de personnages d'Eric (`~/tools/fhpc`). Il teste sur
iPhone SE et sur iPad, et ses croquis priment sur tout texte, celui-ci compris.

---

## 0. L'état, et ce qui n'est pas à toi

| | |
|---|---|
| 🔴 **Le lot 77 doit être fusionné D'ABORD** | branche `77-fiches-360`, commit `e8c1935`, **1 111 tests verts**, fusion à blanc contre `main` vérifiée le 2026-08-15 : **0 conflit**. Ce lot-ci part de là |
| 🔴 **Branche cible** | `78-corpus-et-rail`, dans ton propre worktree. ⛔ **Ne pousse JAMAIS sur `main` directement.** Eric fusionne |
| ⛔ **Hors périmètre** | le panneau `lore`/`info` et son *copier* · les grilles de sorts et d'armes · le plateau de dés d'Abilities *(un autre lot y touche, et il écrit `shell.css`)* |

📄 **À lire avant tout** : `~/tools/fh-phb/GABARIT-360-CLASS-SPECIES.md` — §1
*(le rail)*, §2 *(les blurbs)*, §2bis *(la moitié basse et sa cote)*. Les trois
décisions d'Eric y sont enregistrées avec leurs nombres.
📐 `~/tools/fh-phb/croquis/README.md` — **ils font foi.**
📊 `~/tools/fhpc/INVENTAIRE-LOT-77.md` — le rapport chiffré dont tout ceci sort.

---

## 1. ✍️ LE GROS DU LOT — ~50 lignes de trait d'espèce

✅ **Décision d'Eric** : la moitié basse d'une fiche d'ESPÈCE porte **la liste
des traits**, comme son croquis A — pas le blurb. *« B3 = B2 » ne vaut que pour
la GÉOMÉTRIE : la boîte reste fixe à 160 px, chaque écran y met ce qui lui
appartient.*

### La forme, telle qu'Eric l'a dessinée

```
Brave — advantage on saves against being Frightened
Destiny — Base 2 · halfling chosen: advantage on Chaos rolls
```

`nom — effet`, **une ligne courte, RÉÉCRITE**. ⛔ Pas la prose du SRD : `Brave`
y fait 78 caractères *(« You have Advantage on saving throws you make to avoid
or end the Frightened condition »)*.

### 🔴 LE BUDGET, ET IL EST PLUS DUR QUE CELUI DU BLURB

Mesuré aux avances réelles *(`tests/fixtures/avances-t2.json`)*, boîte de
226 px à T2 :

| | |
|---|---|
| Une ligne porte | **37 caractères** |
| La boîte fixe de 160 px | **10 lignes** de 16 px |
| **≤ 320 caractères pour TOUTE la liste** | la même limite que le blurb, et pour la même raison |

**Le maximum de traits est 5** — `Dragonborn`, `Elf`, `Araag`, `Elestu` — plus
`Destiny` que le croquis met en dernière ligne, soit **6 entrées**.

```
6 entrées × 2 lignes = 12 lignes   ❌  la boîte en tient 10
```

⚠️ **DONC LA LIGNE D'ERIC AU CROQUIS NE PASSE PAS TELLE QUELLE SUR UN ELF.**
Ses deux exemples font 51 et 60 caractères et prennent **2 lignes chacun**. Sur
six entrées il en faut **~40 en moyenne**. 📌 Ça se dit avant d'écrire, pas
après — c'est exactement la faute que le blurb vient de coûter.

### Le compte exact, par espèce

| Traits | Espèces |
|---|---|
| **5** *(+ Destiny = 6 entrées)* | Dragonborn, Elf, Araag, Elestu |
| **4** *(+ Destiny = 5)* | Dwarf, Halfling |
| **3** *(+ Destiny = 4)* | Gnome, Goliath, Human, Orc, Tiefling, Loroka |

Source : `data.traits` des couches `srd-5.2.1-en` et `fh-species-en`.

### ⛔ Ce que le texte doit respecter

- **Zéro recopie du SRD** *(loi §0.8 : on ne publie que ce qu'on a le droit de
  diffuser)*. On REFORMULE l'effet, on ne le cite pas ;
- chaque record porte sa **`provenance`** — ne l'écrase pas, ne l'invente pas ;
- ⛔ **une règle du jeu ne vit jamais dans l'interface** : le texte va dans une
  couche, jamais dans un écran.

📌 **Où l'écrire** : `layers/fh-fiche-en.layer.json` porte déjà
`data[blurb]` et `data[fiche_stats]`. ⚠️ **Le chemin de patch s'écrit avec des
crochets** — `data[fiche_traits]`, jamais `data.fiche_traits` : la grammaire
(`src/layers/paths.mjs`) refuse l'underscore dans un segment pointé, et le lot
77 a payé ça au montage.

---

## 2. ✍️ QUATRE BLURBS À RACCOURCIR

✅ **Décision d'Eric** : la limite descend de 340 à **320 caractères**. Motif —
mesurés dans la boîte réelle, druid (337), monk (333) et bard (332) remplissent
**déjà les 10 lignes sur 10**, alors que le plus long, fighter (338), n'en prend
que 9. **Le compte de caractères n'ordonne pas les hauteurs.**

| Fiche | Aujourd'hui | À retirer |
|---|---|---|
| **fighter** | 338 | **−18** |
| druid | 337 | −17 |
| monk | 333 | −13 |
| bard | 332 | −12 |

🔴 **LE FIGHTER EST DE LA MAIN D'ERIC** *(`provenance: "eric"`, avec le
wizard)*. Le raccourcir est une réécriture de SON texte. **Propose, ne
tranche pas** : donne-lui ta version et l'endroit coupé, et attends.
⛔ Les trois autres sont `fh-original` : à toi.

⚠️ **Le garde ne passe à 320 qu'une fois les quatre textes réécrits** — sinon
il rougit sur du contenu validé.

---

## 3. 🔧 LE RAIL À T2 — trois lignes de géométrie

✅ **Décision d'Eric** : les noms du rail descendent à **T2**. Le nom
`Dragonborn` était **tronqué à l'écran** — le rail avait été coté sur
`Barbarian` (une classe), jamais sur les espèces.

```
Dragonborn T3 gras  80,7 px      Barbarian T3 gras  65,5 px
Dragonborn T3 normal 77,2 px     Dragonborn T2 gras 70,4 px
```

🔴 **ET T2 SEUL NE SUFFIT PAS** : 70,4 dans 70 utiles, la marge est
**négative**. La fiche ne peut rien rendre — la ligne du rogue est à 115,1 sur
118. **C'est le rembourrage du rail qui cède :**

| Rail | Rembourrage | Utile | Verdict |
|---|---|---|---|
| 78 | 4 × 2 *(actuel)* | 70 | ❌ −0,4 |
| **78** | **2 × 2** ⭐ | **74** | ✅ **3,6 px** |

**Retenu : rail 78, rembourrage interne `--sp-2`, noms à T2.** Le rembourrage
est le seul terme qui pouvait céder, et 2 est sur l'échelle du dépôt.

⚠️ **3,6 px n'est pas confortable**, et c'est assumé : c'est le **pire cas des
24 noms**, le suivant (`Halfling`, 45,8) a 28 px de reste.

---

## 4. 🔴 LES GARDES — la seule chose qui empêche que ça recommence

⭐ **Écris la CONDITION d'une décision comme un garde, pas comme un
commentaire.** Les trois défauts de ce lot viennent tous d'une cote qui ne
vivait que dans un document.

1. **≤ 320 caractères** sur les 24 blurbs *(adapter le garde du lot 77)*.
2. **≤ 320 caractères** sur chaque liste de traits d'espèce, **entrées
   `Destiny` comprise**.
3. 🆕 **Aucun nom du rail ne dépasse la largeur utile** — les 24 noms, à T2,
   en **gras** *(le cran courant l'est)*. C'est le garde qui manquait :
   `Dragonborn` s'est tronqué en silence pendant une journée.

📏 **L'instrument existe et il est validé** : `tests/fixtures/avances-t2.json`
— les avances PAR CARACTÈRE mesurées au `measureText`, erreur du modèle mesurée
contre la mise en page réelle sur 130 lignes *(sous-estimation maximale
0,09 px)*. ⛔ **Une cote qui devient un garde passe par là**, jamais par une
estimation.
⚠️ Il ne couvre que **T2 (12 px)**. Le rail est à T2 : ça tombe bien. Si tu as
besoin d'un autre barreau, **mesure-le au navigateur et range-le à côté** — ne
mets pas une règle de trois à la place d'une mesure.

---

## 5. Les lois qui coûtent cher — toutes payées

```bash
npm test > /tmp/t.txt 2>&1; echo "EXIT=$?"
```

🔴 **Jamais tuyauté.** Départ après fusion du lot 77 : **1 111 verts**. Tu ne
rends rien de rouge, et tu lis `EXIT=`, tu ne comptes pas à l'œil.

| | |
|---|---|
| 🔴 **`git commit -F <fichier>`** | un message qui cite du code passe par un FICHIER. ⛔ **Jamais `-m`** : zsh mange les accents graves **en silence** |
| 🔴 **Jamais `git add -A`** | un autre agent écrit peut-être. Ajoute **tes** fichiers, nommément |
| 🔴 **Volet de navigateur masqué** | il **gèle `requestAnimationFrame`** et rend des mesures **cohérentes et fausses**. Plante un témoin d'images et **jette toute mesure prise à 0 image**. Le lot 77 en a jeté deux séries |
| ⛔ **`ui/builder/shell.css` est INTERDIT** | un autre lot l'écrit. Ton CSS va dans `ui/builder/fiche.css`, qui existe depuis le lot 77 |
| ⚠️ **Une cote se DATE et se SOURCE** | deux séries de mesures justes se contredisent de ~3 % d'un navigateur à l'autre. Dis d'où vient ton nombre |
| ⚠️ **Vérifie ce que tu annonces** | *« likely fine »* a coûté 4 px de débordement le 15 août, et `Reset` est parti coupé sur l'iPhone d'Eric le même jour |

---

## 6. Ce que tu rends

1. Les **~50 lignes de trait**, dans la couche, sous le budget de 320.
2. Les **quatre blurbs** réécrits — ⚠️ le fighter **soumis à Eric**, pas décidé.
3. Le **rail à T2**, rembourrage 2, et `Dragonborn` entier à l'écran.
4. Les **trois gardes** du §4, avec leurs attaques.
5. `npm test` vert, `EXIT=0`, le nombre de tests **annoncé**.
6. Une **capture à 360** d'une fiche d'espèce montrant ses traits, prise dans un
   volet **visible**, témoin d'images à l'appui.
7. Ce qui a **résisté** — nommé, chiffré, non corrigé en douce.

---

📌 **Le ton** : Eric veut qu'on discute avant de coder, qu'on lui dise quand on
s'est trompé, et il préfère un dessin à un long discours. Une question qui lui
appartient — une règle de jeu, un arbitrage, **son propre texte** — se **pose**.

═══════════════════════════════════════════════════════════════════
