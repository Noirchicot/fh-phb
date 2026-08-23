# Lot 98 — étape 2, temps 2 : les onze familles de clefs passent en anglais

**En clair :** onze familles de valeurs de clef sont aujourd'hui **traduites** dans la couche
française (`slashing` d'un côté, `perforant` de l'autre). Elles deviennent **anglaises des deux
côtés**, et le français descend au rang de **libellé**. ⭐ **Ton lot 96 a prouvé que les onze se
déduisent sans rien déclarer** — tu ne fais qu'appliquer ce que tu as mesuré.

- **Dépôt :** `~/tools/fh-srd` · **branche `98-onze-familles`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**
- ⛔ **TU NE TOUCHES PAS AUX IDENTIFIANTS DE RECORDS.** `srd:gear:fr:acide` reste `srd:gear:fr:acide`.
  C'est le **T4**, et il attend une réponse d'Eric. **Une seule chose à la fois.**

---

## 1. Ce que la route a ratifié le 22/08

> **Un seul jeu de records, clefs et identifiants en anglais ; le français par-dessus, en
> libellés seulement.** C'est la **loi §0.13** : *le moteur produit des identifiants,
> l'interface produit des mots.*

**Le patron existe déjà dans le corpus, et c'est toi qui l'as livré au lot 92 :**

```json
{ "key": "two-handed", "label": "Deux mains" }
{ "key": "ammunition", "label": "Munitions", "detail": "portée 30/120 ; carreaux" }
```

➡️ **Généralise ce patron aux onze familles.** ⛔ Ne l'invente pas ailleurs : la clef est
anglaise, le libellé est le mot que le livre français imprime, **pris dans le livre, jamais
traduit par toi**.

---

## 2. 🔴 LA VÉRIFICATION QUI COMMANDE TOUT LE LOT

**Le site français doit se reconstruire À L'OCTET PRÈS.** Pas « à peu près » : **identique**.

⭐ **Et c'est un garde d'une précision rare** : si un seul mot français change sur une page,
c'est qu'un rendu affichait la **clef** au lieu du **libellé**. Le test ne dit pas seulement
« ça marche » — **il nomme l'endroit exact où le français tenait à un fil.**

⚠️ Si un rendu doit changer pour lire le libellé, **change-le** — c'est le travail. Ce qui ne
doit pas changer, c'est **ce que le lecteur voit**.

---

## 3. Les onze familles, telles que tu les as mesurées

```
damage_type_key 3/3 · mastery 8/8 · spell.school 8/8 · spell.classes[] 8/8
glossary.tag 4/4 · skill.ability 5/5 · primary_ability 8/8 · armor.strength 2/2
lineages[].id 6/6 · class-progression resource keys 18/18 · monster.abilities 6/6
```

⭐ **Vérifié indépendamment depuis le siège d'architecte, par une empreinte différente de la
tienne** : en appariant les armes sur `(damage_dice, weapon_category, weapon_range, clefs de
property_list)` — 22 paires sans ambiguïté au lieu de tes 36 — `damage_type_key` retombe sur
**3/3, zéro conflit**. **Deux méthodes différentes, la même réponse.** Ta mesure tient.

📌 **Les caractéristiques de monstre sont le cas à ne pas rater** : les six clefs ne se
déduisent **pas du nom** mais **de la valeur** — la seule clef française en face d'un `str` à 21
est `for`, sur 330 monstres, sans exception. ⛔ Ne les traite pas comme les autres.

---

## 4. 🔴 DEUX PIÈGES, ET LE PREMIER EST LE TIEN

**⛔ L'ORDRE MENT.** Tu l'as écrit noir sur blanc au lot 92, et tu y es retombé huit jours plus
tard en testant `spell.classes[]` et `species.traits[].id` **par position** dans des listes
triées par langue : 3/8 au lieu de 8/8. **Aucun appariement par position dans ce lot.** Profil
d'occurrence, valeur, ou empreinte — jamais le rang.

**⚠️ LA COLLISION DU MANIFESTE.** Le **lot 97** écrit en ce moment dans `exports/srfh/` du même
dépôt. Vos fichiers de données ne se touchent pas, **mais vous toucherez tous les deux
`exports/MANIFEST.json`.** ➡️ **Rebase avant de finir**, et si le manifeste conflit, règle-le
**en le rebâtissant** — jamais en acceptant la fusion automatique d'un fichier généré. Puis
rejoue les suites **après** le rebase.

---

## 5. ⛔ Ce qui n'est PAS dans ce lot

- **Les identifiants de records** — T4, et il attend Eric.
- **Les ~314 décisions humaines** (113 glossaire · 95 objets magiques · 31 objets courants ·
  28 traits d'espèce · 47 divers) — c'est le T3.
- **Les 95 signatures d'Eric et les 24 fichiers de tests `fhpc`** — ils portent des identifiants,
  donc ils suivent le T4.

---

## 6. Ce que tu rends

- **le site français reconstruit à l'octet près**, et le dire ;
- pour chaque famille : **combien de records convertis, combien de libellés posés** ;
- **les rendus que tu as dû changer** pour lire le libellé au lieu de la clef — ⭐ c'est la
  liste la plus intéressante du lot : ce sont les endroits où le français tenait à un fil ;
- les suites vertes dans un **clone indépendant**, avec le compte
  *(piège connu : `sources/pdf` ignoré par git → `SOURCE REFUSED` sans le lien symbolique)* ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
