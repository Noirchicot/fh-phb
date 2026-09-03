# Le bouton — Boutons spéciaux

Les boutons que le builder appelle **par leur nom**. Ailleurs, une règle parle du bouton en
général ; ici elle nomme `Done`, `Back`, `Next`, `Cancel` ou `I changed my mind`, et ce qu'elle
dit ne vaut que pour lui. ⚠️ La loi générale — les deux axes, la famille DÉFAIRE, les trois
verbes, la porte, le verrou — reste sur [Fonctions](fonctions.md).

## La table des boutons nommés

*Ce que chacun EST : son libellé, son geste en une phrase, sa couleur, et où il paraît.*
⚠️ Relevé dans le code du builder (`ui/builder/*.mjs` + `shell.css`, v455), pas déduit des noms.
⛔ Une ligne « aucune règle consignée » n'est pas un oubli de cette page : c'est un **trou du
corpus**, et il est nommé pour qu'on puisse le combler.

| Libellé | Ce qu'il fait | Couleur | Où il paraît |
|---|---|---|---|
| **`Done`** | signe ce qui est posé, puis remonte d'un cran | **vert** dans une dalle d'item une fois l'item complet · **gris** partout ailleurs · désarmé sous verrou | pied d'un sous-écran (`sortie-done`) · pied du parcours tant que l'étape n'est pas achevée |
| **`Next`** | passe à l'écran suivant, sans rien écrire au document | **bleu** | pied du parcours une fois l'étape achevée · écran final de Destiny |
| **`Back`** | recule d'un palier et n'efface rien | **bleu** dans une dalle d'item · **gris** ailleurs — la règle de couleur est bornée à `.parcours-pied` | sous-menus seulement (`state.palier > 1`) — jamais à l'entrée d'une étape |
| **`Cancel`** | abandonne la dalle d'un item : rien n'y sera signé | **bleu** — il porte `.sortie-back`, la classe de `Back` · ⛔ la famille DÉFAIRE le veut rouge et confirmé | dans une dalle d'item (`state.parcoursItem`), et nulle part ailleurs |
| **`I changed my mind`** | révoque **et** efface la branche (`revoke` + `verbs.clear`) | **rouge** | pied du guide, et lui seul · écran final de Destiny, où il efface tout et rend au R |
| **`Choose`** | prend la fiche ouverte et la pose au document | **vert** | pied d'une fiche de catalogue — espèce, classe, arcane |
| **`Choose`** *(Destiny)* | ouvre la branche du choix **au lieu** de tirer — même mot, autre geste | **bleu** | R de Destiny seulement |
| **`Draw`** | tire une carte ; le tirage est illimité et ne dépense rien | **bleu** | R de Destiny |
| **`Reset`** | jette la salve de dés en cours | **aucune** — le plateau des dés n'est pas sur l'échelle | plateau des dés d'Abilities (`tray-bouton`) |
| **`Equipment`** | **une porte** : ouvre le catalogue depuis le dressing | **bleu** (comme `Send`) | barre basse du dressing · `Craft` et `Companions` y sont **muets**, hors mandat du 24/08 |
| **`Display`** | **une porte** : ouvre le B du Menu où vivent le fond et le cran d'interface | **aucune** — c'est une ligne de dalle, pas un octogone | écran du Menu |
| **`Menu`** | ⛔ **pas un bouton** : l'**onglet** de gauche de la ceinture, demi-pastille happée par le bord, mot vertical | — | extrémité gauche de la ceinture |
| **`Sheet`** | ⛔ **pas un bouton** : le même onglet à droite, mot retourné à 180° | — | extrémité droite de la ceinture |

📌 **La paire du popup ne s'appelle jamais `Cancel`/`Confirm` à l'écran.** `renderConfirmDialog`
les porte en défaut, mais les **trois** appels du builder les renomment tous les trois —
« Clear them » / « Keep them locked », « Switch to SRD » / « Keep SRD + FH ». Le mot `Cancel`
n'apparaît donc au joueur que comme mot de retour d'une dalle d'item, ligne 4.

## Ce qu'aucune règle ne dit

⭐ **Rendre les trous visibles est le bénéfice de ce rangement.** Ce qui suit est mesuré dans le
code du builder et n'est consigné **nulle part** dans le corpus — ⛔ ce ne sont pas des règles,
ce sont des décisions qui attendent Eric.

| Ce que le code fait | Ce que le corpus en dit |
|---|---|
| `Cancel` est **bleu**, et sans popup | ⛔ **aucune règle consignée** — et [`bouton.famille-defaire`](fonctions.md#bouton-famille-defaire) le veut rouge **et** confirmé |
| `I changed my mind` est rouge mais **sans popup**, sur les `5` écrans qui portent ce mot | ⛔ **aucune règle consignée** ; le code nomme la dette, le corpus l'ignore |
| `Choose` porte **deux gestes** sous un seul mot — prendre la fiche (vert) et ouvrir la branche du choix de Destiny (bleu) | ⛔ **aucune règle consignée** |
| `Draw` tire, et le tirage est illimité | ⛔ **aucune règle consignée** |
| `Reset` jette une salve de dés entière sans rouge ni confirmation, et sort de l'échelle des quatre couleurs | ⛔ **aucune règle consignée** |
| `Display` est une porte **sans voyant et sans texte de résolution** | ⛔ **aucune règle consignée** — [`bouton.loi-de-la-porte`](fonctions.md#bouton-loi-de-la-porte) ne s'y applique pas |
| `Equipment` et `Send` sont **bleus** dans le DOM, **rouges** dans la scène du banc (`.b3-bouton`) | ⛔ **aucune règle consignée** — rien ne dit lequel fait foi |
| `Craft` et `Companions` sont posés à l'écran et **muets** | ⛔ **aucune règle consignée** : rien ne dit qu'un bouton a le droit d'être muet |
| Le 5ᵉ cadre de la barre du dressing est **réservé et vide** | ⛔ **aucune règle consignée** — un fait du croquis, pas une norme |
| Les trois popups **renomment** la paire `Cancel`/`Confirm` | ⛔ **aucune règle consignée** sur le droit d'un popup à renommer sa paire |

<!-- DESSIN À FAIRE — les deux onglets de la ceinture : pourquoi un rond coupé par le bord n'est pas un bouton -->

## Ce que la famille DÉFAIRE détruit

Trois mots pour trois gestes, et c'est le **travail détruit** qui les sépare — pas la distance
parcourue. ⚠️ La couleur mesurée ne suit pas encore : seul `I changed my mind` est rouge.

<div class="bible-dessin"><svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Back, Cancel et I changed my mind : ce que chacun detruit"><style>.fd-t{font:13px system-ui,sans-serif;fill:var(--md-default-fg-color)}.fd-tb{font:600 13px system-ui,sans-serif;fill:var(--md-default-fg-color)}.fd-s{font:11px system-ui,sans-serif;fill:var(--md-default-fg-color);opacity:.72}.fd-box{fill:var(--md-default-bg-color);stroke:var(--md-default-fg-color);stroke-width:1.4}.fd-ax{stroke:var(--md-default-fg-color);stroke-width:1;opacity:.45}.fd-ar{stroke:var(--md-default-fg-color);stroke-width:1.6;fill:none}</style><defs><marker id="fd-head" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--md-default-fg-color)"/></marker></defs><text class="fd-s" x="8" y="20">ce que le geste DÉTRUIT</text><line class="fd-ax" x1="8" y1="30" x2="632" y2="30"/><text class="fd-s" x="8" y="46">rien</text><text class="fd-s" x="632" y="46" text-anchor="end">la branche entière</text><polygon class="fd-box" points="20,74 138,74 148,84 148,112 138,122 20,122 10,112 10,84"/><text class="fd-tb" x="79" y="102" text-anchor="middle">Back</text><path class="fd-ar" d="M79 132 L79 150" marker-end="url(#fd-head)"/><text class="fd-t" x="79" y="176" text-anchor="middle">recule d'un palier</text><text class="fd-s" x="79" y="196" text-anchor="middle">la liste posée reste posée</text><text class="fd-s" x="79" y="216" text-anchor="middle">détruit : rien</text><text class="fd-s" x="79" y="248" text-anchor="middle">bleu — mesuré, et conforme</text><polygon class="fd-box" points="260,74 378,74 388,84 388,112 378,122 260,122 250,112 250,84"/><text class="fd-tb" x="319" y="102" text-anchor="middle">Cancel</text><path class="fd-ar" d="M319 132 L319 150" marker-end="url(#fd-head)"/><text class="fd-t" x="319" y="176" text-anchor="middle">abandonne une dalle d'item</text><text class="fd-s" x="319" y="196" text-anchor="middle">rien n'y avait été signé</text><text class="fd-s" x="319" y="216" text-anchor="middle">détruit : le travail non signé</text><text class="fd-s" x="319" y="248" text-anchor="middle">bleu mesuré — la loi le veut rouge</text><polygon class="fd-box" points="500,74 618,74 628,84 628,112 618,122 500,122 490,112 490,84"/><text class="fd-tb" x="559" y="97" text-anchor="middle">I changed</text><text class="fd-tb" x="559" y="113" text-anchor="middle">my mind</text><path class="fd-ar" d="M559 132 L559 150" marker-end="url(#fd-head)"/><text class="fd-t" x="559" y="176" text-anchor="middle">révoque la branche</text><text class="fd-s" x="559" y="196" text-anchor="middle">revoke + verbs.clear</text><text class="fd-s" x="559" y="216" text-anchor="middle">détruit : les choix signés</text><text class="fd-s" x="559" y="248" text-anchor="middle">rouge — mais sans popup</text><line class="fd-ax" x1="8" y1="272" x2="632" y2="272"/><text class="fd-s" x="320" y="290" text-anchor="middle">un seul producteur pour les trois mots : la coquille pose le bouton, pressBack l'exécute</text></svg></div>

## Ce que chacun a le droit de faire

*Les règles du corpus qui nomment un bouton. ⛔ Leurs adresses n'ont pas changé : une règle
déplacée garde son ancre.*

### `Back` et `Next` n'écrivent jamais { #bouton-back-next-n-ecrivent-jamais }

**Un `Back` ou un `Next` ne modifie jamais le document : ni valider, ni écrire, ni effacer, ni signer.**

??? note "Pourquoi, et depuis quand"
    *« Ce n'est pas une préférence de dessin : c'est ce que ces deux mots ont le droit de faire. Un `Back` ne coûte rien, par définition. S'il coûte, ce n'est pas un `Back`. »*

    Valeur : vérifiable mécaniquement · Source : NORMES.md § « BACK ET NEXT NE FONT QUE NAVIGUER », Eric 2026-08-26 · Statut : ratifié

### `Back` en sous-menu seulement { #bouton-back-dans-les-sous-menus-seulement }

**`Back` n'existe qu'en sous-menu ; il ne paraît jamais à l'entrée d'une étape (rang R).**

??? note "Pourquoi, et depuis quand"
    *« Au rang R, on ne revient de nulle part : la ceinture d'étapes EST la navigation de ce niveau. »* La norme *« nomme ce que le code faisait déjà sans que ce soit écrit, ce qui est exactement ce qui permet à un lot de ne pas le défaire par erreur »*.

    Valeur : `renderSortieEtape` ne produit un retour que si `state.palier > 1` ou dans un item de parcours · Source : NORMES.md § « LES TROIS VERBES », Eric 2026-08-26 : *« le back c'est uniquement dans les sous-menus »* · Statut : ratifié

### `Done` et `Next` jamais ensemble { #bouton-done-et-next-jamais-ensemble }

**`Done` et `Next` ne coexistent jamais : c'est le même moment vu avant et après.**

??? note "Pourquoi, et depuis quand"
    *« Tant que les choix ne sont pas validés, la rangée offre de VALIDER ; une fois validés, il n'y a plus rien à valider et elle offre de NAVIGUER. »* ⚠️ `I changed my mind` ne bouge pas entre les deux : *« c'est la seule porte ouverte dans tous les états, celle qui défait »*.

    Valeur : rang R en cours → `I changed my mind` · `Done` · rang R validé → `I changed my mind` · `Next` · sous-menu → `Back` · `Done` · Source : NORMES.md § « LES TROIS VERBES », 2026-08-26 · Statut : ratifié

### `I changed my mind` n'est jamais seul { #bouton-i-changed-my-mind-jamais-seul }

**`I changed my mind` n'est jamais seul dans sa rangée : `Next` si l'étape est réglée, `Done` sinon.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« CE QUI MANQUAIT ÉTAIT UN QUATRIÈME ÉTAT, ET IL NE SE VOYAIT PAS »* — le cas `acheve && conclu`, *« celui où le joueur REVIENT sur un chapitre fini »*, ne tombait dans aucune branche : *« La seule porte offerte à qui relit une étape achevée était de la démolir. »* Leçon : *« un `else if` sans `else` ne prévient jamais qu'il ne couvre pas tout. Il rend simplement moins que prévu, et se tait. »*

    Valeur : le garde **refuse le trou** (`if/else` complet), il ne compte pas les boutons · Source : NORMES.md § « I CHANGED MY MIND N'EST JAMAIS SEUL », Eric 2026-08-26 : *« la bonne chose à faire, toujours un Next à côté de I changed my mind »* · Statut : ratifié

### Un `Done` inachevé est gris { #bouton-done-gris-inacheve }

**Un `Done` sur une étape inachevée est GRIS, jamais bleu, et il passe au vert quand elle est achevée.**

??? note "Pourquoi, et depuis quand"
    *« L'argument est de sens, pas de lisibilité : le bleu veut dire « mouvement non impactant » — or un `Done` sur une étape inachevée ne bouge pas, il attend. Le peindre en bleu lui prêterait une activité qu'il n'a pas. »* ⭐ *« Un bouton gris doit rester LISIBLE : « rien n'est fait » n'est pas « désactivé au point d'être illisible ». »* Aucune teinte n'a été inventée.

    Valeur : `--text-muted` — contraste **6,06** jour / **5,59** nuit, dans la bande des autres boutons (5,6–6,1) · ⛔ pas `--border-strong` (4,09 / 3,73, hors bande) · Source : NORMES.md § « LE GRIS EST `--text-muted` », Eric 2026-08-26 : *« gris c'est mieux, le bleu impliquerait un mouvement »* · Statut : ratifié

### `Back` bleu, `Done` vert { #bouton-back-bleu-done-vert }

**`Back` est bleu et `Done` est vert — le commentaire « aucune couleur dans back et done » du 17/08 est renversé.**

??? note "Pourquoi, et depuis quand"
    *« le 17/08, l'échelle des quatre couleurs n'existait pas — « aucune couleur » était alors la seule façon de ne pas mentir. Depuis qu'une échelle dit ce que chaque teinte signifie, une couleur n'est plus du bruit : c'est une information. »* ⛔ Mais le 17/08 **survit** sur l'INTERRUPTEUR. 📌 Leçon pour les prochains renversements : *« une règle ancienne ne tombe pas en bloc. Elle tombe là où la raison qui la fondait a disparu, et tient partout ailleurs. »*

    Valeur : `shell.css` porte encore le commentaire daté du 2026-08-17 · Source : NORMES.md § « BACK ET DONE PRENNENT LEUR COULEUR », Eric 2026-08-26 : *« back bleu, done vert »* · Statut : renverse le 2026-08-17 (pour ces deux boutons seulement)

### `Done` signe { #bouton-done-signe }

**`Done` signe ce qui est là, puis remonte d'un cran.**

⚠️ En contradiction avec [`bouton.trois-verbes`](fonctions.md#bouton-trois-verbes) — voir [C16](../../a-trancher.md#c16).

??? note "Pourquoi, et depuis quand"
    ⚠️ **amende une ligne gravée le matin même** — *« J'avais écrit : « `Done` ne signe rien, c'est la TUILE qui signe », en m'appuyant sur `shell.mjs:600`. J'avais sur-lu : ce commentaire dit que le PALIER avance par la tuile — il ne dit pas que `Done` ne valide pas. »* Leçon : *« Un commentaire de code dit comment ça marche, pas ce que ça veut dire. »*

    Source : NORMES.md § « LES TROIS VERBES », 2026-08-26 ; phrase d'Eric du 20/08 citée dans `catalogue.mjs:573` : *« si je dis à BS Done, direction R POUR VALIDER la… »* · Statut : ratifié (⚠️ voir contradiction [C16](../../a-trancher.md#c16) — « il ne fait pas avancer »)

