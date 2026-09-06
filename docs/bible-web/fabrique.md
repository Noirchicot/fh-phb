# ③ La fabrique

Qui écrit quoi, et ce qui est écrasé. **Le vault est le MANUSCRIT. `fh-phb` est l'IMPRIMERIE. La
page web est un TIRAGE.** Image ratifiée avec Eric le 2026-08-20, après qu'il ait trouvé
*« illogique que le site aille chercher sa source ailleurs »*.

## Le vault est le manuscrit { #fabrique-vault-est-le-manuscrit }

**Le site n'a AUCUN texte à lui : les chapitres de `docs/chapters/` sont fabriqués à chaque sync.
Corriger là est sans effet — la correction est écrasée au tirage suivant.**

📍 `fabrique-vault-est-le-manuscrit` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    **Il n'y a donc jamais eu deux sources.** Eric craignait que *« quelque chose de chez lui »* fasse autorité sans qu'on sache lequel. 📏 La vraie cause du désordre n'était pas la duplication — **mesurée : 3 paires sur 129 documents** — mais **des noms qui ne disaient pas ce qu'ils désignaient**.

    ⛔ **La règle `X_` a été envisagée puis abandonnée le 20/08, mesure à l'appui** : `ARCHITECT-HANDOFF.md` est cité par 410 fichiers, `COMPANION-BUILD-PLAN.md` par 148 dont 16 de code. Renommer = réécrire des centaines de citations pour un gain nul, puisque git tranche déjà.

    ⭐ **Rien ne publie tout seul** : il faut deux commandes délibérées — `sync_from_vault.py`, puis `gh-deploy`. *« La machine ne le regarde pas taper. »*

    Source : mémoire ratifiée `feedback_vault_est_le_manuscrit`, 2026-08-20 · Statut : ratifié

## Une règle se corrige dans le chapitre qui la publie { #fabrique-corriger-dans-le-chapitre }

**Toute règle de Fate's Hand se corrige à la SOURCE : le chapitre du vault sous
`5.RPG/Fate's Hand/0. D&D 5+ Rules/` qui alimente le site. ⛔ Jamais dans une note « à reporter ».**

📍 `fabrique-corriger-dans-le-chapitre` · vivante · 18/08

??? note "Pourquoi, et depuis quand"
    Arbitrage d'Eric le 2026-08-18, au terme d'une séance où on a découvert **quatre documents se déclarant autorité**, dont deux se contredisant frontalement à deux jours d'écart. C'est cette concurrence qui a laissé **six pools de compétence faux vivre des mois** — et c'est **Eric** qui les a attrapés, pas la suite de tests.

    Eric : *« corriger direct à la source, quitte à se rendre compte une fois sur dix qu'on a fait une connerie, et dans ce cas on vérifie les autres sources »*.

    ⛔ **Un addendum est une correction DIFFÉRÉE, et une correction différée pourrit.** ✅ Ce qui reste légitime hors du chapitre : la **recette** et le **registre des décisions avec leur raison** — ni l'une ni l'autre n'est une règle joueur. *(Cette Bible est de ce côté-là.)*

    Source : mémoire ratifiée `feedback_source_unique_regles_fh` · Statut : ratifié

## Le test mécanique : la table `MAP` { #fabrique-test-de-la-table-map }

**Si un fichier n'est pas dans la table `MAP` de `sync_from_vault.py`, il ne sort pas — donc ce
n'est pas une règle.**

📍 `fabrique-test-de-la-table-map` · vivante · 18/08

??? note "Pourquoi, et depuis quand"
    Pipeline **à sens unique** : `0. D&D 5+ Rules/` → `docs/chapters/` → `noirchicot.github.io/fh-phb/`. Sur les milliers de fiches du vault, **25 seulement** intéressent la machine ; `2. World`, `3. The Campaign`, `9. Miscellaneous` sont hors de portée du sync.

    ⚠️ **Et la table peut mentir dans l'autre sens** — voir [`socle.et-chapitre-peut-perdre-son-amont`](#fabrique-ce-qui-vit-chez-le-voisin).

    Source : mémoire ratifiée `feedback_source_unique_regles_fh` · Statut : ratifié

## `docs/chapters/` est GÉNÉRÉ { #fabrique-docs-chapters-est-genere }

**⛔ `docs/chapters/*.md` est généré par `sync_from_vault.py`. Y écrire est écrasé à la synchro
suivante.**

📍 `fabrique-docs-chapters-est-genere` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    Le script porte sa propre loi : *« il est GÉNÉRÉ, jamais écrit »*. C'est le premier des quatre gardes : *« la petite correction en passant est écrasée à la construction suivante. Rien à retenir. »*

    ⚠️ **Corollaire pour cette Bible** : elle vit dans `docs/bible-web/`, **hors de `MAP`**, donc elle n'est pas écrasée. C'est pour ça qu'elle est là et pas dans un chapitre.

    Source : `sync_from_vault.py` · Statut : ratifié, gardé

## Une note d'atelier se met en callout { #fabrique-note-d-atelier-en-callout }

**Une note qui ne doit pas être publiée se met dans un callout `> [!warning]+ CANONICAL …` :
`strip_callouts()` la supprime au tirage.**

📍 `fabrique-note-d-atelier-en-callout` · vivante · 20/08

??? note "Pourquoi, et depuis quand"
    C'est le seul moyen d'écrire dans le manuscrit quelque chose qui n'est pas pour le lecteur. ⚠️ Tout autre encadré **sort au tirage** : l'encadré `[!danger] Draft` d'`ability-scores` est aujourd'hui **publié**, et il s'adresse à Eric.

    Source : mémoire ratifiée `feedback_vault_est_le_manuscrit` · Statut : ratifié

## Le code n'est pas la source { #fabrique-code-n-est-pas-la-source }

**⛔ On n'écrit pas le livre depuis le code. On le lit pour savoir **quoi demander** — et chaque
fois que le code a été la SEULE source, on le marque : *« ⚠️ relevé dans l'implémentation, non
ratifié »*.**

📍 `fabrique-code-n-est-pas-la-source` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    ⭐ *« Si tu canonises le code, tu graves ses bugs. »* La loi du dépôt est l'inverse du réflexe : une règle se corrige dans le chapitre du vault qui la publie, pas dans l'implémentation qui l'exécute.

    ⛔ **Jamais de section publiée qui repose sur une lecture de code non ratifiée.** Les trois sections de méthodes écrites le 06/09 portent toutes leur marque ⚠️, et le chapitre porte un encadré `[!danger] Draft` qui dit d'où elles viennent.

    Source : `MANDAT — Les trois méthodes que le livre ne dit pas (fh-phb).md`, § « LA RÈGLE QUI PEUT TOUT GÂCHER » · Statut : ratifié

## Un second écrivain sur le même bloc est un défaut { #fabrique-second-ecrivain-est-un-defaut }

**Deux écrivains sur le même bloc ne font pas un doublon inoffensif : ils font un défaut. Réparer,
c'est SUPPRIMER le second écrivain — pas synchroniser les deux.**

📍 `fabrique-second-ecrivain-est-un-defaut` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    Le siège du 2026-09-06 a **évité de justesse** une page portant **deux** pieds de page — le bandeau généré et une déclaration écrite à la main disant la même chose autrement.

    ⭐ C'est la même maladie que celle payée quatre fois dans `fhpc` : *« une donnée lue à plusieurs endroits diverge en silence »*. C'est aussi pourquoi les trois règles du livre qui vivent dans le corpus du builder ne sont **pas recopiées ici** — voir [ci-dessous](#fabrique-ce-qui-vit-chez-le-voisin).

    Source : `MANDAT — La Bible de FH WEB (fh-phb).md`, § « Les pièges de ce terrain » · Statut : ratifié

## Un chiffre se mesure, il ne se rappelle pas { #fabrique-un-chiffre-se-mesure }

**Toute probabilité, toute moyenne, tout compte écrit dans un chapitre est **recalculé**, jamais
recopié d'un souvenir. Et un relevé se DATE : *« à 06:42, X valait Y »*, jamais *« X vaut Y »*.**

📍 `fabrique-un-chiffre-se-mesure` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    Écrit comme piège de terrain le 2026-09-06, et il a une jumelle dans le corpus du builder : *« un gabarit se mesure, il ne se relit pas »*.

    Source : `MANDAT — Les trois méthodes que le livre ne dit pas (fh-phb).md` · Statut : ratifié

## L'or ne se déduit pas { #fabrique-l-or-ne-se-deduit-pas }

**Le générateur MARQUE `class="fh"` là où c'est Fate's Hand ; le style ne devine plus quelles
colonnes sont de la maison.**

📍 `fabrique-l-or-ne-se-deduit-pas` · vivante · 28/08

??? note "Pourquoi, et depuis quand"
    `th:nth-last-child(-n+3)` **déduisait** quelles cellules d'en-tête sont FH. La première rangée d'en-tête ne compte pas les mêmes cellules que le corps : *« Cantrips »* et *« Prepared Spells »*, **deux colonnes du SRD**, portaient l'or de la maison — **publiées ainsi, sur douze pages**.

    🙏 **Une cote donnée bat une cote déduite.**

    Source : logbook `FH PHB — Citer le SRD.md`, § « AMENDEMENT DU 2026-08-28 », point 3 · Statut : ratifié, corrigé

## `fh-phb` se déploie depuis `gh-pages` { #fabrique-gh-pages-pas-main }

**⚠️ `fh-phb` se déploie depuis `gh-pages`, PAS depuis `main` — ⛔ différent de `fhpc`.
`./.venv/bin/mkdocs gh-deploy --force`. ⛔ Et le déploiement est **le geste d'Eric**.**

📍 `fabrique-gh-pages-pas-main` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    Écrit comme piège de terrain dans les deux mandats du 2026-09-06, parce qu'un siège qui vient de `fhpc` a la mauvaise habitude en tête.

    Source : `MANDAT — La Bible de FH WEB (fh-phb).md` · Statut : ratifié

## Le vault s'écrit en local, sans git { #fabrique-vault-en-local-sans-git }

**⚠️ Le vault s'écrit **EN LOCAL** (`~/obsidian-vault/`), jamais via un MCP distant. ⛔ Aucun
`git add/commit/push` dedans : le plugin Obsidian Git committe seul.**

📍 `fabrique-vault-en-local-sans-git` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    ⚠️ Le dossier `~/Library/Mobile Documents/iCloud~md~obsidian/Documents` est un **stub vide** : le vault réel a été déplacé hors iCloud.

    Source : `MANDAT — La Bible de FH WEB (fh-phb).md` ; mémoire `feedback_vault_git_autocommit`, `feedback_vault_location_anchor` · Statut : ratifié

## Ce qui vit chez le voisin { #fabrique-ce-qui-vit-chez-le-voisin }

**Une règle du livre qui a son adresse dans le corpus du BUILDER se **CITE**, ⛔ elle ne se
recopie pas.**

📍 `fabrique-ce-qui-vit-chez-le-voisin` · vivante · 06/09

⚠️ **Trois règles qui parlent du LIVRE ont leur adresse dans le corpus du BUILDER.** Elles y sont
nées, elles y sont adressées, et ⛔ **elles ne sont pas recopiées ici** —
[`fabrique-second-ecrivain-est-un-defaut`](#fabrique-second-ecrivain-est-un-defaut) l'interdit. On
les **cite**, à leur adresse.

| adresse, dans `fhpc/ui/builder/` | ce qu'elle dit du livre |
|---|---|
| [`socle-inventaire-qui-ne-visite-pas-trois-lieux-ne-compte`](../bible/general/socle.md) *(SOCLE.md, 04/09)* | le contenu FH vit en **trois lieux** — le vault (manuscrit), `fh-phb` (imprimerie), les couches (ce que la machine lit). *« Écrit »*, *« publié »* et *« affichable »* sont trois états différents. 🔴 **Avant tout compte, dire lequel des trois on interroge** : un compte sans son lieu est un chiffre sans unité |
| [`socle-et-chapitre-peut-perdre-son-amont-sans-que-rien-ne`](../bible/general/socle.md) *(SOCLE.md, 04/09)* | `college-of-banners.md`, `silent-blade.md` et `spell-rigger.md` descendent d'une source du vault **qui n'existe pas**. Ces trois chapitres vivent **uniquement dans l'imprimerie** : une correction au vault ne les atteint jamais, une correction dans `fh-phb` sera écrasée le jour où quelqu'un croit que la table dit vrai. ⏳ Le rapatriement appartient à Eric (*« ok pour plus tard »*, 04/09) |
| [`ecriture-ancre-avant-lien`](../bible/general/ecriture.md#ecriture-ancre-avant-lien) *(NORMES.md, 30/08)* | **l'ancre se fabrique AVANT le lien** — et c'est **`sync_from_vault.py` qui les fabrique** : `l<niveau>-<nom>` (feature) · `opt-<nom>` (option de classe) · `spell-<slug>` (339 sorts ancrés depuis le 30/08) · `chapters/classes/<classe>/#l<niveau>-<nom>`. Une famille sans ancre est une famille qu'on ne peut pas lier |

📖 **Et la réciproque est vraie** : [`ecriture-loi-des-liens`](../bible/general/ecriture.md#ecriture-loi-des-liens)
(30/08) dit que **tout** skill, feat, trait, feature, spell, invocation ou training affiché par le
builder porte un lien **vers ce site**. C'est une règle du builder qui **suppose** que le livre
tient ses ancres. ⚠️ Elle entre en tension avec la portée déclarée du corpus voisin — voir
[W4](a-trancher.md#w4).
