# FHPC v2 — passage de témoin

**Écrit le 2026-08-07 par l'architecte par intérim, pour la session qui ouvrira le chantier v2.**

Ce document énonce **l'objectif, les contraintes et les pièges déjà payés**. Il ne
donne pas de marche à suivre, et cette omission est délibérée : l'architecture est
à concevoir, pas à exécuter. Ce qui est écrit ici a été décidé par Eric ou mesuré
dans le code ; le reste t'appartient.

Lis aussi `ARCHITECT-HANDOFF.md` §3 (les 27 pièges) et §5 (comment Eric travaille).
Le reste du handoff décrit le produit v1 et est en grande partie caduc — voir §9.

---

## 1. Le virage — ce que le produit est devenu

**Le produit n'est plus un compagnon de table attaché à un VTT. C'est un
constructeur de personnage indépendant.**

> **La thèse, dans les mots d'Eric : « le joueur peut se balader partout avec ses
> persos et les tweaker. »**

Bâti sur le SRD, avec des couches de règles empilables par-dessus (FH, homebrew,
et d'autres si des accords viennent). Le joueur emporte son personnage où il veut —
Foundry, AboveVTT, Roll20 — et le modifie.

Ce virage est daté du 2026-08-07 et remplace le positionnement précédent
(« fiche de perso câblée au SRD + lanceur de dés, attaché à un VTT »). La séquence
en six étapes du handoff §2 est réordonnée : le builder, les couches et le MCP
passent devant l'achèvement du dock.

---

## 2. Les quatre décisions d'Eric — 2026-08-07

| # | Décision | Conséquence |
|---|---|---|
| **1** | **FHPC est un serveur MCP**, pas un client | Il expose les personnages comme ressource. C'est l'IA du joueur (ou un pont) qui les porte dans le VTT. Un seul mécanisme à écrire, pas un connecteur par VTT. Conforme à la loi ratifiée : *la plateforme est pilotable par l'IA de l'utilisateur, elle ne pilote jamais* |
| **2** | **Les couches** : SRD et une couche FH de base **livrées avec la plateforme**. Le homebrew est un **conteneur** que chaque MJ remplit sur son serveur, partageable publiquement en JSON tant qu'il respecte les règles du SRD. Le contenu WotC (PHB, DMG) n'arrive que s'il y a accord — pas un sujet aujourd'hui | ⚠️ **Et le point le plus structurant de tous** : *« le joueur peut voyager avec son perso sans nécessairement avoir l'intégralité des règles uploadées »* — voir §3 |
| **3** | **Le personnage appartient au joueur, la campagne appartient au MJ.** Le joueur héberge ses propres données et **partage une copie** au serveur du MJ quand il rejoint une campagne | Pas de comptes chez Eric : pas de RGPD, pas de promesse de disponibilité, pas de facture qui grandit. Toute synchro multi-appareils doit rester **optionnelle et débranchable** |
| **4** | **La table d'Eric ne joue pas sur FHPC aujourd'hui.** *« Les données joueurs sont en sécurité ailleurs, on peut les perdre ici. »* **Dans trois mois, on joue à FH** | Liberté totale sur les données existantes. Et **une date dure** : c'est la seule du chantier |

**Non tranché, et qui le restera jusqu'à ce qu'Eric le dise** : où vit le partage
public de homebrew (un format de fichier ne suffit pas, il faut un endroit — c'est
le seul point où il redeviendrait hébergeur malgré lui).

---

## 3. Ce qui doit être vrai de l'architecture

Cinq contraintes. Elles ne disent pas comment construire ; elles disent ce qui
sera faux si on les ignore.

### 3.1 Le document de personnage est auto-suffisant

Il doit s'ouvrir et rester jouable **sans ses couches de règles**. Il porte ses
valeurs résolues, pas des pointeurs vers des règles absentes. Les couches servent
à **construire et valider**, jamais à **exister**.

C'est la même exigence que l'interrupteur « FH off → SRD pur » qu'Eric a demandé,
vue depuis le document au lieu de l'application. Et c'est aussi ce que le
local-first (décision 3) impose. Les deux se renforcent.

**Corollaire** : le document doit **déclarer les couches** avec lesquelles il a été
bâti. Ouvert sans elles, il se dégrade — mais il le **dit**. Jamais de repli
silencieux (§4.1).

### 3.2 Le moteur expose des verbes, pas des clics

Il y aura **quatre consommateurs** de la même logique : le dock existant, un
builder mobile, un builder plein écran sur desktop (interfaces **distinctes**, pas
responsive), et l'IA pilote.

Dans la v1, la logique n'est appelable que par un clic : `handleClick` est un
routeur d'environ **160 branches** sur des attributs `data-*`. Chaque nouvelle vue
devrait le réimplémenter, et l'IA — qui n'a pas de DOM — ne peut rien appeler.

**Le vocabulaire existe déjà** : `data-quick-name`, `data-add-tray-die`,
`data-destiny-die`, `data-pending-resolve`… C'est un jeu de commandes complet et
éprouvé, simplement anonyme et soudé au markup. Il ne s'agit pas d'inventer une
surface — il s'agit de **nommer celle qui existe et de la sortir du DOM**.

C'est aussi ce qui rend possible ce qu'Eric veut : **plusieurs chantiers
simultanés, tenus par des ingénieurs autonomes.** Chaque bloc possède un jeu de
verbes et sa tranche d'état, derrière un contrat écrit. Sans ce contrat, ils se
marchent dessus au premier merge — c'est ce que la v1 subit depuis six mois.

### 3.3 L'UI est un consommateur, jamais un propriétaire

Aucune interface n'est privilégiée. Les autorités `UI-DIMENSIONS.md` (référence
425 × 680, planchers 620 h / 360 l, cinq crans de zoom) décrivent **le dock v1** et
**ne gouvernent pas** le builder. Ne les applique pas au nouveau produit.

Bonne nouvelle qui en découle : le **chapitre zoom**, en attente depuis le
2026-08-06 et explicitement mis de côté par Eric, ne se pose pas pour un builder
plein écran. La dette C3 reste un problème du dock.

### 3.4 Le MCP est une surface de sortie, pas une intégration tardive

Décision 1. Il consomme les verbes de 3.2 et le document de 3.1. Si ces deux-là
sont justes, le MCP est mince. S'ils ne le sont pas, aucun MCP ne rattrapera.

La v1 a déjà la bonne discipline **côté sortie** : `fh-roll/1` est un modèle de
vue, la couche `intent` est le modèle machine, avec `badgeIds` et `verdictId` pour
dédupliquer **par jeton et non par texte**. Il n'existe **aucun schéma de
personnage** — l'objet éphémère est discipliné, l'objet qui est le produit ne l'est
pas. C'est le premier trou à combler.

### 3.5 Le connecteur D&D Beyond est une pièce détachable

Eric le garde pour sa table en attendant. **Il n'est pas diffusable sans accord
avec DDB**, qu'il n'aura pas dans un premier temps.

Il doit donc vivre **derrière le même mécanisme de connecteur** que Foundry ou
Roll20, et pouvoir être retiré sans toucher au reste. Dans la v1 il ne l'est pas :
`openPull`/`pullDdb` sont dans le cœur, et le bouton *Level Up* est même désactivé
quand DDB est lié. C'est une contrainte **juridique**, datée par un tiers.

---

## 4. Ce qui se porte, et ce qui se refait

Reconstruire, oui. **Page blanche, non** — ce qui coûte le plus cher dans la v1
n'est pas le code, c'est ce qui a déjà été payé.

| | Traitement | Pourquoi |
|---|---|---|
| **Le moteur de jet** — Destinée, Chaos, Overreach, résolution arcane, phases de séquence, gardes de transaction (~800 l.) | **PORTÉ, pas réécrit.** Sans DOM, avec ses suites | C'est la partie la plus subtile et **la seule où réécrire perd du savoir**. Deux incidents documentés en sont sortis, dont *« `addHistory` n'est pas là où un jet se règle »* |
| **Les 27 pièges payés** (`ARCHITECT-HANDOFF.md` §3) | **COPIÉS au jour 1** dans le nouveau dépôt | Chacun est une erreur déjà facturée. Une reconstruction qui ne les emporte pas les repaiera une par une |
| **Les visuels de dés et le lexique de jet** | **PORTÉS** — ils sont purs, vérifié | Extraits le 2026-08-07 en `fh-dice-visual.js` (372 l.) et prouvés sans dépendance à `state` |
| **Les 19 suites de tests** | **PORTÉES** pour ce qui suit le moteur | Elles encodent du comportement, pas de la structure |
| **UI, persistance, pipeline, connecteurs, document de personnage** | **NEUFS** | La v1 ne sait faire ni couches, ni connecteurs, ni document portable. Eric a l'interface en tête |

**Le dock v1 ne meurt pas : il gèle.** La table d'Eric n'est pas dessus (décision 4),
donc rien ne presse — mais on ne débranche rien.

---

## 5. Pourquoi la v1 ne peut pas y aller par refactoring

Ce n'est pas une opinion, c'est mesuré le 2026-08-07 :

- `fh-player-sheet.js` fait **5 645 lignes** en une seule IIFE, autour d'un objet
  `state` mutable partagé que **~300 fonctions** touchent.
- Sur les **14 items** de la feuille de route d'Eric, **12 touchent ce fichier**.
  Deux seulement vivent entièrement dans un panneau. Tout sérialise sur une file.
- **Trois tentatives d'extraction** ont été menées et **refusées sur inventaire
  chiffré** : le serveur de table (107 accès à `state`, cycle réel entre
  `profileWrite` et `api()`), le pool de ressources (contrat minimal à **31 entrées**
  et trois poignées mutables co-écrites), les modules ES (le harnais de tests
  `vm.runInNewContext` ne compile que du script classique). Les trois notes sont sur
  les branches — voir §8.
- Une quatrième extraction, **purement présentationnelle**, a réussi (407 lignes,
  19/19 verts). Son plafond est là : le code qui bloque le travail parallèle est
  précisément celui qui **touche `state`**.

**La leçon utile pour la v2** : une coupe par *pureté* ne va pas loin. La bonne
couture est la **frontière de commande** — qui possède quels verbes et quelle
tranche d'état.

---

## 6. Les pièges à ne surtout pas repayer

Les 27 sont dans `ARCHITECT-HANDOFF.md` §3. Ceux-ci mordent la v2 **même en
partant de zéro** :

| Piège | Ce qu'il impose |
|---|---|
| **Cloudflare KV : ~1 écriture/s par clé, et `list()` est compté à part (~1 000/jour)** | Une clé par événement + un curseur. **Aucun `list()` sur un chemin qu'une page appelle sur un timer** — ça a mis la prod à terre le 2026-07-30 |
| **La séquence EST l'horodatage** | Epoch ms 13 chiffres paddé + départageur aléatoire. Une clé compteur recrée la limite d'écriture |
| **Une page HTTPS ne peut pas fetch `http://`, et aucun navigateur ne parle au loopback** | Toute option d'auto-hébergement sans TLS est morte-née |
| **Cloudflare Quick Tunnel ne délivre pas de corps HTTP streamé** | WebSocket, pas SSE, dès qu'un tunnel est dans le chemin |
| **Un navigateur n'applique aucun CORS à un upgrade WebSocket** | Le serveur vérifie `Origin` lui-même |
| **`Content-Type: application/json` en POST cross-origin déclenche un preflight** | Tout serveur local a besoin d'un vrai handler `OPTIONS` |
| **Marquer livré avant de savoir si ça l'a été** | Réclamer optimiste si nécessaire, mais **dé-réclamer à l'échec**, et ne jamais laisser un succès non lié effacer un échec enregistré par quelqu'un d'autre. C'est une **famille** de bug, pas un cas |
| **Jamais de repli silencieux** | Service injoignable → on le dit et on refuse. Jamais rouler en local pendant que les joueurs croient que la table a vu |
| **Un glyphe se juge sur son raster 12px, jamais sur son chemin** | Bords droits et sommets plats survivent ; les courbes non |
| **Une note `// REWRITTEN` en milieu de ligne** a commenté quatre assertions et **rendu une suite verte alors que le garde ne tournait plus** | Les marques vont sur leur propre ligne. Quand un changement rend une assertion fausse : la réécrire à la nouvelle vérité et la marquer — jamais la relâcher, jamais la supprimer |

---

## 7. Les lois qui survivent au virage

Elles ont été ratifiées et rien dans le virage ne les annule :

- **La parole du MJ bat le JSON.** Chaque champ éditable, chaque règle débrayable —
  **à construire dans chaque nouvelle surface dès maintenant**, rétrofitter est un
  chantier. La thèse d'Eric (« les tweaker ») l'étend au joueur.
- **SRD en couche de base, Fate's Hand par-dessus, jamais mélangés.**
- **Discipline légale** : déblocages de contenu = codes émis par l'éditeur avec
  commission plateforme. Jamais de conversion de preuve d'achat, jamais de contenu
  WotC.
- **Jamais d'IA embarquée dans l'app.** La plateforme est pilotable par l'IA de
  l'utilisateur ; elle ne pilote jamais.
- **Tout ce qui sort vers un VTT reste scrupuleusement SRD 5.2 (CC-BY-4.0) propre.**
  C'est de la discipline **et** de la diplomatie : ce dépôt est public.

---

## 8. L'état des branches — `fh-phb`, 2026-08-07

Rien n'est fusionné. `main` est intact.

| Branche | Contenu | Verdict |
|---|---|---|
| `split-pure-modules` | `fh-utils.js` (35 l.) + `fh-dice-visual.js` (372 l.) extraits, bloc d'alias, 19/19 verts | Le **code à porter** en v2. La technique du bloc d'alias — qui rend une coupe vérifiable octet par octet — est son vrai livrable |
| `es-modules` | `ES-MODULES-EVALUATION.md` | Refus argumenté. mkdocs 9.7.7 **sait** émettre `type="module"` ; c'est le harnais de tests qui bloque |
| `table-feed` | `TABLE-FEED-EVALUATION.md` | Refus argumenté, couplage chiffré |
| `pool-resources` | `POOL-RESOURCES-EVALUATION.md` | Refus argumenté, couplage chiffré |
| `fix-panel-persistence` | Correctif de persistance | **Ne pas fusionner.** Rendu caduc par la décision 4. Son enquête (le Worker accepte-t-il des clés inconnues ?) reste utile pour la v2 |

⚠️ **Les trois branches d'évaluation sont empilées sur `split-pure-modules`** : leur
diff contre `main` porte le code. Pour ne garder que les notes, cherry-pick les
commits de doc.

**Un défaut connu de `split-pure-modules`, à ne pas reproduire** : le bloc d'alias
lit `window.FH.utils.esc` **sans garde**. Si un module ne se charge pas, le dock ne
monte pas du tout. Une garde bruyante est due — doctrine « jamais de repli
silencieux ».

---

## 9. Ce qui est caduc dans le dossier existant

- **`COMPANION-BUILD-PLAN.md`** est le plan d'un compagnon. Le produit est un
  constructeur. Son §2 (positionnement) et sa séquence sont dépassés ; ses pièges et
  ses schémas ne le sont pas.
- **La porte de déploiement** (`ARCHITECT-HANDOFF.md` §6) a six items, tous des
  surfaces du dock v1. Elle mesure un produit qui n'est plus le chemin. **Gelée**,
  pas ouverte, pas soldée.
- **`ARCHITECT-HANDOFF.md` §6** n'a pas été mis à jour depuis le 2026-08-06 et dit
  encore « Gate progress: 4 of 6 ». `CHANTIER-STATUS.json` fait foi sur l'état.

---

## 10. Comment Eric travaille — l'essentiel

- **Il décide l'architecture ; tu proposes.** Quand il dit « réponds avant de
  travailler dessus », il le pense : donne la recommandation **et arrête-toi**.
- **Il veut le raisonnement, pas juste la réponse.** Les bons échanges de ce projet
  sont ceux où une affirmation a été **vérifiée contre la source** et où le constat a
  **changé le plan**. Ça s'est produit trois fois le 2026-08-07.
- **Rapporte les échecs platement.** « Ça n'a pas marché, voici la mesure » passe
  mieux qu'une esquive.
- **Il refuse le code mort derrière un interrupteur.** Il a fait supprimer une
  fonctionnalité construite plutôt que la garder désactivée.
- **Il ne peut pas lire une liste de branches à noms générés.** Nomme la branche
  d'après le travail, **avant** de commencer.
- **Le vault est local-only** (`~/obsidian-vault`), jamais via un MCP distant. Les
  comptes rendus de chantier vont dans `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/`,
  **un sujet = un fichier**, jamais à la racine.
- **`git push` et le déploiement sont ses gestes**, pas les tiens. Tends-lui les
  commandes.

---

## 11. Ce qui n'est pas tranché

À ne pas décider à la place d'Eric :

1. **Où vit le partage public de homebrew** (§2). Un format ne suffit pas, il faut
   un endroit — et c'est le seul point où il redeviendrait hébergeur.
2. **La synchro multi-appareils du joueur** : assumée par le joueur, ou service
   optionnel ? Optionnel se retire, obligatoire ne se retire pas.
3. **Le sort du dock v1** au-delà du gel : maintenu, archivé, ou repris comme
   troisième vue du nouveau produit.
4. **Ce que « fonctions globales dans le menu de l'ID » recouvre.** La règle debout
   dit *« Identity = identité + chrome de fenêtre uniquement, jamais de navigation de
   contenu »*. Si ça désigne des actions de contenu, **c'est un amendement à une
   règle ratifiée**, pas une exécution.

---

## 12. La seule date dure

**Dans trois mois, la table d'Eric joue à FH sur le nouveau produit.**

Tout le reste est négociable. Le périmètre s'est élargi vite le 2026-08-07 — dock,
builder mobile, builder desktop, couches, connecteurs, MCP. Le risque n'est pas de
se tromper d'architecture : c'est que rien ne sorte. Ce qui rend une table jouable
dans trois mois passe avant ce qui rend la plateforme complète.
