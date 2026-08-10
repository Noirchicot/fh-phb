# Passation — fin de session du 2026-08-10

> **Pour le siège suivant.** Ce fichier ne remplace pas `ARCHITECTE.md` (le
> mandat, à lire en entier d'abord) : il porte **ce qui s'est décidé dans le
> fil du 2026-08-10** et qui ne serait pas devinable autrement.

---

## 0. ⚠️ LIRE D'ABORD, DANS CET ORDRE

1. `ARCHITECTE.md` — le mandat. Son en-tête porte maintenant la **hiérarchie
   des sources**, ratifiée ce jour.
2. 🥇 **`vault Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md`** —
   **la source de vérité n°1 pour toute règle de jeu.** Créée ce soir,
   précisément parce que ce siège a codé une règle sans l'avoir lue.
3. Ce fichier.

**La hiérarchie, en cas de contradiction :**
**1. ADDENDUMS → 2. le moteur (`fhpc`) → 3. le site web → 4. le vault.**

⛔ **NE CODE JAMAIS UNE RÈGLE DE JEU SANS AVOIR LU LES ADDENDUMS.**

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`6ee1e9e`**, local = distant, **589 tests verts**, arbre propre |
| Worktrees | **aucun** — rien en vol |
| `fh-phb` | ⚠️ 3 fichiers non commités : `ARCHITECTE.md` modifié, `LOT-28-…md` et `LOT-34-…md` non suivis |
| Échéance | **7 novembre 2026** — 89 jours au moment de la clôture |

⛔ **REMESURE CES SHA** (`git ls-remote origin refs/heads/main`) — ils vivent
quelques minutes ici.

### Lots fusionnés dans cette session

`30` coquille du builder · `31` coquille en anglais · `32` moteur portable
navigateur · `33` étape Compétences branchée · `34` paliers de compétence +
budget captif.

---

## 2. ⭐ CE QUI A CHANGÉ DANS LA FAÇON DE TRAVAILLER — le plus important

Trois protocoles ont été ratifiés par Eric ce soir. **Ils priment sur
l'habitude de ce siège.**

### 2a. Les règles de jeu se demandent, elles ne se devinent jamais

Eric : *« corrige-moi tout de suite sur les RÈGLES, laisse-moi courir sur le
CODE »*. Motif : **aucun garde ne peut mordre sur une règle fausse.** Un test
attrape un défaut de code ; rien ne peut dire à ce siège « chez Eric, les
compétences sont un pool à dépenser, pas une liste à cocher ».

### 2b. Le protocole étape par étape du builder

**Avant de coder chaque étape** : ce siège dit **ce que LUI veut changer** par
rapport au builder de référence, **demande à Eric ce que LUI veut changer**, et
on agit sur cette base. Pas de correction après coup.

### 2c. Reconstruire, jamais rafistoler

Eric : *« je ne veux pas qu'on patche. Si des pièces sont défectueuses, la
machine doit permettre qu'on puisse facilement les reconstruire. »*

### 2d. Montrer la trace, pas seulement la prose

Eric n'est pas programmeur ; **sa limite déclarée est la compréhension de ce
qui est construit**. Quand le moteur produit une trace exploitable (`breakdown`,
provenance, clef de refus), **la lui montrer telle quelle** au moins une fois
avant de la résumer — sinon il ne peut vérifier qu'une traduction.

---

## 3. 🔴 L'ERREUR DE CE SIÈGE, ET ELLE EST STRUCTURELLE

**L'étape Compétences (lot 33) rend le mécanisme SRD — « choisis 2 parmi 7 » —
alors que Fate's Hand est un POOL dépensé par paliers sur 62 lignes.**

Ce n'est pas un bug : c'est le rendu fidèle de ce que le moteur exposait
alors. Mais **le moteur exposait du SRD**, et ce siège a traité le substrat
comme la cible. Eric, en une phrase : *« si tu montes un builder FH, ce que tu
fais est faux »*.

📌 **La règle qui en sort** : *quand ce que le moteur expose ne ressemble pas
au système d'Eric, ce n'est pas un écran à habiller — c'est un trou de moteur
à combler.*

⚠️ **Conséquence directe : `ui/builder/skills-step.mjs` EST À REFAIRE.** Le
moteur porte maintenant la vraie mécanique (lot 34) ; l'écran non.

### Le pourquoi profond : les règles étaient noyées

Les décisions d'Eric vivaient dans **cinq** endroits (≈ 4 400 lignes). La règle
Keen Senses était écrite, juste et complète, **ligne 214 du vault** — et n'a
pas été trouvée. **La page ADDENDUMS existe pour que ça cesse.**

⚠️ Un fil d'architecte antérieur avait **interdit à Eric de créer une nouvelle
source de vérité**. Eric a montré l'incohérence : ses changements n'étaient
donc notés nulle part, et ce siège ne s'en souvient pas. **Cette interdiction
est levée** — les ADDENDUMS sont la source n°1.

---

## 4. LES RÈGLES TRANCHÉES CE SOIR

**Toutes sont dans les ADDENDUMS.** Résumé de ce qui est neuf :

| Règle | Statut |
|---|---|
| **Keen Senses** — 2 points captifs de `{survival, delve, vigilance}`, ½ sur deux OU plein sur une | ✅ **implémenté** (lot 34) |
| **Skillful ≠ Skilled** — Skillful (espèce) = **+2** ; Skilled (don d'origine) = **+6**. Confusion déjà survenue | ✅ juste au moteur |
| 🔴 **Rogue** : son Expertise SRD niveau 1 est **comptée dans son pool** → il achète de l'expertise **dès le niveau 1**, sur 2 compétences | ❌ **NON implémenté** — les 12 classes ont `expertise_from_level: 4`. **Correctif = une valeur de CONTENU** |
| **Bard** (Expertise niv. 2) et **Ranger** (Deft Explorer niv. **2**, pas 3) **ne dérogent pas** — mesuré au SRD 5.2 | ✅ rien à faire |
| **Conversion** : ce qui arrive au **niveau 1** devient des points ; **niveau 2+** reste aptitude RAW. **Une exception : Jack of All Trades** (refondu : +1 pt/niveau dès le 2) | ✅ implémenté |
| 🔴 **Plafond de 18** par caractéristique en sortie de création, bonus inclus | ❌ **NON implémenté** |
| **Caracs** : `3d6 × 10 jets, garder les 6 meilleurs, relancer le lot si aucun 15` | ❌ non implémenté |
| **Cartes de Destinée** : elles se **TIRENT** | ❌ non vérifié |
| ⚠️ Tirage des caracs **et** tirage des cartes doivent exister comme **OPTIONS** (tirage ou choix) | — |

### La philosophie de création — le concept d'Eric

Les règles classiques forcent l'Historique en premier, donc **on sacrifie
l'histoire à l'efficacité**. Sa réponse : **découpler**. D'abord l'optimisation
libre (caracs, don), **ensuite** le pool de compétences ; **l'Historique se
construit à la fin**, comme justification narrative d'un build déjà satisfait.

**Pourquoi les COMPÉTENCES portent l'originalité** — son raisonnement :
les caracs, on les colle à sa classe ; le don est un tweak d'efficacité ;
**les compétences, elles, singularisent**. D'où leur découplage.

📌 **Aucun changement de moteur requis** : *« peu importe l'ordre du choix, tu
as la capacité de revenir en arrière »*.

---

## 5. LA PROCHAINE ÉTAPE — cadrée avec Eric, prête à coder

**Refaire l'étape Compétences**, présentation calquée sur
`~/tools/fh-skills/fh-skill-builder.html` (**référence de FORME**, pas de
chiffres — plusieurs y sont périmés, voir ADDENDUMS).

**Accord obtenu, point par point :**

| | Décision |
|---|---|
| **Keen Senses** | résolu **en premier**, encadré séparé, **puis figé** |
| **Lignes imposées** | **encadré rouge + icône de verrou + l'ORIGINE marquée** (`class` / `species` / `background`, ou l'icône de la classe). Le carnet de décisions porte déjà cette provenance |
| ⭐ **« Verrou » = PLANCHER, pas gel** | Mesuré dans le builder d'Eric : la colonne `lock` porte *« Starting floor — can't invest below this »*, et `belowLock()` ne teste que le sens descendant. Donc **une ligne imposée est posée à ½ et reste MONTABLE** au prix de la différence. C'est déjà le comportement du moteur (vérifié : arcana ½→Prof, bonus 3→4, pool 7→6) |
| **Paliers achetés** | pastille de couleur **distincte** de celle des acquis |
| **Expertise** | bouton **éteint** avant le niveau 4 + raison au survol — pas un avertissement après coup |
| **Repris tel quel** | barre `Pool / Spent / Left` + jauge, détail du pool, recherche, grille **compétences + outils mêlés**, ◆ pour les FH, avertissements en bas |

📌 **Le pool affiché est DÉJÀ « ce qu'il reste à dépenser librement »** — la
soustraction des imposés est de la comptabilité interne, jamais montrée. Eric
demandait « on ne les compte plus dans le pool » : c'est déjà le cas de son
point de vue.

### Ce qui suit, dans l'ordre recommandé

1. Payer la dette **Rogue** (valeur de contenu, ~10 min).
2. **Refaire l'étape Compétences** (ci-dessus).
3. Câbler les **7 étapes restantes** — le patron est prouvé de bout en bout.
4. La **fiche** de personnage.
5. **M4** : vue de jeu + transport de table.

---

## 6. CE QU'IL FAUT SAVOIR DU CODE, ET QUI SURPREND

- ⭐ **Le moteur tourne DANS le navigateur, sans serveur ni bundler** (lot 32).
  `src/build/*` et `src/layers/*` sont du JS portable ; le seul verrou était
  `node:crypto`, remplacé par un SHA-256 portable **vérifié byte-à-byte** contre
  `node:crypto` sur cinq vecteurs. Prouvé en vrai : pile réelle montée par
  `fetch()` dans un onglet, `rebuild()` sur le vrai personnage.
- ⚠️ **La loi §0.12 mord fort** : `tests/fh-skill-pool.test.mjs` (ACCEPTATION 4)
  interdit les mots `expertise`, `fh_skill_pool`, `tier_costs`, `imposed`,
  `Fast Learner`, `Educated` dans **tout fichier de `src/build/`,
  commentaires compris**. C'est ce qui a forcé le lot 34 à mettre toute la
  logique de palier dans le module FH. **Ne t'y casse pas les dents : c'est
  voulu.**
- **Le carnet `decisions`** (lot 28) est rendu par `rebuild`, **générique** — une
  entrée par point de décision, jamais par étape. Ne le grave pas par étape.
- **Les violations sont keyées** (lot 27) : `{key, params, path?}`, avec un
  `toString` **non énumérable** qui rend la phrase française d'avant. Deux
  entonnoirs déclarés : `derive.threw` et `document.invariant-violated`.
- ⚠️ **Ne jamais grouper des décisions par TEXTE de chemin.** Le vrai chemin du
  choix de l'Elfe est `species.keenSenses` — le nom de SON trait. Grouper sur
  `provenance.field` (`skill_choice` / `granted_skill_budget`). Bogue payé deux
  fois au lot 33.

---

## 7. LA MÉTHODE DE REVUE — elle a payé quatre fois cette session

**Ne crois jamais le rapport d'un lot. Remesure.**

Cette session : le lot 27 a corrigé son architecte **trois fois** (comptage
faux, deux consignes contradictoires, contrainte de slug recopiée sans son
motif) ; le lot 28 a été **renvoyé** pour une double implémentation de la
légalité des compétences — latente, mais que le homebrew tiers aurait
atteinte.

**La routine, sans raccourci** : diff depuis la **base commune** · attaquer les
gardes **soi-même** · rejouer dans un **clone indépendant avec `npm install`**
(piège `ajv` 8.18/8.20) · fusion **à blanc** puis vraie · suites rejouées
**après** · tableau de bord et vault mis à jour.

⚠️ **Et ce siège s'est trompé cinq fois ce soir**, toujours de la même façon :
*mesurer le mauvais objet*. Dont une où il a présenté le builder du site comme
la référence sur des chiffres **périmés**, alors que le vault avait déjà
tranché. **Quand une mesure surprend, suspecter d'abord son propre protocole.**

---

## 8. CE QUI ATTEND ERIC

1. **Commiter `fh-phb`** — 3 fichiers en attente (mandat + 2 commandes de lot).
2. Les **5 dettes de règles** des ADDENDUMS §5 — la n°1 (Rogue) est la plus
   rapide.
3. Le worktree `fh-phb/.claude/worktrees/youthful-taussig-bfa14e` à `797163d` —
   les 76 lignes non commitées de `sync_from_vault.py`, ouvert depuis le
   2026-07-27.
