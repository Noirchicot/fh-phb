# Stage 4 delivery manifest

This package is rebuilt from deployed-source base commit `9378fab`, then receives only the Stage 4 files below. It deliberately excludes stale workspace copies of `mkdocs.yml`, `fh-mychar.js`, image assets and unrelated pages.

## Changed files

- `docs/javascripts/fh-player-sheet.js`
- `docs/stylesheets/player-sheet.css`
- `docs/chapters/fates-hand-mechanic.md`
- `tests/player-sheet.integration.test.js`

## New files

- `tests/roller-state-machine.test.js`
- `STAGE-4-ROLLER-AUDIT.md`
- `STAGE-4-FILES.md`

## Supplemental handoff

- `CLAUDE-HANDOFF.md` contains the full accumulated project context plus the Stage 4 notes.

Claude should review the rule-document wording, run the test commands listed in `STAGE-4-ROLLER-AUDIT.md`, then commit and deploy this clean tree. No production deployment has been performed by Codex.
