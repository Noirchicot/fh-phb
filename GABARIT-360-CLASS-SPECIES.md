# Le gabarit à 360 px — Class, Species, et les écrans de choix

> **Calculé le 2026-08-15**, sur la demande d'Eric : *« je te laisse faire les
> calculs »*. Toutes les largeurs de texte sont **MESURÉES** dans la police réelle
> du builder (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`), au
> `measureText` du navigateur — pas estimées.
>
> 📐 Source du dessin : croquis C d'Eric (flux Wizard, 4 écrans), 2026-08-15.
> ⚠️ Il **fait foi** ; ce fichier ne fait qu'en tirer les nombres.

---

## 0. Les deux zones qu'Eric a nommées

| Zone | Quand | Largeur |
|---|---|---|
| **avec rail** (*« with spyscroll »*) | la fiche de Class / Species | rail + fiche |
| **pleine largeur** (*« full width »*) | tous les écrans de choix | 360 |

✅ **TRANCHÉ PAR ERIC, 2026-08-15** : `CHOOSE` **s'élargit et recouvre le rail**
— *« ici choose recouvre toute la largeur »*.

⭐ **ET ÇA VAUT AUSSI POUR SPECIES** *(sa décision 2.2)* : *« on pourrait
effectivement faire un choose élargi à toute la largeur pour species, et mettre
un bouton back et done sur la deuxième page. On gagne de la place et de la
cohérence. »*

⛔ **Ça REMPLACE l'arbitrage du croquis A** — *« choose ne recouvre que la grosse
dalle »*. Les deux écrans convergent au lieu de diverger. C'est postérieur, c'est
ce qui vaut.

📌 **Et le rail garde un `SEARCH`** *(Eric : « oui on a un search, c'est pratique
si beaucoup de classes »)*. **Il est le SEUL élément cliquable du rail** — la
colonne reste non cliquable, l'invariant `II.1` tient : le défilement choisit.

---

## 1. La fiche — la répartition horizontale, et ce qui l'a décidée

```
360 ─┬─ 16 marge
     ├─ 78  RAIL          Barbarian à T3 = 62 px + 8 de rembourrage × 2
     ├─  8  écart
     ├─ 242 FICHE         ├─ 8 rembourrage
     │                    ├─ 104 IMAGE
     │                    ├─ 8 écart
     │                    ├─ 114 STATS
     │                    └─ 8 rembourrage
     └─ 16 marge
```

### 🔴 LE NOMBRE QUI A TRANCHÉ : `Weapons : Simple` en **gras + normal**

| | Mesuré |
|---|---|
| `Weapons : Simple`, tout en normal, T2 | 101 px |
| **`Weapons :` en gras + ` Simple` en normal, T2** | **105 px** |

**Le gras de l'étiquette coûte 4 px**, et c'est ce qui a écarté la première
disposition :

| Disposition | Colonne de stats | Verdict |
|---|---|---|
| rail T3 (78) + image **110** | 108 px | ❌ **3 px de marge** — pas une marge |
| **rail T3 (78) + image 104** | **114 px** | ✅ **9 px de marge** |
| rail T2 (71) + image 110 | 114 px | ✅ équivalent, mais le rail devient moins lisible |

**Retenu : rail à T3, image à 104.** Le rail porte le repère de position
(scrollspy) — c'est le mauvais endroit où rogner de la lisibilité, et les 6 px
retirés à l'image ne se voient pas.

---

## 2. Le blurb de 60 mots — la limite de caractères, calculée

Le texte du Wizard, dicté par Eric le 2026-08-15 :

> *Weavers of arcane grammar, wizards bend reality through study, not birth.
> Spellbooks hold their power—lost pages mean lost magic. They shape fire, bend
> time, pierce minds, all through relentless intellect. Fragile in armor, mighty
> in will, they trade brute strength for the universe's deepest secrets, one
> spell slot at a time.*

| | |
|---|---|
| Caractères | **327** |
| Mots | **51** |
| Rendu à T2 dans 226 px | **9 lignes**, 144 px de haut |
| À T3 dans 226 px | 11 lignes, 209 px — ❌ trop haut |

### ⭐ LA RÈGLE : **340 caractères**, et c'est un GARDE, pas un conseil

La boîte du blurb est **fixée à 10 lignes** (160 px). À 226 px de large en T2,
une ligne porte ~36 caractères → **~365 caractères** avant débordement. On pose
la limite à **340** : les 327 d'Eric passent, et il reste de quoi encaisser un
mot qui casse mal.

⛔ **Pourquoi une boîte FIXE et pas « ce qui rentre »** : `B0.23` dit *« choix
identique ⇒ dalle de taille identique »*. Douze blurbs de longueurs libres
feraient douze fiches de hauteurs différentes, et le défilement aimanté
(`B2.1h`) perdrait son cran.

📌 **Le garde à écrire** : aucun blurb des 12 classes ni des 12 espèces ne
dépasse 340 caractères. Une phrase de trop rougit au lieu de déborder en
silence.

---

## 3. LA TRADUCTION EN T1–T7 — ce qu'Eric a demandé

> *« Tu peux faire tes calculs et traduire tout ça en T1 T2 T3 T4 etc. »*

### La fiche

| Élément | Barreau | px | Pourquoi celui-là |
|---|---|---|---|
| Nom de la classe / de l'espèce | **T5** | 18 | `Barbarian` à T6 ferait 103 px dans une colonne de 114 — il tient, mais sans air. T5 le pose sans le serrer |
| Les 7 lignes de stats | **T2** | 12 | la plus longue fait 105 px sur 114 disponibles. **T3 la porterait à 122 px : elle déborde** |
| L'étiquette (`Weapons :`) | T2 **gras** | 12 | c'est elle qui coûte les 4 px ci-dessus, et elle les mérite : c'est ce qui rend le bloc lisible en diagonale |
| Le blurb de 60 mots | **T2** | 12 | T3 le fait passer de 9 à 11 lignes, soit +65 px |
| Les noms du rail | **T3** | 14 | le repère de position se lit d'un coup d'œil ou ne sert à rien |
| `LORE` · `CHOOSE` | **T3** | 14 | ce sont des actions ; cible 44 px de haut |

### Les écrans de choix

| Élément | Barreau | px | Pourquoi |
|---|---|---|---|
| Titre (`cantrips`, `1st level spells`) | **T6** | 22 | seul titre de l'écran, pleine largeur, rien ne le contraint |
| Nom d'un sort dans la grille | **T2** | 12 | contraint par `Prestidigitation` — voir §4 |
| `CHOICE 1..4` | **T2** | 12 | 55 px dans un slot de 72 |
| La consigne (*« Tap on cantrip for info… »*) | **T2** | 12 | deux lignes, elle ne doit pas concurrencer la grille |
| `Back` · `Done` | **T3** | 14 | actions, 44 px |

⛔ **T1 (10 px) et T4–T7 ne servent nulle part dans ces écrans**, sauf le titre.
Ce n'est pas un oubli : à 360 px, l'écart utile se joue entre **T2 et T3**, et le
reste de l'échelle appartient à d'autres zones.

---

## 4. Les grilles de sorts — et le calcul tombe juste

### Horizontal : le coupable est le rembourrage, encore

`Prestidigitation` est le **mot le plus large des 45 sorts**, et il est
**insécable** :

| Taille | `Prestidigitation` |
|---|---|
| T3 · 14 px | 99 px |
| **T2 · 12 px** | **85 px** |
| T1 · 10 px | 72 px |

```
360 ─ 32 (marge) ─ 16 (rembourrage de dalle, 8×2) ─ 16 (gouttières) = 296
296 / 3 colonnes = 98 px  →  90 px utiles (4 de rembourrage × 2)
85 ≤ 90 ✅   marge : 5 px
```

⚠️ **C'est le rembourrage de dalle à 8 px qui rend ça possible.** À 16 px
(l'actuel), la colonne tombe à 93 et **T2 ne passe plus** — il faudrait descendre
à 11 px, **hors de l'échelle T1–T7**. 📌 Troisième fois que le rembourrage
hérité du desktop est le vrai coupable *(cf. `B4.3`, `B7.5`)*.

### Vertical : 5 rangées, et 5 rangées = exactement les cantrips

Budget sur iPhone SE (**579 px réellement vus** : 667 moins les barres de Safari) :

| | px |
|---|---|
| Ceinture | 55 |
| Dalle de choix (`CHOICE` + 2 lignes de consigne) | 108 |
| Boutons `Back` / `Choose your spells` | 58 |
| Titre, marges, écarts | 76 |
| **Reste pour la grille** | **282** |

À 44 px la case (le seuil tactile d'Apple) + 8 px de gouttière :
**5 rangées = 252 px** ✅ · 6 rangées = 304 px ❌

### ⛔ « LES 30 SANS PAGINATION » — CHERCHÉ, IMPOSSIBLE À 360

> ***« Si on arrive à optimiser 30 spells sans pagination, je veux bien déroger
> au "is the same size as cantrips". »*** — Eric, 2026-08-15

**Balayage de toutes les combinaisons** (3/4/5 colonnes × gouttières 4/6/8 ×
T1/T2), largeurs mesurées, hauteur de case déduite du nombre de lignes réel de
chacun des 30 noms :

| La plus compacte qui existe | 3 col × 10 rangées · T1 (10 px) · gouttière 4 · cases **36 px** |
|---|---|
| **Hauteur demandée** | **396 px** |
| **Budget maximum**, tout écrasé au plancher | **328 px** |
| | **❌ il manque 68 px** |

⚠️ Et ce « meilleur cas » est déjà **sous le seuil tactile** (36 < 44) et **au
plus petit barreau** de l'échelle (T1).

**Les 4 et 5 colonnes tombent avant la hauteur** : `Thunderwave` est le mot
**insécable** le plus large des 30 — **77 px** à T2, **65 px** à T1 — et ne
tient pas dans une colonne de 5 (51 px utiles).

#### La seule sortie, et ce qu'elle coûte

Supprimer **la dalle de choix** porte le budget à 404 px : les 396 passent.
⛔ **Mais la dalle de choix EST la cible du glisser-déposer.** Sans destination,
`CHOICE 1..4` disparaît et la sélection redevient un tap — on perdrait l'organe
que le croquis B a fait entrer dans le vocabulaire *(« un dé est un objet qu'on
déplace, pas une valeur qu'on saisit »)*.

📌 **Recommandation de l'architecte : garder le défilement.** L'intuition
première d'Eric était la bonne. Trente cases de 36 px en texte de 10 px, c'est
un mur sur un téléphone.

### ✅ CE QUE L'OPTIMISATION AUTORISÉE ACHÈTE VRAIMENT — 2026-08-15

> ***« Optimiser la taille de back, choose, done : oui. »***

| | Avant | Après | Gain |
|---|---|---|---|
| Dalle de choix | 108 px *(2 lignes de consigne, slots en 2×2)* | **80 px** *(1 ligne, slots sur une rangée)* | **28** |
| `Back` / `Choose your spells` / `Done` | 58 px | **52 px** (44 de cible + 8) | **6** |

**+34 px → la fenêtre de grille passe de 5 à 6 rangées** (6 × 44 + 5 × 8 =
304 px). **18 sorts visibles d'un coup au lieu de 15**, sans rien céder : cases
toujours à 44, texte toujours à T2, glisser-déposer intact.

⭐ **Et la dérogation d'Eric sert enfin à quelque chose** : les 15 cantrips
n'occupent que 5 rangées, leur dalle **peut donc être plus courte** que celle
des sorts. Les deux ne sont plus tenues d'être identiques — c'est exactement ce
qu'il vient d'autoriser, appliqué là où ça rapporte.

### ⭐ CE QUI TOMBE JUSTE, ET QUI N'A PAS ÉTÉ FORCÉ

**Mesuré dans `srd-5.2.1-en.layer.json`** *(le chiffre d'Eric, « 30 1st level
spells », est exact au sort près)* :

| | Nombre | Rangées | Dans une fenêtre de 5 rangées |
|---|---|---|---|
| **Cantrips du Wizard** | **15** | **5** | ✅ **entrent pile, aucun défilement** |
| **Sorts de niveau 1** | **30** | 10 | **défilent**, la moitié visible |

C'est exactement la consigne d'Eric — *« 30 1st level spells scrollable, must be
the same height as cantrips »* — obtenue sans qu'aucun nombre ait été arrangé
pour ça.

### ⚠️ LA BOÎTE DU DESSOUS : LE 2×2 D'ERIC EST LE BON — correction du 2026-08-15

> ***« Les 4 choice tiennent-ils de gauche à droite ? »*** — Eric

**Non.** Et sa question a rattrapé une faute de ce fichier : la version d'avant
dimensionnait le slot pour l'ÉTIQUETTE `CHOICE 1`, **pas pour ce qu'il porte une
fois rempli**.

| Disposition | Slot | `CHOICE 1` vide | Un nom de sort dedans |
|---|---|---|---|
| 4 de front | 72 px *(60 utiles)* | 57 px ✅ | ❌ **5 mots insécables débordent** à T2 — `Comprehend`, `Languages`, `Expeditious`, `Longstrider`, `Thunderwave`. À T1 il en reste 2 |
| 4 de front, gouttière 4 | 75 px *(63)* | ✅ | ❌ 4 débordent |
| **2 × 2** *(le dessin d'Eric)* | **152 px** *(140 utiles)* | ✅ | ✅ **aucun ne déborde**, ni à T2 ni à T1 |

📌 **La forme de la faute** : avoir mesuré l'état VIDE d'un réceptacle et conclu
sur sa capacité. C'est la même famille que « pixels opaques = 0 » — mesurer la
mauvaise chose, proprement.

**Retenu : le 2×2, tel qu'Eric l'avait dessiné.**

### ~~🔴 LA BOÎTE DU DESSOUS : 4 SLOTS SUR UNE RANGÉE~~ *(périmé — voir ci-dessus)*

Eric : *« the box under it can be made smaller »*, et son annotation dit *« is
the same size as cantrips »*. Les deux ne tiennent ensemble qu'à une condition :

| Disposition des 4 `CHOICE` | Hauteur de la dalle | Identique à celle des cantrips ? |
|---|---|---|
| **2 × 2**, comme sur le croquis | 160 px | ❌ **+52 px** |
| **1 × 4** (slots de 72 px) | 108 px | ✅ **identique** |

**Retenu : une rangée de quatre.** `CHOICE 1` fait 55 px dans un slot de 72.
⚠️ *C'est le seul endroit où ce fichier s'écarte du dessin d'Eric, et c'est pour
tenir son autre annotation. À confirmer par lui.*

---

## 4bis. LA LIGNE DE TITRE : une loupe et une flèche ✅ *Eric, 2026-08-15*

> ***« On pourrait mettre un search dans les spells tout en haut, sous forme de
> loupe à côté du texte. Et une petite flèche permettant d'aller vers la droite
> pour voir les sorts suivants si un jour y'en a plus. »***

⭐ **La loupe n'est pas une idée neuve, et c'est une bonne nouvelle** : `B8.1`
la prévoyait déjà pour Equipment — *« si on a la place pour poser une loupe dans
les flottants pour invoquer la barre de recherche, ce serait pas mal »*. **Le
même organe sert deux écrans**, au lieu de deux inventions séparées. Et elle
rejoint le `SEARCH` du rail (§0) : trois endroits, une seule mécanique.

### Ça tient, mesuré

```
312 utiles ─ 44 loupe ─ 44 flèche ─ 16 (deux écarts de 8) = 208 px pour le titre
```

| Titre | à T6 (22 px) | Verdict |
|---|---|---|
| `cantrips` | 82 px | ✅ |
| `1st level spells` | **144 px** | ✅ **64 px de marge** |
| `2nd level spells` | 153 px | ✅ tient déjà pour la suite |

**Le titre reste donc à T6** — la loupe et la flèche ne coûtent aucun barreau.

### 🔴 LA FLÈCHE EST UN PAGINATEUR, PAS UN DÉFILEMENT — et c'est ce qui la sauve

La grille défile **verticalement** (30 sorts dans une fenêtre de 5 rangées). Si
la flèche défilait aussi, on retomberait dans le piège nommé en `B4.3bis` : un
défilement imbriqué dans un défilement rend le geste ambigu.

**Elle ne défile pas : elle REMPLACE le contenu de la grille** — page suivante
de sorts, ou niveau suivant. Le geste est un **tap**, pas un glissement, donc il
n'entre en concurrence avec rien.

📌 **C'est exactement l'issue (c) que `B4.3bis` proposait sans trancher** —
*« rendre le second axe orthogonal au premier »* —, et le besoin qui la
justifie arrive enfin. Elle n'est pas construite d'avance : Eric la demande
pour *« si un jour y'en a plus »*, donc **elle s'affiche seulement quand il y a
une page suivante** *(comme les chevrons de `B0.3` : aucun à la première étape,
aucun à la dernière)*.

---

## 4ter. LES VOILES DE LA GRILLE ✅ *Eric, 2026-08-15* — et le piège de l'empilement

> ***« Je serais tenté de mettre la transparence dalle sorts à 50 %, et les
> petites dalles à 35 %. »***

Sa lecture suit `B0.23` sans qu'on ait eu à la lui rappeler : la grille est une
**intermédiaire** (*« un peu plus de texte, pas de couleur »*), les tuiles sont
des **simples** (*« elle contient les choix »*).

### 🔴 MAIS DEUX VOILES S'EMPILENT, ET LE VOCABULAIRE NE L'AVAIT JAMAIS DÉCRIT

```
fond visible = (1 − 0,50) × (1 − 0,35) = 0,325
              →  voile COMPOSITE de la tuile = 67,5 %
```

**Une tuile à « 35 % » posée sur une dalle à 50 % est donc PLUS opaque que sa
dalle, pas moins.** C'est visuellement juste — une tuile qu'on saisit doit lire
comme posée *devant* son support — mais **le nombre dit le contraire de ce qui
se passe**.

### ⛔ LA RÈGLE À RETENIR

> **Un régime de voile ne décrit pas une apparence : il décrit ce qu'une couche
> ajoute à ce qu'il y a DESSOUS.** Une `dalle-simple` seule sur le fond rend à
> 35 % ; la même posée sur une intermédiaire rend à 67,5 %.

📌 **C'est la faute des deux échelles typographiques sous les mêmes noms**, qui
a coûté huit jours *(cf. l'en-tête d'`ERGONOMIE-BUILDER.md`)*. On la nomme avant
qu'elle morde, pas après.

### Le contraste — les chiffres qui font foi sont ceux de la BIBLE

⚠️ **CORRECTION DE CE FICHIER, LE JOUR MÊME.** Une première version calculait
ses propres ratios et concluait que l'accent devenait légal sur une tuile
imbriquée. **C'était faux, deux fois** : le calcul ne reproduisait pas la
méthode de la bible *(fonds réellement servis, pire pixel, SOUS le flou de
5 px)*, et surtout il prenait **3,0** pour cible alors que la bible tient
l'accent à **4,5** — parce que là il porterait **un mot**, pas une forme.

**Les chiffres de la bible** *(§« SEUL `--text` SURVIT SUR LE VERRE », lot 59,
jour · nuit)* :

| Encre | 35 % | 50 % | 100 % | Cible |
|---|---|---|---|---|
| **`--text`** | 6,3 · 7,4 ✅ | 7,5 · 8,5 ✅ | 12,6 · 12,5 ✅ | 4,5 |
| `--text-soft` | 3,0 · 3,6 ❌ | 3,6 · 4,1 ❌ | 6,0 · 6,1 ✅ | 4,5 |
| `--accent` | 2,7 · 3,3 ❌ | 3,3 · 3,8 ❌ | 5,5 · 5,6 ✅ | 4,5 |

**Interpolé à 67,5 %** : `--text` ~9 · ~10 ✅ · `--accent` ~4,0 · ~4,4 ❌

### ⛔ CE QUE ÇA DONNE, ET QUI EST PLUS SÉVÈRE QU'IL N'Y PARAÎT

✅ **Le choix d'Eric est le plus lisible des quatre régimes pour `--text`** — la
tuile est la surface la plus sûre de l'écran, ce qui est exactement ce qu'on
veut d'une case qui porte un nom de sort qu'on doit lire et saisir.

⛔ **MAIS L'INTERDICTION DE L'ACCENT TIENT.** Même à 67,5 %, il reste sous 4,5.
Dans les grilles : le nom d'un sort s'écrit en **`--text`**, et l'accent ne sert
qu'à **remplir une forme** — le liseré d'une tuile retenue, une pastille de
compte. ⛔ Jamais le nom lui-même, jamais un libellé en `--text-soft`.

📌 **La leçon, et c'est la deuxième fois de la journée** : un ratio calculé
autrement que la mesure de référence n'est pas une mesure, c'est une opinion
chiffrée. *(La première fois : « pixels opaques = 0 » sur un canvas WebGL déjà
composité.)*

📌 Les quatre régimes forment au passage une échelle plus régulière que les
trois d'avant : **35 · 50 · 67,5 · 100**.

---

## 4quater. LE FIGHTER — croquis D, 2026-08-15, et ce qu'il révèle

📐 `croquis/2026-08-15-class-fighter-choix.jpg`. Quatre écrans : fiche →
compétences → fighting styles → spécialisations d'armes.

### ✅ Ce que le dessin dit juste — confronté aux données, pas cru sur parole

| Ce qu'Eric a dessiné | Ce que les données disent |
|---|---|
| **4 fighting styles** (3 + 1) | **exactement 4** feats de catégorie `fighting-style` : `Archery`, `Defense`, `Great Weapon Fighting`, `Two-Weapon Fighting` ✅ |
| *« Choose three weapon spécialisations »* | `Weapon Mastery` : *« three kinds of Simple or Martial weapons »* ✅ |
| `Skill pool : 12 pts` | `fh_skill_pool.base = 12` dans `fh-skills-en` ✅ |
| **`delve` et `vigilence` dans la liste**, **pas `Perception`** | la couche FH fait `op: disable` sur `perception` et `op: add` sur `delve` + `vigilance` ✅ **la règle FH est déjà dans les données** |
| Blurb | **338 caractères** — passe la limite de 340 **de 2 caractères**. ⭐ Eric a écrit au plafond calculé sans le connaître |

### 🔴 CE QUI CHANGE LE GABARIT : LA FICHE A HUIT LIGNES, PAS SEPT

Le Fighter porte une ligne que le Wizard n'a pas — **`W. Proficiencies : 2`** —
et c'est **elle** la plus large de tout le bloc :

| | Mesuré à T2, étiquette en gras |
|---|---|
| `W. Proficiencies : 2` | **116 px** |
| Colonne de stats du §1 | 114 px |
| | **❌ déborde de 2 px** |

**Correction : image 104 → 100 px, colonne de stats 114 → 118 px.** Les 4 px
retirés à l'image ne se voient pas ; 2 px de débordement, si.

⚠️ **ET LE BLOC DE STATS N'EST DONC PAS DE HAUTEUR FIXE** : 7 lignes au Wizard,
8 au Fighter. La zone haute doit être dimensionnée sur **le maximum des 12
classes**, pas sur la première rencontrée. 📌 **À mesurer quand les 12 existent**
— ce fichier n'en connaît que deux.

### ✅ L'écran des armes est le plus facile des quatre

Tous les noms d'armes tiennent, sans exception : le plus large est
**`Quarterstaff` = 70 px** à T2, contre 86 utiles dans un slot `CHOICE` de front
et 90 dans une case de grille. **Trois slots de front passent** ici — là où les
sorts imposaient le 2×2. *(La différence : « Quarterstaff » contre
« Thunderwave » et « Comprehend ».)*

### ⭐ UN ORGANE DE PLUS, ET IL EST DÉJÀ CONSTRUIT AILLEURS

> *« You gain [second wind] »* — annoté **« clickable info panel, full size
> overlay with X »**.

C'est **exactement la forme du bouton `lore`** du croquis A : page pleine,
recouvre tout, un `X` pour sortir. ⛔ **Ne pas en faire deux choses.** Un terme
cliquable dans une phrase et un bouton `lore` sous une fiche ouvrent le même
panneau ; seule la source du texte change.

### 🔴 DEUX TROUS DE DONNÉES, ET AUCUN NE SE COMBLE DANS L'ÉCRAN

#### Trou 1 — `delve` et `vigilance` n'ont AUCUN chemin vers la liste du Fighter

La couche FH **désactive** `perception` et **ajoute** `delve` + `vigilance`.
Mais **aucune classe n'a son `skill_choice` patché** *(vérifié sur les 12)*. Le
`skill_choice.from` du Fighter reste celui du SRD : 9 entrées dont
`perception`, désormais désactivée → **8 utilisables**, et les deux compétences
FH sont absentes.

**Le croquis en montre 10.** L'écart n'est pas un défaut d'affichage : la donnée
n'existe pas.

⚖️ **DÉCISION D'ERIC, PAS DE L'ARCHITECTE** : quelles classes reçoivent quelles
compétences FH ? Trois formes possibles — patcher le `skill_choice` de chaque
classe dans `fh-skills-en` · déclarer les compétences FH offertes à toutes ·
ou les rattacher à une catégorie. **Aucune ne se devine.**

#### Trou 2 — le carrousel d'armes n'a pas ses catégories, et l'importateur en est la cause

Le croquis porte quatre onglets : `Simple` · `Simple ranged` · `Martial` ·
`Martial ranged`. **Les 38 armes ne portent ni l'un ni l'autre** :

```
Club       → cost, damage, mastery, properties "Light", weight
Greatsword → cost, damage, mastery, properties "Heavy, Two-Handed", weight
```

Rien ne distingue une arme simple d'une arme martiale. *(« Ranged » se
déduirait de `Ammunition` dans `properties` ; « Simple / Martial », non.)*

⭐ **ET CE N'EST PAS UNE DONNÉE À INVENTER — ELLE A ÉTÉ PERDUE EN ROUTE.**
Remonté jusqu'à la source : `~/tools/fh-srd/exports/srd/en/weapon.json` ne la
porte pas non plus, et les 38 armes y pointent toutes vers **`p.91`** — la page
où le SRD présente sa table d'armes en **quatre sous-tables : Simple Melee,
Simple Ranged, Martial Melee, Martial Ranged**.

🔴 **Les quatre onglets d'Eric SONT les quatre sous-tables du SRD.** Ce n'est
pas une invention d'interface : c'est la forme de la source. **L'importateur les
a aplaties en une seule liste et a perdu la provenance.**

⛔ **Le remède est en amont, pas au clavier** : corriger l'importateur
(`~/tools/fh-srd`), réexporter, resynchroniser. Saisir 38 catégories à la main
serait recopier une donnée qu'on possède déjà — et le fichier d'export le dit
lui-même : *« GENERATED FILE — DO NOT EDIT. Editing this copy is a silent
no-op. »*

---

## 4quinquies. LES SIX ARBITRAGES D'ERIC — 2026-08-15, fin de séance

### 1. ✅ LA RÈGLE PERCEPTION — tranchée, et calculée sur les 12 classes

> ***« Pour toutes les classes, quand il y a perception : tu dégages perception,
> tu remplaces par delve, vigilence, survival. Si elles sont déjà présentes tu
> ne les rajoutes pas deux fois. Les autres compétences FH peuvent être prises
> au moment du pool. »***

**Appliquée aux 12 classes** *(mesuré, pas supposé)* :

| Classe | Avant → Après | Ajouté |
|---|---|---|
| barbarian | 6 → 7 | delve, vigilance |
| druid | 8 → 9 | delve, vigilance |
| **fighter** | 9 → **10** | delve, vigilance |
| ranger | 8 → 9 | delve, vigilance |
| **rogue** | 10 → **12** | delve, vigilance, survival |
| bard · cleric · monk · paladin · sorcerer · warlock · wizard | inchangées | — |

⭐ **Le fighter tombe sur 10 — exactement le compte de son croquis**, retrouvé
sans l'avoir visé. La règle et le dessin se confirment l'un l'autre.

📌 **La clause « pas deux fois » sert 4 fois sur 5** : `survival` était déjà
présente partout sauf chez le rogue. Sans elle, cinq listes porteraient un
doublon.

🔴 **CE QUI DIMENSIONNE LA GRILLE DES COMPÉTENCES : LE ROGUE, PAS LE FIGHTER.**
12 options = 4 rangées de 3. C'est le maximum des 12 classes.

⛔ **Où ça s'écrit** : dans `fh-skills-en.layer.json`, en patchant le
`skill_choice` des **cinq** classes concernées. Pas dans l'écran — une règle du
jeu ne vit jamais dans l'interface (loi du dépôt).

### 2. ⏳ LES CARROUSELS D'ARMES ET D'ARMURES POUR L'INVENTAIRE

> ***« Le carrousel d'armes peut être intéressant pour l'inventaire. Il pourrait
> y avoir un carrousel d'armures aussi. Ça rajoute de la navigabilité. »***

📌 **Noté pour `B8` (Equipment)**, qui prévoyait déjà *« une molette horizontale
qui catégorise les équipements »*. **C'est le même organe**, et il en gagne un
second emploi. ⏳ Hors périmètre de ce fichier — Equipment est explicitement
*« on voit après »*.

### 3. ✅ LE BLOC DE STATS SE REDIMENSIONNE

Confirmé par Eric. Sur **le maximum des 12 classes**, pas sur la première
rencontrée *(cf. §4quater : 7 lignes au Wizard, 8 au Fighter)*.

### 4. 🆕 ✅ TOUT PANNEAU `lore` OU `info` PORTE UN **COPIER**

> ***« Chaque fois qu'il y a une possibilité lore ou info, il faut un copy to
> clipboard dedans. »***

**Règle universelle, pas une option d'écran.** Les trois portes connues à ce
jour ouvrent le même panneau *(cf. §4quater)*, donc **le copier se construit une
fois** :

| Porte | Où |
|---|---|
| `lore` sous une fiche | Class, Species |
| un terme cliquable dans une phrase | *« You gain [second wind] »* |
| `info` d'un sort / d'une arme | *« Tap on cantrip for info »* |

⭐ **Ça donne enfin une raison d'être au panneau au-delà de la lecture** : le
joueur emporte le texte vers sa feuille, son carnet, son Discord. 📌 Et ça
rejoint la loi §0.8 : ce qui se copie doit être du texte qu'on a le droit de
diffuser — **le panneau doit donc savoir ce qu'il porte** (`provenance`, cf. la
couche `fh-lore-en`).

### 5. ✅ LA GRILLE D'ARMES SE DIMENSIONNE SUR LES **MARTIALES DE MÊLÉE**

> ***« Ne mettre 18 cases dans la sélection d'armes que pour les armes martiales
> de mêlée. »***

**La partition du SRD (p.91), et elle tombe juste :**

| Sous-table | Nombre |
|---|---|
| Simple Melee | 10 |
| Simple Ranged | 4 |
| **Martial Melee** | **18** |
| Martial Ranged | 6 |
| | **38** ✅ = le compte du dépôt |

**18 = 3 colonnes × 6 rangées**, la plus grande des quatre. Les trois autres
onglets ne remplissent pas la fenêtre — et c'est là que la règle 6 s'applique.

#### 🔴 ET VOICI LA PREUVE QUE LA CATÉGORIE NE SE DÉDUIT PAS

Tentative de déduction depuis `properties` : `Ammunition` trouve **9** armes à
distance sur les **10** attendues. **`Dart` échappe** — elle est *Thrown*, pas
*Ammunition*. Un seul raté, et il suffit : une classification approximative
mettrait une arme dans le mauvais onglet, en silence.

⛔ **La catégorie se RÉIMPORTE** *(corriger `~/tools/fh-srd`, réexporter,
resynchroniser)*, elle ne se dérive pas et elle ne se saisit pas à la main.

### 6. 🆕 ✅ UNE DERNIÈRE RANGÉE INCOMPLÈTE SE **CENTRE**

> ***« J'essaie toujours de centrer la dernière boîte de choix pour faire joli,
> si tu as remarqué. »***

**Remarqué sur le croquis D** : les 4 fighting styles sont dessinés 3 + **1
centré**, pas 3 + 1 aligné à gauche.

**La règle : quand la dernière rangée d'une grille est incomplète, ses cases se
centrent.** Elle s'applique partout où une grille a un reste :

| Grille | Cases | Reste |
|---|---|---|
| Fighting styles | 4 | 3 + **1 centrée** |
| Compétences du rogue | 12 | plein, rien à centrer |
| Compétences du fighter | 10 | 3+3+3 + **1 centrée** |
| Cantrips du wizard | 15 | plein |
| Armes martiales de mêlée | 18 | plein |
| Armes simples de mêlée | 10 | 3+3+3 + **1 centrée** |

📌 **Et ça vaut aussi pour les slots `CHOICE`** — c'est de là que vient la
phrase d'Eric. Trois slots sur une dalle de 312 px se centrent naturellement ;
un slot seul *(fighting style)* se centre aussi.

---

## 5. Le récapitulatif, pour la commande du lot

| | Valeur |
|---|---|
| Marge de page | **16 px** |
| Rembourrage de dalle | **8 px** *(et non 16 — c'est ce qui débloque les grilles)* |
| Rail | **78 px**, noms à T3, `SEARCH` seul cliquable |
| Fiche | **242 px** — image **100** · écart 8 · stats **118** *(corrigé au croquis D : `W. Proficiencies : 2` fait 116 px)* |
| Blurb | **T2**, boîte de **10 lignes** (160 px), **≤ 340 caractères** |
| Grille de sorts | 3 colonnes de **98 px**, cases de **44 px**, gouttière **8 px** |
| Fenêtre de grille — **cantrips** | **304 px** = **6 rangées** ; les 15 n'en occupent que 5 ✅ |
| Fenêtre de grille — **sorts niv. 1** | **252 px** = **5 rangées** — le 2×2 reprend les 52 px que l'optimisation avait gagnés. ⭐ C'est la dérogation d'Eric qui rend ces deux lignes possibles : les dalles n'ont plus à être identiques |
| Dalle de choix — **cantrips** | **80 px** — 3 slots de front (98 px, `Prestidigitation` passe), consigne sur une ligne |
| Dalle de choix — **sorts niv. 1** | **132 px** — 4 slots en **2×2** (152 px chacun) : quatre noms de sorts de front n'existent pas à 360 |
| `Back` / `Done` | **52 px** — 44 de cible tactile + 8 |
| Ligne de titre | titre **T6** + **loupe 44** + **flèche 44** — la flèche pagine, elle ne défile pas, et n'apparaît que s'il y a une suite |
| Voiles de la grille | dalle **intermédiaire 50 %**, tuiles **simples 35 %** — ⚠️ composite réel de la tuile : **67,5 %** |

⚠️ **Ce qui reste à mesurer et que ce fichier n'a pas fait** : les 11 autres
classes et les 12 espèces. `Prestidigitation` et `Weapons : Simple` sont les pires
cas **du Wizard** ; un autre écran peut porter pire. **Le garde des 340
caractères et une vérification de la plus longue ligne de stats doivent tourner
sur les 24 fiches**, pas sur celle-ci seule.
