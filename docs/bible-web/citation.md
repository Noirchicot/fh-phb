# ② La citation

Comment le SRD entre dans le livre. La règle tient en une phrase, posée par Eric le **2026-08-20** :
le livre **cite** le SRD, il ne le **réécrit** pas.

## Citer, jamais recopier { #citation-citer-jamais-recopier }

**Le livre CITE le SRD, il ne le RÉÉCRIT pas. Une paraphrase fidèle reste une seconde version, et
une seconde version dérive.**

📍 `citation-citer-jamais-recopier` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    📏 Mesuré le jour même : la prose de *Weapon Mastery*, relue le matin contre le texte officiel, portait **cinq écarts** ; et dès que la citation s'est posée à côté d'elle, **trois de plus** ont sauté aux yeux — dont *Heavy* décrit avec la règle **2014** (« encombrant pour les créatures Small ») alors que la 2024 dit Désavantage sous 13 de Force. **C'était en ligne.**

    Source : logbook `FH PHB — Citer le SRD.md`, en-tête, Eric 2026-08-20 · Statut : ratifié

## La citation est un test de régression { #citation-est-un-test-de-regression }

**Tant que la citation et la prose se regardent sur la même page, un écart se voit.**

📍 `citation-est-un-test-de-regression` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    ⭐ C'est l'argument qui a fait choisir la citation contre la recopie : trois des huit écarts de *Weapon Mastery* ne sont apparus **qu'une fois la citation posée à côté**. Ce n'est pas une garantie théorique, c'est ce qui s'est produit.

    Source : logbook `FH PHB — Citer le SRD.md`, § « Pourquoi ça n'est pas qu'une question de style » · Statut : ratifié

## Citer contraint les MOTS, pas la PRÉSENTATION { #citation-contraint-les-mots-pas-la-presentation }

**Tant qu'aucune valeur n'est retapée et qu'aucun mot n'est changé, une belle table FH reste une
citation.**

📍 `citation-contraint-les-mots-pas-la-presentation` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    Eric : *« Cite facile, mais la mise en forme plus jolie peut rester de la citation non ? »* — oui.

    ⭐ **C'est la clé qui débloque tout** : elle permet de tenir son autre exigence — *« un joueur doit trouver tous les éléments au même endroit sans naviguer à droite à gauche »* — **sans trahir la source**. Conséquence directe : la thèse du chapitre *Equipment* s'est **inversée**. Elle disait *« ce n'est pas la boutique, les listes vivent au SRD »* ; elle dit maintenant que **tout est là**.

    Le rendu des tables est **déclaratif** : une entrée dans `SRD_TABLES` donne les colonnes (chacune une lambda sur le record), le regroupement et le tri. Ajouter une table = dix lignes de données.

    Source : logbook `FH PHB — Citer le SRD.md`, § « La clé qui débloque tout » · Statut : ratifié

## On déclare la substitution, on ne recopie pas la prose { #citation-declare-la-substitution }

**⛔ On ne recopie pas la prose du SRD pour y changer trois mots : on **DÉCLARE la substitution** —
le motif cherché, le texte posé, et **pourquoi** — et le générateur recalcule sur le texte SRD
courant.**

📍 `citation-declare-la-substitution` · vivante · 08/08

??? note "Pourquoi, et depuis quand"
    Incident, lot 17 du dépôt `fhpc`, 2026-08-08 : la description du Hoddon disait *« As a Gnome »* et celle de l'Elfe citait *« Perception »*. **Corriger en recopiant le blob SRD marche le premier jour** : le jour où `fh-srd` retouche ce texte, la copie ne bouge pas, plus rien ne la relie à sa source, et **personne ne le voit**.

    ⭐ **Deux filets, et le second est le moins évident** : une substitution qui **ne trouve pas sa cible jette en la nommant** — c'est elle qui transforme la dérive en alarme ; et un `mustNotContain` relit le **RÉSULTAT**, parce qu'une **phrase neuve** du SRD laisserait tous les motifs satisfaits et redirait quand même le mot banni.

    Source : `fhpc/TRAPS.md`, ligne « Une prose SRD recopiée dans une couche pour y changer trois mots » · Statut : ratifié, gardé

## Un seul exemplaire du texte SRD { #citation-un-seul-exemplaire }

**Il n'existe qu'UN exemplaire du texte SRD : celui de `fh-srd`. Une correction de l'extraction se
propage à la passe suivante, sans que personne s'en souvienne.**

📍 `citation-un-seul-exemplaire` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    Une ligne dans le chapitre du vault — `{{srd:weapon-mastery}}`, `{{srd:weapon-table}}`, `{{srd:armor-table}}`, `{{srd:gear-table}}`, `{{srd:tool-table}}`, `{{srd:weapons-by-mastery}}` — est résolue **à la construction** par `sync_from_vault.py`, en lisant `~/tools/fh-srd/exports/srd/{en,fr}/*.json` *(surchargeable par `FH_SRD`)*.

    ⭐ **Et citer une règle disparue CASSE la construction au lieu de mentir.**

    Source : logbook `FH PHB — Citer le SRD.md`, § « Comment ça marche » · Statut : ratifié

## Les quatre gardes { #citation-les-quatre-gardes }

**L'archi avait posé « balisé et généré, jamais édité à la main » — une **discipline**, donc
quelque chose dont il faut se souvenir. Les quatre ont été remplacées par des **refus**. Rendre une
erreur impossible vaut mieux que se promettre de ne pas la faire.**

📍 `citation-les-quatre-gardes` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    1. **Le bloc généré ne vit que dans `docs/`**, réécrit intégralement à chaque passe. La « petite correction en passant » qui retransformerait la citation en copie est **écrasée** à la construction suivante. Rien à retenir.
    2. **Un identifiant inconnu lève une erreur** qui liste ce qui existe. Un genre inexistant aussi.
    3. **Un groupe inattendu casse la construction.** Si le SRD gagne demain une catégorie d'arme, la table refuse de la ranger en silence à la fin.
    4. ⭐ **Un export en plein chantier est refusé.** `sync_from_vault.py` lisait l'**arbre de travail** d'un dépôt voisin : pendant qu'un lot tournait dans `fh-srd`, une construction aurait publié du travail non fusionné **sans que rien ne le dise**. Le résolveur compare chaque fichier à `main` — ce qui couvre d'un coup la modification non commitée **et** la branche divergente — et refuse **en nommant la branche coupable**. `FH_SRD_ALLOW_UNMERGED=1` en sort qui sait ce qu'il fait.

    Valeur : `_srd_etat_fichier`, `inject_srd_citations`, `SRD_TABLES` dans `sync_from_vault.py` · Source : logbook `FH PHB — Citer le SRD.md`, § « Les quatre gardes » · Statut : ratifié, en place

## Ne pas citer plus que nécessaire, et jamais sans le dire { #citation-pas-plus-que-necessaire }

**⛔ Ne cite pas plus que nécessaire du SRD, et jamais sans dire que c'en est.**

📍 `citation-pas-plus-que-necessaire` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    Écrit comme piège de terrain dans le mandat des trois méthodes, le 2026-09-06. Il vise le cas où un chapitre FH décrirait une méthode du jeu de base *« telle que le SRD la définit »* : ce serait **recopier de la prose SRD**, ce que [`citation-declare-la-substitution`](#citation-declare-la-substitution) interdit.

    ⚠️ **Et le cas est ouvert, pas réglé** — voir [W1](a-trancher.md#w1).

    Source : `MANDAT — Les trois méthodes que le livre ne dit pas (fh-phb).md`, § « LES PIÈGES DE CE TERRAIN » · Statut : ratifié

## Le classement est de nous, et il s'étiquette { #citation-le-classement-s-etiquette }

**Ce qui reste de la voix FH dans un bloc cité — le **classement** — n'énonce aucune règle : il
trie, groupe, avertit. Et il est **étiqueté** comme étant nous qui parlons.**

📍 `citation-le-classement-s-etiquette` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    Exemples en place : *« dix propriétés, cinq **demandes** et cinq **permissions** »*, le résumé des huit maîtrises, la lecture de l'armure. **Aucun n'énonce de règle** — c'est ce qui les autorise à côtoyer une citation sans la contaminer.

    Source : logbook `FH PHB — Citer le SRD.md`, § « Ce qui reste de la voix FH » · Statut : ratifié

## La subordination visuelle du bloc cité { #citation-subordination-visuelle }

**Le bloc cité est plus petit, dans un contenant distinct, et replié par défaut pour les longues
tables. **La voix d'Eric reste la page ; le SRD devient la référence dessous.**

📍 `citation-subordination-visuelle` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    C'est la réponse **de mise en page** au grief *« moche et chiant à lire »* : le bloc cité et la prose d'Eric avaient **le même poids visuel**.

    📏 **Relevé le 2026-09-06 à 20:24** : la subordination existe et est en place — `.fh-srd-cite`, `.fh-srd-cite__label`, `.fh-srd-cite__list`, `.fh-srd-cite__attr` dans `docs/stylesheets/extra.css` (à partir de la ligne 1302).

    Source : vault `0c. Canon/Ce qui est de Fate's Hand — Canon`, §3 · Statut : ratifié, en place

## Le repli se décide sur la CHARGE, pas sur le compte { #citation-repli-sur-la-charge }

**Une longue citation se replie sur DEUX seuils : le nombre d'entrées **et** le poids en
caractères. Le compte seul est un piège.**

⚠️ Elle **complète** [`citation-subordination-visuelle`](#citation-subordination-visuelle) — elle ne la borne pas et ne la remplace pas.

📍 `citation-repli-sur-la-charge` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    📌 **Le piège que le fil WEB s'est fait à lui-même, le soir même** : il a replié les longues citations sur le **nombre d'entrées**. Douze fiches de classe font **douze entrées** — sous le seuil — mais **huit mille caractères**, et elles sont restées dépliées. *« Le bon critère n'était pas le découpage du bloc mais **la charge de lecture**. »*

    Valeur : `SEUIL_REPLI = 25` entrées · `SEUIL_POIDS = 8000` caractères (`sync_from_vault.py`, `_replier`) · Source : vault `0c. Canon/Le livre composite`, §6 · Statut : ratifié, en place

## Ce que le SRD recolle, le livre le décolle { #citation-tables-plates-recollees }

**Le SRD recolle ses tables en texte plat dans la description d'une aptitude. Le livre les retire —
mais le témoin est *« les niveaux vont de 1 à 20 »*, ⛔ jamais un motif d'en-tête.**

📍 `citation-tables-plates-recollees` · vivante · 28/08

??? note "Pourquoi, et depuis quand"
    Eric, 2026-08-28 : *« Utilité de ceci ? car très moche »*. Sur la page du Barbare : **vingt et un paragraphes d'une ligne** (« `7 +3 Feral Instinct, Instinctive Pounce 4 +2 3` ») qui répétaient mot pour mot la table de progression rendue en tête. **Onze classes sur douze** étaient dans ce cas.

    | Piège | Ce qui se passait |
    |---|---|
    | un filtre par motif d'en-tête | `Level Proficiency Bonus` n'attrapait que **4 classes sur 12**. ⛔ Une liste de motifs ne dit jamais qu'elle est incomplète |
    | la table est au **milieu d'une phrase** | *« …to cast your level 1+ »* [table] *« spells. You regain… »*. Couper sans **recoller** laissait deux moitiés |
    | le titre est collé au **bout** du fragment gauche | *« …with another one for which you **Warlock Features** »* |
    | la **dernière ligne** porte parfois une queue de prose | Barbare : *« …6 +4 4 **While active, your Rage follows the rules below.** »* — la jeter perdait une règle |

    ⭐ Le bon témoin distingue une progression de classe (doublon, à retirer) d'une table qui porte de l'information unique : *Creating Spell Slots* du sorcier (1..5, des **coûts**) et *Wild Shape* du druide **restent**.

    ⚠️ **Un total juste ne dit rien du contenu** : « 27 → 4 paragraphes » avait l'air propre, et le Barde sortait cassé (*« That creature gains ??? Once within the next hour »*). Seule la **lecture des paragraphes produits** l'a montré.

    Source : logbook `FH PHB — Citer le SRD.md`, § « AMENDEMENT DU 2026-08-28 », point 1 · Statut : ratifié

## Deux pièges de données, payés le 20/08 { #citation-deux-pieges-de-donnees }

**Un champ mécanique peut valoir ZÉRO ; et un champ porte sa propre forme — on le LIT, on ne le
re-préfixe pas, on ne le découpe pas.**

📍 `citation-deux-pieges-de-donnees` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    - **ZÉRO n'est pas ABSENT.** Les armures lourdes portent `ac_dex_cap: 0`, **pas `None`** : tester la véracité booléenne rangeait les quatre lourdes dans les moyennes, **sans rien casser ni signaler**. « Absent » se teste explicitement. Le même piège existe côté `fhpc` (`granted_skill_budget.points: 0`), couvert d'un test le même jour.
    - **Un champ porte sa forme.** `strength` vaut déjà `"Str 13"` — on le lit, on ne le re-préfixe pas. Et `properties` est une chaîne dont les parenthèses portent des valeurs (`Ammunition (Range 150/600; Arrow), Heavy, Two-Handed`) : **affichée telle quelle**, jamais découpée — c'est aussi **la forme la plus fidèle à une citation**.

    Source : logbook `FH PHB — Citer le SRD.md`, § « Deux pièges de données » · Statut : ratifié
