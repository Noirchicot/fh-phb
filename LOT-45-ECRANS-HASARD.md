# Lot 45 — `45-ecrans-hasard`

> **[Sonnet · high]** — deux écrans, **zéro ligne de moteur**. Ce lot s'appelait
> « le lot moteur du hasard » dans trois passations. **Il n'existe pas.** La mesure
> l'a dissous : tout ce dont ces deux écrans ont besoin est déjà là.

**En clair : il manque les Caractéristiques et la Destinée.** Ce sont deux des
sept étapes encore en texte de remplacement, et **elles sont les seules à faire
intervenir le hasard** — les caracs se tirent, les cartes se tirent.

**Worktree** : `~/tools/fhpc-worktrees/45-ecrans-hasard`
**Branche** : `45-ecrans-hasard`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Tu écris dans `ui/builder/` et `tests/`, nulle part ailleurs.** ⚠️ **Deux
autres lots peuvent tourner en même temps** — le 42 dans `ui/builder/` aussi, le 43
dans `src/build/` et `layers/`. **Si le 42 n'est pas encore fusionné quand tu
démarres, DIS-LE et attends** : vous écririez `shell.mjs` tous les deux.

---

## 0. ✅ CE QUI EXISTE — mesuré le 2026-08-13, ne le refais pas

**Le « moteur du hasard » annoncé par les passations n'a pas lieu d'être.** Les
quatre mesures qui le dissolvent :

| Mesure | Résultat |
|---|---|
| `set({path:"abilities.str", value:17})` puis `rebuild` | ✅ **le score passe de 8 à 17** — les six caracs sont déjà des choix qui marchent |
| `choose({path:"fh.destiny.arcana", ref})` puis `rebuild` | ✅ **le Score de Destinée passe de 10 à 8** en changeant `the-hermit` pour `the-tower` — poser une carte marche déjà de bout en bout |
| Un plan au carnet pour ces deux étapes | ❌ **AUCUN** — contrairement à Class et Species, **ces écrans ne sont pas servis par `decisions[]`** |
| `abilities.mode` | **`unconsumed`** — le moteur **se moque** de la méthode qui a produit les nombres |

📌 **Conclusion, et c'est la forme du lot** : le hasard n'a **aucune existence dans
le document**. C'est une affaire d'**interface**, du début à la fin.

### ⛔ La décision d'Eric qui rend ça vrai — 2026-08-13

> **Le lot de dix dés ne survit pas. Seul le résultat compte.**

Le builder tire, le joueur assigne, et **seules les six valeurs finales** sont
gardées — elles le sont déjà, comme choix `abilities.*`. ⛔ **N'invente aucun champ
de document pour mémoriser un tirage.** Pas de graine, pas d'historique, rien.

---

## 1. Les sources de vérité

| | |
|---|---|
| 🥇 Les deux règles | vault `Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md` **§4** |
| La forme des écrans | vault `…/FHV2 - Schémas d'écran.md` §1 — panneaux **2** (Caractéristiques) et **3** (Destinée) |
| Les jetons | `ui/builder/tokens.css` — ⛔ le garde `tests/ui-jetons.test.mjs` mord sur tout littéral |
| Le patron d'écran | `ui/builder/skills-step.mjs` et `tests/skills-step.test.mjs` |

⛔ **Ne pas ouvrir** `COMPANION-BUILD-PLAN.md`.

---

## 2. ⛔ CE QUI EST TRANCHÉ

| | |
|---|---|
| **Le tirage ne survit pas** | Eric, 2026-08-13. Aucun champ neuf |
| **Tirage OU choix — les DEUX existent** | ADDENDUMS §4 : *« ces deux points doivent exister comme options du builder — tirage ou choix — même si la table d'Eric n'en utilise qu'un »*. ⛔ **Les deux modes, sur les deux écrans** |
| **Les cartes se TIRENT** | c'est le défaut de la Destinée. Le choix reste offert en second mode |
| **Les mots sont en anglais** | Eric, 2026-08-10 |
| **La base mobile est 360 px** | ⚠️ pas les 720, qui sont un seuil de bascule |
| **Rien ne se cache** | un mode indisponible **dit pourquoi**, il ne disparaît pas |

---

## 3. Ce que tu construis

### 3a. L'étape *Abilities*

**La méthode d'Eric** *(ADDENDUMS §4)* : **`3d6`, dix fois, on garde les six
meilleurs** — et **on relance le lot entier si aucun des dix n'atteint 15**.

1. **Le tirage** : dix jets de `3d6`, les dix affichés, les **six meilleurs**
   distingués. La relance automatique du lot entier quand aucun n'atteint 15 se
   **voit** : le joueur doit comprendre pourquoi le lot a changé sous ses yeux.
2. **L'assignation** : le joueur place les six valeurs sur `str/dex/con/int/wis/cha`
   — chaque pose est un `set({path:"abilities.<clef>", value})`. Une valeur ne se
   place qu'une fois.
3. **Le second mode : la saisie directe.** Six champs, sans tirage. Même verbe.

⭐ **3a-bis. LE MODE EST UNE LISTE, PAS UN INTERRUPTEUR** *(Eric, 2026-08-13)*

**Tu n'implémentes que les deux modes ci-dessus.** Mais Eric veut **plus tard** les
trois méthodes classiques du SRD — **Standard Array**, **Point Buy**, et
**`4d6` en gardant les 3 meilleurs, six fois**. ⛔ **Ne les construis pas.**

**Ce qu'on te demande, c'est que leur arrivée ne coûte qu'une entrée dans une
liste** : un tableau de méthodes, chacune avec son nom affiché et sa façon de
produire six nombres. ⛔ **Pas de `if (mode === "roll") … else …`** — c'est
exactement ce qui rendrait les trois suivantes chirurgicales au lieu de triviales.

📌 **Et le document a déjà sa place pour ça** : `abilities.mode` existe comme choix
(le personnage d'exemple porte `"standard"`). **Écris-le.** ⚠️ Il revient
`unconsumed` — c'est un **problème connu et suivi** (`TROU-CHOIX-SANS-TRACE`, trois
choix du joueur sans trace dans la fiche), **pas un défaut que tu introduis**.
Dis-le dans ton inventaire, ne le répare pas ici.
4. ⚠️ **Le hasard vit dans l'écran, et c'est voulu** — la loi *« le moteur prononce,
   l'écran affiche »* parle des **règles opposables**, pas de la **génération** d'un
   nombre que le joueur pose ensuite lui-même. `abilities.mode` étant `unconsumed`,
   le moteur ne veut pas le savoir. **Écris-le dans ton inventaire** : c'est le
   point qu'un relecteur pourrait prendre pour une entorse.

### 3b. L'étape *Destiny*

1. **Le tirage** : **une carte parmi 22**, lue par `query({kind:"arcana"})` — ⛔ pas
   une liste en dur. La carte tirée se pose par
   `choose({path:"fh.destiny.arcana", ref})`.
2. **Le second mode : le choix** dans les 22.
3. **La carte montre ce qu'elle porte** : son `numeral`, son `name`, son
   `destiny.impact`, son `meaning`, son `power`, sa `vibration`. ⛔ **Ne résume pas,
   ne réécris pas** — ce sont les textes d'Eric.
4. **Le Score de Destinée se met à jour sous les yeux** : il vit dans
   `resolved.stats['fh:destiny']`. ⛔ **Affiche-le tel quel, ne le recalcule pas.**

### 3c. ⛔ CE QUE TU NE FAIS PAS

**Le plafond de 18 n'est PAS dans ce lot.** Mesuré : `abilities.str = 20` passe
aujourd'hui avec **zéro refus**. La règle existe *(ADDENDUMS §5 n°1 : aucune carac
ne dépasse 18 à la sortie de la création, bonus inclus)*, mais **elle porte une
question non tranchée** : un personnage créé au niveau 5 a des augmentations
légitimes, donc *« à la création »* **ne se déduit pas du niveau**, et le moteur ne
voit pas un instant — il voit un document.

⛔ **N'invente pas cette règle, ne la contourne pas dans l'écran.** **Déclare-la**
(loi §0.10) : ton inventaire dit qu'un total > 18 est possible et non opposé. Elle
attend Eric, et elle fera son propre lot moteur.

---

## 4. Les tests

**On teste les fonctions, pas la page** — patron `tests/skills-step.test.mjs`, banc
`tests/dom-stub.mjs` (⚠️ il ne connaît pas `innerHTML`).

1. **Dix jets rendus, six retenus** — et les six sont bien **les plus grands**.
2. ⚔️ **La relance mord** : un lot dont aucun dé n'atteint 15 **est rejeté**.
   Injecte la source d'aléa pour le prouver — ⛔ **un test qui dépend du hasard réel
   n'est pas un test.**
3. **Chaque jet vaut entre 3 et 18**, et c'est vérifié sur un grand nombre de jets.
4. **Une valeur assignée ne se place qu'une fois.**
5. **La saisie directe pose exactement le même chemin** que l'assignation.
6. **Les 22 arcanes viennent de `query`** : une pile qui n'en porterait que 3 en
   affiche 3 — ⛔ jamais un 22 écrit en dur.
7. **La carte tirée se pose par `choose`**, et le document rendu par le verbe est
   celui qui repart au `rebuild`.
8. **Le Score affiché est celui du moteur, à l'octet** — ⚔️ un Score **menteur**
   s'affiche menteur *(la loi que les tests du lot 40 gardent déjà)*.
9. **Les deux modes existent sur les deux écrans**, et le mode inactif **dit** son
   état au lieu de disparaître.
10. **Le garde des jetons reste vert.**

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test attendu
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.
⚔️ **Attaque ce que tu n'as pas déjà attaqué.**

---

## 5. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-45.md` : **comment tu as rendu le hasard testable** · pourquoi le
  hasard dans l'écran n'est pas une entorse à la loi (§3a.4) · **la déclaration du
  plafond de 18** (§3c) · **ce qui t'a surpris en regardant l'écran** — 👀 sers le
  builder et **regarde-le** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** Huit lots de ce chantier ont corrigé leur
architecte par la mesure. Le **lot 41** a **refusé d'écrire une ligne** et renvoyé la
sienne — **il avait raison**. Le **lot 38** a démontré qu'une piste de sa commande
était **impossible**. **C'est le comportement attendu, pas un incident.**

📌 **Et cette commande-ci est déjà le produit de ce mécanisme** : elle devait être
« le lot moteur du hasard », annoncé dans trois passations comme portant *« la seule
question de contrat de la liste »*. **Quatre mesures l'ont dissous.** Si tu trouves
qu'il reste du moteur là-dedans, tu es dans ton droit — **montre la mesure.**
