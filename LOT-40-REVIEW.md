# Lot 40 — `40-review`

> **[Sonnet · medium]** — le plus petit lot du chantier, et celui qui prouve le
> plus. Le rendu existe déjà et il est testé ; ce lot le **branche**.

**En clair : aujourd'hui on peut construire un personnage, mais on ne peut pas le
regarder.** L'étape *Review* est encore un texte de remplacement, alors que
`src/tools/render-fiche.mjs` sait rendre la fiche complète depuis des mois et
porte **27 tests**. Ce lot les met en présence. **Ce sera le premier moment où un
personnage se construit ET se regarde.**

**Worktree** : `~/tools/fhpc-worktrees/40-review`
**Branche** : `40-review`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`, attendu ≈ `cbfd853`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre** (attendu : **662**).

⛔ **Ne touche à AUCUN fichier de `src/`** — sauf **`src/tools/render-fiche.mjs`**,
et seulement pour le §3b. Si tu crois devoir toucher autre chose : **STOP, demande.**

---

## 0. ✅ CE QUI EXISTE DÉJÀ — mesuré le 2026-08-13, ne le refais pas

| | |
|---|---|
| `src/tools/render-fiche.mjs` | `render(document, report)` — **27 tests verts** dans `tests/render-fiche.test.mjs` |
| Ce qu'il rend | **les 21 rubriques obligatoires** de `resolved`, chaque valeur **avec son chemin**, chaque rubrique vide **avec la raison du moteur**, et `stats[]` **terme par terme** |
| Sa loi, déjà gardée | ⚔️ *« un total mensonger s'affiche MENTEUR »* — **l'écran ne recalcule pas**, il montre ce que le moteur dit |
| `ui/builder/engine.mjs` | monte les modules FH depuis le lot 38 : `resolved.stats` porte `fh:skill-points` **et** `fh:destiny` |

📌 **C'est exactement la « tranche 0 » que le conseiller interface recommandait** :
une page qui défile, **zéro onglet, zéro design** — un instrument, pas une maquette.

### 🔴 DEUX FAITS MESURÉS QUI CHANGENT LE TRAVAIL

**1. `render()` rend une CHAÎNE, pas des nœuds.**
Elle rend `<article class="fiche">…`. Or `skills-step.mjs` compose son arbre avec
`createElement`/`append`, et le banc `tests/dom-stub.mjs` **ne connaît pas
`innerHTML`**. ⚠️ **Mesure d'abord** comment injecter la chaîne sans casser le
banc, et **dis ce que tu as choisi**. Deux voies, à trancher par la mesure :

| Voie | Ce qu'elle coûte |
|---|---|
| `innerHTML` sur un conteneur, dans `shell.mjs` seul | le banc ne teste pas `shell.mjs` — donc rien à changer côté test, mais l'étape Review devient non testable par la fonction |
| une variante qui rend des **nœuds** | testable comme le lot 39, mais c'est du travail dans `render-fiche.mjs` |

⛔ **Ne choisis pas au goût. Mesure, puis dis pourquoi.**

**2. `render-fiche.mjs` est EN FRANÇAIS.** Il porte deux paquets de mots exportés,
`LIBELLES` et `MOTS`. Or **les mots d'interface du builder sont en ANGLAIS**
(arbitrage d'Eric, 2026-08-10 : sa table joue en anglais).

⚠️ **C'est le vrai contenu de ce lot, et le mécanisme existe déjà** : deux paquets
exportés, c'est exactement le patron de `src/labels.mjs` (*une règle nomme un id,
un paquet porte les mots, un id inconnu jette*). **Ajoute un paquet anglais, ne
traduis pas en place** — le français reste, il sert au rendu d'outil.

📌 **Loi §0.13** : *le moteur produit des identifiants, l'UI produit des mots.*

---

## 1. Les sources de vérité

| | |
|---|---|
| 🥇 Toute règle de jeu | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` — ⚠️ **ce lot n'en code aucune** |
| Les jetons et l'échelle | `ui/builder/tokens.css` — ⛔ **le garde `tests/ui-jetons.test.mjs` mord sur tout littéral** |
| Le design | vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md` |
| Ce que le lot 39 a laissé | `INVENTAIRE-LOT-39.md`, à la racine du dépôt |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md`.

---

## 2. ⛔ CE QUI EST TRANCHÉ

| | |
|---|---|
| **Zéro design sur cette étape** | une page qui défile, pas d'onglet. Le tri « ça reste visible / ça part derrière un onglet » est **un geste d'Eric**, plus tard, **devant la page** |
| **L'écran ne recalcule rien** | c'est la loi que les 27 tests gardent déjà. ⛔ Ne l'affaiblis pas |
| **Les mots d'interface sont en anglais** | Eric, 2026-08-10 |
| **Rien ne se cache** | une rubrique vide **dit sa raison**. ⛔ Pas de rubrique masquée « parce que c'est plus joli » |

---

## 3. Ce que tu construis

### 3a. L'étape *Review* rend la fiche

Dans `shell.mjs`, l'étape `review` cesse d'être un texte de remplacement et rend
`render(state.document, rapport)`. Le rapport de dérivation vient du même
`rebuild()` que le reste — ⚠️ **mesure d'où il sort exactement, ne le suppose pas.**

- ⚠️ **Si `state.document` est absent** (le moteur charge en tâche de fond),
  l'étape dit « chargement », comme l'étape Compétences le fait déjà.
- ⛔ **Aucun style neuf en dur** : la fiche prend les jetons du lot 38, ou elle
  reste nue. Le garde tranchera.

### 3b. Le paquet de mots anglais

Ajoute un paquet **anglais** à côté du français, sur le patron de `src/labels.mjs`.
⛔ **Ne traduis pas en place** et **ne supprime pas le français**.

⚠️ **Et le garde qui va avec** : *un identifiant sans mot dans le paquet doit
jeter*, jamais rendre un blanc ou l'identifiant nu. C'est déjà la discipline de
`labels.mjs` — reprends-la telle quelle.

### 3c. Le bouton final

Le dernier pas de la ceinture dit *« Open the sheet »* et ne fait rien. Fais-le
mener à l'étape Review. ⚠️ **Rien d'autre** — pas de sauvegarde, pas d'export :
ils appartiennent au bloc `doc` et à un autre lot.

---

## 4. Les tests

**On teste la fonction, pas la page.** Précédent : `tests/render-fiche.test.mjs`.

1. **Les 21 rubriques apparaissent**, et le compte est **lu dans le schéma**.
2. **Chaque mot anglais a son identifiant**, et un identifiant sans mot **jette**.
3. **Les deux paquets couvrent le même jeu d'identifiants** — le jour où l'un
   gagne une clef, l'autre rougit.
4. ⚔️ **L'ATTAQUE, et c'est la plus importante** : un `resolved.stats` **menteur**
   (un total qui ne fait pas la somme de son détail) **s'affiche menteur**.
   ⛔ Un écran qui recalcule masque les bugs du moteur.
5. **Une rubrique vide affiche sa RAISON**, jamais un blanc.
6. **Un personnage SRD pur** rend une fiche complète, sans une ligne de FH.
7. **Le garde du lot 38 reste vert.**

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test attendu
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs, verts au départ **et** à l'arrivée.
- `INVENTAIRE-LOT-40.md` : **la voie que tu as choisie pour injecter le rendu et
  pourquoi** (§0.1) · la liste des identifiants et leurs mots anglais · **ce que la
  fiche montre qui surprend** — tu seras le premier à la regarder pour de vrai ·
  ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le droit de la contredire.** Six lots de ce chantier ont corrigé leur
architecte par la mesure — le lot 38 a démontré qu'une piste de sa commande était
**impossible**, et a trouvé au passage une faute de l'architecte portant sur
**quatorze valeurs**. **C'est le comportement attendu, pas un incident.**
