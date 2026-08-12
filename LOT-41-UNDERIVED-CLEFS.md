# Lot 41 — `41-underived-clefs`

> **[Sonnet · high]** — moteur seul, aucune donnée à régénérer, aucune règle de
> jeu touchée. Ce qui coûte, c'est le **nombre de sites** et la **discipline de
> nommage**, pas la difficulté.

**En clair : le personnage d'Eric est anglais, mais quand le moteur explique
pourquoi il n'a pas pu dériver quelque chose, il le dit en français.** Sa table
joue en anglais et il l'a tranché le 2026-08-13 : **« je veux que les persos soient
en anglais »**. Ce lot fait dire au moteur des **identifiants**, et laisse les mots
à l'interface — exactement ce que le lot 27 a fait pour les refus de `validate()`.

**Worktree** : `~/tools/fhpc-worktrees/41-underived-clefs`
**Branche** : `41-underived-clefs`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`, attendu ≈ `7b8ecc1`).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre** (attendu : **670**).

⛔ **Ne touche pas `ui/builder/`** au-delà de ce que le §3d demande.
⛔ **Aucune règle de jeu ne bouge.** Si tu crois en toucher une : **STOP, demande.**

---

## 0. ✅ CE QUI EST DÉJÀ MESURÉ — le 2026-08-13, ne le refais pas

| Fait | Mesure |
|---|---|
| **Le document est PROPRE** | ⭐ **zéro chaîne française** dans le `fh-char/1` rendu. Un personnage exporté n'emporte pas un mot de français — **c'est le point qui comptait le plus, et il est déjà bon** |
| Où le français vit | **`underived[]` seul.** Sur le personnage d'exemple : **19 entrées, 19 en français** |
| Les autres carnets | `unconsumed` 3 · `shadowed` 0 · `warnings` 0 · `diff` 1 · `decisions` 13 — **zéro français dans les cinq** |
| Les producteurs | **56 appels de `underived.declare(`**, tous dans `src/build/derive.mjs` — compté **avec un motif ancré**, pas une sous-chaîne |
| Le collecteur | `class Underived` — `derive.mjs:163`, `declare(field, reason)` pousse `{field, reason}` |

### ⚠️ ET `underived` EST AU CONTRAT, à deux endroits

- **`contracts/build.md`** : `rebuild` rend `{…, underived, …}` ;
- **`contracts/mcp.md`** : donc **une IA qui garde un personnage lit ces raisons.**
  Elle les lit **en français**, sur un personnage **anglais**.
- Et il voyage sur l'événement **`char-rebuilt`** (`contracts/build.md:124`) : il
  **sort du bloc**.

📌 **C'est donc un changement de contrat, et c'est pour ça que la forme t'est
donnée plutôt que laissée à ton choix** (loi §0.10 : un lot n'invente pas un
contrat).

---

## 1. ⭐ LE PRÉCÉDENT EXACT — le lot 27, et il faut le relire avant d'écrire

**Le lot 27 a fait ce travail pour `violations`** : treize phrases françaises
devenues `{key, params, path?}`. **Va lire ce qu'il a fait**, la moitié de tes
décisions y sont déjà prises :

| Ce qu'il a établi | Où |
|---|---|
| La forme `{key, params}`, `key` en `^[a-z][a-z0-9.:_-]{0,79}$` | `contracts/build.md` §*Violations de `validate`* |
| Le mécanisme des mots : **une règle nomme un id, un paquet porte les mots, un id inconnu JETTE** | `src/labels.mjs` |
| ⭐ **Pourquoi `labels.mjs` est à la racine de `src/`** | il a été sorti de `src/play/` **exprès** pour que `src/build/` puisse s'en servir sans importer du bloc de jeu. **Il t'attend** |
| ⭐ **Le `toString` NON ÉNUMÉRABLE** | il porte la coercition : `JSON.stringify` ne publie que la forme structurée, mais les assertions historiques rendent encore la phrase. **C'est ce qui a rendu le lot 27 fusionnable sans casser une suite** |

⚠️ **Mesure toi-même si ce `toString` est reprenable ici** — si oui, il te fait
gagner la compatibilité gratuitement ; si non, **dis pourquoi**.

---

## 2. ⛔ CE QUI EST TRANCHÉ

| | |
|---|---|
| **Les personnages sont en ANGLAIS** | Eric, 2026-08-13. C'est la raison d'être du lot |
| **Le moteur produit des identifiants, l'UI produit des mots** | loi §0.13 |
| **Le français ne disparaît pas** | il devient **un paquet de mots parmi deux**. ⛔ Ne le supprime pas : il sert au rendu d'outil |
| **Le document reste propre** | ⛔ **aucune de ces clefs n'entre dans `fh-char/1`.** `underived` est un carnet **hors document**, il le reste |

---

## 3. Ce que tu construis

### 3a. `declare` prend une clef, pas une phrase

`Underived.declare(field, reason)` devient `declare(field, key, params)`, et une
entrée devient `{field, key, params}`.

⚠️ **Les 56 sites ne font pas 56 clefs.** **Mesure d'abord** : plusieurs disent la
même chose sur des champs différents (« aucun genre `X` dans la pile », « le
record ne porte pas `Y` »). **Groupe-les par ce qu'elles DISENT, paramètre ce qui
change**, et **écris le compte final dans ton inventaire** — clefs distinctes
contre 56 sites.

**Nommage** : préfixe `underived.`, puis la nature du manque, jamais le champ —
`underived.kind-absent`, `underived.record-field-missing`, … Le **champ** est déjà
dans `field`, ne le répète pas dans la clef.

### 3b. Les deux paquets de mots

Sur le mécanisme de `src/labels.mjs`, **réemployé, pas imité** :

- un paquet **français** qui rend **exactement les phrases d'aujourd'hui** ;
- un paquet **anglais** ;
- ⛔ **un id sans mot JETTE** — jamais un blanc, jamais l'id nu.

⭐ **Et le garde qui va avec, celui qui compte** : **les deux paquets couvrent le
même jeu de clefs**. Le jour où l'un en gagne une, l'autre rougit.

### 3c. Le contrat

`contracts/build.md` et `contracts/mcp.md` disent la forme neuve, **chaque clause
adossée à son test**. ⚠️ Et `contracts/build.md:124` décrit `char-rebuilt` : sa
charge porte `underived`, **elle change aussi**.

### 3d. Ce qui lit `underived` aujourd'hui

**Mesure qui consomme ce carnet et adapte** — au minimum
`src/tools/render-fiche.mjs` (qui affiche la raison sur la fiche) et son paquet
anglais du lot 40. ⚠️ **Le lot 40 vient de poser `LIBELLES_EN`/`MOTS_EN` là-bas :
lis-le avant d'écrire**, il t'évite de construire un second mécanisme.

⛔ **Ne refais pas un troisième système de mots.** S'il en faut un seul pour les
deux usages, **dis-le et propose** — c'est une question d'architecte.

---

## 4. Les tests — accept ET rejet pour chaque clause

1. **Chaque clef a son mot dans les DEUX paquets** — et le test lit la liste des
   clefs **dans le code**, jamais une copie.
2. **REJET** : une clef sans mot **jette**.
3. **REJET** : les deux paquets divergent d'une clef → rouge.
4. **Le personnage d'exemple rend ses 19 entrées**, toutes **keyées**, **zéro
   phrase nue**.
5. ⚔️ **L'ATTAQUE** : un balayage du carnet rendu **ne trouve aucune prose
   française** — c'est le test qui dit que le lot a atteint son but.
6. **Le document reste propre** : `fh-char/1` ne gagne **aucune** de ces clefs.
7. **Un personnage SRD pur** traverse tout sans qu'une clef FH apparaisse.
8. **Les suites existantes** qui lisaient une phrase : nomme-les **une par une**
   dans ton inventaire — ⛔ ne les ajuste pas en silence, et marque `REWRITTEN`
   **sur sa propre ligne** avec sa raison (loi §0.7).

**Deux attaques manuelles minimum** : neutralise un garde, vérifie que le test
attendu **et lui seul** rougit, restaure, `diff` byte-à-byte, suite rejouée.

---

## 5. Ce que tu livres

- Commits réels, arbre propre, SHAs, verts au départ **et** à l'arrivée.
- `INVENTAIRE-LOT-41.md` : **le compte des clefs distinctes contre les 56 sites**,
  et **comment tu as groupé** · le sort du `toString` du lot 27 (repris ou non,
  et pourquoi) · **la liste nommée des tests qui basculent** · ta réponse au §3d
  (un mécanisme de mots ou deux ?).
- `contracts/build.md` + `contracts/mcp.md` à jour, chaque clause avec son test.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le droit de la contredire.** **Sept lots** de ce chantier ont corrigé
leur architecte par la mesure — le dernier, le lot 40, a démenti un compte de tests
que la commande donnait pour acquis (27 alors qu'il y en a 20 : un `grep` non
ancré). **Si une mesure contredit cette commande, c'est la mesure qui gagne, et tu
le dis.**
