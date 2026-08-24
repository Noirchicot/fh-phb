# Lot 102 — la fuite du glossaire français, que deux totaux égaux cachent

**En clair :** le glossaire compte **152 entrées de chaque côté**. Un garde qui compterait dirait
vert. **Il aurait tort** : trois entrées manquent au français, et trois autres, propres au
français, viennent combler le trou par hasard.

- **Dépôt :** `~/tools/fh-srd` · **branche `102-glossaire-fr`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

---

## 1. 🔴 LA MESURE QUI TUE LE COMPTE

```
glossaire     EN 152   ·   FR 152     écart : 0
```

**Et pourtant :**

| absent du français | absent de l'anglais |
|---|---|
| `Temporary Hit Points` | `Vitesse d'escalade` |
| `Player Character` | `Vitesse de nage` |
| `Size` | `Vitesse de vol` |

⭐ **Trois qui sortent, trois qui entrent : le total tombe juste PAR ACCIDENT.** C'est la leçon
la plus chère de ce chantier, et voici son cas d'école — **un total juste ne dit rien du
contenu.**

⚠️ Vérifié aussi : ni `Points de vie temporaires`, ni `Taille`, ni `Personnage joueur` n'existent
sous **aucun** nom dans le glossaire français.

---

## 2. Ce qui est prouvé, et ce qui ne l'est pas

**PROUVÉ — `Points de vie temporaires` est imprimé dans le livre français, p. 197**, entre
`Points de vie` et `Profil`, **avec sa propre description**, et le lecteur de glossaire **le
saute**. 🔴 **Même famille que le lot 86** : la donnée est dans le livre, personne ne l'a prise.
**Ce n'est pas une traduction, c'est une copie à rendre fidèle.**

⛔ **PAS PROUVÉ — `Player Character` et `Size`.** Absents de l'**export**, oui. Absents du
**livre**, on n'en sait rien : le balayage précédent était **trop large**, il ramassait la table
d'abréviations. ➡️ **Mesure-le proprement, et dis ce que tu trouves.** Deux issues, toutes deux
acceptables :
- ils sont **imprimés** → c'est une seconde fuite, tu la répares ;
- ils ne le sont **pas** → c'est une vraie différence d'édition, tu l'écris et tu n'inventes rien.

⛔ **Les trois `Vitesse …` ne sont PAS de ton ressort.** Elles n'ont pas d'anglais à qui emprunter
une clef, et leur en donner une serait **inventer du vocabulaire**. **C'est une question de
produit, elle appartient à Eric.** Tu les comptes, tu ne les touches pas.

---

## 3. ⭐ LA VÉRIFICATION, ET ELLE NE COÛTE RIEN

**Après toi, les deux totaux doivent CESSER d'être égaux.**

```
avant    EN 152   FR 152      l'égalité est un accident
après    EN 152   FR 152 + (ce que tu as rendu)
```

➡️ **Et l'écart doit s'expliquer entrée par entrée** : chaque nom présent d'un côté et pas de
l'autre est **nommé**, avec son motif — *fuite réparée* · *différence d'édition* · *question
d'Eric*. ⛔ **Aucune entrée orpheline sans motif.**

⭐ **Écris le garde qui aurait attrapé ça** : un test qui compare les glossaires **par contenu**,
pas par compte, et qui **nomme** les entrées sans vis-à-vis au lieu de les additionner.

---

## 4. ⚠️ Les pièges de ce dépôt

- **Un numéro de page anglais ne vaut rien pour le PDF français** — la table des prix est p.206
  en anglais et **p.217** en français.
- **`sources/pdf` est ignoré par git** → `SOURCE REFUSED` dans un clone frais tant que le lien
  symbolique n'est pas reposé.
- ⚠️ **L'interpréteur** : `/usr/bin/python3` **3.9.6** porte `fitz` 1.26.5. L'homebrew (3.14) ne
  l'a pas, et fait rougir quatre suites pour une raison qui n'est pas la leur.
- ⚠️ **Le lot 103 travaille dans le même dépôt** (la structure du rangement). Vos fichiers ne se
  touchent pas, **mais vous toucherez tous les deux `exports/MANIFEST.json`** : rebase avant de
  finir, et règle un conflit de manifeste **en le rebâtissant**.

---

## 5. Ce que tu rends

- **le nombre d'entrées rendues au français**, et le nouveau couple de totaux ;
- **la table des entrées sans vis-à-vis**, chacune avec son motif ;
- **ce que tu as mesuré sur `Player Character` et `Size`**, et comment — ⭐ si tu conclus
  « absents du livre », dis par quelle recherche, pas seulement le résultat ;
- **le garde qui compare par contenu** ;
- les suites vertes dans un **clone indépendant**, avec le compte ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
