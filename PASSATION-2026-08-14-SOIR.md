# Passation — 2026-08-14, SOIR (la première session d'après le builder)

> **Pour le siège suivant.** ⛔ **Lis `ARCHITECTE.md` en entier d'abord.**
> Ce fichier ne dit que ce que cette session a fait, et ce qui n'est écrit
> nulle part ailleurs.
>
> ⚠️ **`PASSATION-2026-08-14.md` (la nuit) reste utile** pour ses §3, §4 et §10.
> Mais **son §5 est faux sur un point** et **son §6 sur deux** — corrigés dedans,
> avec la mesure.

---

## 1. L'état, mesuré à la clôture

| | |
|---|---|
| `fhpc` `main` | **`3a69116`**, **906 verts**, arbre propre, **poussé et revérifié contre le distant** |
| `fh-phb` `main` | `b4341a8` au départ *(bouge à chaque entrée)* |
| `fh-srd` | `20c6598` |
| **En vol** | **RIEN** — les trois lots (55, 56, 57) sont fusionnés et poussés |
| **En ligne** | ✅ le correctif du bouton final est **servi** par GitHub Pages (vérifié sur le module réel) |

⛔ **REMESURE CES SHA.** Un SHA a ici une durée de vie de quelques minutes — et
ce fichier porte la preuve qu'une ligne non remesurée survit **douze jours**.

---

## 2. 🔴 CE QU'IL FAUT SAVOIR AVANT TOUT LE RESTE

**Sur les trois décisions qui « attendaient Eric », UNE N'EXISTAIT PLUS.**

| | |
|---|---|
| Ce que disaient le mandat **et trois passations** | 76 lignes non commitées de `sync_from_vault.py`, worktree `fh-phb`, ouvertes depuis le 27 juillet, « c'est une décision, pas du ménage » |
| La mesure, faite en deux commandes | `fh-phb` **`106782f`**, **2026-08-02**, **+76/−7**, message : *« recovered and rebased onto main »*. Worktree disparu |

⭐ **Et l'ironie qui porte la leçon, parce qu'elle est dans ce dépôt** : l'entrée
`reprise_2026_08_12` du tableau de bord s'intitule **« ce qui reste vrai »**
après avoir démenti **trois** lignes du mandat. **La seule ligne qu'elle a
gardée sans la remesurer est celle qui était fausse.**

> 📌 **UNE REMESURE PARTIELLE DONNE LA CONFIANCE D'UNE REMESURE COMPLÈTE.**
> C'est la forme neuve de la faute n°1, et elle est plus dangereuse que
> l'ancienne : on *croit* avoir vérifié.

---

## 3. 👀 SERVIR LE BUILDER ET LE REGARDER — quatrième session, toujours n°1

**Cinq défauts trouvés à l'œil. Aucun des 876 tests n'en voyait un seul.**

| | Défaut | Où |
|---|---|---|
| 🔴 **1** | **le dernier bouton du builder ne fait rien** | Review |
| **2** | `INVENTAIRE-LOT-54.md` — un document de chantier — **affiché au joueur** | Universe |
| **3** | *« Method "standard" isn't built by this screen yet »* affiché au joueur | Abilities |
| **4** | **deux boutons « Draw a card »** identiques, empilés | Destiny |
| **5** | `aria-pressed` : **0 occurrence** dans tout `ui/` | partout |

### Le défaut n°1 en détail, parce que sa forme se reproduira

`STEPS` compte 10 entrées, `review` est la dernière → `REVIEW_INDEX` = **9**, et
`STEPS.length - 1` = **9**. Le bouton comparait **le libellé** *et* **le saut** à
la même expression : sur Review il affichait « Open the sheet » et **reposait
`state.step` à sa propre valeur**.

⭐ **Personne n'a fauté.** Le lot 40 avait écrit ce bouton quand Review
**n'était pas encore un pas de la ceinture** ; Review y est entré depuis, et les
deux indices se sont confondus. **Chaque lot est resté vert.** C'est une
régression **d'intégration** : elle n'apparaît dans le diff d'aucun lot.

---

## 4. 📉 MES FAUTES — quatre, et trois de la même famille

**Sur cinq défauts annoncés en regardant les écrans, TROIS ÉTAIENT FAUX.**

| | Ce que j'ai annoncé | Ce que la mesure a dit |
|---|---|---|
| 1 | « les boutons de la ceinture n'ont aucun nom accessible » | **faux** — c'était l'**outil d'inspection** qui ne les affichait pas ; ils portent leur texte |
| 2 | « 2 of 2 chosen alors que les deux sélecteurs sont vides » | **faux** — `innerText` d'un groupe de boutons liste **toutes** les options |
| 3 | « Survival a perdu son Half entre deux écrans » | **faux** — les deux portent `half`, mesuré au fond calculé |

📌 **Les trois ont la même cause : lire la sortie d'un OUTIL comme si c'était
l'objet.** C'est la faute n°1 du mandat sous une forme neuve, et elle s'est
renouvelée **trois fois en une heure**.

**La quatrième est une faute d'outillage, et elle était déjà écrite dans mon
mandat depuis le 2026-08-09** : des **backticks non protégés** dans un message
de fusion, interprétés par zsh (`command not found: placeholder`) — le message
est parti **amputé**. Amendé avant toute poussée, avec un heredoc quoté.

⚠️ **Et deux fautes de protocole en mesurant l'instabilité** (§5) : une boucle
qui rendait **20/20 rouge** parce que zsh ne découpe pas les variables non
quotées, et une sonde qui rendait **0** parce qu'elle finissait trop tôt — la
version corrigée en rend **5 984**.

> 📌 **La parade a marché les six fois, et c'est toujours la même :
> QUAND LE RÉSULTAT SURPREND, SUSPECTE TON PROTOCOLE AVANT TA CONCLUSION.**

---

## 5. ✅ L'INSTABILITÉ DE SUITE EST RÉSOLUE — et ce n'était rien de ce qu'on croyait

**`tests/dice.test.mjs` portait un test STATISTIQUEMENT FAUX** : mille jets de
3d6 avec `Math.random` réel, et l'**exigence** que les deux bornes sortent.
`P(3d6=3) = P(3d6=18) = 1/216` → **1,96 % d'échec**, simulé sur **200 000
répétitions** : **une passe rouge toutes les 51 exécutions.**

⭐ **PRIS SUR LE FAIT** sur la passe suivant la fusion du lot 57 — la quatrième
observation, et la première mesurable à chaud. ✅ Corrigé (`3a69116`, poussé) :
les bornes se prouvent avec le `scriptedRng` que ce fichier emploie partout
ailleurs ; l'intervalle reste sur du hasard réel, où l'assertion est vraie de
**chaque** tirage. **150 passes, 0 échec** contre ~3 attendus. **906 verts.**

**Ça explique les trois observations d'un coup** : c'est bien `dice.test.mjs`
que le lot 49 avait vu rouge ; c'est rare et non reproductible à la demande ;
et **le voisinage du `git merge` était une coïncidence**.

> ⭐ **ET LE MEILLEUR GESTE DE CETTE ENQUÊTE N'EST PAS DE MOI** : la passation de
> la nuit refusait d'écrire que le `sleep 2` était une cause — *« coïncidence
> n'est pas cause, et je refuse de l'écrire comme si c'en était une »*. **C'est
> ce refus qui a gardé l'enquête ouverte du bon côté.**

> 🔴 **LA LEÇON, et elle se reproduira** : *un test dont la réussite est
> PROBABILISTE est un test qui ment de temps en temps.* Celui-ci a coûté **trois
> passations** et deux hypothèses savantes. **Cherche d'abord si l'assertion
> peut échouer par MALCHANCE**, avant de soupçonner l'ordonnancement, le cache
> ou le système de fichiers. ⛔ Et la réparation n'est **pas** « plus de jets » :
> augmenter N rend l'échec plus rare sans jamais l'éliminer.

### ⚠️ Ma propre hypothèse était VRAIE et HORS SUJET — à garder quand même

<details><summary>La fenêtre de course, mesurée, réelle, mais pas cette cause-ci</summary>

### Sa fenêtre est PROUVÉE, sa cause NON

⛔ **TOUJOURS PAS RÉSOLUE. Ne la déclare pas morte.** Le détail complet, avec
les tableaux de mesure, est dans **`PASSATION-2026-08-14.md` §7**, que j'ai
complété plutôt que dupliqué.

**Le fait neuf, et il est solide** : `node --test` lance les fichiers **en
parallèle**, et **trois** fichiers de tests écrivent un fichier piège **dans
l'arbre `src/`** (délibérément, pour éprouver l'arpenteur sur un vrai
sous-répertoire). Sondé pendant la suite : ces répertoires **existent
réellement** — `src/mcp/sous` vu **3 824** fois en 30 s. Et **dix-huit**
fichiers de tests scannent l'arbre.

**Ce que ça n'établit pas, et c'est la moitié du rapport** :
- ❌ je **n'ai pas** fait rougir la suite par cette voie ;
- ❌ ça **n'explique pas** `dice.test.mjs` — mesuré : il ne lit **aucun** fichier.

</details>

📌 **Une hypothèse peut être vraie ET hors sujet.** C'est pourquoi on ne clôt
pas une enquête sur une explication plausible non prouvée — j'aurais publié une
fausse cause avec de vrais chiffres.

**Une hypothèse écartée par la mesure** : le `while` sans plafond de
`dice.mjs:66` ne cause **pas** de timeout — 12 passes rendent **75–103 ms**,
sans variabilité, et aucun timeout n'est configuré.
📌 **Mais l'argument du §7 qui tuait « c'est le RNG » visait le mauvais
objet** : *« l'assertion est vraie par construction »* parle de l'**assertion**,
or un `while` sans plafond ne rend pas une assertion fausse — **il ne rend
jamais la main**. C'est la **terminaison** qu'il fallait mesurer. Elle l'est.

---

## 6. Les lots

| Lot | État |
|---|---|
| **56** `garde-octets-ui` | ✅ **fusionné** — le garde d'octets couvre `ui/` (876 → 882) |
| **55** `bouton-final` | ✅ **fusionné et poussé** — le bouton final, les deux textes de chantier, les deux « Draw a card » (882 → 892 sur `main`) |
| **57** `aria-etat` | ✅ **fusionné et poussé** — `markPressed()` est la SEULE fonction qui écrit `data-active`, et elle pose `aria-pressed` au même endroit (892 → 905) |

⚠️ **Le 57 ne pouvait pas partir avec le 55** : il touche tous les écrans, donc
`shell.mjs`, `abilities-step.mjs`, `destiny-step.mjs`. **Collision mesurée**,
pas prudence.

### ⭐ ET LE RENDEMENT SE CONFIRME : 9 LOTS SUR 12 ONT CONTREDIT LEUR COMMANDE

| Lot | Ce qu'il a corrigé chez moi |
|---|---|
| **56** | ma commande suggérait une **liste blanche** d'extensions ; il a imposé une **liste NOIRE** — une liste blanche recopiée reproduit le risque qu'on corrige. **Et il a trouvé que `src/tools/fiche.shell.html`, seul fichier non-`.mjs` de `src/`, échappait DÉJÀ à l'ancien garde** — un trou dans la scène du crime, que ma commande n'avait pas vu |
| **55** | ma commande citait `placeholder` comme motif de garde ; il l'a **exclu**, mesurant que c'est un nom de classe CSS légitime. **Un garde qui crie au loup se fait désactiver** |
| **57** | ma commande anticipait de **remplacer** `data-active` ; il l'a **gardé** et posé `aria-pressed` à côté — le risque CSS devient **nul par construction**. Et il a **refusé** `role="radiogroup"`, que ma commande laissait ouvert : ce rôle engage un **contrat clavier** que le dépôt n'a pas |

📌 **Écris dans CHAQUE commande qu'un lot a le droit de te contredire, avec des
exemples DATÉS.** Les deux commandes de cette session le faisaient, et les deux
lots s'en sont servis. **C'est le seul détecteur d'erreur extérieur du siège.**

### ⚔️ Et ce que la revue a ajouté à leurs attaques

- **Lot 56** : garde attaqué **sur l'arbre réel** (octet NUL dans
  `ui/builder/tokens.css` → `file` le classe « data » → rouge), sur un fichier
  **enfoui à trois niveaux**, et sur un fichier **sans extension**. Plus la
  vérification que le mandat exige : **le garde lui-même ne porte aucun octet de
  contrôle** — le premier jet du garde d'origine en portait deux.
- **Lot 55** : son garde de langage n'avait été éprouvé que sur le fichier
  qu'il corrigeait. Vérifié qu'il mord **sur un autre fichier** et **sur un
  gabarit backtick**.

---

## 6bis. 🔴 LE PROCHAIN CHANTIER EST L'ERGONOMIE — Eric a utilisé le builder et il bute

**Il l'a ouvert sur son iPad le 2026-08-14 et il a buté tout de suite.** Ses mots,
recopiés :

| Où | Ce qu'il dit |
|---|---|
| **Skills** | *« scroll up down pas bien, ça saute »* |
| **Skills** | *« on choisit tools, ça va à tools »* |
| **Skills** | *« je voudrais un flottant pour voir le compte, ça disparaît »* |
| **Skills** | *« au premier choix dans tools ça remonte vers le haut »* |
| **Caracs** | *« marchent mais pas du tout ergonomiques »* |
| **Et** | *« y'en a plein d'autres »* |

🔴 **`fh-phb/ERGONOMIE-BUILDER.md` EST LE DOCUMENT DE RÉFÉRENCE DU PROCHAIN
CHANTIER — 1 200 lignes, LES DIX ÉCRANS SPÉCIFIÉS AVEC ERIC.**

**Il porte DEUX parties à ne jamais confondre** : **A** = ce qui cloche, *mesuré
par l'architecte* · **B** = ce qu'Eric veut, *dicté par lui, reformulé, et écrit
seulement après son « oui »*. **Le protocole est de lui.**

**Et il contient DEUX décisions qui débordent l'ergonomie** :
1. 🔀 **LE MOBILE D'ABORD** (360 px), desktop extrapolé ensuite — **remplace
   `UI-DIMENSIONS.md` (2026-08-02) et Architecture v2 Q2 (2026-08-07)** ;
2. 🔀 **L'ORDRE DES ÉTAPES CHANGE** : `Class` passe de la **2ᵉ à la 6ᵉ** place,
   `Abilities` de la **5ᵉ à la 2ᵉ**, `Concept` devient **`Identity`**.
   ✅ **Mesuré sain** — seuls `skills-step` et `equipment-step` lisent la classe,
   et ils restent après elle.

🔴 **ET LA CAUSE DE FOND Y EST, elle explique la moitié des symptômes** :
`shell.mjs:657` fait **`app.innerHTML = ""`** à chaque `render()` — **chaque clic
détruit et reconstruit toute l'application**, et **rien ne conserve la position
de défilement** (`grep scrollTop|scrollY` sur `ui/` → aucune sauvegarde ; les
deux seuls appels *déplacent* la page). Sur un écran de **16 513 px**, ça se voit
à chaque clic. ⛔ **Ne traite aucun symptôme avant d'avoir tranché celui-là** —
c'est une décision d'architecture, pas un correctif d'écran.

⭐ **ET LA CORRECTION DE MÉTHODE QU'ERIC A FAITE, elle vaut d'être gardée** : ce
siège s'apprêtait à lui demander « donne-moi ta liste ». Il a répondu *« mais tu
vas lister les erreurs »*. **Il a raison — lui demander la liste, c'est lui faire
faire le travail du siège.** Il donne les symptômes ; le siège sert le builder,
reproduit, et mesure les causes.

⭐ **Et c'est la meilleure matière du chantier** : quatre sessions de suite,
*regarder l'écran* a battu les suites de tests. Ici ce n'est plus l'architecte
qui regarde — **c'est l'utilisateur qui se cogne**, et aucun des 906 tests ne
voit un seul de ces défauts.

### Ses trois décisions du 2026-08-14, prises devant l'écran

| | |
|---|---|
| **Review montre l'avancement** | *« on doit avoir une visibilité de ce qui est fait / pas fait »*. ⛔ Ça **remplace** la proposition de tri en 21 rubriques : la question n'était pas « que garde-t-on », mais **« qu'est-ce qui manque encore à ce personnage »** |
| **Un masque pour l'étape 9** | *« un masque pour le 9 oui, pour que le choix soit propre à lire »*. Reste à trancher : **ouvert ou fermé** par défaut, et **libellés lisibles ou chemins bruts** |
| **La langue** | *« l'interface en anglais oui pour ma table / choix en .fr plus tard »* → **le dixième verbe n'est plus urgent** |

### 🔴 LES « LANGUES » SONT **TROIS** OBJETS, PAS DEUX — cadré par Eric le 2026-08-14

Le mandat prévenait de « ne pas payer le piège deux fois » en distinguant **deux**
choses. **Il y en a trois**, et c'est Eric qui a demandé le cadrage.

| | Ce que c'est | État MESURÉ le 2026-08-14 |
|---|---|---|
| **A — la langue de l'INTERFACE** | boutons, libellés, « Continue » | **anglais EN DUR.** Aucun mécanisme d'i18n dans `ui/` (mesuré : zéro). Le FR demande de la plomberie, pas un bouton. ✅ Eric : *anglais pour ma table, FR plus tard* |
| **B — la langue de la FICHE** (`document.lang`) | la langue du **contenu** : noms de classes, d'espèces, de sorts — elle choisit la couche `srd-5.2.1-en` ou `-fr` | **figée à la création**, `required`, hors de `describableFields`. C'est elle, le « dixième verbe ». La couche FR **existe et est complète** ; les 4 couches FH **n'existent qu'en anglais** |
| **C — les langues PARLÉES du personnage** | Common, Elvish, Draconic | 🔴 **`resolved.languages = []` EN DUR, toujours vide** |

🔴 **ET C EST UN TROU DE CONTRAT, PAS UN MANQUE D'ÉCRAN.** `derive.mjs:524-527`
le dit lui-même :

```js
/* Il n'existe pas de genre `language` parmi les 14. Le choix `languages[0]` … */
resolved.languages = [];
underived.declare("languages", "underived.no-language-genre", {});
```

Les genres sont une énumération **fermée**. Sans genre `language`, **aucune
couche ne peut déclarer une langue comme record choisissable**, donc aucun chemin
de choix ne peut exister, donc **le menu ne POUVAIT pas l'avoir**. Eric a dit
*« il n'existe pas dans le menu »* — il a raison, et la cause est deux étages
plus bas.

⭐ **LE PRÉCÉDENT EXISTE ET IL EST EXACTEMENT LE MÊME** : c'est `GAP-KIND`, qui
bloquait les 22 Arcanes, payé le **2026-08-08** en ouvrant le genre `arcana` dans
l'énumération fermée (`fh-char.schema.json` **et** `fh-layer.schema.json`). Même
forme, même remède connu. ⚠️ **C'est du CONTRAT — le travail de ce siège, pas
d'un lot.**

📌 **Et ça rejoint un problème déjà ouvert au tableau de bord** :
`TROU-CHOIX-SANS-TRACE` (lot 25, 2026-08-09) nomme `languages[0]` parmi les trois
choix jetés. **Ce n'est pas trois trous, c'est un seul** : le personnage exemple
choisit bien une langue, et elle disparaît — visible sur l'écran Review, sous
*« Player choices no rule consumed »*.

### Sa question sur la langue SRD, et la mesure

**`layers/srd-5.2.1-fr.layer.json` EXISTE et est complète** — 3,1 Mo, 14 records,
`lang: fr`, version 5.2.1, la même que l'anglaise. Elle n'est pas proposée
parce que (a) `universe-step.mjs:53` porte `SRD_LAYER_ID = "srd-5.2.1-en"` **en
dur**, et surtout (b) **les quatre couches FH n'existent qu'en anglais**. « SRD +
FH en français » rendrait un personnage à moitié traduit.
📌 **Le coût du français est de traduire les quatre couches FH, pas d'ajouter un
bouton.** *(Un `layers/TRADUCTION.md` existe, non ouvert par ce siège.)*

---

## 7. 🔴 CE QUI ATTEND ERIC — et il n'a rien tranché

Il a dit **« pars en autonomie »**, deux fois, sans nommer de chantier. Pris
comme sa parole pour l'autonomie ; **pas** comme un mandat sur les chantiers
neufs. Le détail lisible pour lui est dans le vault :
`Chantier FH & FHPC/FHV2 - Ce qui attend Eric.md`.

| | |
|---|---|
| 🔴 **L'écran Review** | **538 lignes, 11 894 px, dont 464 commencent par `resolved.`**. C'est la « tranche 0 » **voulue** — *un instrument, pas une maquette* — et le geste prévu est **Eric qui trie devant la page**. ⛔ C'est du **produit** : jamais seul, même sous autonomie. **C'est le dernier écran du builder, donc le plus urgent des trois** |
| **Le dixième verbe** | `lang`/`units` sont `required`, donc hors de `describableFields` **par construction** : aucun verbe ne les réécrit. **Ma recommandation : élargir `describe` plutôt qu'ajouter un dixième verbe** — mais c'est un contrat, ça se demande |
| **Fiche v2 jouable · AboveVTT** | ⛔ parole d'Eric requise, **même le builder fini** |
| ~~Les 76 lignes~~ | ✅ **morte depuis le 2 août** (§2) |

---

## 8. La route, après le 57

| | |
|---|---|
| 🔴 **La bascule de thème — ET CE N'EST PAS CE QU'ON EN DIT** | voir juste en dessous : **ce n'est pas un manque, c'est un REFUS argumenté** |
| **La persistance** | le brouillon qui voyage. `export`/`import` existent, il manque un magasin de navigateur. ⛔ **Pas de faux magasin** |
| **Le `while` sans plafond** | `dice.mjs:66`, dette **réelle mais dormante** — mesurée cette session |
| ⏸️ **44 `garde-des-copies`** | toujours écrit et **rangé** — préventif, zéro écart mesuré |

### 🔴 LA BASCULE DE THÈME N'EST PAS UN TROU — c'est une DÉCISION, et la commander à l'aveugle se ferait refuser

Le mandat et la passation de la nuit disent tous deux que `tokens.css` **n'a
aucun `[data-theme]`**. Mesuré : `grep -c` en rend **1**, dans un **commentaire**
— et ce commentaire est la **motivation du refus**, écrite par le lot 38 :

> *« Pas de sélecteur de thème ([data-theme], bascule, préférence enregistrée) —
> deux blocs suffisent : `:root` pour le jour, `@media (prefers-color-scheme:
> dark)` pour la nuit. **Un troisième bloc pour un thème qui n'existe pas encore
> serait du code mort derrière un interrupteur (loi §0.6).** »*

⚠️ **Le lot 38 a invoqué une loi du dépôt ET une préférence d'Eric que le mandat
cite mot pour mot** : *« Il refuse le code mort derrière un interrupteur. Il a
fait supprimer une fonctionnalité construite plutôt que la garder désactivée. »*

⭐ **Ce qui lève l'objection — et il faut l'ÉCRIRE dans la commande, sinon le lot
aura raison de refuser** : Eric a demandé **les couleurs de l'UI** dans l'étape
Universe (décisions du 2026-08-13), et l'architecte a tranché qu'elles vivent en
`localStorage`, **jamais** dans `fh-char/1` — parce qu'un personnage qu'on
importe repeindrait le builder de celui qui l'importe. **Le thème n'est donc pas
« un thème qui n'existe pas encore » : c'est une demande d'Eric.** Le lot 38 ne
pouvait pas le savoir.

📌 **Sans ce paragraphe, la commande contredit une décision motivée du dépôt.
Avec lui, elle l'honore.** Et `localStorage` a **zéro occurrence** dans `ui/` et
`src/` aujourd'hui — mesuré : ce serait le premier.

⭐ **Et une dette DÉSAMORCÉE avant d'être commandée** : *« `describableFields` ne
lit qu'une orthographe »* (passation de la nuit §6) est **dormante**. Mesuré sur
le schéma réel : **4 facultatifs, 3 vus, 1 invisible = `generator`** — de type
`object`, et il **doit** rester invisible. **Zéro écart réel.** J'allais en faire
un lot ; la remesure l'a arrêté.

---

## 9. ⭐ CE QUI A MARCHÉ, ET QU'IL FAUT REFAIRE

1. **👀 SERVIR LE BUILDER ET LE REGARDER.** Quatrième session de suite : cinq
   défauts, dont le dernier bouton du produit, sous 876 tests verts.
2. **⚔️ ATTAQUER CE QUE LE LOT N'A PAS ATTAQUÉ.** Les deux gardes de la session
   avaient une voie non éprouvée ; les deux ont été trouvées.
3. **REMESURER CHAQUE DETTE AVANT D'AGIR.** Sur quatre dettes touchées : **une
   était morte depuis douze jours**, **une était dormante**, une était réelle,
   une hypothèse est tombée. **Une seule sur quatre était ce qu'on en disait.**
4. **LE DROIT DE CONTREDIRE, AVEC DES EXEMPLES DATÉS**, dans chaque commande.
