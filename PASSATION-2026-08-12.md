# Passation — fin de session du 2026-08-12 (matin)

> **Pour le siège suivant.** Ce fichier ne remplace pas `ARCHITECTE.md` (le
> mandat, à lire en entier d'abord) : il porte **ce qui s'est décidé dans le fil
> du 2026-08-12** et qui ne serait pas devinable autrement.
>
> ⚠️ **SON §7 EST CONSOMMÉ.** La « prochaine étape » qu'il annonce — le passage
> étape par étape sur les Compétences — **a eu lieu le soir même**. L'étape est
> spécifiée (vault `Chantier FH & FHPC/FHV2 - Schémas d'écran.md` §4), et la
> numérotation des lots a changé : `37-pool-garde` → `38-jetons-surfaces` →
> `39-etape-competences`. **L'ordre à jour vit dans `ARCHITECTE.md` §5**, pas ici.
> ⚠️ Et son chiffre du pool négatif (**−2**) était optimiste : remesuré, c'est
> **−6** avec `validate()` `ok: true`.
>
> Le reste du fichier — §1 à §6, §8, §9 — tient, et se lit tel quel.

---

## 0. ⚠️ LIRE D'ABORD, DANS CET ORDRE

1. `ARCHITECTE.md` — le mandat.
2. 🥇 **`vault Chantier FH & FHPC/FHV2 - ADDENDUMS (source n°1).md`** — la source
   de vérité n°1 pour toute règle de jeu. **Elle a beaucoup grossi ce jour-là.**
3. Ce fichier.
4. **Les trois documents d'Eric que ce siège n'avait JAMAIS ouverts** — voir §3.

**La hiérarchie, en cas de contradiction :**
**1. ADDENDUMS → 2. le moteur (`fhpc`) → 3. le site web → 4. le vault.**

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`56ea9d1`**, local = distant, **614 verts**, arbre propre |
| `fh-phb` `main` | **`71f9bfa`**, local = distant, arbre propre |
| `fh-srd` | `20c6598`, à jour (un `.claude/` non suivi, sans importance) |
| Vault | à jour sur `origin`, **10 commits manuels** poussés en fin de session |
| Échéance | **7 novembre 2026 — 87 jours** |

### 🔴 CE QUI EST EN VOL — et c'est la première chose à savoir

**Le lot `36-trainings` TRAVAILLE.** Worktree
`~/tools/fhpc-worktrees/36-trainings`, **4 commits**, arbre propre, coupé de
`56ea9d1`. Sa commande (`LOT-36-TRAININGS.md`) porte **ses deux arbitrages déjà
rendus** (§3a et §3d, marqués ✅) — ne les rouvre pas, il code dessus.

⚠️ **Une seule branche distante existe (`main`)** — rien à nettoyer, pour la
première fois depuis longtemps.

⚠️ **Le worktree `fh-phb/.claude/worktrees/youthful-taussig-bfa14e`** (`797163d`)
porte toujours les **76 lignes non commitées** de `sync_from_vault.py`. Ouvert
depuis le **2026-07-27**. Décision d'Eric, jamais prise.

---

## 2. ⭐ CE QUE LA SESSION A LIVRÉ

| | |
|---|---|
| **Lot 35 `pool-complet`** fusionné | `ab926c7` — les 36 outils s'achètent au même barème, le Rogue prend son expertise dès le niveau 1 **par une valeur de contenu**, l'arrière-plan n'impose plus rien, les 26 compétences portent leur catégorie |
| **Le `tool_choice` du Soldier** éteint | `d824599` — plus **aucun** arrière-plan ne donne ni n'offre d'outil |
| **Le genre `training`** ouvert | `56ea9d1` — seizième genre, second qui ne vient pas du SRD |
| **Six règles tranchées** | voir §4 |
| **Trois sous-classes nommées** | `Silent Blade`, `Spell Rigger`, `Black Chanters` |
| **Deux chapitres corrigés PAR LA MESURE** | voir §5 |

---

## 3. 🔴 L'ERREUR STRUCTURELLE DE CE SIÈGE — et c'est Eric qui a dû la signaler

**Deux documents d'Eric n'avaient JAMAIS été ouverts par aucun architecte**, et
il a fallu qu'il demande lui-même « on ne m'a posé aucune question dessus ? ».

| Document | Ce qu'il portait |
|---|---|
| `5.RPG/…/0. D&D 5+ Rules/7. Classes & Subclasses/` | **quatre modifications de classes** (Sneak Critical, Deflect, Great Weapon Fighting, le Garrot) et **une sous-classe entière** (`Moonkeeper`). Mesuré : **zéro occurrence** dans le moteur |
| `5.RPG/…/9. Miscellaneous/FH — Roadmap & Directions.md` | **quatre noms de sous-classes déjà choisis par Eric**, la structure des dons d'origine, et le chiffre des bonus d'Inheritance (**+2/+1 ou +1/+1/+1**) |

Et un troisième, cité par le mandat mais jamais lu :
`Chantier FH & FHPC/FHPC — Étude builders du marché.md`, qui porte un §
**ratifié par Eric** sur la direction visuelle — et le concept de **FH overlay**,
un troisième objet que l'architecture canonique (couches = contenu, mécaniques =
modules) **ne prévoit pas**.

📌 **LA RÈGLE QUI EN SORT** : ce siège lit le code, les contrats et les
passations. **Il ne lit pas les chapitres d'Eric spontanément.** La méthode qui a
le meilleur rendement du chantier (§5b du mandat : *l'architecte lit les
chapitres et rend ses doutes*) doit être **déclenchée exprès**, sur les chapitres
qui touchent le lot en cours. Personne ne le fera à ta place.

---

## 4. LES RÈGLES TRANCHÉES CE JOUR-LÀ

**Toutes sont dans les ADDENDUMS.** Résumé de ce qui est neuf :

| Règle | Statut |
|---|---|
| **Les 36 outils** au même barème que les compétences | ✅ implémenté (lot 35) |
| **L'arrière-plan n'existe plus en FH** — l'étape ne pose qu'un don d'origine et les bonus de caracs (**+2/+1 ou +1/+1/+1**), elle s'appelle **Inheritance** | ✅ implémenté |
| **Rogue** : expertise dès le niveau 1, **aucun plafond de compte** — l'UI *notifie*, elle ne limite pas | ✅ moteur · ⚠️ la notification reste due à l'interface |
| ⭐ **Les TRAININGS — la TROISIÈME dépense du pool** | genre ouvert ; canal, verrou et contenu = lot 36 |
| **5 catégories de rangement** des compétences (`knowledge` 8 · `social` 7 · `exploration` 6 · `physical` 5) | ✅ implémenté. ⚠️ **Le champ n'a que QUATRE valeurs** — la 5ᵉ colonne range un **genre**, pas des compétences |
| **Les maîtrises d'armes et d'armures sont des trainings** *(octroyés, jamais achetés)* | ❌ — et le moteur n'en porte **aucune** aujourd'hui |
| **Les Dark Rituals sont des apprentissages** — barème par niveau, seuil du meneur | ❌ contenu, plus tard |
| **Le mot `subclass` est LIBRE** (il est dans le SRD 5.2.1, CC-BY) ; les **noms** hors SRD ne le sont pas | — |
| **Cible : 2 sous-classes FH par classe**, soit **24** | ❌ plus tard |

---

## 5. ⭐ LE RENDEMENT DE LA CONFRONTATION — deux chapitres corrigés

**Aucune de ces deux corrections ne vient d'un avis. Les deux viennent d'une
mesure**, et c'est le meilleur argument pour continuer à confronter les
chapitres d'Eric au réel.

1. **Deux rituels renommés.** Le barème d'apprentissage appliqué aux **dix**
   rituels réels a fait tomber une contradiction avec la phrase d'Eric « tous
   les mineurs coûtent 1 point » : `Create Minor Sealed Prison` et
   `Create Minor Harvest Chalice` sont au **niveau 10**, donc à 2 points. Eric a
   tranché en changeant **les noms** plutôt que la règle — les deux perdent leur
   « Minor ». Après renommage, **tous les `Minor` restants sont au niveau 5** :
   la règle et les noms disent enfin la même chose.
2. **Le Soulforge `Very Rare` passe de 15 à 16.** Il tombait **une unité** sous
   sa propre tranche et recevait le prix d'un *Rare*. C'est le **chapitre** qui
   bouge, pas le barème : sa ligne disait « ≈ », alors qu'un barème est une règle
   qui doit trancher sans ambiguïté.

📌 **Et une mesure a forcé une distinction d'architecture** : `MAX_LEVEL = 20`
alors que trois rituels sont de **niveau 30**. « Il faut quelqu'un au niveau
approprié » ne pouvait donc PAS vouloir dire « au niveau du rituel » — d'où deux
nombres distincts, le **total du cercle** et le **seuil du meneur**.

---

## 6. ⚠️ LES QUATRE ERREURS DE CE SIÈGE — toutes de la même famille

**Rattrapées par re-mesure, aucune sortie vers Eric comme un fait.** Le taux est
le vrai signal.

1. **Sonde de collision de slugs écrite sur le mauvais niveau d'objet**
   (`r.slug` sur l'enveloppe de `query`, alors que le slug vit dans
   `r.record.slug`) → « 36 collisions », toutes `undefined`.
2. **« Le don d'origine ne survit pas sans arrière-plan »** — cherché dans
   `resolved.traits[]`, où il n'est pas publié. Il survit parfaitement : +2 au
   Score de Destinée, mesuré ensuite.
3. **La commande du lot 35 ne nommait pas `tool_choice`** — le lot a laissé le
   Soldier intact ET l'a signalé, ce qui était juste. **La faute était dans la
   commande.**
4. **Une ligne des ADDENDUMS écrite le matin (« `Soulforge an Item` n'a pas de
   niveau ») était fausse** — le chapitre les chiffre par palier. Corrigée le
   jour même.

📌 **Toujours la même forme : mesurer le mauvais objet, ou écrire avant d'avoir
lu.** La parade qui a marché à chaque fois : **re-mesurer quand le résultat
surprend, et montrer la mesure plutôt que la conclusion.**

---

## 7. LA PROCHAINE ÉTAPE — et elle n'est pas un lot

⭐ **Le passage étape par étape avec Eric sur l'étape Compétences.**

C'est **sa règle du 2026-08-10** (protocole 2b) : avant de coder une étape, ce
siège dit ce que **lui** changerait par rapport au builder de référence
(`~/tools/fh-skills/fh-skill-builder.html`, **référence de FORME, pas de
chiffres**), **demande à Eric ce que lui veut changer**, et on code sur cette
base. **Zéro ligne, zéro lot** — c'est la marche la moins chère du chantier, et
c'est celle qui a manqué au lot 33.

**Puis, dans l'ordre :**

1. `37-etape-competences` — l'écran refait sur ce que le moteur porte enfin.
2. Les **sept étapes restantes** (le patron sera prouvé par la Compétences).
3. La **fiche**.
4. **M4** : vue de jeu + transport de table.

### ⚠️ TROIS DETTES SONT DANS LE CHEMIN CRITIQUE, pas à côté

| Dette | Pourquoi elle bloque |
|---|---|
| **Caracs `3d6 × 10, keep 6`** (+ l'option « choix ») | l'**étape Caractéristiques** ne peut pas exister sans méthode de tirage |
| **Cartes de Destinée tirées** (+ l'option « choix ») | idem pour l'**étape Destinée** |
| 🔴 **Le pool peut passer en NÉGATIF** | mesuré : 4 expertises sur un Rogue niveau 1 → pool **−2**, aucune violation, `validate()` muet. **Dette préexistante du lot 34** — vérifié sur `main` avant d'accuser le lot 35. L'écran n'a pas le droit de porter cette règle |

**Les deux premières sont des étapes du builder déguisées en dettes de règles.**
Le plafond de 18 et le « ≥ 1 point en outils » arrivent plus tard : ce sont des
vérifications de **fin** de création.

---

## 8. CE QU'IL FAUT SAVOIR DU CODE, ET QUI SURPREND

- ⚠️ **La loi §0.12 est gardée sur les OCTETS.** `tests/fh-skill-pool.test.mjs`
  interdit `expertise`, `fh_skill_pool`, `tier_costs`, `\bimposed\b`,
  `Fast Learner`, `Educated` dans **tout fichier de `src/build/`, commentaires
  compris**. 📌 Le garde utilise une **frontière de mot** — `imposedSkillSlugs`
  passe, et c'est **voulu et documenté** depuis le lot 34.
- ⚠️ **Ouvrir un genre touche TROIS endroits** et doit se faire **dans un seul
  commit** : `fh-char.schema.json` `$defs/kind`, `fh-layer.schema.json`
  `records.properties`, et `src/layers/document.mjs` `GENRES` — un garde compare
  le code et le schéma **mot pour mot**, ordre compris. `gen-srd-layer.mjs` garde
  **ses 14** et ne doit jamais recevoir un genre FH.
- ⚠️ **Aucune source d'outil ne subsiste au niveau 1 hors du pool** (depuis
  l'extinction du Soldier). Un test qui veut un outil possédé doit l'**acheter**.
- **Le canal de dépense porte deux genres** : ses slugs sont résolus dans
  `records("skill")` **puis** `records("tool")`, avec un **garde de collision
  bruyant**. Zéro collision aujourd'hui — un homebrew pourrait en créer une.
- **`resolved` a 21 clefs obligatoires.** Chaque rubrique de plus est une chose
  que **toute** interface, **tout** export et **tout** lecteur MCP doivent
  connaître. C'est l'argument qui a mis les trainings dans `traits[]`.

---

## 9. CE QUI ATTEND ERIC

1. Le **passage étape par étape** sur les Compétences (§7) — c'est lui qui décide.
2. ⚠️ **Le site publié est en retard** : `fh-phb/docs/chapters/dark-rituals.md`
   porte encore les anciens noms de rituels. C'est une **copie générée** par
   `sync_from_vault.py` — **jamais corrigée à la main** (piège payé). Lancer la
   sync est son geste.
3. Les **76 lignes** de `sync_from_vault.py` dans le worktree `fh-phb` — ouvert
   depuis le 2026-07-27.
4. Les **7 dettes de règles** des ADDENDUMS §5.
5. Le **FH overlay** (§3) : l'architecture canonique ne prévoit pas ce troisième
   objet, et le rendu **nu / immersion** en dépend. À trancher avant de dessiner.
