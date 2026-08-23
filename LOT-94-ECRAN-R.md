# Lot 94 — l'écran R corrigé au doigt : ce qu'Eric a vu sur son iPhone

**En clair :** Eric a regardé l'écran R sur son téléphone et a rendu six corrections. Cinq sont des
gestes précis (enlever, rétrécir, remettre dans l'ordre). La sixième est un **défaut de
comportement qu'il a vu et que le code croit pourtant traiter** — c'est celle qui demande de
mesurer avant de coder.

- **Dépôt :** `~/tools/fhpc` · **branche `94-r1-au-doigt`** (un worktree t'attend, voir plus bas).
- ⛔ **Jamais sur `main`, jamais de `git push`.**
- ⚠️ **Le lot 93 travaille en ce moment dans le même dépôt**, sur `src/tools/gen-srd-layer.mjs`,
  `tests/gen-srd-layer.test.mjs`, `tests/tree-immuable.test.mjs` et `layers/`. **Ne touche à
  aucun de ces cinq.** Vos terrains ne se croisent pas — garde-le comme ça.

📐 **RÈGLES DE STRUCTURE** : lis `~/tools/fh-phb/REGLES-DE-STRUCTURE.md` et les canons qu'il
nomme. **Dans ton inventaire, NOMME les règles que tu as appliquées et où — et celles que tu as
écartées, avec la mesure qui le justifie.**

---

## 1. 🔴 CORRIGÉ PAR ERIC — LE CADRE EST **FF1**, ET SA HAUTEUR EST **IMPOSÉE**

⛔ **La version précédente de cette section était fausse, et l'architecte l'a écrite.** Elle
appelait l'écran « R1 » comme si c'était une classe de cadre. **Ce n'en est pas une.**

| | |
|---|---|
| **R** | un **nœud de l'arborescence** de l'Équipement — R · B1 · B2 · B3 · B4 · SB3.1/2/3. Un nom de position dans l'arbre, **pas** un nom de cadre |
| **FF** | le **cadre** : belt, **pas de menu latéral**, le contenu sur toute la scène. ⭐ Le commentaire du code avait raison sur ce point |
| **FF1** | ce que l'écran porte : une **carte** (`carte` dans le vocabulaire ratifié du 19/08 ; `FF1` est son ancien nom, et Eric parle celui-là) |

**Les cotes d'une carte, et elles ne se recopient pas — `CADRES.md` et `tokens.css` font foi :**

```
hauteur   --fiche-h   IMPOSÉE           « une fiche fait un écran, ni plus ni moins » (Eric, 15/08)
largeur   plancher 242 px · plafond --measure (62 ch)
marges    8 partout
```

🔴🔴 **ET VOILÀ CE QUE ÇA CHANGE POUR TOI, ET C'EST TOUT LE LOT.** La hauteur n'est pas
« ce qui reste sous le belt » : elle est **imposée par `--fiche-h`**. Le relevé du 23/08 donnait
**591 px** de contenu — largement au-dessus de `--fiche-h` (tambour 151 · recherche 52 · grille 296 · collecteurs 44 · boutons 48).

➡️ **Toutes les coupes des §2, §2 bis et §2 ter servent UN SEUL but : rentrer dans la carte.**
Ce n'est pas « récupérer un peu d'espace », c'est **atteindre la cote**. Chiffre chaque coupe et
tiens le total à jour — c'est le rendu principal de ce lot.

⛔ **Et si ça ne rentre toujours pas, on n'ajoute PAS de défilement** : on demande à Eric ce que
l'écran porte **en trop**. C'est sa règle, écrite après la palette FREE (91 → 56 px).

⚠️ **`--measure` n'apparaît nulle part dans `ecran-r.html`** — mesuré. La carte doit s'y
plafonner. ⛔ Ne recopie aucune de ces cotes dans une prose : `--measure-f` a vécu une heure et
Eric l'a tuée le 19/08 pour cette raison exacte.

📌 **Corrige aussi les commentaires du fichier.** Ils parlent de « R1 » — un nom qui n'existe pas — comme d'un cadre, et
décrivent la hauteur comme « ce qui reste sous le belt ». Un prochain lot les lira.

---

## 2. ✂️ CE QUI DÉGAGE

| | l'ordre d'Eric |
|---|---|
| **la recherche** | *« dégage search »* — le nœud `.r1-recherche` **et** sa feuille de style |
| **le cadre et la marge** | *« dégage le cadre et la marge si ça fait récupérer de l'espace aussi »* — la bordure, le `margin` et le `padding` de `.r1` |
| **la hauteur du tambour** | *« réduis la hauteur du tambour de 20 % »* |

⚠️ **« si ça fait récupérer de l'espace » est une CONDITION, pas une figure de style.** Mesure ce
que chaque suppression rend, **en pixels**, et dis-le. Si le cadre ne rend rien, dis-le et
laisse-le : Eric arbitre sur un chiffre, pas sur une impression.

📌 **Le budget de hauteur est l'instrument de ce lot.** Relevé du 23/08 à 375 × 812 : tambour
**151** · recherche **52** · grille **296** · collecteurs **44** · boutons **48**, et il restait
122 px. À 320 × 568 il en manquait **133**. ➡️ **Redonne le relevé après tes coupes** — c'est le
seul rendu qui dit si le budget est tenu sur le petit écran.

⛔ **Rien ne défile, jamais.** Ce qui ne tient pas ne se cache pas plus bas.

---

## 2 bis. 🔴 LES FLÈCHES CHANGENT DE PLACE, ET LE TITRE DISPARAÎT

Eric, ce soir : *« les flèches peuvent être à droite et à gauche des tokens ; le titre n'a pas
lieu d'être, il est porté par le rouleau »*.

```
aujourd'hui   ┌──────────────────────────────┐
              │  ‹   NOM DE L'ÉTAGÈRE   x/x › │   ← une barre horizontale au-dessus
              ├──────────────────────────────┤
              │        la grille 5 × 3        │
              └──────────────────────────────┘

demain        ‹  │   la grille 5 × 3   │  ›       ← les flèches FLANQUENT les jetons
```

| | |
|---|---|
| **le titre de l'étagère** | ⛔ **il dégage** — la roue des étagères le porte déjà, l'écrire deux fois c'est le faire diverger une fois |
| **les flèches `‹ ›`** | de part et d'autre de la grille, **à hauteur des jetons** |
| **le compteur `x/x`** | ⚠️ **il reste.** Eric n'a retiré QUE le titre — ne décide pas à sa place que le compte part avec. À toi de lui trouver sa place ; dis laquelle et pourquoi |

⭐ **Et ça rend de la hauteur** — la barre horizontale disparaît entièrement. **Chiffre-le** : ça
compte dans le budget du §2, et c'est exactement l'espace qu'Eric cherche.

⚠️ **La cible tactile des flèches ne rétrécit pas.** Une flèche de bord reste un bouton qu'un
pouce doit atteindre : garde-lui `--touch`. Une flèche décorative qui rate le doigt est pire
qu'une flèche absente.

📌 **Le contexte que tu dois connaître** : le 15/08, sur simulateur, Eric avait **retiré** ces
flèches (*« les flèches gauche et droite font moche, on les dégage »*). Le croquis du 23/08 les
redessine, et il vient de dire où elles vont. **Le plus récent gagne** — mais sache que c'est un
revirement, pas une évidence : elles se regardent au doigt.

---

## 2 ter. 🔴 DEUX COTES DE PLUS, ARRIVÉES PENDANT QUE TU TRAVAILLES

Eric, en regardant l'écran :

| | son ordre | ce que ça veut dire |
|---|---|---|
| **les collecteurs** | *« un drop fait la même taille que l'item »* | une cible de dépôt a **la taille d'un jeton de la grille**, pas une bande pleine largeur |
| **les boutons** | *« les cases GEAR / CART / CRAFT / NEXT doivent se réduire »* | la barre du bas rétrécit |

⭐ **La règle derrière le premier, et elle vaut au-delà de l'écran R** : *une cible a la taille de ce
qu'on lui donne.* Un collecteur grand comme trois jetons ment sur ce qu'il attend — et il mange
de la hauteur pour le dire.

⚠️ **`--touch` est un PLANCHER, pas une décoration.** Réduire ne veut pas dire passer sous le
seuil tactile : un bouton qu'un pouce rate n'est pas un bouton réduit, c'est un bouton cassé.
**Si la réduction demandée croise le plancher, dis-le avec le chiffre** — Eric arbitrera. ⛔ Ne
descends pas sous le seuil en silence.

📌 Ces deux coupes vont **dans le même budget** que le §2 : chiffre ce qu'elles rendent.

---

## 3. 🎲 LES SYMBOLES D'ATTENTE : DANS L'ORDRE, PLUS AU HASARD

Eric : *« le 3 doit être des étoiles soleil lune, répartition dans l'ordre que j'ai dit, à
chaque étage »*.

```
aujourd'hui   tirerLesSymboles()  →  Math.random() sur 15 cases
demain        ☆ ☉ ☾ · ☆ ☉ ☾ · ☆ ☉ ☾ · ☆ ☉ ☾ · ☆ ☉ ☾     (3 colonnes, 5 rangées)
```

⭐ **ET ÇA FERME UNE QUESTION QUI TRAÎNAIT.** Le lot 84 avait laissé ouvert *« le tirage se
refait-il à chaque attente ou une fois pour toutes ? »* et posé un choix par défaut assumé.
**Il n'y a plus de tirage du tout** — donc plus de question. Retire le commentaire qui la pose,
il serait faux.

📌 La roue des étagères montre **trois** marqueurs : ☆ ☉ ☾, dans le même ordre.

---

## 4. 🔴 LE DÉFAUT QU'IL A VU — ET IL FAUT LE MESURER AVANT DE LE CORRIGER

Eric : *« quand la première roue tourne, la 2ᵉ reste inactive »* · *« j'ai bougé, la 2ᵉ et la
3ᵉ montrent des items ou une liste — pas normal »*.

**Le code croit déjà faire ça.** `quandRayon()` appelle `attendreB()` puis `attendreGrille()`
avant d'armer les 500 ms. Donc **soit ces appels n'arrivent pas, soit ce qu'ils posent ne se voit
pas.** Trois pistes mesurables, dans cet ordre :

1. **`quandCran` ne part-il qu'à l'arrêt ?** Si le navigateur ne l'annonce qu'une fois la roue
   immobilisée, l'attente commence **après** le geste — et sur un doigt qui lance la roue, les
   marqueurs ne paraissent jamais pendant le mouvement.
2. **`programmatique`** — un cran franchi par notre propre écriture de `scrollLeft` remplit
   directement (`if (programmatique) { remplirB(); remplirGrille(); return; }`). Vérifie qu'un
   geste réel n'emprunte jamais ce chemin.
3. **`vierge`** — au premier montage, l'aval reste en marqueurs. Vérifie ce que devient ce
   drapeau au tout premier geste.

⚠️ **PIÈGE DE MESURE CONNU, PAYÉ LE 23/08** : sonder l'écran à **900 ms** après le geste
(400 ms de défilement doux + 500 ms d'attente) fait conclure à un défaut qui n'existe pas.
**Nomme l'instant que tu observes** avant de conclure quoi que ce soit.

➡️ **Sers la page et regarde-la** (`ui/builder/ecran-r.html`). ⭐ C'est la pratique la plus
rentable du chantier : elle trouve ce que des centaines de tests ne voient pas.

**Ce qu'Eric veut, en une phrase** : *dès que la roue du haut bouge, tout ce qui est en dessous
cesse d'afficher un choix* — et ne le retrouve qu'après une demi-seconde d'immobilité.

---

## 5. ⛔ CE QUI N'EST PAS DANS CE LOT

Eric a aussi remarqué que **la deuxième roue ne porte pas grand-chose**. C'est vrai, c'est
mesuré, et **ce n'est pas un problème de cet écran** :

```
gear    82 objets → UNE seule étagère   (aucun champ lu)
armor   13 objets → UNE seule étagère   (aucun champ lu)
weapon  38 objets → 2 étagères
item   253 objets → 9 étagères
                    4 rayons · 13 étagères pour 416 objets
```

⛔ **Ne le répare pas ici.** Ça se règle dans la donnée et dans la table `ETAGERE_DE`, après le
lot 93. Un lot suivra.

---

## 6. Ce que tu rends

- **le relevé de hauteur après tes coupes**, aux deux tailles (375 × 812 et 320 × 568), et **ce
  que chaque suppression a rendu en pixels** ;
- **la preuve que le bloc est plafonné à `--measure`** — la largeur mesurée sur un grand écran ;
- **ce que tu as trouvé sur le §4** : l'instant que tu as observé, ce que tu as vu, la cause ;
- une **capture** de l'écran R après tes changements ;
- la suite complète verte, et le compte affiché ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
