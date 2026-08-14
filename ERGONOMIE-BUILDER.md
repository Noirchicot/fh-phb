# Le builder à l'usage — défauts mesurés et cible décidée

> ⚠️ **CE FICHIER PORTE DEUX CHOSES QU'IL NE FAUT PAS CONFONDRE.**
> **Partie A — ce qui CLOCHE** : mesuré par l'architecte, avec la mesure.
> **Partie B — ce qu'ERIC VEUT** : dicté par lui, reformulé, **validé par lui**
> avant écriture. Rien n'entre en partie B sans son « oui ».

> ## 🔀 DÉCISION MAJEURE D'ERIC, 2026-08-14 — LE MOBILE D'ABORD
>
> **« Je confirme le renversement. »**
>
> **On conçoit la version MOBILE en premier** *(base 360 px)*, et le desktop
> s'extrapole ensuite. Ses mots : *« si on a la logique mobile, le reste sera
> facile à extrapoler pour desktop »*.
>
> 🔴 **CETTE DÉCISION EN REMPLACE DEUX, RATIFIÉES, ET C'EST VOULU** — signalé à
> Eric, confirmé par lui le 2026-08-14 :
>
> | Ce qui est remplacé | Ce qui disait |
> |---|---|
> | `UI-DIMENSIONS.md`, **2026-08-02** | *« Phones remain explicitly out of scope : the mobile interface is a separate project with a different logic, **not a narrower version of this one**. iPad is not "mobile" here. »* |
> | **Architecture v2, Q2, 2026-08-07** | *builder **desktop d'abord** (iPad compris) ; le mobile viendra comme interface pensée différemment* |
>
> ⛔ **Le siège suivant ne doit PAS appliquer les deux lignes ci-dessus** : elles
> sont datées d'avant. **La règle courante est : mobile d'abord.**
> 📌 *(Noté sans être tranché par l'architecte : la logique « une largeur
> s'extrapole depuis l'autre » est celle qu'Eric avait lui-même écartée le
> 2 août — dans l'autre sens. C'est sa décision, elle est prise en connaissance
> de cause.)*

> ## ⚖️ DÉCISION D'ERIC, 2026-08-14 — LA TERMINOLOGIE EST CELLE DE LA V2, PARTOUT
>
> **`T1`…`T7` désignent désormais les valeurs du BUILDER v2, et elles seules :**
>
> | T1 | T2 | T3 | T4 | T5 | T6 | T7 |
> |---|---|---|---|---|---|---|
> | **10** | **12** | **14** | **16** | **18** | **22** | **44** |
>
> *(micro · mention · libellé · corps · accent · titre · grand nombre —
> `ui/builder/tokens.css:55-61`)*
>
> ⛔ **Les valeurs du dock v1** (6,8 · 7,4 · 8,4 · 9,6 · 11 · 13 · 30,
> `UI-TYPOGRAPHY.md`, ratifié le 2026-08-06) **restent dans son code gelé, mais
> ne portent plus ces noms.** Deux échelles ont porté les mêmes étiquettes
> pendant huit jours, avec un rapport allant **du simple au double** sur T7
> (30 contre 44) — c'était un piège de conversation, il est fermé.
>
> 📌 Ça ne contredit pas la règle *« les noms sont partagés, les nombres sont
> locaux à une zone »* : ça la **tranche** en désignant **quelle** zone tient le
> barème de référence.

> **Ouvert le 2026-08-14.** Eric a utilisé le builder sur son iPad et a buté.
> Ce fichier porte **ce qui a été MESURÉ**, pas ce qui a été supposé.
> ⚠️ **La liste n'est pas close** — Eric a dit *« y'en a plein d'autres »*, et
> l'écran Skills est le seul parcouru à fond pour l'instant.

---

## 🔴 0. LA CAUSE DE FOND — un seul défaut produit la moitié des symptômes

`ui/builder/shell.mjs:655-662` :

```js
function render() {
  app.dataset.plan = state.planOpen ? "open" : "closed";
  app.innerHTML = "";                                   // ← TOUT est détruit
  const nodes = [renderBelt(), renderStage(), renderPlan()];
  app.append(...nodes);
  recenterBelt();                                       // ← puis un scrollIntoView
}
```

**Chaque clic du joueur détruit et reconstruit l'application entière**, et
**rien ne conserve la position de défilement** — mesuré :
`grep -rn "scrollTop\|scrollY\|scrollTo" ui/` ne trouve **aucune** sauvegarde.
Les seuls appels sont deux `scrollIntoView` qui *déplacent* la page.

⚠️ **Et `recenterBelt()` ajoute un second déplacement** (`shell.mjs:652`,
`scrollIntoView({inline:"center", block:"nearest"})`) **par-dessus** la perte de
position du re-render.

📌 **Sur un écran de 16 513 px, ça se voit à chaque clic.** C'est la cause
commune de *« ça saute »* et de *« ça remonte vers le haut »*.

⛔ **Ne traite pas les symptômes un par un avant d'avoir tranché celui-ci.**
Le remède est une décision d'architecture (conserver et restaurer le scroll ?
ne redessiner que ce qui change ?), pas un correctif d'écran.

---

## 1. L'écran Skills — mesuré au parcours

| # | Défaut | La mesure |
|---|---|---|
| **1.1** | 🔴 **Le compteur disparaît quand on descend** *(demande explicite d'Eric : « je voudrais un flottant pour voir le compte »)* | `POOL / CLASS / SPECIES / INVESTED / LEFT` est dans une `.decision-card` en **`position: static`** — alors que la barre de catégories juste au-dessus est **`sticky`**. Le compte est ce qu'on doit voir en dépensant, et c'est le seul qui défile |
| **1.2** | 🔴 **La barre de catégories ressemble à des onglets, mais n'en est pas** | Elle porte `class="belt skills-category-bar"` — **la même classe `belt` que la ceinture d'étapes**, qui, elle, change de vue. Or elle ne filtre rien : `scrollIntoView` sur une section (`skills-step.mjs:527`). Les **six** sections sont rendues **simultanément** (mesuré : `Species skill budget`, `Knowledge`, `Social`, `Exploration`, `Physical`, `Tools & Trainings`) |
| **1.3** | 🔴 **Le clic sur « Tools & Trainings » catapulte de 6 111 px** | mesuré : `scroll 48 → 6159`. C'est *« on choisit tools, ça va à tools »* — le joueur croit changer de vue, il tombe au milieu de la même page |
| **1.4** | 🔴 **L'ancre n'est pas stable** | le **même** clic sur « Tools » mène à **6 159 px**, puis à **7 323 px** après un changement d'état — le contenu au-dessus a changé de hauteur. Deux fois le même geste, deux endroits différents |
| **1.5** | ⚠️ **La page fait 16 513 px** | pour **un seul** des dix écrans. 26 compétences + 36 outils + les apprentissages, tout déplié |

---

## 2. L'écran Review (9) — mesuré

| # | Défaut | La mesure |
|---|---|---|
| **2.1** | 🔴 **11 894 px, 538 lignes, dont 464 commencent par `resolved.`** | ✅ **Eric a tranché** : *« un masque pour le 9 »*, et *« on doit avoir une visibilité de ce qui est fait / pas fait »* |
| **2.2** | **Les backticks Markdown ne sont pas rendus** | la page affiche littéralement ``« These fields live outside `resolved` »`` — vu sur la capture d'Eric |
| **2.3** | **Les empreintes de 64 caractères s'affichent en GRAS** | plus visibles que le nom de la couche à côté d'elles |

---

## 3. La répartition des caractéristiques

Eric : *« marchent mais pas du tout ergonomiques »*.
⚠️ **NON ENCORE MESURÉ** — à parcourir avant d'en faire quoi que ce soit.

📌 **Piste connue, et elle vient d'Eric lui-même** *(mandat §5, 2026-08-13)* : le
builder v1 (`~/tools/fh-skills/fh-skill-builder.html`, ligne 731) fait pointer
une caractéristique vers **l'INDEX d'un dé**, pas vers sa valeur —
`assign: {STR:null, DEX:null, …}`. Un index distingue les deux 14, et `null` dit
*« pas encore distribué »*. **Va lire ce fichier avant de concevoir.**

---

## 3bis. 🔴 LES DIX ÉCRANS MESURÉS D'UN COUP — 2026-08-14

| # | Écran | Hauteur | Boutons | Champs | Compteur |
|---|---|---|---|---|---|
| 0 | Universe | 959 | 5 | 1 | — |
| 1 | Concept | **611** | 3 | 3 | — |
| 2 | Class | 2 012 | 31 | 0 | — |
| 3 | Species | 1 540 | 24 | 0 | **static** |
| 4 | **Inheritance** | **6 628** | 26 | 0 | **static** |
| 5 | Abilities | 1 374 | 6 | 0 | — |
| 6 | Destiny | 1 463 | 6 | 0 | — |
| 7 | **Skills** | **16 513** | **266** | 0 | **static** |
| 8 | **Equipment** | **17 660** | **161** | 13 | — |
| 9 | **Review** | **27 370** | 3 | 0 | static |

**Ce que ce tableau dit, et qu'aucun écran pris seul ne montre :**

1. 🔴 **Un écart de 45×** entre le plus court (611 px) et le plus long (27 370).
   Concept tient dans un écran, Skills en fait vingt. **Il n'existe aucune
   densité commune** — chaque écran a été conçu seul.
2. 🔴 **REVIEW GRANDIT AVEC LE PERSONNAGE** : mesuré à **11 894 px** sur le
   personnage d'exemple, **27 370 px** après quelques choix de plus. Le dump
   s'allonge à mesure qu'on construit — **l'écran devient d'autant plus illisible
   que le personnage est abouti.** C'est le contraire de ce qu'on veut d'un
   récapitulatif.
3. 🔴 **Le compteur `static` n'est PAS un défaut de Skills** — il est sur
   **trois** écrans : **Species, Inheritance et Skills**. La demande d'Eric (« un
   flottant pour voir le compte ») vaut pour les trois, pas pour un.
4. ⚠️ **Inheritance : 6 628 px pour 26 boutons.** Ce n'est pas la densité de
   contrôles, c'est **la prose SRD des dons affichée en entier** sur chaque
   carte. Un cas différent de Skills (qui, lui, est dense en contrôles : 266
   boutons) — **deux causes, deux remèdes.**

📌 **Et une preuve de plus du défaut §0, trouvée par accident** : une mesure qui
gardait une référence aux boutons de la ceinture a **planté** au deuxième écran
— `app.innerHTML = ""` avait détruit les nœuds entre-temps. **Le re-render
invalide toute référence DOM conservée**, ce qui interdit au passage toute
solution qui voudrait garder un élément vivant entre deux rendus.

---

## 3ter. 🔴 LA TYPOGRAPHIE EST PLATE — mesuré sur Skills, 2026-08-14

> ⚠️ **LIS AUSSI LE §3quater : il CORRIGE le cadre de cette section.** Les
> chiffres ci-dessous sont justes, mais la conclusion « le builder n'est pas en
> T3 » répondait **à côté de la question d'Eric** — l'échelle T1–T7 **existe
> bel et bien** dans `tokens.css`, et **T3 EST le barreau dominant**.

**Question d'Eric : « au niveau typo t'es en T3 globalement ? »** Mesuré sur les
**481** nœuds de texte de l'écran Skills, racine à **16 px** :

| Taille | Occurrences | Poids | Ce que c'est |
|---|---|---|---|
| 12 px | 7 | 400 | `Pool`, `Class` — **les libellés du compteur** |
| **14 px** | **333 (69 %)** | 400/600/700 | tout le corps |
| **16 px** | **135 (28 %)** | 400/600 | `Show plan`, les titres de catégorie |
| 18 px | 5 | 600 | les chiffres `0/10`, `2/2` |
| 22 px | 1 | 700 | le titre `Skills` |

**Réponse : le builder n'est pas « en T3 » — il tient sur DEUX barreaux collés.**
**97 % du texte est à 14 ou 16 px**, séparés d'un ratio de **1,14**. Ce qui
distingue un titre d'un libellé n'est presque pas la **taille**, c'est le
**poids** (400/600/700). Les trois autres barreaux sont décoratifs : 7, 5 et 1
occurrence.

🔴 **Et ce n'est pas une échelle** : 14→16 = **1,14**, 16→18 = **1,125**,
18→22 = **1,22**. Trois ratios sur quatre marches — donc **quatre décisions
séparées**, pas une progression.

⚠️ **Le pire est un renversement** : **les libellés du compteur sont les plus
petits de l'écran (12 px)**, alors que c'est l'information qu'Eric veut voir en
permanence. **Ça rejoint sa demande de flottant** — l'élément le moins lisible
est aussi celui qui défile hors de vue (§1.1).

📌 **Sur le rapprochement avec T1–T7** *(`UI-TYPOGRAPHY.md`, ratifié le
2026-08-06)* : les **noms** voyagent (`libellé`, `corps`, `accent`, `titre`), les
**valeurs non** — 6,8 à 30 px décrivent une fenêtre flottante de 425 px de large,
le builder est plein écran à 16 px de racine. **C'est la règle déjà écrite au
mandat : « les noms sont partagés, les nombres sont locaux à une zone ».** Le
builder est une zone de plus, et **elle n'a pas encore ses nombres**.

---

## 3quater. L'ÉCHELLE T1–T7 EXISTE DÉJÀ, et elle est en px FIXES

⚠️ **CORRECTION DE CE SIÈGE** : la §3ter dit « le builder n'est pas en T3 ». **Elle
répondait à côté du cadre.** L'échelle nommée **existe dans le builder**
(`tokens.css:55-61`) et **T3 EST le barreau dominant** — 32 déclarations sur 78.
Eric avait raison de poser sa question en T1–T7.

| | Valeur | Nom | Déclarations |
|---|---|---|---|
| **T1** | 10 px | micro | 2 |
| **T2** | 12 px | mention | 14 |
| **T3** | **14 px** | **libellé** | **32** |
| **T4** | 16 px | corps | 21 |
| **T5** | 18 px | accent | 7 |
| **T6** | 22 px | titre | 1 |
| **T7** | 44 px | grand nombre | 1 |

**Les deux questions d'Eric, mesurées :**

1. **« T1 restera-t-il proportionnel à T2 ? »** → **Oui, rigidement** : px fixes,
   le rapport 10:12 ne bouge nulle part. ⚠️ **Mais l'échelle n'a pas de ratio
   constant** : 1,20 · 1,167 · 1,143 · 1,125 · 1,222 · **2,0**. Les rapports se
   resserrent, remontent, et T7 double T6.
2. **« À 360 px feront-ils la même taille ? »** → **OUI, vérifié à 360×780** :
   les sept barreaux sont identiques au pixel près, **aucune media query ne
   redéfinit la typo** (le seul `@media (max-width: 720px)` ne la touche pas).
   ✅ Et **aucun débordement horizontal** à 360.

### 🔴 CE QUE LA MESURE À 360 SORT, ET QUE LA TYPO CACHAIT : LES TOUCHES

**Les boutons de palier (½ ● ★) font 24 × 24 px**, à 360 comme à 1280. C'est
**exactement le minimum absolu de WCAG 2.5.8**, très en dessous du confortable
tactile (**44 px** Apple, **48 px** Google). Sur Skills — **266 boutons**, en
majorité ces pastilles — c'est le défaut le plus concret au doigt, **et il est
invisible à la souris**.

📌 **L'enjeu que la question d'Eric révèle** : *une échelle en px fixes ne suit
pas le doigt.* Le texte reste lisible à 360 ; les **cibles**, elles, ne
grandissent pas alors que le moyen de pointage devient dix fois plus gros. La
taille de touche est un problème **distinct** de la taille de texte, et le
builder ne la traite nulle part.

⚠️ **À vérifier par le siège suivant** : la page Skills mesure **16 513 px** à
1280 de large mais **4 437 px** à 360 — un écran plus étroit devrait être **plus
haut**. Quelque chose est replié ou masqué sous le seuil de 720. **Non
expliqué, mesuré une seule fois.**

---

# PARTIE B — LA CIBLE, DICTÉE PAR ERIC

> **Protocole, posé par Eric le 2026-08-14** : il décrit une étape · l'architecte
> **réécrit ce qu'il a compris** · Eric valide → on écrit ici · sinon → deuxième
> passe. **Rien n'entre dans cette partie sans son « oui ».**
> ⛔ **Tout ce qui suit décrit la version MOBILE (360 px).** Le desktop viendra
> après, par extrapolation.

## N. LE CADRE DE NAVIGATION — **COMMUN À TOUTES LES ÉTAPES** ✅ *validé par Eric le 2026-08-14*

> ⛔ **NE RANGE PAS CECI SOUS « ÉTAPE 0 ».** Eric l'a dit à l'étape 1 : *« rien à
> rajouter, sauf les concepts de navigation qui se répètent »*. **Tout ce bloc
> vaut pour les dix écrans.** Il a été recueilli en décrivant Universe, mais il
> n'appartient pas à Universe.
>
> *(Les identifiants `B0.1`–`B0.13` et `B0.19`–`B0.22` sont conservés tels quels
> — ils ont servi dans la conversation avec Eric — mais ils désignent des règles
> **communes**, pas des règles d'Universe.)*

### La molette *(ce qu'est aujourd'hui la ceinture d'étapes)*

| # | Ce qu'Eric veut |
|---|---|
| **B0.1** | Elle est **FIXE en permanence** — on la voit pendant tout le défilement, elle ne part jamais |
| **B0.2** | Elle **circule HORIZONTALEMENT** et porte **ses chevrons ‹ ›** *(la colonne latérale actuelle disparaît donc)* |
| **B0.3** | **Aucun chevron à gauche à la première étape · aucun à droite à la dernière · les deux au milieu** |
| **B0.4** | Quand une étape est **validée**, son **numéro passe en vert** — ou la couleur qui convient au thème |
| **B0.5** | Le **nom** de l'étape est **mis en surbrillance dans la molette quand la fiche idoine est visible en dessous** *(un scrollspy : la molette suit ce qu'on regarde)* |

### La ligne de commande *(fixe, sous la molette)*

| # | |
|---|---|
| **B0.6** | **Show plan** mène à une **vue globale** |
| **B0.7** | Son texte est à la **même taille que « Concept »** — le barreau des libellés de la molette |
| **B0.8** | Il est dans une **icône rectangulaire plus petite que l'actuelle** |
| **B0.9** | Cette icône **interrompt la ligne de séparation** — qui est **HORIZONTALE** et sépare la molette de la fiche |
| **B0.10** | 🆕 **Un bouton « Validate »**, sur la **même ligne horizontale, à droite de Show plan** |
| **B0.11** | Il **s'allume (highlight) quand toutes les conditions de la fiche sont remplies** |
| **B0.12** | Le cliquer **passe à l'étape suivante SANS passer par la molette** |
| **B0.13** | **Cette ligne est fixe** — verticalement **et** horizontalement |

### Ce qui vaut pour toutes les fiches

| # | |
|---|---|
| **B0.19** | **Certaines fiches auront EN PLUS une navigation interne, fixe elle aussi.** Donc **deux barres persistantes** : les **étapes** au-dessus, les **sections de la fiche** en dessous |
| **B0.20** | **Le défilement de la fiche aura aussi ses chevrons** — *« pas de barre de navigation »* |

⭐ **Et ça répond à deux défauts déjà mesurés en partie A** : la barre de
catégories de Skills (§1.2), aujourd'hui `sticky` mais qui n'est ni un onglet ni
une table des matières assumée, **devient la « navigation interne » de B0.19** ;
et le compteur qui défile hors de vue (§1.1, `position: static` sur **trois**
écrans) est précisément ce qui doit s'y accrocher.

### 🏗️ B0.21 — LA STRUCTURE VERTICALE DE L'ÉCRAN MOBILE ✅ *précisée par Eric le 2026-08-14*

**« Show plan et Validate sont sous la molette et fixes, ils ne scrollent pas du
tout. La molette est fixe elle aussi. Les chevrons sont flottants sur la fiche. »**

```
┌─────────────────────────────┐
│  ‹   ② Class   ③ Species  › │   LA MOLETTE — fixe, horizontale
├──────┬──────────────────────┤   ← la ligne de séparation, COUPÉE par l'icône
│ Show │   Validate           │   LA LIGNE DE COMMANDE — fixe
│ plan │                      │
└──────┴──────────────────────┘
                                  LA FICHE — le SEUL élément qui défile
        ∧ / ∨ flottants           les chevrons flottent PAR-DESSUS elle
```

| # | |
|---|---|
| **B0.21a** | **Rien ne défile sauf la fiche.** Molette **et** ligne de commande sont **fixes** — « ils ne scrollent pas du tout » |
| **B0.21b** | **Ordre vertical** : molette · puis ligne de commande · puis fiche |
| **B0.21c** | Le **trait de séparation est au niveau de la ligne de commande**, et **l'icône Show plan le coupe** — c'est ce qui rend cohérent le B0.9 |
| **B0.21d** | **Les chevrons de la fiche sont FLOTTANTS, posés par-dessus le contenu** — ni barre, ni gouttière |

### B0.22 — LE COMPORTEMENT DES CHEVRONS FLOTTANTS ✅ *Eric, 2026-08-14*

**« D'expérience les chevrons sont mieux s'ils sont à l'extrême droite de
l'écran. Ils disparaissent au bout d'une seconde et réapparaissent dès qu'on
scrolle. »**

| # | |
|---|---|
| **B0.22a** | **Position : à l'extrême droite de l'écran** — pas centrés, pas dans le flux |
| **B0.22b** | **Ils s'effacent après ~1 seconde d'inactivité** |
| **B0.22c** | **Ils réapparaissent dès qu'on défile** |

📌 **Empilés à l'extrême droite, ils sont donc verticaux** — la déduction
« haut/bas » est confirmée par la position. *(Les chevrons ‹ › de la molette,
eux, restent gauche/droite : B0.2.)*
📌 **C'est le comportement d'une barre de défilement iOS** — visible pendant le
geste, effacée au repos. Cohérent avec B0.20 (« pas de barre de navigation ») :
on remplace la barre par un contrôle qui a ses manières.

⚠️ **Réserve de l'architecte, non tranchée** : un contrôle qui s'efface n'est pas
**découvrable** — au tout premier écran, un joueur qui ne défile pas ne saura pas
qu'ils existent. Ça n'invalide rien *(Eric dit « d'expérience »)*, mais le cas du
**premier usage** mérite d'être regardé quand ce sera construit.

### B0.23 — L'APPARENCE GLOBALE : LE FOND ET LES DALLES ✅ *Eric, 2026-08-14*

> ⛔ **Commun à toutes les étapes**, comme le reste du §N. Recueilli en décrivant
> Class, mais ne lui appartient pas.

| # | |
|---|---|
| **B0.23a** | Il y a une **image de fond, FIXE**. La fiche défile **par-dessus** elle |
| **B0.23b** | La fiche est composée de **DALLES qui flottent et défilent** au-dessus du fond |
| **B0.23c** | 🆕 ✅ **LE FOND CONTRASTE AVEC LE PARCHEMIN** *(Eric, 2026-08-14 : « le fond n'est pas parchemin, c'est mon thème — il doit contraster avec ! »)*. Le parchemin est la matière des **dalles** ; le fond est ce **sur quoi** elles flottent. Un fond de parchemin dissoudrait les dalles dans leur support, et **B0.23b cesserait de vouloir dire quelque chose** |

> 📏 **LES BANDES DE VALEUR DU FOND SONT CALCULÉES** — croisement des budgets
> de voile *(bible esthétique §5, calibrés par Eric)* et du contraste exigé par
> B0.23c. **Jour : 104–190 / 255. Nuit : 45–125 / 255.** Ce sont des BORNES :
> en sortir casse soit l'accessibilité, soit le contraste. Format de
> génération **1024 × 1792**, le fond couvrant la fenêtre et non le document.
> ➡️ **Le détail, le calcul et les trois options ouvertes sont dans le vault :
> `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/FHV2 - Bible esthétique.md`, §5c.**
>
> ✅ **LE VERROU EST LEVÉ — 2026-08-14.** Le voile du verre léger passe de
> **20 à 35 %** *(Eric)*, la teinte du fond est l'**ardoise bleutée**
> (`#87939E` jour / `#354551` nuit), et **les deux images existent et sont
> mesurées** :
>
> | | Bande | min / max mesurés | Hors bande | Texte au pire pixel, voile 35 % |
> |---|---|---|---|---|
> | **Jour** | 104 – 190 | 144 / 165 | **0 px** ✅ | **6,26:1** ✅ |
> | **Nuit** | 45 – 125 | 76 / 99 | **0 px** ✅ | **7,37:1** ✅ |
>
> *(mesuré sur la zone réellement vue — recadrage 827 × 1792 — et après le flou
> de 5 px, formule WCAG. Détail et pièges dans la bible §5c.)*
>
> ⛔ **DEUX CHOSES À NE PAS OUBLIER EN CONSTRUISANT** : l'**accent ne passe à
> AUCUN voile** (2,7:1 à 35 %, 3,3:1 à 50 %) — sur verre il **remplit une
> forme**, il ne porte jamais un mot ; et le fond entre en **JPEG** (110 Ko et
> 67 Ko à q75) et **jamais en PNG** (1,9 Mo et 1,5 Mo pour la même chose).

**Les TROIS types de dalles** — c'est le vocabulaire de mise en page du builder :

| Type | Quand on l'emploie | Voile |
|---|---|---|
| **simple** | elle **contient les choix**. 🔴 **Choix identique ⇒ dalle de taille identique** | ~~20 %~~ → ✅ **35 %** |
| **intermédiaire** | quand il y a **un peu plus de texte**, et **pas de couleur** | **50 %** |
| **majeure** | **beaucoup de contenu**, ou des **images** | **100 %** |

✅ **ARRÊTÉS LE 2026-08-14.** Eric : *« je valide, on passe de 20 à 35 % sur dalle
simple »*. À 20 %, une dalle claire posée sur un fond contrastant (B0.23c) ne
lisait plus comme du parchemin — elle lisait comme le fond, à peine éclairci. 35 %
lui rend sa matière tout en gardant un écart net avec le régime moyen à 50 %.
Le sens est inchangé : **100 % = voile opaque**, **35 % = voile léger**.

### ⚠️ Question encore ouverte sur le cadre de navigation

**Sans barre de défilement, comment sait-on où on en est dans une fiche longue ?**
Sur Skills (**16 513 px**), le surlignage de la molette (B0.5) dit la **section**,
pas la **position**. Les chevrons flottants (B0.21d) font **naviguer**, ils
n'**indiquent** rien. À accepter, ou à remplacer par autre chose — **posé à Eric,
sans réponse à ce jour.**

---

# LES ÉTAPES, UNE PAR UNE — ce qui leur est PROPRE

> Le cadre de navigation ci-dessus (§N) s'applique **partout** et n'est pas
> répété. Ce qui suit ne dit que ce qui **appartient à l'écran**.

> ## 🔴 LIS CECI AVANT LES NUMÉROS — ILS SUIVENT L'ANCIEN ORDRE
>
> **Les identifiants `B0`…`B9` ci-dessous portent la position que chaque écran
> avait AU MOMENT DU RECUEIL**, le 2026-08-14. **Eric a réordonné les étapes à la
> fin de la même séance** *(voir « LE NOUVEL ORDRE DES ÉTAPES », plus bas)*.
>
> ⛔ **Ils n'ont PAS été renumérotés — délibérément** : Eric et l'architecte ont
> employé ces numéros pendant toute la conversation, et les renuméroter aurait
> rendu la moitié des échanges illisibles. **Le nom identifie l'ÉCRAN, pas sa
> place dans la file.**
>
> | Identifiant | L'écran | Position **au recueil** | **NOUVELLE** position |
> |---|---|---|---|
> | `B0` | **Universe & Layers** | 0 | **0** |
> | `B1` | **Concept** → devient **Identity** | 1 | **1** |
> | `B2` | **Class** | 2 | 🔀 **6** |
> | `B3` | **Species** | 3 | **3** |
> | `B4` | **Inheritance** | 4 | 🔀 **5** |
> | `B5` | **Abilities** | 5 | 🔀 **2** |
> | `B6` | **Destiny** | 6 | 🔀 **4** |
> | `B7` | **Skills** | 7 | **7** |
> | `B8` | **Equipment** | 8 | **8** |
> | `B9` | **Review** | 9 | **9** |
>
> 📌 **Quatre écrans changent de place. Six ne bougent pas.**

## B0. Étape 0 — Universe ✅ *validée par Eric le 2026-08-14*

| # | |
|---|---|
| **B0.14** | **SRD / FH** — correct tel quel *pour le moment* |
| **B0.15** | **Campaign codename** — correct |
| **B0.16** | **Langue** — correct : **pas de choix maintenant**, un choix plus tard |
| **B0.17** | **Unités** — correct : pas de choix maintenant ; plus tard **deux options : `metric` et `imperial`** |
| **B0.18** | 🗑️ **Le bouton « Back » disparaît** — la molette le remplace |

## B1. Étape 1 — Concept ✅ *validée par Eric le 2026-08-14*

**« Concept. Rien à rajouter. Sauf les concepts de navigation qui se répètent. »**

🟢 **RIEN DE PROPRE À CET ÉCRAN.** Le contenu (nom · genre · alignement)
**convient tel quel**. Seul le cadre §N s'y applique, comme partout.

📌 **Et c'est cette phrase qui a fait sortir §N d'« étape 0 »** — sans elle, le
cadre de navigation serait resté rangé sous Universe, et le siège suivant
l'aurait pris pour une particularité du premier écran.

⚠️ **Mesure de la partie A à ne pas perdre** : Concept est **le plus court des
dix écrans — 611 px**, contre 27 370 pour Review. **Un écart de 45×.** L'écran
qu'Eric valide sans réserve est aussi le seul qui tienne dans une hauteur d'écran.

## B2. Étape 2 — Class ✅ *validée par Eric le 2026-08-14 — **DEUXIÈME VERSION***

> ⚠️ **UNE PREMIÈRE VERSION A ÉTÉ ÉCRITE PUIS RETIRÉE.** Eric : *« attends je
> reviens sur ce que j'ai dit »*. Elle décrivait des dalles de classes en grille
> et une dalle majeure plein écran ouverte au toucher. **Elle ne vaut plus** — ce
> qui suit la remplace intégralement.

### B2.0 — le défaut constaté par Eric sur cet écran

**« Problème du scroll qui remonte en haut sans prévenir. »**
→ C'est le défaut mesuré en **partie A §0** : `shell.mjs:657` fait
`app.innerHTML = ""` à chaque clic, et **rien ne conserve la position**.
📌 **Eric l'a rencontré à l'usage sans connaître la cause ; la cause était
mesurée avant qu'il ne le signale.** Les deux se confirment.

### B2.1 — la disposition : deux colonnes

```
┌────┬───────────────────────────┐
│ 🗡 │  ▓▓▓ image ▓▓▓            │
│Barb│  ambiance…                │   les fiches s'enchaînent
│ 🎵 │  features…                │   dans UN SEUL défilement
│Bard│  ─────────────────        │
│ ✚  │  ▓▓▓ image ▓▓▓            │
│Cler│  ambiance…                │
└────┴───────────────────────────┘
 étroite   prend TOUT le reste
```

| # | |
|---|---|
| **B2.1a** | **Colonne de gauche : ÉTROITE** — elle porte **juste le nom de la classe, voire des icônes**. Rien d'autre |
| **B2.1b** | **Colonne de droite : tout le reste de l'espace** |
| **B2.1c** | **C'est la colonne de DROITE qui défile**, et elle porte images et descriptions |
| **B2.1d** | **Un scrollspy** relie les deux : la gauche suit ce qu'on regarde à droite |
| **B2.1e** | ⛔ **PAS de menu interne, PAS de boutons dans la fiche.** On **défile simplement** : **image → ambiance → features** |

**Ce que « features » contient** *(dicté par Eric)* : **skill pool · HP · primary
ability · saves · other features**.

### B2.2 — le VALIDATE se presse DEUX FOIS ✅ *précisé par Eric*

**« Il faut le pousser pour valider dans le menu choix, et le pousser à nouveau
quand les choix sont faits. »**

| | Geste | Effet |
|---|---|---|
| **1ᵉʳ appui** | Validate *(illuminé)* | la **fenêtre majeure disparaît** et **le menu des choix apparaît** |
| **2ᵉ appui** | Validate *(illuminé à nouveau)* | **passe à l'étape 3** |

⭐ **Et c'est le même bouton que partout** : *« c'est notre menu constant tout en
haut ; le défilement des étapes, Validate et Show plan restent persistants »*.
**Aucun bouton d'action n'est ajouté dans la fiche** — la barre du haut porte
toute l'action, et **Validate s'illumine quand les conditions sont remplies**
*(B0.11)*.

### B2.3 — le menu des choix intrinsèques

Une **fenêtre majeure** composée de **dalles INTERMÉDIAIRES** *(cf. B0.23)* :

| Dalle | Contenu |
|---|---|
| **1** | **class skill 1** — une molette |
| **2** | **class skill 2** — une molette |
| **3…** | **les autres choix**, s'il y en a |

Quand **tous les choix sont faits**, **Validate brille dans la molette
supérieure** → 2ᵉ appui → étape 3.

### ✅ B2.4 — LE VALIDATE EST UN BOUTON À PALIERS *(réponse d'Eric, 2026-08-14)*

**« Il s'illumine chaque fois qu'un choix est possible. Validate 1 = classe
choisie. Validate 2 = features choisis. »**

| Appui | Ce qu'il CONFIRME | Effet |
|---|---|---|
| **Validate 1** | **la classe choisie** | la fenêtre majeure disparaît, le **menu des choix** apparaît |
| **Validate 2** | **les features choisis** *(class skills…)* | **passe à l'étape 3** |

### 🔴 LE GESTE DE CHOIX EST LE DÉFILEMENT LUI-MÊME ✅ *tranché par Eric, 2026-08-14*

**Ses mots : « avoir fait défiler à l'endroit approprié · pousser le bouton de
valid 1 · features et molettes · pousser le bouton valid 2. »**

⛔ **IL N'Y A AUCUN GESTE DE SÉLECTION.** On **défile jusqu'à la bonne classe**,
et on pousse Validate. **La fiche qu'on regarde EST la classe choisie.**
⭐ **Le scrollspy n'est donc pas un simple repère : c'est le SÉLECTEUR** — ce qui
explique qu'Eric l'ait demandé dès sa première phrase sur cet écran.

> ⚠️ **ERREUR DE L'ARCHITECTE, CORRIGÉE PAR ERIC — gardée ici exprès.**
> J'avais déduit de *« Validate 1 = classe **choisie** »* qu'une sélection
> précédait l'appui, et j'avais écrit que l'hypothèse « on choisit en s'arrêtant
> devant » était **ÉCARTÉE**. **C'était faux, et je l'avais écrit avec
> assurance.** Sa phrase suivante l'a démenti en une ligne.
> 📌 *La forme de la faute : avoir tiré une conclusion structurelle d'un mot
> (« choisie ») au lieu d'attendre le geste.*

### ⚙️ Ce que ça impose au constructeur, et qui n'est pas trivial

**UNE SEULE FICHE EST À L'ÉCRAN À LA FOIS** ✅ *(Eric, 2026-08-14)* :

> *« La molette d'icônes scrollspy de classe affiche probablement 4 icônes d'un
> coup. Mais **seule une fiche de classe est présente à l'écran**. »*

| # | |
|---|---|
| **B2.1f** | **La fiche occupe tout l'espace visible — une classe à la fois.** Défiler fait passer d'une fiche à la suivante |
| **B2.1g** | La **molette de gauche montre environ 4 icônes d'un coup** — une fenêtre glissante sur les 12. ⏳ *« probablement » : le chiffre est indicatif, pas arrêté* |

⭐ **Et ça lève l'essentiel de la difficulté ci-dessus** : si une seule fiche est
présente, **la « fiche courante » n'est plus ambiguë** — c'est celle qu'on voit.
`Validate 1` confirme celle-là.

### ✅ B2.1h — LE DÉFILEMENT EST AIMANTÉ : `scroll-snap` *(Eric, 2026-08-14)*

**« Scroll snap alors. »** — la question posée, la réponse donnée dans la
seconde. **Ce n'est plus une lecture de l'architecte, c'est la décision d'Eric.**

**Ce que ça règle définitivement** : le défilement **s'aimante sur une fiche**,
donc il n'existe **aucun état où deux fiches se partagent l'écran au repos**.
🔴 **La « fiche courante » cesse d'être une question** — elle est *celle sur
laquelle le défilement s'est posé*, et **c'est elle que `Validate 1` confirme**.

📌 **Conséquence pour le scrollspy** : il ne « devine » plus rien non plus. Il
suit le point d'aimantation, donc **l'icône surlignée à gauche et la fiche
validée sont la même chose par construction** — impossible de les faire diverger.

⛔ **Vaut aussi pour l'étape 3 (Species)**, puisque `B3 = B2`.

> ### ⭐ ET C'EST UNE RÈGLE COMMUNE, PAS UNE PARTICULARITÉ DE CLASS
>
> **Validate n'est pas « le bouton de fin d'étape » : c'est un bouton à
> PALIERS.** Il s'illumine **chaque fois qu'un choix est possible**, et un même
> écran peut en compter plusieurs. Sur Class il y en a deux ; ailleurs il y en
> aura un, ou trois.
>
> 📌 **Ça précise `B0.11`** *(« il s'allume quand toutes les conditions sont
> remplies »)* : les conditions sont celles **du palier courant**, pas de
> l'écran entier. **Le siège suivant doit lire B0.11 à travers cette phrase.**

### 🎬 B2.5 — LE PARCOURS COMPLET, DICTÉ PAR ERIC *(scénario d'acceptation)*

> **Ses mots, le 2026-08-14 :**
>
> 1. *« J'arrive sur le menu des classes »*
> 2. *« je fais défiler »*
> 3. *« je choisis **Fighter** »*
> 4. *« je pousse Validate une première fois »* — **l'unique Validate tout en haut**
> 5. *« arrivée dans le menu des choix de features »*
> 6. *« je règle mes molettes de choix comme il faut »*
> 7. *« je clique Validate une deuxième fois »* — **l'unique Validate tout en haut**

🔴 **CE QU'ERIC A RÉPÉTÉ DEUX FOIS, ET QUI EST DONC LA CONSIGNE** :
**« L'UNIQUE Validate tout en haut. »**
⛔ **Il n'existe qu'UN SEUL bouton Validate dans toute l'interface** — celui de
la barre persistante. **Aucun écran, aucune fenêtre majeure, aucun menu de choix
n'a le droit d'en poser un second.** Le même bouton change simplement de ce
qu'il confirme, palier après palier *(B2.4)*.

📌 **Et « je choisis Fighter » (étape 3) veut dire « j'ai fait défiler jusqu'à
Fighter »** — Eric l'a précisé juste après : *« avoir fait défiler à l'endroit
approprié »*. **Le choix n'est pas un tap, c'est une position de défilement.**

⚠️ **Mesure de la partie A à raccrocher** : Class fait **2 012 px** pour **31
boutons**. La disposition décrite ici **allonge** la colonne de droite (douze
fiches enchaînées, chacune avec image + ambiance + features) — donc **la
conservation du scroll (§0) devient critique sur cet écran**, pas optionnelle.

## B3. Étape 3 — Species ✅ *validée par Eric le 2026-08-14*

**« L'étape 3 va être identique à la 2. »**

🟢 **TOUTE LA STRUCTURE DE `B2` S'APPLIQUE TELLE QUELLE** — colonne gauche
étroite (noms, voire icônes) · colonne droite qui défile (image → ambiance →
features) · scrollspy entre les deux · aucun bouton dans la fiche · **Validate à
paliers** dans la barre du haut.

⛔ **Ne recopie pas B2 ici.** Une règle écrite deux fois diverge — c'est la loi
du dépôt, et elle a déjà coûté (deux échelles typographiques sous les mêmes
noms, cf. l'en-tête de ce fichier). **B3 = B2, point.**

### ⚠️ Les deux points où Species N'EST PAS Class — mesurés, non tranchés

| | La mesure | La question |
|---|---|---|
| **Species porte un BUDGET de compétences** | mesuré à l'écran : *« Species skill budget — 2 of 2 points spent »*, sur `delve` / `survival` / `vigilance` | **Le 2ᵉ palier de Validate est-il ce budget ?** Sur Class, `Validate 2 = features choisis`. L'équivalent ici serait *« budget d'espèce dépensé »* — **inféré, pas dit par Eric** |
| **Son compteur DISPARAÎT au défilement** | `position: static` — Species est **l'un des trois écrans** touchés par le défaut **A-1.1**, avec Inheritance et Skills | Le « flottant pour voir le compte » demandé par Eric **vaut donc ici aussi** |

📌 **Mesures de la partie A** : Species = **1 540 px**, **24 boutons**, 12 espèces
— presque le même volume que Class (2 012 px, 31 boutons). **La symétrie
qu'Eric décrète est cohérente avec ce que les deux écrans pèsent.**

---

## B4. Étape 4 — Inheritance ✅ *validée par Eric le 2026-08-14*

### B4.1 — L'état d'arrivée : deux dalles, deux cases à cocher

```
        ┌──────────────────┐
        │ ○  Ability boost │      centrées
        └──────────────────┘
        ┌──────────────────┐
        │ ○  Origin feat   │
        └──────────────────┘
```

| # | |
|---|---|
| **B4.1a** | **Deux dalles au premier abord**, **centrées** : `Ability boost` et `Origin feat` |
| **B4.1b** | Chacune porte un **petit cercle de validation, non coché** — c'est un **indicateur d'état**, pas un bouton |
| **B4.1c** | ✅ **L'ORDRE EST LIBRE** *(Eric)* : *« on peut choisir l'ordre qu'on veut »*. Le parcours décrit ci-dessous en est **un** parmi deux, pas une contrainte |

### B4.2 — Ability boost, une fois ouvert

**Origin feat DISPARAÎT** pendant qu'Ability boost est ouvert.

| Dalle | Contenu |
|---|---|
| **intermédiaire 1** | **« Ability Boost » — l'explication**, pleine largeur |
| **intermédiaires 2 à 7** | **six petites dalles CÔTE À CÔTE**, une par caractéristique, chacune avec une **molette verticale** |

**Chaque molette porte exactement trois choix : `0` / `+1` / `+2`.**

🔴 **L'ORDRE EST CELUI DU SRD** *(tranché par Eric — sa dictée disait
`FOR·DEX·CON·SAG·INT·CHA`, il a corrigé)* :

| 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| **STR** | **DEX** | **CON** | **INT** | **WIS** | **CHA** |

*(en anglais à l'écran — l'interface est en anglais, cf. `B0.16`)*

### 📏 B4.3 — LES SIX COLONNES TIENNENT-ELLES SUR 360 px ? — mesuré

Eric : *« je pense que ça passe pour les 6, on a toute la largeur — à vérifier »*.
**Vérifié, à 360×780 :**

| | |
|---|---|
| Carte | **328 px** |
| **Padding interne** | **32 px de chaque côté** |
| **Largeur utile** | **264 px** |
| **Six colonnes** | **44,0 px** chacune |
| **Six colonnes + 4 px de gouttière** | **40,7 px** |

**Verdict : ça passe, mais tout juste et sans marge.** 44 px est *exactement* le
seuil tactile d'Apple, et on repasse **dessous** dès qu'on ajoute une gouttière
(Google recommande 48).

⭐ **ET LE COUPABLE N'EST PAS LE NOMBRE DE COLONNES — c'est le PADDING de 32 px**,
qui mange **64 px, soit 18 % de la largeur de l'écran**. À **16 px** de padding,
la largeur utile passerait à **296 px**, donc **49,3 px par colonne** — au-dessus
du seuil de Google, gouttière comprise.
📌 **Ce padding vient du desktop et n'a jamais été repensé pour 360.** C'est un
réglage à faire **avant** de conclure que six colonnes ne tiennent pas.

### ⏳ B4.3bis — UNE DALLE POURRA AVOIR SON PROPRE DÉFILEMENT *(éventualité, Eric)*

**« Il faudra peut-être scroller à l'intérieur de la dalle. »**

⏳ **Noté comme ÉVENTUALITÉ, pas comme décision** — Eric dit *« peut-être »*.

🔴 **MAIS ÇA ENTRE EN TENSION AVEC LE `scroll-snap` DE `B2.1h`, et il faut le
savoir AVANT de construire :** un défilement imbriqué dans un défilement aimanté
rend **le geste ambigu**. Quand le doigt glisse vers le haut, l'appareil doit
décider : *je fais défiler l'intérieur de la dalle*, ou *je saute à la fiche
suivante* ? **C'est le piège classique du scroll dans le scroll sur mobile**, et
il ne se règle pas au CSS seul.

**Trois issues connues, aucune tranchée par Eric :**

| | |
|---|---|
| **(a)** | la dalle défile **jusqu'au bout**, puis le geste « passe la main » à la page *(chaînage)* |
| **(b)** | la dalle ne défile **pas** — on la découpe pour qu'elle tienne, quitte à ajouter des dalles |
| **(c)** | le défilement interne est **horizontal**, donc orthogonal au défilement vertical de la fiche — plus d'ambiguïté de geste |

📌 **La (c) est celle qui coûte le moins de code**, parce qu'elle supprime le
conflit au lieu de l'arbitrer — mais elle change la forme de la dalle. **À poser
à Eric quand cette dalle-là sera dessinée**, pas maintenant.

### B4.4 — Le parcours *(un ordre possible parmi deux)*

1. les six molettes réglées → **Validate s'illumine** ;
2. **appui sur Validate** → **toutes les fenêtres intermédiaires disparaissent**, et **`Ability boost` est coché** ;
3. **`Origin feat` redevient poussable** ;
4. son choix se fait **exactement comme Class et Species** — défilement **aimanté** + scrollspy *(cf. `B2`)* — mais **UNE SEULE validation suffit** ;
5. une fois validé, **tout se ferme** ;
6. **les deux cercles sont cochés**, **Validate est illuminé**.

### ⭐ B4.5 — ON N'EST PAS OBLIGÉ DE PASSER PAR VALIDATE POUR AVANCER

**« On peut pousser Validate pour avancer, ou juste faire défiler la molette. »**

🔴 **C'est la première fois qu'Eric le dit explicitement, et ça vaut PARTOUT** :
**Validate est un raccourci, pas un passage obligé.** La molette des étapes
permet de quitter un écran fini **sans** toucher au bouton.
📌 **À rapprocher de `B0.12`** (*« le cliquer passe à l'étape suivante sans
passer par la molette »*) : **les deux chemins existent, aucun n'est prioritaire.**

⚠️ **Mesure de la partie A à raccrocher** : Inheritance fait **6 628 px** pour
seulement **26 boutons** — le 4ᵉ écran le plus long, et sa longueur vient de **la
prose SRD des dons affichée en entier**. La structure décrite ici (deux dalles
repliées, ouverture à la demande) **s'attaque directement à ce défaut** : au
repos, l'écran ne montre plus que deux dalles. Et son compteur est l'un des
**trois** en `position: static` *(défaut A-1.1)*.

---

## B5. Étape 5 — Abilities ✅ *validée par Eric le 2026-08-14*

> ⚠️ **UNE PREMIÈRE FORMULATION A ÉTÉ ABANDONNÉE EN COURS DE PHRASE** : *« 5 choix
> en scroll horizontal scrollspy… ou fais une molette type Species/class »*.
> **Elle ne vaut pas.** Ce qui suit la remplace : **quatre dalles-boutons**.

### B5.1 — L'écran au repos

| # | |
|---|---|
| **B5.1a** | Un **texte explicatif pleine largeur**, dans une **dalle SIMPLE** |
| **B5.1b** | **Quatre dalles-boutons SIMPLES** : `Roll dice` · `Standard array` · ~~`Point buy`~~ · `Choose yourself` — ✅ **TRANCHÉ 2026-08-14 : TROIS, pas quatre** *(voir ci-dessous)* |
| **B5.1c** | **Il faut CLIQUER** pour faire apparaître les rollers / choosers — rien n'est déplié d'avance |

> ### ✅ TRANCHÉ PAR ERIC — 2026-08-14 : **`Point buy` n'est pas offerte**
>
> **Mesuré** : son budget de points et ses coûts non linéaires n'existent
> **nulle part** — ni dans `layers/srd-5.2.1-en.layer.json`, ni dans le moteur.
> Les écrire dans l'écran mettrait **une règle du jeu dans l'interface** (loi
> du dépôt) et publierait des nombres dont **on ne sait pas s'ils sont SRD** —
> ce que **§0.8 interdit**.
>
> ⛔ **Et une tuile morte serait pire que trois tuiles** : c'est le « faux
> magasin » que le mandat interdit. **Trois méthodes, et la quatrième revient
> le jour où son barème a une source citable** — Eric la fournit, ou on la lit
> dans une couche. Elle ne s'écrit pas dans l'écran, jamais.

### B5.2 — `Roll dice`

| # | |
|---|---|
| **B5.2a** | Une **fenêtre simple « Rolling method »**, contenant une **molette** : **`FH 3D6`** ou **`4D6`** |
| **B5.2b** | ✅ **`4D6` = quatre dés, on ÉCARTE LE PLUS BAS et on garde les trois meilleurs** *(confirmé par Eric — sa dictée disait « keep one », il manquait un mot)* |
| **B5.2c** | Une **fenêtre explicative pleine largeur** dont **le contenu change selon le choix** |
| **B5.2d** | **Valid s'illumine**, et **on clique** — 📌 **motif donné par Eric : « pour éviter de faire ramer le mobile »**. Le résultat ne se recalcule pas en continu pendant qu'on tourne la molette |

### B5.3 — Les jets

| # | |
|---|---|
| **B5.3a** | **On utilise les dés de la fiche v1** |
| **B5.3b** | **Un par un** : ~**1 seconde** chacun, en appuyant sur `Roll` à chaque fois |
| **B5.3c** | **Ou tout d'un coup — et dans ce cas, PAS de dés** *(aucune animation)* |
| **B5.3d** | **Tout est noté en dessous des dés, au fur et à mesure, sur une ligne** |

### 🔴 B5.4 — DEUX TEMPS À NE PAS CONFONDRE : garder, PUIS affecter

**Eric : « il faut garder les 6 meilleurs pour la 3D6 AVANT de faire
l'affectation ».**

| Temps | Ce qui se passe |
|---|---|
| **1 — le tri** | la méthode FH tire **dix** jets de 3d6 et **on garde les six meilleurs** |
| **2 — l'affectation** | ces **six résultats** se répartissent sur les six caractéristiques |

⭐ **Le moteur fait DÉJÀ le temps 1** — `ui/builder/dice.mjs` : `rollTen()` puis
`markKept()` retient les six plus grands totaux, et `rollAbilitySet()` **relance
le lot entier** si aucun des dix n'atteint 15 *(règle d'Eric, ADDENDUMS §4)*.
**Ce n'est donc pas à réinventer, seulement à présenter.**

> ### 🔴 TRANCHÉ PAR ERIC — 2026-08-15 : LE VOCABULAIRE DES ORGANES DE CHOIX
>
> **Le mot « molette » désignait QUATRE organes différents dans cette spec.**
> C'est pour ça que le builder a livré des rangées de boutons partout : Eric,
> devant le déployé, *« toujours pas de molettes de choix type iOS »*. Il a
> montré cinq captures, l'architecte les a nommées, il a validé :
>
> | Le nom | Ce qui le définit | Où |
> |---|---|---|
> | **Barillet** *(picker iOS)* | fenêtre verticale de 5-7 valeurs, sélection dans une **bande centrale fixe**, voisines estompées ; **plusieurs colonnes indépendantes** | B4.2 · B5.5 · `Choose yourself` |
> | **Carrousel horizontal** | file aimantée qui **déborde** de l'écran ; des **sections**, pas des valeurs | B7.1 · B8.1 |
> | **Carrousel vertical** | idem, en colonne — *« 4 icônes d'un coup, une fenêtre glissante sur les 12 »* | B2.1g |
> | **Ceinture** | la barre des dix étapes. Elle **navigue**, elle ne choisit pas | B0 — ⛔ **exclue, ne pas y toucher** |
> | **Rangée** | tout visible, rien ne défile | ce que le builder fait **partout** aujourd'hui |
>
> ## ⭐ LA RÈGLE D'ERIC, QUI REMPLACE L'ÉNUMÉRATION
>
> > ***« Globalement, dès qu'il y a des chiffres. »***
>
> **Des chiffres → barillet. Des mots → carrousel.** Une règle qu'on peut
> appliquer à un écran qui n'existe pas encore, là où une liste d'emplacements
> aurait vieilli au premier écran neuf.
>
> ⭐ **Et elle attrape un cas que l'énumération avait raté** : `Choose yourself`
> (B5.1b) offre **seize valeurs, 3 à 18** — aujourd'hui seize boutons en
> rangée. C'est l'emploi le plus évident d'un barillet, et il ne figurait dans
> aucune liste.
>
> ⚠️ **Le cas limite, tranché par l'architecte faute d'instruction** : la
> méthode de jet (B5.2a, `FH 3D6` / `4D6`) porte des chiffres, mais ce sont des
> **noms de méthode**, pas des valeurs — et il n'y en a que deux. **Elle reste
> une paire de tuiles.** Eric peut renverser d'un mot.
>
> ⚠️ **ET L'ARCHITECTE A AGGRAVÉ LE MALENTENDU AU LOT 63** : six valeurs
> empilées faisaient 370 px de haut, alors la molette **verticale** de B5.5 est
> devenue un **défilement horizontal**. Une optimisation de hauteur qui
> s'éloignait de ce qu'Eric avait décrit, décidée sans le lui demander.
>
> **La hauteur est tranchée** : ~130 px pour trois valeurs visibles contre
> 52 px aujourd'hui. *« Le barillet vaut la hauteur »* — la fiche défile déjà.

### B5.5 — La répartition

- des dalles avec les **6 caractéristiques**, chacune portant une **molette** ;
- **six choix par molette** — *idem `B4` (Inheritance), sauf qu'il y en a 6 au lieu de 3* ;
- **ordre SRD, confirmé une seconde fois par Eric** :

| 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| **STR** | **DEX** | **CON** | **INT** | **WIS** | **CHA** |

- choix faits → **Valid s'illumine**.

> ### ⚠️ B5.6 — LE PIÈGE DES DEUX 14, ET IL EST DÉJÀ RÉSOLU DANS TON PROPRE OUTIL
>
> Les six choix d'une molette sont **six RÉSULTATS**, et deux d'entre eux peuvent
> être **identiques**. Si une molette retient une **valeur**, on ne peut plus
> savoir **lequel des deux 14** a déjà été placé.
>
> ⭐ **Le builder v1 d'Eric le résout, `~/tools/fh-skills/fh-skill-builder.html`
> ligne 731** :
> ```js
> assign: {STR:null, DEX:null, CON:null, INT:null, WIS:null, CHA:null}  // ability -> index into set.kept
> ```
> **Une caractéristique pointe vers l'INDEX d'un dé, jamais vers sa valeur** — et
> `null` dit *« pas encore distribué »*, un état que l'écran v2 actuel ne sait pas
> exprimer.
>
> ⛔ **À reprendre tel quel.** Le mandat porte déjà la leçon : *ce siège n'ouvre
> pas spontanément les fichiers d'Eric, et c'est Eric qui a dû l'y envoyer.*

### B5.7 — Les trois autres méthodes

`Standard array` · `Point buy` · `Choose yourself` : **plus ou moins la même
chose, MAIS SANS DÉS** *(Eric)*. Le temps 1 (tirer/garder) disparaît ; le temps 2
(affecter aux six caracs) demeure.

⚠️ **Mesure de la partie A à raccrocher** : Abilities fait **1 374 px** pour **6
boutons** — c'est l'un des écrans les plus courts. La structure décrite ici
**l'allonge** (quatre méthodes, dés, ligne de résultats, six molettes), mais tout
est **replié au repos** *(B5.1c)*, donc l'écran ne grandit qu'à la demande.
📌 **Et c'est de cet écran qu'Eric disait : « les répartitions de caracs marchent
mais pas du tout ergonomiques ».**

---

## B6. Étape 6 — Destiny ✅ *validée par Eric le 2026-08-14*

> 🔗 **RÉFÉRENCE VISUELLE DONNÉE PAR ERIC** : `https://randomtarotcard.com/TheSun.html`
> — *« on fait comme sur ce site »*. ⚠️ **Non consultée par ce siège** : à ouvrir
> par celui qui construira l'écran.

### B6.1 — La séquence

| # | |
|---|---|
| **B6.1a** | Un **petit texte explicatif**. On clique **OK**, **il disparaît** — *« effet théâtral »* |
| **B6.1b** | **Une seule carte, GRAND FORMAT**, qui prend **un maximum d'espace**, **de dos**, **flottant sur une dalle MAJEURE**. ⛔ **Rien d'autre à l'écran que la carte** |
| **B6.1c** | 🔴 **ON TAPE LA CARTE POUR QU'ELLE SE RETOURNE** *(Eric)* |
| **B6.1d** | **Le texte apparaît UNE SECONDE APRÈS** le retournement, dans une **fenêtre SIMPLE**, en dessous : ce que fait la carte |

> ### ⚠️ RÉVISÉ PAR ERIC — 2026-08-15 : **3 SECONDES, PAS UNE**
>
> *« On doit avoir le temps de la voir entière avant qu'elle rapetisse. »*
> Puis, à la question « combien ? » : ***« 3 secondes »***.
>
> **Le chiffre disait pourquoi une seconde ratait sa cible** : le retournement
> dure **0,45 s**, le texte arrivait à **1 s** — il restait **550 ms** de carte
> entière. Et à cet instant la fiche **rétrécit d'un coup** pour faire place au
> texte : la transition du CSS porte sur `transform`, pas sur la taille.
>
> 📌 **Deux remèdes lui ont été proposés** — retarder le texte, ou adoucir le
> rétrécissement. **Il a choisi le délai.** Le rétrécissement reste donc
> brutal, et c'est un choix, pas un oubli.
>
> ⭐ **La condition est gardée, pas commentée** (`tests/destiny-delai.test.mjs`) :
> le garde ne protège pas « 3000 », il protège *« le texte arrive après le
> retournement, et laisse au moins 2 s de contemplation »*. Les deux nombres
> vivaient dans deux fichiers sans se connaître — rallonger l'animation CSS
> rognait le temps de pose sans qu'une ligne de JS bouge.
| **B6.1e** | **Valid s'illumine** |
| **B6.1f** | **Deux petits boutons**, chacun dans une **fenêtre simple** : **`Draw again`** et **`Choose yourself`** |
| **B6.1g** | **`Choose yourself`** fait **défiler les cartes** comme `B2`/`B3` *(défilement aimanté + scrollspy)*, **texte explicatif inclus** |
| **B6.1h** | **Les deux boutons restent visibles** |

### ⚖️ B6.1bis — LES IMAGES DE CARTES : position d'Eric sur les droits

**« C'est du domaine public, donc pas d'embrouilles sur les droits — en plus je
les possède. »**

📌 **Consigné comme la position d'Eric, telle qu'il l'a exprimée.** Ce siège ne
la valide ni ne l'infirme : le juridique est *« une problématique de premier
rang »* du chantier, et ce n'est pas un domaine où l'architecte tranche.
⚠️ **Une seule remarque, factuelle** : *posséder un exemplaire physique* et
*détenir un droit de reproduction* sont deux choses distinctes — mais **si les
images sont bien dans le domaine public, la question ne se pose pas**, et c'est
l'argument qu'Eric avance en premier.
📌 **Le conseiller SRD (règles + juridique) existe** *(mandat §6)* si la question
doit être instruite.

### 🔴 B6.2 — RIEN N'EST ACTÉ TANT QUE `Valid` N'EST PAS TAPÉ

**« Tant que Valid n'est pas tapé, ça n'est pas acté. »**
**`Draw again` est ILLIMITÉ** *(Eric)* — on retire autant qu'on veut.

📌 **Cohérent avec une décision d'Eric du 2026-08-13**, qu'il a reconfirmée ici :
*« le lot de dix dés ne survit pas, seul le résultat compte »* — **aucun
historique n'est conservé**, ni des dés, ni des cartes écartées.
⭐ **Conséquence pour le moteur** : le tirage n'a **pas** besoin d'être
reproductible, et **la question de la graine injectable n'a pas d'objet** — c'est
exactement ce qui avait dissous le « lot moteur du hasard » le 2026-08-13.

### ⭐ B6.3 — L'EXCEPTION GESTUELLE DE TOUT LE BUILDER

**C'est le SEUL endroit où l'on TAPE un élément pour déclencher quelque chose.**
Partout ailleurs, le choix se fait **en défilant** *(`B2.1h` : le défilement
aimanté EST le sélecteur)*, et les seuls autres taps portent sur des **boutons**
— `Validate`, `Show plan`, les quatre méthodes de `B5`, les deux dalles de `B4`.

⚠️ **À dire dans la commande du lot** : cette exception est **délibérée** — c'est
le geste de retourner une carte, il n'a pas d'équivalent ailleurs. **Ne pas
l'« harmoniser » avec le reste.**

⚠️ **Mesure de la partie A à raccrocher** : Destiny fait **1 463 px** pour **6
boutons** — un des écrans les plus courts, et le Score de Destinée s'y affiche
déjà correctement *(défaut réparé le 2026-08-13)*. La refonte décrite ici est
**théâtrale, pas structurelle** : une carte plein écran remplace une liste.

---

## B7. Étape 7 — Skills ✅ *validée par Eric le 2026-08-14*

> 🔴 **C'est l'écran sur lequel Eric a le plus buté**, et le plus mesuré en
> partie A : **16 513 px**, **266 boutons**, six sections rendues d'un coup.
> Eric ouvre d'ailleurs sa description par : *« le problème du scroll,
> souviens-toi »* → **partie A §0**, `app.innerHTML = ""`.

### B7.1 — Ce qui FLOTTE, et ce qui ne flotte pas

| | Élément | |
|---|---|---|
| 🔒 | **Molette horizontale de catégories** — `Knowledge · Social · Explo · Physique · Tools` | **flotte** |
| 💬 | **Fenêtre de commentaire** *(dalle simple)* | ⚠️ **devenue un POPUP — voir B7.7** |
| 🔒 | **`Reset`** — **dans la BARRE DU POOL** *(ligne 1)* | **flotte**, donc toujours atteignable |
| 🔒 | **Ligne 1 — `Pool · Invested · Left`** | **flotte** |
| 📜 | **Ligne 2 — le calcul, écrit plus petit** : `Class / Species / Feats = X` | **disparaît dans le scroll** |

⭐ **C'est la réponse à son propre défaut A-1.1** (*« je voudrais un flottant pour
voir le compte, ça disparaît »*) : **le compte flotte, le détail du calcul non.**
📌 **La distinction est fine et volontaire** — on garde sous les yeux *combien il
reste*, pas *d'où ça vient*.

### B7.2 — Species skills : verrouillé, mais pas muet

| # | |
|---|---|
| **B7.2a** | **Species skills est DÉJÀ VERROUILLÉ** |
| **B7.2b** | Si on y touche → **un petit commentaire s'affiche dans la fenêtre de commentaire**, qui **repose le choix** au joueur s'il veut changer |
| **B7.2c** | **Une couleur spécifique marque le PLANCHER** |
| **B7.2d** | 🗑️ **Le tableau « Species skill budget » DÉGAGE** |

### B7.3 — Les catégories

| # | |
|---|---|
| **B7.3a** | **Chaque catégorie flotte sur une dalle MAJEURE pleine largeur** |
| **B7.3b** | ⛔ **Ne pas re-préciser « Knowledge » en titre** — *« le spy et le snap le rendent évident »*. La molette surligne déjà la catégorie courante |
| **B7.3c** | 🔴 **Le texte des skills doit tenir SUR UNE LIGNE** |
| **B7.3d** | **Valid s'illumine quand le compte est bon** |

### 🔴 B7.4 — LE BOUTON « 0 » EST SUPPRIMÉ — et ça débloque tout

**« Le bouton 0 est obsolète. Rien de rempli = 0. »**

**Il reste TROIS ronds**, aux **conventions D&D Beyond** :

| | | |
|---|---|---|
| ◐ | **demi-plein** | half |
| ● | **plein** | proficient |
| ◉ | **plein entouré** | expertise |

**L'état « aucune maîtrise » n'est plus un bouton : c'est l'absence de
remplissage.**

📌 **Comment revient-on à 0 ? C'est DÉJÀ codé** — `ui/builder/carnet.mjs:122` :
`if (active && onClear) onClear();`. **Re-toucher le rond actif l'efface.** Rien
à inventer.

### 📏 B7.5 — LA MESURE QUI VALIDE « UNE LIGNE » — et ce que la suppression du 0 a débloqué

Eric autorise : *« on optimise les marges, on optimise la taille du texte, on
raccourcit les termes si nécessaire »*. **Mesuré : ce ne sera peut-être pas
nécessaire.**

Nom le plus long mesuré : **« Sleight of Hand » ≈ 109 px** à T3 (14 px), **94 px**
à T2 (12 px). *(Estimation ±5 %, à confirmer sur la police réelle.)*

| Ronds | 4 ronds *(avant)* | **3 ronds** *(après B7.4)* |
|---|---|---|
| **24 px** *(actuel)* | 156 px ✅ | — |
| **44 px** *(seuil Apple)* | **76 px ❌** | **124 px ✅** |
| **48 px** *(seuil Google)* | **60 px ❌** | **112 px ✅** |

⭐ **AVEC QUATRE RONDS, « une ligne » et « touches au doigt » étaient
INCOMPATIBLES à 360 px. Avec trois, les deux passent — sans même toucher au
padding de 32 px.** La suppression du bouton « 0 » n'était pas un détail
d'affichage : **c'est ce qui rend l'écran faisable au doigt.**

**Marge disponible si on optimise quand même** : padding 32 → 16 px donne
**144 px** pour le nom au lieu de 112. *(Le padding de 32 px vient du desktop —
voir aussi `B4.3`, où il coûtait déjà 18 % de la largeur.)*

### ✅ B7.7 — LA FENÊTRE DE COMMENTAIRE DEVIENT UN POPUP *(Eric, 2026-08-14)*

**« Le texte peut être un popup, disparaît si on clique dehors. Il se réveille à
chaque écart. »**

| # | |
|---|---|
| **B7.7a** | Le commentaire n'est **plus une barre permanente** : c'est un **popup** |
| **B7.7b** | **Il disparaît si on clique en dehors** |
| **B7.7c** | **Il se réveille à CHAQUE ÉCART** — chaque fois que le joueur tente quelque chose que les règles refusent *(toucher un `species skill` verrouillé, dépasser le pool…)* |

⭐ **ET ÇA RÈGLE LA TENSION DES BARRES EMPILÉES** *(ci-dessous)* : **on passe de
CINQ barres fixes à QUATRE.** Le commentaire ne coûte plus de hauteur au repos —
il n'en prend que quand il a quelque chose à dire.

📌 **Le moteur sait déjà quand il y a « écart »** : `validate()` publie des
**violations** en `{key, params, path}` *(payé le 2026-08-13)*, et `rebuild`
rend des `warnings`. **Le popup a donc une source, il n'a pas à deviner.**

### ✅ B7.8 — OÙ VA `Reset` *(Eric, 2026-08-14)*

🔴 **`Reset` est dans la BARRE DU POOL** — la **ligne 1** (`Pool · Invested ·
Left`), **celle qui flotte**. Il reste donc **toujours atteignable**, sans
remonter.

> ⚠️ **ERREUR DE L'ARCHITECTE, CORRIGÉE PAR ERIC — gardée exprès.**
> Sa formulation était *« à droite du calcul de points »*. J'ai lu « calcul » =
> **ligne 2** (`Class / Species / Feats = X`), celle qui défile, et j'en ai tiré
> toute une justification — *« Reset est destructeur, le sortir du champ
> permanent évite les gestes accidentels »*. **Élégant et faux.** Sa correction :
> *« non, elle est dans la barre du pool »*.
> 📌 **La forme de la faute : avoir bâti un raisonnement sur une lecture
> ambiguë au lieu de demander laquelle des deux lignes.** C'est la deuxième fois
> de la session *(cf. `B2` — le geste de choix)*.

### ⚠️ B7.6 — QUATRE BARRES FIXES EMPILÉES — signalé, non tranché

En comptant le cadre commun **et** cet écran :

| | |
|---|---|
| 1 | la **molette des étapes** *(§N)* |
| 2 | la ligne **`Show plan` / `Validate`** *(§N)* |
| 3 | la **molette des catégories** |
| 4 | la ligne **`Pool · Invested · Left`** |
| ~~5~~ | ~~la fenêtre de commentaire~~ — ✅ **devenue un popup** *(B7.7)*, ne coûte plus de hauteur au repos |

**Sur un écran de 780 px, à ~40 px la barre, ça reste ~20 % de la hauteur figée
avant la première compétence.** ⚠️ **Amélioré par `B7.7`, mais pas nul** :
accepter, ou faire fusionner certaines des quatre restantes ?
📌 **Ce n'est pas un défaut** — chaque barre a sa raison. C'est un **cumul** que
seul l'assemblage rend visible.

### ✅ TRANCHÉ PAR ERIC — 2026-08-14 : **on accepte le cumul**

**Mesuré au navigateur, 360 × 780** : `55 + 45 + 52 + 57 = **210 px = 27 %`** —
au-dessus des ~20 % estimés, et l'écart s'explique.

🔴 **CHAQUE BARRE EST UNE CIBLE TACTILE DE 44 px PLUS SA GOUTTIÈRE.** Ce n'est
pas du gras : c'est l'invariant du doigt, quatre fois.

> ⚠️ **ERREUR DE L'ARCHITECTE, GARDÉE EXPRÈS.** J'avais proposé de replier le
> compteur `Pool · Invested · Left` sur une ligne, en annonçant ~30 px de gain.
> **Mesuré : 1 px.** Le compteur fait 38 px — c'est le bouton `Reset` à 44 px
> qui fixe la hauteur de sa barre. **La forme de la faute : avoir proposé une
> optimisation sans l'avoir mesurée**, et fait perdre un aller-retour à Eric.
> C'est la consigne n°4 du majordome.

⛔ **L'option non retenue, notée pour ne pas la reproposer** : fusionner le
compteur et la molette des catégories sur **une** ligne rendrait **52 px**
(→ 20 %, le chiffre d'Eric) — mais serre les deux à 360 px et **change ce que
B7.1 décrit**. Eric a préféré la cible tactile.

---

## B8. Étape 8 — Equipment ✅ *validée par Eric le 2026-08-14*

### 🔴 B8.0 — « IL MANQUE LA MOITIÉ DES ARMES ET ARMURES » : C'EST DE L'AFFICHAGE, PAS DU CONTENU

Eric : *« il manque la moitié des armures et des armes, et pas assez de
détails »*. **Mesuré dans `layers/srd-5.2.1-en.layer.json` :**

| Genre | Nombre |
|---|---|
| **armor** | **13** |
| **weapon** | **38** |
| gear | 82 |
| item | 253 |
| tool | 25 |

**C'est le compte COMPLET du SRD 5.2.1**, et les données sont **déjà
détaillées** :

```
armor  : ac_base, ac_dex_cap, stealth_disadvantage, strength, weight, cost
weapon : damage, damage_dice, damage_type_key, mastery, properties, weight, cost
```

⭐ **RIEN N'EST À PRODUIRE, TOUT EST À AFFICHER.** L'écran actuel montre **le
paquet de départ de la classe**, pas **le catalogue** — le lot 49 a livré *« le
sac et la bourse »*, jamais une boutique. **Ce n'est donc pas une dette de
contenu**, et personne n'a à ressaisir d'armes.

### B8.1 — Le bandeau du haut

| | Élément | |
|---|---|---|
| 🔒 | **Le budget** — *« budget en pièces, **sans trop prendre de place** »* | **flotte** |
| 🔒 | **Molette horizontale** qui **catégorise les équipements** | **flotte** *(Eric)* |
| 🔍 | **La recherche** — ⏳ *« si on a la place pour poser une **loupe** dans les flottants pour invoquer la barre de recherche, ce serait pas mal »* | **repliée derrière une loupe**, sous réserve de place |
| ❓ | **Un point d'interrogation à côté du budget** | rappelle la fenêtre « What you already have » |

📌 **La recherche repliée derrière une loupe n'est pas un détail** : c'est ce qui
évite une **cinquième** barre fixe *(cf. `B7.6`)*. ⏳ **Eric l'a formulé au
conditionnel — « si on a la place » — donc c'est une PRÉFÉRENCE, pas une
exigence.**

### B8.2 — « What you already have »

| # | |
|---|---|
| **B8.2a** | Une fenêtre qui dit ce qu'on **possède déjà** **et explique POURQUOI** |
| **B8.2b** | **Elle apparaît au début** |
| **B8.2c** | **On clique dehors pour la faire disparaître** |
| **B8.2d** | **Le point d'interrogation à côté du budget la fait réapparaître** |

### B8.3 — Chaque item tient sur DEUX lignes

```
┌──────────────────────────────┬───┬───┐
│ Battleaxe                    │ + │ 👁 │   les deux signes
│ 10 GP · 4 lb.                │   │   │   prennent la HAUTEUR
└──────────────────────────────┴───┴───┘   des deux lignes
```

| # | |
|---|---|
| **B8.3a** | **Ligne 1 : le titre** |
| **B8.3b** | **Ligne 2 : prix et poids** |
| **B8.3c** | **`+` et `👁` à droite**, et ils **occupent les deux lignes en hauteur** |
| **B8.3d** | **L'œil ouvre une GROSSE fenêtre en overlay** avec le texte associé |
| **B8.3e** | **Elle se ferme si on tape ou clique dehors** |

⭐ **Et la contrainte de `B7.3c` (« le texte tient sur une ligne ») ne s'applique
PAS ici** : Eric donne **deux** lignes à l'item. Les deux écrans les plus denses
résolvent donc le même problème de largeur **différemment** — Skills comprime,
Equipment empile. **C'est délibéré, ne pas « harmoniser ».**

## B9. Étape 9 — Review ✅ *validée par Eric le 2026-08-14*

| # | |
|---|---|
| **B9.1** | **Un masque propre, TRÈS CLAIR** *(cf. sa décision antérieure : « un masque pour le 9, pour que le choix soit propre à lire »)* |
| **B9.2** | 🔴 **QUE DU TEXTE** |
| **B9.3** | **Sur une DALLE MAJEURE UNIQUE** — pas plusieurs |
| **B9.4** | ⏳ **Possiblement un EXPORT `JSON` ou `HTML` de la fiche, tout en bas** *(« possiblement » — pas arrêté)* |
| **B9.5** | 🆕 **Elle contiendra un accès à `sheet` et un `mode expert`** |

⭐ **Et son exigence première tient toujours** : *« on doit avoir une visibilité
de ce qui est fait / pas fait »*. **Review est un état d'avancement**, pas un
déversoir de `resolved`.

⚠️ **`B9.5` touche un chantier qui demande sa parole** : *« accès à sheet »* est
la **fiche v2 jouable**, que la charte réserve explicitement à une décision
d'Eric. **Il vient de l'inscrire dans Review** — c'est donc **ouvert**, mais
**le chantier lui-même reste à commander séparément.**

> ### ✅ TRANCHÉ PAR ERIC — 2026-08-14
>
> | | |
> |---|---|
> | **`mode expert`** | ✅ **FAIT (lot 67)**. C'est le déversement de `resolved` que le lot 65 avait retiré — chaque valeur avec son chemin. Il n'est pas supprimé, il est **derrière une porte** : `Expert view` l'ouvre dans un onglet, `Export HTML` l'enregistre. **Octets identiques, mesuré.** |
> | **`B9.4` export** | ✅ **FAIT (lot 67)**. `Export JSON` rend **les octets exacts du moteur** (`canonicalText`, partagé avec `toBytes`) et `Export HTML` la page autonome |
> | **`sheet`** | ⏳ **PAS MAINTENANT.** Le builder vient d'être refait et n'a pas encore tourné chez Eric : ouvrir la fiche jouable serait un second front avant d'avoir vu le premier. **Aucun bouton posé** — pas de porte vers une pièce qui n'existe pas |

📌 **`export`/`import` existent déjà** dans le bloc `doc` du moteur — `B9.4` est
un **branchement**, pas une construction. ⛔ *Mais rappel du mandat : « pas de
faux magasin » — ne publier un bouton d'export que s'il exporte vraiment.*

⚠️ **Mesure de la partie A** : Review fait **27 370 px** aujourd'hui, et **grandit
avec le personnage** (11 894 px mesuré plus tôt sur un perso moins avancé).
**`B9.1`+`B9.3` inversent complètement ça** : une dalle unique, masquée, lisible.

---

# 🔀 LE NOUVEL ORDRE DES ÉTAPES — décidé par Eric le 2026-08-14

> **« Note sur la globalité et l'ordre de création d'un perso, je veux ça. »**

| # | Nouvel ordre | Changement |
|---|---|---|
| **0** | **Universe and layers** | inchangé |
| **1** | **Identity** *(ex-Concept)* | 🆕 **renommé** · contiendra **story** · 🆕 **une BIOGRAPHY** *(Eric, 2026-08-14)* · 🆕 **création pilotée par IA** · 🔴 **et le PORTRAIT du personnage — voir ci-dessous** |
| **2** | **Abilities** | ⬆️ **de la 5ᵉ à la 2ᵉ place** |
| **3** | **Species** | inchangé |
| **4** | **Destiny** | ⬆️ de la 6ᵉ à la 4ᵉ |
| **5** | **Inheritance** | ⬇️ de la 4ᵉ à la 5ᵉ |
| **6** | **Class** | ⬇️ **de la 2ᵉ à la 6ᵉ place** |
| **7** | **Skills** | inchangé |
| **8** | **Equipment** | inchangé |
| **9** | **Review** | inchangé · 🆕 **accès `sheet` + `mode expert`** |

### ✅ LE RÉORDONNANCEMENT EST TECHNIQUEMENT SAIN — mesuré le 2026-08-14

**Le risque évident** : `Class` recule de la 2ᵉ à la 6ᵉ place, donc **quatre
écrans s'exécutent désormais AVANT qu'une classe existe**. Mesuré, écran par
écran :

| Écran | Occurrences de « class » | Nouvelle position |
|---|---|---|
| `abilities-step` | **0** | 2 ✅ |
| `species-step` | **0** | 3 ✅ |
| `destiny-step` | **0** | 4 ✅ |
| `inheritance-step` | **0** | 5 ✅ |
| `skills-step` | **6** | **7 — après Class** ✅ |
| `equipment-step` | **2** | **8 — après Class** ✅ |

⭐ **Les deux seuls écrans qui lisent la classe restent APRÈS elle.** Aucun
blocage. *(Ce « zéro occurrence » est fiable : le garde d'octets couvre `ui/`
depuis le 2026-08-14, donc `grep` ne saute aucun fichier — cf. lot 56.)*

### ⚠️ LES TROIS POINTS À SURVEILLER EN L'APPLIQUANT

| | |
|---|---|
| **1. `STEPS` est un tableau ORDONNÉ** | `ui/builder/shell.mjs:49`. Le réordonner suffit **à condition que rien ne se repère par position**. ⭐ **C'est déjà la loi du lot 40, et elle est appliquée depuis le lot 55** : le pas final se trouve par `REVIEW_INDEX` (l'id), jamais par `STEPS.length - 1`. **Ce réordonnancement est précisément le scénario que cette loi protège.** |
| **2. Le renommage `Concept` → `Identity`** | ⚠️ **`identity` est DÉJÀ un mot du moteur** : `resolved.identity` existe dans `fh-char/1`, avec `creatureType`. **Deux « identity » qui ne désignent pas la même chose** — l'écran et la rubrique du document. **À trancher avant de coder**, sinon c'est le piège des deux échelles typographiques qui recommence |
| **3. `rebuild` exige `level`, `class` PUIS les six caracs** | avec Class en 6ᵉ position, **le document reste incomplet plus longtemps**. ✅ **Déjà couvert** : le **schéma de brouillon dérivé** du lot 47 existe exactement pour ça. **Mais la fenêtre d'incomplétude s'allonge** — à vérifier à l'usage |

### 🔴 LE PORTRAIT DU PERSONNAGE — soulevé par Eric le 2026-08-14, JAMAIS SPÉCIFIÉ

**Ses mots :** *« d'ailleurs on a oublié de parler de l'endroit de l'upload de
l'image du perso »*. Il a raison : **aucune des dix étapes n'en parle**, et
c'est un trou, pas un oubli de rédaction.

⚠️ **CE N'EST PAS UNE QUESTION D'ÉCRAN, C'EST UNE QUESTION DE DOCUMENT.** Deux
faits mesurés qui la cadrent :

| | |
|---|---|
| `fh-char/1` **n'a aucun champ de portrait** | rien dans `schemas/fh-char.schema.json` |
| Le builder **n'a aucun serveur** | loi §0.9 du dépôt : *« aucun serveur mondial à maintenir »*. Il n'existe donc **nulle part où déposer des octets** |

**D'où deux issues, et elles n'ont pas le même prix :**

| | |
|---|---|
| **(a)** l'image vit **DANS** le document *(data: URI)* | le personnage reste **un seul fichier**, qui voyage entier. ⚠️ Mais le code d'échange compact du v1 (`FH1.`, deflate + base64) enflerait d'autant : un portrait de 200 Ko rend le code intransmissible |
| **(b)** l'image vit **À CÔTÉ** *(un chemin, une URL)* | le document reste léger. ⚠️ Mais le personnage cesse d'être **un fichier unique** : il se casse dès qu'on le déplace |

📌 **La v1 avait un portrait sur sa fiche** *(logbook, `FH Skill Builder`,
2026-07-17)* — c'est le précédent à relire avant de trancher, pas un argument
en soi. ⛔ **Décision d'Eric, pas de l'architecte** : elle touche ce qu'EST un
personnage, pas comment on le dessine.

### ✅ TRANCHÉ PAR ERIC — 2026-08-14 : **(a), MAIS BORNÉ**

**Le portrait vit DANS le document**, en `data:` URI — le personnage reste **un
seul fichier qui voyage entier**, ce qui est la thèse du produit. Et il est
**borné** : une vignette, pas une photo d'origine.

| | |
|---|---|
| **Cible** | ~**256 px**, ~**20–30 Ko** — l'écran redimensionne AVANT d'encoder |
| **Le plancher, c'est le schéma** | un `maxLength` sur le champ. ⭐ **Le moteur prononce, l'écran affiche** : si l'écran laisse passer une image trop lourde, c'est le document qui refuse, pas une politesse d'interface |

🔴 **ET LA MOITIÉ « exclu du code d'échange compact » N'A RIEN À QUOI
S'ACCROCHER AUJOURD'HUI — mesuré le 2026-08-14 : `FH1.` n'existe dans AUCUN
fichier de `~/tools/fhpc`.** C'était un objet de la v1. La contrainte reste
donc vraie mais **au futur** : *le jour où un code d'échange compact est écrit
pour la v2, il exclut le portrait.* Elle est notée ici pour que ce jour-là
personne ne la redécouvre en constatant qu'un code ne se colle plus dans un
Discord.

📌 **Le mécanisme d'écriture existe déjà, et il ne coûte aucun verbe** : un
champ racine **facultatif** de `type: "string"` entre tout seul dans la liste
blanche de `doc.describe` (`describableFields`, `src/doc/schema.mjs`) — c'est
exactement comme ça que `gender`, `alignment` et `campaign` sont entrés au
lot 48, **sans une ligne du verbe**.

### 🆕 DEUX FONCTIONNALITÉS NEUVES, JAMAIS MENTIONNÉES AVANT

| | |
|---|---|
| **La création pilotée par IA** *(dans Identity)* | ⛔ **Aucune spécification, aucune mesure.** C'est un **chantier à part entière** — le mentionner ne le commande pas |
| **Le `mode expert`** *(dans Review)* | ⛔ **Non défini.** Ce qu'il montre, ce qu'il permet, à qui il s'adresse : **tout est à poser** |

---

---

## 🔁 RÈGLE COMMUNE QUI SE DÉGAGE — « on ferme en cliquant dehors »

**Le même geste revient TROIS fois, sur trois écrans différents :**

| Où | Quoi |
|---|---|
| `B7.7b` | le **popup de commentaire** de Skills |
| `B8.2c` | la fenêtre **« What you already have »** |
| `B8.3e` | l'**overlay de détail** de l'œil |

📌 **C'est donc un patron, pas trois décisions.** ⛔ **À écrire UNE fois dans le
code, pas trois** — sinon les trois divergeront, comme les deux échelles
typographiques l'ont fait *(en-tête de ce fichier)*.
⚠️ **Et il coexiste avec la CROIX ou le SWIPE des dalles majeures** *(`B2.4`)* :
**deux façons de fermer, pour deux objets différents** — une **dalle majeure**
se ferme par croix/swipe, un **popup ou overlay** se ferme en cliquant dehors.
**Non contradictoire, mais à ne pas confondre.**

---

---

# ⚖️ LES INVARIANTS — ce qui a été convenu PARTOUT, et vaut sans être redit

> **Ces règles sont sorties de la séance du 2026-08-14 par RÉPÉTITION** : Eric
> les a énoncées écran après écran jusqu'à ce qu'elles cessent d'appartenir à un
> écran. **Elles ne se re-négocient pas dans une commande de lot.**
>
> ⚠️ **Ce sont des invariants de PRODUIT** — ce que le joueur voit et peut faire.
> **Ce ne sont PAS des règles de rendu** *(voir §RENDU ci-dessous)* — mais **ils
> les dictent**.

### I. La navigation

| | |
|---|---|
| **I.1** | **La molette des étapes est FIXE**, horizontale, avec ses chevrons ‹ › — masqués en bout de course |
| **I.2** | **La ligne `Show plan` \| `Validate` est FIXE**, sous la molette, et **ne défile jamais** |
| **I.3** | 🔴 **IL N'EXISTE QU'UN SEUL `Validate` DANS TOUTE L'INTERFACE** — celui de la barre du haut. ⛔ **Aucun écran, aucune fenêtre, aucun menu n'a le droit d'en poser un second** |
| **I.4** | 🔴 **`Validate` est un bouton À PALIERS** : il s'illumine **chaque fois qu'un choix est possible**, et un écran peut en compter un, deux ou trois |
| **I.5** | ⛔ **`Back` n'existe pas** — la molette le remplace |
| **I.6** | **`Validate` est un RACCOURCI, pas un passage obligé** : on peut aussi quitter un écran fini **par la molette** |
| **I.7** | **Les chevrons de la fiche flottent à l'extrême droite**, s'effacent après ~1 s, reviennent au défilement |

### II. Le choix

| | |
|---|---|
| **II.1** | 🔴 **LE DÉFILEMENT EST LE CHOIX** — `scroll-snap`. **Il n'y a AUCUN geste de sélection** ; la fiche sur laquelle on s'aimante **est** la chose choisie |
| **II.2** | **Une seule fiche à l'écran à la fois** |
| **II.3** | **Le scrollspy n'est pas un repère, c'est le SÉLECTEUR** — il suit le point d'aimantation, donc l'icône surlignée et la fiche validée **sont la même chose par construction**. ⛔ **Et son rail N'EST PAS CLIQUABLE** *(Eric, 2026-08-14)* : un tap qui mène à un record serait un geste de sélection, que **II.1** supprime |
| **II.4** | 🔴 **RIEN N'EST ACTÉ TANT QUE `Validate` N'EST PAS TAPÉ** — les relances sont libres, aucun historique n'est conservé |
| **II.5** | ⚠️ **UNE SEULE EXCEPTION GESTUELLE DANS TOUT LE BUILDER** : on **tape la carte** de Destinée pour la retourner *(`B6.3`)*. **Délibérée — ne pas l'harmoniser** |

### III. Les surfaces

| | |
|---|---|
| **III.1** | Une **image de fond FIXE** ; la fiche défile **par-dessus** |
| **III.2** | La fiche est faite de **DALLES** — **simple** *(les choix ; choix identique ⇒ dalle identique)*, **intermédiaire** *(un peu de texte, pas de couleur)*, **majeure** *(beaucoup de contenu, ou des images)*. Voiles ✅ **35 / 50 / 100 %** *(le 35 arrêté le 2026-08-14 ; il valait 20)* |
| **III.3** | **Une dalle MAJEURE se ferme par CROIX ou SWIPE** |
| **III.4** | **Un POPUP ou un OVERLAY se ferme en CLIQUANT DEHORS** — trois occurrences déjà *(`B7.7`, `B8.2`, `B8.3`)*. ⛔ **À coder UNE fois, pas trois** |
| **III.5** | ⚠️ **III.3 et III.4 ne se confondent pas** : deux objets, deux fermetures |

### IV. Le vocabulaire

| | |
|---|---|
| **IV.1** | **`T1`…`T7` = les valeurs du builder v2** : 10 · 12 · 14 · 16 · 18 · 22 · 44 |
| **IV.2** | **L'ordre des caractéristiques est celui du SRD** : `STR · DEX · CON · INT · WIS · CHA` |
| **IV.3** | **L'interface est en anglais** ; le français viendra plus tard |
| **IV.4** | **Base mobile : 360 px.** Le desktop s'extrapole ensuite |

> ### ⚖️ LECTURE D'ARCHITECTE — 2026-08-14, lot 69 : **IV.1 est le barème de la BASE**
>
> Le lot 69 a fait monter `T5`/`T6` de 18/22 à **20/28** dans la grandeur
> **Large (≥ 1140 px)**, et l'a signalé de lui-même comme discutable. Tranché :
> **c'est bon.**
>
> **IV.1 et IV.4 se lisent ensemble.** IV.4 dit « base mobile 360 px, **le
> desktop s'extrapole ensuite** » : IV.1 donne donc le barème **de cette
> base**, pas une constante universelle. Un barème identique sur une largeur
> **quadruplée** est exactement la « **typographie plate** » que la partie A
> §3ter relève — l'invariant se retournerait contre son propre but.
>
> **Les garde-fous, mesurés** : `T1`–`T4` **ne bougent pas** · la base 360
> reste `10 · 12 · 14 · 16 · 18 · 22 · 44`, figée par un test · le bloc Large
> ne porte **que des tailles**, jamais une couleur ni un voile (la matrice du
> verre est par thème, pas par grandeur) · le seuil `1140` n'est écrit qu'**à
> un seul endroit**, comme `720` depuis le lot 38.
>
> ⛔ **Si Eric lit IV.1 autrement, ce sont deux lignes à retirer** du bloc
> Large — rien d'autre n'en dépend.

---

# 🏗️ §RENDU — CE QUE LES INVARIANTS IMPOSENT AU CODE

**Aucun de ces points n'a été choisi : ils DÉCOULENT de la partie ci-dessus.**

| L'invariant | Ce qu'il exige du code |
|---|---|
| **II.1** `scroll-snap` | la **position de défilement** doit survivre à une mise à jour |
| **II.3** le scrollspy | l'**observation du défilement** ne doit pas être détruite à chaque clic |
| **I.7** les chevrons temporisés | un **minuteur** doit survivre |
| **III.4** le popup | son **état ouvert/fermé** doit survivre |
| **I.4** `Validate` à paliers | l'écran doit savoir **où il en est** sans se reconstruire |

🔴 **ET C'EST POURQUOI `app.innerHTML = ""` NE PEUT PAS RESTER** *(partie A §0)* :
il détruit **exactement** les cinq choses de la colonne de droite.

⛔ **Ce n'est pas un framework qu'il faut** — l'architecture v2 est ratifiée
*« ESM natif, zéro build, zéro framework »* (Q3, 2026-08-07), et tout ce
qu'Eric décrit est **du DOM natif**. C'est un **socle maison minimal**, et
**ses règles écrites**.

📌 **Le précédent existe déjà dans le dépôt** : `markPressed()` *(lot 57)* est
**la seule fonction qui écrit `data-active`, et un garde le prouve**. **C'est le
patron à généraliser** : une brique, un écrivain, un garde.

> ## ✅ TRANCHÉ — **B**, et le lot 58 l'a construit *(2026-08-14)*
>
> **La règle de rendu est B**, et elle contient **A** :
>
> | Niveau | |
> |---|---|
> | **Le cadre** (molette, ligne de commande, scène, chevrons) | construit **UNE FOIS**, jamais remplacé — on y écrit des attributs, pas des nœuds. C'est **B** |
> | **L'intérieur de la scène** | encore reconstruit d'un coup, **mais le défilement survit** (`swapContent`). C'est **A**, à l'intérieur du seul endroit qui reconstruit encore |
>
> 📌 **Descendre B jusqu'à la ligne de compétence, c'est écrire un moteur de
> diff** — le mini-framework que la commande interdisait. Le cadre suffit à
> tenir les cinq invariants.
>
> 🔴 **LE DÉFAUT §0 EST MESURÉ RÉPARÉ**, même geste, même écran, 360×780 —
> acheter un palier à 2 400 px de défilement sur Compétences :
> **`main` : 2 400 → 12 px** *(2 388 perdus)* · **lot 58 : 2 400 → 2 400.**
> Et `A-1.3` avec : la PAGE n'a plus de défilement du tout (`window.scrollY`
> reste 0, hauteur de page == hauteur de fenêtre), seule la scène en a un.
>
> ➡️ **Les règles du socle sont dans `~/tools/fhpc/ui/builder/SOCLE.md`**, à
> côté du code. **Un lot d'écran lit ce fichier-là au lieu de deviner.**
>
> ⚠️ **UN MOT DE VOCABULAIRE, PAYÉ EN UNE HEURE** : la surface qui défile
> s'appelle **`.stage`** dans le code, pas `.fiche` — `render-fiche.mjs` émet
> déjà `<article class="fiche">` pour la **feuille de personnage**. Les deux
> sous le même nom, l'écran Review affichait 114 626 caractères dans une boîte
> de hauteur **zéro**. *En français on dit toujours « la fiche » ; c'est le
> code qui devait départager.*

---

## 4. ✅ LES DIX ÉCRANS SONT PARCOURUS ET SPÉCIFIÉS

⚠️ **Cette section disait « sept écrans n'ont pas été parcourus ». C'est PÉRIMÉ** :
la séance du 2026-08-14 les a tous passés avec Eric, **étape par étape**, et la
**partie B** porte le résultat.

**Ce qui reste ouvert est nommé À SA PLACE, dans chaque section** — jamais
comblé en silence. Les principales :

| Où | Ce qui n'est pas tranché |
|---|---|
| **§0 partie A** | 🔴 **la cause de fond** — `app.innerHTML = ""` : conserver le scroll, ou ne redessiner que ce qui change ? **Décision d'architecture, à prendre AVANT tout symptôme** |
| `B2` | par quel **geste** on marque la classe — *(résolu : c'est le défilement, `B2.1h`)* ✅ |
| `B3` | le **2ᵉ palier de Validate** sur Species est-il le budget d'espèce ? *(inféré)* |
| `B4.3bis` | une dalle qui **défile à l'intérieur** d'un défilement aimanté — trois issues, aucune choisie |
| `B7.6` | **quatre barres fixes empilées** — accepter, ou fusionner ? |
| `B8.1` | la **loupe** de recherche — *« si on a la place »*, donc conditionnel |
| `B9.5` | **`sheet`** et **`mode expert`** — mentionnés, jamais spécifiés |
| **Identity** | 🔴 **collision de vocabulaire** avec `resolved.identity`, déjà au schéma |
| **Création pilotée par IA** | 🆕 chantier entier, zéro spécification |


---

# 🚀 LE PROMPT DU PREMIER LOT — « socle de rendu + un écran qui le prouve »

> ✅ **LANCÉ ET FUSIONNÉ — lot 58, 2026-08-14.** La règle de rendu était le
> verrou ; elle est tranchée (**B**, voir §RENDU ci-dessus). Le prompt reste
> ci-dessous **pour mémoire** — il a servi.
> 📄 **Rapport : `~/tools/fhpc/INVENTAIRE-LOT-58.md`** — six défauts trouvés à
> l'œil sous 935 tests verts, dont `scroll-snap` qui ne faisait rien du tout.
>
> ✅ **TRANCHÉ PAR ERIC LE 2026-08-14** : **la colonne de gauche N'EST PAS
> CLIQUABLE.** *« colonne de gauche non pas cliquable »*. Le rail reste un
> INDICATEUR — le défilement demeure le seul geste de choix (**II.1**), et
> B2.1d ne décrivait bien qu'un scrollspy qui *suit*. La lecture du lot 58
> était la bonne, et elle vaut désormais pour les deux écrans à catalogue.
>
> ⚠️ **ET UNE DETTE DE CONTENU, PAS DE CODE** : B2.1c demande « image →
> ambiance → features ». Mesuré — **aucune image de classe n'existe dans le
> dépôt**, et `data.description` du SRD **n'est pas de l'ambiance** (c'est de
> la comptabilité de multiclassage). La fiche de classe est donc aux trois
> quarts vide, et ça se voit. **Personne ne peut inventer l'ambiance à la
> place d'Eric.**

```
Tu es le LOT « socle-rendu ». Tu poses la fondation de toute la refonte
ergonomique du builder FHPC, et tu la PROUVES sur UN écran réel.

⛔ LIS D'ABORD, EN ENTIER :
   ~/tools/fh-phb/ERGONOMIE-BUILDER.md
Sa PARTIE A est ce qui cloche (mesuré). Sa PARTIE B est ce qu'Eric veut
(dicté par lui, validé par lui). Ses INVARIANTS (§I à §IV) ne se
re-négocient pas. Son §RENDU dit ce que ces invariants imposent au code.

═══ CE QUE TU FAIS ═══

1. LE SOCLE, ET IL EST MINIMAL.
   `ui/builder/shell.mjs:657` fait `app.innerHTML = ""` à chaque clic :
   toute l'application est détruite et reconstruite, et RIEN ne conserve
   la position de défilement (mesuré : aucun scrollTop/scrollY dans ui/).
   Ça détruit exactement les cinq choses que les invariants exigent de
   garder : le scroll, l'observation du défilement, le minuteur des
   chevrons, l'état d'un popup, et le palier courant de Validate.

   ⛔ N'ÉCRIS PAS UN FRAMEWORK. L'architecture v2 est ratifiée « ESM
   natif, zéro build, zéro framework » (Q3, 2026-08-07). Tout ce que
   décrit la partie B est du DOM natif.
   ⛔ N'ÉCRIS PAS D'ABSTRACTION POUR DES BESOINS IMAGINÉS. Le piège nommé
   par l'architecte : un mini-framework de 2 000 lignes écrit AVANT
   qu'un seul écran fonctionne. Tu écris le strict nécessaire à l'écran
   du point 2, et rien de plus.

   📌 LE PATRON EXISTE DÉJÀ DANS LE DÉPÔT, reprends-le :
   `markPressed()` (lot 57, ui/builder/carnet.mjs) est LA SEULE fonction
   qui écrit `data-active`, ET UN GARDE LE PROUVE. Une brique, un
   écrivain, un garde.

2. TU LE PROUVES SUR « CLASS » (section B2 du document).
   C'est le banc d'essai choisi parce qu'il concentre TOUT : scroll-snap
   (II.1), scrollspy-sélecteur (II.3), Validate à paliers (I.4), dalle
   majeure (III.2), et deux colonnes.
   ⚠️ ATTENTION : dans le NOUVEL ordre décidé par Eric, Class est
   l'étape 6, pas la 2. Les identifiants Bx du document suivent l'ANCIEN
   ordre — la table de correspondance est en tête de la partie B.

3. TU ÉCRIS LES RÈGLES DU SOCLE, à côté du code.
   Qui possède l'état · ce qui se redessine · CE QUI NE SE REDESSINE
   JAMAIS · ce qui doit survivre. Court. C'est ce document que les lots
   suivants liront au lieu de deviner.

═══ CONDITIONS DE SORTIE ═══

• npm test vert, tu écris le nombre avant/après.
  ⚠️ CAPTURE LE CODE DE SORTIE, NE TUYAUTE PAS : `npm test | grep …`
  masque l'échec — une poussée est partie sur une suite rouge le
  2026-08-13 pour cette raison exacte.
• UN GARDE prouve que le scroll survit à une mise à jour. Attaque-le :
  casse-le délibérément, vérifie qu'il rougit, restaure.
• 👀 TU SERS LE BUILDER ET TU LE REGARDES, à 360×780.
  `python3 -m http.server` à la racine du worktree, puis /ui/builder/.
  Les cinq défauts qui ont lancé ce chantier ont TOUS été trouvés à
  l'œil, sous 876 tests verts. Clique, fais défiler, reviens.
• Tu écris ce qui t'a SURPRIS, et ce que tu as attaqué sans qu'on te le
  demande.

═══ ⭐ TU AS LE DROIT DE CONTREDIRE CETTE COMMANDE ═══

Elle a été écrite par un architecte dont les mesures sont fausses
plusieurs fois par jour. Si une mesure ne se reproduit pas chez toi :
LA MESURE A TORT, PAS TOI. Montre la tienne, suis-la, dis-le.

Ce n'est pas une politesse — c'est le seul détecteur d'erreur extérieur
de ce siège, et il a rapporté NEUF FOIS SUR DOUZE :
 · 2026-08-14, lot 56 : ma commande disait « liste blanche
   d'extensions » ; il a imposé une LISTE NOIRE, au motif qu'une liste
   blanche recopiée reproduit le risque qu'on corrige. Il avait raison.
   Et il a trouvé, EN PLUS, un trou que ma commande n'avait pas vu.
 · 2026-08-14, lot 57 : ma commande anticipait de REMPLACER
   `data-active` ; il l'a GARDÉ et posé `aria-pressed` à côté — risque
   CSS nul par construction. Et il a REFUSÉ `role="radiogroup"` que je
   laissais ouvert : ce rôle engage un contrat clavier que le dépôt n'a
   pas.
 · 2026-08-14, lot 55 : ma commande citait `placeholder` comme motif de
   garde ; il l'a EXCLU, mesurant que c'est un nom de classe CSS
   légitime. Un garde qui crie au loup se fait désactiver.
 · 2026-08-13, lot 53 : sa commande listait quatre fichiers ; il en a
   mesuré UN, m'a démenti, et il avait raison.
 · 2026-08-14, ERIC lui-même m'a corrigé DEUX FOIS dans la même séance —
   sur le geste de choix, et sur la position du bouton Reset. Les deux
   fois j'avais bâti une justification élégante sur une lecture
   ambiguë au lieu de demander. Une justification élégante ne s'écroule
   pas toute seule.

⛔ Worktree dédié, jamais `main`, jamais `git push`, jamais de fusion —
c'est l'architecte qui fusionne.
```

⚠️ **CE QUE CE LOT NE FAIT PAS** : les neuf autres écrans. **Ils viendront
après**, cadrés par le socle, et **c'est là qu'un modèle léger devient
pertinent** — le document dit déjà ce qu'ils doivent faire, écran par écran.
