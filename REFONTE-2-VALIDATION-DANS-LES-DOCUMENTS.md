# REFONTE 2 — « la validation descend dans les documents »

> **Dicté par Eric le 2026-08-15**, après une matinée à utiliser le builder
> déployé sur son iPad. Ce document capture sa dictée **telle quelle**, sépare
> ce qu'il a dit de ce que j'en infère, et nomme ce qui reste ouvert.
>
> ⚠️ **CE N'EST PAS UNE LISTE DE CORRECTIONS.** C'est une **seconde refonte** :
> elle supprime la ligne de commande fixe, qui était un invariant ratifié
> (`§N`, `B0.7`–`B0.12`, `B0.21a`), et elle touche sept écrans sur dix.
> ⛔ **Aucun lot ne doit partir sur ce document tant que les questions de la
> dernière section n'ont pas de réponse** — trois d'entre elles changent la
> forme du travail, pas son détail.

---

## 1. LE DÉFAUT DE FOND — la hauteur, encore

> ***« Le valide et show plan posent problème, ils prennent trop de place sur
> la hauteur. Show plan inutile. »***

C'est le **troisième signalement de hauteur** de la séance *(après les 27 % de
bandeaux fixes sur Compétences, et les 130 px du barillet — acceptés, eux)*.
La ligne de commande coûte **45 px sur tous les écrans, tout le temps**.

### 1a. `Show plan` disparaît

> ***« Show plan disparaît — le review est un show plan. »***

⭐ **Et il a raison sur le fond, pas seulement sur la place** : depuis le
lot 65, Review **est** un état d'avancement lu au carnet — une ligne par
étape, « fait / pas fait ». Le panneau `Show plan` montre le même carnet, plus
brut. **Deux organes pour une seule vérité.**

**Décision : le panneau et son bouton disparaissent. Review le remplace.**

### 1b. `Validate` descend dans les documents

> ***« Je pense qu'il faudra mettre un bouton validate dans les documents. »***

Le bouton quitte la barre fixe et va **dans le contenu de chaque écran**, à
l'endroit où le geste se termine. Écran par écran, ci-dessous.

⚠️ **CE QUE ÇA COÛTE, ET IL FAUT LE DIRE** : `Validate` fixe était **toujours
atteignable sans remonter** — c'était l'argument d'Eric lui-même pour y mettre
`Reset` (B7.8). Dans un document qui défile, un `Validate` en bas d'un écran de
4 300 px *(Compétences)* se cherche. **Question 4, plus bas.**

---

## 2. LA CEINTURE GAGNE DEUX BOUTS

> ***« Dans le carrousel : il faut un retour menu, on le met tout à gauche. Si
> on appuie, popup "vous sortez du builder, voulez-vous sauvegarder votre
> perso ?" Et tout à droite "Expert", pour faire monter le perso dans les
> niveaux. Ou tweaker. »***

| Bout | Ce qu'il fait |
|---|---|
| **Tout à gauche** | **Retour menu** — quitte le builder. Popup : *« Vous sortez du builder. Voulez-vous sauvegarder votre personnage ? »* |
| **Tout à droite** | **Expert** — monter le personnage en niveaux, ou le **tweaker** |

🔴 **DEUX CHANTIERS SE CACHENT LÀ-DEDANS, et ce ne sont pas des boutons :**

- **« Retour menu » suppose un MENU**, et il n'existe pas. Le builder est
  aujourd'hui la racine : il n'y a nulle part où retourner.
- **« Sauvegarder » suppose un ENDROIT OÙ SAUVER**, et il n'y en a pas — loi
  §0.9, aucun serveur à maintenir. Aujourd'hui la seule sortie est
  `Export JSON` (lot 67). Le popup poserait donc une question dont la réponse
  « oui » n'a pas d'implémentation.
- **« Expert »** est le `mode expert` de `B9.5`… ou autre chose. En B9.5 il
  vivait **dans Review** ; ici il est **dans la ceinture**, et il **monte le
  personnage en niveaux** — ce que le builder ne sait pas faire (il construit
  un niveau 1). **Ce n'est pas le même objet.** Question 2.

---

## 3. ÉCRAN PAR ÉCRAN — la dictée

### 3a. Concept → **Biography**

> ***« Dans concept, qui doit devenir biography : validate ou autre chose mais
> plus petit. »***

- Le renommage **`Concept` → `Biography`** est dicté. *(⚠️ Il diffère de
  `Identity`, envisagé le 2026-08-14 et bloqué parce que `resolved.identity`
  existe déjà dans `fh-char/1`. **`Biography` n'a pas cette collision** — le
  blocage tombe.)*
- Sa validation : **« plus petit »**. Pas un bouton pleine largeur.

### 3b. Abilities

> ***« Abilities : bouton en bas. »***

Simple et net : le `Validate` de l'écran vit **sous les six barillets**.

### 3c. Species — 🔴 le changement de forme le plus profond

> ***« Le mot Halfling devient un bouton, qui permet de faire les choix.
> Incluant les lineages. On utilise les menus déroulants pour les choix de
> skills. »***

**Le nom du record devient la porte.** On n'a plus douze fiches à faire
défiler pour choisir : on lit **une** fiche, et on touche son **titre** pour
changer d'espèce ou régler ses choix — **lignages compris**.

⚠️ **Ça retire au défilement son rôle de sélecteur** — invariant `II.1`,
*« le défilement est le choix »*, et tout le catalogue des lots 58/60 est bâti
dessus. **Question 1.**

⭐ **Et le lignage rentre enfin quelque part** : il traînait en `unconsumed`
depuis toujours *(`species.lineage`, visible sur ton Review)*.

**La forme cible, telle qu'Eric l'a écrite** *(ses valeurs sont celles d'un
Goliath — c'est la MISE EN PAGE qu'il montre, pas une fiche de Halfling)* :

```
Size          Medium (about 7–8 feet tall)
Speed         35 feet
Creature type Humanoid
Destiny       2
Traits        Giant Ancestry, Large Form, Powerful Build
Lineages      …
```

> ***« Ça laissera probablement du vide et une place pour une image. »***

📌 Et **ça rejoint le trou nommé le 2026-08-14** : *« l'ambiance et les images
de classe n'existent pas dans les données »*. La place est prévue ; le contenu
reste à produire.

### 3d. Class — **idem Species**

> ***« Classes, on fait idem species : le mot Fighter devient un bouton, qui
> permet de rentrer dans le choix classes. On utilise les menus déroulants
> pour les choix de skills. Faut aussi réécrire le texte de manière jolie et
> compacte. »***

Même geste, plus une exigence de **rédaction** : le texte des fiches de classe
doit être **réécrit, joli et compact**. ⚠️ C'est du **contenu**, pas de la mise
en page — et le SRD n'en fournit pas *(mesuré : `data.description` est de la
comptabilité de multiclassage)*.

### 3e. Inheritance

> ***« La validation est dans les boosts. La validation est dans chacun des
> feats. »***

**Deux validations, une par panneau** — au lieu d'un `Validate` d'écran à deux
paliers. Cohérent avec `B4.2` : ouvrir un panneau fait disparaître l'autre,
donc chacun se referme sur sa propre validation.

### 3f. Destiny

> ***« Fin de menu : Draw again, Choose yourself, This is my calling
> (= validation). Tout sur une ligne. »***

Les trois gestes **sur une seule ligne**, en bas. ⭐ **`This is my calling` est
le `Validate` de l'écran** — nommé dans la langue de la scène plutôt que dans
celle du formulaire. *(Et ça règle au passage le `Validate` fixe de cet
écran.)*

### 3g. Equipment

> ***« On voit après. »*** — hors périmètre, explicitement.

---

## 4. 🔴 CE QUI DOIT ÊTRE TRANCHÉ AVANT QU'UN LOT PARTE

Ces quatre-là **changent la forme du travail**, pas son détail. Avancer sous
hypothèse produirait du travail à jeter.

| # | La question | Pourquoi elle bloque |
|---|---|---|
| **1** | **Le défilement reste-t-il le choix ?** Si le titre ouvre les choix, les douze fiches à faire défiler n'ont plus de rôle de sélecteur. Le catalogue partagé (lots 58/60, Class + Species) est bâti sur `II.1` | C'est **l'invariant fondateur** de la refonte 1. Le retirer est légitime — mais c'est un renversement, pas un ajustement |
| **2** | **« Expert » : c'est quoi, exactement ?** Monter en niveaux et tweaker, c'est **un autre produit** que construire un niveau 1 — le moteur ne sait pas monter un personnage | Ça peut être un chantier de plusieurs lots, ou un bouton vers l'export. Pas la même chose |
| **3** | **« Sauvegarder » sauve où ?** Il n'y a **aucun serveur** (§0.9). Aujourd'hui la seule sortie est `Export JSON` | Un popup qui demande « voulez-vous sauvegarder ? » sans endroit où sauver est un faux magasin |
| **4** | **Un `Validate` en bas d'un écran de 4 300 px se cherche.** Sur Compétences, il serait à quatre écrans de défilement | Ton propre argument pour `Reset` en B7.8 : *« il reste toujours atteignable, sans remonter »* |

## 5. Ce que je ferais si je devais découper — proposition, non ratifiée

1. **Supprimer `Show plan`** — décidé, sans dépendance, gain immédiat de
   hauteur. *(Un lot court.)*
2. **Destiny** et **Inheritance** — leurs validations sont locales et
   n'engagent aucun invariant.
3. **Biography** — le renommage et sa petite validation.
4. **Abilities** — bouton en bas, une fois le barillet tranché.
5. ⛔ **Species et Class** — **seulement après la réponse à la question 1**.
6. ⛔ **Les deux bouts de la ceinture** — après les questions 2 et 3.
