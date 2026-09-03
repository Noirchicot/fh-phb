# 2 · Species

Ce que l'écran des espèces fait **autrement**. `7` règles, tirées des messages de commit du dépôt
`fhpc` (fin août → 2 septembre) — ⚠️ aucune n'est dans `NORMES.md`.

## Ce que cette étape fait autrement

### Trois niveaux de texte pour une lignée { #species-trois-niveaux-de-texte }

**Une lignée porte trois textes distincts : un condensé d'une ligne au bilan, un texte complet restructuré à la fenêtre du sous-écran, et la prose SRD du record en source — jamais touchée.**

??? note "Pourquoi, et depuis quand"
    La prose du record vient du **convertisseur**, et le chapitre publié du site en dépend : la raccourcir casserait le livre. ⭐ Le repli est gardé — une lignée sans texte de fenêtre sert sa prose comme avant.

    Valeur : `data[fiche_lineage_lvl1]` au bilan · `data[fiche_lineage_text]` à la fenêtre, une ligne par fait, sorts en lien · Source : Eric, 2026-09-02 : *« les mêmes infos, plus court, mieux structuré avec les liens, comme l'Elfe »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Un trait qui dépend du choix appartient à la lignée { #species-trait-dependant-appartient-a-la-lignee }

**Un trait dont le CONTENU dépend du choix de lignée quitte le bloc « gagné d'office » : il se lit sous forme GÉNÉRALE au sous-écran, SPÉCIFIQUE au bilan signé, à partir d'une seule lecture.**

??? note "Pourquoi, et depuis quand"
    Avant la signature, la place de ces traits dans le bloc accordé **mentait le plus fort** : l'écran promettait « Resistance to the damage type determined by your Draconic Ancestry » alors qu'aucun choix n'existait encore. ⭐ Une seule lecture (`option.damage`, jamais recopié) garantit que le jour où un condensé change, les deux formes changent ensemble.

    Valeur : bloc accordé du Dragonborn `318` → `206` blg, plus rien sous le pli · bilan signé `25` → `120` blg · Source : Eric, 2026-09-02 : *« Un trait dont le CONTENU dépend du choix de lignée appartient à la lignée, pas au bloc "Granted automatically". »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le texte vert nomme l'étape où l'effet se règle { #species-texte-vert-de-portage }

**Un trait gagné d'office dont l'effet est des points libres, un don ou un bonus de Destinée porte un texte vert qui NOMME l'étape où cet effet se règle — et cette liste se dérive de l'EFFET, jamais d'une liste de noms.**

??? note "Pourquoi, et depuis quand"
    La pastille verte promet que le contenu part **directement** à la fiche ; ces trois familles-là n'y partent pas encore, elles attendent un choix plus loin dans la ceinture. ⛔ Et une liste d'exceptions par nom ne dit jamais qu'elle est incomplète : un filtre qui cherchait « skill point » au singulier avait raté `fast-learner`, et c'est Eric qui l'a vu.

    Valeur : points libres → Skills · don → Inheritance · Destinée → Destiny · `6` couples, `2` faux positifs restent muets · Source : Eric, 2026-09-02, dicté dans `species-step.mjs` : *« Je ne vois pas le petit texte vert qui indique, sur les pouvoirs granted, que c'est transféré à un choix dans un autre chapitre. »*, puis en le bornant : *« Texte vert : free points, feats, destiny. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le bloc « gagné d'office » sert un condensé, pas la prose { #species-granted-sert-un-condense }

**Les traits du bloc « gagné d'office » ne servent jamais la prose SRD : ils servent un condensé écrit, lu par une seule fonction — et un trait sans condensé retombe sur sa prose.**

??? note "Pourquoi, et depuis quand"
    L'écran rendait `trait.text` tel quel : Breath Weapon faisait `833` caractères pour une fenêtre de `251` px. ⭐ Un blanc serait pire que le pavé, d'où le repli gardé. ⛔ Et le plafond du garde est une **cote donnée** — le plus long condensé déjà au dépôt — jamais un nombre recalculé, sinon il monterait tout seul.

    Valeur : plafond `102` caractères · Dragonborn `614` → `249` px, Goliath `271` → `167` · Source : Eric, 2026-09-02 : *« dragonborn S : granted texte pas conforme »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La forme d'un lignage est un critère STRUCTUREL { #species-critere-structurel-du-lignage }

**Une lignée qui tient en UNE entrée se lit en table à deux colonnes ; une lignée à paliers multiples garde sa prose — le critère est la structure, jamais une liste d'espèces.**

??? note "Pourquoi, et depuis quand"
    ⛔ Un critère par nom d'espèce ne dit jamais qu'il est incomplet ; un critère structurel **range la onzième espèce tout seul**. Les cellules passent par le lieur, donc un lien de sort futur y sera un lien.

    Valeur : Dragonborn (`10` entrées) · Goliath (`6`) · Hoddon (`3`) en table ; Elf et Tiefling en prose · Source : Eric, 2026-08-27 : *« le Dragonborn pourrait avoir un tableau plutôt qu'un long scroll pour décrire ses résistances et souffles »* · *« Lineage de Hoddon : perte énorme d'espace »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Un tableau se compose sur son contenu, et s'annonce { #species-tableau-se-compose-et-s-annonce }

**Le tableau des lignées se compose sur son contenu et se centre — jamais étiré à 100 % — et il est toujours précédé d'une phrase qui dit ce qu'il va montrer.**

??? note "Pourquoi, et depuis quand"
    Étirée à 100 %, la table posait les noms au bord et perdait les valeurs au milieu d'un blanc. ⭐ Et l'intro est une **donnée** lue par l'écran (`data[lineage_intro]`), pas une chaîne en dur.

    Valeur : table Dragonborn `112` px centrée contre `592` étirée · Source : Eric, 2026-08-27 : *« Tu t'es foutu de ma gueule pour le tableau du dragonborn sérieux »*, puis *« un peu de texte en intro, pour dire que c'est des souffles, le cône, les dégâts, la résistance — et après le tableau pour chaque élément »* · Statut : ratifié, déployé, ⚠️ hors corpus

### L'exception nommée du Dragonborn { #species-exception-dragonborn }

**Le Dragonborn est une exception NOMMÉE : son sous-écran ne porte plus la table des dix lignées mais une bande d'aiguilleur courte, et le tap sur un jeton ouvre la version synthétique.**

??? note "Pourquoi, et depuis quand"
    Mesuré à 375×812 : ses dix jetons mangent quatre rangées et il ne reste que `74` blg de fenêtre pour un texte qui en demande `316`. ⛔ **Une table sous le pli n'a jamais été un affichage.** L'exception est nommée (`LIGNAGES_SANS_TABLE`) et sa frontière gardée pour qu'elle ne se propage pas : Goliath (`6`) et Hoddon (`3`) conservent leur table. ⚠️ Deux dates au dépôt pour la même dictée — le commit de fusion écrit 01/09, la rédaction longue 02/09.

    Valeur : `74` blg disponibles contre `316` demandés · Source : Eric : *« Dragonborn, SB lignages : exception, on change le donné. »* · Statut : ratifié, déployé, **renverse la table commandée le 2026-08-27**, ⚠️ hors corpus
