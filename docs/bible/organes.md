# Les organes

Cette page attend le reste de son contenu (lot Bible, 2026-09-02) — trois règles y sont déjà
posées, à titre d'exemple du format, prises telles quelles dans `NORMES.md` du dépôt `fhpc`.

### La cote du jeton { #jeton-cote }

**Un jeton mesure 87 × 48 px (`--glisse-case` × `--glisse-h`), rayon 16 (`--organe-rayon`).**

??? note "Pourquoi, et depuis quand"
    Ratifié le 2026-08-26 : *« les +1 / +2 / +x sont des tokens »* · *« tous les tokens et
    leurs collecteurs, taille standard »* · *« Identity : taille token = taille collecteur ! »*
    À 360 px de largeur de référence, la rangée offre 278 ; trois jetons plus deux gouttières de
    8 font 277 (3 × 87 + 2 × 8). Il ne reste qu'un pixel — un de plus et la rangée retombe à deux
    jetons par ligne, ce qui casse « trois colonnes, toujours ». Le jeton et son gabarit sont
    déclarés **sacrés** le même jour : sur un écran qui déborde, ce sont les écarts qui cèdent,
    jamais l'organe.
    Source : `NORMES.md`, « LA TAILLE STANDARD — le token ET son collecteur » et « LES JETONS ET
    LES BOUTONS SONT SACRÉS ».

### La cote du collecteur { #collecteur-cote }

**Un collecteur = un jeton en taille. Ne varie jamais — et les deux lisent le même jeton de
mesure, pas deux nombres égaux.**

??? note "Pourquoi, et depuis quand"
    Dicté le 2026-08-29 : *« taille du collecteur toujours la même que le jeton, partout — règle
    à faire respecter sur tout le site »*, puis *« règle universelle : un collecteur = un jeton en
    taille. Ne varie jamais. »* La cote ne s'écrit nulle part deux fois : elle se déduit du cadre
    une seule fois (`--collecteur-case`, déclarée sur `.choix-glisse`), et les deux organes la
    lisent. Trois façons de la faire diverger ont été commises et mesurées : deux `87px` écrits
    séparément (le premier qui bouge laisse l'autre derrière), un jeton en `flex: 0 1` qui s'écrase
    sur son contenu (10 px rendus contre 74 attendus), et une cote en `%` qui se résout chez celui
    qui l'utilise plutôt que sur l'ancêtre commun (63 px contre 74 selon le côté). La cote se
    déclare donc sur l'ancêtre commun des deux organes, en `flex: 0 0` — jamais `0 1`.
    Source : `NORMES.md`, « UN COLLECTEUR ET SON JETON ONT UNE SEULE COTE ». Garde :
    `tests/collecteur-jeton.test.mjs`.

### La hauteur d'un bouton { #bouton-hauteur }

**Un bouton à un étage mesure 44 (`--touch`) — le texte n'en demande que ~33, c'est la cible
tactile qui décide, jamais le dessin.**

??? note "Pourquoi, et depuis quand"
    Extrapolé et ratifié le 2026-08-26, sur la même rangée de 278 et la même gouttière de 8 que
    le jeton : un petit bouton (`NEXT` / `DONE` / `BACK` / `CANCEL`, trois par ligne) fait
    **87 — exactement la largeur d'un jeton**. Boutons et jetons se déduisent de la même grille et
    partagent le même statut « sacré » : *« les jetons et les boutons sont sacrés, on les laisse
    en paix. »* Sur la hauteur, la typographie n'atteint jamais 44 (elle n'en demande qu'environ
    33) — c'est le plancher tactile qui gouverne, jamais le contenu : *« un contrôle ne se laisse
    jamais dimensionner par un dessin. »* La même loi vaut pour les boutons `+` / `−` : le dessin
    le plus petit possible, la cible toujours au minimum tactile.
    Source : `NORMES.md`, « LES COTES DES BOUTONS » et « LES JETONS ET LES BOUTONS SONT SACRÉS ».
