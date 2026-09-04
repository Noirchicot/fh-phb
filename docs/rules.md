---
title: Rules Reference
hide:
  - toc
---
<!-- 🔴 LES CHEMINS D'IMAGE PORTENT `../`, ET CE N'EST PAS DÉCORATIF.
     Corrigé le 2026-09-04, Eric : « répare les images, qui ne sont plus connectées ».
     ⚠️ MkDocs réécrit les chemins relatifs des images écrites en MARKDOWN, jamais
        ceux d'un `src=` en HTML brut. Ces quatre cartes vivaient sur `index.md`
        (servi à `/`, donc `assets/…` tombait juste) ; le LOT 113 les a déplacées
        ici, sur une page servie à `/rules/` — et `assets/…` y cherchait
        `/rules/assets/…`. Mesuré en ligne avant réparation : HTTP 404 sur les
        quatre, HTTP 200 sur le même fichier à la racine.
     ⛔ Un déplacement de bloc ne déplace pas ce qui rendait ses chemins justes.
        Aucun test n'a rougi : le fichier existait, la page se construisait, le
        lien était simplement résolu ailleurs.
     📌 Si cette page change un jour de profondeur, ces `../` changent avec elle. -->

## Rules Reference { #rules-reference .fh-section-title }

<p class="fh-section-lead">Everything is grouped by the question a player is trying to answer — not by where the rule happens to live.</p>

<div class="grid cards fh-toc fh-rules-grid" markdown>

-   <span class="fh-card-hero"><img src="../assets/img/card-playing.jpg" alt="Build a Character"><span class="fh-card-title">Build a Character</span></span>

    - [**Guided Character Builder**](https://noirchicot.github.io/fhpc/ui/builder/){ .fh-hot data-fh-widget }
    - [1 · Identity](chapters/identity.md)
    - [2 · Species](chapters/species.md)
    - [3 · Inheritance](chapters/inheritance.md)
    - [4 · Destiny](chapters/fates-hand-mechanic.md)
    - [5 · Classes & Subclasses](chapters/classes.md)
        - [Moonkeeper](chapters/moonkeeper.md)
    - [6 · Abilities](chapters/ability-scores.md)
    - [7 · Skills](chapters/skills-and-tools.md)
    - [8 · Equipment](chapters/equipment.md)

-   <span class="fh-card-hero"><img src="../assets/img/card-tools.jpg" alt="At the Table"><span class="fh-card-title">At the Table</span></span>

    - [**Player Companion**](player.md){ .fh-hot }
    - [Leveling up](chapters/leveling-up.md)
    - [Feats](chapters/feats.md)
    - [Trainings](chapters/trainings.md)
    - [Ability Score Roller](dice-roller.md)
    - [Synergies](chapters/skills-synergies.md)
    - [Combat & Battlefield](chapters/battlefield.md)
    - [Exploration](chapters/dungeoneering.md)

-   <span class="fh-card-hero"><img src="../assets/img/card-magic.jpg" alt="Magic and Soulforging"><span class="fh-card-title">Magic &amp; Soulforging</span></span>

    - [Magic](chapters/magic.md)
    - [Spells](chapters/spells.md)
    - [Dark Rituals](chapters/dark-rituals.md)
    - [Crafting](chapters/crafting.md)
    - [Soulforging Rules](chapters/soulforge-crafting.md)
        - [Party Inventory](inventory.md)
        - [Soulforge Workshop](soulforge.md)
    - [Magic Items](chapters/magic-items.md)

-   <span class="fh-card-hero"><img src="../assets/img/card-world.jpg" alt="World"><span class="fh-card-title">World</span></span>

    - [Primordial Forces](chapters/primordial-forces.md)

    *Cosmology · Maps & Places · NPCs & Monsters · Factions & History — to come.*

</div>

<section class="fh-base-layer" aria-labelledby="fh-base-layer-title">
  <p class="fh-base-layer__kicker">THE BASE LAYER</p>
  <h2 id="fh-base-layer-title">The rules Fate's Hand stands on</h2>
  <p>Fate's Hand is played on its own terms — the chapters above are the game, not a list of
  amendments. Below them sits the ground both share: the SRD 5.2.1, with every weapon, spell,
  species, background and monster of the base rules, on its own site, in English and in French.</p>
  <p class="fh-base-layer__aside">Building a character by the base rules alone? That side has
  its own builder. Curious where the two part ways? That belongs on a page of its own.</p>
  <p><a class="fh-base-layer__go" href="https://noirchicot.github.io/fh-srd/" target="_blank" rel="noopener">Open the SRD 5.2.1 ↗</a></p>
</section>
