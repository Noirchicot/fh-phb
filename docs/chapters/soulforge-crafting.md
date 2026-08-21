# Soulforge Crafting
*(La Forge des Esprits — système de craft itératif)*

The **Soulforge** presses power into matter, binding monster parts to the soul-stuff of the slain. What it produces is always a **soulforged item**.

Kin to the Moisson and the [Calice de Moisson](magic-items.md#harvest-chalice). Among the Ghost Tribe, **Calendir** keeps a gentler form — his nightly soul-cleansing rite (see Personnages de la Tribu Fantôme).

> [!important] Items evolve — they are never replaced
> A Soulforge item is grown across a campaign — new parts, stronger essence, fresh craft — keeping every power it has while gaining more.

> [!abstract] At a glance — 3 ingredients, 4 phases
> 1. **Knowledge** *(check)* — a **Study** action to locate and recognise its parts.
> 2. **Harvesting** *(check)* — recover the parts within 1d4 minutes of death (1 minute per attempt).
> 3. **Preparation** — craft the structure *(check)*, infuse the gem with essence *(a spell)*, ready the **catalyst** *(no check)*.
> 4. **Soulforging** *(check)* — fuse structure + gem + catalyst with a **Soulforging Tools (CHA)** check → the soulforged item.

---

## Power Budget & Item Equilibrium

Three ingredients make a piece; the fourth phase fuses them. Each ingredient brings its own number, and all three are measured in PP:

| Ingredient | What it is | Its number |
|---|---|---|
| **Structure** | one single harvested body part — bone, hide, scale, horn… — crafted into the item's frame | **Structural Power** — what the frame can hold together |
| **Soulgem** | a catalog gem infused with a slain creature's Essence — the item's fuel cell (max 3 per item) | **Power Supply** — the pooled PP that feeds the catalysts |
| **Catalyst** | the magical property itself, slotted in as is | **Power Consumption** — the PP its power burns |

> **Full price** of a piece = base-item craft *(DMG 2024)* + Soulforge cost + the Soulgem(s).

### The three laws of equilibrium

1. **The frame rules.** The body is built from one Structure ingredient. No ingredient mounted on the item — gem or catalyst — may exceed its **Structural Power**.
2. **Three gems, no more.** The **Power Supply** is the sum of at most 3 **Soulgems**.
3. **Supply covers Consumption.** Total catalyst PP ≤ total Soulgem PP — there must always be enough power to feed every catalyst.

> [!example] A flame sword — legal
> *Structure 4 PP · two 4-PP Soulgems (Supply 8) · one 4-PP fire catalyst (Consumption 4).*
> *Frame ≥ every part ✓ · 2 gems ✓ · 4 ≤ 8 ✓ — and 4 PP of spare Supply left for growth.*

> [!example] The same sword, botched — illegal
> *Structure 2 PP · four 2-PP Soulgems (Supply 8) · one 4-PP fire catalyst (Consumption 4).*
> ***Two laws broken:** four gems (max 3), and a 4-PP catalyst mounted on a 2-PP frame.*

### Power level — one PP scale for everything

Power is measured in **Power Points (PP)**. Tiers are just names on the PP ladder — and the ladder is not linear: a Rare is worth two Uncommons.

| PP | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Tier** | Common | Uncommon | Uncommon+ | Rare | Rare+ | Very Rare | Very Rare+ | Legendary | Legendary+ | Epic | Epic+ |

Named tiers sit on even PP; the "+" half-tiers are the *between-tier* items (odd PP) — see *Growing an item*.

**Essence** is set by the creature's CR — a band of 2 CR per PP (`PP = ⌊(CR−1)/2⌋ + 1`):

| Creature CR | 0–2 | 3–4 | 5–6 | 7–8 | 9–10 | 11–12 | 13–14 | 15–16 | 17–18 | 19–20 | 21–22 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Essence (PP)** | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |

- An ingredient's PP comes from the creature it was harvested from — its CR band above. A CR 9 dragon's scale is a 5-PP Structure; its breath sac carries a catalyst of up to 5 PP.
- *Artifact* / beyond-Epic essence is never rolled from CR — reserve it for unique sources.

> [!note] Souls as essence — tolerated, if the cause is "just"
> In the **Demon Forest**, beasts carry their essence in the gems crusting their bodies — just take the gem. Reaping an **Aberrant** yields essence equal to its **Destiny Score**, and the **Arcana** it awakened to ([The Major Arcana](major-arcana.md)) becomes its own **catalyst** — a blade reaped from a Devil-touched Eluzi bears the Devil's mark. A gem may also be fused into living flesh (see *Body Forging*, below).

---

## The four phases

A piece is made — or grown — in four phases.

### 1 · Knowledge — *what can it give?*

Can you find the right parts on the body? A **Study** action, skill by creature type, DC 12 + CR.

- **Success** tells you what to harvest.
- **Beat the DC by 5+** → skip this roll for the same creature type until your next short rest.
- **Met this creature before** → +2.
- You can spot and identify a **catalyst** part, but only an **_identify_ spell** reveals the power it will bring.

*e.g. a CR 4 Undead → Religion (INT) DC 16.*

| Roll with… | Creature types |
|---|---|
| **Arcana** | Aberrations, Elementals |
| **Religion** | Celestials, Fiends, Undead |
| **Investigation** | Constructs, Monstrosities |
| **Medicine** | Giants, Humanoids, Undead |
| **Nature** | Oozes, Plants, Beasts |
| **History** | Humanoids, Dragons, Fey |

### 2 · Harvesting — *recover the parts*

One window: 1d4 minutes from death. After it closes, the magic fades and nothing more can be taken. *(**[Gentle Repose](spells.md#gentle-repose)** buys one extra attempt beyond the window.)*

**The check** — one salvage attempt = 1 minute of work: a **Hunting** check, DC 12 + CR. Each attempt recovers one part (plus one more per 5 you beat the DC); the creature-type skill (above) gives an **edge**. One failed check and the body yields nothing more — salvage on that creature is over. *(Several kills at once force hard choices: a minute each, and the windows all run down together.)*

**Strike to not kill.** To drop a creature alive and intact, declare a non-lethal blow at 0 HP — it makes no CON save (cf. [Battlefield Rules](battlefield.md)). Unarmed is guaranteed; a weapon works at **disadvantage**. The creature then lies unconscious for an hour, and the 1d4-minute window opens only when harvesting begins.

**The deeper the kill, the worse the salvage** — −1 per HP below 0.

*e.g. Aberration CR 5 at −1 HP → DC 18. Roll 16 + 5 (Hunting) + 2 (Arcana proficiency) = 23, beating it by 5 → a Structure part and the Essence organ.*

### 3 · Preparation — *craft, infuse, ready*

- **Structure → a crafting check.** An artisan crafts the harvested part into the item's body at its DMG 2024 price, adding further materials of value to finish the object (a bone worked into a hilt, then the blade, fittings and leather that complete the weapon).
- **Essence → a spell, no check.** Within one hour of death, hold a gemstone beside the creature's **signature organ** (phase 2) and cast **[Transfer Essence](spells.md#transfer-essence)** *(1st-level)*. The gem becomes a **Soulgem** — one cell of the item's **Power Supply**. *(**Gentle Repose** stretches this to 10 hours.)*
- **Catalyst → no check.** Slotted in as is, carrying its power.

> [!note] Keeping the harvest
> - **Essence** must reach a gem within the hour (Gentle Repose → 10 hours), or it dissipates.
> - **Structure & Catalyst** parts, well harvested, stay viable for one month — recasting **Gentle Repose** every 10 days keeps them viable indefinitely.

**Soulgem** — never homebrewed; use any catalog gemstone whose value meets the tier (values interpolated geometrically along the PP ladder):

| PP | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tier | Com | Unc | Unc+ | Rare | Rare+ | VR | VR+ | Leg | Leg+ | Epic | Epic+ |
| **Min gem** | 50 | 100 | 250 | 500 | 750 | 1k | 2.5k | 5k | 10k | 25k | 50k gp |

*(Beyond-Epic essence needs a unique gem — improvise.)*

### 4 · Soulforging — *complete the item*

One **Soulforging Tools (CHA)** check against the Soulforge DC finishes a piece — far faster than ordinary crafting. DC, time and cost follow the PP of the highest catalyst (`DC ≈ 12 + 2·PP`, cost geometric):

| PP (highest catalyst) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tier | Com | Unc | Unc+ | Rare | Rare+ | VR | VR+ | Leg | Leg+ | Epic | Epic+ |
| **DC** | 13 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 |
| **Time** | hours | 1 day | 2 days | 3 days | 5 days | 1 wk | 2 wk | 1 mo | 6 wk | 2 mo | 3 mo |
| **Forge cost** | 20 | 200 | 650 | 2k | 6.5k | 20k | 65k | 200k | 650k | 2M | 6.5M gp |

> **Before you roll** — check the **[three laws of equilibrium](#the-three-laws-of-equilibrium)**: frame ≥ every part · max 3 gems · Supply ≥ Consumption.

**Who forges.** Soulforging is a **dark ritual**. A lone forger handles the lower tiers; the higher ones call for a circle pooling its levels. Unlike other Dark Rituals it resolves on a single roll: the **Soulforger** who leads the rite makes the check — **Soulforging Tools (CHA)** vs the Soulforge DC.

- The **attunee** is the one the finished item binds to. They lend their level to the pool and may be the **Soulforger** themselves — a forger is free to keep what they make.
- Everyone else in the circle must be at least **Novice** with **Soulforging Tools**. The **attunee** alone may be exempt: they are there to receive the bind, not to work it. If the attunee is not the one rolling and *is* at least Novice, they may **Help** for **advantage**.
- The **Soulsmith** — the forge's owner — may lead the rite, assist it, or stay outside it entirely if the parties agree.

See **[Soulforge an Item](dark-rituals.md#soulforge-an-item)** for the ritual frame (Life cost, casting time).

**Roll modifiers.** Three bonuses stack on top of the Soulforger's own Soulforging Tools bonus:

- **Purity bonus** — all parts from one creature type (e.g. all Undead) → +2 ; all parts from one single creature (e.g. all from one ghoul) → +4 *(does not stack with the +2)*.
- **Static bonus** — Help, Leadership, the assistants' **edge** or anything else the GM rules: **disadvantage** / 0 / +2 / **advantage**.
- **Dice bonus** — up to two dice (Bardic Inspiration, Destiny, other).

**Life cost.** Nd6 necrotic (N = the PP of the highest Soulgem), rolled as one pool once the outcome is known. The **Soulforger** distributes it as they see fit among the assistants and the attunee.

**Success & failure**

- **Success** → the item gains the bound power, keeping all it had.
- **Fail by 5 or more** → everything is lost.
- **Fail by less than 5** → roll on **Mishaps**. You may reroll the Soulforging check once after a Mishap (one second chance per attempt).
- **Beat the DC by 5+** *(or a natural 20)* → also roll on **Boons**.

---

## Soulforge mishaps & boons

> [!danger] Mishaps — *roll d10 on a failed Soulforge check*
> | d10 | The forge turns on you |
> |---|---|
> | 1 | The essence **detonates** — the forger takes 4d10 necrotic and the **essence** is lost. |
> | 2 | A **catalyst is destroyed** — the item finishes without that power. |
> | 3 | The **essence** is wasted (gem spent), but the body survives — re-infuse to try again. |
> | 4 | The item is cursed with a fitting drawback *(GM)* until remade. |
> | 5 | **Volatile bind** — the first use each day forces a **[Chaos](fates-hand-mechanic.md)** roll. |
> | 6 | A **shred of soul lingers** — the item attunes only to a bearer it deems worthy *(GM)*. |
> | 7 | **Overreach** — the forger suffers a **Chaos** effect ([D&D 5+ Fate’s Hand Mechanic](fates-hand-mechanic.md)). |
> | 8 | **Brittle work** — the item breaks on a natural 1, or sheds a charge unbidden. |
> | 9 | The forge **demands double** — pay the forge cost again now, or lose everything. |
> | 10 | **Catastrophe** — item and all components destroyed; each creature within 10 ft makes a DC 15 CON save or takes 6d10 necrotic as the souls burst free. |

> [!success] Boons — *roll d10 when you beat the DC by 5+ (or a natural 20)*
> | d10 | The souls sing true |
> |---|---|
> | 1 | **Efficient bind** — one catalyst consumes 1 less PP on this item. |
> | 2 | **Overcharged** — the item's **Power Supply** gains +1 PP. |
> | 3 | A **catalyst is preserved** — keep one component, unspent. |
> | 4 | **Free attunement** — the item doesn't count against the attunement limit. |
> | 5 | **Arcana's blessing** — a minor flavour power tied to the soul's Major Arcana. |
> | 6 | **Thrifty forge** — half the forge cost is refunded. |
> | 7 | **Self-mending** — the item repairs minor damage over a long rest. |
> | 8 | A **second minor property** emerges for free (within the item's theme). |
> | 9 | **Willing soul** — once/day the item grants a small **[Destiny](fates-hand-mechanic.md)** boon (e.g. reroll a 1). |
> | 10 | **Masterwork** — the item's save DC / attack bonus is +1 above normal. |

---

## Growing an item — *evolve, never replace*

A finished item is never scrapped — it is re-forged to grow. Three facts frame every change:

- **One change = one Soulforging roll** (mishaps apply, as always).
- **The [three laws](#the-three-laws-of-equilibrium) still bind** — frame ≥ every part · max 3 gems · Supply ≥ Consumption.
- **The frame is the ceiling.** An item grows only up to its Structural Power — to push past it, re-frame it first (table below).

**What a change costs — three currencies, every time:**

1. **PP** — the amount in the table below, paid from spare Supply (Supply − current Consumption). Not enough spare? First add a gem (max 3) or upgrade one.
2. **Gold** — half the item's forge cost (the cost line of its highest catalyst), for the ritual itself.
3. **Parts** — any new gem or catalyst is bought or harvested at its own price.

| Change | Rule | PP cost |
|---|---|---|
| **Upgrade a catalyst** | the only thing a catalyst can raise is its number of uses: 1 → 2 → 3 per rest, never at-will — the power itself was fixed by the creature it came from | +1 PP per extra use |
| **Add / remove parts** | mount or pull a Soulgem or a catalyst (new/old gem, new/old catalyst) — all inside the one roll | the new part's PP *(a removal frees its PP)* |
| **Upgrade a Soulgem** | one gem grows +1 PP — possible once per gem, ever | the gem-value step (next line of the gem table) |
| **Re-frame** *(upgrade the Structure)* | replace the one Structure ingredient with a stronger harvested part — the body is re-crafted around the same gems and catalysts, and the ceiling rises with it | none — pay the new part and the body's re-craft *(DMG 2024)* |

- On an add/remove or re-frame, a failure by 5 or more destroys every part being moved in that change — on a re-frame that means the old and new frame parts; the mounted gems and catalysts survive.
- *The forge cannot relearn the same soul, only feed it more* — that is why a catalyst's power never rises, only its uses.

> [!example] Growing, in practice
> - *The flame sword above (Frame 4 · Supply 8 · Consumption 4) has 4 PP to spare. Its owner pays +1 PP and half the forge cost in gold: the fire strike now works twice per rest. Consumption: 5/8.*
> - *Next season, one roll mounts a second **catalyst** — a 3-PP fire ward. Consumption: 8/8, the Supply is full. The frame (4 PP) still caps any single part at 4 PP.*
> - *A hunter's cloak (Frame 6 · one 4-PP gem · Consumption 4) needs one more point: instead of hunting a second gem, the forger upgrades the gem to 5 PP — allowed once per gem — and buys the use with the new spare point.*
> - *An old ring's Feather Fall catalyst is pulled and a Fly catalyst set in its place, all on one roll. Had the roll failed by 5+, both catalysts — the parts being moved — would have burnt.*
> - *The flame sword dreams bigger: a 5-PP storm catalyst — impossible on its 4-PP frame. Its owner harvests a CR 10 wyrm's fang (a 5-PP Structure) and re-frames the blade around it — same gems, same fire catalyst, and the ceiling lifts to 5 PP.*

---

## Attunement & reanimation

- A Soulforge item leaves the forge already attuned to its maker.
- Unattuned, it goes dormant and loses its powers. Reanimating it needs a fresh **Essence** and half the production cost, and always triggers a mishap (roll above).

---

## Body Forging — *fuse a gem into your flesh*

**Body Forging** sets a Soulgem into your own body, so you carry its power as if you wore the soulforged item — at a price in flesh. Anyone can bear one body-forged gem — no feat required.

- **No Structure ingredient.** Your flesh is the frame — the piece is only the Essence gem and its catalyst.
- **Demon-Forest gem only.** It works solely with an essence gem from a **Demon Forest** creature (whose essence is already gem-bound).
- **It costs an attunement slot.** Your first body-forged gem occupies one of your normal attunement slots (1–3). The **[Body Forge Adept](feats.md#body-forge-adept)** feat adds a 4th slot reserved for body forging — a second gem in your flesh.
- **The price is HP.** Fusing the gem lowers your hit-point maximum by 1d4 per item tier (tier 2 = 2d4 … tier 6 = 6d4; a Common gem costs a flat 1). The loss stands while the gem is borne.
- **Extraction** destroys the soulforged item; you recover the full HP after a long rest.
- **Araags** pay nothing — Karagall's kin bear the forge without cost *(they still need the Demon-Forest gem)*.

---

## Appendix — components by creature type

Each creature type gives one signature **Essence** organ (the soul-carrier you infuse), the rest splitting into **Structure** (frame) and **Catalyst** (organs & magical bits). A few typical parts each — not exhaustive:

| Type | **Essence** | Structure *(frame)* | Catalyst *(power)* |
|---|---|---|---|
| **Aberration** | main eye | bone, chitin | brain, tentacle, blood |
| **Beast** | heart | bone, pelt, horn | claws, teeth, poison gland |
| **Celestial** | soul | bone, skin | heart, blood, feathers |
| **Construct** | lifespark | plating, gears | heart, oil, runes |
| **Dragon** | heart | bone, scales | breath sac, claws, blood |
| **Elemental** | elemental core | bone | primordial dust, volatile mote |
| **Fey** | psyche | bone, pelt | tongue, poison gland, hair |
| **Fiend** | soul | horn, skin | heart, claws, dust |
| **Giant** | marrow | bone, skin | heart, blood, tooth |
| **Humanoid** | eye | bone, skin | brain, heart, blood |
| **Monstrosity** | heart | bone, chitin, scales | claws, stinger, tentacle |
| **Ooze** | vesicle | membrane | acid, mucus |
| **Plant** | sap | bark, roots | spores, seeds, poison gland |
| **Undead** | undying heart | bone, undying flesh | marrow, ethereal ichor, teeth |

- The **signature organ** is the part you infuse (phase 3). Fail to recover it and that kill yields no essence.
- A **Celestial or Fiend** slain off its home plane (and outside a *magic circle*) collapses to a pouch of dust — no soul, no essence.
- **Ingredient inventory** (210 entries — 14 types × {Essence · Structure · Catalyst} × 5 tiers; Soulgems are catalog gems by value, not homebrew): [Soulforge Crafting](soulforge-crafting.md).

---

<nav class="fh-layer fh-layer--own">
<p><strong>Entirely Fate’s Hand.</strong> The SRD says nothing about this subject — every rule on this page is Eric's.</p>
</nav>