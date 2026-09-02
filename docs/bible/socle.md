# Le socle

Cette page porte le mécanisme — `socle.mjs`, ses quatre fonctions, ses trois verbes de rendu, le contrat d'un écran — et les lois de méthode qui gouvernent tout le corpus. C'est ici que vivent « une norme est un défaut, pas un mur », « Google Headless » et les quatre vocabulaires qu'on ne mélange jamais.

## Ce que vaut une norme

### Un seul corpus { #socle-corpus-unique }

**Les trois fichiers sont un seul corpus : aucune règle n'est vraie « seulement dans son fichier ».**

??? note "Pourquoi, et depuis quand"
    *« TROIS PORTES, UNE SEULE LOI. Le découpage sert à trouver, pas à cloisonner : une règle d'organe vaut sur tous les écrans, une cote d'écran vaut pour tous les organes qu'il porte, et le mécanisme vaut pour les deux. »*

    Valeur : NORMES = les organes · CADRES = les écrans · SOCLE = le mécanisme · Source : NORMES.md / CADRES.md / SOCLE.md, en-tête commun, Eric 2026-08-29 : *« Ok que ça soit dans trois fichiers, mais l'application au builder est la même. »* · Statut : ratifié

### La portée : le builder { #socle-portee-builder }

**La portée de ce corpus est le BUILDER : le site du livre (`fh-phb`) a sa propre feuille.**

??? note "Pourquoi, et depuis quand"
    *« L'étendre est une décision d'Eric, pas une conséquence de ce paragraphe. »*

    Source : en-tête commun aux trois fichiers, 2026-08-29 · Statut : ratifié

### Une norme est un défaut { #socle-norme-est-un-defaut }

**Une norme est un DÉFAUT, pas un mur : un écran qui dévie le fait explicitement, et c'est légal.**

??? note "Pourquoi, et depuis quand"
    Eric : « c'est pas une dictature, on fait ça par défaut ». Ce que le garde interdit, c'est de RECOPIER le nombre en littéral — pas de dévier explicitement.

    Valeur : un garde vérifie **que le défaut vaut la bonne valeur** et **que personne ne recopie le nombre en littéral** — jamais que tous les écrans l'emploient · Source : NORMES.md, en-tête, Eric 2026-08-26 : *« c'est pas une dictature, on fait ça par défaut »* · Statut : ratifié

### Les exceptions s'argumentent { #socle-exceptions-argumentees }

**Une exception se NOMME (jamais un `:nth-child` qui devine) et se pose à côté de son argument.**

??? note "Pourquoi, et depuis quand"
    *« Une exception argumentée dit ce qu'elle retire et pourquoi ce retrait est juste ICI. Une exception qui dit seulement « ici c'est différent » n'est pas argumentée, c'est un écart. »* Exemple en place : `.ability-collecteur > .sortie` réserve `--touch` 44 là où le site réserve 52, *« parce que la gouttière de 16 est déjà portée par sa dalle »*.

    Valeur : `data-rangs="caracs"` · `:not(.ability-creneaux)` · `:not(.fiche-livre)` · Source : en-tête commun, Eric 2026-08-26 : *« il y aura des exceptions pour tokens et collecteurs, mais ils doivent être argumentés »* · Statut : ratifié

### Nommer ne met pas à l'abri { #socle-nommer-n-est-pas-mettre-a-l-abri }

**Nommer ne met pas à l'abri : la forme sûre est un attribut à plusieurs valeurs, qui donne à tous les cas la MÊME spécificité.**

??? note "Pourquoi, et depuis quand"
    *« ça a coûté trois lots le 29/08 : trois régimes de rangement écrits en `:not()` l'un de l'autre étaient tous nommés — et se sont battus quand même, parce qu'une exclusion de plus déplace la spécificité »*.

    Valeur : `data-rangs` · ⛔ trois régimes écrits en `:not()` l'un de l'autre · Source : en-tête commun, 2026-08-29 · Statut : ratifié

## Comment on vérifie

### Google Headless { #socle-google-headless }

**Une norme se vérifie sur la PAGE RENDUE, pas dans la source.**

??? note "Pourquoi, et depuis quand"
    née de **quatre fautes de la même nuit**, toutes de la même famille — *conclure sur la source au lieu de regarder la chose* : `--accent` lu sans lire `#845933` · un `client_id` retapé à la main, un `O` changé en `0` · un budget vertical établi sur une hauteur non mesurée · *« pas de conflit avec un bouton » allait être constaté à l'œil sur un seul écran*.

    Valeur : ⛔ lire une valeur dans `tokens.css`, lire le NOM d'un jeton, regarder un écran de démonstration, calculer un contraste sur une couleur pure · ✅ ouvrir la page dans un navigateur sans écran et la mesurer, lire la valeur CALCULÉE, mesurer TOUS les cas, calculer sur le rendu cumulé voile compris · Source : NORMES.md § « 0. LA RÈGLE UNIVERSELLE », Eric 2026-08-26 : *« et la règle universelle désormais : GOOGLE HEADLESS »* · Statut : ratifié

### Le garde qui manque { #socle-le-garde-qui-manque }

⏳ **À trancher.** Outil manquant.

**Un test qui lit un fichier CSS vérifie ce qui est ÉCRIT ; un test qui rend la page vérifie ce que le joueur VOIT — le second manque.**

??? note "Pourquoi, et depuis quand"
    `tests/decor.test.mjs` fait déjà le premier.

    Valeur : ✅ Chrome `151.0.7922.174` installé · 🔴 puppeteer / playwright **absents** de `fhpc`, à ajouter épinglés · Source : NORMES.md § « 0 — Ce qu'on a sous la main », mesuré 2026-08-26 · Statut : à trancher (outil manquant)

### Chrome headless ne fabrique pas de PDF { #socle-chrome-headless-ne-fabrique-pas-de-pdf }

**Chrome headless sert à REGARDER une page, pas à en fabriquer une : les PDF Fate's Hand se génèrent à la weasyprint.**

??? note "Pourquoi, et depuis quand"
    Chrome headless *« plante sur ce pipeline »*.

    Source : NORMES.md § « 0 », 2026-08-26 · Statut : ratifié

## Les quatre vocabulaires

### Les quatre vocabulaires { #socle-quatre-vocabulaires }

**Quatre vocabulaires ne se mélangent jamais : `R`/`B`/`SB` = un RANG · `F`/`FF`/`FS` = le CADRE · carte/dalle/tuile = l'OBJET · `T1…T7` = les tailles de texte.**

??? note "Pourquoi, et depuis quand"
    `R`/`B`/`SB` est ⛔ *« JAMAIS un nom de page — une page a un NOM »*. Seul l'écran porte la lettre du cadre. Une **carte** a une hauteur imposée.

    Source : NORMES.md § « 1. LES QUATRE VOCABULAIRES », 2026-08-26 · Statut : ratifié

### « R1 » n'existe pas { #socle-r1-n-existe-pas }

**« R1 » n'existe pas, et on écrit toujours « Entrée › B2 » ou « Équipement › B2 », jamais « B2 » seul.**

??? note "Pourquoi, et depuis quand"
    *« Cette faute a coûté un lot entier le 2026-08-23. »* Chaque chapitre a son propre `R`, ses propres `B`.

    Source : NORMES.md § « 1 », 2026-08-26 · Statut : ratifié

## Le rendu

### La règle de rendu B { #socle-regle-de-rendu-b }

**La règle de rendu est **B** : le cadre est construit une fois et jamais remplacé, on y écrit des attributs, jamais des nœuds.**

??? note "Pourquoi, et depuis quand"
    *« Descendre le « ne redessine que ce qui change » jusqu'à la ligne de compétence, c'est écrire un moteur de diff — le mini-framework de 2 000 lignes que la commande interdit. »*

    Valeur : cadre = molette, ligne de commande, scène, chevrons · intérieur de la scène = reconstruit d'un coup, mais le défilement survit (`swapContent`) — c'est le **A** dans le seul endroit qui reconstruit encore · Source : SOCLE.md § « La règle de rendu tranchée : B », lot 58 · Statut : ratifié

### Qui possède quoi { #socle-qui-possede-quoi }

**Chaque état a un seul propriétaire et un seul écrivain.**

??? note "Pourquoi, et depuis quand"
    « une brique, un écrivain, un garde » : deux écrivains pour un même état finissent par diverger, et la divergence ne se voit pas le jour où elle naît.

    Valeur : le document → `state.document`, écrit par `applyDecisionAction` seul · l'étape / le palier / le plan ouvert → `state`, écrit par `shell.mjs` seul · le cran d'aimantation → `state.classCursor`, écrit par le scrollspy seul · la position de défilement → le nœud DOM, **personne** ne l'écrit · le minuteur des chevrons → la fermeture de `mountChevrons` · la vérité « ça défile » → `mountChevrons` seul, garde `tests/chevrons.test.mjs` · Source : SOCLE.md § « Qui possède quoi » · Statut : ratifié

### Les trois verbes du rendu { #socle-trois-verbes-du-rendu }

**Trois verbes, et rien d'autre : `refresh()` (le défilement survit), `openSurface()` (il repart en haut, délibérément), et rien du tout quand on défile.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« La troisième ligne est la plus importante du fichier. Un scrollspy qui appelle `refresh()` se mord la queue : le redessin bouge le défilement, qui rappelle le spy. Le spy écrit `state`, touche un attribut, et s'arrête là. »*

    Source : SOCLE.md § « Les trois verbes » · Statut : ratifié

### Ce qui ne se redessine jamais { #socle-ce-qui-ne-se-redessine-jamais }

**Cinq nœuds ne se redessinent jamais.**

??? note "Pourquoi, et depuis quand"
    c'est la règle B appliquée : « On y écrit des attributs, jamais des nœuds » — c'est ce qui fait survivre le défilement, les minuteurs et les écouteurs à chaque mise à jour.

    Valeur : `.belt` et ses dix crans (seuls `data-status` / `aria-current` changent) · `.command` (les deux boutons sont les mêmes nœuds du début à la fin) · `.stage` (le conteneur qui défile ne meurt jamais, son contenu si) · `.stage-chevrons` (avec son minuteur) · `.stage-aside` (le slot persiste, ce qu'un écran y met peut changer — B0.19) · Source : SOCLE.md § « Ce qui ne se redessine JAMAIS » · Statut : ratifié

### Cinq choses qui survivent { #socle-cinq-choses-qui-survivent }

**Cinq choses survivent à une mise à jour, et chacune est logée quelque part.**

??? note "Pourquoi, et depuis quand"
    « Les cinq de `ERGONOMIE-BUILDER.md` §RENDU, et où chacune est logée » — une invariante sans domicile nommé est une invariante que le prochain redessin cassera sans le dire.

    Valeur : position de défilement → `swapContent` la relit et la repose · observation du défilement → `watchSnap`, **un** écouteur sur un nœud qui ne meurt pas, **ne retient aucun élément** · minuteur des chevrons → `mountChevrons` · état d'un popup → ⏳ **pas construit**, il vivra dans `state`, jamais dans le DOM · palier de `Validate` → `state.palier`, hors du DOM par construction · Source : SOCLE.md § « Ce qui doit survivre à une mise à jour » (les cinq de `ERGONOMIE-BUILDER.md` §RENDU) · Statut : ratifié (l'état d'un popup reste ⏳)

## `socle.mjs`

### Les quatre fonctions de `socle.mjs` { #socle-quatre-fonctions }

**`socle.mjs` porte quatre fonctions, et le fichier doit rester lisible d'un coup d'œil.**

??? note "Pourquoi, et depuis quand"
    « et le fichier doit rester lisible d'un coup d'œil » : la taille du socle est elle-même un garde — « s'il grandit, c'est que le socle a grandi, et c'est ça qu'il faut regarder ».

    Valeur : `swapContent` · `keepInView` · `watchSnap` + `nearestIndex` · `mountChevrons` · Source : SOCLE.md § « Les quatre fonctions du socle » · Statut : ratifié

### Un seul écrivain par brique { #socle-un-seul-ecrivain-par-brique }

**`swapContent` est le SEUL endroit du dépôt qui remplace le contenu d'un nœud : une brique, un écrivain, un garde.**

??? note "Pourquoi, et depuis quand"
    sur le modèle de `markPressed()` (lot 57) — un seul écrivain rend la règle vérifiable mécaniquement plutôt que par relecture.

    Valeur : garde `tests/socle.test.mjs`, sur le modèle de `markPressed()` (lot 57) · Source : SOCLE.md § « Les quatre fonctions » · Statut : ratifié

### `keepInView` remplace `scrollIntoView` { #socle-keepinview-remplace-scrollintoview }

**`keepInView` remplace `scrollIntoView`, qui déplaçait la page entière ; un garde interdit `scrollIntoView` dans `ui/`.**

??? note "Pourquoi, et depuis quand"
    *« il remonte toute la chaîne des ancêtres »*.

    Valeur : `keepInView(scroller, child, axis)` · Source : SOCLE.md § « Les quatre fonctions » · Statut : ratifié

### La machine à états des chevrons { #socle-chevrons-machine-a-etats }

**`mountChevrons` porte la vérité « ça défile » : pas de mou → tout s'éteint ; un bout de course → la direction s'éteint ; la souris posée ou le focus clavier retiennent le minuteur.**

??? note "Pourquoi, et depuis quand"
    la machine à états est testée (`tests/chevrons.test.mjs`) ; l'opacité et le masque se regardent au navigateur.

    Valeur : `data-visible`, `data-more`, `disabled` · `:focus-visible` — *« un focus de clic ne retient pas, mesuré gelé sinon »* · rend `{ step, settle }` : `settle()` relit la géométrie après un remplacement, `settle(true)` annonce une surface neuve qui défile (B0.22b, l'indicateur iOS qui flashe) · Source : SOCLE.md § « Les quatre fonctions », lot 70 · Statut : ratifié

### Rien sans un écran qui en a besoin { #socle-rien-sans-un-ecran-qui-en-a-besoin }

**On n'ajoute rien au socle sans un écran qui en a besoin AUJOURD'HUI.**

??? note "Pourquoi, et depuis quand"
    *« le piège nommé par la commande du lot : un socle écrit pour des besoins imaginés, avant qu'un seul écran fonctionne »*.

    Source : SOCLE.md § « Les quatre fonctions » · Statut : ratifié

### `echelle.mjs` vit hors du socle { #socle-echelle-hors-socle }

**`echelle.mjs` pose deux attributs sur `<html>` et aucun nœud : changer de taille ne redessine rien.**

??? note "Pourquoi, et depuis quand"
    *« C'est la règle du cadre appliquée telle quelle : le navigateur remet en page tout seul, et le défilement survit. »*

    Valeur : `--echelle` et `data-grandeur` · lot 85 · Source : SOCLE.md § « L'échelle — un organe hors socle » · Statut : ratifié

### L'échelle se repose avant `refresh()` { #socle-resize-avant-refresh }

**Au redimensionnement, l'échelle se repose AVANT `refresh()` — et c'est toujours `refresh()`, jamais `openSurface()`.**

??? note "Pourquoi, et depuis quand"
    *« sinon l'écran se redessine sur la grandeur d'avant »* · *« tourner la tablette ne renvoie pas le joueur en haut de l'écran qu'il lisait »*.

    Valeur : `surRedimensionnement` · garde E ter · Source : SOCLE.md § « L'échelle » · Statut : ratifié

## Le contrat d'un écran

### Le contrat d'un écran { #socle-contrat-d-un-ecran }

**Un module d'écran exporte une fonction qui rend un nœud et ne connaît ni la coquille ni les verbes du moteur.**

??? note "Pourquoi, et depuis quand"
    c'est ce qui permet à la coquille de rendre les dix écrans avec le même geste : un écran qui connaîtrait les verbes du moteur les appellerait à sa façon, et le défilement ne survivrait plus partout.

    Valeur : loi des lots 39/42, inchangée · Source : SOCLE.md § « Le contrat d'un écran » · Statut : ratifié

### Les paliers { #socle-paliers }

**Un écran peut exporter un descripteur de paliers `{ label, ready, commit }` ; celui qui n'en exporte pas a UN palier par défaut : avancer.**

??? note "Pourquoi, et depuis quand"
    *« aucun écran n'a donc à mentir sur des paliers qu'il n'a pas »*.

    Valeur : lu par `shell.mjs` · Source : SOCLE.md § « Le contrat d'un écran », lot 58 · Statut : ratifié

### Le rail est vertical seulement { #socle-rail-vertical-seulement }

⏳ **À trancher.**

**Le rail existe dans sa forme VERTICALE ; la forme horizontale (la molette de catégories de Compétences) n'est pas construite.**

??? note "Pourquoi, et depuis quand"
    *« elle demandera son propre slot, et ce lot ne l'invente pas d'avance »*.

    Valeur : `.stage-aside` (B0.19) · forme horizontale = B7.1 · Source : SOCLE.md § « Le contrat d'un écran » · Statut : à trancher

### `data-snap` { #socle-data-snap }

**`data-snap` sur les fiches d'un défilement aimanté est le seul contrat entre un écran et le spy.**

??? note "Pourquoi, et depuis quand"
    « le seul contrat entre un écran et le spy » — `watchSnap` « ne retient aucun élément » et relit `[data-snap]` à chaque lecture, donc l'écran peut mourir et renaître sans casser l'observation.

    Valeur : lu par `watchSnap` · Source : SOCLE.md § « Le contrat d'un écran » · Statut : ratifié

### `fiche` et `stage` { #socle-fiche-vs-stage }

**`fiche` = la feuille de personnage · `stage` = la surface qui défile.**

??? note "Pourquoi, et depuis quand"
    mesuré — *« la feuille de Review héritait `position: absolute` et s'affichait dans une boîte de hauteur zéro »*. Eric appelle la surface qui défile « la fiche », et le français du dépôt le suit ; le CODE, non.

    Valeur : `src/tools/render-fiche.mjs` émet `<article class="fiche">` · Source : SOCLE.md § « Deux mots pour ne pas les confondre » (B0.21) · Statut : ratifié

### Pas de code mort { #socle-pas-de-code-mort }

**Une branche jamais parcourue est une branche jamais testée : le code mort est interdit (loi §0.6).**

??? note "Pourquoi, et depuis quand"
    « une branche jamais parcourue est une branche jamais testée » : c'est l'argument qui interdit la détection automatique du repli `transform` — elle doublerait le sens de chaque lecture géométrique du dépôt sans jamais être éprouvée.

    Source : NORMES.md § « 0 bis — Le repli désigné », 2026-08-30 · Statut : ratifié

### Le site n'a aucun compte { #socle-pas-de-compte }

**Le site n'a aucun compte : `login` et `pass` sont morts, remplacés par un nom de joueur libre et « Connecter mon coffre ».**

??? note "Pourquoi, et depuis quand"
    « Le site n'a AUCUN compte. » Un mot de passe qu'on ne stocke pas est un mot de passe qu'on ne peut pas perdre ; l'autorisation passe une fois par GitHub, « puis plus jamais ».

    Valeur : un écran `Authorize` chez GitHub → plus jamais · on stocke **un nom de joueur** et **des chemins**, jamais un login ni un mot de passe · Source : NORMES.md § « 9. LE SEUIL D'ENTRÉE », 2026-08-26 ; détail : `FH-WEB/FHPC/FHPCv2 hebergement donnees.md` · Statut : ratifié

## Le document et l'objet

### La source se cite, elle ne s'invente pas { #socle-la-source-cite-elle-ne-s-invente-pas }

**Une cote se change dans `tokens.css` ou `fiche.css`, et se RECOPIE ici avec sa date.**

??? note "Pourquoi, et depuis quand"
    *« Deux sources d'accord valent mieux qu'une source unique qu'on oublie de lire — mais elles se citent, elles ne s'inventent pas. »*

    Source : CADRES.md § « 9. CE QUE CE FICHIER N'EST PAS » · Statut : ratifié

### Une norme qui ne vit que dans un document n'existe pas { #socle-une-norme-qui-ne-vit-que-dans-un-document-n-existe-pas }

**Une norme qui ne vit que dans un document n'existe pas : elle se câble en défaut partagé, avec son garde.**

??? note "Pourquoi, et depuis quand"
    la décision du 26/08 sur `ABREGE_MAX` *« n'avait jamais été écrite ici — elle n'apparaissait que dans un mot d'une case de tableau, derrière un renvoi mort. Le vault la listait encore comme ouverte. »*

    Valeur : modèle — `--voile-simple` + `tests/decor.test.mjs` · `LISTE_PAR_PAGE` + `tests/listes.test.mjs` · Source : NORMES.md § « LE SEUIL D'ABRÉVIATION », 2026-08-26 · Statut : ratifié

### Une dette recopiée n'est pas vérifiée { #socle-une-dette-recopiee-n-est-pas-une-dette-verifiee }

**Une dette recopiée n'est pas une dette vérifiée.**

??? note "Pourquoi, et depuis quand"
    *« celle-ci a survécu à sa propre réparation parce que personne n'avait refait la mesure »*.

    Valeur : `.species-done` porte bien `--bouton-fond: var(--text-muted)` et le patron octogone — la ligne qui l'accusait de porter `--dalle-inter` était fausse · Source : NORMES.md § « 3 », remesuré 2026-08-26 · Statut : ratifié

### Corriger l'objet d'après le document { #socle-corriger-l-objet-d-apres-le-document }

**Corriger l'objet d'après le document, c'est prendre le document pour la mesure.**

??? note "Pourquoi, et depuis quand"
    *« L'objet est là depuis des semaines, Eric le regarde tous les jours ; le paragraphe, lui, n'avait jamais été remesuré. »*

    Valeur : la fiche d'espèce descendue à 35 % *« au motif que ce paragraphe l'exigeait »* · Source : NORMES.md § « 4 », 2026-08-26 · Statut : ratifié
