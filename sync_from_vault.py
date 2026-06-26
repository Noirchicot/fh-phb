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
"""
import re, pathlib, shutil

VAULT = pathlib.Path(
    "/Users/Eric/obsidian-vault/5.RPG/Fate's Hand/0. D&D 5+ Rules"
)
ROOT = pathlib.Path(__file__).parent
DOCS = ROOT / "docs" / "chapters"
BUILDER_SRC = pathlib.Path("/Users/Eric/tools/fh-skills/fh-skill-builder.html")
BUILDER_DST = ROOT / "docs" / "skill-builder.html"

# dest filename : (source relative to VAULT, H1 title to guarantee)
MAP = {
    "ability-scores.md":      ("1. Character Creation Rolls/D&D 5+ Character stat generation.md", "Ability Scores"),
    "backgrounds.md":         ("1. Character Creation Rolls/Backgrounds.md",                      "Backgrounds"),
    "lunar-sorcerer.md":      ("7. Classes/Lunar Sorcery revised.md",                             "Lunar Sorcerer"),
    "species.md":             ("2. Species Modifications/D&D 5+ Races & Species.md",              "Species"),
    "skills-and-tools.md":    ("4. Skills/Skills & Tools — Player Guide.md",                       "Skills & Tools"),
    "feats.md":               ("5. Feats/Feats.md",                                                "Feats"),
    "skills-synergies.md":    ("4. Skills/Skill chapters/4. Skills and synergies.md",              "Skills, Synergies & DCs"),
    "fates-hand-mechanic.md": ("3. Arcane Destinies/D&D 5+ Fate’s Hand Mechanic.md",               "Destiny System"),
    "battlefield.md":         ("8. Other rules/Battlefield Rules.md",                              "Battlefield Rules"),
    "dungeoneering.md":       ("8. Other rules/Dungeoneering.md",                                  "Dungeoneering"),
    "classes.md":             ("7. Classes/Class Modifications.md",                                "Classes"),
    "spells.md":              ("6. Spells/Fate’s Hand Spells.md",                                  "Spells"),
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
        dest = NOTE_TO_CHAPTER.get(target)
        text = label or anchor or target
        if dest:  # published chapter -> real relative link (+optional anchor)
            frag = f"#{slug(anchor)}" if anchor else ""
            return f"[{text}]({dest}{frag})"
        return text  # unpublished note -> flatten to plain text as before

    s = re.sub(r"\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]", xnote, s)
    return s


# vault path (as it appears in a `code span`) -> (dest chapter file, label)
PATH_TO_CHAPTER = {
    "5. Feats/Feats.md":                 ("feats.md",            "Feats"),
    "8. Other rules/Battlefield Rules.md": ("battlefield.md",     "Battlefield Rules"),
    "8. Other rules/Dungeoneering.md":   ("dungeoneering.md",    "Dungeoneering"),
    "7. Classes/Class Modifications.md": ("classes.md",          "Classes"),
    "6. Spells/Fate's Hand Spells.md":   ("spells.md",           "Spells"),
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


def main():
    DOCS.mkdir(parents=True, exist_ok=True)
    for dest, (rel, title) in MAP.items():
        src = VAULT / rel
        if not src.exists():
            print(f"  !! MISSING {src}")
            continue
        body = src.read_text(encoding="utf-8")
        body = strip_callouts(body)
        body = fix_path_refs(body)
        body = convert_wikilinks(body)
        body = normalize_headings(body)
        body = ensure_h1(body, title)
        body = space_before_lists(body)
        body = collapse_blanks(body)
        (DOCS / dest).write_text(body, encoding="utf-8")
        print(f"  ok  {dest:24s} <- {rel}")
    if BUILDER_SRC.exists():
        shutil.copy(BUILDER_SRC, BUILDER_DST)
        print(f"  ok  skill-builder.html      <- {BUILDER_SRC.name}")


if __name__ == "__main__":
    print("Syncing FH PHB chapters from vault…")
    main()
    print("Done.")
