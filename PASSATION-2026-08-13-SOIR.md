# Passation — 2026-08-13, soir

> **Pour le siège suivant.** ⛔ **Lis `ARCHITECTE.md` en entier d'abord** — il porte
> l'état, la charte, le budget et les pièges. Ce fichier ne dit que **ce que cette
> session a fait**, et ce qui n'est écrit nulle part ailleurs.
>
> ⚠️ **La passation du MATIN (`PASSATION-2026-08-13.md`) est CONSOMMÉE.** Elle
> décrit un chantier à 685 tests avec sept étapes vides. Ne t'en sers plus.

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`9f747e5`**, **765 verts**, arbre propre, **à jour sur le distant** |
| `fh-phb` `main` | à remesurer — **à jour** |
| `fh-srd` | `20c6598`, à jour |
| **En vol** | **RIEN** — aucun worktree, aucun lot |
| Échéance | **7 novembre 2026** |

⛔ **REMESURE CES SHA.** Un SHA a ici une durée de vie de quelques minutes.

⭐ **SEPT ÉTAPES SUR NEUF SONT BRANCHÉES.** Elles étaient **deux** ce matin.
Il ne reste que **Concept** et **Universe & Layers**.

---

## 2. Ce que la journée a livré — cinq fusions

| Lot | Ce qu'il apporte |
|---|---|
| **42** `ecrans-records` | **Class + Species** — et le carnet publie déjà les listes de records |
| **45** `ecrans-hasard` + **45b** | **Abilities + Destiny**, le hasard testable, les colonnes qui se contredisaient |
| **43** `inheritance-moteur` | **l'arrière-plan n'existe plus** — don libre parmi 5, 3 points sur les six caracs, et la répartition enfin gardée |
| **46** `ecran-inheritance` | l'écran, **et la première confirmation du builder** — `confirm.mjs`, générique |

**685 → 765 tests.** Coût mesuré : **~1,6 M de tokens de sous-agents** (319 k à 534 k
par lot ; les lots moteur coûtent ~1,5 × un lot d'écran).

---

## 3. ⭐ CE QUI A LE PLUS RAPPORTÉ, ET C'EST LA MÊME CHOSE QU'HIER

**👀 SERVIR LE BUILDER ET LE REGARDER.** Un défaut par lot, dont **trois qu'aucun
test ne voyait** :

| Trouvé en regardant | Ce que c'était |
|---|---|
| « 1 of 4 chosen » sur **cinq** lignes | **le MOTEUR** publiait 5 créneaux pour `expected: 4` |
| « **CON 13 → +2** » | l'écran montrait le choix brut à côté du modificateur FINAL |
| un libellé écrasé lettre par lettre | le picker à 26 options du Barde *(trouvé par le lot 42 lui-même)* |

📌 **Et la leçon de méthode, payée DEUX fois aujourd'hui : la LECTURE rattrape le
GREP.** Sur les cinq créneaux, le grep accusait l'écran — la faute était au moteur.
Sur le lot 45, le grep accusait sa boucle — elle était juste, c'est son corps qui
aiguillait. **Deux lots auraient été envoyés réparer le mauvais fichier.**

---

## 4. 🔴 LES ERREURS DE CE SIÈGE

1. **Une charge annoncée comme un problème sans la mesurer compressée.** 2,8 Mo
   semblaient rédhibitoires ; **397 Ko gzippés** ne le sont pas. J'allais optimiser
   un problème qui n'existe pas.
2. **Deux quasi-accusations sur un grep** *(ci-dessus)* — rattrapées en lisant.
3. **Une estimation de contexte trop pessimiste**, faute d'avoir su qu'un fil neuf
   démarre à 200 k. J'avais compté la conversation de conception comme si elle se
   répétait.
4. **« J'enchaîne sur le 46 » suivi d'un tour qui se termine.** Eric l'a relevé
   deux fois. ✅ Corrigé **dans le hook** — voir §6 et la règle anti-annonce.

⚠️ **Et un rappel : quatre des neuf dettes héritées du mandat étaient FAUSSES**
(déjà payées, ou mal dites). L'audit est au §5 d'`ARCHITECTE.md`.
**Une dette recopiée n'est pas une dette vérifiée.**

---

## 5. 🔴 CE QUI ATTEND ERIC — une seule chose

**Activer Pages sur `fhpc`.** Le builder ne tourne que depuis un serveur local, et
Eric a tranché que **chaque joueur construit sur sa machine**.

```bash
gh api -X POST repos/Noirchicot/fhpc/pages -f "source[branch]=main" -f "source[path]=/"
```

→ `https://noirchicot.github.io/fhpc/ui/builder/`

Tout est préparé : `DEPLOIEMENT-BUILDER-V2.md`, et `.nojekyll` est déjà commité.
📌 **Ne pas attendre la fin du builder pour publier** : sept étapes marchent, et ça
met derrière nous le seul test que le siège ne peut pas faire — **l'ouvrir sur une
machine qui n'est pas ce Mac**.

---

## 6. La route — six cycles, et un fil neuf les tient

| | |
|---|---|
| **47** `document-neuf` | ✅ **commande DÉJÀ ÉCRITE** — créer, nommer, le brouillon qui voyage |
| **48** | Concept + Universe *(deux piles)* |
| **49** | Équipement — le paquet de classe + **50 PO** |
| **dettes** | la 3ᵉ instance du refus en double (`block.mjs`) · un défaut latent dans `skill-pool.mjs` — **les deux déclarés par le lot 43** |
| ⏸️ **44** | `garde-des-copies`, écrit, **rangé** — préventif, zéro écart mesuré |

⚠️ **Puis, et ce n'est plus le builder** : le déploiement · **la fiche v2 jouable**
(décision Q1, confirmée) · **AboveVTT**. ⛔ **Ces deux-là demandent la parole d'Eric**,
même si le builder est fini.

---

## 7. ⭐ CE QUI A MARCHÉ, ET QU'IL FAUT REFAIRE

**Les quatre lots du jour ont tous corrigé ou complété leur architecte**, et deux ont
fait le geste le plus difficile — **trouver un défaut et NE PAS le corriger**, en
déclarant pourquoi il sortait de leur mandat :

- le **lot 43** a trouvé une **troisième** instance du « même refus deux fois » ;
- le **lot 45** a sondé `fh.destiny.mode`, vu que le namespace jette, et **arrêté**.

⭐ **Écris dans chaque commande qu'un lot a le DROIT de la contredire, avec un
exemple daté.** C'est ce qui produit ce comportement, et c'est **le meilleur
rendement du chantier** — c'est aussi le seul détecteur d'erreur extérieur du siège.

⚔️ **Et attaque toujours ce que le lot n'a PAS attaqué.** Attaquer ce qu'il a déjà
attaqué ne prouve rien.
