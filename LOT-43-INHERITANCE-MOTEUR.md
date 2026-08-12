# Lot 43 — `43-inheritance-moteur`

> **[Sonnet · high]** — un lot **moteur**, pas un lot d'écran. Il ne dessine rien.
> Il fait dire au moteur ce qu'Eric a tranché, pour que l'écran n'ait plus qu'à
> l'afficher.

**En clair : en Fate's Hand, l'arrière-plan n'existe plus.** On ne choisit plus
parmi Acolyte / Criminal / Sage / Soldier. L'étape s'appelle **Inheritance** et
elle pose deux choses, **toutes deux libres** : un **don d'origine** au choix, et
**3 points de caractéristiques** sur n'importe quelles caractéristiques (+2/+1 ou
+1/+1/+1). *(Eric, 2026-08-13.)*

Aujourd'hui le moteur fait l'inverse : il **réclame** un arrière-plan, il **dicte**
le don, et il **contraint** les caracs à trois clefs. Ce lot renverse ça.

⚠️ **IL NE DÉMARRE QU'APRÈS LA FUSION DU LOT 42** — et ce n'est pas de la prudence
de principe, c'est mesuré : §0.5 ci-dessous.

**Worktree** : `~/tools/fhpc-worktrees/43-inheritance-moteur`
**Branche** : `43-inheritance-moteur`, coupée de `main` **après la fusion du 42** —
**remesure** (`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre** (≥ **685**, plus ce que
le 42 aura ajouté).

---

## 0. Ce qui EXISTE — mesuré le 2026-08-13, ne le refais pas

### 0.1 Les trois plans, et d'où ils viennent

`src/build/decisions.mjs` :

| Plan | Ligne | Sa source |
|---|---|---|
| `background` | `280`, via `refPlan(query, list, "background")` | la **liste des records** du genre |
| `background.boost` | `125`, `backgroundBoostPlan(choices, view)` | `view.record.data.ability_keys` — **3 clefs** |
| `background.feat` | `169`, `backgroundFeatPlan(choices, view)` | `view.record.data.feat_id` — **un seul don**, `mode: required` |

⭐ **Les trois sous-plans sont gardés par `backgroundView`** (ligne `311-313`) : ils
n'existent **que** si un record est choisi. **C'est pour ça qu'un personnage sans
arrière-plan perd son guide** — mesuré : les valeurs de boost s'appliquent quand
même, mais plus aucun plan n'est publié.

### 0.2 Une couche SAIT retirer un record — et la couche FH le fait déjà

`op: "disable"` existe au schéma, et `fh-skills-en` s'en sert **3 fois** (Perception,
Gaming Set, Musical Instrument), chacune **avec sa `reason`**. ⛔ **Reprends ce
patron exactement, `reason` comprise.**

### 0.3 Les dons d'origine sont une vraie catégorie

`data.category` sur les records de don : `origin` **4** · `general` 2 ·
`fighting-style` 4 · `epic-boon` 7. Les quatre `origin` : **Alert, Magic Initiate,
Savage Attacker, Skilled**.

🔴 **MAIS `Auspicious (fh)` N'A AUCUNE `category`.** Un filtre sur `origin` listerait
4 dons et **perdrait celui que 5 des 7 personnages réels d'Eric portent**.

### 0.4 🔴 LES BONUS DE CARACS NE SONT GARDÉS PAR RIEN

Mesuré sur le magicien d'exemple, en posant les boosts à la main :

| Posé | `background.boost` | `validate()` | Résultat |
|---|---|---|---|
| `+2/+1` | `3/3` | rien | int 17 ✓ |
| `+1/+1/+1` | `3/3` | rien | int 16 ✓ |
| **`+3` sur une seule** | `3/3` | **rien** | int **18** ⛔ illégal |
| **`+2/+2`** *(4 points)* | `4/3` | **rien** | ⛔ le plan le voit, `validate()` se tait |
| **`+9`** | `9/3` | **rien** | int **24** ⛔ |

**Le plan compte, rien ne refuse.** C'est le même trou que le pool avant le lot 37.

### 0.5 ⛔ POURQUOI CE LOT NE PEUT PAS TOURNER EN PARALLÈLE DU 42

`examples/personnage-fh-en-niveau1.fh-char.json` porte
`{path:"background", ref:{kind:"background", id:"srd:background:en:sage"}}`. Dès
que tu `disable` les 4 arrière-plans SRD, **ce `ref` devient mort — et un ref mort
fait JETER `rebuild`** (`contracts/build.md:56`). Or c'est le document que le
builder charge à chaque ouverture, et **celui sur lequel le lot 42 teste ses deux
écrans**. Migrer l'exemple fait partie de ce lot (§3e).

---

## 1. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ — et les pistes qu'il a écartées

> **Ces quatre points sont des décisions de contrat, rendues le 2026-08-13. Tu peux
> les contredire par la mesure — mais pas par le goût.**

### 1a. La couche FH livre **UN** record d'Inheritance, non choisi

Elle `disable` les 4 arrière-plans SRD et `add` **un** record
`fh:background:en:inheritance`. Le genre reste **`background`** — c'est du
vocabulaire de moteur ; l'écran, lui, dira *Inheritance*.

**Deux pistes écartées, et pourquoi :**

| Piste | Pourquoi non |
|---|---|
| **Un module FH publie les plans** | ⛔ **impossible sans changer le protocole** : un module rend `{stat, underived, consumed}` (`contracts/build.md` §*Les modules de statistique*). Il ne publie **pas** de plans |
| **Des `ruleValues` sur la couche** | ⛔ `declaredRuleKeys` vaut **`null`** (`src/layers/stack.mjs:86`) → **toute couche qui en porte est REFUSÉE**, et sa **question ouverte n°4** (la correspondance clef de couche ↔ clef de moteur) n'est pas tranchée. En plus, `ruleValues` n'accepte **qu'un nombre ou un booléen** (`document.mjs:285`) : il ne peut pas porter une liste d'options |

⭐ **Ce que la piste retenue coûte : rien de neuf.** Aucun genre, aucun verbe, aucun
protocole. Le record existe déjà comme forme ; on change **d'où il vient**, pas ce
qu'il est.

### 1b. Le chemin canonique du don est **`background.originFeat[0]`**

⛔ **`background.feat` est RETIRÉ**, et le refus `background.feat-mismatch` avec lui.

**La mesure qui tranche** : `background.feat` est le chemin que le carnet *réclame*,
mais **aucun consommateur ne le lit** — `skill-pool.mjs`, `destiny-stat.mjs` et le
module des arcanes lisent tous `background.originFeat[n]`, et **les 7 personnages
réels d'Eric** l'utilisent. Le chemin qui a des lecteurs gagne.

📌 **Et ça règle un vrai défaut au passage** : `background.feat-mismatch` est émis
**deux fois** pour un seul choix — `decisions.mjs:176` **et** `block.mjs:464`.

### 1c. `ability_keys` absent = **les six caractéristiques**

Règle **générique**, écrite en vocabulaire de moteur : un record qui ne nomme pas
ses clefs ne les restreint pas. ⛔ **Aucun mot Fate's Hand dans `src/build/`.**

### 1d. `validate()` doit REFUSER une répartition illégale

**3 points au total, 2 au maximum sur une même caractéristique.** Deux clefs
nommées, sur le patron du lot 37 (`skill-pool.overspent`, `skill-pool.no-tool`) :
une pour le total, une pour le plafond par carac. **Le moteur prononce, l'écran
affichera.**

⛔ **Le plafond de 18 en sortie de création N'EST PAS dans ce lot.** C'est une
règle *différente* (ADDENDUMS §5 n°1), qui porte sur **toutes** les sources et se
vérifie **à la fin**, pas sur les boosts seuls. Mesuré qu'un 24 passe aujourd'hui —
**dis-le dans ton inventaire**, ne le corrige pas ici.

---

## 2. Les sources de vérité

| | |
|---|---|
| 🥇 La règle | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` **§4** *(réécrit le 2026-08-13)* et **§5 n°8** |
| Le contrat | `contracts/build.md` — ⚠️ **à mettre à jour par ce lot** (§3f) |
| Le patron de refus | le lot 37 : `src/modules/fh/skill-pool.mjs`, ses clefs et ses tests |
| Le patron de `disable` | `layers/fh-skills-en.layer.json`, les 3 records désactivés |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md`.

---

## 3. Ce que tu construis

### 3a. La couche FH

1. **`disable` les 4 arrière-plans SRD**, chacun avec sa `reason` — la même
   phrase que le lot 35 avait déjà écrite pour le retrait des compétences
   imposées, prolongée : *l'Inheritance remplace l'arrière-plan*.
2. **`add` `fh:background:en:inheritance`** :
   - **pas d'`ability_keys`** → les six caracs (§1c) ;
   - **pas de `feat_id`** → à la place `feat_choice: { from: "origin" }`, sur le
     patron maison de `skill_choice` / `granted_skill_choice` / `tool_choice` ;
   - une `description` qui dit ce que l'étape pose.
3. ⚠️ **Choisis la couche et dis pourquoi** : `fh-skills-en` (qui porte déjà les
   patchs d'arrière-plan) ou une couche neuve. **Mesure, puis justifie.**

### 3b. `Auspicious (fh)` reçoit `category: "origin"`

Une ligne dans `layers/fh-feats-en.layer.json`. ⛔ **Sans elle, l'écran perdra le
don le plus utilisé de la table.** ⚔️ Et un test le garde : **les dons d'origine
proposés sont 5, pas 4.**

### 3c. `backgroundBoostPlan` — les six caracs

`ability_keys` absent → `options` = les six clefs. ⛔ **Lis le catalogue des
caractéristiques là où le moteur le tient déjà** ; ne réécris pas une liste de six
chaînes en dur — c'est exactement la faute que ce chantier paie en boucle.

### 3d. `backgroundFeatPlan` — le don devient libre

- `feat_choice.from` → `options` = **tous les records de genre `feat` dont
  `data.category` vaut la valeur demandée**, lus par `query`.
- `path` = **`background.originFeat[0]`**, `mode` = **`offered`** (plus `required`).
- ⛔ **`background.feat` et `background.feat-mismatch` disparaissent**, aux **deux**
  endroits (`decisions.mjs:176` et `block.mjs:464`).
- ⚠️ **Le `feat_id` reste supporté** : un record qui en porte un garde le
  comportement SRD. **Un personnage SRD pur ne doit rien perdre** — c'est ta
  condition de sortie n°6.

### 3e. Le personnage d'exemple, migré

Retire son `background` mort, garde son `background.originFeat[0]`
(`Auspicious (fh)`) et ses `background.boost.*`. ⚠️ **Vérifie que son Score de
Destinée reste à 10 et son pool à 10** — les deux ont été mesurés avant toi.

📌 **Et pendant que tu y es, dis-le** : ce document échoue `validate()` aujourd'hui
(`skill-pool.no-tool`, la règle du lot 37). **Ne le corrige pas sans demander** —
c'est un arbitrage d'Eric, marqué révocable.

### 3e-bis. 🔴 DEUX DÉFAUTS DE `multiPlan`, trouvés EN REGARDANT L'ÉCRAN

**Ajoutés à ce lot le 2026-08-13**, après la fusion du lot 42 : ils vivent dans
`decisions.mjs`, **ton fichier**, et ouvrir une troisième branche dessus coûterait
plus cher que de les prendre au passage.

**Comment ils ont été trouvés** : l'architecte a servi le builder, choisi Magicien
(`arcana` + `investigation`), puis basculé sur **Roublard**. Aucun des **694** tests
ne les voyait.

**La mesure**, `projectDecisions` sur `class = rogue`, `class.skills[0] = arcana`,
`class.skills[1] = investigation` :

| Chemin publié | `expected` | `lock` |
|---|---|---|
| `class.skills` *(le groupe)* | **4** | `decision.option-unavailable` |
| `class.skills[0]` | 1 | **`decision.option-unavailable`** ← le même, une 2ᵉ fois |
| `class.skills[1]` | 1 | — |
| `class.skills[2]` · `[3]` · **`[4]`** | 1 | — |

1. 🔴 **CINQ créneaux pour `expected: 4`.** Le compte des créneaux suit les indices
   déjà occupés au lieu d'être borné par `expected`. À l'écran : *« 1 of 4 chosen »*
   surmonté de **cinq** lignes `Skill 1…5`.
2. 🔴 **LE MÊME REFUS DEUX FOIS** — au groupe **et** au créneau fautif. L'écran
   rend les deux, et le second **se pose au-dessus d'un créneau valide** : une
   accusation portée contre le mauvais choix. *(C'est la troisième fois de la
   semaine qu'un refus est émis en double — voir aussi `background.feat-mismatch`,
   §1b.)*

⛔ **Ne touche pas à l'écran** : il est fidèle, c'est mesuré. **La faute est au
moteur, la réparation aussi.**

⚔️ **Les deux attaques qui vont avec** :
- un document dont une classe **plus étroite** succède à une plus large publie
  **exactement `expected`** créneaux ;
- un choix devenu invalide produit **un** refus, pas deux — et **aucun créneau
  valide ne porte le refus d'un autre**.

### 3f. Le contrat

`contracts/build.md` : la disparition de `background.feat`, l'arrivée de
`feat_choice`, la règle « `ability_keys` absent = pas de restriction », et les deux
refus neufs. ⛔ **Chaque clause adossée à son test** — c'est la discipline du dépôt.

---

## 4. Les tests

1. **Sans record d'arrière-plan, la pile FH publie quand même les deux plans** —
   c'est le cœur du lot.
2. **Les six caracs sont proposées**, et un boost sur n'importe laquelle est légal.
3. ⚔️ **LES QUATRE ATTAQUES DU §0.4**, une par ligne : `+3` sur une seule,
   `+2/+2`, `+9`, et un total de 2. **Chacune doit produire son refus nommé.**
4. **`+2/+1` et `+1/+1/+1` restent légaux** — un garde qui refuse le cas normal est
   pire que pas de garde.
5. **Les dons d'origine proposés sont 5** (les 4 SRD + `Auspicious (fh)`), et le
   compte est **dérivé du contenu**, jamais écrit en dur.
6. **Un personnage SRD pur** garde son arrière-plan, son `feat_id` imposé et ses
   3 clefs de caracs. ⛔ **La couche FH ne doit rien casser en dessous d'elle.**
7. **`background.feat` ne produit plus rien** — ni plan, ni refus, nulle part.
8. **Le refus n'est plus émis deux fois** pour un seul choix.
9. **Le document d'exemple se reconstruit** : Destinée **10**, pool **10**.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test attendu
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.
⚔️ **Attaque ce que tu n'as pas déjà attaqué.**

📌 **Sers-toi de `tests/source-scan.mjs`** pour toute mesure « combien de sites
font X ». L'architecte a annoncé 56 sites là où il y en avait 77, en `grep`ant une
seule orthographe.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs, verts au départ **et** à l'arrivée.
- `INVENTAIRE-LOT-43.md` : **quelle couche tu as choisie et pourquoi** (§3a.3) ·
  ce que la migration de l'exemple a déplacé · **ce qui t'a surpris** · ce que tu as
  changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.** Et celle-ci en porte **quatre** (§1) : si l'une ne tient pas à la
mesure, **c'est une question, pas un contournement silencieux**.

⭐ **Et tu as le DROIT de la contredire.** Huit lots de ce chantier ont corrigé leur
architecte par la mesure. Le **lot 41** a **refusé d'écrire une ligne** et renvoyé
sa mesure — *« ce n'est pas un ajustement de comptage, c'est un changement de taille
du lot »* — **il avait raison**. Le **lot 38** a démontré qu'une piste de sa commande
était **impossible**, et trouvé au passage une faute d'architecte portant sur
**quatorze valeurs**. **C'est le comportement attendu, pas un incident.**
