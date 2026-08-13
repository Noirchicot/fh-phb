# Lot 54 — `54-ecrans-concept-univers`

> **[Sonnet · high]** — **le dernier lot du builder.** Les deux étapes qui
> restent en placeholder. À la fin de ce lot, **les neuf étapes sont
> branchées**.

**Worktree** : `~/tools/fhpc-worktrees/54-ecrans-concept-univers`
**Branche** : `54-ecrans-concept-univers`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre** (837 attendus).

**Terrain** : `ui/builder/`, `src/doc/`, `contracts/doc.md`, `tests/`.
✅ **Aucun autre lot n'est en vol** — tu as le champ libre.

---

## 0. LE DÉCOUPAGE, TRANCHÉ PAR ERIC (2026-08-13)

| Étape | Ce qu'elle porte |
|---|---|
| **Concept** | **nom · genre · alignement** |
| **Universe & Layers** | **les couches · la langue de la fiche · les unités · le nom de code de la campagne** |

⛔ **HORS PÉRIMÈTRE, ET C'EST VOULU : « UI · couleurs ».** Eric l'a citée pour
Universe, mais mesuré : `tokens.css` n'a **aucun sélecteur `[data-theme]`** — le
thème suit l'OS, la bascule **n'existe pas**. C'est un petit chantier à part
(bascule + persistance), **pas** un branchement. Il fera son propre lot.

⛔ **Et une couleur d'interface n'entrera JAMAIS dans le document** : un
personnage s'exporte et s'importe, donc un thème embarqué **repeindrait le
builder de celui qui importe**. `localStorage`, jamais `fh-char/1`.

---

## 1. 🔴 LE TROU MESURÉ PAR L'ARCHITECTE — lis ceci avant de concevoir

Les trois champs de Concept et la campagne d'Universe s'écrivent par
**`doc.rename`** (le nom) et **`doc.describe`** (genre, alignement, campagne),
livrés par les lots 47 et 48. **Mais** :

1. `ui/builder/engine.mjs` ne monte **QUE** `layers` et `build`. **Le bloc `doc`
   n'est pas monté** — `grep "createDoc" ui/builder/engine.mjs` → rien.
2. `createDoc({storage, …})` **EXIGE un magasin** (`store.mjs:83`, refus nommé).
3. La seule implémentation livrée est `src/storage/fs.mjs` — **du Node**. Le
   navigateur n'a **aucun** magasin. *(`memoryStorage` existe, mais dans
   `tests/doc-harness.mjs` : c'est un harnais de test.)*

### ⚖️ L'ARBITRAGE, et son motif est un précédent DE CE DÉPÔT

⛔ **NE MONTE PAS `doc` avec un faux magasin en mémoire.** Ça publierait
`doc.save` dans une page où enregistrer ne garde rien : le joueur croirait
sauvegarder et perdrait tout au rechargement. Le dépôt a déjà tranché cette
forme exacte, et la phrase est au tableau de bord :

> *« Publier `doc.save` sans pouvoir enregistrer promettrait une porte qui
> n'ouvre sur rien — et une IA lit un catalogue comme un contrat. »*

⭐ **CE QUI REND LA SORTIE FACILE, ET C'EST MESURÉ** : `rename` et `describe`
sont **PURS**. Le lot 47 l'écrit noir sur blanc — *« `rename` est pur : il ne
touche ni le magasin ni `build.choices`, prend `{document, name}` et rend une
copie »*. `describe` est bâti pareil. **Ils n'ont aucun besoin du magasin ; ils
sont seulement enfermés dans la fermeture de `createDoc`.**

➡️ **Ta mission sur ce point : rendre ces deux écrivains atteignables sans
magasin, sans affaiblir le bloc.** La forme est à toi — extraire les fonctions
pures dans `src/doc/` et faire que `createDoc` les réutilise est la piste que
l'architecte recommande, parce qu'elle ne DUPLIQUE rien : **le verbe du bloc et
la fonction importable doivent être le MÊME code**, sinon ils divergeront.

⚔️ **Et c'est le test qui compte le plus** : prouver que `doc.describe` (le
verbe) et l'écrivain importable produisent **le même résultat**, sur les mêmes
entrées, y compris sur les **refus**.

⛔ **Ne touche pas au schéma.** Les trois champs existent déjà.

---

## 2. Ce que chaque écran fait

### 2a. Concept

- **Le nom** : un champ de saisie. ⚠️ Il est **requis** au schéma (1–200
  caractères) — un nom vide est un refus **nommé**, jamais un silence.
- **Genre** et **alignement** : facultatifs, **texte libre**.
  ⭐ **L'alignement propose les neuf**, *et laisse écrire autre chose* — la
  liste vit dans l'ÉCRAN, jamais dans le schéma (`Chaotic Good (mostly)` doit
  passer). C'est une décision ratifiée : `identity.creatureType` est *« une
  chaîne libre EXPRÈS »*.

### 2b. Universe & Layers

- **Les règles : deux piles NOMMÉES** — `SRD` et `SRD + FH`. ⛔ L'écran ne
  compose pas une pile à la main : le schéma dit *« l'ORDRE EST LA PILE :
  première entrée = base (SRD), dernière = la plus forte »*. Deux choix, pas un
  éditeur.
  ⚠️ **Mesure ce que changer de pile implique** sur un personnage déjà
  construit — et si c'est destructeur, **sers-toi de `confirm.mjs`** (le lot 46
  l'a écrit générique exprès, et Class s'en sert déjà pour le même motif).
- **La langue de la fiche** : `fr` | `en` (`document.lang`).
  ⚠️ **À NE PAS CONFONDRE** avec `resolved.languages`, les langues **parlées**
  du personnage — celles-là sont **dérivées** de l'espèce et **ne se cliquent
  pas** (mesuré : aucun chemin de choix `language` n'existe).
- **Les unités** : `document.units` (distance, poids).
- **Le nom de code de la campagne** : texte libre, facultatif.

---

## 3. Les tests

1. ⚔️ **LE TEST QUI PROUVE LE LOT** : le verbe `doc.describe` et l'écrivain
   importable rendent **le même document**, refus compris.
2. **Les quatre champs s'écrivent et se relisent** à la racine, et ⚔️ **ne
   créent AUCUN choix** dans `build.choices` — vérifie aussi l'absence dans
   `unconsumed`.
3. **Un nom vide est un refus nommé** ; les trois autres champs restent
   facultatifs.
4. **L'alignement accepte une valeur hors des neuf.**
5. **Changer de pile** fait ce que tu as mesuré en §2b — et le test le
   **montre**, y compris la confirmation si tu en poses une.
6. **`lang` et `units` s'écrivent**, et le carnet suit.
7. ⚔️ **Aucun faux magasin** : `grep` sur `ui/` ne trouve **aucun** `createDoc`.
8. **Les neuf étapes sont branchées** — plus aucun placeholder dans `shell.mjs`.
   ⭐ **C'est le test qui clôt le builder.**

**Une attaque manuelle minimum** : neutralise un garde, vérifie que le test visé
**et lui seul** rougit, restaure, `diff` byte-à-byte, suite complète rejouée.

---

## 4. 👀 REGARDE-LE

Sers `ui/builder/` et **construis un personnage de bout en bout, des neuf
étapes**. C'est la première fois que c'est possible. **Décris ce que tu vois.**
⚠️ **Vérifie la largeur de ta fenêtre avant de juger une mise en page** —
l'architecte a cru voir une coquille cassée en regardant un viewport de 400 px,
où le seuil de 720 bascule légitimement.

---

## 5. Ce que tu livres

- Commits, **arbre propre**, SHAs, tests **au départ et à l'arrivée**.
- `INVENTAIRE-LOT-54.md` : la forme donnée aux écrivains importables · ce que tu
  as mesuré sur le changement de pile · **ce qui t'a surpris** · ce que tu as
  changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire — c'est la clause la plus rentable de ce
chantier.** Aujourd'hui : le **43** a déclaré deux dettes hors mandat (sans lui,
pas de lot 52) · le **47** a refusé un nom de verbe, et **son refus est devenu
la loi du 48** · le **50** a déclaré un trou de test qu'il ne pouvait pas
boucher · le **51** et le **49** ont attaqué leur PROPRE travail, trouvé leur
garde creux, et l'ont réparé sans qu'on le leur demande · le **53** a démenti la
liste de fichiers de sa commande, **et il avait raison**.
