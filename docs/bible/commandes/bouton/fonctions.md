# Le bouton — Fonctions

La **loi générale** du bouton : ce qu'un bouton fait et ce qu'il interdit — les deux axes, les
trois verbes, la famille DÉFAIRE, les portes, le verrou et le gendarme. ⚠️ Ce qui vaut pour
**un** bouton nommé — `Done`, `Back`, `Next`, `Cancel`, `I changed my mind` — vit sur
[Boutons spéciaux](speciaux.md), avec la table qui dit ce que chacun EST.

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Deux axes : le libellé et la couleur { #bouton-deux-axes }

**Le libellé dit ce que fait le bouton et ne change jamais ; la couleur dit où on en est et change à chaque acte.**

??? note "Pourquoi, et depuis quand"
    *« « `done` = vert » ne veut PAS dire « le bouton Done est vert ». Ça veut dire : un `Done` est vert quand l'étape est finie. »* Le joueur voit **où il en est** avant même de lire ce qu'il peut faire — *« la couleur porte l'avancement, le mot porte l'acte : deux informations, aucune redondance »*.

    Source : NORMES.md § « LE LIBELLÉ ET LA COULEUR SONT DEUX AXES INDÉPENDANTS », Eric 2026-08-26 : *« mais un même bouton peut changer de couleur, à voir dans l'acte »* · Statut : ratifié

### Jamais de couleur dans le balisage { #bouton-jamais-de-couleur-dans-le-balisage }

**Un lot ne déclare jamais `class="bouton-vert"` : il déclare un bouton, et l'état peint.**

??? note "Pourquoi, et depuis quand"
    *« Une couleur écrite dans le balisage est un bogue — elle mentira au premier changement d'état. »* ⛔ *« Deux dérivations séparées finiraient par diverger — c'est la faute des deux échelles typographiques que le dépôt paie encore. »*

    Valeur : la couleur se dérive du MÊME état que le cercle de signalisation · Source : NORMES.md § « LE LIBELLÉ ET LA COULEUR », 2026-08-26 · Statut : ratifié

### La famille DÉFAIRE { #bouton-famille-defaire }

**La famille DÉFAIRE est rouge, toujours, quel que soit l'état, et toujours accompagnée d'un popup.**

??? note "Pourquoi, et depuis quand"
    *« C'est la seule famille où la couleur ne dit PAS où on en est — elle dit ce que le bouton FAIT. Un bouton qui défait ne doit jamais pouvoir être appuyé par distraction. ⛔ Un `Cancel` gris, ça s'appuie sans le vouloir. »* Rouge **et** confirmé, jamais l'un sans l'autre.

    Valeur : `Cancel` · `I changed my mind` · « je veux refaire mon perso » · Source : NORMES.md § « LA FAMILLE DÉFAIRE », Eric 2026-08-26 : *« le cancel est rouge »* · *« j'ai changé d'avis est rouge »* · Statut : ratifié

### Le critère est le coût du geste { #bouton-critere-du-cout }

**Ce n'est pas le mot qui décide de la couleur, c'est ce que le geste COÛTE — et « détruit » se mesure au travail perdu.**

??? note "Pourquoi, et depuis quand"
    ⛔ **AMENDÉ le 26/08** : *« J'avais écrit ici que « `Back` a la couleur de sa conséquence ». C'est caduc : un `Back` ne coûte rien par définition, et un bouton qui détruit porte un autre mot. Le critère du coût reste vrai — il ne s'applique simplement plus à `Back`, mais au choix du LIBELLÉ. »*

    Valeur : ne coûte rien → bleu · détruit du travail → rouge + popup, **et il ne s'appelle pas `Back`** · Source : NORMES.md § « LE CRITÈRE », Eric 2026-08-26 : *« un bouton back sera bleu je pense, s'il n'impacte rien »* · Statut : ratifié (amendé le 26/08)

### Les trois verbes { #bouton-trois-verbes }

**Trois familles, trois verbes, aucun recouvrement : `Back`/`Next` NAVIGUENT (bleu), `Done` VALIDE (vert), `Cancel`/`I changed my mind` DÉFAIT (rouge + popup).**

⚠️ En contradiction avec [`bouton.done-signe`](speciaux.md#bouton-done-signe) — voir [C16](../../a-trancher.md#c16).

??? note "Pourquoi, et depuis quand"
    *« Un bouton qui fait deux de ces choses est un bouton mal nommé — c'est la discipline qu'Eric applique depuis le 17/08 : il ne règle pas le cas ambigu, il sépare les mots. »*

    Source : NORMES.md § « LES TROIS VERBES », Eric 2026-08-26 : *« `Done` valide les choix · `I changed my mind` les annule · `Next` : navigation »* · *« back et next = navigation uniquement »* · *« done = validation »* · Statut : ratifié

### La porte à deux âges { #bouton-porte-a-deux-ages }

**Le bouton de menu de création est UN bouton à deux âges : proposition tant que la condition n'est pas remplie, résolution dès qu'elle l'est.**

??? note "Pourquoi, et depuis quand"
    *« C'EST LE BOUTON LE PLUS FRÉQUENT DU BUILDER, ET IL MANQUAIT À CE REGISTRE. »* ⛔ *« Ne pas en faire deux composants : le jour où ils divergeraient, un menu montrerait une proposition résolue. »*

    Valeur : proposition = nom de la question (« Lineage »), voyant ⚪ vide · résolution = la résolution (« High Elf ») + sous-titre T1 italique, voyant 🟢 vert · Source : NORMES.md § « LES DEUX BOUTONS DE MENU DE CRÉATION », Eric 2026-08-27 : *« nouvelles normes aussi pour les boutons de menus de création : bouton de PROPOSITION / bouton de RÉSOLUTION »* · Statut : ratifié

<!-- DESSIN À FAIRE — les trois âges d'une porte — proposition, résolution, absence -->

### Le troisième âge est l'absence { #bouton-troisieme-age-est-l-absence }

**Une fois l'étape validée par le `Done` du pied, la porte disparaît et le résumé prend sa place.**

??? note "Pourquoi, et depuis quand"
    « une fois l'étape entière validée par le `Done` du pied, le bouton disparaît et son résumé prend sa place » — sans ce troisième âge, un menu réglé continuerait d'offrir des portes à une question déjà close.

    Valeur : proposition → résolution → plus de porte du tout · Source : NORMES.md § « LES DEUX BOUTONS DE MENU DE CRÉATION » + § « soit la porte, soit le résumé », 2026-08-27 · Statut : ratifié

### La loi de la porte { #bouton-loi-de-la-porte }

**Le voyant et le texte d'une porte disent la MÊME chose : condition remplie → voyant vert + texte de résolution ; non remplie → voyant vide + texte de proposition.**

??? note "Pourquoi, et depuis quand"
    ⛔ le défaut qui a fait écrire la loi : *« le 27/08, les portes annonçaient « High Elf » et « spent » pendant que les voyants à leur gauche étaient vides »*. La cause était une confusion de notions : *« l'écran d'appel savait ce qui était POSÉ (`answered >= expected`), le voyant disait ce qui était CONFIRMÉ (passé par son `Done`). On peut poser un lignage sans valider son écran. »* Parade : *« l'appelant sait QUELLE est la résolution, l'écran sait SI elle compte »*.

    Source : NORMES.md § « LA LOI DE LA PORTE », Eric 2026-08-27 · Statut : ratifié

### Une résolution n'est pas toujours un nom { #bouton-resolution-n-est-pas-toujours-un-nom }

**Une résolution dit que c'est résolu ; elle ne dit pas forcément par quoi.**

??? note "Pourquoi, et depuis quand"
    *« `Skill budget` n'a pas UNE réponse — il en a autant que de compétences dotées (« Survival +1, Vigilance +1 »), et aucune ne tient dans une porte. »* C'est ce que le vocabulaire proposition/résolution règle et que « question/réponse » ne réglait pas.

    Valeur : `Skill budget` → état `spent`, pas un nom · Source : NORMES.md § « LA LOI DE LA PORTE », 2026-08-27 · Statut : ratifié

### Le verrou du noyau { #bouton-verrou }

**Un verrou du noyau prime sur une signature : sous verrou, `Done` et `Next` sont désarmés ET rouges, la porte fautive devient un octogone rouge plein, et le gendarme parle.**

??? note "Pourquoi, et depuis quand"
    *« LES DEUX ROUGES NE DISENT PAS LE MÊME GESTE, et c'est le curseur qui les sépare : le bouton désarmé montre la MAIN D'ARRÊT (tu ne passes pas par là), la porte accusée offre le DOIGT (c'est par ici). »* ⛔ Le bug (lot 67) : *« le noyau posait le verrou, et l'écran testait `answered >= expected` — trois novices passaient pour « spent ». Un dépassement n'est pas une réponse. »* Le compte d'une bourse est EXACT (`===`).

    Valeur : `skill-budget.overspent` · curseur `not-allowed` sur les boutons, **doigt** sur la porte · crochet `cfg.gendarme(ctx) → {mot, chemin}` · garde `tests/budget-verrou.test.mjs` · Source : NORMES.md § « LE VERROU, LE GENDARME, ET LES BOUTONS BLOQUÉS », Eric 2026-08-27 : *« tu peux bloquer le Next et faire parler le gendarme en rouge à la place de l'aiguilleur »* · *« il faut bloquer le Done aussi, et laisser le bouton visible pour pouvoir retourner dans Skill budget »* · *« sur Wood Elf j'ai pas le bouton pour revenir en arrière »* · Statut : ratifié

### La tête de bilan redevient une porte { #bouton-tete-de-bilan-redevient-une-porte }

**Même conclue, une étape verrouillée redonne sa tête de bilan sous forme de porte rouge.**

??? note "Pourquoi, et depuis quand"
    *« une étape verrouillée offre son chemin de retour, sans démolir le reste »*.

    Source : NORMES.md § « LE VERROU », Eric 2026-08-27 : *« j'ai pas le bouton pour revenir en arrière »* · Statut : ratifié

### Le gendarme ne parle que quand ça bloque { #bouton-gendarme-quand-ca-bloque }

**Le gendarme ne parle que quand le rouge EMPÊCHE d'avancer.**

??? note "Pourquoi, et depuis quand"
    *« Un rouge qu'on peut corriger soi-même en un geste n'a besoin de personne ; un rouge qui ferme la route doit dire pourquoi, sinon le joueur cherche. »* ⛔ *« un gendarme sur chaque rouge serait pire que pas de gendarme du tout : une interruption qui survient tout le temps cesse d'être lue »*.

    Valeur : choix hors droit (+4 pour un droit de +2) → rouge, ⛔ pas de gendarme · ça bloque → rouge + gendarme · Source : NORMES.md § « QUAND LE GENDARME PARLE », Eric 2026-08-26 : *« le gendarme quand ça risque de bloquer, pas tout rouge je pense »* · Statut : ratifié

### Le rouge signale, le gendarme explique { #bouton-rouge-signale-violet-explique }

**Un bouton rouge dit qu'il y a un problème ; le gendarme dit lequel.**

??? note "Pourquoi, et depuis quand"
    *« la couleur se voit d'un coup d'œil et ne prend pas de place ; le gendarme prend la parole et coûte une interruption »*.

    Source : NORMES.md § « Le rouge peut être accompagné », Eric : *« le rouge c'est pas bon — tu peux me mettre un flic en même temps »* · Statut : ratifié
