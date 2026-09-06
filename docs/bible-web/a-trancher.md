# ⚠️ À trancher

Cinq contradictions vivantes et une option jamais rendue. Chacune oppose **deux passages écrits
tous les deux comme vrais**, avec **leurs deux citations et leurs deux dates**. ⛔ **Rien n'est
tranché ici** — c'est Eric qui décide.

## W1 — Le corps d'`ability-scores` : « réglé », ou huit violations ? { #w1 }

**Question : nommer le jeu de base dans le corps d'un chapitre est-il la citation que la ligne
éditoriale interdit, ou la mention nécessaire d'une méthode empruntée ?**

- **Eric, 2026-08-25** : *« Ne pas toujours dire "à la différence du SRD, on fait comme ça". Mais
  juste dire **"on fait comme ça"**. »* · **Eric, 2026-09-06** : *« on lit le texte des règles FH
  comme si c'était la première fois, **on ne cite pas**. »*
- **Le manuscrit, 2026-09-06**, encadré *Settled on 2026-09-06* : *« they are **retold here in
  Fate's Hand's words, never copied**, and what Fate's Hand changes around them is listed at the
  foot of the page. »*
- 📏 **Relevé le 2026-09-06 à 20:23** : **huit** mentions du jeu de base dans le corps du chapitre
  (lignes 3, 54, 68, 69, 71, 82, 105, 130 du manuscrit), hors pied de page et hors encadré de
  brouillon.
- Règles concernées : [`voix-affirmatif-seul`](voix.md#voix-affirmatif-seul) ·
  [`voix-premiere-lecture`](voix.md#voix-premiere-lecture) ·
  [`voix-huit-citations-ability-scores`](voix.md#voix-huit-citations-ability-scores)
- ⚠️ Les deux textes sont du **même camp** sur l'intention et **opposés sur le fait** : le chapitre
  se dit conforme, et il ne l'est pas au sens strict de la règle. **Ni l'un ni l'autre n'a été
  retiré.**

## W2 — `4D6` et `ARRAY` ont-ils leur place dans un chapitre FH ? { #w2 }

**Question : le contrat des trois étages range-t-il ces deux méthodes en **SRD** — donc hors d'un
chapitre Fate's Hand — ou en **SRFH**, parce que ce qui les entoure est de la maison ?**

- **`MANDAT — Les trois méthodes que le livre ne dit pas`, 2026-09-06** : *« décrire `ARRAY` et
  `4D6` **tels que le SRD les définit**, dans un chapitre FH, c'est **recopier de la prose SRD** —
  ⛔ et le dépôt l'interdit. […] mais si Fate's Hand les **modifie**, alors ce ne sont plus les
  méthodes du SRD et elles ont leur place ici. »*
- **Le manuscrit, 2026-09-06**, le même jour : *« `4d6` and the standard array are the **base
  game's own** methods, and **they stay in this chapter**. »*
- Le test est celui d'Eric et il porte **sur le NOM** : *« si on change ça, est-ce que ça s'appelle
  encore le SRD ? »* — oui → **SRD** · on ne sait pas → **SRFH** · non → **SRFH+**.
  Aujourd'hui les dés ne sont pas touchés ; **ce qui change est autour** (les points d'Inheritance
  sur n'importe quelle caractéristique, le plafond à 18 tout compris).
- Règles concernées : [`citation-pas-plus-que-necessaire`](citation.md#citation-pas-plus-que-necessaire) ·
  [`citation-declare-la-substitution`](citation.md#citation-declare-la-substitution) ·
  [`appareil-troisieme-etat-declare`](appareil.md#appareil-troisieme-etat-declare)
- ⏳ **Et une seconde question, laissée ouverte le même jour par le siège précédent** : le **Point
  Cost** du jeu de base — la seule méthode sans bouton — doit-il être **nommé** sur cette page ?
  ⛔ Le bandeau ne le nomme pas, délibérément : l'annoncer *« retiré »* trancherait à la place
  d'Eric.

## W3 — L'attribution CC-BY : avec chaque bloc, ou une seule fois ? { #w3 }

**Question : le logbook doit-il être corrigé, ou l'attribution par bloc doit-elle revenir ?**

- **Logbook `FH PHB — Citer le SRD.md`, écrit le 2026-08-20, fichier touché le 2026-08-29** :
  *« l'attribution CC-BY est aujourd'hui **générée avec chaque bloc**, précisément pour qu'elle
  "ne puisse plus être oubliée" »* — écrit deux fois dans la même page.
- **`sync_from_vault.py`, 2026-08-21 à 05:03** *(commit `a809636`, « Le livre cesse de dire à
  chaque paragraphe qu'il cite »)* : `ATTR_PAR_BLOC = False`, et le commentaire : *« la CC BY 4.0
  exige **UNE** mention »* · *« Elle est ici et nulle part ailleurs. »*
- Règles concernées : [`appareil-attribution-par-bloc`](appareil.md#appareil-attribution-par-bloc)
  *(remplacée)* · [`appareil-attribution-une-seule-fois`](appareil.md#appareil-attribution-une-seule-fois) *(vivante)*
- ⚠️ **Le code a gagné il y a seize jours, et le logbook ne le sait pas.** Un siège qui lirait
  aujourd'hui la source principale de la citation **remettrait l'attribution par bloc**, en croyant
  réparer un oubli. ⛔ Ce n'est pas une dispute de fond : c'est un **document périmé qui commande
  encore**. Le corriger est une décision d'Eric parce qu'il touche à la licence, pas au goût.

## W4 — La loi des liens : règle du builder, ou règle du livre ? { #w4 }

**Question : une règle dictée « partout dans le builder, dans FH web, dans la future fiche de
perso » appartient-elle au corpus qui déclare ne pas régir le site ?**

- **`fhpc/ui/builder/SOCLE.md` · `NORMES.md` · `CADRES.md`, en-tête commun, 2026-08-29** :
  *« 📌 **PORTÉE : LE BUILDER.** Le site du livre (`fh-phb`) a sa propre feuille et **n'est pas régi
  ici**. L'étendre est une décision d'Eric, pas une conséquence de ce paragraphe. »*
  → [`socle.portee-builder`](../bible/general/socle.md#socle-portee-builder)
- **`fhpc/ui/builder/NORMES.md` § 7 ter, dictée d'Eric du 2026-08-30** : *« **Règle générale,
  partout dans le builder, dans FH web, dans la future fiche de perso…** »* — et la règle publiée
  dit : *« Dès qu'un skill, feat, trait, feature, spell, invocation ou training apparaît, il y a un
  lien vers le site FH Web. »*
  → [`ecriture.loi-des-liens`](../bible/general/ecriture.md#ecriture-loi-des-liens)
- Règles concernées, côté livre : [`fabrique-second-ecrivain-est-un-defaut`](fabrique.md#fabrique-second-ecrivain-est-un-defaut) ·
  [le tableau « ce qui vit chez le voisin »](fabrique.md#fabrique-ce-qui-vit-chez-le-voisin)
- ⚠️ **La règle du 30/08 est postérieure d'un jour à la portée du 29/08, et elle la déborde
  explicitement.** Trois règles au moins sont dans ce cas :
  `ecriture.loi-des-liens`, `ecriture.ancre-avant-lien` *(les ancres sont fabriquées par
  `sync_from_vault.py`, dans ce dépôt-ci)* et `socle.et-chapitre-peut-perdre-son-amont` *(qui parle
  de trois chapitres de `fh-phb`)*.
  ⛔ **Elles n'ont pas été recopiées ici**, pour ne pas créer un second écrivain — elles sont
  citées. **Où elles doivent VIVRE est à trancher.**

## W5 — Une note d'atelier a-t-elle le droit d'être publiée ? { #w5 }

**Question : un brouillon assumé se montre-t-il au lecteur, ou se cache-t-il derrière le callout
que le tirage supprime ?**

- **`feedback_vault_est_le_manuscrit`, 2026-08-20** : *« Une note d'atelier qui ne doit pas être
  publiée se met dans un callout `> [!warning]+ CANONICAL …` : `strip_callouts()` la supprime au
  tirage. »*
- **Le manuscrit `D&D 5+ Character stat generation.md`, 2026-09-06** : un encadré
  `> [!danger] Draft — the other three methods, awaiting ratification` qui **s'adresse à Eric**
  (*« every line marked ⚠️ was read in the code and nowhere else »*, *« Still Eric's alone, and not
  decided here »*) — et 📏 **relevé le 2026-09-06 à 20:23, il est PUBLIÉ** *(`docs/chapters/ability-scores.md`,
  lignes 44-56)*.
- Règles concernées : [`fabrique-note-d-atelier-en-callout`](fabrique.md#fabrique-note-d-atelier-en-callout) ·
  [`fabrique-code-n-est-pas-la-source`](fabrique.md#fabrique-code-n-est-pas-la-source)
- ⚠️ **Les deux se défendent** : le mandat du 06/09 exigeait que toute lecture de code non ratifiée
  soit **marquée visiblement**, et un marquage caché au tirage ne marque plus rien. Mais le lecteur
  du livre reçoit une note d'atelier. **Le conflit est réel, et aucune des deux règles n'a été
  retirée.**

## ⏳ W6 — Le rappel : en pied de chaque chapitre, ou dans son propre chapitre ? { #w6 }

**Ce n'est pas une contradiction : c'est une option qu'Eric a ouverte et jamais refermée.**

- **Eric, 2026-08-20 au soir** : *« le rappel de ce qui diffère **en fin de chaque chapitre**, là où
  quelques initiés veulent en savoir plus. **Voire même dans un chapitre où il n'y a que ça.** »*
- 📌 *« Il a dit « voire même » — pas « plutôt ». Un chapitre unique « What Fate's Hand changes »
  est une **option**, pas un ordre. »*
- État en place, 📏 relevé le 2026-09-06 : **en pied de chaque chapitre uniquement**
  (`insert_banner()`), et **aucun chapitre dédié**.
- Règle concernée : [`appareil-rappel-en-pied`](appareil.md#appareil-rappel-en-pied)
