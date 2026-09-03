# Les lois

Les 310 règles de la Bible tiennent en une trentaine de lois. Chacune est le résumé fidèle de règles qui existent, et elle les cite : la ligne de code sous chaque loi ouvre les règles qui la portent, avec leur valeur, leur date et l'argument d'Eric. Les lois sont rangées de la plus structurante à la plus fine — on peut s'arrêter à la moitié et avoir l'essentiel. Aucune contradiction n'est tranchée ici : quand une loi passe sur une zone disputée, elle le dit et renvoie à [À trancher](a-trancher.md).

## On dessine sur 360, et la page ne défile jamais

Toute largeur se mesure sur un écran de 360 blg, et deux hauteurs témoins jugent le résultat : 553 quand les barres de Safari sont là, 667 en plein écran. Une conclusion qui tient sur 553 tient partout ; celle qui a besoin de 667 est fragile. La page, elle, n'a pas de bas : ce qui ne rentre pas ne descend pas plus bas, il passe à la page suivante ou il est en trop.

⏳ Des questions restent ouvertes ici — voir [C4](a-trancher.md#c4) · [C5](a-trancher.md#c5).

[`panneau.largeur-cible`](general/panneau.md#panneau-largeur-cible) · [`panneau.compatibilite-360`](general/panneau.md#panneau-compatibilite-360) · [`panneau.hauteurs-de-reference`](general/panneau.md#panneau-hauteurs-de-reference) · [`panneau.jamais-de-defilement`](general/panneau.md#panneau-jamais-de-defilement) · [`geste.la-page-ne-defile-jamais`](general/gestes.md#geste-la-page-ne-defile-jamais) · [`cadre.telephone-couche-hors-cible`](general/cadres.md#cadre-telephone-couche-hors-cible)
{ .lois-refs }

## Le nombre de blg ne change jamais ; c'est le pixel qui bouge sous lui

Le blg est l'unité de dessin : ce que vaut un `px` une fois le zoom appliqué. Tout le builder suit ce zoom, d'une seule ligne et sans exception — ni les filets, ni les ombres, ni `--touch` — donc deux organes à 8 et 16 blg gardent leur rapport sur n'importe quel écran. Ce qui survit au grand écran, c'est le REFLUX : quatre cases peuvent en faire trois. Le redimensionnement, lui, est mort.

[`panneau.blg`](general/panneau.md#panneau-blg) · [`panneau.blg-a-l-ecrit`](general/panneau.md#panneau-blg-a-l-ecrit) · [`panneau.zoom-universel`](general/panneau.md#panneau-zoom-universel) · [`panneau.zoom-sans-exception`](general/panneau.md#panneau-zoom-sans-exception) · [`panneau.plancher`](general/panneau.md#panneau-plancher) · [`panneau.touch-sans-max`](general/panneau.md#panneau-touch-sans-max) · [`panneau.reflux-oui-redimensionnement-non`](general/panneau.md#panneau-reflux-oui-redimensionnement-non) · [`panneau.jamais-de-media-largeur`](general/panneau.md#panneau-jamais-de-media-largeur) · [`panneau.grandeur-large-supprimee`](general/panneau.md#panneau-grandeur-large-supprimee) · [`panneau.homothetie-u-retiree`](general/panneau.md#panneau-homothetie-u-retiree) · [`panneau.plafond-u-leve`](general/panneau.md#panneau-plafond-u-leve) · [`panneau.crans-manuels-retires`](general/panneau.md#panneau-crans-manuels-retires) · [`cadre.une-seule-colonne`](general/cadres.md#cadre-une-seule-colonne) · [`budget.pas-de-seconde-echelle`](general/budget.md#budget-pas-de-seconde-echelle) · [`panneau.repli-transform`](general/panneau.md#panneau-repli-transform) · [`panneau.repli-ce-qui-change`](general/panneau.md#panneau-repli-ce-qui-change)
{ .lois-refs }

## Les vides cèdent, jamais les organes

Quand un écran ne rentre pas, ce sont les marges et les écarts qui rétrécissent. Un jeton, un bouton, une cible tactile ne bougent jamais : ils sont sacrés, et une case ne s'étire pas non plus pour remplir sa rangée. Si rien ne cède, c'est que la page porte quelque chose EN TROP, et la question est quoi retirer — jamais « ajoutons un défilement ».

[`budget.les-vides-cedent`](general/budget.md#budget-les-vides-cedent) · [`budget.en-trop`](general/budget.md#budget-en-trop) · [`jeton.sacre`](porteurs/jeton.md#jeton-sacre) · [`jeton.un-organe-ne-retrecit-jamais`](porteurs/jeton.md#jeton-un-organe-ne-retrecit-jamais) · [`jeton.la-case-ne-s-etire-pas`](porteurs/jeton.md#jeton-la-case-ne-s-etire-pas) · [`cadre.marge-cede-la-derniere`](general/cadres.md#cadre-marge-cede-la-derniere) · [`jeton.la-case-cede-en-pagination`](porteurs/jeton.md#jeton-la-case-cede-en-pagination) · [`liste.etagere-trop-grosse`](general/listes.md#liste-etagere-trop-grosse)
{ .lois-refs }

## Un organe porte sa cote, un contenant la déduit

Un jeton, un bouton, un collecteur savent leur taille et l'écrivent. Une boîte, une ceinture, une rangée ne l'écrivent pas : elles s'additionnent d'avance à partir de la police, de l'interligne, du rembourrage et de l'écart. Une boîte n'achète donc pas une proportion, elle achète une cote réservée ; et une cote partagée par deux organes se déclare sur leur ancêtre commun, jamais sur l'un des deux.

⏳ Une question reste ouverte ici — voir [C8](a-trancher.md#c8).

[`budget.un-organe-porte-sa-cote`](general/budget.md#budget-un-organe-porte-sa-cote) · [`budget.contenant-se-deduit`](general/budget.md#budget-contenant-se-deduit) · [`budget.table-des-hauteurs`](general/budget.md#budget-table-des-hauteurs) · [`budget.ceinture-deduite`](conduite/ceinture.md#budget-ceinture-deduite) · [`cadre.boite-achete-une-cote-reservee`](general/cadres.md#cadre-boite-achete-une-cote-reservee) · [`cadre.tuile-taille-du-de-deduite`](general/cadres.md#cadre-tuile-taille-du-de-deduite) · [`bouton.gabarit-est-un-compte-de-caracteres`](commandes/bouton/mesures.md#bouton-gabarit-est-un-compte-de-caracteres) · [`collecteur.cote-sur-l-ancetre-commun`](porteurs/collecteur.md#collecteur-cote-sur-l-ancetre-commun) · [`jeton.un-compte-n-est-pas-une-largeur`](porteurs/jeton.md#jeton-un-compte-n-est-pas-une-largeur)
{ .lois-refs }

## Une cote donnée bat une cote déduite

Si Eric a dit un nombre, il gagne contre n'importe quel calcul, aussi propre soit-il. Une cote se change dans le code puis se recopie ici avec sa date — la Bible cite, elle n'invente pas. Et une règle écrite par ressemblance avec une autre doit NOMMER sa source plutôt que recopier sa valeur, sinon les deux divergent en silence.

[`budget.cote-donnee-bat-cote-deduite`](general/budget.md#budget-cote-donnee-bat-cote-deduite) · [`socle.la-source-cite-elle-ne-s-invente-pas`](general/socle.md#socle-la-source-cite-elle-ne-s-invente-pas) · [`socle.corriger-l-objet-d-apres-le-document`](general/socle.md#socle-corriger-l-objet-d-apres-le-document) · [`cadre.regle-par-ressemblance-nomme-sa-source`](general/cadres.md#cadre-regle-par-ressemblance-nomme-sa-source) · [`bouton.cotes-extrapolees`](commandes/bouton/mesures.md#bouton-cotes-extrapolees)
{ .lois-refs }

## Un gabarit se mesure, il ne se relit pas

Une norme se vérifie sur la PAGE RENDUE, pas dans la source : un test qui lit un fichier CSS vérifie ce qui est écrit, pas ce que le joueur voit. Trois postes d'un gabarit relu se sont révélés être deux marges légitimes qui s'additionnaient ; une prédiction de budget faite au raisonnement s'est révélée fausse. Une dette recopiée n'est pas une dette vérifiée.

[`socle.google-headless`](general/socle.md#socle-google-headless) · [`socle.le-garde-qui-manque`](general/socle.md#socle-le-garde-qui-manque) · [`budget.deux-marges-qui-s-additionnent`](general/budget.md#budget-deux-marges-qui-s-additionnent) · [`socle.une-dette-recopiee-n-est-pas-une-dette-verifiee`](general/socle.md#socle-une-dette-recopiee-n-est-pas-une-dette-verifiee) · [`socle.chrome-headless-ne-fabrique-pas-de-pdf`](general/socle.md#socle-chrome-headless-ne-fabrique-pas-de-pdf) · [`cadre.prediction-fausse-du-16-08`](general/cadres.md#cadre-prediction-fausse-du-16-08) · [`liste.quinze-vit-a-deux-endroits`](general/listes.md#liste-quinze-vit-a-deux-endroits) · [`budget.dette-de-l-abrege-a-62`](general/budget.md#budget-dette-de-l-abrege-a-62) · [`liste.trois-par-rangee-etait-un-accident`](general/listes.md#liste-trois-par-rangee-etait-un-accident)
{ .lois-refs }

## Une norme est un défaut, pas un mur

Une norme se câble en défaut partagé au socle, avec son garde. Un écran qui en dévie le fait EXPLICITEMENT, et c'est légal : l'exception se nomme, elle se pose à côté de son argument, et elle ne se devine jamais par un `:nth-child`. Mais nommer ne met pas à l'abri, et une norme qui ne vit que dans un document n'existe pas.

[`socle.norme-est-un-defaut`](general/socle.md#socle-norme-est-un-defaut) · [`socle.exceptions-argumentees`](general/socle.md#socle-exceptions-argumentees) · [`socle.nommer-n-est-pas-mettre-a-l-abri`](general/socle.md#socle-nommer-n-est-pas-mettre-a-l-abri) · [`socle.une-norme-qui-ne-vit-que-dans-un-document-n-existe-pas`](general/socle.md#socle-une-norme-qui-ne-vit-que-dans-un-document-n-existe-pas) · [`cadre.modele-a-copier`](general/cadres.md#cadre-modele-a-copier) · [`liste.quinze-est-un-defaut`](general/listes.md#liste-quinze-est-un-defaut) · [`jeton.exceptions-nommees`](porteurs/jeton.md#jeton-exceptions-nommees) · [`liste.exception-etat-d-attente-equipement`](general/listes.md#liste-exception-etat-d-attente-equipement) · [`budget.une-regle-d-habit-se-borne-a-son-media`](general/budget.md#budget-une-regle-d-habit-se-borne-a-son-media) · [`jeton.specificite-du-corps`](porteurs/jeton.md#jeton-specificite-du-corps) · [`socle.paliers`](general/socle.md#socle-paliers)
{ .lois-refs }

## Quatre vocabulaires, et un nom ne se donne jamais deux fois

`R`/`B`/`SB` est un RANG, `F`/`FF`/`FS` est un CADRE, carte/dalle/tuile est l'OBJET, `T1…T7` sont les tailles de texte. Ces quatre listes ne se croisent jamais : « R1 » n'existe pas, une carte ne porte pas de lettre, un écran ne porte pas de nom d'objet. Et un titre est un nom de SECOURS, pas un nom par défaut : on ne nomme pas deux fois la même chose.

[`socle.quatre-vocabulaires`](general/socle.md#socle-quatre-vocabulaires) · [`socle.r1-n-existe-pas`](general/socle.md#socle-r1-n-existe-pas) · [`cadre.trois-ecrans`](general/cadres.md#cadre-trois-ecrans) · [`cadre.trois-objets`](general/cadres.md#cadre-trois-objets) · [`cadre.traduction-ancien-vocabulaire`](general/cadres.md#cadre-traduction-ancien-vocabulaire) · [`ecriture.t1-a-t7`](general/ecriture.md#ecriture-t1-a-t7) · [`socle.fiche-vs-stage`](general/socle.md#socle-fiche-vs-stage) · [`cadre.habillage-d`](general/cadres.md#cadre-habillage-d) · [`budget.titre-de-secours`](general/budget.md#budget-titre-de-secours) · [`ecriture.nom-court-sans-prefixe-generique`](general/ecriture.md#ecriture-nom-court-sans-prefixe-generique)
{ .lois-refs }

## Une carte a une hauteur imposée, une dalle celle de son contenu

La hauteur imposée de la carte n'achète pas de la place, elle achète de la RÉGULARITÉ : d'un écran à l'autre, le bloc tombe au même endroit. Une dalle prend la hauteur de ce qu'elle porte, une tuile n'a ni largeur ni hauteur écrite — un nombre de colonnes, un écart, une forme. Une fenêtre flottante, elle, promet de l'air en haut et en bas : c'est un plafond qu'il lui faut, jamais une hauteur imposée.

⏳ Une question reste ouverte ici — voir [C20](a-trancher.md#c20).

[`cadre.carte-hauteur-imposee`](general/cadres.md#cadre-carte-hauteur-imposee) · [`cadre.carte-largeur`](general/cadres.md#cadre-carte-largeur) · [`cadre.carte-achete-la-regularite`](general/cadres.md#cadre-carte-achete-la-regularite) · [`cadre.dalle-hauteur-libre`](general/cadres.md#cadre-dalle-hauteur-libre) · [`cadre.tuile-n-a-que-des-marges`](general/cadres.md#cadre-tuile-n-a-que-des-marges) · [`cadre.tuile-ecart-4`](general/cadres.md#cadre-tuile-ecart-4) · [`budget.carte-r-hauteur`](general/budget.md#budget-carte-r-hauteur) · [`budget.carte-r-est-un-dessin`](general/budget.md#budget-carte-r-est-un-dessin) · [`budget.paysage-de-la-carte-r`](general/budget.md#budget-paysage-de-la-carte-r) · [`ecriture.condense-de-la-carte-r`](general/ecriture.md#ecriture-condense-de-la-carte-r) · [`cadre.promesse-de-l-air`](general/cadres.md#cadre-promesse-de-l-air) · [`cadre.plafond-en-secours`](general/cadres.md#cadre-plafond-en-secours)
{ .lois-refs }

## Une seule mesure, et elle ne borne que de la prose

`--measure` vaut 62ch, c'est un plafond, et il n'y en a qu'un : un second nom pour la même valeur, c'est la divergence garantie. Le `ch` reste légitime pour empêcher une ligne de texte de devenir trop longue ; toute cote de CADRE, elle, se fige en pixels. Le format ne dit pas la largeur — deux écrans du même format peuvent en avoir des différentes.

⏳ Une question reste ouverte ici — voir [C12](a-trancher.md#c12).

[`cadre.measure-unique`](general/cadres.md#cadre-measure-unique) · [`cadre.trois-largeurs`](general/cadres.md#cadre-trois-largeurs) · [`ecriture.mesure-de-prose`](general/ecriture.md#ecriture-mesure-de-prose) · [`cadre.cote-en-px-le-ch-est-la-raison`](general/cadres.md#cadre-cote-en-px-le-ch-est-la-raison) · [`cadre.largeur-n-est-pas-une-propriete-du-format`](general/cadres.md#cadre-largeur-n-est-pas-une-propriete-du-format)
{ .lois-refs }

## Rien n'est jamais dans la marge

À part une dalle ou une tuile, rien ne se pose dans la marge. Les gouttières se portent sur le CADRE, pas sur la boîte : on ne remplit donc jamais une largeur avec `width: 100%` sur une boîte qui porte déjà une marge. Une rangée vide garde ses deux gouttières, et effacer une carte (`data-bleed`) fait disparaître sa surface, jamais ses marges.

⏳ Une question reste ouverte ici — voir [C19](a-trancher.md#c19).

[`cadre.rien-dans-la-marge`](general/cadres.md#cadre-rien-dans-la-marge) · [`cadre.marges-quatre-cotes`](general/cadres.md#cadre-marges-quatre-cotes) · [`cadre.pas-de-width-100-sur-boite-a-marge`](general/cadres.md#cadre-pas-de-width-100-sur-boite-a-marge) · [`cadre.cadre-d-ecran-nu`](general/cadres.md#cadre-cadre-d-ecran-nu) · [`budget.rangee-vide-garde-ses-gouttieres`](general/budget.md#budget-rangee-vide-garde-ses-gouttieres) · [`cadre.bleed-garde-les-gouttieres`](general/cadres.md#cadre-bleed-garde-les-gouttieres) · [`cadre.data-bleed`](general/cadres.md#cadre-data-bleed) · [`cadre.data-bleed-porte-aussi-la-hauteur`](general/cadres.md#cadre-data-bleed-porte-aussi-la-hauteur) · [`cadre.saignante`](general/cadres.md#cadre-saignante)
{ .lois-refs }

## Jamais deux voiles empilés

Le fond ne porte aucun voile, la dalle en porte un, les petits blocs posés dedans en portent un plus léger — et on s'arrête là. Pas de conteneur d'écran qui ajouterait sa couche : des dalles autonomes. Sur du verre, seule l'encre pleine tient le contraste : un habillage qui passe en verre ne peut pas garder son texte gris.

⏳ Des questions restent ouvertes ici — voir [C2](a-trancher.md#c2) · [C13](a-trancher.md#c13) · [C14](a-trancher.md#c14).

[`cadre.voile-de-la-dalle`](general/cadres.md#cadre-voile-de-la-dalle) · [`cadre.voile-du-fond`](general/cadres.md#cadre-voile-du-fond) · [`cadre.voile-des-blocs-interieurs`](general/cadres.md#cadre-voile-des-blocs-interieurs) · [`cadre.jamais-deux-voiles-empiles`](general/cadres.md#cadre-jamais-deux-voiles-empiles) · [`cadre.encre-sur-verre`](general/cadres.md#cadre-encre-sur-verre) · [`budget.halo-du-scrollspy`](general/budget.md#budget-halo-du-scrollspy)
{ .lois-refs }

## La ceinture est la coquille, jamais un cadre

La ceinture n'est pas un cadre parmi d'autres : c'est la coquille, et un cadre commence sous elle. Son chiffre de cran EST le voyant d'avancement — on n'en fabrique pas un second : anneau pour « en cours », disque plein pour « fait ». Le menu latéral, lui, vaut 90 blg et n'existe que là où il y a une liste à suivre.

⏳ Des questions restent ouvertes ici — voir [C9](a-trancher.md#c9) · [C10](a-trancher.md#c10).

[`cadre.belt-toujours-visible`](conduite/ceinture.md#cadre-belt-toujours-visible) · [`voyant.est-le-cran-de-la-ceinture`](signaux/voyant.md#voyant-est-le-cran-de-la-ceinture) · [`voyant.anneau-vs-disque`](signaux/voyant.md#voyant-anneau-vs-disque) · [`voyant.traverser-n-est-pas-finir`](signaux/voyant.md#voyant-traverser-n-est-pas-finir) · [`voyant.bleu-et-rouge-a-construire`](signaux/voyant.md#voyant-bleu-et-rouge-a-construire) · [`budget.entree-r-sans-ceinture`](conduite/ceinture.md#budget-entree-r-sans-ceinture) · [`budget.entree-r`](general/budget.md#budget-entree-r) · [`cadre.rail`](conduite/rail.md#cadre-rail) · [`cadre.qui-porte-le-rail`](conduite/rail.md#cadre-qui-porte-le-rail) · [`cadre.destiny-menu-en-mode-choix`](conduite/rail.md#cadre-destiny-menu-en-mode-choix) · [`socle.rail-vertical-seulement`](conduite/rail.md#socle-rail-vertical-seulement)
{ .lois-refs }

## Un plein écran porte une sortie nommée

Un FS prend tout : ni ceinture, ni menu latéral. Il doit donc dire par où on sort, et le dire par un nom — sur le Seuil, c'est le titre lui-même qui est la sortie. Le Seuil est aussi le seul vestibule du site : un nom de joueur libre, un coffre à connecter, aucun compte.

⏳ Une question reste ouverte ici — voir [C21](a-trancher.md#c21).

[`cadre.fs-sortie-nommee`](general/cadres.md#cadre-fs-sortie-nommee) · [`cadre.seuil-est-un-fs`](general/cadres.md#cadre-seuil-est-un-fs) · [`cadre.seuil-ordre-des-blocs`](general/cadres.md#cadre-seuil-ordre-des-blocs) · [`cadre.pastille-de-coffre`](general/cadres.md#cadre-pastille-de-coffre) · [`geste.seuil-defile`](general/gestes.md#geste-seuil-defile) · [`socle.pas-de-compte`](general/socle.md#socle-pas-de-compte)
{ .lois-refs }

## Un jeton mesure 87 × 48, partout, sans variante

Un jeton est un rectangle très arrondi, doré, en relief, et sa forme ne change jamais. Il n'y a pas de variantes : un bonus token est un jeton dont le libellé est un nombre, une case du tambour d'Équipement est un jeton, un collecteur fait exactement la taille d'un jeton. Les deux lisent le MÊME jeton de mesure, jamais deux nombres égaux écrits côte à côte.

⏳ Une question reste ouverte ici — voir [C3](a-trancher.md#c3).

[`jeton.cote`](porteurs/jeton.md#jeton-cote) · [`jeton.forme`](porteurs/jeton.md#jeton-forme) · [`jeton.habit`](porteurs/jeton.md#jeton-habit) · [`jeton.modele-unique`](porteurs/jeton.md#jeton-modele-unique) · [`jeton.forme-du-craft`](porteurs/jeton.md#jeton-forme-du-craft) · [`collecteur.cote`](porteurs/collecteur.md#collecteur-cote) · [`jeton.deux-lecteurs-un-jeton-de-mesure`](porteurs/jeton.md#jeton-deux-lecteurs-un-jeton-de-mesure) · [`jeton.case-de-grille-est-un-jeton`](porteurs/jeton.md#jeton-case-de-grille-est-un-jeton) · [`jeton.case-de-grille-habit-non-tranche`](porteurs/jeton.md#jeton-case-de-grille-habit-non-tranche) · [`jeton.bonus-token`](porteurs/jeton.md#jeton-bonus-token) · [`collecteur.equipement-44`](porteurs/collecteur.md#collecteur-equipement-44) · [`jeton.abrege-16`](porteurs/jeton.md#jeton-abrege-16) · [`jeton.standard-d-abreviations`](porteurs/jeton.md#jeton-standard-d-abreviations)
{ .lois-refs }

## Trois par ligne, et la ligne incomplète se centre

Un vivier ne dépasse jamais trois jetons par ligne, même sur écran large — le blanc aux deux bouts est assumé. Les collecteurs vont jusqu'à quatre. Une ligne incomplète se centre : la grille ne s'étire pas et ne se recompose pas pour combler le vide. Et pour qu'une ligne en tienne trois par construction, on donne à la case un tiers de la RANGÉE, jamais un pourcentage d'elle-même.

⏳ Des questions restent ouvertes ici — voir [C5](a-trancher.md#c5) · [C17](a-trancher.md#c17).

[`jeton.trois-par-ligne`](porteurs/jeton.md#jeton-trois-par-ligne) · [`jeton.trois-colonnes-toujours`](porteurs/jeton.md#jeton-trois-colonnes-toujours) · [`jeton.base-en-tiers-de-rangee`](porteurs/jeton.md#jeton-base-en-tiers-de-rangee) · [`jeton.jamais-de-base-en-pourcentage`](porteurs/jeton.md#jeton-jamais-de-base-en-pourcentage) · [`collecteur.quatre-par-ligne`](porteurs/collecteur.md#collecteur-quatre-par-ligne) · [`liste.set-incomplet-se-centre`](general/listes.md#liste-set-incomplet-se-centre) · [`collecteur.cote-dictee-par-un-voisin`](porteurs/collecteur.md#collecteur-cote-dictee-par-un-voisin) · [`budget.trois-jetons-a-360`](general/budget.md#budget-trois-jetons-a-360) · [`collecteur.six-caracs-une-ligne`](porteurs/collecteur.md#collecteur-six-caracs-une-ligne) · [`jeton.six-des-sur-une-ligne`](porteurs/jeton.md#jeton-six-des-sur-une-ligne) · [`collecteur.rangee-libre-en-nombre`](porteurs/collecteur.md#collecteur-rangee-libre-en-nombre) · [`bouton.meme-largeur-par-ligne`](commandes/bouton/mesures.md#bouton-meme-largeur-par-ligne)
{ .lois-refs }

## Le remplissage dit ce qu'il porte, le liseré dit son état

Deux canaux, deux messages, et ils ne se marchent pas dessus. Vide, un collecteur est creux et n'a aucun liseré, avec « drop it here » en italique ; rempli, il prend le doré et le relief du jeton, et le relief REMPLACE le creux au lieu de s'y ajouter. Le liseré, lui, ne parle que d'état — bleu pose valide, rouge mauvaise pose, vert tout posé — et il entoure le jeton sans le recouvrir.

[`collecteur.deux-canaux`](porteurs/collecteur.md#collecteur-deux-canaux) · [`collecteur.vide-est-creux-et-sans-lisere`](porteurs/collecteur.md#collecteur-vide-est-creux-et-sans-lisere) · [`collecteur.rempli-prend-l-habit-du-jeton`](porteurs/collecteur.md#collecteur-rempli-prend-l-habit-du-jeton) · [`collecteur.lisere-etats`](porteurs/collecteur.md#collecteur-lisere-etats) · [`collecteur.lisere-2px`](porteurs/collecteur.md#collecteur-lisere-2px) · [`collecteur.lisere-entoure-ne-recouvre-pas`](porteurs/collecteur.md#collecteur-lisere-entoure-ne-recouvre-pas) · [`collecteur.relief-remplace-le-creux`](porteurs/collecteur.md#collecteur-relief-remplace-le-creux) · [`collecteur.drop-it-here`](porteurs/collecteur.md#collecteur-drop-it-here) · [`collecteur.zone-de-drop`](porteurs/collecteur.md#collecteur-zone-de-drop)
{ .lois-refs }

## Un bouton est un octogone opaque, posé sur une dalle

La coupe d'angle appartient au bouton seul, et il est opaque à 100 % : il ne porte jamais l'habit d'une dalle, il se pose DESSUS. Le flux ne porte aucun contrôle d'écran — ce sont les bandes fixes, tête et pied, qui les portent ; les lignes d'une liste gardent en revanche leurs propres commandes. Un gabarit est un compte de caractères, pas une largeur.

⏳ Une question reste ouverte ici — voir [C15](a-trancher.md#c15).

[`bouton.octogone`](commandes/bouton/design.md#bouton-octogone) · [`bouton.opaque`](commandes/bouton/design.md#bouton-opaque) · [`bouton.pans-coupes-nus`](commandes/bouton/design.md#bouton-pans-coupes-nus) · [`bouton.ombre-devient-lueur-la-nuit`](commandes/bouton/design.md#bouton-ombre-devient-lueur-la-nuit) · [`bouton.sur-une-dalle-jamais-sur-le-fond`](commandes/index.md#bouton-sur-une-dalle-jamais-sur-le-fond) · [`bouton.le-flux-ne-porte-aucun-bouton`](commandes/index.md#bouton-le-flux-ne-porte-aucun-bouton) · [`bouton.les-lignes-gardent-leurs-commandes`](commandes/index.md#bouton-les-lignes-gardent-leurs-commandes) · [`bouton.hauteur`](commandes/bouton/mesures.md#bouton-hauteur) · [`bouton.trois-gabarits`](commandes/bouton/mesures.md#bouton-trois-gabarits) · [`bouton.large-renomme-medium`](commandes/bouton/mesures.md#bouton-large-renomme-medium) · [`bouton.corps-du-texte`](commandes/bouton/mesures.md#bouton-corps-du-texte) · [`bouton.plus-moins`](commandes/bouton/mesures.md#bouton-plus-moins) · [`bouton.tarot-exception`](commandes/bouton/design.md#bouton-tarot-exception) · [`bouton.deux-dalles-de-destiny`](commandes/index.md#bouton-deux-dalles-de-destiny) · [`cadre.pied-76`](general/cadres.md#cadre-pied-76)
{ .lois-refs }

## La couleur dit un état, jamais une identité

Le libellé dit ce que fait le bouton et ne change jamais ; la couleur dit où on en est et change à chaque acte : gris rien fait, bleu sans conséquence, vert fini, rouge pas bon. Ce n'est pas le mot qui décide, c'est ce que le geste COÛTE — donc jamais de `class="bouton-vert"` dans le balisage. Un texte suit la même loi, et une valeur qui n'a pas changé ne se colore pas.

[`bouton.deux-axes`](commandes/bouton/fonctions.md#bouton-deux-axes) · [`bouton.echelle-des-quatre-couleurs`](commandes/bouton/design.md#bouton-echelle-des-quatre-couleurs) · [`bouton.definition-du-bleu`](commandes/bouton/design.md#bouton-definition-du-bleu) · [`bouton.jamais-de-couleur-dans-le-balisage`](commandes/bouton/fonctions.md#bouton-jamais-de-couleur-dans-le-balisage) · [`bouton.critere-du-cout`](commandes/bouton/fonctions.md#bouton-critere-du-cout) · [`bouton.famille-defaire`](commandes/bouton/fonctions.md#bouton-famille-defaire) · [`interrupteur.trois-sens-du-vert`](commandes/interrupteur.md#interrupteur-trois-sens-du-vert) · [`ecriture.trois-etats-de-texte`](general/ecriture.md#ecriture-trois-etats-de-texte) · [`ecriture.une-valeur-inchangee-ne-se-colore-pas`](general/ecriture.md#ecriture-une-valeur-inchangee-ne-se-colore-pas) · [`ecriture.pas-de-noir-litteral`](general/ecriture.md#ecriture-pas-de-noir-litteral) · [`interrupteur.selecteur-sans-couleur`](commandes/interrupteur.md#interrupteur-selecteur-sans-couleur)
{ .lois-refs }

## Trois verbes, aucun recouvrement : naviguer, valider, défaire

`Back` et `Next` NAVIGUENT et n'écrivent jamais dans le document — ni valider, ni effacer, ni signer. `Done` VALIDE : il signe ce qui est là, puis remonte d'un cran, et il est gris tant que l'étape est inachevée. `Cancel` et `I changed my mind` DÉFONT, en rouge et toujours avec un popup. `Done` et `Next` ne coexistent jamais : c'est le même moment vu avant et après.

⏳ Une question reste ouverte ici — voir [C16](a-trancher.md#c16).

[`bouton.trois-verbes`](commandes/bouton/fonctions.md#bouton-trois-verbes) · [`bouton.back-next-n-ecrivent-jamais`](commandes/bouton/speciaux.md#bouton-back-next-n-ecrivent-jamais) · [`bouton.back-dans-les-sous-menus-seulement`](commandes/bouton/speciaux.md#bouton-back-dans-les-sous-menus-seulement) · [`bouton.done-et-next-jamais-ensemble`](commandes/bouton/speciaux.md#bouton-done-et-next-jamais-ensemble) · [`bouton.done-signe`](commandes/bouton/speciaux.md#bouton-done-signe) · [`bouton.done-gris-inacheve`](commandes/bouton/speciaux.md#bouton-done-gris-inacheve) · [`bouton.back-bleu-done-vert`](commandes/bouton/speciaux.md#bouton-back-bleu-done-vert) · [`bouton.i-changed-my-mind-jamais-seul`](commandes/bouton/speciaux.md#bouton-i-changed-my-mind-jamais-seul) · [`cadre.validate-disparu`](general/cadres.md#cadre-validate-disparu)
{ .lois-refs }

## Une porte dit la même chose deux fois

Un bouton de menu de création est UN bouton à deux âges : proposition tant que la condition n'est pas remplie, résolution dès qu'elle l'est — et il a un troisième âge, l'absence, quand l'étape est validée et que le résumé prend sa place. Le voyant et le texte disent toujours la même chose : vert et résolution ensemble, vide et proposition ensemble. Une résolution dit que c'est résolu ; elle ne dit pas forcément par quoi.

[`bouton.porte-a-deux-ages`](commandes/bouton/fonctions.md#bouton-porte-a-deux-ages) · [`bouton.loi-de-la-porte`](commandes/bouton/fonctions.md#bouton-loi-de-la-porte) · [`bouton.troisieme-age-est-l-absence`](commandes/bouton/fonctions.md#bouton-troisieme-age-est-l-absence) · [`bouton.gabarit-des-deux-lignes`](commandes/bouton/mesures.md#bouton-gabarit-des-deux-lignes) · [`bouton.resolution-n-est-pas-toujours-un-nom`](commandes/bouton/fonctions.md#bouton-resolution-n-est-pas-toujours-un-nom) · [`bouton.tete-de-bilan-redevient-une-porte`](commandes/bouton/fonctions.md#bouton-tete-de-bilan-redevient-une-porte) · [`budget.gabarit-du-rang-b`](general/budget.md#budget-gabarit-du-rang-b) · [`budget.gabarit-b-non-negociable`](general/budget.md#budget-gabarit-b-non-negociable) · [`budget.gabarit-du-sb`](general/budget.md#budget-gabarit-du-sb) · [`budget.sb-ancienne-consigne-degagee`](general/budget.md#budget-sb-ancienne-consigne-degagee) · [`ecriture.bilan-en-mode-texte`](general/ecriture.md#ecriture-bilan-en-mode-texte)
{ .lois-refs }

## Trois voix, et on ne les appuie pas

Le GUIDE est en parchemin et se refuse, l'AIGUILLEUR est bleu et prévient, le GENDARME est rouge et dit l'erreur. Un seul popup à l'écran ; les autres attendent derrière une pastille, et on passe de l'un à l'autre sans fermer. Un popup PARLE, on ne l'appuie pas. Le rouge signale qu'il y a un problème ; le gendarme dit lequel, et seulement quand le rouge EMPÊCHE d'avancer.

⏳ Une question reste ouverte ici — voir [C18](a-trancher.md#c18).

[`popup.trois-roles-trois-couleurs`](portes/popup.md#popup-trois-roles-trois-couleurs) · [`popup.parle-on-ne-l-appuie-pas`](portes/popup.md#popup-parle-on-ne-l-appuie-pas) · [`popup.pile-et-pastilles`](portes/popup.md#popup-pile-et-pastilles) · [`popup.pastille-seulement-si-l-autre-parle`](portes/popup.md#popup-pastille-seulement-si-l-autre-parle) · [`popup.guide-est-un-popup`](portes/popup.md#popup-guide-est-un-popup) · [`budget.guide-hors-budget`](general/budget.md#budget-guide-hors-budget) · [`popup.aiguilleur-nom-et-critere`](portes/popup.md#popup-aiguilleur-nom-et-critere) · [`popup.violet-est-pris-par-la-magie`](portes/popup.md#popup-violet-est-pris-par-la-magie) · [`popup.magie-teinte-a-creer`](portes/popup.md#popup-magie-teinte-a-creer) · [`popup.points-non-tranches`](portes/popup.md#popup-points-non-tranches) · [`popup.application-en-standby`](portes/popup.md#popup-application-en-standby) · [`popup.fenetres-derriere-non-reglees`](portes/popup.md#popup-fenetres-derriere-non-reglees) · [`bouton.verrou`](commandes/bouton/fonctions.md#bouton-verrou) · [`bouton.gendarme-quand-ca-bloque`](commandes/bouton/fonctions.md#bouton-gendarme-quand-ca-bloque) · [`bouton.rouge-signale-violet-explique`](commandes/bouton/fonctions.md#bouton-rouge-signale-violet-explique) · [`voyant.non-cliquable`](signaux/voyant.md#voyant-non-cliquable)
{ .lois-refs }

## Le `?` et le livre encadrent la rangée, à la même cote

Le livre à gauche, le `?` à droite, deux ronds de 22 dans une cible de 44 : ils sont DANS la rangée de boutons mais n'ont pas son habit, et ils ne participent pas au centrage — la rangée réserve `--touch` de chaque côté et se centre sur ce qui reste. Le `?` n'apparaît que là où il y a vraiment un guide, plein tant qu'on ne l'a pas vu, simple cercle ensuite.

⏳ Une question reste ouverte ici — voir [C1](a-trancher.md#c1).

[`aide.bas-a-droite`](portes/aide.md#aide-bas-a-droite) · [`aide.entre-dans-la-rangee`](portes/aide.md#aide-entre-dans-la-rangee) · [`aide.aspect`](portes/aide.md#aide-aspect) · [`aide.cycle-de-vie`](portes/aide.md#aide-cycle-de-vie) · [`aide.borne-aux-ecrans-qui-ont-un-guide`](portes/aide.md#aide-borne-aux-ecrans-qui-ont-un-guide) · [`livre.jumelle-gauche-du-question`](portes/livre.md#livre-jumelle-gauche-du-question) · [`bouton.la-paire-encadre-la-rangee`](commandes/index.md#bouton-la-paire-encadre-la-rangee) · [`bouton.dans-la-rangee-mais-pas-de-son-habit`](commandes/index.md#bouton-dans-la-rangee-mais-pas-de-son-habit) · [`bouton.reserve-symetrique`](commandes/index.md#bouton-reserve-symetrique) · [`bouton.borner-la-largeur-ne-reparait-rien`](commandes/bouton/mesures.md#bouton-borner-la-largeur-ne-reparait-rien) · [`livre.rangee-encore-vide`](portes/livre.md#livre-rangee-encore-vide) · [`livre.abilities-info-devient-livre`](portes/livre.md#livre-abilities-info-devient-livre) · [`cadre.question-en-haut-a-droite`](portes/aide.md#cadre-question-en-haut-a-droite)
{ .lois-refs }

## Un organe se dessine, il ne s'écrit pas avec un glyphe

Le livre est dessiné, jamais un 📖 ; la piste et le pouce d'un interrupteur sont dessinés, jamais un caractère. Et un organe sans texte se nomme par `aria-label`, sinon il n'existe pour personne. Un `on/off` n'est d'ailleurs pas un bouton : c'est un organe à part entière, en deux espèces — le sélecteur exclusif, sans aucune couleur, et la bascule simple.

⏳ Une question reste ouverte ici — voir [C7](a-trancher.md#c7).

[`interrupteur.dessine-jamais-un-glyphe`](commandes/interrupteur.md#interrupteur-dessine-jamais-un-glyphe) · [`livre.dessine-pas-un-glyphe`](portes/livre.md#livre-dessine-pas-un-glyphe) · [`livre.aria-label`](portes/livre.md#livre-aria-label) · [`interrupteur.n-est-pas-un-bouton`](commandes/interrupteur.md#interrupteur-n-est-pas-un-bouton) · [`interrupteur.deux-especes`](commandes/interrupteur.md#interrupteur-deux-especes) · [`interrupteur.bascule-simple`](commandes/interrupteur.md#interrupteur-bascule-simple) · [`dropdown.deux-metiers`](commandes/dropdown.md#dropdown-deux-metiers) · [`dropdown.defaut-obligatoire-au-directionnel`](commandes/dropdown.md#dropdown-defaut-obligatoire-au-directionnel) · [`dropdown.habit`](commandes/dropdown.md#dropdown-habit) · [`dropdown.ecart-avec-le-code`](commandes/dropdown.md#dropdown-ecart-avec-le-code) · [`livre.peut-exister-sans-etre-cable`](portes/livre.md#livre-peut-exister-sans-etre-cable)
{ .lois-refs }

## Une liste pagine, elle ne défile jamais

Quinze jetons par page, en rangées de trois, et ce qui ne tient pas passe à la page suivante. C'est une règle du produit entier, pas d'un écran, et elle vit dans un organe unique. Quand il n'y a qu'une page il n'y a pas de flèches — la flèche absente est RETIRÉE de la rangée, jamais masquée par `display: none`.

[`liste.quinze-par-page`](general/listes.md#liste-quinze-par-page) · [`liste.pagination-jamais-defilement`](general/listes.md#liste-pagination-jamais-defilement) · [`liste.pages-sans-plafond`](general/listes.md#liste-pages-sans-plafond) · [`liste.une-seule-page-pas-de-fleches`](general/listes.md#liste-une-seule-page-pas-de-fleches) · [`liste.jamais-display-none`](general/listes.md#liste-jamais-display-none) · [`liste.un-seul-organe-pagine`](general/listes.md#liste-un-seul-organe-pagine) · [`liste.ordre-vertical`](general/listes.md#liste-ordre-vertical) · [`budget.page-de-jetons`](general/budget.md#budget-page-de-jetons) · [`liste.portee-site-entier`](general/listes.md#liste-portee-site-entier) · [`liste.pagination-a-porter-aux-huit-autres`](general/listes.md#liste-pagination-a-porter-aux-huit-autres)
{ .lois-refs }

## Le chevron est un seul objet à deux rôles

Il amorce le défilement ET il fait tourner les pages d'une liste — c'est le même objet, posé à gauche et à droite de la dalle, jamais au-dessus, avec le nombre de pages et d'items dessous. Il apparaît à l'approche du doigt ou de la souris, s'efface, mais sa zone reste cliquable. Une paire coûte 96 de largeur à la rangée : dès qu'une liste pagine, elle paie ce prix.

⏳ Une question reste ouverte ici — voir [C6](a-trancher.md#c6).

[`chevron.un-objet-deux-roles`](conduite/chevron.md#chevron-un-objet-deux-roles) · [`chevron.gauche-et-droite`](conduite/chevron.md#chevron-gauche-et-droite) · [`chevron.compte-sous-le-chevron`](conduite/chevron.md#chevron-compte-sous-le-chevron) · [`chevron.apparition-et-zone`](conduite/chevron.md#chevron-apparition-et-zone) · [`chevron.cout-en-largeur`](conduite/chevron.md#chevron-cout-en-largeur) · [`budget.chevrons-non-comptes`](general/budget.md#budget-chevrons-non-comptes) · [`socle.chevrons-machine-a-etats`](general/socle.md#socle-chevrons-machine-a-etats) · [`chevron.ecart-avec-le-code`](conduite/chevron.md#chevron-ecart-avec-le-code) · [`chevron.sur-une-zone-de-prose`](conduite/chevron.md#chevron-sur-une-zone-de-prose)
{ .lois-refs }

## La prose défile, les contrôles non

La ligne de partage est nette. Deux écrans seulement défilent, le Seuil et le dressing, et ils le font en trois bandes : ce qui bouge au milieu, deux bandes fixes autour. Une boîte qui défile porte sa propre hauteur — pas la dalle — et on doit VOIR qu'il y a plus dessous.

[`geste.la-prose-defile-les-controles-non`](general/gestes.md#geste-la-prose-defile-les-controles-non) · [`geste.deux-gardes-fous-du-defilement-interne`](general/gestes.md#geste-deux-gardes-fous-du-defilement-interne) · [`geste.un-ecran-qui-defile-a-trois-bandes`](general/gestes.md#geste-un-ecran-qui-defile-a-trois-bandes) · [`geste.dressing-defile`](general/gestes.md#geste-dressing-defile) · [`geste.defilement-aimante`](general/gestes.md#geste-defilement-aimante) · [`socle.data-snap`](general/socle.md#socle-data-snap) · [`socle.keepinview-remplace-scrollintoview`](general/socle.md#socle-keepinview-remplace-scrollintoview)
{ .lois-refs }

## Tout ce qui se touche a le même plancher : 44

Un même plancher pour tout ce qui reçoit un doigt, et il ne cède jamais : `--touch` n'a plus de `max()`, 44 blg valent toujours au moins 44 px. Le geste, lui, est fixé : au doigt, tap = info ; à la souris, clic droit = info. Une rangée de tuiles peut être une seule zone d'accueil plutôt que six cibles trop petites.

[`geste.cible-tactile-44`](general/gestes.md#geste-cible-tactile-44) · [`geste.une-rangee-de-tuiles-est-une-cible-unique`](general/gestes.md#geste-une-rangee-de-tuiles-est-une-cible-unique) · [`geste.le-popup-ne-doit-pas-capter-le-lacher`](general/gestes.md#geste-le-popup-ne-doit-pas-capter-le-lacher) · [`geste.tap-info-clic-droit-info`](general/gestes.md#geste-tap-info-clic-droit-info)
{ .lois-refs }

## Le texte se nomme T1 à T7, et rien ne passe sous T1

Jamais H1/H2 : T1 à T7, et T1 est un plancher absolu. Un libellé de jeton comme un nom de collecteur sont en T1, et c'est la CAPITALE qui distingue l'étiquette de sa valeur, jamais la taille. L'italique dit « je ne suis pas une donnée » : c'est l'habit d'une proposition et d'un mot d'attente. Un corps de lecture, lui, est une taille de lecture : 16, sur les deux écrans.

⏳ Une question reste ouverte ici — voir [C11](a-trancher.md#c11).

[`ecriture.t1-a-t7`](general/ecriture.md#ecriture-t1-a-t7) · [`ecriture.aucun-texte-sous-t1`](general/ecriture.md#ecriture-aucun-texte-sous-t1) · [`jeton.corps-t1`](porteurs/jeton.md#jeton-corps-t1) · [`collecteur.ecriture-comme-le-jeton`](porteurs/collecteur.md#collecteur-ecriture-comme-le-jeton) · [`ecriture.capitale-distingue-l-etiquette`](general/ecriture.md#ecriture-capitale-distingue-l-etiquette) · [`ecriture.italique-dit-pas-une-donnee`](general/ecriture.md#ecriture-italique-dit-pas-une-donnee) · [`ecriture.t1-t4-bougent-desormais`](general/ecriture.md#ecriture-t1-t4-bougent-desormais) · [`ecriture.corps-de-lecture-ne-se-met-pas-a-l-echelle`](general/ecriture.md#ecriture-corps-de-lecture-ne-se-met-pas-a-l-echelle) · [`ecriture.page-unique`](general/ecriture.md#ecriture-page-unique)
{ .lois-refs }

## Un nom de règle est toujours un lien

Dès qu'un skill, un feat, un trait, un sort, une invocation ou un training apparaît, il porte un lien. L'ancre se fabrique AVANT le lien, et un sort introuvable s'écrit en texte simple, jamais en faux lien. Le bleu du lien est à un souffle de l'encre et n'est jamais souligné — sauf pour qui ne le distingue pas. Sur un jeton, le texte reste en encre.

[`ecriture.loi-des-liens`](general/ecriture.md#ecriture-loi-des-liens) · [`ecriture.ancre-avant-lien`](general/ecriture.md#ecriture-ancre-avant-lien) · [`ecriture.pas-de-faux-lien`](general/ecriture.md#ecriture-pas-de-faux-lien) · [`ecriture.lien-en-phrase-se-note`](general/ecriture.md#ecriture-lien-en-phrase-se-note) · [`ecriture.lien-hors-jeton-est-bleu`](general/ecriture.md#ecriture-lien-hors-jeton-est-bleu) · [`ecriture.couleur-du-lien`](general/ecriture.md#ecriture-couleur-du-lien) · [`ecriture.pas-de-soulignement`](general/ecriture.md#ecriture-pas-de-soulignement) · [`ecriture.option-soulignage-daltoniens`](general/ecriture.md#ecriture-option-soulignage-daltoniens) · [`jeton.texte-en-encre`](porteurs/jeton.md#jeton-texte-en-encre) · [`ecriture.mode-srd-non-cable`](general/ecriture.md#ecriture-mode-srd-non-cable) · [`ecriture.une-source-trois-consommateurs`](general/ecriture.md#ecriture-une-source-trois-consommateurs)
{ .lois-refs }

## Le cadre se construit une fois ; ensuite on écrit des attributs

C'est la règle de rendu B : le cadre n'est jamais remplacé, on y pose des attributs, jamais des nœuds. Chaque état a un seul propriétaire et un seul écrivain, et une seule fonction du dépôt a le droit de remplacer le contenu d'un nœud. Trois verbes suffisent : `refresh()`, qui laisse survivre le défilement, `openSurface()`, qui repart en haut délibérément, et rien du tout quand on défile.

[`socle.regle-de-rendu-b`](general/socle.md#socle-regle-de-rendu-b) · [`socle.ce-qui-ne-se-redessine-jamais`](general/socle.md#socle-ce-qui-ne-se-redessine-jamais) · [`socle.cinq-choses-qui-survivent`](general/socle.md#socle-cinq-choses-qui-survivent) · [`socle.trois-verbes-du-rendu`](general/socle.md#socle-trois-verbes-du-rendu) · [`socle.un-seul-ecrivain-par-brique`](general/socle.md#socle-un-seul-ecrivain-par-brique) · [`socle.qui-possede-quoi`](general/socle.md#socle-qui-possede-quoi) · [`socle.echelle-hors-socle`](general/socle.md#socle-echelle-hors-socle) · [`socle.resize-avant-refresh`](general/socle.md#socle-resize-avant-refresh)
{ .lois-refs }

## On n'ajoute rien sans un écran qui en a besoin aujourd'hui

Le socle ne grossit que sur demande d'un écran réel, et une branche jamais parcourue est une branche jamais testée : le code mort est interdit. Un module d'écran rend un nœud et ne connaît ni la coquille ni les verbes du moteur. Les trois fichiers de norme sont un seul corpus — aucune règle n'est vraie « seulement dans son fichier » — et leur portée est le builder, pas le site du livre.

[`socle.rien-sans-un-ecran-qui-en-a-besoin`](general/socle.md#socle-rien-sans-un-ecran-qui-en-a-besoin) · [`socle.pas-de-code-mort`](general/socle.md#socle-pas-de-code-mort) · [`socle.quatre-fonctions`](general/socle.md#socle-quatre-fonctions) · [`socle.contrat-d-un-ecran`](general/socle.md#socle-contrat-d-un-ecran) · [`socle.corpus-unique`](general/socle.md#socle-corpus-unique) · [`socle.portee-builder`](general/socle.md#socle-portee-builder)
{ .lois-refs }

## Ce que les lois ne couvrent pas

**306 des 310 règles sont portées par au moins une loi ; 4 restent en dehors**, et c'est déclaré, pas subi. Ces quatre-là ne se regroupent avec rien : ce sont des règles isolées, qu'on lit dans leur page le jour où on en a besoin.

- [`cadre.f2-place-reservee`](conduite/rail.md#cadre-f2-place-reservee) — une place réservée que rien n'implémente aujourd'hui — il n'y a pas de loi à en tirer
- [`cadre.forme-non-gardee`](general/cadres.md#cadre-forme-non-gardee) — un manque déclaré : aucune règle ne tient la continuité de forme d'un écran à l'autre
- [`livre.un-deplacement-rend-faux-un-texte`](portes/livre.md#livre-un-deplacement-rend-faux-un-texte) — un constat de méthode né d'un lot, pas une norme d'interface
- [`saisie.zone-d-ecriture`](porteurs/saisie.md#saisie-zone-d-ecriture) — la seule règle qui dit qu'il n'y a rien à normer

Aucune famille entière n'est laissée dehors : les onze familles d'adresses — `panneau`, `cadre`, `jeton`, `collecteur`, `bouton`, les petits organes, `liste`, `ecriture`, `geste`, `budget`, `socle` — sont toutes citées par au moins une loi.
