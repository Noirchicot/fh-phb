# Lot 35 — `35-pool-complet`

> **[Sonnet · high]** — quatre morceaux qui régénèrent tous la même couche.
> Aucun n'est difficile isolément ; les séparer coûterait trois rebases sur le
> même fichier. Volume moyen, pièges nombreux et **tous mesurés ci-dessous**.

**En clair : le pool d'Eric paie enfin tout ce qu'il est censé payer.**
Aujourd'hui il n'achète que des compétences. Il doit aussi acheter des **outils**,
le **Rogue** doit pouvoir prendre de l'expertise dès le niveau 1, l'**arrière-plan
n'existe plus** en Fate's Hand, et les compétences doivent porter la **catégorie**
qui les range à l'écran.

**Worktree** : `~/tools/fhpc-worktrees/35-pool-complet`
**Branche** : `35-pool-complet`, coupée de `main` — **remesure-le**
(`git -C ~/tools/fhpc rev-parse main`, il valait `6ee1e9e` à la rédaction).
⛔ **Jamais `main`, jamais de `git push`.**
**Départ : `npm test` → compte les verts et écris le nombre dans ton inventaire.**
Il y en avait **589** à la rédaction.

---

## 1. La source de vérité, dans l'ordre où la lire

1. 🥇 **`vault 7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/FHV2 - ADDENDUMS
   (source n°1).md`** — **la règle, et rien d'autre ne la porte.** §1 (le pool),
   §2 (les traits d'espèce), §4 (création). ⛔ **Ne code aucune valeur de règle
   sans l'avoir lue** : c'est la page qui existe parce qu'une règle vieille de
   deux jours avait été codée à côté.
2. `contracts/build.md`, section **« ⭐ THE SKILL POOL »** puis **« LOT 34 — LA
   GRILLE À QUATRE PALIERS »** — l'algorithme canonique et les deux canaux.
3. `INVENTAIRE-LOT-34.md` **§1** — la frontière §0.12 telle qu'elle est
   réellement gardée. **Lis-le avant d'écrire une ligne dans `src/build/`.**

⚠️ **Ce que la loi §0.12 t'interdit, mesuré sur les octets** :
`tests/fh-skill-pool.test.mjs` (ACCEPTATION 4) refuse les mots `expertise`,
`fh_skill_pool`, `tier_costs`, `imposed`, `Fast Learner`, `Educated` dans **tout
fichier de `src/build/`, commentaires compris**. Toute logique de palier vit dans
`src/modules/fh/skill-pool.mjs`. **Ne t'y casse pas les dents : c'est voulu.**

---

## 2. ⛔ Ce qui est TRANCHÉ — ne le rouvre pas

| | Décision d'Eric |
|---|---|
| **Outils** | ils s'achètent au **MÊME barème** que les compétences : aucun 0 · demi 1 · plein 2 · expertise 4 |
| **Rogue** | expertise **dès le niveau 1**, **aucun plafond de compte** — le pool est la seule économie qui arbitre. L'UI le **notifie**, elle ne le limite pas |
| **Arrière-plan** | **il n'existe plus en FH.** L'étape ne pose qu'un don d'origine et les bonus de caracs (**+2/+1 ou +1/+1/+1** sur trois). Plus de compétences ni d'outil imposés |
| **Catégories** | **rangement seulement**, aucun effet de règle |

---

## 3. Les mesures déjà faites — ne les redemande pas

| Mesure | Résultat |
|---|---|
| Catalogue | genre `skill` = **26** records · genre `tool` = **36** |
| Collision de slug entre les deux genres | **zéro** — un slug identifie sa cible sans ambiguïté |
| Le canal de dépense aujourd'hui | `skill-pool.mjs` résout sa cible dans `records("skill")` **seul** ; un outil rend `skill-spend.option-unavailable` |
| Preuve | `fh.skills.spend.athletics = "proficient"` → pool 7 → **5**, ligne « Athletics · spent to proficient ». `…spend.calligrapher-s-supplies` → pool **inchangé**, refus keyé |
| `expertise_from_level` | posé par `gen-fh-skills-layer.mjs:312` depuis **une constante unique** `EXPERTISE_FROM_LEVEL = 4` (`fh-skills-source.mjs:313`) — les 12 classes ont donc la même valeur |
| Records `background` du SRD | **4** (acolyte, criminal, sage, soldier). **Les 4** portent `skill_ids` (2 chacun) et `ability_keys` et `feat_id`. ⚠️ **Seulement 3 portent `tool_id`** — **le Soldier n'en a pas** |
| Sans record de background | `rebuild()` **ne casse pas** : pool 7 → **10**, les boosts de caracs survivent, le don d'origine rend toujours ses +2 au Score de Destinée, `underived` nomme proprement `identity.background` |
| Qui impose un outil | **seul** le genre `background` porte un `tool_id` dans toute la pile |

---

## 4. Ce que tu construis

### 4a. Les outils achetables — le canal, élargi

`src/modules/fh/skill-pool.mjs`, la section « LA GRILLE À QUATRE PALIERS ».
Aujourd'hui : `const skillCatalog = records("skill")`. Il te faut **les deux
genres**.

⭐ **La forme que l'architecte accorde**, et le motif : le module rend déjà
`skillTiers: {slug: {proficiency, bonusTerm}}`, et **les slugs des deux genres ne
collisionnent pas** (mesuré). Le **même canal** porte donc les deux, sans champ
neuf ni distinction de genre dans le pli. C'est `derive.mjs` qui, en second
passage, cherche le slug dans `resolved.skills[]` **puis** dans `resolved.tools[]`
— une recherche générique dans deux collections, qui ne nomme aucune mécanique FH.

⛔ **Un garde obligatoire, et il est bruyant** : si un slug existe dans les
**deux** genres, `fail()` en le nommant. Zéro collision aujourd'hui — mais une
couche homebrew tierce en créerait une, et le canal choisirait alors une cible en
silence. Loi §0.5.

### 4b. `resolved.tools[]` — possédés OU dépensés, jamais les 36

Aujourd'hui `resolved.tools[]` ne porte que les outils **possédés** (1 sur
l'exemple, via `gear`). Un outil **acheté au pool** doit y apparaître avec son
palier et son bonus.

⛔ **N'y publie PAS les 36.** `resolved.skills[]` porte les 26 parce que toute
compétence a un bonus jouable ; un outil sans maîtrise n'a rien à dire sur une
fiche. Le builder lit le catalogue complet par `layers.query({kind:"tool"})` —
c'est son travail, pas celui du document.

Le nom et la caractéristique d'un outil dépensé se lisent dans le catalogue
(`records("tool")`), comme `derive.mjs` le fait déjà pour les compétences.

### 4c. Le Rogue — une valeur par classe, plus une constante unique

`fh-skills-source.mjs` porte `EXPERTISE_FROM_LEVEL = 4`, recopiée pour les 12
classes par `gen-fh-skills-layer.mjs:312`. Il te faut **une valeur par entrée de
`CLASS_POOLS`**, défaut 4, **`1` pour le rogue**.

⚠️ **Ne fais pas du rogue un cas spécial dans le moteur.** `skill-pool.mjs` lit
déjà cette valeur par classe (`:289`) et n'a **rien** à apprendre : le correctif
est **entièrement du contenu**. Si tu te retrouves à écrire « rogue » dans
`src/`, tu es sur la mauvaise route.

📌 **Rien à opposer côté compte** : aucun plafond, décision d'Eric. La
notification (« tu as droit à l'expertise dès maintenant ») est un travail
d'**interface** — le moteur n'a qu'à ne pas refuser.

### 4d. L'arrière-plan éteint

La couche FH doit retirer, des records `background` du SRD :

- `data.skill_ids` — sur les **4** records ;
- `data.tool_id` — sur **3** records seulement. ⚠️ **Le Soldier n'en a pas** :
  un retrait dans le vide doit rester un échec bruyant, donc **vérifie la
  présence avant de retirer**, à la manière d'`assertTargetField`
  (`gen-fh-species-layer.mjs:141`) — importe-la ou écris son équivalent pour le
  genre `background`.

⛔ **Ne touche PAS** `ability_keys`, `feat_id`, `feat_option` : ce sont
l'Inheritance, et elle reste.

**Où ça vit** : `gen-fh-skills-layer.mjs`. La couche des compétences porte déjà
tout ce qui touche compétences et outils ; retirer les compétences et l'outil
imposés d'un arrière-plan est exactement ça. **N'édite jamais un `.layer.json` à
la main** — régénère.

⚠️ **Conséquence attendue, et elle est voulue** : le pool du magicien d'exemple
passe de **7 à 10**. Tout test qui cite 7 devient faux ; **réécris l'assertion à
la nouvelle vérité et marque `REWRITTEN` sur SA PROPRE LIGNE** (loi §0.7 — une
marque en milieu de ligne a déjà commenté quatre assertions et rendu une suite
verte à tort). Le document d'exemple se **régénère**, il ne se retouche pas.

### 4e. Le champ `category`

Un champ `category` sur les records de **compétence**, porté par la couche FH :
patch pour les compétences SRD, natif pour les huit FH.

⭐ **Il n'a QUE QUATRE valeurs, pas cinq.** La cinquième colonne de l'écran
s'appelle *Tools & Trainings* — elle ne range pas des compétences, elle range un
**genre**. Mettre `category: "tools"` sur un outil serait une donnée redondante
qui peut diverger de son genre.

Valeurs — **des identifiants, jamais des mots affichables** (loi §0.13) :
`knowledge` · `social` · `exploration` · `physical`.

**Le classement, proposé par l'architecte** — ⛔ **à faire valider par Eric avant
de générer.** Il est déduit de son schéma de fiche, où *Investigation* apparaît
sous **Exploration** et non sous Knowledge.

| Catégorie | Compétences |
|---|---|
| `knowledge` (8) | Academics · Appraise · Arcana · History · Medicine · Nature · Religion · Tactics |
| `social` (7) | Deception · Insight · Intimidation · Leadership · Performance · Persuasion · Streetwise |
| `exploration` (6) | Animal Handling · Delve · Hunting · Investigation · Survival · Vigilance |
| `physical` (5) | Acrobatics · Athletics · Might · Sleight of Hand · Stealth |

**26 au total** — Perception est retirée par la couche FH, elle n'en fait pas
partie. ⛔ **Un garde obligatoire** : toute compétence sans catégorie fait
échouer le générateur en la nommant. Une compétence orpheline disparaîtrait
silencieusement de l'écran.

---

## 5. Les tests — accept ET rejet pour chaque clause

1. **Un outil s'achète** : `fh.skills.spend.<outil> = "proficient"` → le pool
   baisse de 2, une ligne de détail nommée apparaît, `resolved.tools[]` porte
   l'outil au bon palier avec son bonus.
2. **REJET** : un slug inconnu des deux genres → `skill-spend.option-unavailable`.
3. **REJET** : un slug présent dans les deux genres → **échec bruyant** qui le
   nomme (fabrique la collision dans une couche de test).
4. **Les 36 ne sont pas publiés** : un personnage qui n'achète aucun outil et
   n'en possède qu'un garde **une** ligne dans `resolved.tools[]`.
5. **Rogue niveau 1** : `expertise` acceptée, coût 4. **Les 11 autres classes**
   au niveau 1 : refusée, `skill-spend.tier-locked`.
6. **Rogue sans plafond** : deux expertises au niveau 1 passent si le pool suit.
7. **Arrière-plan** : aucun des 4 records ne porte plus `skill_ids` ; les 3 qui
   portaient `tool_id` ne l'ont plus ; **les 4 gardent** `ability_keys` et
   `feat_id`. Le pool du magicien d'exemple vaut **10**.
8. **REJET** : un retrait dans le vide (retirer `tool_id` du Soldier) → échec
   nommé.
9. **Catégories** : les 26 en portent une, les 4 valeurs sont exactement celles
   ci-dessus, aucune n'est un mot affichable.
10. **REJET** : une compétence sans catégorie → le générateur échoue en la
    nommant.

**Deux attaques manuelles au minimum**, à la routine du dépôt : casse le garde,
vérifie que **le test attendu et lui seul** rougit, restaure depuis une copie de
secours, `diff` byte-à-byte, suite complète rejouée verte.

---

## 6. Ce que tu livres

- Des **commits réels**, arbre propre, SHAs listés. *(Rapporter n'est pas
  livrer : deux lots v1 ont dit « terminé » avec tout en non-commité.)*
- `INVENTAIRE-LOT-35.md` : tes arbitrages, tes mesures, ce qui a changé et
  **pourquoi**, les tests réécrits avec leur motif, et le compte de verts au
  départ **et** à l'arrivée.
- `contracts/build.md` mis à jour : les outils dans le canal de dépense, la
  règle des quatre catégories, l'arrière-plan sans imposés.
- ⛔ **Aucun `git push`, aucune fusion dans `main`.** Le lot commite,
  l'architecte fusionne, Eric pousse.
- ⛔ **Ne touche pas `ui/builder/`** — l'étape Compétences est refaite dans un
  lot séparé, après un passage étape par étape avec Eric.

**Décision non couverte par cette commande → STOP, question à l'architecte.**
Trois lots de ce chantier ont corrigé leur architecte en refusant de deviner ;
c'est un résultat, pas un incident.
