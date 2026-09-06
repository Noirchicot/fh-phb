# La Builder Bible — Comment lire

La Bible rassemble les normes d'interface du builder FHPC — les cotes, les organes, les
gestes — dans un seul endroit lisible, pour qu'Eric puisse citer une règle par son adresse
plutôt que de la redécrire à chaque lot. Chaque règle tient en une phrase en gras que tu lis
d'abord ; un bloc replié juste en dessous, marqué « Pourquoi, et depuis quand », porte
l'argument et la date de la décision — il ne s'ouvre que si tu cliques dessus, jamais dans le
chemin de lecture normal. Chaque règle porte aussi une ancre stable entre accolades (par
exemple `{ #jeton-cote }`) : c'est cette adresse, pas le titre de la page, qu'on cite pour dire
« tu n'as pas respecté `jeton.cote` ». La source réelle des normes n'est pas cette page : elle
vit dans le dépôt `fhpc` (`ui/builder/NORMES.md`, `CADRES.md`, `SOCLE.md`), lu par les lots au
moment de construire. Cette section du site n'en publie qu'un **tirage** — on ne corrige jamais
une règle ici, on la corrige à la source puis on resynchronise le tirage.

## Comment c'est rangé

Quatre niveaux, du plus général au plus particulier. ⚠️ La barre latérale du site est masquée
partout : **ce sont ces pages d'entrée qui servent de menu**, pas un arbre qui se déplie.

| | Ce qu'on y trouve |
|---|---|
| ① **[Les règles générales](general/index.md)** | ce qui vaut partout — l'écran, les cadres, le budget, les listes, l'écriture, les gestes, le socle |
| ② **[Les commandes](commandes/index.md)** · **[Les porteurs](porteurs/index.md)** · **[Les portes](portes/index.md)** · **[Les signaux](signaux/index.md)** · **[La conduite](conduite/index.md)** | ce qui vaut pour une famille d'organes — **y compris où ses objets ont le droit d'être** |
| ③ *dans chaque objet* | **design** (à quoi il ressemble) · **mesures** (ses cotes) · **fonctions** (ce qu'il fait) — toujours dans cet ordre |
| ④ **[Les sections](sections/index.md)** | ce qui vaut pour un écran — `80` règles tirées des commits et du logbook, ⚠️ **hors du corpus des 310** |
| ⚠️ **[À trancher](a-trancher.md)** | les 22 contradictions mesurées, avec leurs deux citations |

⭐ **Une rubrique vide est une information, pas un trou** : quand un objet n'a aucune règle de
mesure ou aucune règle de dessin, la page l'écrit et dit où la valeur vit, si elle vit ailleurs.

## 📖 Ceci couvre le BUILDER — le LIVRE a sa propre Bible

⛔ **Cette Bible ne dit rien du site publié.** 📏 Mesuré le 2026-09-06 : **44 pages, 5 045 lignes**,
et **aucune** sur le livre. Eric, le même jour : *« la Bible ne couvre peut-être pas le site FH
WEB »* — elle ne le couvre pas — *« et c'est peut-être mieux que le site ait la sienne »*.

➡️ **Dès qu'un travail parle du site** — le livre 📖 et où il mène, `LIVRE_ARCANES` et les autres
sorties vers un chapitre, la [loi des liens](general/ecriture.md#ecriture-loi-des-liens), les ancres
que `sync_from_vault.py` fabrique, la voix du texte publié — **va lire la
[FH WEB Bible](../bible-web/index.md)**. Elle renvoie ici de son côté : ⛔ un lien à sens unique ne
vaut rien.

🔴 **Et la loi qui vaut pour les deux** : *« dès qu'on change des choses, on se pose la question
d'éditer une Bible »* — [`socle.une-bible-se-demande-avant-de-rendre`](general/socle.md#socle-une-bible-se-demande-avant-de-rendre).
