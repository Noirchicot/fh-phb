# FHPC v2 — KICKOFF : plan de lots exécutables

**Écrit le 2026-08-07 par l'architecte v2 (Fable), après ratification par Eric des
quatre décisions d'architecture.** Ce fichier est lu par les **sessions de lot**
(Opus/Sonnet) : chaque lot exécute sa section, rien d'autre. L'architecte (fil
séparé) revoit et fusionne — discipline `ARCHITECT-HANDOFF.md` §4 : *vérifier,
ne pas croire*.

Décisions ratifiées et architecture complète : vault
`7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/FHV2 - Architecture.md`
(miroir des décisions ; le §1 ci-dessous est la version canonique côté dépôt,
transplantée dans `fhpc/ARCHITECTURE.md` au lot 1).

---

## §0 — Lois communes à TOUS les lots (non négociables)

1. **`git push`, création de remote GitHub, tout déploiement = gestes d'Eric.**
   Tendre les commandes, ne jamais les passer.
2. **Écris uniquement dans le dépôt que ta section te désigne.** Par défaut c'est
   `~/tools/fhpc` ; `fh-phb`, `fh-srd`, `fh-worker`, `fh-table` sont en **lecture
   seule**. **Amendé le 2026-08-08** : un lot dont le périmètre EST un autre
   dépôt (ex. `6-srd-tables` dans `fh-srd`) y écrit — et n'écrit alors nulle part
   ailleurs, `fhpc` compris.
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
13. **Le moteur produit des IDENTIFIANTS, l'interface produit des MOTS.**
    Aucun texte qu'un joueur peut lire ne vit dans un bloc de logique : un
    verdict est `natural-20`, pas « Natural 20 ». C'est ce qui « ouvre
    l'option » multilingue qu'Eric a demandée le 2026-08-07 — ouvrir, pas
    livrer, mais une porte qui coûte cher à rouvrir après coup.
    **Mesuré le 2026-08-08** dans le moteur porté : la structure est saine
    (chaque verdict a déjà son `id` séparé de son texte) mais les libellés
    anglais sont dans le module — « Critical success », « Natural 20 »,
    « Success », « Failure » — et `FATE REFUSED` est même écrit en dur au
    milieu de verdicts qui passent, eux, par la table de libellés. Sortie des
    textes : lot `5-moteur-srd-fh`.

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

⚠️ **NE PAS LANCER AVANT** (corrigé le 2026-08-08, voir §6) : ce lot dépend du lot
`2-schemas` **fusionné** (fait), du lot **`6-srd-tables` LIVRÉ**, et de la
**révision des schémas par l'architecte** — sans le genre `skill` au contrat, il
générerait une couche SRD sans compétences. Worktree
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

### 🌍 Le multilingue — la limite est MESURÉE, documente-la, ne la maquille pas

**Fait établi le 2026-08-08 par l'architecte, ne le re-mesure pas, ne le
contourne pas :** les deux langues du SRD n'ont **aucune clé de jointure**.
Les identifiants portent la langue (`srd:species:fr:drakeide` contre
`srd:species:en:dragonborn`), **zéro** identifiant commun sur les 339 sorts,
9 espèces et 17 dons vérifiés ; les slugs diffèrent ; aucun champ
`translation_of` ; et l'appariement par rang dans le document **échoue dès le
deuxième élément** (les deux catalogues sont triés alphabétiquement, chacun
dans sa langue : *Elfe* tombe en face de *Dwarf*).

**Conséquence, à écrire noir sur blanc dans le livrable** : un personnage bâti
sur la couche FR **ne peut pas** être rouvert sur la couche EN — ses
références n'existent pas de l'autre côté. Ce n'est **pas un défaut du lot**,
c'est une propriété de la source. Elle est acceptée pour l'instant (Eric,
2026-08-07 : « ouvrir l'option », pas la livrer).

Ce que le lot fait, donc :
5. Les deux couches restent **autonomes**, chacune déclarant sa langue dans son
   manifeste. **N'invente aucune correspondance FR↔EN** — une correspondance
   devinée est pire que pas de correspondance (elle donnerait un personnage
   silencieusement faux).
6. Écrire `layers/TRADUCTION.md` : la mesure ci-dessus, la conséquence pour un
   joueur, et les pistes pour le futur chantier d'appariement (rapprochement
   par données structurées — niveau + école + portée pour un sort — puis
   arbitrage humain des ambiguïtés). **C'est une note de cadrage, pas un
   travail à faire dans ce lot.**

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

### Les exigences ajoutées le 2026-08-08 — inventaire d'Eric (BRIEF §4b) et résolution de la Q7

**A. Les jets se COMPOSENT — la console a trois formes, pas une.** Eric :
*« architecture différente selon Skill, Actions ou Spells »*. Ce ne sont pas
trois habillages : une **compétence** est un jet contre un seuil ; une
**action** en est deux, liés (toucher, puis des dégâts dont le critique double
les dés) ; un **sort** est encore autre chose — souvent aucun jet du lanceur
mais une sauvegarde de la cible, plus un emplacement consommé, un niveau de
lancement, parfois de la concentration.

C'est **le même mécanisme** que la séparation SRD/FH : une séquence de phases
nommées sur laquelle on s'inscrit. Le valider sur deux usages au lieu d'un est
la raison d'être de ce lot — traités séparément, on construirait deux fois la
même chose et elles divergeraient.
→ Un **type de jet** déclare ses phases ET ses réglages. La liste des réglages
est fermée **par type**, jamais globalement. ⚠️ Corrige au passage le verbe
`configure` livré par le lot 3, qui accepte aujourd'hui un patch partiel
quelconque : c'était la forme « compétence » prise pour la règle générale.
Livrer les trois types SRD (compétence, action, sort) ; FH s'inscrit par-dessus
sans que le chemin commun le cite.

**C. ⚠️ NE PORTE PAS `keepArcana` TEL QUEL — c'est un bug garanti.** Trouvé par
l'expert Fate's Hand le 2026-08-08, et il corrige deux prémisses fausses que
l'architecte avait lui-même écrites. Le déclencheur d'un Éveil arcanique n'est
**pas** « deux 20 naturels » : c'est **un** 20 naturel qui amène les Points de
Destinée **à 0** (vault, `D&D 5+ Fate's Hand Mechanic.md:58` et `:108`). Et on
ne pioche pas un Arcane majeur : on pioche dans **les 78 cartes** — un
**mineur** donne des points temporaires et une Brique, **aucun +1 au Score** ;
seul un **majeur** donne +1 au Score maximum.
`keepArcana()` v1 applique `score+1` / `points+10` **inconditionnellement**, ce
qui n'est juste que parce que le paquet v1 ne contient que les 22 majeurs.
Porté avec 78 cartes, **tout mineur donnerait +1 au Score**.
→ La partie chiffrée **n'existe pas** tant que la carte n'est pas connue : elle
est fonction de la carte. Un seul chemin (la pioche règle et applique), pas
deux moitiés. Et le `+1` au Score maximum est un **acquis permanent sans source
de règle** : écrit seulement dans `resolved`, la prochaine dérivation l'efface
(invariant 1). L'historique des Éveils doit vivre en `build.choices` scalaires.

**B. Sortir les textes du moteur** (loi §0.13). La structure est déjà saine —
chaque verdict a son `id` — mais les libellés anglais vivent dans le module, et
`FATE REFUSED` est écrit en dur au milieu de verdicts qui passent par la table.
Le moteur rend des identifiants ; les mots deviennent des données que l'UI
consomme. Aucune traduction n'est demandée ici : on ouvre la porte, on ne
livre pas les langues.

**D. LA Q7 EST RÉSOLUE — « bardic, tactic, destiny » nomme une CAPACITÉ, pas une
liste de règles.** Tranchée par Eric le 2026-08-08 via l'expert Fate's Hand, qui a
écarté les *deux* lectures que l'architecte proposait. La phrase ne parle ni des
jetons d'affichage ni des règles FH : elle nomme **dépenser un dé pendant ou après
un jet**. Les trois nommés partagent trois propriétés qu'aucun autre bonus ne
partage — un **dé** (pas un modificateur : il a des faces extrêmes qui déclenchent
des règles), applicable **après coup** sur un jet déjà connu comme raté, adossé à
une **ressource comptée**.

**D.1 — Le moteur porte TROIS verbes de dé, et ils ne se ramènent pas l'un à
l'autre.** Les traiter comme un seul est le bug que cette section existe pour
empêcher.

| Verbe | Qui | Fenêtre | Cible |
|---|---|---|---|
| **Ajouter** un dé | Bardic Inspiration · Tactical Mind · Destinée | après un **échec** (les deux SRD) / n'importe quand (Destinée) | le **total** |
| **Relancer** un dé | Inspiration héroïque (SRD 5.2) | **immédiatement** après ce dé | **n'importe quel dé** — le d20, un dé bonus, un dé de dégâts |
| **Monter** avec avantage | Guidance, Inspiration 2014 | **avant** le jet | le **d20** |

Sources vérifiées : Bardic Inspiration et Tactical Mind (**Guerrier niveau 2**, pas
Battle Master) dans `fh-srd/exports/srd/en/class.json` ; Inspiration héroïque dans
`glossary.json` → `srd:glossary:en:heroic-inspiration`, p.183 : *« expend it to
reroll any die immediately after rolling it »*. **Trois fenêtres, trois cibles,
trois portes.** Un moteur qui les traite pareil laissera passer un Bardic sur un
succès. *Guidance* sort du lot des corrections pour une raison nette : il se lance
avant — c'est un bonus de montage, pas une correction.

⚠️ **L'Inspiration héroïque a été RETIRÉE de Fate's Hand, et le SRD la garde.** Le
moteur doit donc faire tourner une mécanique que le système maison n'utilise pas.
C'est le **meilleur cas de test de la pile en couches** du chantier — voir le test
d'acceptation ci-dessous, qui la prend pour juge.

**D.2 — CE QUI NE TOMBE SURTOUT PAS : la transaction de jet ROUVRABLE.** Un jet
réglé n'est pas figé : il doit pouvoir recevoir un dé et **changer de verdict**.
C'est précisément ce que la phrase d'Eric demande de garder. Le mécanisme existe
déjà dans le moteur porté et il est **intouchable** — vérifié par l'architecte :
`adjustment-choice` est une **phase bloquante** (`src/play/session.mjs:51`),
`completeHistoryAdjustment` en est la sortie, `entry.adjusted` est posé en deux
points (`:787` et `:950`), badge `adjusted` (`src/play/lexicon.mjs:142`).

**D.3 — Ce qui tombe, et c'est réel : le vocabulaire de scellage.**
`SEALABLE_SOURCES` (`src/play/lexicon.mjs:37`) déclare **six** sources scellables :
`guidance`, `bardic`, `tactical`, `other-1`, `other-2`, `other-3`. Sous la
définition d'Eric, seuls **`bardic` et `tactical`** sont des dés de correction. Les
quatre autres sont de l'habillage d'affichage, pas de la mécanique — à **supprimer,
pas à désactiver** (loi §0.6). `destiny` est déjà exclu du scellage exprès, et le
commentaire du fichier (`:35-36`) dit pourquoi : *« un dé de Destinée se prend dans
la réserve, ce n'est pas un autocollant »*.

**D.4 — Le remboursement conditionnel.** Tactical Mind n'est **pas** dépensé si le
test échoue quand même (SRD, Guerrier niv. 2). Or l'invariant 4 de `fh-char/1` dit
« décrémenté **au règlement** » : un règlement qui **rend** la ressource selon le
résultat n'est écrit nulle part. **À vérifier dans `src/play/session.mjs` et à
livrer** — c'est une vérification, pas une décision.

**D.5 — LE DON DE DÉ ENTRE JOUEURS — décision ratifiée par Eric le 2026-08-08.**
*« Le dé de Bardic est donné par un barde au joueur : il faudrait qu'un joueur
puisse donner un dé à un autre joueur. Dans de rares cas, notamment avec l'Arcane
du Diable, un joueur peut donner un dé de Destinée à un autre joueur, en réaction
ou à l'avance. »*

C'est une capacité de premier rang, pas un cas limite — et elle traverse **deux
documents `fh-char/1`**, ce que la décision 3 (le personnage appartient au joueur)
n'avait pas prévu. Découpage tranché par l'architecte, à respecter tel quel :

- **Le don est un verbe du bloc `play` chez le DONNEUR** : il décrémente **sa**
  ressource et émet un événement. Le dé reçu est, chez le **RECEVEUR**, une
  ressource comptée ordinaire **portant sa provenance** (qui l'a donné, quelle
  source, quelle fenêtre de validité).
- **Le lot 5 construit les deux bouts, PAS le transport.** Faire voyager le dé
  d'une machine à l'autre est du bloc `table` (M4). Dans le lot 5, un dé reçu se
  pose directement — un test suffit à le prouver.
- **La provenance est un besoin de SCHÉMA** : `resolved.resources[]` n'a pas de
  champ de provenance aujourd'hui. **Ne l'invente pas** — l'architecte révise
  `fh-char/1` dans la même passe que le genre `skill` du lot 6. **Livre la forme
  dont tu as besoin, il ratifie** (loi §0.10).
- **La couche compte** : donner un **dé de Bardic** est SRD ; donner un **dé de
  Destinée** (Arcane du Diable, en réaction ou à l'avance) est **FH**, donc un
  module à drapeau qui s'inscrit sur le même verbe. Un test de plus de la
  séparation — et un bon.
- ⚠️ **La fenêtre « à l'avance » n'est pas la même que « en réaction ».** Un dé
  donné à l'avance est une ressource qui **attend** sur la fiche du receveur ; un
  dé donné en réaction arrive **pendant une transaction ouverte**. Ce sont deux
  portes, comme en D.1 — ne les confonds pas.

**D.6 — La portée de la phrase, pour qu'aucune simplification ne déborde.** Elle
porte sur la complexité du **jet**, jamais sur celle du **builder**. Elle ne retire
rien aux 26 compétences, à la réserve de points, aux planchers, ni aux 78 arcanes.
Et `destiny` étant **nommément** conservé, tout ce qui en découle reste : Chaos,
Overreach, sa sauvegarde, Tables de Fatalité, Éveil arcanique.

### 🎯 Le test d'acceptation — c'est lui qui dit si le lot a réussi

> **Un personnage SRD pur, aucune couche FH chargée, lance un jet de compétence
> de bout en bout et obtient son résultat.**
>
> Et son pendant pour l'exigence A : **une attaque enchaîne toucher puis dégâts
> comme deux phases d'un même jet**, sans qu'aucune ligne du chemin commun ne
> cite Destinée, Chaos ni Overreach.
>
> **Et le troisième, ajouté le 2026-08-08 et le plus dur des trois** : **un
> personnage SRD pur dépense son Point d'inspiration héroïque pour RELANCER un dé
> déjà lancé, et le verdict du jet est recalculé.** FH a retiré cette mécanique,
> le SRD la garde : si elle ne marche pas avec FH débrayé, la thèse en couches ne
> tient pas. C'est le seul test qui prouve la séparation dans le sens difficile —
> une mécanique SRD que le système maison n'utilise **pas**.

Écrits comme des suites exécutables (`tests/play-srd-only.test.mjs`), ils font
foi. S'ils passent, la séparation est réelle ; si l'un d'eux ne peut pas être
écrit, elle est décorative — et le lot le dit platement plutôt que de la
maquiller.

6. **Livrable** : `src/play/` recoupé, les **trois** tests d'acceptation,
   l'inventaire écrit de la coupe (ce qui est parti côté FH et pourquoi), les
   trois types de jet SRD avec leurs réglages fermés, les **trois verbes de dé**
   (D.1) avec leurs trois portes, le **don de dé** aux deux bouts sans transport
   (D.5), la vérification du remboursement conditionnel (D.4), la coupe de
   `SEALABLE_SOURCES` (D.3), les textes sortis en données,
   `contracts/play.md` mis à jour, et **deux listes pour l'architecte** : les
   drapeaux de couche que FH doit lever, et **la forme de provenance dont un dé
   reçu a besoin** dans `resolved.resources[]`. Les deux deviennent des entrées
   de schéma — c'est lui qui les écrit, pas le lot.

**Une décision d'architecte déjà prise, ne la rouvre pas** (elle vient du lot 3,
point ouvert n°1) : pendant une séance, `play` tient une **copie de travail**
des points de vie et des ressources comptées — personne d'autre n'y écrit — et
le bloc `doc` en prend un **instantané à chaque événement** (`pool-changed`,
`roll-settled`). C'est le brouillon recopié en continu : la vitesse du brouillon
sans le risque de perdre une soirée. Les points de vie appartiennent au
personnage et voyagent avec lui ; la main de dés, la sélection et la transaction
sont de la séance et meurent avec elle.

---

## §L6 — LOT `6-srd-tables` : les deux tables qui manquent — **Opus · high**

⚠️ **Ce lot travaille dans `fh-srd`, PAS dans `fhpc`** (loi §0.2 amendée).
**Worktree monté par l'architecte le 2026-08-08** :
`~/tools/fh-srd-worktrees/6-srd-tables`, branche `6-srd-tables` coupée de `main`
(`3decd7c`). **Aucune dépendance** : il part immédiatement, en parallèle du lot 5
(autre dépôt). ⚠️ **Le lot 4, lui, dépend de CE lot** — voir §6.

> 🔧 **Détail d'outillage, déjà réglé — ne le cherche pas.** Les PDF sources
> (11 Mo) sont **hors git** (`.gitignore` : `sources/pdf/`), donc absents d'un
> worktree nu — et le dépôt rouvre le PDF à chaque exécution pour tester
> l'attribution. L'architecte a posé un lien symbolique
> `sources/pdf → ~/tools/fh-srd/sources/pdf` dans ton worktree : les deux PDF sont
> là, épinglés par `sources/sources.lock.json`. Ne re-télécharge rien. `build/`
> (la base sqlite) est aussi un artefact ignoré : il se régénère chez toi.

**POURQUOI CE LOT EXISTE — deux trous mesurés le 2026-08-08 par les conseillers
experts, et vérifiés par l'architecte.** Ils bloquent le builder, donc la date
du 7 novembre :

1. **Les tables de progression de classe n'existent pas comme données.** Aucune
   table niveau → emplacements de sorts ; la mention « Spell Slots per Spell
   Level » n'est qu'un **fragment de texte** au milieu d'une description.
   Conséquence : **un magicien niveau 1 ne reçoit pas ses emplacements.**
2. **Les 18 compétences du SRD ne sont records dans aucun des 12 genres.**
   Vérifié : rien pour athlétisme, discrétion, persuasion, arcanes ; seul
   « perception » apparaît, et c'est le *concept* de perception passive dans
   `glossary.json`. Conséquence : **un personnage ne peut pas choisir ses
   compétences.**

**LIS D'ABORD LA CALIBRATION QUI T'ATTEND — elle t'économise le plus dur.** Le
parser précédent a délibérément différé cette table **en laissant sa mesure au
successeur**, dans le docstring de `src/parse_classes_en.py` : la table de
progression est **row-coherent** dans le texte extrait — « a blank-line-separated
group of N lines per level, matching the column count » — **contrairement** aux
tables d'équipement qui étaient complètement mélangées. Il le qualifie lui-même
de « meaningfully easier starting point ». Le README §« Equipment's genuine
multi-column table question » complète le tableau. **Ne re-mesure pas ce qui est
déjà écrit ; vérifie-le et pars de là.**

### Ce qu'il faut produire

1. **La progression de classe**, pour les 12 classes, en **FR et EN** : bonus de
   maîtrise par niveau, emplacements de sorts par niveau de sort, et la colonne
   de ressource propre à chaque classe (Rages, Points de Sorcellerie…). Forme des
   records à proposer — c'est un choix de structure, argumente-le comme le parser
   de classes a argumenté le sien.
2. **Les compétences** : les 18 du SRD, avec leur caractéristique. Elles n'ont
   aujourd'hui aucun genre. **Propose le genre `skill`** (recommandé par l'expert
   Fate's Hand, qui a mesuré l'absence) — mais dis si la source justifie un autre
   rangement.
3. **Un livrable écrit : la FORME des nouveaux records.** L'architecte s'en sert
   pour réviser `fh-char/1` et `fh-layer/1` côté `fhpc`, où les 12 genres sont
   énumérés en dur et où un genre inconnu est rejeté bruyamment. **Ce n'est pas
   ton travail de toucher `fhpc`** — livre la forme, l'architecte révise le
   contrat.

### La discipline de `fh-srd`, qui n'est pas la même que celle de `fhpc`

Ce dépôt a ses propres règles, plus strictes, et elles sont la raison de sa
fiabilité — **respecte-les à la lettre** :
- **Déterminisme** : deux exécutions produisent une sortie byte-identique, les
  exports sont commités, et un rebuild laisse l'arbre **propre**.
- **La source est épinglée par SHA-256** (`sources/sources.lock.json`) — WotC a
  déjà réédité le PDF FR sous le même numéro de version, le pin n'est pas de la
  paranoïa.
- **L'attribution est testée caractère pour caractère** à chaque exécution, en
  rouvrant le PDF source.
- **Le tripwire lexical** écarte les produits d'identité ; ne le contourne
  jamais, et si un terme te bloque, remonte-le plutôt que de l'exclure toi-même.
- **`exports/MANIFEST.json` doit être régénéré** — c'est lui que `fhpc` vérifie.
- Le dépôt est **PUBLIC** et sous CC-BY : rien qui ne vienne du SRD.

### Le test d'acceptation

> Un **magicien de niveau 3** peut recevoir ses emplacements de sorts, et un
> **roublard de niveau 1** peut choisir ses compétences — **depuis les exports
> seuls**, sans qu'aucune valeur ne soit codée en dur ailleurs.

Écris-le comme une suite exécutable. S'il ne passe pas, le lot n'a pas atteint
son but, quel que soit le nombre de records produits.

**Si la table résiste à l'extraction** — c'est un vrai risque, le parser
précédent l'a différée deux fois — **dis-le platement avec la mesure** plutôt que
de livrer un parseur approximatif. Une table de progression fausse produirait des
personnages silencieusement faux, ce qui est pire que pas de table du tout.

---

## §6 — Séquencement, revue, fusion

```
VAGUE 1 : 1-squelette    (Sonnet·high, sur main)   ← seul, tout en dépend
VAGUE 2 : 2-schemas      (Opus·high)   ∥   3-moteur (Opus·high)     ✅ livrés
VAGUE 3 : 6-srd-tables   (Opus·high, dépôt fh-srd)  ∥  5-moteur-srd-fh (Opus·high)
          ↑ aucune dépendance, priorité d'Eric        ↑ dépend du lot 3 FUSIONNÉ
          (dépôts différents : fh-srd contre fhpc)     🚀 LANCÉS le 2026-08-08

VAGUE 4 : 4-couche-srd   (Sonnet·medium)
          ↑ dépend du lot 6 LIVRÉ **et** de la révision des schémas par
            l'architecte. Voir la correction ci-dessous.
```

### ⚠️ CORRECTION DU 2026-08-08 — le lot 4 n'est PAS parallèle au lot 6

La version précédente de ce §6 classait le lot 6 « hors vagues, aucune dépendance,
peut partir en parallèle des lots 4 et 5 ». **Le lot 6 n'a effectivement aucune
dépendance — mais le lot 4, lui, dépend de LUI.** Le raisonnement fautif était
« autre dépôt » ; ce n'est pas le test. Le test est celui d'Eric, et il s'applique
d'un dépôt à l'autre. Mesuré par l'architecte avant lancement :

1. Le prompt du lot 4 cite `fh-srd/exports/srd/{fr,en}/*.json` et
   `exports/MANIFEST.json` — **le lot 6 écrit ces fichiers**, sa propre discipline
   lui imposant de régénérer le MANIFEST.
2. Plus contraignant encore : dans `schemas/fh-layer.schema.json`, `records` est
   `additionalProperties: false` avec les **12 genres énumérés en dur** (idem
   `fh-char.schema.json:624`). **Un genre `skill` serait rejeté bruyamment.** Le
   lot 4 lancé aujourd'hui ne *peut pas* porter les compétences, même si elles
   existaient déjà.

**Le mode d'échec, s'il partait quand même** : il livrerait une couche SRD sans
compétences ni emplacements de sorts — commitée, tests verts, seuils respectés —
et le trou n'apparaîtrait qu'au M2, quand le builder ne trouve rien à choisir. Ce
n'est pas un conflit git, c'est exactement ce que la règle de séquencement existe
pour empêcher.

**La chaîne réelle** : lot 6 livre la forme des records → **l'architecte révise
`fh-char/1` et `fh-layer/1`** (c'est du contrat, donc son travail) → le lot 4
génère.

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

---

## §8 — Les conseillers experts (créés le 2026-08-08)

Décision d'Eric : trois **conseillers**, distincts des lots. Un lot **fait** du
travail dans un worktree ; un conseiller **répond à des questions** et ne
modifie rien. Ils existent parce que l'architecte a buté trois fois en deux
jours sur des questions hors de son domaine — et parce que, trois fois aussi,
une mesure a contredit une affirmation confiante qui était la sienne.

| Conseiller | Modèle · effort | Ce qu'il couvre | Première question |
|---|---|---|---|
| **VTT et interopérabilité** | Sonnet · high | Foundry, Roll20, AboveVTT, **Owlbear Rodeo** — après une recherche web d'actualisation obligatoire | Que doit contenir un personnage pour entrer dans chacun, et qu'est-ce qui manque à `fh-char/1` ? |
| **Règles et juridique SRD** | Sonnet · high | SRD 5.2.1 CC-BY-4.0, règles **et** licence | ⚖️ La couche FH de base : publique, privée, ou publique-réduite ? |
| **Fate's Hand** | Opus · medium | Les règles maison d'Eric | L'Éveil arcanique : le moteur peut-il appliquer la partie chiffrée ? |

**Les trois fils existent depuis le 2026-08-08.** Titres exacts, pour les
retrouver via `list_sessions` (l'architecte peut leur écrire avec
`send_message`) :

| Conseiller | Titre du fil |
|---|---|
| Fate's Hand | `EXPERT Fate's Hand system advisor` |
| SRD | `EXPERT conseiller SRD` |
| VTT | `EXPERT  conseiller VTT` (deux espaces après EXPERT) |
| Produit | `EXPERT produit` — **antérieur aux trois autres** : ce siège a précédé celui de l'architecte et **a suggéré sa création**. Mandat mis à jour le 2026-08-08 |

⚠️ **Piège d'outillage, payé le 2026-08-08** : `list_sessions` n'a pas retourné
le fil `EXPERT produit` même à 14 entrées, alors que l'interface le montrait —
un fil sans activité enregistrée peut être invisible à l'API. L'architecte en a
conclu à tort qu'il n'existait pas. **Ne jamais conclure « ça n'existe pas »
d'une liste tronquée** : c'est une mesure incomplète présentée comme un fait.

**Les trois lois gravées dans chaque mandat**, et c'est ce qui les rend utiles
plutôt que dangereux :
1. **Dire « je ne sais pas » plutôt qu'inventer.** Une réponse assurée et fausse
   ne réduit pas l'incertitude : elle la remplace par une erreur qu'on ne
   découvre qu'en la construisant.
2. **Citer la source dès qu'elle est vérifiable**, et signaler une certitude
   basse.
3. **Nommer qui devrait répondre** quand la question dépasse le domaine.

> 📌 **La leçon du 2026-08-08, et elle vaut pour TOUS les sièges.** Le mandat du
> conseiller produit reproche au premier occupant de son siège « trois faits
> faux en une journée, tous par confiance, tous corrigés par une simple lecture
> de fichier ». Le même jour, l'architecte a trouvé **trois faits faux dans ce
> mandat** (un fichier annoncé qui n'existe nulle part, un cherry-pick devenu
> inutile, une page vault décrite comme écrasée alors qu'elle venait d'être
> créée) — et s'est lui-même fait démentir **quatre fois par une mesure**, dont
> une fois par un lot. **Aucun siège n'est plus fiable qu'un autre : tout siège
> dérive dès qu'il écrit de mémoire au lieu de relire.** C'est la seule raison
> d'être de la loi n°2 (citer la source vérifiable) — elle ne protège pas contre
> l'incompétence, elle protège contre la confiance.

**Deux gardes de périmètre** : l'expert VTT doit se documenter par recherche
web avant de répondre (les API bougent, la connaissance d'un modèle a une date
de péremption) ; l'expert FH ne dépose **jamais** de contenu Fate's Hand dans
le dépôt public — il en parle, il ne l'y écrit pas.

**Le conseiller PRODUIT n'est pas un ajout du 2026-08-08 : il PRÉCÈDE le siège
d'architecte et en a suggéré la création.** Corrigé le jour même — l'architecte
l'avait d'abord noté comme « à créer », puis comme « créé le 2026-08-08 », deux
fois faux. Son domaine : vision globale du positionnement de Fate's Hand dans l'univers D&D sur le web. Sa première mission est de vérifier que le document de fondation — ratifié le 3 août, **avant** le virage du 7 — tient encore maintenant que le produit a changé de nature. Il hérite aussi de la question de la couche FH publique/privée, que l'expert SRD a sortie du terrain juridique pour la remettre sur le terrain commercial.

**Un cinquième est identifié, pas créé** : un conseiller *interface de builder*,
utile au M3 seulement, et cadré pour apporter les conventions du domaine sans
décider à la place d'Eric — qui a l'interface en tête. **Écartés
délibérément** : « expérience de table » (Eric est le MJ, ce serait un
doublon) et « MCP » (l'architecte le porte). Le **relecteur adversarial**, qui
a eu le meilleur rendement mesuré de la v1 — quatre défauts réels, 32 lignes de
correctif contre 162 lignes de tests — n'est **pas** un conseiller mais un
**lot** : on ne lui pose pas de questions, on lui donne du code à casser. À
lancer quand le builder existera.
