# LOT 79 — Le palier 2 de Class, en trois écrans et en glisser-déposer

> **Mandat écrit le 2026-08-16**, à la demande d'Eric : *« on avait fait un gros
> travail de fond sur comment construire le builder du wizard en drag and drop,
> et je vois que rien n'a été fait proprement, donc je suggère de s'attaquer à
> ça maintenant »*.
>
> Source : **croquis C** (`FH-WEB/FHPC/Croquis/2026-08-15-class-wizard-choix.jpg`),
> les trois écrans à droite de la fiche. Le croquis fait foi.

---

## 1. ⭐ LA BONNE NOUVELLE, ET ELLE EST MESURÉE : le moteur est déjà prêt

Relevé le 2026-08-16 sur le personnage d'exemple, `decisions[]` publie déjà
**exactement ce que le croquis dessine** — au nombre près :

| plan | créneaux | options publiées | ce que le croquis dessine |
|---|---|---|---|
| `class.skills` | **2** | **7** | 7 pastilles (Arcana, Investigation, Nature, History, Insight, Medicine, Religion) + `CHOICE 1` / `CHOICE 2` |
| `class.cantrips` | **3** | **15** | grille défilante + `CHOICE 1/2/3`, « Choose three cantrips you know » |
| `class.prepared` | **4** | **30** | « 30 1st level spells, scrollable » + `CHOICE 1/2/3/4` |

📌 **Aucune règle de jeu n'est à écrire.** Les créneaux, les options, les verrous
d'option indisponible et les confirmations d'orphelins existent et sont gardés.
Ce lot est **entièrement un lot d'écran**. C'est ce qui le rend faisable ; c'est
aussi ce qui interdit d'y toucher au moteur.

## 2. 🔴 LA MAUVAISE, ET ELLE EST MESURÉE AUSSI : le glisser-déposer n'existe pas

    grep -rn "pointerdown|dragstart|draggable|touchstart" ui/ src/   →  0

Zéro occurrence dans tout le dépôt. Le « drag and drop » du croquis des
caractéristiques (croquis B) n'a jamais été construit non plus : le plateau de
dés assigne **au clic** (`assignAbilityRoll`). Il n'y a donc **rien à réutiliser**
— l'organe est à écrire, et il sera partagé par au moins deux écrans.

---

## 3. Ce qui existe aujourd'hui, et pourquoi ce n'est pas ça

`renderClassChoices` (class-step.mjs) empile **sur un seul écran** trois
`renderSlotQcm` — compétences, cantrips, sorts préparés — plus les deux boîtes de
confirmation d'orphelins. C'est fonctionnel, gardé, et ce n'est pas le croquis :
pas de sous-écrans, pas de grille, pas de glisser-déposer, pas de tap-pour-info.

⛔ **`renderSlotQcm` ne doit pas être supprimé** : il sert AUSSI `species.skills`,
la bourse captive d'espèce et le don d'origine. Ce lot ajoute une seconde forme
pour Class ; il ne remplace pas la première.

---

## 4. LES QUATRE ORGANES À CONSTRUIRE, chacun avec son piège

### 4.1 Les sous-écrans du palier 2 — ✅ TRANCHÉ

**Ce sont des PALIERS (2, 3, 4), pas une machine à états d'écran.** Décision
d'architecte du 2026-08-16, et la raison est une question de propriété : SOCLE.md
dit *« c'est `shell.mjs` qui possède l'enchaînement »*, et `catalogueValidate`
rend déjà `{exists, ready, action, next}`. Une machine à états écrite dans
`class-step.mjs` ferait **deux propriétaires de la même porte** — la faute exacte
que `rollBatch` a payée au lot 50.

⭐ CE QU'IL FAUT GÉNÉRALISER, ET RIEN DE PLUS : `palier2` devient une **liste de
paliers** par écran. Le mécanisme du « palier qui n'existe pas » est déjà là et
déjà gardé — une espèce qui n'accorde rien (Loroka) rend `exists: false` et
`pressValidate` saute à l'étape suivante. Il porte donc SANS RIEN AJOUTER le fait
qu'un **Fighter n'a ni cantrips ni sorts préparés** : ses paliers 3 et 4
n'existent pas, un Wizard en a quatre, un Rogue deux. C'est la même ligne de code
qui décide.

### 4.1 bis `Back` — ✅ INDISPENSABLE (Eric, 2026-08-16)

⭐ ET LE GARDE 17 N'EST PAS RENVERSÉ, IL EST **PRÉCISÉ**. Son argument — *« la
molette le remplace »* — est vrai **entre les dix étapes** : la ceinture est
toujours là, elle porte le retour. Il est faux **à l'intérieur d'une étape** :
les sous-écrans d'un palier n'ont aucune ceinture, donc aucun retour. Le garde
doit donc interdire `Back` comme navigation d'ÉTAPE et l'autoriser entre PALIERS
— deux choses différentes qu'un seul mot recouvrait.
📌 Écrire la nuance dans le garde lui-même, sinon le prochain lot le relira comme
une interdiction générale et refera le débat.

### 4.2 Le glisser-déposer TACTILE
⛔ **Pas l'API HTML5** (`draggable`, `dragstart`) : elle ne fonctionne pas sur
Safari iOS, c'est-à-dire sur l'appareil d'Eric. L'organe doit être écrit en
**événements pointeur** (`pointerdown/move/up` + `setPointerCapture`), avec
`touch-action: none` sur les cibles pour que le geste ne défile pas la page.
⚠️ Et il cohabite avec **deux défilements** (la scène et la grille) et avec le
**défilement aimanté** de la fiche : un glisser qui commence sur une pastille ne
doit ni faire défiler la grille ni déplacer la scène.
⭐ Le croquis exige les DEUX gestes sur la même cible : *« Tap on cantrip for
info. Drag and drop to select »*. Il faut donc départager tap et glisser par un
seuil de déplacement, pas par la cible.

### 4.3 La grille défilante imbriquée
Le socle n'a **qu'un** défilement (`.stage`, B0.21a, `data-scroller`). La grille
des sorts en est un second.
⚠️ Le croquis pose une contrainte chiffrée : *« must be the same height as
cantrips »* — les deux grilles (15 et 30 sorts) ont la **même hauteur**, seule la
course de défilement change. C'est une cote à mesurer, pas à choisir.

### 4.4 Le tap-pour-info
⭐ **Le seul des quatre qui se réutilise** : le popup existe (`mountPopup`,
`state.popup`, `III.4`), il est persistant, hors du contenu remplacé, et
`applyDecisionAction` a déjà l'action `popup`.

---

## 5. Ce qui ne doit pas casser

- les **confirmations d'orphelins** (lots 46 et 72) : Wizard → Rogue laisse des
  sorts invalides, le carnet les verrouille, l'écran doit toujours proposer de
  les effacer en les NOMMANT ;
- le garde **`aria-pressed` / `markPressed`** : tout bouton à état annonce son
  état, et rien dans une fiche ne porte de valeur de record ;
- **un seul `Validate`** dans `ui/` (garde 16) — et sur les écrans à fiche, c'est
  `CHOOSE` qui valide (Ch6) ;
- **F1** : 242 × 440 au plancher, plafond `--measure`, marges 8, et la
  composition horizontale à trois colonnes.

---

## 6. Séquencement — ÉTAT AU 2026-08-16 (nuit) : **LE LOT EST FINI**

> Étapes 3, 4 et 5 livrées et déployées (`a933267`, graphe `?v=32`, **1 171
> tests verts**), plus le plateau de dés du croquis B. Ce qui suit garde le
> séquencement d'origine pour l'histoire ; l'état réel est ci-dessous.

| étape | état | où |
|---|---|---|
| 2 — l'organe | ✅ | `ui/builder/glisser.mjs` |
| 3 — la grille des mineurs | ✅ | `.glisse-grille`, fenêtre **268 px** mesurée |
| 4 — les 30 sorts de niveau 1 | ✅ | **rien n'a été réécrit** : `grille: true` + une consigne |
| 5 — le tap-pour-info | ✅ | décidé par Eric le soir même (voir §7.3) |
| + croquis B — les dés | ✅ | `renderAssignationGlissee`, `armerJeton` exporté |

### Ce que l'étape 3 a réellement coûté, et où
· **La cote est une classe, pas un nombre** : `.glisse-grille` porte
  `--grille-lignes` (5, et 3 en paysage) et `--grille-ligne`. Les deux
  grilles mesurent **268 px** au pixel près, par construction — un garde
  refuse tout sélecteur qui les distinguerait.
· 🔴 **La grille CSS a été essayée et abandonnée, sur mesure.** Avec
  `grid-auto-rows: minmax(44px, auto)`, les lignes restaient à 44 : une
  rangée `auto` se dimensionne sur la contribution « max-content », où le
  texte est compté SANS repli. « Protection from Evil and Good » demandait
  46 px pour 42 et passait sous sa bordure. **Une ligne de flex prend la
  hauteur de sa plus haute case APRÈS repli** — c'est la seule forme qui
  tienne un nom long sans le couper ni bouger la fenêtre.
· 🔴 **Le conflit `touch-action` du §4.3, tranché** : les cases PAVENT la
  grille, donc `none` la rendait indéfilable au doigt. Le défilement gagne
  par défaut (`pan-y`) et le glisser se prend au **maintien de 350 ms**,
  après quoi l'organe retient le défilement lui-même (`preventDefault` sur
  un `touchmove` **non passif** — la seule chose qui le puisse une fois le
  geste commencé).

### 🔴 UN DÉFAUT DE MOTEUR TROUVÉ EN CHEMIN — ANTÉRIEUR, ET IL SE VOIT
Déposer un sort dans le **3ᵉ** créneau alors que les deux premiers sont
vides fait republier les créneaux en `class.cantrips[2..4]`, et l'écran
affiche donc **« Cantrip 3 / Cantrip 4 / Cantrip 5 »** pour trois choix.

⚠️ **Ce n'est pas le glisser qui l'apporte** : mesuré sur le QCM des sorts
préparés (que ce lot n'avait pas encore touché), choisir dans la 3ᵉ ligne
donne exactement « Spell 3 / 4 / 5 / 6 ». Le carnet republie les créneaux à
partir du premier index employé.
⛔ **Non corrigé, et volontairement** : renuméroter les cases à l'écran
masquerait un défaut de moteur derrière de la peinture, et ferait diverger
les deux formes. Le glisser le rend simplement plus facile à déclencher —
on peut viser une case, alors qu'un QCM se remplissait dans l'ordre.

---

## 6 ter. Séquencement d'origine (historique)

1. ✅ **Décisions tranchées** (§4.1 et §4.1 bis).
2. ✅ **L'ORGANE EST ÉCRIT ET DÉPLOYÉ** — commit `e94a167`, graphe `?v=30`,
   **1 157 tests verts**. Voir §6 bis juste dessous : ce qui existe, ce qui a
   été trouvé en chemin, et ce qui reste sale.
3. ⏳ **La grille défilante** et sa cote de hauteur commune (§4.3), sur les
   cantrips — **c'est ici que la relève reprend**.
3. **La grille défilante** et sa cote de hauteur commune (§4.3), sur les cantrips.
4. ⏳ **Les sorts de niveau 1** : la même grille, 30 options, 4 créneaux — s'il
   n'y a rien à réécrire à cette étape, l'organe est bon.
5. ⏳ Le **tap-pour-info** en dernier : il ne dépend d'aucun des trois autres.
   ⚠️ Sur les grilles de sorts, le tap est pris par l'INFO (croquis) alors qu'il
   SÉLECTIONNE sur l'écran des compétences. Les deux écrans divergeront donc sur
   ce point : à trancher au moment de l'étape 5, pas avant.

---

## 6 bis. CE QUI EXISTE DÉJÀ (étape 2 livrée)

**`ui/builder/glisser.mjs`** — l'organe, plus son garde `tests/glisser.test.mjs`
(12 cas). Employé par `renderClassChoices` pour `class.skills` seulement ; les
deux QCM de sorts sont inchangés en dessous, en attendant les étapes 3 et 4.

Trois décisions déjà payées, à ne pas rouvrir sans raison neuve :
· **événements pointeur**, pas l'API HTML5 (elle ne marche pas sur Safari iOS) ;
· **deux gestes** : le tap tombe dans le premier créneau LIBRE, le glisser dans
  le créneau VISÉ ; ce qui les départage est une DISTANCE de 6 px, pas une cible ;
· **aucun fantôme ne suit le doigt** — le garde 7 des jetons interdit le style en
  ligne dans `ui/`, et son attaque refuse même `setProperty`. Le retour visuel
  passe par des attributs (`data-glisse`, `data-vise`). Si Eric juge le geste sec,
  le fantôme se rediscute avec une exception ARGUMENTÉE au garde.
🔴 `touch-action: none` sur les jetons est ce qui rend le geste possible hors
bureau : sans lui le doigt fait défiler la scène et le navigateur annule la
séquence de pointeur. **La grille défilante de l'étape 3 va se battre avec cette
ligne** — c'est le premier endroit à mesurer.

### 🔴 Le défaut trouvé en chemin, réparé, et sa leçon
`shell.css` avait un `@media (prefers-reduced-motion: reduce)` ouvert ligne 891
et **jamais refermé** : **205 sélecteurs** ne s'appliquaient qu'aux visiteurs
ayant désactivé les animations (feuille servie : 111 règles au lieu de 318).
Trouvé parce que les règles neuves, écrites en fin de fichier, ne rendaient rien.
⚠️ **Avant de soupçonner son propre CSS, compter les accolades AVEC UNE PILE** —
un compteur sans pile laisse une fermante orpheline masquer celle qui manque, et
il m'a fait accuser mon travail à tort.

### ⏳ Deux saletés vues et laissées (pas dans le périmètre)
1. Le vivier affiche les identifiants bruts (`animal-handling`) : `labelOf` ne
   trouve pas le record. **Antérieur au lot** — le QCM avait le même
   `labelOf`. À traiter avec les libellés, pas avec le geste.
2. La fiche **Fighter** affiche sous Cantrips un refus
   `« srd:spell:en:ray-of-frost » isn't on the catalogue` : un guerrier ne devrait
   avoir aucun bloc de sorts. Antérieur aussi, et probablement un plan publié à
   tort par le moteur — donc **hors d'un lot d'écran**.

⛔ **Un lot par étape, mesuré au navigateur à chaque fois.** Ce chantier a la
taille d'un lot 58 ; le livrer d'un bloc, c'est se priver du seul moyen qu'on ait
de savoir où ça casse.

---

## 7. ⏳ Ce qui attend une décision d'Eric

1. ✅ **Sous-écrans** — tranché par l'architecte : des paliers (§4.1).
2. ✅ **`Back`** — indispensable (Eric, 16/08). Le garde se précise (§4.1 bis).
3. ✅ **TRANCHÉ PAR ERIC, 2026-08-16 au soir** : *« j'avais prévu tap pour
   info, drag and drop to select ; sur desktop clic droit info, gauche
   select »*. Quatre cas, deux appareils, un seul endroit qui décide
   (`onInfo`, glisser.mjs) :

   | | tap / clic gauche | glisser | clic droit |
   |---|---|---|---|
   | **doigt** | info | choisit (après maintien) | — |
   | **souris** | choisit | choisit | info |

   ⛔ Et la divergence est **bornée** : sans `onInfo`, le tap pose — l'écran
   des compétences (étape 2) n'a pas changé d'un geste. Un garde le tient.
   📌 L'info descend du record et n'invente aucun libellé : « evocation ·
   Action · 120 feet · V, S · Instantaneous », puis la description.

---

## 8. ⏳ CE QUI RESTE, POUR LA SUITE

1. **Les paliers** (§4.1) : `palier2` doit devenir une LISTE de paliers pour
   que les trois blocs deviennent les trois écrans du croquis, avec `Back`
   (§4.1 bis). Rien n'a été fait de ce côté — les trois blocs vivent encore
   sur le même écran, qui défile. **C'est le prochain lot.**
2. **Le défaut de numérotation des créneaux** (§6, encadré rouge) — moteur.
3. **Le poids des douze fiches** : 2,14 Mo mesurés pour DIX images alors que
   la spec en vise 1,8 pour douze, et `ranger`/`sorcerer` manquent encore.
   Aucun `loading="lazy"` sur `renderFicheBody` : les douze se chargent
   ensemble. Charger paresseux, ou redescendre la cote d'export — arbitrage
   d'Eric.
4. Les deux saletés du §6 bis (libellés bruts du vivier, bloc de sorts sur
   un Fighter) sont toujours là, toujours antérieures.
