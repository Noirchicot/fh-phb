#!/usr/bin/env python3
"""L'arbre du menu de marge, DÉRIVÉ — il ne se tient plus à la main.

🔴 CE QUE ÇA REMPLACE, ET POURQUOI. `docs/javascripts/fh-home.js` portait une
   table `GROUPS` écrite à la main qui doublait l'arborescence du site : un
   titre, ses pages, et pour chaque page une liste de titres avec leurs ancres.
   Audit du 2026-09-04 contre les ancres réelles du site construit : **12 ancres
   mortes sur 26 entrées**, dont les CINQ du groupe Destiny, plus un libellé
   périmé (« Class Modifications » pour un chapitre renommé). Rien ne rougissait :
   une ancre morte ne casse pas une page, elle mène ailleurs.

⭐ LA RÈGLE QUI EN SORT. Une arborescence ne se recopie pas, elle se dérive.
   Ce script lit les DEUX sources qui font autorité — le `nav:` de `mkdocs.yml`
   pour l'ordre et les noms, les fichiers de `docs/` pour les titres — et écrit
   `docs/javascripts/fh-nav.js`. Il n'invente aucun nom et ne recopie aucune ancre.

⛔ LES ANCRES NE SONT PAS DEVINÉES. Un titre en Markdown passe par le `slugify`
   de Python-Markdown, celui-là même que MkDocs emploie pour poser l'`id` ; un
   titre en HTML brut porte déjà son `id`, on le lit. Réimplémenter la
   slugification produirait des ancres crédibles et fausses — la variété la plus
   coûteuse (j'en ai fabriqué une ce matin, en ratant `index.md` avec un motif
   trop serré).

📐 LES RANGS SONT CEUX D'ERIC : `R` la racine (les quatre menus), `B` la page,
   `SB` une page-fille (le dossier frère d'une page-menu), `SSB` un titre dedans.
   ⛔ Un rang n'est pas un nom de page : il dit la profondeur, rien d'autre.
"""
import json, pathlib, re, sys
import yaml
from markdown.extensions.toc import slugify

ROOT = pathlib.Path(__file__).parent
DOCS = ROOT / "docs"
SORTIE = DOCS / "javascripts" / "fh-nav.js"

# mkdocs.yml porte des tags `!!python/name:` que SafeLoader refuse. On ne veut
# que le `nav:` — on neutralise ces tags plutôt que d'autoriser le loader plein.
class _Loader(yaml.SafeLoader): pass
_Loader.add_multi_constructor("tag:yaml.org,2002:python/name:", lambda l, s, n: None)
_Loader.add_multi_constructor("tag:yaml.org,2002:python/object", lambda l, s, n: None)

_H_MD = re.compile(r"^(#{2,3})\s+(.+?)\s*(?:\{\s*#([\w-]+)[^}]*\})?\s*$", re.M)
_H_HTML = re.compile(r"<h([2-4])\b[^>]*\bid=\"([^\"]+)\"[^>]*>(.*?)</h\1>", re.S | re.I)
_BALISE = re.compile(r"<[^>]+>")


def _texte_rendu(titre):
    """Le titre tel que le LECTEUR le lit — c'est lui que MkDocs slugifie.

    🔴 CORRIGÉ AVANT LA PREMIÈRE LIVRAISON, et c'est l'épreuve qui l'a trouvé :
       slugifier le markdown BRUT produisait 7 ancres fausses sur 586, du genre
       `#dragonbornhttpswwwdndbeyondcomspecies1751435-dragonborn` — un lien
       entier avalé dans l'ancre. Elles étaient crédibles : la bonne longueur, le
       bon début, et un site qui se construit sans broncher. Seule la
       confrontation aux `id` du site CONSTRUIT les a montrées."""
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", titre)   # [texte](url) -> texte
    t = _BALISE.sub("", t)                                # <span …>FH</span> -> FH
    t = t.replace("**", "").replace("`", "")
    t = re.sub(r"(?<!\*)\*(?!\*)", "", t)
    return " ".join(t.split())


def _titres(md_path):
    """Les titres d'une page, avec l'ancre que le site leur donnera vraiment."""
    if not md_path.exists():
        return []
    txt = md_path.read_text(encoding="utf-8")
    trouves = []
    for m in _H_MD.finditer(txt):
        niveau, titre, ancre = len(m.group(1)), m.group(2).strip(), m.group(3)
        titre = _texte_rendu(re.sub(r"\{[^}]*\}$", "", titre).strip())
        trouves.append((m.start(), niveau, titre, ancre or slugify(titre, "-")))
    for m in _H_HTML.finditer(txt):
        titre = _texte_rendu(m.group(3))
        if titre:
            trouves.append((m.start(), int(m.group(1)), titre, m.group(2)))
    trouves.sort()
    return [{"n": n, "titre": t, "ancre": a} for _, n, t, a in trouves]


def _page(chemin_md, nom):
    """Une page du nav : son url, ses titres, et ses pages-filles s'il y en a.

    ⭐ LA RÈGLE DES FILLES, dérivée et non déclarée : une page `X.md` qui a un
       dossier frère `X/` possède les pages de ce dossier. C'est ce que la passe
       produit déjà pour `classes`, `species` et `arcana` — le menu le lit au
       lieu qu'on le redise."""
    md = DOCS / chemin_md
    slug = chemin_md[:-3]
    url = ("" if slug == "index" else slug.replace("/index", "") + "/")
    noeud = {"rang": "B", "titre": nom, "url": url, "titres": _titres(md)}
    dossier = DOCS / slug
    if dossier.is_dir():
        filles = []
        for f in sorted(dossier.glob("*.md")):
            if f.name == "index.md":
                continue
            t = _titres(f)
            h1 = re.search(r"^#\s+(.+)$", f.read_text(encoding="utf-8"), re.M)
            filles.append({"rang": "SB",
                           "titre": (h1.group(1).strip() if h1 else f.stem.title()),
                           "url": f"{slug}/{f.stem}/",
                           "titres": t})
        if filles:
            noeud["filles"] = filles
    return noeud


def main():
    conf = yaml.load((ROOT / "mkdocs.yml").read_text(encoding="utf-8"), Loader=_Loader)
    arbre = []
    for entree in conf["nav"]:
        (nom, valeur), = entree.items()
        if isinstance(valeur, str):                      # une page seule à la racine
            arbre.append({"rang": "R", "titre": nom, "url": valeur[:-3].replace("index", "") ,
                          "pages": [_page(valeur, nom)]})
            continue
        pages = []
        for sous in valeur:                              # un menu racine
            (n2, v2), = sous.items()
            if isinstance(v2, str):
                pages.append(_page(v2, n2))
        arbre.append({"rang": "R", "titre": nom, "url": pages[0]["url"] if pages else "",
                      "pages": pages})

    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    SORTIE.write_text(
        "/* ⛔ FICHIER GÉNÉRÉ par build_nav.py — ne pas éditer à la main.\n"
        "   Il dérive du `nav:` de mkdocs.yml et des titres de docs/.\n"
        "   Une correction se fait à la SOURCE, jamais ici : ce fichier est\n"
        "   réécrit à chaque passe et toute retouche serait perdue en silence. */\n"
        "window.FH_NAV = " + json.dumps(arbre, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")

    r = sum(1 for _ in arbre)
    b = sum(len(x["pages"]) for x in arbre)
    sb = sum(len(p.get("filles", [])) for x in arbre for p in x["pages"])
    t = sum(len(p["titres"]) for x in arbre for p in x["pages"]) \
      + sum(len(f["titres"]) for x in arbre for p in x["pages"] for f in p.get("filles", []))
    print(f"  ok  fh-nav.js              <- mkdocs.yml + docs/  "
          f"({r} R · {b} B · {sb} SB · {t} titres)")


if __name__ == "__main__":
    main()
