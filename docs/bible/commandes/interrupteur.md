# L'interrupteur

L'interrupteur est un `on/off` — un organe distinct du bouton, en deux espèces : le sélecteur
exclusif et la bascule simple.

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### Le sélecteur exclusif ne porte aucune couleur { #interrupteur-selecteur-sans-couleur }

**Le sélecteur exclusif ne porte AUCUNE couleur : l'allumé se dit par la position du pouce et l'encre pleine.**

??? note "Pourquoi, et depuis quand"
    *« un organe qui n'emprunte aucune couleur ne peut pas contredire une échelle de couleurs. La formulation d'Eric du 17/08 — « un état, pas deux actions » — avait nommé le problème neuf jours avant qu'il n'apparaisse. »* **Deux canaux, pas un.**

    Valeur : `shell.css:803` · `aria-pressed` le dit une troisième fois · Source : NORMES.md § « SA RÈGLE DE DESSIN », décision d'Eric du 2026-08-17 citée dans `shell.css:792` : *« SRD et SRD + FH sont des sélecteurs, PAS des boutons… quand l'un s'allume, l'autre s'éteint »* · Statut : ratifié — le 17/08 survit ici alors qu'il est renversé pour `Back`/`Done`

### La piste et le pouce sont dessinés { #interrupteur-dessine-jamais-un-glyphe }

**La piste et le pouce sont DESSINÉS, jamais un glyphe.**

??? note "Pourquoi, et depuis quand"
    *« un glyphe change de forme selon la police installée »*. ⛔ Il ne porte aucun mot : *« son nom vient du texte à sa gauche »*.

    Valeur : ligne **44** · piste **44 × 24** en `--radius-pill` · pouce **18 × 18** · écrivain unique `markPressed`, garde `tests/aria-pressed-guard.test.mjs` · Source : NORMES.md § « SA RÈGLE DE DESSIN », 2026-08-26 · Statut : ratifié

## Mesures

*ses cotes, et ce qui les calcule.*

### La bascule simple { #interrupteur-bascule-simple }

**La bascule simple garde son bouton : 72 × 44, rayon 8, libellé `On`/`Off`, liseré vert allumé.**

??? note "Pourquoi, et depuis quand"
    *« un « éteint » n'est pas un « pas bon » »*.

    Valeur : 72 × 44 (cote du 19/08) · ⛔ le rouge de la dictée est **supprimé** · Source : NORMES.md § « LA BASCULE SIMPLE GARDE SON BOUTON », Eric 2026-08-26 : *« bouton On/Off (19/08, 72 × 44, liseré vert) »*, puis l'objection du vert posée : *« a »* — on l'assume · Statut : ratifié

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Un `on/off` n'est pas un bouton { #interrupteur-n-est-pas-un-bouton }

**Un `on/off` n'est pas un bouton : c'est un organe distinct, au même titre que le jeton ou le collecteur.**

??? note "Pourquoi, et depuis quand"
    *« La raison est mécanique, pas esthétique : les quatre couleurs sont une ÉCHELLE D'AVANCEMENT — et un interrupteur ne la parcourt pas. Il n'est ni « en cours » ni « fini » : il est dans une position, et il y reste. Son rouge ne dit pas « c'est faux », il dit « c'est éteint ». »* ➡️ *« Deux sens du rouge sur le même écran, c'est un rouge qui ne signale plus rien. »* La collision se règle par la FORME.

    Source : NORMES.md § « L'INTERRUPTEUR — un organe à part entière », Eric 2026-08-26 : *« les boutons on/off, il y en a plein dans le menu »* · *« on/off interrupteur, oui »* · Statut : ratifié

### Les deux espèces d'interrupteur { #interrupteur-deux-especes }

**Il y a deux espèces d'interrupteur : le sélecteur exclusif et la bascule simple.**

??? note "Pourquoi, et depuis quand"
    « et une seule pose une question » : le sélecteur exclusif conditionne l'éteinte de l'autre ligne, la bascule simple n'a qu'un état. ⭐ Les deux espèces divergent aussi par le dessin, « et c'est cette divergence qui les rend reconnaissables ».

    Valeur : sélecteur exclusif = `Langue` fr/en, `Unités` impérial/métrique, `SRD`/`SRD+FH` · bascule simple = l'activation du guide · Source : NORMES.md § « DEUX ESPÈCES D'INTERRUPTEUR », Eric 2026-08-26 : *« certains s'allument et conditionnent l'éteinte de l'autre : langues, impérial/métrique »* · Statut : ratifié

<!-- DESSIN À FAIRE — les deux espèces dessinées — le sélecteur exclusif (piste et pouce, aucune couleur) et la bascule simple 72 × 44 -->

### Les trois sens du vert { #interrupteur-trois-sens-du-vert }

**Le vert porte trois sens, et c'est le PORTEUR qui les sépare : « fini » sur un bouton, « en marche » sur un On/Off, « vivant » sur une pastille de coffre.**

??? note "Pourquoi, et depuis quand"
    *« Un bouton qu'on appuie · un interrupteur qu'on bascule · un point qu'on ne touche pas. ⛔ Ne jamais « corriger » l'un d'après un autre : ils ne dérivent pas de la même source et n'ont aucune raison de converger. »* ⛔ *« Un lot ne doit JAMAIS dériver l'état d'un On/Off de la même source que la couleur d'un bouton de parcours. »*

    Source : NORMES.md § « LA BASCULE SIMPLE » + § « LE TROISIÈME SENS DU VERT », tranchés 2026-08-26 · Statut : ratifié
