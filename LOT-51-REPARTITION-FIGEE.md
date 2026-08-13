# Lot 51 — `51-repartition-figee`

> **[Sonnet · medium]** — un lot d'**écran**, court, sur un défaut trouvé en
> REGARDANT la page déployée juste après la fusion du lot 50.

**En clair : une fois les six dés posés, on ne peut plus rien changer.** Zéro
option cliquable sur les six rangées. Pour échanger la FOR et la DEX, il faut
**relancer tout le lot** — et perdre les six jets.

**Worktree** : `~/tools/fhpc-worktrees/51-repartition-figee`
**Branche** : `51-repartition-figee`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ton terrain** : `ui/builder/abilities-step.mjs`, `ui/builder/shell.mjs`,
`ui/builder/shell.css`, `tests/abilities-step.test.mjs`.
⛔ **Rien d'autre.** Un autre lot travaille dans `src/`.

---

## 0. Ce qui est MESURÉ — vérifie-le, ne le refais pas

Sur `https://noirchicot.github.io/fhpc/ui/builder/`, étape Abilities, méthode
`Roll`, après avoir distribué les six dés :

```
str: 1 option, 0 cliquable      int: 1 option, 0 cliquable
dex: 1 option, 0 cliquable      wis: 1 option, 0 cliquable
con: 1 option, 0 cliquable      cha: 1 option, 0 cliquable
                                 → TOTAL : 0 geste possible
```

### La cause, et elle est simple

`optionsForRow` rend **les dés non assignés, plus le sien**. Quand les six sont
posés, « les dés non assignés » est **vide** — il ne reste que le sien, déjà
actif, et cliquer une option active ne fait rien (voulu, lot 45).

⚠️ **Et pourquoi le lot 50 ne l'a pas vu** : son test « réassigner une rangée
déjà servie libère le dé précédent » avait **toujours un dé libre** sous la
main. Le cas limite est **la distribution complète** — c'est-à-dire l'état
NORMAL en fin d'étape. **Le lot 50 n'a pas mal travaillé : son test ne visait
pas cet état.**

### La contrainte qui interdit la sortie facile

⛔ **`clear` sur une caractéristique fait JETER `rebuild`** (« un score ne se
dérive de rien », mesuré par le lot 45, et `applyDecisionAction` appelle
`rebuild()` sans filet). **Ne réintroduis pas `onClear` ici** — une rangée ne
peut jamais être vide.

---

## 1. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ

### 1a. Une rangée offre **TOUJOURS les six dés gardés**

Pas « les libres plus le sien » — **les six**, tout le temps. C'est la seule
forme où le geste reste possible quel que soit l'état.

### 1b. Cliquer un dé **déjà tenu par une autre rangée les ÉCHANGE**

C'est le geste que le joueur veut faire (« mets mon 16 en FOR plutôt qu'en
DEX »), et il n'en existe aucun autre aujourd'hui.

⭐ **Pourquoi l'échange et pas « libérer puis reposer »** : libérer laisserait
une rangée sans dé, donc sans valeur — or `rebuild` jette si l'une des six
manque. **L'échange est le seul geste qui ne traverse jamais un état
indérivable.** C'est la même contrainte qui a déjà façonné cet écran.

⚠️ **Cas limite à traiter, et à DIRE dans ton inventaire** : la rangue cible
peut ne PAS être servie par le lot (elle porte encore une valeur du document,
comme le 13 de CON avant tout tirage). Échanger avec elle veut dire quoi ?
**Mesure, choisis, justifie.**

### 1c. Le joueur doit **VOIR** ce qui va se passer

Un dé tenu par une autre rangée ne se présente pas comme un dé libre. ⚠️ *Rien
ne se cache* (§2 du chantier) : l'écran doit **dire** « celui-ci est en DEX,
cliquer échange » — d'une façon ou d'une autre, à toi de la choisir.

⛔ **Et pas en cachant les libellés** : la compression est interdite par le
cadre d'Eric, et `shell.css` porte déjà un garde contre `display: none`.

### 1d. ⛔ Le document ne gagne rien

Un échange, ce sont **deux `set`** sur `abilities.<clef>`, et deux entrées de
la carte `assign` qui permutent. **Aucun champ neuf, ni au document ni au
schéma.**

---

## 2. Les tests

1. ⚔️ **LE TEST QUI PROUVE LE LOT** : après une distribution **complète** des
   six dés, chaque rangée offre encore **six** options, dont **cinq
   cliquables**. Il doit **rougir sur le code d'aujourd'hui**.
2. **L'échange marche** : FOR tient le 10, DEX le 16 ; cliquer le 16 sur la
   ligne FOR donne FOR=16 **et** DEX=10 — jamais DEX vide, jamais deux rangées
   sur le même dé.
3. ⚔️ **Aucun état intermédiaire indérivable** : après l'échange, les six
   `abilities.<clef>` sont toujours présentes dans `build.choices`.
4. **Deux dés de même valeur restent distincts** à l'échange — c'est tout
   l'acquis du lot 50, ne le casse pas.
5. **Une rangée non servie par le lot** se comporte comme tu l'as décidé en
   §1b, et le test le **montre**.
6. **Relancer remet tout à zéro** — l'acquis du lot 50, plus le garde 11 de
   `tests/ui-jetons.test.mjs` que l'architecte a posé : **ne le fais pas
   rougir**.
7. **Le mode `manual` n'est pas touché.**

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test
visé **et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète
rejouée.

---

## 3. 👀 REGARDE-LE — c'est comme ça que ce défaut a été trouvé

Sers `ui/builder/`, distribue les six dés, **puis essaie de changer d'avis**.
⚠️ **Et vérifie la largeur de ta fenêtre avant de juger la mise en page** :
l'architecte a cru voir une coquille cassée alors qu'il regardait un viewport
de 400 px, où le seuil de 720 px bascule légitimement en disposition étroite.

---

## 4. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à
  l'arrivée**.
- `INVENTAIRE-LOT-51.md` : la forme donnée à l'échange · comment l'écran
  **dit** qu'un dé est pris · ce que tu as décidé pour une rangée non servie ·
  **ce qui t'a surpris** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** **Douze** lots l'ont fait. Le lot 47
a refusé un nom de verbe que sa commande suggérait, et **son refus est devenu
la loi du lot 48**. Le lot 50 a déclaré un trou de test qu'il ne pouvait pas
boucher, et **la revue l'a bouché**. Déclarer vaut mieux que contourner.
