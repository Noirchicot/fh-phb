# Lot 97 — les 149 merveilleux rangés, et les 77 objets portés placés

**En clair :** Eric a classé les 149 objets merveilleux en **sept étagères** et défini **dix
emplacements du corps**. Les décisions sont prises, écrites, datées. **Mais le fichier qui
portait le détail objet par objet — `merveilleux-ranges.json` — n'existe sur aucun disque.**
Résultat : 127 merveilleux sont sur une étagère d'attente, et **416 objets sur 416 n'ont aucun
emplacement**. Tu refais ce travail, et les comptes d'Eric sont ta preuve.

- **Dépôt :** `~/tools/fh-srd` · **branche `97-merveilleux-et-emplacements`** — un worktree
  t'attend, voir plus bas.
- ⛔ **Jamais sur `main`, jamais de `git push`.**
- ⚠️ **VERSATILITY travaille dans le même dépôt** (lot 96) — mais **en lecture seule sur la
  donnée** : il mesure et écrit un document du vault. Vos terrains ne se croisent pas.

📌 **Ta source de vérité** : vault `FH-WEB/FHPC/FHPCv2 rangement equipement.md`, sections
« Marvels — les 149, rangés » et « Les 10 emplacements ». **Lis-la en entier avant de commencer.**

---

## 1. ⭐ LES COMPTES D'ERIC SONT TA VÉRIFICATION — et elle ne coûte rien

**Sept étagères, et l'axe est *vêtement / bijou*, PAS *emplacement du corps* :**

```
Focus & curiosités       33     focus de convocation · boules de cristal · cors · flûtes · jeux · figurines · 6 manuels & tomes
Vêtements                32     capes · manteaux · robes · bottes · gants · gantelets · brassards · ceintures · chapeau · bandeau · ailes
Conteneurs & véhicules   24     sacs · havresac · trou portatif · bouteilles · balai · tapis · bateau · forteresse · cordes · entraves
Anneaux                  22     les 22, tels quels
Bijoux                   15     amulettes · périapts · talismans · colliers · broche · médaillon · diadème · pierre ioun
Consommables             15     poudres · perles · gemmes élémentaires · pigments · colle · solvant
Casques & lunettes        8     4 heaumes · 3 « yeux » · lunettes de nuit
                        ───
                        149
```

🔴 **SI TU TOMBES EXACTEMENT SUR CES SEPT NOMBRES, TU AS REPRODUIT SA CLASSIFICATION.** Si tu
tombes à côté, **ne force pas un objet pour faire le compte** : nomme l'objet, dis dans quelle
étagère tu l'as mis et pourquoi, et laisse l'écart visible. ⭐ **Un total juste ne dit rien du
contenu** — mais un total faux dit à coup sûr qu'il faut regarder.

⚠️ **L'axe a déjà été essayé dans l'autre sens et il a échoué** : classer par emplacement
forçait une étagère « jambes & pieds » à 7 objets, parce que le SRD n'a que des bottes et
**aucune jambière merveilleuse**. ⛔ Ne le refais pas.

**Et pourquoi Eric a écarté un piège** : les **6 Manuels & Tomes ne sont PAS des consommables**
— *« regains it in a century »*, ils ne disparaissent pas, ils dorment. **La règle est stricte :
*consommable* ne gagne que si l'objet CESSE D'EXISTER.**

**Trois arbitrages déjà rendus — reprends-les tels quels, ils sont d'Eric :**

| | |
|---|---|
| **Chapeau de sorts** | **hors du corps** — le texte ne dit jamais *wear*, seulement *« While holding the hat »*. Le nom dit le contraire de la description |
| **Fers à cheval de vitesse / du zéphyr** | **hors du corps** — ils se chaussent aux **sabots d'une monture** |
| **Scarabée de protection** | **consommable** — médaillon porté, mais *« crumbles into powder and is destroyed »*. Il disparaît, donc il consomme |

---

## 2. Le second axe : les dix emplacements

⭐ **DEUX AXES, PAS UN — le rayon range, l'emplacement habille.** Un objet a les deux, et ils
ne se déduisent pas l'un de l'autre.

```
Doigts 22 · Cou 13 · Dos 10 · Tête 8 · Pieds 7 · Torse 5 · Yeux 4 · Mains 4 · Avant-bras 2 · Taille 2   =  77
```

⚠️ **Torse porte AUSSI les 13 armures**, et **Mains AUSSI les 38 armes et le bouclier** — les
nombres ci-dessus comptent les **merveilleux** seuls. **Réconcilie et dis ce que tu trouves.**

**Deux règles qui viennent d'Eric :**
- **Un emplacement tient UNE chose — sauf Doigts**, libre. *« Les anneaux pas de limites, mais
  deux bottes, gants, capes l'une sur l'autre non. »*
- ⛔ **Les emplacements PLACENT, ils n'INTERDISENT pas.** **Yeux** est séparé de **Tête** pour
  cette raison précise : sinon un heaume interdirait des lunettes, ce que le SRD n'interdit pas.

🔴 **ET LA DISTINCTION QUI COMPTE LE PLUS DANS TOUT CE LOT** : l'export doit pouvoir dire
**« ne se porte pas »** — et ce n'est PAS la même chose que **« pas encore répondu »**. Le
défaut actuel confond les deux sur les 416. ⛔ *Une absence n'est jamais une réponse.*

---

## 3. Ce que tu écris

1. **Le détail objet par objet**, avec **la phrase du SRD qui justifie chaque rangement** et un
   champ `doute` sur les cas limites *(le document d'origine en annonçait 33 — dis combien tu
   en as)*.
2. **Les sous-étagères de `marvels` dans `exports/srfh/en/shelving.json`** : aujourd'hui il n'y
   porte que `wondrous` **127** et `rings` 22. ⭐ Et ça règle un vrai défaut d'écran : `wondrous`
   à 127 fait **9 pages** et crève la cible des 35. Après toi, la plus grosse fera 33.
3. **Le champ d'emplacement sur les 416**, avec sa provenance, et **« ne se porte pas »**
   distinct de l'absence de réponse.
4. ⭐ **Le champ est aussi pour la Forge, pas seulement pour l'écran** — Eric l'a demandé
   explicitement pour le **soulforging**. **À concevoir une fois, pour les deux.**

⛔ **Tu n'inventes aucun objet, tu n'en supprimes aucun, tu ne touches à aucun record `srd:`.**
La couche `srfh` habille le SRD, elle ne le modifie pas.

---

## 4. Ce que tu rends

- **les sept comptes**, et l'écart s'il y en a un, objet nommé ;
- **les dix emplacements**, réconciliés avec les armes et les armures ;
- **combien d'objets « ne se portent pas »**, et combien restent sans réponse — deux nombres
  distincts, jamais un seul ;
- tes **doutes**, comptés et listés — ⭐ c'est ce qu'Eric relira en premier ;
- **les suites vertes dans un clone indépendant**, avec le compte affiché
  *(piège connu : `sources/pdf` est ignoré par git → `SOURCE REFUSED` tant que le lien
  symbolique n'est pas reposé)* ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
