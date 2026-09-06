# Le livre

Le livre est le jumeau gauche du `?` : même cote, bord opposé. Il mène à la règle quand le `?`
mène au guide. Il est dessiné, il existe, il n'est pas encore câblé.

📖 **ET CE QU'IL Y A DE L'AUTRE CÔTÉ DE LA PORTE N'EST PAS RÉGI ICI.** Le chapitre où le livre
atterrit — sa voix, ce qu'il a le droit de citer du SRD, son bandeau de pied, l'ancre sur laquelle
il ouvre — obéit à la **[FH WEB Bible](../../bible-web/index.md)**. ⛔ Choisir une cible sans la
lire, c'est ce qui a coûté six phrases le 2026-09-06. ➡️ Lire en particulier
[`citation-declare-la-substitution`](../../bible-web/citation.md#citation-declare-la-substitution)
et [`fabrique-code-n-est-pas-la-source`](../../bible-web/fabrique.md#fabrique-code-n-est-pas-la-source).

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### Le livre est dessiné { #livre-dessine-pas-un-glyphe }

**Le livre est dessiné, jamais écrit avec un glyphe 📖.**

??? note "Pourquoi, et depuis quand"
    *« un glyphe 📖 change de forme selon la police installée et rend une couleur qui n'est pas la nôtre — même raison qu'au pouce de l'interrupteur »*.

    Valeur : cercle 28 px, un livre à couverture et **dos** · Source : NORMES.md § « 7 bis » et § « LES AUTRES ORGANES », 2026-08-26 · Statut : ratifié

## Mesures

*ses cotes, et ce qui les calcule.*

### Le livre, jumeau gauche du `?` { #livre-jumelle-gauche-du-question }

**Le livre est un rond de 22 px, à la cote exacte du `?`, collé en bas à GAUCHE.**

??? note "Pourquoi, et depuis quand"
    ⭐ *« CE QUE ÇA RANGE DÉPASSE LA PLACE : le pied portait deux mots pour deux gestes de nature différente — `LORE` ouvre une lecture, `CHOOSE` écrit dans le document. Au même habit, côte à côte, ils disaient qu'ils se valaient. »* ➡️ *« ⭕ à gauche on LIT · le bouton au centre on CHOISIT · ⭕ à droite on demande de l'AIDE. »*

    Valeur : dessin 22 · cible `--touch` 44 · Source : NORMES.md § « 7 bis — LE LIVRE », Eric 2026-08-26 : *« plutôt qu'un bouton rules ou lore, on crée un bouton de même dimension que `?` mais à ma gauche, il contient un livre… et exit le bouton lore »* · *« le livre doit être dans un bouton rond, même taille que `?` »* · Statut : ratifié

<!-- DESSIN À FAIRE — la rangée de boutons avec le livre à gauche et le `?` à droite, tous deux 22 dans 44, hors du centrage -->

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Un organe sans texte se nomme { #livre-aria-label }

**Un organe sans texte doit se nommer par `aria-label`.**

??? note "Pourquoi, et depuis quand"
    *« sinon il disparaît de la page pour qui ne voit pas le dessin »*.

    Valeur : le garde l'exige · Source : NORMES.md § « 7 bis », 2026-08-26 · Statut : ratifié

### Le livre peut exister sans être câblé { #livre-peut-exister-sans-etre-cable }

**Le livre peut exister sans être câblé — exception nommée, et seulement pendant la construction.**

??? note "Pourquoi, et depuis quand"
    c'est une exception à *« un `?` qui n'ouvre rien apprend à ne plus le regarder »*. ⏳ *« Un livre qui n'ouvrirait toujours rien le jour où le reste est fini serait le défaut que cette règle-là interdit. »*

    Source : NORMES.md § « LA PAIRE », Eric 2026-08-26 : *« le livre n'est pas toujours câblé, il le sera »* · Statut : ratifié (exception bornée dans le temps)

### Sur Abilities, `INFO` devient un livre { #livre-abilities-info-devient-livre }

**Sur Abilities, le bouton `INFO` devient un livre et le mot quitte l'écran.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« Il portait `ability-entry` — donc le gabarit, l'octogone et le pan coupé des quatre méthodes. Un cinquième bouton identique proposait quelque chose qui n'est pas un choix. »* La feuille l'admettait à demi-mot le 16/08 : *« il ne se distingue plus par sa forme »*, et il fallait une phrase sous la rangée *« dont le seul travail était de rattraper une confusion de forme »*. ⚠️ Il garde `aria-pressed` (c'est un interrupteur : le panneau est ouvert, ou non) et un `aria-label`.

    Valeur : mesuré à 1100 px (v313) — livre **44 × 44** à gauche, `?` **44 × 44** à droite, les quatre méthodes centrées entre eux · Source : NORMES.md § « PREMIER CÂBLAGE RÉEL DU LIVRE », Eric 2026-08-26, deux fois : *« Info doit devenir un livre et disparaître »* · *« Abilities : info doit disparaître et devenir un bouton livre ! »* · Statut : ratifié

### Un déplacement rend faux un texte { #livre-un-deplacement-rend-faux-un-texte }

**Un déplacement peut rendre faux un texte qu'on n'a pas touché.**

??? note "Pourquoi, et depuis quand"
    *« la phrase ne parlait pas d'elle-même, elle POINTAIT »*.

    Valeur : *« pick one of the methods ABOVE »* remonté au-dessus de la rangée désignait la barre d'étapes · Source : NORMES.md § « PREMIER CÂBLAGE RÉEL DU LIVRE », 2026-08-26 · Statut : ratifié

### La rangée est encore vide { #livre-rangee-encore-vide }

⏳ **À trancher.**

**La rangée réserve bien sa colonne mais elle est vide sur les dix écrans : le `?` vit encore au coin bas-droit d'une dalle, et cinq écrans sur dix n'ont aucune rangée.**

??? note "Pourquoi, et depuis quand"
    *« Le déplacer demande de changer l'ordre de rendu (la rangée est posée APRÈS la carte, le `?` ne peut pas la voir depuis là) et de répondre pour les cinq écrans sans rangée. C'est un lot, pas une retouche. »*

    Valeur : mesuré par le lot G le 2026-08-26 · Source : NORMES.md § « LA PAIRE — ce qui reste à faire » · Statut : à trancher
