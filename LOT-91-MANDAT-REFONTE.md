# Lot 91 — refaire le mandat de l'architecte, au lieu de le rapiécer

**En clair :** le fichier qui dit à un siège d'architecte comment travailler fait **1286 lignes
et 72 sections**. Sa règle n°1 pointe vers un fichier qui n'existe plus. Sa date la plus récente
est le **14 août** — dix jours de chantier n'y sont pas. Ce lot le reconstruit.

- **Dépôt :** `~/tools/fh-phb` · **branche `91-mandat-refonte`**, worktree déjà créé.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

> 🔴 **RECONSTRUIRE, PAS RAPIÉCER.** C'est une règle d'Eric, et elle vaut ici plus qu'ailleurs :
> ce fichier est déjà fait de corrections empilées sur des corrections. Une couche de plus le
> rendrait moins lisible, pas plus vrai.

---

## 1. Le diagnostic, mesuré

| | |
|---|---|
| taille | **1286 lignes · 72 sections · 78 Ko** |
| 🔴 **sa règle n°1 pointe dans le vide** | elle nomme `FHV2 - ADDENDUMS (source n°1).md` comme **source n°1** d'une hiérarchie ratifiée par Eric le 10/08 — **le fichier n'existe nulle part dans le vault**. Cité **4 fois** |
| ⛔ **et le mot est banni** | *« addendum »* est un mot proscrit du chantier. Ce qui dit comment FH diverge du SRD est un **dérivé**, jamais une source |
| 🔴 **sa date la plus récente est le 2026-08-14** | 21 mentions du 13/08, 13 du 12/08, 12 du 08/08 — et **zéro** après le 14. **Dix jours manquent** |

### ⭐ ET LA CAUSE DE L'OBÉSITÉ, qui est aussi le remède

**Le fichier mélange trois choses de natures différentes :**

| | ce que c'est | où ça devrait vivre |
|---|---|---|
| **les RÈGLES** | comment ce siège travaille — durable | **le mandat** |
| **l'ÉTAT** | ce qui est vrai en ce moment | **`CHANTIER-STATUS.json`**, qui existe déjà pour ça |
| **l'HISTOIRE** | ce qui s'est passé, daté | **une archive**, à côté |

⭐ **Cette opération a DÉJÀ été faite sur le tableau de bord**, et elle a marché : il pesait
294 Ko, son histoire est partie dans `CHANTIER-ARCHIVE.json`, et son en-tête dit maintenant
*« ce fichier ne porte que l'état vivant »*. **Fais la même chose ici.** Le précédent est dans le
dépôt, va le lire.

---

## 2. La règle qui décide de tout ce que tu gardes

> **Une affirmation qui ne se vérifie pas aujourd'hui ne reste pas dans le mandat.**

Pour chaque affirmation du fichier, trois issues et trois seulement :

| | |
|---|---|
| ✅ **vraie et vérifiable maintenant** | elle reste, resserrée |
| 🕰️ **elle était vraie, elle raconte** | elle part à l'**archive**, datée |
| 🔴 **elle est fausse** | elle **sort**, et tu la nommes dans ton rapport |

⛔ **Ne crois pas le fichier sur parole.** Il cite des fichiers, des lignes, des commits, des
chiffres — **vérifie-les**. Un fichier cité qui n'existe plus, une cote qui a changé, un « le
plus récent » qui a dix jours : ce sont exactement les trois défauts que j'ai déjà trouvés en
deux minutes, et il y en a d'autres.

---

## 3. 🔴 CE QUE TU NE DOIS SURTOUT PAS PERDRE

**La valeur de ce fichier, ce sont les défauts payés.** Il porte des dizaines de leçons tirées
d'incidents réels et datés — un garde de test qui ne mordait pas, un `diff` lu depuis la
mauvaise base, une note en milieu de ligne qui avait commenté quatre assertions.

⛔ **Aucune de ces leçons ne se perd.** Si elle est encore vraie, elle reste. Si elle décrit un
produit mort, elle part à l'archive **avec son incident** — jamais à la poubelle.

⭐ **Le test d'une bonne leçon** : elle vient d'un incident daté. C'est déjà le contrat du
majordome (`~/obsidian-vault/7.CLAUDE AND ERIC LOGBOOK/Majordome — consignes permanentes.md`) :
*« une consigne sans incident derrière elle n'a rien à faire ici : elle deviendrait du bruit
qu'on saute »*. **Applique le même contrat au mandat.**

📌 Et vérifie le recouvrement : **certaines consignes sont peut-être déjà dans le majordome**.
Une règle écrite deux fois finit par se contredire — si elle y est, le mandat y renvoie au lieu
de la redire.

---

## 4. Ce qui a changé depuis le 14 août, et qu'il faut aller chercher

Le mandat ne le sait pas. **Ne l'invente pas — va le lire** :

| | où |
|---|---|
| l'état vivant du chantier | `CHANTIER-STATUS.json` — tenu à jour cette nuit encore |
| **les six lots fusionnés du 23-24/08** | `LOT-84` à `LOT-90` dans ce dépôt |
| **le SRFH**, la couche neuve | vault `FH-WEB/FHPC/FHPCv2 SRFH et SRFH+.md` |
| **l'écran R1** et tout ce qu'Eric en a dit | vault `FH-WEB/FHPC/FHPCv2 R1 cahier des charges.md` |
| **la norme des listes** | vault `FH-WEB/FHPC/FHPCv2 norme des listes.md` |
| le rangement de l'équipement | vault `FH-WEB/FHPC/FHPCv2 rangement equipement.md` |

⚠️ **Le mandat renvoie à des fichiers de passation datés** (`PASSATION-2026-08-14-SOIR.md` et
ses voisins) en disant lequel est « le plus récent ». **Vérifie ce qui existe encore, et ce qui
a été consommé.** Un pointeur vers une passation périmée envoie le siège suivant dans le décor —
c'est exactement ce qui s'est passé avec la règle n°1.

---

## 5. ⚠️ Deux choses délicates, à traiter avec soin

**1. La charte d'autonomie (§4b) se dit « PROPOSÉE, pas encore active »**, et conditionne son
application à une phrase exacte. ⚠️ **Eric a mis ce siège en autonomie deux fois les 23 et
24/08**, sans prononcer la phrase du fichier. ➡️ **Constate l'écart, ne le tranche pas** :
c'est une décision d'Eric, pas une correction de forme.

**2. La porte de déploiement est déclarée GELÉE** parce que ses six items mesurent un produit
qui n'est plus le chemin. ⚠️ **Or `fhpc` a été poussé ET publié cette nuit** — et le site
`fh-srd` vient d'une autre branche, donc pousser `main` n'y déploie rien. ➡️ **Mesure ce qui est
vrai des deux dépôts aujourd'hui**, et dis-le. Ne redéfinis pas la porte.

---

## 6. ⛔ Ce que tu ne fais pas

| | |
|---|---|
| ⛔ décider du **produit** | ce que le builder est, pour qui, jusqu'où — c'est Eric |
| ⛔ trancher une **règle de jeu** | même si le mandat la marque « à trancher » |
| ⛔ **inventer** une règle de travail | tu réorganises ce qui existe, tu n'ajoutes pas ta doctrine |
| ⛔ toucher `CHANTIER-STATUS.json` | il est tenu à la main par le siège vivant, et il change pendant que tu travailles |
| ⛔ toucher au **vault** | tu le lis, tu n'y écris pas |

📌 **Le siège est VIVANT pendant que tu travailles** — un architecte lit ce fichier en ce
moment. C'est pour ça que tu es sur une branche : rien ne bouge sous ses pieds.

---

## 7. Ce que tu rends

- **le mandat refait**, et sa taille avant/après ;
- **l'archive**, à côté, avec ce qui en est sorti ;
- 🔴 **la liste de ce que tu as trouvé FAUX**, une ligne chacun — c'est le livrable le plus utile
  du lot, et Eric le lira en premier ;
- **ce que tu as trouvé écrit deux fois**, ici et dans le majordome ;
- **ce que tu n'as pas pu vérifier**, et pourquoi ;
- toute contradiction entre ce document et ce que tu mesures : **ta mesure gagne**, dis-le.

⚠️ **Eric n'est pas codeur.** Rapport en français clair, tableaux, titres courts, court. Un
chiffre mesuré vaut mieux qu'une phrase. **Une seule question**, si tu en as une.
