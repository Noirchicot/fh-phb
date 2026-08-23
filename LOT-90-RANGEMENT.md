# Lot 90 — chaque objet sait où il se range et où il se porte

**En clair :** les 416 objets d'équipement du SRD ne portent aucune indication de rangement.
Ni le rayon où les chercher, ni l'endroit du corps où les porter. Le classement, lui, **existe
déjà** — Eric l'a arrêté en août, à la main, objet par objet. Ce lot le rend lisible par une
machine.

- **Dépôt :** `~/tools/fh-srd` · **branche `90-rangement`**, worktree déjà créé.
- ⛔ **Jamais sur `main`, jamais de `git push`.** Tu commites sur ta branche ; l'architecte
  fusionne, Eric pousse.

> 🔴 **L'EXIGENCE, ET C'EST LA SEULE QUI COMPTE : 416 SUR 416, AUCUN RESTE.**
> Eric, 24/08 : *« on finit toute la séquence jusqu'au dernier item du SRD, la liste étant
> désormais complète »*. Un objet sans rangement est un objet que l'écran ne peut pas montrer.

---

## 1. Les trois axes — ce sont ses mots

> *« Clé : ou ça se range, ou ça se porte. Pour les armes : type de dégâts. Y'a craftable
> effectivement. »*

| axe | la question | qui le porte |
|---|---|---|
| **où ça se RANGE** | rayon puis étagère | **les 416** |
| **où ça se PORTE** | l'emplacement sur le corps | seulement ce qui se porte |
| **`craftable`** | est-ce une base sur laquelle on fabrique | ⏳ §6, à ne pas trancher seul |
| le **type de dégâts** | | ✅ **déjà là**, `damage_type_key` — rien à faire |

🔴 **DEUX AXES, PAS UN — et les confondre coûte un second passage sur tout le corpus.**
Le rangement dit *où je le cherche*, l'emplacement dit *où je le porte*. **Les bottes et les
capes sont sur la même étagère et à deux emplacements différents.** Une amulette et un anneau
sont tous deux des bijoux, l'un va au cou, l'autre au doigt. ⛔ **Deux axes indépendants ne se
rangent pas dans un seul champ.**

---

## 2. 🔴 DÉRIVE D'ABORD, N'ÉCRIS QUE CE QUI NE SE DÉRIVE PAS

Mesuré depuis le siège d'architecte, le 24/08 :

| | n | d'où vient son étagère |
|---|---:|---|
| objets magiques · armes · armures | **309** | ✅ **d'un champ qui existe déjà** — `category`, `weapon_category` × `weapon_range`, `armor_category` |
| matériel d'aventure + outils | **107** | ⛔ **rien qu'un nom** — la table écrite est leur seule source |
| | **416** | |

⛔ **N'ÉCRIS PAS DANS LA TABLE CE QUI SE DÉRIVE.** Une valeur portée à deux endroits finit par
se contredire. *(Le précédent est chez nous : le fichier des catalyseurs porte un même palier
dérivé de deux champs différents — 463 records d'un côté, 2 de l'autre, divergents avant même
d'avoir un lecteur.)*

➡️ **Une seule fonction répond « quelle étagère ? »** : elle **dérive** pour 309, elle **lit une
table** pour 107. Un seul point d'entrée, deux sources derrière.

---

## 3. 🔴 LE NOM MENT — quatre règles testées, trois se cassent

⛔ **N'écris AUCUN analyseur de noms.** Ce n'est pas une préférence, c'est mesuré sur les 82
objets courants :

| la règle « évidente » | ce qu'elle attrape en trop |
|---|---|
| *finit par « pack »* → un paquet d'aventurier | 🔴 attrape **Backpack**, qui est un contenant. **8 prises pour 7 vrais** |
| *contient « scroll »* → magie | 🔴 attrape **Case, Map or Scroll**, qui est un étui |
| *contient « pouch »* → contenant | 🔴 **Component Pouch** est de la magie, **Pouch** est un contenant. **Un mot, deux étagères** |
| *contient « case »* → contenant | ✅ celle-là tient — et c'est la seule |

⚠️ **ET LE PIÈGE DE L'ABSENCE, celui qui a un nom dans ce chantier** : `item.subtype` a sa
**clef présente 258/258**, et elle vaut `null` **206 fois**. **52 valeurs réelles.** Un lot qui
compte `subtype in data` croira tenir un axe de rangement et n'aura rien.
➡️ **Teste toujours la VALEUR, jamais la présence de la clef.**

---

## 4. La table des 107 — elle est écrite, tu la TRANSCRIS

```
~/obsidian-vault/FH-WEB/FHPC/FHPCv2 rangement equipement.md
```

⛔ **NE LA RECOPIE PAS DANS TA COMMANDE NI DANS TON CODE EN DUR SANS LA LIRE** — va la lire, elle
est la source. Elle porte :

- **les 7 rayons** et leurs étagères, avec les comptes ;
- **les 82 objets courants rangés 82/82**, nommément, en douze étagères ;
- **les 25 outils**, une étagère (*Crafting › Outils*) ;
- **les 10 emplacements du corps**, tirés des 77 objets portés, **77/77 sans reste** ;
- la règle : **un objet par emplacement, sauf les doigts** ;
- ⛔ **les emplacements PLACENT, ils n'INTERDISENT pas** — aucune règle du SRD ne limite le port,
  la seule limite est l'harmonisation, déjà dans la donnée.

⭐ **Un contrôle gratuit** : ses comptes doivent retomber. 16+10+9+8+7+6+6+6+5+5+3+1 pour les
courants, et 22+13+10+8+7+5+4+4+2+2 = 77 pour les emplacements. **Si ton total ne tombe pas,
c'est toi qui as tort, pas le document** — et tu le dis.

### La langue des clefs

**Clefs ANGLAISES, des deux côtés.** Ce n'est pas une préférence : c'est la **loi §0.13** du
dépôt — *le moteur produit des identifiants, l'interface produit des mots* — citée dans huit
fichiers dont trois contrats. Les dix mots français du document sont des **libellés**, pas des
clefs.

🔴 **Le contre-exemple est chez nous et il a coûté une journée** : `damage_type_key` vaut
`slashing` en anglais et **`perforant`** en français. **Un champ dont le nom promet une clef et
qui porte une traduction.** Ne le refais pas.

📌 Le lot 85 a posé `armor_category` en clefs anglaises des deux côtés. Fais pareil.

---

## 5. Où ça va — le SRFH, jamais la copie du livre

Le rayon, l'étagère et l'emplacement **ne sont nulle part dans le SRD**. Ce sont des décisions
Fate's Hand sur de la matière du livre — donc **du SRFH**, la couche posée cette nuit au rang 15.

⛔ **N'écris rien dans `exports/srd/`.** Le test est celui d'Eric : *si on change ça, est-ce que
ça s'appelle encore le SRD ?* Ici on ne sait pas — **donc SRFH**.

⭐ **Suis la forme déjà posée par le lot 87** dans `exports/srfh/` : chaque valeur porte **sa
provenance** à côté d'elle. Ici la provenance est plus simple qu'un prix — `dérivé:item.category`
ou `table:rangement 22/08` — mais elle doit être là. **Une valeur sans provenance est une valeur
que personne ne pourra corriger.**

---

## 6. ⏳ `craftable` — ne le tranche pas, mesure-le

Eric a dit *« y'a craftable effectivement »*, et le document le décrit comme **une étiquette
transverse** : un objet est rangé quelque part **et** porte `craftable`. Les bases : armes ·
armures · projectiles · parchemins de sort.

⚠️ **MAIS le conseiller VTT a rapporté un précédent qui vaut d'être posé devant Eric** : Foundry
n'a **aucun booléen de ce genre**. La question *peut-on le fabriquer, et à quel prix* y est
répondue par **la rareté** — 5 jours et 50 po pour un commun, 250 jours et 100 000 po pour un
légendaire — plus une courte liste d'exceptions nommées.

➡️ **Ce que je te demande** : pose `craftable` comme le document le dit, **et mesure combien
d'objets le porteraient**. Si ce nombre se dérive entièrement du genre et de la rareté, dis-le —
alors c'est un calcul, pas une étiquette, et Eric tranchera. ⛔ **Ne décide pas à sa place.**

---

## 7. Ce que tu ne tranches pas

| | |
|---|---|
| les noms **`Arcana`** et **`Marvels`** | *proposés*, jamais ratifiés. Emploie-les, marque-les comme provisoires |
| les **trois arbitrages** en suspens | chapeau de sorts · fers à cheval · scarabée de protection |
| la **mémoire de la roue du bas** | quand on change de rayon, retombe-t-on sur l'étagère d'avant ? |
| la **langue des libellés** français | tu poses les clefs ; les libellés traduits sont un autre sujet |

⛔ Si tu butes sur l'un d'eux : **nomme-le, dis ce qui le débloque, et continue le reste.**

---

## 8. Ce que tu rends

- **416/416, dit explicitement**, et le compte par rayon et par emplacement ;
- **combien sont dérivés, combien viennent de la table** — les deux nombres, séparément ;
- l'inventaire au format du chantier : ce qui marche, ce qui reste, **ce que tu as refusé de
  faire et pourquoi** ;
- **les suites vertes dans un CLONE INDÉPENDANT** — il y en a **55**, lancées par
  `for t in tests/test_*.py; do python3 "$t"; done`.
  ⚠️ Piège connu : `sources/pdf` est ignoré par git, donc absent d'un clone frais — le build
  refuse en `SOURCE REFUSED` tant qu'on n'a pas reposé le lien symbolique ;
- ⚠️ **rebase avant de finir** : ta base est `1580a2a`, et main peut avoir bougé. Rejoue les
  suites **après** le rebase, pas seulement avant — un rebase propre n'est pas une suite verte ;
- toute contradiction entre ce document et ce que tu mesures : **ta mesure gagne**, dis-le.

⚠️ **Eric n'est pas codeur.** Ton rapport est en français clair, sans nom de variable dans le
corps. Un chiffre mesuré vaut mieux qu'une phrase. Et **une seule question**, si tu en as une.
