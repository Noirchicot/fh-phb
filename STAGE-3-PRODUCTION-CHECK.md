# Fate's Hand — Stage 3 production check

Checked on **2026-07-21** against the deployed handbook and Worker. These were read-only probes; no production campaign, character, inventory or profile was changed.

## Confirmed live

- `https://noirchicot.github.io/fh-phb/player/` responds successfully.
- `https://fh-builds.noirchicot.workers.dev/admin/campaigns` exists and correctly returns `401` without a GM bearer token. This means the route is deployed rather than missing.
- The authenticated route's CORS preflight accepts the handbook origin, `Authorization`, and `GET`, `POST`, `DELETE`, `OPTIONS`.
- Public campaign lookup rejects unknown codes. At check time, `/party/666` returned `403 {"error":"unknown campaign code"}`; `666` is therefore not a currently registered join code on this Worker.

## Stage 3 implementation

- `docs/javascripts/fh-gm.js` is the active, testable DM Control client.
- Campaign chips select and propagate the active code to character import and inventory.
- Every character row can open the exact Player Companion via `?campaign=…&character=…`.
- The Player Companion now consumes those deep links and bookmarks the loaded character in the URL.
- DDB URLs are reduced to the canonical numeric character URL before import.
- Worker connectivity, authorization failure and missing-admin-route states are visibly distinct.
- First import, later Sync, campaign creation/deletion, character deletion, download and loot use separate guarded actions.
- Worker-provided `importReport` diagnostics are retained. Unmapped labels appear inside the inline Edit working copy and never become active skills/tools.

## Automated coverage

Run:

```bash
node tests/player-sheet.test.js
node tests/player-sheet.integration.test.js
node tests/gm-control.integration.test.js
```

The DM test verifies campaign selection, exact-character deep links, URL canonicalization, bearer authentication, first import, resync, campaign creation and campaign inventory calls against a deterministic mock Worker.

## Remaining authenticated acceptance test

The production GM token is intentionally not stored in this repository, so authenticated production records could not be inspected from this delivery. After deployment, the DM should perform this short acceptance pass in `gm.html`:

1. Paste the GM token and confirm **Worker connected**.
2. Confirm the real Tentacule campaign code; do not assume it is `666` unless it has first been created.
3. Import several unrelated public DDB characters, including Bruggar, Yedrivel and Awki.
4. Open each sheet and confirm identity, six abilities, AC, the fixed 26 skills, and only explicit purchased tools.
5. Add one manual special bonus, Sync DDB, and confirm the correction remains.
6. Use a temporary test campaign for create/delete verification; do not test cascade deletion on a live campaign.

If all characters fail in the same field, repair the Worker's single shared parser. Never add character-name, campaign-code or array-position exceptions.
