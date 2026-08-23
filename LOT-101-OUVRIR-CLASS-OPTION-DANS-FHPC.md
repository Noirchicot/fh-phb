# Lot 101 — ouvrir `class-option` dans `fhpc`, et remettre les couches à jour

**En clair :** le lot 100 a fait entrer un **18ᵉ genre** dans le SRD (`class-option` : les 28
manifestations et les 10 métamagies). `fhpc` le **refuse** — c'est exactement ce que le lot 93 a
construit, et c'est la deuxième fois qu'il mord pour de vrai. **Tant que le genre n'est pas
ouvert au contrat, la régénération des couches est bloquée.**

Le refus, tel qu'il tombe **à l'import du module** :

```
gen-srd-layer : genre(s) inconnu(s) du contrat fh-layer/1 — class-option.
La couche produite ne validerait pas. Ouvrir le genre dans schemas/fh-layer.schema.json
ET dans src/layers/document.mjs — les deux, le garde de dérive compare les listes mot
pour mot — puis relancer. Refusé, pas sauté.
```

⭐ **Le message dit déjà quoi faire.** Ce lot l'exécute, et rattrape la traîne que le lot 93 a
mesurée la première fois.

- **Dépôt :** `~/tools/fhpc` · **branche `101-class-option`**.
- ⛔ **Jamais sur `main`, jamais de `git push`.**

---

## 1. 🔴 LE TERRAIN EST PARTAGÉ — Eric travaille dans ce dépôt

Il écrit dans `ui/builder/` (l'écran R). ⛔ **Ne touche à rien sous `ui/`.**

**Tes fichiers :** `schemas/fh-layer.schema.json` · `src/layers/document.mjs` ·
`src/tools/gen-srd-layer.mjs` (si besoin) · `layers/*.json` · `tests/` · `examples/` ·
`exports/fh-changes.json`.

## 2. ⛔⛔ TU NE LANCES PAS `bin/nouvelle-version.mjs`

**Le bump de version touche TOUS les fichiers qui portent un `?v=`, `ui/` compris.** Ce serait
un conflit garanti avec Eric.

⚠️ **Et il faudra le faire** : les couches sont servies **sous la version**
(`engine.mjs` les récupère avec `versionQuery(...)`), donc une couche régénérée sans bump reste
**servie depuis le cache du navigateur** — la page paraît inchangée alors que la donnée a bougé.
➡️ **Dis-le dans ton inventaire, en une ligne. C'est le geste d'Eric, au moment où il déploie.**

---

## 3. Ce que tu fais

1. **Ouvrir `class-option`** dans `schemas/fh-layer.schema.json` **et** dans
   `src/layers/document.mjs`. ⚠️ **Les deux, mot pour mot** — le garde de dérive compare les
   deux listes.
2. **Régénérer les couches** : `node src/tools/gen-srd-layer.mjs`, et **deux fois**, pour
   vérifier que la sortie est byte-identique et l'arbre propre après la seconde.
3. **Remettre à leur mesure tous les comptes qui bougent.** 📌 **Le lot 93 a déjà fait ce
   chemin — lis `INVENTAIRE-LOT-93` s'il existe, ou son message de commit.** Sa traîne mesurée :
   le total des records, les `FLOORS`, `exports/fh-changes.json`, **les deux personnages
   d'exemple** (empreinte de couche), et **huit fichiers de tests** hors de la suite du
   générateur.
   ⭐ **Prédiction du siège, à confirmer ou à démentir : le total passe de 2 658 à 2 734**
   (76 records neufs, 38 par langue). **Si tu trouves autre chose, ta mesure gagne — dis d'où
   vient l'écart.**
4. ⚠️ **Les couches ont DEUX lots de retard**, pas un : les lots 97, 98, 99 et 100 ont tous bougé
   la source. Attends-toi à un diff large, et **lis ce qui change au lieu de le compter**.

---

## 4. ⛔ Ce qui n'est PAS dans ce lot

- **Le bump de version** (§2) et **le push** — les deux sont à Eric.
- **Tout écran**, et en particulier le tambour : c'est le **lot 95**, qui attend ce lot-ci pour
  avoir une suite verte sur laquelle se vérifier.
- **La couche `srfh`** : elle n'entre toujours pas dans `fhpc`. C'est le lot 95.

---

## 5. Ce que tu rends

- **le nouveau total mesuré**, et l'écart avec ma prédiction s'il y en a un ;
- **deux exécutions du générateur byte-identiques**, arbre propre après la seconde ;
- **la liste de tout ce qu'il a fallu toucher en plus** des deux fichiers du contrat — ⭐ c'est
  la mesure utile : elle dit si la traîne du lot 93 s'est reproduite à l'identique ;
- la suite complète verte dans un **clone indépendant**, avec le compte ;
- **une ligne sur le bump de version**, pour qu'Eric ne l'oublie pas ;
- ce que tu as **refusé** de faire et pourquoi ;
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**
