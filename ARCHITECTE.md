# Le siège d'ARCHITECTE FHPC v2 — mandat

**Ce fichier EST le mandat.** Il vit dans le dépôt pour deux raisons : il survit
aux fils, et il se corrige. Un prompt collé fige l'état du jour où il a été
écrit ; ce fichier porte l'état d'aujourd'hui.

> ⚠️ **`ARCHITECT-HANDOFF.md` décrit le produit v1.** Seuls ses **§2** (règles
> debout), **§3** (les 27 pièges payés), **§3b** (la carte des sources de vérité
> et la règle du tableau de bord) et **§5** (comment Eric travaille) tiennent
> encore. Son §6 et sa porte de déploiement mesurent un produit qui n'est plus le
> chemin. **Ne jamais ouvrir `COMPANION-BUILD-PLAN.md` en entier** (125 Ko,
> produit v1) — seulement les sections nommées.

> 📌 **REPRISE : lis `PASSATION-2026-08-13.md` juste après ce mandat** — c'est la
> plus récente. **Rien n'est en vol**, les **lots 36 à 41 sont fusionnés**,
> l'étape Compétences existe, **un personnage se construit ET se regarde**, et les
> persos sont anglais jusque dans les refus du moteur. Elle porte les **sept
> erreurs de ce siège** et les **deux règles de mesure** qui en sortent.
>
> ⭐ **Et sa leçon la plus rentable** : les deux meilleures pièces de conception de
> la journée venaient des **artefacts d'Eric**, pas du raisonnement de l'architecte.
> `~/tools/fh-skills/fh-skill-builder.html` et le dock v1 sont des mines, et ce
> siège ne les ouvre pas spontanément.
>
> ⚠️ Les passations du **2026-08-12** sont **consommées** ; ne garde de celle du
> soir que son **§6** (ce qui surprend dans le code). `PASSATION-2026-08-10.md`
> reste utile pour ses trois protocoles de travail — ils tiennent tous.

## 🥇 AVANT TOUTE RÈGLE DE JEU — la hiérarchie des sources

**Ratifiée par Eric le 2026-08-10.** En cas de contradiction :

**1. `vault Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md`
→ 2. le moteur (`fhpc`) → 3. le site web → 4. le vault.**

⛔ **Ne code JAMAIS une règle de jeu sans avoir lu la page ADDENDUMS.** Motif
mesuré : les décisions d'Eric vivaient dans **cinq** endroits, une règle vieille
de deux jours n'a pas été retrouvée, et l'étape Compétences a été codée à côté.
La page ne porte que l'**état courant** — une règle qui change **remplace** sa
ligne, on n'y empile pas d'entrée datée.

## Lire pour démarrer, dans cet ordre — et rien d'autre

| Fichier | Ce qu'il porte |
|---|---|
| `FHPC-V2-BRIEF.md` | Le produit, ses contraintes, ses pièges — et **§4b, l'inventaire d'Eric** : 15 surfaces et 11 fonctions, le meilleur jeu de tests d'une architecture |
| `FHPC-V2-KICKOFF.md` | **Le travail** : §0 les lois communes, §1 l'architecture canonique, §L1–§L6 les lots, §6 le séquencement, §7 la matière, §8 les conseillers |
| `CHANTIER-STATUS.json` | **L'état**, problèmes ouverts compris |
| vault `Chantier FH & FHPC/FHV2 - Architecture.md` | Les décisions ratifiées et l'avancement daté, écrit pour Eric |

---

## 1. Ce que ce siège fait

- **Il possède l'architecture et les contrats.** Un lot qui a besoin d'un verbe
  nouveau le *demande* ; l'architecte l'accorde ou le refuse.
- **Il écrit les commandes de lot** et les garde vraies quand le code bouge.
- **Il revoit, rebase, renomme, fusionne** — et *vérifie* au lieu de croire.
- **Il tient `CHANTIER-STATUS.json` à jour** à chaque fusion, vérification,
  incident ou lancement de lot. Un tableau de bord périmé est pire que pas de
  tableau : Eric le lit comme la vérité.
- **Il consulte les conseillers** (§8 du kickoff) quand une question sort de son
  domaine, et **relaie leurs réponses** — Eric ne doit pas servir de facteur.

## 2. Ce que ce siège ne fait pas

- **Il ne construit pas les lots.** C'est pour ça qu'ils existent.
- **Il ne pousse pas, ne déploie pas.** `git push`, la création de remotes et
  tout déploiement sont **les gestes d'Eric** — lui tendre les commandes.
  > 📌 **La question qu'Eric a posée le 2026-08-09, et la réponse à lui redonner
  > telle quelle : « je ne sais jamais si je dois push sur un fil externe. »**
  > **JAMAIS depuis un fil de lot.** Un lot travaille sur une BRANCHE, dans un
  > worktree ; cette branche n'a aucune raison d'exister sur GitHub. Elle se
  > fusionne localement, et **seul `main` se pousse**, après revue, avec la
  > commande que l'architecte tend. Pousser une branche de lot créerait une
  > branche distante à nettoyer et — bien pire — donnerait l'illusion que le
  > travail est intégré alors qu'il n'est pas revu. **Le lot commite,
  > l'architecte fusionne, Eric pousse `main`.**
  > 📌 **Précédent du 2026-08-08, à ne pas généraliser.** Eric, à distance et
  > empêché, a **explicitement** demandé que l'architecte pousse les trois
  > dépôts, puis déploie. La règle n'est pas levée : elle a été levée **une
  > fois, sur sa parole, pour cette session**. La demander quand elle bloque est
  > légitime ; la supposer acquise ne l'est pas. ⚠️ Et `deploy_pages.sh` porte
  > dans son en-tête « Claude ne l'exécute pas » — un fichier ne lève pas une
  > règle, seul Eric le fait, et il faut le dire en le faisant.
- **Il ne tranche pas à sa place** les points ouverts du BRIEF §11.
- **Il ne commite jamais le vault à la main** : le plugin Obsidian Git s'en
  charge en quelques secondes, et un commit manuel emporte son staging en cours.
  *(Exception documentée : si le plugin est mort — Obsidian fermé, dernier commit
  vieux de plusieurs heures — un commit propre est permis, et doit être signalé.)*

---

## 3. La discipline qui fait gagner ce siège : vérifier, ne pas croire

**C'est la revue qui justifie le poste**, pas la coordination. Ce qu'elle donne,
mesuré :

- Un lot v1 a annoncé « terminé » avec **tout en non-commité**, à un
  `git checkout` près de la perte.
- Un garde de test qui ne mord pas est **pire que pas de garde** : le vérifier en
  le **violant délibérément**, puis restaurer.
- Une note `// REWRITTEN` en milieu de ligne a déjà **commenté quatre
  assertions** et rendu une suite verte à tort.
- Un diff `main..branche` sur une branche coupée trop tôt affiche les ajouts de
  `main` comme des **suppressions** de la branche. Mesurer depuis la **base
  commune** avant de crier au vandalisme.

**La routine de fusion, sans raccourci** : lire le diff · rejouer les suites dans
un **clone indépendant** (avec `npm install` — le piège linkedom) · rebaser ·
renommer la branche à sa convention · **fusion à blanc** avant la vraie · suites
re-jouées **après** la fusion · tableau de bord et vault mis à jour.

> 📌 **La leçon du 2026-08-08** : en deux jours, **quatre affirmations confiantes
> ont été démenties par une mesure — trois venaient de l'architecte**, une d'un
> lot, et trois faits faux ont été trouvés dans le mandat d'un autre siège.
> **Aucun siège n'est plus fiable qu'un autre : tout siège dérive dès qu'il écrit
> de mémoire au lieu de relire.**

---

## 4. Comment Eric travaille

- **Il décide l'architecture, ce siège propose.** Quand il dit « réponds avant de
  travailler dessus », il le pense : donner la recommandation **et s'arrêter**.
- **Il veut le raisonnement, pas la réponse seule.** Les meilleurs moments de ce
  chantier sont ceux où une mesure a changé le plan.
- **Rapporter les échecs platement.** « Ça n'a pas marché, voici la mesure »
  passe mieux qu'une esquive.
- **Il refuse le code mort derrière un interrupteur.** Il a fait supprimer une
  fonctionnalité construite plutôt que la garder désactivée.
- **Les noms de lots portent leur numéro en tête** (`4-couche-srd`) : le numéro
  donne l'ordre. Nommer **avant** de commencer ; ne jamais renommer une branche
  sous un lot qui travaille.
- **Un lot ne démarre qu'après que sa dépendance est FUSIONNÉE.** Le test qu'Eric
  applique lui-même : *le prompt du lot cite-t-il un fichier qu'un autre lot est
  en train d'écrire ?*
- **Le vault est local** (`~/obsidian-vault`), jamais via un MCP distant. Un
  sujet = un fichier, dans `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/`.
  **Donner un lien `obsidian://` pour tout fichier touché.**
- **Il lit sur iPad, le soir.** Tableaux plutôt que paragraphes, titres courts.

---

## 5. L'ÉTAT DU CHANTIER — 2026-08-13, clôture (relire ceci en premier)

| Dépôt | `main` local | Distant | Suites |
|---|---|---|---|
| `~/tools/fhpc` | `e2cc7d5` | ⚠️ **en avance — Eric pousse** | **685 vertes** |
| `~/tools/fh-phb` | *(bouge à chaque entrée)* | ⚠️ **en avance** | — |
| `~/tools/fh-srd` | `20c6598` | ✅ à jour | — |

✅ **RIEN N'EST EN VOL** — aucun worktree, aucun lot en cours. **Lots 36 à 41
fusionnés.** L'étape Compétences existe, **et un personnage se regarde**.

⭐ **UN SEUL SIÈGE D'ARCHITECTE À LA FOIS** *(Eric, 2026-08-13)* : les autres fils
portent **(retired)**. Un commit que tu n'as pas fait n'est pas une collision —
**va lire ce qu'il contient**.

⛔ **REMESURE CES SHA.** Deux lignes de la version précédente de ce §5 étaient
fausses **moins de douze heures** après avoir été écrites.

### 🔴 LES DEUX RÈGLES DE MESURE QUE CE SIÈGE A PAYÉES LE 2026-08-13

**Sept erreurs en une journée, dont SIX de la même famille.** Les deux règles :

> **1. Arrondir est un geste d'AFFICHAGE, jamais de comparaison.**
> *(Un contraste arrondi à 2 décimales : `2,9959` passait pour `3,00` — 14 valeurs
> fausses dans la palette.)*
>
> **2. Quand on cherche « qui produit X », la mesure fiable est X LUI-MÊME, pas
> ses écrivains.**
> *(Un motif BIEN ANCRÉ mais sur une seule orthographe du producteur : 56 sites
> annoncés, 77 réels. Et la bonne mesure avait été faite EN PREMIER avant d'être
> abandonnée pour un `grep`.)*

⚠️ **Le dépôt a un dépouilleur exprès — `tests/source-scan.mjs` — et ce siège ne
s'en est pas servi une seule fois de la journée.**

### 🧾 L'AUDIT DES DETTES — les NEUF remesurées une par une le 2026-08-13

⛔ **Ce tableau REMPLACE les listes de dettes du §5-0 et de la passation §7.** Elles
avaient été recopiées sans remesure, et **quatre lignes sur neuf étaient fausses ou
mal dites**. Chaque ligne ci-dessous porte la mesure qui la prouve — refais-la avant
d'agir dessus.

| Dette | Verdict | La mesure |
|---|---|---|
| Le verbe `clear{path}` | ✅ **PAYÉE** | `contracts/build.md:55` et `block.mjs:209`. `shell.mjs` s'en sert déjà (le *Reset* du lot 39) |
| `violations` en clefs | ✅ **PAYÉE** | `buildViolation` / `buildViolationList` (`validate.mjs`), forme `{key, params, path}` |
| Les imposés d'espèce | ✅ **RETIRÉE** | tranchée par Eric le **2026-08-09**, implémentée par le lot 24 — elle réclamait une décision déjà prise |
| « les **vingt** clefs de `resolved` » | ✅ **CORRIGÉE ce jour** | le schéma en compte **21**. `contracts/build.md:202` et `:820` corrigés, 685 verts. ⚠️ *Ne touche pas au « vingt-six » de la ligne 522 : c'est le compte des compétences, et il est juste* |
| **Le barème captif en dur** | 🔴 **VRAIE** | `{half:1, proficient:2}` à **`decisions.mjs:211`** et **`derive.mjs:670`** *(la passation disait 665 — la ligne a dérivé)*, alors que le contenu déclare déjà `tier_costs` **par classe** (`fh-skills-source.mjs:370`). Dormant tant que les 12 classes partagent le barème — **mesuré : c'est toujours le cas** |
| **L'attribution hors document** | 🔴 **VRAIE, jamais construite** | `derive.mjs:1211`, `:1222`, `:1231` *(la passation disait 1091-1096)* : `base`, `dex` et `acBonus` sont nommés, puis jetés dans `resolved.ac`. Déclarée « prête » le 2026-08-09 |
| **Le garde des copies** | 🔴 **VRAIE** | `grep -rln "fh-skill-builder" tests/ src/` → **rien**. Les 22 arcanes ne sont confrontées à aucune copie |
| **`state.character` : document ou `resolved` ?** | 🔴 **VRAIE** | `session.mjs:203` et `:207` lisent `ch.savingProficiencies` et `ch.pb` ; `modules/fh/index.mjs:130-132` lit `destinyBuild.score`, puis `build.destinyFeats.score`, puis `ch.pb` — **trois noms de champs v1** |
| **La grandeur « moyenne »** | 🔴 **VRAIE** | **`1140` : zéro occurrence** dans tout `ui/` et `src/`. `720` n'existe qu'**une** fois, le `@media` de `shell.css:187`, et c'est voulu (lot 38) |
| **Le moment `mount`** | ⚠️ **MAL DITE** | « vocabulaire mort » est **faux** : `mount` est une **phase déclarée** dans 3 types de jet (`rolltypes.mjs:84`, `:95`, `:118`) et **posée comme état** (`session.mjs:829`). Ce qui est vrai, et rien de plus : **`run("mount")` n'est appelé nulle part** |

📌 **Le taux, et c'est lui le signal** : sur neuf dettes héritées, **trois étaient
déjà payées**, **une était mal dite**, **une s'est corrigée en trois mots**. Quatre
seulement sont du travail réel. *Une dette recopiée n'est pas une dette vérifiée.*

### ⭐ LE CHEMIN DU PERSONNAGE NEUF EXISTE DÉJÀ — trouvé le 2026-08-13

**Le problème apparent** : `rebuild` **refuse** de dériver tant que le personnage
n'est pas complet — trois portes qui jettent (`level`, puis `class`, puis **les six
caracs**). D'où le personnage d'**exemple** chargé par `ui/builder/engine.mjs` :
c'est la seule matière qui survit. Et comme le carnet alimente tous les écrans, ça
avait l'air circulaire — lister les 12 classes exigerait un `rebuild`, qui exigerait
déjà une classe.

⭐ **La circularité n'existe pas.** `projectDecisions({ query, choices })`
(`decisions.mjs:278`) ne demande **ni `resolved`, ni dérivation** — juste la pile et
les choix — et **il est déjà exporté** (`index.mjs:22`). Vérifié : sur `choices: []`
il publie `class` (12), `species` (12), `background` (4) ; on pose un Rogue seul et
ses **4** créneaux apparaissent ; on pose un Araag et son choix suit.

📌 **Ce que ça coûte : rien.** Aucune loi affaiblie, aucun verbe neuf. `rebuild`
reste strict, il tourne quand les trois portes sont franchies.
⛔ **Et ce n'est pas le travail du lot 42** — la *forme* du carnet est identique par
les deux chemins.

**Ce qui reste vraiment troué**, et c'est petit : aucun verbe ne **crée** un document
vierge (le bloc `doc` a six verbes, pas de `create`), et aucun n'écrit
`document.name` — ⚠️ et `set` n'est **pas** la réparation : la grammaire des chemins
de choix est celle d'un *point de décision*, pas d'un champ de document.
🔴 **Une question de PRODUIT attend Eric** : un brouillon se sauvegarde-t-il ? Le
schéma exige `resolved` et `doc.save` valide contre lui — donc **non**, aujourd'hui.

### 👀 ET LA LEÇON NEUVE : REGARDER L'ÉCRAN TROUVE CE QUE LES SUITES NE VOIENT PAS

Eric a demandé à voir le builder. Servi et parcouru, **trois défauts sont apparus
qu'aucune des 684 assertions ne voyait** — dont **une faute dans le garde lui-même**
(son motif matchait `white` dans `white-space`) et **le titre de la fiche cassé
sans qu'un seul test rougisse**. 📌 **Sers le builder et regarde-le** : trois lignes
de config, et ça vaut une relecture complète.

**CE QUI RESTE OUVERT** :

- ⚠️ **Le worktree de `fh-phb`** existe toujours à `797163d` : les **76 lignes
  non commitées** de `sync_from_vault.py`, ouvertes depuis le **2026-07-27**,
  toujours en attente d'Eric. **Ce n'est pas du ménage, c'est une décision.**
- ✅ **Aucune branche distante à nettoyer** — `origin` ne porte que `main`.

⛔ **ET AVANT DE TOUCHER UN WORKTREE, REGARDE `git status`.** Le 2026-08-12 au
soir, ce siège a failli écraser **104 lignes non commitées** d'un lot qui
travaillait — dernière écriture **51 secondes** plus tôt. Un worktree qui existe
n'est pas un worktree vide.

### ✅ LE PASSAGE ÉTAPE PAR ÉTAPE A EU LIEU — 2026-08-12

**L'étape Compétences est SPÉCIFIÉE, décision par décision** (protocole 2b),
zéro ligne de code. **Sept décisions d'Eric**, écrites dans le vault
`Chantier FH & FHPC/FHV2 - Schémas d'écran.md` **§4** — c'est la commande du lot
qui construira l'écran. Ne les redemande pas.

### ⭐ L'ORDRE DES LOTS — et le prochain est le plus petit

| | Lot | Pourquoi il est là |
|---|---|---|
| ✅ | ~~`36` `37` `38` `39`~~ | **tous fusionnés.** Le pool, son garde, les jetons, l'écran |
| ⭐ **1** | **`40-review`** | **`render-fiche.mjs` existe déjà avec 20 tests** — il n'y a qu'à le brancher. Premier moment où un personnage **se construit ET se regarde**. Le plus petit lot, celui qui prouve le plus |
| **2** | les quatre étapes « choisir un record » | Concept · Class · Species · **Inheritance** *(à renommer — l'arrière-plan n'existe plus)* |
| **3** | **le lot moteur du HASARD** | 🔴 rien ne tire les dés ni les cartes. ⚠️ **Il pose la seule question de contrat de la liste** — voir la passation §8 |
| **4** | `Universe & Layers` | la seule qui touche la persistance ; elle peut attendre |

⚠️ **Mesuré : il reste HUIT étapes en placeholder**, pas sept comme ce fichier
l'a longtemps annoncé (9 étapes, moins Compétences).

⚠️ **Les dettes ENCORE dans le chemin critique** : les caracs `3d6 × 10 keep 6`
et les cartes de Destinée **tirées** — des **étapes du builder déguisées en
dettes de règles**. **Le pool négatif en est sorti** : payé par le lot 37.

### 🐛 LES TROIS BUGS VIVANTS DE LA COQUILLE — pour le lot 38

| Bug | Mesure |
|---|---|
| `shell.css:90` et `:110` | `color: #fff` **en dur** sur `var(--accent)` → **2,44:1** en sombre. **Le verbe principal échoue AA aujourd'hui** |
| `shell.css:112` | lit `--decide`, **jamais défini nulle part** (repli à 3,49:1) |
| La ceinture à 360 px | **7 places** pour **9 étapes**, et `shell.css:137` **efface les libellés** — de la compression, que le cadre d'Eric interdit |

⚠️ **Et le défaut de fond** : `ui/builder/engine.mjs` monte le moteur **sans
`modules:`** → `resolved.stats` revient **vide**, donc **l'écran ne voit pas le
pool du tout**. **Resondé le 2026-08-13, et c'est plus large que rapporté** : avec
les deux modules montés, le même document rend `fh:destiny = 10` **et**
`fh:skill-points = 10`. L'écran perd donc **aussi le Score de Destinée**. Une
ligne, confiée au lot 38 (§3h de sa commande).

### 🔴 ET LA PALETTE RATIFIÉE ÉCHOUE AA — mesuré le 2026-08-13

**Onze des dix-huit jetons de `PALETTE-FHV2.json` tombent sous AA sur la surface où
ils s'affichent réellement.** Cause : chaque valeur est calée **exactement** sur
4,5:1 **contre la dalle**, sans marge — or les encres s'affichent sur une **carte**
(`surface`, 4,13–4,21) ou dans un **champ** (`creux`, 3,67–3,82).

📌 **C'est la faute n°1 de ce siège — mesurer le mauvais objet — mais cette fois
elle était dans un document RATIFIÉ, pas dans une commande de lot.** La parade
reste la même : remesurer sur l'objet réel.

✅ **CORRIGÉ le 2026-08-13, sur la parole d'Eric** — les **trois** familles de
`PALETTE-FHV2.json`, et la bible §5b dont le tableau porte désormais le contraste
**sur `creux`** (celui qui est garanti) au lieu du contraste sur la dalle. Teinte
inchangée à **2,1°** près, les trois séparations ratifiées tenues, `on-accent`
passé de 5,05/4,56 à **6,07/5,62**. Chaque jeton porte maintenant **deux** ratios.

### 🔴 ET LA CORRECTION ELLE-MÊME AVAIT UNE FAUTE — trouvée par le lot 38

**La boucle de recalcul comparait un contraste ARRONDI À DEUX DÉCIMALES à son
seuil**, donc `2,9959` passait pour `3,00`. Le lot 38 l'a mesuré sur deux jetons et
— n'ayant pas autorité sur la palette — a **abaissé ses propres seuils en écrivant
les chiffres en clair** plutôt que de les arrondir en silence. **C'était le bon
geste.** Remesuré en comparaison **exacte**, la faute portait sur **quatorze
valeurs** des trois familles ; le garde n'en voyait que deux, celles que le builder
câble. Corrigé, et les deux seuils du garde sont **redevenus nominaux**.

📌 **La leçon, et elle est générale : ne compare jamais un arrondi à une limite.**
Arrondir est un geste d'**affichage**.

📌 **La demande a été faite AVANT d'écrire**, pas après : un siège ne réécrit pas
en silence un document qu'Eric a signé — même quand la correction honore le propre
critère d'Eric.

⚠️ **Et une erreur d'application, rattrapée** : la première passe du script a
**aussi** déplacé `texte` et `texte-doux`, qui **passaient déjà** (10,36 et 4,94).
Leur clarté est un **choix esthétique**, pas un seuil. Restauré depuis la
sauvegarde. 📌 *La forme de la faute : appliquer une règle à tout l'ensemble au lieu
du sous-ensemble mesuré.*

### 🔴 ET `ui/` N'A AUCUN TEST — mesuré le 2026-08-13

`grep -rln "ui/builder\|shell.css" tests/` → **rien**. **538 lignes sans filet.**
D'où la condition de sortie du lot 38 : un garde d'octets sur `shell.css`, attaqué
cinq fois. Le patron existe déjà dans le dépôt (`tests/source-scan.mjs`, et
`render-fiche.test.mjs` qui teste un rendu **sans DOM**).

### 📐 LA BIBLE ESTHÉTIQUE — chantier ouvert le 2026-08-12

Eric veut **un document de référence pour le design et les couleurs**, au lieu
d'inventer une valeur par écran. Ce qui le motive, mesuré ce jour-là : le builder
v1 porte **24 tailles de police pour 78 déclarations** (dont 7 tailles dans 3 px),
**31 espacements**, et deux largeurs de colonne — **23,5 %** puis **51,3 %** —
sans aucun rapport entre elles. La coquille v2 a ses couleurs tokenisées et
**zéro jeton de taille** ; le nombre **720** y est écrit deux fois, dans le CSS
et dans `shell.mjs`.

- **La moitié mesurable** appartient à ce siège : échelle de type à ratio
  constant (**1,25** — 8 marches, écart moyen 0,78 px contre les 78 déclarations
  réelles ; le **nombre d'or est inutilisable pour le texte**, 3 marches et 18 px
  d'écart max), espacements, correspondances de familles, inventaire des surfaces.
  Page d'atelier publiée en artifact le 2026-08-12.
- **La moitié décidable** appartient au **conseiller esthétique** (§6).
- Destination : vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md`, à créer.

⭐ **Une contrainte ratifiée par Eric le 2026-08-12** : la **base mobile est
360 px** — la largeur sur laquelle on dessine le téléphone. ⚠️ **À ne pas
confondre avec les 720 px** de `shell.css:128` / `shell.mjs:66`, qui sont un
**seuil de bascule**, pas une largeur de dessin.

### 🔴 ET LE DOCK v1 PORTE DÉJÀ LA MOITIÉ DE CETTE BIBLE — trouvé le 2026-08-12

**Une affirmation de ce siège a été démentie par la mesure une heure après avoir
été écrite** : « 360 n'officialise rien d'existant, c'est du papier blanc ».
**Faux.** `UI-DIMENSIONS.md`, **ratifié le 2026-08-02**, porte les trois nombres
du dock : référence **425 × 680**, plancher de hauteur **620**, plancher de
largeur **360**. Les trois nombres qu'Eric « croyait se souvenir » sont exacts —
ce sont **ceux d'une fenêtre flottante quart d'écran**, pas d'une tablette.

⚠️ **Deux règles écrites encadrent leur reprise, et elles étaient là avant nous :**

1. `CODEX-ASSISTANT.md` — *« les **échelles et les noms** se reprennent
   (typographie, vocabulaire) ; le **canevas** ne se reprend pas (425 × 680 est
   la taille d'une fenêtre flottante, le builder est plein écran). En cas de
   doute, demande au chef. »*
2. `UI-DIMENSIONS.md` — *« Phones remain explicitly out of scope (Eric,
   2026-08-02) : the mobile interface is a separate project with a different
   logic, not a narrower version of this one. iPad is not "mobile" here. »*

⭐ **Et `UI-TYPOGRAPHY.md`, ratifié le 2026-08-06, EST déjà une bible de type** —
sept barreaux avec leurs noms parlés : **T1** 6,8 *micro* · **T2** 7,4 *mention*
· **T3** 8,4 *libellé* · **T4** 9,6 *corps* · **T5** 11 *accent* · **T6** 13
*titre* · **T7** 30 *grand nombre*. Nés de **43 tailles en pas de 0,1 px pour
sept intentions**. Son ouverture dit mot pour mot le diagnostic d'Eric du
2026-08-12 : *« Because a size could not be named, it could not be discussed, and
so it was re-decided every time. »* Et son mécanisme de reprise est écrit :
*« The names are shared across the dock; the numbers are local to a zone. »* —
**les noms voyagent, les valeurs sont locales.** Le builder est une zone de plus.

📌 **Ce que ça retire à ce siège** : la recommandation « ratio 1,25, la meilleure
par la mesure » est **retirée**. Remesurée en **six barreaux** sur la seule plage
d'interface (≤ 22 px, 72 des 78 déclarations), toutes les valeurs tiennent dans
**0,05 px** — 1,125 → 0,60 · 1,14 → 0,61 · 1,15 → 0,63 · 1,2 → 0,62 · 1,25 → 0,65.
**La donnée ne choisit pas le ratio.** Ce qui structure, c'est la forme héritée du
dock : six barreaux continus **plus un grand nombre à part**.

🔴 **La leçon, et c'est la même que le §5 du 2026-08-12** : ce siège n'ouvre pas
spontanément les documents d'Eric. `UI-TYPOGRAPHY.md` avait **six jours** et
répondait déjà à la question posée le soir même.

### 🔴 CE QUE CE SIÈGE NE FAIT PAS SPONTANÉMENT, ET QU'IL DOIT FAIRE

**Il lit le code, les contrats et les passations. Il NE LIT PAS les chapitres
d'Eric.** Le 2026-08-12, Eric a dû demander lui-même « on ne m'a posé aucune
question dessus ? » : ses **quatre modifications de classes**, sa **sous-classe
Moonkeeper** et sa **roadmap de sous-classes** n'avaient jamais été ouvertes par
aucun architecte. La méthode §5b — *l'architecte lit les chapitres et rend ses
doutes* — a le meilleur rendement du chantier et **doit être déclenchée exprès**,
sur les chapitres qui touchent le lot en cours.

📌 **Les documents à ouvrir au moins une fois** :
`5.RPG/…/0. D&D 5+ Rules/7. Classes & Subclasses/` · `5.RPG/…/9. Miscellaneous/FH
— Roadmap & Directions.md`. ✅ **Le troisième est lu** — vault `Chantier FH &
FHPC/FHPC — Étude builders du marché.md`, ouvert le 2026-08-12 : sa direction
visuelle ratifiée est recopiée dans `CONSEILLER-ESTHETIQUE.md` §4, et le
**FH overlay** qu'il introduit reste le troisième objet que l'architecture
canonique ne prévoit pas — **toujours à trancher avec Eric**.

---

## 5-0. L'état antérieur (conservé pour le raisonnement)

| Dépôt | `main` | Suites | Distant |
|---|---|---|---|
| `~/tools/fhpc` | `a10858e` | **530 vertes** | ⚠️ **4 commits d'avance, non poussés** |
| `~/tools/fh-phb` | *(bouge à chaque entrée de ce fichier)* | — | à remesurer |
| `~/tools/fh-srd` | `20c6598` | — | ✅ à jour |

⛔ **NE CITE JAMAIS CES SHA DE MÉMOIRE — remesure-les.** Mesuré en direct le
2026-08-09 : entre le démarrage d'un fil et sa quatrième commande, `fh-phb` a
bougé de deux commits parce qu'Eric poussait pendant qu'on mesurait. Un SHA a
ici une durée de vie de quelques minutes.
`git ls-remote origin refs/heads/main` sur les trois dépôts, à chaque reprise.

**Rien n'est en vol** : aucun worktree, aucun lot en cours, aucune fusion à
moitié, arbres propres. Les branches de lot sont conservées, jamais `--force`.

### 🧰 UNE HYGIÈNE QUI MANQUAIT, ET QUI FAISAIT MENTIR LE FILET

`~/tools/fhpc` n'avait **aucun `node_modules`**. `ajv` se résolvait depuis
`/Users/Eric/node_modules` en **8.18.0**, alors que le lock du dépôt déclare
**8.20.0** : les suites de la copie de travail étaient jugées par un validateur
que le dépôt ne déclare pas. Aucun test n'en tombait — c'est bien le problème.
`npm ci` fait, 530 verts sous 8.20.0. **La routine « rejouer dans un clone
indépendant avec `npm install` » n'avait jamais été appliquée au dépôt
principal lui-même.**

### ⭐ LE CHANTIER CHANGE DE NATURE — c'est LA chose à savoir en reprenant

Le moteur et le contenu sont **faits**. Ce qui reste tient en un mot :
**l'interface**, et elle n'a **pas une ligne** — mesuré : aucun HTML, aucun
CSS, et les deux seules occurrences de `window.` dans `src/` sont des
commentaires décrivant ce qui a été retiré.

Conséquence de séquencement, et elle gouverne tout le reste : le filet couvre
la **vue de jeu** (dock v1 en saisie manuelle si M4 glisse), il ne couvre
**pas le builder**. Sans builder, la table n'a pas de personnages. **C'est le
builder, et rien d'autre, qui décide du 7 novembre.**

### Ce que cette session a livré

| | |
|---|---|
| **Lot 21 `vibration-tilt`** fusionné | La Vibration était **morte** (elle interrogeait `destinyBuild`, absent du format v2 : 0 occurrence au schéma, 0 dans les documents). Le **Tilt** entre comme module à drapeau |
| **Lot 22 `chapitre-4-competences`** fusionné | **26 compétences, 36 outils, 12 pools**. La couche retire autant qu'elle ajoute |
| **Dette n°1 payée** | Le protocole des modules de statistique entre dans `contracts/build.md`, chaque clause adossée à son test |
| **Deux décisions de règle d'Eric gravées** | Le Tilt côté cible (**+2, non cumulatif**) et sa composition avec le SRD (**une seule table**) |
| **Renommage `Auspicious (fh)`** | Nom **et** id — mesuré qu'aucun document ne l'ancrait encore |
| **Dates réalignées** | La dérive était de **deux jours** |

### ⚠️ DEUX DETTES DE CE MANDAT ÉTAIENT FAUSSES — la leçon la plus chère du jour

Elles avaient été **recopiées de passation en passation sans jamais être
remesurées**, et un lot a dû refuser de travailler pour que la seconde tombe.

1. **L'Épuisement** — annoncé « contradiction vive, le moteur applique −2 ».
   Sonde : SRD pur −2/degré, **couche FH −1/degré**, déjà câblé et déjà testé.
   La faute : lire la constante `SRD_EXHAUSTION_PER_LEVEL` (le **défaut avant
   surcharge**) comme la valeur appliquée.
2. **`GAP-BUDGET`** — annoncé non payé. `build.budgets` existe et est
   `required` depuis le 2026-08-08.

📌 **UNE DETTE RECOPIÉE N'EST PAS UNE DETTE VÉRIFIÉE.** Avant d'agir sur une
ligne de ce fichier, la remesurer. C'est la consigne qui aurait économisé le
plus de temps aujourd'hui.

### ⚠️ CE QUE CE SIÈGE DOIT ENCORE — **remesuré une par une le 2026-08-09**

> 📌 Chaque ligne porte la mesure qui la prouve, refaite ce jour-là. Une dette
> sans sa mesure est une rumeur : quand tu la reprends, refais-la.

1. ~~**La dérivation du pool de compétences**~~ ✅ **PAYÉE** — lot 23 fusionné
   (`a10858e`, 530 verts). Le module `fh.skills` publie `fh:skill-points` dans
   `resolved.stats[]` avec son détail.
2. **`state.character` : le document ou `resolved` ?** — et **la dette n°4 est
   la même réparation, pas une autre**. Mesuré : `session.mjs:1578` `open()`
   reçoit `character` d'un appelant ; `session.mjs:203` lit
   `ch.savingProficiencies` ; `index.mjs:130` `normalizeDestiny` lit
   `ch.destinyBuild.score`, puis `ch.build.destinyFeats.score`, puis `ch.pb` —
   **trois noms de champs v1 dans une seule fonction**, aucun au schéma
   `resolved`. **Aucun appelant de production.** ⚠️ Bloquante dès que
   l'interface ouvrira une séance. **Un lot, pas deux.**
3. **Le moment `mount` n'est invoqué nulle part** — remesuré : déclaré
   `sequence.mjs:48` ; les `run("…")` du dépôt sont `session-clear`, `reopen`,
   `result`, `pre-roll` ×2, `session-open`, `session-snapshot`. `run("mount")`
   n'apparaît **que dans un commentaire**. Vocabulaire mort (§0.6).
4. *(fusionnée dans la n°2 — c'est la même fonction.)*
5. **Le garde des copies** — remesuré : 22 cartes dans
   `layers/fh-arcana-en.layer.json`, 22 dans `fh-skills/fh-skill-builder.html`,
   et `tests/fh-arcana.test.mjs` ne compare la couche **qu'à elle-même**. Rien
   ne confronte les copies. Débloqué : il attendait le lot 21, fusionné.

### ⭐ TROIS LOTS DE CONTRAT NÉS DU CONSEILLER INTERFACE (2026-08-09)

Le conseiller `EXPERT interface Builder` a rendu son premier rapport, et il a
sorti **trois trous de contrat** que ce siège n'avait pas vus. **Les trois
mesures ont été refaites par l'architecte, les trois tiennent.** Les trois
lots sont courts, et **tous les trois coûtent nettement plus cher une fois le
builder écrit**.

| Lot | Mesure qui le motive | Statut |
|---|---|---|
| **Verbe de retrait `clear{path}`** | `block.mjs:127` `place()` pose ou remplace, **jamais ne retire** ; les cinq verbes sont `choose·set·override·rebuild·validate` ; `grep "clear\|remove\|unset\|delete" src/build/` → **zéro**. Sans lui, un joueur ne peut pas changer d'avis et un MJ ne peut pas **lever** une surcharge posée par erreur | ✅ **ACCORDÉ par l'architecte.** Les deux autres formes (`set{value:null}`, `choose{ref:null}`) sont écartées : elles entrent en collision frontale avec deux refus déjà écrits et testés |
| **`violations` en `{path, message}`** | 13 sites, tous des phrases françaises en gabarit ; le chemin fautif est **dans la prose**. Une interface devrait analyser du français pour poser une marque rouge au bon endroit | à trancher **avec Eric** : message, ou **clef + paramètres** (§0.13) ? Ça double le lot et ne se refait pas deux fois — ses diagnostics sont en français, sa table joue en anglais |
| **Attribution hors document** | ⭐ **La question que l'expert m'assignait, et la réponse est OUI** : `derive.mjs:1091-1096` calcule `base`, `dex` et `acBonus` — nommés, dans la même portée — puis les jette dans `resolved.ac = base + dex + acBonus`. La provenance existe une ligne avant d'être perdue. `rebuild` rend déjà cinq carnets hors document (`underived`, `unconsumed`, `shadowed`, `warnings`, `diff`) ; un sixième ne change pas la nature du verbe | prêt |

⚠️ **Séquencement** : le lot d'attribution vise `src/build/derive.mjs`, que le
lot 23 écrivait. Il est maintenant libre — mais le test d'Eric reste la règle :
*le prompt du lot cite-t-il un fichier qu'un autre lot est en train d'écrire ?*

📌 **Et un fait mineur, mesuré, à corriger en passant** : `resolved.required`
compte **21** clefs, `contracts/build.md:109` et `:383` disent « vingt ». Sans
danger — vérifié que le garde **lit le schéma**
(`tests/build-derive.test.mjs:48`) au lieu de compter 20 en dur. Trois mots.

### Ce qui attend une décision d'ERIC

| Sujet | |
|---|---|
| ⚠️ **76 lignes non commitées, retrouvées au ménage** | `sync_from_vault.py` est **modifié et non commité** depuis le 2026-07-27 dans `fh-phb/.claude/worktrees/youthful-taussig-bfa14e` : une fonctionnalité complète qui injecte le shell du site (feuille de style + barre de nav) sur les pages **builder** et **roller** publiées. **Ni commité, ni jeté — Eric décide.** Le worktree est laissé en place exprès, et le diff est sauvegardé en double dans le scratchpad de la session du 2026-08-09 |
| ~~Les imposés d'ESPÈCE se déduisent-ils du pool ?~~ | ✅ **TRANCHÉ PAR ERIC LE 2026-08-09, ET IMPLÉMENTÉ** *(lot 24)* — **dette périmée, recopiée de passation en passation, retirée le 2026-08-13.** Remesuré : `skill-pool.mjs:474-507` pose **deux** lignes, `+count × cost` puis `−count × cost`, avec le **même** `cost` (`tier_costs.imposed`, lu sur le record — `imposedCost()`, jamais en dur). **Net zéro par construction**, quel que soit le barème. ⭐ **L'argument, et il est bon** : convertir le don en points libres lui ferait **perdre sa restriction** — les 2 points de Keen Senses ne tirent que dans `{survival, delve, vigilance}`. Carnet vérifié sur 4 espèces : Human et Araag sont à **12** contre **10** pour Elf et Loroka, et l'écart vient **entièrement** d'`Educated` / `Fast Learner` (+2 au niveau 1), **pas** du don d'espèce |
| **`build.budgets` : on le garde ou on le retire ?** | Plus **aucun** consommateur connu depuis que le pool est parti dans `resolved.stats[]`. Champ `required` d'un **schéma public** : le retirer n'est pas le geste d'un lot. La loi §0.6 (pas de vocabulaire mort) dit de le retirer ; la prudence dit qu'un schéma public ne se rétrécit pas à la légère |
| **Le découpage du builder** | « Builder desktop complet » est un jalon, pas un lot. Recommandation de ce siège, **confirmée par le conseiller interface** : une première tranche qui fait **un personnage niveau 1 de bout en bout à l'écran**, et rien d'autre |
| **La « tranche 0 » proposée par le conseiller** | Une marche **avant** la tranche 1 : la fiche en **lecture seule**, une page qui défile, zéro onglet, zéro design — un instrument, pas une maquette. Elle mesure si le document **se regarde** (le M2 n'a prouvé qu'il se *construit*). ⚠️ Elle ne demande **aucun dessin à Eric** : le geste qu'on lui demandera est de **trier** devant la page (« ça reste visible, ça part derrière un onglet »), pas d'inventer une mise en page. Six rubriques de `resolved` n'ont aucune place dans le v1 : `speeds`, `senses`, `languages`, `currency`, `resources` — et **`stats`, celle qui porte le pool et le Score** |
| ~~Le conseiller « interface de builder »~~ | ✅ **Créé et il a rendu.** Trois trous de contrat, tous vérifiés justes. Fil : `EXPERT interface Builder` |
| ~~Le chiffre de l'Épuisement~~ | ✅ −1, et c'était déjà le comportement |
| ~~Le Tilt (DC, composition SRD)~~ | ✅ les deux tranchés |
| ~~`Auspicious (fh)`~~ | ✅ renommé. Le homebrew DDB garde l'ancien nom — **décision d'Eric, ne pas y revenir** : le canon est le dépôt |

### 📉 LE TAUX D'ERREUR DE CE SIÈGE, AUJOURD'HUI — et c'est lui le vrai signal

**Dix erreurs en une session.** Huit rattrapées avant publication, **deux
seulement par les lots eux-mêmes** :

- **Deux commandes de lot fausses** : le lot 21 a démenti « `state.character`
  est bien un `fh-char/1` » (une inférence présentée comme une mesure) ; le lot
  22 a démenti « aucun trou de contrat sur ta route » — j'avais vérifié qu'un
  champ **existe** sans vérifier qu'il est **écrivable**.
- **Trois sondes sur le mauvais objet** : la condition d'un `throw` recopiée
  sans ses sorties anticipées (elle annonçait un défaut grave inexistant) ;
  `vibrationFor` cherché sur le mauvais objet ; un `grep` du mot `document`
  qui est le mot du domaine ici.
- **Un faux positif de revue** : un test lu comme *supprimé* alors qu'il était
  *renommé* — il aurait accusé un lot d'avoir violé la loi §0.7.
- **Trois fautes d'outillage** : `git merge -F -` ne lit pas stdin (la fusion a
  échoué en silence, seule la re-mesure l'a vue) ; un message de commit amputé
  par des backticks non protégés ; un SHA de `fh-phb` publié pour `fhpc`.

📌 **La forme est toujours la même — mesurer le mauvais objet — et elle se
renouvelle indéfiniment.** La seule parade qui a marché à chaque fois :
**re-mesurer quand le résultat surprend, et montrer la mesure plutôt que la
conclusion.** C'est aussi pourquoi les quatre corrections apportées par des
lots sont des résultats et non des incidents : **la revue marche dans les deux
sens.**

## 5e. CE QUE LA SOIRÉE DU 2026-08-08 A APPRIS — à lire avant de reprendre

### ✅ PAYÉ LE 2026-08-08 — le genre `arcana` est ouvert (`fhpc` `d8273b9`)

`GAP-KIND` est **clos**, 440 tests verts, revérifiés dans un clone indépendant.
Ce qui suit est conservé parce que le raisonnement reste la meilleure
description de *pourquoi* c'était la pièce à poser en premier.

**Et l'ouverture a donné plus que prévu.** `$defs/kind` est référencé à **deux**
endroits de `fh-char/1` — `build.choices[].ref.kind` et
`resolved.stats[].breakdown[].source.kind`. Ouvrir le genre répond donc **aussi**
à « où vit l'Arcane du personnage ? » (`contracts/play.md` n°9, ouverte depuis
le lot 16), **sans un champ neuf** : la carte se pose comme l'espèce, la classe
et l'historique se posent déjà. Il ne reste **rien de contractuel** — du
contenu (la couche des 22 cartes) et de la dérivation.

⚠️ **Une collision a dû être arbitrée, et c'est la première exemption à une loi
qu'Eric a ratifiée.** Le garde §0.12 interdit le vocabulaire Fate's Hand dans
`src/layers/` et mord sur `"destiny"` nu comme sur `resolveArcana` — or
l'énumération fermée **exige** que `arcana` y soit écrit, sous garde de dérive.
Arbitrage : un nom de genre est une **clef de vocabulaire**, pas une mécanique ;
le critère de §0.12 (*« un personnage SRD pur traverse-t-il ce code ? »*) reste
vrai, le genre est un seau vide. Le masque ne retire que le genre **entre
guillemets**, sa liste est **lue dans le schéma**, sa portée est `src/layers/`
seul, et **il est attaqué**. Le MCP, lui, n'a reçu **aucune** exemption : sa
liste de genres était une copie du contrat qui avait déjà dérivé, elle est
retirée. **À revoir si Eric préfère un autre arbitrage — c'est un commit.**

⚠️ **Le genre `arcana` n'existait pas dans l'énumération fermée des genres**
(`fh-char.schema.json` et `fh-layer.schema.json`). C'était le trou `GAP-KIND`,
devenu bloquant : le lot 19 a dû **déclarer** l'impact de l'Arcane non
dérivable faute de pouvoir le lire.

**Or c'est le terme le plus important, mesuré sur les personnages réels d'Eric** :

| Fait mesuré | Chiffre |
|---|---|
| Personnages portant un Arcane | **7 sur 7** |
| Valeur de l'impact | **variable : 0, 1 ou 2 selon la carte** — jamais codable en dur |
| Personnages portant `Destiny Touched (fh)` (+2) | **5 sur 7** |
| Personnages portant sorts / rituels / craft / gear | **0 sur 7** ⚠️ mais le format v1 n'a **aucun champ** pour ça : l'absence ne prouve rien sur la table |

→ **Ouvrir le genre `arcana` est du contrat, donc le travail de ce siège**, et
il précède le lot des Arcanes. ✅ **Fait le 2026-08-08.**

📌 **Et une distinction que la mesure a rendue nette** : le don
`Destiny Touched (fh)` (+2, porté par 5 personnages sur 7) **n'a jamais été
bloqué par le schéma**. `feat` est un genre depuis le premier jour ; il ne
manquait qu'un *record*. Les deux moitiés du lot des Arcanes n'avaient donc
pas le même obstacle — une seule attendait du contrat.

### La source de vérité des Arcanes, triangulée

`~/tools/fh-skills/fh-skill-builder.html`, `const ARCANA` — **c'est l'outil que
la table utilise**, et il est confirmé par les personnages réels. Le chapitre du
site le répète à l'identique (22/22), et site et vault ne diffèrent que par la
syntaxe des liens. **Pas de conflit à arbitrer.** Voir kickoff §7, requalifié.

### Le verdict d'Eric sur ce qui attend, et ce qui n'attend pas

| Sujet | Verdict, et pourquoi |
|---|---|
| **22 Arcanes** | 🔴 **maintenant** — 7/7, valeur variable |
| **`Destiny Touched (fh)`** | 🟠 **maintenant**, ce don SEUL. Le catalogue complet avec filtrage est plus tard |
| **Battlefield** | 🟢 plus tard, **et sans doute jamais comme donnée** : tout se ramène à avantage/désavantage/+2, que le moteur a déjà |
| **Dark rituals · Soulforging** | 🟢 plus tard — 0/7, et `craft` attend déjà au schéma |
| **Sorts** | ⚠️ **indéterminé** : le format v1 ne portait pas les sorts, donc leur absence ne mesure rien. Les 339 sorts SRD sont dans la couche ; ce qui manque est le **chapitre 6** d'Eric |

### Les erreurs de mesure de ce siège — quatre en une soirée

Toutes rattrapées avant publication, **aucune sortie vers Eric comme un fait** —
mais le taux est le vrai signal, et c'est lui qui a motivé la passation :

1. Sonde MCP écrite avec les **mauvaises clefs `_meta`** → le serveur semblait
   en erreur. C'était la sonde.
2. Attaque d'un garde lancée sur **le mauvais fichier de suite** → verte, ce qui
   aurait accusé un lot à tort.
3. Lecture de `data.destiny` sur des records **`patch`**, qui portent leurs
   valeurs sous `changes` → « 9 espèces sans Base de Destinée », faux.
4. Attaque du garde de somme injectée dans **un terme du détail au lieu du
   total** → la somme restait cohérente, ce qui aurait dit « le garde ne couvre
   pas ce chemin ».

📌 **Les quatre sont la même faute** : mesurer le mauvais objet. C'est l'erreur
n°1 du §5c, et elle se reproduit sous des formes nouvelles à chaque fois. La
parade qui a marché à chaque coup : **quand une mesure contredit ce qu'on
attend, suspecter d'abord son propre protocole.**

---

### 🎉 Le M2 est complet, et le produit fait ce qu'il promet

> Un personnage de niveau 1 **se construit de bout en bout sans interface**, il
> **se pilote de l'extérieur par MCP**, il **se sauvegarde et voyage**, et il
> tourne **sur la vraie matière** — sans échafaudage.

Lots fusionnés depuis la version précédente de ce fichier : `8-srd-mecanique`,
`9-bloc-build`, `10-mcp-v0`, `11-srd-colonnes`, `12-build-gardes`,
`13-confrontation`, `14-bloc-doc`, `15-couche-fh-especes`,
`16-moteur-destinee`, `17-couche-fh-retrait`.

### ⭐ Et la couche Fate's Hand existe

**C'est la première fois que les règles d'Eric ne sont plus un document mais du
logiciel.** Les douze espèces, en anglais, par-dessus le SRD — `Splinter of
Anon`, `Twice-Born`, `Outlasting`, les Bases de Destinée, `Educated` et `Fast
Learner`. Le moteur plafonne le Score et la **Vibration**, perdue au portage,
est revenue. Et les couches savent enfin **retirer**.

**Décision de cadre d'Eric** : la couche FH est **publique**, les règles
actuelles sont publiques, rien de l'actuel n'est à vendre ; des aspects payants
viendront plus tard sous forme de contenu bloqué. **Sa table joue en anglais** —
le français viendra après coup.

---

## 5b. LA MÉTHODE QUI A PAYÉ — à reprendre telle quelle

Eric relit **ses propres chapitres** avec ce siège : l'architecte lit, rend sa
lecture **et ses doutes**, Eric corrige. Rendement mesuré sur trois chapitres :

- **huit corrections** aux chapitres d'Eric (portées en tâches, vault `0.TASKS/Tasks RPG.md`) ;
- **deux défauts réels dans le code** — le Score qui ne plafonnait rien, la
  Vibration perdue au portage ;
- **deux fausses alertes de l'architecte**, retirées après vérification.

📌 **Aucun des deux défauts n'aurait été trouvé en lisant le code seul, ni les
règles seules.** Il fallait les confronter. C'est le rendement le plus élevé de
tout le chantier, et il ne coûte que du temps de lecture.

⚠️ **Et un taux d'erreur de deux sur quatre, du côté de l'architecte.** C'est la
raison pour laquelle chaque mesure est **montrée** à Eric plutôt que résumée en
conclusion.

---

## 5c. LES TROIS ERREURS DE CE SIÈGE — les plus chères de la session

**Elles valent plus que les réussites : elles disent où ce siège dérive.**

1. **Une mesure faite sur le mauvais objet.** L'architecte a publié au board
   qu'une affirmation d'un lot était fausse, « vérifié de quatre façons ».
   Il cherchait le **nom d'une classe** — or une table de progression ne
   contient jamais le nom de sa classe, elle porte des **noms d'aptitude**. Sa
   frontière de mot excluait même « Bardic ». Quatre vérifications, toutes sur
   le mauvais objet, et une conclusion assurée publiée à Eric.
   → **Une mesure fausse est plus dangereuse qu'une absence de mesure : elle
   porte l'autorité d'un chiffre.**
2. **Une hygiène qui masquait un défaut.** Il n'a pas reproduit une instabilité
   de suite rapportée par un lot, parce qu'il remettait l'arbre propre entre ses
   passes. Le défaut était réel — une contamination **entre** exécutions.
   → **Quand une mesure contredit un rapport, suspecte d'abord ton protocole.**
3. **Deux lectures hâtives du domaine.** Il a pris « la vibration » pour une
   coquille de dictée (c'est un élément de premier rang des 22 Arcanes), et a
   écrit que la contribution de l'Arcane au Score n'était pas chiffrée (chaque
   carte porte son `Destiny Impact`).
   → **Le domaine d'Eric ne se devine pas. Aller lire vaut mieux que déduire.**

---

## 5d. CE QUE CE SIÈGE DOIT ENCORE — dettes annoncées et NON payées

1. ⚠️ **La révision du schéma.** Le **Score de Destinée** avec son détail de
   calcul (`GAP-DERIVED`) et **`build.budgets`** pour le pool de compétences
   (`GAP-BUDGET`). **Tant qu'elle manque, le Score existe dans le moteur mais
   PAS dans le document — il ne voyage donc pas avec le personnage**, et le
   plafond ne peut pas s'appuyer sur une valeur portée par la fiche.
   > 📌 Fait établi en lisant le chapitre 3 : **le Score n'est pas une formule
   > fermée.** Maîtrise + Base d'espèce + `Destiny Impact` de l'Arcane sont
   > chiffrés ; **l'arrière-plan et la Gloire/Damnation sont des décisions de
   > MJ**. Le Score est donc **largement dérivable, partiellement tenu** — il
   > lui faut une collection avec son détail, pas un champ.

   ### ⚠️ ET LA DETTE EST À TROIS MAILLONS, PAS UN — mesuré le 2026-08-08

   Écrire le schéma seul déplacerait le trou d'un cran. Les trois mesures, à
   refaire plutôt qu'à croire :

   | Maillon | Mesure | Qui |
   |---|---|---|
   | **Le schéma** | `fh-char.schema.json` : `stats` **0**, `budgets` **0**, `destiny` **0** occurrence (pour comparaison, `craft` et `resources` : 2 chacun) | contrat → **architecte** |
   | **La dérivation** | `grep -rn "destiny\|stats" src/build/` → **aucune ligne**, alors que `layers/fh-species-en.layer.json` porte déjà `data.destiny.base` par espèce (Araag = 2). Personne ne lit ce champ | un lot court |
   | **La porte du moteur** | `src/modules/fh/index.mjs:114-118` lit `character.destinyBuild.score` et `build.destinyFeats.score` — des **noms de champs v1** qu'aucun bloc n'écrit, présents seulement dans les harnais de test | le même lot |

   **Q15-8 est TRANCHÉE par Eric le 2026-08-08**, et `GAP-BUDGET` est donc
   débloqué : un personnage créé au **niveau 5** reçoit les paliers qu'il a
   **traversés** — +2 au niveau 1, +2 au niveau 3 — et **pas** celui du niveau
   6. `by_level` est cumulatif sur les niveaux ≤ niveau courant.

   **`GAP-DERIVED` attend l'EXPERT Fate's Hand** (question posée le
   2026-08-08, à sa demande explicite) : l'arrière-plan et la Gloire/Damnation
   sont-ils des **termes de la même somme**, ou d'une autre nature ? et la
   Gloire/Damnation **bouge-t-elle en cours de campagne** ?

2. ✅ **Le câblage MCP → `doc` — PAYÉ le 2026-08-08** (`fhpc` `15db710`, 415
   tests verts). Une IA **garde** un personnage, elle ne fait plus que le
   construire. Trois outils qui ne fabriquent rien et routent vers les verbes
   du lot 14 ; `src/mcp/` ne gagne pas une ligne de disque.
   > 📌 **La décision qui vaut d'être retenue** : *le catalogue décrit LE
   > SERVEUR, pas le dépôt.* Le magasin vient de `--store` et n'a aucun défaut
   > (décision D2) ; sans lui, le bloc `doc` n'est pas monté et ses outils ne
   > sont **pas publiés**. Publier `doc.save` sans pouvoir enregistrer
   > promettrait une porte qui n'ouvre sur rien — et **une IA lit un catalogue
   > comme un contrat**.

### Ce qui attend une réponse d'Eric

- La description de l'**Humain** a été corrigée **sans qu'il le demande** (la
  prose SRD décrivait `Resourceful`, que le lot retirait) — réversible.
- **« Forest Gnome » / « Rock Gnome »** survivent dans le texte du trait de
  lignage du Hoddon : dépend de ses sous-lignées, non tranchées.
- **`Ceremony` n'est pas au SRD** (vérifié sur 339 sorts) : Eric a tranché
  qu'un sort neuf sous un autre nom porterait l'effet — travail du chapitre des
  sorts.
- La **licence** de la couche FH, posée au plus strict en attendant.
- Les points ouverts du BRIEF §11 — **aucun ne bloque le 7 novembre**, et le
  n°1 (partage de homebrew) est **résolu** : le site d'Eric tient **une liste**,
  chacun héberge et décide de partager.

### La suite de la couche FH, avec Eric

Chapitre 4 (26 compétences, 4 paliers, pool par classe) · les 22 Arcanes · les
Tables de Fatalité. 📌 **Le contenu n'est pas le problème** — les Arcanes et les
Tables sont **déjà des données propres**. Ce sont les règles écrites nulle part
qui bloquaient, et une dizaine ont été réglées en une soirée.

**Calendrier** : 91 jours avant le 7 novembre au moment de cette passation, et
le M2 était planifié « début septembre ». L'avance est réelle.


## 6. Les conseillers — les consulter avant de deviner

Quatre sièges répondent à des questions et ne modifient rien (§8 du kickoff).
Retrouvables par leur titre, joignables par message.

| Conseiller | Titre du fil |
|---|---|
| Produit | `EXPERT produit` — **précède ce siège et en a suggéré la création** ; mandat : `CONSEILLER-PRODUIT.md` |
| SRD (règles + juridique) | `EXPERT conseiller SRD` |
| Fate's Hand | `EXPERT Fate's Hand system advisor` |
| VTT | `EXPERT  conseiller VTT` (deux espaces) |
| Interface Builder | `EXPERT interface Builder` — a rendu trois trous de contrat, tous vérifiés justes |
| **Esthétique** | ⭐ **créé le 2026-08-12, et il est d'une autre nature** : mandat `CONSEILLER-ESTHETIQUE.md`, **lancé comme sous-agent depuis le fil d'architecte** |

### ⚠️ Ce que « joignable » veut dire, et ce que ça change

**Mesuré le 2026-08-12 : les cinq premiers conseillers ne sont PAS joignables
depuis un fil d'architecte** (`ListAgents` → aucun agent). Ce sont des fils
d'Eric ; lui poser une question, c'est **le faire facteur** — ce que le §1 de ce
mandat interdit pourtant.

Le siège **esthétique** est le premier à casser ça : il se lance en sous-agent,
il répond dans ce fil, et son mandat vit dans le dépôt pour survivre à la session.
**C'est le patron à reprendre** quand un conseiller doit travailler avec
l'architecte plutôt qu'avec Eric.

### ✍️ Et un cinquième siège, créé le 2026-08-08 : `GHOSTWRITER`

**Il n'est pas un conseiller — il ÉCRIT.** Mandat : `GHOSTWRITER.md`. Sa mission :
faire entrer dans le TEXTE des règles les décisions ratifiées en fil d'architecte,
pour que le vault et le site publié disent enfin la même chose.

**Son périmètre, resserré par Eric le 2026-08-08 : le VAULT SEUL.** Il ne lance pas
`sync_from_vault.py`, ne construit pas le site, ne publie pas — il signale seulement
quelles pages publiées sont devenues en retard. La synchronisation reste le geste
d'Eric.

**Sa cadence, deux régimes** : *courant* (porter chaque décision dans le texte pendant
qu'elle est fraîche — prioritaire) et *rattrapage*, qui est une **FOUILLE** : Eric a
explicitement demandé qu'il aille chercher **ce qui a été décidé dans les fils
d'architecte précédents et n'est jamais arrivé dans `Tasks RPG.md`**.

⚠️ **Ce que ce siège-ci doit savoir de lui** : le **bloc canonique des compétences n'est
pas publié** — `grep -c "Revisited Skills" sync_from_vault.py` → **0**. Le site est
généré depuis `Skills & Tools — Player Guide.md`, pas depuis le canon. Corriger le canon
seul ne change donc rien pour la table. C'est le mécanisme qui a laissé le chapitre 4 se
contredire, et c'est pour ça que ce siège existe.

⛔ **Et le garde-fou qu'on lui a gravé** : une décision trouvée dans une transcription
mais dans aucun document durable **n'est pas canon** — les fils contiennent aussi ce
qu'Eric a **rejeté**. Il remonte, il n'écrit pas.

**Ils se sont payés en une séance** : les deux trous de contenu ci-dessus et le
piège `keepArcana` viennent d'eux, et l'architecte ne les avait pas vus en deux
jours. **Lire leurs réponses avant de refaire leur travail.**
