# 8 · Equipment

L'étape la plus dense du builder, et la moins consignée : tout y a été tranché entre le 23 et le
27 août, déployé, puis jamais porté au corpus. Les `15` règles ci-dessous sont tirées des
**messages de commit** et du code du dépôt `fhpc` — ⚠️ elles ne sont **pas** dans `NORMES.md`.

⭐ **Chaque règle est une exception** : ce que cet écran fait autrement que la règle générale.
Ce qui vaut partout n'est pas répété ici.

## Ce que cette étape fait autrement

### L'entrée de l'étape est le dressing { #equipement-entree-est-le-dressing }

**L'étape s'ouvre sur le dressing (B3) et non sur le catalogue : `R` est un écran fils, qu'on atteint par le bouton `Equipment`.**

??? note "Pourquoi, et depuis quand"
    Le joueur arrive **déjà équipé** — le kit de sa classe est posé. Le premier écran doit donc montrer ce qu'il POSSÈDE, pas ce qu'il peut acheter : le catalogue devient un détour, plus la porte d'entrée. C'est l'arborescence inversée par rapport aux sept autres étapes.

    Valeur : `7` écrans, une seule vue visible à la fois (`vueEquipement`, défaut `"b3"`) · Source : Eric, 2026-08-24 : *« Inverse les positions de R et de B3. Fais le pipeline : les échanges à l'intérieur du personnage. Pas de groupe, pas de DM, pas de Craft, pas de Companions. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le dressing défile, en trois bandes { #equipement-trois-bandes }

**Le dressing est le seul écran de l'étape qui défile, et il défile par sa bande du milieu : le titre reste collé en haut, la barre de boutons collée en bas.**

??? note "Pourquoi, et depuis quand"
    C'est la **deuxième exception ratifiée** à « la page ne défile jamais » — la première est le Seuil. Le contenu du dressing grandit avec le personnage sans qu'aucun compte n'ait à se lire d'un coup d'œil. ⛔ Ce qui défile ne porte pas les organes fixes. ⚠️ Et le titre reste parce que **rien d'autre ne nomme B3** : il n'y a pas de tambour ici pour le faire.

    Valeur : mesuré au produit — défilement `250`, le titre bouge de `0,0` px, la barre de `0,0` px · la pièce des boîtes est de taille FIXE (`SCENE_PIECE` = `536`), c'est le flux qui coule autour · Source : Eric, 2026-08-26 : *« un dressing qui scrolle, des boutons fixes »*, puis *« laisse le titre dans le dressing aussi »* · Statut : ratifié, déployé, ⚠️ hors corpus

<!-- DESSIN À FAIRE — les trois bandes du dressing : ce qui reste collé, ce qui coule -->

### `R` ne montre jamais le personnage { #equipement-r-ne-montre-pas-le-personnage }

**L'écran `R` ne montre que le catalogue : le sac, l'AC, la bourse et les lignes d'équipement vivent en B1/B2/B3, jamais ici.**

??? note "Pourquoi, et depuis quand"
    La coupe du 23/08 a retiré de `R` la barre du haut, le sac, l'AC, la phrase de classe, le chercheur et la bourse. ⭐ La preuve que la coupe est franche n'est pas un dessin : `renderEquipmentStep` **ne lit même plus** `document` ni `resolved` pour peindre `R`.

    Valeur : `8` sélecteurs nommés, interdits de retour par un garde · Source : Eric, 2026-08-23 : *« dégage tout ce que je vois à l'écran, tu recableras après »* · *« sauf le background »* · *« dégage search »* (dit deux fois) · Statut : ratifié, déployé, ⚠️ hors corpus

### Le tambour a deux étages, et son chevron est dedans { #equipement-tambour-deux-etages }

**Le catalogue se parcourt par un tambour à DEUX étages — rayon puis étagère — et son chevron est un trait posé DANS le tambour, pas un bouton à côté.**

??? note "Pourquoi, et depuis quand"
    *« Un bouton à côté dit « appuie ICI pour agir sur ça » — deux objets, deux gestes à apprendre. Un trait sur le bord dit « ça continue par là », et ce qu'on clique est le mot qu'on veut. »* Eric a retiré ces flèches **deux fois en neuf jours**.

    Valeur : chevrons-boutons `0` · le trait fait `8` px à `0,28` d'opacité, `pointer-events: none` · le cran mesure `48` (au-dessus de `--touch`) et se centre à `−0,02` px du centre de la piste · Source : Eric, 2026-08-24 : *« enlève les chevrons du haut à côté des tambours, ça fait trop moche »*, puis *« tu peux dessiner un chevron subtil à l'intérieur du tambour, vraiment sur le bord, pour inciter au clic, mais un trait très léger »* · Statut : ratifié, déployé, ⚠️ hors corpus

<!-- DESSIN À FAIRE — le tambour à deux étages : rayon, étagère, et le trait sur le bord -->

### Les deux étages lisent le rangement d'Eric { #equipement-rangement-d-eric }

**Les deux étages du tambour lisent le rangement d'Eric tel quel : l'écran n'invente jamais son propre découpage, et le premier niveau ne montre aucun genre de données.**

??? note "Pourquoi, et depuis quand"
    « Armor · Gear · Item · Weapon » étaient des **genres**, pas des rayons. Le rangement d'Eric existait déjà en amont et n'était pas importé ; en le lisant, `Wondrous Item 127` et `Gear 82` tombent **sans une ligne de découpage**. ⛔ Une catégorie manquante est un chantier de données, jamais un correctif d'écran.

    Valeur : cible d'Eric « moins de `35` » par étagère — la plus grosse mesurée fait `33` · `6` rayons, `26` étagères, `414` objets atteignables, médiane `15` · Source : Eric, 2026-08-24 : *« je devais pas voir armor au premier niveau, elles sont notées, on les respecte »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La cible dit l'intention { #equipement-cible-dit-l-intention }

**Sur la grille du catalogue, le tap ouvre la fiche et le glisser exécute l'acte du collecteur visé — et lâcher à vide ne fait RIEN.**

??? note "Pourquoi, et depuis quand"
    C'est la cible, pas le geste, qui porte le sens : `SHOPPING LIST` met au panier en sautant la fiche, `TO GEAR DROP` passe par la fiche, `CRAFT DROP` accuse réception et rien de plus. ⛔ Le clic n'ajoute plus de ligne — c'était l'action d'attente d'avant B1, et B1 existe maintenant.

    Valeur : seuil tap/glisser = `6` px · le collecteur qui reçoit s'allume `900` ms (`data-recu`) · Source : Eric, 2026-08-23 : *« y'a pas besoin d'œil ; par un clic, la page B1 s'affiche en FF »*, et sur le dépôt direct : *« on saute B1 »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le panier est une liste de courses { #equipement-panier-liste-de-courses }

**Le panier vit au personnage et non au navigateur : il survit au rechargement, `BACK` le laisse intact, `CANCEL` le vide, et `BUY` paie UNE FOIS pour la liste entière.**

??? note "Pourquoi, et depuis quand"
    Un panier est une décision de personnage comme les autres — donc `cart[N]` **du document**, jamais un état de module : deux écritures d'une même liste divergent au premier geste. ⚠️ Et le prix n'est **jamais** stocké : seule la référence vit au document, le record habille à l'écran.

    Valeur : `cart[N]` / `.quantity` / `.gratuit` mesurés avant écriture — zéro violation · attaque « bourse vide » : rien n'est écrit · Source : Eric, vault : *« SHOPPING LIST et CART sont la même chose vue de deux endroits »* ; `CANCEL` par la loi du 2026-08-20 : *« back n'efface pas ; pour effacer, c'est cancel »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Trois lieux, une seule rangée d'échange { #equipement-trois-lieux }

**Un objet circule entre trois lieux — porté, sac, remise — par une seule et même rangée d'échange, réemployée à l'identique par le dressing et par les sous-écrans.**

??? note "Pourquoi, et depuis quand"
    Un seul geste d'échange, donc **une seule écriture** (`rangeeEchange`) : la rangée montre le nom, les deux destinations qui ne sont pas la sienne, et `DROP`. La remise est la plaque tournante des échanges.

    Valeur : `location` ∈ `self` · `backpack` · `storage` — une ligne sans `location` est lue « backpack » : ⛔ rien n'est « porté » sans geste · Source : Eric, 2026-08-24 : *« Fais le pipeline : les échanges à l'intérieur du personnage. »* · Statut : ratifié, déployé, ⚠️ hors corpus

<!-- DESSIN À FAIRE — les trois lieux et la rangée d'échange : porté, sac, remise -->

### L'arbitre du portage { #equipement-arbitre-du-portage }

**Quand un objet part vers le corps, il prend son emplacement s'il est libre, sinon une poche, sinon le sac — et l'arbitrage se fait au moment du GESTE, jamais au rendu.**

??? note "Pourquoi, et depuis quand"
    Un rendu n'écrit jamais : c'est donc l'action (`addGearLine`/`moveGearLine` vers `self`) qui est **requalifiée** en `backpack` quand plus aucune boîte n'est libre. ⭐ Ainsi une ligne n'est jamais perdue faute de place.

    Valeur : `10` emplacements donnés par la couche → `17` boîtes · `4` poches de débord, communes à TOUS les emplacements · Source : Eric, 2026-08-24 : *« si c'est libre l'item prend son slot, sinon Pocket, sinon backpack »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le destinataire par défaut dépend de la quantité { #equipement-send-to-defaut }

**Un objet seul s'envoie par défaut à son emplacement ; une LISTE s'envoie par défaut au sac.**

??? note "Pourquoi, et depuis quand"
    Un panier se range, il ne s'équipe pas d'un bloc. Un objet isolé, lui, a un destinataire pertinent : son emplacement.

    Source : Eric, 2026-08-24 : *« Normalement t'as un destinataire à fixer ; si aucun destinataire ça va dans backpack — surtout si c'est un panier. Un item individuel, si pas de choix pertinent, ça peut aller au slot approprié, pockets, backpack. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le départ : le kit de classe, ou la bourse { #equipement-depart-kit-ou-bourse }

**L'étape s'ouvre sur un aiguilleur qui EXIGE une réponse — garder le kit de classe, ou le mettre de côté contre `50` PO — et cette réponse vit au personnage, pas au navigateur.**

⚠️ En contradiction avec la lecture additive du 13/08 — voir [C22](../a-trancher.md#c22).

??? note "Pourquoi, et depuis quand"
    Un objet qui exige une réponse **et** écrit au document n'est pas un guide (un guide est optionnel, on le congédie) : c'est une **décision**. Et c'est un popup par-dessus la scène, jamais un bloc dans le flux, qui pousserait le dressing sous le pli. ⛔ Défaut mesuré au passage : l'ancienne clef de navigateur `fhpc.guide.equipement-vu` ratait le second personnage du même navigateur.

    Valeur : `50` PO (`INHERITED_PURSE_GP`, nommé une seule fois) · Source : Eric, 2026-08-24 : *« la fenêtre doit lui dire qu'il a son équipement ou 50 po à débourser, elle vient même tutoriel éteint »*, puis 2026-08-26 : *« c'est plutôt un aiguilleur, on a TOUJOURS besoin de lui »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La bourse a quatre monnaies { #equipement-bourse-quatre-monnaies }

**La bourse porte `4` monnaies — pp, gp, sp, cp — et l'écran ne fait jamais de change automatique entre elles.**

??? note "Pourquoi, et depuis quand"
    Le SRD n'a jamais eu d'electrum, et `CURRENCY_KEYS` du moteur n'en porte pas : écrire une cinquième colonne ferait diverger l'écran du moteur. ⭐ Et le change est un acte de table, pas d'écran — si une pile manque, l'écran refuse et laisse le joueur ajuster sa bourse lui-même.

    Valeur : `4` clefs · taux d'**affichage** seulement (1 pp = 10 gp · 1 gp = 10 sp · 1 sp = 10 cp) pour le « Total in GP » · plancher zéro, entrée non numérique refusée sans rien écrire · Source : Eric, 2026-08-24 : *« j'ai fait une erreur sur la monnaie, pas d'electrum lol »* · Statut : ratifié, déployé, ⚠️ hors corpus

### L'écran ne juge rien { #equipement-aucune-regle-de-jeu }

**L'Équipement ne porte aucune règle de jeu : le poids se compte et s'affiche sans jamais être jugé, et le seul refus possible est « la bourse n'a pas assez ».**

??? note "Pourquoi, et depuis quand"
    L'écran affiche, le moteur prononce : ni capacité, ni seuil, ni encombrement, ni rouge. ⭐ Et un objet sans prix ou sans poids montre `—`, jamais `0` : **une absence n'est pas un zéro**, l'écran doit dire l'absence au lieu de la combler.

    Valeur : `0` des `258` objets magiques porte un prix, `0` porte un poids · la soustraction de paiement refuse de produire un négatif — ⛔ jamais de bourse à moitié débitée · Source : ⚠️ **aucune citation d'Eric** — la loi est écrite par le siège en tête du pipeline · Statut : déployé, ⚠️ hors corpus, ⏳ jamais ratifié par Eric

### La déviation du « 15 par page » { #equipement-deviation-du-quinze }

**Ce chapitre dévie du « 15 par page » du site : les écrans qui ne défilent pas tiennent `5`, `4` ou `7` lignes selon leur budget de hauteur mesuré.**

??? note "Pourquoi, et depuis quand"
    Ces écrans ne défilent pas, contrairement au dressing : leur nombre de lignes est **déduit** d'un budget de hauteur, jamais choisi. ⭐ Le lot qui l'a mesuré s'est contredit lui-même — *« mes intuitions d'avant-hier (4 et 8) étaient toutes deux fausses »*.

    Valeur : fenêtre `553` — B2 et l'envoi de liste : rangée 54+4, chrome 50+203, budget ~`290` → `5` · le sac et la remise : chrome 221+44, budget ~`278` → `4` · la recherche : rangée 48+4, chrome 102+44, budget ~`397` → `7` · Source : ⚠️ **aucune citation d'Eric** — la déviation est portée par la mesure · Statut : déployé, ⚠️ hors corpus, ⏳ jamais ratifié par Eric

### Un seul repère, posé à la main { #equipement-repere-unique }

**Le dressing est dessiné dans UN seul repère de `1000 × 1600`, et ses ancrages sont posés à la main par Eric puis figés : aucune position n'est calculée.**

??? note "Pourquoi, et depuis quand"
    Trois cotes justes posées en pixels étaient mortes dans la nuit du 23 au 24/08 : **un pixel n'est pas une adresse portable**. Un repère unique fait que rien ne peut dériver par rapport à rien — et remplacer la silhouette de substitution ne déplacera aucun ancrage, puisqu'ils vivent dans le repère et non sur l'image. ⛔ Contre-exemple mesuré : le tambour et la grille calculaient chacun leur largeur → `2,5` px d'écart visible.

    Valeur : `viewBox` 1000 × 1600, ratio `0,625`, coordonnées **arrondies à l'entier** (une unité = un millième de la hauteur) · corps en filigrane à `1,2` · la scène est FIXE en px CSS : elle se centre, elle ne se dilate pas · Source : Eric, 2026-08-24 : *« je veux que tout soit placé au pixel près sur ce B3 et que rien ne bouge d'un écran à l'autre, comment on fait ? »*, puis *« dessinons un système de coordonnées »* · Statut : ratifié, déployé, ⚠️ hors corpus
