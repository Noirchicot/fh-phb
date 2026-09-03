# Le bouton — Design

À quoi ressemble un bouton : l'octogone, l'opacité, les pans, l'ombre, et l'échelle des quatre
couleurs.

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### L'octogone à coupe { #bouton-octogone }

**Un bouton à libellé est un OCTOGONE à coupe, et la coupe d'angle lui appartient seul.**

??? note "Pourquoi, et depuis quand"
    *« La coupe d'angle appartient au bouton SEUL. C'est ce qui interdit de le confondre avec un jeton, quelle que soit la couleur. »* ⚠️ Mais *« « bouton » ne veut pas dire « octogone » : l'octogone est l'habit des trois gabarits À LIBELLÉ ; un bouton qui porte un glyphe ou un dessin n'a pas de mot à cadrer, donc pas de coupe à porter »*.

    Source : NORMES.md § « 2. LES ORGANES », validé 2026-08-26 sur maquette · Statut : ratifié

### Un bouton est opaque { #bouton-opaque }

**Un bouton est OPAQUE — 100 %, et il ne porte jamais l'habit d'une dalle.**

??? note "Pourquoi, et depuis quand"
    *« un signal qui se voile cesse d'être un signal »*. Le rouge voilé à 35 % rend `#74493b` de nuit — un brun. ⛔ *« Un bouton ne porte JAMAIS l'habit d'une dalle — c'est ce qui les rendait anonymes. »*

    Valeur : opaque → contraste étiquette **6,07–6,13** jour, **5,59–5,61** nuit ✓ · voilé 50 % → 3,63 / 3,00 ✗ · voilé 35 % → 3,12 / **2,47** ✗ · Source : NORMES.md § « 3. LE BOUTON EST OPAQUE — mesuré, pas préféré », 2026-08-26 · Statut : ratifié (⏳ à remesurer sur une dalle à 50, la mesure datait d'une dalle à 35)

### Les pans coupés sont nus { #bouton-pans-coupes-nus }

**Les quatre pans coupés ne portent pas d'arête, et c'est voulu.**

??? note "Pourquoi, et depuis quand"
    *« c'est la limite du médium : un `linear-gradient` éclaire des bandes DROITES. La diagonale d'un pan tombe hors des 1,5 px du haut comme des 1,5 px du côté — aucun stop ne peut l'atteindre. »* ⛔ *« AUCUN LOT NE ROUVRE CETTE QUESTION. Un futur siège qui verra les pans nus croira à un défaut : il n'en est pas un. »*

    Valeur : pixels de diagonale à **158-160** entre fond 243 et corps 98 — de l'anticrénelage · haut/bas blanc .58 · noir .45 · côtés blanc .16 · noir .20 · Source : NORMES.md § « LES QUATRE PANS COUPÉS », Eric 2026-08-26 la mesure posée devant lui : *« non, ça me va »* · Statut : ratifié

### L'ombre devient une lueur la nuit { #bouton-ombre-devient-lueur-la-nuit }

**L'ombre du bouton devient une LUEUR la nuit : c'est le fond qui décide de la direction.**

??? note "Pourquoi, et depuis quand"
    *« LA RAISON EST PHYSIQUE, PAS DÉCORATIVE : un objet posé sur une surface claire se détache par l'ombre qu'il projette ; sur une surface sombre, par la lumière qu'il renvoie. »* Le jour il reste 45 points de marge sous le fond ; la nuit il n'en reste que 18 avant le noir absolu. ⛔ Ne pas remonter l'alpha du noir « pour compenser » : *« il n'y a rien à compenser, la marge n'existe pas »*.

    Valeur : jour Δ 45,8 (243,1 → 197,3) ✅ · nuit avant Δ 2,9 ⛔ · nuit lueur blanc 22 % Δ **32,8** ✅ · Source : NORMES.md § « L'OMBRE DU BOUTON DEVIENT UNE LUEUR LA NUIT », Eric 2026-08-26 : *« une lueur claire la nuit »* · Statut : ratifié

<!-- DESSIN À FAIRE — le même bouton jour et nuit — l'ombre projetée d'un côté, la lueur renvoyée de l'autre -->

### Les quatre couleurs sont une échelle { #bouton-echelle-des-quatre-couleurs }

**Les quatre couleurs sont UNE échelle d'avancement que le bouton parcourt : gris rien fait · bleu mouvement non impactant · vert fini · rouge pas bon.**

??? note "Pourquoi, et depuis quand"
    *« Ce ne sont donc pas quatre couleurs de boutons : c'est UNE échelle, et le bouton la PARCOURT. »* Et c'est la MÊME échelle que la signalisation du cercle d'étape — *« une seule échelle, deux porteurs »*. Elle a corrigé la dictée d'Eric (« le done est vert, le next est bleu » — l'inverse de ce qu'il avait dicté) : *« `done` est VERT parce que c'est FINI, `next` est BLEU parce qu'on CONTINUE »*.

    Valeur : gris = `--text-muted` · Source : NORMES.md § « LES QUATRE COULEURS SONT UNE ÉCHELLE D'AVANCEMENT », Eric 2026-08-26 : *« le bleu on garde, ce sont les actions sous les états intermédiaires. Un bouton va passer de bleu à vert voire à rouge dans les zones de choix — quand on prend +4 alors qu'on a droit à +2. »* · Statut : ratifié

<!-- DESSIN À FAIRE — les quatre couleurs en ÉCHELLE, dans l'ordre d'avancement — gris, bleu, vert, rouge -->

### La définition du bleu { #bouton-definition-du-bleu }

**Bleu = mouvement non impactant : après ce clic, le document n'a pas changé.**

??? note "Pourquoi, et depuis quand"
    *« Le test tient en une question : après ce clic, le document a-t-il changé ? Non → bleu. Oui et c'est fini → vert. Oui et c'est faux → rouge. Oui et ça efface → rouge avec popup. »*

    Source : NORMES.md § « LA DÉFINITION DU BLEU », Eric 2026-08-26 : *« bleu = mouvement non impactant »* · Statut : ratifié

### Le tarot, bouton d'exception { #bouton-tarot-exception }

**Le tarot est un bouton d'exception : une CARTE rectangulaire, opaque, sans texte.**

??? note "Pourquoi, et depuis quand"
    trois normes cèdent, chacune avec son argument — l'octogone (*« la carte EST l'objet. Un octogone la découperait — on ne rogne pas un tarot pour qu'il ressemble à un bouton »*), le voile de 50 % (*« Un voile sur une illustration la salit »*), le titre (*« on ne nomme pas deux fois »*, son nom accessible est sur le bouton). ⭐ *« une norme qui n'admet aucune exception se fait contourner en silence. Écrite avec son argument, l'exception se relit. »*

    Valeur : `.card-face` — un `<button>` qui ne contient qu'une image · Source : NORMES.md § « L'EXCEPTION DU TAROT », Eric 2026-08-26 : *« les normes peuvent avoir des exceptions, elles sont argumentées »* · *« tu as raison, le tarot est un bouton exception »* · Statut : ratifié
