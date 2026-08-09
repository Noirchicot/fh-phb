# Lot 25 — `25-builder-affichage`

**En clair : tu construis la PREMIÈRE MOITIÉ DU BUILDER — sa couche
d'affichage.** Pas une fiche de perso, pas un produit à côté : l'écran que le
builder utilisera, livré sans les verbes, pour qu'on vérifie qu'il tient avant
d'y brancher les clics.

Le moteur sait fabriquer un personnage complet depuis des mois. **Personne ne
l'a jamais REGARDÉ.** C'est ce que ce lot mesure.

**Worktree** : `~/tools/fhpc-worktrees/25-builder-affichage`
**Branche** : `25-builder-affichage`, coupée de `main` = `6afa930`
⛔ **Jamais `main`, jamais de `git push`.** Tu commites en local ; l'architecte
fusionne, Eric pousse. **Départ à vérifier : `npm test` → 530/530.**

---

## 1. Pourquoi l'affichage vient AVANT les verbes

Décision d'Eric (option A), et sa raison est mécanique : dans cette
architecture **le document EST l'état, il n'y a pas de brouillon**. Chaque
geste du joueur sera `choose`/`set` → `rebuild` → **on réaffiche la fiche
reconstruite**. L'écran de construction et l'écran de consultation sont donc
**le même écran**. Livrer l'affichage seul n'est pas un détour : c'est livrer
la moitié qui porte les décisions les plus chères à rétrofiter.

### Ce qui survivra à ce lot, et ce qu'on jettera

| On jette | On garde, et le builder s'en sert |
|---|---|
| la page qui défile, sans onglets | **le rendu adressé par CHEMIN** |
| la laideur assumée, zéro mise en page | **la place permanente des `underived` et des `warnings`** |
| l'ordre du schéma comme ordre d'écran | **l'affichage de `stats[]` avec son détail** |

⛔ **Et le garde qui empêche la dérive** : ceci n'est **pas** une fiche de jeu.
**Aucun dé, aucun PV à ajuster, aucun repos court ou long, aucune inspiration,
aucun jet.** Tout ça appartient à la vue de jeu (jalon M4) et au dock v1. Si tu
livres un bouton de repos, tu as raté le lot.

---

## 2. Les décisions d'architecture, déjà prises — ne les rouvre pas

| Décision | Pourquoi |
|---|---|
| ⛔ **Aucun bloc neuf.** Pas de `src/view/` | Mesuré : `src/` n'a que des blocs (`build`, `doc`, `kernel`, `layers`, `mcp`, `modules`, `play`, `schemas`, `storage`, `tools`) et `ARCHITECTURE.md` n'en prévoit aucun pour la vue. Un bloc est un engagement d'architecture — **la tranche suivante décidera où vit la vraie vue**. Ici : un script sous `tools/` et une coquille HTML |
| ⭐ **Le rendu est une FONCTION PURE** : `render(document) → string` | Le dépôt n'a **aucune dépendance hors `ajv`** et il n'y a pas de DOM en test. Une fonction qui rend une **chaîne** se teste avec `node:test` et **zéro paquet**. La page HTML n'est qu'une coquille qui l'appelle |
| ⛔ **ESM natif, zéro build, zéro framework** | Décision Q3 d'Eric, ratifiée. Pas de React, pas de bundler, pas de CDN |
| ⛔ **L'écran ne calcule AUCUNE règle** | Il affiche ce que `resolved` porte. S'il doit calculer pour afficher, c'est un **trou du contrat** : tu le remontes, tu ne le combles pas |

---

## 3. ⚠️ Le document d'exemple ne convient pas — c'est ton premier travail

Mesuré : `examples/personnage-srd-fr-niveau1.fh-char.json` est un **Magicien
Elfe français, SRD seul**. Il porte `stats: []` (vide), 18 compétences SRD,
aucune couche Fate's Hand.

Or `stats` est **la rubrique la plus importante à regarder** : c'est là que
vivent le pool de compétences et le Score de Destinée, et c'est **la seule du
document qui porte son `breakdown`**. Avec ce document, ton écran n'en
montrerait rien.

→ **Génère d'abord un document d'exemple en ANGLAIS, couche FH montée** (la
table d'Eric joue en anglais). Le chemin existe : les harnais de
`tests/fh-skill-pool.test.mjs` montent déjà cette pile. Range-le dans
`examples/`, **génère-le, ne l'écris pas à la main.**

---

## 4. Ce que la page doit faire

Une seule page. Les **21 rubriques** de `resolved`, empilées dans l'ordre du
schéma. Pas d'onglets, pas de colonnes, pas de couleurs travaillées.

### Les quatre règles qui ne se négocient pas

1. ⭐ **Chaque valeur affichée connaît son CHEMIN**
   (`resolved.skills[nature].bonus`) — jamais un gabarit qui lit un champ en
   dur. **C'est la plus chère à rétrofiter** : les valeurs de `resolved` sont
   nues, et le seul moyen pour le builder de dire « ceci a été surchargé » sera
   d'apparier le chemin affiché avec `build.overrides[].path`. Rendu non
   adressé = tout à réécrire quand les verbes arriveront.
2. ⛔ **`underived` et `warnings` ont une place PERMANENTE et visible.** Un
   niveau 1 a `actions`, `resources`, `languages` vides **par conception**, et
   le moteur dit *pourquoi* (`{field, reason}`). Afficher une case vide au lieu
   de sa raison rendrait **l'écran moins honnête que le moteur**.
3. ⭐ **`stats[]` s'affiche AVEC son `breakdown`**, ligne par ligne. Montre le
   seul endroit du document qui explique son propre nombre.
4. ⛔ **Aucun nom de règle en dur** (§0.13) : les noms viennent du document, et
   les mots de l'interface (titres de rubrique) sont regroupés **en un seul
   endroit**, pas semés dans le rendu.

---

## 5. Les tests — sur la fonction, pas sur la page

1. **Les 21 rubriques apparaissent**, la liste **lue dans le schéma**
   (`$defs/resolved.required`), jamais recopiée — idiome à copier :
   `tests/build-derive.test.mjs:48`.
2. **Chaque valeur rendue porte son chemin**, vérifiable dans la sortie.
3. **Un `underived` produit sa raison à l'écran** : prive délibérément le
   document d'un champ et exige que la raison sorte, pas un blanc.
4. **`stats[]` rend son détail** : un terme = une ligne, et le total est celui
   du document.
5. ⚔️ **ATTAQUE obligatoire** : fais mentir le total d'une `stat` (total ≠ somme
   de son détail) et prouve que le rendu **affiche ce que le document dit** au
   lieu de « corriger » en recalculant. **Un écran qui recalcule masque les
   bugs du moteur.**

Restaure l'arbre après chaque attaque, et prouve-le par `git status`.

---

## 6. Ce qui te ferait STOPPER, et c'est légitime

Si une rubrique n'est **pas affichable** sans calculer une règle, c'est un trou
de contrat : **déclare-le et remonte-le** (loi §0.10), n'invente pas. C'est le
but même de ce lot — trouver ces trous **avant** que le formulaire soit écrit.

📌 **Un lot qui remonte trois trous et rend une page laide a mieux réussi qu'un
lot qui rend une belle page en bouchant les trous tout seul.**

Trois lots d'affilée ont corrigé ce siège en refusant une prémisse fausse, et
ils avaient raison les trois fois. Une commande n'est pas une vérité.

## 7. Ce que tu livres

- La fonction, la coquille HTML, le document d'exemple **généré**, les tests.
- **Une commande d'une ligne pour qu'Eric ouvre la page.**
- `INVENTAIRE-LOT-25.md`, et son cœur : **la liste des rubriques qui ne
  s'affichent pas proprement, et pourquoi.** C'est le vrai livrable.
- Commits **en local**, message par **heredoc ou fichier** — jamais `-m "…"`,
  le shell mange les backticks. Suite complète rejouée, arbre propre.
