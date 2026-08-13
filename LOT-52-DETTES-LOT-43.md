# Lot 52 — `52-dettes-lot-43`

> **[Sonnet · high]** — un lot de **moteur**. Il ne dessine rien et ne touche
> pas à `ui/`. Deux dettes déclarées par le lot 43, **remesurées une par une
> par l'architecte** — et l'une des deux est **plus grande** que ce que le lot
> avait pu voir.

**Worktree** : `~/tools/fhpc-worktrees/52-dettes-lot-43`
**Branche** : `52-dettes-lot-43`, coupée de `main` — **remesure**
(`git -C ~/tools/fhpc rev-parse --short main`).
⛔ **Jamais `main`, jamais de `git push`, jamais de fusion.**
**Départ** : `npm ci` puis `npm test`, **écris le nombre**.

⛔ **Ton terrain** : `src/modules/fh/skill-pool.mjs`, `src/build/block.mjs`,
`src/build/decisions.mjs`, `contracts/`, `tests/`.
⛔ **NE TOUCHE À AUCUN FICHIER DE `ui/`** — un autre lot y travaille.

---

## 0. AVANT TOUT — un piège d'outillage qui vient d'être payé ici

🔴 **`src/build/block.mjs` était INVISIBLE AU GREP jusqu'au 2026-08-13.** Il
portait deux octets NUL bruts ; `file` le classait « data », donc `grep` le
sautait **en silence** — `grep -c ""` dessus rendait **zéro**.

**Ce que ça a coûté** : l'architecte a cherché au grep les producteurs de
`background.boost-disallowed`, n'en a trouvé qu'**un**, et a conclu que la
dette n°2 ci-dessous était **retirée**. **Faux** — il y en a deux. C'est la
**lecture** (`sed`) qui a démenti le `grep`.

✅ **Corrigé** (les octets sont devenus des séquences d'échappement) et **gardé**
(`tests/guards-adversarial.test.mjs`, défaut n°6). Mais retiens la leçon pour
tout ce lot : **quand une mesure te surprend, suspecte ton instrument avant le
dépôt.**

---

## 1. DETTE A — le retour anticipé d'`imposedLines()`

### 1a. Ce que le lot 43 avait déclaré

> *« `imposedLines()` fait un `return` anticipé quand `backgroundRef` est
> absent … Mesuré : ça ne change AUCUN nombre publié … pour un personnage
> Araag/Humain SANS choix `background` posé. »*

### 1b. 🔴 CE QUE L'ARCHITECTE A REMESURÉ, ET QUI ÉLARGIT LA DETTE

**Le lot 43 a SUPPRIMÉ les arrière-plans.** Mesuré : les quatre arrière-plans
SRD sont `op: "disable"` dans `fh-skills-en`, et le personnage d'exemple ne
porte **aucun** choix `background`. Donc **`backgroundRef` est absent pour
TOUT LE MONDE** — ce n'est plus « un personnage Araag/Humain sans background »,
c'est **le cas normal**.

**Sonde faite sur la pile réelle** (celle que la page monte), même document,
espèce changée :

| Espèce | `fh:skill-points` | Lignes du détail |
|---|---|---|
| Elfe | 10 | `+12 Class Pool` · `−2 Wizard imposed` |
| **Araag** | **12** | `+12` · `+2 Fast Learner` · `−2 Wizard` |

🔴 **La paire « net zéro » de l'espèce est ABSENTE chez l'Araag**, qui porte
pourtant un `granted_skill_choice`. Et `skillpool-class-tools-unmechanical`
n'est déclaré **pour personne**.

### 1c. Les trois conséquences, par gravité croissante

1. **Aucun nombre n'est faux** — la paire s'annule par construction. ✅ Le lot
   43 avait raison là-dessus, et cette ligne reste vraie.
2. **Le carnet ment par omission, pour tous.** La loi du chantier est *rien ne
   se cache* : un joueur Araag ne voit nulle part que son don d'espèce a été
   compté **puis** dépensé, ni que sa restriction (`Keen Senses` ne tire que
   dans `{survival, delve, vigilance}`) existe.
3. 🔴 **ET LE PLUS GRAVE, que le lot n'a pas nommé : les deux `fail()` qui
   gardent un `granted_skill_choice` malformé sont devenus INATTEIGNABLES.**
   Leur propre commentaire dit *« a grant the engine cannot count is bad
   content, not a grant to skip: dropping only its placement half would leave
   the pool too generous by exactly that count »*. **Un garde qui ne peut plus
   mordre est pire que pas de garde** — c'est une loi de ce mandat.

### 1d. ⚖️ Ce que l'architecte a tranché

**Le bloc de l'ESPÈCE et la déclaration des OUTILS DE CLASSE ne dépendent pas
de l'arrière-plan** — c'est un fait de lecture, pas une opinion : ni l'un ni
l'autre ne lit `backgroundRef`. **Ils sortent donc de dessous le retour
anticipé.**

⛔ **Ne supprime pas le `return`** : ce qui suit immédiatement (les
`skill_ids`, l'outil d'arrière-plan) le lit vraiment et doit continuer d'être
sauté. **Réordonne**, ne raye pas.

⛔ **AUCUN nombre publié ne doit changer.** Si ta correction bouge
`fh:skill-points` d'un seul point pour une seule espèce, **arrête-toi** : c'est
que la paire n'était pas net-zéro, et ça devient une question de règle pour
Eric, pas un lot.

### 1e. Les tests

1. ⚔️ **Un Araag (et un Humain) SANS choix `background` publie bien les DEUX
   lignes de la paire net-zéro**, et son total reste **12**. Doit rougir sur
   le code d'aujourd'hui.
2. **`skillpool-class-tools-unmechanical` est déclaré** pour un personnage
   sans arrière-plan.
3. ⚔️ **Les deux `fail()` de contenu MORDENT à nouveau** : un
   `granted_skill_choice` malformé (scalaire, puis `count: 0`) fait jeter, même
   sans arrière-plan. **C'est le test qui compte le plus** — c'est lui qui
   ressuscite le garde.
4. **Un Elfe (aucun `granted_skill_choice`) est inchangé**, à l'octet.
5. **Aucun total ne bouge** : les quatre espèces mesurées gardent leur valeur
   (Human et Araag **12**, Elf et Loroka **10**).

---

## 2. DETTE B — le même refus, produit à deux endroits

### 2a. La mesure, refaite sur un fichier enfin lisible

```
background.boost-disallowed   -> src/build/decisions.mjs:167
                              -> src/build/block.mjs:468      ← le second
background.ability-key-invalid -> src/build/block.mjs:458      ← un seul
```

Le lot 43 avait raison : `block.mjs` recalcule ces violations
**indépendamment** de `decisions.mjs::backgroundBoostPlan`. Sa déduplication ne
porte que sur la boucle `projectDecisions` de `validate()` — **c'est un
deuxième point d'entrée dans `reported`, pas un doublon au même point.**

### 2b. ⚠️ CE QU'IL FAUT MESURER AVANT DE CORRIGER

**Les arrière-plans SRD sont tous `disable` maintenant.** Alors :

- un arrière-plan peut-il encore être **explicitement choisi** ?
- si oui, les DEUX chemins produisent-ils **vraiment** la violation en double
  aujourd'hui, ou est-ce devenu injoignable ?

⭐ **La mesure fiable est la VIOLATION ELLE-MÊME, pas ses écrivains** : construis
le document, appelle `validate()`, **compte** les violations rendues. C'est la
règle de mesure n°2 du mandat, née d'un `grep` qui annonçait 56 sites là où il
y en avait 77 — et l'architecte vient de la repayer ci-dessus.

**Trois issues possibles, et les trois sont des réponses acceptables** :

| Ce que tu mesures | Ce que tu fais |
|---|---|
| La violation sort **deux fois** | tu dédupliques, avec son test |
| Elle sort **une seule fois** | la dette est **retirée** — écris la mesure qui le prouve |
| Le chemin est **injoignable** (aucun document ne peut plus l'atteindre) | 🔴 alors c'est du **vocabulaire mort** (§0.6), et la question devient : *retire-t-on le bloc ?* → **STOP, question à l'architecte** |

⚠️ **Indice fort pour la troisième issue** : `background.ability-key-invalid`
n'a **qu'un** producteur, dans ce même bloc, et **aucun libellé n'est jamais
rendu** si le bloc est injoignable. Vérifie.

---

## 3. Ce que tu livres

- Commits sur ta branche, **arbre propre**, SHAs, tests **au départ et à
  l'arrivée**.
- `INVENTAIRE-LOT-52.md` : pour la dette A, comment tu as réordonné et la
  preuve qu'aucun total ne bouge · pour la dette B, **la mesure du nombre de
  violations rendues** et laquelle des trois issues elle commande · **ce qui
  t'a surpris** · ce que tu as changé de cette commande.
- ⛔ Aucun `git push`, aucune fusion.

---

⛔ **Toute décision que cette commande ne couvre pas → STOP, question à
l'architecte.**

⭐ **Et tu as le DROIT de la contredire.** C'est un lot — le 43 — qui a déclaré
ces deux dettes sans les corriger, en expliquant pourquoi elles sortaient de
son mandat. **Sans ce geste, ce lot-ci n'existerait pas.** Si l'une des deux ne
tient pas à ta mesure, dis-le : une dette retirée par une mesure vaut autant
qu'une dette payée.
