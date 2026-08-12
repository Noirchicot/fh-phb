# Lot 36 — `36-trainings`

> **[Sonnet · high]** — un genre neuf entre dans la pile, et une troisième
> famille se met à dépenser le pool. Le contrat est ouvert **avant** toi par
> l'architecte ; ce qui reste est un canal, une contrainte de niveau et du
> contenu.

**En clair : le pool d'Eric ne paie pas deux familles, mais trois.**
À côté des compétences et des outils, il achète des **Trainings** — une langue
de plus, une arme exotique, le Garrot. Ils n'ont **ni palier ni bonus** : ils
débloquent, ils ne bonifient pas.

**Worktree** : `~/tools/fhpc-worktrees/36-trainings`
**Branche** : `36-trainings`, coupée de `main` **après la fusion du lot 35** —
remesure (`git -C ~/tools/fhpc rev-parse main`).
⛔ **Jamais `main`, jamais de `git push`.** **Départ : `npm test`, compte les
verts, écris le nombre.**

⚠️ **Séquentiel derrière le lot 35** : les deux écrivent
`src/modules/fh/skill-pool.mjs` et régénèrent `layers/fh-skills-en.layer.json`.
Ne démarre pas avant que 35 soit **fusionné**.

---

## 0. ✅ CE QUI EST DÉJÀ FAIT — ne le refais pas

**Le genre `training` est OUVERT** — commit `56ea9d1` sur `main`, **614 verts**.
Ouvrir un genre est du contrat, donc le travail de l'architecte (précédent
`arcana`, 2026-08-08). Les trois endroits sont traités, **dans un seul commit**
parce qu'un garde compare le code et le schéma mot pour mot :

| Où | État |
|---|---|
| `schemas/fh-char.schema.json` `$defs/kind` | ✅ **16** genres, `training` entre `tool` et `weapon` |
| `schemas/fh-layer.schema.json` `records.properties` | ✅ la même liste, même ordre |
| `src/layers/document.mjs` `GENRES` | ✅ alignée — `tests/layers-document.test.mjs` compare les deux |

**Trois tests neufs le prouvent, et ils ont été attaqués** : un personnage peut
DIRE quel training il a (`build.choices[].ref.kind`), la ligne de dépense du pool
peut le CITER (`resolved.stats[].breakdown[].source.kind`), et `trainng` reste un
rejet bruyant des deux côtés. Refermer le genre fait rougir l'acceptation ;
désaligner les deux listes fait rougir la dérive.

📌 `src/tools/gen-srd-layer.mjs` garde **sa propre liste de 14** et ne doit
**jamais** recevoir `training` : un générateur SRD qui produirait un genre FH
mélangerait les deux couches (loi §0.12). **Vérifié après l'ouverture** — il en
a toujours 14.

⚠️ **Autre chose a bougé après la rédaction de cette commande** : le
`tool_choice` du **Soldier** est éteint (`d824599`). Plus **aucun** arrière-plan
ne donne ni n'offre d'outil, et **aucune source d'outil ne subsiste au niveau 1
hors du pool**. Si un de tes tests a besoin d'un outil possédé, il doit
l'**acheter**.

**Ligne de départ à remesurer** : `main` valait `56ea9d1` et **614 verts**.

---

## 1. La source de vérité

1. 🥇 **`vault … FHV2 - ADDENDUMS (source n°1).md` § *Les TRAININGS*** — la règle
   complète, et rien d'autre ne la porte.
2. `contracts/build.md` § *THE SKILL POOL* et § *LOT 34*.
3. `INVENTAIRE-LOT-34.md` §1 — la frontière §0.12 sur les octets.

---

## 2. ⛔ Ce qui est tranché

| | Décision d'Eric |
|---|---|
| Coût | **variable, 1 point ou plus** — porté par le record, jamais en dur |
| Palier | **aucun** — un training est acquis ou non. Ni demi, ni plein, ni expertise |
| Bonus | **aucun** — il ne modifie aucun jet |
| Niveau | **à partir de 4**, puis tous les 4 — **sauf dérogation** portée par un feat, une classe, une espèce ou une sous-classe |
| Affichage | cinquième colonne, **Tools & Trainings** |

⭐ **La contrainte de niveau a exactement la forme d'`expertise_from_level`** :
une valeur **lue dans le contenu**, jamais figée dans le moteur. Écris-la comme
telle — c'est ce qui permettra à `Silent Blade` de donner le Garrot au niveau 3
sans toucher une ligne de code.

---

## 3. Ce que tu construis

### 3a. Le canal

Un training s'achète, il ne se « monte » pas. **N'essaie pas de le faire entrer
dans `fh.skills.spend.<slug>`** : ce canal porte un **palier** en valeur, et un
training n'en a pas. Un canal qui accepterait `"proficient"` sur un objet sans
palier serait un mensonge de forme.

**Propose ta forme et fais-la valider** avant de coder — c'est un point de
contrat. La direction de l'architecte : un chemin propre au module,
`fh.skills.train.<slug>`, valeur booléenne ou absente ; le refus est nommé pour
tout le reste, comme `spend.*` le fait déjà.

### 3b. Le coût, dans le détail du pool

Un training acheté produit **une ligne nommée** dans le `breakdown` de
`fh:skill-points`, comme « Athletics · spent to proficient » aujourd'hui. Son
coût vient du **record**, jamais d'une table dans le code.

### 3c. Le verrou de niveau

Avant le niveau autorisé : **refus keyé**, avec la raison et le niveau requis
dans les `params` — l'interface doit pouvoir peindre un bouton éteint **et dire
pourquoi**, sans analyser une phrase. Même famille que `skill-spend.tier-locked`.

### 3d. Où un training vit dans `resolved`

⛔ **Pas dans `resolved.skills[]` ni dans `resolved.tools[]`** — il n'a ni
palier ni bonus, et l'y mettre forcerait tout lecteur à tester un champ pour
savoir ce qu'il tient. **Propose l'emplacement à l'architecte** : c'est une
rubrique de `resolved`, donc du contrat. Regarde d'abord si `resolved.traits[]`
ou `resolved.resources[]` disent déjà ce qu'il faut, avant de demander une
rubrique neuve — §0.6, pas de vocabulaire mort.

### 3e. Le contenu initial

⛔ **La liste est à fournir par Eric, elle ne s'invente pas.** Ce qui est connu
au moment de la rédaction : **une langue supplémentaire (1 pt)**, **les armes
exotiques**, **le Garrot (1 pt)**.

⚠️ Deux réserves mesurées, à porter à l'architecte plutôt qu'à trancher :
- **il n'existe aucun genre `language`** dans la pile — une « langue
  supplémentaire » ne se résout aujourd'hui contre rien, et `languages[]` du
  document est un choix libre de slug ;
- **le Garrot appartient à `Silent Blade`**, une sous-classe qui n'est pas
  construite et dont le genre n'est pas ouvert. Le training peut exister sans
  elle — mais la gratuité au niveau 3 attendra.

---

## 4. Les tests — accept ET rejet pour chaque clause

1. Un training acheté au niveau 4 : le pool baisse de son coût, une ligne nommée
   apparaît, le training est publié dans `resolved`.
2. **REJET** : le même achat au niveau 3 → refus keyé portant le niveau requis.
3. **Dérogation** : un contenu qui abaisse le niveau autorisé le fait passer —
   sans une ligne de moteur en plus.
4. **REJET** : un slug inconnu du genre `training` → refus nommé.
5. **REJET** : une valeur de palier (`"proficient"`) sur le canal des trainings
   → refus nommé, pas une acceptation silencieuse.
6. Un training **ne modifie aucun jet** : `resolved.skills[]` et
   `resolved.tools[]` sont **identiques** avec et sans lui.
7. Le garde des 16 genres mord : un `trainng` mal orthographié est un rejet
   bruyant, dans le schéma **et** dans `GENRES`.

**Deux attaques manuelles minimum**, routine du dépôt : casse le garde, vérifie
que le test attendu **et lui seul** rougit, restaure, `diff` byte-à-byte, suite
complète rejouée.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs listés.
- `INVENTAIRE-LOT-36.md` : tes arbitrages, la forme du canal telle qu'accordée,
  l'emplacement dans `resolved` et son motif, les verts au départ et à l'arrivée.
- `contracts/build.md` : la troisième dépense du pool, sa forme, son verrou.
- ⛔ Aucun `git push`, aucune fusion, **et ne touche pas `ui/builder/`**.

**Deux points de cette commande sont explicitement ouverts** — la forme du canal
(§3a) et l'emplacement dans `resolved` (§3d). **Fais-les valider, ne les
tranche pas seul.** Trois lots de ce chantier ont corrigé leur architecte en
refusant de deviner ; c'est le comportement attendu.
