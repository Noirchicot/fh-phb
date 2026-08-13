# Lot 49 — `49-equipement`

> **[Sonnet · high]** — un lot d'**écran**. Il n'ajoute **aucun contenu** et ne
> touche **pas au moteur** : tout ce dont il a besoin existe déjà.

**En clair : le personnage n'a rien sur le dos et pas un sou.** L'étape
Équipement doit lui donner le paquet de sa classe et sa bourse.

**Worktree** : `~/tools/fhpc-worktrees/49-equipement`
**Branche** : `49-equipement`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ton terrain** : un fichier d'étape neuf dans `ui/builder/`, `ui/builder/shell.mjs`,
`ui/builder/shell.css`, et tes tests.
⛔ **Ne touche pas à `src/`.** Le moteur sait déjà tout faire — la mesure du §0 le
prouve. Si tu crois le contraire, **c'est une question, pas un contournement.**

---

## 0. Ce qui est MESURÉ — ne le refais pas, vérifie-le

### 0.1 La règle, ratifiée *(ADDENDUMS §4, Eric, 2026-08-13)*

> **Le paquet de la CLASSE, plus une bourse de 50 PO.**

Au SRD l'équipement vient de la classe **et** de l'arrière-plan (*« A ou B : ce
matériel, ou 50 PO »*). **L'arrière-plan n'existe plus en FH**, et sa moitié
disparaissait avec lui. Les **50 PO** sont donc **hérités**, pas inventés : c'est
exactement l'option B des quatre arrière-plans SRD supprimés.

⚠️ **Le paquet de classe porte SON PROPRE or, et ce n'est pas la même bourse.**
Le Barbare option A donne déjà « … and 15 GP ». Les 50 PO **s'ajoutent**. Un
Barbare option A finit donc à **65 PO**. Vérifié : aucune collision entre les deux.

### 0.2 Le moteur est DÉJÀ câblé — c'est la mesure qui définit ce lot

`derive.mjs:404-445`. `resolved.gear` et `resolved.currency` existent et sont
nourris **uniquement par des choix**. Aucune dérivation à écrire.

| Ce que l'écran pose | Forme exacte |
|---|---|
| Une ligne d'équipement | `gear[N]` → un **`ref`** vers un record `gear`, `weapon` ou `armor` |
| Sa quantité | `gear[N].quantity` → un **entier** |
| Portée ou non | `gear[N].equipped` → un **booléen** |
| La bourse | `currency.cp`, `currency.sp`, `currency.gp`, `currency.pp` |

🔴 **LE PIÈGE DE LA BOURSE, ET IL EST SILENCIEUX.** `CURRENCY_KEYS`
(`derive.mjs:64`) vaut `["cp","sp","gp","pp"]` — **quatre clefs, et pas d'`ep`** —
et `derive.mjs:442` n'écrit `resolved.currency` **que si les quatre sont des
entiers**. Poser `currency.gp = 50` **seul** ne produit **aucune bourse** : le
moteur déclare `underived.currency-incomplete` et se tait. **Pose les quatre**,
zéros compris.

⚠️ Et `gear[N]` sans sa quantité **ou** sans son `equipped` ne produit pas de
ligne non plus — `underived.gear-line-incomplete`. Les trois vont ensemble.

### 0.3 De quoi le joueur dispose

| Genre | Records |
|---|---|
| `gear` | **82** |
| `weapon` | **38** |
| `armor` | **13** |

**133 objets** au total, avec leur `name`, leur `data.cost` et leur `data.weight`.
✅ **Les huit paquets existent comme records** (`Explorer's Pack`,
`Dungeoneer's Pack`, `Priest's Pack`…) — un paquet **se pose comme une ligne**,
il ne se déplie pas.

### 0.4 🔴 LE PAQUET DE CLASSE EST UNE PHRASE, ET RIEN D'AUTRE

`data.starting_equipment` d'un record `class` est **une seule chaîne de prose** :

```
barbarian | "Choose A or B: (A) Greataxe, 4 Handaxes, Explorer's Pack, and 15 GP; or (B) 75 GP"
```

**Les douze sont comme ça.** ⚠️ **Et le Fighter en a TROIS, pas deux** :
*« Choose A, B, or C »*. ⛔ **N'écris rien qui suppose deux options.**

---

## 1. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ

### 1a. ⭐ L'écran AFFICHE la phrase, le joueur COMPOSE son sac — **choix d'Eric**

⛔ **N'écris AUCUNE donnée structurée de paquet de classe.** L'autre piste
(structurer les 12 paquets pour en faire des boutons) a été posée à Eric le
2026-08-13 avec la recommandation de l'architecte, et **Eric a choisi celle-ci**.

📌 **Et sa vertu est réelle** : structurer les paquets créerait une **deuxième
écriture** de la même règle, à côté de la phrase SRD — et la loi du dépôt est que
deux copies divergent sauf si quelque chose les compare. Cette piste-ci n'a
**rien à faire diverger**.

Donc : la phrase de la classe est **montrée telle quelle**, lisiblement, et
l'écran donne un **chercheur** sur les 133 records pour composer le sac ligne par
ligne.

### 1b. La bourse est posée par l'écran, pas dérivée

Les 50 PO sont une **règle**, et le moteur ne les connaît pas. C'est l'écran qui
les pose — et il doit **dire** d'où elles viennent (⚠️ *rien ne se cache*, §2 du
chantier : un joueur qui voit 50 PO apparaître sans explication ne saura pas si
c'est un cadeau ou un bug).

⛔ **Et il ne les repose pas à chaque passage.** Une valeur déjà posée sur
`currency.gp` ne se réécrit pas dans le dos du joueur — c'est **son** argent, il
peut l'avoir dépensé.

### 1c. Le nombre 50 est du CONTENU de règle, pas un littéral d'écran

Écris-le **une fois**, nommé, avec le commentaire qui dit d'où il vient
(ADDENDUMS §4 : hérité de l'option B des arrière-plans supprimés). ⛔ Pas de `50`
nu au milieu d'une fonction de rendu.

### 1d. ⛔ Ne touche pas au moteur

Le §0.2 prouve que tout existe. Si une mesure te contredit, **arrête-toi et
demande** — c'est exactement ce que le lot 45 a fait quand il a vu le namespace
jeter, et c'était le bon geste.

---

## 2. ⛔ SÉQUENCEMENT — LIS CECI AVANT DE COMMENCER

**Ce lot écrit `ui/builder/shell.mjs`** (pour brancher l'étape). **Le lot 50
l'écrit aussi.** Ta branche part donc d'un `main` qui contient **déjà** la fusion
du lot 50 — **vérifie-le** : `git log --oneline -5` doit montrer le lot 50 fusionné.
**S'il n'y est pas, ARRÊTE et dis-le** : tu partirais d'une base qui va bouger
sous toi.

---

## 3. Les tests

1. **Une ligne d'équipement se pose** : un record choisi produit `gear[N]`,
   `gear[N].quantity` et `gear[N].equipped`, et **la ligne apparaît dans
   `resolved.gear`** après `rebuild`. ⭐ C'est le test qui prouve le lot.
2. ⚔️ **Le piège de la bourse** : poser `currency.gp` **seul** ne produit
   **aucune** `resolved.currency` — le test le **montre** au lieu de le cacher,
   puis pose les quatre et vérifie que la bourse apparaît.
3. **Les 50 PO sont posées une fois** et **pas réécrites** au passage suivant,
   même si le joueur a changé le montant.
4. **Un paquet (`Explorer's Pack`) se pose comme une ligne** et ne se déplie pas.
5. **Une armure posée `equipped: true` change `resolved.ac`** — la preuve que
   l'écran parle bien au moteur et pas à lui-même.
6. **La phrase de la classe s'affiche telle quelle**, pour les **douze** classes.
   ⚔️ **L'attaque : le Fighter**, qui a **trois** options — vérifie qu'aucune
   troncature ni aucun « A ou B » ne s'est glissé dans le rendu.
7. **Retirer une ligne** : le joueur doit pouvoir changer d'avis. ⚠️ **Mesure
   d'abord** si `clear` est sûr sur `gear[N]` — sur les caractéristiques il fait
   **jeter** `rebuild` (mesuré par le lot 45). Si c'est le cas ici aussi, **dis-le
   et ne l'offre pas** ; c'est un constat, pas un échec.
8. **Une classe non choisie** : l'étape doit se comporter proprement quand il n'y
   a pas encore de classe — pas de plantage, une phrase qui le dit.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test visé
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

---

## 4. 👀 REGARDE-LE

Sers `ui/builder/`, ouvre l'étape, **compose un sac complet et une bourse**, et
**décris ce que tu vois**. Trois défauts de ce chantier ont été trouvés comme ça
et aucun autrement — dont deux le 2026-08-13, sur une page que **765 tests
verts** déclaraient saine.

---

## 5. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-49.md` : comment le joueur **trouve** un objet parmi 133 · ce que
  tu as fait de la phrase de classe · comment la bourse **se dit** · ce que tu as
  mesuré sur `clear` · **ce qui t'a surpris** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** **Dix** lots l'ont fait, et c'est le
meilleur rendement de ce chantier. Le **lot 43** a trouvé une troisième instance
d'un défaut connu et **ne l'a pas corrigée** — il l'a **déclarée**, en expliquant
pourquoi elle sortait de son mandat. Le **lot 45** a démenti son propre en-tête.
**Les deux gestes sont exactement ce qu'on attend.**
