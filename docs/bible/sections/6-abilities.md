# 6 · Abilities

Ce que l'écran des caractéristiques fait **autrement**. `8` règles, tirées des commits et du code
du dépôt `fhpc` — ⚠️ aucune n'est dans `NORMES.md`.

## Ce que cette étape fait autrement

### Le carré ne porte rien d'écrit { #abilities-carre-ne-porte-rien-d-ecrit }

**Le carré d'une caractéristique ne porte que le dé ou la cible — rien d'écrit dedans — et aucun total ne se répète au-dessus des dés.**

??? note "Pourquoi, et depuis quand"
    Le dé PORTE déjà sa valeur, peinte sur sa face : la répéter au-dessus, c'était le même nombre écrit deux fois à dix pixels d'écart. ⚠️ Le prix est dit : une valeur qu'une caractéristique portait déjà au document ne s'affiche plus tant qu'aucun dé n'est posé — un joueur qui revient voit six cibles vides alors que ses scores existent. ⭐ Le dessin se défend : cet écran sert à POSER des dés, et une cible qui montre déjà un nombre n'invite pas à en poser un. La valeur reste dite à l'accessibilité. ⛔ Et une cible vide montre trois cercles **dessinés**, jamais un glyphe : un glyphe change de dessin selon la police installée.

    Valeur : `4 × 4` dés · `6` cibles · Source : Eric, 2026-08-16 : *« tu dessines un carré avec une cible de la taille du dé, RIEN ÉCRIT DEDANS »* · *« enlève les chiffres au-dessus des dés aussi »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le bonus n'apparaît qu'au collecteur { #abilities-bonus-au-collecteur }

**Le modificateur n'apparaît qu'au collecteur, sous le carré, à l'extérieur, et seulement quand un dé y est posé.**

??? note "Pourquoi, et depuis quand"
    Un modificateur posé au vivier n'aurait été **celui de personne** : un dé n'appartient encore à aucune caractéristique, et son brut ne survit pas à la pose. Deux nombres pour un dé, dont un qui ne serait jamais vrai. ⭐ Une cible vide n'a pas de bonus à montrer — le nombre qui le produirait n'a pas encore été choisi.

    Source : Eric, 2026-08-16 : *« aucun intérêt de mettre les bonus sous chaque dé, seulement en bas dans le collecteur »* · *« quand un dé se pose sur la cible, en dessous, à l'extérieur de ce carré, apparaît le bonus de carac »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le dé nomme la carac, le bonus dit ce qu'elle donne { #abilities-le-de-nomme-la-carac }

**Sous un dé posé, le collecteur n'affiche que le BONUS — jamais le score — même quand un boost rend le bonus incohérent avec le chiffre du dé.**

??? note "Pourquoi, et depuis quand"
    ⚠️ L'architecte a objecté et Eric a tranché contre lui : `13` au dé, un boost à `14`, donc `+2` — mot pour mot la contradiction qu'un lot précédent avait corrigée. ⭐ Sa réponse tient pourtant : sur cet écran, le dé qu'on pose EST le score de base qu'on choisit ; ce que le boost en fait appartient à la fiche, pas au geste. Le dé dit le choix, le bonus dit ce qu'il donne, et les deux sont à deux endroits distincts. ⛔ Ne pas remettre le score : ce serait rouvrir un arbitrage tranché.

    Valeur : `13` au dé, `+2` au bonus — le cas qui a servi d'objection · Source : Eric, 2026-08-16 : *« je m'en fous, le dé nomme la carac »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le joueur regarde tomber les dés { #abilities-le-joueur-regarde-tomber }

**Chaque jet est tiré à l'instant où ses dés quittent la main — jamais d'avance — et le plateau ne passe jamais par un redessin.**

??? note "Pourquoi, et depuis quand"
    Un résultat tiré d'avance et un tiré en direct ont la même distribution : le joueur ne peut pas les distinguer. ⭐ Mais un dé qui roule doit **décider**, pas rejouer une décision déjà prise — sinon l'animation est une reconstitution. ⛔ Et un redessin remplace tout le contenu de la scène : les canvas mourraient à chaque jet, en pleine animation. La séquence écrit donc dans des nœuds qui existent déjà.

    Valeur : pause `2500` ms — Eric a essayé `2000` et a préféré plus lent · ~`16` contextes graphiques, plafond du navigateur · Source : Eric, 2026-08-15 : *« il doit voir le process, je veux qu'il voie »* · *« ça remet en question le hasard, même s'il existe et que la temporalité est différée »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Et il peut aussi ne pas regarder { #abilities-flash-coexiste }

**Le plateau offre AUSSI un jet éclair où rien ne roule : les deux modes coexistent, le joueur choisit s'il regarde.**

??? note "Pourquoi, et depuis quand"
    ⚠️ L'architecte avait lu « flash » comme « vite mais visible » et argumenté que cacher les jets contredirait « je veux qu'il voie ». **Faux** : Eric veut voir, et il veut aussi pouvoir ne pas voir. ⭐ L'éclair sert le MÊME lot que la séquence lente — même définition d'un lot, mêmes cases remplies d'un coup. ⛔ Et la remise à zéro marche « même en plein milieu », donc le minuteur doit être annulable, sinon la salve continue après.

    Source : Eric, 2026-08-15 : *« on voit le résultat et c'est tout, on ne voit pas le process et les erreurs »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Le détail d'un jet écrit ce qui est tombé, et rien d'autre { #abilities-detail-du-jet }

**Le détail d'un jet écrit trois dés et deux signes `+` — jamais de flèche vers un total corrigé.**

??? note "Pourquoi, et depuis quand"
    Deux jets voisins s'écrivaient de deux façons, et **une ligne qui change de forme selon le cas se lit deux fois avant d'être comprise**. ⚠️ Le coût est assumé et écrit : sous un dé à `14`, `3+6+2` ne fait pas 14 — le plancher a parlé et la ligne ne le dit plus. L'écart est dit **une fois**, dans l'infobulle du plateau qui garde la forme longue.

    Valeur : `3` dés, `2` signes · Source : Eric, 2026-08-17 : *« tes totaux changent de nomenclature avec le 8 et le 14 ; moi je préfère minimaliste »* · Statut : ratifié, déployé, ⚠️ hors corpus

### `INFO` devient un livre, et la consigne remonte { #abilities-info-devient-un-livre }

**`INFO` sort de la rangée des méthodes et devient un livre rond ; la consigne passe AU-DESSUS de la rangée.**

??? note "Pourquoi, et depuis quand"
    `INFO` portait le gabarit, l'octogone et le pan coupé des quatre méthodes : **un cinquième bouton identique proposait quelque chose qui n'est pas un choix**. Le livre est l'organe qui dit « le texte est là », et il ne ressemble à aucune méthode. ⭐ En haut, c'est aussi l'ordre de lecture juste — une consigne se lit AVANT le geste qu'elle commande. ⚠️ Et le mot « ABOVE » de la phrase a dû devenir « BELOW » avec le déplacement : **un déplacement peut rendre faux un texte qu'on n'a pas touché.**

    Valeur : livre `44 × 44` · le mot passe de y `107` à `124`, la rangée de `124` à `168` — aucun chevauchement · Source : Eric, 2026-08-26 : *« Abilities : info doit disparaître et devenir un bouton livre ! »* · *« le livre dans un bouton rond, même taille que ? »* · Statut : ratifié, déployé, ⚠️ hors corpus

### Six caractéristiques sur une ligne — l'exception se NOMME { #abilities-six-sur-une-ligne }

**Les six caractéristiques tiennent sur UNE ligne, et cette rangée se nomme au lieu de se compter.**

??? note "Pourquoi, et depuis quand"
    C'est l'exception explicite à la loi des quatre par ligne. ⛔ Un sélecteur « le sixième enfant » aurait rangé sur une ligne n'importe quel écran à six créneaux : **une exception se nomme**. ⚠️ Elle a un coût mesuré — dans la case de `47` px, « drop it here » cassait en trois lignes et poussait le collecteur à `58` quand le jeton reste à `48` ; l'architecte avait retiré le mot du flux, Eric a préféré le RACCOURCIR. Meilleur des deux : la consigne survit sur tous les écrans.

    Valeur : `6` sur une ligne · case `47` px, collecteur `48` et non `58` · Source : Eric, 2026-08-29 : *« tous les collecteurs avec les 6 caracs — STR DEX CON INT WIS CHA — règle spécifique : là on met tout sur une ligne »* · Statut : ratifié, déployé, ⚠️ hors corpus

## Ce qu'aucune règle ne dit

- **Un lot balayé disparaît et ne se garde nulle part** — le plateau n'a aucun historique. Décision d'Eric du 2026-08-13, ⚠️ **sa phrase n'est pas au dépôt**.
- **La relance d'un lot raté est morte**, remplacée par deux planchers — un `14` garanti en haut, un `8` dû en bas. C'est la **mesure de sa fréquence** qui l'a tuée : un lot de dix échouait `38 %` du temps, soit ~`25` s de théâtre à jeter par échec. ⚠️ Aucune phrase d'Eric au dépôt.
- **`POINT BUY` n'est pas offerte, et ce n'est pas un oubli** : son barème n'existe **nulle part** dans le dépôt, et l'écrire dans l'écran publierait des nombres dont on ne sait pas s'ils sont SRD. ⏳ **Question posée à Eric, toujours ouverte.**
