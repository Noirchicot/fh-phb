# Passation — 2026-08-14 (la nuit du builder)

> **Pour le siège suivant.** ⛔ **Lis `ARCHITECTE.md` en entier d'abord** — il
> porte l'état, la charte, le budget et les pièges. Ce fichier ne dit que ce que
> cette session a fait, et ce qui n'est écrit nulle part ailleurs.
>
> ⚠️ **`PASSATION-2026-08-13-SOIR.md` est CONSOMMÉE.** Elle décrit un chantier à
> 765 tests avec sept étapes branchées. Il y en a **876** et **neuf**.

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`b596408`**, **876 verts**, arbre propre, à jour sur le distant |
| `fh-phb` `main` | à remesurer — à jour |
| `fh-srd` | `20c6598`, à jour |
| **En vol** | **RIEN** |
| **Le builder** | 🎉 **LES NEUF ÉTAPES SONT BRANCHÉES** — plus aucun placeholder |
| Échéance | **7 novembre 2026** |

⛔ **REMESURE CES SHA.** Un SHA a ici une durée de vie de quelques minutes.

---

## 2. Ce que la nuit a livré — huit fusions, 765 → 876

| Lot | Ce qu'il ouvre |
|---|---|
| **47** `document-neuf` | un personnage **COMMENCE** : `doc.create`, `doc.rename`, schéma de brouillon **dérivé** |
| **50** `repartition-caracs` | les six dés **se distribuent** *(le défaut qu'Eric a rencontré lui-même)* |
| **48** `champs-identite` | **genre · alignement · campagne**, et `doc.describe` qui lit sa liste blanche **dans le schéma** |
| **52** `dettes-lot-43` | les deux dettes payées — l'une était **plus grande** que déclarée |
| **51** `repartition-figee` | on peut **changer d'avis** : cliquer un dé tenu ailleurs les **échange** |
| **53** `aria-crochet` | le lecteur d'écran cesse d'annoncer des **identifiants** |
| **49** `equipement` | le **sac** et la **bourse de 50 PO** |
| **54** `concept-univers` | **les deux dernières étapes** — et le builder est complet |

---

## 3. ⭐ CE QUI A LE PLUS RAPPORTÉ, ET CE N'EST PAS L'ARCHITECTE

**SIX lots sur huit ont corrigé, complété ou démenti leur commande.** C'est le
meilleur rendement du chantier, et de loin.

| Lot | Ce qu'il a fait |
|---|---|
| **43** *(la veille)* | a **déclaré** deux dettes hors de son mandat — **sans lui, pas de lot 52** |
| **47** | a **refusé** le nom de verbe que sa commande suggérait — **son refus est devenu la loi du 48** |
| **50** | a **déclaré** un trou de test qu'il ne pouvait pas boucher — la revue l'a bouché |
| **51** | a attaqué **son propre** travail, vu que 806 tests restaient verts, et posé son garde **sans qu'on le lui demande** |
| **49** | a trouvé **son propre garde creux** (il lisait la présence du mot, pas l'arithmétique) et l'a remplacé |
| **53** | a **démenti la liste de fichiers de sa commande**, et il avait raison |

📌 **Écris dans CHAQUE commande qu'un lot a le droit de la contredire, avec des
exemples DATÉS.** C'est ce qui produit ce comportement, et c'est **le seul
détecteur d'erreur extérieur du siège**.

---

## 4. 🔴 LA TROUVAILLE QUI VAUT PLUS QUE LES HUIT LOTS

**`src/build/block.mjs` était INVISIBLE AU GREP.** Deux octets NUL bruts
(ligne 410, un séparateur de clef écrit en octets au lieu de sa séquence
d'échappement) le faisaient classer « data » par `file` ; **grep le sautait en
silence** — `grep -c ""` dessus rendait **zéro**.

**Ce que ça a coûté le jour même** : j'ai cherché au grep les producteurs d'une
violation, n'en ai trouvé **qu'un**, et conclu qu'une dette était **retirée**.
**Faux : il y en a deux.** C'est `sed` qui a démenti `grep`, et **la
contradiction entre deux instruments** est ce qui a mené au diagnostic.

⭐ **Pourquoi c'est pire qu'un faux négatif ordinaire** : dans ce chantier,
*« zéro occurrence »* se lit comme une **preuve d'absence**. C'est la forme de
la moitié des mesures du mandat **et de tout son audit des dettes §5**. Un seul
fichier illisible les transforme toutes en mensonge silencieux, et **rien ne le
signale**.

✅ Corrigé, gardé (`guards-adversarial.test.mjs`, défaut n°6), attaqué sur
l'arbre réel.

📌 **Et l'ironie qui porte la leçon** : mon premier jet de ce garde portait
lui-même deux octets NUL bruts. **On réintroduit un défaut en écrivant sa
parade.**

---

## 5. 🔴 CE QUI ATTEND ERIC

| | |
|---|---|
| **La langue de la fiche n'est pas choisissable** | Il a demandé « Langues : FR / EN » dans Universe. Mesuré : `lang` et `units` sont des champs racine **REQUIS**, donc structurellement hors de `describableFields` — **aucun verbe ne peut les réécrire** après création. Le lot 54 les a mis en **lecture seule** plutôt que d'inventer un dixième verbe sans mandat. **Le manque est réel.** Un dixième verbe est un changement de contrat : ça se demande |
| **La bascule de couleurs n'existe pas** | Mesuré : `tokens.css` n'a **aucun sélecteur `[data-theme]`**, le thème suit l'OS. C'est un petit chantier, pas un branchement |
| **Les 76 lignes non commitées** | `sync_from_vault.py`, worktree `fh-phb`, ouvertes depuis le **2026-07-27**. Ni commitées ni jetées. **C'est une décision, pas du ménage** |
| **Et après le builder** | ⛔ **la fiche v2 jouable** et **AboveVTT** demandent sa parole, même le builder fini — la charte ne s'étend pas toute seule |

---

## 6. Les dettes NOMMÉES cette nuit — chacune avec sa mesure

| Dette | La mesure |
|---|---|
| **`lang`/`units` non réécrivables** | `describableFields` → `[alignment, campaign, gender]`. Les deux sont `required`, donc exclus **par construction** |
| **Le cache du navigateur** | Un joueur qui revient avec un `shell.mjs` en cache voit **l'ancien builder**. Aucun cache-busting sur les imports. *(Mesuré en direct : j'ai cru voir deux placeholders qui n'existaient plus.)* |
| **`dice.mjs:66`** | un `while` **sans plafond** nourri par une fonction RNG **injectée**. Avec `Math.random` il termine ; avec un RNG scripté qui ne rend jamais 15+, **il tourne à l'infini** |
| **`describableFields` ne lit qu'une orthographe** | `type: "string"` → vu · `$ref` → **invisible** · `["string","null"]` → **invisible**. Et `lang` est un `$ref` **dans ce schéma même**. Inscrit dans `contracts/doc.md` |
| **`aria-label`, sites restants** | mesurés et **légitimes** : « Trained », « No proficiency », « Skill categories », « None ». Des mots pour l'oreille |
| **La déduplication du lot 52 rétrécit la portée** | le code retiré matchait **tout** espace de noms, le gardé ne connaît que `background.`. Vérifié : rien n'est perdu **aujourd'hui** — mais un `inheritance.boost.*` futur disparaîtrait en silence |

---

## 7. 🔴 L'INSTABILITÉ DE SUITE — inconnu NOMMÉ, et mes deux hypothèses sont tombées

**Trois observations** : deux échecs isolés sur la passe suivant immédiatement
un `git merge` (lots 50 et 48), et un `dice.test.mjs` rouge vu par le lot 49.
**Jamais reproduit** — 40 passes de `dice.test.mjs`, 0 échec ; 3-4 passes après
chaque incident, toutes vertes.

| Hypothèse | Ce qui la tue |
|---|---|
| « les gardes d'octets lisent au chargement du module » | n'explique **pas** `dice.test.mjs`, qui ne lit aucun fichier |
| « c'est le RNG » | `dice.mjs:66` relance jusqu'à un 15+ : l'assertion est **vraie par construction** |

⛔ **NE LE DÉCLARE PAS RÉSOLU.** Ce mandat porte déjà le précédent : une
instabilité rapportée par un lot avait été « non reproduite » parce que l'arbre
était remis propre entre les passes, **et le défaut était réel**.
📌 Un `sleep 2` après le merge a coïncidé avec quatre fusions sans échec —
**coïncidence n'est pas cause**, et je refuse de l'écrire comme si c'en était une.

---

## 8. Les fautes de ce siège, comptées

**Six**, dont cinq rattrapées par une mesure ou par un lot :

1. **Le mauvais objet, encore** — j'ai conclu qu'une dette était retirée sur un
   `grep` qui ne lisait pas le fichier ;
2. **« Je corrige en une ligne »** pour l'`aria-label` — c'était un crochet de
   test dans plusieurs fichiers, donc **un lot** ;
3. **« La coquille est cassée »** jugé sur une capture — je regardais un
   **viewport de 400 px** où le seuil de 720 bascule légitimement ;
4. **Une liste de quatre fichiers** dans la commande du lot 53 — il y en avait
   **un**. Le lot m'a démenti et il avait raison ;
5. **`git merge -F -` ne lit pas stdin** — c'est écrit dans mon propre mandat
   depuis le 8 août, et je l'ai refait ;
6. **`npm test | grep` avant un push masque le code de sortie** — une poussée
   est partie sur une suite rouge (`main` était sain, mais **par chance**).

📌 **La forme est toujours la même — mesurer le mauvais objet — et elle se
renouvelle indéfiniment.** La seule parade qui a marché à chaque fois : **quand
un résultat surprend, suspecter d'abord son propre protocole**, et **montrer la
mesure plutôt que la conclusion**.

---

## 9. La route, après le builder

| | |
|---|---|
| **Le dixième verbe** *(ou l'élargissement de `describe`)* | pour que `lang`/`units` redeviennent modifiables — **demande à Eric** |
| **La bascule de thème** | `[data-theme]` + persistance en `localStorage` |
| **La persistance** | le brouillon qui voyage : `export`/`import` existent, il manque un magasin de navigateur. ⛔ **Pas de faux magasin** — publier `doc.save` sans pouvoir enregistrer promettrait une porte qui n'ouvre sur rien |
| ⛔ **La fiche v2 jouable · AboveVTT** | **parole d'Eric requise** |

⏸️ **44 `garde-des-copies`** reste écrit et **rangé** — préventif, zéro écart mesuré.

---

## 10. ⭐ CE QUI A MARCHÉ, ET QU'IL FAUT REFAIRE

1. **👀 SERVIR LE BUILDER ET LE REGARDER.** Troisième session de suite où c'est
   la pratique la plus rentable : le bouton invisible à **1,24:1**, la
   répartition **figée**, les deux trouvés à l'œil sous des centaines de tests
   verts.
2. **⚔️ ATTAQUER CE QUE LE LOT N'A PAS ATTAQUÉ.** Rejouer ses attaques ne prouve
   rien. Les miennes ont trouvé **deux** trous réels cette nuit.
3. **REMESURER CHAQUE DETTE AVANT D'AGIR.** Une était **plus grande** que
   déclarée, une autre paraissait retirée et ne l'était pas.
4. **DIRE LES LIMITES DES GARDES DANS LES GARDES.** Chaque garde posé cette nuit
   porte sa propre limite écrite — c'est ce qui empêche le prochain de le croire
   plus fort qu'il n'est.
