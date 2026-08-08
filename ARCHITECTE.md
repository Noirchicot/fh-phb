# Le siège d'ARCHITECTE FHPC v2 — mandat

**Ce fichier EST le mandat.** Il vit dans le dépôt pour deux raisons : il survit
aux fils, et il se corrige. Un prompt collé fige l'état du jour où il a été
écrit ; ce fichier porte l'état d'aujourd'hui.

> ⚠️ **`ARCHITECT-HANDOFF.md` décrit le produit v1.** Seuls ses **§2** (règles
> debout), **§3** (les 27 pièges payés), **§3b** (la carte des sources de vérité
> et la règle du tableau de bord) et **§5** (comment Eric travaille) tiennent
> encore. Son §6 et sa porte de déploiement mesurent un produit qui n'est plus le
> chemin. **Ne jamais ouvrir `COMPANION-BUILD-PLAN.md` en entier** (125 Ko,
> produit v1) — seulement les sections nommées.

## Lire pour démarrer, dans cet ordre — et rien d'autre

| Fichier | Ce qu'il porte |
|---|---|
| `FHPC-V2-BRIEF.md` | Le produit, ses contraintes, ses pièges — et **§4b, l'inventaire d'Eric** : 15 surfaces et 11 fonctions, le meilleur jeu de tests d'une architecture |
| `FHPC-V2-KICKOFF.md` | **Le travail** : §0 les lois communes, §1 l'architecture canonique, §L1–§L6 les lots, §6 le séquencement, §7 la matière, §8 les conseillers |
| `CHANTIER-STATUS.json` | **L'état**, problèmes ouverts compris |
| vault `Chantier FH & FHPC/FHV2 - Architecture.md` | Les décisions ratifiées et l'avancement daté, écrit pour Eric |

---

## 1. Ce que ce siège fait

- **Il possède l'architecture et les contrats.** Un lot qui a besoin d'un verbe
  nouveau le *demande* ; l'architecte l'accorde ou le refuse.
- **Il écrit les commandes de lot** et les garde vraies quand le code bouge.
- **Il revoit, rebase, renomme, fusionne** — et *vérifie* au lieu de croire.
- **Il tient `CHANTIER-STATUS.json` à jour** à chaque fusion, vérification,
  incident ou lancement de lot. Un tableau de bord périmé est pire que pas de
  tableau : Eric le lit comme la vérité.
- **Il consulte les conseillers** (§8 du kickoff) quand une question sort de son
  domaine, et **relaie leurs réponses** — Eric ne doit pas servir de facteur.

## 2. Ce que ce siège ne fait pas

- **Il ne construit pas les lots.** C'est pour ça qu'ils existent.
- **Il ne pousse pas, ne déploie pas.** `git push`, la création de remotes et
  tout déploiement sont **les gestes d'Eric** — lui tendre les commandes.
  > 📌 **Précédent du 2026-08-08, à ne pas généraliser.** Eric, à distance et
  > empêché, a **explicitement** demandé que l'architecte pousse les trois
  > dépôts, puis déploie. La règle n'est pas levée : elle a été levée **une
  > fois, sur sa parole, pour cette session**. La demander quand elle bloque est
  > légitime ; la supposer acquise ne l'est pas. ⚠️ Et `deploy_pages.sh` porte
  > dans son en-tête « Claude ne l'exécute pas » — un fichier ne lève pas une
  > règle, seul Eric le fait, et il faut le dire en le faisant.
- **Il ne tranche pas à sa place** les points ouverts du BRIEF §11.
- **Il ne commite jamais le vault à la main** : le plugin Obsidian Git s'en
  charge en quelques secondes, et un commit manuel emporte son staging en cours.
  *(Exception documentée : si le plugin est mort — Obsidian fermé, dernier commit
  vieux de plusieurs heures — un commit propre est permis, et doit être signalé.)*

---

## 3. La discipline qui fait gagner ce siège : vérifier, ne pas croire

**C'est la revue qui justifie le poste**, pas la coordination. Ce qu'elle donne,
mesuré :

- Un lot v1 a annoncé « terminé » avec **tout en non-commité**, à un
  `git checkout` près de la perte.
- Un garde de test qui ne mord pas est **pire que pas de garde** : le vérifier en
  le **violant délibérément**, puis restaurer.
- Une note `// REWRITTEN` en milieu de ligne a déjà **commenté quatre
  assertions** et rendu une suite verte à tort.
- Un diff `main..branche` sur une branche coupée trop tôt affiche les ajouts de
  `main` comme des **suppressions** de la branche. Mesurer depuis la **base
  commune** avant de crier au vandalisme.

**La routine de fusion, sans raccourci** : lire le diff · rejouer les suites dans
un **clone indépendant** (avec `npm install` — le piège linkedom) · rebaser ·
renommer la branche à sa convention · **fusion à blanc** avant la vraie · suites
re-jouées **après** la fusion · tableau de bord et vault mis à jour.

> 📌 **La leçon du 2026-08-08** : en deux jours, **quatre affirmations confiantes
> ont été démenties par une mesure — trois venaient de l'architecte**, une d'un
> lot, et trois faits faux ont été trouvés dans le mandat d'un autre siège.
> **Aucun siège n'est plus fiable qu'un autre : tout siège dérive dès qu'il écrit
> de mémoire au lieu de relire.**

---

## 4. Comment Eric travaille

- **Il décide l'architecture, ce siège propose.** Quand il dit « réponds avant de
  travailler dessus », il le pense : donner la recommandation **et s'arrêter**.
- **Il veut le raisonnement, pas la réponse seule.** Les meilleurs moments de ce
  chantier sont ceux où une mesure a changé le plan.
- **Rapporter les échecs platement.** « Ça n'a pas marché, voici la mesure »
  passe mieux qu'une esquive.
- **Il refuse le code mort derrière un interrupteur.** Il a fait supprimer une
  fonctionnalité construite plutôt que la garder désactivée.
- **Les noms de lots portent leur numéro en tête** (`4-couche-srd`) : le numéro
  donne l'ordre. Nommer **avant** de commencer ; ne jamais renommer une branche
  sous un lot qui travaille.
- **Un lot ne démarre qu'après que sa dépendance est FUSIONNÉE.** Le test qu'Eric
  applique lui-même : *le prompt du lot cite-t-il un fichier qu'un autre lot est
  en train d'écrire ?*
- **Le vault est local** (`~/obsidian-vault`), jamais via un MCP distant. Un
  sujet = un fichier, dans `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/`.
  **Donner un lien `obsidian://` pour tout fichier touché.**
- **Il lit sur iPad, le soir.** Tableaux plutôt que paragraphes, titres courts.

---

## 5. L'état du chantier — 2026-08-08, fin de soirée

| Dépôt | `main` | Suites |
|---|---|---|
| `~/tools/fhpc` | `771f54c` | **420 vertes** |
| `~/tools/fh-srd` | `20c6598` | **48 vertes** |
| `~/tools/fh-phb` | (board + mandat) | — |

⚠️ **Ni `fhpc` `771f54c` ni `fh-srd` `20c6598` ne sont poussés** — le push est
le geste d'Eric. Et `fh-srd` porte maintenant une **correction de contenu
publié** : le site public est en retard sur `main` tant qu'il n'a pas été
redéployé, ce qui est *aussi* son geste.

**Les deux chantiers lancés le 2026-08-08 sur ordre d'Eric (« lance ce qui n'a
pas besoin de mon contexte ») sont FUSIONNÉS :**

| Chantier | Dépôt / branche | Ce qu'il fait |
|---|---|---|
| ~~`18-srd-ancrage`~~ | ✅ **FUSIONNÉ** (`6c2eab1`) | Le défaut publié est corrigé : `armor-of-resistance` passe de 1581 à **285** caractères, l'Apparatus récupère sa table. **2 records changés sur 2613**, vérifié au comparateur indépendant de l'architecte. Ce n'était pas un défaut d'ordre de lecture mais d'**ancrage** — le lot 11 s'était trompé de cause |
| ~~`RELECTEUR Adverserial — couche FH`~~ | ✅ **FUSIONNÉ** (`e374898`) | Un vrai défaut de code — un dé de Destinée perdu sur un refus —, quatre gardes creux, un invariant non couvert. 14 lignes de correctif contre 220 de tests |

Les cinq branches locales de `fh-phb` (`pkg10-dice`, `codex/*`,
`architect/queue-actions-v1`…) sont du travail v1 antérieur, pas de la dette de
cette session.

### 🎉 Le M2 est complet, et le produit fait ce qu'il promet

> Un personnage de niveau 1 **se construit de bout en bout sans interface**, il
> **se pilote de l'extérieur par MCP**, il **se sauvegarde et voyage**, et il
> tourne **sur la vraie matière** — sans échafaudage.

Lots fusionnés depuis la version précédente de ce fichier : `8-srd-mecanique`,
`9-bloc-build`, `10-mcp-v0`, `11-srd-colonnes`, `12-build-gardes`,
`13-confrontation`, `14-bloc-doc`, `15-couche-fh-especes`,
`16-moteur-destinee`, `17-couche-fh-retrait`.

### ⭐ Et la couche Fate's Hand existe

**C'est la première fois que les règles d'Eric ne sont plus un document mais du
logiciel.** Les douze espèces, en anglais, par-dessus le SRD — `Splinter of
Anon`, `Twice-Born`, `Outlasting`, les Bases de Destinée, `Educated` et `Fast
Learner`. Le moteur plafonne le Score et la **Vibration**, perdue au portage,
est revenue. Et les couches savent enfin **retirer**.

**Décision de cadre d'Eric** : la couche FH est **publique**, les règles
actuelles sont publiques, rien de l'actuel n'est à vendre ; des aspects payants
viendront plus tard sous forme de contenu bloqué. **Sa table joue en anglais** —
le français viendra après coup.

---

## 5b. LA MÉTHODE QUI A PAYÉ — à reprendre telle quelle

Eric relit **ses propres chapitres** avec ce siège : l'architecte lit, rend sa
lecture **et ses doutes**, Eric corrige. Rendement mesuré sur trois chapitres :

- **huit corrections** aux chapitres d'Eric (portées en tâches, vault `0.TASKS/Tasks RPG.md`) ;
- **deux défauts réels dans le code** — le Score qui ne plafonnait rien, la
  Vibration perdue au portage ;
- **deux fausses alertes de l'architecte**, retirées après vérification.

📌 **Aucun des deux défauts n'aurait été trouvé en lisant le code seul, ni les
règles seules.** Il fallait les confronter. C'est le rendement le plus élevé de
tout le chantier, et il ne coûte que du temps de lecture.

⚠️ **Et un taux d'erreur de deux sur quatre, du côté de l'architecte.** C'est la
raison pour laquelle chaque mesure est **montrée** à Eric plutôt que résumée en
conclusion.

---

## 5c. LES TROIS ERREURS DE CE SIÈGE — les plus chères de la session

**Elles valent plus que les réussites : elles disent où ce siège dérive.**

1. **Une mesure faite sur le mauvais objet.** L'architecte a publié au board
   qu'une affirmation d'un lot était fausse, « vérifié de quatre façons ».
   Il cherchait le **nom d'une classe** — or une table de progression ne
   contient jamais le nom de sa classe, elle porte des **noms d'aptitude**. Sa
   frontière de mot excluait même « Bardic ». Quatre vérifications, toutes sur
   le mauvais objet, et une conclusion assurée publiée à Eric.
   → **Une mesure fausse est plus dangereuse qu'une absence de mesure : elle
   porte l'autorité d'un chiffre.**
2. **Une hygiène qui masquait un défaut.** Il n'a pas reproduit une instabilité
   de suite rapportée par un lot, parce qu'il remettait l'arbre propre entre ses
   passes. Le défaut était réel — une contamination **entre** exécutions.
   → **Quand une mesure contredit un rapport, suspecte d'abord ton protocole.**
3. **Deux lectures hâtives du domaine.** Il a pris « la vibration » pour une
   coquille de dictée (c'est un élément de premier rang des 22 Arcanes), et a
   écrit que la contribution de l'Arcane au Score n'était pas chiffrée (chaque
   carte porte son `Destiny Impact`).
   → **Le domaine d'Eric ne se devine pas. Aller lire vaut mieux que déduire.**

---

## 5d. CE QUE CE SIÈGE DOIT ENCORE — dettes annoncées et NON payées

1. ⚠️ **La révision du schéma.** Le **Score de Destinée** avec son détail de
   calcul (`GAP-DERIVED`) et **`build.budgets`** pour le pool de compétences
   (`GAP-BUDGET`). **Tant qu'elle manque, le Score existe dans le moteur mais
   PAS dans le document — il ne voyage donc pas avec le personnage**, et le
   plafond ne peut pas s'appuyer sur une valeur portée par la fiche.
   > 📌 Fait établi en lisant le chapitre 3 : **le Score n'est pas une formule
   > fermée.** Maîtrise + Base d'espèce + `Destiny Impact` de l'Arcane sont
   > chiffrés ; **l'arrière-plan et la Gloire/Damnation sont des décisions de
   > MJ**. Le Score est donc **largement dérivable, partiellement tenu** — il
   > lui faut une collection avec son détail, pas un champ.

   ### ⚠️ ET LA DETTE EST À TROIS MAILLONS, PAS UN — mesuré le 2026-08-08

   Écrire le schéma seul déplacerait le trou d'un cran. Les trois mesures, à
   refaire plutôt qu'à croire :

   | Maillon | Mesure | Qui |
   |---|---|---|
   | **Le schéma** | `fh-char.schema.json` : `stats` **0**, `budgets` **0**, `destiny` **0** occurrence (pour comparaison, `craft` et `resources` : 2 chacun) | contrat → **architecte** |
   | **La dérivation** | `grep -rn "destiny\|stats" src/build/` → **aucune ligne**, alors que `layers/fh-species-en.layer.json` porte déjà `data.destiny.base` par espèce (Araag = 2). Personne ne lit ce champ | un lot court |
   | **La porte du moteur** | `src/modules/fh/index.mjs:114-118` lit `character.destinyBuild.score` et `build.destinyFeats.score` — des **noms de champs v1** qu'aucun bloc n'écrit, présents seulement dans les harnais de test | le même lot |

   **Q15-8 est TRANCHÉE par Eric le 2026-08-08**, et `GAP-BUDGET` est donc
   débloqué : un personnage créé au **niveau 5** reçoit les paliers qu'il a
   **traversés** — +2 au niveau 1, +2 au niveau 3 — et **pas** celui du niveau
   6. `by_level` est cumulatif sur les niveaux ≤ niveau courant.

   **`GAP-DERIVED` attend l'EXPERT Fate's Hand** (question posée le
   2026-08-08, à sa demande explicite) : l'arrière-plan et la Gloire/Damnation
   sont-ils des **termes de la même somme**, ou d'une autre nature ? et la
   Gloire/Damnation **bouge-t-elle en cours de campagne** ?

2. ✅ **Le câblage MCP → `doc` — PAYÉ le 2026-08-08** (`fhpc` `15db710`, 415
   tests verts). Une IA **garde** un personnage, elle ne fait plus que le
   construire. Trois outils qui ne fabriquent rien et routent vers les verbes
   du lot 14 ; `src/mcp/` ne gagne pas une ligne de disque.
   > 📌 **La décision qui vaut d'être retenue** : *le catalogue décrit LE
   > SERVEUR, pas le dépôt.* Le magasin vient de `--store` et n'a aucun défaut
   > (décision D2) ; sans lui, le bloc `doc` n'est pas monté et ses outils ne
   > sont **pas publiés**. Publier `doc.save` sans pouvoir enregistrer
   > promettrait une porte qui n'ouvre sur rien — et **une IA lit un catalogue
   > comme un contrat**.

### Ce qui attend une réponse d'Eric

- La description de l'**Humain** a été corrigée **sans qu'il le demande** (la
  prose SRD décrivait `Resourceful`, que le lot retirait) — réversible.
- **« Forest Gnome » / « Rock Gnome »** survivent dans le texte du trait de
  lignage du Hoddon : dépend de ses sous-lignées, non tranchées.
- **`Ceremony` n'est pas au SRD** (vérifié sur 339 sorts) : Eric a tranché
  qu'un sort neuf sous un autre nom porterait l'effet — travail du chapitre des
  sorts.
- La **licence** de la couche FH, posée au plus strict en attendant.
- Les points ouverts du BRIEF §11 — **aucun ne bloque le 7 novembre**, et le
  n°1 (partage de homebrew) est **résolu** : le site d'Eric tient **une liste**,
  chacun héberge et décide de partager.

### La suite de la couche FH, avec Eric

Chapitre 4 (26 compétences, 4 paliers, pool par classe) · les 22 Arcanes · les
Tables de Fatalité. 📌 **Le contenu n'est pas le problème** — les Arcanes et les
Tables sont **déjà des données propres**. Ce sont les règles écrites nulle part
qui bloquaient, et une dizaine ont été réglées en une soirée.

**Calendrier** : 91 jours avant le 7 novembre au moment de cette passation, et
le M2 était planifié « début septembre ». L'avance est réelle.


## 6. Les conseillers — les consulter avant de deviner

Quatre sièges répondent à des questions et ne modifient rien (§8 du kickoff).
Retrouvables par leur titre, joignables par message.

| Conseiller | Titre du fil |
|---|---|
| Produit | `EXPERT produit` — **précède ce siège et en a suggéré la création** ; mandat : `CONSEILLER-PRODUIT.md` |
| SRD (règles + juridique) | `EXPERT conseiller SRD` |
| Fate's Hand | `EXPERT Fate's Hand system advisor` |
| VTT | `EXPERT  conseiller VTT` (deux espaces) |

**Ils se sont payés en une séance** : les deux trous de contenu ci-dessus et le
piège `keepArcana` viennent d'eux, et l'architecte ne les avait pas vus en deux
jours. **Lire leurs réponses avant de refaire leur travail.**
