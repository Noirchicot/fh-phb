# Le chevron

Le chevron est **un seul objet à deux rôles** : il amorce le défilement, et il fait naviguer dans
une liste paginée. Il coûte `96` px de largeur à la rangée qui le porte.

## Design

**Aucune règle de dessin consignée.** La seule description qui existe est un relevé de code en écart avec la norme — [`chevron.ecart-avec-le-code`](#chevron-ecart-avec-le-code).

## Mesures

*ses cotes, et ce qui les calcule.*

### Le coût en largeur : 96 { #chevron-cout-en-largeur }

**Une paire de chevrons coûte 96 px de largeur à la rangée.**

??? note "Pourquoi, et depuis quand"
    c'est ce qui fait tomber la case de 87 à 62 dans un vivier paginé.

    Valeur : `2 × --touch + 2 × --sp-4` = 96 · Source : NORMES.md § « 1 quater », mesuré par le lot A 2026-08-26 · Statut : ratifié

### L'écart du chevron avec le code { #chevron-ecart-avec-le-code }

⏳ **À trancher.**

**Le code du 15/08 pose `.stage-chevrons` en haut et en bas, en 36 × 14, non tactile.**

⚠️ En contradiction avec [`chevron.gauche-et-droite`](#chevron-gauche-et-droite) — voir [C6](../a-trancher.md#c6).

??? note "Pourquoi, et depuis quand"
    la cote et le refus du 44 *« datent d'un objet qui n'était QU'une amorce — une amorce redondante avec le geste de défilement, pas un contrôle »*. ⏳ *« à revérifier maintenant qu'il devient aussi un contrôle de pagination »*.

    Valeur : `position: absolute; inset: 0` · 36 × 14 · refus du `--touch` 44 · Source : NORMES.md § « LES CHEVRONS — écart mesuré », 2026-08-26 · Statut : à trancher

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Un objet, deux rôles { #chevron-un-objet-deux-roles }

**Le chevron est un seul objet : il amorce le défilement ET il fait naviguer dans une liste paginée.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« Ne pas en fabriquer deux. »*

    Source : NORMES.md § « LES CHEVRONS », Eric 2026-08-26 : *« pour le moment le chevron est une aide à la navigation latérale AUSSI »* · Statut : ratifié

### À gauche et à droite { #chevron-gauche-et-droite }

**Les chevrons se posent à GAUCHE et à DROITE, jamais au-dessus, sur la dalle et au ras de son bord.**

⚠️ En contradiction avec [`chevron.ecart-avec-le-code`](#chevron-ecart-avec-le-code) — voir [C6](../a-trancher.md#c6).

??? note "Pourquoi, et depuis quand"
    il vient de la loi §1 bis : « il se pose SUR la dalle, au ras de son bord », parce que « rien n'est jamais dans la marge ». La position latérale est ce qui lui permet de porter son compte dessous.

    Valeur : ⛔ pas dans la marge · Source : NORMES.md § « LES CHEVRONS », 2026-08-26 · Statut : ⚠️ ratifié mais **en écart avec le code** — voir [C6](../a-trancher.md#c6)

<!-- DESSIN À FAIRE — les chevrons à gauche et à droite au ras du bord de la dalle, et les 96 px que la paire coûte à la rangée -->

### Le compte sous le chevron { #chevron-compte-sous-le-chevron }

**Sous chaque chevron figurent le nombre de pages et le nombre d'items.**

??? note "Pourquoi, et depuis quand"
    *« le compte sous le chevron est ce qui accomplit la norme des listes : sans lui, une liste paginée est un défilement sans fin ; avec lui, toute liste a une taille connue et le joueur sait toujours où il en est »*.

    Valeur : ex. `31` sous le chevron gauche, `1/3` sous le droit · Source : NORMES.md § « LES CHEVRONS », 2026-08-26 · Statut : ratifié

### L'apparition et la zone { #chevron-apparition-et-zone }

**Le chevron apparaît à l'approche du doigt ou de la souris (500 ms de présence suffisent), s'efface, mais sa zone reste cliquable.**

??? note "Pourquoi, et depuis quand"
    Eric : *« Pas besoin d'être efficace au tactile — surtout utile pour la souris. »*

    Valeur : allure **petite et discrète** · effet : scroll / page suivante · Source : NORMES.md § « LES CHEVRONS », 2026-08-26 · Statut : ratifié

### Le chevron sur une zone de prose { #chevron-sur-une-zone-de-prose }

⏳ **À trancher.**

**Il n'est pas dit si le chevron s'applique aussi à une zone de prose qui défile.**

??? note "Pourquoi, et depuis quand"
    le garde-fou est posé (*« On doit VOIR qu'il y a plus — sinon le joueur croit avoir tout lu »*), l'organe qui le porte ne l'est pas.

    Source : NORMES.md § « 5 bis — deux gardes-fous », 2026-08-26 · Statut : à trancher
