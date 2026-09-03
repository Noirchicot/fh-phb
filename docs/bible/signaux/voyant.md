# Le voyant

Le voyant d'avancement **est** `.belt-index`, le chiffre d'un cran de ceinture — on n'en fabrique
pas un second. Anneau = en cours, disque plein = fait.

## Design

*à quoi il ressemble : forme, habit, couleur, relief.*

### L'anneau et le disque { #voyant-anneau-vs-disque }

**Un anneau se lit « en cours », un disque PLEIN se lit « fait » — et la règle vaut pour les quatre états.**

??? note "Pourquoi, et depuis quand"
    *« C'est la différence entre un contour et un état. »* ⚠️ L'encre du chiffre est celle du FOND, pas du texte : *« sur un disque plein, `--text` (clair de nuit) tomberait sous le seuil »*.

    Valeur : chiffre en `--on-accent` sur un disque plein · Source : NORMES.md § « LE VOYANT D'AVANCEMENT », règle d'Eric du 2026-08-19 : *« le 1 dans le belt doit être TOTALEMENT vert, et on doit voir le chiffre dessus »* · Statut : ratifié

<!-- DESSIN À FAIRE — l'anneau et le disque plein, sur les quatre états du cran -->

## Mesures

**Aucune règle de mesure consignée.** Le voyant hérite de la ceinture, dont la hauteur se déduit ([`ceinture.deduite`](../conduite/ceinture.md#budget-ceinture-deduite)) — aucun diamètre, aucune épaisseur d'anneau n'est écrite.

## Fonctions

*ce qu'il fait, ce qu'il dit, quand il paraît, ce qu'il interdit.*

### Le voyant est le cran de la ceinture { #voyant-est-le-cran-de-la-ceinture }

**Le voyant d'avancement EST `.belt-index`, le chiffre d'un cran de ceinture — on n'en fabrique pas un second.**

??? note "Pourquoi, et depuis quand"
    ⛔ « Ce n'est pas un organe de plus. Le « cercle avec numéro d'étape » de la dictée EST `.belt-index`, le chiffre d'un cran de ceinture. ⛔ Ne pas en fabriquer un second. »

    Valeur : `.belt-index` · `.belt-item[data-fait="true"]` · Source : NORMES.md § « LE VOYANT D'AVANCEMENT », Eric 2026-08-26 : *« le voyant d'avancement (dans le belt) : rouge erreur / bleu avancement / vert fin »* · Statut : ratifié

### Le voyant ne se touche pas { #voyant-non-cliquable }

**Le voyant ne se touche pas : ne pas lui donner l'apparence d'un contrôle.**

??? note "Pourquoi, et depuis quand"
    il fait partie des deux organes qui ne se touchent pas, avec le popup : « ⛔ Ne pas leur donner l'apparence d'un contrôle. » Un voyant porte un état, il n'offre pas un geste.

    Source : NORMES.md § « LES AUTRES ORGANES », 2026-08-26 · Statut : ratifié

### Traverser n'est pas finir { #voyant-traverser-n-est-pas-finir }

**Le vert du voyant vit sur `data-fait`, prononcé par le juge de Review, pas sur `data-status="done"`.**

??? note "Pourquoi, et depuis quand"
    *« `data-status="done"` veut dire « tu es passé devant » — un chapitre traversé sans rien y poser s'allumait quand même. Traverser n'est pas finir, et le bleu ne devra pas retomber dans le même piège : « en cours » n'est pas « ouvert une fois ». »*

    Source : NORMES.md § « LE VOYANT D'AVANCEMENT », 2026-08-26 · Statut : ratifié

### Le bleu et le rouge restent à construire { #voyant-bleu-et-rouge-a-construire }

⏳ **À trancher.**

**Le bleu (avancement) et le rouge (erreur) du voyant n'existent pas encore, et le juge qui prononce « erreur » n'est pas désigné.**

??? note "Pourquoi, et depuis quand"
    « ⏳ Reste à construire : le bleu et le rouge. ⏳ Et à trancher : quel juge prononce « erreur » sur une étape ? » — la règle de dessin (anneau / disque plein) est déjà écrite pour eux, l'organe non.

    Valeur : ✅ le vert existe · 🔴 bleu et rouge absents · Source : NORMES.md § « LE VOYANT D'AVANCEMENT », 2026-08-26 · Statut : à trancher
