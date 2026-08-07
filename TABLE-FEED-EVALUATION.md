# Lot 2 — serveur de table : inventaire du couplage, et arrêt avant extraction

**Branche** : `table-feed` (partie de `split-pure-modules`, SHA `5d0012b`)
**Date** : 2026-08-07
**Verdict** : **ARRÊT. Aucune extraction commitée.** La décision de passer outre
appartient à Eric, pas à moi.

---

## 1. Le bloc concerné

Repéré par ancres textuelles dans `docs/javascripts/fh-player-sheet.js` :

- début : le commentaire `/* ── The shared campaign feed ──────` (l. 2975 à ce SHA)
- fin : la fermeture de `feedTone()` (l. 3244), juste avant le commentaire
  `/* Renders another player's roll from the fh-roll/1 display layer alone`

Soit **270 lignes**, dont **235 lignes de code** hors commentaires, et les 23
fonctions annoncées dans la mission — toutes présentes, aucune manquante,
aucune en trop :

`feedActive`, `feedPad`, `setFeedStatus`, `intentOutcome`, `intentFor`,
`feedSignature`, `tablePost`, `broadcastEntry`, `feedMerge`, `feedRewind`,
`pollFeed`, `refreshFeed`, `setTableState`, `tableWsUrl`, `manualTableKey`,
`disconnectTableWs`, `scheduleTableRetry`, `connectTableWs`, `checkRendezvous`,
`rendezvousTick`, `startFeed`, `stopFeed`, `feedTone`.

Plus quatre constantes définies dans la plage : `FEED_MAX`, `FEED_LOOKBACK`,
`TABLE_RENDEZVOUS_INTERVAL`, `TABLE_WS_RETRY_MAX`.

---

## 2. Ce que le bloc touche hors de lui-même

### 2.1 `state` — 107 occurrences de `state.` sur 235 lignes de code

64 lignes de code sur 235 (27 %) touchent `state`. Détail par chemin :

| Chemin | lectures | écritures |
|---|---|---|
| `state.feed.tableUrl` | 8 | 5 |
| `state.feed.ws` | 6 | 3 |
| `state.feed.tableState` | 5 | 3 |
| `state.feed.wsRetryTimer` | 5 | 3 |
| `state.feed.sent` | 4 | 2 |
| `state.feed.rendezvousTimer` | 4 | 3 |
| `state.feed.status` | 3 | 5 |
| `state.feed.wsCursor` | 2 | 3 |
| `state.feed.seen` | 2 | 2 |
| `state.feed.manualUrl` | 2 | 2 |
| `state.feed.events` (+ `.forEach/.splice/.unshift/.length`) | 5 | 3 |
| `state.feed.cursor` | 1 | 3 |
| `state.feed.wsRetry` | 1 | 5 |
| `state.code` | 7 | — |
| `state.pseudo` | 3 | — |
| `state.character` / `.name` | 2 | — |
| `state.profile` / `.characterId` | 2 | — |
| `state.streamView` | 1 | — |

**47 écritures dans `state.feed.*`**, réparties sur **13 des 23 fonctions** :

```
 12  startFeed        5  connectTableWs     2  broadcastEntry
  9  stopFeed         5  checkRendezvous    2  pollFeed
  4  feedMerge        3  scheduleTableRetry 2  disconnectTableWs
  1  setFeedStatus    1  setTableState      1  rendezvousTick
```

Les cinq champs hors `state.feed` (`code`, `pseudo`, `character`, `profile`,
`streamView`) sont **en lecture seule** — ceux-là seraient effectivement des
accesseurs propres.

### 2.2 Appels vers le reste du dock

| Symbole | Rôle | Défini l. |
|---|---|---|
| `renderFeedZone` | redessine la zone flux | 4084 |
| `rollTransactionActive` | garde : ne pas diffuser pendant un jet en cours | 1331 |
| `rollExport` | sérialise un jet au format `fh-roll/1` | 2958 |
| `entryBonusDice` | compte les dés bonus (dans `feedSignature`) | 1029 |
| `api` | GET Worker | 316 |
| `post` | POST Worker | 319 |
| `uuid` | déjà sorti dans `FH.utils` — pas une entrée de contrat | — |

`rollExport` tire derrière lui `rollParts`, `rollBadges`, `rollRuling`,
`rollExportDice` (l. 2792-2957) : une entrée de contrat, mais qui montre que le
bloc s'appuie sur toute la couche de sérialisation des jets.

---

## 3. Ce que le **reste du dock** touche dans le bloc

C'est la moitié qu'on oublie, et c'est elle qui décide.

### 3.1 Fonctions du bloc appelées depuis le dock (10)

`feedActive` (5×), `broadcastEntry` (2×), `refreshFeed` (3×), `setTableState`,
`manualTableKey` (2×), `disconnectTableWs`, `checkRendezvous`, `startFeed`,
`stopFeed`, `feedTone` (2×). Celles-là se traitent par bloc d'alias, comme au
lot 1 — ce n'est pas le problème.

### 3.2 Le dock **lit** `state.feed` en 10 endroits hors du bloc

- l. 359 `profileWrite` : `state.feed.tableState`, `state.feed.tableUrl`
- l. 3329 `trayLines`, l. 3999 `expandedTrayLines`, l. 4073 `streamZoneInner` : `state.feed.events`
- l. 3853 `feedChipHtml`, l. 4050 `streamZoneInner`, l. 4493 (barre d'outils) : `state.feed.tableState`, `state.feed.status`
- l. 4059, 4495, 4865 : `state.feed.manualUrl`

### 3.3 Le dock **écrit** dans `state.feed` hors du bloc

Gestionnaire du bouton « Table URL » (l. 4863-4878) :

```js
state.feed.manualUrl=next;
disconnectTableWs();state.feed.tableUrl="";state.feed.wsRetry=0;
setTableState("recent");checkRendezvous();
```

Trois écritures directes dans ce qui serait l'état privé du module.

### 3.4 Un cycle réel entre la couche réseau et le flux

`profileWrite` (l. 359) route les écritures de fiche vers le serveur de table
quand il est vivant :

```js
var base = state.feed.tableState === "live" ? state.feed.tableUrl : API;
```

Donc : **la couche réseau du dock dépend de l'état du flux**, et **le flux
dépend de la couche réseau du dock** (`api`, `post`). Ce n'est pas une
dépendance orientée qu'on peut couper ; c'est un cycle.

### 3.5 `state.feed` est remplacé en entier par les tests

`tests/campaign-feed.test.js`, dans `reset()`, fait
`Object.assign(t.state,{… feed:{events:[],seen:{},…}})` — il **substitue**
l'objet. En production `state.feed` n'est jamais réaffecté (une seule
déclaration, l. 139), mais le banc de test si. Conséquence : le contrat ne
pourrait pas capturer `state.feed` par référence à l'initialisation ; il
faudrait un accesseur `feed()` réévalué à chaque appel — donc réécrire les
**107** références `state.…` du bloc en `ctx.feed().…`. Ce n'est plus un
déménagement.

---

## 4. Le contrat qu'il faudrait, et pourquoi il ne tient pas

Surface minimale honnête, 12 entrées :

```
feed()            → state.feed (objet vivant, mutable, 13 champs, 47 écritures)
code()            → state.code
pseudo()          → state.pseudo
character()       → state.character
profile()         → state.profile
streamView()      → state.streamView
renderFeedZone    (rappel de rendu)
rollTransactionActive (garde)
rollExport        (sérialisation)
entryBonusDice    (signature)
api / post        (réseau Worker)
```

12 entrées, ce n'est pas « une vingtaine ». Mais le compte est trompeur : la
première entrée à elle seule **est** l'accès direct à `state` en écriture. Elle
n'expose pas une valeur, elle passe une poignée sur un sous-arbre mutable de
`state` que les deux côtés écrivent. Le contrat aurait l'air étroit sur une
ligne et laisserait passer tout le couplage sous cette ligne.

Comparaison avec `panelContext()` — la référence citée dans la mission :

| | `panelContext()` | contrat du flux |
|---|---|---|
| état transmis | **instantanés en lecture** (`character`, `destiny`, `profile`) | **sous-arbre mutable partagé** |
| écritures du module dans `state` | aucune — passent par `store()` / `save()` | 47, en direct |
| écritures du dock dans l'état du module | aucune | 3 (l. 4873-4874) |
| sens de la dépendance | dock → panneau | **cycle** (§3.4) |

`panelContext()` marche parce qu'un panneau ne possède rien : il reçoit une
photo et rend des rappels. Le flux de table, lui, possède une machine à états
(`recent` / `live` / `off`, curseurs, socket, minuteries de reconnexion) que le
dock lit **et** écrit.

---

## 5. Verdict du GATE

**Arrêt.** Le second critère d'arrêt de la mission est atteint mot pour mot :
« ou d'un accès direct à `state` en écriture un peu partout ». 47 écritures,
13 fonctions sur 23, plus 3 écritures en sens inverse depuis le dock, plus un
cycle avec la couche réseau.

Faire la coupe donnerait : un fichier de 270 lignes, un contrat de 12 entrées
dont une qui annule les onze autres, 107 références réécrites, un diff
illisible, un cycle `fh-table-feed ↔ dock` — et exactement le même
enchevêtrement qu'avant, plus une indirection. C'est la définition de la coupe
cosmétique que la mission demande de refuser.

---

## 6. Ce qui rendrait la coupe possible plus tard

Noté sans être fait — c'est une décision d'Eric.

1. **Retirer les écritures du dock dans `state.feed`** (l. 4863-4878) : le
   gestionnaire du bouton « Table URL » appellerait une seule fonction du bloc
   (`setManualTableUrl(next)`) au lieu d'écrire trois champs à la main. Petit,
   sans risque, et ça rend le sous-arbre réellement possédé par un seul côté.
2. **Couper le cycle de `profileWrite`** (l. 359) : le choix de la base
   d'écriture devrait venir du flux (`tableBase()`), pas d'une lecture directe
   de son état interne par la couche réseau.
3. Une fois (1) et (2) faits, `state.feed` devient un sous-arbre à propriétaire
   unique et le contrat retombe à ~10 entrées **sans poignée mutable
   partagée** — la coupe redevient honnête.

## 7. Un lot vraiment pur existe dans ce bloc

Si l'envie est d'avancer sans toucher au couplage : **7 fonctions du bloc sont
pures** (aucune référence à `state`, aucun appel au dock) et pourraient rejoindre
un module au patron du lot 1 :

`feedPad`, `intentOutcome`, `intentFor`, `feedTone`, `tableWsUrl`,
`manualTableKey`, `feedRewind` (+ la constante `FEED_LOOKBACK`).

`feedSignature` est à un cheveu : sa seule impureté est l'appel à
`entryBonusDice`.

Ce lot n'a **pas** été fait : ce n'était pas la mission, et découper une part
pure du serveur de table sans décision d'Eric sur le reste laisserait le flux
réparti sur deux fichiers pour un gain nul.

---

## 8. Vérifications faites

- `npm test` sur `table-feed` avant toute modification : **19/19**. Aucun
  fichier JS n'a été modifié, donc rien à revérifier après — le seul ajout de
  cette branche est ce document.
- Inventaire des accès à `state` : scanné par script sur la plage exacte, après
  retrait des commentaires et des chaînes.
- Usages hors bloc : recherche de chacun des 27 symboles définis dans la plage
  sur tout le reste du dock.
- Aucun autre fichier de `docs/javascripts/` ne touche `state.feed`, ni aucune
  fonction du bloc (vérifié par recherche).
