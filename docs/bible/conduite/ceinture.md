# La ceinture

La ceinture (`.belt`) est la barre des étapes. Elle n'est pas un cadre : c'est la coquille, et un
cadre commence sous elle. Sa hauteur ne s'écrit pas, elle se déduit.

## Design

**Aucune règle de dessin consignée.** On sait qu'elle est toujours là et ce qu'elle pèse ; à quoi elle ressemble n'est écrit nulle part.

## Mesures

*ses cotes, et ce qui les calcule.*

### La ceinture se déduit { #budget-ceinture-deduite }

**La ceinture n'a ni hauteur ni jeton : elle se déduit, et son ≈60 est un relevé, pas une constante.**

??? note "Pourquoi, et depuis quand"
    *« il bouge si un libellé change »*.

    Valeur : ≈ **60** au réglage d'aujourd'hui · Source : NORMES.md § « 1 quater — La ceinture », 2026-08-26 · Statut : ratifié

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### La ceinture est toujours visible { #cadre-belt-toujours-visible }

**La ceinture n'est jamais couverte par aucun cadre : elle n'est pas un cadre, c'est la coquille, et un cadre commence sous elle.**

⚠️ En contradiction avec [`budget.entree-r-sans-ceinture`](#budget-entree-r-sans-ceinture) · [`cadre.seuil-est-un-fs`](../general/cadres.md#cadre-seuil-est-un-fs) — voir [C10](../a-trancher.md#c10).

??? note "Pourquoi, et depuis quand"
    elle n'est pas un cadre : c'est la coquille, et « un cadre commence sous elle ». La constante est écrite en tête de CADRES sous le titre « LA CONSTANTE, ET ELLE EST AU-DESSUS DE TOUT ».

    Valeur : hauteur mesurée **60** (375 × 553, 2026-08-16) · Source : CADRES.md § « 0. LA CONSTANTE », première ligne du croquis : *« BELT IS ALWAYS VISIBLE »* · Statut : ratifié (⚠️ voir contradiction [C10](../a-trancher.md#c10) — FS recouvre tout, et Entrée › R n'a pas de ceinture)

<!-- DESSIN À FAIRE — la ceinture et ses crans, et le cadre qui commence SOUS elle — ⚠️ disposition seulement, aucune règle de dessin n'existe pour elle -->

### Entrée › R n'a pas de ceinture { #budget-entree-r-sans-ceinture }

**Entrée › R n'a pas de ceinture : c'est un seuil, pas une étape du parcours — 60 px récupérés.**

⚠️ En contradiction avec [`cadre.belt-toujours-visible`](#cadre-belt-toujours-visible) · [`cadre.seuil-est-un-fs`](../general/cadres.md#cadre-seuil-est-un-fs) — voir [C10](../a-trancher.md#c10).

??? note "Pourquoi, et depuis quand"
    « c'est un SEUIL, pas une étape du parcours à 8 temps » — la ceinture nomme les étapes ; un écran qui n'en est pas une n'a rien à y montrer, et récupère ses 60 px.

    Valeur : 60 px · Source : NORMES.md § « 1 quater — La ceinture », 2026-08-26 · Statut : ratifié (⚠️ voir contradiction [C10](../a-trancher.md#c10))
