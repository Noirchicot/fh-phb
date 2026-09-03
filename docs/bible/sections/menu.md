# Le Menu

Ce que l'écran d'entrée fait **autrement**. `7` règles, tirées des messages de commit et du code
du dépôt `fhpc` — ⚠️ aucune n'est dans `NORMES.md`.

## Ce que cet écran fait autrement

### Le jeu de règles se choisit à l'interrupteur { #menu-regles-au-selecteur }

**Les deux jeux de règles sont deux sélecteurs exclusifs, l'un au-dessus de l'autre — jamais deux boutons côte à côte — et cliquer la ligne déjà allumée ne fait rien.**

??? note "Pourquoi, et depuis quand"
    Deux pastilles côte à côte se lisent comme **deux actions** ; deux lignes à bascule se lisent comme un **état**, ce qu'elles sont. ⛔ Le code tient l'exclusivité au lieu de l'espérer : sans le test, un second clic relancerait la confirmation de bascule pour un changement qui n'a pas lieu, et rien ne peut éteindre les deux — le personnage resterait sans pile.

    Valeur : `2` lignes · Source : Eric, 2026-08-17 : *« SRD et SRD + FH sont des sélecteurs, pas des boutons. Mets-les en texte l'un au-dessus de l'autre avec un bouton on/off ; quand l'un s'allume, l'autre s'éteint »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le Menu est l'endroit où l'on rallume le tutoriel { #menu-rallume-le-tutoriel }

**Le Menu est le lieu nommé où l'on rallume le tutoriel qu'une extinction a coupé partout.**

??? note "Pourquoi, et depuis quand"
    Le bouton d'extinction agit depuis **n'importe quelle** dalle ; il fallait donc un lieu fixe pour le rallumer, autrement qu'en cherchant un `?` dans un coin. ⭐ Le drapeau n'est pas une donnée de personnage : l'écran ne fait que recevoir l'état et rendre un geste.

    Source : Eric, 2026-08-19 : *« Il est possible de on/off le tutoriel dans le menu. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Un réglage impossible reste visible, éteint, avec sa raison { #menu-reglage-impossible-reste-visible }

**Un réglage que la fenêtre ne peut pas honorer reste PRÉSENT dans le Menu — éteint, grisé, avec la note qui dit pourquoi il dort. Il n'est jamais caché.**

??? note "Pourquoi, et depuis quand"
    Un réglage qui disparaît laisse croire qu'il n'existe pas, et le joueur ne saura jamais qu'agrandir sa fenêtre le lui rend. ⭐ Le grisé seul dirait « éteint » ; c'est **la note** qui dit « pas ici ».

    Valeur : `758 × 560` px — la fenêtre au-dessous de laquelle l'interrupteur du double affichage dort · Source : Eric, 2026-09-02 : *« accessible depuis le Menu »*, le second panneau étant *« par défaut Menu, mais configurable »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le Menu dit l'état de la sauvegarde, et n'offre pas de « nouveau personnage » { #menu-dit-la-sauvegarde }

**Le Menu dit toujours l'état de la sauvegarde, dans les deux sens, et il n'offre aucun bouton « nouveau personnage ».**

??? note "Pourquoi, et depuis quand"
    Le builder garde le personnage tout seul, sans bouton ni message : **une sauvegarde qu'on ne voit pas est une sauvegarde en laquelle on ne peut pas avoir confiance** — le jour où elle échoue (mode privé, quota plein), le joueur travaillerait des heures en croyant être gardé. ⛔ Et il n'y a pas de « recommencer » parce qu'il n'existe **aucun personnage vierge** : le builder naît d'un personnage d'exemple, donc le bouton rendrait un Magicien tout fait — une porte qui ment.

    Source : Eric, 2026-08-20 : *« Un perso est enregistré dans le navigateur de tout le monde, et disparaît s'il n'est pas enregistré s'il y a un reset. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Les fonds sont des collections commutables { #menu-fonds-sont-des-collections }

**Les fonds sont des collections jour/nuit stockées côte à côte et commutables depuis le Menu — et une collection de plus n'entre que par la DONNÉE, sans une ligne de code.**

??? note "Pourquoi, et depuis quand"
    Écraser la paire en place aurait détruit la collection qu'Eric veut pouvoir rappeler. ⭐ La promesse a été mise à l'épreuve au lot suivant : la troisième paire est entrée en `2` JPEG + `1` entrée de collection + `2` entrées de fichiers, sans toucher un seul module.

    Valeur : `3` collections · `0` ligne de code à l'ajout · Source : Eric, 2026-09-02 : *« On a déjà deux collections jour nuit, nous en aurons une 3e. Tu vas les stocker pour qu'on puisse les changer dans le menu. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Display est un rang B du Menu { #menu-display-est-un-rang-b }

**`Display` est une branche du Menu au rang `B` — ⛔ `S` n'est un rang dans aucune nomenclature — elle prend des listes déroulantes, et ce qui y descend est ce qu'on règle une fois et qu'on ne relit pas.**

??? note "Pourquoi, et depuis quand"
    L'écran d'entrée doit d'abord dire les RÈGLES et où vit le personnage : le fond et le cran d'interface l'encombraient. ⭐ Une liste de trois lignes à piste et pouce occupait `132` px pour un choix qu'on fait une fois ; une liste déroulante en occupe `44`, dans l'écran qui lui est consacré. ⛔ Et la porte est là même si le registre des fonds n'a pas chargé — une porte qui apparaîtrait en cours de route serait pire qu'une porte qui attend. ⚠️ La rampe d'interface avait été **retirée** du Menu le même jour, l'auto la rendant obsolète ; elle revient sous `Display` parce que le réglage manuel AGRANDIT désormais — `549 × 820` choisis à la main contre `472 × 705` en auto.

    Valeur : `132` px → `44` px · `7` crans, `3` fonds · l'auto reste le DÉFAUT, le joueur surcharge et peut y revenir · Source : Eric, 2026-09-02 : *« Menu peut avoir une branche S, on y va via un bouton Display. Toutes les résolutions en drop down. Les backgrounds en drop down. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Les deux bouts de la ceinture sont opaques { #menu-onglet-opaque }

**Les onglets `Menu` et `Sheet` sont peints à `100 %` d'opacité, parce que ni l'un ni l'autre n'est une étape.**

??? note "Pourquoi, et depuis quand"
    Les tuiles d'étape portent le voile de l'avancement ; ces deux-là ne parcourent aucune progression. ⭐ L'opacité le dit sans un mot.

    Valeur : `100 %` · Source : Eric, 2026-09-02 : *« mets le voile à 100 % pour menu et sheet »* · Statut : ratifié, déployé, ⚠️ hors corpus
