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
  > 📌 **La question qu'Eric a posée le 2026-08-09, et la réponse à lui redonner
  > telle quelle : « je ne sais jamais si je dois push sur un fil externe. »**
  > **JAMAIS depuis un fil de lot.** Un lot travaille sur une BRANCHE, dans un
  > worktree ; cette branche n'a aucune raison d'exister sur GitHub. Elle se
  > fusionne localement, et **seul `main` se pousse**, après revue, avec la
  > commande que l'architecte tend. Pousser une branche de lot créerait une
  > branche distante à nettoyer et — bien pire — donnerait l'illusion que le
  > travail est intégré alors qu'il n'est pas revu. **Le lot commite,
  > l'architecte fusionne, Eric pousse `main`.**
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

## 5. L'état du chantier — 2026-08-09, fin de session

| Dépôt | `main` | Suites | Distant |
|---|---|---|---|
| `~/tools/fhpc` | `512898d` | **517 vertes** | ✅ à jour |
| `~/tools/fh-phb` | `2c21a55` | — | ✅ à jour |
| `~/tools/fh-srd` | `20c6598` | — | ✅ à jour |

**Rien n'est en vol** : aucun worktree, aucun lot en cours, aucune fusion à
moitié, arbres propres. Les branches de lot sont conservées, jamais `--force`.

### ⭐ LE CHANTIER CHANGE DE NATURE — c'est LA chose à savoir en reprenant

Le moteur et le contenu sont **faits**. Ce qui reste tient en un mot :
**l'interface**, et elle n'a **pas une ligne** — mesuré : aucun HTML, aucun
CSS, et les deux seules occurrences de `window.` dans `src/` sont des
commentaires décrivant ce qui a été retiré.

Conséquence de séquencement, et elle gouverne tout le reste : le filet couvre
la **vue de jeu** (dock v1 en saisie manuelle si M4 glisse), il ne couvre
**pas le builder**. Sans builder, la table n'a pas de personnages. **C'est le
builder, et rien d'autre, qui décide du 7 novembre.**

### Ce que cette session a livré

| | |
|---|---|
| **Lot 21 `vibration-tilt`** fusionné | La Vibration était **morte** (elle interrogeait `destinyBuild`, absent du format v2 : 0 occurrence au schéma, 0 dans les documents). Le **Tilt** entre comme module à drapeau |
| **Lot 22 `chapitre-4-competences`** fusionné | **26 compétences, 36 outils, 12 pools**. La couche retire autant qu'elle ajoute |
| **Dette n°1 payée** | Le protocole des modules de statistique entre dans `contracts/build.md`, chaque clause adossée à son test |
| **Deux décisions de règle d'Eric gravées** | Le Tilt côté cible (**+2, non cumulatif**) et sa composition avec le SRD (**une seule table**) |
| **Renommage `Auspicious (fh)`** | Nom **et** id — mesuré qu'aucun document ne l'ancrait encore |
| **Dates réalignées** | La dérive était de **deux jours** |

### ⚠️ DEUX DETTES DE CE MANDAT ÉTAIENT FAUSSES — la leçon la plus chère du jour

Elles avaient été **recopiées de passation en passation sans jamais être
remesurées**, et un lot a dû refuser de travailler pour que la seconde tombe.

1. **L'Épuisement** — annoncé « contradiction vive, le moteur applique −2 ».
   Sonde : SRD pur −2/degré, **couche FH −1/degré**, déjà câblé et déjà testé.
   La faute : lire la constante `SRD_EXHAUSTION_PER_LEVEL` (le **défaut avant
   surcharge**) comme la valeur appliquée.
2. **`GAP-BUDGET`** — annoncé non payé. `build.budgets` existe et est
   `required` depuis le 2026-08-08.

📌 **UNE DETTE RECOPIÉE N'EST PAS UNE DETTE VÉRIFIÉE.** Avant d'agir sur une
ligne de ce fichier, la remesurer. C'est la consigne qui aurait économisé le
plus de temps aujourd'hui.

### ⚠️ CE QUE CE SIÈGE DOIT ENCORE

1. **La dérivation du pool de compétences** — débloquée par l'arbitrage du
   jour : un pool dérivé vit dans `resolved.stats[]`, **jamais** dans
   `build.budgets` (l'argument est le **barde**, dont le pool change à chaque
   niveau). Chemin déjà ratifié. **Lot court, et il précède le builder** : un
   builder qui ne sait pas dire « il te reste 7 points » n'est pas un builder.
2. **`state.character` : le document ou `resolved` ?** Trois formes se
   contredisent (`saveInfo` lit `ch.pb` et `ch.savingProficiencies`, absents du
   schéma `resolved`), et **aucun appelant de production n'existe** pour
   arbitrer. Le lot 21 a tranché pour la Vibration seule et l'a signalé.
   ⚠️ Deviendra bloquante quand l'interface ouvrira une séance.
3. **Le moment `mount` n'est invoqué nulle part** — déclaré dans `MOMENTS`,
   jamais appelé. Du vocabulaire mort : à brancher ou à retirer (§0.6).
4. **`normalizeDestiny` lit encore `ch.destinyBuild.score`** — le dernier
   chemin v1 vivant, même maladie que celle que le lot 21 a réparée.
5. **Le garde des copies** — ratifié par Eric, jamais construit. Les 22 Arcanes
   existent en trois exemplaires et rien ne les compare.

### Ce qui attend une décision d'ERIC

| Sujet | |
|---|---|
| ⚠️ **76 lignes non commitées, retrouvées au ménage** | `sync_from_vault.py` est **modifié et non commité** depuis le 2026-07-27 dans `fh-phb/.claude/worktrees/youthful-taussig-bfa14e` : une fonctionnalité complète qui injecte le shell du site (feuille de style + barre de nav) sur les pages **builder** et **roller** publiées. **Ni commité, ni jeté — Eric décide.** Le worktree est laissé en place exprès, et le diff est sauvegardé en double dans le scratchpad de la session du 2026-08-09 |
| **Le découpage du builder** | « Builder desktop complet » est un jalon, pas un lot. La coupe dépend de ce qu'il a en tête — recommandation de ce siège : une première tranche qui fait **un personnage niveau 1 de bout en bout à l'écran**, et rien d'autre |
| **Le conseiller « interface de builder »** | Identifié depuis l'ouverture du chantier et daté « utile au M3 seulement ». **On y est.** Proposé, pas créé |
| ~~Le chiffre de l'Épuisement~~ | ✅ −1, et c'était déjà le comportement |
| ~~Le Tilt (DC, composition SRD)~~ | ✅ les deux tranchés |
| ~~`Auspicious (fh)`~~ | ✅ renommé. Le homebrew DDB garde l'ancien nom — **décision d'Eric, ne pas y revenir** : le canon est le dépôt |

### 📉 LE TAUX D'ERREUR DE CE SIÈGE, AUJOURD'HUI — et c'est lui le vrai signal

**Dix erreurs en une session.** Huit rattrapées avant publication, **deux
seulement par les lots eux-mêmes** :

- **Deux commandes de lot fausses** : le lot 21 a démenti « `state.character`
  est bien un `fh-char/1` » (une inférence présentée comme une mesure) ; le lot
  22 a démenti « aucun trou de contrat sur ta route » — j'avais vérifié qu'un
  champ **existe** sans vérifier qu'il est **écrivable**.
- **Trois sondes sur le mauvais objet** : la condition d'un `throw` recopiée
  sans ses sorties anticipées (elle annonçait un défaut grave inexistant) ;
  `vibrationFor` cherché sur le mauvais objet ; un `grep` du mot `document`
  qui est le mot du domaine ici.
- **Un faux positif de revue** : un test lu comme *supprimé* alors qu'il était
  *renommé* — il aurait accusé un lot d'avoir violé la loi §0.7.
- **Trois fautes d'outillage** : `git merge -F -` ne lit pas stdin (la fusion a
  échoué en silence, seule la re-mesure l'a vue) ; un message de commit amputé
  par des backticks non protégés ; un SHA de `fh-phb` publié pour `fhpc`.

📌 **La forme est toujours la même — mesurer le mauvais objet — et elle se
renouvelle indéfiniment.** La seule parade qui a marché à chaque fois :
**re-mesurer quand le résultat surprend, et montrer la mesure plutôt que la
conclusion.** C'est aussi pourquoi les quatre corrections apportées par des
lots sont des résultats et non des incidents : **la revue marche dans les deux
sens.**

## 5e. CE QUE LA SOIRÉE DU 2026-08-08 A APPRIS — à lire avant de reprendre

### ✅ PAYÉ LE 2026-08-08 — le genre `arcana` est ouvert (`fhpc` `d8273b9`)

`GAP-KIND` est **clos**, 440 tests verts, revérifiés dans un clone indépendant.
Ce qui suit est conservé parce que le raisonnement reste la meilleure
description de *pourquoi* c'était la pièce à poser en premier.

**Et l'ouverture a donné plus que prévu.** `$defs/kind` est référencé à **deux**
endroits de `fh-char/1` — `build.choices[].ref.kind` et
`resolved.stats[].breakdown[].source.kind`. Ouvrir le genre répond donc **aussi**
à « où vit l'Arcane du personnage ? » (`contracts/play.md` n°9, ouverte depuis
le lot 16), **sans un champ neuf** : la carte se pose comme l'espèce, la classe
et l'historique se posent déjà. Il ne reste **rien de contractuel** — du
contenu (la couche des 22 cartes) et de la dérivation.

⚠️ **Une collision a dû être arbitrée, et c'est la première exemption à une loi
qu'Eric a ratifiée.** Le garde §0.12 interdit le vocabulaire Fate's Hand dans
`src/layers/` et mord sur `"destiny"` nu comme sur `resolveArcana` — or
l'énumération fermée **exige** que `arcana` y soit écrit, sous garde de dérive.
Arbitrage : un nom de genre est une **clef de vocabulaire**, pas une mécanique ;
le critère de §0.12 (*« un personnage SRD pur traverse-t-il ce code ? »*) reste
vrai, le genre est un seau vide. Le masque ne retire que le genre **entre
guillemets**, sa liste est **lue dans le schéma**, sa portée est `src/layers/`
seul, et **il est attaqué**. Le MCP, lui, n'a reçu **aucune** exemption : sa
liste de genres était une copie du contrat qui avait déjà dérivé, elle est
retirée. **À revoir si Eric préfère un autre arbitrage — c'est un commit.**

⚠️ **Le genre `arcana` n'existait pas dans l'énumération fermée des genres**
(`fh-char.schema.json` et `fh-layer.schema.json`). C'était le trou `GAP-KIND`,
devenu bloquant : le lot 19 a dû **déclarer** l'impact de l'Arcane non
dérivable faute de pouvoir le lire.

**Or c'est le terme le plus important, mesuré sur les personnages réels d'Eric** :

| Fait mesuré | Chiffre |
|---|---|
| Personnages portant un Arcane | **7 sur 7** |
| Valeur de l'impact | **variable : 0, 1 ou 2 selon la carte** — jamais codable en dur |
| Personnages portant `Destiny Touched (fh)` (+2) | **5 sur 7** |
| Personnages portant sorts / rituels / craft / gear | **0 sur 7** ⚠️ mais le format v1 n'a **aucun champ** pour ça : l'absence ne prouve rien sur la table |

→ **Ouvrir le genre `arcana` est du contrat, donc le travail de ce siège**, et
il précède le lot des Arcanes. ✅ **Fait le 2026-08-08.**

📌 **Et une distinction que la mesure a rendue nette** : le don
`Destiny Touched (fh)` (+2, porté par 5 personnages sur 7) **n'a jamais été
bloqué par le schéma**. `feat` est un genre depuis le premier jour ; il ne
manquait qu'un *record*. Les deux moitiés du lot des Arcanes n'avaient donc
pas le même obstacle — une seule attendait du contrat.

### La source de vérité des Arcanes, triangulée

`~/tools/fh-skills/fh-skill-builder.html`, `const ARCANA` — **c'est l'outil que
la table utilise**, et il est confirmé par les personnages réels. Le chapitre du
site le répète à l'identique (22/22), et site et vault ne diffèrent que par la
syntaxe des liens. **Pas de conflit à arbitrer.** Voir kickoff §7, requalifié.

### Le verdict d'Eric sur ce qui attend, et ce qui n'attend pas

| Sujet | Verdict, et pourquoi |
|---|---|
| **22 Arcanes** | 🔴 **maintenant** — 7/7, valeur variable |
| **`Destiny Touched (fh)`** | 🟠 **maintenant**, ce don SEUL. Le catalogue complet avec filtrage est plus tard |
| **Battlefield** | 🟢 plus tard, **et sans doute jamais comme donnée** : tout se ramène à avantage/désavantage/+2, que le moteur a déjà |
| **Dark rituals · Soulforging** | 🟢 plus tard — 0/7, et `craft` attend déjà au schéma |
| **Sorts** | ⚠️ **indéterminé** : le format v1 ne portait pas les sorts, donc leur absence ne mesure rien. Les 339 sorts SRD sont dans la couche ; ce qui manque est le **chapitre 6** d'Eric |

### Les erreurs de mesure de ce siège — quatre en une soirée

Toutes rattrapées avant publication, **aucune sortie vers Eric comme un fait** —
mais le taux est le vrai signal, et c'est lui qui a motivé la passation :

1. Sonde MCP écrite avec les **mauvaises clefs `_meta`** → le serveur semblait
   en erreur. C'était la sonde.
2. Attaque d'un garde lancée sur **le mauvais fichier de suite** → verte, ce qui
   aurait accusé un lot à tort.
3. Lecture de `data.destiny` sur des records **`patch`**, qui portent leurs
   valeurs sous `changes` → « 9 espèces sans Base de Destinée », faux.
4. Attaque du garde de somme injectée dans **un terme du détail au lieu du
   total** → la somme restait cohérente, ce qui aurait dit « le garde ne couvre
   pas ce chemin ».

📌 **Les quatre sont la même faute** : mesurer le mauvais objet. C'est l'erreur
n°1 du §5c, et elle se reproduit sous des formes nouvelles à chaque fois. La
parade qui a marché à chaque coup : **quand une mesure contredit ce qu'on
attend, suspecter d'abord son propre protocole.**

---

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

### ✍️ Et un cinquième siège, créé le 2026-08-08 : `GHOSTWRITER`

**Il n'est pas un conseiller — il ÉCRIT.** Mandat : `GHOSTWRITER.md`. Sa mission :
faire entrer dans le TEXTE des règles les décisions ratifiées en fil d'architecte,
pour que le vault et le site publié disent enfin la même chose.

**Son périmètre, resserré par Eric le 2026-08-08 : le VAULT SEUL.** Il ne lance pas
`sync_from_vault.py`, ne construit pas le site, ne publie pas — il signale seulement
quelles pages publiées sont devenues en retard. La synchronisation reste le geste
d'Eric.

**Sa cadence, deux régimes** : *courant* (porter chaque décision dans le texte pendant
qu'elle est fraîche — prioritaire) et *rattrapage*, qui est une **FOUILLE** : Eric a
explicitement demandé qu'il aille chercher **ce qui a été décidé dans les fils
d'architecte précédents et n'est jamais arrivé dans `Tasks RPG.md`**.

⚠️ **Ce que ce siège-ci doit savoir de lui** : le **bloc canonique des compétences n'est
pas publié** — `grep -c "Revisited Skills" sync_from_vault.py` → **0**. Le site est
généré depuis `Skills & Tools — Player Guide.md`, pas depuis le canon. Corriger le canon
seul ne change donc rien pour la table. C'est le mécanisme qui a laissé le chapitre 4 se
contredire, et c'est pour ça que ce siège existe.

⛔ **Et le garde-fou qu'on lui a gravé** : une décision trouvée dans une transcription
mais dans aucun document durable **n'est pas canon** — les fils contiennent aussi ce
qu'Eric a **rejeté**. Il remonte, il n'écrit pas.

**Ils se sont payés en une séance** : les deux trous de contenu ci-dessus et le
piège `keepArcana` viennent d'eux, et l'architecte ne les avait pas vus en deux
jours. **Lire leurs réponses avant de refaire leur travail.**
