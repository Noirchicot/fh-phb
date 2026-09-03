# Les listes

Cette page dit comment un paquet de jetons se sert au joueur : quinze par page, en rangées de trois, et une liste pagine — elle ne défile jamais. Elle porte aussi l'organe unique qui pagine, ses flèches, et les dettes que la norme des quinze laisse ouvertes.

## La page de quinze

### Quinze jetons par page { #liste-quinze-par-page }

**Une liste sert 15 jetons par page, en rangées de 3.**

??? note "Pourquoi, et depuis quand"
    c'est le modèle de `--voile-simple` copié pour un nombre de JavaScript — le garde tient **la valeur** et **l'absence de littéral**. 📏 Mesuré sur la page rendue (Chrome 151, 360 × 553 et 360 × 667) : étagère à 33 objets → `33` à gauche, `1/3` à droite, 15 jetons en 5 × 3, dernière page 3, `scrollHeight` = `clientHeight`.

    Valeur : `LISTE_PAR_PAGE = 15` dans `ui/builder/normes.mjs` · `pageDeListe()` · garde `tests/listes.test.mjs` · Source : NORMES.md § « 5. LES LISTES », 2026-08-26 · Statut : ratifié

<!-- DESSIN À FAIRE — la page de 15 — cinq rangées de trois, cotées -->

### Le quinze est un défaut { #liste-quinze-est-un-defaut }

**Le 15 est un DÉFAUT : un écran qui dévie passe explicitement son nombre à `pageDeListe(objets, page, N)`.**

??? note "Pourquoi, et depuis quand"
    c'est la loi générale *« une norme est un défaut, pas un mur »*.

    Valeur : ce qui est interdit, c'est de **recopier** le 15 · Source : NORMES.md § « 5 », 2026-08-26 · Statut : ratifié

### Une ligne incomplète se centre { #liste-set-incomplet-se-centre }

**Une ligne incomplète se centre ; la grille ne s'étire ni ne se recompose pour combler le vide.**

??? note "Pourquoi, et depuis quand"
    ⛔ « la grille ne s'étire pas, ne se recompose pas pour combler le vide » — c'est la même raison que « une case qui s'étire ne laisse RIEN à centrer » : la position d'un objet doit rester stable d'un écran à l'autre.

    Valeur : on centre le dernier ou les deux derniers · Source : NORMES.md § « 5. LES LISTES », 2026-08-26 · Statut : ratifié

<!-- DESSIN À FAIRE — avant / après — la ligne incomplète centrée, contre la grille qui s'étire (barré) -->

### Une liste pagine, elle ne défile pas { #liste-pagination-jamais-defilement }

**Une liste de jetons pagine, elle ne défile jamais : ce qui ne tient pas passe à la page suivante.**

??? note "Pourquoi, et depuis quand"
    *« On choisit parmi des jetons : un jeton hors écran est introuvable, et le joueur ne sait plus combien il en reste. D'où la pagination et le compte sous le chevron. »*

    Valeur : cible — tout tient sur un **iPhone SE** · Source : NORMES.md § « 5 » et § « 5 bis », 2026-08-26 · Statut : ratifié

### L'ordre vertical { #liste-ordre-vertical }

**Sous la liste viennent les collecteurs, puis encore dessous les boutons.**

??? note "Pourquoi, et depuis quand"
    c'est l'ordre de lecture de l'écran de choix : on prend dans la liste, on pose dans les collecteurs, on valide avec les boutons — et c'est ce qui donne le budget « collecteurs 48 + écart 8 + boutons 44 = 100 px, toujours ».

    Source : NORMES.md § « 5. LES LISTES », 2026-08-26 · Statut : ratifié

### La portée : le site entier { #liste-portee-site-entier }

**La norme des 15 est une règle du produit entier, pas de l'écran Équipement.**

??? note "Pourquoi, et depuis quand"
    « Ce n'est pas une règle de l'écran Équipement. C'est une règle du produit entier. » — gravé en tête de `FHPCv2 norme des listes` au vault.

    Valeur : sorts niveau 1, maîtrises, dons, compétences, arcanes · Source : NORMES.md § « SA PORTÉE : LE SITE ENTIER », Eric 2026-08-23 : *« il faudra normaliser l'ensemble du site sur 15 items glissables max … donc pour la liste des sorts niveau 1 on fera ça, pour les maîtrises idem »* ; vault : *« Ce n'est pas une règle de l'écran Équipement. C'est une règle du produit entier. »* · Statut : ratifié

## L'organe qui pagine

### Un seul organe pagine { #liste-un-seul-organe-pagine }

**La pagination vit dans l'organe unique `renderChoixGlisses`, pas dans les écrans.**

??? note "Pourquoi, et depuis quand"
    *« les écrans ne fabriquent pas leur vivier, ils remettent un plan à l'organe. Paginer chez eux aurait fait quatre copies de la même arithmétique. »* 📏 Mesuré : `Prepared spells` passe de 31 jetons et un débord de 571 px à 15 jetons, 3 pages (15/15/1), la page boucle et survit au rafraîchissement.

    Valeur : `glisser.mjs` — Species, Class, Inheritance, Identity + `renderLanguesGlisse` (un cinquième appelant que le mandat n'avait pas vu) · Source : NORMES.md § « 5 — portée aux viviers », lot A 2026-08-26 au soir · Statut : ratifié

### La pagination à porter aux huit autres { #liste-pagination-a-porter-aux-huit-autres }

**Huit listes n'ont pas encore la pagination : c'est un lot, pas une décision.**

??? note "Pourquoi, et depuis quand"
    « Ce qui reste à faire est donc un LOT, pas une décision » — la norme et l'organe existent, seul le câblage manque.

    Valeur : sorts niveau 1 (4 pages) · outils (2) · dons (2) · compétences (2) · arcanes (2) — et quatre listes tiennent déjà sur une page · Source : NORMES.md § « 5 », 2026-08-26 · Statut : ratifié (⏳ lot non fait)

### Une seule page, pas de flèches { #liste-une-seule-page-pas-de-fleches }

**Quand il n'y a qu'une page, il n'y a pas de flèches.**

??? note "Pourquoi, et depuis quand"
    *« une flèche qui ne mène nulle part reste une cible tactile de 44 px que le pouce vise pour rien, et les deux gouttières coûtent 96 px de largeur à une rangée qui n'en a que 20 de reste sur un téléphone »*. Le lot A avait pris le choix sobre **en le disant** (*« un mot d'Eric le renverse »*) ; le mot est venu et il confirme.

    Source : NORMES.md § « UNE SEULE PAGE N'A PAS DE FLÈCHES », Eric 2026-08-26 : *« quand il y a 3 tokens, on n'affiche que 3 tokens, pas besoin de flèches ni de titre s'il est déjà présent »* · Statut : ratifié

### Jamais `display: none` { #liste-jamais-display-none }

**Une flèche absente est retirée de la rangée, jamais masquée par `display: none`.**

??? note "Pourquoi, et depuis quand"
    *« Une flèche masquée garde sa place dans la grille et reste atteignable au clavier : on retire l'image du problème en laissant le problème. La rangée EST ses trois tokens, pas une rangée à cinq places dont deux se taisent. »*

    Valeur : défaut n°3 du dépôt — *« effacer un mot au lieu de recomposer »* · garde 4 de `ui-jetons.test.mjs` · Source : NORMES.md § « UNE SEULE PAGE N'A PAS DE FLÈCHES », 2026-08-26 · Statut : ratifié

### L'exception de l'état d'attente { #liste-exception-etat-d-attente-equipement }

**L'état d'attente d'Équipement garde ses deux gouttières de chevron — exception argumentée.**

??? note "Pourquoi, et depuis quand"
    *« Eric a parlé des listes COURTES ; étendre sa consigne à un état dont il n'a rien dit serait décider à sa place — et le test 11 nomme cet état « l'état de départ du croquis ». Un croquis d'Eric prime sur une déduction. »*

    Valeur : dos de cartes, aucune étagère chargée · test 11 · Source : NORMES.md § « UNE SEULE PAGE N'A PAS DE FLÈCHES », 2026-08-26 · Statut : ratifié

### Le nombre de pages, sans plafond { #liste-pages-sans-plafond }

**`pages = ceil(objets ÷ 15)`, toujours, sans plafond.**

??? note "Pourquoi, et depuis quand"
    *« le homebrew le fera déborder, c'est prévu. ⛔ Aucun garde ne doit affirmer « une étagère fait au plus trois pages ». »*

    Valeur : le **35 par étagère** est une cible de découpe, jamais un plafond de données · Source : NORMES.md § « 5 », 2026-08-26 · Statut : ratifié

## Ce que le quinze coûte

### Le quinze vit à deux endroits { #liste-quinze-vit-a-deux-endroits }

⏳ **À trancher.** Dette ouverte.

**Le 15 vit à deux endroits sans garde qui les tienne d'accord : c'est une dette mesurée.**

??? note "Pourquoi, et depuis quand"
    *« Changer l'un sans l'autre casse la grille en silence : le JS servirait 12 objets dans une grille qui en réserve 15, ou l'inverse. »*

    Valeur : `normes.mjs` → `LISTE_PAR_PAGE = 15` · `shell.css` → `grid-template-rows: repeat(5, var(--fhpc-case-h))` · Source : NORMES.md § « LE 15 VIT À DEUX ENDROITS », 2026-08-26 · Statut : à trancher (dette ouverte)

### Le « 3 par rangée » était un accident { #liste-trois-par-rangee-etait-un-accident }

**Le « 3 par rangée » qu'on observait dans un `flex-wrap` sans pagination était un accident d'arithmétique, pas une règle.**

⚠️ En contradiction avec [`jeton.trois-colonnes-toujours`](../porteurs/jeton.md#jeton-trois-colonnes-toujours) · [`panneau.reflux-oui-redimensionnement-non`](panneau.md#panneau-reflux-oui-redimensionnement-non) — voir [C17](../a-trancher.md#c17).

??? note "Pourquoi, et depuis quand"
    « Le quatrième ne rentre pas, voilà tout. » — c'est pour ça que la règle a dû être écrite ailleurs (« trois colonnes, toujours ») : un comportement obtenu par accident ne survit pas au premier changement de cote.

    Valeur : 3 × 87 + 2 × 8 = **277** pour une rangée de 278 — le quatrième ne rentre pas · Source : NORMES.md § « 5 — l'état d'avant, gardé pour mémoire », 2026-08-26 · Statut : ratifié (état historique)

### Une étagère trop grosse { #liste-etagere-trop-grosse }

⏳ **À trancher.**

**Les 127 objets merveilleux (9 pages) ne sont pas un défaut de la norme, mais le signe qu'une étagère est trop grosse.**

??? note "Pourquoi, et depuis quand"
    *« elle appelle un niveau de rangement de plus »*.

    Valeur : 127 objets = 9 pages · Source : NORMES.md § « CE QUI N'EST TOUJOURS PAS TRANCHÉ », citation du vault · Statut : à trancher
