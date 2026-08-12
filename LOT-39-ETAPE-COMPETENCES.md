# Lot 39 — `39-etape-competences`

> **[Sonnet · high]** — le plus gros écran du produit, mais **zéro règle de jeu** :
> le moteur prononce, l'écran affiche. Ce qui coûte ici, c'est de lire la bonne
> rubrique du bon objet — c'est exactement ce qui a coûté l'écran du lot 33.

**En clair : c'est l'écran où le joueur dépense ses points de compétence.** Une
seule page qui défile, 26 compétences rangées en 4 catégories, une cinquième
colonne pour les outils, un compteur collé en haut, et le refus du moteur affiché
quand on dépasse. **Sept décisions d'Eric le gouvernent, et elles sont déjà prises.**

**Worktree** : `~/tools/fhpc-worktrees/39-etape-competences`
**Branche** : `39-etape-competences`, coupée de `main` **après la fusion du lot 38**
— **remesure** (`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **compte les verts et écris le nombre**
(629 + ce que le lot 38 a ajouté — remesure, ne suppose pas).

⛔ **Ne touche AUCUN fichier de `src/`.** Aucune règle n'entre dans l'interface :
c'est la décision n°6 d'Eric, et c'est la loi de ce lot. Si tu as besoin d'une
valeur que le moteur ne rend pas → **STOP, question à l'architecte.**

---

## 0. ✅ CE QUI EST DÉJÀ MESURÉ — sondé le 2026-08-13, ne le refais pas

**Tout ce tableau vient d'une sonde réelle** : la pile des cinq couches montée
comme la page la monte, `rebuild()` sur `examples/personnage-fh-en-niveau1.fh-char.json`
(l'Elfe magicien).

### ⭐ LA MESURE QUI CHANGE LE PLUS : `resolved.skills` EST DÉJÀ LA GRILLE

```
resolved.skills : tableau de 26
  { "id":"academics", "name":"Academics", "ability":"int", "bonus":3, "proficiency":"none" }
```

→ **Les 26 lignes existent déjà, chacune avec son palier courant et son bonus
calculé.** ⛔ **Ne reconstruis PAS la grille depuis `decisions[]`** — c'est ce que
faisait l'écran du lot 33, et c'est pour ça qu'il ne montrait que les imposés.

### ⚠️ ET L'ASYMÉTRIE QUI EST LE PIÈGE DE CE LOT

| Rubrique | Ce qu'elle contient | D'où vient la liste complète |
|---|---|---|
| `resolved.skills` | **les 26, toujours**, même à `proficiency: "none"` | ✅ elle-même |
| `resolved.tools` | ⚠️ **`[]` sur l'exemple** — seulement les outils **acquis** | 🔴 `layers.query({kind:"tool"})` → **36 records** |
| `resolved.languages` | ⚠️ **`[]` sur l'exemple** — seulement les langues **acquises** | 🔴 **aucune** — voir §2c |
| `resolved.traits` filtré sur `category === "training"` | ⚠️ **`[]`** — seulement les apprentissages **achetés** | 🔴 `layers.query({kind:"training"})` → **0 record** (voir §2c) |

📌 **Les compétences sont un ensemble FERMÉ que `resolved` énumère ; les outils, les
langues et les apprentissages sont des ensembles OUVERTS que `resolved` ne liste
que quand ils sont acquis.** Deux mécaniques de lecture, pas une.

### Les catégories : mesurées, et elles tombent juste

`resolved.skills` **ne porte PAS** la catégorie. Elle vit sur le record de couche,
en `record.data.category` — jointure par `slug` sur `layers.query({kind:"skill"})` :

| Catégorie | Compte mesuré |
|---|---|
| `knowledge` | **8** |
| `social` | **7** |
| `exploration` | **6** |
| `physical` | **5** |
| **total** | **26** ✅ — conforme aux ADDENDUMS au record près |

### Le compteur : la stat et son détail

```
resolved.stats[] contient  fh:skill-points  et  fh:destiny
fh:skill-points = 10, breakdown de 2 lignes :
   { label:"Class Pool · Wizard",              value: 12, source:{kind:"class", id:"srd:class:en:wizard"} }
   { label:"Wizard · 2 imposed choices",       value: -2, source:{kind:"class", id:"srd:class:en:wizard"} }
```

⚠️ **Ces deux stats n'apparaissent QUE si les modules sont montés.** Le lot 38 a
réparé `ui/builder/engine.mjs` pour ça — **vérifie-le au départ** : si
`resolved.stats` revient vide, tu n'as pas le pool, et le lot 38 a régressé.

### Les coûts et le verrou d'expertise : où ils vivent VRAIMENT

Pas sur le record SRD de la classe. Sur un **patch de la couche FH**, à
`class.data.fh_skill_pool` :

```
rogue  : { base:18, by_level:{4:2,8:2,12:2,16:2,20:2},
           tier_costs:{ half:1, proficient:2, expertise:4, imposed:1 },
           expertise_from_level: 1 }      ← 1, c'est LUI la notification du §3g
wizard : { base:12, …même tier_costs…,    expertise_from_level: 4 }
```

⛔ **N'écris JAMAIS `1 / 2 / 4` en dur dans la colonne *Cost*.** Lis
`tier_costs`. C'est du contenu, pas une constante — et le jour où Eric change un
barème, l'écran doit suivre sans qu'on le rouvre.

### Les quatre portes de la grille — et laquelle passe par où

| Ce que le joueur touche | Chemin du choix | Où l'état se lit |
|---|---|---|
| Les **2 imposés de classe** | `class.skills[0]`, `class.skills[1]` | le carnet **`decisions[]`**, champ `provenance.field === "skill_choice"` |
| Le **budget captif d'espèce** | `species.skillBudget.<slug>` | le carnet **`decisions[]`**, `granted_skill_budget` / `granted_skill_choice` |
| La **dépense du pool libre** | `fh.skills.spend.<slug>` = `"half"` / `"proficient"` / `"expertise"` | ⚠️ **PAS dans `decisions[]`** — l'état se lit dans `resolved.skills[].proficiency` |
| Un **apprentissage** | `fh.skills.train.<slug>` = **booléen** | ⚠️ **PAS dans `decisions[]`** — l'état se lit dans `resolved.traits[]` |

📌 **Deux portes sur quatre ne sont pas dans le carnet.** C'est LE fait à garder en
tête tout le long : `decisions[]` porte ce qu'une **source impose**, `resolved`
porte ce que le personnage **a**.

⚠️ **Et ne groupe JAMAIS par texte de chemin.** Un premier essai du lot 33 groupait
sur « le dernier segment vaut `skills` » — et ratait `species.keenSenses`, le nom
du trait de l'Elfe. **Le champ stable est `provenance.field`**, posé par
`decisions.mjs` lui-même. Le commentaire en tête de `skills-step.mjs` raconte ce
bogue en détail : **lis-le, il t'épargne une demi-journée.**

---

## 1. Les sources de vérité, dans cet ordre

| | |
|---|---|
| 🥇 **Les sept décisions d'Eric** | vault `Chantier FH & FHPC/FHV2 - Schémas d'écran.md` **§4** — **c'est ta commande de forme, lis-la en entier** |
| 🥇 **Toute règle de jeu** | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` §1 et §2 |
| 🎨 **Le design** | vault `Chantier FH & FHPC/FHV2 - Bible esthétique.md` — §2b l'échelle, §4 la molette, §5b la palette |
| **Les jetons, en code** | `ui/builder/tokens.css` (lot 38) — ⛔ **et le garde `tests/ui-jetons.test.mjs` mord sur tout littéral que tu écrirais** |
| **La forme de référence** | `~/tools/fh-skills/fh-skill-builder.html` — le builder v1. **La forme, pas les chiffres**, et il a des bogues nommés ci-dessous |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md` (125 Ko, produit v1 gelé).

---

## 2. ⛔ CE QUI EST TRANCHÉ — ne le rouvre pas

### 2a. Les sept décisions d'Eric *(2026-08-12, protocole étape par étape)*

| # | Décision |
|---|---|
| **1** | **Une seule page qui défile.** Tout visible d'un coup, les intertitres de catégorie séparent, le fil reste continu. Une **barre de catégories collante** en haut, dont le highlight **se déplace au défilement** *(scrollspy)* ; elle sert aussi à sauter à une catégorie |
| **2** | **La colonne *Floor* est SUPPRIMÉE.** Le plancher est une **conséquence** (classe, espèce, don), pas une saisie : il devient un **cadenas sur la ligne avec sa provenance**. *Reset* ne rend que les points **dépensés**. Grille à **3 colonnes** : *Skill / Tool · Invested · Cost* |
| **3** | **Chaque source pose son choix chez elle.** Le QCM de classe est à l'étape **Class**, celui d'espèce à l'étape **Species** (⛔ et **rien** si l'espèce ne donne pas de points). **La grande grille ne porte que le pool LIBRE**, plus un **rappel en tête** qui valide la comptabilité |
| **4** | **Un seul intertitre *Tools & Trainings*, trois sous-blocs dedans** (Tools · Languages · Trainings) — parce que les trois **ne se cliquent pas pareil**. Au niveau 1, *Trainings* est **affiché GRISÉ avec sa raison écrite** — ⛔ **pas caché** |
| **5** | **Le compteur est collé en haut avec la barre de catégories**, il défile avec elle. ⛔ **Il ne survit pas à l'étape** — la coquille interdit un bandeau permanent |
| **6** | **Le dépassement est TOLÉRÉ pendant qu'on répartit** (`6 OVER` en rouge), **refusé par `validate()`**. ⛔ **Aucun blocage de clic.** Le moteur prononce, l'écran affiche |
| **7** | **La notification du Rogue est UNE LIGNE** sous le compteur, en tête de grille, visible **avant** de commencer à dépenser. ⛔ **Pas de pastille sur les 62 lignes** |

### 2b. Le compteur — trois bourses qui NE s'additionnent PAS

Forme ratifiée (**lecture B**), avec les nombres **mesurés** sur l'Elfe magicien :

```
Pool       6/10        ← le sac libre : 12 de classe − 2 imposés
Class      2/2         ← le QCM de classe, posé à l'étape Class
Species    2/2         ← Keen Senses, bourse captive {survival · delve · vigilance}
Invested   10          ← tout ce qui est placé, toutes bourses confondues
Left       4
```

📌 **Pourquoi elles ne s'additionnent pas, et c'est le moteur qui l'impose** : le
budget captif d'espèce **ne touche jamais** `fh:skill-points`. C'est une bourse
séparée, dépensable seulement dans sa liste. **`Left` ne parle que du sac libre.**

### 2c. ⚠️ DEUX SOUS-BLOCS N'ONT PAS DE CATALOGUE — arbitrage d'architecte

**Mesuré le 2026-08-13, et c'est la seule mauvaise surprise du sondage :**

| Sous-bloc | Mesure | Ce que tu construis |
|---|---|---|
| **Tools** | ✅ **36 records** dans la pile | la liste complète, cliquable, avec ses paliers |
| **Trainings** | 🔴 **0 record.** Le **genre** `training` est ouvert (16ᵉ genre, lot 36) mais **le contenu n'existe pas — et Eric a tranché le 2026-08-13 qu'on ne s'y attelle PAS pour le moment** (*« à la limite quand on aura produit un expert builder »*) | ⛔ **N'essaie pas de lister, et n'écris aucun contenu de training.** Affiche le sous-bloc **grisé avec sa raison**, et **c'est tout** |
| **Languages** | 🔴 **il n'y a AUCUN genre `language`** parmi les 16 — et `resolved.languages` est vide sur l'exemple | ⛔ **Aucun sélecteur.** Affiche `resolved.languages[]` en **lecture seule** ; s'il est vide, dis-le en une ligne |

**⚠️ ARBITRAGE D'ARCHITECTE, à signaler à Eric et révocable d'un mot** : rien ne
donne ni n'offre de langue au niveau 1 dans la pile actuelle, et le training « une
langue de plus » n'existe pas encore comme record. **Construire un sélecteur de
langues serait un sélecteur sans catalogue** — du code mort (loi §0.6). Le
sous-bloc existe, il est **non cliquable**, et il le dit.

📌 **Ça reste cohérent avec la décision n°4 d'Eric** : les trois sous-blocs existent
justement parce qu'ils **ne se cliquent pas pareil** — et deux d'entre eux ne se
cliquent pas du tout aujourd'hui.

#### ⭐ LA RAISON À ÉCRIRE DANS LE SOUS-BLOC GRISÉ — rappelée par Eric le 2026-08-13

> **Les trainings s'achètent à partir du niveau 4, sauf mention contraire.**

⛔ **Ne code pas le 4.** Le moteur le porte déjà, et sa forme est celle-ci
(`src/modules/fh/skill-pool.mjs`, lot 36) : `DEFAULT_TRAINING_FROM_LEVEL = 4`, et
**la PRÉSENCE de `data.from_level` sur le record EST la dérogation** — le jour où
une couche de sous-classe patche le Garrot à `from_level: 3`, le moteur lit le
nombre neuf sans qu'une ligne bouge.

**Donc l'écran affiche le niveau que le refus lui donne**, jamais un 4 en dur : la
clef `skill-train.level-locked` porte ses paramètres. Si tu ne trouves pas le
niveau dans les paramètres du refus, **c'est une question à l'architecte**, pas un
nombre à écrire.

⚠️ **Et un arbitrage d'architecte reste OUVERT là-dessus, sans effet aujourd'hui** :
le verrou est lu **sur le record du training**, donc il est **global**. Les
ADDENDUMS disent que la dérogation est portée par un feat, une classe, une espèce ou
une **sous-classe** — donc **par personnage**. Le rappel d'Eric du 2026-08-13 restate
la règle, il **ne tranche pas** cette question. Sans effet tant qu'aucune
sous-classe n'existe. ⛔ **Ne la résous pas dans l'écran.**

### 2d. Les bogues du builder v1 que tu ne recopies PAS

| Bogue v1 | Ce que tu fais |
|---|---|
| Keen Senses n'y propose que **2** des 3 compétences (**Delve manque**) et **force le ½** | lis `granted_skill_budget.from` : **les trois y sont**, et le palier est **au choix** |
| La colonne *Floor* est une **saisie** | c'est un **cadenas**, décision n°2 |
| 24 tailles de police, 31 espacements | ⛔ **le garde du lot 38 t'en empêche** |

---

## 3. Ce que tu construis

### 3a. La grille — 3 colonnes, une page qui défile

`Skill / Tool · Invested · Cost`. Les lignes de compétence viennent de
**`resolved.skills`** (26), joint par slug à `layers.query({kind:"skill"})` pour la
**catégorie**. Les lignes d'outil viennent de **`layers.query({kind:"tool"})`** (36),
et leur palier courant se lit… ⚠️ **à toi de le mesurer** : `resolved.tools` ne
liste que les acquis. **Sonde d'abord, et si le palier d'un outil non acquis n'est
lisible nulle part, ARRÊTE et demande** — c'est une question de contrat, pas une
décision d'écran.

- Chaque ligne porte sa **caractéristique** et son **bonus** (`ability`, `bonus`).
- Le palier se choisit parmi ceux que `tier_costs` déclare, **jamais une liste en dur**.
- Une ligne avec un **plancher** porte son **cadenas + sa provenance**, jamais une saisie.
- *Reset* ne rend **que les points dépensés** — ⛔ il ne touche pas les imposés.

### 3b. La barre de catégories collante + le compteur

**Cinq sections** : `Knowledge · Social · Exploration · Physical · Tools & Trainings`,
**ordre alphabétique dans chaque catégorie** (ADDENDUMS). Le highlight suit le
défilement *(scrollspy)*, et un clic saute à la catégorie.

- ⚠️ **À 360 px, c'est la barre qui défile horizontalement**, pas la grille : le fil
  reste continu (décision d'Eric, base mobile 360). **Réemploie le composant de
  molette PLATE du lot 38** — ⛔ n'en écris pas un second.
- Le **compteur** (§2b) est collé **avec** la barre et défile avec elle.
- **`IntersectionObserver`** pour le scrollspy, pas un `scroll` qui recalcule 62
  positions à chaque image. ⚠️ **Et respecte `prefers-reduced-motion`** sur le saut
  de catégorie.

### 3c. Les clics — un seul chemin vers le moteur

Le modèle existe et il est bon : `applyDecisionAction` dans `shell.mjs` (lot 33).
**Chaque clic passe par un verbe, puis `rebuild()`, puis un rendu.**

- `set({ document, path:"fh.skills.spend.<slug>", value:"half"|"proficient"|"expertise" })`
- `clear({ document, path, kind:"choice" })` pour retirer
- `set(...)` sur `fh.skills.train.<slug>` avec un **booléen**

⚠️ **Chaque verbe REND `{document}`, il ne mute pas en place.** C'est ce
document-là qui passe à `rebuild`, jamais celui d'avant. *(Le commentaire de
`shell.mjs:54` le dit — le respecter n'est pas optionnel.)*

⛔ **Aucun calcul de règle dans l'écran.** Pas de somme de points, pas de coût
recalculé, pas de « est-ce que j'ai le droit ». Tu **affiches** ce que
`resolved.stats` et `validate()` disent. **Un écran qui recalcule masque les bugs
du moteur** — c'est la loi que `tests/render-fiche.test.mjs` garde déjà.

### 3d. Le dépassement et les refus — le moteur prononce

- Le clic **s'applique toujours**. Le compteur affiche **`6 OVER` en rouge**
  (`var(--critical)`).
- Le refus vient de **`validate()`**, et il arrive **keyé** : `{key, params, path?}`.
  L'écran pose sa marque **au chemin**, et le mot vient de `src/labels.mjs`.
- **Les clefs que tu dois savoir afficher**, mesurées dans le moteur :

| Canal | Clefs |
|---|---|
| le pool | `skill-pool.overspent` *(⚠️ **sans `path`** — c'est le total qui est fautif, pas une ligne)* · `skill-pool.no-tool` |
| une dépense | `skill-spend.option-unavailable` · `skill-spend.tier-invalid` · `skill-spend.below-floor` · `skill-spend.tier-locked` |
| un apprentissage | `skill-train.option-unavailable` · `skill-train.value-invalid` · `skill-train.level-locked` |
| une bourse captive | `skill-budget.overspent` · `skill-budget.option-unavailable` · `skill-budget.tier-invalid` |

⚠️ **`skill-pool.overspent` n'a pas de chemin** : ne cherche pas où le poser sur une
ligne. **Il appartient au compteur.**

### 3e. La notification du Rogue — une ligne, pas 62 pastilles

`class.data.fh_skill_pool.expertise_from_level` vaut **1** pour le rogue et **4**
pour les onze autres. Quand il vaut **≤ le niveau du personnage**, affiche **une
ligne** sous le compteur, en tête de grille :

> *Rogue — you may buy Expertise from level 1 (4 pts)*

⚠️ **Le « 4 pts » se lit dans `tier_costs.expertise`**, jamais en dur. Et le nom de
la classe vient du record, pas d'une liste dans l'écran.
📌 **Motif, écrit aux ADDENDUMS** : *« le moteur ne refuse pas, il n'annonce pas non
plus »* — **cette annonce est due par l'interface**, c'est pour ça qu'elle est ici.

### 3f. Le CSS — sur les jetons du lot 38, et sur rien d'autre

⛔ **Tout littéral que tu écris dans `shell.css` fait rougir
`tests/ui-jetons.test.mjs`.** C'est voulu. Si un cas légitime manque un jeton,
**tu l'ajoutes à `tokens.css` avec sa raison** — ⛔ jamais une exception dans la
feuille de composants.

⚠️ **Et l'écran doit tenir à 360 px** : 62 lignes à 3 colonnes, le fil continu, la
barre qui défile. **Mesure-le, ne le suppose pas.**

---

## 4. Les tests

⚠️ **Le patron du dépôt** : on teste **la fonction, pas la page**. `renderSkillsStep`
rend un nœud — il se teste **sans navigateur**. Précédent : `tests/render-fiche.test.mjs`
(*« elle porte sur la fonction, pas sur la page »*). ⛔ **N'ajoute aucun paquet.**

1. **Les 26 compétences apparaissent**, et le compte est **lu dans `resolved.skills`**,
   jamais écrit `26` en dur.
2. **Les quatre catégories rangent les 26** — 8 · 7 · 6 · 5, lues sur la couche.
3. **Les 36 outils apparaissent**, y compris ceux que le personnage n'a pas.
4. **Un clic sur un palier** produit **exactement un** appel de verbe, avec le bon
   chemin et la bonne valeur.
5. **REJET** : dépasser le pool → la dépense **est appliquée**, le compteur affiche
   `OVER`, et `validate()` répond **`ok: false`**. *(Les trois dans le même test :
   c'est la décision n°6 en entier.)*
6. **Le refus `skill-pool.overspent` s'affiche au COMPTEUR**, pas sur une ligne —
   le test le prouve en vérifiant qu'aucune ligne ne porte de marque.
7. **Keen Senses propose les TROIS** compétences (`survival · delve · vigilance`) et
   **le palier est libre** — le bogue du v1 ne revient pas.
8. **Le budget captif ne contamine pas le pool** : dépenser dedans laisse
   `fh:skill-points` **intact**.
9. **La notification du Rogue apparaît pour le rogue et PAS pour le magicien**, et
   son coût est lu dans `tier_costs`.
10. **Un plan incomplet reste valide** — un personnage en cours de construction
    n'est pas une faute.
11. **Un personnage SRD pur** (couche FH débrayée) : **aucune** de ces mécaniques
    n'apparaît, et l'écran ne casse pas.
12. ⚔️ **L'ATTAQUE** : un `resolved.stats` **menteur** (un total qui ne fait pas la
    somme de son détail) s'affiche **menteur**. ⛔ Un écran qui recalcule masque les
    bugs du moteur.
13. **Le garde du lot 38 reste vert** — et si tu l'as modifié, **dis lequel et
    pourquoi**.

**Deux attaques manuelles minimum** (routine du dépôt) : neutralise un garde,
vérifie que le test attendu **et lui seul** rougit, restaure, `diff` byte-à-byte,
suite complète rejouée.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs listés, verts au départ **et** à l'arrivée.
- `ui/builder/skills-step.mjs` réécrit · `shell.css` étendu **sans un littéral** ·
  ce qu'il faut dans `shell.mjs`.
- **`INVENTAIRE-LOT-39.md`** :
  - **où tu lis chaque chose** — une ligne par donnée affichée, avec sa rubrique
    d'origine. C'est le document qui empêchera le prochain écran de se tromper ;
  - **le palier d'un outil non acquis** : où tu l'as trouvé, ou **la question que tu
    as posée** si tu ne l'as pas trouvé (§3a) ;
  - **l'arbitrage §2c répété en toutes lettres pour Eric** : Languages sans
    sélecteur, Trainings sans catalogue ;
  - **la mesure à 360 px** : ce qui tient, ce qui déborde ;
  - **ce que tu as changé de cette commande, et pourquoi.**
- ⛔ Aucun `git push`, aucune fusion, **rien dans `src/`**.

---

⛔ **La règle qui ne change pas** : toute décision que cette commande ne couvre pas
→ **STOP, question à l'architecte.**

⭐ **Et tu as le droit de la contredire.** Quatre lots de ce chantier ont corrigé
leur architecte par la mesure — dont le lot 35, qui a eu raison **contre sa propre
commande**, et le lot 37, dont le §3c était **faux** et l'a démontré par une sonde.
**Si une de tes mesures contredit une ligne d'ici, c'est la mesure qui gagne, et tu
le dis.** Une commande de lot se relit **après chaque mesure**, pas seulement avant
de commencer.
