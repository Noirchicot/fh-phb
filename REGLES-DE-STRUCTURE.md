# Les règles de structure — le bloc que toute commande d'écran doit porter

> **Pourquoi ce fichier existe.** Eric, 2026-08-24 : *« il y a plein de règles de structure qui
> semblent être systématiquement oubliées — genre quand je dis "fais comme pour Species" ou
> "fais du F1", c'est pas toujours compris »*.
>
> 🔴 **Et la cause n'est pas chez les lots, elle est dans les commandes.** Les canons existent,
> ils sont bons, ils sont ratifiés. **Mais une commande qui ne les nomme pas demande à un lot
> d'appliquer une règle qu'il ne sait pas exister.** Vérifié le 24/08 : aucune des commandes
> d'écran de cette nuit ne citait le canon d'étape.

---

## 1. Le décodeur — ce que veulent dire ses raccourcis

Eric parle court. Chaque raccourci pointe vers un canon écrit, et **le canon fait foi** :

| il dit | ça veut dire | c'est écrit ici |
|---|---|---|
| **« fais comme pour Species »** | applique **le canon d'une étape** — l'étape des espèces est la référence, ratifiée le 19/08 *« après que l'Elfe a été bon de bout en bout »* | vault `FH-WEB/FHPC/FHPCv2 canon d'etape.md` — **660 lignes**, §9 est la recette |
| **« fais du F1 »** · **un FF** · **un R1** | la **nomenclature des cadres** : la **lettre** dit l'écran, le **chiffre** dit qui décide de la hauteur — **1 = imposée**, 2 = libre | `fhpc/ui/builder/CADRES.md` |
| **« 15 items max »** · **« pas scrollable »** | la **norme des listes**, qui vaut pour tout le site | vault `FH-WEB/FHPC/FHPCv2 norme des listes.md` |
| **la couleur d'un cadre** dans un croquis | la **nomenclature des types** : noir = jeton + dropdown · bleu = collecteur · rouge = bouton · rose penché = saisie · vert = dropdown | vault `FH-WEB/FHPC/FHPCv2 R1 cahier des charges.md` §3 |

⭐ **Aucun de ces quatre n'est une préférence.** Ce sont des décisions d'Eric, datées, prises
après des mesures ou des essais au doigt. Un lot qui les ignore ne fait pas un choix différent :
**il refait un travail déjà payé.**

---

## 2. 🔴 L'EXIGENCE QUI REND ÇA VÉRIFIABLE

**« Lis le canon » ne se vérifie pas.** Un lot peut le dire sans l'avoir fait, et personne ne
peut le savoir. Donc la commande ne demande pas de lire — elle demande de **rendre compte** :

> ⭐ **Dans ton inventaire, nomme les règles de structure que tu as appliquées, et où.**
> Une par ligne : la règle, d'où elle vient, ce que tu en as fait.
> **Et nomme celles que tu as écartées, avec la mesure qui le justifie.**

🔴 **Un lot qui a lu le canon peut répondre. Un lot qui ne l'a pas lu ne peut pas.** C'est le
seul contrôle qui tienne, et il ne coûte rien à écrire.

📌 C'est la même discipline que le chantier applique déjà ailleurs : un garde qu'on ne vérifie
pas en le violant délibérément est un garde qui ne mord pas.

---

## 3. Ce que le canon d'étape porte, pour savoir quand il s'applique

Il ne s'agit pas de le recopier ici — **il fait 660 lignes et il est la source**. Mais un lot
doit savoir ce qu'il y trouvera, sinon il ne saura pas qu'il en a besoin :

| § | ce qu'il tranche |
|---|---|
| 1 | **l'arborescence** — quatre écrans, et qui les dessine |
| 2 | **le format** — l'écran porte la lettre, ce qui vit dedans porte son nom. ⭐ Et *une carte, sa cote vit en trois endroits* |
| 3 | **les couleurs** — chacune dit **une** chose. 🔴 Il y a un piège qui est revenu **trois fois** |
| 4 | **le process** — catalogue *(F)* → guide *(FF)* → item *(FF)*, et la règle d'or du parcours |
| 5 | **la validation** — qui signe quoi et quand. 🔴 `Back` ne valide **rien** · une étape se conclut **une** fois · ⚠️ *achevée ≠ conclue* |
| 6 | **le traitement des données** |
| **9** | ⭐ **la recette** — c'est par là qu'on commence quand on construit un chapitre |

---

## 4. ⛔ Ce que ce fichier ne fait pas

Il **ne remplace aucun canon** et n'en résume aucun. Il **oriente**, et il impose de rendre
compte. ⛔ **Ne recopie jamais une cote ou une règle depuis ce fichier** — va la lire à sa
source. Une cote recopiée diverge au premier réglage, et c'est le canon lui-même qui le dit.

---

## 5. Comment s'en servir

**Toute commande de lot qui touche un écran cite ce fichier**, et reprend l'exigence du §2.
Deux lignes suffisent :

```
📐 RÈGLES DE STRUCTURE : lis `~/tools/fh-phb/REGLES-DE-STRUCTURE.md` et les canons qu'il
   nomme. Dans ton inventaire, NOMME les règles que tu as appliquées et où — et celles que
   tu as écartées, avec la mesure qui le justifie.
```

⚠️ **Un lot de DONNÉES n'en a pas besoin** — ce bloc est pour ce qui se dessine et se regarde.
Le mettre partout le ferait sauter partout.
