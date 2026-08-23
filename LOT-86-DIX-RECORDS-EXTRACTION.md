# Lot 86 — cinq objets magiques ont été avalés par leur voisin

**En clair :** cinq armes magiques anglaises n'existent pas, et leur texte est collé à la fin
de l'objet qui les précède dans le livre. Dix records sont donc faux : cinq absents, cinq qui
portent la prose d'un autre. Le français, lui, a réussi les cinq — c'est ton témoin.

- **Dépôt :** `~/tools/fh-srd` · **branche `86-dix-records-extraction`**, worktree déjà créé.
- ⛔ **Ne travaille jamais sur `main`, ne pousse rien.** Tu commites sur ta branche ;
  l'architecte fusionne, Eric pousse.

---

## 1. La mesure — dix records, pas cinq

Comptée sur `layers/srd-5.2.1-en.layer.json` depuis le siège d'architecte, le 2026-08-23.
Chaque colonne est un nombre de caractères de `description` :

| porteur anglais | total | à lui | **volé** | objet avalé |
|---|---:|---:|---:|---|
| Dagger of Venom | 1437 | 436 | **1001** | Dancing Sword |
| Folding Boat | 1449 | 883 | **566** | Frost Brand |
| Lantern of Revealing | 1120 | 357 | **763** | Luck Blade |
| Sun Blade | 1313 | 930 | **383** | Sword of Life Stealing |
| Sword of Sharpness | 710 | 279 | **431** | Sword of Wounding |

⭐ **Chaque avalé est celui qui SUIT son porteur dans l'ordre alphabétique.** Ce n'est pas cinq
accidents : c'est **un seul défaut**, un détecteur de titre qui a raté cinq frontières.

La couture se voit à l'œil nu. `Dagger of Venom` finit sur *« …until the next dawn. »* puis
enchaîne sans rupture sur :

```
Dancing Sword Weapon (Greatsword, Longsword, Rapier, Scimitar, or Shortsword),
Very Rare (Requires Attunement)
```

C'est **exactement la forme d'un titre d'objet magique** — nom, type, rareté, harmonisation.
Le détecteur devrait la voir. Comprends **pourquoi il ne la voit pas sur ces cinq-là et sur
personne d'autre** avant d'écrire une ligne : un correctif qui ne sait pas ce qu'il corrige
attrapera les cinq et en cassera d'autres.

📌 Les deux fichiers concernés : `src/parse_items_en.py` et `src/parse_items_fr.py`. **Le
français réussit** — commence par comprendre ce qu'il fait de différent, c'est peut-être toute
la réponse.

---

## 2. ⛔ CE QU'IL NE FAUT SURTOUT PAS FAIRE

**Ne crée pas les cinq records à la main.** Trois raisons, dans l'ordre de gravité :

1. **Ça ne répare que la moitié du dégât.** Les cinq porteurs resteraient pollués. Un joueur
   qui lit *Dagger of Venom* recevrait toujours l'entrée entière de *Dancing Sword* collée
   derrière.
2. **Tu recopierais un texte qui existe déjà**, mot pour mot, dans une source CC-BY qui doit
   rester fidèle. Une recopie diverge ; une extraction, non.
3. **Un record écrit à la main meurt à la prochaine extraction** — écrasé, ou doublé.

⛔ **Et ne devine rien depuis les noms.** Le défaut est une frontière ratée, pas un contenu
manquant.

---

## 3. Ta vérification, et elle tient en trois chiffres

```
1.  item anglais         253  →  258        (le français en a 258 : c'est la cible)
2.  les cinq porteurs    reviennent à leur longueur propre :
      Dagger of Venom 1437 → 436 · Folding Boat 1449 → 883
      Lantern of Revealing 1120 → 357 · Sun Blade 1313 → 930
      Sword of Sharpness 710 → 279
3.  aucun autre record ne change de longueur   ← le garde qui compte vraiment
```

🔴 **Le troisième est le seul qui protège contre un correctif trop large.** Un détecteur de
titre plus permissif coupera d'autres objets en deux sans rien faire rougir. **Prends
l'empreinte des 253 descriptions AVANT, compare APRÈS : exactement 5 doivent avoir changé.**

⚠️ **Et le français n'est pas exempt de la vérif** : s'il passe de 258 à autre chose, ton
correctif l'a cassé. `258 → 258`.

---

## 4. Ce que le dépôt sait déjà de ce défaut — ne le redécouvre pas

| | |
|---|---|
| `src/correspond.py:630` | la garde `POLLUTED_BY_EXTRACTION` — elle **refuse** d'apparier un record pollué |
| `tests/test_correspond.py:545` | `acceptance_item_orphans_are_the_parser_bug` — il assert la signature entière des dix |

🔴 **CE TEST VA CASSER, ET C'EST SON RÔLE.** Il décrit le bug ; quand le bug meurt, il ment.
**Ne le désarme pas, réécris-le à la nouvelle vérité** — que les dix records sont sains, et
que les cinq paires FR↔EN se font. Un garde qu'on désactive au lieu de le corriger est un
garde perdu.

📌 Et la garde `POLLUTED_BY_EXTRACTION` devient vide de sens : dis dans ton inventaire si elle
doit disparaître ou rester en filet pour un futur défaut du même genre. **Ne tranche pas seul
si tu hésites** — c'est une question pour l'architecte.

### Une erreur humaine que ce défaut a déjà causée

Eric a signé de bonne foi `Sword of Sharpness` → *Épée mordante*. **C'est faux** : *Épée
mordante* est *Sword of Wounding*. Il lisait la fin du record pollué. La garde a refusé la
signature. ⭐ **Ce défaut ne piège pas qu'une machine** — c'est l'argument qui justifie ce lot.

---

## 5. Ce que ce lot ne fait pas

| | |
|---|---|
| ⛔ la catégorie d'armure | c'est le lot 85, autre branche, autres fichiers |
| ⛔ les prix et les poids | c'est le lot 87 — il ajoute de la donnée, toi tu répares une extraction |
| ⛔ les champs typés | `cost`, `weight`, `rarity` restent de la prose ici |

---

## 6. Ce que tu rends

- l'inventaire au format du chantier : ce qui marche, ce qui reste, **ce que tu as refusé de
  faire et pourquoi** ;
- **les trois chiffres du §3**, dits explicitement ;
- **la cause nommée** : pourquoi ces cinq frontières et pas les autres. Si tu ne sais pas, dis
  que tu ne sais pas — un correctif sans cause est un correctif qui reviendra ;
- le test des orphelins **réécrit**, pas désarmé ;
- les suites vertes dans un **clone indépendant**. ⚠️ Piège connu : `sources/pdf` est ignoré
  par git, donc absent d'un clone frais — le build refuse en `SOURCE REFUSED` tant qu'on n'a
  pas reposé le lien symbolique ;
- toute contradiction entre ce document et ce que tu mesures : **ta mesure gagne**, dis-le.
