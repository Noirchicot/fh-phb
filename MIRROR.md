# MIRROR — site miroir de test (branche `mirror-lot`)

Un double complet du site PHB + Companion où Eric peut **jouer sans risquer les
données réelles** : campagne de test `FHTEST`, stockage 100 % local, **aucune
requête ne part vers le Worker de prod** (`fh-builds`) ni vers aucun cloud.

## Démarrer / rafraîchir (une commande)

```bash
cd ~/tools/fh-phb
tools/mirror.sh
```

> (Fusionné sur `main` le 2026-08-06 — l'ancien chemin
> `.claude/worktrees/mirror-lot` n'existe plus ; tout se lance depuis le
> dépôt principal.)

Ce que fait la commande : build mkdocs → copie `tools/dock-harness.html` dans
`site/` → démarre `tools/mirror-server.mjs` sur le **port 8130** (le banc du
MOE reste sur 8127). Relancer la même commande rafraîchit tout (elle remplace
proprement un mirror-server déjà en route ; elle refuse de toucher tout autre
processus qui occuperait le port).

- **Mac** : http://localhost:8130/ (Companion : http://localhost:8130/player/)
- **iPad** : `http://<IP-du-Mac>:8130/` — l'IP LAN est affichée au démarrage
  (ex. `http://192.168.1.94:8130/`). Même Wi-Fi, rien à déployer. Ça marche
  parce que la page miroir est servie en `http` même-origine : pas de blocage
  mixed-content, contrairement à une page `https` qui parlerait à du `http`.

## Réinitialiser les données de test

```bash
tools/mirror.sh reset
```

Supprime `tools/mirror-data/kv.json` (gitignoré) puis redémarre. Au premier
démarrage sur données vierges, un personnage **`Test`** (Wizard 5) est semé
dans `FHTEST` via le vrai `POST /builds` — le dock a donc toujours quelque
chose à montrer. Pseudo à utiliser côté dock : `Test` (ou en créer un via le
Skill Builder miroir, pipeline complet).

- **Campagne de test** : `FHTEST` (préremplie dans le localStorage du miroir)
- **GM token de test** : `FHTEST-GM` (pour `gm.html` et les routes `/admin/*`)

## Comment l'isolation fonctionne (choix documenté)

Deux options étaient sur la table ; c'est **le stub étendu** qui a gagné, mais
un stub d'une fidélité inhabituelle : **le vrai code du Worker de prod tourne
en local**.

1. `tools/mirror-server.mjs` (Node ≥ 18, zéro dépendance npm) sert `site/` en
   statique et route `/api/*` vers `~/tools/fh-worker/src/worker.js` —
   **importé tel quel** et exécuté avec un KV émulé persisté dans
   `tools/mirror-data/kv.json`. Toute la validation de prod (révisions, 409,
   403 sur code inconnu, auth GM fail-closed, Soulforge, migration des
   campagnes) tourne à l'identique, mais sur des fichiers locaux.
2. `tools/mirror-shim.js` est injecté à la volée dans chaque page HTML servie
   (jamais committé dans une page). Il réécrit tout `fetch` visant
   `https://fh-builds.noirchicot.workers.dev` vers `/api/...` local, bloque
   net tout autre `workers.dev`, pose le ruban rouge **MIROIR DE TEST ·
   FHTEST**, et préremplit le code campagne. Le localStorage de l'origine
   `:8130` est de toute façon disjoint de celui du site de prod.

Pourquoi pas `node table-server.mjs` (plan §12a) ? Parce qu'il ne couvre que
le feed de jets : au démarrage il *pull* les personnages depuis le Worker de
prod (et refuse de démarrer sinon), et il *mirror* ses écritures vers ce même
Worker — exactement ce que le miroir doit interdire. Son mode `--no-mirror`
existe mais ne sert ni `/builds`, ni `/profile`, ni `/inv`, ni `gm.html`.
Faire tourner le **vrai worker.js** couvre 100 % de l'API avec zéro cloud, et
reste automatiquement à jour quand `fh-worker` évolue.

## Vérifié (2026-08-04)

- `/`, `/player/`, `gm.html`, `dock-harness.html` : 200, shim injecté.
- Dock chargé dans un navigateur : zéro erreur console, premier appel
  `GET /api/party/FHTEST → 200`, **zéro requête vers `workers.dev`**.
- Cycle de jet complet : `POST /api/feed/FHTEST` → seq attribué par le code du
  Worker → relecture OK. Profil par défaut OK.
- Isolation : `GET /api/party/FH1` → **403 unknown campaign** (seule `FHTEST`
  existe ici). Admin sans token → 401 ; avec `FHTEST-GM` → 200.

## Limites connues

- **Pas de mode LIVE** : `/table/FHTEST` répond `live:false`, le dock est en
  RECENT (bouton Refresh dans la zone TABLE). Extension possible plus tard :
  `table-server.mjs --no-mirror` local + rendez-vous `ws://<IP>:<port>` posté
  sur `/api/table/FHTEST`.
- **« Sync DDB »** dans le miroir ferait un vrai GET sortant vers D&D Beyond
  (lecture seule, aucun écrit prod) — non testé, sans danger pour les données.
- Le port **8130** est aussi celui du harnais `pkg8-notes`
  (`~/tools/fh-worktrees/notes`) : conflit uniquement si ce banc-là tourne en
  même temps ; `mirror.sh` s'arrête alors avec un message au lieu de tuer le
  processus. Contournement : `FH_MIRROR_PORT=8138 tools/mirror.sh`.
- `dock-harness.html` garde son propre stub en mémoire (il redéfinit `fetch`
  après le shim) : il reste le banc hors-ligne du MOE, inchangé.
- Chemins surchargables : `FH_WORKER_SRC` (worker.js), `FH_MKDOCS` (binaire
  mkdocs), `FH_MIRROR_PORT`.
