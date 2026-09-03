# La feuille

Ce que l'écran de récapitulatif fait **autrement**. `5` règles, tirées du code du dépôt `fhpc`
(14 → 26 août) — ⚠️ aucune n'est dans `NORMES.md`.
⚠️ **Rien n'a bougé sur cet écran depuis le 26 août** : sur les sept derniers jours de commits, la
feuille n'apparaît que comme **juge** (le vert de la ceinture) et comme cible de gardes, jamais
comme écran retouché.

## Ce que cette étape fait autrement

### Un masque, pas un déversoir { #sheet-un-masque-pas-un-deversoir }

**La feuille est un masque : que du texte, sur une dalle majeure UNIQUE, dont la longueur ne grandit pas avec le personnage.**

??? note "Pourquoi, et depuis quand"
    L'écran déversait tout l'état résolu — `11 894` px mesurés sur le personnage d'exemple, `27 370` après quelques choix de plus. ⛔ Et le pire : **il grandissait avec le personnage**, « l'écran devient d'autant plus illisible que le personnage est abouti » — le contraire exact de ce qu'on attend d'un récapitulatif.

    Valeur : `11 894` → `27 370` px · `538` lignes dont `464` de déversement · `1` dalle · Source : Eric, 2026-08-14 : *« un masque propre, TRÈS CLAIR »* · *« QUE DU TEXTE »* · *« sur une DALLE MAJEURE UNIQUE — pas plusieurs »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La feuille ne juge rien { #sheet-ne-juge-rien }

**« Fait / pas fait » est prononcé par le carnet : cet écran GROUPE par étape et met en phrases, sa table n'est qu'un routage — sans un seul seuil.**

??? note "Pourquoi, et depuis quand"
    ⛔ Une liste de conditions écrite écran par écran aurait donné **deux définitions de « terminé »** — celle qui allume la signature et celle qui remplit la feuille — et elles auraient divergé au premier lot suivant. ⭐ Le juge est extrait et appelé aussi par la ceinture, plutôt que recopié : deux réponses à une seule question est la faute que ce dépôt paie le plus cher. ⚠️ Et une étape sans AUCUN fait n'est pas finie — sans cette moitié, une étape muette s'allumerait en vert d'entrée de jeu.

    Source : ⚠️ **aucune citation d'Eric sur le mécanisme** — la seule datée à côté est *« la lumière verte »* (2026-08-19) · Statut : déployé, ⚠️ hors corpus

### Traverser n'est pas finir { #sheet-traverser-n-est-pas-finir }

**Le vert de la ceinture est prononcé par le juge de la feuille, jamais par « tu es passé devant ».**

??? note "Pourquoi, et depuis quand"
    Le vert vivait sur le statut de passage : **un chapitre traversé sans rien y poser s'allumait**. ⭐ Et la distinction vaut pour la suite : « en cours » n'est pas « ouvert une fois ». Un anneau se lit « en cours », un disque PLEIN se lit « fait » — la différence entre un contour et un état.

    Valeur : `4` états · Source : Eric, 2026-08-26 : *« le 1 dans le belt doit être TOTALEMENT vert, et on doit voir le chiffre dessus »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Chaque ligne mène à son étape { #sheet-chaque-ligne-mene-a-son-etape }

**Chaque ligne du récapitulatif est cliquable et mène à l'étape qui la produit.**

??? note "Pourquoi, et depuis quand"
    Voir qu'il manque quelque chose sans pouvoir y aller ferait de cet écran un **constat**, pas un récapitulatif. C'est tout le point de l'écran.

    Source : ⚠️ **aucune citation d'Eric, aucune date** — la règle ne vit que dans un commentaire de `review-step.mjs` · Statut : déployé, ⚠️ hors corpus

### Les trois portes du bas n'ont aucune condition { #sheet-trois-portes-sans-condition }

**Les trois portes du bas — la vue experte et les deux exports — s'ouvrent toujours, et aucune ne construit un rendu neuf.**

??? note "Pourquoi, et depuis quand"
    Un personnage à peine commencé s'exporte aussi : c'est un **brouillon valide**, et le cacher jusqu'à « fini » ferait de l'export une récompense au lieu d'une sortie. ⭐ La vue experte et l'export en page rendent la MÊME page — exactement ce que l'écran déversait avant le masque : le lot ne l'a pas supprimé, il l'a mis derrière une porte ; l'une l'ouvre, l'autre l'enregistre.

    Valeur : `3` portes · Source : ⚠️ **aucune citation d'Eric** pour l'absence de condition · Statut : déployé, ⚠️ hors corpus

## Ce qu'aucune règle ne dit

- **Il n'y a PAS de bouton vers la fiche jouable, et c'est le seul point du mandat qui reste ouvert.** La fiche v2 est réservée à une décision d'Eric et n'existe pas : un bouton vers rien serait le « faux magasin » que le mandat interdit deux fois. ⏳ **Appartient à Eric.**
- **Le nom du fichier exporté vient du nom du personnage et de rien d'autre** — écraser est le comportement voulu, un horodatage ferait ranger deux exports du même personnage comme deux personnages. ⚠️ Aucune citation, aucune date.
- **La feuille affiche les refus du moteur TELS QUELS**, jamais reformulés, nomme les choix qu'aucune règle ne consomme, et ⛔ une rubrique vide n'est pas rendue. ⚠️ Aucune citation, aucune date.
- **La feuille est la DESTINATION** : pas de pas suivant, donc pas de palier, et la signature y reste éteinte. ⚠️ Aucune citation, aucune date.
