# Lot 87 — donner un prix et un poids aux objets magiques

**En clair :** les objets magiques du SRD n'ont **ni prix ni poids** — aucun, pas un seul sur
253. L'écran Équipement d'Eric tourne autour d'un panier, d'un total à payer et d'un poids
porté : deux tiers de son catalogue serait muet sur les deux chiffres qui le font marcher.

- **Dépôt :** `~/tools/fh-srd` · **branche `87-prix-et-poids`**, worktree déjà créé.
- ⛔ **Ne travaille jamais sur `main`, ne pousse rien.**

> 🔴 **CE LOT SE FAIT EN DEUX TEMPS, ET LE PREMIER NE TOUCHE AUCUNE DONNÉE.**
> Tu **proposes** d'abord, Eric **ratifie**, tu **appliques** ensuite. Un prix est une règle de
> jeu : elle lui appartient. Appliquer 248 valeurs sous hypothèse, c'est 248 valeurs à jeter.

---

## 0. 🔴 TA DÉPENDANCE AU LOT 86 — arbitrée le 23/08, ne la contourne pas

Le **lot 86** répare cinq objets magiques anglais qui n'existent pas : leur texte est collé
dans le record voisin. Quand il aura fusionné, **le genre passe de 253 à 258 records**.

⛔ **TON TEMPS 2 NE DÉMARRE PAS AVANT QUE LE LOT 86 SOIT FUSIONNÉ.** Sinon tu chiffres un
catalogue qui n'est pas le bon, et les cinq nés après arrivent **sans prix ni poids** — cinq
trous silencieux dans un genre qui aura l'air complet. L'architecte te dira quand.

⚠️ **ET LE PIÈGE DE DEUXIÈME ORDRE, QUI TOUCHE TON TEMPS 1** : si ton document de
ratification liste **253** objets, **la liste qu'Eric signera sera incomplète de cinq lignes**.
C'est exactement la faute d'hier — une signature humaine posée sur une donnée corrompue.

➡️ **Ton document doit compter 258, pas 253.** Les cinq à ajouter à la main dans ta
proposition, avec leur rareté lue **sur leur jumeau français** :

```
Dancing Sword · Frost Brand · Luck Blade · Sword of Life Stealing · Sword of Wounding
```

Ils sont tous de catégorie « arme ». 📌 Marque-les d'un signe dans ton tableau : *« n'existe
pas encore côté anglais, réparé par un autre lot »*. Eric doit voir qu'il signe pour eux aussi.

🔴 **Et ne touche NI `src/parse_items_en.py` NI `src/parse_items_fr.py` NI l'export des
objets** : ce sont les fichiers du lot 86. Deux branches qui les écrivent produisent un
conflit sur du code que ni l'un ni l'autre n'a lu en entier.

---

## 1. La mesure de départ

| | |
|---|---|
| objets magiques anglais | **253** |
| avec un prix | **0** |
| avec un poids | **0** |
| ⛔ dont des **boosts**, hors périmètre (§2) | **5** |
| ➡️ **objets réellement à traiter** | **248** |

Le reste du SRD est déjà servi, et c'est le contraste qui dit l'anomalie :

```
matériel  82  prix 82/82   poids 66 chiffrés + 16 marqués « — » (négligeable)
armes     38  prix 38/38   poids 37 chiffrés +  1 marqué « — »
armures   13  prix 13/13   poids 13/13
outils    25  prix 25/25   poids 25/25
```

⚠️ **`—` n'est PAS une absence, c'est une valeur** : « poids négligeable ». ⛔ Ne le remplace
pas par zéro et ne le compte pas comme un trou.

---

## 2. ⛔ LES CINQ BOOSTS SORTENT DU PÉRIMÈTRE — décision d'Eric, 2026-08-23

Ses mots : *« les boosts d'armes magiques ne sont pas des objets mais des améliorations. Dans
le SRD objets, chez nous boosts »* — et *« il en découlera des objets magiques homebrew »*.

| record du SRD | ce qu'il porte |
|---|---|
| `Weapon, +1, +2, or +3` | Uncommon (+1), Rare (+2), Very Rare (+3) · toute arme simple ou martiale |
| `Armor, +1, +2, or +3` | Rare (+1), Very Rare (+2), Legendary (+3) · toute armure |
| `Shield, +1, +2, or +3` | Uncommon (+1), Rare (+2), Very Rare (+3) |
| `Ammunition, +1, +2, or +3` | Uncommon (+1), Rare (+2), Very Rare (+3) |
| `Wand of the War Mage, +1, +2, or +3` | Uncommon (+1), Rare (+2), Very Rare (+3) |

⭐ **Ce ne sont pas cinq objets, ce sont quinze améliorations** (cinq familles × trois
niveaux) qui s'appliquent à un objet de base. Chez Fate's Hand, un objet magique devient
**objet de base + boost**, et c'est de là que sortiront les objets magiques maison.

➡️ **Tu les NOMMES et tu les LAISSES.** Ne leur donne ni prix ni poids, ne les convertis pas,
ne conçois pas le système de boosts : c'est un chantier d'Eric, connecté à son atelier de
craft. Ton seul travail sur eux : **dire clairement dans ton inventaire qu'ils sont écartés et
pourquoi**, pour que le chantier suivant les retrouve.

📌 **Et ils ont déjà leur destination**, décidée par Eric le 23/08 : *« les boosts dans
SRFH »* — le document de référence de Fate's Hand (§2 bis). Dis-le dans ton inventaire ; ne
l'écris pas toi-même.

## 2 bis. 🔴 LE SRFH — où va ce que le livre n'a jamais dit

Décision d'Eric, 2026-08-23 : *« les choses qu'on modifie par rapport au SRD, si hors de leur
champ, on met ça dans un SRFH — notre doc de référence »*.

| | où ça va |
|---|---|
| réparer ce que notre lecteur a mal lu du livre | **dans le SRD** — on rend la copie fidèle. C'est le travail des lots 85 et 86 |
| corriger une valeur qui **a** son champ dans le livre | une **couche par-dessus**, en opération nommée et motivée. Sept existent déjà |
| ⭐ **ajouter ce que le livre n'a JAMAIS dit** | **le SRFH** — jamais dans la copie |

🔴 **CORRIGÉ LE 23/08, APRÈS MESURE — et ça change le rangement.** Ce document disait que le
SRD ne donne aucun prix aux objets magiques. **C'est faux.** Le livre porte une table
`Magic Item Rarities and Values` (p. 206) — 100 · 400 · 4 000 · 40 000 · 200 000 GP, artefact
sans prix — **plus la règle d'ajouter le coût de l'objet de base** (son exemple : +1 Plate
Armor = 4 000 + 1 500 = 5 500 GP). Vérifié dans le PDF anglais du dépôt. Ce qui manque, c'est
que **notre extracteur ne l'a jamais extraite**.

➡️ **Donc trois choses, et trois endroits :**

| | où |
|---|---|
| la **table** et la règle d'ajout | **le SRD** — c'est le texte du livre, il manque à la copie |
| le **prix d'un objet donné** | **dérivé** de la table et de sa rareté. ⭐ Une dérivation n'a pas besoin d'être écrite quelque part : elle se recalcule |
| ce qui **ne se dérive pas** — les poids, l'éclatement des fiches-familles | **le SRFH** |

⛔ **N'écris donc AUCUNE valeur dans les records du SRD.** Ce serait mettre notre texte dans la
copie du document de quelqu'un d'autre — et au bout de six mois, plus personne ne saurait ce
qui vient du livre et ce qui vient de nous.

⭐ **L'argument à écrire noir sur blanc dans ta proposition** : *une valeur inventée qui vit
au-dessus de la copie se corrige, se date et se retire ; la même valeur écrite dans la copie
devient indiscernable du livre.*

📌 **Le mécanisme existe déjà, va le regarder avant de proposer** : sept couches Fate's Hand
vivent à côté des couches du SRD, dans `~/tools/fhpc/layers/`, préfixées `fh-`. Elles
travaillent par opérations nommées (`patch`, `disable`) **avec la raison écrite dans le
record**. Une huitième couche qui ne leur ressemblerait pas serait une couche que personne ne
saurait relire.

⏳ **Le NOM et la FORME exacte du SRFH ne sont pas encore arrêtés par Eric.** Recommande, dis
que c'est une recommandation, et n'attends pas la réponse pour finir ton temps 1.

---

## 3. Temps 1 — ce que tu proposes, et où

**Tu écris un document, et rien d'autre.** Ici :

```
~/obsidian-vault/FH-WEB/FHPC/FHPCv2 prix et poids des objets magiques.md
```

⚠️ **Le vault est local** (`~/obsidian-vault`), jamais par un service distant. ⛔ **Ne commite
pas le vault** — un plugin s'en charge tout seul en quelques secondes.

Eric lit sur iPad, le soir : **des tableaux, pas des paragraphes ; des titres courts**. Il
n'est pas codeur — pas de nom de fichier ni de variable dans le corps du texte.

### 3a. Le prix — sa méthode est donnée, l'échelle est à proposer

Ses mots : *« il faut rajouter les prix des objets magiques, on le fait en fonction de la
rareté, même si le prix reste indicatif c'est utile. »*

**Sous les 30 libellés de rareté, il n'y a que 7 paliers réels.** Mesuré :

| palier | n |
|---|---:|
| Rare | 82 |
| Uncommon | 77 |
| Very Rare | 53 |
| Legendary | 31 |
| Common | 2 |
| Artifact | 1 |
| **« Rarity Varies »** | **7** |

➡️ **Première chose à faire : ramener les 30 chaînes à ces paliers**, sans perdre ce que la
chaîne porte en plus (l'harmonisation, et par qui). ⭐ **Deux données dans un champ, c'est
deux champs** — un palier propre d'un côté, la condition d'harmonisation de l'autre.

🔴 **LES 7 « VARIES » SONT UN AUTRE PROBLÈME, ET IL N'EST PAS RÉSOLU** : `Belt of Giant
Strength` · `Feather Token` · `Figurine of Wondrous Power` · `Ioun Stone` · `Potion of Giant
Strength` · `Potions of Healing` · `Spell Scroll`. **Un record y couvre toute une famille** —
un seul « Potions of Healing » pour quatre potions, un seul « Spell Scroll » pour dix niveaux.
Un palier unique leur ment. ➡️ **Ne les force pas.** Décris le problème dans ta proposition et
**demande à Eric** ce qu'il veut : un prix par famille, un éclatement en records, ou rien.

**Ce que ta proposition doit porter** : une fourchette **par palier**, avec sa **source** (dis
d'où vient chaque nombre), et la valeur unique que tu retiens si Eric veut un seul prix.
📌 Il a déjà une échelle de prix ailleurs, pour ses catalyseurs Soulforge — **regarde si elle
existe dans le vault avant d'en inventer une** : deux échelles qui se contredisent coûtent
plus cher qu'une échelle imparfaite.

### 3b. Le poids — hériter plutôt qu'inventer

**La règle d'abord, les valeurs ensuite.** Un objet magique qui a une base mondaine **pèse ce
que pèse sa base** : une épée longue enflammée pèse ce que pèse une épée longue. C'est de
l'héritage, pas de l'invention, et ça se vérifie.

Ce que les records te donnent pour retrouver la base :

| | |
|---|---|
| la **catégorie** | arme 28 · anneau 22 · armure 19 · baguette 13 · bâton 12 · potion 24 · sceptre 7 · parchemin 1 · **objet merveilleux 127** |
| le **sous-type** | présent sur **47 sur 253** seulement — `"Any Medium or Heavy, Except Hide Armor"`, `"Dagger"`… |

➡️ Trois cas, et dis combien d'objets tombent dans chacun :
1. **base identifiable** → on hérite, et on le prouve ;
2. **pas de base mais une catégorie qui a une convention** (anneau, potion, parchemin,
   baguette, bâton, sceptre) → une valeur par catégorie, proposée une fois ;
3. **rien** → surtout les 127 objets merveilleux. **Là c'est un choix**, et il se marque comme
   tel. ⛔ Ne noie pas les choix parmi les héritages : Eric doit voir lesquels sont des
   décisions.

---

## 4. 🔴 Les pièges du prix et du poids sont DÉJÀ mesurés — ne les repaie pas

Ils sont écrits dans le vault, `FH-WEB/FHPC/FHPCv2 ecart formats.md`, sections P2 et P3.
**Lis-les avant d'écrire une ligne.** Les plus coûteux :

| piège | ce qu'il fait, en silence |
|---|---|
| deux graphies de la demie **en anglais**, dans le même fichier | `1/2 lb.` **et** `58½ lb.` — un lecteur qui gère l'un rate l'autre |
| virgule décimale française | `0,5 kg` lu par un lecteur anglais rend **0**. Un inventaire entier à zéro, sans erreur |
| séparateur de milliers | `1,000 GP` rend **1**, pas 1000 |
| `—` | ni zéro, ni absent : « négligeable ». Trois sémantiques du vide cohabitent déjà |
| la conversion française | le français dit `22,5 kg` là où l'anglais dit `50 lb.` — ce n'est **pas** la conversion attendue. Un aller-retour ne rend pas 50 |
| une note collée dans la valeur | `58½ lb. (full)` — l'unité et le commentaire dans le même champ |

⭐ **La leçon commune** : aucun ne fait rougir un test. Ils rendent un nombre faux, pas une
erreur.

---

## 5. Anglais et français

Eric, 23/08 : *« ici pour le moment on construit autour de l'anglais »*. Et la route
versatilité a tranché : **un seul jeu de records, clefs et identifiants en anglais, le français
en libellés par-dessus**.

⚠️ **Mais cette fusion n'a pas encore eu lieu** : aujourd'hui les deux langues sont deux jeux
parallèles. ➡️ **Pose les valeurs côté anglais**, et **dis explicitement dans ton inventaire**
ce que tu proposes pour le français — hériter de l'anglais, ou attendre la fusion. **Ne
décide pas seul** : c'est une question pour l'architecte.

---

## 6. Temps 2 — appliquer, seulement après ratification

⛔ **N'entame le temps 2 que sur un feu vert écrit d'Eric.** Alors seulement :

- les valeurs posées sur les **248** objets (pas les 5 boosts) ;
- **le prix et le poids dans la même passe** — c'est le même corpus, le même fichier, la même
  vérification ; les séparer, c'est l'ouvrir deux fois ;
- un **champ typé**, pas de la prose : un nombre et une unité, pas `"25 GP"`. C'est le sens de
  l'étape 3 de la route versatilité, et c'est ce qui rend l'écran calculable ;
- ⭐ **une trace de provenance par valeur** : héritée (de quoi), conventionnelle (de quelle
  règle), ou choisie. Une valeur sans provenance est une valeur que personne ne pourra corriger.

---

## 7. Ce que tu rends

**Au temps 1 :** le document du §3, et **ta réponse finale en français, courte**, avec :
- les fourchettes proposées par palier et leur source ;
- les trois cas du poids, **chiffrés** ;
- **la question des 7 « rareté variable »**, posée clairement — c'est une décision d'Eric ;
- ce que tu proposes pour le français ;
- ce que tu as **refusé** de faire et pourquoi.

⚠️ **Une seule question à la fois pour Eric.** Si tu en as trois, garde la plus bloquante et
range les autres en recommandations que tu assumes. ⛔ Et une question à laquelle tu réponds
toi-même n'est pas une question : tranche, et dis que tu as tranché.

**Au temps 2 :** l'inventaire au format du chantier, les suites vertes dans un **clone
indépendant** *(piège connu : `sources/pdf` est ignoré par git, donc absent d'un clone frais —
le build refuse en `SOURCE REFUSED` tant qu'on n'a pas reposé le lien symbolique)*, et le
compte des valeurs posées par provenance.
