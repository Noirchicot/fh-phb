# Lot 82 — porter le canon des points au moteur

> ## ✅ EXÉCUTÉ ET DÉPLOYÉ — 2026-08-18
>
> `fhpc` : `db770a0` · `7525ba0` · `b559440`. Suite verte à chaque commit, site en ligne.
> L'état complet vit désormais en pied du canon (§ *État d'implémentation*), qui se tient à jour —
> **ce fichier-ci ne bouge plus** : c'est une commande exécutée, pas une source.
>
> **Trois corrections au mandat, mesurées en l'exécutant :**
>
> 1. **§4.1 dit « le mot `bound` n'existe nulle part ».** À moitié faux. Le concept existe sous le
>    nom `granted_skill_budget` — des **points captifs** — écrit, lu par `derive.mjs` et
>    `decisions.mjs`, testé, pour le *Keen Senses* de l'Elfe. Ce qui manquait était la moitié
>    **classe**, pas le mécanisme.
> 2. **§4.4 dit « trois nombres faux à l'écran ».** Douze. Les douze cartes affichaient `base`, et
>    le canon change le SENS du nombre affiché, pas seulement trois valeurs.
> 3. **§2 range *Bard — Bonus Proficiencies* parmi les aptitudes de classe.** C'est une aptitude de
>    **sous-classe** (College of Lore) — refusée par le garde du générateur, qui confronte chaque
>    grant au SRD. Elle n'est pas portée ; le chapitre publié est corrigé.
>
> **Ce qui reste ouvert** (aucun n'est un nombre) : le multiclassage **dans le pli**, le catalogue
> des trainings (il attend un inventaire des langues), et où vivent les grants de sous-classe.


> **Le canon est ratifié.** Il vit dans le vault, et c'est LUI la source :
> `~/obsidian-vault/5.RPG/Fate's Hand/0. D&D 5+ Rules/4. Skills/Skill & Tool Points — Canon (SRD to FH).md`
> Ratifié par Eric le 2026-08-18, point par point, en une séance. **Ne rien re-trancher ici :
> tout ce qui suit exécute.**

⛔ **Ce lot ne décide rien.** Chaque nombre qu'il pose vient du canon. S'il manque un nombre, la
réponse est « demander à Eric », jamais « choisir ».

---

## 0. Ce qui change, en une page

**Le modèle** — un `base` unique dont on déduisait les imposés devient **trois totaux publiés** :

    bound skill points · bound tool points · free point pool

Le joueur ne manipule que le troisième. Les deux premiers sont déjà dépensés.

**Le niveau 1, part de la classe :**

| classe | bound sk | bound tool | free |
|---|---|---|---|
| barb · cleric · fighter · paladin · sorcerer · warlock · wizard | 2 | 0 | **10** |
| bard | 3 | 2 | **12** |
| druid | 2 | 1 | **12** |
| monk | 2 | 0 | **10** |
| ranger | 3 | 0 | **12** |
| rogue | 6 | 1 | **14** |

**Le tri bound / free se fait PAR LA CONTRAINTE, jamais par la source.** Et 🔴 **la donnée porte
déjà le test** : `granted_skill_choice.from` vaut soit une liste d'ids (→ bound), soit le littéral
`"any"` (→ free). Aucun champ à ajouter.

    elf   : from: ["insight","perception","survival"]  → BOUND
    human : from: "any"                                → FREE

**Ce qui meurt :**
- le `base` unique et la déduction des imposés ;
- le *net zéro* du grant d'espèce (ajouter au pool puis dépenser) — un grant contraint n'entre
  jamais dans le pool ;
- l'obligation **« au moins 1 point dans un outil »** (`skill-pool.no-tool`), moteur ET phrase UI ;
- la catégorie **outil d'artisan** — tous des outils ;
- les noms de paliers **Half / Proficient / Expertise** → **Novice / Adept / Expert** (coûts
  inchangés : 1 / 2 / 4).

---

## 1. L'ORDRE, et il n'est pas négociable

1. **Réécrire les tests qui verrouillent les valeurs fausses AVANT de toucher les valeurs.**
   `tests/fh-skills.test.mjs` (`LES_12_POOLS`) verrouille bard 16 / monk 14 / ranger 14. Toucher la
   source d'abord fait rougir la suite sans qu'on sache ce qui a cassé.
2. **`src/tools/fh-skills-source.mjs` (`CLASS_POOLS`) — la source unique des douze nombres.**
3. **Régénérer** `layers/fh-skills-en.layer.json` par son générateur (`gen-fh-skills-layer.mjs`).
   ⛔ **Ne jamais éditer la couche à la main** : elle est compilée, l'édition serait écrasée.
4. **`src/modules/fh/skill-pool.mjs`** — publier trois totaux, retirer le net zéro et le garde
   d'outil, corriger la doctrine en tête (elle affirme encore 18/16/14/12, arrière-plan inclus).
5. **Les fiches joueur** (`layers/fh-fiche-en.layer.json`) — trois nombres FAUX sont **montrés à
   l'écran** (barde, moine, rôdeur), et les douze libellés « Skill pool : N pts » désignent un pool
   qui n'est plus ce que le joueur dépensera.
6. **L'UI** — `skills-step.mjs` (la phrase de refus outil), `class-step.mjs` (le terme affiché).
7. **`contracts/build.md`** — la décomposition et la table d'équilibrage.
8. **Le vault** en dernier, une fois le moteur juste (voir §4).

⚠️ **Le piège du bump** : `engine.mjs` charge `layers/`, `examples/` et `schemas/` avec la MÊME
query de version que `ui/`. Après tout changement de CONTENU, `node bin/nouvelle-version.mjs`,
sinon le navigateur ressert l'ancien sous la même URL (mesuré : 221 mots affichés pour 571 sur le
disque).

---

## 2. Ce que le moteur doit savoir calculer, et qu'il ne sait pas

🔴 **Ni le bound ni le pool ne sont des constantes.** Les deux s'assemblent, et ils avancent sur
**deux horloges différentes** :

| | grandit quand | par quoi |
|---|---|---|
| **free point pool** | à chaque palier | +2 aux niveaux 4/8/12/16/20 · +1 par niveau du barde depuis le 2 · les grants non contraints · les grants d'expertise (2 pts chacun) |
| **bound** | quand un trait **nomme une liste** | barbare *Primal Knowledge* au niveau 3 (bound sk 2 → 3) |

⛔ **Un moteur qui publierait le bound comme une constante lue sur le record de classe serait faux
dès le niveau 3 sur le barbare.**

**Les grants d'expertise ne sont PAS des placements** : ils donnent des **free points + une
permission** d'acheter de l'expertise avant le niveau 4. **1 expertise = 2 free points.**

| trait | niveau | free points | permission |
|---|---|---|---|
| barde *Expertise* | 2 | **+4** | ✅ (et **+1** de l'échelle, entrée SÉPARÉE) |
| rôdeur *Deft Explorer* | 2 | **+2** + 2 langues (trainings) | ✅ |
| rôdeur *Expertise* | 9 | **+4** | ✅ |
| barde *Bonus Proficiencies* | 3 | **+6** (3 maîtrises au choix) | — |
| don *Skilled* | — | **+6** | — |

⚠️ Replier le +1 de l'échelle et le grant d'expertise du barde en un seul « +N au niveau 2 »
**perdrait la permission**, et la permission est la moitié de ce que le trait est.

---

## 3. Les trainings — le catalogue vide se remplit

`kind: "training"` existe déjà, est testé, et son catalogue est vide depuis le 2026-08-13. Le canon
le remplit : **langues, garrot (1 pt), rituels sombres (coût variable), armes exotiques** (pas
encore à l'inventaire).

- Achat au **niveau 4+**, 1 point ou plus, **sauf si un record dit autrement**.
- Le niveau générique 4 vit désormais **sur le record**, jamais dans l'écran — le commentaire de
  `renderTrainingsBlock` refusait de l'écrire faute de source vivante ; il en a une.
- **Trois trainings sont offerts avant le niveau 4** : druide *Druidic* (1), rogue *Thieves' Cant*
  (2, le cant + une langue), rôdeur *Deft Explorer* (2 langues).

⚠️ **Le garrot est à 2 points dans au moins trois fichiers du vault** et listé comme **outil DEX**.
Canon : **1 point, et c'est un training** — ni palier ni bonus.

---

## 4. Ce qui devient faux — VÉRIFIÉ DEUX FOIS

Deux passes : un balayage (48 sites dépôt / 42 vault), puis une **relecture de chaque site dans le
fichier réel**. La seconde a écarté des fantômes et — surtout — trouvé que le problème n'est pas
une liste de valeurs à changer.

### 4.1 🔴 TROIS CHOSES N'EXISTENT PAS DU TOUT

Ce ne sont pas des nombres faux, ce sont des **concepts absents**. Mesuré :

    grep -rn 'bound skill|bound tool|free point|point pool' src/ ui/ layers/ contracts/ tests/
    → 0

1. **Le mot `bound` n'existe nulle part.** Ni champ, ni libellé, ni contrat, ni test. Les trois
   totaux du canon n'ont aucun support.
2. **Les 6 points libres du background n'existent nulle part.** `fh-skills-source.mjs` a écrit
   « l'arrière-plan n'existe plus » ; `BACKGROUND_INHERITANCE` ne parle que du don et des 3 points
   de carac.
3. **Le bonus FH de +2 n'existe dans aucun fichier** — ni source, ni couche, ni test, ni contrat,
   ni exemple. ⚠️ **Tout personnage de niveau 1 est donc court de 2 points aujourd'hui, quelle que
   soit sa classe.**

⛔ **Conséquence sur l'ordre** : ce lot ne « corrige » pas douze nombres. Il change la **forme** de
`CLASS_POOLS` (trois champs au lieu d'un `base`), et le générateur doit apprendre à l'écrire.

### 4.2 Les manques que le premier balayage avait ratés

- **`expertise_from_level` du barde et du rôdeur : il faut 2, il y a 4.** Conséquence affichée :
  `ui/builder/skills-step.mjs:289-294` **refuse au barde de niveau 2-3 une expertise que le canon
  lui ouvre**.
- **Les free points des traits d'expertise sont totalement absents** de `progression()` — elle ne
  connaît que deux sources, le canon en chiffre trois de plus.
- **Le genre `training` n'existe pas** comme record. La source dit « et PLUS TARD `training` » : le
  plus tard est échu. Sans lui, les 2 langues du rôdeur, *Druidic* et *Thieves' Cant* n'ont nulle
  part où atterrir.
- **`skillpool-class-tools-unmechanical`** déclare « je ne sais pas compter les outils de classe ».
  Le canon les chiffre (barde 2, druide 1, rogue 1) : la déclaration devient un mensonge.
- **Le vocabulaire des paliers** n'est novice/adept/expert nulle part.
- **`src/labels.mjs:94`** — la formulation **française** de `skill-pool.no-tool`, que le premier
  balayage n'avait pas vue (il n'avait trouvé que la version anglaise de l'écran).
- **Le garrot est MAL CLASSÉ, pas seulement mal prix** : rangé parmi les outils, donc doté de
  paliers jusqu'à l'expertise. Un training n'a ni palier ni caractéristique.

### 4.3 ⚠️ LES FANTÔMES — ne pas les « corriger »

- 🔴 **`expertiseFromLevel: 1` sur le rogue est JUSTE.** Son trait d'*Expertise* de niveau 1 EST sa
  permission d'acheter (canon §A.5 : *« one extra expertise is allowed to be bought »*). Deux
  contrôleurs sur cinq l'ont signalé comme faux. **Ne pas y toucher** — et attention, le `base: 18`
  faux est sur la MÊME ligne.
- `DEFAULT_EXPERTISE_FROM_LEVEL = 4` et `DEFAULT_TRAINING_FROM_LEVEL = 4` : **conformes au canon**.
- L'échelle `TIER_COSTS` 1/2/4 : **juste** — seuls les NOMS changent.
- `layers/fh-skills-en.layer.json:615` n'est pas un champ d'expertise : c'est `"base": 18`.
- **Vault, faux sites du garrot** : `Dexterity tools.md:6` (« 5 gp » est le prix en OR, pas en
  points), `5X Skills and Tools 1.0.md:57` (aucun coût), `Battlefield Rules.md:10` (nomme la
  manœuvre sans coût). `FHPCv2 addendums.md` est **déjà juste**.
- `Z_Archive/Skill pools — pré-rework` contredit le canon **volontairement** : c'est sa fonction.
  ⛔ Le corriger la détruirait.

### 4.4 Ce qui est vu par le joueur

Les douze cartes de classe affichent `fh_skill_pool.base` (`ui/builder/class-step.mjs:168-170`) —
donc **douze nombres faux à l'écran**, pas trois. Plus les douze notes « background included » et
les douze lignes « Skill pool : N pts » des fiches.

## 5. Ce qui reste ouvert — la seule chose

**Le multiclassage.** La couche fusionne le +1 du barde et le +2 universel dans une seule case :
`bard: {"4": 3}` = 1 + 2. Deux règles, deux compteurs — le +2 compte sur le **niveau du
personnage**, le +1 sur les **niveaux de barde**. Mesuré :

> **Barde 4 / Guerrier 4**, personnage niveau 8 → vérité **+7** (4 universels + 3 du barde) ;
> la table fusionnée lue au niveau 8 donne **+11**. Quatre points de trop.

Refactor **à somme nulle** pour tout personnage mono-classe. À faire dans ce lot ou juste après.
