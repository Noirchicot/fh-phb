# Lot 24 — `24-feat-skill-points`

> **[Sonnet · high]** — spécification fermée, précédent existant à copier
> (`destiny-stat.mjs`). Le `high` n'est pas pour le code, il est pour les
> **attaques** : la table en dur du lot 23 passait cinq tests sur cinq.

**En clair : un don d'origine doit pouvoir donner des points de compétence, et
aujourd'hui il ne peut pas.** Eric a ratifié l'algorithme complet du pool le
2026-08-09 ; le lot 23 en a livré tout sauf ce terme-là. Tu ajoutes le canal,
tu poses la valeur d'un seul don dans la couche, et tu rends visibles deux
lignes qui manquent au détail.

**Worktree** : `~/tools/fhpc-worktrees/24-feat-skill-points`
**Branche** : `24-feat-skill-points`, coupée de `main` = `6afa930`
*(recalée : `a10858e` ne portait pas encore la section du contrat que tu dois lire)*
⛔ **Tu ne touches JAMAIS `main`, et tu ne pousses RIEN** — ni ta branche, ni
quoi que ce soit. Tu commites en local, l'architecte fusionne, Eric pousse.
`npm install` est déjà fait dans le worktree (ajv 8.20.0).
**Ligne de départ à vérifier avant d'écrire une ligne : `npm test` → 530/530.**

---

## 1. Lis ça d'abord, et rien d'autre

| Fichier | Pourquoi |
|---|---|
| `contracts/build.md` § **⭐ THE SKILL POOL** | **L'algorithme ratifié par Eric.** C'est ta spécification, il n'y en a pas d'autre |
| `src/modules/fh/skill-pool.mjs` | le module que tu étends (lot 23) |
| `src/modules/fh/destiny-stat.mjs`, fonction `featLines` | **le précédent exact** : un module qui lit déjà un feat par `refs` |
| `tests/fh-skill-pool.test.mjs` | la suite que tu étends |

⛔ N'ouvre pas `COMPANION-BUILD-PLAN.md` (125 Ko, produit v1 mort).

---

## 2. Ce que tu construis

### 2.1 Le canal — un origin feat peut porter des points

**Le canal de transport existe déjà et il est prouvé** : `derive.mjs` tend
`refs` au module — chaque choix porteur d'un `ref` hors de son namespace, avec
son `kind` et son record aplati. `destiny-stat.mjs` y lit déjà les feats
(`featLines`). Tu n'ouvres donc **aucun** canal neuf : tu ajoutes un terme qui
lit `refs` filtré sur `kind === "feat"`.

Le record de feat porte la valeur. **Nom du champ : à toi de le proposer**, en
suivant la convention du voisin (`destiny-stat` lit `data.<CLEF>` sur le feat).
Cohérence attendue avec `data[fh_skill_pool]` côté classe et `data[skill_points]`
côté espèce — **dis dans ton inventaire lequel tu as choisi et pourquoi**.

### 2.2 Le contenu — `Skilled` vaut +6, et lui seul

Dans la couche FH (`layers/fh-feats-en.layer.json`), un `patch` sur
`srd:feat:en:skilled`.

**Pourquoi 6, et c'est mesuré, pas décidé par toi** : le feat donne *« three
skills or tools of your choice »*, et `tier_costs.proficient` vaut 2 sur les
douze classes. 3 × 2 = 6. **Parité exacte avec le SRD.**
⛔ **Aucun autre feat.** Eric a dit « y'aura d'autres origin feats un jour » —
un jour n'est pas aujourd'hui (loi §0.10).
⛔ **`Skilled` n'impose rien** : vérifié dans son texte SRD (*« of your
choice »*) et confirmé par Eric. Il donne des points, il ne place rien.

### 2.3 Les deux lignes « net zero » des granted choices

L'algorithme d'Eric dit qu'un grant d'espèce (`granted_skill_choice`) **se
rajoute au pool** *puis* **se place**. Net zéro sur le total — **le nombre
publié aujourd'hui est donc déjà juste** — mais le détail doit montrer les
**deux** lignes : le grant qui entre, le placement qui sort.

⚠️ **C'est un changement d'AFFICHAGE, pas d'arithmétique.** Si ton total bouge,
tu as un bug. Un test doit le verrouiller explicitement.

Ça remplace la déclaration `stats[fh:skill-points].imposed.species` que le lot
23 avait posée : la question est tranchée, la déclaration n'a plus lieu d'être.

⛔ **Un grant restreint reste un grant.** Le `Keen Senses` de l'Elestu tire dans
`{survival, delve, vigilance}` ; un point est dépensable partout. Tu ne
convertis **jamais** un grant en points — ça effacerait la restriction.

---

## 3. Les tests d'acceptation — cinq, plus tes attaques

1. **Un Human Wizard 1 avec `Skilled` publie 15**, et son détail porte une
   ligne `Skilled +6` **nommée**. Sans le feat : 9.
2. **Un Human Rogue 1 avec `Skilled` publie 19.** (base 18 + Educated 2 +
   Skilled 6 − 4 class − 3 background.)
3. **Le grant d'espèce est net zéro** : l'Araag et un Human de même classe
   diffèrent **du seul bonus de trait**, et le détail de l'Araag porte bien
   **deux** lignes de plus (grant +1, placement −1), pas zéro et pas une.
4. **Un feat sans le champ ne casse rien** : les 16 autres feats SRD traversent
   le module sans terme et sans déclaration bruyante — un feat muet est normal.
5. **Un feat qui annonce une valeur illisible JETTE** (pas de repli silencieux,
   loi §0.5) — même exigence que `destiny-stat` sur `data.<clef>.bonus`.

### Les attaques, et elles comptent autant

- ⛔ **Le 6 doit venir du record.** Attaque obligatoire : change la valeur
  **dans la couche** et exige que le total suive. *C'est l'attaque qui a sauvé
  le lot 23* — avec les douze pools écrits en dur, ses cinq acceptations
  restaient vertes.
- **Attaque le net zéro** : fais coûter le grant, vérifie qu'un test rougit.
- **Vocabulaire (§0.12/§0.13)** : aucun nom de compétence, d'outil ou de feat
  dans `src/`. Le nom affiché vient du **record**, la phrase de `labels.mjs`.
- **Restaure l'arbre après chaque attaque** et prouve-le par `git status`.

---

## 4. Ce qui te ferait STOPPER, et c'est légitime

Si l'algorithme du contrat te paraît faux, ou si une valeur que tu dois écrire
n'est dérivable d'aucune donnée : **tu déclares et tu remontes, tu n'inventes
pas** (loi §0.10). Trois lots d'affilée ont corrigé ce siège en refusant une
prémisse fausse, et ils avaient raison les trois fois. **Une commande n'est pas
une vérité** — si une de mes affirmations ne survit pas à ta mesure, dis-le,
montre la mesure, et c'est un résultat, pas un incident.

## 5. Ce que tu livres

- Tes commits, **en local**, message par **heredoc ou fichier** — jamais
  `-m "…"` : le shell mange les backticks.
- `INVENTAIRE-LOT-24.md` : ce que tu as livré, le nom de champ que tu as choisi
  et pourquoi, **tes attaques avec ce qui a rougi**, et ce que tu n'as pas
  tranché.
- La suite complète rejouée à l'arrivée, arbre propre.
