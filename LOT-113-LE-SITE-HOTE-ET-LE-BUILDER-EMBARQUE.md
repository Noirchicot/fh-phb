# LOT 113 — LE SITE HÔTE, ET LE BUILDER EMBARQUÉ

> Eric, 2026-08-31 :
> *« Même lorsque le site n'affiche pas le builder, il a les mêmes règles de
> couleurs. Le background du builder sera le fond commun du site et du builder.
> À gauche le site FH WEB flotte sur une dalle 100 % voile scrollable. À droite
> le builder sur ses propres dalles. Versions jour et nuit idem sur FH web et
> builder. »*
>
> Puis, sur la question de la source unique du thème :
> *« C'est LE SITE qui possède le thème et qui décide. Après, toujours possible
> de transformer le builder en widget et de lui faire quitter le site — dans ce
> cas il aura son autonomie jour/nuit. »*

---

## 1. Ce que le lot pose

```
┌──────────────── UN SEUL FOND, commun au site et au builder ────────────────┐
│                                        │                                   │
│  FH WEB                                │  BUILDER                          │
│  flotte sur UNE dalle, voile 100 %     │  sur SES PROPRES dalles           │
│  scrollable                            │  panneau 375 × 560 blg,           │
│                                        │  ratio 0,670 — la règle sacrée    │
│                                        │                                   │
└────────────────────────────────────────┴───────────────────────────────────┘
        jour / nuit : UNE seule bascule, et c'est le SITE qui la tient
```

🔴 **Le renversement du lot, et il faut le dire en tête** : l'hôte est **le
site**, pas le builder. Toute la nuit du 30 au 31/08 a traité le builder comme
la page ; il devient un invité. C'est la conséquence directe du 112 — depuis que
le panneau ne s'élargit plus (375 × 560 blg, quoi qu'il arrive), la place qui
reste à côté de lui n'est plus un vide accidentel, c'est **une surface**. Eric :
*« on remplit des vides autour pour que ça passe »*.

---

## 1 bis. LA LOI DU PARTAGE — la hauteur décide, la largeur suit

> Eric, 2026-08-31 : *« lorsqu'il est invoqué, le builder prend toute la place
> qu'il peut EN HAUTEUR, au détriment du site FH web. »*

⭐ **C'est une loi, pas un réglage, et elle est plus simple que tout ce qu'on
aurait pu inventer.** Le panneau a un ratio sacré (375 × 560, soit 0,670) ; dès
qu'on lui donne une hauteur, sa largeur n'est plus négociable — elle se déduit.
La règle d'Eric dit donc : **on lui donne TOUTE la hauteur, et le site paie la
largeur qui en résulte.**

```
échelle du builder  =  hauteur de la fenêtre ÷ 560        ← la HAUTEUR seule
largeur du builder  =  échelle × 375                       ← elle SUIT
largeur du site     =  ce qui reste                        ← il PAIE
```

📏 Ce que ça donne, en pixels, sur les fenêtres réelles :

| fenêtre | échelle | builder | site |
|---|---|---|---|
| 1366 × 1024 | 1,829 | **686** | 680 |
| 2560 × 1024 | 1,829 | **686** | 1 874 |
| 1366 × 700 | 1,250 | **469** | 897 |
| 1920 × 1440 | 2,571 | **964** | 956 |

⚠️ **CONSÉQUENCE À CONNAÎTRE, ET ELLE SURPREND** : le builder grandit avec la
HAUTEUR de la fenêtre, jamais avec sa largeur. Élargir l'écran ne lui donne rien
— tout va au site. Le rendre plus haut le fait grossir, et c'est le site qui
recule. C'est exactement ce qu'Eric demande, et c'est la suite directe de la
règle sacrée du lot 112 : *un ratio verrouillé n'a qu'un seul degré de liberté.*

⛔ **Et c'est là que les six paliers d'Eric prendront leur métier** :
`mini · mobile · small · medium · large · extra` ne diront pas une taille, ils
diront **de combien le builder renonce à cette hauteur** pour rendre de la
largeur au site. `extra` = la loi ci-dessus, sans concession. Les seuils
viendront dans leur lot, en regardant.

---

## 1 ter. LE PLANCHER DU SITE — et « ça doit marcher sur tous les supports »

> Eric, 2026-08-31 : *« dans le cas où la page ne peut plus afficher, le builder
> se réduit suffisamment pour qu'elle y parvienne »*, puis *« il faut que ça
> marche sur tous les supports »*.

La loi §1 bis devient donc **bornée par le bas** :

```
échelle  =  min( hauteur ÷ 560 ,  (largeur − PLANCHER_SITE) ÷ 375 )
```

Le builder prend toute la hauteur — **sauf** si la largeur qui en découle ne
laisse plus au site de quoi s'afficher. Alors c'est lui qui recule.

### Ce que le site réclame — MESURÉ sur `fh-phb/chapters/identity/`

| fenêtre | colonne de lecture (`.md-typeset`) | sommaire |
|---|---|---|
| 1400 | 930 | 242 |
| **960** | 671 | **242 — dernier palier avec sommaire** |
| **700** | 668 | **0 — le sommaire disparaît** |
| 480 | 448 | 0 |

⭐ Le site ne déborde JAMAIS horizontalement, jusqu'à 480 au moins : il rétrécit
proprement. « Ne peut plus afficher » n'est donc pas une panne technique — c'est
un jugement de LISIBILITÉ, et il appartient à Eric. Trois candidats, tous
mesurés, aucun inventé :

| `PLANCHER_SITE` | ce que le site garde | la fenêtre qu'il faut pour DEUX colonnes |
|---|---|---|
| **960** | tout, sommaire compris | ≥ 1 335 px |
| **700** | la colonne à sa largeur naturelle (668), sans sommaire | ≥ 1 075 px |
| **480** | une colonne étroite, lisible mais serrée | ≥ 855 px |

*(la troisième colonne = `PLANCHER_SITE + 375`, le builder à son échelle 1)*

### ⛔ Et en dessous, il n'y a plus deux colonnes — c'est là que « tous les supports » mord

Sous ce seuil, la page ne peut porter qu'**une** surface. Aucune arithmétique ne
sauve un téléphone : 375 de builder + 480 de site font 855, et aucun téléphone ne
les a. Le mode à UNE colonne n'est donc pas une dégradation qu'on tolère, c'est
un **mode à part entière**, et il doit être dessiné :

- laquelle des deux s'affiche par défaut ?
- par quel geste passe-t-on à l'autre ?
- ce geste est-il le même que celui qui « invoque » le builder sur grand écran ?

📌 C'est le cas le plus fréquent de tous — le téléphone est l'appareil sur lequel
Eric juge — et c'est le seul point du lot qui n'a encore aucun dessin.

## 2. Les DEUX modes, et pourquoi aucun n'est une branche morte

| mode | qui tient le thème | où il vit |
|---|---|---|
| **embarqué** — le builder dans le site | **le site**, seul et sans partage | `noirchicot.github.io/fh-phb/` |
| **autonome** — le builder seul, ou en widget hors du site | **le builder**, jour/nuit à lui | `…/fhpc/ui/builder/` |

⭐ **Les deux chemins sont parcourus, et c'est ce qui rend le mécanisme
gardable.** La loi de la maison (`NORMES` §0.6) refuse une branche que personne
n'emprunte ; ici la page autonome du builder existe déjà et sert tous les jours.
Le builder doit donc porter **un seul organe à deux entrées** : *un thème
imposé s'il en reçoit un, le sien sinon* — jamais deux implémentations.

⛔ **Ce n'est pas une négociation entre deux thèmes.** Le site décide ; le
builder embarqué obéit sans rien proposer. Un bouton jour/nuit dans le builder
embarqué serait une seconde source, donc une divergence — la faute que
`popup.mjs` nomme déjà : *« à coder UNE fois, pas trois »*.

---

## 3. Ce qui a été MESURÉ avant d'écrire ce lot

| fait | mesure |
|---|---|
| **Même origine** | `noirchicot.github.io/fh-phb/` et `…/fhpc/ui/builder/` — un seul `noirchicot.github.io`. L'hôte peut donc parler au cadre, et réciproquement. |
| **Le site est encadrable** | Aucun `X-Frame-Options`, aucune CSP `frame-ancestors` dans les en-têtes servis. Vérifié à la requête. |
| **Le site est du MkDocs Material** | `theme: material`, `custom_dir: overrides`, palettes `slate` (nuit) / `default` (jour), plus trois feuilles de surcharge d'Eric. |
| **Le builder connaît déjà l'adresse** | `FH_WEB` dans `fhpc/ui/builder/liens-fh.mjs:19`. |
| **Le fond appartient aujourd'hui au builder** | `.app { background-image: var(--bg-image) }` dans `fhpc/ui/builder/shell.css`. |

---

## 4. Ce que chaque dépôt fait

### `fh-phb` — l'hôte

1. **La page qui porte les deux.** Le fond commun s'y pose (celui du builder,
   remonté), et les deux surfaces flottent dessus.
2. **La colonne de gauche** — le contenu du site sur une dalle voile 100 %,
   qui défile pour elle seule. ⚠️ *pour elle seule* : c'est la loi de
   `keepInView` (socle du builder), et elle vaut ici pour la même raison — un
   défilement qui remonte la chaîne des ancêtres déplace la page entière.
3. **La colonne de droite** — le builder, à sa taille, sans jamais céder son
   ratio.
4. **Le thème** — le site le tient, et il l'IMPOSE au cadre. Même origine, donc
   la transmission ne demande aucun protocole : l'hôte écrit dans le document du
   cadre.
5. **Hors builder, le site garde les mêmes règles de couleur.** C'est la
   première phrase d'Eric, et elle vaut seule : les jetons de couleur du builder
   deviennent ceux du site, que le builder soit affiché ou non.

### `fhpc` — l'invité

1. **`.app` devient transparent**, et le fond remonte à l'hôte. ⚠️ Ça renverse
   une ligne du lot 112, déployée le 31/08 — à faire explicitement, pas en
   passant.
2. **Le thème se reçoit.** Un thème imposé bat le thème local ; sans thème
   imposé, le builder garde le sien. Un organe, deux entrées.
3. **Rien d'autre ne bouge.** Le panneau, le ratio, l'échelle continue : le 112
   les a posés et ce lot n'y touche pas.

---

## 5. Les pièges nommés d'avance

- 🔴 **Un cadre a son propre fond.** Par défaut il est opaque et masquera le
  fond commun. Le `body` du site encadré doit être transparent — et c'est une
  modification du **thème MkDocs**, pas du builder.
- 🔴 **MkDocs Material a déjà un bouton jour/nuit**, et il lit
  `prefers-color-scheme`. Deux bascules qui coexistent finissent par se
  contredire : celle du builder embarqué doit **disparaître**, pas cohabiter.
- 🔴 **`localStorage` est partagé** entre les deux chemins — même origine. Une
  clef de thème mal nommée écraserait celle de l'autre. Les clefs se nomment
  avant d'être écrites (la leçon de `fhpc.echelle.cran` → `.cran.2`, 30/08).
- ⚠️ **Le mode widget est mesuré en iframe, jamais en `<div>` monté** — c'est
  écrit depuis le lot 85 et ça reste vrai. Ce lot le mesurera enfin.

---

## 6. Ce qui n'est PAS dans ce lot

- ⛔ **Le dock v1** (`stylesheets/companion-dock.css`) — Eric, 31/08 :
  *« le dock V1 c'est pour plus tard »*. On n'y touche pas, on ne s'en inspire
  pas, on ne le rouvre pas.
- ⏳ **Les six paliers de partage** — `mini · mobile · small · medium · large ·
  extra`. Eric les a nommés le 31/08 : ils disent **combien la fenêtre donne au
  builder, et combien elle laisse au site**. Ils ne prennent leur sens qu'une
  fois les deux colonnes debout ; ils viendront donc **après**, dans leur propre
  lot, avec les seuils qu'Eric fixera en regardant.
- ⏳ **`--stage-amorce`** — le dégradé d'amorce de la fiche, devenu inatteignable
  depuis que `data-grandeur` ne rend plus que `etroite` (lot 112). À retirer ou à
  replacer : décision d'Eric, hors de ce lot.

---

## 7. À TRANCHER avant la première ligne de code

> Eric, 2026-08-31 : *« il faut que ça marche sur TOUS LES SUPPORTS »*, *« pas
> que sur mon iPad »*.
>
> 📌 C'est une consigne de PORTÉE, et elle se garde comme telle : ce lot ne se
> juge pas sur l'appareil d'Eric. Le banc devra parcourir au minimum le
> téléphone (375 × 812), le petit téléphone (360 × 640), la tablette dans ses
> deux orientations, le portable (1440 × 900), le grand écran (2560 × 1440) et
> la colonne de VTT (480). C'est la même liste que le lot 112 a mesurée pour le
> panneau ; elle est reprise ici parce qu'un lot qui ajoute une SECONDE surface
> ne peut pas s'appuyer sur les mesures de celui qui n'en avait qu'une.

1. **`PLANCHER_SITE` — 960, 700 ou 480 ?** Les trois sont mesurés (§1 ter), et
   ils décident à partir de quelle fenêtre deux colonnes existent : 1 335 px,
   1 075 px ou 855 px. Aucun n'est déductible — c'est un jugement de lisibilité.
2. **Le mode à UNE colonne, qui n'a encore aucun dessin.** Sous le seuil, la
   page ne porte qu'une surface : laquelle par défaut, par quel geste on passe à
   l'autre, et ce geste est-il le même que celui qui « invoque » le builder sur
   grand écran ? C'est le cas le plus fréquent de tous.
3. **En portrait, même sur tablette, il n'y a pas deux colonnes.** Mesuré :
   sur un 1024 × 1366, la loi §1 bis donne 909 px au builder et il n'en reste
   que 115 au site. Le mode à une colonne n'est donc pas réservé au téléphone —
   il est le mode NORMAL de tout écran debout, et c'est une raison de plus pour
   qu'il soit dessiné plutôt que subi.
4. **Le site encadre-t-il le builder, ou l'inverse ?** Eric a dit « c'est le
   site qui décide » — la lecture la plus simple est *le site est la page, le
   builder est le cadre*. À confirmer, parce que tout le reste en découle.
