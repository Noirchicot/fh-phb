# Starter prompt — Package 6 · Actions V1

> **Status:** READY / QUEUED, captured 2026-08-01 from Eric's SOL prompt.
> Keep this prompt for the future Actions work thread; do not treat it as the
> current task. Before launching it, the architect must refresh the branch and
> worktree names against `ARCHITECT-HANDOFF.md`, then verify the delivered commit,
> rerun every test in an independent checkout, and review the browser result.

Tu travailles sur Fate’s Hand Player Companion (FHPC).

OBJECTIF

Construire une première version réellement utilisable du panneau « Actions » de FHPC.

Cette V1 doit permettre de jouer à table et d’observer ce qui fonctionne avant d’automatiser davantage les interactions SRD, PHB et Fate’s Hand.

────────────────────────────────────────
1. LOCALISATION ET ISOLATION
────────────────────────────────────────

Dépôt principal :
~/tools/fh-phb/

Commence par vérifier les worktrees et l’état du dépôt :

git -C ~/tools/fh-phb status --short
git -C ~/tools/fh-phb worktree list
git -C ~/tools/fh-phb fetch origin

Ne travaille PAS dans un worktree contenant des changements Tarot ou d’autres modifications non liées.

Si un worktree Actions propre existe déjà, utilise-le.

Sinon, crée :

git -C ~/tools/fh-phb worktree add \
  -b codex/fhpc-actions-v1 \
  ~/tools/fh-worktrees/actions-v1 \
  origin/main

Puis travaille dans :

~/tools/fh-worktrees/actions-v1/

Ne pousse et ne déploie rien. Fais uniquement un commit local final.

────────────────────────────────────────
2. FICHIERS
────────────────────────────────────────

Fichier principal à construire :

docs/javascripts/fh-panel-actions.js

CSS à ajouter exclusivement à la fin de :

docs/stylesheets/companion-dock.css

Tests à créer :

tests/actions-panel.test.js

Documentation à compléter seulement si le contrat actuel bloque une fonction :

COMPANION-BUILD-PLAN.md

Banc d’essai :

tools/dock-harness.html

Contrat des panneaux :

COMPANION-BUILD-PLAN.md, section « The contract »

Implémentation du contrat dans le cœur, à consulter seulement si nécessaire :

docs/javascripts/fh-player-sheet.js
Fonctions panelContext(), delegateToPanel(), renderPanelBody().

INTERDIT sauf nécessité démontrée et expliquée :

- modifier fh-player-sheet.js ;
- modifier les autres panneaux ;
- modifier mkdocs.yml ;
- committer site/ ;
- toucher au vault ;
- toucher aux changements Tarot ;
- déployer GitHub Pages.

Attention : certaines anciennes consignes mentionnent
docs/javascripts/fh-panel-features.js.
Ce fichier n’existe plus sur le main actuel. Le panneau correspondant s’appelle
fh-panel-traits.js. Le vrai contrat est dans COMPANION-BUILD-PLAN.md et dans
panelContext().

────────────────────────────────────────
3. CONTRAT DISPONIBLE
────────────────────────────────────────

Le panneau reçoit notamment :

ctx.character
ctx.destiny
ctx.profile
ctx.roll(name, ability, bonus, note)
ctx.openConsole(name, ability, bonus, note, dc)
ctx.note(text, kind)
ctx.store(id)
ctx.save()
ctx.refresh()
ctx.esc()
ctx.signed()
ctx.mod()

Le panneau Actions doit conserver :

id: "actions"
label: "Actions"
tint: "#9f2f31"
order: 30
showsRoller: true

Ne construis pas un second roller. Le cœur affiche déjà Destinée, Console, ROLL et Tray sous Actions.

────────────────────────────────────────
4. PRINCIPE DE CONCEPTION
────────────────────────────────────────

Architecture des règles :

1. SRD 5.2.1 pur
2. extension PHB optionnelle, plus tard
3. filtre Fate’s Hand appliqué au-dessus

Ne mélange pas ces couches.

Cette V1 doit être « manual first » parce que le personnage du harness ne contient actuellement que :

- classe, niveau et espèce ;
- caractéristiques ;
- compétences ;
- Destinée.

Il ne contient pas une liste complète fiable d’armes, d’actions, de sorts ou de features.

Inspecte réellement ctx.character avant de coder. Si aucune source d’actions structurée n’existe, ne l’invente pas.

Le panneau doit néanmoins être utilisable avec des actions créées ou configurées localement dans ctx.store("actions").

────────────────────────────────────────
5. INTERFACE ATTENDUE
────────────────────────────────────────

Créer un tableau en trois zones :

- ACTION
- BONUS ACTION
- REACTION

Sur un dock suffisamment large : trois colonnes.

Sur un dock étroit : défilement horizontal avec snap, titres toujours clairement visibles. Aucun contenu ne doit être coupé à 360 px.

Ajouter en tête un suivi du tour :

ATK 1 / ATK 2 / ATK 3 | BA | R | NEW TURN

Règles :

- le nombre d’attaques disponibles doit être configurable ;
- 1 attaque par défaut ;
- BA et R peuvent être disponibles ou consommées ;
- NEW TURN restaure les attaques, la Bonus Action et la Reaction ;
- ne pas appeler les attaques A1/A2/A3 : « A » signifie déjà Advantage dans la console ;
- une Bonus Action ordinaire peut être utilisée avant l’Action ;
- l’attaque Light accordée par Light doit venir après l’attaque déclencheuse.

Chaque carte doit pouvoir être :

- lancée dans la console partagée ;
- marquée comme utilisée ;
- éditée ;
- supprimée si elle est personnalisée.

Prévoir une interface compacte pour ajouter une action personnalisée avec :

- nom ;
- économie : Action / Bonus Action / Reaction ;
- catégorie : Attack / Check / Damage / Utility ;
- caractéristique ;
- bonus ;
- DC facultative ;
- note ;
- source : SRD / PHB / FH / Manual ;
- configuration avancée ou jet immédiat.

Les actions qui ne demandent pas de jet ne doivent pas lancer un faux d20. Elles consomment leur économie et écrivent une ligne claire avec ctx.note().

Inclure comme références SRD générales, sans recopier de texte protégé :

Action :
Attack, Dash, Disengage, Dodge, Help, Hide, Influence, Magic, Ready, Search, Study, Utilize.

Reaction :
Opportunity Attack, Readied Action.

La Bonus Action dépend principalement des features, sorts et armes du personnage : ne pas en inventer une liste universelle.

────────────────────────────────────────
6. DÉCISIONS DE RÈGLES DÉJÀ PRISES
────────────────────────────────────────

Prépare le modèle et l’UI pour ces comportements, sans prétendre automatiser ce que le contrat ne permet pas d’observer.

EFFETS PERSISTANTS

Ils appartiennent aux badges globaux :

- Rage ;
- Exhaustion ;
- Concentration ;
- Hunter’s Mark tant que la concentration dure.

Le panneau Actions ne doit pas créer son propre second système de badges.

MODIFICATEURS D’UNE ATTAQUE

Ils appartiennent à la console d’attaque :

- Sneak Attack ;
- Smite ;
- dégâts de Hunter’s Mark ;
- autres riders appliqués seulement à une attaque.

FHPC ne connaît pas la cible. Les conditions liées à « cette cible » doivent donc rester confirmées manuellement.

HUNTER’S MARK

Lancer Hunter’s Mark doit :

- ouvrir un badge de concentration dans le futur système commun ;
- rendre disponible dans la console d’attaque une option de dégâts Hunter’s Mark.

Pour cette V1, si les APIs de badge et de console ne sont pas disponibles, documenter précisément les hooks manquants. Ne pas simuler un badge avec une simple ligne du journal.

SNEAK ATTACK

Option permanente de la console pour les Rogues éligibles.

Elle est liée à une attaque, pas à un badge global.

SMITE

Option d’attaque disponible si le personnage connaît le sort et possède un slot utilisable.

Le lancement consomme normalement une Bonus Action selon le sort concerné. Ne pas le transformer en effet global appliqué automatiquement à toutes les armes.

VEX

Aucun badge.

Après une attaque réussie avec une arme Vex :

- le bouton Advantage de la console doit clignoter ;
- un clic confirme l’avantage pour l’attaque suivante ;
- double clic ou clic droit annule ;
- l’attaque suivante consomme l’état ;
- FHPC ne pouvant pas identifier la cible, la condition « même cible » reste sous responsabilité du joueur.

Si le panneau ne peut pas recevoir le résultat d’un jet, exposer seulement l’état manuel et documenter le hook de résultat nécessaire.

NICK

Après une attaque avec une arme Light, Nick peut devenir disponible.

- il ne peut être consommé qu’une fois par tour ;
- il permet l’attaque Light dans l’Action au lieu de la Bonus Action ;
- il ne crée pas une attaque supplémentaire au-delà de celle accordée par Light ;
- reset à NEW TURN.

TWO-WEAPON FIGHTING

Si le personnage possède ce Fighting Style, l’attaque Light ajoute normalement le modificateur de caractéristique positif aux dégâts.

Sans ce style, le bonus positif n’est pas ajouté.

GREAT WEAPON FIGHTING

Ce n’est pas un badge global.

La règle appartient au profil de l’arme ou au calcul automatique des dégâts d’une arme éligible.

Pour la couche SRD pure : un résultat de 1 ou 2 sur un dé de dégâts devient 3.

Ne pas appliquer encore un éventuel override Fate’s Hand.

────────────────────────────────────────
7. MODÈLE PERSISTÉ
────────────────────────────────────────

Utiliser ctx.store("actions").

Versionner le stockage, par exemple :

{
  schema: "fh-actions/1",
  entries: [],
  turn: {
    attackMax: 1,
    attackUsed: 0,
    bonusUsed: false,
    reactionUsed: false,
    nickAvailable: false,
    nickUsed: false,
    vexReady: false
  }
}

Chaque entrée personnalisée doit avoir un identifiant stable.

Normaliser les anciennes ou mauvaises données au chargement au lieu de faire planter le panneau.

Toutes les chaînes provenant du personnage ou de l’utilisateur doivent passer par ctx.esc() avant insertion HTML.

────────────────────────────────────────
8. LIMITES À SIGNALER
────────────────────────────────────────

Le contrat actuel ne semble pas fournir :

- un événement « roll settled » ;
- le résultat hit/miss d’une attaque ;
- une API pour activer Advantage dans la console ;
- une API pour ajouter ou retirer un badge global ;
- une API pour ajouter dynamiquement Sneak/Smite/Hunter’s Mark à la console ;
- une API typée pour les dégâts et les armes.

N’édite pas silencieusement le cœur pour contourner cela.

Construis la meilleure V1 manuelle possible, puis ajoute dans COMPANION-BUILD-PLAN.md une courte section « Actions V1 — required core hooks » avec les signatures minimales proposées, par exemple :

ctx.openAttack(config)
ctx.setRollMode(mode, source)
ctx.onRollSettled(listener) ou un bus FH.events
ctx.addEffect(effect)
ctx.removeEffect(id)

Ce ne sont que des propositions : ne les implémente pas dans le cœur pendant ce package.

────────────────────────────────────────
9. STYLE
────────────────────────────────────────

Réutiliser la palette et les composants existants du dock.

Toutes les nouvelles classes CSS doivent être préfixées :

.fh-cd-actions...

Chaque font-size doit utiliser :

font-size: calc(Npx * var(--cd-fs));

Respecter :

- 360 px de largeur ;
- tailles de texte 1 / 1.15 / 1.3 ;
- fenêtre Table/Picture-in-Picture ;
- prefers-reduced-motion ;
- focus clavier visible ;
- zones tactiles raisonnables ;
- aucun scroll vertical interne inutile.

────────────────────────────────────────
10. TESTS
────────────────────────────────────────

Créer tests/actions-panel.test.js.

Tester au minimum :

- enregistrement du panneau Actions ;
- showsRoller === true ;
- rendu des trois économies ;
- création, édition et suppression d’une action personnalisée ;
- persistance via ctx.store("actions") ;
- action de jet appelant ctx.openConsole avec les bons paramètres ;
- action sans jet appelant ctx.note sans lancer de d20 ;
- consommation des slots ATK, BA et R ;
- NEW TURN ;
- limite configurable d’attaques ;
- Nick disponible une seule fois par tour ;
- Vex sans badge et annulable manuellement ;
- données corrompues normalisées sans exception ;
- échappement des saisies utilisateur.

Exécuter toutes les suites existantes, sans supposer leur nombre :

for t in tests/*.test.js; do
  echo "== $t =="
  node "$t" || exit 1
done

Construire le site :

cd ~/tools/fh-worktrees/actions-v1
~/tools/fh-phb/.venv/bin/mkdocs build --strict
cp tools/dock-harness.html site/dock-harness.html

Servir le build localement, par exemple :

python3 -m http.server 8133 -d site

Vérifier réellement dans le navigateur :

- desktop ;
- 520 px ;
- 390 px ;
- 360 px ;
- taille de texte Large ;
- ajout/édition/suppression ;
- consommation et reset du tour ;
- ouverture de la console ;
- reload avec /dock-harness.html?keep ;
- zéro erreur console ;
- aucun débordement horizontal non intentionnel.

────────────────────────────────────────
11. LIVRAISON
────────────────────────────────────────

Inspecter le diff avant commit :

git status --short
git diff --check
git diff --stat

Faire un commit local explicite :

git add \
  docs/javascripts/fh-panel-actions.js \
  docs/stylesheets/companion-dock.css \
  tests/actions-panel.test.js \
  COMPANION-BUILD-PLAN.md

git commit -m "Build the FHPC Actions panel V1"

Ne pas pousser.
Ne pas déployer.

Dans ton rapport final, donner :

1. le commit ;
2. les fonctions réellement opérationnelles ;
3. les tests exécutés ;
4. les vérifications navigateur ;
5. les automatisations impossibles avec le contrat actuel ;
6. les hooks minimaux recommandés pour la V2 ;
7. les fichiers modifiés.
