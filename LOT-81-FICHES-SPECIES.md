# Lot 81 — les douze fiches d'espèce, aux trois modèles d'Eric

> **Origine : trois maquettes faites à la main par Eric le 2026-08-17**
> (Hoddon, Elf, Dragonborn), envoyées en conversation. ⚠️ **Ces images ne sont
> PAS sur le disque** — elles ont été transcrites ici le jour même pour que le
> travail survive au fil. Si elles reviennent un jour dans
> `~/Desktop/Claude Drop/`, les ranger dans `croquis/` et le noter ici.

## 0. Ce qu'Eric a dit, mot pour mot

> *« J'ai fait 3 species à la main en respectant le cadre : Image / bloc texte 1
> / bloc texte 2 / bloc texte 3. Ici on fait comme dans Classes : il y a une
> config d'habillage desktop et mobile. Pour species la complexité c'est qu'il
> faut résumer les capacités spéciales de chaque species, en donnant juste ce
> qu'il faut mais pas trop peu. »*

> *« Si tu dois déplacer, réduire, agrandir les blocs textes, réduire la police
> etc., fais-le, mais respecte l'harmonie globale. »*

> *« Prends les images déjà en ligne comme base. Essaie de faire rentrer mon
> texte dans les 3 blocs tels que placés actuellement. »*

> *« Dans la carte, quand y'en a 3 : règle générale ET détails pour chaque.
> Quand y'en a 10 : règle générale un peu détaillée. »* *(sur les lignages)*

> *« Derrière le bouton Choose on rentrera plus en détail dans les lignages. »*
> — ⛔ **hors de ce lot.**

## 1. LE CADRE — quatre boîtes, et ce que chacune porte

```
 ┌──────────────────────────────────────────┐
 │  NOM                                     │
 │  ┌──────────────────┐   ┌─────────────┐  │
 │  │  BLOC TEXTE 1    │   │             │  │
 │  │  Type            │   │   IMAGE     │  │
 │  │  Sz              │   │             │  │
 │  │  Speed           │   │  (celles    │  │
 │  │  Darkvision      │   │  déjà en    │  │
 │  │                  │   │  ligne,     │  │
 │  │  Trait signature │   │  350×600,   │  │
 │  │  *effet*         │   │  fond       │  │
 │  │  Trait signature │   │  transp.)   │  │
 │  │  *effet*         │   │             │  │
 │  └──────────────────┘   └─────────────┘  │
 │  ┌────────────────────────────────────┐  │
 │  │  BLOC TEXTE 2 — les LIGNAGES       │  │
 │  └────────────────────────────────────┘  │
 │  ┌────────────────────────────────────┐  │
 │  │  BLOC TEXTE 3 — le BLURB           │  │
 │  └────────────────────────────────────┘  │
 │        [ LORE ]        [ CHOOSE ]        │
 └──────────────────────────────────────────┘
```

### Bloc 1 — quart haut-gauche, à côté de l'image

**Quatre lignes de stats**, puis les **traits signature**.

| | |
|---|---|
| les 4 stats | `Type` · `Sz` · `Speed` · **`Darkvision`** |
| ⭐ `Darkvision` | **MONTE des traits vers les stats** — c'est le changement le plus net des trois modèles |
| forme d'un trait | **nom en gras sur sa ligne**, **effet en italique dessous** — deux lignes, pas une |
| le texte | **centré**, comme aujourd'hui (Eric, 2026-08-16 : « centrer LE TEXTE UNIQUEMENT de la boîte 1 ») |

**Ce que chaque modèle porte en bloc 1** *(transcrit des trois images)* :

| | stats | traits gardés |
|---|---|---|
| **Hoddon** | `Type : Humanoid` · `Sz : S (3–4ft)` · `Speed : 30 feet` · `Darkvision : 60 ft` | `Gnomish Cunning` / *Adv on Int/Wis/Cha saves* |
| **Elf** | `Type: Humanoid` · `Sz : M (5–6 ft)` · `Speed: 30ft /varies` · `Darkvision : 60ft /varies` | `Fey Ancestry` / *Adv vs Charm* · `Keen Senses` / *Delve, Survival, Vigilance* · `Trance` / *A long rest in 4 hours* |
| **Dragonborn** | `Type: Humanoid` · `Sz Medium (5–7 ft)` · `Speed: 30 feet` · `Darkvision : 60ft` | `Draconic Flight` / *at lvl 5, short bursts of flight* |

⭐ **Le `/varies` de l'Elfe est une trouvaille d'Eric** : la vitesse et la
portée de vision **dépendent du lignage** (Wood Elf 35 ft, Drow 120 ft de
vision). La stat ne ment pas, elle annonce qu'elle bouge.

### Bloc 2 — pleine largeur, sous l'image : LES LIGNAGES

| | |
|---|---|
| titre | `<X> Lineages :` **en gras** |
| règle générale | en *italique*, quand il y en a une — Elfe : *« All have limited Spellcasting abilities »* |
| puis | **une ligne par lignage** : `Nom : résumé très court` |
| ⚠️ au-delà de 3 | **pas de liste** — une règle générale « un peu détaillée » remplace les noms |

**Les trois modèles** :

- **Hoddon** → `Hoddon Lineages :` puis `Forest Folk : Minor Illusion & Speak with Animals` · `Rock Folk : Mending & Prestidigitation` · `The Mole People : Darkvision 120 ft & tinker tools`
- **Elf** → `Elven Lineages` · *All have limited Spellcasting abilities* · `Drow : Darkvision 120ft` · `High elf : Can juggle with cantrips` · `Wood elf : speed 35 ft`
- **Dragonborn (10)** → **pas de liste** : `Draconic Ancestry.` puis *« Having a Breath Weapon and a damage Resistance, its nature related to the favored element of their ancestor »*

📌 **Qui a un lignage** : Dragonborn (10), Goliath (6), Elf (3), Tiefling (3),
Hoddon (**3 depuis le 2026-08-17** — Eric a ajouté *The Mole People*). Les
**sept autres n'en ont pas**, et leur bloc 2 est ABSENT — c'est cette absence
qui recentre leur moitié basse (règle déjà en place, `data-infos`).

### Bloc 3 — pleine largeur, en bas : LE BLURB

Le texte d'ambiance de ~50 mots qui vit déjà dans `data.blurb`
(`layers/fh-fiche-en.layer.json`) et **qui n'est affiché nulle part
aujourd'hui**. Six lignes environ, à fleur des boutons.

🔴 **C'EST LE GAIN PRINCIPAL DU LOT** : la moitié basse portait les traits
depuis le lot 78 ; les traits montent en bloc 1, et la prose écrite, payée et
invisible retrouve sa place.

## 2. LA GÉOMÉTRIE — mesurée, pas déduite

Mesuré dans le navigateur le 2026-08-17, fiche servie à **375 × 553**.

| | |
|---|---|
| dalle | 269 × **440** *(hauteur imposée, F1)* |
| bloc 1, modèle Elfe | **170 px** *(4 stats + 3 traits à deux lignes)* |
| rangée de stats aujourd'hui | 126 px |
| image | 100 × 156, `object-fit: contain` |
| colonne de lecture | **253** à 375 · **226** en paysage |
| une ligne à T2 | **14,4 px** |

**Le budget vertical est FERMÉ à 440** :

```
8 marge + 22 nom + 8 + 170 bloc 1 + 8 + bloc 2 + 8 + bloc 3 + 8 + 44 pied + 8
→ il reste 156 px pour les blocs 2 et 3
```

Et l'Elfe demande **72** (titre + règle + 3 lignages) **+ 86,4** (blurb 6
lignes) = **158,4**.

🔴 **LA MISE EN PAGE D'ERIC TOMBE À 442,4 POUR UNE FENÊTRE DE 440.** Elle
déborde de **2,4 px** sur le pire cas. Elle est donc juste, mais sans aucun mou.

⭐ **OÙ PRENDRE LES 22 px, et c'est le dessin d'Eric qui le dit** : ses trois
modèles posent **le nom DANS la colonne de gauche**, en tête du bloc 1, pas en
rangée séparée centrée au-dessus de toute la carte. Fondre la rangée du nom
dans le bloc 1 rend ses 22 px et rapproche du dessin. **Autorisé par Eric** :
*« si tu dois déplacer, réduire, agrandir les blocs textes… fais-le »*.

### Ce que la boîte du bas offrait déjà, et qu'on croyait plein

| | contenu réel | boîte | mou |
|---|---|---|---|
| Halfling *(le pire)* | 115,2 | 144 | **28,8** |
| Elf *(7 entrées)* | 100,8 | 144 | **43,2** |
| Loroka · Goliath · Orc · Tiefling | 57,6 | 144 | **86,4** |

La boîte tient **10 lignes** ; la fiche la plus chargée en employait **8**.
⛔ Le mandat annonçait « plus aucune marge » : **faux pour les espèces**.

## 3. CE QUI RESTE HORS DE CE LOT

- ⛔ **Derrière `CHOOSE`** — le détail des lignages. Parole d'Eric.
- ⛔ **Le panneau `LORE`** — organe partagé, son propre lot.
- ⏳ **Le poids de l'écran Species** : 2,06 Mo pour une cible de 1,8.
- ⏳ **`--text-soft` sur verre** rend 3,0–3,6 et `decor.test.mjs` ne peut pas le
  voir. Le `LORE` éteint est à `opacity: .55`.

## 4. LES DÉCISIONS D'ERIC QUI S'APPLIQUENT ICI

| | |
|---|---|
| **`Destiny` RESTE** sur la fiche | et porte son `chosen` quand il y en a un : **Elf** `Splinter of Anon` (+2) · **Halfling** `Outlasting` · **Human** `Twice-Born` |
| forme du croquis A | `Destiny — Base 2 · halfling chosen: advantage on Chaos rolls` |
| 🔴 **`Destiny — Base 4` de l'Elfe est FAUX** | la base est **2** ; `Splinter of Anon` porte son +2 **séparément**, comme trait signature *(Eric, 2026-08-17)* |
| **`Resourceful` dégage** du Humain | remplacé par `Educated` — ⚠️ voir la réserve §5 |
| images | **celles déjà en ligne**, sans recadrage |
| **The Mole People** | Darkvision **120 ft** + **Meticulous** *(avantage aux jets d'Investigation)* + **1 pt (½ maîtrise) en tinker's tools** |

## 5. ⏳ LA RÉSERVE OUVERTE — le cumul de dons de compétence

🔴 **Mesuré le 2026-08-17, non corrigé, en attente d'Eric.** L'Humain ET
l'Araag portent **deux dons de compétence libres** en même temps :

| | |
|---|---|
| **Humain** | `Skillful` (`granted_skill_choice`, une maîtrise pleine) **+** `Educated` (+2 pts) |
| **Araag** | le même `Skillful`, hérité de l'Humain **+** `Fast Learner` (+2 aux niveaux 1/3/6) |

Eric l'a vu sur le site (*« je vois skillful + fast learner »*) et tranché
*« Fast Learner qui recouvre tout »*.

⛔ **LE RETRAIT A ÉTÉ FAIT, MESURÉ, PUIS ANNULÉ.** Motif : il coûte aux deux
espèces leur **2ᵉ palier de choix d'espèce**, et l'Araag est le **seul**
exemple de l'état « choix imposé » de `species-step.mjs`. Retirer un écran du
parcours est une décision de **produit**, que la charte d'autonomie exclut.

📏 **Et les deux lectures ne donnent pas le même total** — contre le garde
« LIGNE ROUGE : Human et Araag 12 » :

- retirer `Educated`, garder la maîtrise → **10**. La maîtrise est NET-ZÉRO
  (elle ajoute 2 et les dépense), elle ne remplace pas les +2. **Casse la ligne rouge.**
- convertir `Skillful` en +2 points libres et retirer `granted_skill_choice` →
  **12**, ligne rouge tenue, phrase d'Eric tenue au chiffre près. **Mais c'est
  celle qui supprime les paliers.**

**La seconde est la bonne réponse mécanique.** Elle demande une phrase d'Eric
sur ce que devient le palier.

🔴 **C'est GARDÉ en attendant** : `tests/fh-species.test.mjs` porte un garde de
caractérisation qui liste les **deux** cumuls à l'unité près — il vire au rouge
si un troisième apparaît, ET le jour où ces deux-là sont réparés.
