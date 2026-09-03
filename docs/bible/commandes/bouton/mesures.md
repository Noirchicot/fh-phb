# Le bouton — Mesures

Ses cotes, et ce qui les calcule : les gabarits, les largeurs, la hauteur.

## Mesures

*ses cotes, et ce qui les calcule.*

<style>
.fh-croquis { margin: 1.2em 0; overflow-x: auto; }
.fh-croquis svg { max-width: 100%; height: auto; display: block; }
.fh-croquis .trait  { fill: none; stroke: var(--md-default-fg-color); stroke-width: 1.5; }
.fh-croquis .creux  { fill: var(--md-default-fg-color--lightest);
                      stroke: var(--md-default-fg-color--light); stroke-width: 1.5; }
.fh-croquis .plein  { fill: var(--md-default-fg-color--lighter);
                      stroke: var(--md-default-fg-color); stroke-width: 1.5; }
.fh-croquis .cote   { fill: none; stroke: var(--md-default-fg-color--light);
                      stroke-width: 1; }
.fh-croquis .fuite  { fill: none; stroke: var(--md-default-fg-color--lighter);
                      stroke-width: 1; stroke-dasharray: 3 3; }
.fh-croquis text    { fill: var(--md-default-fg-color); font-size: 11px;
                      font-family: system-ui, sans-serif; }
.fh-croquis .mou    { fill: var(--md-default-fg-color--light); font-size: 10px; }
.fh-croquis .gras   { font-weight: 700; }
</style>
<div class="fh-croquis">
<svg viewBox="0 0 470 300" role="img"
     aria-label="L'octogone à coupe du bouton et ses trois gabarits à libellé :
                 small 87, medium 135, no constraint 278, tous hauts de 44 blg.">
  <text x="44" y="28" class="gras">Les trois gabarits à libellé — cotes en blg</text>
  <text x="44" y="42" class="mou">⏳ 87 / 135 / 278 sont extrapolés, pas mesurés</text>
<path class="plein" d="M53,56 L122,56 L131,65 L131,91 L122,100 L53,100 L44,91 L44,65 Z"/>
  <text x="87.5" y="82.0" text-anchor="middle" class="gras">CANCEL</text>
  <line class="cote" x1="44" y1="47" x2="131" y2="47"/>
  <line class="cote" x1="44" y1="43" x2="44" y2="51"/>
  <line class="cote" x1="131" y1="43" x2="131" y2="51"/>
  <text x="139" y="74" class="gras">small = 87</text>
  <text x="139" y="88" class="mou">6 caractères</text>
  <path class="plein" d="M53,128 L170,128 L179,137 L179,163 L170,172 L53,172 L44,163 L44,137 Z"/>
  <text x="111.5" y="154.0" text-anchor="middle" class="gras">COMPANIONS</text>
  <line class="cote" x1="44" y1="119" x2="179" y2="119"/>
  <line class="cote" x1="44" y1="115" x2="44" y2="123"/>
  <line class="cote" x1="179" y1="115" x2="179" y2="123"/>
  <text x="187" y="146" class="gras">medium = 135</text>
  <text x="187" y="160" class="mou">12 caractères</text>
  <path class="plein" d="M53,200 L313,200 L322,209 L322,235 L313,244 L53,244 L44,235 L44,209 Z"/>
  <line class="cote" x1="44" y1="191" x2="322" y2="191"/>
  <line class="cote" x1="44" y1="187" x2="44" y2="195"/>
  <line class="cote" x1="322" y1="187" x2="322" y2="195"/>
  <text x="330" y="218" class="gras">no constraint = 278</text>
  <text x="330" y="232" class="mou">aucune borne</text>
  <line class="cote" x1="34" y1="56" x2="34" y2="100"/>
  <line class="cote" x1="30" y1="56" x2="38" y2="56"/>
  <line class="cote" x1="30" y1="100" x2="38" y2="100"/>
  <text x="28" y="82.0" text-anchor="end" class="gras">44</text>
  <path class="plein" d="M372,44 L406,44 L426,64 L426,84 L406,104 L372,104 L352,84 L352,64 Z"/>
  <text x="389" y="120" text-anchor="middle" class="mou">la coupe d'angle,</text>
  <text x="389" y="133" text-anchor="middle" class="mou">nue — pas d'arête</text>
  <line class="fuite" x1="352" y1="74" x2="135" y2="78.0"/>
</svg>
</div>

*Un petit bouton fait 87 — exactement la largeur d'un jeton. Ce n'est pas une coïncidence : boutons et jetons partagent une seule grille.*


### Les trois gabarits à libellé { #bouton-trois-gabarits }

**Il y a trois gabarits à libellé : small (6 caractères), medium (12), no constraint.**

??? note "Pourquoi, et depuis quand"
    *« Chaque gabarit a son MOT-TÉMOIN — un mot réel qui prouve la cote, jamais un compte abstrait. »*

    Valeur : mots-témoins **`CANCEL`** (6) et **`COMPANIONS`** (10) · Source : NORMES.md § « 6. LES BOUTONS », 2026-08-26 · Statut : ratifié

### `large` s'appelle `medium` { #bouton-large-renomme-medium }

**`large` s'appelle désormais `medium`.**

??? note "Pourquoi, et depuis quand"
    *« Sur trois gabarits, « large » se lisait comme le plus grand alors que c'est celui du milieu. L'ordre se lit tout seul, et un lot ne peut plus se tromper de gabarit. »*

    Valeur : small · medium · no constraint · Source : NORMES.md § « 6 », Eric 2026-08-26 · Statut : ratifié

### Un gabarit est un compte de caractères { #bouton-gabarit-est-un-compte-de-caracteres }

**Un gabarit est un compte de caractères, pas une largeur en pixels — la largeur se déduit.**

??? note "Pourquoi, et depuis quand"
    *« Écrire `width: 96px` figerait un gabarit qui mentirait au premier changement de corps. »*

    Valeur : ⛔ `width: 96px` · Source : NORMES.md § « 6 », 2026-08-26 · Statut : ratifié

### Les cotes extrapolées { #bouton-cotes-extrapolees }

⏳ **À trancher.** Extrapolation non vérifiée.

**small = 87, medium = 135, no constraint = 278 — extrapolés, pas mesurés.**

??? note "Pourquoi, et depuis quand"
    tout se déduit de la rangée de 278 et de la gouttière de 8, sous la règle *« même largeur sur une ligne »*. ⭐ *« UN PETIT BOUTON FAIT 87 — EXACTEMENT LA LARGEUR D'UN JETON. Ce n'est pas une coïncidence : boutons et jetons partagent une seule grille, et une bande de boutons s'aligne sous une rangée de jetons sans réglage. »* 🔴 À vérifier au navigateur sans écran avant d'être gravée.

    Valeur : ratio de **0,58 em par caractère** (semi-gras, casse mixte) · 3 / 2 / 1 par ligne · Source : NORMES.md § « LES COTES DES BOUTONS — extrapolées le 26/08 » · Statut : à trancher (extrapolation non vérifiée)

### Le corps du texte d'un bouton { #bouton-corps-du-texte }

⏳ **À trancher.** ⚠️ mais T3 est ratifié pour les portes — voir [C8](../../a-trancher.md#c8).

**Aucun corps de texte n'est déclaré pour un bouton, donc les largeurs de small et medium ne sont pas calculables.**

⚠️ En contradiction avec [`bouton.gabarit-des-deux-lignes`](#bouton-gabarit-des-deux-lignes) — voir [C8](../../a-trancher.md#c8).

??? note "Pourquoi, et depuis quand"
    *« À T4, `medium` n'a plus que 8 px — un mot un peu large déborde, et le déficit ne se verrait que sur ce gabarit-là. »* T3 est le corps **recommandé**.

    Valeur : `.species-done` porte `font: inherit` · T3 laisse la même marge de 22 px aux deux gabarits · à T4, `medium` n'a plus que **8 px** · Source : NORMES.md § « 6 — Le corps du texte », 2026-08-26 · Statut : à trancher (⚠️ mais T3 est ratifié pour les portes — voir [C8](../../a-trancher.md#c8))

### La hauteur d'un bouton { #bouton-hauteur }

**Un bouton fait 44 à un étage, 48 à deux étages en T3, 56 à deux étages en T4.**

??? note "Pourquoi, et depuis quand"
    *« Le plancher tactile gouverne la hauteur d'un bouton à un étage : la typographie n'y arrive pas. C'est encore « un contrôle ne se laisse jamais dimensionner par un dessin ». »*

    Valeur : `--touch` 44 (le texte n'en demande que ~33) · Source : NORMES.md § « 6 — La hauteur », 2026-08-26 · Statut : ratifié

<!-- DESSIN À FAIRE — les trois hauteurs comparées — 44 un étage, 48 deux étages T3, 56 deux étages T4 -->

### Même largeur sur une même ligne { #bouton-meme-largeur-par-ligne }

**Tous les boutons d'une même ligne ont la même largeur, et la rangée se pose en bas de page, centrée.**

??? note "Pourquoi, et depuis quand"
    c'est la règle d'Eric « même largeur sur une ligne », celle dont se déduisent les cotes 87 / 135 / 278 : « tout se déduit de la rangée de 278 et de la gouttière de 8 ».

    Source : NORMES.md § « 6 », 2026-08-26 · Statut : ratifié

### Les boutons `+` et `−` { #bouton-plus-moins }

**`+` et `−` sont un quatrième gabarit : carré ou petit cercle, `+` vert et `−` rouge.**

??? note "Pourquoi, et depuis quand"
    *« C'est le cas où les deux divergent le plus, et il est voulu : un contrôle ne se laisse jamais dimensionner par un dessin. ⛔ Réduire la cible pour l'accorder au dessin serait exactement la faute inverse. »* 📏 Défaut mesuré en écrivant la table : `.pipeline-pas` servait le `+` et le `−` avec `border: 1px solid var(--critical)` — **le `+` était rouge**, *« il disait « ce n'est pas bon » au moment précis où le joueur AJOUTE quelque chose »*. Corrigé le 26/08.

    Valeur : dessin **le plus petit possible** (le rond peut faire 24) · cible **`--touch` 44** · Source : NORMES.md § « LE QUATRIÈME GABARIT », Eric 2026-08-26 : *« boutons + / − : le plus petit possible / minimum acceptable sur tactile »* · *« ce sont des boutons »* · Statut : ratifié

<!-- DESSIN À FAIRE — le `+` et le `−` — le dessin le plus petit possible dans la cible `--touch` de 44, les deux cotes montrées ensemble -->

### Le gabarit des deux lignes { #bouton-gabarit-des-deux-lignes }

**Une porte porte sa résolution en T3 et sa proposition dessous en T1 italique.**

⚠️ En contradiction avec [`bouton.corps-du-texte`](#bouton-corps-du-texte) — voir [C8](../../a-trancher.md#c8).

??? note "Pourquoi, et depuis quand"
    *« la résolution : c'est elle qu'on vient lire »* · la proposition porte *« le même habit que « drop it here » dans un collecteur vide — l'italique dit « je ne suis pas une donnée » »*.

    Valeur : T3 · T1 italique · Source : NORMES.md § « LE GABARIT DES DEUX LIGNES », ratifié 2026-08-27 · Statut : ratifié

### Borner la largeur ne réparait rien { #bouton-borner-la-largeur-ne-reparait-rien }

**Rétrécir la rangée ne résout pas le recouvrement du `?` : c'est `space-between` qui collait le dernier bouton au bord.**

??? note "Pourquoi, et depuis quand"
    *« le bouton de droite EST le bord droit, quel que soit son mot. Le nombre ne bougeait pas, parce que les deux objets visaient le même coin par construction. »* ⭐ *« On n'a rien inventé : on a étendu une recette qui marchait sur un écran à celle qui ne l'avait pas. »*

    Valeur : recouvrement **44 px, à 360 comme à 375** · `.parcours-pied` porte `center` + `padding-right: var(--touch)` depuis le 19/08 sans jamais avoir le conflit · Source : NORMES.md § « POURQUOI BORNER LA LARGEUR NE RÉPARAIT RIEN », mesuré 2026-08-26 · Statut : ratifié — annule la consigne « borner la largeur par calcul »
