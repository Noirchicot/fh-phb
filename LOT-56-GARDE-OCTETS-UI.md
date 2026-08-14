# Lot 56 — `56-garde-octets-ui`

> **[Sonnet · medium]** — un **petit** lot, et il protège la moitié des mesures
> de ce chantier. Il n'ajoute **aucun comportement** : il étend un garde
> existant au répertoire qui en a le plus besoin.

**En clair : le garde qui empêche un fichier de devenir invisible à `grep` ne
surveille que `src/`.** `ui/` — **4 505 lignes**, le chantier actif de ces
quatre derniers jours — n'est pas couvert. Or c'est dans `ui/` qu'on écrit
aujourd'hui les mesures « zéro occurrence » dont on tire des conclusions.

**Worktree** : `~/tools/fhpc-worktrees/56-garde-octets-ui`
**Branche** : `56-garde-octets-ui`, coupée de `main` à `bc1bd40` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre que tu obtiens.**

⛔ **Ton terrain** : `tests/guards-adversarial.test.mjs`, et lui seul (plus un
fichier de test neuf si tu en veux un).
⛔ **NE TOUCHE À AUCUN FICHIER DE `ui/`** — le lot 55 y écrit en ce moment
(`shell.mjs`, `abilities-step.mjs`, `destiny-step.mjs`). Ton garde **lit**
`ui/`, il ne le modifie jamais.
⛔ **Ne touche pas à `src/`.**

---

## ⭐ 0. TU AS LE DROIT DE ME CONTREDIRE — et c'est demandé

**Cette commande a été écrite par un architecte dont les mesures sont fausses
plusieurs fois par jour.** Si une mesure ci-dessous ne se reproduit pas chez
toi, **la mesure a tort, pas toi** : dis-le, montre ta mesure, fais ce que la
tienne dicte.

**Ce n'est pas une politesse — c'est le seul détecteur d'erreur extérieur de ce
siège, et il a rapporté six fois sur huit dans la nuit du 13 au 14 août :**

| Daté | Le lot | Ce qu'il a fait |
|---|---|---|
| **2026-08-13** | lot **53** | sa commande listait **quatre** fichiers de tests ; il a mesuré **un seul**, a démenti sa commande, **et il avait raison** |
| **2026-08-13** | lot **49** | a trouvé **son propre garde creux** — il lisait la présence d'un mot, pas l'arithmétique — et l'a remplacé |
| **2026-08-13** | lot **51** | a attaqué son propre travail et **posé un garde sans qu'on le lui demande** |
| **2026-08-13** | lot **47** | a **refusé** le nom de verbe de sa commande ; son refus est devenu la loi du lot 48 |
| **2026-08-14** | *moi, ce matin* | j'ai annoncé **trois** défauts en regardant un écran ; **deux étaient faux**. Puis j'ai failli te commander un lot sur une dette que la mesure a désamorcée (voir §3) |

---

## 1. 🔴 CE QUI EST MESURÉ

### 1.1 Le garde existe, et sa portée s'arrête à `src/`

`tests/guards-adversarial.test.mjs:316` :

```
test("DÉFAUT n°6 — aucun fichier de src/ n'est illisible au grep (pas d'octet de contrôle)", …)
```

Il est bon : il est né d'un défaut réel, il porte sa justification, et il est
**attaqué** juste en dessous (`:328` — « le garde MORD sur un octet NUL, et PAS
sur sa séquence d'échappement »). **Ne le réécris pas. Étends-le.**

### 1.2 Pourquoi ce garde existe — le défaut qu'il a payé, daté du 2026-08-13

`src/build/block.mjs` portait **deux octets NUL bruts** (ligne 410, un
séparateur de clef composite écrit en octets au lieu de sa séquence
d'échappement). `file` le classait « **data** », donc **`grep` le sautait EN
SILENCE** : `grep -c ""` dessus rendait **zéro**.

**Ce que ça a coûté le jour même** : l'architecte a cherché au `grep` les
producteurs d'une violation, n'en a trouvé **qu'un**, et a conclu qu'une dette
était **retirée**. **Faux — il y en avait deux**, et le second était dans le
fichier illisible. C'est `sed` qui a démenti `grep`.

⭐ **Et voilà pourquoi c'est pire qu'un faux négatif ordinaire** : dans ce
chantier, *« zéro occurrence »* se lit comme une **preuve d'absence**. C'est la
forme de la moitié des mesures du mandat et de **tout son audit des dettes**.
**Un seul fichier illisible les transforme toutes en mensonge silencieux, et
rien ne le signale.**

### 1.3 🔴 Et le garde a été posé sur le mauvais périmètre

Il couvre `src/` — **là où la faute avait eu lieu**. Il ne couvre pas `ui/` —
**là où on tire aujourd'hui des conclusions de « zéro occurrence »**.

**Mesuré le 2026-08-14, dans l'heure** : j'ai conclu que `aria-pressed` avait
**0 occurrence** dans tout `ui/`, et j'en ai tiré un lot. Cette conclusion ne
vaut que parce que j'ai **vérifié à la main**, fichier par fichier, que les 17
fichiers de `ui/builder/` sont lisibles (`grep -c ""` + `file`). **Rien ne
garantit que le prochain le refera.** Aujourd'hui `ui/` est propre — c'est un
état, pas une garantie.

📌 **L'ironie qui porte la leçon, et elle est écrite dans le mandat** : *le
premier jet de ce garde portait lui-même deux octets NUL bruts.* **On
réintroduit un défaut en écrivant sa parade.** Relis ta propre sortie.

---

## 2. Ce qu'il faut faire

1. **Étends la portée** du garde du défaut n°6 pour qu'il couvre `ui/` autant
   que `src/`. ⚠️ **Le périmètre doit être DÉRIVÉ, pas recopié** : un fichier
   neuf déposé dans `ui/` demain doit tomber sous le garde **sans qu'une liste
   bouge**. C'est déjà la loi du dépôt (`readFromSchema` : *« ce bloc lit sa
   règle dans le schéma et n'en invente aucune »*) — la même idée s'applique à
   un arpenteur de fichiers.
2. **Le garde doit couvrir `ui/` en entier**, pas seulement `ui/builder/`, et
   pas seulement les `.mjs` : `shell.css`, `tokens.css` et `index.html` sont
   exactement le genre de fichier qu'on interroge au `grep` en croyant le lire.
3. **Attaque-le sur les DEUX répertoires**, séparément. L'attaque existante ne
   prouve que `src/`. ⚠️ **Le 2026-08-08, une attaque de garde a été lancée sur
   le mauvais fichier de suite** : elle est passée verte, ce qui aurait accusé
   un lot à tort. **Vérifie que ton attaque échoue quand elle doit échouer.**
4. **Écris la limite du garde dans le garde.** Il ne voit que les caractères de
   contrôle hors tab/LF/CR — il ne dit **rien** d'un fichier lisible mais faux.

---

## 3. ⚠️ CE QUE JE T'ÉPARGNE, ET LA MESURE QUI L'A DÉCIDÉ

Cette commande devait aussi porter la dette *« `describableFields` ne lit
qu'une orthographe »* (`$ref` et `["string","null"]` invisibles), inscrite dans
la passation du 2026-08-14 §6 comme une dette réelle.

**Je l'ai remesurée avant de te la commander, et elle est DORMANTE** :

```
FACULTATIFS: 4  |  VUS: 3  |  INVISIBLES: generator (object)
```

Sur les quatre propriétés racine facultatives de `fh-char/1`, la seule que
`describableFields` ne voit pas est `generator` — **et elle doit rester
invisible** : c'est un objet à deux sous-champs requis, pas un texte
descriptif, et `src/doc/schema.mjs` l'explique déjà dans son commentaire.
**Zéro écart réel aujourd'hui.**

📌 **Je te le raconte parce que c'est la loi de ce dépôt et qu'elle vaut pour
toi aussi** : *une dette recopiée n'est pas une dette vérifiée.* Sur neuf
dettes héritées auditées le 2026-08-13, **trois étaient déjà payées, une était
mal dite, une s'est corrigée en trois mots.** Remesure avant d'agir, y compris
sur ce que je viens d'écrire ci-dessus.

---

## 4. Conditions de sortie

1. `npm test` **vert**, et tu écris **le nombre** avant et après.
   ⚠️ **Capture le code de sortie, ne tuyaute pas** — `npm test | grep …`
   masque l'échec, et une poussée est partie sur une suite rouge le 2026-08-13
   pour cette raison exacte.
2. Le garde **mord sur `ui/`** — prouvé par une attaque, puis restauré.
3. Le garde **mord toujours sur `src/`** — l'attaque existante passe encore.
4. Le périmètre est **dérivé** : tu montres qu'un fichier neuf dans `ui/` est
   couvert sans toucher une liste.
5. Tu écris ce qui t'a **surpris**, et ce que tu as **attaqué sans qu'on te le
   demande**.
