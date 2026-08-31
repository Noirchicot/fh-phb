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

## 7. DEUX PAGES, ET C'EST LE CROQUIS 2 QUI LE DIT

Eric, 2026-08-31, en déposant ses deux dessins :
*« mon croquis 1 = home page (doit être présent dans MkDocs) · mon croquis 2 =
une autre page avec les règles. »*

L'accueil **s'allège** : il garde le hero, le pitch, la bande « what makes Fate's
Hand different » et les portes. Toute la **Rules Reference** — la grille de
quatre cartes *Build a Character · At the Table · Magic & Soulforging · World*,
qui vit aujourd'hui sur l'accueil — **part sur sa propre page**.

| page | ce qu'elle porte |
|---|---|
| **l'accueil** (croquis 1) | hero · pitch · la bande du 5+ layer · six portes · le highlight |
| **la page des règles** (croquis 2) | la grille de quatre cartes, le bloc « the base layer » et le bouton SRD 5.2.1 |

⭐ **Et ça répond mécaniquement à la question du cadre MkDocs** : une page qui
n'est plus qu'une porte n'a pas besoin de navigation latérale — les portes sont
DANS la page. La page des règles, elle, est une page du livre comme une autre et
garde tout son cadre.
### 🔴 LA BARRE DU HAUT EST GARDÉE — et il faut la RÉTABLIR, pas la conserver

Eric, 2026-08-31 : *« oui garde la barre. Tout le long. Dégage les doublons, ne
fais pas sauter le bandeau pour autant. »*

📏 **MESURÉ SUR L'ACCUEIL DÉPLOYÉ, et ça renverse l'hypothèse de départ** :
la barre n'y est pas. Elle est *masquée*, pas absente du gabarit :

| organe | hauteur rendue sur l'accueil |
|---|---|
| `.md-header` (la barre du haut) | **0** |
| `.md-logo` | **0** |
| `.md-sidebar--primary` (la nav) | **0** |
| `.md-sidebar--secondary` (le sommaire) | **0** |
| `.md-typeset h1` | **1** — présent pour l'ancre, invisible à l'œil |
| le hero | 284 |

⭐ La décision d'Eric ne conserve donc rien : elle **rétablit** la barre sur
l'accueil, où elle avait été supprimée. Sur les autres pages elle est déjà là —
« tout le long » veut dire *y compris ici*.

**Le doublon à traiter, une fois la barre revenue** : le titre s'affiche alors
DEUX fois — en texte dans la barre, et dans l'image du hero. Eric a tranché le
sens de la réduction : *« ne fais pas sauter le bandeau pour autant »* — donc le
bandeau reste, et c'est du côté de la barre que ça se règle.
⛔ La nav latérale et le sommaire, eux, restent masqués sur l'accueil : les
portes sont dans la page (voir juste au-dessus).

### 🟡 LE JETON « FH » CHANGE DE MÉTIER — il devient le RETOUR À L'ACCUEIL, dans la barre

Eric, 2026-08-31, en trois temps : *« plus besoin du jeton jaune, il sera dans la
barre »*, *« il dégage »*, puis la forme définitive : **« il devient le retour
vers home, et il est dans la barre. »**

📏 **Ce qu'il est AUJOURD'HUI, mesuré avant d'y toucher** :

| | |
|---|---|
| ce que c'est | `button.fh-cd-seal-fab`, 46 × 46, flottant en bas à droite, texte « FH » |
| ce qu'il fait | `data-dock-open` — **il ouvre le Player Companion**, le dock v1 |
| qui le fabrique | `docs/javascripts/fh-player-sheet.js:4985` |
| qui l'habille | `docs/stylesheets/companion-dock.css:98` |

⭐ **Ce n'est donc ni un déplacement ni une suppression : c'est un CHANGEMENT DE
MÉTIER.** Le sceau garde son identité — le rond doré « FH » — et perd sa
fonction. Il quitte le coin flottant, entre dans la barre, et n'ouvre plus le
dock : **il ramène à la maison**.

📌 Mécaniquement, c'est le logo de MkDocs Material qu'il devient : dans ce thème,
le logo de la barre EST le lien vers l'accueil. Il n'y a donc pas d'organe neuf à
inventer — un habillage à reprendre et un `data-dock-open` à retirer.

🔴 **ET LA PORTE DU COMPANION RESTE À POSER.** Le jeton était sa seule entrée
visible. Lui donner un autre métier la referme : sans une entrée ailleurs, le
dock devient **injoignable**. Ce n'est pas un détail à régler en passant — c'est
une porte perdue en silence, et c'est exactement la famille de défaut que ce
mandat passe ses nuits à débusquer.
⛔ Ça ne rouvre pas le dock v1 pour autant — Eric : *« le dock V1, c'est pour
plus tard »*. On constate que sa poignée disparaît, on le DIT, et on laisse Eric
décider où elle repousse.

### 🚪 LES DEUX PORTES ACTUELLES SE RANGENT DERRIÈRE « THE DM'S TABLE »

📏 **Mesuré sur l'accueil déployé** : il porte **trois** boutons aujourd'hui —
*Create a character · Open Player Companion · The Dungeon Masters' Secrets* — là
où le croquis 1 en dessine **six**. Ce n'est donc pas un ajustement de la rangée,
c'est sa refonte : deux des trois actuels ne figurent nulle part au dessin.

Eric, 2026-08-31 : *« oui, mets-les dans DM's Table. »*

| bouton actuel | devient |
|---|---|
| **Create a character** | garde sa place au croquis — c'est la porte du builder |
| **Open Player Companion** | passe derrière **The DM's table** |
| **The Dungeon Masters' Secrets** | passe derrière **The DM's table** |

⭐ **ET ÇA REFERME LA PORTE QUE LE JETON EMPORTAIT.** Le sceau « FH » cessant
d'ouvrir le dock (voir juste au-dessus), le Companion se retrouvait sans entrée
visible. *The DM's table* lui en redonne une. Les deux décisions se répondent, et
c'est heureux — mais elles doivent être tenues ENSEMBLE : retirer le
`data-dock-open` sans que *The DM's table* existe déjà, c'est perdre le Companion
entre deux lots.

⚠️ **Une chose à relire à tête reposée** : *Player Companion* est un outil de
JOUEUR — la fiche, l'inventaire, le Soulforge. Le ranger derrière une porte
appelée *The DM's table* est la décision d'Eric et elle est notée telle quelle ;
elle mérite juste un second regard le jour où *Your characters* existera, parce
que c'est peut-être là qu'il vit vraiment.

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

## 9. Les croquis font foi

Les deux dessins d'Eric du 2026-08-31 **priment sur ce texte**. Ils sont rangés,
au dépôt et au vault, sous la même empreinte :

| croquis | fichier | ce qu'il fixe |
|---|---|---|
| **1** | `croquis/2026-08-31-home-page-portes.jpg` | l'accueil : hero, six portes, le bouton temporaire |
| **2** | `croquis/2026-08-31-page-rules-reference.jpg` | la seconde page : la Rules Reference sort de l'accueil |

*(mêmes fichiers dans `FH-WEB/FHPC/Croquis/` du vault — vérifié par empreinte
SHA-256, pas par ressemblance de nom.)*
