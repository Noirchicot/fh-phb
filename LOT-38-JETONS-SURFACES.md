# Lot 38 — `38-jetons-surfaces`

> **[Sonnet · high]** — un seul fichier de code neuf, mais il fige le vocabulaire
> visuel de tout le produit. Aucune règle de jeu, aucun moteur, aucune donnée à
> régénérer. Ce qui coûte ici, c'est la **rigueur de l'inventaire**, pas la
> difficulté.

**En clair : aujourd'hui la coquille du builder écrit ses couleurs et ses tailles
en dur, et le bouton principal est illisible en mode sombre.** Ce lot pose le
**jeu de jetons** — couleurs, tailles de texte, espacements — le branche partout,
répare les trois défauts vivants, et **met un garde qui rougit** si un nombre en
dur revient.

**Worktree** : `~/tools/fhpc-worktrees/38-jetons-surfaces`
**Branche** : `38-jetons-surfaces`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`, attendu `a423789`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ : `npm test`, compte les verts, écris le nombre** (attendu : **629**).

⛔ **Ne touche à AUCUN fichier de `src/`** sauf le §3h (une ligne dans
`ui/builder/engine.mjs`, qui n'est pas dans `src/`). Le moteur est fini pour ce
lot. ⛔ **Ne construis pas l'étape Compétences** : c'est le lot 39, il a sa propre
commande, et il consommera tes jetons.

⛔ **Ne touche pas `src/tools/fiche.shell.html`.** Ses 52 lignes sont un
**instrument de mesure** (la fiche en lecture seule, « un instrument, pas une
maquette ») : lui poser un habillage le transformerait en maquette, exactement ce
qu'il ne doit pas être.

---

## 0. ✅ CE QUI EST DÉJÀ MESURÉ — ne le refais pas, sers-t'en

Tout ce qui suit a été mesuré le **2026-08-12 au soir** ou **remesuré ce jour**.
Chaque chiffre est reproductible sur les fichiers du dépôt.

| Objet | Mesure |
|---|---|
| `ui/builder/shell.css` | **151 lignes** · **8** déclarations `font-size` pour **4** valeurs (12 · 13 · 14 · 22) · **31** nombres d'espacement pour **14** valeurs · **3** rayons · **10 jetons de couleur** + un bloc sombre · **zéro jeton de taille** |
| Le builder v1 (`~/tools/fh-skills/fh-skill-builder.html`, référence de **forme**) | **78** déclarations `font-size` pour **24** valeurs · corps du document = **15 px** · **72 des 78** déclarations sont ≤ 22 px · paddings **21** valeurs · gaps **12** · margins **16** · rayons **7** |
| ⚠️ **Le corps du builder v2** | **il n'est déclaré nulle part.** Ni `body`, ni `.app`, ni `.decision-card` ne portent de `font-size` → le texte qu'on lit rend à **16 px, par défaut du navigateur** |
| `PALETTE-FHV2.json` | trois familles complètes, **18 lignes × 2 thèmes** chacune. La famille **`parchemin`** est celle ratifiée |

### ⚠️ Une classe de défaut, pas un élément — et elle est déjà nommée dans le dépôt

Plusieurs textes de la coquille **ne déclarent aucune taille** et héritent donc du
16 px du navigateur : les **libellés de la ceinture** (`.belt-item { font: inherit }`),
**les boutons** (`button { font: inherit }` — dont *Back* et *Continue*), et le
titre du plan. À côté d'eux, `.skill-budget` et `.skill-chip` sont à **13 px** :
**trois pixels d'écart non voulus, entre deux textes voisins.**

📌 `fh-phb/UI-TYPOGRAPHY.md` (ratifié le 2026-08-06) décrit **exactement** ce
défaut sur le dock, et le qualifie : *« Silence is not a default here, it is an
escape from the zoom system. »* **Chaque nœud de texte doit atterrir sur un
barreau**, explicitement ou par un parent qui en porte un.

### 🔴 ET AUCUN TEST NE TOUCHE `ui/` — mesuré ce jour

`grep -rln "ui/builder\|shell.css" tests/` → **rien**. Les **538 lignes** de
`ui/builder/` n'ont **aucun filet**. C'est pour ça que le §4 de cette commande
demande un garde, et pas seulement une réparation.

---

## 1. Les sources de vérité, dans cet ordre

| | |
|---|---|
| 🎨 **La forme et les couleurs** | vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md` — **lis-la en entier avant d'écrire une ligne** |
| 🥇 **Toute règle de jeu** | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md`. ⚠️ Ce lot n'en code aucune — mais si tu crois en toucher une, **arrête et demande** |
| **Les valeurs de couleur** | `fh-phb/PALETTE-FHV2.json`, famille `parchemin` — ⚠️ **corrigée par le §3b ci-dessous, lis-le** |
| **Les noms de barreaux** | `fh-phb/UI-TYPOGRAPHY.md` — les **noms** T1…T7 voyagent, **les valeurs sont locales à une zone** |
| **Ce que l'écran d'après demandera** | vault `Chantier FH & FHPC/FHV2 - Schémas d'écran.md` **§4** — tu ne le construis pas, tu **inventories** ce qu'il faudra |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md` (125 Ko, produit v1 gelé).

---

## 2. ⛔ CE QUI EST TRANCHÉ — ne le rouvre pas

| | Décidé par | Quoi |
|---|---|---|
| **Les noms sont T1…T7** | Eric, 2026-08-06 puis 2026-08-12 | ⛔ **jamais `H1`/`H2`** : `H1` est déjà un élément HTML, et sa numérotation court en sens inverse |
| **Sept barreaux** | idem | **six continus + un grand nombre à part**. Pas six, pas huit |
| **Les valeurs sont locales** | `UI-TYPOGRAPHY.md` | les 6,8 → 30 px du dock sont ceux d'une **fenêtre flottante**. Le builder est **plein écran** : il a ses propres nombres |
| **Le canevas ne se reprend pas** | `CODEX-ASSISTANT.md` | 425 × 680 est la taille du dock. ⛔ Ne les réutilise pas |
| **Base mobile 360 px** | Eric, 2026-08-12 | la largeur sur laquelle on **dessine** le téléphone. ⚠️ **À ne pas confondre avec 720 px**, qui est un **seuil de bascule** |
| **Pas de hauteur de canevas** | Eric, 2026-08-12 | l'écran s'étend vers le bas. ⛔ Aucun plancher de hauteur |
| **La ceinture est une molette PLATE** | Eric, 2026-08-12 | ⛔ **pas de repli en 4 + 3**, ⛔ **pas d'effacement des libellés**. Le relief est une **information** : plat = on navigue |
| **Palette parchemin** | Eric, 2026-08-12 | `#F6F3EC` le jour, `#14120E` la nuit |
| **Cinq sémantiques, pas six** | bible §6 | positif · attention · critique · info · désactivé. **Elles s'arrêtent avec ce lot** — en ajouter une plus tard rouvre les composants |
| **Mouvement réduit** | bible §5, invariant | `prefers-reduced-motion` est **obligatoire**, pas une option |

---

## 3. Ce que tu construis

### 3a. Un fichier de jetons, et un seul

**Crée `ui/builder/tokens.css`**, chargé par `index.html` **avant** `shell.css`.

📌 **Pourquoi un fichier séparé et pas `:root` dans `shell.css`** : le garde du §4
dit *« aucun littéral dans `shell.css` »*. Ce verdict n'est mécanisable que si les
littéraux vivent **ailleurs**. Un fichier de jetons est la cible du garde ; la
feuille de composants est ce qu'il surveille.

⛔ **Ne construis PAS de sélecteur de thème** (`[data-theme]`, bascule,
préférence enregistrée). Deux blocs suffisent, la forme déjà en place :
`:root` pour le jour, `@media (prefers-color-scheme: dark)` pour la nuit.
**Motif** : les deux autres familles de `PALETTE-FHV2.json` sont des **thèmes du
FH overlay**, et l'overlay n'est pas tranché. Un sélecteur sans second thème est
du **code mort derrière un interrupteur** — ce qu'Eric refuse (loi §0.6).
« La porte de l'habillage » veut dire : **toutes les valeurs dans un seul
fichier**, rien de plus.

### 3b. LES COULEURS — 14 jetons, et **une seule source de valeurs**

⛔ **NE RECOPIE AUCUN HEX DEPUIS CE DOCUMENT.** Les valeurs vivent dans
**`fh-phb/PALETTE-FHV2.json`**, famille **`parchemin`**, champs `jour` / `nuit`.
Une commande qui duplique des valeurs crée une seconde source qui dérivera — c'est
exactement la maladie que ce lot vient soigner.

**La correspondance nom-de-jeton ↔ ligne du JSON**, et c'est tout ce que ce
document fixe :

| Jeton CSS | ligne du JSON | Rôle |
|---|---|---|
| `--bg` | `dalle` | le fond |
| `--surface` | `surface` | cartes, panneaux |
| `--sunken` | `creux` | champs, zones creusées |
| `--text` | `texte` | le texte |
| `--text-soft` | `texte-doux` | descriptions |
| `--text-muted` | `texte-tenu` | mentions |
| `--border-strong` | `bordure-forte` | bordures de contrôle — ⚠️ cible **3:1**, pas 4,5 |
| `--border` | `bordure` | bordures de carte — décorative, **aucune cible** |
| `--accent` | `accent` | le verbe qui engage |
| `--on-accent` | `on_accent_jour` / `on_accent_nuit` | ⚠️ **un jeton qui BASCULE** — jamais `#fff` en dur |
| `--positive` | `positive` | validé, équilibré |
| `--caution` | `caution` | avertissement |
| `--critical` | `critical` | refus du moteur |
| `--info` | `info` | provenance, couche |

#### ⚠️ Le JSON a été CORRIGÉ le 2026-08-13, et le motif EST la leçon de ce lot

**Ratifié par Eric le jour même.** Ses valeurs étaient calées **exactement** sur
leur seuil **contre la dalle**, sans marge — *« la clarté la plus proche de la
dalle qui atteigne encore son seuil »*. Or **aucune encre ne s'affiche sur la
dalle** : elles s'affichent sur une **carte** (`surface`) ou dans un **champ**
(`creux`). Mesuré : `texte-tenu`, l'`accent`, les cinq sémantiques et les quatre
dés tombaient à **4,12–4,21** sur `surface` et **3,67–3,82** sur `creux`, et
`bordure-forte` à **2,52** pour une cible de 3:1. **Onze des dix-huit jetons
échouaient AA là où ils s'affichent vraiment.**

📌 **La mesure avait été faite sur le mauvais objet** — la faute que ce chantier
paie le plus souvent, et cette fois elle était dans un document **ratifié**.

**Ce que la correction a coûté** : teinte et saturation **inchangées**, dérive de
teinte **≤ 2,1°**, et les trois séparations ratifiées tiennent (accent↔caution
**21,7 / 22,0°** · accent↔critical **20,3 / 20,0°** · caution↔critical
**42,0 / 41,9°**). `--on-accent` **gagne** : de 5,05/4,56 à **6,07 / 5,62**.

**Ce que ça change pour toi, concrètement :**

- chaque jeton du JSON porte désormais **deux** ratios — `rj`/`rn` sur la dalle et
  **`rj_creux`/`rn_creux`, le contraste GARANTI**. ⭐ **C'est le second que tes
  tests doivent vérifier** ;
- `texte` et `texte-doux` **n'ont pas été corrigés** : ils passaient déjà sur
  `creux` (10,36 et 4,94), et leur clarté est un choix d'Eric, pas un seuil ;
- ⚠️ **si un chiffre du JSON te surprend, remesure-le et dis-le.** Ce fichier a
  déjà eu tort une fois.

⛔ **Les 5 jetons de dés ne sont PAS de ce lot.** `PALETTE-FHV2.json` les porte, la
bible §8 les rattache explicitement à la **vue de jeu (M4)**, et le builder n'en a
**aucun consommateur**. Les déclarer serait du code mort. **14 jetons de couleur,
pas 18.**

📌 **En revanche les 5 sémantiques SONT de ce lot, même sans consommateur
aujourd'hui** — c'est ratifié dans la bible §6 (*« les cinq s'arrêtent avec le lot
38 »*), et le lot 39 les consomme la semaine suivante. Ce n'est pas du code mort,
c'est un contrat d'une semaine. **Ne les censure pas.**

#### `--accent-wash`, le seul jeton dérivé

`shell.css` utilise aujourd'hui `--accent-soft` (l'accent à 8 % d'alpha) **5 fois**
— le fond de l'étape courante, la ligne courante du plan, le fond de `code`. La
palette ne le porte pas.

- Déclare-le **dérivé**, pas en dur :
  `--accent-wash: color-mix(in srgb, var(--accent) 10%, transparent);`
  → une seule source pour l'accent, et changer l'accent change le lavis.
- ⚠️ **Et mesure-le** : `--text` sur (`--accent-wash` posé sur `--bg`) doit tenir
  **4,5:1**, dans les deux thèmes. **Écris les deux chiffres dans ton inventaire.**
  Si ça ne passe pas, **baisse le pourcentage** — pas le contraste du texte.

### 3c. L'ÉCHELLE DE TYPE — sept barreaux, six continus plus un

✅ **RATIFIÉE PAR ERIC le 2026-08-13.** ⛔ Ne la rouvre pas — mais lis le
raisonnement, il te dira quoi faire des cas limites.

| Barreau | Nom parlé | **Builder** | Ce qu'il pose |
|---|---|---|---|
| **T1** | *micro* | **10 px** | mentions, la plus petite marque lisible |
| **T2** | *mention* | **12 px** | étiquette, verdict, coût |
| **T3** | *libellé* | **14 px** | les libellés |
| **T4** | *corps* | **16 px** | **la ligne qu'on lit** |
| **T5** | *accent* | **18 px** | entre le corps et le titre |
| **T6** | *titre* | **22 px** | titre de panneau, total |
| **T7** | *grand nombre* | **44 px** | le nombre qui porte l'écran |

En code : `--t1` … `--t7`. **Aucun `font-size` de `shell.css` ne survit en
littéral.**

**Le raisonnement, parce qu'il compte plus que les nombres :**

1. **T4 = 16 px n'est pas un goût.** C'est le défaut du navigateur (donc la
   préférence de l'utilisateur), c'est le seuil sous lequel iOS **zoome de force**
   un champ de saisie, et c'est **déjà ce que le builder rend** par accident.
2. **Aucun barreau à moins de 12,5 % du suivant.** C'est la version **relative**
   du diagnostic de la bible (*17 paires indiscernables sous 20 px*) : le critère
   absolu « moins de 2 px » condamnerait l'échelle du dock elle-même, dont les
   barreaux sont à 0,6 px — parce que **la discernabilité est proportionnelle**.
3. **Tous les barreaux sont pairs**, donc les demi-valeurs tombent sur des pixels
   entiers.
4. **T6 = 22** est déjà dans le code (`.decision-card h1`) et **T7 = 44** est une
   valeur **mesurée** du v1 (`.pv-name`, 44 px, deux fois) — c'est aussi le T7 du
   conseiller esthétique. Deux convergences, zéro invention.
5. 📌 **Fidélité, et l'honnêteté de ce chiffre est le point** : sur les 72
   déclarations du v1 rééchelonnées (×16/15), cette échelle donne **0,51 px
   d'écart moyen**, la meilleure des **120** échelles admissibles. Mais **l'écart
   entre la 1ʳᵉ et la 10ᵉ est de 0,07 px** — un vingtième de pixel. **La donnée ne
   choisit pas.** Elle départage, elle ne prouve pas.

⚠️ **Divergence assumée avec le conseiller esthétique**, à connaître : il proposait
**12 · 14 · 16 · 20 · 24 · 32 · 44**. Deux objections mesurées — (a) son 4ᵉ barreau
vaut **20**, ce qui met **le corps à 20 px** alors que T4 *est* le corps ; (b) ses
rapports **ne s'ouvrent pas** de façon monotone (1,17 → 1,14, puis 1,25 → 1,20),
alors que c'est le principe qu'il défendait. Sa valeur **T7 = 44** est reprise.

### 3d. L'ÉCHELLE D'ESPACEMENT — ✅ ratifiée le 2026-08-13, et ici la donnée tranche vraiment

**Grille de 4, avec un cran de 2 en dessous** : `2 · 4 · 8 · 12 · 16 · 20 · 24 · 32`.
En code `--sp-2` … `--sp-32` (le nom **est** la valeur : rien à mémoriser, et un
garde peut le vérifier).

| Candidat | Écart moyen v1 | Écart moyen v2 |
|---|---|---|
| **grille de 4 + le cran 2** | **0,84 px** | **0,74 px** |
| grille de 4 seule | 1,04 | 0,87 |
| 1,5× depuis 4 | 1,04 | 1,16 |
| doublement (2·4·8·16·32) | 1,33 | 1,77 |

📌 **Et c'est l'asymétrie intéressante de ce lot** : pour le **type**, 120
candidats se tiennent dans 0,07 px — la mesure ne choisit pas. Pour
l'**espacement**, l'écart entre le meilleur et le pire est plus du **double** — la
mesure choisit. **Dis-le tel quel dans ton inventaire** : une décision mesurée et
une décision de goût ne se défendent pas de la même façon.

**Rayons** — trois, contre 7 valeurs en v1 :
`--radius-sm: 4px` · `--radius-md: 8px` · `--radius-pill: 999px`.
Le `6px` de `.plan-list li` rejoint l'un des deux ; **dis lequel et pourquoi**.

### 3e. Les DEUX mesures de largeur sont deux choses différentes

Mesuré : `shell.css:75` `.decision-card { max-width: 62ch }` et `:94`
`.skills-step { max-width: 60ch }`. La bible les traite comme un **plafond de
mesure** contradictoire — **ce n'en est pas un.**

| | Ce que c'est | Jeton |
|---|---|---|
| `.decision-card` | une **mesure de prose** : le nombre de caractères par ligne qu'on lit confortablement | `--measure: 62ch` |
| `.skills-step` | la **largeur d'une grille** de 62 lignes à 3 colonnes. Une grille n'a pas de mesure, elle a une largeur | un jeton distinct, à toi de le nommer |

⚠️ Garde **62ch** pour `--measure` : c'est la valeur déjà en place sur la surface
de lecture, donc **zéro changement visible**. La bible §6b garde la question du
plafond (60/66/72) ouverte pour Eric — **elle porte sur `--measure` seul**, et
c'est alors **une ligne**. Écris-le dans ton inventaire.

### 3f. LA CEINTURE — la molette plate, et rien d'autre

Réparation du **troisième défaut vivant** : à 360 px, `shell.css:137` fait
`.belt-label { display: none }` — il **efface les mots**. Le cadre d'Eric interdit
la compression (*« pas de version réduite »*).

**Ce que tu construis, borné :**

| | |
|---|---|
| Les libellés **reviennent**, à toutes les largeurs | ⛔ plus aucun `display: none` sur du texte |
| La rangée **défile horizontalement** avec crantage | `scroll-snap-type: x proximity` + `scroll-snap-align: center` — l'inertie vient du **navigateur** |
| Les deux bords portent une **amorce** | `mask-image` (+ préfixe `-webkit-` pour les vieux Safari) : elle dit qu'il y a du hors-champ |
| L'étape courante **revient dans le champ** à chaque changement d'étape | c'est la garantie qui rend la molette sûre — sans elle, la ceinture peut cacher le cran allumé, *« the one thing it exists to show »* |
| Le cran courant se signale par **son poids et sa couleur** | 📌 **la ceinture flotte sur le vide** : ni pastille de centrage, ni fond |
| `prefers-reduced-motion` | le recentrage devient **instantané**, jamais animé |

⛔ **PAS le barillet 3D.** Il annonce *« on choisit une valeur »*, et **aucun
sélecteur numérique n'existe** (caracs, niveau, nombre de dés : tous à venir). Le
construire serait du code mort. Un composant, un paramètre — **la deuxième forme
arrive avec son premier usage.**
⛔ **PAS la transition de panneaux** (le glissement iOS, `cubic-bezier(.32,.72,0,1)`) :
elle appartient à l'écran, donc au lot 39.

⚠️ **Deux pièges déjà payés en écrivant la démonstration**, ne les repaie pas :
1. **la perspective ne se pose pas sur le conteneur qui défile** — son origine se
   place au centre du **contenu** ; elle se pose **par cran** *(sans objet si tu
   t'en tiens au plat, gardé au cas où)* ;
2. **`offsetLeft` remonte au premier parent positionné** : sans
   `position: relative` sur la molette, la mesure du centre dérive.

### 3g. Le nombre 720 est écrit deux fois

Mesuré : `shell.css:128` (`@media (max-width: 720px)`) **et** `shell.mjs:66`
(`matchMedia("(max-width: 720px)")`). La bible §3 : *« il ne doit exister qu'à un
seul endroit »*.

**Piste, à contester si tu mesures mieux** — zéro build (loi Q3) :
`--bp-mid: 720px` dans `tokens.css`, et `shell.mjs` lit
`getComputedStyle(document.documentElement).getPropertyValue("--bp-mid")`.
Une source, aucune étape de compilation.

⛔ **Ne déclare PAS le seuil de 1140 px.** La bible le chiffre (trois grandeurs),
mais il n'a **aucun consommateur** : rien ne fait encore flotter l'inspecteur. Il
arrive avec le lot qui le fait flotter. Un jeton sans usage est du code mort.

### 3h. Les DEUX défauts vivants de couleur, et un troisième dans le moteur

| | Défaut | Réparation |
|---|---|---|
| **1** | `shell.css:90` et `:110` : `color: #fff` **en dur** sur `var(--accent)`. Remesuré : `#fff` sur l'accent **du code** (`#d69a52`, ligne 21) = **2,44:1** en sombre — **le verbe principal du builder échoue AA aujourd'hui** | `var(--on-accent)`. Avec l'accent corrigé : **5,62:1** la nuit, **6,07:1** le jour |
| **2** | `shell.css:112` lit `--decide`, **défini nulle part**. Son repli `#b3543b` fait **3,49:1** sur la surface du code | `var(--critical)` — `.skill-lock` affiche **le refus du moteur**, c'est exactement son rôle |
| **3** | `ui/builder/engine.mjs:46` appelle `createBuild({ bus, dispatch, now })` **sans `modules:`** | monte `[createFhDestinyStat(), createFhSkillPoolStat()]`, comme `src/tools/exemple-fh-en.mjs:167` |

**Le défaut n°3, remesuré ce jour en montant la même pile que la page** — et il
est **plus large que rapporté** :

```
engine.mjs tel quel (sans modules) : resolved.stats = 0 entrée   (VIDE)
avec les deux modules montés       : resolved.stats = fh:destiny=10 · fh:skill-points=10
```

→ l'écran ne perd pas seulement **le pool de compétences** : il perd aussi **le
Score de Destinée**. Les deux, sur le personnage d'exemple. *(Les passations
n'annonçaient que le pool.)*

⚠️ **Pourquoi ce défaut est ici et pas au lot 39** : il fait **une ligne**, tu
touches déjà `ui/builder/`, et le lot 39 doit démarrer sur un terrain où le pool
est **visible**. Accompagne-le d'**un test** : la pile montée comme la page rend
`fh:skill-points` non vide. ⛔ **Et n'en profite pas pour afficher le pool** —
l'affichage est au lot 39.

### 3i. L'INVENTAIRE DES SURFACES — c'est le livrable qui survit au lot

**Recense chaque surface du builder, ce qui la peint, et son état.** Point de
départ mesuré sur `shell.css` + `shell.mjs` + `skills-step.mjs` — **17 surfaces
existent** :

`body` · `.app` (2 ou 3 colonnes) · `.belt` · `.belt-item` (**3 états** :
done/current/upcoming) · `.belt-index` · `.belt-label` · `.stage` · `.toggle-bar` ·
`.decision-card` (+ son `h1`) · `.placeholder` (+ `code`) · `.stage-nav`
(**le verbe principal**) · `.skills-step` · `.skill-group` (+ `h3`) ·
`.skill-budget` · `.skill-slot` (état `locked`) · `.skill-chip` (**états** chosen /
disabled) · `.skill-lock` · `.plan` (+ `.plan-header`, `.plan-list li` **3 états**) ·
`.scrim`

**Et recense ce que le §4 du vault `FHV2 - Schémas d'écran` exigera et qui
n'existe pas** — ⛔ **sans le construire**, c'est le lot 39 :

la **barre de catégories collante** (scrollspy) · le **compteur à trois bourses
qui ne s'additionnent pas** · la **ligne de notification** (Rogue) · les **trois
sous-blocs** *Tools · Languages · Trainings*, dont **Trainings grisé avec sa
raison écrite** · le **cadenas de ligne avec sa provenance** · le **`6 OVER` en
rouge** · la **rampe ordinale des paliers**.

#### ⚠️ La rampe des paliers : ses JETONS sont de ce lot, son usage est du 39

**Arbitrage d'architecte, à signaler à Eric.** La bible §6 range la rampe
« avec le lot 39 », mais elle dit aussi que **les formes de la rampe** sont l'une
des **deux seules choses qui coûtent cher tard** (*« les changer après l'écran des
compétences rouvre 62 lignes de grille »*). Une grille écrite avant que la rampe
existe **inventera** la rampe. Donc : **tu déclares, le 39 consomme.**

Les paliers viennent des ADDENDUMS §1, et **il y en a quatre, pas trois** :

| Palier | Coût | Glyphe | Lavis |
|---|---|---|---|
| aucun | 0 | `—` | **aucun** — c'est l'absence, elle ne porte pas d'encre |
| demi | 1 | `½` | lavis 1 |
| plein | 2 | `●` | lavis 2 |
| expertise | 4 | `★` | lavis 3 |

**Une seule teinte, trois lavis** *(bible §6b : c'est une donnée **ordinale**, pas
une palette catégorielle — ce qui libère vert/ambre/rouge pour le statut)*.
⚠️ **Chaque lavis doit tenir son contraste sur `--sunken`**, pas sur la dalle :
c'est le §3b, et c'est le piège du lot. **Écris les trois chiffres.**
⚠️ **Un `training` n'a AUCUN palier** (ADDENDUMS §1) : la rampe ne s'applique pas
au troisième sous-bloc. Ne lui en donne pas.

📌 **La bible écrit « trois lavis, trois formes » mais liste quatre glyphes.**
C'est **quatre glyphes, trois lavis** — le tiret est l'absence. Note la précision
dans ton inventaire.

---

## 4. 🔒 LE GARDE — sans lui, le 44ᵉ nombre revient à la première session pressée

**C'est la condition de sortie, et elle n'est pas négociable.** Elle est reprise
mot pour mot de `UI-TYPOGRAPHY.md` : *« The lot is done when a test fails if any
`font-size` is not a token. »*

**Écris `tests/ui-jetons.test.mjs`** — ⚠️ **aucun DOM, aucun paquet de plus** :
c'est un **balayage d'octets** sur `ui/builder/shell.css`, exactement comme la loi
§0.12 est gardée sur les octets de `src/build/`. Le précédent à suivre :
`tests/source-scan.mjs` et `tests/render-fiche.test.mjs` (*« elle porte sur la
fonction, pas sur la page »*).

**Ce que le garde exige de `shell.css`** :

1. **aucun `font-size` littéral** — que des `var(--t1..--t7)` ;
2. **aucun** `padding` / `margin` / `gap` / `border-radius` littéral — que des
   `var(--sp-*)` / `var(--radius-*)` ;
3. **aucune couleur littérale** — ni hex, ni `rgb(`, ni nom CSS — que des
   `var(--…)`. ⚠️ **`#fff` est le défaut n°1 : c'est le cas que ce garde existe
   pour attraper** ;
4. **aucun `display: none` sur un porteur de texte** — c'est le défaut n°3 ;
5. **le seuil de bascule n'apparaît qu'une fois** dans tout `ui/builder/`.

**La liste d'exceptions, et sa règle** : `0`, `1px` de bordure, `1fr`, `100vh`,
les pourcentages et `999px` ont sans doute besoin d'être admis. **Chaque exception
s'écrit dans le test avec sa raison.** 📌 `UI-TYPOGRAPHY.md` : *« an exception on
the record is a decision; an exception in the stylesheet is the 44th number. »*

### ⚔️ ET TU L'ATTAQUES — sinon ce n'est pas un garde, c'est une intention

Règle du dépôt, payée : *« un garde qui n'a jamais été attaqué n'est pas un garde »*.
**Cinq attaques minimum, une par clause** : remets `#fff` · remets `font-size: 13px` ·
remets `padding: 10px` · remets `display:none` sur `.belt-label` · écris 720 deux
fois. Pour chacune : **le test attendu et lui seul rougit**, tu restaures,
`diff` byte-à-byte, suite complète rejouée. **Écris les cinq résultats.**

### Les tests de valeur, en plus du garde

6. **Les sept barreaux existent et sont distincts**, et aucun n'est à moins de
   12,5 % de son voisin — le garde de l'échelle elle-même.
7. **`--on-accent` bascule** entre les deux thèmes *(le jeton qui change, §3b)*.
8. **Le contraste, calculé dans le test**, pas dans un commentaire : chaque encre
   du §3b tient **4,5:1 sur `--sunken`**, `--border-strong` tient **3:1**, et
   `--text` tient 4,5:1 sur `--accent-wash`. ⭐ **C'est ce test qui empêche la
   régression que ce lot vient de trouver**, dans les deux thèmes.
9. **Le pool est visible** : la pile montée comme la page rend `fh:skill-points`
   non vide *(défaut n°3)*.
10. **Un personnage SRD pur** ne change pas de rendu — aucun jeton n'est
    conditionné à la couche FH.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs listés, **verts au départ et à l'arrivée**
  (629 au départ ; dis le nombre d'arrivée).
- `ui/builder/tokens.css` · `shell.css` sans un littéral · `index.html` · le
  recentrage de la ceinture dans `shell.mjs` · une ligne dans `engine.mjs` ·
  `tests/ui-jetons.test.mjs`.
- **`INVENTAIRE-LOT-38.md`**, et c'est le livrable qui survit au lot :
  - **l'inventaire des surfaces** (§3i), existantes **et** à venir, avec ce qui
    peint chacune et ses états ;
  - **les chiffres de contraste** que tu as mesurés : les 14 jetons sur
    `--sunken`, `--text` sur `--accent-wash`, les trois lavis de la rampe ;
  - **les cinq attaques** du garde et leur résultat ;
  - **la liste des exceptions** du garde, chacune avec sa raison ;
  - **ce que tu as changé de cette commande, et pourquoi** ;
  - **les trois arbitrages d'architecte encore ouverts, répétés en toutes lettres
    pour Eric** : (a) les **5 dés écartés** du builder (M4, zéro consommateur) ;
    (b) la **rampe déclarée ici**, consommée au 39 ; (c) le **seuil de 1140 non
    déclaré** faute de consommateur.
    *(Le quatrième — la palette recalculée contre `creux` — est **ratifié** depuis
    le 2026-08-13 : ce n'est plus un arbitrage, c'est la valeur du JSON.)*
- ⛔ Aucun `git push`, aucune fusion, **rien dans `src/`**, **rien de l'étape
  Compétences**.

---

⛔ **La règle qui ne change pas** : toute décision que cette commande ne couvre pas
→ **STOP, question à l'architecte.** Quatre lots de ce chantier ont corrigé leur
architecte en refusant de deviner — dont le lot 35, qui a eu raison **contre sa
propre commande**. C'est le comportement attendu, pas un incident.

⚠️ **Et la leçon la plus neuve du chantier, née du lot 37** : **une commande de lot
se relit APRÈS CHAQUE MESURE, pas seulement avant le lancement.** Si une de tes
mesures contredit une ligne d'ici — surtout le §3b, qui corrige un document
ratifié — **c'est la mesure qui gagne, et tu le dis.**
