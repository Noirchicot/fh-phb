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
    "species.md":             ("2. Species Modifications/D&D 5+ Races & Species.md",              "Species"),
    "skills-and-tools.md":    ("4. Skills/Skills & Tools — Player Guide.md",                       "Skills & Tools"),
    "feats.md":               ("5. Feats/Feats.md",                                                "Feats"),
    "skills-synergies.md":    ("4. Skills/Skill chapters/4. Skills and synergies.md",              "Skills, Synergies & DCs"),
    "fates-hand-mechanic.md": ("3. Arcane Destinies/D&D 5+ Fate’s Hand Mechanic.md",               "The Fate's Hand Mechanic"),
    "battlefield.md":         ("8. Other rules/Battlefield Rules.md",                              "Battlefield Rules"),
    "dungeoneering.md":       ("8. Other rules/Dungeoneering.md",                                  "Dungeoneering"),
    "classes.md":             ("7. Classes/Class Modifications.md",                                "Classes"),
    "spells.md":              ("6. Spells/Fate’s Hand Spells.md",                                  "Spells"),
    "major-arcana.md":        ("3. Arcane Destinies/The Major Arcana.md",                          "The 22 Major Arcana"),
    "chaos-tables.md":        ("3. Arcane Destinies/Tables de Fatalité par Attribut.md",           "Chaos Tables"),
}


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
    s = re.sub(r"\[\[[^\]|#]+\|([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"\[\[([^\]#]+)\]\]", r"\1", s)
    return s


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
        body = convert_wikilinks(body)
        body = ensure_h1(body, title)
        (DOCS / dest).write_text(body, encoding="utf-8")
        print(f"  ok  {dest:24s} <- {rel}")
    if BUILDER_SRC.exists():
        shutil.copy(BUILDER_SRC, BUILDER_DST)
        print(f"  ok  skill-builder.html      <- {BUILDER_SRC.name}")


if __name__ == "__main__":
    print("Syncing FH PHB chapters from vault…")
    main()
    print("Done.")
