# Le dropdown

Le dropdown est la commande à liste : soit on y prend une valeur (dropdown de CHOIX), soit il dit
où va un objet (dropdown DIRECTIONNEL).

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### L'habit du dropdown { #dropdown-habit }

**Un dropdown est rectangulaire, très large et peu haut, sans aucun liseré, à 20 % de transparence, en caractères gras contrastants.**

⚠️ En contradiction avec [`dropdown.ecart-avec-le-code`](#dropdown-ecart-avec-le-code) — voir [C7](../a-trancher.md#c7).

??? note "Pourquoi, et depuis quand"
    *« c'est un contrôle qu'on touche »*, donc 44.

    Valeur : hauteur `--touch` **44** · Source : NORMES.md § « LES DEUX DROPDOWNS », Eric 2026-08-26 — *« PAS DE LISERÉ sur un dropdown »*, corrigeant sa propre dictée · Statut : ratifié

<!-- DESSIN À FAIRE — l'habit du dropdown — rectangulaire, très large et peu haut, sans liseré, à 20 % — et l'écart du code montré à côté -->

### L'écart du dropdown avec le code { #dropdown-ecart-avec-le-code }

⏳ **À trancher.** Écart connu.

**Le code est en écart sur trois points : liseré 1 px (et même vert conditionnel), fond opaque, pas de gras.**

⚠️ En contradiction avec [`dropdown.habit`](#dropdown-habit) — voir [C7](../a-trancher.md#c7).

??? note "Pourquoi, et depuis quand"
    ⏳ *« Trois corrections à faire quand les organes seront refaits. La hauteur, elle, n'a pas à bouger. »*

    Valeur : `.pipeline-dropdown` porte `--ok`, *« exactement le liseré vert supprimé »* · fond `--surface` / `--sunken` · `font: inherit` · Source : NORMES.md § « Le dropdown : la hauteur est juste, le reste est en écart », 2026-08-26 · Statut : à trancher (⏳ écart connu)

## Mesures

**Aucune règle de mesure consignée.** ⚠️ Le dropdown a pourtant une cote : la table des hauteurs lui donne `44` ([`budget.table-des-hauteurs`](../general/budget.md#budget-table-des-hauteurs)). Elle vit dans le budget, jamais sur l'organe.

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Les deux métiers du dropdown { #dropdown-deux-metiers }

**Il y a deux dropdowns : celui de CHOIX (on y prend une valeur) et le DIRECTIONNEL (il dit où va l'objet).**

??? note "Pourquoi, et depuis quand"
    « ils ne font pas le même métier » : l'un sert à prendre une valeur, l'autre à dire où va l'objet — et c'est cette différence de métier qui rend la valeur par défaut obligatoire sur le second seulement.

    Valeur : directionnel = le collecteur d'équipement, dropdown `backpack` par défaut + bouton `Send` · Source : NORMES.md § « LES DEUX DROPDOWNS », tranché 2026-08-26 · Statut : ratifié

### Un directionnel a un défaut obligatoire { #dropdown-defaut-obligatoire-au-directionnel }

**Un dropdown directionnel a OBLIGATOIREMENT une valeur par défaut.**

??? note "Pourquoi, et depuis quand"
    *« il répond à une question que le joueur ne s'est pas posée. Sans défaut, l'objet reste en l'air et le geste échoue en silence — avec `backpack` déjà là, `Send` marche du premier coup. »* C'est la règle des **prévalidés** : *« un réglage qui a un bon défaut se montre sans se demander »*.

    Valeur : `backpack` · Source : NORMES.md § « LES DEUX DROPDOWNS », 2026-08-26 · Statut : ratifié
