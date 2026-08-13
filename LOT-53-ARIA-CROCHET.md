# Lot 53 — `53-aria-crochet`

> **[Sonnet · high]** — un lot de **remise en ordre**, petit en idée et large
> en surface. Il ne change **aucun comportement visible** ; il rend au lecteur
> d'écran ce qui lui appartient.

**En clair : chaque sélecteur du builder annonce un identifiant interne au
lecteur d'écran.** Un bouton qui affiche *« Rogue »* s'annonce
`srd:class:en:rogue`. Un bouton qui affiche *« Roll (3d6 × 10, keep 6) »*
s'annonce `roll`.

**Worktree** : `~/tools/fhpc-worktrees/53-aria-crochet`
**Branche** : `53-aria-crochet`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ton terrain** : `ui/builder/carnet.mjs`, et les fichiers de tests qui
s'appuient sur l'attribut (voir §0.2).
⛔ **NE TOUCHE PAS À `ui/builder/shell.mjs`, ni à `shell.css`, ni aux fichiers
d'étape** — un autre lot (49, l'équipement) y travaille en ce moment.
⛔ **Ne touche pas à `src/`.**

---

## 0. Ce qui est MESURÉ

### 0.1 Les deux lignes qui divergent

`ui/builder/carnet.mjs`, dans `renderPicker` :

```js
btn.textContent = labelOf ? labelOf(value) : String(value);   // ce qu'on VOIT
btn.setAttribute("aria-label", String(value));                 // ce qu'on ENTEND
```

**Elles divergent dès que `labelOf` existe.** ⚠️ **Ce n'est PAS une régression
du lot 50** — le sélecteur de méthode annonçait déjà `roll` en affichant
« Roll (3d6 × 10, keep 6) » bien avant lui. Le lot 50 l'a rendu **visible** en
faisant des valeurs des index de dés ; il ne l'a pas causé.

### 0.2 🔴 LA VRAIE CAUSE : l'attribut sert de CROCHET DE TEST

**Quatre fichiers de tests identifient les options par leur `aria-label`** :

| Fichier | Ce qu'il y cherche |
|---|---|
| `tests/class-species-steps.test.mjs` | `srd:class:en:rogue` |
| `tests/inheritance-step.test.mjs` | `fh:feat:en:auspicious` |
| `tests/skills-step.test.mjs` | `proficient` |
| *(remesure : il y en a peut-être d'autres)* | |

**Un attribut d'accessibilité a été réquisitionné comme identifiant machine.**
C'est pour ça que la valeur brute y est écrite : sans elle, les tests ne
retrouvaient plus leurs boutons. **Le défaut n'est pas une étourderie, c'est un
conflit d'usage** — et c'est pour ça qu'il ne se répare pas en une ligne.

⚠️ **L'architecte avait annoncé « je corrige en une ligne » ; la mesure l'a
démenti.** C'est pour ça que ce lot existe au lieu d'un commit.

---

## 1. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ

### 1a. L'identifiant machine déménage dans `data-value`

C'est sa place. Un `data-*` est fait pour ça, il n'est lu par aucune
technologie d'assistance, et le dépôt s'en sert déjà partout
(`data-active`, `data-kept`, `data-row`, `data-status`).

### 1b. Les quatre fichiers de tests pointent vers `data-value`

⛔ **Mécaniquement, sans changer ce qu'ils affirment.** Un test qui cherchait
`aria-label === "srd:class:en:rogue"` cherche désormais
`data-value === "srd:class:en:rogue"` — **même assertion, autre attribut**.
🔴 **Si tu te surprends à changer ce qu'un test PROUVE, arrête-toi** : ce lot
ne modifie aucune vérité, il déplace un crochet.

### 1c. `aria-label` porte le libellé humain — ou disparaît

⭐ **Mesure d'abord, choisis ensuite, et justifie.** Les deux issues sont
défendables et j'accepte l'une comme l'autre :

- **le retirer** : le `textContent` du bouton **est déjà** son nom accessible.
  Un `aria-label` identique au texte visible est redondant, et un `aria-label`
  qui le contredit est **pire que rien** ;
- **le poser au libellé calculé** (`labelOf(value)`), pour que le nom
  accessible ne dépende pas du texte rendu.

⚠️ **Le bouton « — » (aucun choix) est un cas à part** : son texte visible est
un tiret, qui ne veut rien dire à l'oreille. **Son `aria-label` « None » doit
survivre** quelle que soit ton issue.

### 1d. ⛔ Aucun comportement ne change

Pas de nouveau geste, pas de nouvelle classe CSS, pas de nouveau champ.
**Le rendu visible doit être identique à l'octet près.**

---

## 2. Les tests

1. ⚔️ **LE TEST QUI PROUVE LE LOT** : pour un sélecteur dont `labelOf` change
   la valeur (le sélecteur de méthode des caracs est parfait — `roll` vs
   « Roll (3d6 × 10, keep 6) »), le **nom accessible** du bouton est le
   **libellé humain**, jamais l'identifiant. Il doit **rougir sur le code
   d'aujourd'hui**.
2. **`data-value` porte l'identifiant** sur chaque option d'un `renderPicker`.
3. **Le bouton « — » garde son « None ».**
4. **Aucun test existant ne change de VÉRITÉ** — seulement d'attribut. ⚔️
   L'attaque qui le prouve : casse `data-value` et vérifie que ce sont bien
   **les quatre fichiers repointés** qui rougissent, et pas d'autres.
5. **Le rendu visible est inchangé** : le `textContent` de chaque option est
   le même qu'avant, pour au moins deux étapes différentes.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test
visé **et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète
rejouée.

---

## 3. 👀 REGARDE-LE

Sers `ui/builder/` et parcours **deux étapes au moins**. Rien ne doit avoir
bougé à l'œil. ⚠️ **Vérifie la largeur de ta fenêtre avant de juger une mise en
page** — l'architecte a cru voir une coquille cassée en regardant un viewport
de 400 px, où le seuil de 720 bascule légitimement.

---

## 4. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à
  l'arrivée**.
- `INVENTAIRE-LOT-53.md` : l'issue choisie en §1c **et pourquoi** · la liste
  RÉELLE des fichiers qui s'appuyaient sur l'attribut (remesure-la, la mienne
  peut être incomplète) · **ce qui t'a surpris** · ce que tu as changé de cette
  commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** **Treize** lots l'ont fait. Le lot 50
a **déclaré** ce défaut-ci sans le corriger, parce qu'il sortait de son
périmètre — **sans ce geste, ce lot n'existerait pas**. Le lot 51 a attaqué son
propre travail, vu que 806 tests restaient verts, et posé son garde tout seul.
**Déclarer et attaquer valent mieux que contourner.**
