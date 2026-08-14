# Lot 57 — `57-aria-etat`

> **[Sonnet · high]** — petit en idée, **large en surface**. Il ne change
> **aucun comportement visible** ni aucun pixel : il rend au lecteur d'écran
> l'information que la couleur porte déjà pour l'œil.
>
> ⏳ **NE DÉMARRE PAS AVANT QUE LE LOT 55 SOIT FUSIONNÉ.** Il écrit
> `shell.mjs`, `abilities-step.mjs` et `destiny-step.mjs`, que tu touches.
> C'est le test de séquencement d'Eric lui-même, et il mord ici.

**En clair : dans tout le builder, un bouton sélectionné ne se distingue que
par sa couleur de fond.** Un joueur qui utilise un lecteur d'écran entend douze
fois « Barbarian, Bard, Cleric… » sans jamais savoir **lequel est choisi**.

**Worktree** : `~/tools/fhpc-worktrees/57-aria-etat` *(à créer par l'architecte
au départ)*
**Branche** : `57-aria-etat`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre que tu obtiens.**

⛔ **Ne touche pas à `src/`.** Ton terrain est `ui/` et tes tests.

---

## ⭐ 0. TU AS LE DROIT DE ME CONTREDIRE — et c'est demandé

**Cette commande a été écrite par un architecte dont les mesures sont fausses
plusieurs fois par jour.** Si une mesure ci-dessous ne se reproduit pas chez
toi : **la mesure a tort, pas toi.** Montre la tienne, et suis-la.

**C'est le seul détecteur d'erreur extérieur de ce siège, et il a rapporté
SEPT fois sur les dix derniers lots :**

| Daté | Le lot | Ce qu'il a fait |
|---|---|---|
| **2026-08-14** | lot **56** | ma commande suggérait une **liste blanche** d'extensions ; il a imposé une **liste noire**, au motif qu'une liste blanche recopiée reproduit le risque qu'on corrige. **Il avait raison.** Et il a trouvé, en plus, que `src/tools/fiche.shell.html` échappait **déjà** à l'ancien garde — un trou que ma commande n'avait pas vu |
| **2026-08-13** | lot **53** | sa commande listait **quatre** fichiers de tests ; il en a mesuré **un**. Il m'a démenti, il avait raison |
| **2026-08-13** | lot **47** | a **refusé** le nom de verbe que sa commande suggérait ; son refus est devenu la loi du lot 48 |
| **2026-08-13** | lot **51** | a attaqué **son propre** travail et posé un garde **sans qu'on le lui demande** |
| **2026-08-13** | lot **49** | a trouvé **son propre garde creux** et l'a remplacé |
| **2026-08-14** | *moi, le matin même* | j'ai annoncé **cinq** défauts en regardant les écrans : **trois étaient faux**, tous pour la même raison — j'avais lu la sortie d'un **outil** comme si c'était l'objet mesuré |

---

## 1. 🔴 CE QUI EST MESURÉ

### 1.1 `aria-pressed` : **zéro occurrence dans tout `ui/`**

```
grep -rn "aria-pressed" ui/  →  0
grep -rn "aria-current"  ui/  →  1   (la ceinture d'étapes, correcte)
```

⚠️ **Ce « zéro » a été vérifié lisible** : les 17 fichiers de `ui/builder/`
sont bien du texte pour `grep` (`file` + `grep -c ""` sur chacun). Depuis le
2026-08-14 c'est **gardé** (lot 56) — mais refais la vérification si tu tires
une conclusion d'un « zéro occurrence » ailleurs.

### 1.2 L'état vit dans `data-active`, que le CSS lit et que l'oreille n'a pas

**Six producteurs**, tous mesurés :

| Site | Ce qu'il rend |
|---|---|
| `carnet.mjs:111` | ⭐ **le sélecteur central** — classes, espèces, arcanes, méthodes, dés… |
| `carnet.mjs:96` | le tiret « — » (aucune sélection) |
| `skills-step.mjs:253` | les paliers ½ · ● · ★ |
| `skills-step.mjs:242` | le tiret des paliers |
| `skills-step.mjs:435` | les apprentissages (`Trained` / `Not trained`) |
| `universe-step.mjs:136` | `SRD` / `SRD + FH` |
| `inheritance-step.mjs:154` | les cartes de don |

Et le CSS s'y accroche seul (`shell.css:162-165`, `:205`, `:441`) :

```css
.record-option[data-active="true"] { background: var(--accent); … }
```

📌 **Bonne nouvelle mesurée** : `inheritance-step.mjs:154` est bien un
`<button>` (pas un `<div>` cliquable), donc **le clavier fonctionne déjà
partout**. Ce qui manque est l'**annonce de l'état**, pas l'accès.

### 1.3 🔴 Et trois `aria-label` sont des CLEFS MACHINE

`skills-step.mjs:255` :

```js
btn.setAttribute("aria-label", tierKey);   // → "half", "proficient", "expertise"
```

Le lecteur d'écran annonce **`half`**, en minuscule, la clef du moteur — juste
à côté de `"No proficiency"` (`:244`) et de `"Trained"` / `"Not trained"`
(`:437`), qui sont, eux, de l'anglais pour une oreille humaine.

⚠️ **Le lot 53 n'a pas raté ça par négligence** : il a traité les sélecteurs
issus de `renderPicker`, et ces boutons-ci ont leur **rendu propre**
(`data-value` y est `null`, mesuré dans le navigateur). C'est une **troisième
instance** du même défaut, comme la carte de don en fut la deuxième.

---

## 2. Ce qu'il faut faire

1. **Chaque bouton qui porte un état sélectionné l'annonce.** `aria-pressed`
   est le mot juste pour un bouton à deux états ; si tu penses qu'un autre
   patron convient mieux à un groupe (un vrai groupe radio, par exemple),
   **dis-le et argumente** — je n'ai pas tranché la forme, seulement le manque.
2. ⚠️ **Ne fais PAS six corrections indépendantes.** `data-active` est déjà la
   forme commune : la bonne réparation se pose **là où l'état se pose**, pas à
   sept endroits qui divergeront. **Une divergence de deux lignes voisines est
   exactement le défaut que le lot 53 a payé** (`carnet.mjs:108` et `:109`).
3. **Les trois clefs machine deviennent des mots pour l'oreille.** Ce sont des
   paliers de maîtrise : dis-les comme un humain les dirait à la table.
4. ⛔ **Ne change aucun pixel.** Le CSS lit `data-active` : il doit continuer.
   Si tu remplaces l'attribut, **le CSS suit dans le même commit** — et tu le
   vérifies **à l'œil**, pas seulement au test.
5. **Pose un garde** : aucun bouton du builder ne porte un état visuel sans
   l'annoncer. ⚠️ **Écris sa limite DANS le garde** — c'est la règle du dépôt
   depuis la nuit du 13, et c'est ce qui empêche le suivant de le croire plus
   fort qu'il n'est.

---

## 3. ⚠️ LE PIÈGE QUE JE SUIS TOMBÉ DEDANS CE MATIN — ne le refais pas

J'ai cru que les dix boutons de la ceinture n'avaient **aucun nom accessible**,
parce que l'outil d'inspection les affichait comme `button` nus. **C'était
faux** : ils portent `<span class="belt-index">0</span><span
class="belt-label">Universe & Layers</span>`, donc leur nom est calculé depuis
leur contenu.

📌 **La leçon, et elle vaut pour ton garde** : ne mesure pas l'accessibilité à
la sortie d'un outil qui la résume. Mesure **l'attribut** et **le nom calculé**,
sur le DOM réel.

📌 **Le corollaire, mesuré deux fois de plus le même matin** : `innerText` d'un
groupe de boutons liste **toutes** les options, pas celle qui est choisie. Deux
de mes trois fausses alertes viennent de là.

---

## 4. Ce que je NE te demande pas

| | |
|---|---|
| **L'écran Review** | c'est un instrument brut **voulu**, et son tri est un geste **d'Eric**. ⛔ N'y touche pas |
| **La bascule de thème** | `tokens.css` n'a aucun `[data-theme]`. Autre lot |
| **Le libellé de la ceinture** | son nom accessible est `0Universe & Layers`, index et libellé **collés**. Je ne l'ai **pas** mesuré à l'oreille d'un vrai lecteur d'écran, et je ne te commande pas une correction sur une impression. **Si tu le mesures et qu'il est fautif, dis-le** |

---

## 5. Conditions de sortie

1. `npm test` **vert**, tu écris le nombre avant/après.
   ⚠️ **Capture le code de sortie, ne tuyaute pas** — une poussée est partie
   sur une suite rouge le 2026-08-13 parce que `npm test | grep …` masque
   l'échec.
2. Chaque bouton à état annonce son état, **et le garde le prouve** — attaqué,
   puis restauré.
3. Les trois clefs machine ont disparu de ce qui s'entend.
4. **Aucun changement visuel** — et tu l'as vérifié **en servant le builder**
   (`python3 -m http.server` à la racine, puis `/ui/builder/`), pas seulement
   au test. Les cinq défauts qui ont motivé les lots 55 à 57 ont **tous** été
   trouvés à l'œil.
5. Tu écris ce qui t'a **surpris**, et ce que tu as **attaqué sans qu'on te le
   demande**.
