# Lot 47 — `47-document-neuf`

> **[Sonnet · high]** — un lot **moteur et contrat**, pas un lot d'écran. Il ne
> dessine rien. Il ouvre la seule porte que le builder n'a pas : **commencer**.

**En clair : on ne peut pas créer un personnage.** Le builder charge un personnage
d'**exemple**, parce que c'est la seule matière qui existe. Rien ne fabrique un
document vierge, rien n'écrit son **nom**, et un personnage à moitié construit ne
peut pas être **enregistré**.

Ce lot ouvre les trois.

**Worktree** : `~/tools/fhpc-worktrees/47-document-neuf`
**Branche** : `47-document-neuf`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ne touche à AUCUN fichier de `ui/`.** Un autre lot y travaille. Ton terrain :
`src/doc/`, `schemas/`, `contracts/`, `tests/`.

---

## 0. Ce qui est MESURÉ — ne le refais pas

### 0.1 Le bloc `doc` a SIX verbes, et pas de `create`

`open · save · list · import · export · duplicate` (`src/doc/store.mjs`).
`save({document, expect: null})` veut dire « je crée » — mais **l'appelant doit
composer un `fh-char/1` valide de zéro**.

📌 **Et c'est peu** : le personnage d'exemple entre dans `rebuild` **sans
`resolved`** — c'est `rebuild` qui l'écrit. Un document neuf, c'est donc :

```
{ schema, id, name, lang, units, created, modified,
  build: { layers, choices: [], budgets: {}, overrides: [] } }
```

### 0.2 🔴 AUCUN VERBE N'ÉCRIT LE NOM

Mesuré : `set({path:"name", value:"X"})` pose bien un choix dans `build.choices[]`,
**`document.name` ne bouge pas**, et le moteur rend `name` dans **`unconsumed`**.

⛔ **Et `set` n'est PAS la réparation.** La grammaire des chemins de choix est celle
d'un **point de décision** (`src/build/paths.mjs`, `contracts`) — `name` ne dérive
rien. Un nom est une **métadonnée de document**, comme `lang` et `units`.

`name` est **requis** au schéma, `string`, 1 à 200 caractères.

### 0.3 🔴 LE MOTEUR REFUSE DE DÉRIVER UN PERSONNAGE INCOMPLET

Trois portes, chacune qui **jette** :

| Ce qu'on passe | Ce que `rebuild` répond |
|---|---|
| `choices: []` | *« aucun choix `level` »* |
| le niveau seul | *« un personnage sans classe n'est pas une dérivation incomplète, c'est une dérivation impossible »* |
| niveau + classe | *« les six scores de caractéristique sont des CHOIX, et ceux-ci manquent »* |

⭐ **ET LA SORTIE EXISTE DÉJÀ, elle est mesurée et exportée** :
`projectDecisions({ query, choices })` (`src/build/decisions.mjs`, exporté par
`src/build/index.mjs`) ne demande **ni `resolved`, ni dérivation**. Sur
`choices: []` il publie déjà `class` (12 options), `species` (12), `background`.

⚠️ **Corollaire mesuré par le lot 45** : `clear()` sur une caractéristique fait
**jeter** `rebuild`. **L'interface ne peut traverser AUCUN état non dérivable.**
C'est pour ça que ce lot existe avant les écrans Concept et Universe.

---

## 1. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ

### 1a. Le brouillon voyage — **par fichier** *(Eric, 2026-08-13)*

Un personnage à moitié construit doit passer d'un appareil à l'autre. Le transport
est **`export` / `import`**, qui **existent déjà**. ⛔ Pas de code compact à
copier-coller façon `FH1.` : Eric a écarté cette piste, il a déjà payé la leçon.

### 1b. Le schéma de brouillon se **DÉRIVE**, il ne s'écrit pas à côté

Un brouillon est `fh-char/1` **moins `resolved`**. Deux schémas presque identiques,
c'est **deux copies d'une règle** — et la loi du dépôt est qu'elles divergent sauf
si quelque chose les compare.

⛔ **Donc : le schéma de brouillon se construit À PARTIR de `fh-char/1`**, au
chargement, en retirant `resolved` de ses `required`. **Le patron existe, avec sa
loi** : `readFromSchema(schema, route)` (`src/doc/schema.mjs:312`) — *« ce bloc lit
sa règle dans le schéma et n'en invente aucune (loi §0.10) »* — et
`contracts/doc.md:45` dit la même chose du bloc : *« il GÉNÈRE sa liste blanche à
partir de lui »*.

⚠️ **Rendre `resolved` facultatif dans `fh-char/1` est REFUSÉ.** Ça casserait la loi
la plus forte du format — *un personnage joue sans ses couches, et le dit*.

### 1c. La graduation est **gratuite**

Dès que `rebuild` réussit, `resolved` apparaît et le document valide `fh-char/1`
**sans conversion**. ⛔ **N'écris aucun convertisseur.** Un brouillon ne se
transforme pas — il **franchit les trois portes**.

### 1d. Le nom entre par un verbe **du bloc `doc`**, pas du bloc `build`

`build` possède les décisions et `resolved`. Le **nom** est une métadonnée du
document, et le bloc `doc` possède les documents. ⛔ **Ne touche pas à `src/build/`.**

---

## 2. Ce que tu construis

### 2a. `doc.create` — le septième verbe

Rend un document **neuf et vide**, prêt pour `projectDecisions`.

- **Ce qu'il prend** : de quoi remplir les métadonnées requises — `name`, `lang`,
  `units`, et le manifeste des couches actives. ⚠️ **Mesure comment l'exemple
  compose son `build.layers`** (`src/tools/exemple-fh-en.mjs`) et reprends-le.
- **Ce qu'il ne fait pas** : ⛔ il **ne dérive pas**, il **n'enregistre pas**.
  Créer et sauvegarder sont deux gestes.
- **L'`id`** : ⚠️ *« l'unicité est garantie par le bloc `doc`, pas par le schéma »*
  (le `$comment` du schéma). **Dis comment tu le produis**, et respecte son motif.
- ⛔ **Aucun défaut deviné** : pas de `lang` ni d'`units` implicites. Décision D3 du
  chantier — une règle devinée est interdite. Un appel incomplet est un **refus
  nommé**.

### 2b. `doc.rename` — ou le nom qui entre

Écrit `document.name` à la racine. ⚠️ **Le nom du verbe est à toi** — `rename`,
`describe`, un paramètre de `save`… **mesure ce qui existe, choisis, et justifie**.

⛔ **Il valide** : 1 à 200 caractères, comme le schéma. Un nom vide est un refus
**nommé**, jamais un silence.

### 2c. Le schéma de brouillon, **dérivé**

Construit depuis `fh-char/1` au chargement (§1b). `doc.save` et `doc.import`
acceptent **les deux formes** : un brouillon (sans `resolved`) et un personnage
complet.

⚠️ **Et `doc.list` doit DIRE laquelle** — son inventaire porte déjà
`{id, ok, hash, size, name, lang, level, created, modified}`. Un joueur qui voit
sa liste doit distinguer un brouillon d'un personnage fini. **Ajoute ce qu'il
faut, et pas plus.**

### 2d. Le contrat

`contracts/doc.md` : les verbes neufs, le schéma de brouillon et **d'où il vient**,
ce que `list` rend en plus. ⛔ **Chaque clause adossée à son test.**

---

## 3. Les tests

1. **`create` rend un document que `projectDecisions` sait lire** — et qui publie
   déjà les trois listes de records. ⭐ **C'est le test qui prouve tout le lot.**
2. **`create` ne dérive pas** : le document rendu n'a **pas** de `resolved`.
3. ⚔️ **`rebuild` sur ce document JETTE**, et c'est **normal** — le test le montre
   au lieu de le cacher. Les trois portes, une par une.
4. **Le document neuf, une fois ses trois portes franchies, valide `fh-char/1`
   SANS conversion** *(§1c)* — le test enchaîne create → choix → `rebuild` → valide.
5. **Un nom vide, ou de 201 caractères, est un refus nommé.**
6. **Le nom écrit se relit** à la racine, et **ne crée aucun choix** dans
   `build.choices[]`. ⚔️ **L'attaque** : vérifie qu'il ne revient **pas** dans
   `unconsumed`.
7. **Un brouillon s'enregistre, se relit, s'exporte et se réimporte** — à l'octet.
8. ⚔️ **Le schéma de brouillon est DÉRIVÉ, pas recopié** : le test montre qu'ajouter
   une clef requise à `fh-char/1` la rend **aussitôt** requise au brouillon. **C'est
   la seule preuve qui vaut** ; sans elle, rien ne dit que les deux ne divergeront pas.
9. **`doc.list` distingue** un brouillon d'un personnage complet.
10. **Un personnage complet reste enregistrable exactement comme avant** — ⛔ ce lot
    ne retire rien.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test attendu
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

---

## 4. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-47.md` : **le nom que tu as donné au verbe du nom, et pourquoi** ·
  **comment tu produis l'`id`** · comment tu dérives le schéma de brouillon · ce que
  tu as ajouté à `list` · **ce qui t'a surpris** · ce que tu as changé de la commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à l'architecte.**
Elle porte **quatre décisions d'architecte** (§1) : si l'une ne tient pas à la
mesure, c'est une question, pas un contournement silencieux.

⭐ **Et tu as le DROIT de la contredire.** **Dix** lots l'ont fait. Le lot 43 a
trouvé une troisième instance d'un défaut connu et **ne l'a pas corrigée** — il l'a
**déclarée**, en expliquant pourquoi elle sortait de son mandat. Le lot 45 a démenti
son propre en-tête. **Les deux gestes sont exactement ce qu'on attend.**
