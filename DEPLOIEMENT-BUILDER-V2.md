# Publier le builder v2 — le chemin, mesuré

> **Préparé par l'architecte le 2026-08-13. ⛔ LES DEUX COMMANDES DU §3 SONT LE
> GESTE D'ERIC** — la création de remotes et tout déploiement lui appartiennent
> (`ARCHITECTE.md` §2), et un fichier ne lève pas cette règle.

**Pourquoi maintenant** : Eric a tranché le 2026-08-13 que **chaque joueur
construit son personnage sur sa machine**. Le builder ne tourne aujourd'hui que
depuis un serveur local sur le Mac d'Eric. **Sans publication, les cinq joueurs
n'ont pas de builder.**

---

## 1. Le trou, mesuré

| | |
|---|---|
| `fhpc` | **public**, et **aucun** chemin de publication : pas de gh-pages, pas de script, pas d'action |
| `fh-phb` | Pages actif, branche `gh-pages`, en ligne sur `https://noirchicot.github.io/fh-phb/` |
| `sync_from_vault.py` | copie **des fichiers HTML autonomes** (`skill-builder.html`, `stat-roller.html`) depuis `~/tools/fh-skills/` — **le patron v1** |

🔴 **Et c'est pour ça que le patron v1 ne marche pas ici.** Le builder v1 était
**un fichier**. Le v2 est un **arbre** : `ui/builder/*.mjs` importe `../../src/…`
et charge `../../layers/*.json` et `../../examples/*.json` par `fetch`.

---

## 2. La charge, mesurée — et elle n'est PAS un problème

**La première réaction était mauvaise.** `srd-5.2.1-en.layer.json` pèse **2,8 Mo**,
ce qui semblait rédhibitoire pour cinq machines inconnues. **Mesuré compressé — ce
que le navigateur reçoit réellement** :

| | brut | gzip |
|---|---|---|
| `srd-5.2.1-en` | 2 820 Ko | **397 Ko** |
| les 4 couches FH | 47 Ko | **8 Ko** |
| **total des 5 couches** | 2,8 Mo | **407 Ko** |

Et **30 modules** sont atteints depuis `shell.mjs`, dont **24 dans `src/`** — sur
les 56 présents. Soit ≈ **36 requêtes** et **~500 Ko** compressés. C'est une page
web ordinaire. ⛔ **Aucune optimisation n'est justifiée aujourd'hui** : ce serait
résoudre un problème qui n'existe pas.

---

## 3. Le chemin retenu — Pages sur `fhpc` lui-même

⭐ **Le dépôt EST le déploiement.** Rien n'est recopié, donc rien ne peut diverger
— la loi anti-copie du chantier, appliquée à la publication.

Les chemins du builder sont **relatifs** (`../..` depuis `ui/builder/`), donc ils
fonctionnent sous n'importe quelle base d'URL. **Vérifié par lecture, pas supposé.**

### Ce qu'Eric exécute

**a) Activer Pages sur `fhpc`**, branche `main`, dossier racine :

```bash
gh api -X POST repos/Noirchicot/fhpc/pages -f "source[branch]=main" -f "source[path]=/"
```

*(ou par l'interface : `Settings` → `Pages` → Source `main` / `/ (root)`)*

**b) Vérifier, une minute plus tard** :

```bash
gh api repos/Noirchicot/fhpc/pages --jq '{status:.status,url:.html_url}'
```

**L'adresse du builder sera** :
`https://noirchicot.github.io/fhpc/ui/builder/`

### ✅ Ce qui est déjà fait, côté architecte

**`.nojekyll` est commité à la racine de `fhpc`** (`d518bb0`). Sans lui, Pages fait
passer le dépôt par Jekyll, qui escamote les fichiers commençant par un souligné et
réécrit ce qu'il prend pour des gabarits. **Un seul des 30 modules manquant, et le
builder ne démarre pas.** *(Mesuré : aucun fichier en `_` dans le dépôt
aujourd'hui — mais le drapeau protège des futurs.)*

---

## 4. Ce qui reste à faire, et par qui

| | Quoi | Qui |
|---|---|---|
| 1 | Activer Pages *(§3a)* | 🔴 **Eric** |
| 2 | Vérifier que le builder démarre à l'adresse publiée — **et le regarder**, pas seulement le charger | architecte |
| 3 | Poser le lien sur le site PHB *(une entrée de nav mkdocs vers l'adresse ci-dessus)* | architecte prépare, **Eric publie** |
| 4 | Le tester sur une machine qui n'est pas le Mac d'Eric | 🔴 **Eric**, ou un joueur |

⚠️ **Le n°4 n'est pas une formalité.** Cinq joueurs, cinq machines inconnues,
possiblement des téléphones. La base mobile ratifiée est **360 px**, et personne
n'a encore ouvert le builder ailleurs que sur ce Mac.

---

## 5. ⏳ Quand

**Pas la veille.** Les joueurs doivent pouvoir s'en servir **avant** le 7 novembre,
donc la publication doit venir **avec de la marge** — et le n°4 ci-dessus peut
révéler du travail.

📌 **Rien n'oblige à attendre que le builder soit fini.** Publier tôt un builder
incomplet vaut mieux que publier tard un builder complet : ça met le n°4 derrière
nous, et un joueur qui bute sur une étape en placeholder le dit tout de suite.
