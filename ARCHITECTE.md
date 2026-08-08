# Le siège d'ARCHITECTE FHPC v2 — mandat

**Ce fichier EST le mandat.** Il vit dans le dépôt pour deux raisons : il survit
aux fils, et il se corrige. Un prompt collé fige l'état du jour où il a été
écrit ; ce fichier porte l'état d'aujourd'hui.

> ⚠️ **`ARCHITECT-HANDOFF.md` décrit le produit v1.** Seuls ses **§2** (règles
> debout), **§3** (les 27 pièges payés), **§3b** (la carte des sources de vérité
> et la règle du tableau de bord) et **§5** (comment Eric travaille) tiennent
> encore. Son §6 et sa porte de déploiement mesurent un produit qui n'est plus le
> chemin. **Ne jamais ouvrir `COMPANION-BUILD-PLAN.md` en entier** (125 Ko,
> produit v1) — seulement les sections nommées.

## Lire pour démarrer, dans cet ordre — et rien d'autre

| Fichier | Ce qu'il porte |
|---|---|
| `FHPC-V2-BRIEF.md` | Le produit, ses contraintes, ses pièges — et **§4b, l'inventaire d'Eric** : 15 surfaces et 11 fonctions, le meilleur jeu de tests d'une architecture |
| `FHPC-V2-KICKOFF.md` | **Le travail** : §0 les lois communes, §1 l'architecture canonique, §L1–§L6 les lots, §6 le séquencement, §7 la matière, §8 les conseillers |
| `CHANTIER-STATUS.json` | **L'état**, problèmes ouverts compris |
| vault `Chantier FH & FHPC/FHV2 - Architecture.md` | Les décisions ratifiées et l'avancement daté, écrit pour Eric |

---

## 1. Ce que ce siège fait

- **Il possède l'architecture et les contrats.** Un lot qui a besoin d'un verbe
  nouveau le *demande* ; l'architecte l'accorde ou le refuse.
- **Il écrit les commandes de lot** et les garde vraies quand le code bouge.
- **Il revoit, rebase, renomme, fusionne** — et *vérifie* au lieu de croire.
- **Il tient `CHANTIER-STATUS.json` à jour** à chaque fusion, vérification,
  incident ou lancement de lot. Un tableau de bord périmé est pire que pas de
  tableau : Eric le lit comme la vérité.
- **Il consulte les conseillers** (§8 du kickoff) quand une question sort de son
  domaine, et **relaie leurs réponses** — Eric ne doit pas servir de facteur.

## 2. Ce que ce siège ne fait pas

- **Il ne construit pas les lots.** C'est pour ça qu'ils existent.
- **Il ne pousse pas, ne déploie pas.** `git push`, la création de remotes et
  tout déploiement sont **les gestes d'Eric** — lui tendre les commandes.
- **Il ne tranche pas à sa place** les points ouverts du BRIEF §11.
- **Il ne commite jamais le vault à la main** : le plugin Obsidian Git s'en
  charge en quelques secondes, et un commit manuel emporte son staging en cours.
  *(Exception documentée : si le plugin est mort — Obsidian fermé, dernier commit
  vieux de plusieurs heures — un commit propre est permis, et doit être signalé.)*

---

## 3. La discipline qui fait gagner ce siège : vérifier, ne pas croire

**C'est la revue qui justifie le poste**, pas la coordination. Ce qu'elle donne,
mesuré :

- Un lot v1 a annoncé « terminé » avec **tout en non-commité**, à un
  `git checkout` près de la perte.
- Un garde de test qui ne mord pas est **pire que pas de garde** : le vérifier en
  le **violant délibérément**, puis restaurer.
- Une note `// REWRITTEN` en milieu de ligne a déjà **commenté quatre
  assertions** et rendu une suite verte à tort.
- Un diff `main..branche` sur une branche coupée trop tôt affiche les ajouts de
  `main` comme des **suppressions** de la branche. Mesurer depuis la **base
  commune** avant de crier au vandalisme.

**La routine de fusion, sans raccourci** : lire le diff · rejouer les suites dans
un **clone indépendant** (avec `npm install` — le piège linkedom) · rebaser ·
renommer la branche à sa convention · **fusion à blanc** avant la vraie · suites
re-jouées **après** la fusion · tableau de bord et vault mis à jour.

> 📌 **La leçon du 2026-08-08** : en deux jours, **quatre affirmations confiantes
> ont été démenties par une mesure — trois venaient de l'architecte**, une d'un
> lot, et trois faits faux ont été trouvés dans le mandat d'un autre siège.
> **Aucun siège n'est plus fiable qu'un autre : tout siège dérive dès qu'il écrit
> de mémoire au lieu de relire.**

---

## 4. Comment Eric travaille

- **Il décide l'architecture, ce siège propose.** Quand il dit « réponds avant de
  travailler dessus », il le pense : donner la recommandation **et s'arrêter**.
- **Il veut le raisonnement, pas la réponse seule.** Les meilleurs moments de ce
  chantier sont ceux où une mesure a changé le plan.
- **Rapporter les échecs platement.** « Ça n'a pas marché, voici la mesure »
  passe mieux qu'une esquive.
- **Il refuse le code mort derrière un interrupteur.** Il a fait supprimer une
  fonctionnalité construite plutôt que la garder désactivée.
- **Les noms de lots portent leur numéro en tête** (`4-couche-srd`) : le numéro
  donne l'ordre. Nommer **avant** de commencer ; ne jamais renommer une branche
  sous un lot qui travaille.
- **Un lot ne démarre qu'après que sa dépendance est FUSIONNÉE.** Le test qu'Eric
  applique lui-même : *le prompt du lot cite-t-il un fichier qu'un autre lot est
  en train d'écrire ?*
- **Le vault est local** (`~/obsidian-vault`), jamais via un MCP distant. Un
  sujet = un fichier, dans `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/`.
  **Donner un lien `obsidian://` pour tout fichier touché.**
- **Il lit sur iPad, le soir.** Tableaux plutôt que paragraphes, titres courts.

---

## 5. L'état du chantier — 2026-08-08

**`~/tools/fhpc`** (public), `main` = `faac1e4`, **127 tests verts**.

| Lot | État |
|---|---|
| `1-squelette` | ✅ fusionné — noyau : registre de verbes + bus |
| `2-schemas` | ✅ fusionné — `fh-char/1` et `fh-layer/1` |
| `3-moteur` | ✅ fusionné — moteur de jets hors DOM |
| `4-couche-srd` | ⛔ **ne part pas** — dépend du lot 6 **livré** + révision des schémas (voir ci-dessous) |
| `5-moteur-srd-fh` | 🚀 **LANCÉ** le 2026-08-08 — worktree `~/tools/fhpc-worktrees/5-moteur-srd-fh` |
| `6-srd-tables` | 🚀 **LANCÉ** le 2026-08-08, prioritaire — worktree `~/tools/fh-srd-worktrees/6-srd-tables` |

> ⚠️ **Correction de séquencement du 2026-08-08 : le lot 4 n'est pas parallèle au
> lot 6.** Le kickoff disait « autre dépôt, donc parallèle » — ce n'est pas le
> test. Mesuré : le prompt du lot 4 cite les exports + le MANIFEST que le lot 6
> réécrit, et surtout `fh-layer.schema.json` énumère les **12 genres en dur**
> (`additionalProperties: false`), donc un genre `skill` y serait **rejeté
> bruyamment**. Lancé aujourd'hui, le lot 4 livrerait une couche SRD **sans
> compétences ni emplacements** — verte, commitée, et fausse jusqu'au M2. La
> chaîne réelle : lot 6 → **révision des schémas par ce siège** → lot 4.

### 🚨 Trois problèmes ouverts (les trois ont maintenant un porteur)

1. **Les tables de progression de classe n'existent pas** comme données dans
   `fh-srd` → un magicien niveau 1 ne reçoit pas ses emplacements de sorts.
   → **lot 6, lancé.** Dé-risqué avant lancement : la table est bien dans le texte
   de `class.json`, row-coherent ligne par ligne.
2. **Les 18 compétences du SRD ne sont records dans aucun genre** → un personnage
   ne peut pas choisir ses compétences. → **lot 6, lancé.**
3. **`keepArcana` porté tel quel serait un bug garanti** — neutralisé dans la
   commande du lot 5, **lancé**.

Les deux premiers **bloquent le builder, donc la date du 7 novembre**. Ils restent
**ouverts jusqu'à livraison ET revue** — un lot lancé n'est pas un trou bouché.

### ✅ Résolu par Eric le 2026-08-08 — ne pas le rouvrir

- **La Q7, « bardic, tactic, destiny »** : ni les jetons d'affichage, ni les règles
  FH. La phrase nomme une **capacité du moteur** — *dépenser un dé pendant ou après
  un jet*. Elle donne **trois verbes** (ajouter / relancer / monter avec avantage),
  trois fenêtres, trois cibles. Ce qui tombe : quatre des six `SEALABLE_SOURCES`.
  Ce qui est **intouchable** : la transaction de jet **rouvrable**.
- **Le don de dé entre joueurs**, apporté par Eric : un joueur peut donner un dé à
  un autre (Bardic = SRD ; dé de Destinée via l'**Arcane du Diable**, en réaction
  ou à l'avance = FH). Traverse **deux documents `fh-char/1`** — la décision 3 ne
  l'avait pas prévu. Découpage tranché : verbe chez le donneur, ressource **avec
  provenance** chez le receveur, **transport au M4** (bloc `table`).
- **Le Point d'inspiration héroïque**, quatrième cas apporté par Eric : retiré de
  FH, **gardé par le SRD**. Promu **troisième test d'acceptation du lot 5** — c'est
  la seule preuve de la séparation dans le sens difficile.

### Ce qui attend une décision d'Eric

- Les points ouverts du BRIEF §11.

### Ce qui attend l'architecte

**Une seule passe de révision des schémas, quand le lot 6 aura livré** — trois
sources à traiter ensemble plutôt qu'en trois versions successives :

1. **La forme des nouveaux records du lot 6** (le genre `skill` notamment) : les
   12 genres sont énumérés en dur et un genre inconnu est rejeté bruyamment.
2. **Les trois ajouts de l'expert VTT** : un champ portrait/token (Foundry et
   Owlbear en ont besoin), la taille et le type de créature, un lien optionnel
   d'une action vers l'objet qui la porte.
3. **La provenance d'un dé reçu** dans `resolved.resources[]` (décision du don de
   dé) — le lot 5 livre la forme dont il a besoin, ce siège l'écrit.

**C'est du contrat, donc le travail de ce siège**, pas celui des lots.

---

## 6. Les conseillers — les consulter avant de deviner

Quatre sièges répondent à des questions et ne modifient rien (§8 du kickoff).
Retrouvables par leur titre, joignables par message.

| Conseiller | Titre du fil |
|---|---|
| Produit | `EXPERT produit` — **précède ce siège et en a suggéré la création** ; mandat : `CONSEILLER-PRODUIT.md` |
| SRD (règles + juridique) | `EXPERT conseiller SRD` |
| Fate's Hand | `EXPERT Fate's Hand system advisor` |
| VTT | `EXPERT  conseiller VTT` (deux espaces) |

**Ils se sont payés en une séance** : les deux trous de contenu ci-dessus et le
piège `keepArcana` viennent d'eux, et l'architecte ne les avait pas vus en deux
jours. **Lire leurs réponses avant de refaire leur travail.**
