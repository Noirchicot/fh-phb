═══ PROMPT DE TRANSITION → ouvrir un fil neuf en **OPUS 5 · effort HIGH** ═══

# Retour du 20 août — le site a changé d'arborescence, et il a révélé trois trous

**En clair : la garde du PHB est passée de six cartes à quatre, le MJ a une porte,
et c'est fusionné et déployé. En le faisant, trois choses sont apparues qui ne
concernent pas le site mais l'architecture : le coffre du MJ n'a pas de serrure
et n'en aura pas sans un vrai mur ; une règle FH s'appuyait depuis des mois sur
une mécanique jamais écrite ; et la couche SRD est publiée mais n'est reliée à
rien. Ton travail : arbitrer ce qui remonte au chantier, pas refaire le site.**

⛔ **Ne retouche pas le site.** Ce qui est décrit en §1 est en ligne et vérifié.
Ce fil est un retour de terrain, pas une reprise.

---

## 0. Où sont les choses

| | |
|---|---|
| Le dépôt | `~/tools/fh-phb` — `main` = `origin/main` = **`bf45e55`**, arbre propre |
| Le commit de la refonte | **`b1c44aa`** « Le site a quatre menus, et le MJ a sa porte » |
| Le déploiement | `gh-pages` **`23eb1fd`** — vérifié en ligne |
| Le plan de la refonte | vault `FH-WEB/FHPHB/FHPHB arborescence.md` — **structure ratifiée en tête** |
| Le journal daté | vault `FH-WEB/FHPHB/FHPHB website.md` |
| ⭐ **La spécification de l'accès par clé** | vault `FH-WEB/FHPHB/FHPHB acces par cle.md` — **rien n'est construit** |

---

## 1. Ce qui est fait, et qui ne demande rien

La garde tient **quatre menus racine en carré 2×2**, rangés par moment de jeu :
**Build a Character** (11) · **At the Table** (8) · **Magic & Soulforging** (8) ·
**World** (5). *Destiny*, *Tools* et *Core Rule Changes* ont fondu dans les autres
— chacune ne portait plus que ce qui vivait déjà ailleurs.

Deux formes neuves sont apparues et méritent d'être connues du chantier :

- **Une page peut vivre DANS une autre.** Arcana sous *4 · Destiny*, Moonkeeper
  sous *5 · Class*, Party Inventory et Soulforge Workshop sous *Soulforging Rules*.
- **Une page peut vivre des deux côtés.** World est identique chez le joueur et
  chez le MJ ; c'est une seule note, pas deux.

Le troisième grand bouton n'est plus `⌕ Browse the rules` mais **🔒 The Dungeon
Masters' Secrets**, et `docs/dm.md` est la porte. La pastille flottante `DM` a
disparu.

**Six pages étaient injoignables** avant ce commit : déclarées dans `mkdocs.yml`,
liées d'aucune carte, et le menu de gauche est masqué depuis juin
(`extra.css:347`). Elles ont toutes un toit. `fh-home.js` parlait encore
l'arborescence d'avant la refonte — recalé sur cinq groupes ; Circle Magic en
sort, il ne publie plus depuis le 18/08.

📌 **Aucun chapitre renommé ni déplacé.** Mesuré : un déplacement de menu ne
touche que `mkdocs.yml`, `docs/index.md` et `fh-home.js`. C'est **renommer un
fichier** qui casse — leçon `backgrounds.md`→`inheritance.md` du 17/08, et le
même piège s'est représenté le 20 (bouton écrit `href="dm.md"`, attrapé avant
commit : dans un `<a>` HTML brut, MkDocs ne résout pas le `.md`).

---

## 2. ⚖️ ARBITRAGE — le coffre du MJ est une pièce sans serrure

**Mesuré en ligne, maintenant** : `chapters/chaos-tables/` et
`chapters/major-arcana/` répondent **200 publiquement**. Le dépôt `fh-phb` est
lui-même en visibilité **`public`**. Et depuis le déploiement d'aujourd'hui,
`dm/` répond 200 : la page qui rassemble le domaine du MJ est publique.

🔴 **Un cadenas posé sur une page publiée est décoratif.** Protéger un chapitre,
c'est cesser de le publier.

Eric a tranché le modèle le 20/08 : **login par clé, pas de comptes.** Aucune
donnée personnelle, aucun compte à héberger — ce qui **évite frontalement** la
loi du chantier « Eric ne devient pas courtier d'identité ». La spécification
complète est dans le vault ; ce qui remonte à l'architecture est ceci :

- **Ça introduit une dépendance réseau** là où le site n'en avait aucune. Les
  chapitres protégés quittent `docs/` et deviennent des données servies par le
  Worker `fh-builds`. Plus de Worker, plus de World.
- **Le contrat existe déjà à moitié** : `WORKER-ADMIN-API.md` porte
  `Authorization: Bearer <GM_TOKEN>` et des codes de table, avec sa propre mise
  en garde — *« a join code is a lightweight table-access key, not strong
  secrecy »*.
- **Deux natures de page**, à ne pas confondre : les **partagées à robinets**
  (World, une note, le MJ ouvre/ferme par clé, chapitre par chapitre **et bloc
  par bloc**) et les **propres au MJ** (Secrets, Lore & Secrets, Adventures —
  jamais servies à une clé de joueur). La grille des Keys ne liste que les
  premières : *une case qu'on ne doit jamais cocher est une case qu'on finira
  par cocher.*
- ⭐ **Le robinet de bloc a déjà sa machinerie** : `sync_from_vault.py` porte
  `strip_callouts()`, qui supprime tout callout dont l'en-tête contient
  `CANONICAL`. Marquer `> [!mj]` et **router** au lieu de jeter, c'est le même
  geste, sur du code qui tourne depuis juin.

**Correction assumée en cours de route** : j'avais spécifié des clés stockées en
empreinte SHA-256, affichées une seule fois. Eric a objecté (*« faut que je la
note, c'est chiant »*) et l'objection tient : **le contenu protégé vit dans le
même KV que les clés**. Qui peut lire la base pour voler une clé a déjà les
chapitres. Clés lisibles, la page Keys est le carnet. Le hachage redeviendra
juste le jour où le contenu ne vivra plus dans le même magasin.

**Ce qui attend Eric** : quels chapitres passent derrière le mur (Chaos Tables
et Arcana sont publics aujourd'hui), et une clé par joueur ou une par table.

---

## 3. ⚖️ ARBITRAGE — une règle FH s'appuyait sur une mécanique jamais écrite

**Weapon Mastery n'existait dans aucun chapitre.** Ni ce que fait *Topple*, ni ce
qu'est *Vex*, ni combien un personnage en connaît.

Or **les données existent** : `fh-srd` porte la propriété `mastery` sur les
**38 armes** du SRD 5.2.1 (Cleave 2 · Graze 2 · Nick 4 · Push 4 · Sap 6 ·
Slow 7 · Topple 5 · Vex 8), et le builder l'affiche déjà —
`fhpc/ui/builder/equipment-step.mjs:358`.

🔴 **Et une règle FH s'y appuyait déjà** : le style *Great Weapon Fighting* dit
« add your proficiency bonus to the damage (it goes into "graze") ». Un joueur
lisant ça n'avait aucun moyen de savoir ce qu'était « graze ». **Le moteur
affichait un mot que le livre ne définissait pas.**

Écrit le 20/08 dans la source du vault — `0. D&D 5+ Rules/8. Adventuring/
Equipment.md`, qui publie vers `equipment.md` — avec les huit maîtrises en prose
et leurs vraies armes tirées des données. Le chapitre est passé de 118 à
**1 361 mots** : s'y ajoutent la lecture d'une arme (neuf propriétés en deux
familles, exigences et permissions) et les treize armures triées par ce qu'elles
coûtent. Un pointeur a été posé dans `Battlefield Rules.md`.

⚠️ **Distinction à tenir en relisant** : tous les **chiffres** sont mesurés dans
les données `fh-srd`. Le **sens** des propriétés et des maîtrises est de la
rédaction d'après les règles 2024 — c'est là qu'une erreur deviendrait canon FH
par accident.

**Deux décisions attendent Eric, marquées dans le chapitre :**

1. **Combien de maîtrises connaît-on ?** Ça vient d'une aptitude de classe, et le
   chapitre *Classes* de FH n'en dit rien. Un joueur sait ce que fait *Topple*
   mais pas s'il y a droit.
2. **Que donne un héritage comme matériel de départ ?** *Inheritance* décide des
   dons d'origine, des langues et des bonus de caracs, pas du matériel — donc
   l'étape 8 ne peut proposer que l'équipement de classe.

---

## 4. 💡 QUESTION D'ERIC — le builder parle deux langues, le livre pas encore

*« FH est un dialecte de SRD, mais SRD doit rester la couche de base. Ne
faudrait-il pas un site SRD en page parallèle ? Il existe mais n'est pas câblé. »*

**Il existe et il tourne** : `noirchicot.github.io/fh-srd`, quatorze genres en
anglais et en français. Ce qui manque n'est pas un site, **c'est un joint** : la
seule liaison est une entrée de nav qui éjecte le lecteur vers un autre site,
sans retour ni habillage commun.

**Et la convention du dialecte existe déjà — dans un seul chapitre.** `feats.md`
porte 10 marques `fh-edition` et 7 blocs `fh-removed` (« view older version »),
CSS compris. Vingt-trois autres chapitres ne disent jamais ce qu'ils changent.

Trois joints, par coût croissant :

| | quoi | coût | ce que ça donne |
|---|---|---|---|
| **1** | un renvoi SRD en tête de chaque chapitre, généré depuis `MAP` | une ligne par chapitre, une fois | la couche de base à un clic |
| **2** | la marque d'écart de `feats.md` étendue | **éditorial, non automatisable** | on voit ce que FH remplace |
| **3** | une bascule SRD/FH sur la même page | réécriture des chapitres en base + correctif | le modèle du builder porté au livre |

**Recommandation d'architecte : 1 maintenant, 2 au fil de l'eau, 3 jamais pour le
livre.** Le builder bascule, le livre explique ; un livre de règles qu'il faut
commuter pour comprendre est un moins bon livre.

⭐ **Deux points à ne pas laisser filer.**

**« Préparer une création de perso SRD » n'est pas un travail de livre mais
d'outil.** Qui veut fabriquer un personnage SRD pur a besoin du builder en mode
SRD. La page parallèle sert à *lire* la couche de base, pas à *construire*.

**La séparation des deux sites est un actif juridique.** Le contenu SRD reste
dans son dépôt avec sa licence CC-BY, son attribution et ses empreintes
SHA-256 ; l'IP d'Eric reste dans `fh-phb`. Les fondre brouillerait la ligne que
le chantier a posée comme problématique de premier rang. **Un joint, pas une
fusion.**

---

## 5. Ce qui reste ouvert, en une liste

| # | question | pour qui | bloque quoi |
|---|---|---|---|
| 1 | Quels chapitres passent derrière le mur ? | Eric | toute la construction de l'accès par clé |
| 2 | Une clé par joueur, ou une par table ? | Eric | la forme de la grille Keys |
| 3 | Un chapitre fermé : cadenassé, ou absent ? | Eric | l'écran `/world/` |
| 4 | Combien de maîtrises d'arme par classe ? | Eric | le chapitre *Classes*, et l'étape 8 |
| 5 | Quel matériel donne un héritage ? | Eric | l'étape 8 du builder |
| 6 | Pose-t-on le joint SRD n°1 ? | Eric | rien — c'est peu cher et réversible |
| 7 | Renommer le commit de fusion `bf45e55` ? | Eric | rien — cosmétique (message pollué par les commentaires de git) |

---

## 6. Ce que je n'ai pas fait, exprès

- **Aucun code d'accès par clé.** Le Worker, la grille, `keys.html`, l'écran
  `/world/` : spécifiés, pas écrits.
- **Aucun des six chapitres du monde.** Ils sont **nommés en italique sur les
  cartes, jamais liés** — un lien vers une page inexistante serait le bug qu'on
  vient de fermer. Et ils devront naître **dans le vault** : `sync_from_vault.py`
  grave la règle — *« une page publiée sans source dans le vault serait une page
  que personne ne pourrait plus corriger à la source »*.
- **Aucun joint SRD.** §4 est une recommandation, pas un lot.
