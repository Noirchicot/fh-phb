#!/bin/sh
# FH mirror — rafraîchissement en une commande.
#   tools/mirror.sh          build + copie harnais + serveur miroir sur :8130
#   tools/mirror.sh reset    idem, mais réinitialise d'abord les données de test
# Voir MIRROR.md à la racine pour la recette complète.
set -e
cd "$(dirname "$0")/.."

MKDOCS="${FH_MKDOCS:-/Users/Eric/tools/fh-phb/.venv/bin/mkdocs}"
PORT="${FH_MIRROR_PORT:-8130}"

# Un seul miroir à la fois : si un mirror-server ÉCOUTE déjà sur le port, on
# le remplace. -sTCP:LISTEN est essentiel : sans lui, lsof liste aussi les
# connexions CLIENTES (un navigateur ouvert sur le miroir) et le script
# refuserait de démarrer à cause de sa propre audience. Tout autre processus
# qui écoute sur ce port est signalé, jamais tué.
PIDS=$(lsof -ti "tcp:${PORT}" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  for pid in $PIDS; do
    if ps -p "$pid" -o command= | grep -q "mirror-server.mjs"; then
      kill "$pid" && echo "✓ ancien mirror-server (pid $pid) arrêté"
    else
      echo "✗ le port ${PORT} est occupé par un autre processus (pid $pid) :"
      ps -p "$pid" -o command=
      echo "  Libérer le port ou choisir FH_MIRROR_PORT=… puis relancer."
      exit 1
    fi
  done
  sleep 1
fi

# Le wipe vient APRÈS l'arrêt de l'ancien serveur : sinon son flush débounced
# ré-écrit kv.json avec les données qu'on vient de supprimer.
if [ "$1" = "reset" ]; then
  rm -f tools/mirror-data/kv.json
  echo "✓ données de test réinitialisées (tools/mirror-data/kv.json supprimé)"
fi

echo "— build mkdocs…"
"$MKDOCS" build --quiet
cp tools/dock-harness.html site/dock-harness.html
echo "✓ site construit, harnais copié"

exec node tools/mirror-server.mjs
