# Le popup

Il y a trois popups et trois couleurs : le **guide** (parchemin, optionnel), l'**aiguilleur**
(bleu, il prévient), le **gendarme** (rouge, il dit l'erreur). Un seul à l'écran à la fois.

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### Trois rôles, trois couleurs { #popup-trois-roles-trois-couleurs }

**Il y a trois popups : le GUIDE (parchemin, optionnel), l'AIGUILLEUR (bleu, il prévient), le GENDARME (rouge, il dit l'erreur).**

??? note "Pourquoi, et depuis quand"
    *« Le temps les sépare : l'aiguilleur parle AVANT (ça va coincer), le gendarme parle APRÈS (ça a coincé, voilà quoi). Un aiguilleur qui constate arrive trop tard, un gendarme qui anticipe crie pour rien. »* Le guide n'a pas de couleur de signal *« et c'est ce qui le rend optionnel : il ne réclame rien. Les deux autres portent un signal, donc ils interrompent. »*

    Valeur : la plomberie `.popup` existe déjà — un composant, trois teintes · Source : NORMES.md § « 7. LES TROIS POPUPS », Eric 2026-08-26 : *« le gendarme dit l'erreur »* · *« l'aiguilleur prévient »* · Statut : ratifié (l'APPLICATION est en standby)

### Le violet est pris par la magie { #popup-violet-est-pris-par-la-magie }

**Le violet ne peut pas servir à un popup : violet = MAGIE.**

??? note "Pourquoi, et depuis quand"
    *« LE VIOLET EST PRIS. Le gendarme redevient rouge. »*

    Valeur : voyants d'attunement et tout le magique de l'Équipement · Source : NORMES.md § « 7 », Eric 2026-08-26 · Statut : ratifié

### `--magie`, une teinte à créer { #popup-magie-teinte-a-creer }

⏳ **À trancher.** Travail réel, pas une convention à écrire.

**`--magie` est une teinte à créer, et la pastille d'attunement doit la porter.**

??? note "Pourquoi, et depuis quand"
    *« Les croquis d'Eric priment sur le texte et sur le code. »* Leçon de la façon dont on l'a trouvé : *« j'ai d'abord écrit « elle porte `--accent`, pas du violet » — en lisant le NOM du jeton, pas sa VALEUR. Aucun de nous deux ne lisait la même chose. »*

    Valeur : `.b3-attune` porte aujourd'hui `--accent` = `#845933`, mesuré **teinte 28°**, un brun-cuivre · ⛔ aucun violet dans `tokens.css` · Source : NORMES.md § « Le code est en ÉCART sur ce point », 2026-08-26 · Statut : à trancher (⏳ travail réel, pas une convention à écrire)

## Mesures

**Aucune règle de mesure consignée.** Ni cote, ni corps de texte, ni cote de pastille — [`popup.points-non-tranches`](#popup-points-non-tranches) dit d'ailleurs que la FORME de la pastille reste ouverte.

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Un seul popup, trois pastilles { #popup-pile-et-pastilles }

**Un seul popup à l'écran, trois pastilles : le rouge est au-dessus, le bleu au-dessus du parchemin, et on navigue de l'un à l'autre SANS FERMER.**

⚠️ En contradiction avec [`popup.parle-on-ne-l-appuie-pas`](#popup-parle-on-ne-l-appuie-pas) · [`popup.aiguilleur-nom-et-critere`](#popup-aiguilleur-nom-et-critere) — voir [C18](../a-trancher.md#c18).

??? note "Pourquoi, et depuis quand"
    trois choses réglées d'un coup — ⛔ jamais trois bulles empilées · *« la hiérarchie est portée par LA PILE, pas par la couleur : le plus urgent est devant, et ça se voit sans lire »* · *« un popup qui en cacherait un autre ferait disparaître une information ; la pastille prouve qu'elle existe »*. ⭐ *« « sans fermer » est le mot qui compte : fermer pour rouvrir ferait perdre le fil. »*

    Valeur : ordre 🔴 gendarme › 🔵 aiguilleur › 📜 guide · Source : NORMES.md § « LES TROIS COEXISTENT », Eric 2026-08-26 : *« c'est le vrai problème, ça. Le rouge est au-dessus, le bleu au-dessus du parchemin. Une pastille permet de naviguer d'une couleur à l'autre SANS FERMER »* · Statut : ratifié

<!-- DESSIN À FAIRE — le popup et ses trois pastilles — rouge au-dessus, bleu au-dessus du parchemin, et le chemin de l'un à l'autre sans fermer -->

### Une pastille seulement si l'autre parle { #popup-pastille-seulement-si-l-autre-parle }

**Une pastille n'apparaît que si l'autre voix a quelque chose à dire.**

??? note "Pourquoi, et depuis quand"
    *« Une pastille qui ne mène à rien est un bouton qui ment — et le joueur cesserait de les regarder. »*

    Source : NORMES.md § « LES TROIS COEXISTENT », 2026-08-26 · Statut : ratifié

### Les trois points ouverts { #popup-points-non-tranches }

⏳ **À trancher.**

**Trois points restent ouverts : si le gendarme se ferme tout seul, la FORME de la pastille, et ce qu'on voit quand un seul des trois parle.**

??? note "Pourquoi, et depuis quand"
    le corpus les laisse ouverts explicitement : « ⏳ Non tranché : si le gendarme se ferme tout seul · la FORME de la pastille · ce qu'on voit quand un seul des trois parle (zéro pastille, sans doute). »

    Valeur : zéro pastille, sans doute · Source : NORMES.md § « LES TROIS COEXISTENT », 2026-08-26 · Statut : à trancher

### L'application est en standby, pas la norme { #popup-application-en-standby }

⏸️ **En standby.**

**C'est l'APPLICATION des trois voix qui est en standby, pas la norme : un lot LIT cette section et l'applique, il ne PART PAS en chantier dessus.**

??? note "Pourquoi, et depuis quand"
    *« Une norme en standby resterait une norme non écrite — celle-ci ne l'est pas. »* ✅ Une pièce sort du standby : *« le point d'entrée au guide `?` doit être fait par contre »*.

    Valeur : chantier au vault, `0.TASKS/Tasks RPG.md` — *« FHPC : les trois voix »* · Source : NORMES.md § « 7 », Eric 2026-08-26 : *« les guide gendarme aiguilleur, toujours en standby et à l'étude »*, puis *« c'est juste son APPLICATION qui est en standby »* · Statut : en standby

### Ce qu'un popup pose derrière lui { #popup-fenetres-derriere-non-reglees }

⏸️ **En standby.**

**Ce qu'un popup pose derrière lui n'est réglé par aucune règle — trois objets, trois traitements mesurés.**

??? note "Pourquoi, et depuis quand"
    ⚠️ ce qu'un lot doit savoir quand même : *« le `.popup` a une raison DURE de ne rien poser derrière — ancré `bottom: 0`, il est là où vivent les récepteurs du glisser, et un dépôt atterrissait dessus (défaut mesuré le 20/08, payé par `pointer-events: none`). ⛔ Ne pas lui ajouter un voile « pour faire comme l'aiguilleur ». »*

    Valeur : `.popup` ne voile **rien** · `.aiguilleur` du départ voile **tout l'écran à 72 %** · `.confirm-dialog` vit **dans le flux** · Source : NORMES.md § « 7 », mesuré 2026-08-26 ; Eric : *« ça fait partie du standby »* · Statut : en standby

### Un popup parle, on ne l'appuie pas { #popup-parle-on-ne-l-appuie-pas }

**Un popup parle, on ne l'appuie pas.**

⚠️ En contradiction avec [`popup.pile-et-pastilles`](#popup-pile-et-pastilles) · [`popup.aiguilleur-nom-et-critere`](#popup-aiguilleur-nom-et-critere) — voir [C18](../a-trancher.md#c18).

??? note "Pourquoi, et depuis quand"
    « deux d'entre eux ne se touchent pas : le voyant (non cliquable) et le popup (il parle, on ne l'appuie pas). ⛔ Ne pas leur donner l'apparence d'un contrôle. »

    Source : NORMES.md § « 2. LES ORGANES », 2026-08-26 · Statut : ⚠️ ratifié mais ouvert — l'aiguilleur porte **deux boutons**, et *« à Eric de dire si ce sont deux organes ou un seul »* (voir [C18](../a-trancher.md#c18))

### L'aiguilleur n'est pas une aide { #popup-aiguilleur-nom-et-critere }

**Ce qu'on ne peut pas refuser n'est pas une aide : la fenêtre du départ est un AIGUILLEUR, pas un guide.**

⚠️ En contradiction avec [`popup.parle-on-ne-l-appuie-pas`](#popup-parle-on-ne-l-appuie-pas) · [`popup.pile-et-pastilles`](#popup-pile-et-pastilles) — voir [C18](../a-trancher.md#c18).

??? note "Pourquoi, et depuis quand"
    *« le guide est défini par son caractère OPTIONNEL — « il ne réclame rien », on le congédie, on le rouvre au `?`. Celui-ci ne se congédie pas : sans réponse, l'étape n'a pas de point de départ. »*

    Valeur : « guide obligatoire » → `decision-kit` → `aiguilleur`, trois noms en un jour · Source : NORMES.md § « CE QUI EST TRANCHÉ MALGRÉ LE STANDBY », Eric 2026-08-26 : *« c'est plutôt un aiguilleur, on a TOUJOURS besoin de lui »* · Statut : ratifié

### Le guide est un popup { #popup-guide-est-un-popup }

**Le guide est un popup : il ne vit jamais dans le flux et ne prend aucune place dans le budget vertical.**

??? note "Pourquoi, et depuis quand"
    *« la réponse n'est pas « on enlève quelque chose », c'est « ce quelque chose n'avait rien à faire dans le flux ». Un contenu optionnel qui occupe une place fixe n'est pas optionnel. »* ⚠️ Ce que ça n'autorise pas : ⛔ *« sortir du flux tout ce qui gêne. Le guide en sort parce qu'il est optionnel, pas parce qu'il est encombrant. »*

    Valeur : mesuré — le mot du guide valait **63 px sur Class**, et `.parcours-resume` de Species **448 px** à lui seul · Source : NORMES.md § « LE GUIDE EST UN POPUP », Eric 2026-08-26 : *« le guide devient un popup, donc il ne déborde pas »* · Statut : ratifié
