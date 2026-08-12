# Lot 44 — `44-garde-des-copies`

> **[Sonnet · medium]** — un lot **de test seulement**. Il n'ajoute aucune règle,
> aucun verbe, aucun contenu. Il empêche deux copies de se mettre à mentir.

**En clair : les 22 Arcanes existent à deux endroits.** Dans la couche du moteur
(`layers/fh-arcana-en.layer.json`) et dans l'outil que la table d'Eric utilise
**aujourd'hui** (`~/tools/fh-skills/fh-skill-builder.html`, `const ARCANA`). Tant
que les deux vivent, un changement dans l'un doit se voir dans l'autre — et
**rien ne le vérifie**. `grep -rln "fh-skill-builder" tests/ src/` → **rien**.

⚠️ **Ce lot ne trouvera aucun bug en naissant, et c'est mesuré, pas espéré.**
L'architecte a comparé les 22 cartes sur leurs **cinq** champs le 2026-08-13 :
**zéro écart**. Ce garde est **préventif**. Sa valeur est de rendre la prochaine
dérive impossible à rater, pas de réparer une dérive existante.

**Worktree** : `~/tools/fhpc-worktrees/44-garde-des-copies`
**Branche** : `44-garde-des-copies`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Tu écris dans `tests/` et NULLE PART AILLEURS.** Pas une ligne de `src/`, de
`layers/`, de `schemas/`, de `contracts/`, de `ui/`. ⚠️ **Deux autres lots
tournent** (42 dans `ui/builder/`, 43 sur `layers/` et `src/build/`) : sortir de
`tests/` te met en collision avec eux. Si tu crois devoir en sortir : **STOP,
demande.**

---

## 0. Ce qui est mesuré — ne le refais pas, mais tu peux le contredire

| | |
|---|---|
| La couche | `layers/fh-arcana-en.layer.json`, genre `arcana`, **22 records** |
| La forme d'un record | `{name, slug, data:{name, numeral, destiny:{impact}, meaning, power, vibration}}` |
| L'outil v1 | `~/tools/fh-skills/fh-skill-builder.html`, `const ARCANA = [` à la **ligne 590** |
| La forme d'une entrée v1 | `{id:"0", name:"The Fool", impact:2, meaning:` … `, power:` … `, vibration:` … `}` — les trois derniers en *template literals* (accents graves) |
| La correspondance | v1 `id` ↔ couche `data.numeral` · v1 `impact` ↔ `data.destiny.impact` · les trois textes, à l'identique |
| **L'écart aujourd'hui** | **zéro**, sur 22 cartes × 5 champs |

📌 **Le test existant `tests/fh-arcana.test.mjs` ne compare la couche qu'à
elle-même.** C'est lui qu'on complète, pas qu'on remplace.

---

## 1. ⚖️ LE PROBLÈME DE CONCEPTION, ET CE QUE L'ARCHITECTE A TRANCHÉ

**Le fichier v1 est HORS du dépôt.** Un test qui le lit ne tourne pas dans un clone
propre — or *« rejouer les suites dans un clone indépendant »* est la routine de
fusion de ce chantier. Et un garde qui se **saute** quand le fichier manque est
exactement ce que la loi du dépôt interdit : *un garde qui ne mord pas est pire que
pas de garde*.

⚖️ **Tranché : DEUX assertions, pas une.**

### 1a. `couche ↔ instantané` — celle qui mord TOUJOURS

Un **instantané** des 22 cartes v1 entre dans `tests/` comme fixture, avec **sa
provenance et sa date** écrites dedans (d'où il vient, quand il a été pris). Le
garde compare la couche à cet instantané. Il tourne partout, tout le temps, sans
rien hors du dépôt.

### 1b. `instantané ↔ fichier v1 vivant` — celle qui voit le monde réel

Quand `~/tools/fh-skills/fh-skill-builder.html` **est présent**, le test le lit et
le compare à l'instantané. S'ils diffèrent, il **ÉCHOUE** — il ne se contente pas
d'avertir : l'outil de la table a bougé, et rafraîchir l'instantané doit être un
**geste délibéré**, pas un effet de bord.

⛔ **Quand le fichier est absent, cette assertion-là ne s'exécute pas — mais elle ne
doit JAMAIS faire passer la suite pour complète.** Elle le **dit** dans sa sortie.
⚠️ **Et surtout : 1a continue de mordre.** C'est la garantie que l'absence du
fichier n'ouvre pas un trou.

📌 **Pourquoi pas l'inverse — générer le v1 depuis la couche ?** Parce que le v1
est **gelé** et qu'il sert la table aujourd'hui : le régénérer serait modifier un
outil en service. Le canon est le dépôt *(Eric)* ; ce garde le fait respecter par
la **mesure**, pas par l'écriture.

---

## 2. Ce que tu construis

### 2a. L'instantané

Les 22 cartes v1, dans `tests/`, format à toi de choisir (JSON à côté, ou données
dans le fichier de test — **dis pourquoi**). ⚠️ Il porte **en clair** : le chemin
de la source, la **date** de la prise, et la phrase qui dit qu'on ne le modifie
qu'exprès.

### 2b. Le garde

Les deux assertions du §1, dans `tests/fh-arcana.test.mjs` ou un fichier voisin —
**à toi de dire lequel et pourquoi**.

**Les cinq champs se comparent tous** : `numeral`, `impact`, `meaning`, `power`,
`vibration`. ⛔ **Ne compare pas seulement les noms** — c'est exactement la faute
que ce chantier paie en boucle : *mesurer le mauvais objet*. Deux cartes peuvent
porter le même nom et un `impact` différent, et c'est **l'impact** qui change le
Score de Destinée d'un personnage réel.

**Le compte se lit dans la donnée**, jamais écrit en dur : si la couche passe à 23
cartes, le garde doit le voir, pas le rater parce que quelqu'un a écrit `22`.

### 2c. L'extraction du HTML — le seul endroit où c'est délicat

Les trois textes sont des *template literals* (accents graves) et peuvent contenir
des apostrophes et des virgules. **Une découpe naïve les casse.**

L'architecte a une extraction qui rend **22/22** — motif fourni ci-dessous **comme
point de départ, pas comme consigne** :

```
\{id:"(?P<id>[^"]*)",name:"(?P<name>[^"]*)",impact:(?P<impact>-?\d+),
meaning:`(?P<meaning>.*?)`,power:`(?P<power>.*?)`,vibration:`(?P<vibration>.*?)`\}
```

⚔️ **Et sa condition de sûreté est non négociable** : **si l'extraction ne rend pas
exactement 22 entrées, le test ÉCHOUE** au lieu de comparer ce qu'il a trouvé. Un
analyseur qui rate 3 cartes en silence rendrait un garde vert sur 19 — le pire cas
possible. *(Précédent daté : le 2026-08-13, une mesure a annoncé **56** sites là où
il y en avait **77**, parce qu'un motif bien ancré ne voyait qu'une orthographe.)*

---

## 3. Les tests, et l'attaque

1. **Les 22 cartes de la couche correspondent à l'instantané**, sur les 5 champs.
2. **Le compte est lu dans la donnée**, pas écrit en dur.
3. **L'extraction rend 22 ou échoue** — jamais un sous-ensemble silencieux.
4. **Quand le fichier v1 est présent**, il correspond à l'instantané.
5. **Quand il est absent**, 1a mord quand même, et l'absence **se dit**.

⚔️ **L'ATTAQUE, et c'est tout le lot** : un garde préventif qu'on n'a jamais vu
mordre ne vaut rien. **Attaque-le quatre fois, une par forme de dérive :**

| Ce que tu casses | Ce qui doit rougir |
|---|---|
| un `impact` dans la couche | le test 1 |
| un mot dans un `meaning` | le test 1 |
| une carte **retirée** de la couche (21) | les tests 1 **et** 2 |
| le motif d'extraction, pour qu'il rende 21 | le test 3 |

**À chaque fois** : vérifie que le test attendu **et lui seul** rougit, restaure,
`diff` byte-à-byte, rejoue la suite complète. ⛔ **Un garde non attaqué n'est pas
livré.**

---

## 4. Ce que tu livres

- Des commits sur ta branche, **arbre propre**, les SHAs, le nombre de tests **au
  départ et à l'arrivée**.
- `INVENTAIRE-LOT-44.md` : où tu as mis l'instantané et **pourquoi** · le résultat
  des **quatre attaques** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** Huit lots de ce chantier ont corrigé leur
architecte par la mesure. Le **lot 41** a **refusé d'écrire une ligne** et renvoyé
la sienne — *« ce n'est pas un ajustement de comptage, c'est un changement de taille
du lot »* — **il avait raison**. Le **lot 38** a démontré qu'une piste de sa commande
était **impossible**, et trouvé au passage une faute d'architecte portant sur
**quatorze valeurs**. **C'est le comportement attendu, pas un incident.**

⚠️ **Ici en particulier** : si tu trouves que l'instantané est une mauvaise idée —
par exemple parce qu'il crée une **troisième** copie de la même donnée, ce que ce
dépôt déteste — **dis-le avec ta mesure**. C'est la faiblesse connue de la solution
retenue, et l'architecte l'a acceptée en échange d'un garde qui mord toujours.
