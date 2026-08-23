═══ PROMPT DE TRANSITION → ouvrir un fil neuf en **FABLE 5 · effort HIGH** ═══

# Retour du lot 77 — quatre nombres du gabarit sont à reprendre

**En clair : le lot 77 est livré et vert, mais en passant les gardes sur les
24 fiches (au lieu des deux que le gabarit connaissait), quatre chiffres du
gabarit se sont révélés faux ou trop justes. Trois demandent un arbitrage
d'Eric, un est une correction sèche. Ton travail : reprendre les nombres,
poser les arbitrages devant Eric, et mettre `GABARIT-360-CLASS-SPECIES.md`
d'accord avec la mesure.**

⛔ **Ne recode rien.** Le lot 77 est commité et vert ; ce fil est un retour de
mesure sur le GABARIT, pas une reprise du builder.

---

## 0. Où sont les choses

| | |
|---|---|
| Le mandat exécuté | `~/tools/fh-phb/LOT-77-FICHES-360.md` |
| **Le gabarit à corriger** | `~/tools/fh-phb/GABARIT-360-CLASS-SPECIES.md` |
| Le rapport chiffré du lot | `~/tools/fhpc/INVENTAIRE-LOT-77.md` *(lis-le en entier, tout est là)* |
| Le code livré | dépôt `fhpc`, branche **`77-fiches-360`**, commit `e8c1935` — **fusion à blanc contre `main` : 0 conflit**, pas poussé (geste d'Eric) |
| Les croquis | `~/tools/fh-phb/croquis/` — **ils font foi** |

**Toutes les mesures ci-dessous ont été prises au navigateur**, volet en train
de peindre (témoin d'images à 9 ; deux séries prises à 0 image ont été jetées
et refaites).

---

## 1. ⚖️ ARBITRAGE ERIC — la limite de 340 caractères ne protège rien

Le gabarit pose 340 en calculant *« ~36 caractères par ligne × 10 lignes ≈
365, on garde de la marge »*. **Mesuré dans la boîte réelle de 226 px à T2 :**

| Fiche | Caractères | Lignes rendues |
|---|---|---|
| **druid** | 337 | **10 / 10** |
| **monk** | 333 | **10 / 10** |
| **bard** | 332 | **10 / 10** |
| fighter *(texte d'Eric)* | 338 | 9 / 10 |

🔴 **Trois blurbs sur 24 remplissent déjà la boîte à ras bord**, et le fighter
— le plus long en caractères — n'en fait que 9. **Le compte de caractères
n'ordonne pas les hauteurs** : une césure malheureuse coûte une ligne
entière. Un appareil dont la police résout un poil plus large fait déborder
druid, monk et bard **en silence, garde vert**.

**La question à poser à Eric** : descendre la limite (~320 rendrait la marge
réelle), ou garder 340 en sachant que trois textes sont au plafond ?
📌 Et une piste que le lot n'a pas prise, à évaluer : **garder en lignes
rendues plutôt qu'en caractères** — c'est la vraie propriété, mais elle
demande une mesure de casse de ligne, pas une somme d'avances.

---

## 2. ⚖️ ARBITRAGE ERIC — `Dragonborn` ne tient pas dans le rail de 78

Le gabarit cote le rail sur `Barbarian` à T3 — *« 62 px + 8 de rembourrage ×
2 »* — et écarte explicitement T2 pour la lisibilité. **Il n'a jamais regardé
les douze espèces.** Mesuré, dans les 70 px utiles :

| | Largeur |
|---|---|
| `Barbarian`, gras | 65,5 px ✅ |
| **`Dragonborn`, gras** *(le cran courant est en gras)* | **80,7 px** ❌ |
| **`Dragonborn`, normal** | **77,2 px** ❌ |
| `Dragonborn` à T2, gras | 70,4 px — passerait, à 0,4 px près |

**Le nom est tronqué à l'écran**, visible sur la capture. Les trois sorties
coûtent toutes quelque chose, et aucune n'est à l'architecte :
élargir le rail *(la fiche n'a pas 6 px à rendre — voir §4)* · descendre à T2
*(ce que le gabarit a écarté, et 0,4 px n'est pas une marge)* · abréger le nom
affiché *(mais un rail qui ment sur un nom est un mauvais repère)*.

---

## 3. ⚖️ ARBITRAGE ERIC — la moitié basse de la fiche d'ESPÈCE

**Les deux croquis d'Eric ne disent pas la même chose**, et le gabarit n'a
retenu qu'un des deux :

| Croquis | Moitié basse |
|---|---|
| **C — Wizard** *(dont le gabarit tire sa boîte de 10 lignes)* | le **blurb** |
| **A — Species** | la **liste des traits**, `nom — effet`, avec `Destiny — Base 2 · halfling chosen: advantage on Chaos rolls` en dernière ligne |

Le lot a suivi la commande (boîte fixe, blurb, **pour les deux écrans**), donc
la fiche d'espèce a perdu **ses traits, sa Destinée et ses points de
compétence** — `fh-fiche-en` ne porte pour une espèce que `Type · Sz · Speed ·
Lineages`.

⭐ **Et la place existe** : mesuré à 360 × 640, une fiche d'espèce laisse
**240 px de vide** entre le blurb et les boutons (185 px sur une classe). Les
traits y tiendraient sans rien déplacer.

📌 **La vraie question sous celle-là** : « B3 = B2 » vaut-il jusqu'au CONTENU
de la moitié basse, ou seulement jusqu'à sa GÉOMÉTRIE ? Si c'est la seconde,
la boîte reste fixe à 160 px et chaque écran y met ce qui lui appartient —
et il faut alors une cote pour la liste de traits *(le halfling en porte 4,
l'elfe 5)*, que personne n'a mesurée.

---

## 4. 🔴 CORRECTION SÈCHE — le pire cas de la colonne de stats est faux

Le gabarit désigne `W. Proficiencies : 2` (116 px chez lui) comme la ligne qui
a fixé la colonne à 118, et prévient honnêtement : *« Prestidigitation et
Weapons : Simple sont les pires cas DU WIZARD ; un autre écran peut porter
pire »*. **Il en portait un.** Sur les 130 lignes des 24 fiches :

| Ligne | Fiche | Largeur |
|---|---|---|
| **`Weapons : Smpl+FL`** | **rogue** | **114,4 px** ← le maximum réel |
| `Weapons : Smpl+Lt` | monk | 111,6 |
| `Lineages : 10 types` | dragonborn | 111,4 |
| `W. Prof. : 2` | fighter | 112,3 |

✅ **Les 118 px tiennent** — la cote est bonne, c'est la justification qui
nommait le mauvais coupable. À reprendre dans le §4quater et le §5.

⚠️ **Et un écart de rendu à noter dans le gabarit** : les mesures du lot 77
sortent **~3 % plus étroites** que celles du gabarit (`Weapons : Simple` =
103,0 contre 105 ; `W. Prof. : 2` = 112,3 contre 116). Même famille de
police, navigateur différent. Ramenée à l'échelle du gabarit, la ligne du
rogue vaudrait **~118,1 px — exactement la colonne, sans marge**. Le gabarit
devrait dire à quel rendu ses nombres se rapportent ; aujourd'hui il ne le dit
pas, et deux séries de mesures justes peuvent se contredire de 4 px.

---

## 5. ⚠️ Deux notes de fond, hors gabarit mais à ranger quelque part

**a. On démonte une pile de couches par le haut.** `fh-fiche-en` patche les
trois espèces que `fh-species-en` ajoute ; les éteindre dans l'ordre de la
liste faisait jeter la pile, et **passer de « SRD + FH » à « SRD » plantait
l'écran Universe**. C'est une loi de pile, pas un détail de ce lot.

**b. Garder une cote en pixels SANS navigateur, proprement.** Node n'a pas de
`measureText`. Le lot additionne des **avances par caractère mesurées** au
navigateur (`fhpc/tests/fixtures/avances-t2.json`) et **mesure l'erreur du
modèle** contre la mise en page réelle : sous-estimation maximale **0,09 px**
sur 130 lignes. Le patron sert partout où une cote doit devenir un garde —
et il répond à la faute nommée deux fois le 15 août (*« likely fine »*).

---

## 6. Ce que tu rends

1. `GABARIT-360-CLASS-SPECIES.md` corrigé sur le §4 (le pire cas réel), et
   portant **à quel rendu ses nombres se rapportent**.
2. Les **trois arbitrages** posés à Eric, chacun avec ses nombres et le coût
   de chaque sortie — **sans en trancher aucun**.
3. Une cote pour la **liste de traits d'espèce**, mesurée, à tenir prête si
   Eric tranche §3 dans ce sens.
4. Si tu ouvres un lot de suite : son mandat, dans `~/tools/fh-phb/`, au
   format des précédents.

═══════════════════════════════════════════════════════════════════
