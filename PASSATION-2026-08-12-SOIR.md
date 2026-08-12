# Passation — fin de soirée du 2026-08-12

> **Pour le siège suivant.** Ce fichier ne remplace pas `ARCHITECTE.md` (le
> mandat, à lire en entier d'abord) : il porte **ce qui s'est décidé dans le fil
> du 2026-08-12 au soir**, et qui ne serait pas devinable autrement.
>
> ⚠️ **Il y a DEUX passations du 2026-08-12.** Celle-ci est la seconde.
> `PASSATION-2026-08-12.md` (le matin) reste utile pour son §8 (ce qui surprend
> dans le code) — **son §7 est consommé**, il l'annonce lui-même.

---

## 0. ⚠️ LIRE D'ABORD, DANS CET ORDRE

1. `ARCHITECTE.md` — le mandat.
2. 🥇 **`vault Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md`** — toute
   règle de jeu.
3. 🎨 **`vault Chantier FH & FHPC/FHV2 - Bible esthétique.md`** — **elle est
   neuve de ce soir**, et elle gouverne tout ce qui se dessine.
4. **`vault Chantier FH & FHPC/FHV2 - Schémas d'écran.md` §4** — l'étape
   Compétences, décidée point par point. **C'est la commande du lot 39.**
5. Ce fichier.

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`a423789`**, local = distant, **629 verts**, arbre propre |
| `fh-phb` `main` | **`c5b2f93`**, local = distant |
| `fh-srd` | `20c6598`, à jour |
| Échéance | **7 novembre 2026 — 87 jours** |

### ✅ RIEN N'EST EN VOL

**Aucun worktree sur `fhpc`, aucun lot en cours, aucune fusion à moitié.**
`origin` ne porte qu'une branche. C'est la première clôture aussi nette depuis
longtemps.

⚠️ **Une seule chose traîne, et ce n'est pas du ménage** : le worktree
`fh-phb/.claude/worktrees/youthful-taussig-bfa14e` (`797163d`) porte toujours les
**76 lignes non commitées** de `sync_from_vault.py`, ouvertes depuis le
**2026-07-27**. Décision d'Eric, jamais prise.

---

## 2. ⭐ CE QUE LA SOIRÉE A LIVRÉ

| | |
|---|---|
| **L'étape Compétences est SPÉCIFIÉE** | sept décisions d'Eric, vault `FHV2 - Schémas d'écran` §4 — **zéro ligne de code** |
| **La BIBLE ESTHÉTIQUE existe** | neuf sections, sept ratifiées, vault `FHV2 - Bible esthétique` |
| **La palette est ratifiée : PARCHEMIN** | `#F6F3EC` / `#14120E`, 18 jetons × 2 thèmes, valeurs dans `fh-phb/PALETTE-FHV2.json` |
| **Lot 36 `trainings` fusionné** | la troisième dépense du pool |
| **Lot 37 `pool-garde` fusionné** | le pool ne peut plus finir en dette |
| **Un cinquième conseiller créé** | `CONSEILLER-ESTHETIQUE.md`, **le premier joignable depuis le fil d'architecte** |

---

## 3. 🔴 LES QUATRE ERREURS DE CE SIÈGE — et la troisième est la plus chère

**Toutes mesurées, toutes corrigées. Le taux est le vrai signal.**

1. **« 360 n'officialise rien d'existant, c'est du papier blanc »** — **faux, et
   déjà commité** quand la mesure l'a démenti une heure plus tard.
   `UI-DIMENSIONS.md`, ratifié le **2026-08-02**, porte référence **425 × 680**,
   plancher de hauteur **620**, plancher de largeur **360**.
2. **Le critère de choix du ratio typographique était DÉGÉNÉRÉ.** Son optimum est
   « pas d'échelle du tout », 180 marches. Le conseiller esthétique l'a démonté —
   parce que sa commande lui demandait explicitement d'attaquer la conclusion de
   l'architecte.
3. 🔴 **Le §3c de la commande du lot 37 était FAUX, et le lot le construisait
   déjà.** Il demandait d'**ajouter** un plafond au budget captif d'espèce.
   Or `decisions.mjs` pose `skill-budget.overspent` **depuis le lot 34** : le
   défaut était que `validate()` ne lisait pas le carnet. **J'avais conclu d'un
   `validate().ok === true` que le contrôle manquait, sans regarder le carnet.**
4. **Un chiffre mal reporté** : « grand texte à voile 20 : 255, n'importe quelle
   image » — c'était **181**. J'avais lu mon étiquetage automatique au lieu de
   mon nombre.

📌 **LA LEÇON QUI SORT DE LA TROISIÈME, et elle est neuve** :
**une commande de lot se relit APRÈS CHAQUE MESURE, pas seulement avant le
lancement.** Un lot lancé sur un brief juste peut se retrouver, une heure plus
tard, à construire une pièce que la mesure vient d'invalider.

⚠️ **Et le corollaire de sécurité** : avant de toucher un worktree, **regarde
`git status`**. Ce siège a failli écraser 104 lignes non commitées d'un lot qui
travaillait — dernière écriture **51 secondes** plus tôt.

---

## 4. LES DÉCISIONS D'ERIC — ce qui est ratifié et ne se rouvre pas

### L'étape Compétences *(détail : vault `FHV2 - Schémas d'écran` §4)*

Une seule page qui défile · la colonne *Floor* supprimée · **chaque source pose
son choix chez elle** (la grande grille ne porte que le pool libre) · trois
sous-blocs sous *Tools & Trainings*, *Trainings* **grisé** au niveau 1 · le
compteur à **trois bourses qui ne s'additionnent pas** · le dépassement toléré
puis refusé par `validate()` · la notification du Rogue en **une ligne**.

### La bible esthétique *(détail : vault `FHV2 - Bible esthétique`)*

Les **noms voyagent, les valeurs sont locales** · les noms **T1–T7** repris du
dock (⛔ **pas `H1/H2`**) · **trois grandeurs**, seuils **calculés** 720 / 1140,
base mobile **360 px** · la ceinture en **molette plate qui flotte** (⛔ pas de
repli 4+3) · **le relief est une information** (barillet = on choisit une valeur,
plat = on navigue) · **trois régimes de verre** selon la **densité
d'information** (voile 20 / 50 / 100) · la palette **parchemin**.

### 🎨 LE CHOIX D'OVERLAY D'ERIC — à ne pas laisser tomber

**Eric a choisi le PARCHEMIN pour la dalle** (`#F6F3EC` / `#14120E`) devant trois
familles entièrement calculées. **Et il a explicitement demandé de garder les deux
autres** : *« tu peux garder ça en tête pour des changements d'UI ».*

**Elles ne sont donc pas écartées : elles changent de statut.** Ce sont les **deux
premiers thèmes d'habillage du FH overlay**, et elles arrivent déjà **calculées et
mesurées** — 18 jetons × 2 thèmes chacune.

| Famille gardée | Dalle jour | Dalle nuit |
|---|---|---|
| **Bleu gris** | `#E9EDF2` | `#141A20` |
| **Bleu gris profond** | `#DFE5EC` | `#0E1318` |

⚠️ **Le défaut à réparer le jour où l'une est activée, et il est mesuré** : sur un
fond bleu, `info` tombe à **1,3°** (et **0,2°** pour la profonde) de la teinte de la
dalle. Le contraste tient, la **distinction de teinte** non — le bleu de provenance
n'est plus une *autre* couleur, c'est la dalle en plus foncé. **Décaler `info` vers
le turquoise (~190°)** dans ces deux thèmes.

📌 **Et c'est précisément ce à quoi sert la règle des jetons** : changer de famille
est un **changement de valeurs, pas de composants**. Les trois familles vivent dans
**`fh-phb/PALETTE-FHV2.json`**, commitées.

### Les deux arbitrages d'architecte à SIGNALER À ERIC

| | |
|---|---|
| **« ≥ 1 point en outils » s'applique à TOUT niveau** | les addendums disent « à la création » ; le moteur ne voit pas un instant, il voit un document. **Révocable d'un mot.** Le lot 37 le répète dans son inventaire |
| **Le verrou de niveau d'un training est GLOBAL** | lu sur le record du training. Les addendums disent que la dérogation est portée par un feat, une classe, une espèce ou une **sous-classe** — donc **par personnage**. Sans effet tant qu'aucune sous-classe n'existe |

---

## 5. LA SUITE — et il ne reste que deux lots avant l'écran

| | Lot | Ce qu'il porte |
|---|---|---|
| 1 | **`38-jetons-surfaces`** | l'échelle et l'inventaire des surfaces, les valeurs de `PALETTE-FHV2.json`, et **les trois bugs vivants** ci-dessous |
| 2 | **`39-etape-competences`** | l'écran, sur le §4 du vault |

Puis : les sept étapes restantes → la fiche → M4.

### 🐛 LES TROIS BUGS VIVANTS DE LA COQUILLE — pour le lot 38

| Bug | Mesure |
|---|---|
| `shell.css:90` et `:110` | `color: #fff` **en dur** sur `var(--accent)` → **2,44:1** en mode sombre. **Le verbe principal du builder échoue AA aujourd'hui** |
| `shell.css:112` | lit `--decide`, **jamais défini nulle part** ; son repli fait 3,49:1 |
| La ceinture à 360 px | **7 places** en pastilles pour **9 étapes** — et `shell.css:137` **efface les libellés**, ce que le cadre d'Eric interdit |

### ⚠️ ET LE DÉFAUT DE FOND, MESURÉ

`ui/builder/engine.mjs` monte le moteur **sans `modules:`** → `resolved.stats`
revient **vide** : **l'écran du builder ne voit pas le pool du tout.** Avec le
module injecté, le même document rend `fh:skill-points = 10`. À réparer par le
lot qui touchera l'écran.

---

## 6. CE QU'IL FAUT SAVOIR DU CODE, ET QUI SURPREND

- ⚠️ **La loi §0.12 est gardée sur les OCTETS, commentaires compris.** Le lot 37
  s'est mis rouge en écrivant, dans un commentaire de `src/build/derive.mjs`,
  *« ce fichier ne connaît pas `tier_costs` »* — **la phrase qui explique la loi
  la viole**.
- ⚠️ **`projectDecisions` n'était appelé QUE dans `rebuild`** (`block.mjs:326`).
  `validate()` le fait désormais aussi — et **un plan simplement incomplet n'a
  pas de `.lock`**, donc un personnage en cours de construction reste valide.
- **Deux canaux de refus, pas un** : `outcome.violations` (module → `derive` →
  `moduleViolations` → `validate`) et `decisions[].lock` (→ `validate` depuis le
  lot 37). Un lot qui ajoute un refus doit savoir lequel il emprunte.
- **`resolved` a 21 clefs obligatoires**, et `traits[].category` est arrivé au
  schéma avec le lot 36 — facultatif, énumération **fermée** à `training`.

---

## 7. CE QUI ATTEND ERIC

1. Les **76 lignes** de `sync_from_vault.py` (§1).
2. Le **site publié est en retard** : `fh-phb/docs/chapters/dark-rituals.md` porte
   encore les anciens noms de rituels. C'est une **copie générée** — jamais
   corrigée à la main. Lancer la sync est son geste.
3. Les **dettes de règles** restantes des ADDENDUMS §5 : le plafond de 18, les
   caracs `3d6 × 10 keep 6`, les cartes de Destinée tirées, les modifications de
   classes et les sous-classes FH.
4. Le **FH overlay** : l'architecture canonique ne prévoit pas ce troisième objet.
   À trancher avant de dessiner.
5. Les **quatre questions de goût** encore ouvertes de la bible §6b : le plafond
   de mesure, le nombre de marches, la serif de lecture, et ce que « la zone
   menu » désigne.

⛔ **Mais aucune de ces cinq ne bloque le lot 38 ni le lot 39.**
