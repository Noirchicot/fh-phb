# Lot 37 — `37-pool-garde`

> **[Sonnet · medium]** — court, moteur seul, aucune donnée à régénérer. Le
> mécanisme de refus existe déjà et il est **mesuré** ; ce qui manque, ce sont
> **trois contrôles** qui ne sont écrits nulle part.

**En clair : aujourd’hui, un joueur peut dépenser des points qu’il n’a pas, et
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

→ **un refus keyé rendu par le MODULE fait échouer `validate()`.** Tu n'as donc
aucun canal à construire pour les §3a et §3b : `outcome.violations` → `derive.mjs`
→ `moduleViolations` → `build.validate`. Tout est en place.

⚠️ **Mais l'AUTRE canal, lui, est coupé** — et c'est le §3c. Un refus posé dans le
**carnet de décisions** (`decisions[].lock`) n'arrive **nulle part** : `validate()`
ne le lit pas. Deux canaux, un seul branché.

**Il manque donc les trois contrôles.**

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

### 2b. Où chaque contrôle vit — ⚠️ ARBITRÉ par l'architecte

**Deux contrôles dans le module, un dans `src/build/`. La frontière n'est pas un
goût, c'est la loi §0.12** — qui interdit le vocabulaire d'une mécanique de couche
dans **tout** fichier de `src/build/`, commentaires compris, et que
`tests/fh-skill-pool.test.mjs` garde **sur les octets**.

| Contrôle | Où | Pourquoi |
|---|---|---|
| **§3a** le pool négatif | `src/modules/fh/skill-pool.mjs` | juger un dépassement exige de lire `fh:skill-points` et `tier_costs` — du vocabulaire interdit à `src/build/` |
| **§3b** au moins un outil | idem | idem |
| **§3c** `validate()` lit les verrous | **`src/build/`** | un `lock` est un `{key, params, path}` **générique** (lot 27) : aucun nom de mécanique n'est prononcé, la loi n'est pas concernée |

📌 **C'est le test à appliquer chaque fois** : le code doit-il **nommer** une
mécanique de couche pour faire son travail ? Si oui → module. Si non → `src/build/`
a le droit, et c'est même là que ça doit vivre quand c'est générique.

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

### 3c. 🔴 `validate()` NE VOIT PAS LES VERROUS DU CARNET DE DÉCISIONS

> ⚠️ **CETTE SECTION A ÉTÉ RÉÉCRITE LE 2026-08-12, APRÈS MESURE.** Sa première
> version demandait d'**ajouter un plafond** au budget captif d'espèce. **C'était
> faux : le plafond existe déjà.** L'architecte avait conclu d'un
> `validate().ok === true` que le contrôle manquait, sans regarder le carnet.
> Conserve cette note : elle dit exactement comment on se trompe ici.

**Le vrai défaut est plus large et se répare plus haut.** Sonde réelle sur l'Elfe
magicien, `Keen Senses` = 2 points captifs, trois paliers pleins dépensés (coût 6) :

```
decisions[] :
  species.skillBudget   status=locked  answered=6/2
    lock = {"key":"skill-budget.overspent","params":{"spent":6,"points":2}, "path":"species.skillBudget"}

validate() : ok = true, violations = []
```

**Le refus est produit, keyé, correctement chiffré — et personne ne le lit.**
`decisions.mjs:251` le pose depuis le lot 34 ; `validate()` ne regarde que ses
propres contrôles et `moduleViolations`.

#### Ce que tu construis

**`validate()` remonte les verrous du carnet de décisions.** Générique : un `lock`
est déjà un `{key, params, path}` (lot 27) — **aucun vocabulaire de mécanique n'est
en jeu**, la loi §0.12 n'est pas concernée, et c'est une poignée de lignes.

⭐ **Et ça ferme bien plus que le budget captif.** Les mêmes verrous, aujourd'hui
tous invisibles à `validate()` : `skill-budget.option-unavailable`,
`skill-budget.tier-invalid`, et **tout verrou qu'un plan de décision posera à
l'avenir**. Un lot qui ajoute un verrou n'aura plus à se demander s'il est lu.

⚠️ **Deux choses à mesurer avant d'écrire, et à rapporter dans ton inventaire :**

1. **Y a-t-il des verrous que `validate()` ne DOIT pas remonter ?** Un plan
   simplement **incomplet** (une décision pas encore prise) n'est pas une faute —
   un personnage en cours de construction n'est pas invalide. Distingue
   `status === "locked"` (une **faute**) d'un simple `answered < expected`.
   ⛔ **Si la distinction n'est pas nette dans le code, ARRÊTE et demande.**
2. **Combien de tests existants basculent** quand `validate()` se met à voir ces
   verrous ? S'il y en a, ce sont des cas qui passaient à tort : nomme-les un par
   un dans ton inventaire plutôt que de les ajuster en silence.

✅ **Ce qui est déjà juste, ne le change pas** : le budget captif **ne touche pas**
`fh:skill-points` — mesuré, le pool principal reste à 10 pendant le dépassement.
C'est le contrat §4e (« un choix accordé par l'espèce est supplémentaire »).

---

## 4. Les tests — accept ET rejet pour chaque clause

1. Un pool dépensé **exactement à zéro** : `validate()` passe. *(La limite n'est
   pas une erreur.)*
2. **REJET** : un point de trop → **un seul** refus keyé, `validate().ok === false`.
3. Le refus **ne bloque pas la dépense** : après le refus, le palier acheté est
   bien appliqué dans `resolved` — c'est le comportement 2a, et il se teste.
4. Un personnage avec **un** outil à ½ : `validate()` passe.
5. **REJET** : aucun outil à un palier autre que `none` → refus keyé.
6. Un budget captif dépensé **dans son plafond** : `validate()` passe, et
   `fh:skill-points` **ne bouge pas d'un point**.
7. **REJET** : budget captif dépassé → **`validate()` remonte le verrou
   `skill-budget.overspent` qui existait déjà dans le carnet**, et le pool
   principal reste intact (les deux bourses ne se contaminent pas).
8. **REJET, et c'est le test qui prouve la généralité** : un slug hors de la liste
   captive pose `skill-budget.option-unavailable` dans le carnet → `validate()` le
   voit aussi, **sans une ligne écrite pour ce cas-là**.
9. Un plan simplement **incomplet** (une décision pas encore prise) **ne rend pas
   le document invalide** — un personnage en cours de construction n'est pas une
   faute.
10. Un personnage **SRD pur**, sans la couche FH : **rien ne change**, aucun de ces
    refus ne peut apparaître.

**Deux attaques manuelles minimum**, routine du dépôt : neutralise chaque garde,
vérifie que le test attendu **et lui seul** rougit, restaure, `diff` byte-à-byte,
suite complète rejouée.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs listés, verts au départ **et** à l'arrivée.
- `INVENTAIRE-LOT-37.md` : tes deux clefs neuves et leurs paramètres, le choix du
  chemin (ou de son absence) pour `skill-pool.overspent`, **l'arbitrage §3b répété
  en toutes lettres pour Eric**, la règle exacte que tu as retenue pour distinguer
  un verrou (**faute**) d'un plan incomplet (**pas une faute**), et **la liste
  nommée des tests existants qui basculent** — s'il y en a.
- `contracts/build.md` : les trois contrôles, chacun adossé à son test.
- ⛔ Aucun `git push`, aucune fusion, et **rien dans `ui/builder/`**.

⛔ **La règle qui ne change pas** : toute décision que cette commande ne couvre
pas → **STOP, question à l'architecte**. Quatre lots de ce chantier ont corrigé
leur architecte en refusant de deviner — dont le lot 35, qui a eu raison contre
sa propre commande. C'est le comportement attendu, pas un incident.
