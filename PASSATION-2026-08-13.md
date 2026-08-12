# Passation — 2026-08-13

> **Pour le siège suivant.** Ce fichier ne remplace pas `ARCHITECTE.md` (le mandat,
> à lire en entier d'abord) : il porte **ce qui s'est décidé le 2026-08-13**.
>
> ⚠️ **Les passations du 2026-08-12 sont CONSOMMÉES.** N'y retourne que pour le §6
> de celle du soir (ce qui surprend dans le code). `PASSATION-2026-08-10.md` reste
> utile pour ses trois protocoles de travail.

---

## 0. ⚠️ LIRE D'ABORD, DANS CET ORDRE

1. `ARCHITECTE.md` — le mandat.
2. 🥇 vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` — toute règle de jeu.
3. 🎨 vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md` — §2b l'échelle, §5b la palette.
4. Ce fichier.

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md` (125 Ko, produit v1 gelé).

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`e2cc7d5`**, **685 verts**, arbre propre, ⚠️ **en avance sur le distant** |
| `fh-phb` `main` | **`bd5f0ea`**, arbre propre, ⚠️ **en avance** |
| `fh-srd` | `20c6598`, à jour *(un `.claude/` non suivi, sans conséquence)* |
| Échéance | **7 novembre 2026 — 86 jours** |

✅ **RIEN N'EST EN VOL** : aucun worktree sur `fhpc`, aucun lot en cours, aucune
fusion à moitié. Les branches `36` à `41` sont conservées (jamais `--force`).

⛔ **REMESURE CES SHA.** Le 2026-08-13, deux lignes du §5 du mandat étaient déjà
fausses **moins de douze heures** après avoir été écrites.

⭐ **UN SEUL SIÈGE D'ARCHITECTE EST ACTIF À LA FOIS** *(Eric)* — les autres fils
portent **(retired)**. Un commit que tu n'as pas fait n'est pas une collision :
**va lire ce qu'il contient.**

⚠️ **Un serveur local tourne peut-être encore** (node, port 8137, config dans le
`.claude/launch.json` du projet courant — **hors dépôt**). Il sert `~/tools/fhpc`
pour regarder le builder à `http://localhost:8137/ui/builder/`.

---

## 2. ⭐ CE QUE LA JOURNÉE A LIVRÉ — quatre lots fusionnés

| Lot | Ce qu'il a apporté |
|---|---|
| **38 `jetons-surfaces`** | `tokens.css`, l'échelle T1–T7, les 3 bugs vivants payés, et **un garde d'octets sur `shell.css`** |
| **39 `etape-competences`** | **l'étape Compétences existe** — 26 compétences + 36 outils, 5 catégories, le compteur à trois bourses |
| **40 `review`** | ⭐ **un personnage se construit ET se regarde** — `render-fiche.mjs` existait depuis le lot 25, personne ne l'avait branché |
| **41 `underived-clefs`** | **les persos sont anglais jusque dans les refus du moteur** — 76 clefs pour 77 sites |

**Et hors lot** : la palette corrigée (3 familles), la rampe en **violet 270°**,
trois défauts trouvés **en regardant l'écran**, et une dette qui n'existait pas
retirée *(les « 76 lignes » de `sync_from_vault.py` : la fonctionnalité était sur
`main` depuis le 2 août, le worktree avait 89 lignes de MOINS)*.

---

## 3. 🔴 LES SEPT ERREURS DE CE SIÈGE — et six sont la même

**Le taux est le vrai signal. Toutes mesurées, toutes corrigées.**

| # | L'erreur |
|---|---|
| 1 | **Un ARRONDI comparé à une limite** — `2,9959` passait pour `3,00`. Le lot 38 l'a vu sur 2 jetons ; la faute portait sur **14 valeurs** |
| 2 | **Une solution IMPOSSIBLE** proposée au lot 38 : lire une custom property dans une condition `@media` |
| 3 | **`git merge -F -` ne lit pas stdin** — la fusion a échoué **en silence**. Faute que mon propre mandat documente déjà |
| 4 | **Un `grep` qui comptait dans les COMMENTAIRES** en cherchant les jetons non définis |
| 5 | **27 tests annoncés là où il y en a 20** — mon `grep -c "test("` comptait sept `.test(...)` de regex |
| 6 | **77 sites annoncés comme 56** — motif **bien ancré**, mais sur **une seule orthographe** du producteur |
| 7 | **Une propriété renommée SANS SON LECTEUR** — le titre de la fiche est passé à « (unnamed) », **et les 684 tests sont restés verts** |

### 📌 LES DEUX RÈGLES QUI SORTENT DE TOUT ÇA

> **1. Arrondir est un geste d'AFFICHAGE, jamais de comparaison.**
>
> **2. Quand on cherche « qui produit X », la mesure fiable est X LUI-MÊME, pas
> ses écrivains.**

La n° 6 est la plus instructive : **la bonne mesure avait été faite en premier**
(balayer le carnet rendu, 19 entrées) **avant d'être abandonnée pour un `grep`**
qui semblait plus précis. **Ancrer ne suffit pas — il faut ancrer sur le bon objet.**

⚠️ **Le dépôt a un dépouilleur exprès : `tests/source-scan.mjs`.** Ce siège ne s'en
est **pas servi une seule fois** de la journée.

---

## 4. ⭐ LES DEUX LEÇONS QUI ONT LE PLUS RAPPORTÉ

### 4a. Les meilleures pièces venaient des ARTEFACTS D'ERIC

| Ce que l'architecte a proposé | Ce que l'artefact d'Eric disait déjà |
|---|---|
| Une règle heuristique pour abréger les noms d'outils | **Le builder v1 le fait déjà** : sa table abrège **19** outils et en **garde 5** — d'où la règle exacte, *on ôte le substantif générique quand il suit un possessif* |
| Un rail de flèches **vertical**, coûtant **44 px de largeur** | **L'héritage n°4**, ratifié le 2026-08-04 : deux chevrons **36 × 14** qui **flottent** aux bords — **14 px de hauteur, zéro colonne** |

⛔ **Avant de concevoir quoi que ce soit pour cet écran, va voir si Eric l'a déjà
construit.** `~/tools/fh-skills/fh-skill-builder.html` et le dock v1
(`fh-phb/docs/`) sont des mines, et ce siège ne les ouvre pas spontanément.

### 4b. ⭐ REGARDER L'ÉCRAN A TROUVÉ CE QU'AUCUNE MESURE N'AVAIT VU

Eric a demandé à voir le builder. Il a été servi, parcouru — et **trois défauts
sont apparus qu'aucune des 684 assertions ne voyait** :

1. `nom` / `modifie` survivaient au rendu **anglais** — ils échappaient aux deux
   paquets parce que ce n'étaient **pas des mots** mais des **noms de propriété** ;
2. **le builder câblait le balisage de la fiche sans sa feuille** — les 23 règles
   de `fiche.shell.html` ne sont chargées que par l'outil autonome ;
3. 🔴 **le garde du lot 38 avait la faute qu'il existe pour attraper** : son motif
   matchait `white` **dans `white-space`**. Corrigé (ancré sur la **valeur** d'une
   déclaration), puis **réattaqué trois fois**.

📌 **Une suite peut couvrir 21 rubriques et laisser le TITRE sans garde**, parce
que personne ne pense à tester ce qu'on voit en premier. **Sers le builder et
regarde-le** — trois lignes de config, et ça vaut une relecture.

---

## 5. LES DÉCISIONS D'ERIC DU 2026-08-13

| Décision | État |
|---|---|
| **Les persos sont en ANGLAIS**, jusque dans les refus du moteur | ✅ lot 41 |
| **Le FH overlay est un JEU DE VALEURS**, pas un conteneur — il ne sort pas du dépôt, donc aucune question de cycle de vie. ⭐ Et ça ne ferme rien : les jetons *sont* le mécanisme d'ouverture | ✅ gravé |
| **La teinte de la rampe** — déléguée à l'architecte → **violet 270°** *(critère : la rampe ne doit porter AUCUNE valence — elle dit « plus », pas « mieux »)* | ✅ appliqué |
| **Le parchemin** reste le défaut ; les deux bleu gris deviennent des **options à proposer** | ✅ |
| **Les trainings** : niveau 4 sauf mention contraire, et **on ne s'y attelle pas** avant l'expert builder | ✅ gravé |
| **Ranger par catégorie**, avec intertitres | ✅ lot 39 |
| **La barre de catégories en molette plate** — le composant du lot 38 réemployé | ✅ lot 39 |
| **Ôter le substantif générique** des outils — la règle du v1, *quand il suit un possessif* | 🔴 **à coder** |
| **Les chevrons de défilement** *(héritage n°4)* — 36 × 14, flottants, un clic = une bande, lignes aimantées | 🔴 **à coder** |

---

## 6. 🔴 CE QUI ATTEND ERIC — une seule chose

| | |
|---|---|
| **La cible tactile à 360 px** | à 24 px de pastille, **61 libellés sur 62** passent ; à 44 px (la cible tactile), **43 sur 62** se coupent. La troisième voie — la rampe sur sa propre ligne — ne renonce à ni l'un ni l'autre et paie en **hauteur**, la seule ressource qu'une page qui défile a sans limite |

📌 **Le simulateur 360 px y répond sans arithmétique** : il rend les 62 vrais
libellés et **compte lui-même** ceux qui se coupent. *(Artifact « Les zones du
builder », publié le 2026-08-13.)*

⚠️ **Et deux `git push` restent son geste** — les deux dépôts sont en avance.
📌 *Une fois dans la journée, un `push` est parti **par accident** : des accents
graves non protégés dans un `python3 -c "…"` que le shell a exécutés. Rien de faux
n'est parti, mais la parade est mécanique : **les accents graves passent par un
fichier, jamais par une ligne de commande entre guillemets doubles.***

---

## 7. 🔴 LES DETTES D'ARCHITECTE — remesurées ce jour

1. ⭐ **Le budget captif ignore le barème de la classe.** `{half: 1, proficient: 2}`
   est écrit **en dur dans le moteur, DEUX FOIS** (`decisions.mjs:211` **et**
   `derive.mjs:665`) et **publié nulle part**. Or les ADDENDUMS disent que Keen
   Senses se dépense **« au coût NORMAL »**, donc le `tier_costs` de la classe.
   **Dormant** tant que les 12 classes partagent le même barème *(mesuré : c'est
   le cas)*, mais **divergence latente**.
2. **La grandeur « moyenne » n'existe pas dans le code.** La bible ratifie deux
   seuils (**720** et **1140**) ; le code n'en porte qu'un. Mesuré : **sous 964 px,
   plan ouvert, la scène devient plus étroite que les 360 px** sur lesquels on
   dessine le téléphone — à 900 px elle tombe à **296**. ⚠️ **La grille des
   compétences est la première zone qui peut casser là-dedans.**
3. **L'attribution hors document** — déclarée « prête » le 2026-08-09, **jamais
   construite**.
4. **Le genre `subclass` n'existe pas** — à ouvrir pour les 24 sous-classes FH.
   **Après novembre.**
5. **Le garde des copies** des 22 arcanes ne confronte toujours rien.

---

## 8. ⭐ LA SUITE — il reste SEPT étapes en placeholder

| | Étape | Ce qu'il lui faut |
|---|---|---|
| **1** | **Concept · Class · Species · Inheritance** | même forme : choisir un record, poser son QCM chez elle. ⚠️ **Inheritance** est à renommer — l'arrière-plan n'existe plus en FH |
| **2** | **Le lot moteur du HASARD** | 🔴 rien ne tire les dés ni les cartes |
| **3** | **Universe & Layers** | la seule qui touche la persistance — elle peut attendre |
| **4** | Les deux décisions de forme non codées *(§5)* | l'abrégement des outils, les chevrons |

### ⚠️ LE LOT DU HASARD POSE LA SEULE QUESTION DE CONTRAT DE LA LISTE

**Le moteur est déterministe par construction** — l'horloge est injectable
(`createBuild({now})`) précisément pour que deux exécutions ne divergent pas.
**Si la graine n'est pas injectable exactement comme `now`, les suites cessent
d'être reproductibles.**

**Recommandation de ce siège, à ratifier par Eric** : une **graine injectable**, et
le jet est une **donnée du document**, pas un effet de bord — on doit pouvoir
rouvrir un personnage et retrouver ses jets.

---

## 9. 📌 CE QUI A MARCHÉ, ET QU'IL FAUT REFAIRE

**Quatre lots ont corrigé leur architecte aujourd'hui** — huit depuis le début du
chantier. Le lot 41 est allé le plus loin : **il a refusé d'écrire une ligne** et a
renvoyé la mesure, en distinguant lui-même *« ce n'est pas un ajustement de
comptage comme au lot 40, c'est un changement de taille du lot »*.

⭐ **Écris dans chaque commande de lot qu'il a le DROIT de la contredire, avec un
exemple daté.** C'est ce qui produit ce comportement, et c'est le meilleur
rendement du chantier.

⚔️ **Et attaque toujours ce que le lot n'a PAS attaqué.** Attaquer ce qu'il a déjà
attaqué ne prouve rien.
