# Lot 103 — publier la structure DÉCLARÉE du rangement, pas seulement ses cases pleines

**En clair :** le rangement d'Eric déclare **7 rayons et 30 étagères**. L'export n'en publie que
**6 et 26** — parce qu'il ne porte que les combinaisons **peuplées**. Quatre étagères vides et un
rayon entier sont **invisibles**, et l'écran ne peut pas les afficher.

- **Dépôt :** `~/tools/fh-srd` · **branche `103-structure-declaree`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

---

## 1. La mesure, et pourquoi ce n'est pas un détail

```
déclaré dans src/shelving.py     7 rayons · 30 étagères
publié dans exports/srfh/…       6 rayons · 26 étagères
```

**Ce qui manque, nommément :** le rayon **`companions`** en entier (`familiars`, `henchmen`,
tous deux à 0), et **`crafting › gems`** et **`crafting › ingredients`**, à 0 aussi.

🔴 **Et ce n'est pas cosmétique** : Eric a tranché le 22/08 qu'**un rayon vide reste affiché**.
Son motif est mesuré — *« la barre du bas se serait vidée sur ce seul rayon, et la page aurait
sauté d'une hauteur à chaque passage : un écran qui bouge sous le doigt est un écran qu'on n'ose
plus toucher »*. **Un rayon qui apparaît et disparaît selon qu'il est peuplé fait exactement ça.**

⚠️ **Et `crafting › gems` / `ingredients` ne sont pas des cases mortes** : le document les
annonce *« à créer, en préparation pour le soulforging »*. **Elles attendent du contenu, elles ne
sont pas un résidu.**

---

## 2. 🔴 CE QUE LE LOT 95 A REFUSÉ, ET IL AVAIT RAISON

Le lot qui lit ce rangement côté écran **a refusé d'écrire les sept noms à la main**, avec ce
motif que je reprends tel quel :

> *« Ce serait `ETAGERE_DE` réinstallé un étage plus haut — le défaut que ce lot vient de
> retirer. »*

⭐ **La classification appartient à la couche, pas au lecteur.** Si l'écran doit connaître sept
rayons, c'est **l'export** qui les lui dit. C'est exactement pour ça que ce lot existe.

➡️ **Publie la structure déclarée à côté des records** : la liste des rayons et de leurs
étagères, **dans l'ordre canonique**, avec leur compte — **zéro compris**.

⛔ **N'invente aucun rayon, n'en renomme aucun.** `src/shelving.py` fait foi.
⚠️ **`Arcana` et `Marvels` sont des noms PROPOSÉS, pas ratifiés** — le document du vault le dit
lui-même. **La structure est ferme, ces deux noms ne le sont pas.** Publie-les tels quels.

---

## 3. ⏳ La dette que tu mesures et que tu ne tranches pas

**14 outils Fate's Hand n'ont aucune étagère** — jeux, instruments, véhicules, montures,
Soulforging. `srfh` ne les a **jamais vus** : elle est bâtie sur le SRD seul, et ces outils
viennent de la couche maison.

⛔ **Ne les range pas.** Le rangement est celui d'Eric ; deux de ces familles (véhicules,
montures) n'ont même pas d'étagère évidente, et le Soulforging est un chantier à lui seul.
➡️ **Nomme-les, un par un, avec la famille à laquelle ils appartiennent**, et laisse Eric
trancher. ⭐ C'est la liste qu'il lira en premier.

📌 **Contexte utile** : deux records `srfh` rangent `gaming-set` et `musical-instrument`, que la
couche des compétences **désactive** pour les remplacer par sept outils plus fins. **Le trou vient
de là** — la couche maison a raffiné, le rangement ne l'a pas suivi.

---

## 4. ⚠️ Les pièges de ce dépôt

- ⚠️ **Le lot 102 travaille dans le même dépôt** (le glossaire français). Vos fichiers ne se
  touchent pas, **mais vous toucherez tous les deux `exports/MANIFEST.json`** : rebase avant de
  finir, et règle un conflit de manifeste **en le rebâtissant**, jamais par la fusion automatique.
- ⚠️ **L'interpréteur** : `/usr/bin/python3` **3.9.6** porte `fitz` 1.26.5. L'homebrew (3.14) ne
  l'a pas.
- **`sources/pdf` est ignoré par git** → `SOURCE REFUSED` dans un clone frais.
- 🔴 **Un genre neuf est REFUSÉ, pas sauté** — par le site (`KINDS` + `KIND_LABEL` + un rendu, *ou
  dire pourquoi il n'est délibérément pas publié*) et par `fhpc` en aval. **C'est le contrat, pas
  un obstacle.** ⚠️ Et si tu ouvres un genre au contrat de `fhpc`, **sache que ça désarme une des
  quatre portes du générateur** — la leçon du 2026-08-24. **Vérifie ce que tu désarmes.**

---

## 5. Ce que tu rends

- **7 rayons et 30 étagères publiés**, avec leur compte, zéro compris ;
- ⭐ **la preuve que rien n'a changé pour les 26 peuplées** — même contenu, même ordre : un lot
  qui publie du vide ne doit rien déplacer ;
- **la liste des 14 outils sans étagère**, un par un, avec leur famille ;
- les suites vertes dans un **clone indépendant**, avec le compte ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
