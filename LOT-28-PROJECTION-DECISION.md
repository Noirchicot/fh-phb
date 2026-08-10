# Lot 28 — `28-projection-decision`

> **[Opus · high]** — c'est un **contrat public neuf**, le premier depuis le
> virage, et **tout le builder s'appuiera dessus**. Le volume est modeste ; ce
> qui coûte, c'est de ne pas se tromper de forme. Une projection mal découpée se
> paie sur les huit étapes.

**En clair : aujourd'hui, rien ne dit à un écran ce qu'il reste à décider.**
Le moteur sait construire un personnage et dire ce qui cloche, mais il ne sait
pas répondre à « quelles décisions attendent, avec quelles options, à quel coût,
et laquelle est verrouillée pourquoi ». Une interface qui devrait le déduire
referait les règles — ce que la loi interdit, et ce que l'IA ne pourra jamais
faire depuis le MCP.

Tu construis **le carnet des décisions**.

**Worktree** : `~/tools/fhpc-worktrees/28-projection-decision`
**Branche** : `28-projection-decision`, coupée de `main` — **remesure-le**
(`git -C ~/tools/fhpc rev-parse main` ; il valait `cec7291` à l'écriture).
⛔ **Jamais `main`, jamais de `git push`.** **Départ : `npm test` → 570/570.**

📌 **Renumérotation** : le lot d'attribution, jusqu'ici « 28 », devient **29**.
Le numéro donne l'ordre, et la projection passe devant. Rien n'était commencé.

---

## 1. La mesure qui motive le lot — refaite le 2026-08-10

⭐ **Le pli SAIT DÉJÀ, et il jette.** `src/build/derive.mjs:1123-1130` :

```js
return {
  resolved: ordered,
  underived: underived.list(),
  unconsumed: …,
  grants: { chosenBy, declarations: … }   // ← lu, servi à validate, puis perdu
};
```

Et `allowedSlugs()` (`:290`) calcule **l'ensemble des slugs légaux** d'une
déclaration — `"any"` compris — puis le laisse mourir dans une variable locale.
**La matière d'une projection existe une ligne avant d'être perdue.** C'est
exactement l'argument qui a fait accorder le carnet d'attribution, et c'est le
même ici.

Ce qui manque n'est donc pas du calcul : c'est **une sortie**.

## 2. ⛔ La forme est TRANCHÉE par l'architecte — ne la rouvre pas

**Un SEPTIÈME CARNET rendu par `rebuild`**, à côté des six qu'il rend déjà
(`underived`, `unconsumed`, `overridesApplied`, `shadowed`, `warnings`, `diff`).

Les trois autres emplacements sont **écartés**, pour que tu ne les reproposes
pas :

| Écarté | Ce qu'il casse |
|---|---|
| Dans le **document** | `fh-char/1` n'a nulle part où garder un rapport, et l'invariant 4 interdit à une reconstruction d'écrire `build`. Une projection est de l'état dérivé |
| Dans **`render-fiche.mjs`** | ce fichier ne connaît le nom d'**aucun** champ, il descend un arbre. Lui apprendre ce qu'est un palier casserait ses propriétés 1 et 4 |
| Un **verbe neuf** | `rebuild` calcule déjà tout ce qu'il faut. Un septième verbe qui replierait la pile pour la même information la ferait diverger |

⭐ **L'argument décisif, et c'est celui à retenir : l'IA a besoin de la MÊME
projection.** La note d'Eric (`vault … Assistant IA…`) pose que l'humain et l'IA
emploient **les mêmes opérations** et qu'**aucun calcul de règles** ne se
déplace dans l'interface. Une projection qui vivrait dans l'écran ne pourrait
pas être servie par le MCP.

### ⛔ ET LA CONFUSION À NE PAS REFAIRE : GÉNÉRIQUE, PAS PAR ÉTAPE

**Le carnet ne connaît AUCUNE étape.** Pas de `steps`, pas de `skillsStep`, pas
d'ordre. **Une étape est un objet d'interface** : l'écran regroupe les entrées
par racine de chemin, et lui seul décide de l'ordre et des mots.

Graver les huit étapes dans le moteur violerait §0.13 (*le moteur produit des
identifiants, l'interface produit des mots*) et rendrait un changement d'ordre —
que le conseiller interface pourrait recommander demain — impossible sans
toucher au moteur.

📌 Modèle à suivre : **`underived` est générique**, indexé par `field`, et
l'écran le range par rubrique (`render-fiche.mjs`, `rubriqueDe`). Fais pareil.

## 3. Ce que tu construis

Une entrée par **point de décision**, indexée par son **chemin**. Ce que chaque
entrée doit porter — la liste est un **besoin**, pas un schéma : la forme exacte
est ton travail, et tu l'écris dans ton inventaire :

- **où** : le chemin sous lequel le verbe se pose (`choose`/`set`/`clear`) ;
- **ce qui est légal** : l'ensemble des options, **avec leurs identifiants** —
  jamais des mots ;
- **combien** : ce que la déclaration exige, et ce qui a déjà été répondu ;
- **le coût**, quand la décision en a un ;
- **disponible ou verrouillé**, et si verrouillé, **la CLEF de la raison** —
  celle du lot 27, `{key, params}`, jamais une phrase ;
- **la provenance**, quand la décision est imposée ou offerte par une source.

### 3a. Les points de décision qui existent AUJOURD'HUI — ta matière

**Ne projette que ce qui est réel.** Mesuré :

| Point | Où le pli le lit |
|---|---|
| classe · espèce · arrière-plan | les `takeRef` du pli |
| compétences imposées par la classe | `skill_choice {count, from}` |
| choix de compétence offert par l'espèce | `granted_skill_choice {count, from}` — ⚠️ `from` vaut `"any"` (Araag) **ou une liste** (Elestu : survival/delve/vigilance) |
| augmentations de caractéristique | `ability_keys` de l'arrière-plan |
| don d'origine | `feat_id` de l'arrière-plan |
| outil d'arrière-plan | `tool_id` (accordé) ou `tool_choice` (à choisir) |

⛔ **CE QUI N'EXISTE PAS ENCORE, ET QUE TU NE PROJETTES PAS** : la **dépense
d'un point de compétence à un palier**. Mesuré : le schéma déclare quatre
paliers (`none·half·proficient·expertise`) et `derive.mjs:689` n'en écrit que
**deux** ; `expertise_from_level` n'est opposé à rien. **C'est le lot d'après
qui l'ouvre**, et il ajoutera ses entrées au carnet — ce que la généricité rend
possible sans rouvrir ton contrat. **Ne l'anticipe pas, ne le simule pas.**

### 3b. La preuve que la forme tient — une seule, et elle est exigeante

⭐ **La projection doit se REFERMER.** Pour chaque entrée du carnet, il doit être
possible de **poser la décision par le chemin et l'option que l'entrée annonce**,
puis de reconstruire, **et de voir l'entrée disparaître ou son compte avancer.**

C'est le seul test qui prouve qu'une projection est utilisable plutôt que
descriptive. Un carnet qui annonce un chemin sur lequel `choose` jette est un
carnet qui ment.

## 4. Les tests — accept ET rejet pour chaque clause

1. ⭐ **La boucle se referme** (§3b), sur la **vraie matière**, pour **chaque
   genre de point de décision** de la table §3a — pas un échantillon.
2. **Aucune étape, aucun mot de règle** dans le carnet : un test qui échoue si
   une valeur affichable ou un nom d'étape y apparaît. Les options sont des
   **identifiants**.
3. **`from: "any"` et `from: [liste]`** rendent tous deux un ensemble
   exploitable — l'Araag et l'Elestu, nommément.
4. **Une décision déjà répondue** n'est pas annoncée comme à prendre ; une
   décision **partiellement** répondue (2 sur 4) porte son reste.
5. **Un verrou porte une clef du lot 27**, `{key, params}` — et cette clef
   **existe dans le paquet**, sinon le rendu jette (précédent `labels.mjs`).
6. **La loi §0.12** : un personnage **SRD pur**, sans couche FH, sans drapeau,
   traverse la projection de bout en bout.
7. ⚔️ **ATTAQUE** : casse un garde et prouve qu'un test rougit ; annonce un
   chemin faux dans une entrée et prouve que le test 1 rougit. Restaure,
   prouve-le par `git status`.
8. **Le MCP** : décide si le carnet est publié, et **dis pourquoi**. ⚠️ Une IA
   lit un catalogue comme un contrat — mais la promesse doit être tenable. Ton
   avis est demandé, pas une décision silencieuse.

## 5. Ce que tu livres

- Le carnet, sa dérivation, ses tests.
- **`contracts/build.md`** : la ligne de `rebuild` énumère ce qu'il rend —
  **elle devient fausse sans toi**. Décris la forme d'une entrée.
- `INVENTAIRE-LOT-28.md` : la **forme exacte** que tu as retenue et pourquoi,
  tes arbitrages, tes attaques, ce qui a rougi.
- Commits **en local**, message par **heredoc ou fichier**, jamais `-m "…"`.

⛔ **Tu ne touches pas** à `render-fiche.mjs` (l'écran vient après), ni au
document, ni aux paliers de compétence.

---

## 6. Les trois questions où l'avis écrit est demandé

Tranche-les **et écris-les**, plutôt que de les décider en silence :

1. **Le carnet liste-t-il aussi les décisions DÉJÀ prises**, ou seulement celles
   qui attendent ? *(Pense à qui appelle : un plan escamotable veut montrer le
   chemin entier, une étape veut la décision courante.)*
2. **Une décision verrouillée est-elle DANS le carnet, éteinte, ou absente ?**
   ⚠️ Le conseiller interface a mesuré chez Pathbuilder que **montrer les
   paliers verrouillés éteints** est ce qui fait comprendre la progression — et
   que son **seul défaut** est qu'un clic sur un imposé n'y fait **rien**, refus
   silencieux, à ne pas copier.
3. **Le carnet suit-il `rebuild` seul, ou aussi `validate` ?** `validate` ne
   plie pas la pile ; s'il devait le rendre, il devrait dériver — et il est
   écrit pour ne rien écrire.
