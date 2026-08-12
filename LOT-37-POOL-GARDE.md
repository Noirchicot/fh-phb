# Lot 37 — `37-pool-garde`

> **[Sonnet · medium]** — court, moteur seul, aucune donnée à régénérer. Le
> mécanisme de refus existe déjà et il est **mesuré** ; ce qui manque, ce sont
> **trois contrôles** qui ne sont écrits nulle part.

**En clair : aujourd'hui, un joueur peut dépenser des points qu'il n'a pas, et
rien ne le lui dit.** Le moteur applique la dépense, le pool passe en négatif, et
`validate()` répond `ok: true`. Ce lot ferme les trois fuites.

**Worktree** : `~/tools/fhpc-worktrees/37-pool-garde`
**Branche** : `37-pool-garde`, coupée de `main` **après la fusion du lot 36**
— remesure (`git -C ~/tools/fhpc rev-parse main`, attendu ≈ `f242f74`).
⛔ **Jamais `main`, jamais de `git push`.** **Départ : `npm test`, compte les
verts, écris le nombre** (attendu : **621**).

⛔ **Ne touche pas `ui/builder/`.** L'écran est le lot 39 et il a sa propre
commande. Ce lot ne pose **aucune règle dans l'interface** — c'est tout son but.

---

## 0. ✅ CE QUI EXISTE DÉJÀ — mesuré le 2026-08-12, ne le refais pas

**Le canal de refus fonctionne de bout en bout.** Sonde réelle sur le personnage
d'exemple, avec un slug inconnu :

```
moduleViolations : [{"key":"skill-spend.option-unavailable", …}]
validate.ok      : false
```

→ **un refus keyé rendu par le module fait échouer `validate()`.** Tu n'as donc
aucun canal à construire : `outcome.violations` → `derive.mjs` → `moduleViolations`
→ `build.validate`. Tout est en place. Il manque **les trois contrôles**.

---

## 1. La source de vérité

🥇 **`vault Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md`**, §5 dettes
**n°1, n°2 et n°7**. Lis-la avant de coder — c'est la règle d'ouverture du
chantier, sans exception.

---

## 2. ⛔ CE QUI EST TRANCHÉ — ne le rouvre pas

### 2a. Le comportement — ratifié par Eric le 2026-08-12

**Le dépassement est TOLÉRÉ pendant qu'on répartit, et REFUSÉ à la sortie.**

| | |
|---|---|
| Au clic | la dépense **est appliquée**. Le pool affiche `6 OVER` en rouge |
| À la sortie | **`validate()` refuse**, avec sa clef |

**Motif d'Eric, et il est ergonomique** : pendant qu'on répartit, on passe tout le
temps au-dessus avant de redescendre. Un refus dur au clic obligerait à **toujours
baisser avant de monter**. ⛔ **N'implémente pas un refus au clic.**

### 2b. Où le contrôle vit — ⚠️ ARBITRÉ par l'architecte

**Dans le module** (`src/modules/fh/skill-pool.mjs`), jamais dans `src/build/`.

Motif, et il n'est pas négociable : la loi **§0.12** interdit le vocabulaire d'une
mécanique de couche dans **tout** fichier de `src/build/`, commentaires compris — et
`tests/fh-skill-pool.test.mjs` la garde **sur les octets**. Juger un dépassement
exige de lire `fh:skill-points` et `tier_costs` : `src/build/` n'a pas le droit.

---

## 3. Ce que tu construis — trois contrôles

### 3a. Le pool ne peut pas finir en négatif

**Mesuré sur `main` le 2026-08-12** : huit dépenses `proficient` sur un pool de 10
donnent **−6**, **zéro violation**, `validate()` `ok: true`.

- Quand le total du détail (`resolved.stats['fh:skill-points'].value`) est
  **strictement négatif**, le module rend **un** refus keyé.
- **Un seul**, pas un par ligne : c'est le **total** qui est fautif, pas une
  dépense en particulier.
- Clef proposée : `skill-pool.overspent`, paramètres `{available, spent, over}`.
  Le libellé FR va dans `src/labels.mjs`, à côté des autres.
- ⚠️ **Le chemin de ce refus** : il n'y en a pas de bon — aucune dépense n'est
  « la » fautive. Rends-le **sans `path`** (le champ est facultatif au lot 27) et
  **dis-le dans ton inventaire**. Si tu penses qu'un chemin est meilleur,
  **demande** avant de choisir.

### 3b. Au moins un point en outils

**Mesuré** : le personnage d'exemple porte **0 outil** et `validate()` répond
`ok: true`.

- Le personnage doit porter **au moins un outil à un palier autre que `none`**.
- Clef proposée : `skill-pool.no-tool`, sans paramètre utile.

⚠️ **ARBITRAGE D'ARCHITECTE, à signaler à Eric et révocable par lui.** Les
addendums écrivent *« ≥ 1 point en outils **à la création** »*. **Le moteur ne voit
pas un moment, il voit un document.** Deux lectures possibles :

| Lecture | Conséquence |
|---|---|
| « seulement au niveau 1 » | un personnage créé directement au niveau 5 échappe à la règle |
| **« toujours »** ← retenu | la règle décrit une **propriété du personnage**, pas un instant |

**Applique la seconde**, et écris cet arbitrage en toutes lettres dans ton
inventaire pour qu'Eric puisse le renverser d'un mot.

### 3c. 🔴 LE BUDGET CAPTIF D'ESPÈCE N'A AUCUN PLAFOND — trouvé le 2026-08-12

**Ce troisième trou n'était connu de personne**, et il est de la même famille.
Sonde réelle sur l'Elfe magicien, `Keen Senses` = **2 points captifs** :

```
trois paliers PLEINS sur survival, vigilance et delve  →  coût 6 pour un budget de 2
moduleViolations : []
validate.ok      : true
```

- Le total dépensé sur `species.skillBudget.*` ne peut pas dépasser les `points`
  déclarés par `granted_skill_budget` du record d'espèce.
- Clef proposée : `species-budget.overspent`, paramètres `{budgetId, points, spent}`.
- ✅ **Vérifie et garde ce qui est déjà juste** : le budget captif **ne touche pas**
  `fh:skill-points` (mesuré : le pool principal reste à 10 pendant le dépassement).
  Ce comportement est **correct**, ne le change pas.

#### ⚠️ Le point qui demande une pièce neuve — ARBITRÉ, mais lis le motif

**Le module ne voit pas ces choix.** Ses `choices` sont bornés à son propre
namespace (`fh.skills.*`) — il **refuse** bruyamment tout autre `tail`. Or seul le
module a le droit de **chiffrer un palier** (`tier_costs`, §0.12).

**Arbitrage** : `derive.mjs` assemble les choix `species.skillBudget.*` et les tend
au module par une **entrée nommée de plus**, sur le modèle d'`imposedSkillSlugs`
(lot 34) :

```
capturedSpends: [ { slug, tier, path } ]
```

`derive.mjs` ne fait que **transporter** — il ne chiffre rien, il ne nomme aucune
mécanique, et `species.skillBudget` est un chemin qu'il connaît déjà
(`decisions.mjs` le traite depuis le lot 34). La loi tient.

⛔ **Si cette forme ne suffit pas à ton implémentation, ARRÊTE et demande.** Ne
l'élargis pas de ton propre chef : une entrée de module est du contrat.

---

## 4. Les tests — accept ET rejet pour chaque clause

1. Un pool dépensé **exactement à zéro** : `validate()` passe. *(La limite n'est
   pas une erreur.)*
2. **REJET** : un point de trop → **un seul** refus keyé, `validate().ok === false`.
3. Le refus **ne bloque pas la dépense** : après le refus, le palier acheté est
   bien appliqué dans `resolved` — c'est le comportement 2a, et il se teste.
4. Un personnage avec **un** outil à ½ : `validate()` passe.
5. **REJET** : aucun outil à un palier autre que `none` → refus keyé.
6. Un budget captif dépensé **dans son plafond** : passe, et `fh:skill-points`
   **ne bouge pas d'un point**.
7. **REJET** : budget captif dépassé → refus keyé, et **le pool principal reste
   intact** (les deux bourses ne se contaminent pas).
8. Un personnage **SRD pur**, sans la couche FH : **rien ne change**, aucun de ces
   trois refus ne peut apparaître.

**Deux attaques manuelles minimum**, routine du dépôt : neutralise chaque garde,
vérifie que le test attendu **et lui seul** rougit, restaure, `diff` byte-à-byte,
suite complète rejouée.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs listés, verts au départ **et** à l'arrivée.
- `INVENTAIRE-LOT-37.md` : tes trois clefs et leurs paramètres, le choix du
  chemin (ou de son absence) pour `skill-pool.overspent`, **l'arbitrage §3b
  répété en toutes lettres pour Eric**, et la forme exacte de `capturedSpends`
  telle que tu l'as implémentée.
- `contracts/build.md` : les trois contrôles, chacun adossé à son test.
- ⛔ Aucun `git push`, aucune fusion, et **rien dans `ui/builder/`**.

⛔ **La règle qui ne change pas** : toute décision que cette commande ne couvre
pas → **STOP, question à l'architecte**. Quatre lots de ce chantier ont corrigé
leur architecte en refusant de deviner — dont le lot 35, qui a eu raison contre
sa propre commande. C'est le comportement attendu, pas un incident.
