# ④ L'appareil

Ce qui vit **au pied** du chapitre et **au dos** du livre : le bandeau *« What Fate's Hand does
here »*, le convertisseur, l'attribution. ⭐ **C'est ici que la comparaison a le droit d'exister** —
et c'est parce qu'elle est ici que [la voix](voix.md) peut rester au présent partout ailleurs.

## Le rappel en TÊTE de chapitre { #appareil-rappel-en-tete }

🔴 **Règle morte, gardée pour son histoire.**

**Le rappel de ce que Fate's Hand change se pose **en tête** de chapitre, sous forme de menu de
liens.**

📍 `appareil-rappel-en-tete` · remplacée · 20/08 · remplacée par `appareil-rappel-en-pied`

??? note "Pourquoi, et depuis quand"
    Eric, 2026-08-20 **au matin** : *« j'ai un peu peur de voir ma création noyée dans le SRD »*, puis *« peut-on donner ce job de rappel des règles FH en tête de chapitre, plus sous forme de menu avec des liens qu'un bloc de texte ? »*. Construit et **déployé en tête** le jour même.

    ⚠️ **Elle est gardée ici parce qu'elle explique le pourquoi du bandeau tout entier** — la crainte du noyage — et parce qu'un corpus qui efface ses règles mortes redevient une liste d'opinions.

    Source : vault `0c. Canon/Chapitres et genres — Canon (ratifié 2026-08-20).md` · Statut : remplacée le soir même

## Le rappel en PIED de chapitre { #appareil-rappel-en-pied }

**Le rappel de ce qui diffère va **en FIN de chaque chapitre** — *« là où quelques initiés veulent
en savoir plus »* — et **voire même dans un chapitre où il n'y a que ça**.**

📍 `appareil-rappel-en-pied` · vivante · 20/08 · remplace `appareil-rappel-en-tete` · bornée par `appareil-note-lecture-reste-avant`

??? note "Pourquoi, et depuis quand"
    Eric, 2026-08-20 **au soir**, après avoir lu le livre publié : *« le rappel de ce qui diffère **en fin de chaque chapitre**, là où quelques initiés veulent en savoir plus. **Voire même dans un chapitre où il n'y a que ça.** »*

    ⭐ **La raison est dans sa phrase** : le rappel s'adresse à *« quelques initiés »*, pas au joueur qui ouvre la page pour jouer. En tête, il imposait à tout le monde une comparaison qui n'intéresse presque personne, **et il retardait sa voix d'un écran**. *« C'était le noyage qu'il craignait, commis par l'outil bâti contre lui. »*

    📌 **Les deux formes restent ouvertes — il a dit « voire même », pas « plutôt ».** Un chapitre unique *« What Fate's Hand changes »* est une **option**, pas un ordre. ⏳ Non tranché.

    ⛔ **Ce qui NE change pas** : le rappel reste **généré**. Le déplacer est un changement d'**emplacement**, pas de **méthode**.

    Valeur : `insert_banner()` — `text.rstrip() + "\n\n---\n\n" + banniere` (`sync_from_vault.py`) · Source : vault `0c. Canon/Le livre composite`, §4 · Statut : ratifié, en place

## L'encadré de lecture reste AVANT les citations { #appareil-note-lecture-reste-avant }

**L'encadré *« Reading the quotations on this page »* reste **AVANT** les citations. Il s'adresse à
qui va les lire.**

📍 `appareil-note-lecture-reste-avant` · vivante · 20/08 · borne `appareil-rappel-en-pied`

??? note "Pourquoi, et depuis quand"
    ⚠️ *« Ne concerne QUE ce rappel »* — le déplacement en pied vise le bandeau des écarts, pas l'avertissement de lecture. **C'est une exception nommée, pas un oubli.**

    Et elle a été affinée le 28/08 : la note se posait sur l'**index**, **qui ne cite rien**. Elle descend en pied des **sept pages filles** qui portent vraiment le terme.

    Source : `sync_from_vault.py`, `insert_banner()` ; logbook `FH PHB — Citer le SRD.md`, § du 28/08 · Statut : ratifié

## Le bandeau est GÉNÉRÉ, jamais écrit { #appareil-bandeau-genere-jamais-ecrit }

**Le bandeau est **dérivé des données**, jamais écrit à la main. Un rappel dérivé ne peut pas
mentir : le jour où une couche cesse de patcher, la ligne disparaît toute seule.**

📍 `appareil-bandeau-genere-jamais-ecrit` · vivante · 20/08 · bornée par `appareil-troisieme-etat-declare`

??? note "Pourquoi, et depuis quand"
    ⛔ **Un rappel écrit à la main POURRIT, et la journée du 20/08 l'a prouvé DEUX fois** : deux clauses dictées de mémoire par Eric restituaient un état **qu'il avait lui-même corrigé le 18/08** (les rituels sombres comme trainings, les langues dans l'espèce).

    Valeur : `fhpc/exports/fh-changes.json`, lu par `_fh_changes()` ; la table `CHAPTER_GENRES` dit quel chapitre parle de quel genre de records · Source : vault `0c. Canon/Chapitres et genres — Canon (ratifié 2026-08-20).md`, §1 · Statut : ratifié, en place

## Le « — » n'est pas un trou, c'est une réponse { #appareil-tiret-est-une-reponse }

**Un chapitre sans genre associé écrit *« Entirely Fate's Hand. The base game says nothing about
this subject »*. **Onze chapitres** sont dans ce cas, et c'est la meilleure réponse à la crainte du
noyage.**

📍 `appareil-tiret-est-une-reponse` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    Ce n'est pas un oubli de la table : c'est que **le SRD ne dit RIEN de ces sujets**. Moonkeeper, les Forces Primordiales, la Mécanique de la Main du Destin, le Soulforge Crafting : **100 % Eric**, et le menu le dit à chaque ouverture de page.

    ⚠️ **Et la phrase ne se dit plus que là où elle est encore vraie** : une seule ligne déclarée suffit à la retirer (`if not genres and not declare`). C'est exactement ce qui s'est passé sur `ability-scores` le 06/09.

    ⚠️ **Trois lignes de la table sont des ARBITRAGES, pas des mesures**, et c'est là qu'elles se changent — nulle part ailleurs : `Inheritance → background` *(la couche éteint les 4 arrière-plans du SRD)* · `Crafting → tool` *(⚠️ bancal et sciemment : le champ `craft` dit ce que chaque outil fabrique, mais le temps, le coût et la procédure ne sont dans aucun export)* · `Tables de Fatalité → monster`.

    Source : vault `0c. Canon/Chapitres et genres — Canon`, §3 et §4 · Statut : ratifié

## Les trois états du bandeau { #appareil-trois-etats }

**Un chapitre est dans l'un de trois états, et un seul : **mesuré** *(des genres, comparés aux
données)* · **déclaré** *(ce que la mesure ne peut pas prouver)* · **entièrement Fate's Hand**
*(ni genre ni déclaration)*.**

📍 `appareil-trois-etats` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    Le troisième état est né le 2026-09-06 ; les deux premiers existaient depuis le 20/08. ⭐ **Le troisième chasse le premier** : `if not genres and not declare` — une déclaration suffit à retirer *« entirely Fate's Hand »*.

    Valeur : `chapter_banner(dest)` dans `sync_from_vault.py` · Statut : ratifié, en place

## Le troisième état : ce que la mesure ne prouve pas, le chapitre le DÉCLARE { #appareil-troisieme-etat-declare }

**Ce que la mesure ne peut pas prouver, le chapitre le **DÉCLARE** — dans la machinerie, **à un
seul endroit**, et le pied du bandeau dit franchement que c'est **déclaré et non mesuré**.**

📍 `appareil-troisieme-etat-declare` · vivante · 06/09 · borne `appareil-bandeau-genere-jamais-ecrit`

??? note "Pourquoi, et depuis quand"
    🔴 **Ce qui s'est cassé.** `ability-scores.md` portait `[]`, donc *« entirely Fate's Hand »*. Le 06/09 le chapitre a reçu **`4d6`** et **le tableau standard** — deux méthodes du jeu de base (SRD 5.2.1, p. 21, relu dans le PDF source le même jour). **Le bandeau annonçait donc, noir sur blanc, une chose fausse.**

    ⛔ **Et la mesure ne peut pas le rattraper.** `fh-changes.json` compte des **RECORDS, par genre** — et une caractéristique n'est pas un genre : les exports du SRD n'en portent aucun (`skill`, `feat`, `spell`, `tool`… ; **aucun `ability`, vérifié**).

    ⭐ **Pourquoi ce n'est PAS le retour du rappel écrit à la main condamné le 20/08** : ce qui pourrissait, c'est un rappel qui **PRÉTENDAIT refléter des données changeantes**. Ces lignes-ci ne bougent que si Eric change une règle de sa propre page. **C'est une exception nommée, et elle est bornée à `CHAPTER_STATED`.**

    ⛔ **Format non négociable** : `(sujet, classe du verdict, verdict, détail)` — exactement le `<li>` du bandeau mesuré, donc le même rendu que `crafting` et `feats`. **Aucune classe CSS nouvelle.**

    Eric, 2026-09-06 : *« on récrit à notre sauce et on cite en pied de page, as usual, ce qui change du SRD, et les refs habituelles tout en bas. »*

    Valeur : `CHAPTER_STATED` dans `sync_from_vault.py` · Statut : ratifié, en place

## Un chiffre faux est pire qu'une case vide { #appareil-chiffre-faux-pire-que-case-vide }

**⛔ On ne glisse pas un genre voisin dans `CHAPTER_GENRES` pour faire taire un bandeau : il
annoncerait un nombre qui ne parle pas du sujet de la page.**

📍 `appareil-chiffre-faux-pire-que-case-vide` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    C'est la tentation exacte qui s'est présentée le 06/09 sur `ability-scores` — et qui a été refusée. **Un chiffre faux est pire qu'une case vide.**

    ⛔ **Et ce qui n'est PAS déclaré ne l'est pas par défaut** : le **Point Cost** du jeu de base n'entre pas dans le bandeau sans un mot d'Eric. Le builder ne l'offre pas, et son propre commentaire dit pourquoi — *« question posée à Eric, toujours ouverte »*. Un pied de page qui l'annoncerait *« retiré »* trancherait à sa place.

    Source : `sync_from_vault.py`, § « LE TROISIÈME ÉTAT » · Statut : ratifié

## Le mot est « no record differs », jamais « unchanged » { #appareil-no-record-differs }

**Quand la mesure ne trouve aucun écart, le bandeau écrit *« no record differs »* — ⛔ jamais
*« unchanged »* ni *« quoted from the SRD »* — et un pied rappelle **ce que la mesure ne couvre
pas**.**

📍 `appareil-no-record-differs` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    🔴 **La phrase qui pouvait mentir.** `fh-changes.json` mesure des RECORDS. Une règle qu'Eric écrit dans la **PROSE** d'un chapitre, sans record derrière, y est **invisible**. Cas vivant : le genre `spell` sort à **trois listes vides** alors que *Fate's Hand Spells* porte **737 mots de sorts maison**. Écrire *« unchanged »* sur cette page dirait au lecteur que rien n'y est d'Eric — **le noyage, commis par l'outil censé y répondre.**

    Valeur : *« That is not the same as saying nothing here is Fate's Hand: rules this chapter states in its own words are not counted by the measure — read the page. »* · Source : `sync_from_vault.py`, `chapter_banner()` · Statut : ratifié, en place

## `renamed` mérite sa propre phrase { #appareil-renamed-a-sa-propre-phrase }

**Un renommage sort du bandeau sous **son propre verbe** (`replaces`), avec **les deux noms** —
⛔ jamais rangé dans `patched` sous son seul nom d'arrivée.**

📍 `appareil-renamed-a-sa-propre-phrase` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    ⭐ Rangé dans `patched`, *« Gnome → Hoddon »* deviendrait *« FH retouche le Hoddon »*, et **le mot Gnome quitterait le livre sans qu'une ligne le dise**. C'est pourtant **la phrase la plus forte du chapitre Species**.

    Valeur : `<span class="fh-layer__renamed">replaces</span> — Gnome → Hoddon` · Source : `sync_from_vault.py`, `chapter_banner()` · Statut : ratifié, en place

## L'attribution générée avec chaque bloc { #appareil-attribution-par-bloc }

🔴 **Règle morte, gardée pour son histoire.**

**L'attribution CC-BY est **générée avec chaque bloc cité**, précisément pour qu'elle *« ne puisse
plus être oubliée »*.**

📍 `appareil-attribution-par-bloc` · remplacée · 20/08 · remplacée par `appareil-attribution-une-seule-fois`

??? note "Pourquoi, et depuis quand"
    ⚠️ **Le logbook la dit encore vraie** — voir [W3](a-trancher.md#w3). Elle a été retirée dans le code le **2026-08-21 à 05:03** (`ATTR_PAR_BLOC = False`, commit `a809636`, *« Le livre cesse de dire à chaque paragraphe qu'il cite »*), et le logbook, touché deux fois depuis, ne l'a pas suivi.

    Source : logbook `FH PHB — Citer le SRD.md`, § « UNE CHOSE À VÉRIFIER AVANT D'APPLIQUER » · Statut : remplacée

## L'attribution paraît UNE fois { #appareil-attribution-une-seule-fois }

**La déclaration exigée par le SRD 5.2.1 paraît **une seule fois**, en pied de site
(`copyright:` de `mkdocs.yml`), ⛔ **VERBATIM** — deux phrases, 315 signes, reprises du champ
`attribution` des exports.**

📍 `appareil-attribution-une-seule-fois` · vivante · 21/08 · remplace `appareil-attribution-par-bloc`

??? note "Pourquoi, et depuis quand"
    ⚠️ **La conformité est maintenue, pas allégée** : la CC BY 4.0 exige **UNE** mention, pas une par paragraphe.

    ⛔ **NE PAS REFORMULER, NE RIEN AJOUTER.** Le dépôt source teste cette phrase **caractère par caractère** contre le PDF à chaque exécution ; une paraphrase dans `mkdocs.yml` **casserait cette garantie en silence**.

    📌 **Elle est là et nulle part ailleurs** : `sync_from_vault.py` ne l'écrit plus dans les blocs (`ATTR_PAR_BLOC = False`). **Si cette ligne disparaît, la remettre à `True` le même jour.**

    Valeur : `mkdocs.yml`, clef `copyright` · commit `a809636`, 2026-08-21 05:03 · Statut : ratifié, en place

## Aucune autre attribution à Wizards { #appareil-aucune-autre-attribution }

**⛔ La page légale continue : *« Veuillez n'inclure AUCUNE AUTRE attribution à Wizards »*. Donc
pas de *« changes were made »*, pas d'avertissement de non-affiliation, **rien autour**.**

📍 `appareil-aucune-autre-attribution` · vivante · 21/08

??? note "Pourquoi, et depuis quand"
    ✅ **Ce qui est permis, verbatim** : *« compatible with fifth edition »* / *« 5E compatible »*.

    Source : `mkdocs.yml`, commentaire au-dessus de `copyright` · Statut : ratifié

## L'attribution n'est pas la comparaison { #appareil-attribution-n-est-pas-la-comparaison }

**⭐ **L'attribution est une OBLIGATION, la comparaison est un CHOIX** — les deux ne voyagent pas
ensemble. ⛔ Déplacer la comparaison à la fin ne dit **rien** de l'attribution : ce point-là se
tranche **sur la licence**, pas sur le goût.**

📍 `appareil-attribution-n-est-pas-la-comparaison` · vivante · 25/08 · borne `voix-comparatifs-en-pied`

??? note "Pourquoi, et depuis quand"
    ⚠️ Écrit le 25/08 comme la seule réserve **non éditoriale** de l'amendement de la voix. C'est une **exception nommée** : la règle *« les comparatifs vont en pied »* reste vivante partout ailleurs, mais elle ne s'étend pas à l'attribution.

    Source : logbook `FH PHB — Citer le SRD.md`, § « UNE CHOSE À VÉRIFIER AVANT D'APPLIQUER, ET ELLE N'EST PAS ÉDITORIALE » · Statut : ratifié

## Le convertisseur a un domicile : le dos du livre { #appareil-convertisseur-a-son-domicile }

**Ce qui dit **comment FH diverge du SRD** s'appelle le **CONVERTISSEUR**, et c'est un document
**DÉRIVÉ**, jamais une source. Il suit ce que disent les chapitres ; il ne les commande pas. Son
domicile est **le dos du livre**.**

📍 `appareil-convertisseur-a-son-domicile` · vivante · 25/08

??? note "Pourquoi, et depuis quand"
    Trois piliers ratifiés le 2026-08-20 : **FH = source de vérité** → builder FH · **SRD = source de vérité** → builder SRD · **le convertisseur** = comment FH diverge du SRD, dérivé des deux premiers.

    📌 Il n'avait **pas de domicile** ; l'amendement du 25/08 lui en donne un : *« l'appareil de fin a déjà un nom dans ce chantier : c'est le CONVERTISSEUR. »*

    Source : mémoire ratifiée `feedback_addendum_banni_convertisseur` ; logbook `FH PHB — Citer le SRD.md`, § du 25/08 · Statut : ratifié

## Le mot « addendum » est BANNI { #appareil-addendum-banni }

**⛔ Le mot « addendum » est banni du chantier FH. Ne jamais nommer ainsi un document, ni proposer
d'en créer un.**

📍 `appareil-addendum-banni` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    Un fichier nommé `FHPCv2 addendums.md` s'est déclaré *« SOURCE DE VÉRITÉ N°1 POUR TOUTE RÈGLE FH »* avec une hiérarchie **addendums → moteur → site → vault** — **l'exact inverse** de la décision ratifiée. Deux documents autoritaires se sont contredits à deux jours d'écart, et **six pools de compétence faux ont vécu des mois dessous**.

    ⭐ **Et le fichier supprimé n'a pas suffi** : sa ligne survivait dans `_MENU.md`, **injecté au démarrage de chaque session** — chaque nouveau fil commençait donc par lire une hiérarchie fausse. *(Leçon directement applicable à cette Bible : une Bible qu'aucun démarrage ne nomme n'est pas lue.)*

    Source : mémoire ratifiée `feedback_addendum_banni_convertisseur`, Eric 2026-08-20 · Statut : ratifié

## Cinq blocs de pied ramenés à DEUX { #appareil-pied-a-deux-blocs }

**Le pied d'une page de classe porte **deux** blocs : *« What Fate's Hand changes »* et la
référence SRD **en tout petit**. Pas cinq.**

📍 `appareil-pied-a-deux-blocs` · vivante · 28/08

??? note "Pourquoi, et depuis quand"
    Retirés le 28/08 au soir : le **callout doublon**, le **nav de mesure**, la **note Perception**.

    📏 Mesuré au même moment, et c'est le chiffre qui prouve qu'aucun mot n'a bougé : le texte des aptitudes a été rendu lisible **sans qu'un mot change** — **27 111 mots avant = 27 111 après**.

    Source : logbook `FH PHB — Citer le SRD.md`, § « LE BELT DU CHAPITRE CLASSES », dernier paragraphe · Statut : ratifié
