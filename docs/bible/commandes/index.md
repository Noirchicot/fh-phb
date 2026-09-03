# Les commandes

Une commande est ce qu'on **appuie** pour que quelque chose arrive. Elle se reconnaît à sa
forme, jamais à sa couleur — la couleur ne dit que l'état. Ce que les trois partagent est ici :
**où une commande a le droit d'être**. Le reste se lit sur la page de chaque objet.

| Objet | Ce que c'est |
|---|---|
| **[Le bouton](bouton/index.md)** | la commande à libellé — octogone à coupe |
| **[L'interrupteur](interrupteur.md)** | le `on/off`, en deux espèces |
| **[Le dropdown](dropdown.md)** | la commande à liste |

## Où ils ont le droit d'être

*ce qui vaut pour toute la famille.*

### Sur une dalle, jamais sur le fond { #bouton-sur-une-dalle-jamais-sur-le-fond }

**Un bouton se pose sur une dalle, jamais sur le fond.**

??? note "Pourquoi, et depuis quand"
    *« le fond ne peint rien. Ce n'est pas une surface, c'est une respiration — un contrôle posé dessus n'a rien sous lui. »* Mesuré : `Draw again` et `Choose yourself` étaient posés dans `.card-step` — *« Tant que le cadre peignait, ils avaient l'air d'être sur quelque chose. Depuis que le fond est nu, ils flottent sur l'image. »* ⚠️ Le cas sans dalle est **nommé, pas masqué** : on les garde visibles, *« un écran qui perd ses gestes est pire qu'un écran mal rangé »*.

    Source : NORMES.md § « UN BOUTON SE POSE SUR UNE DALLE », Eric 2026-08-26 : *« aucun bouton dans le fond »* · *« Destiny, la carte TEXTE doit avoir sa rangée de boutons »* · Statut : ratifié

### Le flux ne porte aucun bouton { #bouton-le-flux-ne-porte-aucun-bouton }

**Le flux ne porte aucun contrôle d'écran : ce sont les bandes fixes (tête et pied), qui sont des dalles, qui les portent.**

??? note "Pourquoi, et depuis quand"
    *« un contrôle qui défile s'en va. Le joueur qui cherche `Done` doit alors se rappeler où il l'a laissé — un bouton qu'il faut retrouver n'est plus un bouton, c'est une chasse. Ce qui commande reste ; ce qui se lit défile. »* 📏 La barre blanche vivait dans `.stage-topbar`, le slot horizontal du CADRE — donc hors de toute dalle. *« Le slot ne disparaît pas, il se vide »* (loi B0.19).

    Valeur : tête fixe = titre, onglets, compteurs, `?`, livre · flux = aucun contrôle, *« son bord est invisible »* · pied fixe = la rangée de boutons · Source : NORMES.md § « LE FLUX NE PORTE AUCUN BOUTON », Eric 2026-08-26 : *« les listes restent identiques et scrollables. Exception : elles ne portent pas de bouton. C'est la carte FIXE qui les porte. »* · *« la barre blanche doit totalement disparaître »* · Statut : ratifié

### Les lignes gardent leurs commandes { #bouton-les-lignes-gardent-leurs-commandes }

**Les lignes d'une liste gardent leurs propres commandes : la règle ne vise que ce qui commande la PAGE.**

??? note "Pourquoi, et depuis quand"
    *« Ce sont des organes DE LA LIGNE, pas des contrôles DE L'ÉCRAN. »*

    Valeur : les trois crans de palier d'une compétence, le `+`/`−` d'une quantité · Source : NORMES.md § « LE FLUX NE PORTE AUCUN BOUTON », 2026-08-26 · Statut : ratifié

### Les deux dalles de Destiny { #bouton-deux-dalles-de-destiny }

**La dalle tarot ne porte aucun autre bouton que le tarot ; c'est la dalle TEXTE qui porte les éléments classiques.**

??? note "Pourquoi, et depuis quand"
    la règle se referme d'elle-même — *« le `?` et le livre SONT des boutons, donc « aucun autre bouton que le tarot » les exclut par construction »*. 📏 Ce qu'il en coûtait de ne pas l'écrire : *« le `?` était appendu dans la carte du tarot — un `<button>` DANS un `<button>`, du HTML invalide, et surtout un clic qui remonte : demander de l'aide RETOURNAIT LA CARTE. »* ⚠️ *« l'exclusion des boutons est un EFFET, pas la règle »* : le jour où une dalle-image ne serait pas un bouton, elle recevrait le `?` sans que rien ne proteste.

    Valeur : dalle texte = rangée de boutons, Score, `?`, livre · garde `tests/destiny-deux-dalles.test.mjs` · Source : NORMES.md § « LA RÈGLE DES DEUX DALLES », Eric 2026-08-26 mot pour mot · Statut : ratifié

### La paire qui encadre la rangée { #bouton-la-paire-encadre-la-rangee }

**Le livre à gauche et le `?` à droite encadrent la rangée de boutons, à la même cote, hors du centrage.**

??? note "Pourquoi, et depuis quand"
    *« L'ÉGALITÉ EST CE QUI FAIT LA PAIRE : deux ronds de tailles différentes aux deux bouts d'une rangée se lisent comme deux objets sans rapport. À la même cote, ils se lisent comme les deux bornes d'un même geste — ⭕ à gauche on LIT · au centre on AGIT · ⭕ à droite on demande de l'AIDE. »*

    Valeur : **22 px de dessin, 44 de cible**, des deux côtés · Source : NORMES.md § « LA PAIRE », Eric 2026-08-26 : *« ils sont tous deux cadrés à gauche et à droite de la rangée de boutons »* · Statut : ratifié

### Dans la rangée, sans son habit { #bouton-dans-la-rangee-mais-pas-de-son-habit }

**Le livre et le `?` sont DANS la rangée mais n'ont pas son habit : l'octogone est réservé aux gabarits à libellé.**

??? note "Pourquoi, et depuis quand"
    ⛔ mesuré le 27/08 — *« le livre posé au pied du parcours est sorti en LOSANGE. `.parcours-pied button` figurait dans la liste des sélecteurs octogonaux, et le livre l'a hérité sans que rien ne le demande — il n'existait pas quand cette liste a été écrite. »* 📌 *« Un sélecteur écrit par POSITION attrape ce qui arrivera plus tard, et il ne prévient pas. »*

    Valeur : sélecteur `:not(.fiche-livre)` ou par classe de gabarit, **jamais par l'endroit** · Source : NORMES.md § « LA PAIRE », Eric 2026-08-27 : *« ce sont des boutons SPÉCIAUX, mais ils rentrent dans leur rangée quand même »* · *« le livre est un cercle »* · Statut : ratifié

### La réserve symétrique { #bouton-reserve-symetrique }

**La rangée réserve `--touch` de chaque côté et se centre sur ce qui reste : c'est l'arithmétique, pas un arbitrage.**

⚠️ En contradiction avec le corpus — aucune autre règle ne porte l'autre camp — voir [C15](../a-trancher.md#c15).

??? note "Pourquoi, et depuis quand"
    *« Tant qu'un seul bout était occupé, le centrage était FAUX par construction »* — `Done` tombait 26 px à gauche du milieu. ⚠️ *« DEUX PIEDS, UNE SEULE LOI »* : `.sortie` (Identity, Destiny, Skills) et `.parcours-pied` (Species, Inheritance, Class) *« sont deux pieds nés séparément qui font le même métier ; ils avaient divergé sans que rien ne le dise »*. Les deux chiffres diffèrent et c'est argumenté (`.sortie` réserve `--sp-16 + --touch` au bas de la SCÈNE, `.parcours-pied` réserve `--touch` seul car il vit dans une dalle qui porte son rembourrage) — *« ce qui compte n'est pas le chiffre, c'est qu'il soit LE MÊME à gauche et à droite »*.

    Valeur : mesuré à 900 px — Identity `60/60` écart **0** · Species, Inheritance, Class `44/44` écart **0** · rembourrage à 360 : gauche 8, droite 52 · Source : NORMES.md § « LA RÉSERVE EST SYMÉTRIQUE », Eric 2026-08-26 : *« bien mais Done centré »* puis *« fais comme pour tous les panels »* · Statut : ratifié
