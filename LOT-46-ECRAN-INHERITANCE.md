# Lot 46 — `46-ecran-inheritance`

> **[Sonnet · high]** — un écran, plus une pièce que tout le builder attend :
> **sa première boîte de confirmation**.

**En clair : l'étape Inheritance est la dernière des grandes étapes vides.** Le
moteur sait déjà tout faire — le lot 43 vient de le livrer. Cet écran n'a qu'à
lire le carnet et poser les verbes.

**Worktree** : `~/tools/fhpc-worktrees/46-ecran-inheritance`
**Branche** : `46-ecran-inheritance`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`, attendu ≈ `2a9d711`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre** (attendu : **740**).

⛔ **Tu écris dans `ui/builder/` et `tests/`, nulle part ailleurs.** Rien de `src/`,
`layers/`, `examples/`, `contracts/`, `schemas/`.

---

## 0. ✅ CE QUE LE MOTEUR PUBLIE DÉJÀ — sondé le 2026-08-13, ne le refais pas

Sur le personnage d'exemple, **sans aucun record d'arrière-plan choisi** :

| Plan | `expected` | `options` |
|---|---|---|
| `background` | 1 | **1** — le record d'Inheritance de la couche FH |
| `background.boost` | **3** *(des points, pas des caracs)* | **6** — les six caractéristiques |
| `background.boost.<clef>` | 1 | 6 |
| `background.originFeat[0]` | 1 | **5** dons d'origine |

**Les cinq dons** : `fh:feat:en:auspicious`, `srd:feat:en:alert`,
`srd:feat:en:magic-initiate`, `srd:feat:en:savage-attacker`,
`srd:feat:en:skilled`. ⛔ **Lis-les au plan**, jamais en dur.

📌 **Deux refus neufs existent** — `background.boost-cap-exceeded` et
`background.boost-total-mismatch`. Le moteur prononce, **tu affiches**.

### ⚠️ Le plan `background` à UNE option, et ce que j'en décide

Il porte `expected: 1, answered: 0, options: 1`. **En Fate's Hand il n'y a plus de
choix d'arrière-plan** *(Eric, 2026-08-13)* — ce record est le cadre de l'étape, pas
une décision du joueur.

⚖️ **Tranché : l'écran le POSE, en silence, et ne le montre pas comme un choix.**
Un sélecteur à une entrée est une fausse question. ⛔ **Mais ne le cache pas non
plus au sens de « rien à l'écran »** : le nom du cadre peut s'afficher comme un
titre ou une mention. **Dis ce que tu as fait et pourquoi.**

---

## 1. Les sources de vérité

| | |
|---|---|
| 🥇 La règle | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` **§4**, section *L'arrière-plan n'existe plus* |
| Les composants | `ui/builder/carnet.mjs` — `renderPicker`, `renderSlotQcm`, `renderRecordChoice` existent **déjà**. ⛔ Ne les recopie pas |
| Le patron d'écran | `ui/builder/class-step.mjs` et `species-step.mjs` (lot 42), `abilities-step.mjs` (lot 45) |
| Les jetons | `ui/builder/tokens.css` — le garde mord sur tout littéral |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md`.

---

## 2. Ce que tu construis

### 2a. L'étape *Inheritance*

1. **Le don d'origine** : les 5 options du plan, chacune avec son **nom** et sa
   **description** (lues par `query({kind:"feat", id})`). Un clic pose
   `choose({path:"background.originFeat[0]", ref})`.
   ⚠️ **`Magic Initiate` donne des sorts** — le chapitre 6 n'existe pas. Eric l'a
   laissé dans la liste en connaissance de cause. **Ne le traite pas à part.**
2. **Les bonus de caractéristiques** : **3 points** à répartir sur les **six**
   caracs, en **+2/+1 ou +1/+1/+1**. Chaque pose est un
   `set({path:"background.boost.<clef>", value})`.
   - le compteur montre **ce qui est posé sur 3**, lu au plan (`answered`/`expected`) ;
   - les deux refus du moteur s'affichent quand ils tombent — ⛔ **tu ne les
     recalcules pas, tu ne les préviens pas**. Le moteur prononce.
3. **Le score final se voit.** Le lot 45b a livré la cellule *Final* dans
   `abilities-step.mjs` : ici, poser +2 sur INT doit **montrer l'effet**.
   ⛔ **Lis `resolved.abilities[clef]`**, ne calcule rien.

### 2b. ⭐ LA CONFIRMATION — la première du builder, donc elle naît réutilisable

**Décision d'Eric, 2026-08-13** : quand on **change de classe**, les compétences
devenues invalides **s'effacent — après confirmation**.

Aujourd'hui elles restent, verrouillées avec leur refus *(choix de l'architecte à la
revue du lot 42 ; Eric a tranché autrement)*.

⛔ **Ne construis pas une boîte pour ce cas.** **Construis LE composant de
confirmation**, dans `carnet.mjs` ou un fichier voisin — **à toi de dire lequel et
pourquoi** — et sers-t'en pour ce cas-là. Le builder n'a **aucune** boîte de dialogue
aujourd'hui ; celle-ci sera copiée par les suivants. *(Même leçon que « le mode est
une liste, pas un interrupteur », lot 45.)*

**Ce qu'elle doit porter** : ce qui va être perdu, **nommément** (« Arcana,
Investigation »), pas un « êtes-vous sûr ? ». Un joueur doit pouvoir décider sans
deviner.

⚠️ **Le geste est dans `class-step.mjs`**, l'écran du lot 42 — c'est la seule
raison pour laquelle tu y touches. ⛔ **Rien d'autre dans ce fichier.**

📌 **La mesure qui te dit quoi effacer** : après un changement de classe, les
créneaux `class.skills[n]` dont le choix n'est plus dans `options` portent un `lock`
`decision.option-unavailable`. **C'est le carnet qui te les désigne**, pas une
comparaison que tu ferais toi-même.

---

## 3. Les tests

**On teste les fonctions, pas la page** — patron `tests/class-species-steps.test.mjs`.

1. **Les 5 dons viennent du plan** : un plan à 2 options affiche 2, pas 5.
2. **Les six caracs sont proposées** au boost, et le compteur lit `answered`/`expected`.
3. **Poser un boost appelle `set` sur le bon chemin**, et le document rendu par le
   verbe est celui qui repart au `rebuild`.
4. ⚔️ **Les deux refus du moteur s'affichent** — fabrique un plan verrouillé et
   vérifie que l'écran **montre le refus sans le reformuler**.
5. **Le score final affiché vient de `resolved`**, à l'octet — ⚔️ un `resolved`
   **menteur** s'affiche menteur.
6. **Le plan `background` à une option ne produit pas de sélecteur.**
7. ⭐ **La confirmation est un COMPOSANT** : testée seule, hors de tout écran, avec
   ses deux issues (confirmer / annuler).
8. **Annuler ne touche à rien** — ⚔️ l'attaque qui compte : après une annulation, le
   document est **identique à l'octet**.
9. **Confirmer efface exactement les choix verrouillés**, et **eux seuls**.
10. **Le garde des jetons reste vert.**

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test attendu
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

👀 **Sers le builder et REGARDE-LE.** `.claude/launch.json`, config `fhpc-builder`,
page `ui/builder/`. **C'est la pratique la plus rentable du chantier** : elle a
trouvé un défaut par lot aujourd'hui, dont deux qu'aucun test ne voyait.

---

## 4. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-46.md` : **où tu as mis le composant de confirmation et pourquoi** ·
  ce que tu as fait du plan `background` à une option · **ce qui t'a surpris en
  regardant l'écran** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** **Dix** lots l'ont fait, dont **les deux
d'aujourd'hui** : le lot 45 a démenti son propre en-tête après ma mesure, et le lot
43 a trouvé une troisième instance d'un défaut connu et **ne l'a pas corrigée** — il
l'a déclarée, en expliquant pourquoi elle sortait de son mandat. **Les deux gestes
sont exactement ce qu'on attend.**
