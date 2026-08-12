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

### 3a. Le canal — ✅ ARBITRÉ le 2026-08-12

Un training s'achète, il ne se « monte » pas. **N'essaie pas de le faire entrer
dans `fh.skills.spend.<slug>`** : ce canal porte un **palier** en valeur, et un
training n'en a pas. Un canal qui accepterait `"proficient"` sur un objet sans
palier serait un mensonge de forme.

⭐ **ACCORDÉ : `fh.skills.train.<slug>`**, valeur booléenne ou absente. Tout
autre chemin de ce namespace reste un refus qui le **nomme**, comme `spend.*` le
fait déjà. Ce n'est plus une direction : c'est la forme retenue, tu peux coder.

### 3b. Le coût, dans le détail du pool

Un training acheté produit **une ligne nommée** dans le `breakdown` de
`fh:skill-points`, comme « Athletics · spent to proficient » aujourd'hui. Son
coût vient du **record**, jamais d'une table dans le code.

### 3c. Le verrou de niveau

Avant le niveau autorisé : **refus keyé**, avec la raison et le niveau requis
dans les `params` — l'interface doit pouvoir peindre un bouton éteint **et dire
pourquoi**, sans analyser une phrase. Même famille que `skill-spend.tier-locked`.

### 3d. Où un training vit dans `resolved` — ✅ ARBITRÉ le 2026-08-12

⛔ **Pas dans `resolved.skills[]` ni dans `resolved.tools[]`** — il n'a ni
palier ni bonus, et l'y mettre forcerait tout lecteur à tester un champ pour
savoir ce qu'il tient.

⭐ **ACCORDÉ : `resolved.traits[]`, avec un champ neuf `category: "training"`.**
Pas de rubrique neuve.

**Les trois raisons, dans l'ordre de leur poids :**

1. ⭐ **`resolved` est la fiche JOUABLE, pas l'historique des transactions.** Le
   prix est déjà tracé **deux fois** — la décision dans `build.choices[]`, la
   ligne de coût dans le `breakdown` du pool. Le remettre dans `traits[]` en
   ferait une **troisième copie**.
2. Une rubrique de plus ferait passer `resolved` de **21 à 22 clefs
   obligatoires**, que toute interface, tout export et tout lecteur MCP
   devraient désormais connaître.
3. Le contrat de `traits[]` dit **déjà** « Aptitudes, dons, traits d'espèce ».
   Un training rentre dans la phrase telle qu'elle est écrite.

**La forme du champ, précisément :**

| | |
|---|---|
| Nom | `category` |
| Obligatoire ? | **non** — les traits d'espèce restent sans catégorie |
| Valeurs | énumération **fermée**, **une seule** aujourd'hui : `training` |
| Type | un **identifiant**, jamais un mot affichable (§0.13). L'écran affiche « Apprentissages » |

⛔ **Ne catégorise PAS les traits existants.** Inventer une taxonomie qu'Eric n'a
pas demandée serait improviser (§0.10). Une valeur inconnue est un **rejet
bruyant** — `additionalProperties: false` gouverne déjà ces items.

📌 **Acheté ou octroyé : aucun champ de plus.** `traits[]` porte déjà `source`
(aujourd'hui « Elf » ; une maîtrise d'arme portera « Fighter »), et ce qui a été
*payé* se lit dans le carnet `decisions` et dans la ligne de coût.

### 3e. Le contenu initial

⛔ **La liste est à fournir par Eric, elle ne s'invente pas.**

✅ **Ce qu'Eric a tranché depuis la rédaction de cette commande** — la catégorie
`training` ne dit pas « payé », elle dit **« su, sans chiffre »** :

| Ce qui est un apprentissage | |
|---|---|
| armes exotiques · le Garrot (1 pt) | achetés |
| **maîtrises d'armes et d'armures** | ⭐ **octroyées, jamais achetées** — et mesuré : le moteur n'en porte **aucune** aujourd'hui, ni rubrique ni champ. Les loger ici évite **deux** rubriques de plus |
| Dark Rituals | achetés, barème par niveau — ⚠️ **hors périmètre de ce lot**, voir ci-dessous |

⚠️ **LES LANGUES FONT EXCEPTION — ne les déplace pas.** `resolved.languages[]`
existe déjà (`{id, name, note}`) et fonctionne. Le training est le **droit**
acheté ; la langue choisie reste dans `languages[]`. Y toucher mettrait la même
langue à deux endroits.

📌 **La cinquième colonne assemble donc TROIS rubriques** — `tools[]`,
`languages[]`, et les `traits[]` de catégorie `training`. C'est le travail de
l'écran, pas le tien.

⛔ **HORS PÉRIMÈTRE DE CE LOT** — tu poses le **mécanisme**, pas le contenu :
- **les Dark Rituals** — leurs prérequis nomment des sous-classes (`Moonkeeper`,
  `Land Druid`) et le genre `subclass` n'existe pas ; leur exécution est M4 ;
- **le Garrot gratuit au niveau 3** — il appartient à `Silent Blade`, non
  construite. Le training peut exister sans elle.

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

✅ **LES DEUX POINTS OUVERTS SONT ARBITRÉS** (2026-08-12) — la forme du canal
(§3a : `fh.skills.train.<slug>`, booléen) et l'emplacement dans `resolved`
(§3d : `traits[]` + `category` fermée). **Tu peux coder les deux.**

⛔ **Mais la règle ne change pas pour la suite** : toute décision que cette
commande ne couvre pas → **STOP, question à l'architecte**. Trois lots de ce
chantier ont corrigé leur architecte en refusant de deviner ; c'est le
comportement attendu, pas un incident.
