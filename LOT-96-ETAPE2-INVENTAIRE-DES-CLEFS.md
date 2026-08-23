# Lot 96 — étape 2, temps 1 : l'inventaire des embranchements et la table de jointure

**En clair :** la couche française n'est pas une traduction, c'est un **embranchement** —
identifiants traduits, valeurs de clef traduites, nombres convertis. Avant de migrer quoi que
ce soit, on mesure **où** ça diverge et **par quel signal** les deux côtés se rejoignent.

⛔ **CE LOT NE MIGRE RIEN. Il mesure, et il propose.** Aucun export ne change, aucun parser
n'est touché. Son rendu est un document et une table.

- **Dépôt :** `~/tools/fh-srd`, en **lecture seule** pour la donnée · **branche `96-inventaire-clefs`**.
- ⛔ Jamais sur `main`, jamais de `git push`.

---

## 1. Ce que la route a ratifié le 22/08, et qui ne se rediscute pas

> **Un seul jeu de records, clefs et identifiants en anglais ; le français par-dessus, en
> libellés seulement.** `srd:weapon:en:longsword` s'affiche « épée longue », le poids reste
> `3 lb.`, l'écran rend des kilos s'il veut. **Un objet, une adresse, deux mots.**

⭐ C'est la **loi §0.13** du dépôt, déjà citée à huit endroits dans les contrats : *le moteur
produit des identifiants, l'interface produit des mots.*

---

## 2. 🔴 LA MÉTHODE, ET ELLE EST DE TOI

Tu l'as écrite ce soir, elle commande ce lot :

> **Pour chaque famille de clefs, cherche d'abord s'il existe un signal qui n'a rien à
> déclarer. Ne déclare une table à la main qu'en dernier recours — et alors fais-la vérifier
> par autre chose.**

Tes deux preuves : `property_list`, dont la moitié écrite à la main a été **confirmée par une
couche qui ne l'avait pas lue** (9 accords sur 9) ; et `item-value`, **zéro déclaration**, les
nombres joignant les deux catalogues tout seuls.

**Ton pronostic, à vérifier ou à démentir :**

| famille | ton pronostic |
|---|---|
| `damage_type_key` — 3 valeurs, portées par 38 armes **déjà appariées** | probablement **aucune déclaration** |
| les **82 objets courants**, zéro identifiant commun | probablement **la déclaration** |

---

## 3. Ce que tu mesures — les 2 658 records, pas seulement l'équipement

1. **Toutes les familles qui divergent.** Le point de départ mesuré : `damage_type_key`
   (`slashing` ↔ `perforant`), `weapon_proficiency_ids` (38 · 38, **zéro commun**), et les
   **identifiants de records eux-mêmes** (`srd:gear:fr:acide` face à `srd:gear:en:acid`).
   ⚠️ `class.skill_ids` rend **0 des deux côtés** — ⛔ *une absence n'est jamais une réponse* :
   dis si la clef manque, ou si elle existe et ne porte rien.
2. **Pour chaque famille, le signal de jointure**, dans cet ordre : ① un nombre ou une empreinte
   qui joint sans rien déclarer · ② un record déjà apparié qui porte la valeur · ③ en dernier
   recours, une table à la main — **et alors, par quoi la faire vérifier**.
4. **Ce qui casse si on migre.** Qui lit ces identifiants aujourd'hui : le site public, les
   couches de `fhpc`, les personnages d'exemple. **Nomme les sites d'appel, compte-les.**

---

## 4. Ce que tu rends

- **la table de jointure FR↔EN**, avec pour chaque famille : le signal utilisé, et **combien
  d'accords sur combien** ;
- **la liste de ce qui n'a AUCUN signal** — c'est là que la migration coûtera ;
- **ce qui casse**, avec le compte des sites d'appel ;
- **une proposition de découpage en temps** pour la migration, avec ce que chacun prouve ;
- ⏳ **la question ouverte que tu dois poser à Eric, pas trancher** : que devient un identifiant
  français **déjà écrit quelque part** (un personnage sauvegardé, une URL du site public) ?
- toute contradiction entre ce document et ta mesure : **ta mesure gagne, dis-le.**

📌 Écris le document dans le vault : `FH-WEB/FHPC/FHPCv2 etape2 inventaire des clefs.md`.
⛔ Écris-le **localement** — jamais par un MCP distant. Et **ne le commite pas à la main** :
le plugin Obsidian Git s'en charge.
