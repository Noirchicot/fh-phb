# Fate's Hand — Phase 2 accounts and campaign permissions

## Why this remains a later phase

The current campaign code is intentionally a lightweight table-access key. It
keeps the site simple and free, but anyone who knows the code can currently
read and mutate the shared inventory. That is acceptable for a trusted table,
not for public campaigns or widely shared links.

Stage 5 keeps this access model unchanged. It does not pretend that a campaign
code is an authenticated account.

## Recommended free-first evolution

1. Keep public handbook and character creation anonymous.
2. Give each campaign a GM account or passkey-backed owner.
3. Give invited players a stable campaign membership and character binding.
4. Separate permissions:
   - GM: campaign, characters and every inventory mutation.
   - Player: own profile; ordinary moves involving their character; forge
     proposals or approved forge mutations.
   - Viewer: read-only character and inventory access.
5. Keep campaign codes as invitation/join codes, not permanent authorization.
6. Record an inventory audit trail: actor, action, item IDs, timestamp and
   before/after revision.

Cloudflare Access, Turnstile alone and a hidden GM token in browser code are not
substitutes for per-user authorization. A small passkey/OAuth layer plus a
Durable Object or D1-backed campaign ledger is the clean Phase 2 boundary.

## Trigger for implementation

Move to accounts when at least one of these becomes true:

- players outside a trusted table receive campaign links;
- concurrent inventory edits become routine;
- the GM needs rollback or attribution;
- private character data is stored beyond the current public DDB subset.
