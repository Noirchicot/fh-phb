# L'écriture

Cette page porte les tailles T1 à T7, les trois états d'un texte qui change, et la loi des liens — tout nom de règle vu par le joueur pointe vers FH Web. Elle dit aussi ce que la capitale, l'italique et le corps de lecture signifient dans le builder.

## Les tailles T1 à T7

### T1 à T7 { #ecriture-t1-a-t7 }

**Les tailles de texte se nomment T1 à T7 — jamais H1/H2.**

??? note "Pourquoi, et depuis quand"
    les quatre vocabulaires ne se mélangent jamais ; `T1…T7` nomme les tailles, et rien d'autre.

    Valeur : `--t1` 10 · `--t3` 14 · `--t4` 16 · `--t6` 22 (blg) · Source : NORMES.md § « 1. LES QUATRE VOCABULAIRES », 2026-08-26 · Statut : ratifié

### Aucun texte sous T1 { #ecriture-aucun-texte-sous-t1 }

**Aucun texte ne peut passer sous T1.**

??? note "Pourquoi, et depuis quand"
    « Rien ne rétrécit sous le barème ratifié » — le plancher de l'échelle est « la taille 360 sur laquelle on travaille » (Eric), donc T1 est un plancher absolu, pas relatif.

    Valeur : plancher d'échelle = 1 · Source : NORMES.md § « 0 bis — Les six lois », 2026-08-30 · Statut : ratifié

### T1–T4 bougent désormais { #ecriture-t1-t4-bougent-desormais }

🧊 **Renversée le 2026-08-30** — remplacée par le zoom global : voir [`panneau.zoom-universel`](panneau.md#panneau-zoom-universel).

**« T1–T4 ne bougent pas » est tombé avec la grandeur Large : au cran 3 le corps vaut 48 blg.**

??? note "Pourquoi, et depuis quand"
    « Avec elle tombe « T1–T4 ne bougent pas » » : cette ligne avait un sens tant que la grandeur Large rehaussait certains corps et pas d'autres. Sous le zoom, tout grandit ensemble et le rapport ne change nulle part.

    Valeur : `tokens.css` §69 · Source : NORMES.md § « 0 bis — Ce que ça supprime », 2026-08-30 · Statut : renversé le 2026-08-30

## Les trois états d'un texte

### Les trois états d'un texte { #ecriture-trois-etats-de-texte }

**Un texte qui change se peint en trois états seulement : normal (encre), gain (vert), perte (rouge).**

??? note "Pourquoi, et depuis quand"
    *« Trois états, pas quatre. »* Et le bleu s'en trouve libéré : *« il ne sert plus qu'à ce qui est EN COURS et à l'aiguilleur. Une teinte, un seul sens. »*

    Valeur : `--text` · vert · rouge · ⛔ le bleu de la dictée disparaît des textes · Source : NORMES.md § « Les textes qui changent », Eric 2026-08-26 : *« normal noir / gain vert / perte rouge »* · Statut : ratifié

### Pas de noir littéral { #ecriture-pas-de-noir-litteral }

**« Ne bouge pas » ne veut pas dire « noir littéral » : c'est `--text`.**

??? note "Pourquoi, et depuis quand"
    *« le texte disparaît. Même intention, et ça survit au thème. »*

    Valeur : mesuré — `#000` sur le fond de nuit `#14120e` rend **1,11:1** · `--text` vaut `#d8d3c9` la nuit · Source : NORMES.md § « Les textes qui changent », 2026-08-26 · Statut : ratifié

### Une valeur inchangée ne se colore pas { #ecriture-une-valeur-inchangee-ne-se-colore-pas }

**Une valeur qui n'a pas changé ne se colore pas.**

??? note "Pourquoi, et depuis quand"
    *« La couleur est réservée à ce qui bouge — sinon elle ne signale plus rien. »*

    Source : NORMES.md § « Les textes qui changent », 2026-08-26 · Statut : ratifié

## Les liens

### Un lien hors jeton est bleu { #ecriture-lien-hors-jeton-est-bleu }

**Un lien hors jeton est bleu, non souligné ; le texte SUR un jeton reste en encre.**

??? note "Pourquoi, et depuis quand"
    *« LA LIGNE DE PARTAGE EST LE JETON, PAS L'INTERACTIVITÉ »* — corrigée le 29/08 sur le deuxième rappel d'Eric (*« pas de liens bleus sur sorts et cantrips du wizard »*). Un nom relu dans la prose du bilan n'est PAS un jeton : *« il est un mot au milieu d'autres mots, et il porte le bleu »*. ⛔ *« J'avais étendu la dictée du jeton au bilan — c'est la sur-extension que ce paragraphe interdit désormais. »*

    Valeur : `--lien` · `.lien-sort` · `.bilan-nom` · Source : NORMES.md § « 1 ter bis³ », Eric 2026-08-29 : *« Règle générale : liens hors token en bleu. »* · Statut : ratifié

### La couleur du lien { #ecriture-couleur-du-lien }

**`--lien` est un bleu à un souffle de l'encre : `#1f3250` de jour, `#c2d0e5` de nuit.**

??? note "Pourquoi, et depuis quand"
    ⛔ *« `--info` garde ses autres métiers (voyants, popups, boutons) : un lien n'est pas une information qui crie. »*

    Valeur : contre l'encre `#2d2c2a` (jour) et `#d8d3c9` (nuit) · calé en trois essais le 30/08 : `#1d2633` invisible → `#223f6d` trop bleu → le mi-chemin ratifié · Source : NORMES.md § « 1 ter bis³ », Eric 2026-08-29 : *« plus discret encore : on sait qu'il est là, mais on le voit à peine. Choisis un bleu très proche du noir »* · Statut : ratifié

### Pas de soulignement { #ecriture-pas-de-soulignement }

**Un lien n'est jamais souligné, et la décoration par défaut du navigateur doit être retirée explicitement.**

??? note "Pourquoi, et depuis quand"
    *« une règle qui pose l'encre sans retirer la décoration laisse la moitié des entrées crier. Deux habits dans une seule phrase. »* 📌 Portée mesurée : *« le builder ne produit que ces deux familles de liens. La règle est donc complète, pas partielle. »*

    Valeur : mesuré le 29/08 au bilan du magicien — les sorts (`<button>`) restaient nus, les compétences (`<a>` vers le livre) arrivaient soulignées · Source : NORMES.md § « 1 ter bis³ », 2026-08-29 · Statut : ratifié

### L'option de soulignage { #ecriture-option-soulignage-daltoniens }

⏳ **À trancher.**

**Une option joueur de soulignage des liens est à prévoir pour qui ne distingue pas ce bleu de l'encre.**

??? note "Pourquoi, et depuis quand"
    *« à trancher avec Eric le jour du panneau d'options, jamais un défaut imposé »*.

    Source : NORMES.md § « 1 ter bis³ », demande d'Eric le 2026-08-29 · Statut : à trancher

### La loi des liens { #ecriture-loi-des-liens }

**Dès qu'un skill, feat, trait, feature, spell, invocation ou training apparaît, il y a un lien vers le site FH Web — ou vers le SRD en mode SRD.**

??? note "Pourquoi, et depuis quand"
    Eric : *« Règle générale, partout dans le builder, dans FH web, dans la future fiche de perso… »*. Dictées antérieures absorbées : *« dans FH tous les skills sont linked à FH WEB »* · *« tous les sorts au SRD, sauf sorts modifiés »*. **La fiche condense, LES LIENS mènent au long.**

    Valeur : cantrips = spells · table de navigation dans `ui/builder/liens-fh.mjs` · Source : NORMES.md § « 7 ter — LA LOI GÉNÉRALE DES LIENS », loi-mère dictée le 2026-08-30 · Statut : ratifié

### L'ancre avant le lien { #ecriture-ancre-avant-lien }

**L'ancre se fabrique AVANT le lien : une famille sans ancre est une famille qu'on ne peut pas lier.**

??? note "Pourquoi, et depuis quand"
    « Un lien suppose une CIBLE : le livre fabrique des ancres prévisibles. Une famille sans ancre est une famille qu'on ne peut pas lier : l'ancre se fabrique AVANT le lien. »

    Valeur : `l<niveau>-<nom>` (feature) · `opt-<nom>` (option de classe) · `spell-<slug>` (sort — 339 sorts ancrés depuis le 30/08) · `chapters/classes/<classe>/#l<niveau>-<nom>` · ancres fabriquées par `sync_from_vault.py` · Source : NORMES.md § « 7 ter », 2026-08-30 · Statut : ratifié

### Pas de faux lien { #ecriture-pas-de-faux-lien }

**Un sort introuvable au query s'écrit en texte simple, jamais en faux lien.**

??? note "Pourquoi, et depuis quand"
    *« Un lien qui n'ouvre rien apprend à ne plus cliquer (la loi du `?`). »*

    Source : NORMES.md § « 7 ter », 2026-08-30 · Statut : ratifié

### Un lien en phrase se note { #ecriture-lien-en-phrase-se-note }

**Un lien à l'intérieur d'une phrase se NOTE, il ne se devine pas.**

??? note "Pourquoi, et depuis quand"
    *« chercher les noms du catalogue dans une phrase MENT — mesuré, « Shield » chez le moine est l'armure, pas le sort »*.

    Valeur : `LIENS_DICTES` (`class-step.mjs`), comme `RESUME_DICTE` · deux cas sur 35 phrases de bilan · Source : NORMES.md § « 7 ter », 2026-08-29 · Statut : ratifié

### Le mode SRD { #ecriture-mode-srd-non-cable }

⏳ **À trancher.**

**Le mode SRD (lier vers le SRD au lieu du site) est déclaré et attend son câblage.**

??? note "Pourquoi, et depuis quand"
    « ⏳ LE MODE SRD est déclaré ici et attend son câblage — la fenêtre FF interne, qui plie le texte SRD, en tient lieu sur les écrans de choix. »

    Valeur : la fenêtre FF interne, qui plie le texte SRD, en tient lieu sur les écrans de choix · Source : NORMES.md § « 7 ter », 2026-08-30 · Statut : à trancher

## La capitale, l'italique, le corps

### La capitale distingue l'étiquette { #ecriture-capitale-distingue-l-etiquette }

**Le nom d'un collecteur est en capitales, sa valeur en minuscules : la capitale est ce qui les distingue, jamais la taille.**

??? note "Pourquoi, et depuis quand"
    « l'ÉTIQUETTE, pas la valeur — la capitale est ce qui les distingue, jamais la taille » : les deux sont à T1, donc c'est la casse seule qui porte la différence. Et les minuscules de la valeur sont « garanties par la RÈGLE, pas par la source ».

    Valeur : `text-transform: uppercase` sur le nom, `none` sur la valeur · Source : NORMES.md § « 1 ter bis² » et § « 2 ter », 2026-08-26 / 29 · Statut : ratifié

### L'italique dit « pas une donnée » { #ecriture-italique-dit-pas-une-donnee }

**L'italique dit « je ne suis pas une donnée » : c'est l'habit d'une proposition et d'un mot d'attente.**

??? note "Pourquoi, et depuis quand"
    sans elle, un mot posé dans une case au même corps et à la même couleur qu'un nom choisi « se lisait comme une réponse — comme si le personnage s'appelait « drop it here » ». L'italique dit « je ne suis pas une donnée ».

    Valeur : « drop it here » · la proposition sous une résolution · la ligne de skills du bilan · Source : NORMES.md § « 2 ter — précision ④ » et § « LE GABARIT DES DEUX LIGNES », 2026-08-26 / 27 · Statut : ratifié

### Un corps de lecture ne se met pas à l'échelle { #ecriture-corps-de-lecture-ne-se-met-pas-a-l-echelle }

🧊 **Renversée le 2026-08-27** — remplacée par un dessin proportionnel, pour la carte du rang R et pour elle seule : voir [`budget.carte-r-est-un-dessin`](budget.md#budget-carte-r-est-un-dessin).

**Un corps de texte est une taille de LECTURE : il vaut 16 sur les deux écrans, il ne se met pas à l'échelle avec sa dalle.**

⚠️ En contradiction avec [`budget.carte-r-est-un-dessin`](budget.md#budget-carte-r-est-un-dessin) — voir [C11](a-trancher.md#c11).

??? note "Pourquoi, et depuis quand"
    *« Une boîte de texte proportionnelle voudrait dire un texte proportionnel, donc illisible en bas d'échelle ou ridicule en haut. »*

    Valeur : mesuré — 16 px à 375 × 553 comme à 1280 × 800, hauteurs de bloc identiques au pixel (126 = 126, 14 = 14) · Source : CADRES.md § « 8 », 2026-08-16 · Statut : ⚠️ **renversé pour la carte du rang R seulement** (NORMES § 4 quater, 27/08) — voir [C11](a-trancher.md#c11)

## La mise en mots

### Le bilan parle en mode texte { #ecriture-bilan-en-mode-texte }

**Le bilan d'un B parle en mode texte : une tête, puis les niveaux dessous.**

??? note "Pourquoi, et depuis quand"
    *« le « spent » de la porte n'a plus rien à dire »* une fois qu'on liste les compétences dotées.

    Valeur : lignage → **High Elf Lineage** (`motDe` sans parenthèses, sous-titre capitalisé) · bourse → **Skill budget** nu, puis *Delve novice, Survival novice* sur **une ligne, en italique**, chaque skill étant un lien · Source : NORMES.md § « 4 quinquies — Le bilan du B », Eric 2026-08-27 mot pour mot · Statut : ratifié

### Une source, trois consommateurs { #ecriture-une-source-trois-consommateurs }

**La mise en mots d'un lignage a UNE source, lue par trois consommateurs.**

??? note "Pourquoi, et depuis quand"
    Eric y tient : *« je tiens à « At subsequent levels » »*. SB1 garde les textes complets (*« dans lineages on a la place, on peut garder le format, mais tu link les spells »*) ; le bilan lit le **format raccourci** (`data[fiche_lineage_lvl1]`) — *« c'est un format raccourci pour entrer dans les fiches »*. ⏳ Migrera dans une vraie famille srfh de fh-srd.

    Valeur : `lignesDuLignage` (species-step) → la fenêtre du SB1, le popup du tap, le bilan du B · Source : NORMES.md § « 4 quinquies — La mise en mots d'un lignage », Eric 2026-08-27 · Statut : ratifié

### Le condensé de la carte R { #ecriture-condense-de-la-carte-r }

**Le contenu d'une carte-résumé se taille pour les boîtes, jamais l'inverse.**

??? note "Pourquoi, et depuis quand"
    Eric : *« c'est un résumé de classe »* · *« transformer un player handbook de taille livre en ce petit condensé »*. Le blurb arbitré en trois temps : *« 1/3 → vers 1/4, sinon on s'asphyxie → 3/10 »*. *« La boîte se compte en LIGNES, jamais une ligne coupée aux deux tiers. »* ⚖️ Une exception mesurée : « Berserker : Rage into Violent fury » (34 car., 226/226 au pixel) — Eric : *« si t'as la place »*.

    Valeur : ligne lineage/subclass **≤ 31 caractères**, `nowrap` au paysage (mesuré : « Ten lines : breath + resistance » = 226 px pile) · blurb portrait **8 lignes pleines** = 3/10 de la zone, justifié + césure · Source : NORMES.md § « 4 quater — Le format du contenu », 2026-08-27 · Statut : ratifié

### Un nom court, sans préfixe générique { #ecriture-nom-court-sans-prefixe-generique }

**La bande de classe porte un nom COURT : on dégage « path ».**

??? note "Pourquoi, et depuis quand"
    *« le préfixe générique est une information nulle, le nom complet vit au rang B »*.

    Valeur : *« Berserker : Rage into fury »* · garde 6 bis — le nom court doit **vivre dans** le vrai nom SRD · Source : NORMES.md § « 4 quater », Eric 2026-08-27 : *« on dégage path »* · Statut : ratifié

### Page unique { #ecriture-page-unique }

**Page unique, sauf mention contraire.**

??? note "Pourquoi, et depuis quand"
    c'est le défaut de tout écran du builder, dans le prolongement de « la page ne défile jamais » : ce qui ne tient pas ne descend pas, il pagine ou il est en trop.

    Source : NORMES.md § « 8. AUTRES ORGANES ET TEXTES », 2026-08-26 · Statut : ratifié

### Le `ch` borne de la prose { #ecriture-mesure-de-prose }

**Le `ch` reste légitime pour borner de la prose, jamais une boîte dont dépendent d'autres cotes.**

??? note "Pourquoi, et depuis quand"
    *« une longueur de ligne EST une affaire de caractères »*.

    Valeur : `--measure` 62ch · Source : CADRES.md § « 2 bis », 2026-08-29 · Statut : ratifié
