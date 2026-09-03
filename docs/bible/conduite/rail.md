# Le menu latéral

Le menu latéral (le *rail*) vaut `90` blg et n'existe que là où il y a une liste à suivre. C'est
lui qui fait la différence entre un écran `F` et un écran `FF`.

## Design

**Aucune règle de dessin consignée.** Sa largeur est ratifiée, son habit ne l'est pas.

## Mesures

*ses cotes, et ce qui les calcule.*

### Le menu latéral : 90 blg { #cadre-rail }

**Le menu latéral vaut 90 blg partout, et n'existe que là où il y a une liste à suivre.**

??? note "Pourquoi, et depuis quand"
    les douze classes, les douze espèces, les 22 arcanes. Il valait 90 à l'étroit et 120 en grandeur Large jusqu'au 30/08 : *« c'était un rapport qui changeait avec la place — 11,25 fois `--sp-8` d'un côté, 15 de l'autre »*. Sur un 1920 au cran 2 le rail rend 180 pixels, bien au-delà des 120 que le desktop obtenait.

    Valeur : `--rail-w: 90` blg · `.stage-aside` · Source : CADRES.md § « 1. LES DEUX FAMILLES », 2026-08-30 · Statut : ratifié (le 120 en Large est renversé le 2026-08-30)

<!-- DESSIN À FAIRE — le menu latéral de 90 contre la colonne de contenu, à 360 — l'écran F contre l'écran FF -->

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Qui porte le menu latéral { #cadre-qui-porte-le-rail }

**Portent le menu (F) : Species, Class, le don d'origine panneau ouvert, Destiny en mode choix. Tout le reste est FF.**

??? note "Pourquoi, et depuis quand"
    *« la famille F N'A QU'UN SEUL FORMAT EN SERVICE, ET C'EST F1 : tout ce qui porte le menu est une fiche de catalogue. »* C'est Eric qui l'a relevé — *« Concept c'est du FF1 car pas de barre latérale »* — et le code lui donne raison.

    Valeur : relevé dans `catalogueCourant` (shell.mjs), 2026-08-16 · Source : CADRES.md § « 3 bis » · Statut : ratifié

### Le menu de Destiny en mode choix { #cadre-destiny-menu-en-mode-choix }

⏳ **À trancher.**

**Destiny n'a de menu qu'en mode choix ; le mettre en FF reviendrait à retirer le menu du mode qui en a le plus besoin.**

??? note "Pourquoi, et depuis quand"
    *« À trancher avant de le faire. »*

    Valeur : 22 arcanes · Source : CADRES.md § « 5 », 2026-08-16 · Statut : à trancher

### La dalle en écran F, place réservée { #cadre-f2-place-reservee }

**La dalle dans un écran F (ex-F2) n'a aucun utilisateur et rien ne l'implémente : c'est une place réservée.**

??? note "Pourquoi, et depuis quand"
    *« aucun écran du builder ne pose sa hauteur aujourd'hui »*.

    Valeur : `--card-w` = `--measure` · Source : CADRES.md § « 4 », 2026-08-16 · Statut : ratifié (place réservée)

### Le rail est vertical seulement { #socle-rail-vertical-seulement }

⏳ **À trancher.**

**Le rail existe dans sa forme VERTICALE ; la forme horizontale (la molette de catégories de Compétences) n'est pas construite.**

??? note "Pourquoi, et depuis quand"
    *« elle demandera son propre slot, et ce lot ne l'invente pas d'avance »*.

    Valeur : `.stage-aside` (B0.19) · forme horizontale = B7.1 · Source : SOCLE.md § « Le contrat d'un écran » · Statut : à trancher
