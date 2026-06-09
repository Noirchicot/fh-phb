# Fate's Hand — Player's Handbook

A MkDocs Material site for the **Fate's Hand 5+** house rules (an expansion of D&D 2024).

## Workflow
Rules are authored in Eric's Obsidian vault (single source of truth). To update the site:

```bash
./.venv/bin/python sync_from_vault.py   # pull chapters from the vault
./.venv/bin/mkdocs serve                # local preview
./.venv/bin/mkdocs gh-deploy --force    # publish to GitHub Pages
```

## Setup (fresh clone)
```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
```
