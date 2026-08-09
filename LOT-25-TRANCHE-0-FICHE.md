# Lot 25 — `25-tranche-0-fiche`

**En clair : le moteur sait fabriquer un personnage complet, et personne ne l'a
jamais REGARDÉ.** Tu construis l'instrument qui le montre — une page qui
défile, moche, jetable, sans onglets et sans design. Ce n'est pas une maquette
du builder : c'est la réglette qui mesure si le document **s'affiche**.

**Worktree** : `~/tools/fhpc-worktrees/25-tranche-0-fiche`
**Branche** : `25-tranche-0-fiche`, coupée de `main` = `6afa930`
⛔ **Jamais `main`, jamais de `git push`.** Tu commites en local ; l'architecte
fusionne, Eric pousse. **Ligne de départ à vérifier : `npm test` → 530/530.**

---

## 1. Les décisions d'architecture, déjà prises — ne les rouvre pas

| Décision | Pourquoi |
|---|---|
| ⛔ **Tu ne crées AUCUN bloc.** Pas de `src/view/` | Un bloc est un engagement d'architecture ; cette tranche est **jetable**. Un script sous `tools/` + un shell HTML suffisent |
| ⭐ **Le rendu est une FONCTION PURE** : `render(document) → string` | Le dépôt n'a **aucune dépendance** hors `ajv`, et il n'y a pas de DOM en test. Une fonction qui rend une **chaîne** se teste avec `node:test` et zéro paquet. La page HTML n'est qu'une coquille qui appelle cette fonction |
| ⛔ **ESM natif, zéro build, zéro framework** | Décision Q3 d'Eric, ratifiée. Pas de React, pas de bundler, pas de CDN |
| ⛔ **L'écran ne calcule AUCUNE règle** (§3.3) | Il affiche ce que `resolved` porte. S'il doit calculer pour afficher, c'est un trou du contrat — **tu le remontes, tu ne le combles pas** |

---

## 2. ⚠️ Le document d'exemple ne convient PAS — c'est ton premier travail

Mesuré : `examples/personnage-srd-fr-niveau1.fh-char.json` est un **Magicien
Elfe français, SRD seul**. Il porte `stats: []` (vide), 18 compétences SRD, et
**aucune couche Fate's Hand**.

Or `stats` est **la rubrique la plus importante à regarder** — c'est là que
vivent le pool de compétences et le Score de Destinée, et c'est la seule qui
porte son `breakdown`. Avec ce document, ton écran n'en montrerait rien.

→ **Tu produis d'abord un document d'exemple en ANGLAIS avec la couche FH
montée** (la table d'Eric joue en anglais). Le chemin existe : les harnais de
`tests/fh-skill-pool.test.mjs` montent déjà cette pile. Range-le dans
`examples/`, et **génère-le, ne l'écris pas à la main**.

---

## 3. Ce que la page doit faire

Une seule page. Les **21 rubriques** de `resolved` empilées **dans l'ordre du
schéma**. Pas d'onglets, pas de colonnes, pas de couleurs travaillées.

### Les quatre règles qui ne se négocient pas

1. ⭐ **Chaque valeur affichée connaît son CHEMIN** (`resolved.skills[nature].bonus`).
   Pas de gabarit qui lit un champ en dur. **C'est la règle la plus chère à
   rétrofiter** : les valeurs de `resolved` sont nues, et le seul moyen pour un
   futur écran de dire « ceci a été surchargé » est d'apparier le chemin
   affiché avec `build.overrides[].path`. Si le rendu n'est pas adressé, il
   faudra tout réécrire.
2. ⛔ **`underived` et `warnings` ont une place PERMANENTE et visible.**
   Un niveau 1 a `actions`, `resources`, `languages` vides **par conception**,
   et le moteur dit *pourquoi* (`{field, reason}`). Si tu affiches une case
   vide au lieu de sa raison, **l'écran est moins honnête que le moteur**.
   C'est la loi « jamais de repli silencieux », appliquée à l'affichage.
3. ⭐ **`stats[]` s'affiche AVEC son `breakdown`**, ligne par ligne. C'est la
   seule rubrique du document qui porte son *pourquoi* : montre-le, c'est la
   démonstration de ce que le reste de la fiche devrait recevoir un jour.
4. ⛔ **Aucun nom de règle en dur dans le code** (§0.13). Les noms viennent du
   document ; les mots de l'interface (les titres de rubrique) sont regroupés
   **en un seul endroit**, pas semés dans le rendu.

### Ce que tu ne fais pas

⛔ Aucune modification. Aucun bouton. Aucun choix. Aucun dé. Aucun onglet.
Aucune mise en page « jolie ». Aucun mobile. **Aucun CSS de plus de ce qu'il
faut pour que ça se lise.**

---

## 4. Les tests — sur la fonction, pas sur la page

`node:test`, sans DOM, sur `render()` :

1. **Les 21 rubriques apparaissent**, et la liste est **lue dans le schéma**
   (`$defs/resolved.required`), jamais recopiée — le garde de
   `tests/build-derive.test.mjs:48` te montre l'idiome.
2. **Chaque valeur rendue porte son chemin** — vérifiable dans la sortie.
3. **Un `underived` produit sa raison à l'écran**, et pas une case vide :
   prive délibérément le document d'un champ et exige que la raison sorte.
4. **`stats[]` rend son détail** : chaque terme du `breakdown` est une ligne,
   et le total est celui du document — **jamais recalculé par le rendu**.
5. ⚔️ **ATTAQUE obligatoire** : fais mentir le total d'une `stat` (total ≠ somme
   du détail) et prouve que le rendu **affiche ce que le document dit** au lieu
   de « corriger » en recalculant. Un écran qui recalcule est un écran qui
   masque les bugs du moteur.

---

## 5. Ce qui te ferait STOPPER, et c'est légitime

Si une rubrique n'est **pas affichable** sans calculer une règle, c'est un trou
de contrat : **déclare-le et remonte-le** (loi §0.10), n'invente pas. C'est
même le but de cette tranche — elle existe pour trouver ces trous **avant** que
le vrai builder soit écrit. Un lot qui remonte trois trous et rend une page
laide a mieux réussi qu'un lot qui rend une belle page en bouchant les trous
tout seul.

## 6. Ce que tu livres

- La fonction, la coquille HTML, le document d'exemple généré, les tests.
- **Un moyen simple pour Eric d'ouvrir la page** (une commande d'une ligne).
- `INVENTAIRE-LOT-25.md` : **la liste des rubriques qui ne s'affichent pas
  proprement et pourquoi** — c'est le vrai livrable de cette tranche.
- Commits **en local**, message par **heredoc ou fichier** (jamais `-m "…"` :
  le shell mange les backticks). Suite complète rejouée, arbre propre.
