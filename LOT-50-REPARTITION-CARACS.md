# Lot 50 — `50-repartition-caracs`

> **[Sonnet · high]** — un lot d'**écran**, sur un défaut **qu'Eric a rencontré
> lui-même** sur la page déployée. Il ne touche ni au moteur ni au schéma.

**En clair : on ne peut pas distribuer ses six dés sur ses six caractéristiques.**
Le tirage marche. La répartition, non. Trois rangées sur six restent bloquées sur
les valeurs du personnage d'exemple, sans aucun moyen de recevoir un dé.

**Worktree** : `~/tools/fhpc-worktrees/50-repartition-caracs`
**Branche** : `50-repartition-caracs`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ton terrain** : `ui/builder/abilities-step.mjs`, `ui/builder/shell.mjs`,
`ui/builder/shell.css`, `tests/abilities-step.test.mjs`.
⛔ **Ne touche à AUCUN fichier de `src/doc/`, `schemas/` ni `contracts/doc.md`** —
le lot 47 y travaille en ce moment.
⛔ **Ne touche pas à `src/`** tout court : ce défaut est dans l'écran, et la
mesure ci-dessous le prouve. Si tu trouves que c'est faux, **c'est une question,
pas un contournement.**

---

## 0. LE DÉFAUT, MESURÉ SUR LA PAGE DÉPLOYÉE — ne le refais pas, vérifie-le

Sur `https://noirchicot.github.io/fhpc/ui/builder/`, étape Abilities, méthode
`Roll`, un clic sur `Roll` puis un clic sur le `14` de la rangée STR :

**Les six dés gardés** : `11 · 15 · 11 · 14 · 14 · 11`

| Rangée | Options offertes après le clic | Final |
|---|---|---|
| STR | `11 11 **14*** 11` | 14 |
| DEX | `11 11 **14*** 11` | 14 |
| CON | `**13*** 11 11 11` | 14 |
| INT | `11 **15*** 11 11` | 17 |
| WIS | `**12*** 11 11 11` | 12 |
| CHA | `**10*** 11 11 11` | 10 |

🔴 **`13`, `12` et `10` ne sont dans le lot d'AUCUN dé.** Ce sont les valeurs du
personnage d'exemple. Ces trois rangées n'ont plus que des `11` à recevoir : les
deux `14` et le `15` leur sont **définitivement inaccessibles**.

### La cause, lue dans le code et pas devinée

`optionsForRow` (`abilities-step.mjs:101`) retire du lot **par la VALEUR** :

```js
const index = pool.indexOf(value);
if (index >= 0) pool.splice(index, 1);
```

Deux conséquences, les deux mesurées :

1. **Une valeur jamais tirée qui ressemble à un dé lui vole sa place.** Le `14`
   que DEX portait depuis le personnage d'exemple a mangé l'un des deux `14`
   tirés. Le lot visible aux autres rangées est amputé d'un dé.
2. **Une valeur jamais tirée qui ne ressemble à rien reste à vie.** `13`, `12`,
   `10` ne consomment rien, et le repêchage de `renderAssignRow:220`
   (`options.unshift(current)`) les réaffiche indéfiniment.

⭐ **La racine, en une phrase** : **l'écran n'a aucune notion de « cette rangée a
reçu un dé ».** Il le déduit en comparant des nombres — or un nombre ne dit pas
d'où il vient.

---

## 1. ⭐ LA RÉPONSE EXISTE DÉJÀ, ET ELLE EST DANS UN FICHIER D'ERIC

`~/tools/fh-skills/fh-skill-builder.html`, **ligne 731** — le builder v1, celui
qui, dixit Eric, *« y arrivait »* :

```js
assign: {STR:null,DEX:null,CON:null,INT:null,WIS:null,CHA:null},  // ability -> index into set.kept
```

**Une caractéristique pointe vers l'INDEX d'un dé, jamais vers sa valeur.**

| Ce que ça règle | Comment |
|---|---|
| Les deux `14` | deux **index** distincts — ils ne se confondent plus |
| « pas encore distribué » | `null`, un état que l'écran v2 **ne sait pas exprimer** |
| Le vol de dé par DEX | DEX n'a pas d'index → il ne consomme rien |

📌 **Va le lire.** Ce fichier est la source de vérité de la table, et le mandat
note que ce chantier ne l'ouvre pas spontanément. Reprends sa **forme**, pas son
code — il n'a ni notre moteur, ni nos verbes.

---

## 2. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ

### 2a. La carte d'assignation vit **hors document**, avec le lot de dés

⛔ **Décision d'Eric, 2026-08-13, non négociable** : *le lot de dix dés ne
survit pas, seul le résultat compte.* Le document ne garde donc que les **six
nombres**, posés par `set({path:"abilities.<key>", value})` — exactement comme
aujourd'hui.

➡️ **La carte `key → index` vit au même endroit que le lot** : `state.abilityRoll`
dans `shell.mjs`. Elle meurt avec lui, et c'est correct — une assignation ne veut
rien dire sans le lot qui l'a produite.

⛔ **N'ajoute AUCUN champ au document, ni au schéma.** Si tu crois qu'il en faut
un, arrête-toi et demande.

### 2b. Un nouveau lot **remet toute la carte à `null`**

Relancer invalide l'assignation précédente. `rerollCount` existe déjà et te dit
quand ça arrive.

### 2c. Ce que voit une rangée **non distribuée**

Elle porte quand même une valeur au document (le personnage d'exemple en a six),
et ⛔ **`clear` est interdit ici** — mesuré par le lot 45 : `rebuild()` **jette**
si l'une des six manque, et `applyDecisionAction` appelle `rebuild()` sans filet.
**Ne réintroduis pas `onClear`.**

Donc une rangée non distribuée doit :
- **montrer sa valeur courante**, et **dire** qu'elle ne vient pas du lot ;
- **offrir TOUS les dés encore libres** — c'est précisément ce qui manque
  aujourd'hui à CON, WIS et CHA.

⚠️ **« Dire » est un mot du chantier** : *rien ne se cache* (§2). Une valeur hors
lot qui se ferait passer pour un dé serait le même défaut sous une autre forme.

### 2d. Le plafond de 18 se resserre au **niveau 1** *(Eric, 2026-08-13)*

`renderCapWarning` (`abilities-step.mjs:129`) alerte aujourd'hui à **tout niveau**.
La règle ratifiée est : **18 à la création au niveau 1 ; au-delà, le SRD reprend
le pas** (plafond 20). L'alerte ne doit donc parler **qu'au niveau 1**.

⛔ **Ça reste une ALERTE, jamais un blocage** — rien n'empêche `onAction` de
partir, `validate()` ne prononce aucun refus. C'est écrit aux ADDENDUMS §4.

---

## 3. Les tests — `tests/abilities-step.test.mjs` existe, étends-le

1. ⚔️ **LE TEST QUI PROUVE LE LOT** : rejoue le cas mesuré au §0 à l'octet — six
   valeurs de départ hors lot (`8,14,13,15,12,10`), un lot `11,15,11,14,14,11`,
   une assignation sur STR — et vérifie que **CON, WIS et CHA voient encore le
   `15` et les deux `14`**. Ce test doit **rougir sur le code d'aujourd'hui**.
2. **Deux dés de même valeur sont deux options distinctes** : en assigner un
   laisse l'autre disponible.
3. **Une valeur hors lot ne consomme aucun dé** — le cas du `14` de DEX.
4. **Une rangée non distribuée est reconnaissable** dans le rendu, et une rangée
   distribuée l'est aussi.
5. **Relancer remet toute la carte à `null`**, et les six rangées redeviennent
   servables.
6. **Réassigner** : poser un autre dé sur une rangée déjà servie **libère** le
   précédent pour les autres.
7. **Le document ne gagne aucun champ** : après une assignation complète,
   `build.choices` porte six `abilities.<key>` et **rien de plus** —
   ⚔️ l'attaque : vérifie qu'aucun index ne s'est glissé dans le document.
8. **L'alerte de plafond ne parle qu'au niveau 1** — un personnage de niveau 5 à
   20 en FOR ne déclenche **rien**, un niveau 1 à 19 déclenche l'alerte.
9. **La méthode `manual` n'est pas touchée** — ⛔ ce lot ne retire rien.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test visé
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

⚔️ **Et attaque ce que le lot 45 n'a PAS attaqué.** Rejouer ses attaques ne
prouve rien — c'est lui qui a écrit ce fichier, et le défaut y a survécu.

---

## 4. 👀 REGARDE-LE, ne te contente pas des tests

**765 tests étaient verts sur ce défaut.** Sers `ui/builder/` (un serveur
statique suffit), ouvre l'étape Abilities, tire, distribue les six, et
**décris ce que tu vois**. Trois défauts de ce chantier ont été trouvés comme ça
et aucun autrement.

📌 Et une mesure de la même famille, trouvée le 2026-08-13 : `Back` et
`Show plan` s'affichaient à **1,24:1**, invisibles, sous 765 tests verts.

---

## 5. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-50.md` : la **forme** que tu as donnée à la carte
  d'assignation · comment une rangée non distribuée se **dit** à l'écran · ce que
  tu as repris du builder v1 et ce que tu as laissé · **ce qui t'a surpris** · ce
  que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.** Elle porte **quatre décisions d'architecte** (§2) : si l'une ne
tient pas à la mesure, c'est une **question**, pas un contournement silencieux.

⭐ **Et tu as le DROIT de la contredire.** **Dix** lots l'ont fait, et c'est le
meilleur rendement de ce chantier. Le **lot 43** a trouvé une troisième instance
d'un défaut connu et **ne l'a pas corrigée** — il l'a **déclarée**, en expliquant
pourquoi elle sortait de son mandat. Le **lot 45** a démenti son propre en-tête.
**Les deux gestes sont exactement ce qu'on attend.**

⚠️ **Et sache d'où tu pars** : le lot 45, qui a écrit ce fichier, était un bon
lot. Le défaut n'est pas une négligence — c'est une **prémisse** (« un nombre
suffit à identifier un dé ») qui n'a pas tenu au contact d'un personnage qui
portait déjà six valeurs. Cherche la prémisse, pas le coupable.
