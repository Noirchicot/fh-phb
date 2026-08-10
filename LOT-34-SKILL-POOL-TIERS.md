# Lot 34 — `34-skill-pool-tiers`

> **[Sonnet · high]** — le plus gros changement de moteur depuis le pool
> lui-même : un contrat public change de forme, `derive.mjs` écrit un palier
> qu'il n'a jamais écrit, et l'algèbre du « net zéro » devient un placement
> sur grille. Volume moyen ; enjeu maximal — c'est LA mécanique sur laquelle
> tout le builder repose.

**En clair : le moteur sait dire « ce compétence est maîtrisée ou pas ».**
Fate's Hand a QUATRE paliers (aucun/demi/plein/expertise), un pool qu'on
DÉPENSE ligne par ligne, et des acquis qui sont des **planchers montables**,
pas des déductions invisibles. Rien de tout ça n'existe encore côté écriture.
Tu l'ouvres.

**Worktree** : `~/tools/fhpc-worktrees/34-skill-pool-tiers`
**Branche** : `34-skill-pool-tiers`, coupée de `main` — **remesure-le**
(`git -C ~/tools/fhpc rev-parse main`).
⛔ **Jamais `main`, jamais de `git push`.** **Départ : `npm test` → tout vert,
compte-le et écris-le dans ton inventaire.**

---

## 1. La source de vérité, dans l'ordre où la lire

1. `contracts/build.md`, section **« ⭐ THE SKILL POOL »** (ratifiée
   2026-08-09) — l'algorithme canonique, cité mot pour mot d'Eric. **Lis-la
   en entier avant d'écrire une ligne.**
2. `~/tools/fh-skills/fh-skill-builder.html` — **la référence sur le
   FONCTIONNEMENT** (grille, planchers, coûts, avertissements), **pas sur
   les chiffres** : plusieurs constantes y sont périmées (voir §3).
3. Ce fichier, pour les écarts déjà tranchés entre les deux.

## 2. ⛔ Le modèle est TRANCHÉ — ne le rouvre pas

**Un imposé est une case POSÉE sur la grille, à son palier, coût couvert —
jamais une soustraction invisible du total.** C'est la phrase d'Eric,
recopiée dans le contrat : *« tu **places** les points imposés par certains
traits ou feats »*. Le « net zéro » du lot 24 n'est pas un modèle
concurrent : c'est la **comptabilité** de ce placement (le pool grossit du
grant, le placement le reprend, total inchangé). Tu gardes le total, tu
changes ce qui est VISIBLE et MONTABLE.

Conséquence directe et non négociable : **une ligne imposée doit pouvoir
être montée au-dessus de son plancher** par le joueur (demi → plein, par
exemple), au coût de la différence. C'est le seul comportement que ton
builder de référence a et que le moteur actuel n'a pas.

## 3. ⚠️ Les chiffres — vérifiés le 2026-08-10, ne les redemande pas

| Terme | Valeur JUSTE | Où c'est gravé | Le builder dit (PÉRIMÉ, ne pas suivre) |
|---|---|---|---|
| **Educated** (Humain) | **+2 au niveau 1 seulement** | `fh-species-source.mjs:128`, vault `FHV2 - Couche FH.md:60` | juste, rien à corriger |
| **Fast Learner** (Araag, Elestu) | **+2 aux niveaux 1, 3 et 6** | `fh-species-source.mjs:129`, vault ligne 61 | juste |
| **Skilled** (don d'origine) | **+6** (3 proficiencies × `tier_costs.proficient`) | `fh-feats-en.layer.json`, contrat §THE SKILL POOL | juste. ⚠️ **Ne pas confondre avec `Skillful`** — deux noms différents, le builder a une constante `tweakPts:2` pour `Skillful` qui n'a **rien à voir** avec `Skilled` |
| **Paliers de niveau universels** | **+2 tous les 4 niveaux de PERSONNAGE** (4, 8, 12, 16, 20) | `fh_skill_pool.by_level` sur les 12 classes, contrat | `TIER_LEVELS = [4,8]` — **le builder s'arrête au niveau 8, c'est faux, ne le suis pas** |
| **Bard** | +1 par niveau après le 1, **fusionné** avec le +2 universel dans le même `by_level` | `skill-pool.mjs` §« l'arithmétique du barde n'est pas écrite ici » | cohérent, rien à changer |
| ⭐ **Keen Senses** (Elf, Elestu) | **2 points, captifs de `{survival, delve, vigilance}`, dépensables à ½ (1pt) ou Plein (2pt)** — donc ½ sur deux des trois, OU plein sur une seule | vault `FHV2 - Couche FH.md:168-169`, **et Eric l'a redit ce soir en toutes lettres** | `KEEN_SENSES_SPECIES` force **½ sur 2 compétences fixes** (Vigilance, Survival — **Delve manque**), aucune liberté de répartition. **Le vault note déjà ce bug du builder.** Ne pas le reproduire |

⚠️ **Keen Senses est le cœur du lot.** C'est un **budget captif** : ni un pool
libre (le convertir en points effacerait la restriction d'espèce — contrat,
« un grant restreint ne se convertit PAS en points »), ni un choix figé (2
compétences forcées). Le joueur choisit COMMENT dépenser 2 points sur EXACTEMENT
ces trois compétences, au même coût que le pool principal.

## 4. Ce que tu construis

### 4a. Le contrat de contenu — `granted_skill_choice` change de forme

**Ancienne forme** (Araag simple, garde cette forme) : `{count, from}` — N
maîtrises pleines à choisir, encore valable pour un grant NON restreint à des
paliers (vérifie s'il existe un tel cas réel dans la pile ; si tous les
grants réels sont des budgets captifs, **déclare-le** plutôt que de deviner
une distinction qui n'a plus d'usage).

**Nouvelle forme, pour Keen Senses** : un **budget de points** captif d'une
liste — `{points, from}`. Choisis le nom de champ (`granted_skill_budget` ou
une variante), **et écris pourquoi** dans ton inventaire. ⛔ Il ne remplace
PAS `{count, from}` s'il existe un usage légitime de l'ancienne forme ailleurs
dans la pile — mesure-le, ne suppose pas.

Régénère la couche (`gen-fh-species-layer.mjs` / `fh-species-source.mjs`) —
**ne édite jamais un fichier `.layer.json` à la main**, loi du dépôt.

### 4b. `derive.mjs` — écrire `half` et `expertise` pour la première fois

Mesuré : `resolved.skills[].proficiency` (schéma : `none·half·proficient·
expertise`) ne reçoit aujourd'hui que `"proficient"` ou `"none"`
(`derive.mjs:689,736`). Le bonus doit suivre : `Math.floor(proficiency / 2)`
pour `half` — vérifie ce chiffre contre le builder de référence
(`COST` n'est pas le bonus, ne confonds pas les deux échelles).

### 4c. Le canal de dépense — un chemin par ligne, un palier

Aujourd'hui `set({path, value: skillSlug})` ne pose que « maîtrisé ». Il faut
un canal qui pose un **palier** par compétence — chemin et forme à toi de
choisir (`class.skillSpend.<slug>` avec une valeur `"half"|"proficient"|
"expertise"`, ou toute forme cohérente avec les conventions déjà en place),
**décris-le dans ton inventaire et mets à jour `contracts/build.md`**.

### 4d. Le verrou d'expertise

`expertise_from_level: 4` est lu par personne aujourd'hui (`grep` vide dans
`block.mjs`). Oppose-le : une tentative d'acheter `expertise` avant le niveau
du record jette une violation **keyée** (lot 27 — `{key, params, path}`,
jamais une phrase).

### 4e. ⚠️ Le budget captif ne fuit PAS dans le pool principal

Keen Senses NE consomme AUCUN point du pool de classe (règle ratifiée : « un
choix accordé par l'espèce est supplémentaire »). Ses 2 points vivent dans
**leur propre budget**, séparé de `fh:skill-points`. Vérifie que ton carnet
de décisions (lot 28, `decisions.mjs`) l'expose comme un groupe DISTINCT, pas
mélangé aux lignes du pool de classe.

## 5. Les tests — accept ET rejet pour chaque clause

1. **Une ligne imposée est montable au-dessus de son plancher** — pose un
   imposé à ½, monte-le à Plein, vérifie le coût de la différence débité.
2. **`resolved.skills[].proficiency` rend `half` ET `expertise`** sur au
   moins un cas de chacun, avec le bon bonus.
3. **Keen Senses, les DEUX allocations légales** : ½ sur deux des trois ; Plein
   sur une seule. Et une **illégale** : essayer de le dépenser sur une
   compétence hors `{survival, delve, vigilance}` → refus keyé.
4. **Le budget captif ne touche pas `fh:skill-points`** — la valeur publiée
   du pool de classe est identique avec et sans Keen Senses dépensé.
5. **Le verrou d'expertise** : achat avant le niveau requis → refus keyé
   nommant la clef ; achat après → accepté.
6. **La loi §0.12** : un personnage SRD pur (aucune espèce FH, aucun budget
   captif) traverse la dérivation sans un mot de FH.
7. ⚔️ **ATTAQUE** : casse le garde du verrou d'expertise, casse le garde de
   restriction du budget captif — prouve que chacun mord. Restaure, prouve-le
   par `git status`.
8. **Non-régression** : chaque test existant qui touchait `granted_skill_choice`
   ou le pool doit encore passer, ou tu dis pourquoi il devait changer.

## 6. Ce que tu livres

- Le contenu régénéré, `derive.mjs`, `skill-pool.mjs`, `decisions.mjs`, le
  canal de dépense, le garde de verrou.
- `contracts/build.md` mis à jour : la forme du budget captif, le canal de
  dépense, le verrou.
- `INVENTAIRE-LOT-34.md` : le nom de champ choisi et pourquoi, la formule du
  bonus `half`, tes attaques, ce qui a rougi, et **une table AVANT/APRÈS**
  du pool d'un Elf niveau 1 (avec et sans Keen Senses dépensé) pour que la
  revue se fasse en un coup d'œil.
- Commits **en local**, message par **heredoc ou fichier**, jamais `-m "…"`.

⛔ **Tu ne touches pas** à `ui/builder/` (lots 30-33) — l'écran vient après,
sur la vraie matière. Tu ne touches pas au lot d'attribution (`derive.mjs`
région `:1091-1096`, AC) — autre région, autre lot.
