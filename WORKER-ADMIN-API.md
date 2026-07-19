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
inventory:{CODE}                 -> existing campaign inventory
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
