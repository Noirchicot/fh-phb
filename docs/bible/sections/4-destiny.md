# 4 · Destiny & Arcana

Ce que l'écran du tirage fait **autrement**. `8` règles, tirées des messages de commit du dépôt
`fhpc` (26 août → 2 septembre) — ⚠️ aucune n'est dans `NORMES.md`.

## Ce que cette étape fait autrement

### Deux dalles, deux offices { #destiny-deux-dalles-deux-offices }

**La dalle TAROT ne porte AUCUN autre bouton qu'elle-même ; c'est la dalle TEXTE qui porte la rangée, le Score, le `?` et le livre.**

??? note "Pourquoi, et depuis quand"
    ⭐ Le `?` et le livre étant eux-mêmes des boutons, la règle **se referme seule** : elle exclut par construction tout organe qu'on n'avait pas prévu, sans avoir à les nommer un par un. Et l'exception tient parce que la carte d'à côté reçoit ce que la carte tarot refuse — une carte montre, l'autre porte.

    Source : Eric, 2026-08-26 : *« la dalle TAROT ne porte AUCUN AUTRE bouton que le tarot. C'est la dalle TEXTE qui porte les éléments classiques. »*, puis *« le `?` et le livre SONT des boutons »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La carte de tarot est une exception argumentée { #destiny-carte-est-une-exception }

**La carte de tarot déroge à trois normes générales — pas d'octogone à coupe, pas de voile, pas de titre — et elle ne reçoit aucun organe posé.**

??? note "Pourquoi, et depuis quand"
    La carte **EST** l'objet : un octogone la découperait, un voile salirait l'illustration, et elle se nomme par son image puisque son texte vit sur la dalle d'à côté. ⛔ Le `?` y avait été appendu, ce qui faisait un bouton DANS un bouton : demander de l'aide **retournait la carte**.

    Source : Eric, 2026-08-26 : *« aucun bouton dans le fond »* · *« les normes peuvent avoir des exceptions, elles sont argumentées »* · *« tu as raison, le tarot est un bouton exception »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Trois temps, un final commun { #destiny-trois-temps-un-final }

**L'étape se joue en trois temps — l'écran d'ambiance à deux portes, la cérémonie plein écran, le catalogue des vingt-deux — puis un écran final qui est LE MÊME pour les deux branches.**

??? note "Pourquoi, et depuis quand"
    ⭐ Un seul rendu final pour deux chemins évite **deux vérités** sur ce que la carte a donné. Et le texte détaillé reste dans le cadre : la fenêtre de texte défile seule, la dalle ne déborde pas.

    Valeur : dalle `607` dans une scène de `607` (mesuré sur iPhone) · les vignettes du catalogue sont **des cartes**, le voyant d'état n'est jamais un bouton · Source : Eric, 2026-08-30 : *« oui des cartes »* · *« idem voyant dans species »* · Statut : ratifié, déployé, ⚠️ hors corpus

<!-- DESSIN À FAIRE — les deux branches de Destiny et leur écran final commun -->

### Les deux pieds propres refusent la paire de la coquille { #destiny-pieds-propres }

**Les deux écrans qui portent leur propre rangée — `Draw`/`Choose` et `I changed my mind`/`Next` — déclarent qu'ils n'ont pas de sortie, pour que la coquille n'en pose pas une seconde.**

??? note "Pourquoi, et depuis quand"
    Laisser la coquille poser sa paire donnerait **deux commandes pour un même geste**, à dix pixels l'une de l'autre — le doublon du 19/08.

    Valeur : `exists: false` · Source : ⚠️ **aucune citation d'Eric, aucune date** — la règle ne vit que dans un commentaire de `destiny-step.mjs` · Statut : déployé, ⏳ jamais ratifié

### Le titre du premier écran est centré { #destiny-titre-centre }

**Sur l'écran d'ambiance, le titre est CENTRÉ — exception nommée au rang où le titre est ferré à gauche — et une bande d'aiguilleur se pose juste au-dessus des boutons.**

??? note "Pourquoi, et depuis quand"
    Cet écran n'est pas un menu qu'on parcourt, c'est une **page de garde à deux portes** : son titre coiffe la dalle entière. Et la bande se lit au moment où l'on cherche la sortie, c'est-à-dire quand « et maintenant ? » se pose — ce qui est littéralement la question de cet écran. ⭐ Son mot est **méta** : il parle du builder, pas de Nymedes.

    Valeur : `8` blg au-dessus et en dessous, portés par le `gap` de la dalle et ⛔ jamais par une marge sur la bande · contenu `45` px pour un minimum de `45` — trois lignes pile · Source : Eric, 2026-09-02 : *« your major arcana centré »* · *« insère un bloc pour placer l'aiguilleur au dessus des boutons. marges sup et inf 8 blg »* · *« l'aiguilleur donne une explication plus meta de ce qui va se passer »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La carte se mesure en blg, contre le PANNEAU { #destiny-carte-mesuree-en-blg }

**La carte du tirage se mesure en blg contre la hauteur du panneau — jamais en unités de fenêtre — et le mélange et le gros plan portent la MÊME cote : `95 %`.**

??? note "Pourquoi, et depuis quand"
    Les deux cotes étaient écrites sur la **largeur**, en `vh` ; le rapport d'image les multipliait ensuite par 823/480, si bien qu'un « 74vh » posé sur la largeur d'une carte portrait valait `127 %` de la hauteur — la carte sortait par le haut **et** par le bas. ⛔ Et deux nœuds portant deux cotes différentes produisent un saut de `×1,85` qu'aucune transition n'adoucit, parce que l'un REMPLACE l'autre.

    Valeur : `88 %` au lot 140, porté à `95 %` au lot 141 — `532` blg de haut, `310,3` de large · Source : Eric, 2026-09-02 : *« tu connais les blg ? normalement c'est bon pour un écran c'est bon pour tous les écrans »*, puis sur la valeur : *« monte à ça — 0.95 »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La Destinée se lit à UN SEUL endroit { #destiny-une-seule-lecture }

**La Destinée d'une espèce se lit à un seul endroit, et cette lecture SOMME la base et le bonus de base ; la donnée ne porte jamais de total en dur.**

??? note "Pourquoi, et depuis quand"
    ⛔ Trois lectures ignoraient le bonus, et l'Elfe est **la seule des douze** à en porter un : la maladie était donc invisible sur onze espèces sur douze — c'est exactement pourquoi elle a survécu. L'écran se contredisait à l'œil : il affichait « Destiny : 2 » pendant que le trait juste dessous annonçait « a Destiny Base of 4 ». Et un `4` en dur ferait mentir la ligne du trait **et** divergerait du chapitre publié.

    Valeur : base `2` + bonus de base `+2` = `4` · Source : ⚠️ **aucune citation d'Eric** — le défaut a été mesuré à l'écran, 2026-09-02 · Statut : déployé, ⚠️ hors corpus, ⏳ jamais ratifié

### Le Score projeté, et ce qui est hors de portée { #destiny-score-projete }

**L'écran ne liste que les vibrations À PORTÉE, et le Score projeté ajoute l'impact d'une carte pas encore actée — celle-là seulement.**

??? note "Pourquoi, et depuis quand"
    Le socle calcule le reste du Score ; le projeté ne fait qu'**annoncer le delta** d'un choix non signé. Le Score ouvre le rang : ce qui est hors de portée n'a rien à faire à l'écran. ⭐ La relance est illimitée — rien n'est dépensé à regarder plus loin.

    Valeur : voile `35 %` · trois taps rapides résolvent là où un tap isolé ne fait rien · Source : ⚠️ **aucune citation d'Eric** — arbitrages rapportés sans verbatim, 2026-08-30 · Statut : déployé, ⚠️ hors corpus, ⏳ jamais ratifié
