# Lot 48 — `48-champs-identite`

> **[Sonnet · high]** — un lot de **schéma et de contrat**. Il ne dessine rien.
> Il ouvre les trois champs que les étapes Concept et Universe devront écrire.

**En clair : le genre, l'alignement et la campagne n'existent nulle part.** Eric a
décidé que Concept porte *nom · genre · alignement* et qu'Universe porte *les
couches · la langue · les unités · le nom de code de la campagne*. Deux de ces
choses existent (`name`, `lang`, `units`). **Trois n'existent pas du tout.**

**Worktree** : `~/tools/fhpc-worktrees/48-champs-identite`
**Branche** : `48-champs-identite`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ton terrain** : `schemas/`, `src/doc/`, `contracts/doc.md`, `tests/`.
⛔ **NE TOUCHE À AUCUN FICHIER DE `ui/`** — le lot 50 y travaille en ce moment.
⛔ **Ne touche pas à `src/build/`** : ces trois champs ne dérivent **rien**.

---

## 0. Ce qui est MESURÉ — vérifie-le, ne le refais pas

### 0.1 Les trois champs n'existent pas

`grep -rn "gender\|pronoun\|alignment\|campaign"` sur `schemas/` et `contracts/`
→ **zéro**.

⚠️ Deux faux positifs à ne pas prendre pour des existences :
- **349** occurrences d'`alignment` dans `layers/srd-5.2.1-en.layer.json` — ce
  sont les alignements des **monstres**, pas un champ de personnage ;
- `campaign` existe dans `src/play/` (`session.mjs:133`, `export.mjs:41`) — c'est
  l'état d'une **séance de jeu**, pas une donnée de document. ⭐ **Mais c'est une
  bonne nouvelle** : le mot est déjà au vocabulaire, et un personnage qui porte
  son nom de code **alimentera** cette sortie au lieu de la laisser vide.

### 0.2 Où ils doivent vivre, et pourquoi il n'y a pas de choix

**À la RACINE du document.** Mesuré, les propriétés racine sont :
`schema · id · name · lang · units · generator · created · modified · resolved · build`.

⛔ **Pas dans `resolved.identity`** — `identity` vit dans `resolved`, donc il est
**dérivé**, et **rien ne dérive un genre**. Y écrire à la main violerait la loi la
plus simple du format.

⭐ **Et le précédent est déjà là : `generator`** est une métadonnée racine
**facultative**. Les trois nouveaux champs sont de la même famille.

### 0.3 Le verbe qui écrit le nom existe déjà, et il est VOLONTAIREMENT étroit

Le lot 47 a livré `doc.rename({document, name})` — il écrit `name` **et rien
d'autre** (`store.mjs:342`, `renamed.name = name`). Son inventaire **refuse
explicitement** le nom `describe`, et voici son argument, mot pour mot :

> *« le mot suggère une action plus large qu'écrire un seul champ … Un nom de
> verbe trop large invite à y accrocher autre chose plus tard. »*

⛔ **NE GÉNÉRALISE PAS `rename`.** Son argument tient, et il te décrit : tu **es**
le « plus tard » qui voulait y accrocher trois champs.

---

## 1. ⚖️ CE QUE L'ARCHITECTE A TRANCHÉ

### 1a. Les trois champs : **texte libre, facultatifs**

⛔ **Aucune énumération fermée**, pas même pour l'alignement.

📌 **Le motif, et c'est un précédent RATIFIÉ de ce dépôt** :
`identity.creatureType` est *« une chaîne libre EXPRÈS — un homebrew a le droit
d'inventer un type »*. Une énumération des neuf alignements rendrait
`Chaotic Good (mostly)` **invalide**, et une campagne neuve serait un rejet.

⭐ **La liste des neuf vit dans l'ÉCRAN**, plus tard, jamais dans le schéma. Le
document accepte ce qu'on lui donne ; l'écran, lui, propose.

⚠️ **Donne-leur quand même une `maxLength`** — `name` en a une (200). Un champ de
texte sans borne dans un document qu'on s'échange est une porte ouverte. Choisis,
et **dis pourquoi** dans l'inventaire.

### 1b. ⭐ UN SEUL verbe neuf, et **il lit sa liste blanche DANS LE SCHÉMA**

C'est ce qui répond à l'objection du lot 47. Un verbe est « trop large » quand
**le code** décide de ce qu'il accepte ; il ne l'est plus quand **le schéma**
décide, parce qu'alors il ne peut pas dériver.

Le patron existe, avec sa loi, et il est déjà employé deux fois :
- `readFromSchema(schema, route)` (`src/doc/schema.mjs:312`) — *« ce bloc lit sa
  règle dans le schéma et n'en invente aucune (loi §0.10) »* ;
- `contracts/doc.md:45` — *« il GÉNÈRE sa liste blanche à partir de lui : aucune
  règle n'est recopiée en code »* ;
- et le lot 47 vient de s'en servir pour `deriveDraftSchema`.

➡️ **Le verbe accepte exactement les champs racine que le schéma déclare
facultatifs et descriptifs, et il les LIT dans le schéma.** Ajouter demain un
quatrième champ au schéma le rendra écrivable **sans qu'une ligne du verbe ne
bouge** — ⚔️ **et c'est le test qui prouve le lot** (§3.1), exactement comme le
test 8 du lot 47 a prouvé la dérivation du schéma de brouillon.

⚠️ **Le nom du verbe est à toi.** `describe` redevient défendable **à cette
condition-là seulement**. Mesure, choisis, **et justifie contre l'argument du lot
47** — ne te contente pas de l'ignorer.

### 1c. `create` doit pouvoir les poser dès la naissance

Un joueur qui crée son personnage donne son nom et son genre dans le même écran.
⛔ **Mais ils restent FACULTATIFS** : un `create` sans eux réussit. *(Décision D3 :
pas de défaut deviné — mais « facultatif » n'est pas « deviné », c'est « absent ».)*

### 1d. ⛔ `rename` ne bouge pas

Il reste exactement ce qu'il est. `name` est **requis** et borné ; les trois autres
sont **facultatifs** et libres. **Le schéma les coupe là, le verbe se coupe là.**

---

## 2. Les tests

1. ⚔️ **LE TEST QUI PROUVE LE LOT** : ajouter une propriété racine facultative au
   schéma la rend **aussitôt** écrivable par le verbe, **sans toucher au verbe**.
   Sans ce test, rien ne dit que la liste blanche est lue plutôt que recopiée.
2. **Les trois champs s'écrivent, se relisent à la racine**, et ⚔️ **ne créent
   AUCUN choix** dans `build.choices` — vérifie aussi qu'ils ne reviennent **pas**
   dans `unconsumed`.
3. **Ils sont facultatifs** : un document sans eux valide, avant comme après.
4. **Un champ trop long est un refus NOMMÉ**, jamais un silence.
5. ⚔️ **Le verbe REFUSE d'écrire un champ que le schéma ne déclare pas** — l'attaque
   qui prouve que la liste blanche mord dans les deux sens.
6. **`create` les accepte** et réussit **aussi** sans eux.
7. **`rename` est inchangé** — ⛔ ce lot ne retire rien, et les 13 tests du lot 47
   restent verts.
8. **Le brouillon les porte aussi** : `deriveDraftSchema` n'a rien à changer, et
   le test le montre.

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test visé
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

⚔️ **Et attaque ce que le lot 47 n'a PAS attaqué.** Il a attaqué son garde `units`
et la dérivation du schéma de brouillon ; l'architecte a attaqué la dérivation une
seconde fois. **Trouve autre chose.**

---

## 3. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-48.md` : le **nom du verbe et sa justification contre l'argument
  du lot 47** · comment tu lis la liste blanche dans le schéma · les `maxLength` et
  leur motif · **ce qui t'a surpris** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** **Onze** lots l'ont fait, et c'est le
meilleur rendement de ce chantier. Le **lot 43** a trouvé une troisième instance
d'un défaut connu et **ne l'a pas corrigée** — il l'a **déclarée**. Le **lot 45** a
démenti son propre en-tête. Le **lot 47** a refusé un nom de verbe que sa commande
suggérait, **et son refus est devenu la §1b de celle-ci**. Les trois gestes sont
exactement ce qu'on attend.
