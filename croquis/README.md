# Croquis d'Eric — la source de vérité du dessin

> ***« Un bon dessin vaut mieux qu'un long discours. »*** — Eric, 2026-08-15
>
> Deux fois dans la même journée, un croquis d'Eric a **corrigé une lecture
> écrite** que trois échanges de texte n'avaient pas redressée. Ils ne sont pas
> illustratifs : **ils font foi**.

## Convention

`AAAA-MM-JJ-<écran>-<sujet>.<ext>` — la date d'abord, elle donne l'ordre.
⛔ Pas de statut dans le nom *(règle 3 de la nomenclature)* : ce fichier-ci dit
ce qui est ratifié.
📌 **Eric dessine sur iPad et exporte en JPEG** — l'extension suit le fichier
réel, elle ne se force pas en `.png`.

## Les croquis

### Les trois planches de **DESTINY** ✅ *dessinées le 2026-08-30, rangées le 2026-09-02*

| fichier | ce qu'il dessine |
|---|---|
| `2026-08-30-destiny-planche-generale.jpg` | la vue d'ensemble : le **R**, puis **B.1** et **B2** côte à côte |
| `2026-08-30-destiny-B1-ceremonie.jpg` | **B.1** en détail — les trois **FS** du tirage, puis l'écran final |
| `2026-08-30-destiny-B2-catalogue-et-final.jpg` | **B2** en détail — ⓐ le catalogue des 22, ⓑ l'écran final |

⚠️ **ELLES ONT VÉCU DEUX JOURS DANS LE DROP** pendant que les lots 109, 116 et
121 travaillaient dessus de mémoire. Le code les citait déjà (*« planches B.1 et
B2 »*) sans qu'aucune ne soit sur le disque : une planche qu'on cite sans
pouvoir la rouvrir n'est plus une source, c'est un souvenir.

🔴 **CE QU'ELLES RATIFIENT**

| | |
|---|---|
| **le R** | un **FF** : une explication d'ambiance, et deux portes au pied — `DRAW` → B.1 · `CHOOSE` → B2 |
| **les trois séquences** | **FS**, fond noir · ① frappe caractère par caractère, 3 s · ② mélange 3 s puis grossissement 2 s, de 50 % à 100 % · ③ dos seul zoom max, **aucun texte** ; le tap retourne, 3 s, puis dézoom à 50 % |
| **l'écran final** | **FF**, le **voyant vert** au milieu du bord haut, et le pied `I changed my mind` / `Next` — annotés par Eric **« RETOUR VERS R »** et **« FIN »** |
| **la fiche du catalogue** | elle porte son propre **`CHOOSE`** |

⚖️ **UN POINT OÙ LA DICTÉE CORRIGE LE DESSIN, ET C'EST DÉJÀ CÂBLÉ** : la planche
B2 écrit **FS** au-dessus du catalogue, mais Eric a dit le même jour *« c'est F
pas FS, il y a un scrollspy avec les cartes de tarot »*. Le rail est d'ailleurs
dessiné **hors** du cadre sur la planche. C'est **F**, et `destiny-step.mjs` le
note déjà.

🔴 **ET UN POINT OÙ LE CODE S'ÉCARTE DU DESSIN, OUVERT** — les **trois** planches
dessinent l'écran final en **DEUX COLONNES**, `TAROT` à gauche et `TEXTE
EXPLICATIF` à droite. Le **lot 116** l'a ramené à **une seule colonne**, la carte
au-dessus et le texte dessous, sur une mesure : à 375 blg de panneau, la colonne
de texte tombait à **~40 blg** — un mot par ligne, avec une barre de défilement
horizontale. **Un croquis d'Eric prime sur le texte**, donc l'écart est une dette
et non une correction ; Eric l'a lui-même mise en attente — *« on y reviendra de
manière spécifique »*. ⏳ **Rien d'autre du dessin de cet écran n'est ratifié.**

### `2026-08-26-gabarit-ecran-trois-bandes.jpg` ✅ *déposé le 2026-08-26*

**Le gabarit d'un écran, vu de dessus.** Trois bandes, et ses annotations à lui :

```
        ┌──────────── TITRE ────────────┐
        │  ╔═════════════════════════╗  │
        │  ║                         ║  │   ← « NE BOUGE PAS
        │  ║      ZONE DE SCROLL     ║  │       BORD INVISIBLE »
        │  ║                         ║  │
        │  ╚═════════════════════════╝  │
        │  📖   [ btn ]  [ btn ]     ❓  │   ← « BOUTONS CENTRÉS »
        └───────────────────────────────┘
```

🔴 **CE QU'IL RATIFIE**

| la bande | ce qu'elle fait |
|---|---|
| **le TITRE** | en haut, **fixe** |
| **la ZONE DE SCROLL** | 🔴 **elle NE BOUGE PAS** — son cadre est immobile, le contenu défile DEDANS. Et son **bord est invisible** |
| **la bande basse** | **fixe** : 📖 à gauche · les boutons **centrés** · ❓ à droite |

⭐ **Les deux petits organes ne se centrent pas** *(Eric, le même jour)* : *« deux petits organes à
gauche et à droite, prenant peu de place dans la rangée des boutons, **ils ne se centrent pas** »*.
La rangée réserve leur colonne des deux côtés ; les boutons se centrent sur ce qui reste.

⚖️ **SA PORTÉE, ET ELLE EST BORNÉE PAR SES MOTS** : *« **s'il y a une zone de scroll**. Si on n'est
pas déjà dans le guide ou dans les règles bien sûr. »*

| ✅ le gabarit s'applique | ⛔ il ne s'applique pas |
|---|---|
| un écran du parcours qui a **une zone de scroll** | **le guide** |
| | **les règles** |

➡️ **C'est un DÉFAUT, pas un mur** — la loi du dépôt depuis le 26/08. Un écran sans zone de scroll
n'a rien à en faire.

🔴 **CE QU'IL CORRIGE, ET C'EST MESURÉ** — relevé sur `main` à 360 px, le 2026-08-26 :

| l'écran | le titre | la zone de scroll | la bande basse |
|---|---|---|---|
| **Species** *(bilan)* | ✅ `guide-titre` | ✅ `parcours-resume` | ✅ `parcours-pied` |
| **Class** | ✅ | ✅ | ✅ |
| **Abilities** | ✅ | ⛔ aucune | ⛔ **aucune** |
| **Skills** | ⛔ **aucun** | ⛔ **aucune** | ⛔ **aucune** |

⭐⭐ **ET ÇA EXPLIQUE LE DÉFAUT QU'ERIC A VU LE MATIN MÊME** — *« les boutons cachent le texte »*.
📏 Sur Skills : la carte fait **471 px** de haut, son contenu **4 357** — il déborde de **3 886 px**,
et **rien ne défile à l'intérieur**. C'est le champ ENTIER qui défile, boutons compris. `Done` se
retrouve donc posé sur une ligne de compétence, parce qu'il est **dans le flux** au lieu d'être dans
une bande fixe.
➡️ **Le croquis n'est pas une préférence de dessin : c'est le remède d'un défaut mesuré.**

⏳ **Deux écrans à mettre au gabarit** — Abilities et Skills. ⛔ Species et Class l'ont déjà.


### `2026-08-15-species-lore-choose.jpg` ✅ *déposé le 2026-08-15*

**Species, vu de dessus.** Ce qu'il a tranché, et que le texte avait manqué :

- 🔴 **`II.1` TIENT** — le rail reste à gauche (tuiles transparentes), et
  **c'est toujours le défilement qui choisit**. Sa note : *« scrolling to
  another species **negates** this screen »*. ⛔ L'architecte avait lu
  « le titre devient la porte » : **faux**, le dessin l'a corrigé.
- La fiche par zones : **quart haut-gauche** l'identité · **quart haut-droit**
  l'image · **moitié basse** les traits · **tout en bas** `lore` et `choose`.
- **`lore`** → pleine page qui **recouvre tout**, un `X` pour sortir.
- **`choose`** → **ne recouvre que la grosse dalle**, `Done` en bas.

#### ⭐ Ce que le dessin porte EN PLUS de sa transcription — lu le 2026-08-15

| | Ce que le croquis montre | Ce que le texte disait |
|---|---|---|
| **`Destiny` est un TRAIT** | dernière ligne de la liste des traits : `Destiny — Base 2 · halfling chosen: advantage on Chaos rolls` | §3c le rangeait dans le bloc d'identité, sur sa propre ligne |
| **Un trait peut porter un LIEN** | `Chaos rolls` est un renvoi coloré **dans** la phrase du trait | aucun renvoi n'était prévu — c'est un organe de plus |
| **`Lineages` porte sa règle de masquage** | `Lineages : (do not display if none)`, écrit dans le dessin | « masqués s'il n'y en a pas », même règle, mais elle vient bien de lui |
| **Le rail porte des NOMS** | `elf` `orc` `human` `halfling` `dwarf`, l'actif en parchemin | « voire des icônes » *(B2.1a)* restait ouvert |
| **La forme d'un trait** | `nom — effet`, **une ligne courte**, réécrite : *« Brave — advantage on saves against being Frightened »* | « un résumé du SRD ou de FH » sans exemple |

⚠️ **Le dessin écrit `Finish` sous l'écran de choix.** Les arbitrages de fin de
séance disent **`Done`** *(§6, « partout où un écran de choix se referme »)*, et
ils sont **postérieurs** au croquis. **`Done` l'emporte** — noté ici pour que
personne ne « corrige » le mot d'après le dessin.

### `2026-08-15-abilities-roll-drag-drop.jpg` ✅ *déposé le 2026-08-15*

**Abilities / `Roll dice`.** Quatre dalles, **avec leurs opacités dictées** :
50 % (explication) · **opaque** (le plateau de dés 3D) · 50 % (les six gardés)
· 50 % (les six caractéristiques, cases vides).

- 🔴 **`DRAG AND DROP`**, flèche à double sens, entre les gardés et les
  caractéristiques. **Ce n'est pas un barillet** — un dé est un **objet qu'on
  déplace**, pas une valeur qu'on saisit. C'est ce croquis qui a ajouté le
  cinquième organe à notre vocabulaire.
- Les **dix résultats numérotés**, dont **quatre barrés** (les écartés), et la
  provenance sous chaque gardé (`5+5+6`).

#### 🔴 CE QUE LE DESSIN TRANCHE, ET QUE LE TEXTE AVAIT LAISSÉ OUVERT

**Il y a TROIS dés sur le plateau, pas trente.** Le croquis montre trois cubes
(`3`, `4`, `2`) sous le libellé *« dice roll 10 »* : **le même 3d6 est relancé
dix fois**, et chaque total tombe dans sa case numérotée en dessous.

⭐ **Ça dissout la contradiction avec `B5.3c`** *(« tout d'un coup → PAS de
dés »)* et ça dissout aussi le plafond de ~16 contextes WebGL : **trois
contextes, réutilisés**. La « vague » du moteur de `fh-phb` n'a pas d'emploi
ici. Ce qui reste à trancher n'est plus *« avec ou sans dés »* mais **combien
de temps dure `ROLL 10`** — dix fois 960 ms font 9,6 s.

| | Ce que le dessin montre |
|---|---|
| **Dalle 2, disposition** | `ROLL` et `ROLL 10` **empilés à gauche** · les dés **au centre** · `CLEAR` **en haut à droite** · les dix résultats **sur une ligne dessous** |
| **Dalle 2, opacité** | écrit à la main : **`NO TRANSPARENCY`** — c'est une dalle **majeure** *(B0.23)*, les trois autres sont à 50 % |
| **L'ordre des six gardés** | **décroissant par valeur** — `16 14 13 12 12 12`, et **non** par numéro d'origine (`③②⑧①④⑨`) |
| **Le numéro d'origine survit** | il est **entouré au-dessus** de chaque gardé — c'est l'`index` de `B5.6`, rendu visible au joueur |
| **La provenance** | `5+5+6` **sous** la case, en petit |
| **Le glisser-déposer** | flèche **à double sens** — on repose donc une valeur de la carac vers la dalle 3 |
| **La sortie** | `BACK TO ROLL CHOICES`, **en haut à gauche de la dalle 1** |

📌 **Le dessin est cohérent avec lui-même** : les quatre barrés (`⑤10 ⑥3 ⑦7
⑩8`) sont exactement les quatre plus bas des dix. Vérifié.

## Où est le texte

Leur transcription complète et les décisions qu'ils portent vivent dans
[`../REFONTE-2-VALIDATION-DANS-LES-DOCUMENTS.md`](../REFONTE-2-VALIDATION-DANS-LES-DOCUMENTS.md),
§3bis. **Ce dossier garde l'original ; le doc garde ce qu'on en a compris.**

## Comment déposer

Eric pose les fichiers dans `~/Desktop/Claude Drop/` — son inbox habituelle —
et le fil suivant les range ici **et** dans le vault
(`FH-WEB/FHPC/Croquis/`), en JPEG léger si le PNG dépasse quelques centaines
de Ko *(le vault se synchronise sur iPad)*.
