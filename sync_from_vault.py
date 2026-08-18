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
    "inheritance.md":         ("1. Character Creation Rolls/Inheritance.md",                     "Inheritance"),
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


# ══ LES DOUZE ESPÈCES — une seule liste, deux usages ═══════════════════════
# Elle sert à la fois aux portraits injectés dans le chapitre ET au découpage
# en page-menu + 12 pages (voir `split_species`). Écrite une fois : le jour où
# une espèce est ajoutée ou renommée, les deux suivent ensemble.
#
#   (slug de page, début de la ligne de titre dans le vault, nom affiché)
#
# ⚠️ Le début de titre n'est PAS le nom : neuf espèces portent un lien D&D
#    Beyond sur leur titre (`## [Elf](https://…)`) et trois n'en ont pas —
#    ce sont celles que Fate's Hand a inventées.
SPECIES = [
    ("araag",      "## Araag",       "Araag"),
    ("dragonborn", "## [Dragonborn", "Dragonborn"),
    ("dwarf",      "## [Dwarf",      "Dwarf"),
    ("elestu",     "## Elestu",      "Elestu"),
    ("elf",        "## [Elf",        "Elf"),
    ("goliath",    "## [Goliath",    "Goliath"),
    ("halfling",   "## [Halfling",   "Halfling"),
    ("hoddon",     "## Hoddon",      "Hoddon"),
    ("human",      "## Human",       "Human"),
    ("loroka",     "## Loroka",      "Loroka"),
    ("orc",        "## [Orc",        "Orc"),
    ("tiefling",   "## Tiefling",    "Tiefling"),
]

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
    # ⭐ The twelve entries are generated from SPECIES below, so the portrait
    #    list and the page split can never disagree about which H2s are species.
    "species.md": None,   # filled in just after SPECIES is declared
    "ability-scores.md": [
        ("## The 3d6 × 10 method",
         '!!! tip "Try it live"\n'
         "    Real crypto-RNG rolls, the reroll rule enforced automatically, and a spot to assign your\n"
         "    six kept scores before you open the D&D Beyond builder.\n\n"
         "    [Open the Ability Score Roller ↗](../stat-roller.html){ .md-button target=_blank }"),
    ],
}


CHAPTER_IMAGES["species.md"] = (
    [("# Species",
      "![The peoples of Nymedes](../assets/img/species-banner.jpg){ .fh-illus .fh-banner }")]
    + [(head, f"![{name}](../assets/img/species-{slug_}.jpg){{ .fh-portrait }}")
       for slug_, head, name in SPECIES]
)


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


# ══ LE CHAPITRE SPECIES SE PUBLIE DEUX FOIS ════════════════════════════════
# Eric, 2026-08-17 : *« une page de menu résumé identique au blurb (rien de
# plus, pas de stats) plus petite image png et lien vers page complète »*.
#
# ⭐ ET LE VAULT N'EN GARDE QU'UNE SEULE NOTE. C'est le point : le lore fait
#    maintenant 400 à 500 mots par espèce, et douze notes séparées seraient
#    douze fichiers à tenir d'accord — alors qu'Eric édite dans Obsidian, à la
#    main, souvent sur iPad. La note reste une ; le découpage est mécanique et
#    se refait à chaque sync.
#
# ⛔ `species.md` RESTE LA PAGE-MENU, il ne devient pas `species/index.md`.
#    Le reste du site pointe vers `species.md` (nav, `NOTE_TO_CHAPTER`, les
#    renvois d'autres chapitres) et les ancres `species.md#elf` sont dans la
#    nature. La page-menu garde donc ses douze titres H2 : les vieux liens
#    continuent d'arriver quelque part de sensé.
SPECIES_DIR = DOCS / "species"
# La phrase qui explique le marquage n'a de sens que sur une page complète —
# la page-menu ne porte aucun trait.
MENU_DROP_PREFIX = "Each entry below carries its lore first"


def descendre_dun_cran(text: str) -> str:
    """Repointer les liens d'une section descendue dans `chapters/species/`.

    🔴 CE QUE LE BUILD MKDOCS A TROUVÉ, ET QU'UNE RELECTURE N'AURAIT PAS VU :
    la première version ne corrigeait que les IMAGES (`../assets/`), et six
    pages sont sorties avec des renvois de chapitre cassés — `skills-and-tools.md`
    cherché dans `chapters/species/`. Un lien mort ne lève aucune erreur au
    sync : il faut construire le site pour le voir.

    Deux familles, une seule cause — la page a gagné un niveau de dossier :
      · les actifs     `](../assets/…`  ->  `](../../assets/…`
      · les chapitres  `](feats.md…`    ->  `](../feats.md…`
    ⛔ On ne touche pas à ce qui est déjà relatif (`../`, `./`) ni aux URL
    absolues : seul un nom de fichier nu a besoin du cran."""
    text = text.replace("](../assets/", "](../../assets/")
    return re.sub(r"\]\((?!\.{1,2}/|[a-z]+:|#)([^)/#]+\.md)", r"](../\1", text)


def mark_fh_tags(text: str) -> str:
    """`*(FH)*` dans la note du vault -> la pastille dorée du site.

    ⭐ POURQUOI PAS ÉCRIRE LE `<span>` DANS LE VAULT : la note se lit dans
    Obsidian, sur iPad, et s'édite à la main. Du HTML inline y serait du bruit
    à chaque ligne de trait. Le vault garde `*(FH)*` — lisible partout — et le
    site fabrique l'habillage, exactement comme il fabrique les portraits."""
    return text.replace("*(FH)*", '<span class="fh-tag">FH</span>')


def _lead_paragraph(block: list) -> str:
    """Le premier vrai paragraphe d'une section — le blurb. On saute le titre,
    les lignes vides et le portrait injuste au-dessus."""
    out, started = [], False
    for ln in block[1:]:
        if not ln.strip():
            if started:
                break
            continue
        if ln.lstrip().startswith("!["):   # le portrait injecté
            continue
        started = True
        out.append(ln)
    return "\n".join(out)


def split_species():
    src = DOCS / "species.md"
    if not src.exists():
        print("  !! MISSING species.md — species pages not split")
        return
    lines = src.read_text(encoding="utf-8").splitlines()

    starts = []
    for i, ln in enumerate(lines):
        for slug_, head, name in SPECIES:
            if ln.startswith(head):
                starts.append((i, slug_, name))
                break

    # 🔴 UN GARDE, PAS UNE SUPPOSITION : si le vault renomme une espèce, on
    #    n'écrit rien plutôt que de publier un chapitre amputé en silence.
    if len(starts) != len(SPECIES):
        trouve = {s[1] for s in starts}
        manque = [s for s, _, _ in SPECIES if s not in trouve]
        print(f"  !! species split ABORTED: {len(starts)}/{len(SPECIES)} headings"
              f" found, missing {manque} — species.md left whole")
        return

    # Le pied de licence CC-BY : la dernière règle horizontale et ce qui suit.
    # Il part sur CHACUNE des treize pages — chacune porte du texte SRD.
    end = len(lines)
    for i in range(len(lines) - 1, starts[-1][0], -1):
        if lines[i].strip() == "---":
            end = i
            break
    tail = "\n".join(lines[end:]).strip()

    bornes = [s[0] for s in starts] + [end]
    preamble = [ln for ln in lines[:starts[0][0]]
                if not ln.startswith(MENU_DROP_PREFIX)]

    SPECIES_DIR.mkdir(parents=True, exist_ok=True)
    menu = "\n".join(preamble).rstrip().splitlines()

    for n, (i, slug_, name) in enumerate(starts):
        block = lines[i:bornes[n + 1]]
        # ── la page complète ───────────────────────────────────────────────
        titre = block[0][3:].strip()          # `## [Elf](…)` -> `[Elf](…)`
        corps = "\n".join(block[1:]).strip()
        # Une page d'espèce vit un cran plus profond : ../assets -> ../../assets
        corps = descendre_dun_cran(corps)
        corps = mark_fh_tags(corps)
        # `tail` porte DÉJÀ sa règle horizontale — en rajouter une en produisait
        # deux à la suite (mesuré sur la première passe).
        page = f"# {titre}\n\n{corps}\n\n{tail}\n"
        (SPECIES_DIR / f"{slug_}.md").write_text(page, encoding="utf-8")

        # ── son entrée au menu : le titre, la vignette, le blurb, le lien ──
        menu.append("")
        menu.append(block[0])
        menu.append("")
        menu.append(f"![{name}](../assets/img/species-{slug_}.jpg){{ .fh-thumb }}")
        menu.append("")
        menu.append(_lead_paragraph(block))
        menu.append("")
        menu.append(f"[Read the full entry →](species/{slug_}.md)")

    menu += ["", tail, ""]
    src.write_text("\n".join(menu), encoding="utf-8")
    print(f"  ok  species.md            -> menu + {len(starts)} pages in chapters/species/")


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
    split_species()
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



# ══ LA PROSE D'ESPÈCE REDESCEND DANS LE BUILDER ════════════════════════════
# Eric, 2026-08-17, en ratifiant la chaîne des sources : *« la page PHB est la
# source, le builder l'IMPORTE »*.
#
# 🔴 LE DÉFAUT QUE ÇA FERME. `fhpc/layers/fh-lore-en.layer.json` portait sa
#    propre prose d'espèce, écrite à la main — deux cents mots par espèce, qui
#    racontaient la MÊME chose que le chapitre, dans d'autres phrases. Deux
#    écritures d'un seul lore : exactement la divergence que la chaîne des
#    sources existe pour empêcher.
#
# ⭐ CE QU'ON IMPORTE, ET CE QU'ON LAISSE. Seule l'AMBIANCE descend : les
#    paragraphes entre le portrait et le `**Traits**`. Les traits eux-mêmes
#    restent au chapitre et sur la fiche du builder — le panneau de lore n'a
#    pas à répéter ce que la carte affiche déjà à côté.
#
# ⛔ LES CLASSES NE SONT PAS TOUCHÉES. Leur lore reste écrit à la main dans la
#    couche : le chapitre `classes.md` n'a pas la forme « une section, une
#    prose d'ambiance » qu'on découpe ici, et inventer un second extracteur
#    pour une forme qui n'existe pas serait du code écrit d'avance.
LORE_LAYER = pathlib.Path("/Users/Eric/tools/fhpc/layers/fh-lore-en.layer.json")
# Les ids de la couche : le slug du site, sauf le Hoddon, qui est le gnome SRD.
LORE_IDS = {
    "araag":   "fh:species:en:araag",
    "elestu":  "fh:species:en:elestu",
    "loroka":  "fh:species:en:loroka",
    "hoddon":  "srd:species:en:gnome",
}


def _plain(md: str) -> str:
    """Le markdown d'une page redevient du texte nu.

    ⛔ La couche porte du TEXTE, pas du balisage : `lore.mjs` le découpe en
    paragraphes et le pose en nœuds texte — aucun `innerHTML` ne traverse ce
    dépôt. Laisser les `**` et les `[lien](…)` les ferait lire tels quels."""
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)   # [texte](url) -> texte
    md = re.sub(r"\*\*(.+?)\*\*", r"\1", md)             # gras
    md = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"\1", md)  # italique
    md = md.replace("`", "")
    return md.strip()


def build_species_lore():
    import json
    if not LORE_LAYER.exists():
        print(f"  !! MISSING {LORE_LAYER} — lore d'espèce non importé")
        return
    couche = json.loads(LORE_LAYER.read_text(encoding="utf-8"))
    especes = couche.get("records", {}).get("species")
    if not isinstance(especes, dict):
        print("  !! fh-lore-en n'a pas de records.species — lore non importé")
        return

    faits, manques = 0, []
    for slug, _head, _name in SPECIES:
        page = SPECIES_DIR / f"{slug}.md"
        if not page.exists():
            manques.append(slug)
            continue
        lignes = page.read_text(encoding="utf-8").splitlines()
        paras, courant = [], []
        for ln in lignes[1:]:                      # on saute le H1
            if ln.startswith("**Traits**"):
                break
            if ln.lstrip().startswith("!["):       # le portrait
                continue
            if ln.strip() == "":
                if courant:
                    paras.append(" ".join(courant)); courant = []
                continue
            courant.append(ln.strip())
        if courant:
            paras.append(" ".join(courant))
        texte = "\n\n".join(_plain(p) for p in paras if _plain(p))

        rid = LORE_IDS.get(slug, f"srd:species:en:{slug}")
        entree = especes.get(rid)
        if entree is None or texte == "":
            manques.append(slug)
            continue
        entree.setdefault("changes", {})["data.lore"] = {
            "text": texte,
            # La provenance dit D'OÙ, pas QUI : c'est ce que le garde des
            # provenances de `fiche-360` sait déjà lire.
            "provenance": "fh-original"
        }
        faits += 1

    # 🔴 UN GARDE, PAS UNE SUPPOSITION : on n'écrit rien plutôt que de publier
    #    une couche à moitié importée, dont la moitié restante daterait d'avant.
    if faits != len(SPECIES):
        print(f"  !! lore d'espèce ABORTED : {faits}/{len(SPECIES)} importés, manque {manques}")
        return
    LORE_LAYER.write_text(json.dumps(couche, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  ok  fh-lore-en.layer.json  <- chapters/species/ ({faits} espèces)")


if __name__ == "__main__":
    print("Syncing FH PHB chapters from vault…")
    main()
    build_chaos_tables()
    build_arcana()
    build_species_lore()
    print("Done.")
