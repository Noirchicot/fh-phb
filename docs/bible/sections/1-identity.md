# 1 · Identity

⭐ **Cette page n'est plus vide.** Le corpus des 310 ne nomme jamais cet écran dans un énoncé —
ses `14` mentions sont toutes dans des arguments repliés — mais les commits et le code en portent
`8` règles, tranchées et déployées. ⚠️ Aucune n'est dans `NORMES.md`.

## Ce que cette étape fait autrement

### Plus de deux choix : on glisse { #identity-plus-de-deux-choix-on-glisse }

**Le genre et l'alignement sont des choix glissés, pas des listes déroulantes — et le seuil est « plus de deux choix ».**

??? note "Pourquoi, et depuis quand"
    Un champ libre invitait à écrire n'importe quoi là où il n'y a que neuf réponses. ⚠️ Mais ces deux-là ne sont **pas des choix de règle** : ce sont des champs de document, et aucun plan du carnet ne les décrit — le carnet juge des règles, pas une préférence de fiche. On donne donc au champ la FORME d'un plan, en local. ⭐ Et une valeur déjà écrite hors liste entre dans la liste comme option de plus, au lieu d'être effacée en silence.

    Valeur : `2` — le seuil au-dessous duquel un champ garde ses boutons · Source : Eric, 2026-08-19 : *« le drop-down c'est moche. Je préfère avoir du drag and drop quand il y a plus de deux choix, on va généraliser ça. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### On raccourcit le mot, jamais la case { #identity-raccourcir-le-mot-pas-la-case }

**Le troisième genre s'appelle `Other`, et la parade à un contenu qui déborde est de raccourcir le MOT — jamais de rétrécir la case ni d'ajouter une ligne.**

??? note "Pourquoi, et depuis quand"
    Les trois jetons étaient bien sur une ligne : c'est le **mot** qui se pliait. « Something else » fait `14` caractères — sous le plafond d'abréviation, donc non abrégé — mais ne tient pas dans les `77` px utiles d'une case, et se coupait en deux. ⛔ Deux jetons à une ligne et un à deux : c'est cette rangée non homogène qui est l'incohérence. Ce n'est pas une donnée SRD — les trois genres sont un libellé d'interface.

    Valeur : `14` caractères pour `77` px utiles · plafond d'abréviation `16` · Source : Eric, 2026-08-26 : *« Man woman other sur une ligne, sinon pas cohérent »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le mot `Name` vit dans l'encart { #identity-name-dans-l-encart }

**Le mot `Name` vit dans l'encart d'écriture et non au-dessus, et le champ prend la largeur d'une rangée de trois cases, centré.**

??? note "Pourquoi, et depuis quand"
    Une invite occupe la place de la réponse tant qu'il n'y en a pas et s'efface dès qu'on écrit : `Name` n'a donc **jamais besoin d'exister en même temps** que le nom du personnage — ce qu'une étiquette au-dessus imposait, pour deux lignes et une seule information. ⛔ Mais l'étiquette d'accessibilité reste posée avec le même mot : une invite n'est pas une étiquette, les lecteurs d'écran ne s'engagent pas à l'annoncer. ⭐ Et la largeur n'est pas un nombre choisi : c'est la même colonne que les jetons juste en dessous.

    Valeur : champ `58` → `37` px de haut, `277 × 37` centré · Source : Eric, 2026-08-26 : *« Name peut figurer dans l'encart d'écriture, avant d'être remplacé par le nom du perso »* · *« on gagne un champ »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le mot d'un collecteur n'est pas le titre de sa carte { #identity-mot-du-collecteur }

**Le mot que porte un collecteur d'Identity n'est pas le titre de sa carte, et l'index tombe quand il n'y a qu'un créneau.**

??? note "Pourquoi, et depuis quand"
    Identity était le **seul** écran dont le collecteur rendait `87 × 66` au lieu de `87 × 48` — et la règle de taille n'était pas fausse : c'est le contenu qui débordait, « Gender (optional) 1 » se pliant sur trois lignes. Partout ailleurs le mot est court ; ici seul on passait le TITRE de la carte comme mot du récepteur. ⛔ Deux métiers, une seule chaîne. Et un « 1 » jamais suivi d'un « 2 » ne numérote rien.

    Valeur : `87 × 66` → `87 × 48` · Source : Eric, 2026-08-26 : *« Identity : taille token = taille collecteur ! »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Aucun panneau de tutoriel, ici ni ailleurs { #identity-aucun-panneau-de-tutoriel }

**Identity ne monte aucun panneau de tutoriel, et aucun autre écran ne le fera.**

??? note "Pourquoi, et depuis quand"
    Identity était le seul écran à en monter un. ⛔ Les DEUX montages ont été retirés, pas seulement le premier : le code lisait « si général … sinon si spécifique … », donc retirer le seul général aurait fait monter le tutoriel d'Identity à la ligne suivante, **au même endroit**. ⭐ Rien n'est supprimé — le module reste entier — et « ne monte pas les panneaux ailleurs non plus » est câblé en garde, pas en promesse.

    Valeur : `0` panneau, mesuré sur la page rendue · Source : Eric, 2026-08-26 : *« dégage le welcome aiguilleur de Identity »* · *« le reste aussi »* · *« ne monte pas les panneaux ailleurs non plus »* · Statut : ratifié, déployé, ⚠️ hors corpus

### `Rules` devient un livre, et le livre ouvre le SRD { #identity-rules-devient-un-livre }

**`Rules` est un livre rond dans la rangée de boutons, et ce livre ouvre la section d'alignement du SRD — jamais un texte écrit par l'interface.**

??? note "Pourquoi, et depuis quand"
    `Rules` était un bouton libellé de `609` px, pleine largeur, qui ne ressemblait à aucun autre bouton du site et occupait une ligne entière pour dire un mot — alors que le registre donnait déjà sa forme, puisque ce bouton OUVRE UN TEXTE. ⛔ Et ce qu'il ouvrait était deux phrases écrites par l'architecte : **un texte de règle écrit dans l'interface est une règle publiée sans source, sans version, sans empreinte**. La section existait depuis toujours.

    Valeur : `609` px → un livre de `44 × 44` · Source : Eric, 2026-08-26 : *« Rules dégage sous forme d'un livre dans la rangée de boutons »* · *« connecte le livre à la section alignement dans le SRD »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le compte ne paraît qu'à partir de deux créneaux { #identity-compte-des-deux-creneaux }

**Le compte « n of m chosen » ne paraît que s'il compte plus d'un créneau.**

??? note "Pourquoi, et depuis quand"
    À UN créneau, « 0 of 1 chosen » n'apprend rien — le collecteur est sous les yeux du joueur. À plusieurs, « 2 of 4 chosen » se lit d'un coup d'œil là où il faudrait compter les cases. 📌 L'architecte avait d'abord **tout** supprimé et écrit qu'il ne fallait surtout pas le remettre ; Eric a tranché l'inverse.

    Valeur : `1` créneau → pas de compte · `2` et plus → compte · Source : Eric, 2026-08-26 : *« dégage les 1 of 1 chosen »*, puis *« on les remet quand c'est utile, pas là »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Les jetons et les boutons sont sacrés { #identity-jetons-et-boutons-sacres }

**Quand Identity ne tient pas dans la hauteur, on descend d'un barreau d'échelle — ⛔ jamais on ne rogne un jeton ou un bouton.**

??? note "Pourquoi, et depuis quand"
    Le jour où un écran ne tient pas, le gabarit d'un jeton est ce qu'il y a de plus tentant à rogner : il est gros, il est répété, et deux pixels de moins ne se voient pas SUR UNE CASE — ils se voient sur toutes. ⭐ La tentation était doublement mauvaise ici : descendre le corps du jeton n'aurait **rien** rendu, la case mesurant `48` px par gabarit quel que soit le corps qu'elle porte. « Uniformément » se lit sur l'échelle, pas en pixels. ⚠️ Et la victoire n'a pas tenu : mesuré cinq jours plus tard dans une fenêtre de `375 × 520`, Identity débordait encore de `31` blg — c'est ce qui a fait passer la hauteur du panneau de `520` à `560`.

    Valeur : dépassement `78` → `0` px à `375 × 553` · sacrés intacts : jeton `87 × 48`, `Done` `75 × 44` · Source : Eric, 2026-08-26 : *« les jetons et les boutons sont sacrés »* · *« rogne sur la police, descends d'un T »* · Statut : ratifié, déployé, ⚠️ hors corpus

## Ce qu'aucune règle ne dit

- **`(optional)` est retiré de `Gender` et conservé sur `Alignment`.** Eric n'a nommé que `Gender` (*« enlève optional sur gender »*, 2026-08-26) ; l'asymétrie est visible à l'écran et **appartient à Eric**. ⛔ Aucune règle consignée.
- **Le `Next` d'Identity ne menait nulle part** : deux endroits demandaient « sommes-nous dans un sous-écran ? » par un test qui rendait vrai pour toute étape sans parcours, et l'avancement n'était jamais atteint. Corrigé par un prédicat nommé. ⚠️ **Aucune citation d'Eric** : le défaut vient d'un audit, pas d'une dictée — `2` clics sans effet, reproduits à `375 × 812`.
