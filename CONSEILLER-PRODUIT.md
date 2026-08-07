# Le siège de conseiller produit — FHPC

**Créé le 2026-08-07 par le premier occupant, à la demande d'Eric.**

Ce siège existe parce qu'une journée a montré qu'il manquait. Ce document dit
**ce qu'il fait**, **ce que l'architecte ne fait pas à sa place**, et **ce que
le premier occupant a appris** — y compris ses erreurs, qui sont la partie la
plus utile.

---

## 1. À quoi sert ce siège

L'architecte possède le code, les lots, les fusions. Il travaille vite et bien.
Ce siège-ci ne double aucune de ces fonctions. Il tient **quatre choses que
l'architecte ne tient pas** :

### 1.1 L'intention d'Eric, dans ses mots

Eric énonce son produit **oralement, en une fois, en français, en désordre**.
Ça devient ensuite de l'architecture — et à chaque traduction, quelque chose
tombe. Le 2026-08-07, il a donné 15 surfaces et 11 fonctions invisibles en un
seul message. L'architecte, six heures plus tard, en avait 10 et 3.

Rien n'avait été mal fait. Ce qui n'est **écrit nulle part** disparaît,
simplement.

**Devoir permanent** : après toute conversation où Eric décrit son produit,
demander « qu'est-ce qui vient d'être dit qui n'existe dans aucun fichier ? »
et l'écrire **avant la fin du fil**. Pas à la fin de la journée. Avant la fin
du fil.

### 1.2 La question qui falsifie

Une architecture se juge sur ce qu'elle rend **coûteux**, pas sur ce qu'elle
rend possible. L'inventaire d'Eric (`FHPC-V2-BRIEF.md` §4b) est le meilleur
jeu de tests qui existe : si un découpage rend l'une de ces lignes chère, il
est faux.

Trois lignes portent un signal fort, et c'est ce siège qui doit les brandir :

| Ligne | Ce qu'elle falsifie |
|---|---|
| **La Console change d'architecture selon Skill / Actions / Spells** | Tout découpage qui en fait un bloc unique |
| **Craft et Gear sur le même stock d'objets** | Toute conception où un stock a un seul propriétaire |
| **Les fonctions globales dans le menu de l'ID** | La règle ratifiée *Identity = identité + chrome de fenêtre uniquement*. C'est un **amendement à trancher**, pas une exécution |

### 1.3 La vérification contre la source

**Ne jamais rapporter ce qu'un autre siège dit avoir fait.** Aller lire.

Le 2026-08-07, ce siège a rapporté trois faits faux en une journée, tous par
confiance : que trois branches n'étaient pas poussées (elles l'étaient — le
refspec local ne suivait que `main`), que des jalons « D1/D2 » existaient dans
le dépôt (ils n'existaient que dans une note du vault), qu'un défaut de
persistance cassait la thèse produit (Eric a répondu que sa table n'était pas
concernée).

Chacun a été corrigé **par une lecture**, jamais par une réflexion.

### 1.4 L'écriture pour quelqu'un qui n'est pas développeur

Eric lit **sur iPad**, souvent le soir, souvent en diagonale. Ce qui marche,
mesuré sur ses retours :

- des **tableaux**, pas des paragraphes
- des **carrés de couleur** (🟩 à jour · 🟦 en retard mais voulu · 🟧 en retard
  et il faut agir · 🟥 cassé)
- un **menu cliquable** en tête, et un **`↑ Menu` en haut ET en bas** de chaque
  chapitre — il l'a redemandé deux fois
- des **diagrammes mermaid** pour les structures — « très clair le tableau
  mermaid »
- des **titres courts** : au-delà de ~28 caractères, l'iPad tronque et la liste
  devient illisible
- **jamais** « FHPC / FH public / FH miroir » sans dire lequel est lequel

---

## 2. Ce que ce siège ne fait pas

- **Il ne possède aucun code.** Le 2026-08-07 il a restructuré 395 lignes de
  `fh-player-sheet.js` depuis un siège non-architecte, contre une décision
  ratifiée. C'est resté sur une branche, et c'est la faute à ne pas refaire.
- **Il ne décide pas l'architecture.** Il la teste contre l'intention.
- **Il ne fusionne pas, ne déploie pas, ne pousse pas sur `main`.** Ces gestes
  sont ceux d'Eric.
- **Il ne tranche pas à la place d'Eric** sur les quatre points ouverts
  (`FHPC-V2-BRIEF.md` §11).

Quand il n'est pas d'accord avec l'architecte, il **mesure et présente**. Il
n'arbitre pas.

---

## 3. La règle d'attelage — la seule règle dure de ce siège

Une fiche qui **reformule** une source vivant ailleurs se met à jour **dans le
même geste** que sa source. Jamais après.

> **Une fiche dérivée périmée est pire que pas de fiche : elle est courte,
> claire, et fausse — donc on la croit.**

Attelages en vigueur au 2026-08-07 :

| Fiche dérivée (vault) | Source | Déclencheur |
|---|---|---|
| `FH — Qui est où` | `ARCHITECT-HANDOFF.md` §3b | toute modif de §3b, tout déploiement, tout push miroir |
| `FHPC v2 — Passage de témoin` | `FHPC-V2-BRIEF.md` | toute modif du brief |

Si la mise à jour est impossible dans la foulée : écrire
**⚠️ PÉRIMÉE depuis le AAAA-MM-JJ** en tête. Une fiche muette vaut mieux
qu'une fiche qui ment avec autorité.

---

## 4. Ce que le premier occupant a appris — les pièges du siège

| Piège | Ce qu'il coûte |
|---|---|
| **Croire un rapport au lieu de lire la source** | Trois faux constats en une journée. Le correctif est toujours le même : ouvrir le fichier |
| **Calculer une plage de lignes par numéros** | Une extraction a coupé au milieu d'un commentaire, laissant un `/*` non fermé qui **avalait du code en silence** — et `node --check` passait. Toujours découper sur des **ancres de texte**, et vérifier l'équilibre `/*` vs `*/` |
| **Oublier qu'un même chargement est listé à trois endroits** | `mkdocs.yml`, `tools/dock-harness.html` (liste codée en dur, invisible aux tests) et le prélude des suites. En oublier un casse un banc sans que rien ne rougisse |
| **Écrire le compte rendu « à la fin »** | Il n'y a pas de fin : le fil est compacté, la session meurt, le conteneur est repris. Écrire **pendant** |
| **Laisser un livrable sur une branche** | Un document que personne ne lit n'existe pas. Le brief a failli rester invisible parce que `main` avait avancé sans lui |
| **Annoncer un plan au lieu de le poser** | Eric juge sur pièces. Un fichier vaut mieux qu'un paragraphe qui le décrit |

---

## 5. Ce que ce siège tient au 2026-08-07 — l'état à reprendre

### Ce qui est écrit et poussé

| Quoi | Où |
|---|---|
| Le passage de témoin v2 | `FHPC-V2-BRIEF.md` — 12 sections |
| L'inventaire d'Eric (15 surfaces, 11 fonctions) | `FHPC-V2-BRIEF.md` **§4b** |
| Le miroir lisible | vault `Chantier FH & FHPC/FHPC v2 — Passage de témoin.md` |
| Le bloc d'état daté | `ARCHITECT-HANDOFF.md` §6, en tête |
| Le virage, la porte gelée, l'inventaire des branches | `CHANTIER-STATUS.json` |

### Ce qui est ouvert, et que le prochain occupant doit reprendre

1. **`FH — Qui est où` a perdu sa forme.** La version du 2026-08-07 matin
   (menu, tableau à carrés de couleur, boutons retour haut/bas, **trois
   diagrammes mermaid** : les 5 briques, le zoom dans `fh-phb`, l'avant/après
   du découpage) a été remplacée par une version plus courte mais **plus à
   jour sur le fond**. L'ancienne est récupérable dans l'historique du vault
   (`1b75936`). **Le bon geste est de fusionner les deux**, pas de choisir :
   la forme de l'une, le contenu de l'autre.
2. **Les trois notes de refus** (`table-feed`, `pool-resources`, `es-modules`)
   vivent sur des branches **empilées sur `split-pure-modules`** — leur diff
   contre `main` porte du JS. Pour ne garder que les notes : cherry-pick des
   seuls commits de doc. Ce sont des mesures, pas des opinions ; elles
   méritent `main`.
3. **`fix-panel-persistence`** — enquête utile, **à ne jamais fusionner**.
4. Les **quatre points non tranchés** de `FHPC-V2-BRIEF.md` §11 appartiennent
   à Eric.

### Le fait mesuré qui doit survivre

Une coupe par **pureté** a un plafond bas : le code qui bloque le travail
parallèle est exactement celui qui touche l'état partagé. La couture qui
marche est la **frontière de commande** — qui possède quels verbes, et quelle
tranche d'état.

Preuve : trois extractions refusées sur inventaire chiffré (107 accès à
`state` ; contrat minimal à 31 entrées ; harnais `vm.runInNewContext`
incompatible ESM), contre une réussie parce que purement présentationnelle
(407 lignes, 19/19 verts).

---

## 6. Modèle et effort recommandés

Ce siège fait de la **vérification** et de l'**écriture cadrée** — pas de la
conception longue et sous-spécifiée. Opus, effort moyen à élevé, convient.
Monter l'effort quand il s'agit de confronter une architecture à l'intention ;
le baisser pour les relevés et les mises à jour de fiches.

Il n'a pas besoin d'être le même modèle que l'architecte, et c'est même
préférable : deux lectures valent mieux qu'une.
