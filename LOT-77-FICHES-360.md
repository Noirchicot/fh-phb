═══ PROMPT DE LOT → ouvrir un fil neuf en **FABLE 5 · effort HIGH** ═══

# LOT 77 — Les 24 fiches à 360

**En clair : les textes des 12 classes et des 12 espèces sont écrits et mesurés,
mais personne ne les voit — la couche qui les porte n'est branchée nulle part, et
les fiches à l'écran sont encore au gabarit du bureau. Ton travail : monter la
couche, et redessiner la fiche aux cotes de 360 px.**

Tu reprends le builder de personnages d'Eric (`~/tools/fhpc`). Il teste sur iPad
et sur iPhone SE, et ses croquis priment sur tout texte, celui-ci compris.

---

## 0. Avant d'écrire une ligne — le périmètre, et ce qui n'est pas à toi

| | |
|---|---|
| 🔴 **Branche cible** | travaille dans **ton propre worktree**, sur une branche `77-fiches-360`. ⛔ **Ne pousse JAMAIS sur `main` ni sur `origin/main` directement.** Eric fusionne |
| ⛔ **`ui/builder/shell.css` t'est INTERDIT** | un autre lot (le plateau de dés d'Abilities) l'écrit en ce moment. Un fichier, un écrivain. **Ton CSS va dans un `ui/builder/fiche.css` neuf**, déclaré dans `index.html` |
| ⛔ **Hors périmètre** | le panneau `lore`/`info` plein écran et son bouton *copier* (c'est un organe partagé par trois écrans, il aura son lot) · les images de fiche (Eric les produit) · les grilles de sorts et d'armes · le glisser-déposer |

---

## 1. Le mandat de géométrie — il est déjà écrit, ne le redérive pas

📄 **`~/tools/fh-phb/GABARIT-360-CLASS-SPECIES.md`** — lis-le en entier. Toutes
les largeurs y sont **mesurées au `measureText`** dans la police réelle du
builder, jamais estimées. §5 en donne le récapitulatif.

📐 **`~/tools/fh-phb/croquis/README.md`** — les croquis d'Eric. **Ils font foi**
et ont corrigé le texte quatre fois. Quand le dessin et un document se
contredisent, c'est le plus **récent** qui gagne, et le README dit lequel.

Les cotes que tu appliques :

```
360 ─┬─ 16 marge
     ├─ 78  RAIL      noms à T3 · SEARCH est le SEUL élément cliquable
     ├─  8  écart
     ├─ 242 FICHE     8 rembourrage │ 100 IMAGE │ 8 │ 118 STATS │ 8
     └─ 16 marge
```

| | |
|---|---|
| Rembourrage de dalle | **8 px** — ⚠️ *et non 16 ; le 16 hérité du bureau est le vrai coupable, troisième fois* |
| Blurb | **T2**, boîte **fixe** de 10 lignes (160 px) |
| Nom de la classe / espèce | **T5** |
| Les lignes de stats | **T2**, l'étiquette en **gras** (elle coûte 4 px, et elle les mérite) |
| `LORE` · `CHOOSE` | **T3**, cible 44 px |
| `CHOOSE` | **s'élargit et recouvre le rail** — pour Class **et** pour Species (décision d'Eric, postérieure au croquis A) |

⚠️ **Le bloc de stats N'EST PAS de hauteur fixe** : 7 lignes au Wizard, 8 au
Fighter (`W. Proficiencies`). **Dimensionne-le sur le maximum des 24 fiches**,
pas sur la première rencontrée.

⭐ **Une dernière rangée incomplète se CENTRE** — partout où une grille a un
reste. C'est une règle d'Eric, pas une coquetterie locale.

---

## 2. 🔴 LE BLOCAGE RÉEL, ET IL N'EST PAS DANS LE CSS

**Les 24 fiches existent. Elles ne sont montées nulle part.** Vérifié :

```
layers/fh-fiche-en.layer.json   24 records : records.class{12} + records.species{12}
                                chacun `op: patch` → data.blurb {text, provenance}
                                                   → data.fiche_stats [{label, value}]
layers/fh-lore-en.layer.json    les 24 textes longs
```

**Aucun des deux n'apparaît dans une pile de couches.** Les deux piles à
corriger, et il y en a bien **deux** :

| Fichier | Ce que c'est |
|---|---|
| `ui/builder/engine.mjs:20-24` | la pile **du builder au navigateur** — c'est celle qui fait apparaître les textes à l'écran |
| `src/tools/exemple-fh-en.mjs:41-46` | la pile **du générateur du personnage d'exemple** — les tests s'appuient dessus |

⚠️ **Monte-les dans les deux, dans le même ordre.** Une seule des deux et
l'écran et les tests divergeront en silence — exactement la faute que ce dépôt
paie à répétition.

📌 Les records portent une **`provenance`** (`"eric"` sur wizard et fighter,
`"fh-original"` sur les 22 autres). Ne l'écrase pas et ne l'invente pas : elle
dit ce qu'on a le droit de diffuser.

---

## 3. Les deux gardes que ce lot doit poser

⭐ **Écris la CONDITION d'une décision comme un garde, pas comme un
commentaire.** C'est la loi qui coûte le plus cher quand on l'oublie.

1. **Aucun des 24 blurbs ne dépasse 340 caractères.** La boîte est fixe à 10
   lignes ; à 226 px en T2 une ligne porte ~36 caractères, donc ~365 avant
   débordement, et on pose la limite à 340. *(Mesure : le Wizard fait 327, le
   Fighter 338 — Eric a écrit au plafond sans le connaître. La marge est
   mince : le garde n'est pas décoratif.)*
2. **Aucune ligne de stats des 24 fiches ne dépasse 118 px** mesurée à T2,
   étiquette en gras. C'est `W. Proficiencies : 2` (116 px) qui a fixé cette
   colonne, et le gabarit avertit lui-même : *« `Prestidigitation` et
   `Weapons : Simple` sont les pires cas DU WIZARD ; un autre écran peut porter
   pire »*. **Les 24 n'ont jamais été passées en revue. Fais-le.**

⚠️ Si un garde rougit sur une vraie fiche : **ne rabote pas le texte en
silence**. Nomme la fiche, le nombre, et remonte-le à Eric — c'est du contenu
qu'il a validé.

---

## 4. Ce qui existe déjà et que tu ne réécris pas

| | |
|---|---|
| `ui/builder/catalogue.mjs` | le catalogue partagé — rail, défilement aimanté, paliers. **Class et Species sont LE MÊME écran** (Eric : *« l'étape 3 va être identique à la 2 »*) |
| `ui/builder/class-step.mjs` · `species-step.mjs` | ne gardent que **ce qui leur appartient** : à quoi ressemble leur fiche |
| `ui/builder/SOCLE.md` | 🔴 **les règles de rendu, non négociables.** Lis-le. Notamment : `swapContent` est le SEUL endroit du dépôt qui remplace le contenu d'un nœud, et **le défilement ne redessine JAMAIS** |
| `ui/builder/tokens.css` | l'échelle T1–T7 y vit. Sers-t'en, ne la redéfinis pas |
| **Image de fiche** | ⏳ aucune n'existe. Cotes visées **200 × 260**, PNG transparent, Eric les produit. **Bouche-trou : le dos de carte**, `ui/builder/assets/arcana/back.jpg` |

⛔ **Une règle du jeu ne vit JAMAIS dans l'interface** (loi du dépôt). Si un
nombre te manque, il vient d'une couche ou du moteur — jamais d'un `if` dans un
écran.

---

## 5. La version du graphe — le piège qui mord à la fin

`ui/builder/index.html` porte une **import map générée** et des `?v=<N>` sur
tout ce qu'elle charge. **Ton `fiche.css` neuf doit y entrer avec le même `<N>`
que ses voisins** (aujourd'hui `?v=1`), sinon `tests/versions-graphe.test.mjs`
rougit — et il a raison : c'est ce garde qui a supprimé le mélange neuf/cache
vécu le 15 août.

⛔ **N'édite pas l'import map à la main** : c'est `node bin/nouvelle-version.mjs`
qui la produit.

---

## 6. Les lois qui coûtent cher — payées, toutes

```bash
npm test > /tmp/t.txt 2>&1; echo "EXIT=$?"
```

🔴 **Jamais tuyauté.** L'état de départ est **1 101 tests verts**. Tu ne rends
rien de rouge, et tu ne comptes pas les verts à l'œil : tu lis `EXIT=`.

| | |
|---|---|
| 🔴 **`git commit -F <fichier>`** | un message qui cite du code passe par un **FICHIER**. ⛔ **Jamais `-m "…"`** : zsh mange le contenu des accents graves **en silence**. Payé le 15 août |
| 🔴 **Jamais `git add -A`** | un autre agent écrit peut-être en même temps. Ajoute **tes** fichiers, nommément. Payé le 15 août aussi |
| 🔴 **Un volet de navigateur masqué gèle `requestAnimationFrame`** | et rend des mesures **cohérentes et fausses**. Plante un témoin (compte les images rendues) et **jette toute mesure prise à 0 image** |
| ⚠️ **Le DOM des tests n'a ni `.style` ni `matchMedia`** | `tests/dom-stub.mjs`. Un style **en ligne** posé au rendu fait tomber une douzaine de tests, pour du décor. **Le décor va dans la feuille de style**, toujours |
| ⚠️ **Vérifie ce que tu annonces** | un agent a livré juste le 15 août en jugeant une largeur *« likely fine »* : elle débordait de 4 px. **Mesure, ou tais-toi** |

---

## 7. Ce que tu rends

1. Les deux couches montées, **dans les deux piles**.
2. La fiche redessinée aux cotes du §1, dans `fiche.css` — **jamais `shell.css`**.
3. Les **deux gardes** du §3, avec leurs tests.
4. `npm test` vert, `EXIT=0`, et le nombre de tests **annoncé**.
5. Une **capture à 360 px** d'une fiche de classe et d'une fiche d'espèce, prise
   dans un volet **visible**, avec le compteur d'images à l'appui.
6. Ce qui a **résisté** : toute fiche dont le blurb ou une ligne de stats a
   dépassé, nommée avec son nombre. ⛔ Ne le corrige pas tout seul.

---

📌 **Le ton** : Eric veut qu'on discute avant de coder, qu'on lui dise quand on
s'est trompé, et il préfère un dessin à un long discours. Une question qui lui
appartient (une règle de jeu, un arbitrage produit) se **pose**, elle ne se
devine pas.

═══════════════════════════════════════════════════════════════════
