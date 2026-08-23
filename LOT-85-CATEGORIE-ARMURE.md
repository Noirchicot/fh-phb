# Lot 85 — la catégorie d'armure existe dans le SRD, arrête de l'enjamber

**En clair :** le SRD imprime `Light Armor`, `Medium Armor`, `Heavy Armor`, `Shield` en tête
de leurs blocs de table. Le parser d'armure les franchit et les jette. Ce lot les garde, et
chaque record d'armure ressort avec sa catégorie.

- **Dépôt :** `~/tools/fh-srd` · **branche `85-categorie-armure`**, worktree déjà créé à
  `~/tools/fh-srd-worktrees/85-categorie-armure` (base `8db1a22`).
- ⛔ **Ne travaille jamais sur `main`, ne pousse rien.** Tu commites sur ta branche ;
  l'architecte fusionne, Eric pousse.

---

## 1. La mesure qui commande ce lot

Trouvée par le siège VERSATILITY le 2026-08-23, **revérifiée depuis le siège d'architecte**.

`src/parse_armor_en.py:71` porte son propre aveu, mot pour mot :

> *« The table's own category label ("Light Armor (1 Minute to Don or Doff)"), which reaches
> this parser in its printed position since the two-column extraction was repaired. **Stepped
> over, never counted as a row**; if it is not one, the table has ended. »*

Et le PDF anglais, page 92 :

```
"Light Armor (1 Minute to Don or Doff)"    suivie de   Padded Armor
"Medium Armor (5 Minutes to Don…)"         suivie de   Hide Armor
"Heavy Armor (10 Minutes to Don…)"         suivie de   Ring Mail
"Shield (Utilize Action to Don or Doff)"   suivie de   Shield
```

⭐ **Ce n'est donc pas une taxonomie à inventer, c'est une étiquette à cesser de jeter.**
La donnée arrive au parser, à sa place imprimée, et on la franchit.

---

## 2. Le patron existe — ne réinvente rien

Le **lot 19** a fait exactement ce geste pour les propriétés d'arme. Lis-le avant de coder :

| | |
|---|---|
| `src/weapon_sections.py` | le lot 19, le geste de référence |
| `src/table_sections.py` → `skip_subheading` | la fonction qui enjambe aujourd'hui |
| `src/parse_armor_en.py:35, 76` | l'appel anglais |
| `src/parse_armor_fr.py:33, 74` | **l'appel français — il fait la même chose, traite les deux** |
| `src/parse_weapons_en.py:27, 133` · `src/parse_weapons_fr.py:15, 152` | les quatre autres appelants, à ne PAS casser |

⚠️ **`skip_subheading` a cinq appelants.** Si tu la changes, tu changes les armes aussi.
Préfère **lire l'étiquette au passage** plutôt que modifier le contrat de la fonction pour
tout le monde — et si tu juges que le contrat doit changer, dis-le et montre les cinq.

---

## 3. Ce que tu rends comme donnée

Un champ de catégorie sur chaque record d'armure, **dans les deux langues**, avec une **clef
stable en anglais** et non la prose imprimée.

```
armor_category : "light" | "medium" | "heavy" | "shield"
```

⛔ **La clef ne porte PAS le temps d'enfilage.** L'étiquette imprimée dit
`Light Armor (1 Minute to Don or Doff)` — le temps est une autre donnée, et il n'a rien à
faire dans une clef de catégorie. Si tu le gardes, garde-le **à côté**, dans son propre champ,
et dis-le.

📌 **Cohérence avec ce qui existe** : `weapon` porte déjà `weapon_category` avec des valeurs
en minuscules (`martial`, `simple`). Prends la même forme. ⛔ Et **pas** de valeur française
côté FR : la décision de la route versatilité (lot 83) est un seul jeu de clefs en anglais, le
français en **libellés** par-dessus.

### Le résultat attendu, et c'est ta vérification

Les 13 armures du SRD 5.2.1 se répartissent ainsi :

| catégorie | n | lesquelles |
|---|---|---|
| `light` | 3 | Padded Armor · Leather Armor · Studded Leather Armor |
| `medium` | 5 | Hide Armor · Chain Shirt · Scale Mail · Breastplate · Half Plate Armor |
| `heavy` | 4 | Ring Mail · Chain Mail · Splint Armor · Plate Armor |
| `shield` | 1 | Shield |
| | **13** | |

⚠️ **Ce tableau est une ATTENTE, pas une source.** Il vient de la connaissance du SRD, pas
d'une mesure. **C'est le PDF qui fait foi** : si ton extraction donne autre chose, c'est ce
tableau qui a tort, et tu le dis. Ce qui n'est pas négociable, c'est le total — **13 records
en anglais, 13 en français, aucun perdu, aucun ajouté**.

🔴 **Le vrai garde, celui qui mord** : `13 → 13`. Un parser qui « enjambe » mal ne perd pas une
étiquette, il perd ou fabrique une **ligne**. Compte avant, compte après.

---

## 4. La dette de documentation, à payer au passage

Le **docstring** de `parse_armor_en.py` dit encore que les étiquettes de catégorie sont
« déplacées en fin de page ». **C'est périmé** : la réparation de l'extraction à deux colonnes
est passée après, et les étiquettes arrivent maintenant à leur place imprimée — c'est le
commentaire de la ligne 71 qui est à jour.

➡️ **Deux versions de la vérité dans le même fichier.** Tu y touches, tu corriges le docstring.

---

## 5. Ce que ce lot ne fait pas

| | |
|---|---|
| ⛔ `gear` | **rien à récupérer** : la table Adventuring Gear (p. 95-96) est plate — `Item / Weight / Cost`, 82 lignes, aucune sous-section. `parse_gear_en.py` n'appelle même pas `skip_subheading`. Une catégorie de matériel demande un **import externe**, c'est un autre chantier |
| ⛔ les 10 records de l'extraction | les 5 objets magiques avalés + leurs 5 porteurs pollués — **lot séparé**, décision d'Eric en cours |
| ⛔ les champs typés | `cost`, `weight`, `rarity`, `properties[]` restent de la prose. C'est l'étape 3 de la route versatilité, pas ce lot |
| ⛔ toucher au contrat de `skip_subheading` | sauf si tu montres les cinq appelants et l'argument (§2) |

---

## 6. Pourquoi ce lot existe, pour que tu saches ce qu'il débloque

L'écran Équipement de FHPC (lot 84) devient un **tambour à deux étages** : on choisit un rayon,
puis une étagère, puis un objet. Aujourd'hui `armor` n'a **pas d'étagère** — les 13 armures
tomberaient dans un seul tas. Avec ta catégorie, elles se rangent en quatre.

📌 Tu n'as rien à savoir de FHPC pour faire ce lot. C'est dit pour que tu comprennes pourquoi
la **clef stable** compte plus que le libellé : c'est elle qu'un écran lit.

---

## 7. Ce que tu rends

- l'inventaire au format du chantier : ce qui marche, ce qui reste, **ce que tu as refusé de
  faire et pourquoi** ;
- **les suites vertes, rejouées dans un CLONE INDÉPENDANT.** ⚠️ Piège connu et payé :
  `sources/pdf` est ignoré par git, donc absent d'un clone frais — le build refuse en
  `SOURCE REFUSED` tant qu'on n'a pas reposé le lien symbolique ;
- le compte **13 → 13**, dans les deux langues, dit explicitement ;
- le docstring corrigé (§4) ;
- toute contradiction entre ce document et ce que tu mesures : **ta mesure gagne**, dis-le.
