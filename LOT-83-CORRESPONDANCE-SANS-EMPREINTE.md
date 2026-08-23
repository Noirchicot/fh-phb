# Lot 83 — fermer la correspondance là où l'empreinte ne dit rien

**En clair :** la table qui apparie les records anglais et français est finie à 919 sur 1103.
Il reste **409 records bloqués**, et ils ne sont pas bloqués pour la même raison — la moitié
sont bloqués parce qu'il n'existe **aucune empreinte** pour les comparer. Ce lot ouvre une
seconde route pour ceux-là, et resserre la première pour les autres.

- **Dépôt :** `~/tools/fh-srd` · **branche `83-correspondance-sans-empreinte`**, dans un worktree.
- ⛔ **Ne travaille jamais directement sur `main`, et ne pousse rien.** Tu commites sur ta
  branche ; c'est l'architecte qui fusionne et Eric qui pousse.

---

## 1. L'état, mesuré (`exports/srd/correspondence.json`, `import_run` 84bc651f)

```
matched 919   ·   pending 409 records en 64 groupes   ·   refused 1
provenance : structured-fingerprint/2 = 822 · human = 89 · transitive/weapon.mastery = 8
```

**Et le reste se coupe en deux populations qui n'ont rien à voir :**

| | records | ce qui bloque |
|---|---|---|
| **A. Sans empreinte** — `glossary` 152 · `skill` 18 · `feat` 17 · `weapon-property` 11 | **198** | `fingerprint: None`. Zéro apparié. Il n'y a **rien de structuré à comparer** : ces records portent un nom et de la prose, pas des nombres. La route actuelle ne peut pas les atteindre, et n'y arrivera jamais en la resserrant. |
| **B. Ambigus** — `item` 98 · `spell` 74 · `gear` 31 · `tool` 4 · `species` 2 · `weapon` 2 | **211** | L'empreinte existe et **matche plusieurs candidats**. Elle discrimine mal, elle n'est pas absente. |

➡️ **Deux problèmes, deux routes.** Un lot qui les traite pareil échouera sur les deux.

---

## 2. L'objectif

**Fermer le maximum de A et de B sans jamais deviner** — et pour chaque paire nouvelle, dire
**par quelle route** elle a été atteinte, comme le fait déjà le champ `by`.

Ce qui compte n'est pas le nombre fermé : c'est que **chaque paire émise soit démontrable**.
Une paire fausse coûte plus cher que dix paires manquantes, parce qu'elle sera lue comme
acquise et que plus personne ne la remesurera.

---

## 3. La piste pour A, et elle est déjà prouvée dans ce dépôt

⭐ **`transitive/weapon.mastery` a fermé 8 sur 8, zéro conflit.** Le principe : quand une
paire est déjà prouvée, elle peut **transporter sa preuve** vers les records qui la citent.

**Les porteurs sont disponibles, et ils sont appariés :**

```
class 12/12 ✅   ·   background 4/4 ✅   ·   weapon 36/38 ✅
class-progression 12/12 ✅   ·   monster 330/330 ✅   ·   armor 13/13 ✅
```

Une compétence est citée par des classes et des arrière-plans appariés. Une propriété d'arme
est portée par 36 armes appariées. **La preuve existe en amont ; c'est le chemin pour y aller
qui n'a pas été construit.**

### 🔴 Et la leçon du refus de `weapon-property` est le cœur du lot

Le lot précédent a **refusé** les propriétés d'arme, avec ce motif : *« le français les liste
dans son propre ordre alphabétique, 8 contradictions sur 9 noms »*. **Ce refus était juste, et
il ne condamne que l'appariement par POSITION.**

➡️ **L'ordre ment ; l'appartenance, non.** Prends l'ensemble des armes anglaises qui portent
la propriété `P_en`, traduis cet ensemble par les paires d'armes déjà prouvées, et regarde
quelle propriété française est portée par **exactement** ces armes-là et par aucune autre.
C'est un appariement par **profil d'occurrence** — il ne lit jamais un ordre, jamais un nom.

⛔ **Il ne conclut que sur une extension EXACTE.** Deux propriétés qui coexistent toujours sur
les mêmes armes sont **indiscernables** : elles vont en `pending` avec ce motif écrit, elles
ne se départagent pas au jugé. C'est le cas normal, pas un échec.

📌 Applique le même raisonnement partout où un porteur apparié cite la chose à apparier.
**`glossary` (152) est le plus gros morceau et probablement le plus dur** — s'il n'a pas de
porteur exploitable, dis-le et chiffre-le, ne force pas.

---

## 4. La piste pour B

L'empreinte existe mais ne discrimine pas. **N'invente pas une empreinte plus fine à partir de
la prose** — `item` porte déjà la mention *« mined from the prose; the weakest here »*, et
c'est précisément le genre le plus ambigu (98). Creuser là aggraverait le problème.

Cherche plutôt **un second axe indépendant** de celui déjà utilisé, et n'apparie que lorsque
les deux axes désignent le même record. Un groupe qui reste ambigu **reste ambigu**.

⚠️ **`item` a 253 records EN contre 258 FR.** Ce delta n'est pas du bruit : il est expliqué
par les **cinq objets anglais avalés** (des descriptions collées bout à bout — voir le refus
enregistré sur `srd:item:en:sword-of-sharpness`, qui porte la description de *Sword of
Wounding*). **Ne répare pas ces records ici** — c'est un autre chantier. Mais **compte** ceux
que tu croises et nomme-les : ce lot est le premier outil capable de les voir.

---

## 5. Les gardes — non négociables

1. ⛔ **Les 32 catalogues SRD sortent du build identiques à l'octet près.** C'est la loi que
   les deux lots précédents ont respectée. Seule la couche de correspondance bouge.
2. ⛔ **N'écris JAMAIS de provenance `human`.** Les 89 signatures sont celles d'Eric. Une
   route automatique se nomme, elle ne se déguise pas en signature.
3. ⛔ **Aucun appariement par ressemblance de nom**, dans aucun genre, même « évident ».
   `skill`/`glossary` sont exactement les genres où un nom voisin est un piège.
4. **Chaque nouvelle route porte son nom dans `by`** (`transitive/…` ou autre), et
   `by_provenance` doit la compter séparément.
5. **Un test par route**, qui la vérifie **en la violant** : fabrique un cas qui devrait être
   refusé et prouve qu'il l'est. Un garde qui ne mord pas est pire que pas de garde.
6. **`docs/CORRESPONDENCE.md` explique chaque route neuve** — pourquoi elle est valide, et ce
   qu'elle refuse de conclure.

---

## 6. Ce que tu rends

Un **inventaire** — le format des lots de ce chantier :

- le nombre fermé **par route et par genre**, avant/après ;
- ce qui **reste** en `pending`, avec le motif, genre par genre ;
- ⭐ **ce que tu as refusé de conclure et pourquoi** — c'est la partie qui vaut le plus ;
- toute contradiction entre ce document et ce que tu mesures : **ta mesure gagne**, dis-le.

📌 Si `glossary` résiste entièrement, ce lot reste un succès. 198 records sans empreinte dont
on ferme la moitié par une route démontrable valent mieux que 409 fermés par ressemblance.
