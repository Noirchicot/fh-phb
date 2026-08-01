# Handoff — guide vivant FHPC

## Objet et méthode

`docs/fhpc-guide-vivant.html` est la photographie pédagogique de FHPC. Il est actuellement régénéré par **revue manuelle** : aucun script de génération n’existe. Conserver un fichier autonome en français, avec CSS et JavaScript inline, thèmes clair/sombre, rendu mobile et desktop, aucun CDN, aucune police distante et aucune ressource externe. Le glossaire reste obligatoire.

## Sources à relire

1. `ARCHITECT-HANDOFF.md`, entièrement, puis `git fetch origin` et les SHA réels de `origin/main` et `gh-pages`.
2. Le diff et les tests du commit ou merge à documenter, plus `mkdocs build --strict`.
3. Les branches explicitement citées par le guide, seulement si leur état hors `main` doit être mentionné.
4. `COMPANION-BUILD-PLAN.md` uniquement par sections utiles au changement : §6 pour le Brick, §§11.2/11.4 pour les événements, §12 pour le direct de table, §13.13 pour la propriété des personnages. Ne jamais charger le plan entier par défaut.
5. Les comptes rendus durables du logbook pour les essais réels ; le code et les tests restent la source des affirmations techniques.

## Règle obligatoire après chaque merge

Mettre le guide à jour **dans un commit documentaire immédiatement après le merge**. La provenance du guide doit indiquer le SHA du merge qui vient d’être décrit et la branche `main`. Une branche testée mais non fusionnée reste libellée « sur branche » ; elle ne devient jamais « présente sur main » par anticipation.

Le guide ne peut pas inscrire son propre SHA final avant d’être commité : ce SHA dépend du contenu qui le mentionnerait. Pour éviter cette auto-référence impossible, le commit guide suit le merge et inscrit le **SHA du merge décrit**, pas le SHA du commit guide. L’édition v1.3 illustre cette règle&nbsp;: G1 suit M1 et sa provenance décrit `main` à `888a6ddbfe7fd2453178de36d8ba86a6a494c592`.

## Sections instables à contrôler en priorité

- bandeau, verdict des packages et tableau « photo exacte » ;
- métriques, nombres de tests, déploiement et états LIVE/RECENT/OFF ;
- limites, prochaines étapes, sources et bloc de provenance ;
- tout SHA, nom de branche, statut PASS/HOLD ou affirmation « en production ».

## Hors périmètre

Le guide ne remplace ni le plan, ni le handoff architecte, ni le logbook, ni les règles du Vault. Sa mise à jour n’autorise aucun push, merge ou déploiement. Ne pas modifier les chapitres générés depuis le Vault et ne pas inventer de source de données ou de statut d’intégration.

## Porte de livraison

Relire les affirmations contre Git, vérifier qu’aucune URL ou ressource externe n’est chargée, tester les interactions, inspecter visuellement en desktop et mobile, lancer les tests pertinents et `mkdocs build --strict`, puis contre-vérifier le commit exact depuis un checkout indépendant.
