# Lot 93 — remettre les couches SRD de `fhpc` à jour, et fermer la porte qui laisse passer

**En clair :** `fhpc` embarque une copie gelée du SRD. Depuis, cinq lots ont corrigé la source,
et la copie ne lui ressemble plus — **deux suites sont rouges à cause de ça**. Tu régénères la
copie. Et tu répares ce qui a permis à l'écart de passer inaperçu : **une liste de genres écrite
en dur, qui saute en silence tout genre qu'elle ne connaît pas.**

- **Dépôt :** `~/tools/fhpc` · **branche `93-couches-srd-a-jour`** (crée-la depuis `main`).
- ⛔ **Jamais sur `main` directement, jamais de `git push`.** La fusion et la poussée ne
  t'appartiennent pas.
- 📌 **Lot de DONNÉES** : `REGLES-DE-STRUCTURE.md` ne s'applique pas ici (son §4 le dit
  lui-même — ce bloc est pour ce qui se dessine et se regarde). Tu ne touches à aucun écran.

---

## 1. Ce qui est mesuré, et que tu n'as pas à re-chercher

`src/tools/gen-srd-layer.mjs` lit **en direct** `~/tools/fh-srd/exports` (`SRD_ROOT`, ligne 24).
La source n'a pas « dérivé toute seule » : **c'est nous qui l'avons bougée.**

| mesure | valeur |
|---|---|
| le total que la suite attend | **2 651** |
| le total que la source produit aujourd'hui | **2 656** |
| l'écart | **+5 — exactement les cinq objets avalés du lot 86** (`item` EN : 253 → 258 ; le FR était déjà à 258) |
| autres écarts visibles au diff | `armor_category` (lot 85, rendu au livre) et `don_doff` sur les armures |

⭐ **Et le test porte déjà son propre garde-fou, qui te dit que la voie est libre.**
`generate() écrit les deux couches DANS SA DESTINATION` appelle `amontEnPleinLot()` : si
`~/tools/fh-srd` était sur une branche dont les exports s'écartent de `main`, il refuserait de
conclure à une dérive et te dirait d'attendre la fusion. **Il n'a pas mordu** — vérifié depuis
le siège : les exports de `92-champs-manquants` sont **identiques** à ceux de `main`. Tout ce
qui est dans la source est fusionné.

---

## 2. 🔴 LA PORTE QUI LAISSE PASSER — et c'est le cœur du lot

`exports/srd/en/` porte **DIX-SEPT** fichiers. `gen-srd-layer.mjs:43` en liste **SEIZE en dur** :

```js
export const GENRES = [ "armor", …, "weapon-mastery", "weapon-property" ];   // 16
```

`item-value` — le barème des prix par rareté, livré par le lot 92, **présent dans les deux
langues et déjà inscrit au MANIFEST** — **n'est pas dedans**. Il ne provoque aucune erreur :
**il est simplement absent de la couche.** Personne ne le saurait.

⭐ **LA BONNE RÈGLE EST DÉJÀ ÉCRITE — trois lignes au-dessus de la liste**, par l'auteur du
générateur lui-même :

> *« LA VRAIE RÈGLE, écrite sur le fait : ce qui entre ici est un fichier d'export `fh-srd`, un
> point. `arcana` et `training` n'en sont pas et n'en seront jamais — ils naissent dans ce
> dépôt-ci. »*

🔴 **Le commentaire dit la règle, le code fait l'inverse.** Le même fichier porte même
l'avertissement : *« CE NOMBRE N'EST PAS UNE FRONTIÈRE, ET IL A FAILLI LE DEVENIR »*. Il l'est
redevenu.

➡️ **Ce que tu fais** : la liste des genres se **dérive de la source** (les fichiers d'export
présents et vérifiés au MANIFEST), et le générateur **refuse** ce qu'il ne doit pas produire —
les genres Fate's Hand (`arcana`, `training`), nommément, avec le motif (loi §0.12).

⛔ **Refuser, jamais sauter.** C'est la leçon du lot 92, mesurée le même soir : chez `fh-srd`,
`build_web.py` **a refusé** le genre neuf tant qu'il n'était pas déclaré — deux suites rouges,
et le défaut trouvé en dix secondes. Ici, il a été sauté en silence pendant une journée entière.
**Le même problème, deux réponses opposées : garde la bonne.**

---

## 3. Ce que tu produis

1. **Les deux couches régénérées** (`layers/srd-5.2.1-fr.layer.json`, `…-en.layer.json`) et
   commitées, `item-value` compris.
2. **`GENRES` dérivé de la source**, avec le refus explicite des genres maison.
3. **Les seuils et les comptes remis à leur mesure** — `FLOORS` (`item` passe de 253 à 258),
   le total, et le libellé du test de manifeste qui dit encore *« 32 fichiers, 16 genres × 2
   langues »*.
   📌 **Prédiction du siège, à confirmer ou à démentir : le nouveau total est 2 658**
   (2 656 + `item-value` × 2 langues, 1 record chacune). **Si tu trouves autre chose, c'est ta
   mesure qui gagne — dis-le et dis d'où vient l'écart.**
4. ⚠️ **Un test qui NOMME l'oubli** : ajoute une attaque qui pose un faux fichier d'export
   inconnu et vérifie qu'il est **nommé**, pas ignoré. Un garde qu'on n'a pas vu mordre ne mord
   pas.

---

## 4. Le troisième rouge n'en est pas un — mais il cache un vrai défaut

`tests/tree-immuable.test.mjs` tombe en **`ENOBUFS`**. Ce n'est pas une régression : son
`spawnSync` (ligne ~123) rejoue **toute la suite** avec le `maxBuffer` par défaut de **1 Mo**, et
les deux vrais rouges crachent un diff énorme. Répare les deux rouges, il redevient vert tout
seul.

🔴 **Mais regarde ce que ça veut dire : la garde d'immutabilité devient AVEUGLE exactement quand
la suite est bruyante — c'est-à-dire quand le dépôt va mal.** Elle échoue alors pour une raison
qui n'est pas la sienne, et sa vraie question — *une suite a-t-elle muté un artefact commité ?* —
**n'est plus posée du tout**.

➡️ **Donne-lui un `maxBuffer` à sa mesure, et prouve-le** : force la suite à être bruyante et
vérifie que le garde rend toujours son verdict. ⚠️ Ce fichier porte déjà **deux précautions
d'environnement** mesurées et commentées (`NODE_TEST_CONTEXT` retiré, rapport épinglé en TAP) —
**la tienne est la troisième, écris-la dans le même style et avec son motif.**

---

## 5. ⛔ Ce qui n'est PAS dans ce lot

- **La couche `srfh`** (lot 90, EN seulement, 294 objets). Faut-il l'importer dans `fhpc`, et
  lui donner une page ? **Question ouverte, elle appartient à Eric.** Ne l'importe pas.
- **Tout écran.** Le tambour, R1, la grille : rien. Tu ne touches qu'à la donnée et à ses gardes.

---

## 6. Ce que tu rends

- **la suite complète verte** dans un clone indépendant, et le compte affiché ;
- **deux exécutions du générateur byte-identiques**, l'arbre propre après la seconde
  *(la discipline du kickoff §L4.3, que ce fichier revendique en tête)* ;
- **le nouveau total mesuré**, et l'écart avec ma prédiction s'il y en a un ;
- **le faux genre inconnu, refusé et nommé** — la preuve que la porte est fermée ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
