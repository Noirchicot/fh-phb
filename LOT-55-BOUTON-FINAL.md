# Lot 55 — `55-bouton-final`

> **[Sonnet · high]** — trois défauts **trouvés à l'œil** en servant le builder
> fini, le 2026-08-14. Aucun des **876** tests ne voit aucun des trois.

**En clair : le dernier bouton du builder ne fait rien.** Un joueur finit son
personnage, arrive sur *Review*, lit « **Open the sheet** », clique — et reste
exactement où il était. Les deux autres défauts sont du **langage de chantier
affiché au joueur**, et **deux boutons identiques côte à côte**.

**Worktree** : `~/tools/fhpc-worktrees/55-bouton-final`
**Branche** : `55-bouton-final`, coupée de `main` à `bc1bd40` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre que tu obtiens.**

⛔ **Ton terrain** : `ui/builder/shell.mjs`, `ui/builder/abilities-step.mjs`,
`ui/builder/destiny-step.mjs`, et **tes** fichiers de tests.
⛔ **NE TOUCHE PAS à `tests/guards-adversarial.test.mjs`** — le lot 56 y écrit
en ce moment. Pose ton garde **ailleurs** (fichier neuf, ou un fichier de test
d'écran existant).
⛔ **Ne touche pas à `src/`**, ni aux autres fichiers d'étape.

---

## ⭐ 0. TU AS LE DROIT DE ME CONTREDIRE — et c'est demandé

**Cette commande a été écrite par un architecte dont les mesures sont fausses
plusieurs fois par jour.** Si une mesure ci-dessous ne se reproduit pas chez
toi, **la mesure a tort, pas toi** : dis-le, montre ta mesure, et fais ce que
la tienne dicte.

**Ce n'est pas une politesse. C'est le seul détecteur d'erreur extérieur de ce
siège, et il a rapporté six fois sur huit dans la nuit du 13 au 14 août :**

| Daté | Le lot | Ce qu'il a fait |
|---|---|---|
| **2026-08-13** | lot **53** | sa commande listait **quatre** fichiers de tests à repointer. Il a mesuré : **un seul**. Il a démenti sa commande, **et il avait raison** |
| **2026-08-13** | lot **47** | a **refusé** le nom de verbe que sa commande suggérait, trop large. **Son refus est devenu la loi du lot 48** |
| **2026-08-13** | lot **50** | a **déclaré** un trou de test qu'il ne pouvait pas boucher, au lieu de le taire. La revue l'a bouché |
| **2026-08-13** | lot **51** | a attaqué **son propre** travail, vu que 806 tests restaient verts, et **posé son propre garde sans qu'on le lui demande** |
| **2026-08-13** | lot **49** | a trouvé **son propre garde creux** (il lisait la présence d'un mot, pas l'arithmétique) et l'a remplacé |
| **2026-08-14** | *moi, ce matin* | j'ai annoncé **trois** défauts en regardant cet écran ; **deux étaient faux** — j'avais lu `innerText` d'un groupe de boutons comme s'il portait l'état |

---

## 1. 🔴 LE DÉFAUT PRINCIPAL — le bouton final se pointe sur lui-même

### Ce qui est mesuré

`ui/builder/shell.mjs`, la liste des pas et le bouton :

```js
const STEPS = [ …, { id: "equipment", … }, { id: "review", label: "Review" } ];
const REVIEW_INDEX = STEPS.findIndex((step) => step.id === "review");   // = 9
…
button(state.step === STEPS.length - 1 ? "Open the sheet" : "Continue",
  () => {
    state.step = state.step === STEPS.length - 1 ? REVIEW_INDEX : Math.min(…);
    render();
  })
```

`STEPS` compte **10** entrées, `review` est la dernière → `REVIEW_INDEX` vaut
**9**, et `STEPS.length - 1` vaut **9 aussi**. Sur Review, la condition est
vraie, donc le bouton affiche « Open the sheet » **et repose `state.step` à sa
propre valeur**. `render()` redessine le même écran.

**Vérifié dans le navigateur** : clic sur « Open the sheet » → l'écran ne
change pas, l'URL ne change pas, **zéro message en console**.

### ⭐ La cause, et elle n'est la faute de personne

Le commentaire du lot 40, **juste au-dessus**, dit la cause sans la voir :

> *« `STEPS.length - 1` désigne le même index aujourd'hui (review est le
> dernier pas de la ceinture) »*

Quand le lot 40 a écrit ce bouton, **Review n'était pas encore un pas de la
ceinture** : le bouton vivait sur le dernier écran *avant* Review et menait
*à* Review. Review y est entré depuis, les deux indices se sont confondus, et
le bouton s'est mis à pointer sur lui-même. **Chaque lot est resté vert.**

### Ce qu'il faut faire, et la loi qui le dicte

⛔ **N'invente pas une destination.** Il n'y a rien à ouvrir : la fiche v2
jouable **n'existe pas** et demande la parole d'Eric ; l'export et la
sauvegarde appartiennent au bloc `doc`, et le commentaire de ce même bouton le
dit déjà.

**Sur Review, il n'y a pas de pas suivant — donc pas de bouton d'avance.**
Le dépôt porte déjà la loi qui tranche, et elle est ratifiée :

> *« Publier `doc.save` sans pouvoir enregistrer promettrait une porte qui
> n'ouvre sur rien — et une IA lit un catalogue comme un contrat. »*

Un bouton « Open the sheet » qui n'ouvre rien **est** cette porte. La symétrie
existe déjà dans le code d'à côté : `Back` est **désactivé** à l'étape 0
(mesuré : `disabled === true`). Fais le geste symétrique au dernier pas.

⚠️ **Et garde l'intention du lot 40** : le passage vers Review doit continuer
de se faire **par `REVIEW_INDEX`**, jamais par une coïncidence de longueur. Ce
que tu corriges, c'est que **la condition du libellé** et **la condition de
saut** sont la même expression alors qu'elles disent deux choses différentes.

📌 **Si tu penses qu'un autre geste est meilleur — dis-le avant de coder.**
Ce que je refuse est nommé (inventer une destination) ; la forme exacte du
reste t'appartient.

---

## 2. Le langage de chantier affiché au JOUEUR

### 2.1 Mesuré — `ui/builder/abilities-step.mjs`

L'écran Abilities affiche, en clair, à un joueur :

> *« Method "standard" isn't built by this screen yet — showing Roll (3d6 × 10,
> keep 6) instead. »*

« isn't built yet » est une phrase de chantier. Le joueur n'a rien à faire de
ce qui est construit ou non ; il lui faut savoir **ce qu'il regarde** et **ce
qu'il peut faire**. Réécris-la pour lui, en anglais (la table d'Eric joue en
anglais), sans référence au chantier.

### 2.2 Déjà corrigé sur `main`, pour ton information — ne le refais pas

`ui/builder/universe-step.mjs` affichait *« …(measured gap, see
**INVENTAIRE-LOT-54.md**) »* — un document interne, dans la page publiée.
Corrigé le 2026-08-14 (`bc1bd40`, dans ta base). **La mesure de chantier reste
dans le commentaire du code, où elle sert.** Prends-le comme le patron du 2.1.

### 2.3 ⚠️ ET MON PROPRE FILET A RATÉ LE 2.1 — c'est ta consigne de garde

J'ai écrit un scan des chaînes visibles de `ui/` juste après avoir corrigé le
2.2. Il cherchait `LOT-`, `.md`, `TODO`, `FIXME`, `placeholder`. **Il n'a pas
vu le 2.1**, parce que « isn't built by this screen yet » ne contient aucun de
ces mots. Je l'ai trouvé **deux écrans plus loin, à l'œil.**

📌 **La leçon pour ton garde : un garde écrit sur les exemples connus rate le
cas suivant.** Le mandat pose la question à se poser sur tout garde — *cherche-
t-il seulement ce qui est écrit en trop, ou aussi ce qui manque ?* Ici c'est
bien une valeur interdite, donc :

- **écris la limite de ton garde DANS le garde** (chaque garde posé dans la
  nuit du 13 au 14 porte la sienne — c'est ce qui empêche le suivant de le
  croire plus fort qu'il n'est) ;
- **attaque-le** : introduis délibérément une chaîne fautive, vérifie qu'il
  **mord**, puis restaure. Un garde qui ne mord pas est pire que pas de garde ;
- ⚠️ **ne le fais pas mordre sur les COMMENTAIRES** : `INVENTAIRE-LOT-54.md`
  est cité **légitimement** dans le commentaire de `universe-step.mjs`, et doit
  le rester. C'est la partie difficile de ce garde, et c'est là qu'il sera
  creux si tu vas vite.

---

## 3. Les deux boutons « Draw a card »

**Mesuré à l'écran, étape Destiny** : deux boutons portent **le même libellé**
et **le même style orange**, l'un sous l'autre —

- le **sélecteur de mode**, face à « Choose a card » ;
- l'**action**, juste en dessous.

L'écran Abilities résout déjà le même problème, et bien : le mode s'appelle
« **Roll (3d6 × 10, keep 6)** », l'action s'appelle « **Roll** ». Deux mots
différents pour deux gestes différents.

Aligne Destiny sur ce patron. ⚠️ **La forme t'appartient** — je n'ai pas mesuré
laquelle des deux étiquettes est la plus juste à changer.

---

## 4. Ce que je NE te demande PAS, et pourquoi

| | |
|---|---|
| **Le contenu de l'écran Review** | 538 lignes, 11 894 px, dont **464 commencent par `resolved.`**. C'est **voulu** — la « tranche 0 » : *un instrument, pas une maquette*. Le tri de cette page est un geste **d'Eric**, pas d'un lot. ⛔ **N'y touche pas** |
| **`aria-pressed`** | **0 occurrence** dans tout `ui/` : aucun bouton à état n'annonce son état. C'est réel et c'est un lot à part — il touche **tous** les écrans, donc il ne peut pas partir pendant que tu écris ceux-ci |
| **La bascule de thème** | `tokens.css` n'a aucun `[data-theme]`. Autre lot |

---

## 5. Conditions de sortie

1. `npm test` **vert**, et tu écris **le nombre** avant et après.
   ⚠️ **Capture le code de sortie, ne tuyaute pas** : `npm test | grep …`
   masque l'échec — une poussée est partie sur une suite rouge le 2026-08-13
   à cause de ça exactement.
2. Le bouton final ne ment plus, **et un test le prouve**.
3. Les deux textes de chantier sont partis, **et ton garde mord** — attaqué,
   puis restauré.
4. Destiny ne montre plus deux boutons du même nom.
5. **Sers le builder et regarde-le** (`python3 -m http.server` à la racine du
   worktree, puis `/ui/builder/`). Les trois défauts de cette commande ont été
   trouvés à l'œil, pas par une suite. **Va jusqu'à Review en cliquant.**
6. Tu écris ce qui t'a **surpris**, et ce que tu as **attaqué sans qu'on te le
   demande**.
