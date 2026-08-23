# Lot 99 — étape 2, temps 3 : les 314 appariements que rien ne déduit

**En clair :** ton inventaire a trouvé un signal pour tout ce qui pouvait en avoir un. Il reste
**~314 records** dont la correspondance FR↔EN ne se déduit d'aucune valeur : il faut **lire**.
Tu les apparies, et tu rends à Eric **la courte liste de ce qui demande vraiment son arbitrage**
— pas les 314.

⛔ **CE LOT NE MIGRE RIEN.** Aucun identifiant ne change. Il **produit la table**, le T4
l'appliquera.

- **Dépôt :** `~/tools/fh-srd` · **branche `99-passe-humaine`**, partie de `main` (**b9c119f**).
- ⛔ **Jamais sur `main`, jamais de `git push`.**

---

## 1. Ce qui reste, tel que tu l'as mesuré

```
113 entrées de glossaire
 95 objets magiques        groupes de 2-3
 31 objets courants        groupes de 2-3, tranchés d'un coup d'œil
 28 traits d'espèce        indiscernables de l'extérieur, à déclarer par espèce
 47 divers                 24 sorts · 14 dons · 9 autres
───
314
```

📌 **Du moins cher au plus cher**, comme tu l'as proposé. Commence par les 31 objets courants :
petit, immédiat, et il calibre la méthode avant les 113.

---

## 2. 🔴🔴 LA LEÇON DU LOT 98 COMMANDE CELUI-CI

**ZÉRO CONFLIT N'EST PAS ZÉRO ERREUR.** Tes lignages elfes étaient **exactement inversés** —
`elfe-sylvestre → high-elf`, `haut-elfe → wood-elf` — avec **zéro conflit rapporté**, parce que
chaque valeur n'apparaissait qu'une fois. **Une bijection fausse dans les deux sens est
parfaitement cohérente.** Seule la lecture l'a attrapée.

🔴 **Ce lot est fait ENTIÈREMENT de tables écrites à la main.** C'est donc précisément celui où
cette faute est la plus probable, et où les gardes habituels sont les plus aveugles.

➡️ **LE CONTRÔLE QUE J'EXIGE — l'aller-retour indépendant.** Apparie **FR → EN**, puis apparie
**EN → FR** *séparément*, sans regarder le premier passage. **Les deux directions doivent
tomber d'accord.** Une paire où elles divergent n'est pas un conflit à arbitrer : c'est le
signal que **l'une des deux lectures s'est trompée**. ⭐ **C'est le seul contrôle qui attrape
une inversion**, parce qu'il ne compte rien — il compare deux lectures.

⛔ **Et jamais, sous aucun prétexte, un appariement par POSITION** dans deux listes triées
chacune dans son alphabet. Troisième fois dans ce chantier.

---

## 3. Ce qui appartient à Eric, et ce qui ne lui appartient pas

⭐ **Ton propre découpage dit « c'est le seul temps qui demande Eric ». Je le lis autrement, et
c'est la seule chose que ce lot change à ton plan** : ces 314 demandent une **lecture humaine**,
pas les **arbitrages** d'Eric. Apparier *« Potion de soins supérieure »* et *« Potion of Greater
Healing »* n'est pas une décision de produit — c'est du travail.

| | qui décide |
|---|---|
| deux records qui disent visiblement la même chose | **toi** |
| l'aller-retour diverge, ou tu hésites vraiment | ⏳ **liste pour Eric** |
| un record d'un côté sans vis-à-vis de l'autre | ⏳ **liste pour Eric** — ⚠️ ça peut être un **objet avalé** comme les cinq du lot 86 |

➡️ **Rends-lui une liste courte de vraies questions, pas 314 lignes.** Si elle fait dix lignes,
le lot a réussi ; si elle en fait cent, dis-le, c'est une information en soi.

📌 **Les 28 traits d'espèce sont le cas déclaré d'office** : chaque trait n'appartient qu'à une
espèce, donc son profil d'occurrence **est** son espèce. Déclare-les **par espèce**, et dis-le —
c'est le cas normal, pas un échec.

---

## 4. ⛔ Ce qui n'est PAS dans ce lot

- **Les identifiants de records** — T4, et il attend toujours la réponse d'Eric sur les
  identifiants déjà écrits. **Elle n'est pas venue.**
- **Les libellés** — T5.
- **Toute écriture dans `exports/srd/`** au-delà de la table de correspondance elle-même.

---

## 5. Ce que tu rends

- **la table de correspondance**, et le compte : combien d'appariements, sur combien de records ;
- ⭐ **combien de divergences l'aller-retour a attrapées** — si c'est zéro, dis-le, mais dis
  aussi que tu l'as vraiment fait dans les deux sens ;
- ⏳ **la liste courte pour Eric**, avec pour chaque ligne **pourquoi** elle lui revient ;
- **les records sans vis-à-vis**, nommés — ⚠️ possible avalé ;
- les suites vertes dans un **clone indépendant** (⚠️ `/usr/bin/python3` 3.9.6, celui qui porte
  `fitz` 1.26.5 — pas l'homebrew) ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
