# 5 · Class

Ce que l'écran des classes fait **autrement**. `9` règles, tirées des messages de commit du dépôt
`fhpc` (27 août → 29 août) — ⚠️ aucune n'est dans `NORMES.md`.

## Ce que cette étape fait autrement

### Le bilan porte les textes, pas des noms nus { #class-bilan-porte-les-textes }

**Le bilan de Class porte chaque aptitude AVEC son texte, dans la même forme que Species, et ce texte est un résumé synthétique — la première phrase de l'aptitude.**

??? note "Pourquoi, et depuis quand"
    Class n'affichait que trois **noms nus** : le joueur lisait « Ritual Adept » sans savoir ce que c'est, et devait ouvrir le livre pour une aptitude qu'il vient de recevoir. ⭐ Le moteur de la première phrase est juste onze fois sur douze ; `Martial Arts` du moine est le seul cas où elle ANNONCE une liste au lieu de définir — **une phrase qui ouvre sur rien n'est pas un résumé**, et cette exception-là se note à la main.

    Valeur : Wizard `4870` → `369` caractères · plafond du garde `220`, pris sur la plus longue ligne de Species · `11/12` justes par la première phrase · Source : Eric, 2026-08-29 : *« le texte de bilan complet harmonisé, complet, pas trois pauvres lignes. Tu fais idem Species. »*, puis en corrigeant le trop-plein : *« un résumé très synthétique, comme dans Species »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Les résumés passent du tableau à la prose { #class-resumes-en-prose }

**Les résumés de Class s'écrivent en prose sur le modèle de l'Elfe, l'école du sort ne s'écrit plus, et un résumé ne redit jamais sa propre tête.**

??? note "Pourquoi, et depuis quand"
    Six rangées pour six sorts deviennent **deux lignes**. Et l'école est une propriété, pas un acquis : six écoles en toutes lettres ÉTAIENT le gâchis. ⭐ Elle reste à un doigt — le nom du sort ouvre sa fenêtre.

    Source : Eric, 2026-08-27 : *« Gros gâchis d'espace sur bilan : liste du choix des sorts, prendre bilan elfe comme exemple »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La bande de sous-classe tient sur une ligne { #class-bande-sur-une-ligne }

**La bande de sous-classe tient sur UNE ligne au portrait comme au paysage, et quand le texte déborde, la coupe porte sur la VOIE — jamais sur le nom de la sous-classe.**

??? note "Pourquoi, et depuis quand"
    Le portrait se repliait en silence et la bande **mentait sur son nombre de lignées**. ⭐ Un nom coupé ne se reconnaît plus ; une promesse abrégée se devine encore. Le moule impose la ligne, le contenu s'y taille : la règle ne connaît pas d'habit, seule la cote change.

    Valeur : `226` u au paysage, `121` px au portrait · `7` classes sur `12` tiennent, `5` débordent · Source : Eric, 2026-08-27 : *« Barbare : R : subclass sur une ligne »* · Statut : ratifié, déployé, ⚠️ hors corpus

### On cherche la place avant de chercher le mot court { #class-la-place-avant-le-raccourci }

**Devant une bande trop longue, on cherche D'ABORD la place : la terminologie entière prime sur le raccourci.**

??? note "Pourquoi, et depuis quand"
    Le portrait gardait `11u` et coupait **deux mots entiers** pour 2 et 5 px ; le corps se déduit désormais de la colonne qu'occupe la bande. ⛔ Mais la cote gagne des pixels, elle ne fait pas de miracles : deux libellés restent abrégés parce que la place n'existe à aucun corps lisible — pas par préférence.

    Valeur : `11u` → `10,5u` · « Devotion : Sacred weapon » coupait de `2`, « Moonkeeper : Lunar Magic » de `5` · Source : Eric, 2026-08-28 : *« On garde la terminologie de base si elle passe, par PRIORITÉ sur les raccourcis. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La carte de classe NOMME, elle ne compte pas { #class-carte-nomme-ne-compte-pas }

**La carte d'entrée est un résumé de classe : sa bande écrit « Subclasses / nom court : mots » — le mot « path » est retiré — et toutes ses cotes dérivent d'une seule échelle plafonnée.**

??? note "Pourquoi, et depuis quand"
    La carte doit accueillir une classe neuve **sans retouche** : c'est pourquoi une seule échelle pilote toutes ses cotes internes, et pourquoi son plafond vaut `1` — la carte ne monte jamais au-dessus de sa taille dessinée.

    Valeur : deux habits, `269×440` portrait et `625×440` paysage · blurb `8` lignes pleines · nom court ≤ `31` caractères, et il doit appartenir au nom SRD · Source : Eric, 2026-08-27 : *« si je crée une nouvelle classe tout rentre là-dedans et sera joli partout »* · *« c'est un résumé de classe »* · *« on dégage path »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le builder ne propose que des sous-classes complètes { #class-sous-classes-completes }

**Le builder ne propose que les sous-classes du SRD qui sont complètes, plus la seule sous-classe Fate's Hand complète — `Moonkeeper`, chez le Sorcerer.**

??? note "Pourquoi, et depuis quand"
    Une sous-classe incomplète est un **brouillon**, pas une option de choix. ⭐ Et le garde change de camp au lieu de s'assouplir : l'exemption du Wizard tombe, remplacée par une exception NOMMÉE pour le Sorcerer — première ligne = voie SRD, seconde = exactement « Moonkeeper » — de sorte qu'une quatrième voie inventée demain fasse rougir la suite.

    Source : Eric, 2026-08-28 : *« Les subclasses, ne prends que celles qui sont dans le SRD et complètes. En l'occurrence uniquement le Moonkeeper »* · Statut : ratifié, déployé, **retire les trois voies FH du Wizard**, ⚠️ hors corpus

### Les cantrips gardent leur nom, pas leur rangement { #class-cantrips-gardent-leur-nom }

**Les cantrips continuent de se NOMMER cantrips, mais ils suivent exactement les règles de rangement des sorts — `3` par rangée, sur tous les écrans, paginé ou non.**

??? note "Pourquoi, et depuis quand"
    L'écran des cantrips n'est pas paginé : il ne portait donc pas la marque de grille, et la règle des **quatre** — écrite pour les compétences — l'attrapait. ⛔ Deux écrans de sorts se rangeaient différemment selon qu'ils débordaient ou non. Le régime est désormais porté par un attribut à trois valeurs, qui ne peuvent pas se battre par spécificité.

    Valeur : `3` par rangée pour les sorts, contre `4` pour les compétences et `6` pour les caractéristiques · Source : Eric, 2026-08-29 : *« ils doivent continuer à se nommer cantrips, mais les règles de rangement sont les mêmes que les sorts »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Une liste dictée bat une liste dérivée { #class-liste-dictee-bat-la-derivation }

**Une liste de compétences de classe peut être DICTÉE par Eric, et la liste dictée l'emporte sur la dérivation mécanique.**

??? note "Pourquoi, et depuis quand"
    Sans ce canal, une liste FH ne pouvait naître que d'un remplacement mécanique : cinq classes l'ont eu, les sept autres gardaient la liste SRD, et **six d'entre elles ne pouvaient atteindre aucune** des neuf compétences neuves de Fate's Hand. ⛔ Chaque identifiant dicté est confronté à la pile : une liste qui nomme une compétence éteinte doit être **refusée**, jamais perdue en silence.

    Valeur : le barde — `3` compétences liées, `2` outils liés, `12` points libres · Source : Eric, 2026-08-28 : *« la distribution des points du barde doit être modifiée dans les règles — 12 free points · bound skills 3 … »* · Statut : ratifié, déployé, ⚠️ hors corpus · ⏳ **trou** : les outils liés sont publiés et affichés, mais aucun plan ne propose de les placer

### Une déviation qui perd son argument se retire { #class-deviation-qui-perd-son-argument }

**L'écran des sorts préparés ne dévie plus de la pagination du socle : il repasse à `15` par page.**

??? note "Pourquoi, et depuis quand"
    La déviation à `12` avait été posée parce que les quatre créneaux prenaient deux rangées. Depuis que la cote cédée est une variable lue par le jeton **et** par le collecteur, les quatre créneaux tiennent sur une rangée. ⭐ Une déviation qui perd son argument se retire — sinon elle le fait mentir.

    Valeur : `12` → `15` par page · `4×74 + 3×8 = 320`, les quatre créneaux sur une rangée · Source : Eric, 2026-08-27, la dictée qui a fait tomber la cause : *« bard collector change de taille sur cantrip, idem spells »* · Statut : ratifié, déployé, ⚠️ hors corpus
