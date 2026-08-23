# LOT 80 — Abilities, refait au vocabulaire des cadres

> **Mandat écrit le 2026-08-16**, sur le croquis d'Eric (« voici comment je
> veux que tu refasses Abilities, en utilisant ce que nous venons
> d'expérimenter »). Le croquis fait foi.
>
> ⭐ **CE LOT N'INVENTE RIEN — IL ASSEMBLE.** Tous les organes existent, sont
> déployés et sont éprouvés au banc : le glisser (`glisser.mjs`), les îlots FS
> (`ilots-lab.html`), le panneau INFO (`abilities-info-lab.html`), le plateau
> de dés (`abilities-tray.mjs`), la règle de tirage (arrêtée, §3). Ce qui
> manque, c'est **l'écran qui les tient ensemble**.

---

## 1. LA FORME — quatre méthodes, un seul entonnoir

```
        ┌─────────────────────────────────────────┐
        │  CHOOSE AN ABILITY GENERATION METHOD    │   FF2, dalle 35 %
        │  [FH 3D6] [4D6] [ARRAY] [FREE] [INFO]   │
        └─────────────────────────────────────────┘
                          │
     ┌──────────┬─────────┼─────────┬──────────┐
   FH 3D6      4D6      ARRAY      FREE      (INFO → panneau)
     │          │          │          │
     ▼          ▼          ▼          ▼
  ┌──────────────────────────────────────────┐
  │  L'ORGANE DE LA MÉTHODE                  │   FF2, dalle 50 %
  │  (explication + boutons + dés, ou grille)│
  └──────────────────────────────────────────┘
  ┌──────────────────────────────────────────┐
  │  [12][13][14][15][16][17]                │   ← RANGÉE FS (les îlots)
  └──────────────────────────────────────────┘
  ┌──────────────────────────────────────────┐
  │  DRAG AND DROP HERE                      │   FF2
  │  STR  DEX  CON  INT  WIS  CHA            │
  │  (◎)  (◎)  (◎)  (◎)  (◎)  (◎)            │
  │  +1    ~    —    —    —    —             │   ← le modificateur sous chaque
  │        [BACK]        [DONE]              │
  └──────────────────────────────────────────┘
```

🔴 **LES TROIS ÉTAGES SONT LES MÊMES POUR LES QUATRE MÉTHODES.** Seul l'étage
du haut change. C'est ce qui rend ce lot faisable : le vivier FS et le
collecteur s'écrivent **une fois**, et les quatre méthodes ne diffèrent que
par ce qui remplit le vivier.

⛔ **Ne pas écrire quatre écrans.** Le dépôt a déjà payé cette faute
(`renderChoixGlisses` vs `renderSlotQcm`, lot 79) : deux formes du même geste
divergent. Ici, une seule forme, quatre sources.

## 2. CE QUI EXISTE DÉJÀ, ET QU'IL FAUT EMPRUNTER

| ce qu'il faut | où c'est, déployé et éprouvé |
|---|---|
| le geste, dans les deux sens | `armerJeton` (`glisser.mjs`), + `onLever/onBouger/onPoser` pour le fantôme |
| la rangée FS + le collecteur + le fantôme | `ui/builder/ilots-lab.html` — **à lever tel quel** |
| le panneau INFO | `ui/builder/abilities-info-lab.html` — **à lever tel quel** |
| le plateau (3 dés 3D, boutons, dix cases) | `abilities-tray.mjs`, intact |
| l'action d'affectation | `assignAbilityRoll` (shell.mjs) — **ne pas y toucher** |
| le tableau standard | `standardArrayBatch()` (abilities-step.mjs) |

📌 **Les deux bancs sont du code de production déguisé** : ils emploient les
vrais modules et les vrais jetons. Les porter, c'est déplacer, pas réécrire.

## 3. LA RÈGLE DE TIRAGE — ✅ ARRÊTÉE PAR ERIC LE 2026-08-16

> **Dix jets de 3d6, on garde les six meilleurs. Si le meilleur n'atteint pas
> 14, il devient 14. Le plus mauvais devient toujours 8. AUCUNE RELANCE.**

Texte joueur, validé mot pour mot :

    Ten rolls of 3d6 — keep the six best. If your highest falls short of 14,
    it becomes 14; your lowest always becomes 8.

🔴 **L'ANCIENNE RÈGLE EST MORTE** : relancer le lot entier jusqu'à un 15
relançait **38 %** du temps (0,61 lot jeté par personnage). La nouvelle ne
relance jamais. Mesuré sur 3 millions de tirages : somme moyenne **71,8**
contre 72,0 pour le tableau standard, un 18 dans **4,5 %** des cas.
⚠️ Le code de `rollAbilitySet` (`dice.mjs`) porte encore l'ancienne règle —
c'est le seul endroit où une règle change dans ce lot.

## 4. LES QUATRE MÉTHODES, ET CE QUI LES SÉPARE

### 4.1 `FH 3D6` — le plateau
Boutons `3D6` · `10X3D6` · `FLASH` · `RESET`, trois dés 3D, les dix résultats
avec leur détail (les écartés **barrés**, pas cachés). Le vivier FS reçoit les
six gardés, après la règle du §3.

### 4.2 `4D6` — le même écran, une autre mécanique
Boutons `4D6` · `6X4D6` · `FLASH` · `RESET`, quatre dés. Six jets de 4d6, on
jette le plus petit dé de chaque jet. **Pas de règle de garde, pas de
rustine** — c'est la méthode classique, et le panneau INFO explique déjà en
quoi elle diffère.

### 4.3 `ARRAY` — pas de dés du tout
Une explication, et le vivier FS porte directement **15 · 14 · 13 · 12 · 10 ·
8**. `standardArrayBatch()` le fait déjà.

### 4.4 `FREE` — 🔴 LA SEULE QUI CHANGE LA NATURE DU VIVIER
Une **grille de seize dés 3D statiques, de 3 à 18**, et trois règles écrites
sur le croquis :
1. *« a single dice can be taken twice »* — **le vivier est INÉPUISABLE** :
   prendre un 14 n'enlève pas le 14 de la grille ;
2. *« removing the dice from the target makes it disappear »* — reprendre un
   dé d'une cible **le détruit**, il ne rentre nulle part ;
3. donc la grille n'a **aucun état** — c'est une palette, pas un stock.

⚠️ **CE QUE ÇA CASSE, ET IL FAUT LE DIRE AVANT DE COMMENCER** : la carte
`assign` du lot 50 associe une clef à l'**INDEX** d'un jet. En FREE il n'y a
pas de jet, et deux caractéristiques peuvent porter la même valeur — l'index
ne veut plus rien dire.
⭐ **LA SORTIE EXISTE DÉJÀ, SANS TOUCHER AU MOTEUR** : la méthode manuelle
pose `{ kind: "set", path: "abilities.<clef>", value }` (`renderManualRow`).
**FREE, c'est la saisie manuelle avec la peau du glisser-déposer.** Aucun
champ nouveau, aucune règle nouvelle — seulement un autre geste pour le même
verbe.

## 5. ✅ LES QUATRE RÉPONSES D'ERIC — 2026-08-16, tout est tranché

### 5.1 🔴 `Validate` DÉGAGE **PARTOUT** — ce n'est pas une exception locale

*« 1 validate dégage PARTOUT »*. `BACK` et `DONE`, dans le pied du collecteur,
ne sont pas la sortie d'Abilities : ils sont **le patron de la sortie
d'étape**, à généraliser.

⚠️ **DEUX GARDES TOMBENT AVEC LUI, ET IL FAUT LES RÉÉCRIRE, PAS LES
DÉSARMER** :
· **garde 16** (`tests/shell-wiring.test.mjs`) — *« UN SEUL `Validate` dans
  tout `ui/` »*, invariant I.3, « répété deux fois par Eric ». Le mot ne doit
  plus apparaître nulle part ; le garde devient donc **ZÉRO `"Validate"` dans
  `ui/`**, et il doit exiger à la place que la sortie d'étape existe — sinon
  il garde du vide.
· **garde 17** (`Back`) — le lot 79 l'avait PRÉCISÉ : `Back` interdit comme
  navigation d'ÉTAPE, autorisé entre PALIERS. Si `BACK` devient la sortie
  d'étape, cette nuance saute et la règle s'inverse. La relire avant d'écrire
  une ligne.
🔴 **`renderValidation()` (shell.mjs, ligne ~1360) est le seul producteur du
bouton** : c'est là que la bascule se joue, pas dans les écrans.
⏳ **Portée** : ce lot livre le patron SUR Abilities. Le porter aux neuf autres
étapes est un lot à part — mais le garde, lui, mordra tout de suite. Prévoir
la migration dans le même souffle ou assumer un garde temporairement adouci
(et le DIRE, jamais le laisser muet).

### 5.2 ✅ Le modificateur va **sous chaque dé**

*« oui exact, à mettre sous chaque dé »*. Pas seulement sous les six cibles :
**sous chaque dé, y compris ceux du vivier FS** — on voit ce que vaut un 15
avant de le poser.

⚠️ **ET LES DEUX NE DISENT PAS LA MÊME CHOSE**, c'est la leçon du lot 46 :
· dans le **vivier**, un dé n'appartient à aucune caractéristique → il ne peut
  montrer que le modificateur **BRUT** de sa valeur (15 → +2) ;
· dans une **cible**, le score est dérivé (boosts d'espèce et d'héritage
  compris) → c'est le modificateur **FINAL**, lu dans `resolved.abilities`,
  **jamais recalculé** (`renderFinalColumn` le fait déjà, au même octet).
⛔ Afficher le brut dans une cible serait la contradiction exacte que le lot 46
a corrigée : « 13 » à côté d'un « +2 » qui appartenait au 14 final.

### 5.3 ✅ `FREE` — une PALETTE, pas un stock

*« t'as 16 dés 3d en statique, tu fais drag and drop. Tu peux mettre 12 trois
fois si tu veux, le pool ne s'épuise pas. Tu peux dégager les dés posés en les
glissant dans le vide ou en les recouvrant. »*

| geste | effet |
|---|---|
| prendre un dé de la grille | il se COPIE — la grille ne bouge jamais |
| le lâcher sur une cible libre | il s'y pose |
| le lâcher sur une cible OCCUPÉE | il **REMPLACE** l'ancien, qui disparaît |
| glisser un dé posé **dans le vide** | il **DISPARAÎT** |

🔴 **DEUX DIVERGENCES AVEC LES TROIS AUTRES MÉTHODES, ET ELLES SONT VOULUES** :
1. **Recouvrir REMPLACE, là où FH/4D6/ARRAY ÉCHANGENT** (l'échange du lot 51).
   C'est cohérent : un échange n'a de sens que si les dés sont en nombre fini.
   Ici le vivier est inépuisable, il n'y a rien à rendre.
2. **Lâcher dans le vide DÉTRUIT, là où l'organe dit aujourd'hui que « un
   glisser relâché dans le vide ne fait RIEN »** (décision du lot 79 :
   *« annuler doit être possible en cours de geste »*).
   ⚠️ **Les deux règles ne se contredisent pas — elles parlent de deux
   trajets** : *vivier → vide* = annuler (rien) ; *cible → vide* = retirer.
   L'organe connaît déjà son point de départ ; c'est l'écran qui tranche.
   **L'écrire ainsi dans le code, sinon le prochain lot lira une
   contradiction et rouvrira le débat.**

⭐ **AUCUN MOTEUR NE BOUGE** : FREE pose `{ kind: "set", path: "abilities.<clef>",
value }` — le verbe de la saisie manuelle, avec la peau du glisser-déposer.
La carte `assign` (clef → index de jet) **ne sert pas** en FREE : il n'y a pas
de jet, et deux caractéristiques peuvent porter la même valeur.

### 5.4 ✅ Le bouton `INFO` ouvre **la page déjà écrite**

`ui/builder/abilities-info-lab.html` — l'argumentaire des trois méthodes, en
FF2, qu'on ferme en cliquant. Il est écrit avec les vrais jetons : le porter,
c'est le déplacer.

## 5 bis. LES QUATRE EXPLICATIONS COURTES — à poser sous chaque méthode

Le croquis écrit « EXPLICATION » en tête de chaque organe. Eric : *« il faut
qu'il y ait une explication courte pour chacune des méthodes, comme celle que
je t'ai demandée pour FH 3D6 »*. Même voix : la règle d'abord, une phrase.

**FH 3D6** — ✅ validée mot pour mot par Eric :

    Ten rolls of 3d6 — keep the six best. If your highest falls short of 14,
    it becomes 14; your lowest always becomes 8.

**4D6** :

    Six rolls of 4d6 — drop the lowest die of each roll. Nothing is
    guaranteed here, and nothing is capped.

**ARRAY** :

    The same six numbers for everyone: 15, 14, 13, 12, 10, 8. No dice, no
    luck, nothing to explain afterwards.

**FREE** :

    Sixteen dice, 3 to 18 — take any value, as often as you like; the pool
    never runs out. Drag a die off to discard it, or drop another on top to
    replace it.

📌 Les trois dernières sont des **propositions** : seule celle de FH 3D6 est
validée. Les faire relire avant de les figer.

## 6. LES COTES, DÉJÀ MESURÉES — ne pas les re-déduire

- **FS** : six colonnes, écart **4**, et à 360 l'îlot vaut **54**, le dé
  **46**. À un écart de 8 le dé tombe à 42, **sous le plancher `--touch`** —
  six cases de 52 plus cinq écarts de 8 demandent 352 px pour 344.
- **La taille du dé se DÉDUIT** de la largeur mesurée d'un îlot. Le moteur 3D
  veut des pixels ; c'est la seule valeur calculée de l'écran.
- **Le fantôme** : monté **une fois par geste**, jamais par image (le
  navigateur plafonne les contextes WebGL vers 16) ; `pointer-events: none`,
  sinon `elementFromPoint` ne voit que lui ; rangé **sans condition** à la fin
  du geste, y compris annulé.
- **Les dalles** : 35 % pour le sélecteur de méthode, 50 % pour les organes
  (croquis).
- 📐 Tout le reste : `ui/builder/CADRES.md`.

## 7. CE QUI NE DOIT PAS CASSER

- `assignAbilityRoll` et son ÉCHANGE (lot 51) — le geste de glisser en dépend ;
- la colonne « Final » et l'alerte de plafond (lot 46) ;
- `emptyAbilityAssign()` à chaque nouveau lot ;
- les 33 gardes d'`abilities-step.test.mjs`, dont douze viennent d'être
  réécrits à la forme des îlots (lot 79) : **ils décrivent déjà le nouvel
  écran**, ce qui rend ce lot beaucoup moins risqué qu'il n'en a l'air.
