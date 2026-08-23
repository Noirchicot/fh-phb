# Lot 92 — ce que le livre imprime et que notre lecteur n'a pas pris

**En clair :** deux choses sont **dans le SRD**, noir sur blanc, et n'ont jamais été extraites.
Ce n'est pas de l'invention à ajouter — c'est **une copie à rendre fidèle**. Même famille que
la catégorie d'armure du lot 85 : *la donnée est dans le livre, personne ne l'a prise.*

- **Dépôt :** `~/tools/fh-srd` · **branche `92-champs-manquants`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

---

## 1. ⭐ La table des prix par rareté — page 206

Le livre porte `Magic Item Rarities and Values`. **Vérifié depuis le siège d'architecte, dans
le PDF anglais épinglé du dépôt** :

```
Common 100 GP · Uncommon 400 · Rare 4 000 · Very Rare 40 000 · Legendary 200 000
Artifact : sans prix
```

**Plus la règle d'ajout**, imprimée juste au-dessus, avec son exemple :
> *« If a magic item incorporates an item that has a purchase cost in "Equipment" (such as a
> weapon or a suit of armor), add that item's cost to the magic item's value. For example,
> +1 Armor (Plate Armor) has a value of 5,500 GP, which is the sum of a Rare magic item's value
> (4,000 GP) and the cost of Plate Armor (1,500 GP). »*

🔴 **Mesuré : zéro occurrence de cette table dans la couche.** Elle n'a jamais été extraite.

➡️ **Extrais la table ET la règle.** ⛔ Ne matérialise **pas** un prix sur chaque objet : le lot
87 a déjà posé les prix dans le SRFH, et une valeur portée à deux endroits finit par se
contredire. **Ici on rend au SRD ce qui est au SRD** — le barème et sa règle, comme texte du
livre. Le calcul vit ailleurs.

⚠️ **Un chiffre faux à signaler au passage, pas à corriger** : la table des parchemins du vault
d'Eric donne **400** au niveau 4 là où le livre donne **2 000**. Un seul niveau. Ce n'est pas
ton fichier — **dis-le, n'y touche pas.**

---

## 2. Les propriétés d'arme — une phrase qui devrait être une liste

Mesuré : `properties` est **une chaîne** sur 35 armes, `null` sur 3.

```
"Finesse, Light, Thrown (Range 20/60)"        ← aujourd'hui
```

Neuf propriétés distinctes y vivent : *Two-Handed 13 · Ammunition 9 · Heavy 9 · Light 8 ·
Versatile 7 · Thrown 7 · Loading 6 · Finesse 6 · Reach 5*.

⭐ **Et le conseiller VTT l'a dit en une phrase : « une phrase ne se coche pas ».** Chez Foundry
et chez 5eTools ce sont des **codes**. Chez nous, il faut découper une chaîne — et une chaîne se
découpe mal le jour où quelqu'un écrit un point-virgule.

🔴 **ET C'EST LA CLEF D'UNE IDÉE D'ERIC** : *« s'il sait déjà qu'une épée courte est finesse,
légère, arme, pas besoin de taguer ; si un jour on sort un poignard, il trouvera peut-être tout
seul »*. **Son idée marche — mais seulement si les propriétés sont cochables.**

➡️ **La conversion se prouve à l'envers** : recompose la phrase depuis la liste, et si elle
retombe **mot pour mot** sur l'originale pour les 38 armes, la conversion est juste. ⭐ **C'est
ta vérification, et elle ne coûte rien.**

⚠️ Les parenthèses portent une donnée : `Versatile (1d10)`, `Thrown (Range 20/60)`,
`Ammunition (Range 25/100; Needle)`. **Ne les jette pas** — un nom de propriété et son paramètre
sont deux choses. Et `Ammunition` en porte deux, séparées par un point-virgule.

📌 Le genre `weapon-property` existe déjà dans la couche (11 records) et porte la **définition**
de chaque propriété. **Les clefs de ta liste doivent tomber dessus** — sinon on aura deux
vocabulaires pour la même chose.

---

## 3. ⏳ Ce qui suit, et que je ne te commande pas encore

`cost` et `weight` en **nombre + unité**, `rarity` en **palier**. C'est l'étape 3 de la route
versatilité. ⚠️ Les pièges sont **déjà mesurés et écrits** dans le vault
(`FH-WEB/FHPC/FHPCv2 ecart formats.md`, §P2 et §P3) : deux graphies de la demi-livre dans le
même fichier, la virgule décimale française qui rend zéro, `1,000 GP` qui se lit **1**, et le
tiret qui veut dire *négligeable* — ni zéro, ni absent.

---

## 4. 🔴 La collision à traiter AVANT de finir

**Le lot 90 travaille en ce moment dans le même dépôt** — il écrit la couche SRFH (rangement,
emplacement). Vos parsers ne se touchent pas, **mais vous toucherez tous les deux
`exports/MANIFEST.json`.**

➡️ **Rebase avant de finir**, et si le manifeste conflit, règle-le **en rebâtissant** — jamais
en acceptant la fusion automatique d'un fichier généré. Puis rejoue les suites **après** le
rebase.

---

## 5. Ce que tu rends

- les deux chiffres qui prouvent : **la table extraite** et **38/38 armes recomposées mot pour
  mot** ;
- ce que tu as **refusé** de faire et pourquoi ;
- **55 suites vertes dans un clone indépendant** *(piège connu : `sources/pdf` ignoré par git →
  `SOURCE REFUSED` tant que le lien symbolique n'est pas reposé)* ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne**, dis-le.
