# Lot 104 — la transition à froid : T4 et T5 d'un seul geste

**En clair :** la couche française cesse d'être un **embranchement** et redevient ce qu'elle
aurait toujours dû être — **des mots posés sur les records anglais**. Les identifiants français
de records disparaissent. **Un objet, une adresse, deux mots.**

> **Eric, 2026-08-24, mot pour mot : « On fait tout péter, tu fais la transition à froid. »**

⛔ **« À froid » veut dire ce qu'il dit** : **aucune table d'alias, aucune couche de
compatibilité, aucune période de transition.** Les signets du site français **casseront en
silence**, et **c'est accepté** — la décision est prise, mesurée, et elle est de lui. ⛔ Ne
propose pas de rétro-compatibilité, ne la « prévois pas au cas où ».

- **Dépôt :** `~/tools/fh-srd` · **branche `104-transition-a-froid`**.
- ⛔ **Jamais sur `main`, jamais de `git push`, jamais de bump.**
- 🔴 **CE LOT NE TOUCHE PAS À `fhpc`.** Sa part y est réelle (24 fichiers de tests, la couche, les
  95 signatures d'Eric) mais **le fil de l'écran R y expédie plusieurs fois par heure**. Elle
  fera son propre lot. **Tu t'arrêtes à la frontière du dépôt, et tu dis ce que tu y laisses.**

---

## 1. Ce que la route a ratifié le 22/08, et qui commande tout

> **Un seul jeu de records, clefs et identifiants en anglais ; le français par-dessus, en
> libellés seulement.** `srd:weapon:en:longsword` s'affiche « épée longue », le poids reste
> `3 lb.`, l'écran rend des kilos s'il veut. **Un objet, une adresse, deux mots.**

C'est la **loi §0.13** : *le moteur produit des identifiants, l'interface produit des mots.*

📌 **Note que l'adresse ratifiée garde son segment `en`.** C'est le texte d'Eric, pas une coquille
de ma part — et je te le signale au lieu de le corriger tout seul : un identifiant
« langue-neutre » qui porte `en` est **bizarre mais RATIFIÉ**. ⛔ Ne le renomme pas. Si ça te
paraît devoir changer, **dis-le, ne le fais pas.**

---

## 2. Le pivot : la table de correspondance, et rien d'autre

**1 328 paires**, produites par tes T1/T2/T3, chacune portant sa **provenance** — `human` pour ce
qu'Eric a signé, `reading/two-way` pour ce qu'un agent a lu dans les deux sens.

🔴 **RIEN NE SE MIGRE SANS SA PAIRE.** Un record français sans vis-à-vis **arrête la migration**
et **se fait nommer** — il ne se devine pas, il ne se rapproche pas « par ressemblance de nom ».
⭐ C'est exactement la discipline qui a trouvé les entrées avalées : **la ressemblance de nom est
la pire des preuves.**

---

## 3. ⏳ LES ORPHELINES — deux cas, deux traitements, et le second est révocable

| | ce que ça devient |
|---|---|
| **`Size`**, côté anglais seul | **rien à faire** : différence d'édition mesurée (le cran français va de `Surprise` à `Télépathie`, ses treize têtes reproduites une par une). Il reste anglais seul |
| **`Vitesse d'escalade` · `de nage` · `de vol`**, côté français seul | 🔴 aucun anglais à qui EMPRUNTER une adresse → ✅ **on leur en FABRIQUE une**, décision d'Eric ci-dessous |

## ✅ ERIC A AUTORISÉ D'INVENTER — ⭐ ET ON N'EN A PAS EU BESOIN

Eric, 2026-08-24 : **« Les inventer oui »**. **L'autorisation est acquise et elle n'a pas servi :
le livre anglais imprime déjà les trois termes.** Vérifié depuis le siège, sur les exports :

```
Fly Speed      37 occurrences   ·   Flying Speed      ZÉRO
Swim Speed     22               ·   Swimming Speed    ZÉRO
Climb Speed    15               ·   Climbing Speed    ZÉRO
Burrow Speed    8               ·   Burrowing Speed   ZÉRO
```

Le livre **écrit** ces termes ; il ne leur donne simplement **pas d'entrée de glossaire**.

⭐⭐ **ET LE QUATRIÈME MEMBRE DE LA FAMILLE PROUVE LE PATRON** : `Burrow Speed`, lui, **a** son
entrée anglaise — et son jumeau français `Vitesse de fouissement` est **déjà apparié**. Le
patron `<X> Speed` ↔ `Vitesse de <x>` est donc **attesté des deux côtés, par une paire qui
existe**. Rien n'est inventé, tout est **adopté**.

➡️ **`climb-speed` · `swim-speed` · `fly-speed`**, provenance **`adopted:english-book`**, ⛔ **pas
`invented`**. La provenance doit dire la vérité : ces adresses ont une source.

🔴 **ET VOICI LA LEÇON, PARCE QU'ELLE A FAILLI COÛTER CHER** : le premier réflexe était
`climbing-speed`, calqué sur l'entrée `Climbing` **qui existe**. **Le livre écrit `Climb Speed`.**
⭐ **C'est le contrôle NÉGATIF — zéro occurrence de `Climbing Speed` — qui l'a dit.** Une adresse
choisie au goût aurait été **fausse et muette** : rien ne l'aurait signalée, jamais.

**La collision est vérifiée sur les 1 367 records réels** : les trois adresses sont libres, et
`climbing`/`swimming`/`flying`/`speed` restent **intactes et distinctes** — le test prouve la
distinction **par le texte**, pas seulement par l'absence de collision. ⛔ Et le garde refuse
**dans les deux sens** : si l'anglais gagnait un jour l'une de ces entrées, le français aurait un
vrai vis-à-vis et **se pairerait au lieu de s'adopter**.

---

## 4. ✅ ERIC A TRANCHÉ : **OPTION 4 — la conversion passe de la DONNÉE au RENDU**

> **Le lecteur français ne doit rien perdre. Et la couche cesse quand même d'être un
> embranchement.** Les deux, parce que ce ne sont pas les mêmes valeurs.

🔴 **MON §4.1 D'ORIGINE ÉTAIT FAUX, ET TA MESURE L'A TUÉ.** Un patch limité à
`name`/`description` amputait le site français des deux tiers de son contenu. **Ta mesure gagne,
et elle a changé la commande.** Voici la bonne :

### La coupure, et elle n'est PAS entre `name`/`description` et le reste

| ce que c'est | où ça va |
|---|---|
| **les MOTS français** — `name`, `description`, et les ~80 autres champs de texte : `monster.alignment`, `monster.actions`, `class.features`, `item.rarity`, `spell.components`… | ✅ **dans le PATCH.** Ce sont des **traductions**, et une traduction est un mot du livre |
| **les NOMBRES CONVERTIS** — `spell.range` *9 m*, `gear.cost` *25 po*, les poids… | ⛔ **PAS dans le patch.** Ce sont des **conversions**, et une conversion se **dérive** |

⭐ **La conversion n'est pas une traduction.** Un mot français doit être **pris dans le livre** ;
un nombre français se **recalcule**. C'est ce que la loi §0.13 sépare depuis le début — *le
moteur produit des identifiants, l'interface produit des mots* — et une **unité** n'est ni l'un
ni l'autre : c'est un **rendu**.

### ⭐ Et voici pourquoi ça ne coûte rien : la conversion est une FONCTION

**Mesuré depuis le siège**, sur 58 sorts appariés par une empreinte **non textuelle** :

```
spell.range          12 valeurs EN distinctes  →  ZÉRO ambiguïté
spell.casting_time    8                        →  zéro
spell.duration       16                        →  zéro

'10 feet' → '3 m'     '100 feet' → '30 m'     '1 mile' → '1,5 km'
```

➡️ **La table de conversion fait une douzaine d'entrées par champ, pas 1 669.** Et elle
**existe déjà** : ⭐ **c'est la donnée française d'aujourd'hui.** Tu la **dérives**, tu ne
l'écris pas.

🔴 **ET LA COUPURE EST PAR VALEUR, JAMAIS PAR CHAMP — mesuré, et ma mesure ne pouvait pas le
voir.** `monster.speed` vaut tantôt `20 ft.` (conversion pure, **9 fois**), tantôt
`30 ft., Fly 60 ft.` — **une phrase française, 200 fois**. ⛔ Décider « le champ `speed` se
convertit » **perdrait les 200 phrases**.
➡️ **Clef retenue : `(champ, valeur)`** — la plus étroite des trois qui marchent (130 / **85** /
84, toutes sans ambiguïté). La valeur seule accepterait en silence un `30 feet` qui voudrait dire
autre chose ailleurs ; le genre en tête recopierait `1 GP` quatre fois pour rien.

📌 ⭐ **Et le livre CHANGE D'UNITÉ quand ça l'arrange** : `1/2 lb. → 250 g`. Un convertisseur
générique aurait écrit « 0,25 kg ». **La table dérivée porte le livre, pas l'arithmétique.**

⚠️ **MA MESURE PORTE SUR 58 SORTS SUR 339.** Le zéro-ambiguïté est fort, **il n'est pas
exhaustif**. ⛔ **Refais-la sur tout le corpus, sur tous les champs porteurs d'unité.** Si une
valeur anglaise rend **deux** valeurs françaises, **tu t'arrêtes et tu la nommes** — ce serait
que la conversion n'est pas une fonction, et toute l'option 4 reposerait dessus.

📌 **Et garde la rondeur du livre, pas celle du calcul** : le livre écrit *9 m* là où 30 pieds
font 9,144. **La table dérivée porte les arrondis d'Eric**, jamais un produit recalculé.

---

## 5. 🔴 LA VÉRIFICATION — elle redevient l'octet près, et c'est le but

| | |
|---|---|
| ✅ **les pages françaises se reconstruisent BYTE-IDENTIQUES** | ⭐ **c'est la preuve de l'option 4.** Un seul mot qui bouge = **la table est incomplète**, et il te dit lequel |
| ✅ **les ANCRES changent, et chacune s'explique** | l'ancienne, la nouvelle, la paire qui l'autorise |
| ✅ **`git grep 'srd:[a-z-]*:fr:'` rend ZÉRO** | ⛔ sans exception — voir §5 bis pour `sources/` |
| ✅ **aucun record perdu** | 1 366 paires entrent, le compte final sort, l'écart s'explique |

⭐ **Le garde que je t'avais retiré t'est rendu, et plus fort qu'avant** : il ne dit plus
seulement « rien n'a bougé », il **mesure la complétude de la table de conversion**.

---

## 5 bis. ✅ TES DEUX PROPOSITIONS SONT ACCORDÉES — décisions d'architecte

**① Les 739 identifiants `:fr:` de `sources/`, dont les 90 signatures d'Eric → re-clefés sur le
SLUG FRANÇAIS.** ✅ **Accordé.** ⭐ Ton argument est le bon : un slug est **un mot du livre**,
l'adresse ne le sera plus. **Et ce n'est pas une table d'alias** — rien ne résout par elle à
l'exécution, elle ne fait que porter la provenance. ⛔ La signature d'Eric doit rester lisible
par Eric : c'est ça qu'on protège.

**② Les `:fr:` peuvent vivre dans `build/srd.sqlite`, qui est gitignorée.** ✅ **Accordé**, et
pour ta raison exactement : sans eux, **les routes de correspondance cesseraient de tourner et la
table se figerait** — elle ne serait plus vérifiable. ⛔ Ce dépôt refuse partout ailleurs qu'une
table cesse de se prouver ; il ne va pas commencer ici.

---

## 6. ⚠️ Les quatre fautes de ce chantier, et tu en as payé trois

- 🔴 **L'ordre ment.** Jamais d'appariement par position.
- 🔴 **Zéro conflit n'est pas zéro erreur** — une bijection fausse dans les deux sens est
  parfaitement cohérente.
- 🔴 **Un total juste ne dit rien du contenu** — 152 = 152 pendant que trois entrées manquaient.
- 🔴 **La transformation qui rend COMPARABLE détruit l'ORDRE** — ta leçon d'il y a une heure.
  ⚠️ **Elle va resservir ici** : tu vas normaliser des identifiants pour les rapprocher.

**Et les pièges de la maison** : `/usr/bin/python3` **3.9.6** (fitz 1.26.5), pas l'homebrew ·
`sources/pdf` ignoré par git → `SOURCE REFUSED` dans un clone frais · un genre neuf est **refusé,
pas sauté** · ⛔ **ouvrir un genre au contrat désarme une des quatre portes**.

---

## 7. Ce que tu rends

- **`git grep` des identifiants `:fr:` → zéro**, hors les trois orphelines nommées ;
- **le texte des pages françaises inchangé**, et le dire ;
- **le compte de records avant/après**, et l'écart expliqué ;
- ✅ **les trois adresses fabriquées**, leur dérivation, et **la preuve qu'aucune n'écrase `Climbing`/`Swimming`/`Flying`** ;
- 🔴 **CE QUE TU LAISSES CASSÉ CHEZ `fhpc`** — nomme-le précisément : combien de fichiers de
  tests, quelles signatures, ce que la couche devient. **C'est la commande du lot suivant.**
- 🔴 **ET UNE COUTURE PRÉCISE, SIGNALÉE PAR LE FIL DE L'ÉCRAN R** : son pipeline lit les records
  **par `extends`** — `slotParBase`, dans `equipment-step.mjs`, fait correspondre `data.extends`
  à un emplacement du corps. **Si les identifiants `fr:` disparaissent des `extends` de la couche
  `shelving`, c'est régénéré donc gratuit** — ⭐ mais **NOMME-LE** dans ce que tu laisses cassé,
  pour que le lot `fhpc` sache que la couture est là au lieu de la découvrir.
- les suites vertes dans un **clone indépendant**, avec le compte ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
