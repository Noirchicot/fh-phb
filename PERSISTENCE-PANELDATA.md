# `panelData` / `poolResources` — pourquoi le correctif s'arrête ici

**Statut : ARRÊTÉ AU GATE. Aucun changement de comportement commité.**
Branche `fix-panel-persistence`. Décision à prendre par Eric.

Constat de départ (exact) : `persistPlayState()` écrit `panelData` et
`poolResources` en `localStorage` (`fh-player-sheet.js:785-786`) mais ne les
envoie **pas** au profil (`fh-player-sheet.js:789`). Tout ce qu'un joueur saisit
à la main dans les six panneaux, et ses ressources comptées, sont liés à
l'appareil. `COMPANION-BUILD-PLAN.md:124` promet l'inverse.

Le défaut est réel. Le correctif « évident » — ajouter les deux clés à l'appel
`saveProfile()` — est **pire que le défaut** : il ne sauvegarde rien et supprime
l'avertissement qui prévient aujourd'hui le joueur. Détail ci-dessous.

---

## Les cinq points du GATE

### 1. Précédence au chargement — le profil gagne, et `{}` est truthy

`loadPlayState()` applique partout le même motif profil-d'abord :

- `fh-player-sheet.js:757` — `normalizeVitals(profile.vitalsState || local.vitals)`
- `fh-player-sheet.js:759` — `normalizeDestiny(profile.destinyState || local.destiny, ch)`
- `fh-player-sheet.js:760-761` — `Array.isArray(profile.rollHistory) ? … : local.history`
- `fh-player-sheet.js:764` — `profile.pendingRoll || local.pendingRoll || {}`

`panelData` est aujourd'hui local-seul (`fh-player-sheet.js:777`), `poolResources`
aussi (`fh-player-sheet.js:770`, avec le commentaire explicite « Local-only, like
traySelection and prefs »).

**Le piège :** si on aligne `panelData` sur le motif maison, on écrit
`profile.panelData || local.panelData`. Or `panelData` est un **objet**, et `{}`
est truthy (vérifié). Scénario, sans aucune erreur affichée :

1. Appareil A : panneaux richement remplis, en `localStorage` seulement.
2. Appareil B, `localStorage` vierge → `state.panelData = {}`.
3. La première action sur B déclenche `persistPlayState()` → pousse `{}` au profil.
4. Appareil A recharge → `profile.panelData` vaut `{}`, truthy → **gagne**.
   Le contenu local de A n'est jamais lu. Destruction silencieuse.

Le `||` est donc interdit ici. C'est le point qui transforme une perte de tweaks
en destruction de personnage.

### 2. Garde de révision — hérité gratuitement, mais le chemin de conflit détruit

**Bonne nouvelle.** Ajouter des clés à l'appel `saveProfile()` existant
n'introduit **aucun nouveau chemin d'écriture** : c'est le même
`profileWrite("")` (`fh-player-sheet.js:795-800`, `359-374`), qui joint
`revision: state.profileRevision` (`fh-player-sheet.js:360`), et le Worker
compare puis renvoie 409 (`worker.js:1181-1183`). Deux docks ouverts → le second
prend un 409, `showProfileConflict()` (`fh-player-sheet.js:342`), jamais de
retry automatique. Le garde est acquis.

**Mauvaise nouvelle.** La résolution du conflit adopte le document serveur en
bloc puis rappelle `loadPlayState()` (`fh-player-sheet.js:350-352`). Avec une
règle profil-d'abord, « Recharger » écraserait le `panelData` local par celui du
serveur — alors que le message dit au joueur de « réappliquer ses changements »,
ce qu'il ne peut plus faire si le texte a disparu de l'écran. La règle de fusion
doit tenir **aussi** sur ce chemin, pas seulement au chargement initial.

**Piège annexe, le plus trompeur.** `saveProfile()` fait
`state.profile = Object.assign({}, state.profile, data.profile, patch)`
(`fh-player-sheet.js:796-797`) : le patch est réappliqué **localement** en
dernier, même si le serveur l'a jeté. `state.profile.panelData` semblerait donc
peuplé toute la session — jusqu'au premier vrai rechargement, où il redevient
vide. « Ça marchait hier. »

### 3. Taille — plafond à 8 Ko, et le dépassement blanchit tout, en silence

Le Worker borne chaque champ opaque via `safeOpaque` (`worker.js:833-845`).
Le défaut est `maxBytes: 8_000`, et le comportement en cas de dépassement est
`return null` — **pas** une troncature, **pas** une erreur.

Vérifié en exécutant la fonction réelle extraite de `worker.js` :

| Entrée | Sortie de `safeOpaque(v, {maxBytes: 8000})` |
|---|---|
| `{notes:{text:"x".repeat(9000)}}` | `null` |
| `{notes:{text:"hi"}}` | inchangé |

`panelData` agrège les six panneaux (`traits`, `actions`, `spells`, `gear`,
`craft`, `notes`). Le panneau Notes est un `<textarea>` **sans aucun plafond** :
`fh-panel-notes.js:50-51` fait `store.text = input.value` brut, il n'y a ni
`maxlength` ni `slice()` dans le fichier. Un joueur qui colle un résumé de
séance dépasse 8 Ko sans effort — et le dépassement ne perd pas le surplus, il
met **tout `panelData` à `null`** : les six panneaux d'un coup, sans un mot.

C'est exactement le mode de défaillance qu'on essaie de corriger, reproduit un
étage plus haut. Relever `maxBytes` ne suffit pas : il faut que le dépassement
devienne **bruyant**.

### 4. Cycle de vie du pool — `poolResources` n'est pas synchronisable seul

`prunePoolResources()` (`worker` non concerné ; `fh-player-sheet.js:2865-2867`)
est appelé au début de `persistPlayState()` (`fh-player-sheet.js:782`), donc la
liste envoyée serait déjà élaguée. La règle d'élagage garde une ressource à zéro
**tant qu'un dé la référence encore**, via `poolResourceReferenced()`
(`fh-player-sheet.js:2855-2861`), qui interroge `stagedList()`,
`state.traySelection` et `state.rollConfig`.

Or ces trois référents sont **délibérément locaux** :

- `state.traySelection` — chargé depuis `local` seul (`fh-player-sheet.js:762`).
- `state.rollConfig` — « derived, never stored » (`fh-player-sheet.js:772-774`).

Conséquence si on pousse `poolResources` au profil : une ressource à `count: 0`
maintenue en vie sur l'appareil A par un dé posé dans sa main arrive sur
l'appareil B **sans son référent**. Le premier `persistPlayState()` de B
l'élague définitivement et pousse cette suppression au cloud. Quand A annule son
dé, `recreditPoolDie()` (`fh-player-sheet.js:2846`) re-crédite une ressource qui
n'existe plus — le re-crédit est perdu.

`poolResources` ne peut donc pas être synchronisé sans synchroniser aussi la
main (`traySelection` + étagé), ce que l'architecture refuse volontairement.
**Les deux clés ne sont pas le même problème et ne doivent pas voyager dans le
même lot.**

### 5. Le Worker a une liste blanche — et elle est triple

C'est le point bloquant. Le Worker n'est pas dans ce dépôt : il vit dans
`noirchicot/fh-worker`, `src/worker.js` (déployé à la main par Eric,
`ARCHITECT-HANDOFF.md:186` et `:818`). Dépôt cloné et lu au commit `84e134b`.

Trois filtres indépendants, chacun suffisant à annuler un correctif côté dock :

1. **À l'écriture** — `worker.js:1162-1178` : `patch` est une carte de clés
   fermée (`preparation`, `levelUps`, `destinyState`, `vitalsState`,
   `rollHistory`, `rollEvents`, `rollPrefs`, `manualOverrides`, `pendingRoll`).
   `worker.js:1179` : `applied = Object.keys(patch).filter(key => hasOwn(body, key))`.
   `panelData` et `poolResources` n'y sont pas → jamais appliqués.
2. **À la lecture du KV** — `safeStoredProfile()` (`worker.js:864-882`)
   reconstruit l'objet champ par champ. Tout champ inconnu est éliminé même s'il
   avait été stocké.
3. **À la réponse** — `publicCharacterProfile()` (`worker.js:883-899`)
   reconstruit encore champ par champ. Même stocké, un champ inconnu ne
   reviendrait jamais au dock.

**Et l'échec est silencieux.** `worker.js:1180` ne renvoie 400 (« nothing to
update ») que si *aucune* clé connue n'est présente. Notre payload contient
toujours `destinyState`, `vitalsState`, etc. → le Worker répond **200 OK**,
incrémente la révision, et jette `panelData` sans un mot.

Le correctif côté dock seul ne serait donc pas « insuffisant » : ce serait un
**no-op déguisé en correctif**. Aujourd'hui, au moins, si la synchro tombe le
joueur voit « Saved on this device; server sync is unavailable. »
(`fh-player-sheet.js:791`). Après un tel correctif, le dock afficherait un
succès franc pour une donnée qui n'a jamais quitté la machine.

---

## Verdict

**Arrêt.** Quatre des cinq points sont bloquants (1, 3, 4, 5) ; seul le point 2
est bénin. C'est un **lot à deux dépôts**, avec un ordre de déploiement
obligatoire, et une question de produit sur `poolResources`. Rien de tout cela
n'est une décision de correctif — ce sont des décisions d'Eric.

## Option recommandée

**Découpler les deux clés.** Ce sont deux problèmes différents.

### A. `panelData` — synchronisable, en trois temps, dans cet ordre

1. **`fh-worker` d'abord, déployé avant tout changement du dock.** Ajouter
   `panelData` aux trois endroits (`patch`, `safeStoredProfile`,
   `publicCharacterProfile`) avec un budget explicite, de l'ordre de
   `maxBytes: 40_000` (le précédent existe : `rollHistory`, `worker.js:1168`).
   **Et changer le comportement de dépassement** pour ce champ : renvoyer un
   **413 explicite** plutôt que `null`. Sans ça on déplace la perte
   silencieuse au lieu de la corriger. Tant que ce déploiement n'est pas fait
   et vérifié en prod, le dock ne doit rien changer.
2. **Borner à la source.** Plafonner le `<textarea>` des Notes
   (`fh-panel-notes.js:50-51`) pour que le payload soit borné par construction
   et non par un rejet serveur. Un joueur doit voir sa limite pendant qu'il
   tape, pas après.
3. **`fh-phb` ensuite**, avec la règle de fusion ci-dessous.

**Règle de fusion retenue (à ratifier) : fusion par clé de panneau, le plein ne
perd jamais contre le vide.** Pour chacun des six identifiants de panneau,
prendre la valeur du profil **seulement si** elle existe et est non vide ;
sinon retomber sur la valeur locale. Jamais de `||` sur l'objet entier, jamais
de remplacement en bloc.

Pourquoi celle-ci plutôt qu'un simple « le plus récent gagne » : il n'existe
aujourd'hui **aucun horodatage par panneau** sur lequel arbitrer — seul
`notes.savedAt` en a un (`fh-panel-notes.js:52`), les cinq autres n'en ont
aucun. Sans horloge fiable et partagée, la seule règle qui ne détruit rien est
« le vide ne bat jamais le plein ». Elle est conservatrice : dans le cas
ambigu — les deux côtés pleins et divergents — elle garde le profil, ce qui est
cohérent avec le reste de `loadPlayState()` et laisse le garde de révision
(point 2) faire son travail. Elle n'est pas parfaite ; elle est **non
destructive**, ce qui est le seul critère qui compte ici.

Aucune migration : les données locales existantes remontent au profil à la
première écriture, et ne sont jamais préférées au vide dans l'autre sens.

### B. `poolResources` — ne pas synchroniser en l'état

Le point 4 n'est pas un détail d'implémentation, c'est une incohérence de
modèle : la ressource est au cloud, sa consommation reste locale. Deux issues
possibles, toutes deux des décisions de conception :

- **Laisser local** et corriger la promesse de `COMPANION-BUILD-PLAN.md:124`,
  qui aujourd'hui dit cloud pour une chose qui est locale par dessein.
- **Synchroniser la main entière** (`poolResources` + `traySelection` + étagé)
  comme un seul document cohérent — travail nettement plus lourd, qui touche à
  la reprise de jet en cours.

Recommandation : **laisser local pour l'instant**, corriger la doc, et traiter
`panelData` seul. C'est là qu'est la perte que les joueurs subissent vraiment.

---

## Ce qui a été vérifié, et comment

- `npm test` sur `origin/main` avant toute lecture : **19/19**. Aucun fichier de
  comportement n'a été modifié, donc rien à revérifier après.
- `safeOpaque` **exécutée** sur le code réel extrait de `fh-worker@84e134b`
  (tableau du point 3), plutôt que déduite de sa lecture.
- Liste blanche du Worker lue dans la source déployée, pas dans
  `WORKER-ADMIN-API.md` — qui est un **spec, pas le code**
  (`ARCHITECT-HANDOFF.md:186`). À noter : ce spec, en `WORKER-ADMIN-API.md:191-192`,
  énumère les champs FH à préserver et ne mentionne ni `panelData` ni
  `poolResources` — il faudra le mettre à jour en même temps que le Worker.

## Ce qui n'a pas été fait

- **Aucun test ajouté.** Un test doit échouer sans le correctif et passer avec ;
  il n'y a pas de correctif, et le comportement cible n'est pas encore arbitré
  (budget de taille, 413 vs troncature, sort de `poolResources`). Écrire le test
  maintenant reviendrait à figer une réponse qu'Eric n'a pas donnée. Le point
  d'accroche est prêt : `tests/profile-conflict.test.js` monte déjà le dock
  complet avec un `fetch` scripté et journalise chaque corps de requête
  (`fetchLog`), ce qui permet d'assérer directement que `panelData` part — ou
  non — dans le POST `/profile`.
- **Aucune modification de `fh-worker`.** Hors périmètre de cette tâche
  (`fh-phb`), et son déploiement est manuel.
- **Non vérifié en prod** : la taille réelle des `panelData` existants chez les
  joueurs. On ne peut pas la lire depuis ce dépôt — elle n'est qu'en
  `localStorage`. Si certains dépassent déjà 8 Ko, l'ordre de déploiement du
  point A.1 n'est pas une précaution, c'est une condition.
