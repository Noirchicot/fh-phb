# LOT 76 — le **barillet** : un organe de choix, écrit une fois

> **En clair : partout où le joueur choisit un CHIFFRE, le builder lui montre
> une rangée de boutons. Eric veut un barillet — le picker iOS : une fenêtre
> de quelques valeurs, la sélection dans une bande centrale, le défilement
> aimanté. Ce lot écrit ce composant UNE fois et le branche à ses emplois.**

⛔ **Ce lot ne démarre qu'une fois le lot 75 (`versions-modules`) FUSIONNÉ** :
il touche les mêmes fichiers de `ui/builder/`.

## La règle d'Eric — apprends-la, elle vaut mieux que la liste

> ***« Globalement, dès qu'il y a des chiffres. »*** — Eric, 2026-08-15

**Des chiffres → barillet. Des mots → carrousel.** Applique-la aux écrans que
tu croises, pas seulement à la liste ci-dessous : c'est une règle, pas une
énumération, et elle survivra à un écran qui n'existe pas encore.

## Le vocabulaire, ratifié le 2026-08-15

Le mot « molette » désignait **quatre organes différents** dans la spec — c'est
la cause du malentendu, et il est mort. Les noms qui font foi désormais :

| Nom | Ce qui le définit |
|---|---|
| **Barillet** | fenêtre verticale de 5-7 valeurs, sélection dans une **bande centrale fixe**, voisines estompées, **colonnes indépendantes** côte à côte. *(Le minuteur iOS.)* |
| **Carrousel** | file aimantée qui **déborde** de l'écran, horizontale ou verticale. Des **sections**, pas des valeurs. *(L'étagère Apple TV.)* |
| **Ceinture** | la barre des dix étapes. Elle navigue, elle ne choisit pas |
| **Rangée** | tout visible, rien ne défile. Ce que le builder fait partout aujourd'hui |

## Le périmètre — ce lot ne fait QUE les barillets

| Spec | Aujourd'hui | Devient |
|---|---|---|
| **B5.1b `Choose yourself`** | **seize boutons** (3…18) en rangée | ⭐ **barillet** — l'emploi le plus évident, et il ne figurait dans aucune liste avant la règle d'Eric |
| **B5.5 Abilities** | rangée horizontale *(la dégradation du lot 63)* | six barillets, une valeur du tirage au centre |
| **B4.2 Inheritance** | six colonnes de 50 px, boutons `0`/`+1`/`+2` | six barillets verticaux |

⛔ **HORS PÉRIMÈTRE, et ce n'est pas un oubli :**

- **B7.1 · B8.1** (catégories de Compétences et d'Équipement) → ce sont des
  **mots**, donc des **carrousels**. Ils fonctionnent déjà comme tels. **Ne les
  touche pas.**
- **B2.1g** (le rail des 12 classes) → **carrousel vertical**, un autre lot.
- **B0** (la ceinture) → ⛔ **exclue par Eric**, explicitement.
- **B5.2a** (`FH 3D6` / `4D6`) → porte des chiffres, mais ce sont des **noms de
  méthode** et il n'y en a que deux. Tranché par l'architecte : **reste une
  paire de tuiles**. Si tu penses le contraire, dis-le à l'inventaire, ne le
  construis pas.

## Ce qui existe déjà — ne réinvente rien

- **`ui/builder/socle.mjs`** — `keepInView` (axes `x`, `y`, `y-start`),
  `nearestIndex`, `watchSnap`. **Un barillet est un scroller aimanté : le socle
  sait déjà lire un cran.** ⛔ Pas de second mécanisme d'observation.
- **`ui/builder/carnet.mjs`** — `renderPicker`, le sélecteur partagé qui rend
  les rangées d'aujourd'hui. C'est **lui** qui devient le barillet, ou qui
  l'appelle. ⛔ Pas de troisième sélecteur.
- **`src/build/index.mjs`** — `CREATION_SCORES` (les seize valeurs 3…18,
  lot 74). ⛔ **L'écran ne réécrit jamais la liste**, il la lit.
- **`poserUneColonne`** dans `tests/dom-stub.mjs` + `tests/spy.test.mjs` — un
  barillet vertical **est** une colonne : **testable sans navigateur**.

## Les pièges, mesurés, à ne pas redécouvrir

1. 🔴 **44 px reste la cible tactile** (invariant). Trois crans visibles =
   **132 px**, et c'est le chiffre qu'Eric a accepté.
2. 🔴 **B5.6, le piège des deux 14** : deux valeurs du tirage peuvent être
   **identiques**. Un barillet qui retient une **valeur** perd lequel des deux
   14 est placé. ⭐ **Déjà résolu** — une caractéristique pointe vers l'**index**
   du dé, jamais sa valeur (lot 50). **Ne casse pas ça**, et prouve-le.
3. **`scroll-snap: mandatory`** est la loi de la scène depuis le lot 73, et sa
   condition est gardée (`tests/snap.test.mjs`). Un barillet a son propre
   `scroll-snap` **à l'intérieur** — vérifie qu'ils ne se battent pas.
4. **`prefers-reduced-motion`** : respecté partout dans ce dépôt.
5. ⚠️ **Volet de navigateur masqué → `requestAnimationFrame` gelé**, et des
   mesures **cohérentes et fausses** (trois fois cette séance). Plante un
   témoin (`let f=0;const t=()=>{f++;requestAnimationFrame(t)};requestAnimationFrame(t)`)
   et **jette toute mesure prise avec `f === 0`**.

## Comment on travaille ici

- **Zéro build, zéro framework, zéro dépendance d'exécution.** ESM natif,
  `node:test`. ⛔ Aucune bibliothèque de picker.
- 🔴 **`npm test` en capturant le code de sortie, JAMAIS tuyauté** :
  `npm test > /tmp/t.txt 2>&1; echo "EXIT=$?"`.
- 👀 **Regarde la page**, à **1440×900 et 360×780**. Un barillet est un geste :
  une suite verte ne dit rien de ce qu'il fait sous le pouce.
- ⭐ **Écris la CONDITION d'une décision comme un garde, pas comme un
  commentaire.** Quatre fois cette séance, une décision juste a vu sa raison
  expirer sans que rien ne rougisse.
- Commentaires en français, dans le ton du dépôt : on dit **pourquoi**, on
  nomme ce qu'on a mesuré.

## Conditions de sortie

- `npm test` vert, nombre **avant** et **après**.
- Captures aux **deux tailles**, et la **hauteur réelle** d'un barillet à
  360 px.
- La preuve que **B5.6 tient toujours** : deux 14 dans le tirage, placés
  distinctement.
- La preuve que `Choose yourself` offre **seize valeurs lues du moteur**, pas
  une liste réécrite.
- `INVENTAIRE-LOT-76.md` : ce qui a changé, ce qui a été mesuré, **ce qui a
  surpris**, ce qui a été attaqué sans qu'on le demande.
- ⛔ **Jamais `git push`**, ⛔ **jamais de fusion dans `main`**.

⭐ **Droit de contredire cette commande** : si une mesure ne se reproduit pas,
**c'est la mesure qui a tort**. Dis-le et donne ton chiffre.
