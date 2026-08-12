# Lot 42 — `42-ecrans-records`

> **[Sonnet · high]** — deux écrans, **zéro ligne de moteur**. Tout ce dont ils ont
> besoin est déjà publié par le carnet ; ce lot le lit et le dessine.

**En clair : aujourd'hui on peut répartir ses compétences, mais on ne peut choisir
ni sa classe ni son espèce.** Les étapes *Class* et *Species* sont encore des
textes de remplacement. Ce lot les construit, sur le patron exact de l'étape
Compétences du lot 39 — **le carnet publie déjà la liste des 12 classes, celle des
12 espèces, et les QCM qui suivent chaque choix.**

**Worktree** : `~/tools/fhpc-worktrees/42-ecrans-records`
**Branche** : `42-ecrans-records`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`, attendu ≈ `8f53c20`).
⚠️ *Le worktree et la branche sont **déjà créés** par l'architecte : tu travailles
dedans, tu ne les crées pas.*
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre** (attendu : **685**).

⛔ **Ne touche à AUCUN fichier de `src/`, ni à `layers/`, ni à `schemas/`.** Ce lot
est entièrement dans `ui/builder/` et `tests/`. Si tu crois devoir sortir de là :
**STOP, demande.**

---

## 0. ✅ CE QUI EXISTE DÉJÀ — mesuré le 2026-08-13, ne le refais pas

**Le carnet `decisions[]` publie le choix du record LUI-MÊME comme un plan**, avec
sa liste d'options. C'est la découverte qui rend ce lot petit : tu n'as aucune
liste à composer, aucun genre à interroger. Mesuré sur le personnage d'exemple :

| Plan | `expected` | `options` | `provenance.mode` |
|---|---|---|---|
| `class` | 1 | **12 classes** | — |
| `class.skills` | **lu sur le record** | la liste de la classe | `offered` |
| `class.skills[0]`, `[1]`… | 1 chacun | idem | `offered` |
| `species` | 1 | **12 espèces** | — |
| `species.skillBudget` | 2 | 3 compétences | `offered` |
| `species.skillBudget.<slug>` | 1 | les paliers | `offered` |
| `species.skills`, `species.skills[0]` | 1 | 26 compétences | `offered` |

Chaque plan porte aussi `selected[]`, `answered`, et `provenance {kind, id, field}`.
**L'étape Compétences les lit déjà** — `planAt(decisions, "class.skills")`,
`ui/builder/skills-step.mjs`. Reprends ce chemin, n'en invente pas un autre.

### 🔴 QUATRE FAITS MESURÉS QUI CHANGENT LE TRAVAIL

**1. ⛔ « les 2 compétences imposées de la classe » est FAUX pour quatre classes.**
Le document `FHV2 - Schémas d'écran.md` §4 le dit, et il a tort. Mesuré sur les
12 records :

| Classes | `skill_choice.count` |
|---|---|
| les 9 autres | 2 |
| **Bard** | **3**, et sa liste est `any` → **26 options** |
| **Ranger** | **3** |
| **Rogue** | **4** |

Le moteur, lui, est juste : `expected` vient du record. ⛔ **Ne code jamais `2`,
ni une longueur de liste, ni un `slice`. Lis `expected` et `options` du plan.**
⚔️ C'est l'attaque n°1 de ta suite.

**2. L'espèce a DEUX mécanismes de don, et un troisième état : rien.** Mesuré sur
quatre espèces — l'écran doit tenir les trois, et la commande ne te dit pas
lequel une espèce porte, **c'est le carnet qui le dit** :

| Espèce | Plan publié | Ce que ça veut dire |
|---|---|---|
| **Elf**, Elestu | `species.skillBudget` | **bourse captive** : 2 points sur 3 compétences nommées, palier au choix (sous-plans par compétence) |
| **Human**, Araag | `species.skills` | **un choix imposé** : 1 compétence parmi 26 |
| **Loroka**, et 8 autres | *(aucun)* | l'espèce ne donne rien → **l'écran n'affiche rien**, décision n°3 du schéma d'écran |

⛔ **Ne devine pas d'après le nom de l'espèce. Branche sur la présence du plan.**

**3. `applyDecisionAction` ne sait pas `choose`.** Mesuré, `ui/builder/shell.mjs` :
elle ne connaît que `set`, `clear` et `resetSkills`. Or poser un record est un
`choose({path, ref})`, pas un `set`. **Ajoute le cas `choose`** — même forme que
les autres : le verbe rend un `{document}`, c'est *celui-là* qui part au `rebuild`.

**4. ⛔ Le lignage est un PIÈGE — n'en fais pas d'écran.** Le personnage d'exemple
porte `species.lineage: "high-elf"`, et le moteur le rend **`unconsumed`**, avec
`underived.lineage-not-composed`. Personne ne le lit. Un QCM de lignage
afficherait un choix sans effet. **Si tu veux le montrer, montre-le comme le lot
40 montre une rubrique vide : avec la raison du moteur.** Jamais comme un choix.

---

## 1. Les sources de vérité

| | |
|---|---|
| 🥇 Toute règle de jeu | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` — ⚠️ **ce lot n'en code aucune** |
| La forme des écrans | vault `Chantier FH & FHPC/FHV2 - Schémas d'écran.md` §4 — ⚠️ **sauf son « 2 imposées », démenti ci-dessus** |
| Les jetons et l'échelle | `ui/builder/tokens.css` — ⛔ le garde `tests/ui-jetons.test.mjs` mord sur tout littéral |
| Le design | vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md` §2b l'échelle, §5b la palette |
| Le patron d'écran | `ui/builder/skills-step.mjs` et `tests/skills-step.test.mjs` |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md` (125 Ko, produit v1 gelé).

---

## 2. ⛔ CE QUI EST TRANCHÉ — ne le rouvre pas

| | |
|---|---|
| **Chaque source pose son choix chez elle** | décision n°3 du schéma d'écran : le QCM de classe vit à l'étape *Class*, celui d'espèce à l'étape *Species*. La grande grille de Compétences ne porte que le pool libre |
| **Le moteur prononce, l'écran affiche** | ⛔ aucune règle dans l'écran. Pas de coût recalculé, pas de compte en dur, pas de liste composée à la main |
| **Les mots d'interface sont en anglais** | Eric, 2026-08-10 — jusque dans les refus |
| **La base mobile est 360 px** | ⚠️ à ne pas confondre avec les 720 px de la coquille, qui sont un **seuil de bascule** |
| **Rien ne se cache** | une espèce sans don n'affiche rien ; un plan sans réponse le **dit** |
| **L'étape Inheritance n'est PAS dans ce lot** | elle change de nature (Eric, 2026-08-13 : plus de record d'arrière-plan du tout) et attend un lot moteur. ⛔ **N'y touche pas** |

---

## 3. Ce que tu construis

### 3a. `ui/builder/carnet.mjs` — le petit module partagé

`planAt` et `violationAt` sont aujourd'hui **privés** dans `skills-step.mjs`
(lignes 118 et 121). Trois écrans en ont besoin. ⛔ **Ne les recopie pas** — la loi
du chantier est que deux copies divergent sauf si quelque chose les compare.

Sors-les dans `ui/builder/carnet.mjs`, et fais-les importer par `skills-step.mjs`.
⚠️ **C'est la seule modification autorisée dans `skills-step.mjs`** : une
extraction, à comportement identique. Ses tests doivent rester verts **sans être
touchés** — c'est ta preuve que l'extraction est neutre.

### 3b. L'étape *Class*

1. **La liste** : les 12 options du plan `class`, chacune avec son nom. Le record
   sélectionné se lit dans `selected[]`. Un clic → `choose({path:"class", ref})`.
2. **Le QCM qui suit** : dès qu'une classe est posée, le plan `class.skills`
   apparaît. Affiche **`answered`/`expected`** et les `options` — ⛔ tous deux lus
   au plan. Un clic pose `class.skills[n]` par `set`.
3. **Ce qui se passe quand on change de classe** : mesure-le et **dis-le dans ton
   inventaire**. Les choix de l'ancienne classe survivent-ils ? Si oui, l'écran
   doit-il les nettoyer (`clear`) ou les laisser au moteur ? ⛔ **Ne tranche pas
   au goût — mesure, puis propose.**
4. **La matière de la décision** : le record porte `description`, `hit_die`,
   `primary_ability`, `saving_throw_keys`. Le schéma d'Eric prévoit deux boîtes,
   *technical info* et *lore info*. **Une seule suffit pour ce lot** — dis laquelle
   et pourquoi.

### 3c. L'étape *Species*

Même forme pour la liste (12 options, `choose`). Puis, **selon le plan publié** :

- `species.skillBudget` → la bourse captive : ses compétences, et pour chacune le
  sous-plan de palier (`species.skillBudget.<slug>`, options `half`/`proficient`).
  ⚠️ **Les trois compétences sont dans `options` — le builder v1 n'en montrait que
  deux et forçait le ½. C'est un bug de v1, pas la règle.**
- `species.skills` → le choix imposé, 1 parmi les options du plan.
- **aucun plan** → **rien**, pas même un cadre vide.

⚠️ **Le lignage ne se choisit pas** (§0.4).

### 3d. Le libellé de la ceinture

`shell.mjs:38` dit `Background`. **L'arrière-plan n'existe plus en Fate's Hand** :
mets `Inheritance`. ⛔ **Le libellé et rien d'autre** — l'étape reste un
placeholder, son écran appartient à un autre lot.

---

## 4. Les tests

**On teste les fonctions, pas la page** — précédent `tests/skills-step.test.mjs`,
qui tourne sur `tests/dom-stub.mjs` (⚠️ il ne connaît pas `innerHTML`).

1. **Le compte des choix de classe vient du plan** : monte un **Rogue** et vérifie
   que l'écran demande **4**, un **Bard** **3**, un **Wizard** **2**.
   ⚔️ **L'ATTAQUE n°1** : force `expected` à une valeur absurde dans un plan
   fabriqué — l'écran doit la suivre, **pas la corriger**.
2. **Les options viennent du plan**, jamais d'une liste locale : un plan dont les
   options sont `["zzz"]` affiche `zzz` et rien d'autre.
3. **Les trois états d'espèce** : bourse captive (Elf), choix imposé (Araag),
   rien (Loroka). Le troisième rend **un arbre vide**, pas un cadre.
4. **Les trois compétences de Keen Senses sont proposées** — Delve compris.
5. **Un plan non répondu se voit** (`answered < expected`), et le dit.
6. **`choose` passe bien par le verbe** : le document rendu par le verbe est celui
   qui repart au `rebuild`, jamais l'ancien.
7. **L'extraction de `planAt` est neutre** : les tests du lot 39 restent verts
   **sans une ligne modifiée**.
8. **Un personnage SRD pur** traverse les deux écrans sans une ligne de FH.
9. **Le garde des jetons reste vert** — aucun littéral de couleur ni de taille.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test attendu
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.
⚔️ **Attaque ce que tu n'as pas déjà attaqué** — attaquer son propre garde ne
prouve rien.

📌 **Le dépôt a un dépouilleur, `tests/source-scan.mjs`** — sers-t'en pour toute
mesure « combien de sites font X ». L'architecte a annoncé **56** sites là où il y
en avait **77**, en `grep`ant une seule orthographe.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs, verts au départ **et** à l'arrivée.
- `INVENTAIRE-LOT-42.md` à la racine du dépôt : **ce que tu as mesuré sur le
  changement de classe** (§3b.3) · quelle boîte d'info tu as retenue et pourquoi ·
  **ce qui t'a surpris en regardant l'écran** — 👀 sers le builder et **regarde-le**,
  le 2026-08-13 ça a trouvé trois défauts qu'aucune des 684 assertions ne voyait,
  dont une faute dans un garde · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** Huit lots de ce chantier ont corrigé leur
architecte par la mesure. Le **lot 41**, le 2026-08-13, est allé le plus loin : il a
**refusé d'écrire une ligne** et renvoyé sa mesure, en disant lui-même *« ce n'est
pas un ajustement de comptage, c'est un changement de taille du lot »* — **il avait
raison**. Le lot 38 avait démontré qu'une piste de sa commande était **impossible**,
et trouvé au passage une faute d'architecte portant sur **quatorze valeurs**.
**C'est le comportement attendu, pas un incident.**
