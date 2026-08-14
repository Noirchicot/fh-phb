# LOT 76 — « molettes » : le barillet iOS, écrit une fois

> **En clair : partout où la spec d'Eric dit « molette », le builder a livré une
> rangée de boutons. Eric veut un vrai barillet iOS — une fenêtre de trois ou
> quatre valeurs, la sélection au centre, le défilement aimanté. Ce lot écrit
> ce composant UNE fois et le branche à ses six emplois.**

⛔ **Ce lot ne démarre qu'une fois le lot 75 (`versions-modules`) FUSIONNÉ** :
il touche les mêmes fichiers de `ui/builder/`. *(Règle de séquencement d'Eric :
un lot démarre après que sa dépendance est fusionnée.)*

## L'erreur qu'on répare, et elle est de l'architecte

Eric, 2026-08-15, devant le déployé : ***« toujours pas de molettes de choix
type iOS »***.

La spec le disait pourtant. **B2.1g** : *« la molette de gauche montre environ
4 icônes d'un coup — **une fenêtre glissante** sur les 12 »*. Une fenêtre
glissante, c'est un barillet.

⚠️ **Et le lot 63 a aggravé le malentendu** : six valeurs empilées faisaient
370 px de haut, alors la molette **verticale** de B5.5 a été convertie en
**défilement horizontal**. Une optimisation de hauteur qui s'éloignait de ce
qu'Eric avait décrit — décidée sans le lui demander. **Ne refais pas ce
raisonnement** : la hauteur est tranchée ci-dessous.

## Ce qu'Eric a tranché le 2026-08-15

| | |
|---|---|
| **Le geste** | barillet : fenêtre de **3-4 valeurs**, **sélection au centre**, défilement **aimanté** |
| **Le périmètre** | partout où la spec dit « molette »… |
| ⛔ **…SAUF la ceinture d'étapes** (`B0`) | elle **navigue**, elle ne choisit pas une valeur. Elle reste la barre horizontale actuelle — **ne la touche pas** |
| **La hauteur** | **assumée** : ~130 px pour trois valeurs visibles, contre 52 px aujourd'hui. *« Le barillet vaut la hauteur »*. La fiche défile déjà, c'est son métier |

## Les six emplois — un composant, six branchements

| Spec | Aujourd'hui | Ce que ça devient |
|---|---|---|
| **B4.2** — Inheritance | six colonnes de 50 px, boutons `0`/`+1`/`+2` | six barillets **verticaux** |
| **B5.5** — Abilities | rangée horizontale (la dégradation du lot 63) | six barillets, une valeur du tirage au centre |
| **B5.2a** — méthode de jet | deux boutons `FH 3D6` / `4D6` | un barillet à deux crans |
| **B7.1** — catégories de Compétences | barre horizontale de 5 boutons | barillet horizontal |
| **B8.1** — catégories d'Équipement | idem, 4 boutons | idem |
| **B2.1g** — rail de Class/Species | liste verticale des 12, toutes visibles | **fenêtre glissante de ~4 sur 12** |

📌 **Un seul composant.** Aujourd'hui six contrôles différents font le même
geste — c'est exactement ce que le dépôt appelle « une règle écrite six fois ».

## Ce qui existe déjà et qu'il ne faut pas réinventer

- **`ui/builder/socle.mjs`** — `keepInView` (axes `x`, `y`, `y-start`),
  `nearestIndex`, `watchSnap`. **Le barillet est un scroller aimanté : le socle
  sait déjà lire un cran.** ⛔ N'écris pas un second mécanisme d'observation.
- **`ui/builder/carnet.mjs`** — `renderPicker` : le sélecteur partagé
  d'aujourd'hui, celui qui rend les rangées de boutons. C'est **lui** qui
  devient le barillet, ou qui l'appelle. ⛔ Pas de troisième sélecteur.
- **`tests/spy.test.mjs`** et **`poserUneColonne`** dans `tests/dom-stub.mjs` —
  le stub sait poser **une colonne** et émettre un `scroll`. Un barillet
  vertical, c'est une colonne : **tu peux le tester sans navigateur.**

## Les pièges, mesurés, à ne pas redécouvrir

1. 🔴 **44 px reste la cible tactile** (invariant). Un cran de barillet ne
   descend pas sous 44 px de haut. Trois crans visibles = **132 px**, et c'est
   le chiffre qu'Eric a accepté.
2. 🔴 **B5.6, le piège des deux 14** : deux valeurs du tirage peuvent être
   **identiques**. Un barillet qui retient une **valeur** perd lequel des deux
   14 est déjà placé. ⭐ **C'est déjà résolu** — une caractéristique pointe vers
   l'**index** du dé, jamais vers sa valeur (lot 50). **Ne casse pas ça.**
3. **`scroll-snap: mandatory`** est désormais la loi de la scène (lot 73) et sa
   **condition est gardée** (`tests/snap.test.mjs` : une fiche fait un champ).
   Un barillet a son propre `scroll-snap` **à l'intérieur** — vérifie qu'il
   n'entre pas en conflit avec celui de la scène.
4. **`prefers-reduced-motion`** : le dépôt le respecte partout. Un barillet qui
   défile en douceur doit s'en tenir au saut quand l'utilisateur le demande.
5. ⚠️ **Volet de navigateur masqué → `requestAnimationFrame` gelé.** Trois fois
   cette séance, des mesures **cohérentes et fausses**. Plante un témoin
   (`let f=0;const t=()=>{f++;requestAnimationFrame(t)};requestAnimationFrame(t)`)
   et **jette toute mesure prise avec `f === 0`**.

## Comment on travaille ici

- **Zéro build, zéro framework, zéro dépendance d'exécution.** ESM natif,
  `node:test`. ⛔ Aucune bibliothèque de picker.
- 🔴 **`npm test` en capturant le code de sortie, JAMAIS tuyauté** :
  `npm test > /tmp/t.txt 2>&1; echo "EXIT=$?"`.
- 👀 **Regarde la page**, à **1440×900 et 360×780**. Le barillet est un geste :
  une suite verte ne dit rien de ce qu'il fait sous le pouce.
- ⭐ **Écris la CONDITION d'une décision comme un garde, pas comme un
  commentaire.** Trois fois cette séance, une décision juste a vu sa raison
  expirer sans que rien ne rougisse.
- Commentaires en français, dans le ton du dépôt : on dit **pourquoi**, on
  nomme ce qu'on a mesuré.

## Conditions de sortie

- `npm test` vert, nombre **avant** et **après**.
- Des captures aux **deux tailles**, et la mesure de la hauteur réelle d'un
  barillet à 360 px.
- La preuve que **B5.6 tient toujours** : deux 14 dans le tirage, placés
  distinctement.
- `INVENTAIRE-LOT-76.md` : ce qui a changé, ce qui a été mesuré, **ce qui a
  surpris**, et ce qui a été attaqué sans qu'on le demande.
- ⛔ **Jamais `git push`**, ⛔ **jamais de fusion dans `main`** — l'architecte
  fusionne.

⭐ **Droit de contredire cette commande** : si une mesure ci-dessus ne se
reproduit pas, **c'est la mesure qui a tort**. Dis-le et donne ton chiffre.
