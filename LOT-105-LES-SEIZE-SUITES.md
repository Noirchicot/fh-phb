# Lot 105 — les seize suites qui mesurent un monde qui n'existe plus

**En clair :** la migration est faite et prouvée, et **le commit est rouge** : 16 suites sur 65
éprouvent un embranchement qui n'existe plus. **Dix sont mécaniques. Six demandent de décider ce
qu'elles doivent prouver MAINTENANT** — et c'est moi qui le dis, pour que la réponse ne vienne
pas de celui qui a fait la migration.

- **Dépôt :** `~/tools/fh-srd` · **branche `104-transition-a-froid`**, à la suite.
- ⛔ **Jamais sur `main`, jamais de `git push`.** ⛔ **Rien ne fusionne tant que c'est rouge.**

---

## 0. ⭐ POURQUOI L'INTENTION VIENT DE MOI ET PAS DE TOI

Tu as écrit : *« écrire six gardes à la fin d'une longue passe est exactement là où l'on en pose
un plausible et faux »*. **Tu as raison, et la parade n'est pas d'être prudent — c'est que
l'INTENTION vienne d'ailleurs.**

⭐ **Un garde écrit par l'auteur du changement tend à prouver ce que l'auteur croit.** C'est la
même règle que la tienne : *une table écrite à la main se fait vérifier par quelque chose qui ne
l'a jamais lue.* Ici, la chose qui ne l'a pas lue, c'est moi. **Tu écris le code ; ce qu'il doit
prouver est ci-dessous.**

---

## 1. Les dix mécaniques

Elles ne savent que lire `["records"]`. **Fais-les lire la nouvelle forme, et rien de plus.**
⛔ N'en profite pas pour « améliorer » une assertion au passage : un test mécanique qui change de
sens dans un lot de réparation est un test qu'on ne relira jamais.

---

## 2. 🔴 LES SIX — ce que chacune doit prouver maintenant

### `test_correspond`
Son attaque « l'appariement par position se contredit » n'a plus deux catalogues à opposer —
**mais la faute, elle, n'a pas disparu.** `sources/` est désormais clefé sur le **slug français**.
➡️ **Elle doit prouver que l'ordre des slugs et l'ordre des adresses ne sont PAS supposés
concorder**, et qu'un appariement qui s'y fierait est refusé. ⭐ *L'ordre ment* a changé de
support, pas de nature.

### `test_key_families` et `test_weapon_properties`
Elles re-dérivaient des tables depuis des paires ; les deux côtés partagent leurs identifiants,
donc la dérivation est devenue triviale. **Ne les supprime pas : monte-les d'un cran.**
➡️ 🔴 **Elles doivent prouver LE NOUVEL INVARIANT : un patch français ne porte QUE DES MOTS.**
⭐ *S'il porte une clef, l'embranchement est revenu.* C'est la seule chose qui puisse défaire
cette migration en silence, et rien ne la surveille aujourd'hui.

### `test_weapon_pools`
➡️ **Exactement ce que tu proposes**, et c'est le bon : elle doit prouver que **le nom est
« Roublard » et l'adresse `rogue`**. ⭐ Elle devient un **témoin de la loi §0.13** — *le moteur
produit des identifiants, l'interface produit des mots* — sur un cas que n'importe qui peut lire.

### `test_convert_units`
Sa preuve de **complétude** est bien passée à la comparaison des pages. ➡️ **Elle doit donc
prouver la FORME de la table, ce que la comparaison des pages ne voit pas :**
1. **c'est une fonction** — une valeur anglaise ne rend jamais deux valeurs françaises ;
2. **la clef est `(champ, valeur)`** — ni la valeur seule, ni le genre en tête ;
3. 🔴 **elle porte les arrondis DU LIVRE, pas l'arithmétique.** ⭐ **Le témoin est
   `1/2 lb. → 250 g`** : le livre **change d'unité** quand ça l'arrange, et un convertisseur
   générique aurait écrit « 0,25 kg ». **C'est le test qu'un calcul échoue et que le livre passe.**

### `test_adopted_addresses`
➡️ Elle doit prouver **les deux moitiés de l'adoption, et la seconde est celle qu'on oublie :**
1. `Burrow Speed` **a** son entrée anglaise, et son jumeau `Vitesse de fouissement` est **apparié**
   — c'est le patron attesté ;
2. 🔴 **le CONTRÔLE NÉGATIF : zéro occurrence de `Climbing Speed`, `Swimming Speed`,
   `Flying Speed`.** ⭐ **C'est LUI qui rend l'adoption légitime**, et c'est lui qui pourrira en
   silence si une édition du livre change. **Un fait sur le livre se garde comme une mesure, pas
   comme un souvenir.**

---

## 3. ⚠️ Une précision sur ta preuve, à porter dans le lot

Ton `git grep` à zéro est **vrai sur `exports` · `web` · `src` · `sources` · `schema` — je l'ai
revérifié moi-même.** ⛔ **Il ne l'est pas encore sur `tests/`, qui en porte 113.** Ce n'est pas
un reproche : c'est **la définition du rouge**. ➡️ **Quand ce lot est fini, le grep doit être à
zéro PARTOUT**, et c'est ta dernière preuve.

---

## 4. Ce que tu rends

- **65 suites vertes** dans un clone indépendant ;
- **`git grep 'srd:[a-z-]*:fr:'` à zéro, `tests/` compris** ;
- **pour chacune des six : ce qu'elle prouvait, ce qu'elle prouve, et pourquoi le second n'est
  pas plus faible** ;
- ⭐ **au moins un des six garde éprouvé EN LE VIOLANT** — un garde qu'on n'a pas vu mordre ne
  mord pas ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
