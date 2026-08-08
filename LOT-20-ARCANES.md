# LOT `20-arcanes-fh` — **Opus · high**

**En clair : tu vas donner un corps aux 22 Arcanes majeurs de Fate's Hand et au don
Destiny Touched, pour que le Score de Destinée cesse de dire « je ne peux pas calculer ça ».**
Aujourd'hui le moteur sait additionner la maîtrise et l'espèce, mais il déclare forfait sur
l'Arcane — alors que les 7 personnages réels d'Eric en portent tous un.

**Ton terrain, et rien d'autre :**
- worktree `~/tools/fhpc-worktrees/20-arcanes-fh`, branche **`20-arcanes-fh`** (déjà créée, partie de `d8273b9`)
- ⛔ **ne touche JAMAIS `main`**, ne pousse rien, ne crée aucun remote. `git push` est le geste d'Eric.
- ⛔ `fh-phb`, `fh-srd`, `fh-skills` sont en **lecture seule**.

---

## 1. Pourquoi ce lot existe

Le lot 19 a publié le Score de Destinée terme par terme. Trois termes sont sortis
**déclarés non dérivables** faute de source à lire — et deux d'entre eux sont à toi :

| Terme | Ce qui manquait | État aujourd'hui |
|---|---|---|
| **Impact de l'Arcane majeur** | le genre `arcana` n'existait pas | ✅ **le genre est ouvert** (révision d'architecte, `d8273b9`). Il manque le **contenu** |
| **Don `Destiny Touched (fh)`** (+2) | aucun record ne portait la valeur | ⚠️ le genre `feat` existait **depuis le premier jour** — il n'a jamais manqué que la fiche du don |
| Ligne « Other » | — | **laisse-la déclarée**, elle n'est pas de ce lot |

**Mesuré sur les personnages réels d'Eric** : 7/7 portent un Arcane, 5/7 portent
Destiny Touched. L'impact vaut **0, 1 ou 2 selon la carte** — jamais codable en dur,
c'est précisément pourquoi il lui faut un record.

---

## 2. La source de vérité — triangulée, NE LA RE-MESURE PAS

`~/tools/fh-skills/fh-skill-builder.html`, **`const ARCANA`** (vers la ligne 590).
C'est **l'outil que la table utilise**, confirmé par les 7 personnages réels, et le
chapitre du site le répète à l'identique sur les 22 cartes. **Aucun conflit à arbitrer.**

Forme de chaque carte, relevée sur disque :

```js
{ id: "IX", name: "The Hermit", impact: 2, meaning: "…", power: "…", vibration: "…" }
```

`id` est le **chiffre romain** (`"0"` à `"XXI"`), `impact` un entier **0, 1 ou 2**.

Le don, même fichier, vers la ligne 570 :

```js
destinyTouched: { label: "Destiny Touched (fh)", id: 2383104, destiny: 2, skillPts: 0,
                  desc: "+2 Destiny · fate leans toward you (replaces Lucky)" }
```

📌 **Mesuré par l'architecte, pour t'éviter d'inventer une opération** : la note
« replaces Lucky » vise le don *Lucky* du PHB 2024, **qui n'est PAS dans le SRD 5.2**
(vérifié : 17 dons SRD, `lucky` absent, seul `skilled` existe). **N'écris donc AUCUN
`disable`** — il n'y a rien à désactiver.

---

## 3. Ce que tu livres

### 3a. Deux fichiers de couche

Modèle exact à suivre : `layers/fh-species-en.layer.json` (couche FH existante, 12 espèces).

| Fichier | `id` | Contenu |
|---|---|---|
| `layers/fh-arcana-en.layer.json` | `fh-arcana-en` | **22 records** `fh:arcana:en:<slug>` |
| `layers/fh-feats-en.layer.json` | `fh-feats-en` | **1 record** `fh:feat:en:destiny-touched` |

Contraintes de forme, toutes vérifiables au schéma `fh-layer/1` :
- `schema: "fh-layer/1"`, `lang: "en"`, `flags: ["fh.destiny"]` ;
- `attribution` obligatoire. ⚠️ **Elle n'est PAS celle de la couche des espèces** : les
  Arcanes sont du contenu **100 % original**, ils ne modifient aucun matériel SRD. Ne
  recopie donc pas la phrase « Portions of the SRD material … have been modified » — elle
  serait fausse. `license: "all-rights-reserved"` et un texte qui dit la vérité de CE
  contenu-là ;
- ids en `fh:<genre>:en:<slug>`, slug en minuscules-tirets (`the-hermit`,
  `wheel-of-fortune`, `destiny-touched`) ;
- **la table joue en anglais** (décision d'Eric) : cette couche est en anglais, pas de FR.

**Où mettre l'impact** : c'est à toi de le proposer, mais il doit être **un entier lisible
sans deviner** — le module va l'additionner. Regarde comment `data.destiny.base` porte la
Base d'espèce dans la couche des espèces, et reste cohérent avec cette convention.
Le chiffre romain, le `meaning`, le `power` et la `vibration` voyagent aussi : ce sont des
données de la carte, on ne les jette pas parce que ce lot ne s'en sert pas encore.

### 3b. Le module apprend à lire

`src/modules/fh/destiny-stat.mjs` — c'est le SEUL fichier de logique de ce lot.

1. **Le verrou à ouvrir, ligne 118** : le module **refuse aujourd'hui tout choix portant un
   `ref`** (« a Destiny Score term is a NUMBER »). Or le choix d'Arcane porte un `ref` **par
   conception** — c'est ainsi qu'un personnage désigne un record, exactement comme l'espèce,
   la classe et l'historique. ⚠️ **Ouvre ce refus pour le chemin de l'Arcane SEULEMENT.**
   Un `ref` sur `glory[0]` ou `awakening[0]` doit **continuer à être refusé** — et un test
   doit le prouver, sinon tu as remplacé un garde par une porte.

2. **Le chemin du choix est `fh.destiny.arcana`** — pas `destiny.arcana`. Le préfixe
   `fh.destiny.` EST le namespace du module (drapeau `fh.destiny`) ; un choix posé hors de
   ce préfixe ressortirait `unconsumed` au lieu d'être lu.

3. **Les deux lignes à produire dans le `breakdown`** :
   - Arcane : `{ label: <nom de la carte>, value: <impact>, source: { kind: "arcana", id } }`
   - Don : `{ label: "Destiny Touched (fh)", value: 2, source: { kind: "feat", id } }`

   ⚠️ **`label` est recopié du record, jamais fabriqué** — c'est la règle que le lot 19 a
   appliquée au bonus de l'Elfe. Et `value` est **lu dans le record**, jamais écrit en dur :
   un impact codé en dur redeviendrait faux à la première carte rééquilibrée.

4. **Lève les deux déclarations** `stats[fh:destiny].arcana` et `.feat` **quand le terme est
   réellement dérivé**. Laisse `.other`. Et garde-les **quand la couche n'est pas montée** :
   un personnage sans couche d'Arcanes doit toujours dire pourquoi il ne compte rien.

5. **Les refus de contenu JETTENT** (discipline du lot 19, §1) : un `impact` qui n'est pas
   un entier, un record d'Arcane sans nom, un `ref` qui pointe un id absent de la pile. Un
   contenu faux n'est pas un travail à finir — c'est un Score faux qui aurait l'air juste.

### 3c. Ce que tu NE fais pas

- ⛔ **Ne touche pas `src/modules/fh/index.mjs`** (le moteur de séance lit encore
  `character.destinyBuild.arcana`, un chemin v1). C'est une dette connue, elle n'est pas de
  ce lot — elle a besoin d'un arbitrage que tu n'as pas.
- ⛔ **N'invente pas de couche FR.**
- ⛔ **Ne touche pas au garde de somme** de `src/build/validate.mjs`. Il doit rester vert
  **sans être modifié** : c'est lui qui prouve que ton total est démontré par son détail.
- ⛔ **Ne touche pas aux schémas** — `schemas/` appartient à l'architecte, et le genre est
  déjà ouvert.

---

## 4. ⚠️ UNE QUESTION QUE TU DOIS POSER, PAS TRANCHER

**Le `power` et la `vibration` de la carte doivent-ils apparaître dans `resolved` ?**

L'argument pour : le document `fh-char/1` doit rester **jouable sans ses couches** (§3.1 du
BRIEF), et le pouvoir d'un Arcane est du texte qu'on lit à la table. La table de couverture
v1 mappe déjà `destiny.arcana.power` → `resolved.traits[].text`.

L'argument contre : **le contrat de ton module ne le permet pas.** Il rend
`{stat, underived}` — il n'a aucun moyen d'écrire `resolved.traits[]`. Le faire demanderait
un second point d'injection **qui n'existe pas**.

→ **STOP et demande à l'architecte** (loi §0.10 : jamais improviser une règle ou un nom).
Livre le Score — c'est lui qui bloquait — et pose la question dans ton inventaire.

---

## 5. Les lois qui te gouvernent (kickoff §0)

- **Rapporter n'est pas livrer** : fin de lot = commits réels, **arbre propre**, SHAs listés,
  suites re-jouées. Deux lots ont déjà dit « terminé » avec tout en non-commité.
- **§0.7 — les assertions** : une assertion rendue fausse se **réécrit à la nouvelle vérité**
  et se marque `REWRITTEN` **sur sa propre ligne**. Jamais relâchée, jamais supprimée. Une
  marque en milieu de ligne a déjà commenté quatre assertions et rendu une suite verte à tort.
  ⚠️ **`tests/fh-destiny-score.test.mjs` va rougir, et c'est voulu** : il affirme aujourd'hui
  que l'Arcane et le don sont déclarés non dérivables. Ils ne le seront plus.
- **§0.5 — aucun repli silencieux.** Un record absent, un impact illisible → erreur bruyante
  qui NOMME la chose.
- **§0.10 — décision non couverte par cette commande → STOP, question à l'architecte.**
- **§0.12** ne te gêne pas ici : `src/modules/fh/` est le répertoire de la couche FH, il a le
  droit de nommer les mécaniques maison. (Le garde mord dans `src/layers/`, `src/play/`,
  `src/mcp/` — pas chez toi.)
- **Dépôt public** : aucun contenu WotC, aucun propos sur des personnes.

---

## 6. Le test d'acceptation — c'est lui qui dit si le lot a réussi

> Un personnage montant la couche des espèces **et** la couche des Arcanes, portant
> `fh.destiny.arcana` → *The Hermit* et le don Destiny Touched, publie un Score dont le
> `breakdown` porte **la ligne de la carte avec sa valeur lue dans le record** et **la ligne
> du don**, chacune citant sa source — et le total **survit à deux reconstructions de suite**.

Et son pendant, aussi important :

> Le même personnage **sans la couche des Arcanes** ne fabrique aucun nombre : il
> **déclare** le terme, avec une raison qui nomme le contenu manquant.

**Trois vérifications qu'on attend de toi, pas des promesses :**
1. les **22** cartes entrent, et leurs impacts se répartissent bien sur **0, 1 et 2** ;
2. la suite complète re-jouée **verte**, `npm test` depuis la racine du worktree ;
3. **attaque tes propres gardes** — un impact fabriqué faux doit faire échouer la
   reconstruction, et le refus d'un `ref` hors du chemin de l'Arcane doit toujours mordre.

---

## 7. Ce que tu rends

- `INVENTAIRE-LOT-20.md` à la racine du dépôt : ce que tu as livré, **les questions que tu
  n'avais pas le droit de trancher** (dont celle du §4), et les assertions réécrites avec
  leur ancienne et leur nouvelle vérité.
- Les SHAs de tes commits, l'arbre propre, le compte de tests.
