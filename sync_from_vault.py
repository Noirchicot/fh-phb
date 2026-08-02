#!/usr/bin/env python3
"""Sync Fate's Hand PHB chapters from the Obsidian vault into docs/.

The vault is the single source of truth. This copies the canonical
player-facing chapters, converting Obsidian-isms to MkDocs markdown:
  - [[#Heading|Label]]  -> [Label](#slug)
  - [[#Heading]]        -> [Heading](#slug)
  - [[Note|Label]]      -> Label   (cross-note links flattened to text)
  - [[Note]]            -> Note
  - > [!type]+ Title    -> > **Title**   (editorial CANONICAL blocks dropped)
  - ensures each page starts with an H1

The two standalone tool pages (builder, roller) are copied over as well, with
the site's tool shell — stylesheet and nav bar — injected on the way in; the
sources stay standalone, so nothing here should ever be patched by hand.
"""
import re, pathlib

VAULT = pathlib.Path(
    "/Users/Eric/obsidian-vault/5.RPG/Fate's Hand/0. D&D 5+ Rules"
)
ROOT = pathlib.Path(__file__).parent
DOCS = ROOT / "docs" / "chapters"
BUILDER_SRC = pathlib.Path("/Users/Eric/tools/fh-skills/fh-skill-builder.html")
BUILDER_DST = ROOT / "docs" / "skill-builder.html"
ROLLER_SRC = pathlib.Path("/Users/Eric/tools/fh-skills/stat-roller.html")
ROLLER_DST = ROOT / "docs" / "stat-roller.html"

# source, published page, body class, the page's own slot in the nav bar
TOOL_PAGES = [
    (BUILDER_SRC, BUILDER_DST, "fh-tool-builder", ("skill-builder.html", "Create")),
    (ROLLER_SRC,  ROLLER_DST,  "fh-tool-roller",  ("stat-roller.html",   "Roller")),
]

# dest filename : (source relative to VAULT, H1 title to guarantee)
MAP = {
    "ability-scores.md":      ("1. Character Creation Rolls/D&D 5+ Character stat generation.md", "Ability Scores"),
    "backgrounds.md":         ("1. Character Creation Rolls/Backgrounds.md",                      "Backgrounds"),
    "moonkeeper.md":          ("7. Classes & Subclasses/Lunar Sorcery revised.md",                "Moonkeeper"),
    "species.md":             ("2. Species Modifications/D&D 5+ Races & Species.md",              "Species"),
    "skills-and-tools.md":    ("4. Skills/Skills & Tools — Player Guide.md",                       "Skills & Tools"),
    "feats.md":               ("5. Feats/Feats.md",                                                "Feats"),
    "skills-synergies.md":    ("4. Skills/Skill chapters/4. Skills and synergies.md",              "Skills, Synergies & DCs"),
    "fates-hand-mechanic.md": ("3. Arcane Destinies/D&D 5+ Fate’s Hand Mechanic.md",               "Destiny System"),
    "battlefield.md":         ("8. Adventuring/Battlefield Rules.md",                              "Battlefield Rules"),
    "dungeoneering.md":       ("8. Adventuring/Dungeoneering.md",                                  "Dungeoneering"),
    "classes.md":             ("7. Classes & Subclasses/Class Modifications.md",                   "Classes"),
    "spells.md":              ("6. Spells & Magic/Fate’s Hand Spells.md",                          "New Spells"),
    "soulforge-crafting.md":  ("6. Spells & Magic/Soulforge Crafting.md",                          "Soulforge Crafting"),
    "dark-rituals.md":        ("6. Spells & Magic/Dark Rituals.md",                                "Dark Rituals"),
    "circle-magic.md":        ("6. Spells & Magic/Circle Magic.md",                                "Circle Magic"),
    "magic-items.md":         ("6. Spells & Magic/Magic Items.md",                                 "Magic Items"),
    "primordial-forces.md":   ("6. Spells & Magic/Nymedes's Primordial Forces.md",                 "Nymedes's Primordial Forces"),
    "major-arcana.md":        ("3. Arcane Destinies/The Major Arcana.md",                          "Arcana"),
    "chaos-tables.md":        ("3. Arcane Destinies/Tables de Fatalité par Attribut.md",           "Chaos Tables"),
}

# vault note name (stem) -> published chapter file, for cross-note wikilinks
NOTE_TO_CHAPTER = {pathlib.Path(rel).stem: dest for dest, (rel, _) in MAP.items()}


def slug(text: str) -> str:
    """Replicate MkDocs' default toc slugify (ascii, lowercase, hyphen)."""
    import unicodedata
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


def convert_wikilinks(s: str) -> str:
    s = re.sub(r"\[\[#([^\]|]+)\|([^\]]+)\]\]",
               lambda m: f"[{m.group(2)}](#{slug(m.group(1))})", s)
    s = re.sub(r"\[\[#([^\]]+)\]\]",
               lambda m: f"[{m.group(1)}](#{slug(m.group(1))})", s)

    def xnote(m):
        target, anchor, label = m.group(1).strip(), m.group(2), m.group(3)
        target = target.rstrip("\\").strip()  # table-escaped pipe: [[Note\|Label]]
        dest = NOTE_TO_CHAPTER.get(target)
        text = label or anchor or target
        if dest:  # published chapter -> real relative link (+optional anchor)
            frag = f"#{slug(anchor)}" if anchor else ""
            return f"[{text}]({dest}{frag})"
        return text  # unpublished note -> flatten to plain text as before

    s = re.sub(r"\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]", xnote, s)
    return s


# site-only inserts: dest chapter -> [(heading line prefix, markdown block)]
# inserted after the heading (and its italic subtitle line, if any) on sync,
# so the vault files stay free of site-specific images/tool links.
CHAPTER_IMAGES = {
    "primordial-forces.md": [
        ("## Part 1 — The White Void",
         "![The White Void](../assets/img/world-white-void.jpg){ .fh-illus }"),
        ("## Part 2 — The Crimson Shroud",
         "![The Crimson Shroud](../assets/img/world-crimson-shroud.jpg){ .fh-illus }"),
    ],
    # species banner + portraits (art masters in ~/Pictures/FH PHB art masters/Species/)
    "species.md": [
        ("# Species",       "![The peoples of Nymedes](../assets/img/species-banner.jpg){ .fh-illus .fh-banner }"),
        ("## Araag",        "![Araag](../assets/img/species-araag.jpg){ .fh-portrait }"),
        ("## [Dragonborn",  "![Dragonborn](../assets/img/species-dragonborn.jpg){ .fh-portrait }"),
        ("## [Dwarf",       "![Dwarf](../assets/img/species-dwarf.jpg){ .fh-portrait }"),
        ("## Elestu",       "![Elestu](../assets/img/species-elestu.jpg){ .fh-portrait }"),
        ("## [Elf",         "![Elf](../assets/img/species-elf.jpg){ .fh-portrait }"),
        ("## [Goliath",     "![Goliath](../assets/img/species-goliath.jpg){ .fh-portrait }"),
        ("## [Halfling",    "![Halfling](../assets/img/species-halfling.jpg){ .fh-portrait }"),
        ("## Hoddon",       "![Hoddon](../assets/img/species-hoddon.jpg){ .fh-portrait }"),
        ("## Human",        "![Human](../assets/img/species-human.jpg){ .fh-portrait }"),
        ("## Loroka",       "![Loroka](../assets/img/species-loroka.jpg){ .fh-portrait }"),
        ("## [Orc",         "![Orc](../assets/img/species-orc.jpg){ .fh-portrait }"),
        ("## Tiefling",     "![Tiefling](../assets/img/species-tiefling.jpg){ .fh-portrait }"),
    ],
    "ability-scores.md": [
        ("## The 3d6 × 10 method",
         '!!! tip "Try it live"\n'
         "    Real crypto-RNG rolls, the reroll rule enforced automatically, and a spot to assign your\n"
         "    six kept scores before you open the D&D Beyond builder.\n\n"
         "    [Open the Ability Score Roller ↗](../stat-roller.html){ .md-button target=_blank }"),
    ],
}


def insert_images(text: str, dest: str) -> str:
    rules = CHAPTER_IMAGES.get(dest)
    if not rules:
        return text
    lines, out, i = text.splitlines(), [], 0
    pending = dict(rules)
    while i < len(lines):
        ln = lines[i]
        out.append(ln)
        i += 1
        for head, img in list(pending.items()):
            if ln.startswith(head):
                del pending[head]
                if i < len(lines) and lines[i].strip().startswith("*("):
                    out.append(lines[i])   # keep the italic subtitle above
                    i += 1
                out.append("")
                out.append(img)
    for img in pending.values():
        print(f"  !! image anchor not found in {dest}: {img}")
    return "\n".join(out)


# vault path (as it appears in a `code span`) -> (dest chapter file, label)
PATH_TO_CHAPTER = {
    "5. Feats/Feats.md":                 ("feats.md",            "Feats"),
    "8. Other rules/Battlefield Rules.md": ("battlefield.md",     "Battlefield Rules"),
    "8. Other rules/Dungeoneering.md":   ("dungeoneering.md",    "Dungeoneering"),
    "8. Adventuring/Battlefield Rules.md": ("battlefield.md",     "Battlefield Rules"),
    "8. Adventuring/Dungeoneering.md":   ("dungeoneering.md",    "Dungeoneering"),
    "7. Classes/Class Modifications.md": ("classes.md",          "Classes"),
    "7. Classes & Subclasses/Class Modifications.md": ("classes.md", "Classes"),
    "6. Spells/Fate's Hand Spells.md":   ("spells.md",           "Spells"),
    "6. Spells & Magic/Fate's Hand Spells.md": ("spells.md",     "Spells"),
    "6. Spells & Magic/Soulforge Crafting.md": ("soulforge-crafting.md", "Soulforge Crafting"),
    "8. Tools/Soulforge Ingredients (FH).json": ("soulforge-crafting.md", "Soulforge Crafting"),
}


def fix_path_refs(s: str) -> str:
    """Turn leaked vault paths (`...md`, `~/...`) into real site links or
    clean prose, so player-facing pages never show an internal file path.
    Runs before convert_wikilinks. Targeted rewrites first, then a safety net."""
    # --- targeted, context-aware rewrites -------------------------------
    # Feats: dual-wielder callout referencing a non-published walkthrough
    s = s.replace(
        "Full walkthrough in `8. Other rules/Shield dual wield 3 attacks.md`:",
        "Full sequence:")
    # Classes: "(`5. Feats/Feats.md`)" parenthetical -> link
    s = s.replace(
        "(`5. Feats/Feats.md`)",
        "(in the [Feats](feats.md) chapter)")
    # Feats: any pointer to the Leadership rules in the `4. Skills` folder
    s = s.replace("See the Leadership rules in `4. Skills`.",
                  "See the [Leadership rules](skills-and-tools.md#leadership).")
    s = s.replace("the Leadership rules in `4. Skills`",
                  "the [Leadership rules](skills-and-tools.md#leadership)")
    s = s.replace("the Leadership rules (`4. Skills`)",
                  "the [Leadership rules](skills-and-tools.md#leadership)")
    # Skills & Tools: drop the internal editorial source-of-truth note line
    s = re.sub(
        r"^.*Rules source of truth:.*$\n?",
        "", s, flags=re.MULTILINE)
    # --- generic safety net --------------------------------------------
    # any surviving code span mapping to a known chapter -> link
    for path, (dest, label) in PATH_TO_CHAPTER.items():
        s = s.replace(f"`{path}`", f"[{label}]({dest})")
    # builder html path anywhere -> link to the builder page
    s = re.sub(r"`~?[^`]*fh-skill-builder\.html`",
               "[the skill builder](../builder.md)", s)
    # last resort: strip backticks off any leftover vault-path code span
    # (a `.md` path or a `~/...` absolute path) so it never renders as a box
    s = re.sub(r"`([^`]*\.md)`", r"\1", s)
    s = re.sub(r"`(~/[^`]*)`", r"\1", s)
    # bare numbered-folder refs like `4. Skills`, `8. Other rules`
    s = re.sub(r"`(\d+\.\s[^`]*)`", r"\1", s)
    return s


_LIST_RE = re.compile(r"^\s*([-*+]|\d+\.)\s")


def space_before_lists(text: str) -> str:
    """Insert a blank line before a list that directly follows a paragraph,
    so Markdown parses it as a real list instead of running it inline.
    Conservative: only fires when the previous line is plain prose — never
    after a heading, table row, blockquote, HTML, another list item, or a
    blank line; never inside code fences."""
    out, in_fence = [], False
    for ln in text.splitlines():
        if ln.lstrip().startswith("```"):
            in_fence = not in_fence
            out.append(ln); continue
        if not in_fence and _LIST_RE.match(ln) and out:
            prev = out[-1]
            ps = prev.strip()
            if ps and not _LIST_RE.match(prev) \
               and not ps.startswith(("#", "|", ">", "<")):
                out.append("")
        out.append(ln)
    return "\n".join(out)


def collapse_blanks(text: str) -> str:
    """Collapse runs of 2+ blank lines into a single blank line (outside
    code fences), so no chapter ever shows oversized paragraph gaps."""
    out, blanks, in_fence = [], 0, False
    for ln in text.splitlines():
        if ln.lstrip().startswith("```"):
            in_fence = not in_fence
        if not in_fence and ln.strip() == "":
            blanks += 1
            if blanks > 1:
                continue
        else:
            blanks = 0
        out.append(ln)
    return "\n".join(out)


def normalize_headings(text: str) -> str:
    """If a chapter has H3s but no H2, promote every H3 -> H2 so the
    H1>H2>H3 hierarchy is uniform across the site."""
    lines = text.splitlines()
    has_h2 = any(l.startswith("## ") for l in lines)
    has_h3 = any(l.startswith("### ") for l in lines)
    if has_h3 and not has_h2:
        lines = [l[1:] if l.startswith("### ") else l for l in lines]
    return "\n".join(lines)


def strip_callouts(text: str) -> str:
    """Drop only the editorial CANONICAL callout blocks; pass every other
    Obsidian callout through verbatim so the mkdocs-callouts plugin renders it."""
    out, i, lines = [], 0, text.splitlines()
    head = re.compile(r"^>\s*\[!\w+\]")
    while i < len(lines):
        if head.match(lines[i]) and "CANONICAL" in lines[i].upper():
            i += 1
            while i < len(lines) and lines[i].lstrip().startswith(">"):
                i += 1
        else:
            out.append(lines[i]); i += 1
    return "\n".join(out)


# (The '⌂ Home' link and the Destiny-group cross TOC live at the top of the
#  table of contents, injected by docs/javascripts/fh-home.js.)


def strip_frontmatter(text: str) -> str:
    """Drop the Obsidian YAML frontmatter (tags…) — otherwise ensure_h1
    prefixes the H1 above it and the raw YAML renders on the page."""
    m = re.match(r"^---\n.*?\n---\n", text, flags=re.DOTALL)
    return text[m.end():].lstrip("\n") if m else text


def strip_liens(text: str) -> str:
    """Drop the vault-internal '## Liens' cross-reference sections — most of
    their wikilinks point at unpublished notes and would render as dead text."""
    out, skip = [], False
    for ln in text.splitlines():
        if re.match(r"^#{1,6}\s+Liens\b", ln):
            skip = True
            continue
        if skip and ln.startswith("#"):
            skip = False
        if not skip:
            out.append(ln)
    return "\n".join(out)


def ensure_h1(text: str, title: str) -> str:
    for ln in text.splitlines():
        if ln.strip() == "":
            continue
        if ln.lstrip().startswith("> "):  # skip leading blockquote/callout
            break
        if ln.startswith("# "):
            return text
        break
    return f"# {title}\n\n{text}"


# The tool sources are standalone by design: open the .html anywhere and it
# works, with no site chrome. The published copies need the shell every other
# tool page wears — the shared stylesheet and the nav bar (see
# docs/party-inventory.html, which lives in the repo and carries it in the
# file). Injecting it on every sync is what stops a plain copy from quietly
# shipping two tool pages with no way back to the handbook.
TOOL_CSS = '<link rel="stylesheet" href="stylesheets/tool-ui.css">'
TOOLBAR_LEAD = [("./", "Handbook"), ("player/", "Character")]
TOOLBAR_TAIL = [("party-inventory.html", "Inventory"),
                ("soulforge-tool.html", "Soulforge")]
_BODY_RE = re.compile(r"^<body([^>]*)>([ \t]*\n+)", re.MULTILINE)


def toolbar(self_href: str, self_label: str) -> str:
    """The five-item bar: two fixed links, the page itself, two more. It is a
    bottom dock at 760px and below, which is why five is the whole budget and
    each tool spends the middle slot on itself rather than on its sibling."""
    rows = []
    for href, label in TOOLBAR_LEAD + [(self_href, self_label)] + TOOLBAR_TAIL:
        here = ' aria-current="page"' if href == self_href else ""
        rows.append(f'    <a href="{href}"{here}>{label}</a>')
    rows = "\n".join(rows)
    return ('<nav class="fh-toolbar" aria-label="Player tools">\n'
            '  <a class="fh-toolbar__brand" href="./">'
            '<span class="fh-toolbar__mark">FH</span>Fate\'s Hand</a>\n'
            '  <div class="fh-toolbar__links">\n'
            f'{rows}\n'
            '  </div>\n'
            '</nav>')


def add_tool_chrome(html: str, body_class: str, self_link) -> str:
    """Dress a standalone tool page in the site shell: the shared stylesheet
    before </head>, the nav bar right after <body>, and the body class the
    shell styles hang off. Idempotent — a source that already carries the bar
    passes through untouched. Raises if the anchors aren't there, so a page
    that can't be dressed is left alone instead of published bald."""
    if TOOL_CSS not in html:
        if "</head>" not in html:
            raise ValueError("no </head> to hang the tool stylesheet on")
        html = html.replace("</head>", TOOL_CSS + "\n</head>", 1)
    if 'class="fh-toolbar"' in html:
        return html
    m = _BODY_RE.search(html)
    if not m:
        raise ValueError("no <body> tag to hang the toolbar on")
    attrs = m.group(1)
    if "class=" in attrs:
        raise ValueError("<body> already carries a class — merge it by hand")
    sep = m.group(2)  # keep the page's own spacing, on both sides of the bar
    return (html[:m.start()] + f'<body{attrs} class="{body_class}">'
            + sep + toolbar(*self_link) + sep + html[m.end():])


def main():
    DOCS.mkdir(parents=True, exist_ok=True)
    for dest, (rel, title) in MAP.items():
        src = VAULT / rel
        if not src.exists():
            print(f"  !! MISSING {src}")
            continue
        body = src.read_text(encoding="utf-8")
        body = strip_frontmatter(body)
        body = strip_callouts(body)
        body = strip_liens(body)
        body = fix_path_refs(body)
        body = convert_wikilinks(body)
        body = normalize_headings(body)
        body = ensure_h1(body, title)
        body = insert_images(body, dest)
        body = space_before_lists(body)
        body = collapse_blanks(body)
        (DOCS / dest).write_text(body, encoding="utf-8")
        print(f"  ok  {dest:24s} <- {rel}")
    for src, dst, body_class, self_link in TOOL_PAGES:
        if not src.exists():
            print(f"  !! MISSING {src}")
            continue
        try:
            page = add_tool_chrome(src.read_text(encoding="utf-8"), body_class, self_link)
        except ValueError as err:
            print(f"  !! {dst.name}: {err} — kept the published copy")
            continue
        dst.write_text(page, encoding="utf-8")
        print(f"  ok  {dst.name:24s} <- {src.name}")
    build_soulforge_data()


# Soulforge workshop data: bundle the vault JSONs into one JS file the
# static tool can load without fetch/CORS issues.
SF_TOOLS = pathlib.Path("/Users/Eric/obsidian-vault/5.RPG/Fate's Hand/8. Tools")
SF_CATALYSTS = SF_TOOLS / "LLM Soulforge engine" / "Soulforge Catalysts v3 (FH).json"
SF_INGREDIENTS = SF_TOOLS / "Soulforge Ingredients (FH).json"
SF_DATA_DST = ROOT / "docs" / "soulforge-data.js"


def build_soulforge_data():
    import json
    if not (SF_CATALYSTS.exists() and SF_INGREDIENTS.exists()):
        print("  !! MISSING soulforge JSONs — soulforge-data.js not rebuilt")
        return
    data = {
        "catalysts": json.loads(SF_CATALYSTS.read_text(encoding="utf-8"))["catalysts"],
        "ingredients": json.loads(SF_INGREDIENTS.read_text(encoding="utf-8"))["ingredients"],
    }
    js = "window.SF_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    SF_DATA_DST.write_text(js, encoding="utf-8")
    print(f"  ok  soulforge-data.js       <- {SF_CATALYSTS.name} + {SF_INGREDIENTS.name}")


# The dock used to send the player to the Chaos chapter and let them find the
# row themselves. It can read the row out loud instead — but only if the table
# is data, so this lifts the six markdown tables into a global the dock reads
# without a fetch, the same shape as soulforge-data.js.
CHAOS_SRC = DOCS / "chaos-tables.md"
CHAOS_DST = ROOT / "docs" / "javascripts" / "chaos-tables.js"
CHAOS_ABILITIES = ("STR", "DEX", "CON", "WIS", "INT", "CHA")
CHAOS_MAX_ROW = 12


def build_chaos_tables():
    import json
    if not CHAOS_SRC.exists():
        print("  !! MISSING chaos-tables.md — chaos-tables.js not rebuilt")
        return
    text = CHAOS_SRC.read_text(encoding="utf-8")
    tables, current = {}, None
    for line in text.splitlines():
        heading = re.match(r"^#{2,4}\s+(.+?)\s*\(([A-Z]{3})\)\s*$", line.strip())
        if heading and heading.group(2) in CHAOS_ABILITIES:
            current = heading.group(2)
            tables[current] = {"name": heading.group(1).strip(), "rows": {}}
            continue
        if current is None:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")] if line.strip().startswith("|") else None
        if not cells or len(cells) < 2:
            continue
        if not re.fullmatch(r"\d{1,2}", cells[0]):
            continue  # header row and the |---| separator
        result = int(cells[0])
        if not 1 <= result <= CHAOS_MAX_ROW:
            continue
        # The dock renders the row as plain text, so the emphasis markers would
        # show up literally. Keep the words, drop the asterisks.
        row = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", cells[1]).strip()
        tables[current]["rows"][str(result)] = row
    missing = [ability for ability in CHAOS_ABILITIES
               if len(tables.get(ability, {}).get("rows", {})) != CHAOS_MAX_ROW]
    if missing:
        print(f"  !! Chaos tables incomplete for {', '.join(missing)} — chaos-tables.js not rebuilt")
        return
    payload = {"max": CHAOS_MAX_ROW, "tables": {key: tables[key] for key in CHAOS_ABILITIES}}
    CHAOS_DST.write_text(
        "window.FH_CHAOS = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    print(f"  ok  chaos-tables.js        <- chaos-tables.md ({len(CHAOS_ABILITIES)} tables x {CHAOS_MAX_ROW})")


# The 22 Major Arcana, lifted the same way, so an Arcane Awakening can deal a
# real card with its real powers instead of asking the player to go and look.
ARCANA_SRC = DOCS / "major-arcana.md"
ARCANA_DST = ROOT / "docs" / "javascripts" / "arcana.js"
ARCANA_COUNT = 22
ARCANA_FIELDS = {"meaning": "meaning", "destiny impact": "impact", "power": "power", "vibration": "vibration"}


def build_arcana():
    import json
    if not ARCANA_SRC.exists():
        print("  !! MISSING major-arcana.md — arcana.js not rebuilt")
        return
    cards, current = [], None
    for line in ARCANA_SRC.read_text(encoding="utf-8").splitlines():
        heading = re.match(r"^#{2,4}\s+([0IVXL]+)\.\s+(.+?)\s*$", line.strip())
        if heading:
            current = {"numeral": heading.group(1), "name": heading.group(2).strip(),
                       "meaning": "", "impact": "", "power": "", "vibration": ""}
            cards.append(current)
            continue
        if current is None:
            continue
        field = re.match(r"^-\s+\*\*(.+?)\*\*\s+[—-]\s+(.+?)\s*$", line.strip())
        if not field:
            continue
        key = ARCANA_FIELDS.get(field.group(1).strip().lower())
        if key:
            current[key] = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", field.group(2)).strip()
    if len(cards) != ARCANA_COUNT:
        print(f"  !! Found {len(cards)} Major Arcana, expected {ARCANA_COUNT} — arcana.js not rebuilt")
        return
    ARCANA_DST.write_text(
        "window.FH_ARCANA = " + json.dumps(cards, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    print(f"  ok  arcana.js              <- major-arcana.md ({len(cards)} cards)")


if __name__ == "__main__":
    print("Syncing FH PHB chapters from vault…")
    main()
    build_chaos_tables()
    build_arcana()
    print("Done.")
