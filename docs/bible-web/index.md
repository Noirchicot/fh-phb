# La FH WEB Bible — Comment lire

Cette Bible rassemble les règles du **LIVRE** — le site `fh-phb`, ce que le joueur lit. Elle
existe parce que, le **2026-09-06**, la ligne éditoriale d'Eric a été violée **six fois dans un
seul chapitre** : trois sièges ont écrit dans le livre ce jour-là, et **aucun n'avait de corpus
à lire**. Le builder en avait un — 493 adresses et un garde qui refuse une section sans adresse,
donc une règle mal écrite y **rougit**. Le livre n'avait rien, donc une règle violée y **passe**.

⛔ **Rien ici n'est neuf.** Chaque règle vient d'un endroit qui existait déjà — le logbook, les
commentaires de `sync_from_vault.py`, `TRAPS.md`, la mémoire ratifiée — et garde **son incident
daté et sa mesure** : c'est ce qui la rend obéie. Une règle « propre » qui aurait perdu son
incident redeviendrait une opinion.

## L'adresse, et pourquoi elle décide de tout

Chaque règle porte une **adresse** sur la ligne qui suit son énoncé :

**La forme** : le pictogramme, l'adresse entre accents graves, le **statut**, la **date** `JJ/MM`,
puis — s'il y a lieu — la **relation** et l'adresse visée.
Exemple, tel qu'il est posé sous [`voix-comparatifs-en-pied`](voix.md#voix-comparatifs-en-pied) :
« 📍 `voix-comparatifs-en-pied` · `vivante` · `06/09` · **bornée par** `appareil-attribution-n-est-pas-la-comparaison` ».

⚠️ **L'adresse est en TÊTE de ligne** — c'est sa place qui la définit, pas sa décoration : le
pictogramme sert aussi de puce ordinaire dans la prose, et un exemple cité au fil du texte
(comme celui ci-dessus) n'est **pas** une seconde adresse.

⭐ **Sans adresse, on ne peut ni citer une règle, ni la périmer, ni dire qu'une autre la
remplace — elle s'EMPILE.** C'est la maladie entière, et c'est la forme exacte du régime du
builder (`fhpc/tests/corpus-ancres.test.mjs`, lot 161), reprise ici sans une virgule de
différence pour qu'un même garde puisse un jour lire les deux corpus.

| | |
|---|---|
| **les statuts** *(jeu fermé)* | `vivante` · `dépréciée` · `remplacée` · `à trancher` · `en standby` · `déployée, hors corpus` |
| **`remplace` / `remplacée par`** | la neuve **TUE** l'ancienne. Plus personne ne doit s'en servir |
| **`borne` / `bornée par`** | la neuve **n'en tue aucune** : elle découpe une exception nommée dans une règle qui reste **vivante** partout ailleurs |

⚠️ **Écrire « remplacée » là où il fallait « bornée » est un mensonge qu'aucun garde ne verra, et
que le siège suivant paiera.** Et un lien va **dans les deux sens**, toujours : un lien à sens
unique laisse la règle périmée lisible comme si elle valait encore.

## Comment c'est rangé

| | Ce qu'on y trouve |
|---|---|
| ① **[La voix](voix.md)** | comment le livre parle : l'affirmatif seul, la première lecture, ce que le préambule n'a pas le droit de faire |
| ② **[La citation](citation.md)** | comment le SRD entre dans le livre — et les quatre gardes qui remplacent une discipline par un refus |
| ③ **[La fabrique](fabrique.md)** | manuscrit → imprimerie → tirage : qui écrit quoi, qui est généré, qui est écrasé |
| ④ **[L'appareil](appareil.md)** | le pied de page, le bandeau, le convertisseur, l'attribution |
| 🔴 **[La loi des Bibles](loi-des-bibles.md)** | *« dès qu'on change des choses, on se pose la question d'éditer une Bible »* — et elle vaut pour **tout siège** |
| ⚠️ **[À trancher](a-trancher.md)** | les contradictions mesurées, avec **leurs deux citations et leurs deux dates**. Rien n'est tranché ici |

## 📖 Ceci concerne le LIVRE — l'application a sa propre Bible

⛔ **Cette Bible ne régit pas le builder.** Ce qui gouverne l'application FHPC — les cotes, les
organes, les gestes, les cadres — vit dans la **[Builder Bible](../bible/index.md)**, dont la
source est `fhpc/ui/builder/NORMES.md` · `CADRES.md` · `SOCLE.md` · `ECRANS.md`.

➡️ **Dès qu'un travail parle de l'application** — un écran, un bouton, une dalle, un jeton, une
cote — **va lire la [Builder Bible](../bible/index.md)**, et en particulier
[`socle.portee-builder`](../bible/general/socle.md#socle-portee-builder).
Et l'inverse est posé de son côté : la Builder Bible renvoie ici partout où le builder parle du
site — [le livre 📖](../bible/portes/livre.md), [la loi des liens](../bible/general/ecriture.md#ecriture-loi-des-liens),
[l'ancre avant le lien](../bible/general/ecriture.md#ecriture-ancre-avant-lien).

⚠️ **Trois règles du livre vivent aujourd'hui dans le corpus du BUILDER**, et elles n'ont pas été
recopiées ici — une donnée lue à deux endroits diverge en silence. Elles sont **citées** dans
[La fabrique](fabrique.md#fabrique-ce-qui-vit-chez-le-voisin), à leur adresse.

## Ce que cette Bible n'est pas

⛔ **Ce n'est pas une source de règles de JEU.** Une règle que le joueur applique à sa table se
corrige **dans le chapitre du vault qui la publie** *(`5.RPG/Fate's Hand/0. D&D 5+ Rules/`)*, et
nulle part ailleurs. Cette Bible porte la **recette** et le **registre des décisions** — ni l'une
ni l'autre n'est une règle joueur.

⛔ **Et ce n'est pas un tirage.** La Builder Bible publiée sur ce site est la **copie** d'un
corpus qui vit dans `fhpc` ; celle-ci n'a **aucun amont** : son sujet est ce dépôt, donc elle est
sa propre source. On la corrige **ici**.
