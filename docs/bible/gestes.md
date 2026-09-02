# Les gestes

Cette page dit ce que le doigt et la souris font, et surtout ce qui défile et ce qui ne défile pas : la prose défile, les contrôles non. Elle porte les deux exceptions nommées — le Seuil et le dressing — et le plancher tactile de 44.

## Le tap et le clic droit

### Tap et clic droit ouvrent l'info { #geste-tap-info-clic-droit-info }

**Sur un token : tap au doigt et clic droit à la souris ouvrent la même fenêtre FF d'information.**

??? note "Pourquoi, et depuis quand"
    la fenêtre FF interne *« reste le geste des écrans de choix (tap sur un jeton = info) ; la loi des liens porte sur les NOMS écrits — bilans, prose, fiches »*.

    Source : NORMES.md § « 7 ter », Eric : *« idem clic droit sur un token, ou tap sur un token »* · Statut : ratifié

## Ce qui défile, ce qui ne défile pas

### La page ne défile jamais { #geste-la-page-ne-defile-jamais }

**La page ne défile jamais ; une bande de contrôles ne défile jamais ; une liste de jetons pagine.**

??? note "Pourquoi, et depuis quand"
    « c'est structurel » — et c'est ce qui donne leur force aux deux autres lois : une liste qui ne peut pas déborder DOIT paginer, et un écran qui ne tient pas DOIT porter quelque chose en trop.

    Valeur : `100dvh`, `overflow: hidden` · Source : NORMES.md § « 5 bis », 2026-08-26 · Statut : ratifié

### La prose défile, les contrôles non { #geste-la-prose-defile-les-controles-non }

**La ligne de partage est nette : la prose défile, les contrôles non.**

??? note "Pourquoi, et depuis quand"
    *« On lit un texte de haut en bas : le défilement est le geste naturel de la lecture, et rien n'est perdu — juste plus bas. On choisit parmi des jetons : un jeton hors écran est introuvable. »* ⭐ Et ça ne contredit pas *« demander ce que la page porte EN TROP »* : *« cette loi vise les contrôles, dont la lecture d'un seul coup d'œil est le service rendu. Un bloc de lore n'a pas ce service à rendre. »*

    Valeur : ✅ zone de texte, table dans sa boîte (`.lore-table-boite`) · ⛔ la page, la dalle, une liste de jetons, une bande de contrôles · Source : NORMES.md § « 5 bis. LE DÉFILEMENT INTERNE », Eric 2026-08-26 : *« quand on a un long bloc de texte… je voudrais un scrollable interne — pas la dalle, mais uniquement la ZONE DE TEXTE. Ça permettrait de garder le bilan Species sur une page. »* · Statut : ratifié

### Les deux garde-fous du défilement interne { #geste-deux-gardes-fous-du-defilement-interne }

**La boîte qui défile porte une hauteur (pas la dalle), et on doit VOIR qu'il y a plus.**

??? note "Pourquoi, et depuis quand"
    *« sinon la dalle grandit et la page déborde, ce qu'elle ne peut pas faire »* · *« sinon le joueur croit avoir tout lu »*.

    Source : NORMES.md § « 5 bis », 2026-08-26 · Statut : ratifié

### Le Seuil défile { #geste-seuil-defile }

**Le Seuil défile — c'est un vestibule, pas une page de travail.**

??? note "Pourquoi, et depuis quand"
    *« son contenu grandit (des personnages, des campagnes) sans qu'aucun compte n'ait à se lire d'un coup d'œil »*.

    Source : NORMES.md § « 1 sexies », Eric 2026-08-26 : *« Je pense que cette fenêtre doit être scrollable. »* · Statut : ratifié

### Le dressing défile { #geste-dressing-defile }

**Le dressing (`Équipement › B3`) est le second écran à défiler.**

??? note "Pourquoi, et depuis quand"
    *« les deux exceptions se ressemblent, ce qui confirme la règle : le Seuil et le dressing sont tous deux des écrans dont le contenu grandit sans qu'aucun compte n'ait à se lire d'un coup d'œil. Un vestibule, une garde-robe. ⛔ Une liste de choix n'est ni l'un ni l'autre : elle pagine. »* ⚠️ *« Ceci N'EST PAS une commande de lot »* — Équipement est un chantier à part entière.

    Valeur : titre collé en haut · flux au milieu · boutons collés en bas · Source : NORMES.md § « LE DRESSING défile aussi », Eric 2026-08-26 : *« un dressing qui scrolle, des boutons fixes »* · *« laisse le titre dans le dressing aussi »* · Statut : ratifié (contrainte pour le jour où le chantier s'ouvrira)

### Un écran qui défile a trois bandes { #geste-un-ecran-qui-defile-a-trois-bandes }

**Ce qui défile ne porte pas les organes fixes : un écran qui défile a trois bandes, et les deux du dehors ne bougent jamais.**

??? note "Pourquoi, et depuis quand"
    *« le titre-sortie collé en haut, sinon on ne peut plus sortir une fois descendu ; le `?` collé en bas à droite, un rappel qui défile n'est plus un rappel »*. **Deux couches — le flux, et ce qui reste.**

    Valeur : titre collé en haut · flux · contrôles collés en bas · Source : NORMES.md § « CE QUE LE DÉFILEMENT DU SEUIL IMPOSE », 2026-08-26 · Statut : ratifié

### Le défilement aimanté { #geste-defilement-aimante }

**Le défilement aimanté n'est honnête que parce qu'une fiche fait un écran.**

??? note "Pourquoi, et depuis quand"
    « une fiche fait un écran, ni plus ni moins » (Eric, 15/08) : c'est la hauteur imposée qui rend l'aimantation honnête — sans elle, le cran tomberait au milieu d'une fiche.

    Valeur : `scroll-snap-type: y mandatory` · `data-snap` · gardé par `snap.test.mjs` · Source : CADRES.md § « 3 », décision d'Eric du 2026-08-15 · Statut : ratifié

## Les cibles du doigt

### La cible tactile : 44 { #geste-cible-tactile-44 }

**Tout ce qui se touche a le même plancher : 44.**

??? note "Pourquoi, et depuis quand"
    *« Cinq organes sur dix retombent sur 44, et ce n'est pas un hasard. »* ⛔ *« un contrôle ne se laisse jamais dimensionner par un dessin »*.

    Valeur : `--touch: 44` — bouton, `+`/`−`, dropdown, zone d'écriture, chevron de pagination, `?`, livre · Source : NORMES.md § « 1 quater — la table des hauteurs », 2026-08-26 · Statut : ratifié

### Une rangée de tuiles, une cible unique { #geste-une-rangee-de-tuiles-est-une-cible-unique }

**Une rangée de tuiles peut être une seule zone d'accueil plutôt que six cibles.**

??? note "Pourquoi, et depuis quand"
    *« viser un îlot de 54 px au pouce serait un jeu d'adresse »*.

    Valeur : `data-creneau` sur la rangée · Source : CADRES.md § « 7 », 2026-08-16 · Statut : ratifié

### Le popup ne capte pas le lâcher { #geste-le-popup-ne-doit-pas-capter-le-lacher }

**Le `.popup`, ancré en bas, ne capte pas le lâcher : il est là où vivent les récepteurs du glisser.**

??? note "Pourquoi, et depuis quand"
    « ancré `bottom: 0`, il est là où vivent les récepteurs du glisser, et un dépôt atterrissait dessus » (défaut mesuré le 20/08). ⛔ « Ne pas lui ajouter un voile « pour faire comme l'aiguilleur ». »

    Valeur : `pointer-events: none` — défaut mesuré le 2026-08-20 · Source : NORMES.md § « 7 », 2026-08-26 · Statut : ratifié
