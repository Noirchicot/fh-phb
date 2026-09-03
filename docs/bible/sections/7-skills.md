# 7 · Skills & Tools

Ce que l'écran des compétences fait **autrement**. `9` règles, tirées des commits et du code du
dépôt `fhpc` — ⚠️ aucune n'est dans `NORMES.md`.

## Ce que cette étape fait autrement

### Le bouton « 0 » n'existe pas { #skills-pas-de-bouton-zero }

**Il reste trois ronds : l'absence de maîtrise est l'ABSENCE de remplissage, pas un quatrième bouton.**

??? note "Pourquoi, et depuis quand"
    Ce n'était pas un détail d'affichage : avec QUATRE ronds au seuil tactile, il ne restait plus assez de largeur pour le **nom** de la compétence. ⭐ Le retour à zéro était déjà là — re-toucher le rond actif l'efface.

    Valeur : `4` ronds à `44` px ne laissaient que `76` px au nom · `3` ronds · Source : Eric, 2026-08-14 : *« le bouton 0 est obsolète. Rien de rempli = 0. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le reste flotte, le calcul défile { #skills-le-reste-flotte }

**Le compteur est coupé en deux : la ligne du RESTE flotte et ne quitte jamais l'écran, la ligne du calcul disparaît dans le défilement — et `Reset` est dans la ligne qui flotte.**

??? note "Pourquoi, et depuis quand"
    On garde sous les yeux COMBIEN IL RESTE, pas d'où ça vient. ⛔ L'architecte avait lu « à droite du calcul » comme la seconde ligne et bâti toute une justification dessus — « `Reset` est destructeur, le sortir du champ permanent évite les gestes accidentels ». Élégant, et **faux** : Eric a corrigé, `Reset` reste toujours atteignable, sans remonter.

    Valeur : `2` lignes · Source : Eric, 2026-08-14 : *« je voudrais un flottant pour voir le compte, ça disparaît »*, puis *« non, elle est dans la barre du pool »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le compteur dit « Free », pas « Pool » { #skills-compteur-dit-free }

**Le compteur nomme les points LIBRES, parce que ce sont les seuls des trois totaux que le joueur dépense.**

??? note "Pourquoi, et depuis quand"
    Tant que la fiche disait « Free points » et le compteur « Pool », **deux mots désignaient le même nombre à deux écrans d'intervalle** — et l'autre moitié du canon, les points liés, n'était nommée nulle part.

    Valeur : `3` totaux à la fiche de classe · Source : Eric, 2026-08-20 : *« mets à jour le compteur dans skills »* · Statut : ratifié, déployé, ⚠️ hors corpus

### La bourse d'espèce se règle chez Species { #skills-bourse-d-espece-chez-species }

**Le tableau de la bourse d'espèce ne vit pas sur Skills : il vit là où le choix se prend, et Skills en LIT le compte sans pouvoir le changer.**

??? note "Pourquoi, et depuis quand"
    ⛔ La même bourse pilotée depuis deux écrans, sur les mêmes chemins, aurait fini par diverger. ⭐ Ce qui part de Skills, c'est le DOUBLON, pas la fonction : savoir ce qu'on a investi ailleurs n'oblige pas à pouvoir le modifier ici.

    Source : Eric, 2026-08-26 : *« le tableau Species skill budget DÉGAGE »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Trois bandes, et le seul titre du parcours { #skills-trois-bandes-et-un-titre }

**Skills est bâti en trois bandes — titre fixe, flux, pied fixe — et c'est le seul écran d'étape qui garde un titre.**

??? note "Pourquoi, et depuis quand"
    L'écran n'avait aucune des trois : `4 357` px de contenu pour `384` de fenêtre, et le pied vivait DANS ce flux. Relevé : le pied monte pixel pour pixel avec le texte, et `Done` finissait posé sur la molette de catégories. ⚠️ **Le titre est en tension déclarée** avec la norme générale (« une étape du parcours — la ceinture la nomme à 8 px de là — titre ⛔ non ») : le croquis d'Eric dessine une bande TITRE, **les croquis priment sur le texte**, et une seule ligne le retire s'il tranche dans l'autre sens.

    Valeur : `4 357` px pour `384` de fenêtre · pied de y `553` à y `47` sur `506` de défilement · Source : Eric, croquis du 2026-08-26 : *« les boutons cachent le texte »* · Statut : ratifié, déployé, ⚠️ hors corpus, ⏳ tension déclarée

### La barre blanche descend dans une dalle fixe { #skills-barre-blanche-descend }

**La barre du haut disparaît totalement : ses éléments descendent dans une petite dalle fixe sous le titre, et Skills cesse de garnir le bandeau du cadre.**

??? note "Pourquoi, et depuis quand"
    Cette barre vivait dans le bandeau du CADRE, donc **hors de toute dalle**. Tant que le cadre peignait, elle avait l'air d'appartenir à l'écran ; depuis que le fond est nu, c'est une bande opaque posée sur l'image. ⭐ Le bandeau ne disparaît pas, il se **vide** — c'est sa loi. Bénéfice mesuré : cette dalle fixe devient l'ancre du `?`, et **un rappel qui défile n'est plus un rappel**.

    Valeur : contraste des deux lignes de la bourse sur le fond nu — `1,05` le jour · Source : Eric, 2026-08-26 : *« la barre blanche doit TOTALEMENT disparaître, et ses éléments reportés sur la petite dalle sous le titre Skills. Cette petite dalle restera fixe. »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Skills est le seul écran à fond ouvert, et sans plafond { #skills-fond-ouvert-sans-plafond }

**La carte de Skills cesse d'être une surface : le décor passe entre des dalles qui flottent, et sa largeur n'est PAS plafonnée.**

??? note "Pourquoi, et depuis quand"
    ⚠️ L'architecte a proposé de plafonner ; Eric a tranché l'inverse, et sa lecture est passée au canon : **un écran ainsi composé n'a pas de bloc à borner**. La ligne porte désormais un « ne pas corriger ».

    Valeur : à `360` les cartes font `352`, Skills fait `360` · sept écrans sur huit portent un plafond, Skills non — il s'étale jusqu'à `1440` · Source : Eric, 2026-08-29 : *« le data bleed de Skills me convient »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Quatre par ligne, et la ligne incomplète se centre { #skills-quatre-par-ligne }

**Les collecteurs de compétences se rangent par lignes de quatre, et une ligne incomplète se centre.**

??? note "Pourquoi, et depuis quand"
    C'est l'exception **jumelle** de celle des six caractéristiques — et les deux se contredisent si on les écrit en nombres : à `360`, la rangée offre `320`, et quatre cases pleines plus leurs gouttières en demandent `372`. ⭐ La sortie est que la cote se DÉDUIT du cadre, une seule fois, et que le collecteur et son jeton la lisent tous les deux : le quatre par ligne est **plafonné**, jamais écrit en dur.

    Valeur : `4 + 3` centré · à `360` la rangée offre `320` pour `372` demandés · Source : Eric, 2026-08-29 : *« pour tous les collecteurs de skills, se limiter à des lignes de 4 ; après on passe à la ligne suivante ; si on ne complète pas la ligne à 4, on centre »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Une bourse dépassée n'est pas dépensée { #skills-bourse-depassee }

**Un dépassement n'est pas une réponse : le compte est EXACT, le verrou l'emporte sur la signature, le gendarme parle en rouge à la place de l'aiguilleur — et la porte du retour reste ouverte.**

??? note "Pourquoi, et depuis quand"
    Le noyau faisait tout juste ; c'est l'écran qui l'ignorait — il testait « posé ≥ attendu », et trois novices posés pour deux points passaient pour une réponse. ⭐ Le refus doit **accuser sans emprisonner** : les boutons de sortie sont désarmés et rouges avec une main d'arrêt, la tête accusée du bilan passe en rouge, et la porte accusée devient un octogone rouge PLEIN — qui bat le vert de la signature — avec un doigt au survol. ⛔ Et le mot du refus reprend celui du chapitre : une même voix.

    Valeur : `3` novices pour `2` points · l'égalité stricte remplace le « au moins » · Source : Eric, 2026-08-27 : *« tu peux bloquer le Next et faire parler le gendarme en rouge à la place de l'aiguilleur »* · *« il faut bloquer le Done de Elf aussi, et laisser le bouton visible pour pouvoir retourner dans Skill budget »* · Statut : ratifié, déployé, ⚠️ hors corpus

## Ce qu'aucune règle ne dit

- **Le vocabulaire des refus est écrit dans Skills et exporté** : le gendarme de n'importe quelle étape y lit son mot, `11` clefs. ⚠️ Le nom a dû changer avec le métier — *« un nom qui dit deux choses n'a pas sa place ici »* — et deux tables coexistaient, si bien qu'un identifiant de développeur brut s'affichait en rouge sur deux écrans de joueur. Citations d'Eric : *« l'action de blocage est une règle générale »* · *« processus idem species »* (2026-08-29). ⛔ Aucune règle consignée au corpus.
