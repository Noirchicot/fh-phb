# Lot 100 — les listes dans lesquelles une classe choisit

**En clair :** l'Occultiste choisit **10 Manifestations occultes** parmi **28**, l'Ensorceleur
**6 Métamagies** parmi **10**. Ces deux listes sont **dans le livre** et **n'ont jamais été
extraites** — pas une seule des deux langues. C'est l'**étape 1** de la route vers la
versatilité, et elle n'a jamais été entamée.

**Mesuré depuis le siège d'architecte** : onze noms connus (*Agonizing Blast · Devil's Sight ·
Eldritch Spear · Repelling Blast · Mask of Many Faces · Careful/Distant/Empowered/Quickened/
Subtle/Twinned Spell*) — **zéro occurrence dans TOUS les exports**, les deux langues. Les deux
PDF épinglés sont là : `sources/pdf/SRD_CC_v5.2.1.pdf` et `sources/pdf/FR_SRD_CC_v5.2.1.pdf`.

- **Dépôt :** `~/tools/fh-srd` · **branche `100-listes-de-choix`**, partie de `main` (**b9c119f**).
- ⛔ **Jamais sur `main`, jamais de `git push`.**

---

## 1. ⚠️ LE PIÈGE QUI FERAIT CONCLURE « ÇA N'EXISTE PAS »

**Le français ne dit PAS « invocation ».** Mesuré :

```
EN   Eldritch Invocations
FR   Manifestations occultes        ·   Arcanum mystique
```

🔴 **Un lot qui cherche « invocation » dans le corpus français ne trouve RIEN** — et conclut à
tort que la donnée n'y est pas. C'est exactement la faute que ce chantier paie en boucle :
**chercher un nom au lieu de mesurer la chose.**

---

## 2. Ce que tu extrais

| | combien | il en choisit |
|---|---|---|
| **Manifestations occultes** *(Eldritch Invocations)* | **28** | 10 |
| **Métamagie** | **10** | 6 |
| **Infusions d'Artificier** | ⛔ **PAS AU SRD** | — |

⭐ **Les deux comptes sont ta vérification.** Si tu tombes sur 28 et 10 dans les deux langues,
tu as pris la bonne section. Si tu tombes à côté, **ne force rien** : nomme l'écart.

⛔ **L'Artificier n'existe pas au SRD et n'y entrera pas.** Il arrive par la porte du homebrew,
comme n'importe quel livre qu'on possède. **N'invente pas ses infusions.**

📌 **Ce qu'il faut porter par entrée** : le **nom**, le **texte**, et son **prérequis** quand il
y en a un (niveau, un autre choix déjà pris, un sort connu). Un prérequis est une donnée, pas
une phrase à laisser dans la prose.

🔴 **ET LA DIFFÉRENCE QUI COMPTE, elle est déjà écrite dans la route** : une **manifestation**
est **gratuite une fois prise** ; une **métamagie se paie à CHAQUE usage**. **Seule la seconde a
besoin d'un coût.** ⛔ Ne donne pas un coût aux deux par symétrie.

---

## 3. ⏳ L'ARBITRAGE QU'ERIC N'A PAS RENDU — et comment tu avances quand même

**La question, telle qu'elle est écrite dans la route :** *genre à part, ou dans les dons avec
une catégorie ?* **Elle n'est pas tranchée.**

**Les deux mesures qui la contraignent :**
- les **styles de combat** sont **déjà des dons** avec `category: "fighting-style"` — l'édition
  2024 en a fait des feats, et la couche les porte ainsi ;
- **mais** le genre `feat` est **borné au chapitre des Dons** côté extracteur, et les
  manifestations sont dans le **chapitre des Classes**.

⭐ **Et le principe qui, lui, EST ratifié** — c'est lui qui commande la forme :

> *« Ce n'est pas "invocation" ni "métamagie" qu'il faut décrire, c'est **une liste dans
> laquelle une classe choisit**. Le SRD en remplit deux ; qui possède Eberron en ajoute une
> troisième ; un homebrew en ajoute une quatrième. **La catégorie reste ouverte, jamais
> énumérée dans le schéma** »* — même réflexe que l'extracteur de glossaire, qui refuse déjà
> d'inventer une liste fermée.

➡️ **Donc tu avances** : tu crées **un genre**, portant une **catégorie ouverte**, et
**tu MARQUES SON NOM COMME RÉVOCABLE** dans le module, avec le motif. ⛔ **Tu n'énumères pas les
catégories dans le schéma.** Puis **tu remontes à Eric UNE question, en une ligne** — le nom du
genre et rien d'autre. ⭐ **La donnée, elle, est la même quel que soit le nom** : c'est
exactement pourquoi elle peut partir avant l'arbitrage.

---

## 4. ⚠️ Les pièges déjà payés dans ce dépôt

- **Un numéro de page anglais ne vaut RIEN pour le PDF français.** La table des prix est page
  **206** en anglais et **217** en français — le lot 92 est tombé dedans dans son propre PDF.
- **L'espace insécable des milliers** est repliée par `extract.normalise` : une recherche sur
  `1 000` échoue là où le texte affiche `1 000`.
- **`sources/pdf` est ignoré par git** → un clone frais rend `SOURCE REFUSED` tant que le lien
  symbolique n'est pas reposé.
- ⚠️ **L'interpréteur** : `/usr/bin/python3` **3.9.6** porte `fitz` 1.26.5. `/opt/homebrew/bin/python3`
  (3.14) **n'a pas PyMuPDF** et fait rougir quatre suites pour une raison qui n'est pas la leur.

🔴 **Le garde qui va mordre, et c'est voulu** : `build_web.py` **refuse** un genre neuf tant
qu'il n'est pas déclaré dans `KINDS`, `KIND_LABEL` **et** un rendu — *« ou qu'on dise pourquoi
il n'est délibérément pas publié »*. **Ce n'est pas un obstacle, c'est le contrat.** Déclare, ou
dis pourquoi tu ne publies pas.

📌 **En aval, `fhpc` REFUSERA ce genre** tant qu'il n'est pas ouvert à son contrat — depuis le
lot 93, un genre inconnu est **refusé et nommé**, plus jamais sauté en silence. **C'est le
comportement attendu, et ce n'est pas ton travail** : signale-le, n'y touche pas.

---

## 5. ⚠️ La collision

Le **lot 99** travaille dans le même dépôt (la passe humaine d'appariement). Vos données ne se
touchent pas, **mais vous toucherez tous les deux `exports/MANIFEST.json`.** ➡️ **Rebase avant
de finir**, et règle un conflit de manifeste **en le rebâtissant** — jamais en acceptant la
fusion automatique d'un fichier généré. Puis rejoue les suites **après** le rebase.

---

## 6. Ce que tu rends

- **28 et 10, dans les deux langues** — ou l'écart, nommé ;
- combien portent un **prérequis**, et combien un **coût** *(⛔ zéro pour les manifestations)* ;
- **le nom de genre que tu proposes**, marqué révocable, et **la question d'une ligne pour Eric** ;
- les suites vertes dans un **clone indépendant**, avec le compte ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
