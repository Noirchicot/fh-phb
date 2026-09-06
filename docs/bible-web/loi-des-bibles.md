# 🔴 La loi des Bibles

> Eric, 2026-09-06 : *« Crée un fil qui construit une Bible pour le site web — **FH WEB Bible**,
> différente de la **Builder Bible**. Cite quand même dans le builder que quand on parle du site il
> faut visiter l'autre Bible. Et **dès qu'on change des choses, on se pose la question d'éditer une
> Bible**. »*

⭐ **C'est la loi la plus importante de ce corpus, et elle ne vaut pas que pour le livre : elle vaut
pour TOUT SIÈGE.** Elle transforme une question qu'on oublie en une question qu'on **doit** poser.

## La question se pose AVANT de rendre, et la réponse est DANS le rapport { #bible-question-avant-de-rendre }

**Tout lot qui change quelque chose se demande, **AVANT de rendre** : « est-ce qu'une Bible doit
être éditée ? » — et il **RÉPOND dans son rapport**, même si la réponse est non.**

📍 `bible-question-avant-de-rendre` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    ⛔ *« Je n'y ai pas pensé »* cesse d'être possible : la question est **au programme**, et **son absence dans un rapport est elle-même un défaut**.

    🔴 **L'incident qui la crée.** Le 2026-09-06, la ligne éditoriale d'Eric a été violée **six fois dans un seul chapitre**. Trois sièges avaient écrit dans le livre ce jour-là, et **aucun n'avait de corpus à lire** :

    | | son corpus | ce qui arrive |
    |---|---|---|
    | **le builder** | `NORMES` · `CADRES` · `SOCLE` · `ECRANS` — **493 adresses**, un garde qui **refuse** une section sans adresse | une règle mal écrite **rougit** |
    | **le livre** | ⛔ **rien** — des notes de logbook que personne n'ouvre avant d'écrire | une règle violée **passe** |

    ⛔ *« Une règle violée deux fois n'est pas une règle mal suivie : c'est une règle mal rangée. »*

    ⚠️ **Cette règle a un jumeau dans le corpus du builder** — [`socle.une-bible-se-demande-avant-de-rendre`](../bible/general/socle.md#socle-une-bible-se-demande-avant-de-rendre), source `fhpc/ui/builder/SOCLE.md`. Ce **n'est pas** un doublon interdit par [`fabrique-second-ecrivain-est-un-defaut`](fabrique.md#fabrique-second-ecrivain-est-un-defaut) : les deux corpus sont lus par des sièges différents, et une loi qui ne vit que dans le corpus qu'on ne lit pas ne s'applique jamais. **Les deux se citent, et une modification de l'une oblige l'autre.**

    Source : dictée d'Eric du 2026-09-06 · Statut : ratifié

## Un mandat d'écriture nomme sa Bible en PREMIÈRE LIGNE { #bible-mandat-nomme-sa-bible }

**Tout mandat d'écriture dans le livre **nomme sa Bible en première ligne** — comme les mandats de
code nomment `TRAPS.md`.**

📍 `bible-mandat-nomme-sa-bible` · vivante · 05/09

??? note "Pourquoi, et depuis quand"
    C'est **l'amendement n° 2 d'Eric du 2026-09-05**, appliqué au livre. **C'est cette ligne, absente le 06/09, qui a coûté les six phrases.**

    📌 Corollaire mesuré ailleurs : *« sa ligne survivait dans `_MENU.md`, injecté au démarrage de chaque session »* — ce qui est nommé au démarrage est lu, ce qui ne l'est pas ne l'est pas. Voir [`appareil-addendum-banni`](appareil.md#appareil-addendum-banni).

    Source : `MANDAT — La Bible de FH WEB (fh-phb).md`, § ③ · Statut : ratifié

## Deux Bibles, aucune suppression { #bible-deux-bibles-aucune-suppression }

**Il y a **deux** Bibles : la **Builder Bible** *(l'application)* et la **FH WEB Bible** *(le livre)*.
⛔ Aucune ne supprime l'autre.**

📍 `bible-deux-bibles-aucune-suppression` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    🔴 **Un ordre a été renversé, et il faut le savoir avant de supprimer quoi que ce soit.** Eric avait ordonné le 2026-09-05 : *« dis à ton fil bible de faire sauter MA bible sur FH web à la fin de son boulot »*. ⛔ **Cet ordre est périmé.**

    ⭐ **La raison de l'époque était juste, et elle ne tient plus.** La Bible devait sauter **parce qu'elle doublonnait le corpus du builder** — *« elle reste illisible pour moi et tu n'es pas capable de la tenir à jour »*.

    📏 **Mesuré le 06/09** : `fh-phb/docs/bible/` fait **44 pages, 5 045 lignes**, et couvre `bouton` · `dropdown` · `interrupteur` · `ceinture` · `chevron` · `rail` · `cadres` · `panneau` · `socle` · `jeton` · `collecteur` · `livre` · `popup` + les huit étapes. ⛔ **Aucune page sur le livre.** C'est **la Bible du BUILDER**.

    Eric, le 06/09 : *« la Bible ne couvre peut-être pas le site FH WEB »* — **elle ne le couvre pas** — puis *« et c'est peut-être mieux que le site ait la sienne »*.

    Source : `MANDAT — La Bible de FH WEB (fh-phb).md`, § « CE QUE CE MANDAT RENVERSE » · Statut : ratifié

## Le renvoi va dans les DEUX sens { #bible-renvoi-dans-les-deux-sens }

**Chaque Bible renvoie à l'autre **là où elle parle du domaine de l'autre**. ⛔ Un lien à sens
unique ne vaut rien.**

📍 `bible-renvoi-dans-les-deux-sens` · vivante · 06/09

??? note "Pourquoi, et depuis quand"
    Eric : *« Cite quand même dans le builder que quand on parle du site il faut visiter l'autre Bible. »*

    📌 **C'est la leçon ADR du corpus, appliquée entre deux CORPUS au lieu d'entre deux règles** : l'échec le plus courant de cette pratique est *« mettre à jour un côté et oublier l'autre »*.

    **Les renvois posés, et où ils vivent :**

    | sens | où | vers quoi |
    |---|---|---|
    | livre → builder | [`index`](index.md#ceci-concerne-le-livre-lapplication-a-sa-propre-bible) · [`fabrique`](fabrique.md#fabrique-ce-qui-vit-chez-le-voisin) | `bible/index.md` · `socle.portee-builder` · `ecriture.loi-des-liens` · `ecriture.ancre-avant-lien` · `portes/livre.md` |
    | builder → livre | `fhpc/ui/builder/NORMES.md` · `CADRES.md` · `SOCLE.md`, bloc **PORTÉE** commun aux trois ; et son tirage `bible/general/socle.md`, `bible/general/ecriture.md`, `bible/portes/livre.md`, `bible/index.md` | cette Bible |

    Source : dictée d'Eric du 2026-09-06 · Statut : ratifié, posé dans les deux sens le 06/09
