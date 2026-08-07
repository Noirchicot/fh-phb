# Lot 3 — pool de ressources : inventaire du couplage, et arrêt avant extraction

**Branche** : `pool-resources` (partie de `split-pure-modules`, SHA `5d0012b`)
**Date** : 2026-08-07
**Verdict** : **ARRÊT. Aucune extraction commitée.** Le GATE de la mission n'est
pas franchi, et de loin. La décision de passer outre appartient à Eric.

---

## 1. Le bloc concerné

Repéré par **ancres textuelles** dans `docs/javascripts/fh-player-sheet.js` :

- début : le commentaire `/* ── Phase 4: the COUNTED pool ("Dice Pool ≠ Dice Selector") ───────`
  (l. 2438 à ce SHA)
- fin : l'accolade fermante de `renderPoolCard()` (l. 2699), juste avant le
  commentaire `/* ── The Destiny & Dice Pool band (phase 1, dock-dice-tray) ─────────`

Soit **262 lignes**, dont **197 lignes de code** hors commentaires et blancs.
Plage vérifiée **équilibrée en commentaires** (12 `/*` pour 12 `*/`), et les
lignes 2437 / 2700 qui l'encadrent sont hors commentaire : la paire d'ancres est
saine pour une coupe future.

Les **24 fonctions** annoncées dans la mission sont toutes présentes, aucune
manquante, aucune en trop :

`poolList`, `poolResourceById`, `visiblePoolResources`, `normalizePoolResource`,
`normalizePoolResources`, `poolSourceIconFor`, `poolTitle`,
`recreditPoolResource`, `recreditPoolDie`, `recreditPendingPoolDice`,
`poolResourceReferenced`, `prunePoolResources`, `spendPoolResource`,
`newPoolDraft`, `openPoolEdit`, `syncPoolCardInputs`, `onPoolCardInput`,
`savePoolCard`, `deletePoolResource`, `poolChipFace`, `poolChipHtml`,
`renderPoolStrip`, `syncPoolFit`, `renderPoolCard`.

Plus **6 constantes** définies dans la plage : `POOL_DIE_SIDES`,
`MAX_POOL_RESOURCES`, `MAX_POOL_COUNT`, `POOL_TINT_SEAL`, `POOL_TINTS`,
`POOL_CHIP_W`. **30 symboles** au total.

---

## 2. Ce que le bloc touche hors de lui-même

### 2.1 `state` — 37 accès directs, sur 27 des 197 lignes de code

Compté **par script** sur la plage exacte, source débarrassée des commentaires,
des chaînes et des littéraux regex (numérotation préservée).

| Chemin | lectures | écritures |
|---|---:|---:|
| `state.poolPrompt` (+ `.type`) | 5 | 4 |
| `state.poolResources` | 2 | 3 |
| `state.poolFit` | 2 | 1 |
| `state.message` | — | 4 |
| `state.messageKind` | — | 4 |
| `state.rollConfig` | 3 | — |
| `state.traySelection` (`.forEach/.some/.length/.push`) | 4 | — |
| `state.destinyPoolMenu` | — | 2 |
| `state.rollSequence.staged` | — | 1 |
| `state.trayResults` | — | 1 |
| `state.diePrompt` | — | 1 |
| **Total** | **16** | **21** |

À quoi s'ajoutent **8 mutations indirectes** de sous-arbres de `state`, que le
comptage par chemin ne voit pas :

```
l.2493  res.count=clamp(…)                    ← élément de state.poolResources
l.2531  res.count=Number(res.count)-1                    idem
l.2539  res.count=Number(res.count)-1                    idem
l.2546  res.count=Number(res.count)-1                    idem
l.2593  Object.assign(res, normalizePoolResource(…))     idem
l.2597  poolList().push(…)                    ← state.poolResources lui-même
l.2542  cfg.bonusDice.push(bonus)             ← state.rollConfig.bonusDice
l.2549  state.traySelection.push(free)        ← state.traySelection
```

**29 écritures / mutations au total.** Et surtout : sur les **10 champs de
`state`** que le bloc touche, **7 ne lui appartiennent pas** — `message`,
`messageKind`, `rollConfig`, `traySelection`, `rollSequence`, `trayResults`,
`diePrompt` (`destinyPoolMenu` appartient au bandeau Destiny). Le bloc n'est pas
un possesseur d'état qui rendrait des lectures ; il écrit dans la main de jeu et
dans la console de jet.

### 2.2 Appels du bloc vers le reste du dock — 18 fonctions

| Symbole | Défini l. | Symbole | Défini l. |
|---|---:|---|---:|
| `bonusSourceMark` | 998 | `refreshEventPanel` | 806 |
| `entryBonusDice` | 1029 | `refreshOpenTray` | 1465 |
| `invokeBuilder` | 1373 | `render` | 4615 |
| `newBonusDie` | 1027 | `renderMessage` | 4401 |
| `newFreeDie` | 1016 | `rollOpen` | 1452 |
| `openEntry` | 1453 | `stagedBonusCount` | 1454 |
| `persistPlayState` | 777 | `stagedList` | 1451 |
| `prepareTrayForConfig` | 1297 | `syncConsoleInputs` | 4725 |
| `pushEvent` | 813 | `syncPresetFlags` | 4722 |

Plus les constantes du dock `MAX_BONUS_DICE`, `MAX_FREE_DICE`, et la variable
DOM `root` (6 usages, dans `syncPoolCardInputs` et `syncPoolFit`).

`esc`, `clamp`, `uuid`, `dieSvg`, `DIE_MATERIAL`, `SOURCE_TINT` viennent déjà de
`FH.utils` / `FH.diceVisual` — ce ne sont **pas** des entrées de contrat.

### 2.3 Une seule fonction concentre le couplage

Analyse de pureté par fonction, par script :

```
spendPoolResource     state:13  dock:17 fonctions   ← à elle seule, tout le contrat
savePoolCard          state: 4  dock: 3
openPoolEdit          state: 3  dock: 1
renderPoolStrip       state: 3  dock: 0
poolList              state: 3  dock: 0
recreditPendingPoolDice state:2 dock: 1 (stagedList)
poolResourceReferenced  state:2 dock: 1 (stagedList)
syncPoolFit           state: 2  root:2  dock: 1 (render)
deletePoolResource    state: 2  dock: 2
prunePoolResources    state: 1  dock: 0
syncPoolCardInputs    state: 1  root:4  dock: 0
renderPoolCard        state: 1  dock: 1 (bonusSourceMark)
```

`spendPoolResource` **est** le pipeline de jet du dock en miniature : elle
choisit entre trois mains (jet ouvert / console préparée / main libre), respecte
`MAX_BONUS_DICE` et `MAX_FREE_DICE`, fabrique un dé bonus ou libre, resynchronise
les préréglages et le tray. Sortir le pool, c'est sortir cette fonction — et elle
ne peut pas partir sans emmener 17 des 18 entrées de la colonne « dock ».

---

## 3. Ce que le **reste du dock** touche dans le pool

C'est la moitié qu'on oublie, et c'est elle qui décide.

### 3.1 Fonctions du bloc appelées depuis le dock — 16 symboles, 27 sites

| Symbole | sites | Symbole | sites |
|---|---:|---|---:|
| `recreditPoolDie` | 7 | `poolList` | 2 |
| `syncPoolCardInputs` | 4 | `deletePoolResource` | 1 |
| `openPoolEdit` | 3 | `newPoolDraft` | 1 |
| `MAX_POOL_COUNT` | 1 | `normalizePoolResources` | 1 |
| `onPoolCardInput` | 1 | `prunePoolResources` | 1 |
| `recreditPendingPoolDice` | 1 | `renderPoolCard` | 1 |
| `renderPoolStrip` | 1 | `savePoolCard` | 1 |
| `spendPoolResource` | 1 | `syncPoolFit` | 1 |

Celles-là se traitent par bloc d'alias, comme au lot 1 — **ce n'est pas le
problème.** Le problème est en dessous.

### 3.2 Le dock **écrit** dans les données du pool — 13 écritures hors du bloc

Comptées par script, chemin complet, hors commentaires et chaînes :

| Chemin | lectures hors bloc | **écritures hors bloc** |
|---|---:|---:|
| `state.poolPrompt` | 7 | **8** (l. 769, 1325, 4019, 4914, 4915, 4917, 5108, 5164) |
| `state.poolPrompt.draft` | 4 | — |
| `state.poolPrompt.draft.kind` | — | **1** (l. 4920) |
| `state.poolPrompt.draft.sides` | — | **1** (l. 4921) |
| `state.poolPrompt.draft.tint` | — | **1** (l. 4922) |
| `state.poolPrompt.draft.count` | 1 | **1** (l. 4923) |
| `state.poolPrompt.type` | 1 | — |
| `state.poolResources` | — | **1** (l. 768) |
| **Total** | **13** | **13** |

Les quatre lignes 4920-4923 sont la pièce à conviction :

```js
if(button.dataset.poolKind!==undefined){syncPoolCardInputs();if(state.poolPrompt&&state.poolPrompt.draft)state.poolPrompt.draft.kind=…;render();return;}
if(button.dataset.poolSides!==undefined){…state.poolPrompt.draft.sides=Number(…);…}
if(button.dataset.poolTint!==undefined){…state.poolPrompt.draft.tint=…;…}
if(button.dataset.poolCountStep!==undefined){…state.poolPrompt.draft.count=clamp(Number(state.poolPrompt.draft.count)+…,1,MAX_POOL_COUNT);…}
```

Le dock **appelle `syncPoolCardInputs()` du bloc pour que le module range la
frappe dans le brouillon, puis écrit lui-même dans le même brouillon.** Les deux
côtés écrivent `state.poolPrompt.draft` dans la même instruction. C'est
littéralement la poignée mutable partagée que le GATE interdit.

`state.poolFit` est le seul champ réellement possédé par le bloc : **0** accès
hors du bloc en production.

### 3.3 Le modèle du pool a un troisième propriétaire : le schéma des dés

`poolResourceId` n'est pas un champ du pool — c'est un champ **du dé**, normalisé
par le pipeline de dés du dock :

- l. 1025 `normalizeFreeDie` : `poolResourceId:raw.poolResourceId||undefined`
- l. 1028 `normalizeBonusDie` : `poolResourceId:die.poolResourceId||undefined`
- l. 2069 `rollTrayDice` : `state.traySelection=state.traySelection.filter(function(die){return !die.poolResourceId;});`
  — « ROLL rend la dépense définitive : un dé venu du pool quitte la sélection »

Cette règle-là, qui est **du pool** (la loi « ROLL dépense pour de bon »), vit
dans le moteur de jet et y resterait. Après coupe, la loi du pool serait écrite
moitié dans `fh-pool.js`, moitié dans le tronc — et rien dans le code ne dirait
qu'il faut lire les deux.

### 3.4 Les tests substituent les trois champs, et réassignent `root`

`tests/dice-pool-resources.test.js` — la suite qui couvre précisément ce domaine :

- `reset()` (l. 75) fait `Object.assign(t.state,{… poolResources:…, poolPrompt:null, poolFit:4, …})` ;
- l. 91 `t.state.poolResources=[]` avant de tester le rechargement ;
- l. 185, 208, 221 `t.state.poolPrompt={…}` — l'objet est **substitué** ;
- l. 194, 198 `t.state.poolFit=4` puis `=10` ;
- l. 36 `_setRoot:function(value){root=value;}` — la suite **réassigne `root`**,
  la variable DOM du dock, et l. 223/234 s'en sert pour `syncPoolCardInputs`.

Conséquence, identique à celle du lot 2 : le contrat ne pourrait capturer ni
`state.poolResources`, ni `state.poolPrompt`, ni `root` **par référence** à
l'initialisation. Il faudrait des accesseurs réévalués à chaque appel
(`ctx.resources()`, `ctx.prompt()`, `ctx.root()`), donc réécrire les 37
références `state.…` et les 6 références `root` du bloc. Ce n'est plus un
déménagement, c'est une réécriture — et l'invariant « aucun changement de
comportement, déménagement pas réécriture » tombe.

La suite expose par ailleurs **16 des 30 symboles du bloc** dans `__fhPool`
(`poolList`, `visiblePoolResources`, `normalizePoolResource(s)`,
`spendPoolResource`, `recreditPoolResource`, `recreditPoolDie`,
`prunePoolResources`, `newPoolDraft`, `savePoolCard`, `deletePoolResource`,
`openPoolEdit`, `renderPoolStrip`, `renderPoolCard`, `onPoolCardInput`,
`syncPoolCardInputs`) : ceux-là doivent rester visibles comme noms locaux dans la
clôture du dock. Le bloc d'alias suffirait — **ce point-là n'est pas bloquant.**

### 3.5 Aucun autre fichier ne touche le pool

Vérifié par recherche sur tout `docs/javascripts/` : `poolResources`,
`poolPrompt`, `poolFit` n'apparaissent que dans `fh-player-sheet.js`. Aucun
panneau, aucun module déjà sorti. C'est le seul point favorable du dossier.

---

## 4. Le contrat qu'il faudrait, et pourquoi il ne tient pas

Surface minimale honnête, en accesseurs (obligatoires, cf. §3.4) :

```
resources()          → state.poolResources   (tableau vivant, muté des 2 côtés)
prompt() / setPrompt() → state.poolPrompt    (objet vivant, .draft écrit des 2 côtés)
fit() / setFit()     → state.poolFit
root()               → la racine DOM         (réassignée par les tests)
setMessage(txt,kind) → state.message + state.messageKind
closeDestinyMenu()   → state.destinyPoolMenu
setDiePrompt(null)   → state.diePrompt
traySelection()      → state.traySelection   (tableau vivant, le bloc y pousse)
setTrayResults([])   → state.trayResults
rollConfig()         → state.rollConfig      (le bloc pousse dans .bonusDice)
setStaged(list)      → state.rollSequence.staged
--- 11 entrées d'état ---
bonusSourceMark, entryBonusDice, invokeBuilder, newBonusDie, newFreeDie,
openEntry, persistPlayState, prepareTrayForConfig, pushEvent,
refreshEventPanel, refreshOpenTray, render, renderMessage, rollOpen,
stagedBonusCount, stagedList, syncConsoleInputs, syncPresetFlags
--- 18 entrées de fonction ---
MAX_BONUS_DICE, MAX_FREE_DICE
--- 2 constantes ---
```

**31 entrées.** Le GATE demande « ≈10 ou moins ». On est à trois fois le seuil, et
le second critère — « sans poignée mutable partagée » — est violé **trois fois** :
`resources()`, `prompt()` et `traySelection()` rendent chacune un sous-arbre de
`state` que les deux côtés écrivent.

Comparaison avec `panelContext()` (l. 4559), la référence citée dans la mission :

| | `panelContext()` | contrat du pool |
|---|---|---|
| entrées | 12 | **31** |
| état transmis | **instantanés en lecture** (`character`, `destiny`, `profile`) | **3 sous-arbres mutables partagés** |
| état privé | `store(id)` → `state.panelData[id]`, que **le dock ne lit jamais** | `state.poolPrompt.draft`, écrit par le dock en 4 endroits |
| écritures du module dans `state` | aucune — tout passe par `store()` / `save()` | **29**, dont 7 champs qui appartiennent à d'autres |
| écritures du dock dans l'état du module | aucune | **13** |
| sens de la dépendance | dock → panneau, à sens unique | **bidirectionnel** |

`panelContext()` marche parce qu'un panneau **ne possède rien qu'il partage** : il
reçoit une photo, il écrit dans un tiroir que personne d'autre n'ouvre, il rend
des rappels. Le pool, lui, ne possède qu'un seul champ pour de bon (`poolFit`) ;
son brouillon d'édition est co-écrit par le dock, sa liste de ressources est
reconstruite par le chargement de profil, et sa fonction centrale écrit dans la
main de jeu.

---

## 5. Verdict du GATE

**Arrêt.** Les deux critères d'arrêt sont atteints, séparément et ensemble :

1. **Contrat à 31 entrées** au lieu de « ≈10 ou moins » ;
2. **Trois poignées mutables partagées** (`resources()`, `prompt()`,
   `traySelection()`), dont une, `state.poolPrompt.draft`, est écrite par le dock
   et par le bloc **dans la même instruction** (l. 4920-4923).

Faire la coupe donnerait : un fichier de 262 lignes, un contrat de 31 entrées dont
trois annulent les vingt-huit autres, 43 références réécrites en accesseurs (37
`state.` + 6 `root`), un diff illisible que plus personne ne peut relire ligne à
ligne, la loi « ROLL dépense pour de bon » toujours coupée en deux entre
`fh-pool.js` et le moteur de jet — et exactement le même enchevêtrement qu'avant,
plus une indirection. C'est la coupe cosmétique que la mission demande de refuser.

---

## 6. Ce qu'il faudrait changer d'abord pour que la coupe devienne honnête

Noté sans être fait — c'est une décision d'Eric. Dans cet ordre : chaque étape est
petite, testable seule, et **utile même si la coupe ne se fait jamais**.

1. **Rendre le brouillon d'édition privé** (le plus rentable, le plus petit).
   Les quatre gestionnaires l. 4920-4923 écrivent dans `state.poolPrompt.draft`
   après avoir appelé `syncPoolCardInputs()`. Remplacer les quatre par un seul
   appel au bloc :
   ```js
   setPoolDraft("kind", …) / ("sides", …) / ("tint", …) / ("countStep", …)
   ```
   une fonction de 4 lignes dans le bloc, qui fait le `syncPoolCardInputs()` +
   l'écriture + `render()`. Supprime **4 des 13 écritures du dock** et,
   surtout, la seule poignée co-écrite au même endroit. Sans risque : le
   comportement est ligne à ligne le même.

2. **Faire du bloc le seul à ouvrir et fermer sa carte.**
   `state.poolPrompt=null` est écrit en 6 endroits du dock (l. 769, 1325, 4019,
   4917, 5108, 5164) et `={type:…}` en 2 (l. 4914, 4915). Une paire
   `openPoolList()` / `closePoolCard()` exposée par le bloc absorbe les huit.
   `state.poolPrompt` cesse alors d'être une poignée partagée et devient l'état
   privé du module — la forme exacte de `panelStore()`.

3. **Sortir `poolResources` du chargement de profil** (l. 768).
   `state.poolResources=normalizePoolResources(local.poolResources)` devient
   `loadPoolResources(local.poolResources)`, dans le bloc. Dernière écriture du
   dock dans les données du pool ; après quoi le sous-arbre a un propriétaire
   unique.

4. **Renverser la dépendance de `spendPoolResource`** — le vrai travail, à faire
   seulement si (1)–(3) sont faits.
   Aujourd'hui le pool sait mettre un dé dans les trois mains (jet ouvert,
   console, main libre) : 17 entrées de contrat pour cette seule fonction. Il
   faudrait que le dock expose **une** porte, `stagePoolDie({label, short, sides,
   sourceIcon, colour, poolResourceId})`, qui choisit la main et applique les
   plafonds. `spendPoolResource` retomberait à : vérifier le compte, décrémenter,
   appeler la porte. Les 17 entrées deviennent **1**, et les écritures du bloc
   dans `traySelection` / `rollConfig` / `rollSequence` / `trayResults`
   disparaissent — c'est-à-dire 4 des 7 champs empruntés. Ce refactor a une
   valeur propre : la même porte servirait à Destiny et aux sceaux, qui font
   aujourd'hui le même choix de main chacun de leur côté.

5. **Décider où vit `poolResourceId`.** Soit le champ reste dans le schéma des
   dés et la ligne 2069 (`filter(die => !die.poolResourceId)`) est documentée
   comme appartenant au pool ; soit le moteur de jet appelle une
   `dropSpentPoolDice()` du bloc. La deuxième option est la seule qui laisse la
   loi « ROLL dépense pour de bon » entière dans un seul fichier.

Après (1), (2), (3) et (4), le contrat retomberait à environ **9 entrées** :
`resources()` (propriétaire unique), `fit()`/`setFit()`, `root()`,
`setMessage()`, `stagePoolDie()`, `stagedList()`, `persistPlayState()`,
`render()`. Neuf entrées, **aucune poignée co-écrite** — la coupe redeviendrait
honnête, et le module ferait alors 262 lignes qui se lisent seules.

---

## 7. Un lot pur existe dans ce bloc — non fait

Si l'envie est d'avancer sans toucher au couplage : **7 fonctions et 6 constantes
du bloc sont pures** (aucune référence à `state`, à `root`, ni au dock) et
pourraient rejoindre un `fh-pool-model.js` au patron du lot 1 :

`normalizePoolResource`, `normalizePoolResources`, `poolSourceIconFor`,
`poolTitle`, `newPoolDraft`, `poolChipFace`, `poolChipHtml`
(+ `POOL_DIE_SIDES`, `MAX_POOL_RESOURCES`, `MAX_POOL_COUNT`, `POOL_TINT_SEAL`,
`POOL_TINTS`, `POOL_CHIP_W`).

Elles ne dépendent que de `clamp`, `uuid`, `esc`, `dieSvg`, `DIE_MATERIAL` —
tous déjà dans `FH.utils` / `FH.diceVisual`.

Trois autres sont pures **en apparence seulement** — `poolResourceById`,
`visiblePoolResources`, `recreditPoolResource`, `recreditPoolDie` ne nomment pas
`state` mais lisent la liste par `poolList()` ; elles suivraient le modèle si et
seulement si on leur passe la liste, ce qui change leur signature (donc les 7
sites d'appel de `recreditPoolDie` dans le dock, donc ce n'est plus un
déménagement).

Ce lot n'a **pas** été fait : ce n'était pas la mission, et couper la moitié pure
du pool sans décision d'Eric sur le reste laisserait le pool réparti sur deux
fichiers pour un gain nul — exactement l'argument du lot 2, §7.

---

## 8. Vérifications faites

- `npm test` sur `pool-resources` **avant** toute modification : **19/19**.
- `npm test` **après** : **19/19**. Aucun fichier `.js`, `.yml` ni `.html` n'a été
  modifié sur cette branche — le seul ajout est ce document. Les trois listes de
  chargement (`mkdocs.yml`, `tools/dock-harness.html`, le prélude des 10 suites)
  sont donc inchangées et restent cohérentes entre elles.
- Inventaire des accès à `state` : **par script**, sur la plage exacte 2438-2699,
  source débarrassée des commentaires, des chaînes et des littéraux regex,
  numérotation de lignes préservée. Lectures et écritures classées séparément
  (`=` hors `==`/`===`, `++`/`--`/`+=`/`-=`, et les mutations
  `push`/`splice`/…), puis les 8 mutations indirectes relevées à la main et
  listées nommément au §2.1.
- Usages hors bloc : recherche des **30 symboles** définis dans la plage sur tout
  le reste du dock, et des chemins `state.pool*` dans les deux sens.
- Équilibre des commentaires de la plage candidate : **12 `/*` pour 12 `*/`**,
  bornes hors commentaire.
- `tests/dice-pool-resources.test.js` lu en entier avant de décider (§3.4).

## 9. Ce qui n'a pas été fait, et pourquoi

- **Aucune extraction** : GATE non franchi (§5).
- **Aucun refactor préparatoire** des points 1 à 5 du §6 : ce sont des
  changements de comportement potentiels dans le dock, hors du mandat « aucun
  changement de comportement », et la décision appartient à Eric.
- **Le lot pur du §7** : hors mission, et sans valeur tant que le reste du pool
  n'est pas tranché.
- **Pas de modules ES** : le lot 1 bis (`ES-MODULES-EVALUATION.md`) a montré leur
  incompatibilité avec `vm.runInNewContext`. Le patron globals + alias n'a pas
  été remis en question.
