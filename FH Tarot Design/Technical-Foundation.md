# Major Arcana production pipeline

This directory owns the deterministic parts of the Fate's Hand deck. Image generation supplies only full-bleed, textless art. The compositor supplies the fixed frame, exact title, numeral, 22 orbital spheres, colour profile and JPEG contract.

## Contract

- final faces: `docs/assets/img/tarot/major/0.jpg`, `I.jpg` … `XXI.jpg`
- future back: `docs/assets/img/tarot/major/back.jpg`
- exact export: 504 × 864 px, sRGB JPEG, quality 82
- raw and layered masters: outside `docs/`

The committed Rider–Waite–Smith images remain temporary slot art. Do not overwrite them with the diagnostic output.

## One-card technical test

```bash
.venv/bin/python tools/tarot/compose_major.py \
  --card XVIII \
  --art tools/tarot/diagnostic-art.svg \
  --output /tmp/fh-tarot-stage1/XVIII.jpg \
  --diagnostic-sigil

.venv/bin/python tools/tarot/check_major_assets.py \
  --root /tmp/fh-tarot-stage1 \
  --card XVIII \
  --faces-only
```

`--diagnostic-sigil` is deliberately opt-in. Production export fails when a card has no approved Saint-specific sigil.

## Production batch

Place numeral-named lossless art masters and approved SVG sigils outside the web tree, then run:

```bash
.venv/bin/python tools/tarot/compose_major.py \
  --batch-art-dir /path/to/major-art-masters \
  --sigil-dir /path/to/approved-sigils \
  --output-dir docs/assets/img/tarot/major

.venv/bin/python tools/tarot/check_major_assets.py
```

The second command is intentionally strict: it expects all 22 faces and `back.jpg`.
