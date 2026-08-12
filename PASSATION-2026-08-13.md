# Passation — 2026-08-13

> **Pour le siège suivant.** Ce fichier ne remplace pas `ARCHITECTE.md` (le mandat,
> à lire en entier d'abord) : il porte **ce qui s'est décidé le 2026-08-13**, et qui
> ne serait pas devinable autrement.
>
> ⚠️ **Les passations du 2026-08-12 sont CONSOMMÉES.** Celle du soir gardait la
> bible et les trois bugs vivants : les bugs sont payés, la bible vit dans le vault.
> N'y retourne que pour son §6 (ce qui surprend dans le code), qui tient toujours.

---

## 0. ⚠️ LIRE D'ABORD, DANS CET ORDRE

1. `ARCHITECTE.md` — le mandat.
2. 🥇 vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` — toute règle de jeu.
3. 🎨 vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md` — §2b l'échelle **ratifiée**,
   §5b la palette **corrigée**.
4. Ce fichier.

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md` (125 Ko, produit v1 gelé).

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`cbfd853`**, **662 verts**, arbre propre, ⚠️ **en avance sur le distant** |
| `fh-phb` `main` | voir `git rev-parse` — ⚠️ **en avance sur le distant** |
| `fh-srd` | `20c6598`, à jour |
| Échéance | **7 novembre 2026 — 86 jours** |

✅ **RIEN N'EST EN VOL** : aucun worktree, aucun lot en cours, aucune fusion à
moitié. Les branches `38-jetons-surfaces` et `39-etape-competences` sont
conservées (jamais `--force`).

⛔ **REMESURE CES SHA.** Le 2026-08-13, **deux lignes du §5 du mandat étaient déjà
fausses moins de douze heures après avoir été écrites.**

⭐ **UN SEUL SIÈGE D'ARCHITECTE EST ACTIF À LA FOIS** *(Eric, 2026-08-13)* — les
autres fils portent **(retired)**. Un commit que tu n'as pas fait n'est pas une
collision : va lire ce qu'il contient.

---

## 2. ⭐ CE QUE LA JOURNÉE A LIVRÉ

| | |
|---|---|
| **Lot 38 `jetons-surfaces` fusionné** | `tokens.css`, l'échelle T1–T7, les 3 bugs vivants payés, et **un garde d'octets sur `shell.css`** |
| **Lot 39 `etape-competences` fusionné** | **l'étape Compétences existe** — 26 compétences + 36 outils, 5 catégories, le compteur à trois bourses |
| **La palette corrigée** | 3 familles, le contraste mesuré sur **`creux`** et plus sur la dalle |
| **L'échelle ratifiée** | T1 10 · T2 12 · T3 14 · T4 16 · T5 18 · T6 22 · T7 44 |
| **Une dette qui n'existait pas, retirée** | les « 76 lignes » de `sync_from_vault.py` |
| **Deux instruments publiés** | la page d'habillage (3 familles × 2 thèmes) et le **modèle des zones avec simulateur 360 px** |

---

## 3. 🔴 LES QUATRE ERREURS DE CE SIÈGE — et la première est la plus instructive

**Toutes mesurées, toutes corrigées. Le taux est le vrai signal.**

1. 🔴 **J'ai comparé un ARRONDI à une limite.** La boucle qui a recalculé
   `PALETTE-FHV2.json` testait un contraste arrondi à deux décimales contre son
   seuil : **2,9959 passait pour 3,00**. Le lot 38 l'a trouvé sur deux jetons ;
   remesuré en comparaison exacte, la faute portait sur **quatorze valeurs** des
   trois familles. **Arrondir est un geste d'AFFICHAGE, jamais de comparaison.**
2. **J'ai proposé une solution impossible** dans la commande du lot 38 : lire une
   custom property dans une condition `@media`. Le lot l'a mesuré et a construit
   mieux (un drapeau posé par le `@media`, lu par le JS).
3. **J'ai reproduit une faute d'outillage que mon propre mandat documente** :
   `git merge -F -` ne lit pas stdin, la fusion a échoué **en silence**. Seule la
   remesure l'a vue.
4. **J'ai balayé le mauvais objet** en cherchant les jetons non définis : mon
   `grep` comptait les occurrences **dans les commentaires**. Le dépôt a un
   dépouilleur exprès pour ça (`tests/source-scan.mjs`) — je ne m'en suis pas servi.

📌 **La forme est toujours la même et elle se renouvelle indéfiniment : mesurer le
mauvais objet.** La parade qui a marché à chaque fois : **remesurer quand le
résultat surprend, et montrer la mesure plutôt que la conclusion.**

---

## 4. ⭐ LA LEÇON LA PLUS RENTABLE DE LA JOURNÉE — et elle est déjà au §5b du mandat

**Les deux meilleures pièces de conception de cette session viennent des ARTEFACTS
D'ERIC, pas du raisonnement de l'architecte.** Il suffisait d'aller les lire.

| Ce que l'architecte a proposé | Ce que l'artefact d'Eric disait déjà |
|---|---|
| Une règle heuristique pour abréger les noms d'outils | **Le builder v1 le fait déjà**, et sa table donne la règle exacte : il abrège **19** outils et en **garde 5** |
| Un rail de flèches **vertical**, coûtant **44 px de largeur** | **L'héritage n°4**, ratifié le 2026-08-04 : deux chevrons **36 × 14** qui **flottent** aux bords haut et bas — **14 px de hauteur, zéro colonne** |

⛔ **Avant de concevoir quoi que ce soit pour cet écran, va voir si Eric l'a déjà
construit.** `~/tools/fh-skills/fh-skill-builder.html` et le dock v1
(`fh-phb/docs/`) sont des mines, et ce siège ne les ouvre pas spontanément.

---

## 5. LES DÉCISIONS D'ERIC DU 2026-08-13 — ratifiées, pas encore codées

Prises **devant le simulateur 360 px**, elles visent l'étape Compétences qui vient
d'être fusionnée. **Aucune n'est dans le code aujourd'hui sauf la première.**

| # | Décision | État |
|---|---|---|
| 1 | **Ranger par catégorie**, avec intertitres | ✅ fait par le lot 39 |
| 2 | **Ôter le substantif générique** des noms d'outils — ⭐ **la règle est celle du v1 : on l'ôte QUAND IL SUIT UN POSSESSIF.** `Alchemist's Supplies` → `Alchemist's` ; `Card Set`, `Disguise Kit`, `Wind Instrument`, `Vehicles (Land)` restent entiers | 🔴 à coder |
| 3 | **La barre de catégories en molette plate** — ⛔ **le composant du lot 38, réemployé**, jamais un second | 🔴 à coder |
| 4 | **Les chevrons de défilement de l'héritage n°4** *(§4 ci-dessus)* | 🔴 à coder |
| 5 | **Le parchemin reste le défaut**, et les deux bleu gris deviennent des **options à proposer** | ✅ porté au vault |

**Effet mesuré de la n°2** : le plus long libellé passe de **23 à 17** caractères,
la moyenne de 15,2 à **11,0**, et **plus aucun ne dépasse 21**. ⚠️ C'est un geste
d'**affichage** (loi §0.13) — **le record garde son nom SRD**.

---

## 6. 🔴 CE QUI ATTEND ERIC — trois décisions, aucune bloquante

| | |
|---|---|
| **La teinte de la rampe des paliers** | le lot 38 l'a calculée en **28°**, soit **exactement la teinte de l'accent** : la pastille *expertise* et le bouton *Continue* porteraient la même couleur pour dire deux choses différentes. La bible §6b veut que la rampe ordinale ait **sa** teinte, ce qui libère vert/ambre/rouge pour le statut. **Un changement de valeur, donc une ligne.** |
| **Le FH overlay** | objet du produit, ou simple jeu de valeurs ? S'il porte images, textures et identité de campagne, c'est un **conteneur** — et il ressemble alors au homebrew, dont la forme est déjà tranchée (une liste de pointeurs). **À trancher avant de dessiner l'immersion.** |
| **La cible tactile à 360 px** | à 24 px de pastille, **61 libellés sur 62** passent ; à 44 px (la cible tactile), **43 sur 62** se coupent. Le seul arbitrage réel est **entre la taille de la cible et la longueur du libellé** — la troisième voie (la rampe sur sa propre ligne) ne renonce à ni l'un ni l'autre et paie en **hauteur**, la seule ressource qu'une page qui défile a sans limite |

📌 **Le simulateur 360 px répond à la troisième sans arithmétique** : il rend les
62 vrais libellés et **compte lui-même** ceux qui se coupent.

---

## 7. 🔴 LES DETTES D'ARCHITECTE — remesurées ce jour

1. ⭐ **Le budget captif ignore le barème de la classe.** La paire
   `{half: 1, proficient: 2}` est écrite **en dur dans le moteur, DEUX FOIS**
   (`decisions.mjs:211` **et** `derive.mjs:665`) et **publiée nulle part** —
   l'écran ne pouvait donc pas la lire, le lot 39 l'a recopiée et l'a signalé.
   Or les ADDENDUMS disent que Keen Senses se dépense **« au coût NORMAL »**,
   c'est-à-dire le `tier_costs` de la classe. **Dormant** tant que les 12 classes
   partagent le même barème *(mesuré : c'est le cas)*, mais **divergence latente**.
2. **La grandeur « moyenne » n'existe pas dans le code.** La bible ratifie trois
   grandeurs et deux seuils (**720** et **1140**) ; le code n'en porte qu'un.
   Mesuré : **sous 964 px, plan ouvert, la scène devient plus étroite que les
   360 px sur lesquels on dessine le téléphone** — à 900 px elle tombe à **296**.
   Sans danger jusqu'ici parce que le plan est fermé par défaut et que la scène
   était vide ; **la grille des compétences est la première zone qui peut casser
   là-dedans.** Le lot 38 avait raison de ne pas déclarer 1140 — il n'avait aucun
   consommateur. **Il en a un maintenant.**
3. **L'attribution hors document** — déclarée « prête » le 2026-08-09, **jamais
   construite** : remesuré, aucune provenance dans `derive.mjs`.
4. **Le genre `subclass` n'existe pas** (0 occurrence) — il faudra l'ouvrir pour
   les 24 sous-classes FH. **Après novembre.**
5. **Le garde des copies** des 22 arcanes ne confronte toujours rien.

---

## 8. ⭐ LA SUITE — et le plus gros lot d'après est le plus petit

**Mesuré : il reste HUIT étapes en placeholder** *(le mandat en annonçait sept —
9 étapes, moins Compétences)*. Elles ne coûtent pas la même chose :

| | Étape | Ce qu'il lui faut |
|---|---|---|
| ⭐ **1** | **Review** | ⭐ **`render-fiche.mjs` existe déjà, avec 27 tests** — il n'y a qu'à le brancher. **Premier moment où un personnage se construit ET se regarde**. Le plus petit lot, celui qui prouve le plus |
| 2 | **Concept · Class · Species · Inheritance** | même forme : choisir un record, poser son QCM chez elle. ⚠️ **Inheritance** est à renommer — l'arrière-plan n'existe plus en FH |
| 3 | **Le lot moteur du HASARD** | 🔴 **rien ne tire les dés ni les cartes.** `3d6 × 10 keep 6` et le tirage de Destinée n'existent nulle part |
| 4 | **Universe & Layers** | la seule étape qui touche la persistance — elle peut attendre |

### ⚠️ ET LE LOT DU HASARD POSE UNE QUESTION DE CONTRAT, LA SEULE DE LA LISTE

**Le moteur est déterministe par construction** — l'horloge est injectable
(`createBuild({now})`) précisément pour que deux exécutions ne divergent pas.
Tirer des dés introduit du hasard dans le bloc `build`. **Si la graine n'est pas
injectable exactement comme `now`, les suites cessent d'être reproductibles.**

**Recommandation de ce siège, à ratifier par Eric** : une **graine injectable**, et
le jet est une **donnée du document**, pas un effet de bord — on doit pouvoir
rouvrir un personnage et retrouver ses jets.

---

## 9. CE QU'ERIC DOIT POUSSER — les deux dépôts sont en avance

```
git -C ~/tools/fhpc   push origin main
git -C ~/tools/fh-phb push origin main
```

⛔ **Pousser reste son geste.** La règle du §2 du mandat n'a pas été levée.
