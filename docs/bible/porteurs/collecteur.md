# Le collecteur

Le collecteur est la case qui reçoit un jeton. Il a toujours exactement la taille d'un jeton, et
parle sur deux canaux : le **remplissage** dit ce qu'il porte, le **liseré** dit son état.

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### Un collecteur vide est creux { #collecteur-vide-est-creux-et-sans-lisere }

**Un collecteur vide est creux, sans aucun liseré visible.**

??? note "Pourquoi, et depuis quand"
    la cible s'allume au moment où on l'approche (`[data-vise]`) — *« un contour qui crie en permanence pour un rôle qu'il ne joue qu'à l'instant du dépôt ajoute une boîte à un écran qui en porte déjà douze »*. 🔴 Mais la bordure RESTE en transparent : *« un `border-style: none` ferait disparaître 2 px de chaque côté : la case sauterait au moment où elle se remplit, et le geste le plus important de l'écran ferait bouger ce qu'on vient de viser. »*

    Valeur : `--creux` · bordure **transparente**, jamais `border-style: none` · Source : NORMES.md § « 2 ter — précision ② », Eric 2026-08-26 : *« on voit bien le liseré quand il est rempli, ton pointillé sert à rien »* · Statut : ratifié

### Rempli, il prend l'habit du jeton { #collecteur-rempli-prend-l-habit-du-jeton }

**Rempli, un collecteur prend le doré ET le relief du jeton.**

??? note "Pourquoi, et depuis quand"
    ⛔ **ce que ça répare** : avant le 26/08 l'état peignait le FOND — *« un créneau invalide effaçait le doré sous un lavis rouge. Le joueur perdait l'information « il y a un objet là-dedans » au moment précis où il en a le plus besoin pour le retirer. »*

    Valeur : `--jeton-teinte` + `--relief` · Source : NORMES.md § « 2 ter », Eric 2026-08-26 : *« rempli prend le doré ET LE RELIEF du jeton, juste un liseré bleu autour pour rappeler que c'est un collecteur »* · Statut : ratifié

### Deux canaux : le remplissage et le liseré { #collecteur-deux-canaux }

**Le REMPLISSAGE dit ce que le collecteur porte, le LISERÉ dit son état.**

??? note "Pourquoi, et depuis quand"
    *« DEUX CANAUX, DEUX MESSAGES, ET C'EST LA TROUVAILLE. »*

    Source : NORMES.md § « 2 ter », 2026-08-26 · Statut : ratifié

### Les couleurs du liseré { #collecteur-lisere-etats }

**Le liseré porte les codes couleur : bleu = pose valide, rouge = mauvaise pose, vert = tout posé.**

??? note "Pourquoi, et depuis quand"
    *« une pose valide = récepteur BLEU, une mauvaise pose = ROUGE, toutes les poses valides = tous VERTS »*, et la raison d'Eric tient avec : *« un vert posé dès le premier dépôt ne laisse plus rien à dire quand tout est fini — il dépense la récompense trop tôt »*.

    Valeur : 2 px · `--creneau-lisere-rempli` · Source : NORMES.md § « 2 ter », Eric 2026-08-26 ; échelle du 2026-08-19 · Statut : ratifié

<!-- DESSIN À FAIRE — les quatre états d'un collecteur côte à côte — vide creux, liseré bleu, rouge, vert -->

### Le liseré entoure, il ne recouvre pas { #collecteur-lisere-entoure-ne-recouvre-pas }

**Le liseré entoure le jeton, il ne le recouvre pas.**

??? note "Pourquoi, et depuis quand"
    *« Rien du jeton n'est mangé. »* Mesuré à 375 × 553 : `2px solid rgb(70,157,106)` contre `2px solid transparent`, **tous deux 87 × 48** — aucun saut.

    Valeur : sonde horizontale — fond de page · **1 seul pixel de liseré** · une transition · le doré, stable · Source : NORMES.md § « 2 ter », mesuré 2026-08-26 à la demande d'Eric · Statut : ratifié

### Le relief remplace le creux { #collecteur-relief-remplace-le-creux }

**Le relief REMPLACE le creux, il ne s'y ajoute pas.**

??? note "Pourquoi, et depuis quand"
    *« un creux dit « pose ici », un relief dit « quelque chose est posé ». Les garder tous les deux ferait un organe qui demande et qui a reçu en même temps. »*

    Source : NORMES.md § « 2 ter », 2026-08-26 · Statut : ratifié

<!-- DESSIN À FAIRE — avant / après — le relief qui REMPLACE le creux, jamais les deux ensemble -->

### La zone de drop { #collecteur-zone-de-drop }

**Une zone de drop est un rectangle très arrondi, creux, dont le liseré porte la couleur du corps du jeton attendu.**

??? note "Pourquoi, et depuis quand"
    *« la cible annonce ce qu'elle accepte avant qu'on lâche »*.

    Valeur : voile max, voire nulle · Source : NORMES.md § « 2. LES ORGANES », validé 2026-08-26 · Statut : ratifié

## Mesures

*ses cotes, et ce qui les calcule.*

### La cote du collecteur { #collecteur-cote }

**Un collecteur a toujours exactement la taille d'un jeton, partout.**

⚠️ En contradiction avec [`collecteur.equipement-44`](#collecteur-equipement-44) — voir [C3](../a-trancher.md#c3).

??? note "Pourquoi, et depuis quand"
    la cote ne s'écrit nulle part, elle se **déduit du cadre** une seule fois et les deux organes la lisent. *« Deux nombres égaux divergent au premier qui bouge ; un jeton de mesure partagé ne peut pas diverger. »*

    Valeur : `--collecteur-case`, déclarée sur `.choix-glisse` · garde `tests/collecteur-jeton.test.mjs` · Source : NORMES.md § « 1 ter bis », Eric 2026-08-29 : *« taille du collecteur toujours la même que le jeton, partout »* puis *« règle universelle : un collecteur = un jeton en taille. Ne varie jamais. »* · Statut : ratifié (⚠️ contredit par le collecteur d'Équipement à 44 — voir [C3](../a-trancher.md#c3))

### La cote se déclare sur l'ancêtre commun { #collecteur-cote-sur-l-ancetre-commun }

**Une cote partagée se déclare sur l'ANCÊTRE COMMUN des deux organes, jamais sur l'un des deux.**

??? note "Pourquoi, et depuis quand"
    *« LE TROISIÈME EST LE PLUS RETORS, ET C'EST UNE LOI GÉNÉRALE : un pourcentage se résout chez celui qui l'utilise. Une cote partagée n'est partagée que si sa BASE l'est. »*

    Valeur : mesuré — la cote à `25%` rendait 63 contre 74 (vivier 277, rangée 320) · Source : NORMES.md § « 1 ter bis — trois façons de la faire diverger », 2026-08-29 · Statut : ratifié

### Une cote dictée par un voisin n'est pas une cote { #collecteur-cote-dictee-par-un-voisin }

**Une cote dictée par un voisin n'est pas une cote : le vivier se centre dans sa rangée au lieu de s'étirer.**

??? note "Pourquoi, et depuis quand"
    ce n'était pas le nom qui poussait — *« la colonne du chevron (flèche + compte, 60 px) étirait le vivier par le `align-items: stretch` de la rangée, et le jeton suivait »*. L'égalisation par CONTENU (deux jetons côte à côte, un nom qui se replie) vit un niveau plus bas et reste intacte.

    Valeur : mesuré — jeton **87 × 60** contre case **87 × 48** ; parade `align-self: center` (`listes.css`) · Source : NORMES.md § « La leçon d'« Unseen Servant » », 2026-08-29 · Statut : ratifié

### Le liseré rempli : 2 px { #collecteur-lisere-2px }

**Le liseré rempli vaut 2 px, et 2 px est un JETON, pas un littéral.**

??? note "Pourquoi, et depuis quand"
    à 1 px il se confondait avec le liseré que tout organe porte, *« alors qu'il est le seul trait de l'écran qui dise « cette case a reçu quelque chose » »*. ⚠️ Première lecture fausse : *« j'avais épaissi la bordure de BASE, donc le pointillé d'attente en même temps. Une case vide n'a rien à crier ; une case remplie, si. »*

    Valeur : `--creneau-lisere-rempli: 2px` · Source : NORMES.md § « 2 ter — précision ① », Eric 2026-08-26 : *« le collecteur doit doubler son épaisseur de liseré, trop fin pas assez visible »* · Statut : ratifié

### Quatre collecteurs par ligne { #collecteur-quatre-par-ligne }

**Les collecteurs ne dépassent jamais quatre par ligne ; au-delà on passe à la ligne, et une ligne incomplète se centre.**

??? note "Pourquoi, et depuis quand"
    ⚠️ *« LES DEUX RÈGLES DE LARGEUR SE CONTREDISENT SI ON LES ÉCRIT EN NOMBRES. À 360 la rangée offre 320, et quatre cases pleines plus leurs gouttières en demandent 372. »* C'est la cote déduite qui les réconcilie — *« sur un grand écran le socle plafonne, à l'étroit le quart gagne et le vide cède, jamais l'organe »*.

    Valeur : `--par-rangee` = 4 · formule `min(socle, (100% − gouttières) / 4)` · Source : NORMES.md § « 1 ter ter », Eric 2026-08-29 : *« pour tous les collecteurs de skills se limiter à des lignes de 4 »* · Statut : ratifié

### Les six caractéristiques sur une ligne { #collecteur-six-caracs-une-ligne }

**Les six caractéristiques tiennent sur UNE ligne de collecteurs, jamais de retour.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« LA RANGÉE DES SIX SE NOMME, ELLE NE SE COMPTE PAS. La classe vient de l'appelant, pas d'un `:nth-child(6)` qui aurait rangé sur une ligne n'importe quel écran à six créneaux. »*

    Valeur : `data-rangs="caracs"` · `renderChoixGlisses({ rangee: "caracs" })` · Source : NORMES.md § « 1 ter ter », Eric 2026-08-29 : *« STR DEX CON INT WIS CHA — règle spécifique, là on met tout sur une ligne ! »* · Statut : ratifié

### La même écriture que le jeton { #collecteur-ecriture-comme-le-jeton }

**Les mêmes règles d'écriture s'appliquent au jeton et au collecteur : valeur en T1, nom en T1 capitales.**

??? note "Pourquoi, et depuis quand"
    *« UN COLLECTEUR REMPLI PORTE LE MOT DU JETON DÉPOSÉ. Deux corps pour le même mot selon qu'il est tenu ou posé, ce serait deux modèles pour un organe dont §2 dit qu'il n'en a qu'un. »* La capitale distingue l'étiquette de la valeur, **jamais la taille**. ⛔ Et l'écart était **dormant** : une règle plus spécifique rattrapait à T1 dans les écrans de choix. *« Une valeur qui n'est juste que parce qu'une autre la corrige plus loin n'est pas juste, elle est couverte. »*

    Valeur : `.glisse-creneau-valeur` ramené de `--t3` à `--t1` · Source : NORMES.md § « 1 ter bis² », Eric 2026-08-29 : *« les mêmes règles d'écriture s'appliquent aux tokens et aux collecteurs »* · *« comme les collecteurs se transforment en token »* · Statut : ratifié

### Le collecteur d'Équipement : 44 { #collecteur-equipement-44 }

**Le collecteur de l'Équipement garde une hauteur de 44, pas 48.**

⚠️ En contradiction avec [`collecteur.cote`](#collecteur-cote) — voir [C3](../a-trancher.md#c3).

??? note "Pourquoi, et depuis quand"
    *« un collecteur n'est pas un jeton qu'on glisse, c'est une cible qu'on VISE, et son plancher est le pouce »*. ⛔ Le doré du rempli ne change pas cette cote.

    Valeur : `.carte-r-collecteur` → `--touch` 44 · Source : NORMES.md § « 2 ter — ce qui reste vrai de la cote », 2026-08-26 · Statut : ⚠️ **contredit** par `collecteur.cote` (29/08, « ne varie jamais ») — voir [C3](../a-trancher.md#c3)

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### « drop it here » { #collecteur-drop-it-here }

**Un collecteur vide affiche « drop it here » en T1 minuscules, italique, à la couleur du libellé — et le mot s'efface au remplissage.**

??? note "Pourquoi, et depuis quand"
    le contour tireté parti, *« un tiret seul ne dit plus ce qu'on attend de vous »*. Le mot occupe la ligne que le tiret occupait déjà, dans le même corps : il ne coûte rien. L'italique et la couleur d'étiquette le rangent du bon côté : sans eux il se lisait comme une réponse — *« comme si le personnage s'appelait « drop it here » »*. Les minuscules sont garanties par la règle : le nom porte `text-transform: uppercase`, la valeur porte `none`.

    Valeur : `--text-muted` italique (`rgb(146,140,127)`) vide → `rgb(216,211,201)` droit rempli · `[data-rempli="false"]` · Source : NORMES.md § « 2 ter — précisions ③ et ④ », Eric 2026-08-26 : *« drop it here en T1 dans le collecteur, ça disparaît quand c'est rempli »* · *« en minuscules bien sûr »* · *« de la même couleur qu'Alignment, et en italique »* · Statut : ratifié

### Le nombre d'une rangée est dicté par l'étape { #collecteur-rangee-libre-en-nombre }

**Le nombre de collecteurs d'une rangée est dicté par ce que l'étape demande — c'est le vivier qui est borné, pas eux.**

??? note "Pourquoi, et depuis quand"
    *« le vivier — ce qui PROPOSE — trois colonnes toujours ; la rangée de collecteurs — ce qui REÇOIT — libre »*.

    Valeur : `.glisse-creneaux` libre · `.glisse-vivier` = 3 colonnes · Source : NORMES.md § « TROIS MAX POUR UNE SÉLECTION », Eric 2026-08-26 · Statut : ratifié (⚠️ borné à 4 depuis le 29/08 — voir `collecteur.quatre-par-ligne`)
