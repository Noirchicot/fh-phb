# Fate's Hand Worker — DM Control API

This is the backend contract expected by `docs/gm.html`. The current static site
can still list/download existing builds and add loot without these routes, but
campaign CRUD and first-time D&D Beyond imports require this Worker update.

## Authentication and access

- Every `/admin/*` request requires `Authorization: Bearer <GM_TOKEN>`.
- Compare the token in constant time with a Worker secret; never put it in KV,
  HTML, logs or API responses.
- Return JSON errors: `{ "error": "message" }`.
- Campaign join codes use `^[A-Z0-9-]{2,24}$` and are canonicalized uppercase.
- Public `/party/:code`, `/profile/:code/*` and `/inv/:code` routes must return
  `403 {"error":"unknown campaign code"}` if the campaign does not exist.
- Apply per-IP rate limits to public lookups and stricter rate limits to DDB
  pulls. A join code is a lightweight table-access key, not strong secrecy.

## KV records

Suggested keys (adapt to the Worker's existing naming scheme):

```text
campaign:{CODE}                  -> { code, name, createdAt, updatedAt }
build:{CODE}:{PSEUDO}            -> existing Fate's Hand build record
profile:{CODE}:{PSEUDO}          -> existing player profile / DDB snapshot
inv:{CODE}                       -> campaign inventory array (schema v2 items)
campaign-index                   -> ["FH1", "FH2"]
```

Deletion must cascade through the campaign's builds, profiles and inventory.
Use paginated KV listing; do not assume one page contains every key.

## Routes

### `GET /admin/campaigns`

Response:

```json
{
  "campaigns": [
    { "code": "FH1", "name": "The Crimson Shroud", "characters": 4,
      "createdAt": "2026-07-19T20:00:00.000Z" }
  ]
}
```

### `POST /admin/campaigns`

Body: `{ "code": "FH1", "name": "The Crimson Shroud" }`.

- `201` with `{ "campaign": { ... } }` on creation.
- `409` if the code already exists.

### `DELETE /admin/campaigns/:code`

Delete the campaign and all campaign-scoped builds, profiles and inventory.
Return `{ "ok": true, "deleted": { "characters": 4 } }`.

### `POST /admin/campaigns/:code/characters/import`

Body:

```json
{
  "shareUrl": "https://www.dndbeyond.com/characters/123456789",
  "pseudo": "optional player-name override"
}
```

Required behavior:

1. Reject an unknown campaign with 404.
2. Accept only HTTPS and the exact hosts `dndbeyond.com` or
   `www.dndbeyond.com` with a path matching `/characters/<numeric-id>`.
   Rebuild the canonical URL from that numeric ID; do not follow an arbitrary
   user-supplied URL (SSRF protection).
3. Reuse the Worker's existing DDB pull/parser used by
   `POST /profile/:campaign/:pseudo/pull`.
4. Create a minimal Fate's Hand build for the character. The player sheet will
   supply all 26 untrained FH skills by default, so do not require the player
   builder. Preserve any already-known native skill/tool tiers if available.
5. Create/update a profile containing `ddbLinked: true`, the canonical numeric
   link/ID and the parsed snapshot.
6. Choose a unique pseudo from the override or DDB character name. On a name
   collision, return `409` unless the request explicitly opts into replacement.

### One parser for every character

Initial DM import, player `pull`, DM resync and later resyncs must all call the
same character-agnostic parser. Never branch on a character name, campaign,
URL or array position. D&D Beyond ordering is not stable and must not be used
to identify a skill, tool, ability or defense.

Persist a normalized `profile.snapshot` with at least this contract:

```json
{
  "schemaVersion": 2,
  "characterId": "123456789",
  "name": "Pell",
  "species": "Human",
  "avatarUrl": "https://...",
  "level": 6,
  "classes": [{ "name": "Rogue", "level": 6 }],
  "abilityScores": { "STR": 8, "DEX": 16, "CON": 12,
    "INT": 16, "WIS": 10, "CHA": 14 },
  "armorClass": 15,
  "walkingSpeed": 30,
  "savingThrowProficiencies": ["DEX", "INT"],
  "skills": [{ "name": "Arcana", "ability": "INT",
    "tier": "proficient" }],
  "tools": [{ "name": "Thieves'", "ability": "DEX",
    "tier": "proficient" }],
  "spells": [{ "name": "Guidance", "level": 0 }],
  "syncedAt": "2026-07-20T12:00:00.000Z"
}
```

Requirements:

- Compute/extract AC for every sheet rather than omitting it when the source
  uses a different defense node. Return `null` only when the source genuinely
  contains no computable AC.
- Match skills and tools by stable identifier/name, never by array index.
- Emit only the 26 canonical Fate's Hand skill names. An unknown DDB label must
  never create an additional skill row.
- Emit a tool only when it comes from an explicit skill/tool proficiency or a
  proficiency/expertise modifier. Never infer proficiency from inventory,
  equipment, an item name or a mere ability-check bonus.
- Normalize curly apostrophes, optional `Tool - ` prefixes and optional
  `Tool`/`Tools` suffixes before tool lookup.
- Translate official DDB labels to the closed Fate's Hand tool taxonomy. This
  includes supplies/utensils (`Cook's Utensils` -> `Cook's`), gaming sets
  (`Playing Card Set` -> `Card Set`) and individual instruments (`Lute` ->
  `Instrument (Strings)`, `Flute` -> `Instrument (Wind)`, `Drum` ->
  `Instrument (Other)`). Keep the alias table character-agnostic.
- Put recognized and rejected proficiency labels in an `importReport` rather
  than silently inventing names. Suggested shape:

  ```json
  {
    "importedTools": [{"name":"Smith's","source":"DDB modifier"}],
    "unmappedSkills": [],
    "unmappedTools": [{"name":"Unknown Kit","source":"DDB tools"}]
  }
  ```

  Rejected entries stay visible to diagnostics but must not enter the active
  character sheet.
- Treat proficiency and expertise as semantic tiers. Do not assume that a
  numeric value means the same thing in the Fate's Hand build and raw DDB.
- Preserve `manualOverrides`, `destinyState`, `rollHistory`, `rollEvents`,
  `rollPrefs`, `pendingRoll`, level-up notes and Soulforging preparation when replacing a
  snapshot.
- Return a clear parse error when required identity/stats are absent. Do not
  report a successful sync with an empty partial snapshot.
- Keep several unrelated public-character fixtures in Worker tests, with
  shuffled skill/tool order and at least one character using each supported AC
  representation. Awki may be one fixture, never a special case.

Response (`201`):

```json
{
  "campaign": "FH1",
  "pseudo": "Pell",
  "updatedAt": "2026-07-19T20:00:00.000Z",
  "profile": { "ddbLinked": true }
}
```

The generated minimal build must match the shape already returned by
`GET /party/:code/:pseudo`, for example:

```json
{
  "meta": { "campaign": "FH1", "pseudo": "Pell", "level": 6,
    "class": "Rogue", "species": "Human" },
  "character": { "name": "Pell", "abilityScores": {
    "STR": 8, "DEX": 16, "CON": 12, "INT": 16, "WIS": 10, "CHA": 14 } },
  "nativeSkillTiers": {},
  "skills": [],
  "destiny": {}
}
```

### `POST /admin/campaigns/:code/characters/:pseudo/pull`

Run a new pull using the canonical DDB ID stored in the profile. Do not require
the DM to paste the URL again. Preserve FH-only profile data (`destinyState`,
roll history, preferences, level-up notes and Soulforging preparation).

Return `{ "ok": true, "pseudo": "Pell", "updatedAt": "..." }`.

### `DELETE /admin/campaigns/:code/characters/:pseudo`

Delete that character's build and profile only. Do not delete shared campaign
inventory. Return `{ "ok": true }`.

## Party Inventory and Soulforge contract

The Inventory and Soulforge pages share one server-backed campaign inventory.
The browser must never maintain a second authoritative Soulforge inventory in
`localStorage`; local data is accepted only by the explicit one-time import.

### Inventory reads and ordinary mutations

- `GET /inv/:code` → `{ "schemaVersion": 2, "items": [...] }`.
- `POST /inv/:code` validates and creates one ingredient, gemstone, ordinary
  item or imported soulforged item.
- `POST /inv/:code/import` validates every legacy item before appending any of
  them. A rejected item must leave the entire import untouched.
- `POST /inv/:code/:itemId` accepts the closed actions `move`, `craft`,
  `infuse`, `identify` and `update`.
- `DELETE /inv/:code/:itemId` removes one consumed, sold or discarded item.

Inventory v2 keeps the compatible fields `id`, `name`, `qty`, `note` and
`owner`, then adds:

```json
{
  "kind": "raw | part | other",
  "partType": "structure | essence | catalyst",
  "stage": "raw | body | soulgem | identified | ready | complete",
  "subtype": "gem | equipment | soulforged",
  "creature": "Dragon",
  "creatureType": "Dragon",
  "cr": "5",
  "pp": 3,
  "ppCap": 3
}
```

Transitions are server-side so their component changes cannot be separated:

- `craft`: raw Structure → crafted Body.
- `infuse`: raw Essence + one valid gemstone → Soulgem; consume one gemstone.
- `identify`: raw Catalyst → identified Catalyst; enforce `power.pp <= ppCap`.

### Soulforge transactions

- `POST /inv/:code/consume` consumes a validated set of component IDs in one
  request. It is used only for explicitly resolved loss/destruction outcomes.
- `POST /inv/:code/forge` validates the Body, Soulgems, Catalysts and the three
  laws, consumes the selected components and creates the completed soulforged
  item in the same handler execution.
- `POST /inv/:code/grow` validates a completed item and all moved/returned
  parts, rechecks the three laws, then persists the growth outcome in the same
  handler execution.

The client must send IDs rather than trusting full client-supplied component
objects. The Worker reloads the campaign inventory and derives the mounted
component data from those stored IDs. A stale or missing component returns an
error and leaves the client to refresh before retrying.

Cloudflare KV does not provide compare-and-swap transactions. The current
single-request validation prevents partial client-side consumption, but two
truly concurrent writers can still race at the KV layer. If simultaneous party
editing becomes common, move each campaign inventory behind a Durable Object
or D1 transaction rather than describing KV writes as globally atomic.

### Character data used by the workshop

The workshop reads both `GET /party/:code/:pseudo` and
`GET /profile/:code/:pseudo`. The public profile response must continue to
include `snapshot` and `manualOverrides`. The calculated Soulforging score must
therefore reflect, in order, the build, the synchronized DDB/FH snapshot and the
player's saved corrections (level, PB, CHA, Soulforging tier and named special
bonuses).

## CORS

Allow the deployed handbook origin (and localhost only in development), with:

```text
Methods: GET, POST, DELETE, OPTIONS
Headers: Authorization, Content-Type
```

Do not use `Access-Control-Allow-Origin: *` on authenticated admin responses.

## Compatibility checklist

- Keep existing `/builds`, `/party`, `/profile` and `/inv` behavior intact.
- `GET /builds?campaign=FH1` remains the DM character list used as fallback.
- Existing players continue to open `/player/?campaign=FH1` and select only
  characters registered in that campaign.
- Deleting a campaign immediately makes its join code invalid.
- Return 404/405 clearly while routes are missing; the DM UI displays a Worker
  upgrade message rather than pretending the operation succeeded.
