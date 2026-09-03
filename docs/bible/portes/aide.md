# L'aide — le `?`

Le `?` est la porte du guide. C'est le seul organe dont l'emplacement est écrit deux fois, en deux
endroits différents — voir [C1](../a-trancher.md#c1).

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### L'aspect du `?` { #aide-aspect }

**Le `?` est plein en parchemin quand le guide n'a jamais été vu, un simple cercle quand il l'a été.**

??? note "Pourquoi, et depuis quand"
    *« C'est la loi du voyant de la ceinture, appliquée à un autre organe : plein = il y a quelque chose pour toi, contour = tu l'as lu, je reste là. »* Le vert avait été envisagé puis écarté : *« dans l'échelle il dit « fini », ce qui est l'inverse de « jamais vu » »*. ⛔ Et ça ne crie pas : *« un `?` en couleur de signal réclamerait l'attention qu'il a précisément le droit de ne pas prendre »*.

    Valeur : rond de **22 px** · ⛔ aucune couleur de l'échelle · Source : NORMES.md § « SON ASPECT », Eric 2026-08-26 : *« le `?` en parchemin quand jamais vu, juste un cercle quand consommé »* · Statut : ratifié

<!-- DESSIN À FAIRE — les deux aspects du `?` — plein en parchemin jamais vu, simple cercle une fois lu -->

## Mesures

**Aucune règle de mesure consignée sur cette page.** ⚠️ La cote du `?` existe, mais elle est écrite sur un AUTRE organe : [`livre.jumelle-gauche-du-question`](livre.md#livre-jumelle-gauche-du-question) (« un rond de `22` px, à la cote exacte du `?` ») et [`budget.gabarit-b-non-negociable`](../general/budget.md#budget-gabarit-b-non-negociable) (« le `?` et le livre : `22` dans `44` »).

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Le `?` en bas à droite { #aide-bas-a-droite }

**Le `?` est en bas à droite, fixe, sur la dalle — jamais dans la marge.**

⚠️ En contradiction avec [`cadre.question-en-haut-a-droite`](#cadre-question-en-haut-a-droite) · [`aide.entre-dans-la-rangee`](#aide-entre-dans-la-rangee) — voir [C1](../a-trancher.md#c1).

??? note "Pourquoi, et depuis quand"
    « un rappel qui défile n'est plus un rappel » (§1 sexies) : sur un écran qui défile, le `?` est collé en bas à droite, hors du flux. Et il est « sur la dalle », jamais dans la marge (§1 bis).

    Valeur : `--touch` 44 ne cède **jamais** · Source : NORMES.md § « Le `?` — le rappel permanent », 2026-08-26 · Statut : ⚠️ **contredit** `cadre.question-en-haut-a-droite` — voir [C1](../a-trancher.md#c1)

### Le `?` en haut à droite { #cadre-question-en-haut-a-droite }

**Le `?` est sur la dalle, tout à droite, au même niveau que le titre.**

⚠️ En contradiction avec [`aide.bas-a-droite`](#aide-bas-a-droite) · [`aide.entre-dans-la-rangee`](#aide-entre-dans-la-rangee) — voir [C1](../a-trancher.md#c1).

??? note "Pourquoi, et depuis quand"
    Eric, après l'avoir vu à gauche : *« le ? est sur la dalle tout à droite au même niveau que le titre »*. Il est **posé par la coquille**, une fois, sur toutes les étapes — *« jamais par un écran, qui pourrait l'oublier »*. C'est le filet de sécurité de `Turn tutorials off` : *« sans lui ce bouton serait irréversible »*.

    Valeur : le coin haut-droit lui appartient · Source : CADRES.md § « 2 quinquies », Eric 2026-08-19 · Statut : ⚠️ **contredit** par `aide.bas-a-droite` (NORMES, 26/08) — voir [C1](../a-trancher.md#c1)

### Le `?` entre dans la rangée { #aide-entre-dans-la-rangee }

**Le `?` entre dans la rangée de boutons, collé à droite, et il ne participe pas au centrage.**

⚠️ En contradiction avec [`cadre.question-en-haut-a-droite`](#cadre-question-en-haut-a-droite) · [`aide.bas-a-droite`](#aide-bas-a-droite) — voir [C1](../a-trancher.md#c1).

??? note "Pourquoi, et depuis quand"
    « il n'entre pas en conflit avec le centrage des boutons, il sera toujours collé à droite » (Eric) — la rangée réserve une colonne de `--touch` de chaque côté et les boutons se centrent sur ce qui reste. ⛔ `--touch` 44 ne cède jamais.

    Valeur : colonne réservée de `--touch` · Source : NORMES.md § « Le `?` », tranché 2026-08-26 — Eric : *« il n'entre pas en conflit avec le centrage des boutons, il sera toujours collé à droite »* · Statut : ratifié

### Le cycle de vie du `?` { #aide-cycle-de-vie }

**Le `?` apparaît de base, propose systématiquement d'être désactivé totalement, un `ok` le fait partir pour cette fois, il revient à chaque nouveau personnage sauf désactivation, et la réactivation est toujours possible.**

??? note "Pourquoi, et depuis quand"
    *« Le `?` est ce qui autorise le guide à disparaître : on ne ferme franchement une aide que si l'on sait la retrouver. »* *« La seconde est la seule qui survit au personnage suivant. »*

    Valeur : deux sorties distinctes — `ok` = « pas maintenant » · désactivation = « plus jamais, et c'est dans le menu » · Source : NORMES.md § « Le `?` », 2026-08-26 · Statut : ratifié

### Borné aux écrans qui ont un guide { #aide-borne-aux-ecrans-qui-ont-un-guide }

**Le `?` n'apparaît que sur les écrans qui ONT un guide.**

??? note "Pourquoi, et depuis quand"
    *« Un `?` qui n'ouvre rien apprend à ne plus le regarder. »*

    Source : NORMES.md § « Le `?` », 2026-08-26 · Statut : ratifié
