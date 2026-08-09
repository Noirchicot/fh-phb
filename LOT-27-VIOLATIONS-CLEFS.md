# Lot 27 — `27-violations-clefs`

> **[Sonnet · high]** — treize sites, un diff mécanique, mais il change une
> **sortie publique** (`validate`) et il casse un consommateur mesuré (le MCP).
> Le `high` est pour ça, pas pour la taille.

**En clair : aujourd'hui, quand le moteur refuse quelque chose, il rend une
phrase française.** Le chemin fautif est *dans la prose*. Une interface qui veut
poser une marque rouge sur la bonne carte devrait analyser du français — et la
table d'Eric joue en anglais. Tu remplaces la phrase par une **clef + des
paramètres**, sans changer un seul mot de ce qui s'affiche aujourd'hui.

C'est le **prérequis de l'écran du builder**, qui vient juste derrière : il doit
expliquer chaque verrou et chaque refus, et il ne peut pas le faire par-dessus
des phrases.

**Worktree** : `~/tools/fhpc-worktrees/27-violations-clefs`
**Branche** : `27-violations-clefs`, coupée de `main` = **remesure-le**
(`git -C ~/tools/fhpc rev-parse main` — il valait `02efc1a` à l'écriture, et un
SHA vit quelques minutes ici).
⛔ **Jamais `main`, jamais de `git push`.** **Départ : `npm test` → 565/565.**

---

## 1. La mesure qui motive le lot — refaite le 2026-08-10

> ⚠️ **CORRIGÉE le 2026-08-10 par le lot lui-même, et l'architecte a validé la
> correction.** Cette section annonçait « treize sites » : c'était faux. Il y a
> **douze producteurs de texte**, et **treize clefs** — le treizième site
> compté était un `...spread`, et une treizième clef manquait ailleurs (§3b-bis).
> La revue marche dans les deux sens ; c'est le deuxième lot de ce chantier à
> reprendre son propre architecte sur une mesure.

**Douze producteurs de texte, deux fichiers**, et la répartition n'est pas celle
qu'annonçait le mandat (il disait `block.mjs` seul) :

| Fichier | `violations.push` | Dont producteurs de texte |
|---|---|---|
| `src/build/block.mjs` | 8 | **7** *(le 8ᵉ, `:357`, est un `...spread`)* |
| `src/build/validate.mjs` (`statSumViolations`) | 5 | **5** |
| | | **= 12** |

Les treize poussent une **chaîne** dans un tableau rendu par `validate` et par
`rebuild`. Exemple, `block.mjs:367` :

```js
violations.push(`choix « ${choice.path} » : la pile ne porte aucun ${choice.ref.kind} « ${choice.ref.id} ».`);
```

Le `path` est là — noyé dans la phrase. **Huit des treize** portent ainsi un
chemin ou une racine exploitable.

⚠️ **Et une contrainte que le mandat ne nomme pas : `validate` a un
consommateur, et il casse.** `src/mcp/tools.mjs:397` fait
`violations.map((line) => \`  · ${line}\`)` — il suppose des chaînes. **Il est
dans ton périmètre**, et une IA lit une sortie d'outil comme un contrat.

## 2. ⛔ La forme est TRANCHÉE par l'architecte — ne la rouvre pas

Une violation devient **`{key, params, path?}`** :

| Champ | Règle |
|---|---|
| `key` | **une clef de libellé pointée** — `^[a-z][a-z0-9.:_-]{0,79}$` — **jamais une phrase** |
| `params` | un objet **plat** de scalaires — les valeurs que la phrase interpolait |
| `path` | le chemin fautif, **quand il en existe un**. Absent plutôt qu'inventé. Lui, c'est un vrai chemin (grammaire `overridePath`) |

> ⚠️ **CORRIGÉ le 2026-08-10, à la demande du lot.** Cette table exigeait un
> `$defs/slug`, qui **interdit le point** — et rendait `derive.threw` illégal.
> Le lot a proposé `derive:threw`. **Refusé, et voici la mesure qui tranche :**
> les **69 clefs** du paquet `src/play/labels.mjs` sont **toutes pointées**
> (`badge.natural-20`, `event.critical-hit`), le paquet FH aussi (`fh.crit20`),
> et `createLabels()` **n'impose aucune forme**. La contrainte de slug avait été
> recopiée de `stats[].id`, **sans son motif** : celui-là entre *entre crochets
> dans un chemin d'override*, où le point est un séparateur. **Une clef de
> violation n'est jamais un sélecteur de chemin.** Passer aux deux-points ferait
> des violations les seules clefs non pointées du dépôt, et casserait la
> consigne « tu réutilises `labels.mjs` tel quel ».

**Le mécanisme des mots existe déjà, et tu le réutilises tel quel** :
`src/play/labels.mjs`, loi §0.13 — *« une RÈGLE porte un `id`, un PAQUET porte
les mots de cet id »*, avec `createLabels()` et **un id inconnu qui jette**.
C'est le même besoin, prouvé, testé, et déjà employé par les modules FH. ⛔ **Tu
n'inventes pas un second mécanisme de libellés.**

### ⭐ La contrainte qui rend ce lot revuable en dix minutes

**Les mots ne changent pas.** Tu déplaces les phrases françaises actuelles,
**verbatim**, dans un paquet de libellés. Le rendu d'une violation doit rester
**identique caractère pour caractère** à celui d'aujourd'hui. La traduction
anglaise n'est **pas** de ce lot — on ouvre la porte, on ne livre pas la langue
(exactement ce que `labels.mjs` a déjà fait).

C'est aussi ton meilleur test : voir §4.1.

## 3. Ce que tu construis

### 3a. Les douze clefs des producteurs de texte

Huit portent un `path`, quatre n'en portent pas. **C'est mesuré, pas proposé** :

| Site | `path` |
|---|---|
| `block.mjs:366` ref qui fait jeter la requête | `choice.path` |
| `block.mjs:367` ref mort | `choice.path` |
| `block.mjs:394` compte de compétences ≠ déclaré | la **racine** (`species`/`class`) |
| `block.mjs:411` `ability_keys` hors des six | — *(faute de contenu, pas de décision)* |
| `block.mjs:420` boost hors de l'arrière-plan | `choice.path` |
| `block.mjs:431` `background.feat` ≠ accordé | `"background.feat"` |
| `validate.mjs:43` entrée qui n'est pas une stat | `"resolved.stats"` |
| `validate.mjs:49·57·66·71` | `resolved.stats[<id>]` |
| `block.mjs:357` | ⚠️ **délègue** à `statSumViolations` — ce n'est pas un site, c'est un `...spread` |

### 3b. ⚠️ Le site n°4 est un ENTONNOIR, et l'architecte l'a arbitré

`block.mjs:383` fait `violations.push(error.message)` : il avale **n'importe
quelle** exception de `derive()`, construite à des dizaines d'endroits.

**Arbitrage : UNE seule clef, `derive.threw`, et le texte brut en paramètre.**
Ne convertis pas les `throw` de `derive.mjs`. Raison : ce que `derive` jette,
c'est *du contenu ou du câblage cassé* — pas une décision de joueur invalide.
Aucune interface n'a de carte rouge à peindre pour ça ; elle a un « la pile est
cassée » à afficher. **Nomme la clef `derive.threw`** pour que personne ne la
prenne pour de la structure, et **dis-le dans ton inventaire.**

### 3b-bis. ⭐ LA TREIZIÈME CLEF — accordée le 2026-08-10, à la demande du lot

**Le lot a trouvé un trou que l'architecte avait ouvert lui-même** : `§3e`
interdit de toucher `src/schemas/invariants.mjs`, et `§4.2` exige qu'aucune
violation publique ne soit une chaîne. Or **`block.mjs:347` ensemence le tableau
avec ces chaînes** avant le premier `push` :

```js
const violations = charInvariantViolations(document);   // ← des CHAÎNES
```

et elles ressortent telles quelles au `:445`. Les deux consignes ne pouvaient
pas être tenues ensemble.

**Arbitrage rendu : une clef ENVELOPPE, posée à la frontière de `build.validate`
seulement.**

```
document.invariant-violated
params: { message: "<le texte d'invariant, inchangé>" }
path:   absent
```

Trois raisons, et la troisième est celle qui tranche :

1. **Elle ne touche pas le module d'invariants** — la consigne §3e tient.
2. **Elle ne change pas un mot affiché** — la contrainte §4.1 tient.
3. ⭐ **C'est exactement le même arbitrage que `derive.threw`** (§3b), pour
   exactement la même raison : un invariant violé est une faute de **structure**,
   pas une décision de joueur invalide. Aucune interface n'a de carte rouge à
   peindre pour ça. **Deux entonnoirs, une seule forme** — `{message}`, sans
   `path`. Ta liste de clefs doit les **nommer ensemble** comme une catégorie
   déclarée, pour que personne ne les prenne un jour pour de la structure.

⚠️ **La frontière est `validate` SEUL, et c'est mesuré** : `rebuild` (`:316`)
passe les mêmes invariants dans un `fail()`, pas dans un retour. **N'y touche
pas** — un `throw` n'est pas une sortie publique.

⚠️ **L'ORDRE EST PRÉSERVÉ.** Aujourd'hui les invariants arrivent **en premier**
(ensemencement), puis les stats, puis le reste. Le test §4.1 juge le rendu du
MCP : un ordre changé le fait rougir, à juste titre.

**Compte final : 12 producteurs de texte → 12 clefs, plus cette enveloppe = 13
clefs.** Le nombre treize de la première rédaction était juste par accident, et
faux par raisonnement.

### 3c. Le garde, et il doit MORDRE

Un garde structurel qui interdit qu'une chaîne nue entre dans la collection.
📌 *Un garde qui ne mord pas est pire que pas de garde* — tu le prouves en le
violant (§4.5).

### 3d. Le MCP

`src/mcp/tools.mjs:397` rend une ligne par violation. **Il doit rendre les mêmes
lignes qu'avant** (§4.1 vaut aussi pour lui) et gagner accès aux champs
structurés. Dis dans ton inventaire s'il expose `key`/`path` en plus du texte —
et pourquoi.

### 3e. ⛔ Ce que tu ne touches PAS

| | Pourquoi |
|---|---|
| `warnings` | même collection voisine, **prose conservée**. Un warning ne s'ancre pas à un contrôle : l'écran le liste. Le convertir doublerait le lot |
| `src/schemas/invariants.mjs` | **le module reste intact** — mais sa sortie est **enveloppée** à la frontière de `validate` : voir §3b-bis, qui corrige cette ligne |
| `src/doc/store.mjs:160` | encore un autre `violations`, celui du validateur de schéma. Hors périmètre |
| `derive.mjs` | **rien du tout.** Le lot d'attribution et le lot builder l'écrivent derrière toi |

## 4. Les tests — accept ET rejet pour chaque clause

1. ⭐ **LE TEST QUI PORTE LE LOT — non-régression au caractère près.** Pour
   **chacune des treize clefs** (les douze producteurs **et** l'enveloppe
   d'invariant), provoque la violation et vérifie que le texte rendu est
   **exactement** celui d'avant. Écris les treize chaînes attendues **en dur**
   dans le test. Une refonte de plomberie qui change un mot est une refonte qui
   a changé un comportement sans le dire.
   ⚠️ **Et l'ORDRE de la collection est jugé aussi** (§3b-bis).
2. **La forme** : aucune entrée de `violations` n'est une chaîne ; chaque `key`
   respecte `^[a-z][a-z0-9.:_-]{0,79}$` ; chaque `params` est plat et scalaire.
3. **Le `path` est JUSTE, pas seulement présent** : sur un ref mort, `path` vaut
   le chemin du choix fautif — pas la racine, pas un chemin voisin. C'est tout
   l'intérêt du lot ; un `path` approximatif ferait peindre la mauvaise carte.
4. **Une clef absente du paquet JETTE** — précédent `labels.mjs`, loi §0.5. Un
   libellé manquant qui retomberait sur son id peindrait `derive.threw` dans
   l'écran d'un joueur.
5. ⚔️ **ATTAQUE** : pousse une chaîne nue et prouve que ton garde rougit ;
   casse un `path` et prouve que le test 3 rougit. Restaure, prouve-le par
   `git status`.
6. **Le MCP** : `mcp-acceptance` reste vert, et sa sortie textuelle est
   inchangée.
7. **Les 5 assertions de test existantes** qui lisent le texte d'une violation
   (mesurées dans `tests/`) — elles doivent passer **sans être réécrites**. Si
   l'une doit changer, c'est que le test 1 est violé : dis-le, ne la corrige pas
   en silence.

## 5. Ce que tu livres

- Les treize clefs, leur paquet de libellés, le garde, le MCP à jour.
- **`contracts/build.md` §« les verbes »** : la ligne de `validate` dit
  `Rend {ok, violations, warnings}` — **elle devient fausse sans toi**. Décris la
  forme d'une violation.
- `INVENTAIRE-LOT-27.md` : tes arbitrages (dont le choix MCP), tes attaques, ce
  qui a rougi, et **les treize clefs listées avec leur `path`** — les deux
  entonnoirs (`derive.threw`, `document.invariant-violated`) **groupés à part**
  et déclarés comme tels.
- Commits **en local**, message par **heredoc ou fichier**, jamais `-m "…"`.

---

## 6. Le lot d'après, pour que tu ne l'anticipes pas

Le lot suivant est la **projection de décision** : un carnet de plus rendu par
`rebuild`, **générique** (une entrée par point de décision, indexée par son
chemin), qui portera options, coûts, disponibilité et **clef de refus**. Cette
clef, c'est la tienne. **Tu n'écris pas la projection** — tu lui donnes de quoi
exister.
