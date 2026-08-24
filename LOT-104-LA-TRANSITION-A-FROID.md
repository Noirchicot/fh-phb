# Lot 104 — la transition à froid : T4 et T5 d'un seul geste

**En clair :** la couche française cesse d'être un **embranchement** et redevient ce qu'elle
aurait toujours dû être — **des mots posés sur les records anglais**. Les identifiants français
de records disparaissent. **Un objet, une adresse, deux mots.**

> **Eric, 2026-08-24, mot pour mot : « On fait tout péter, tu fais la transition à froid. »**

⛔ **« À froid » veut dire ce qu'il dit** : **aucune table d'alias, aucune couche de
compatibilité, aucune période de transition.** Les signets du site français **casseront en
silence**, et **c'est accepté** — la décision est prise, mesurée, et elle est de lui. ⛔ Ne
propose pas de rétro-compatibilité, ne la « prévois pas au cas où ».

- **Dépôt :** `~/tools/fh-srd` · **branche `104-transition-a-froid`**.
- ⛔ **Jamais sur `main`, jamais de `git push`, jamais de bump.**
- 🔴 **CE LOT NE TOUCHE PAS À `fhpc`.** Sa part y est réelle (24 fichiers de tests, la couche, les
  95 signatures d'Eric) mais **le fil de l'écran R y expédie plusieurs fois par heure**. Elle
  fera son propre lot. **Tu t'arrêtes à la frontière du dépôt, et tu dis ce que tu y laisses.**

---

## 1. Ce que la route a ratifié le 22/08, et qui commande tout

> **Un seul jeu de records, clefs et identifiants en anglais ; le français par-dessus, en
> libellés seulement.** `srd:weapon:en:longsword` s'affiche « épée longue », le poids reste
> `3 lb.`, l'écran rend des kilos s'il veut. **Un objet, une adresse, deux mots.**

C'est la **loi §0.13** : *le moteur produit des identifiants, l'interface produit des mots.*

📌 **Note que l'adresse ratifiée garde son segment `en`.** C'est le texte d'Eric, pas une coquille
de ma part — et je te le signale au lieu de le corriger tout seul : un identifiant
« langue-neutre » qui porte `en` est **bizarre mais RATIFIÉ**. ⛔ Ne le renomme pas. Si ça te
paraît devoir changer, **dis-le, ne le fais pas.**

---

## 2. Le pivot : la table de correspondance, et rien d'autre

**1 328 paires**, produites par tes T1/T2/T3, chacune portant sa **provenance** — `human` pour ce
qu'Eric a signé, `reading/two-way` pour ce qu'un agent a lu dans les deux sens.

🔴 **RIEN NE SE MIGRE SANS SA PAIRE.** Un record français sans vis-à-vis **arrête la migration**
et **se fait nommer** — il ne se devine pas, il ne se rapproche pas « par ressemblance de nom ».
⭐ C'est exactement la discipline qui a trouvé les entrées avalées : **la ressemblance de nom est
la pire des preuves.**

---

## 3. ⏳ LES ORPHELINES — deux cas, deux traitements, et le second est révocable

| | ce que ça devient |
|---|---|
| **`Size`**, côté anglais seul | **rien à faire** : différence d'édition mesurée (le cran français va de `Surprise` à `Télépathie`, ses treize têtes reproduites une par une). Il reste anglais seul |
| **`Vitesse d'escalade` · `de nage` · `de vol`**, côté français seul | 🔴 **elles n'ont AUCUN anglais à qui emprunter une adresse** |

⚠️ **Eric n'a pas tranché ce cas-là, et « à froid » ne le tranche pas non plus.**

➡️ **Ce que tu fais, et c'est un choix HÉRITÉ plutôt qu'inventé** : **elles gardent leur adresse
française**, marquées explicitement comme les seules à le faire, **avec leur motif écrit dans le
module**. ⛔ **Tu n'inventes pas `climbing-speed`** — donner une clef anglaise à une entrée qui
n'en a pas, c'est fabriquer du vocabulaire, et tu l'as refusé toi-même à juste titre.

🔴 **MARQUE CE CHOIX RÉVOCABLE** et remonte-le : c'est une décision d'Eric qui attend, pas une
que je prends. **Trois adresses, et elles sont nommées.**

---

## 4. Ce que tu produis

1. **Les records français fusionnent dans les anglais.** La couche `fr` devient un **patch de
   `name` et `description`** — plus de `cost`, plus de `weight`, plus de valeurs converties.
   ⭐ **Le poids reste `3 lb.` dans la donnée** ; rendre des kilos est le travail de l'écran, pas
   de la couche. C'est tout le sens de la loi §0.13.
2. **Les 544 références croisées suivent mécaniquement** — elles ne se décident pas, elles se
   dérivent.
3. **Le site français se régénère** sur les nouvelles adresses.

---

## 5. 🔴 LA VÉRIFICATION — et elle change de nature, lis bien

⛔ **Le garde « le site FR se reconstruit à l'octet près » NE S'APPLIQUE PLUS** : les URL
changent, c'est le but. **Le remplacer par le bon :**

| | |
|---|---|
| ✅ **le TEXTE des pages françaises est identique** | mot pour mot. **Un seul mot qui bouge est un défaut** — c'est le même garde que ton T2, sur la seule moitié qui doit encore tenir |
| ✅ **les ANCRES changent, et chacune s'explique** | l'ancienne, la nouvelle, et la paire qui l'autorise |
| ✅ **`git grep 'srd:[a-z-]*:fr:'` rend ZÉRO** | sauf les trois orphelines déclarées. ⭐ C'est la preuve la plus courte du lot |
| ✅ **aucun record perdu** | 1 328 paires entrent, le compte final sort, et l'écart s'explique |

---

## 6. ⚠️ Les quatre fautes de ce chantier, et tu en as payé trois

- 🔴 **L'ordre ment.** Jamais d'appariement par position.
- 🔴 **Zéro conflit n'est pas zéro erreur** — une bijection fausse dans les deux sens est
  parfaitement cohérente.
- 🔴 **Un total juste ne dit rien du contenu** — 152 = 152 pendant que trois entrées manquaient.
- 🔴 **La transformation qui rend COMPARABLE détruit l'ORDRE** — ta leçon d'il y a une heure.
  ⚠️ **Elle va resservir ici** : tu vas normaliser des identifiants pour les rapprocher.

**Et les pièges de la maison** : `/usr/bin/python3` **3.9.6** (fitz 1.26.5), pas l'homebrew ·
`sources/pdf` ignoré par git → `SOURCE REFUSED` dans un clone frais · un genre neuf est **refusé,
pas sauté** · ⛔ **ouvrir un genre au contrat désarme une des quatre portes**.

---

## 7. Ce que tu rends

- **`git grep` des identifiants `:fr:` → zéro**, hors les trois orphelines nommées ;
- **le texte des pages françaises inchangé**, et le dire ;
- **le compte de records avant/après**, et l'écart expliqué ;
- ⏳ **les trois orphelines**, leur adresse, et la question pour Eric ;
- 🔴 **CE QUE TU LAISSES CASSÉ CHEZ `fhpc`** — nomme-le précisément : combien de fichiers de
  tests, quelles signatures, ce que la couche devient. **C'est la commande du lot suivant.**
- 🔴 **ET UNE COUTURE PRÉCISE, SIGNALÉE PAR LE FIL DE L'ÉCRAN R** : son pipeline lit les records
  **par `extends`** — `slotParBase`, dans `equipment-step.mjs`, fait correspondre `data.extends`
  à un emplacement du corps. **Si les identifiants `fr:` disparaissent des `extends` de la couche
  `shelving`, c'est régénéré donc gratuit** — ⭐ mais **NOMME-LE** dans ce que tu laisses cassé,
  pour que le lot `fhpc` sache que la couture est là au lieu de la découvrir.
- les suites vertes dans un **clone indépendant**, avec le compte ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
