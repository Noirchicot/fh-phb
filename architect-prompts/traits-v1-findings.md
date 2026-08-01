# Traits V1 — verified data gaps and proposed core hooks

Verified in the package harness at base `cbe9acb` by logging the effective
`ctx.character` received by `fh-panel-traits.js`.

## Data actually available

The effective character exposes identity, species, class/level, proficiency
bonus, abilities, skills, spells (empty in the harness), preparation, saving
throw proficiencies, derived combat fields, Destiny/build data and import
reports. It exposes no structured `traits`, `feats`, `features`,
`classFeatures`, `racialTraits` or limited-use records. The raw level-1 builder
record nested under `character.build` does not add them either.

Traits V1 therefore does not infer features from class/species names and does
not scrape generated rules pages. It is a manual tracker persisted under
`ctx.store("traits")`.

## V1 store contract

```text
{
  version: 1,
  editingId: string,
  items: [{
    id: string,
    name: string,
    details: string,
    maxUses: number,
    remaining: number,
    recharge: "none" | "short" | "long" | "day"
  }]
}
```

The panel supplies local Short Rest, Long Rest and Daily recovery controls.
Long Rest restores both short-rest and long-rest resources; Daily restores only
daily resources. Manual resources can be restored one use at a time.

## Architect decisions / smallest core hooks proposed

1. **Normalized feature source.** Decide which service owns a future
   `ctx.character.features` array and give every record a stable source ID. The
   minimum useful shape is `{id, name, details, maxUses, remaining, recharge,
   source}`. Without stable IDs, automatic imports cannot be reconciled with
   manual edits without duplicates or data loss.
2. **Global rest delegation.** The existing panel contract delegates events
   only from the active panel body. It cannot observe the dock header's rest
   controls. If global rest should recover feature trackers, add an optional
   `panel.onRest(kind, ctx)` hook after the core rest action succeeds. Traits V1
   remains complete without it because its recovery buttons are local and
   explicit.
3. **Daily boundary.** There is no core concept of dawn/day rollover. V1 keeps
   Daily as a manual action. Automating it needs a table-level definition, not a
   browser-clock guess.

No core change is required or included in Traits V1.
