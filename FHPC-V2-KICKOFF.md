# FHPC v2 — KICKOFF : plan de lots exécutables

**Écrit le 2026-08-07 par l'architecte v2 (Fable), après ratification par Eric des
quatre décisions d'architecture.** Ce fichier est lu par les **sessions de lot**
(Opus/Sonnet) : chaque lot exécute sa section, rien d'autre. L'architecte (fil
séparé) revoit et fusionne — discipline `ARCHITECT-HANDOFF.md` §4 : *vérifier,
ne pas croire*.

Décisions ratifiées et architecture complète : vault
`7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/FHPC v2 — Architecture.md`
(miroir des décisions ; le §1 ci-dessous est la version canonique côté dépôt,
transplantée dans `fhpc/ARCHITECTURE.md` au lot 1).

---

## §0 — Lois communes à TOUS les lots (non négociables)

1. **`git push`, création de remote GitHub, tout déploiement = gestes d'Eric.**
   Tendre les commandes, ne jamais les passer.
2. **Ne jamais écrire dans `fh-phb`, `fh-srd`, `fh-worker`, `fh-table`** — lecture
   seule. Le travail v2 vit dans `~/tools/fhpc` (créé au lot 1).
3. **Rapporter n'est pas livrer.** Fin de lot = commits réels, arbre propre,
   SHAs listés, suites vertes re-exécutées. Deux lots v1 ont dit « terminé »
   avec tout en non-commité.
4. **Nommer la branche d'après le travail, AVANT de commencer — et la faire
   commencer par son NUMÉRO DE LOT** (règle d'Eric, 2026-08-07 : *« mets la
   lettre ou le numéro au début, ce numéro me donne aussi l'ordre »*).
   Convention : `<n>-<sujet>` — `1-squelette`, `2-schemas`, `3-moteur`,
   `4-couche-srd`. Le numéro est l'ordre de la file, pas la vague : deux lots
   parallèles portent deux numéros consécutifs. Même forme pour le worktree
   (`~/tools/fhpc-worktrees/<n>-<sujet>`) et pour le titre du lot partout où
   il apparaît (kickoff, board, vault). Jamais de nom généré.
5. **Aucun repli silencieux, aucun échec muet.** Un module manquant, un schéma
   violé, un MANIFEST qui ne matche pas → erreur bruyante qui nomme la chose.
6. **Pas de code mort derrière un interrupteur.** Une feature non voulue est
   supprimée, pas désactivée.
7. **Assertions** : quand un changement rend une assertion fausse, la réécrire à
   la nouvelle vérité et la marquer `REWRITTEN` **sur sa propre ligne** (une
   marque en milieu de ligne a déjà commenté quatre assertions et rendu une
   suite verte à tort). Jamais relâcher, jamais supprimer.
8. **Dépôt public** : jamais de propos sur des personnes, jamais de contenu
   WotC ni de contenu tiers non-CC. Le juridique est une problématique de
   premier rang (Eric, 2026-08-07).
9. **Lois économiques (Eric, 2026-08-07)** : aucun serveur mondial à maintenir
   (seule exception tolérée, à trancher par Eric : le partage public de
   homebrew) ; **aucune table ne doit être obligée de payer un KV cloud** — le
   transport de table vit sur la machine du MJ, le cloud n'est qu'un appoint
   gratuit optionnel.
10. **Décision non couverte par ta section → STOP, question à l'architecte.**
    Ne jamais improviser une valeur, un nom ou une règle (la v1 a payé « 43
    tailles de police inventées » pour l'avoir permis).
11. **Zéro build, zéro framework, zéro dépendance runtime.** ESM natif,
    `node:test`. Dépendances de **dev** : autorisées si épinglées (précédent
    linkedom), listées dans la section du lot.
12. **⚠️ LE SRD EST LA BASE, FH EST UNE COUCHE PAR-DESSUS — jamais l'inverse,
    jamais mélangés.** (Eric, 2026-08-07, en arrêtant l'architecte : *« on
    construit théoriquement le SRD en premier, pourquoi tu me poses des
    questions sur FH ? FH c'est la couche par-dessus »*.) Tout lot qui touche
    une règle du jeu doit pouvoir répondre **oui** à : *« un personnage SRD
    pur, sans aucune couche FH chargée, traverse-t-il ce code de bout en
    bout ? »* Une mécanique FH (Destinée, Chaos, Overreach, Éveil, Arcanes)
    vit dans un **module activé par un drapeau de couche**, jamais tissée dans
    le chemin commun.
    **Payé le 2026-08-07** : le lot `3-moteur` a porté fidèlement le moteur v1
    — et donc **384 lignes sur 2 556 citant une mécanique FH, sans aucun
    interrupteur**. La commande était fautive, pas le lot : elle disait
    « porter » sans exiger la séparation. D'où le lot `5-moteur-srd-fh`.

---

## §1 — Architecture canonique (→ à transplanter dans `fhpc/ARCHITECTURE.md` au lot 1)

> Au lot 1 : déplacer le contenu de cette section dans `~/tools/fhpc/ARCHITECTURE.md`
> et remplacer ici par « → transplanté ». Une seule copie vivante.

### Le produit

Constructeur de personnage indépendant sur SRD 5.2, couches de règles
empilables (FH livrée, homebrew par MJ). Thèse : « le joueur peut se balader
partout avec ses persos et les tweaker. » FHPC est un serveur MCP ; l'IA du
joueur porte le perso dans les VTT. Le personnage appartient au joueur, la
campagne au MJ. Date dure unique : **2026-11-07, la table d'Eric joue**.

### Le document `fh-char/1` — deux étages, un fichier JSON

- **`resolved`** : la fiche jouable, valeurs finales uniquement (CA, PV,
  compétences, actions, sorts avec DD/bonus calculés, ressources comptées,
  vitals persistants). Aucun pointeur vers des règles. Joue sans ses couches,
  et **le dit** (dégradation bruyante).
- **`build`** : manifeste des couches (`{id, version, hash}`), choix,
  **overrides de première classe** (`{path, value, note, by}`) appliqués en
  dernier. « La parole du MJ bat le JSON » ; les tweaks survivent à toute
  reconstruction ; l'écart règles↔décision est affichable, jamais écrasé.

Règles : (1) `resolved` n'est écrit que par la dérivation — pli de la pile
SRD → FH → homebrew → overrides ; (2) un seul chemin d'édition avec ou sans
couches : l'override ; (3) ouvert sans ses couches : `resolved` joue, `build`
reste inerte et intact, les couches manquantes sont listées et affichées.

### Les couches `fh-layer/1` — données, jamais du code

Manifeste + records par genre (les 12 genres `fh-srd` : armor, background,
class, feat, gear, glossary, item, monster, species, spell, tool, weapon —
plus les genres FH à venir). Une couche **ajoute** des records, **patche** un
record par id, **désactive** un record, **lève des drapeaux de capacités**
(ex. `fh.destiny`). Jamais d'exécutable — un homebrew d'inconnu est inoffensif
à charger. Les mécaniques nouvelles sont des **modules moteur** activés par les
drapeaux, pas du contenu de couche (décision Q4).

### Les blocs — verbes en entrée, événements en sortie, état privé

Chaque bloc : ses verbes (seul point d'entrée), sa tranche d'état (lui seul
l'écrit), ses événements (seul moyen pour les autres de savoir). Personne ne
lit l'état d'un autre bloc autrement qu'en s'abonnant. Contrat écrit par bloc
dans `contracts/`.

| Bloc | Verbes (échantillon) | État possédé | Événements |
|---|---|---|---|
| `doc` | open, save, list, import, export, duplicate | documents au repos (stockage local) | doc-opened, doc-saved |
| `layers` | register, enable, disable, query(kind, id) | contenu des couches chargées, pile active | layers-changed |
| `build` | choose, set, override, rebuild, validate | tranche `build` du perso ouvert | char-rebuilt (avec diff) |
| `play` | vocabulaire `data-*` v1 nommé : stageDie, roll, spendDestiny, resolvePending… | état de séance : transaction, pools, main, tray, historique | roll-settled (`fh-roll/1` + `intent`), pool-changed |
| `table` | share, join, goLive | état de livraison, LIVE/RECENT/OFF | feed-updated, table-status |
| `mcp` | adaptateur : doc/build/play en tools+resources | aucun | — |
| `connect-ddb` | pull, push (détachable, jamais diffusé) | état de liaison | — |

UI (consommatrices, jamais propriétaires) : `ui-builder-desktop` (premier,
iPad compris), `ui-builder-mobile` (plus tard, pensé différemment — « on ne
peut pas tout voir en même temps »), vue de jeu minimale (date), dock v1
(gelé, repli). Bibliothèques pures partagées : visuels de dés, lexique de jet.

**Test d'acceptation de la carte** : toute feature écrit l'état d'UN seul
bloc ; les traversées passent par événements. Une feature qui exige d'écrire
deux tranches = bug de découpage, corriger avant de coder.

### Persistance (leçons `fix-panel-persistence`, gravées)

1. Jamais de fusion par `||` — le vide ne bat jamais le rempli sans choix
   explicite de l'utilisateur.
2. Tout rejet bruyant de bout en bout (contre-modèle : `safeOpaque → null`).
3. Une seule liste blanche générée du schéma, client ET serveur — jamais de
   strip silencieux derrière un `200 OK`.
4. L'état de séance (main, sélection, transaction) ne voyage pas ; les
   ressources comptées vivent dans `resolved` et se décrémentent **au
   règlement** (événement), pas par élagage de références.

Baseline du voyage : export/import fichier. Toute synchro : optionnelle et
débranchable.

---

## §L1 — LOT `1-squelette` : le dépôt `fhpc` — **Sonnet · high**

**Branche** : `main` (création du dépôt). **Aucun worktree.**

1. `git init ~/tools/fhpc`, `package.json` (`"name": "fhpc"`, `"type":
   "module"`, `"private": false`, zéro dépendance), `.gitignore` (node_modules,
   .DS_Store).
2. `ARCHITECTURE.md` ← transplanter le §1 ci-dessus (puis remplacer §1 du
   kickoff par « → transplanté », commit dans `fh-phb`… **NON** — loi §0.2 :
   ne pas écrire dans fh-phb. Signaler à l'architecte, qui fera le remplacement).
3. `TRAPS.md` ← copier tel quel le tableau `ARCHITECT-HANDOFF.md` §3 (fh-phb)
   + le tableau du brief `FHPC-V2-BRIEF.md` §6, précédés d'un en-tête français :
   provenance, date de copie, « chaque ligne est une erreur déjà facturée ».
4. `CLAUDE.md` (court) : zéro build/framework/dep runtime ; push = Eric ;
   contrats dans `contracts/` ratifiés par l'architecte ; lire `TRAPS.md` avant
   de toucher KV/tunnel/CSS/fichier généré ; lois §0.8–0.9.
5. `contracts/TEMPLATE.md` : sections **Nom · Rôle (2 lignes) · Verbes (table :
   verbe, payload, effet, erreurs) · Événements (type, payload, quand) ·
   Tranche d'état (forme, qui la lit) · Invariants · Dépendances interdites ·
   Obligations de test**. Puis 7 stubs (`doc.md`, `layers.md`, `build.md`,
   `play.md`, `table.md`, `mcp.md`, `connect-ddb.md`) : Rôle rempli depuis la
   table du §1, le reste « à remplir par le lot propriétaire, ratifié par
   l'architecte avant merge ».
6. `schemas/README.md` : « fh-char/1 et fh-layer/1 arrivent au lot `2-schemas` ; spec
   dans FHPC-V2-KICKOFF.md §L2 ».
7. **Noyau** `src/kernel/registry.mjs` + `src/kernel/bus.mjs` (~100 l. au
   total) :
   - registry : `defineBlock(name, {verbs})` ; `dispatch("bloc.verbe",
     payload)` route vers la fonction ; bloc ou verbe inconnu → `throw` avec le
     nom exact (jamais silencieux). Pas de validation de payload pour l'instant
     (les schémas arrivent au lot `2-schemas`) — ne pas construire de socket vide.
   - bus : `on(type, fn)` → unsubscribe ; `emit(type, data)` ajoute `at`
     (epoch ms) ; pas de wildcard, pas de file async.
   - `assertBlocks(names)` : vérifie que chaque bloc nommé est défini, sinon
     `throw` listant les manquants (leçon du bloc d'alias sans garde).
8. Tests `node:test` (`tests/kernel.test.mjs`) : dispatch ok, verbe inconnu
   jette, bloc inconnu jette, on/emit/off, assertBlocks manquant jette.
9. `README.md` : 15 lignes max — le produit, la thèse, la date, pointeurs vers
   ARCHITECTURE/TRAPS/contracts. Pas de LICENSE (choix d'Eric, plus tard —
   le dépôt contiendra son IP).
10. Commits atomiques, messages clairs. **Fin de lot** : `node --test` vert,
    arbre propre, SHAs listés, et tendre à Eric (sans les exécuter) :
    `gh repo create Noirchicot/fhpc --public --source ~/tools/fhpc --push`.

---

## §L2 — LOT `2-schemas` : `fh-char/1` + `fh-layer/1` — **Opus · high**

**Après le lot 1.** Worktree `~/tools/fhpc-worktrees/schemas`, branche `2-schemas`
(nommée `schemas-v1` au lancement du 2026-08-07 ; renommée par l'architecte à la
livraison). Parallèle autorisé avec le lot `3-moteur` (répertoires disjoints).

1. `schemas/fh-char.schema.json` (JSON Schema 2020-12). Inventaire imposé :
   - racine : `schema:"fh-char/1"`, `id`, `name`, `created`, `modified`.
   - `resolved` : abilities (6), proficiency, ac, vitals persistants
     (`hpMax, hpCurrent, tempHp, conditions[]`), speeds, senses, languages,
     saves, skills, attacks/actions, spellcasting (dc, attackBonus, slots,
     spells[]), `resources[]` (comptées : `{id, name, max, current}`), traits,
     gear, craft, notes — les six panneaux v1 (traits/actions/spells/gear/
     craft/notes) sont l'inventaire de référence des champs jouables.
   - `build` : `layers[]` (`{id, version, hash}` — ordre = pile), `choices[]`
     (`{path, recordRef…}` — forme proposée par le lot, ratifiée par
     l'architecte), `overrides[]` (`{path, value, note?, by}` — `by` :
     `"player"` ou `"gm"`).
   - Invariants en `$comment` : resolved écrit par dérivation seule ; overrides
     appliqués en dernier ; état de séance interdit dans le document.
2. `schemas/fh-layer.schema.json` : manifeste (`schema:"fh-layer/1"`, `id`,
   `version`, `name`, `flags[]`), `records` par genre (les 12 genres §1, clef
   = id de record), opérations `add` (défaut) / `patch {id, changes}` /
   `disable {id}`. Jamais de champ exécutable.
3. `examples/` : un personnage SRD niveau 1 complet (resolved + build, en FR),
   une couche homebrew neutre minimale (3 records, 1 patch, 1 disable, 1 flag).
   **Aucun contenu FH** (il arrive avec Eric au M2), aucun contenu WotC
   hors SRD.
4. Tests : chaque exemple valide contre son schéma ; un exemple mutilé par cas
   d'invariant (état de séance dans le doc, override sans path…) **échoue**.
   Dépendance dev autorisée : `ajv` épinglé (validation dans les tests
   seulement — le runtime reste zéro-dep).
5. Livrable : schémas + exemples + tests verts + **liste des choix de forme
   pris** (pour ratification architecte avant merge).

---

## §L3 — LOT `3-moteur` : portage du moteur de jets — **Opus · high**

**Après le lot 1.** Worktree `~/tools/fhpc-worktrees/engine`, branche `3-moteur`
(nommée `engine-port` au lancement du 2026-08-07 ; renommée par l'architecte à la
livraison). Parallèle autorisé avec le lot `2-schemas`.

1. Source (lecture seule) : `~/tools/fh-phb`, `docs/javascripts/
   fh-player-sheet.js` sur `main` (~5 645 l.) — en extraire le MOTEUR :
   transaction de jet et ses gardes (`rollTransactionActive`), phases de
   séquence, Destinée, Chaos, Overreach, pools, règlement, historique. La
   branche `split-pure-modules` porte déjà `fh-dice-visual.js` (372 l.) et
   `fh-utils.js` (35 l.) prouvés purs — les reprendre de là (lecture,
   cherry-read, pas de merge).
2. **Porter, ne pas réécrire.** Le comportement est la vérité, les suites en
   sont la preuve : inventorier les suites de `tests/` (19) et porter celles
   qui encodent le moteur (au minimum roller-state-machine et
   roll-vocabulary) ; adapter les préludes (plus de DOM, plus de
   `vm.runInNewContext` — ESM natif + `node:test`), discipline `REWRITTEN`
   (loi §0.7) pour chaque assertion touchée, avec raison.
3. Cible : bloc `play` derrière le noyau du lot 1 — verbes nommés depuis le
   vocabulaire `data-*` v1 (stageDie, roll, spendDestiny, resolvePending…),
   état de séance privé, événements `roll-settled` émis **aux points de
   règlement réels** (openRollState + branche finish-sequence, gardés par la
   transaction — piège `addHistory` : le règlement n'est PAS dans addHistory).
   Les formats `fh-roll/1` (vue) et `intent` (machine) sont portés tels quels.
4. Zéro DOM, zéro `window`, zéro accès réseau dans le bloc. Le lexique de jet
   (ROLL_SOURCES, badges, verdicts) est porté comme module pur consommé par
   `play`.
5. Livrable : `src/play/` + suites portées vertes + **inventaire écrit** :
   quelles fonctions v1 sont entrées, lesquelles sont restées et pourquoi,
   quelles assertions ont été `REWRITTEN` et pourquoi. Contrat `contracts/
   play.md` rempli (ratification architecte avant merge).

---

## §L4 — LOT `4-couche-srd` : générateur de la couche SRD — **Sonnet · medium**

**Après merge du lot `2-schemas`** (il consomme `fh-layer.schema.json`). Worktree
`~/tools/fhpc-worktrees/4-couche-srd`, branche `4-couche-srd`.

1. `src/tools/gen-srd-layer.mjs` : lit `~/tools/fh-srd/exports/srd/{fr,en}/
   *.json` (lecture seule), **vérifie d'abord chaque SHA-256 contre
   `exports/MANIFEST.json`** — mismatch → échec bruyant qui nomme le fichier
   (piège des fichiers générés : le MANIFEST est là pour être vérifié, pas
   admiré).
2. Émet `layers/srd-5.2.1-fr.layer.json` et `layers/srd-5.2.1-en.layer.json`
   conformes à `fh-layer/1` : 12 genres, records `add`, id de couche stable,
   version reprise de la source, attribution CC-BY transportée par record
   (champ du schéma du lot 2 — s'il n'a pas prévu l'attribution par record,
   STOP et question à l'architecte, loi §0.10).
3. Déterministe : deux exécutions → sortie byte-identique ; la sortie est
   commitée et un re-run laisse l'arbre propre (discipline fh-srd).
4. Tests : MANIFEST vérifié (cas mismatch → jette), validation des deux
   couches contre le schéma (ajv dev), comptes par genre ≥ seuils relevés à la
   génération, spot-check de 3 ids connus (ex. un sort, une espèce, un feat).

---

## §L5 — LOT `5-moteur-srd-fh` : le SRD dessous, FH en couche — **Opus · high**

**Après merge du lot `3-moteur`** (il coupe le code que ce lot a livré). Worktree
`~/tools/fhpc-worktrees/5-moteur-srd-fh`, branche `5-moteur-srd-fh`. Parallèle
autorisé avec le lot `4-couche-srd` (répertoires disjoints : `src/play/` contre
`src/tools/` + `layers/`).

**Pourquoi ce lot existe.** Le lot 3 a porté le moteur v1 fidèlement, ce qui
était sa commande — et le moteur v1 est un moteur **Fate's Hand**, pas un
moteur SRD. Mesuré le 2026-08-07 : **384 lignes sur 2 556** citent une mécanique
FH (326 dans `session.mjs`), et **aucun drapeau, aucun interrupteur** ne permet
d'éteindre FH. C'est la loi §0.12 qui manquait. Eric a ratifié la correction le
même jour : **garder le lot 3 comme base testée, couper ensuite.**

**Ce qui rend ce lot faisable, et qu'il faut avoir en tête** : la coupe n'est
PAS une coupe par *pureté* (celle qui a un plafond bas — trois refus mesurés en
v1). C'est une coupe **par capacité** : un drapeau allume un module. Elle se
fait sur du code déjà sorti du DOM, avec **64 tests** qui disent immédiatement
si elle casse quelque chose. Ce filet n'a jamais existé en v1.

1. **Mesurer avant de couper.** Inventorier, ligne par ligne, ce qui est SRD
   (d20, avantage/désavantage, modificateur, DD, compétences, dégâts,
   historique, transaction) et ce qui est FH (Destinée, Chaos, Overreach,
   Éveil, Arcanes). **Tout ce qui ne se range pas clairement d'un côté est un
   STOP**, pas un arbitrage du lot (loi §0.10).
2. **Le mécanisme d'extension existe probablement déjà — vérifie-le avant d'en
   inventer un.** Le moteur porté a des **phases de séquence** nommées
   (`rollSequence.phase`, `BLOCKING_PHASES`). L'hypothèse de l'architecte est
   qu'un module de couche s'inscrit sur une phase, et que cela suffit — comme
   le vocabulaire `data-*` de la v1 qu'il a suffi de *nommer*. **Si les phases
   existantes ne suffisent pas, ne bricole pas : remonte à l'architecte** avec
   la mesure de ce qui manque.
3. **Les modules FH s'enregistrent, ils ne sont pas appelés.** Le chemin commun
   ne cite jamais Destinée ni Chaos. Pas de `if (fh) … else …` semé dans le
   code : c'est la forme dégradée de la même erreur.
4. **Pas de code mort derrière un interrupteur** (loi §0.6) : les modules FH
   sont du code vivant, chargés quand leur drapeau est levé, absents sinon.
5. **Les 64 tests restent verts**, et la discipline `REWRITTEN` (loi §0.7)
   s'applique à chaque assertion que la coupe rend fausse. Les suites qui
   testent une mécanique FH deviennent des suites **de la couche FH** —
   déplacées, jamais supprimées.

### 🎯 Le test d'acceptation — c'est lui qui dit si le lot a réussi

> **Un personnage SRD pur, aucune couche FH chargée, lance un jet de compétence
> de bout en bout et obtient son résultat.**

Écrit comme une suite exécutable (`tests/play-srd-only.test.mjs`), il fait foi.
S'il passe, la séparation est réelle ; s'il ne peut pas être écrit, elle est
décorative — et le lot le dit platement plutôt que de la maquiller.

6. **Livrable** : `src/play/` recoupé, le test d'acceptation, l'inventaire écrit
   de la coupe (ce qui est parti côté FH et pourquoi), `contracts/play.md` mis à
   jour, et la liste des drapeaux de couche que FH doit lever — elle devient
   une entrée du schéma `fh-layer/1`.

---

## §6 — Séquencement, revue, fusion

```
VAGUE 1 : 1-squelette    (Sonnet·high, sur main)   ← seul, tout en dépend
VAGUE 2 : 2-schemas      (Opus·high)   ∥   3-moteur (Opus·high)     ✅ livrés
VAGUE 3 : 4-couche-srd   (Sonnet·medium)  ∥  5-moteur-srd-fh (Opus·high)
          ↑ dépend du lot 2 FUSIONNÉ         ↑ dépend du lot 3 FUSIONNÉ
          (répertoires disjoints : src/tools/+layers/ contre src/play/)
```

### La règle de séquencement — une seule, et elle est vérifiable

> **Un lot démarre après que l'artefact dont il dépend est MERGÉ sur `main`.**
> Le test, applicable sans l'architecte : *le prompt du lot cite-t-il un fichier
> qu'un autre lot est en train d'écrire ?* Oui → il attend. Non → il part.

Appliqué ici : le prompt du lot 4 cite `schemas/fh-layer.schema.json` (écrit par
le lot 2) → **le lot 4 attend**. Les prompts des lots 2 et 3 ne citent aucun
fichier de l'autre
(`schemas/` + `examples/` contre `src/play/` + `tests/`) → **ils partent
ensemble**.

**Le risque n'est pas le conflit git — c'est qu'un lot n'ayant pas trouvé sa
dépendance l'INVENTE**, en silence, et que la divergence n'apparaisse qu'au
merge (§0.10). C'est pour ça que chaque prompt de lot dépendant porte un
**garde STOP** explicite nommant ce qui doit exister.

**Un worktree fige son point de départ.** `git worktree add` prend un
instantané : tout commit arrivé après dans le lot amont devra être rebasé.
Créer les worktrees pendant que le lot amont commite encore n'est donc pas une
faute — c'est un **coût de rebase**, payé par l'architecte à la revue. La faute
serait de le faire quand l'amont produit un artefact **dont le lot a besoin
pour travailler**.

**Mesuré le 2026-08-07** : les lots 1, 2 et 3 lancés simultanément. Zéro dégât, deux
rebases à faire (le lot 2 coupé 3 commits trop tôt, avant le noyau ; le lot 3
1 commit trop tôt). Le lot 3 a eu le noyau **de justesse** — coupé une minute
plus tôt, il aurait pu s'écrire son propre noyau. La marge était de la chance,
pas de la méthode : c'est l'argument pour la vague 1 seule.

- **Un seul lot par worktree, jamais deux fils dans le même** (leçon MOE).
- **L'architecte donne le feu vert de chaque vague**, après avoir revu, fusionné
  et rebasé la précédente.
- L'**architecte** (fil dédié) : revoit chaque livraison (diff lu, suites
  re-exécutées dans un clone indépendant — `npm install` d'abord, piège
  linkedom), trial-merge avant merge réel, met à jour `CHANTIER-STATUS.json`
  et le vault à chaque fusion.
- Après le lot `4-couche-srd` : jalon M2 (bloc `build` + MCP v0 + démarrage couche FH avec Eric) —
  lots à découper par l'architecte à ce moment-là, pas avant.

---

## §7 — Où est la matière (inventaire relevé le 2026-08-07)

**Relevé sur disque, pas cité de mémoire.** Tout est en **lecture seule** pour
les lots. Aucun de ces chemins ne se modifie sans ordre d'Eric.

### JSON SRD — la source du lot `4-couche-srd`

`~/tools/fh-srd/exports/srd/fr/` et `.../en/` — **12 fichiers chacun** :
`armor, background, class, feat, gear, glossary, item, monster, species,
spell, tool, weapon`. Volumes FR : monster 1,0 Mo · spell 684 Ko (descriptions
comprises) · item 468 Ko · glossary 208 Ko · class 204 Ko · le reste sous
72 Ko. Intégrité : `exports/MANIFEST.json` (SHA-256 par fichier) —
**à vérifier avant usage**, plus `exports/exclusions.json`.

### Contenu FH **déjà structuré en JSON** — 635 Ko, vault `5.RPG/Fate's Hand/8. Tools/`

C'était la surprise du relevé : une part importante du contenu FH n'est pas à
formaliser depuis la prose, elle est déjà en JSON exploitable.

| Fichier | Contenu |
|---|---|
| `LLM Soulforge engine/Soulforge Catalysts v3 (FH).json` (267 Ko) | **465 catalysts** |
| `Soulforge Ingredients (FH).json` (114 Ko) | **210 ingredients** |
| `LLM Loot Engine/Spells.json` (117 Ko) | sorts indexés par classe |
| `LLM Loot Engine/{Arcana,Armements,Consumables,Implements,Relics}.json` (38/21/27/21/15 Ko) | objets magiques FH, clés par rareté (`perm.common.arcana`…) |
| `LLM Loot Engine/{loot_index,nonmagical_treasure_tables}.json` | index de thèmes/raretés, tables de trésor non magique |

⚠️ `Soulforge Catalysts v3` est un **chantier ouvert d'Eric** (recalibrage
pricing v3, catégorie Signature non tranchée) — **lire, jamais réécrire**.

### Règles FH en prose — vault `5.RPG/Fate's Hand/0. D&D 5+ Rules/`

**39 fichiers `.md`** en 8 chapitres : `1. Character Creation Rolls` (3) ·
`2. Species Modifications` (3) · `3. Arcane Destinies` (5, dont *The Major
Arcana* et *Tables de Fatalité par Attribut*) · `4. Skills` (11) · `5. Feats`
(1) · `6. Spells & Magic` (6) · `7. Classes & Subclasses` (4) ·
`8. Adventuring` (5) + `Boons and Flaws.md`.
**C'est la SOURCE** : `fh-phb/docs/chapters/` (19 `.md`) en est la copie
générée par `sync_from_vault.py` — piège du fichier généré, ne jamais lire la
copie comme une autorité.

### Tables jouables dans le code v1 — lecture seule

- **Skill builder** `~/tools/fh-skills/fh-skill-builder.html` : `ARCANA`,
  `SKILLS`, `TOOLS`, `TIER_LEVELS`, `KEEN_SENSES_SKILLS`, `STEP_DEFS`.
- **Dock** `~/tools/fh-phb/docs/javascripts/fh-player-sheet.js` : `SKILLS`,
  `SKILL_ABILITY`, `TOOLS`, `TOOL_ORDER`, `TIERS`, `CLASS_SAVES`, `CREATURES`,
  `KNOWLEDGE`, `PASSIVES`, `TOOL_ALIASES`, `SKILL_ALIASES` — et la mécanique
  FH elle-même (`destiny` 344 occurrences, `chaos` 110, `overreach` 46,
  `ARCANA` 50) : c'est le périmètre du **lot `3-moteur`**.
- **Loot engine** `~/Scripts/loot_engine_standalone.py` (352 l.) : `_EMBEDDED`,
  `DD_VALS`, `RARITY`, `PRESENCE`, `GOLD`, `THEME_FILE`.

### Sept personnages FH v1 réels — `~/tools/fh-phb/builds/*.fh.json`

`nodren, took, mar_del_ran, skrall_oksa, narsur_haglad, shuko_akalad, marf` —
~6,8 Ko chacun. Forme v1 : `character{ddbId,name,campaign,abilityScores}`,
`destiny{score,arcana,breakdown,notesText}`, `background`, `skills[]`,
`nativeSkillTiers`, `destinyFeats{diceFeats,score,originFeatId}`, `meta`,
`builderState` (19 clés).

> 📌 **Conséquence pour le LOT `2-schemas`** : ces sept fichiers sont un **test
> d'acceptation gratuit** du schéma `fh-char/1`. Le schéma doit pouvoir
> représenter chacun d'eux sans perte (la conversion elle-même n'est pas du
> lot 2 — seulement la preuve que la forme les couvre). Un champ v1 qui
> n'entre nulle part est un trou de schéma, à remonter à l'architecte.
