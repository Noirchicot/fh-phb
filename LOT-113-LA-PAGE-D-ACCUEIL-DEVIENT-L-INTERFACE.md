# LOT 113 — LA PAGE D'ACCUEIL DEVIENT L'INTERFACE

> Eric, 2026-08-31, la nuit où tout s'est simplifié :
>
> *« On oublie le display du builder dans le site = usine à gaz. »*
> *« Page d'accueil FH WEB devient l'interface. »*
> *« Donc ceci est la nouvelle homepage FH : grande image, quelques boutons, et
> un highlight si y'a besoin. »*
> *« Laisse à FH WEB son jour/nuit natif, ce sera beaucoup moins de travail. »*

---

## 1. Ce que c'est

La page d'accueil du site cesse d'être une page qu'on traverse pour aller à un
chapitre. Elle devient **l'endroit d'où tout part et où l'on revient**.

```
┌──────────────────────────────────────────────┐
│                                              │
│              la GRANDE IMAGE                 │   le hero, tel qu'il est
│         FATE'S HAND — PLAYER'S HANDBOOK      │
│                                              │
├──────────────────────────────────────────────┤
│  le pitch, la bande « what makes FH different »│
├──────────────────────────────────────────────┤
│                                              │
│  Create a character  ·  Fate's Hand PHB  ·  The lore of the world   │
│  Your characters     ·  SRD rules        ·  The DM's table          │
│                                              │
│  [ Finish building your character ]  ← allumé SI il y a de quoi finir │
└──────────────────────────────────────────────┘
```

**Grande image, quelques boutons, un highlight si besoin.** Rien d'autre. Ce
n'est pas un panneau de réglages, c'est une porte.

⛔ **Pas d'explication de ce qui va s'ouvrir.** *« On va ouvrir un widget »* est
une phrase technique ; personne n'a envie de la lire. On clique, ça s'ouvre, on
le découvre.

---

## 2. Les portes, et elles ne sont pas du même métier

| porte | où elle mène | statut |
|---|---|---|
| **Create a character** | le builder, en widget | ⚠️ le bouton doré existe déjà mais pointe vers l'**ancien créateur, obsolète** — c'est lui qu'on rebranche |
| **Finish building your character** | le même builder, sur le travail en cours | 🆕 **temporaire** — voir §3 |
| **Fate's Hand PHB** | le livre | lien de page |
| **The lore of the world** | le lore | lien de page |
| **SRD rules** | le SRD | lien de page |
| **The DM's table** | la table du MJ | lien de page |
| **Your characters** | la liste des persos déjà créés | ⏳ **travail futur** : remettre la character sheet v1 en ligne |

🔴 **UN SEUL de ces boutons ouvre une fenêtre.** Les cinq autres restent dans
l'onglet. Il faut le savoir avant de dessiner la rangée, sinon on se retrouve
avec six comportements différents sur une même ligne.

---

## 3. Le bouton temporaire, et le danger qu'il révèle

> Eric : *« j'ai enregistré l'URL de mon perso en cours de création, ça
> m'emmène ici, avec un gros highlight pour éviter de me disperser. Sinon je
> pourrais aussi cliquer directement sur "create character", mais je risque
> d'écraser le travail en cours. »*

### 🔴 LE DANGER EST RÉEL, ET C'EST LE COMPORTEMENT ACTUEL

Le builder n'a **qu'une seule place**. Son Menu le dit mot pour mot : *« This
character — kept in this browser as you go »*. Donc aujourd'hui, « Create a
character » **écraserait** un travail en cours. Ce n'est pas une hypothèse.

| | |
|---|---|
| **la garde, tout de suite** | « Create » **demande avant d'effacer**, quand il y a quelque chose à perdre. Rien de plus. C'est elle qui rend le bouton temporaire sûr. |
| **la vraie réponse, plus tard** | **plusieurs places** — c'est-à-dire *Your characters*. Le jour où la liste existe, « Create » n'écrase plus rien : il ajoute. |

⭐ **Le bouton temporaire n'est donc pas un pis-aller** : il est la moitié
utilisable de *Your characters*, avec une place au lieu de N. Le remplacer sera
un élargissement, pas une réécriture.

### ⚠️ Un perso n'a PAS d'URL, et ça change ce qu'on peut promettre

Il vit dans le stockage du navigateur, pas dans l'adresse. Le favori d'Eric ne
peut donc pas dire *« reprends CE perso »* — seulement *« reprends ce qui est
ici »*. Concrètement : l'accueil avec un marqueur (`?resume` ou équivalent), qui
arrive avec le bouton allumé.

⛔ Ça ne suit pas d'un appareil à l'autre, et ce n'est pas un oubli : c'est le
prix du « tout reste chez toi ». Un export ou un compte serait une autre
conversation, et elle n'est pas ouverte.

---

## 4. Le builder s'ouvre en fenêtre — et le web décide de sa forme

| support | ce que `window.open(url, nom, "width=…,height=…")` donne |
|---|---|
| **bureau** (Chrome, Firefox, Edge, Safari macOS) | une vraie fenêtre à nos dimensions, sans onglets — **le widget** |
| **iPadOS · iOS · Android** | la chaîne est **ignorée** : un onglet plein écran |

⭐ **L'accueil ne propose donc pas un choix.** Un seul bouton, *ouvrir le
builder* ; c'est la plateforme qui décide de la forme. Et l'onglet plein écran
n'est pas une dégradation : c'est le rendu qu'Eric a validé le 31/08 au matin.

**La dimension du widget se calcule, elle ne s'invente pas** — même loi que le
panneau (ratio 375 : 560 = 0,670) :

```
hauteur = screen.availHeight − le chrome du navigateur
largeur = hauteur × 0,670
```

| écran | fenêtre widget | échelle |
|---|---|---|
| 1920 × 1080 | 643 × 960 | 1,71 |
| 2560 × 1440 | 871 × 1300 | 2,32 |
| MacBook 1440 × 900 | 522 × 780 | 1,39 |

⚠️ **`window.open` exige un VRAI geste du joueur.** Au chargement, sur un
`resize` ou dans un `setTimeout`, il est bloqué en silence. Ce sera donc toujours
un bouton — ce qui tombe bien, c'en est un.
⛔ Ne pas confondre avec `window.resizeTo`, refusé partout : on ouvre une
fenêtre, on ne dimensionne jamais celle du joueur. *(Sur la fenêtre qu'on a
ouverte soi-même, en revanche, `resizeTo` est permis — de quoi la rouvrir un
jour à la taille où le joueur l'avait laissée.)*

⭐ **Et elle est librement redimensionnable** : c'est une fenêtre du système, on
tire son bord. Le lot 112 fait suivre le builder en continu sans casser sa
proportion, et le lot 114 fait que la marge qui apparaît est le décor et non un
aplat noir. Sans le 114, un widget redimensionnable aurait été moche une fois
sur deux.

---

## 5. Les deux portes du builder, et chacune sa raison

- **l'accueil** — l'entrée normale, celle qu'on donne aux joueurs ;
- **`fhpc/ui/builder/`** — la sortie technique : les essais, les liens directs,
  et **c'est elle que le widget ouvre**.

⛔ Ce n'est pas un doublon : l'une est une porte d'entrée, l'autre est la pièce.

---

## 6. Le thème : chacun le sien, et c'est décidé

> Eric : *« laisse à FH WEB son jour/nuit natif, ce sera beaucoup moins de
> travail. »*

Le site garde ses palettes MkDocs (`slate` / `default`) et son bouton. Le builder
garde le sien. **Personne n'impose rien à personne, il n'y a rien à
synchroniser.** C'est le plus gros allègement de la soirée.

---

## 7. À TRANCHER — il n'en reste qu'une

**Que garde l'accueil du cadre du site ?** MkDocs lui met par défaut une barre du
haut (titre, recherche, bascule jour/nuit) et une navigation latérale. Sur une
page qui EST l'interface, la nav latérale n'a plus d'objet — les portes sont dans
la page. La barre du haut se discute : utile partout ailleurs, elle fait doublon
avec le hero ici.

Trois possibilités : tout garder · garder la barre et retirer la nav · un accueil
nu (image, portes, rien).

📌 Mécaniquement c'est simple : `fh-phb` a déjà `custom_dir: overrides`, une page
à son propre gabarit ne demande aucune machinerie neuve. Et `docs/builder.md`
(aujourd'hui une redirection instantanée) devient sans objet — personne ne tape
l'adresse du builder, on va à la maison et on choisit.

---

## 8. ⛔ CE QUI EST ABANDONNÉ — daté, pour que personne ne le reconstruise

**Le côte-à-côte site + builder.** Une première spec de ce lot, écrite le
2026-08-31 au soir (commits `7c31925` → `f914cc2`), décrivait le site et le
builder partageant l'écran : fond commun, dalle voile à gauche, thème imposé au
cadre, loi du partage `min(hauteur/560, (largeur − PLANCHER_SITE)/375)`, question
`blg`-contre-`px`. Eric l'a écartée le soir même : ***« usine à gaz »***.

⭐ **Ce qui en survit, et qui reste vrai** — les mesures, pas l'architecture :

| fait mesuré | valeur |
|---|---|
| site et builder sur la **même origine** | `noirchicot.github.io` |
| le site est **encadrable** | ni `X-Frame-Options` ni CSP `frame-ancestors` |
| le site est du **MkDocs Material** | `slate`/`default`, `custom_dir: overrides`, 3 feuilles de surcharge |
| **corps du texte du site** | 17 px (interligne 26,35 · `h2` 27) |
| **colonne de lecture** | 930 px à 1400 · 671 à 960 · 668 à 700 · 448 à 480 |
| **le sommaire** | 242 px de large, et il **disparaît sous 960** |
| le site ne déborde jamais | jusqu'à 480 au moins |
| le builder connaît déjà l'adresse du livre | `FH_WEB`, `fhpc/ui/builder/liens-fh.mjs:19` |

🔴 **Et l'écart typographique qui a tué l'idée** : le builder écrit en **blg**
(`--t4` = 16 blg), le site en **px** (17 px). Côte à côte sur un 1366 × 1024, le
livre serait écrit 1,7 fois plus petit que le builder — et l'écart grandit avec
la hauteur de l'écran (41 px contre 17 sur un 1440 de haut). Les faire s'accorder
demandait de coter TOUT le site en blg. C'est très exactement l'usine à gaz.

⛔ **Le dock v1** (`stylesheets/companion-dock.css`) reste hors de tout ça —
Eric : *« le dock V1 c'est pour plus tard »*.
⏳ **`--stage-amorce`** (l'amorce de la fiche) est devenue inatteignable depuis
que `data-grandeur` ne rend plus que `etroite` (lot 112). À retirer ou à
replacer : décision d'Eric, hors de ce lot.

---

## 9. Le croquis fait foi

Le dessin d'Eric du 2026-08-31 — hero, deux rangées de trois portes, et
`TEMP BUTTON → FINISH YOUR CHARACTER` — **prime sur ce texte**. Il est arrivé en
conversation et **n'est pas encore sur le disque** : à ranger dans
`fh-phb/croquis/` et `FH-WEB/FHPC/Croquis/` dès qu'Eric le dépose.
