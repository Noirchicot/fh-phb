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
import re, os, json, html, pathlib

# ── CITER LE SRD, JAMAIS LE COPIER ──────────────────────────────────────────
# Un chapitre peut porter une ligne `{{srd:weapon-mastery}}`. Elle n'est PAS du
# texte : c'est une citation, résolue ICI, à la construction, depuis les exports
# de `fh-srd`. Ce que ça achète, et pourquoi ça vaut la dépendance :
#   - le joueur lit la règle officielle sur la page FH, sans quitter le livre ;
#   - il n'existe toujours qu'UN exemplaire du texte SRD — celui de `fh-srd` ;
#   - une correction de l'extraction (il y en a eu deux le 2026-08-20) se
#     propage à la construction suivante, sans que personne ait à s'en souvenir ;
#   - l'attribution CC-BY est générée AVEC le bloc, donc elle ne peut pas être
#     oubliée ;
#   - citer une règle qui a disparu CASSE la construction au lieu de mentir.
# 🔴 Le bloc produit vit dans `docs/`, réécrit à chaque passe : il n'y a donc
#    rien à éditer à la main qui survivrait. La garde est structurelle, pas
#    disciplinaire — c'est ce qui la fait tenir dans deux mois.
# ── L'ATTRIBUTION NE SE RÉPÈTE PAS ─────────────────────────────────────────
# Eric, 2026-08-21 : « on n'a pas besoin de mettre "quoted from SRD" toutes les
# 10 lignes ». Mesuré : le texte complet de la licence apparaissait HUIT fois
# sur `equipment.md`, une par bloc cité.
# 🔴 Et ce n'est pas qu'une question de maquette. La CC BY 4.0 exige UNE mention
#    — « This work includes material from the System Reference Document 5.2.1… »
#    — et demande explicitement de ne pas en ajouter d'autres à Wizards. Un
#    emplacement unique suffit, et il vaut mieux : au pied de page global, la
#    mention est sur TOUTES les pages, y compris celles qui ne citent rien.
# ⚠️ La conformité est donc maintenue, pas allégée. Le pied de page est réglé
#    par `copyright:` dans `mkdocs.yml` ; si cette ligne disparaît, remettre
#    ATTR_PAR_BLOC à True le même jour.
ATTR_PAR_BLOC = False

SRD_ROOT = pathlib.Path(os.environ.get("FH_SRD", "/Users/Eric/tools/fh-srd"))
SRD_EXPORTS = SRD_ROOT / "exports" / "srd"
CITE_RE = re.compile(
    r"^\{\{srd:([a-z0-9-]+)(?::([a-z0-9,\- ]+))?(?:!([a-z0-9,\- ]+))?\}\}[ \t]*$", re.M)


class SrdCiteError(RuntimeError):
    """Une citation qui ne résout pas. On s'arrête : une page qui cite une règle
    absente est pire qu'une page qui ne la cite pas."""


_SRD_CACHE = {}
_SRD_ETAT = {}


def _srd_etat_fichier(rel):
    """Ce fichier d'export est-il publiable, ou bien un lot le tient-il ?

    🔴 LE DÉFAUT QUE CECI FERME. `SRD_ROOT` pointe vers un dépôt VOISIN, et on y
    lit l'ARBRE DE TRAVAIL — pas un état commité. Si un lot tourne dans `fh-srd`
    (branche non fusionnée, fichiers modifiés), une construction du site
    embarquerait du travail non revu dans un livre publié, **sans que rien ne le
    dise**. Repéré par l'archi FHPC le 2026-08-20, alors que `20-vivier-maitrises`
    tenait `class.json` dans les deux langues.

    ⭐ La question posée est plus fine que « l'arbre est-il sale » : c'est
    « CE fichier dit-il autre chose que `main` ? ». Un lot qui travaille sur
    `class.json` n'a aucune raison d'interdire de citer `weapon.json`. On compare
    donc au vrai référentiel de publication, et la réponse couvre les deux cas
    d'un coup — modification non commitée ET branche divergente.

    Retourne None si le fichier est publiable, sinon la raison, en clair.
    """
    if rel in _SRD_ETAT:
        return _SRD_ETAT[rel]
    raison = None
    try:
        import subprocess
        base = subprocess.run(
            ["git", "-C", str(SRD_ROOT), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=10)
        if base.returncode == 0:
            branche = base.stdout.strip()
            diff = subprocess.run(
                ["git", "-C", str(SRD_ROOT), "diff", "--quiet", "main", "--", rel],
                capture_output=True, timeout=10)
            if diff.returncode == 1:
                raison = (
                    "%s diffère de `main` dans %s (branche courante : %s). Un lot le "
                    "tient : citer maintenant publierait du travail non fusionné. "
                    "Attendre la fusion, ou passer FH_SRD_ALLOW_UNMERGED=1 en sachant "
                    "ce qu'on fait." % (rel, SRD_ROOT, branche)
                )
    except Exception:
        # git absent ou dépôt illisible : on ne bloque pas le tirage pour ça,
        # mais on ne fait pas semblant d'avoir vérifié.
        print("  ?? fh-srd : état git non vérifiable — citations non contrôlées")
    _SRD_ETAT[rel] = raison
    return raison


def _srd_load(kind, lang="en"):
    key = (kind, lang)
    if key not in _SRD_CACHE:
        f = SRD_EXPORTS / lang / (kind + ".json")
        if not f.exists():
            raise SrdCiteError(
                "{{srd:%s}} : %s est introuvable. Le dépôt fh-srd est attendu "
                "en %s (surchargeable par la variable FH_SRD)." % (kind, f, SRD_ROOT)
            )
        rel = "exports/srd/%s/%s.json" % (lang, kind)
        if not os.environ.get("FH_SRD_ALLOW_UNMERGED"):
            raison = _srd_etat_fichier(rel)
            if raison:
                raise SrdCiteError("{{srd:%s}} : %s" % (kind, raison))
        _SRD_CACHE[key] = json.loads(f.read_text(encoding="utf-8"))
    return _SRD_CACHE[key]


def _srd_block(kind, slugs, lang="en", sauf=None):
    doc = _srd_load(kind, lang)
    by_slug = {r["slug"]: r for r in doc["records"]}
    if slugs:
        wanted = [s.strip() for s in slugs.split(",") if s.strip()]
        missing = [s for s in wanted if s not in by_slug]
        if missing:
            raise SrdCiteError(
                "{{srd:%s:%s}} : %s n'existe pas dans %s.json (disponibles : %s)."
                % (kind, slugs, ", ".join(missing), kind, ", ".join(sorted(by_slug)))
            )
        records = [by_slug[s] for s in wanted]
    else:
        records = doc["records"]

    # ── L'EXCLUSION, ET POURQUOI ELLE EXISTE ────────────────────────────────
    # Certains termes du SRD sont REDÉFINIS par Fate's Hand. Les citer verbatim
    # à côté de la règle FH recréerait la double source qu'on passe la journée
    # à supprimer : le lecteur verrait deux définitions et ne saurait pas
    # laquelle fait foi. On les retire de la citation, et le chapitre dit en
    # toutes lettres lesquels et où FH les définit — « quand on change les
    # règles, on change les règles ».
    # 🔴 Un slug exclu qui n'existe pas CASSE : sinon une entrée renommée en
    #    amont réapparaîtrait silencieusement dans la page, contredisant FH.
    if sauf:
        retires = [s.strip() for s in sauf.split(",") if s.strip()]
        inconnus = [s for s in retires if s not in by_slug]
        if inconnus:
            raise SrdCiteError(
                "{{srd:%s!%s}} : %s n'existe pas dans %s.json — une exclusion qui "
                "ne mord sur rien laisserait passer ce qu'elle devait retirer."
                % (kind, sauf, ", ".join(inconnus), kind))
        ecarte = set(retires)
        records = [r for r in records if r["slug"] not in ecarte]

    records = _ecarter(records, kind, None, kind)
    if not records:
        raise SrdCiteError("{{srd:%s}} : aucun enregistrement à citer." % kind)

    pages = sorted({r.get("source_locator", "") for r in records} - {""})
    where = " et ".join(pages)
    label = doc.get("layer_label", "SRD")
    attr = records[0].get("attribution", "")

    out = [
        "<!-- GENERATED — cité depuis fh-srd (kind=%s, lang=%s, run=%s). "
        "Ne pas éditer : réécrit par sync_from_vault.py à chaque passe. -->"
        % (kind, lang, doc.get("import_run", "?")),
        '<div class="fh-srd-cite">',
        '<p class="fh-srd-cite__label"><strong>%s</strong>%s — the '
        'official wording, unaltered</p>'
        % (html.escape(label), (" · " + html.escape(where)) if where else ""),
        '<dl class="fh-srd-cite__list">',
    ]
    for r in records:
        out.append("<dt>%s</dt>" % html.escape(r["name"]))
        out.append("<dd>%s</dd>" % html.escape(r["data"]["description"]))
    out.append("</dl>")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


def _srd_weapons_by_mastery(lang="en"):
    """L'index « quelle arme porte quelle maîtrise ».

    Il n'existe dans AUCUN export : c'est une vue, dérivée de `weapon.json` au
    moment de la construction. On la génère plutôt que de la retaper, pour la
    même raison que le reste — une liste tapée à la main dérive dès qu'une arme
    change de maîtrise en amont, et personne ne s'en aperçoit."""
    doc = _srd_load("weapon", lang)
    groupes = {}
    for r in doc["records"]:
        m = r["data"].get("mastery")
        if m:
            groupes.setdefault(m, []).append(r["name"])
    if not groupes:
        raise SrdCiteError(
            "{{srd:weapons-by-mastery}} : aucune arme ne porte de maîtrise dans "
            "weapon.json — la colonne a disparu de l'extraction."
        )
    out = [
        "<!-- GENERATED — dérivé de fh-srd weapon.json (run=%s). Ne pas éditer. -->"
        % doc.get("import_run", "?"),
        '<div class="fh-srd-cite fh-srd-cite--index">',
        '<p class="fh-srd-cite__label">Derived from <strong>%s</strong> — which weapons '
        "carry which mastery</p>" % html.escape(doc.get("layer_label", "SRD")),
        '<dl class="fh-srd-cite__list">',
    ]
    for m in sorted(groupes):
        armes = sorted(groupes[m])
        out.append("<dt>%s <span>· %d</span></dt>" % (html.escape(m), len(armes)))
        out.append("<dd>%s</dd>" % html.escape(", ".join(armes)))
    out.append("</dl>")
    # Dérivé ou cité, ça reste du SRD affiché : l'attribution suit la donnée.
    attr = doc["records"][0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


# ── Les tables citées ───────────────────────────────────────────────────────
# ⭐ La distinction qui autorise ceci (Eric, 2026-08-20) : citer contraint les
#    MOTS, pas la PRÉSENTATION. Aucune valeur n'est retapée — tout sort des
#    exports. Ce qui est à nous, c'est la mise en page et le regroupement ; ce
#    qui est au SRD, ce sont les nombres, et ils viennent de la source.
#    Et c'est ce qui tient sa contrainte : « un joueur doit trouver tous les
#    éléments au même endroit sans naviguer à droite à gauche. »
#
# ⚠️ Deux règles apprises en construisant la première, à ne pas réapprendre :
#    - un champ mécanique peut valoir ZÉRO. Les armures lourdes portent
#      `ac_dex_cap: 0`, pas `None` : « absent » se teste explicitement, jamais
#      par véracité booléenne. Le même piège existe côté fhpc (`points: 0`).
#    - un champ porte sa propre forme. `strength` vaut déjà « Str 13 » ; on le
#      LIT, on ne le re-préfixe pas. Et `properties` est une chaîne dont les
#      parenthèses portent des valeurs (« Ammunition (Range 80/320; Bolt) ») :
#      on l'affiche telle quelle plutôt que de la découper.


def _txt(v):
    return "—" if v is None or v == "" else str(v)


def _armor_family(d):
    if d.get("name") == "Shield":
        return "Shield"
    if d.get("ac_dex_cap"):            # un plafond réel : armure moyenne
        return "Medium armor"
    if "Dex" in (d.get("armor_class") or ""):
        return "Light armor"           # pas de plafond, mais la Dex compte
    return "Heavy armor"               # cap 0 : la Dex ne compte pas


def _weapon_family(d):
    cat = (d.get("weapon_category") or "").capitalize()
    portee = (d.get("weapon_range") or "").capitalize()
    return ("%s %s" % (cat, portee)).strip() or "Weapons"


SRD_TABLES = {
    "armor-table": {
        "kind": "armor",
        "note": "every value as printed",
        "columns": [
            ("Armor",       lambda d: d["name"]),
            ("Armor Class", lambda d: _txt(d.get("armor_class"))),
            ("Strength",    lambda d: _txt(d.get("strength"))),
            ("Stealth",     lambda d: "Disadvantage" if d.get("stealth_disadvantage") else "—"),
            ("Cost",        lambda d: _txt(d.get("cost"))),
            ("Weight",      lambda d: _txt(d.get("weight"))),
        ],
        "group": _armor_family,
        "group_order": ["Light armor", "Medium armor", "Heavy armor", "Shield"],
        "sort": lambda d: (d.get("ac_base") or 0, d["name"]),
    },
    "weapon-table": {
        "kind": "weapon",
        "note": "all 38, every value as printed",
        "columns": [
            ("Weapon",     lambda d: d["name"]),
            ("Damage",     lambda d: _txt(d.get("damage"))),
            ("Properties", lambda d: _txt(d.get("properties"))),
            ("Mastery",    lambda d: _txt(d.get("mastery"))),
            ("Cost",       lambda d: _txt(d.get("cost"))),
            ("Weight",     lambda d: _txt(d.get("weight"))),
        ],
        "group": _weapon_family,
        "group_order": ["Simple Melee", "Simple Ranged", "Martial Melee", "Martial Ranged"],
        "sort": lambda d: d["name"],
    },
    "gear-table": {
        "kind": "gear",
        "note": "every price as printed",
        "columns": [
            ("Item",   lambda d: d["name"]),
            ("Cost",   lambda d: _txt(d.get("cost"))),
            ("Weight", lambda d: _txt(d.get("weight"))),
        ],
        "group": None,
        "group_order": [],
        "sort": lambda d: d["name"],
    },
    "tool-table": {
        "kind": "tool",
        "note": "what each one asks, and what it makes",
        "columns": [
            ("Tool",    lambda d: d["name"]),
            ("Ability", lambda d: _txt(d.get("ability"))),
            ("Utilize", lambda d: _txt(d.get("utilize"))),
            ("Craft",   lambda d: _txt(d.get("craft"))),
            ("Cost",    lambda d: _txt(d.get("cost"))),
            ("Weight",  lambda d: _txt(d.get("weight"))),
        ],
        "group": None,
        "group_order": [],
        "sort": lambda d: d["name"],
    },
}


def _fh_retires(kind):
    """Les records que Fate's Hand a RETIRÉS pour ce genre.

    ⭐ Dérivé de `fh-changes.json`, jamais tenu à la main. Une liste d'exclusions
    écrite à la main est exactement la forme qui pourrit — celle qu'on venait de
    retirer du menu de tête. Ici la règle est mécanique et sans jugement :
    **un record que FH a retiré n'existe pas dans le jeu, donc le citer publie
    une règle que personne ne peut jouer.** Aucune exception à peser.

    ⛔ ET LA FRONTIÈRE EST NETTE : `patched` ne se dérive PAS de la même façon.
       Un record patché existe toujours ; c'est son contenu qui diverge, et
       décider s'il entre en concurrence demande un œil. `Skilled` en est le cas
       d'école — le don existe, c'est son PRIX qui change — d'où une exclusion
       manuelle qui reste manuelle, et qui sait pourquoi.
    """
    changes = _fh_changes() or {}
    return {n for n in ((changes.get(kind) or {}).get("removed") or [])}


_RETIRES_VUS = {}


def _ecarter(records, kind, sauf, quoi):
    """Retire d'une citation les entrées que Fate's Hand REMPLACE.

    ⭐ Eric, 2026-08-20 : « dégager les concurrents SRD ». Une entrée du SRD que
    FH a remplacée, citée à côté de la version FH, est un concurrent : le
    lecteur voit deux règles et ne sait pas laquelle vaut. C'est la même
    précaution que les sept exclusions du glossaire, généralisée aux tables.
    🔴 Un slug inconnu CASSE : une exclusion qui ne mord sur rien laisserait
       réapparaître le concurrent le jour où l'amont le renomme, en silence.
    """
    # ① D'abord la règle dérivée : ce que FH a retiré ne se cite pas.
    retires = _fh_retires(kind)
    if retires:
        avant = len(records)
        records = [r for r in records if r["name"] not in retires]
        if len(records) != avant:
            _RETIRES_VUS.setdefault(quoi, []).extend(
                sorted(retires & {r["name"] for r in []} or
                       {n for n in retires}))
    # ② Puis les exclusions à la main, réservées aux cas de jugement.
    if not sauf:
        return records
    par_slug = {r["slug"] for r in records}
    retires = [s.strip() for s in sauf.split(",") if s.strip()]
    inconnus = [s for s in retires if s not in par_slug]
    if inconnus:
        raise SrdCiteError(
            "{{srd:%s!%s}} : %s n'existe pas dans %s — une exclusion qui ne mord "
            "sur rien laisserait passer ce qu'elle devait retirer."
            % (quoi, sauf, ", ".join(inconnus), kind))
    ecarte = set(retires)
    return [r for r in records if r["slug"] not in ecarte]


def _srd_table(nom, lang="en", sauf=None):
    spec = SRD_TABLES[nom]
    doc = _srd_load(spec["kind"], lang)
    records = _ecarter(doc["records"], spec["kind"], sauf, nom)
    if not records:
        raise SrdCiteError("{{srd:%s}} : %s.json est vide." % (nom, spec["kind"]))

    familles = {}
    for r in records:
        cle = spec["group"](r["data"]) if spec["group"] else ""
        familles.setdefault(cle, []).append(r)
    ordre = [g for g in spec["group_order"] if g in familles]
    ordre += [g for g in familles if g not in ordre]
    inconnus = [g for g in familles if g and g not in spec["group_order"]]
    if inconnus and spec["group_order"]:
        raise SrdCiteError(
            "{{srd:%s}} : groupe inattendu %s — la forme de la source a changé, "
            "la table mentirait sur l'ordre." % (nom, ", ".join(sorted(inconnus)))
        )

    pages = sorted({r.get("source_locator", "") for r in records} - {""})
    out = [
        "<!-- GENERATED — cité depuis fh-srd %s.json (run=%s). Ne pas éditer : "
        "réécrit par sync_from_vault.py. -->" % (spec["kind"], doc.get("import_run", "?")),
        '<div class="fh-srd-cite fh-srd-cite--table">',
        '<p class="fh-srd-cite__label"><strong>%s</strong>%s — %s</p>'
        % (html.escape(doc.get("layer_label", "SRD")),
           (" · " + html.escape(" et ".join(pages))) if pages else "",
           html.escape(spec["note"])),
        '<table class="fh-srd-table">',
        "<thead><tr>%s</tr></thead>"
        % "".join("<th>%s</th>" % html.escape(c[0]) for c in spec["columns"]),
        "<tbody>",
    ]
    for famille in ordre:
        if famille:
            out.append('<tr class="fh-srd-table__group"><th colspan="%d">%s</th></tr>'
                       % (len(spec["columns"]), html.escape(famille)))
        for r in sorted(familles[famille], key=lambda x: spec["sort"](x["data"])):
            d = r["data"]
            out.append("<tr>%s</tr>" % "".join(
                "<td>%s</td>" % html.escape(str(fn(d))) for _, fn in spec["columns"]))
    out.append("</tbody></table>")
    attr = records[0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


def _srd_mastery_by_class(lang="en"):
    """Quelles classes ouvrent la maîtrise d'arme, combien, et sur quel vivier.

    Vue DÉRIVÉE de trois exports qui ne la portent nulle part telle quelle :
    `class.json` (le vivier, `weapon_mastery_from`), `class-progression.json`
    (combien à la fois, niveau par niveau) et `weapon.json` (les noms).
    C'est ce qui rend vraie la phrase du chapitre — « read them in your class
    entry » — sans que le joueur ait à sortir de la page.

    ⚠️ Le vivier ne dépend PAS du niveau : la table de progression dit « MORE
    kinds », pas « d'autres kinds ». Seul le COMPTE grandit. Ne pas inverser.
    """
    classes = _srd_load("class", lang)
    progression = _srd_load("class-progression", lang)
    armes = {r["id"]: r["name"] for r in _srd_load("weapon", lang)["records"]}
    par_classe = {r["name"]: r["data"] for r in progression["records"]}

    lignes = []
    for r in sorted(classes["records"], key=lambda x: x["name"]):
        vivier = r["data"].get("weapon_mastery_from")
        if not vivier:
            continue
        manquants = [i for i in vivier if i not in armes]
        if manquants:
            raise SrdCiteError(
                "{{srd:mastery-by-class}} : %s cite des armes absentes de weapon.json "
                "(%s) — les deux exports ne parlent plus de la même chose."
                % (r["name"], ", ".join(manquants[:3]))
            )
        # Les paliers : on ne garde que les niveaux où le compte CHANGE.
        # ⚠️ Seules DEUX classes en ont — le barbare et le guerrier portent une
        #    colonne « Weapon Mastery » dans leur table. Pour les trois autres le
        #    nombre ne bouge jamais, donc la table n'a pas de colonne et le compte
        #    vit sur le record de classe. Ce n'est pas un trou : c'est la forme de
        #    la source, et la lecture doit s'y plier plutôt que la déclarer cassée.
        prog = par_classe.get(r["name"])
        paliers, precedent = [], None
        for niveau in (prog or {}).get("levels", []):
            combien = niveau.get("resources", {}).get("weapon_mastery")
            if combien is not None and combien != precedent:
                paliers.append((niveau["level"], combien))
                precedent = combien
        if paliers:
            combien = "%d at a time" % paliers[0][1]
            if len(paliers) > 1:
                combien += ", then " + ", ".join(
                    "%d from level %d" % (n, lvl) for lvl, n in paliers[1:])
        elif r["data"].get("weapon_mastery_count"):
            combien = "%d at a time, at every level" % r["data"]["weapon_mastery_count"]
        else:
            raise SrdCiteError(
                "{{srd:mastery-by-class}} : %s a un vivier mais aucun compte de "
                "maîtrises, ni dans sa progression ni sur son record." % r["name"])
        lignes.append((r["name"], combien,
                       sorted(armes[i] for i in vivier), len(vivier)))

    if not lignes:
        raise SrdCiteError(
            "{{srd:mastery-by-class}} : aucune classe ne porte de vivier — "
            "le champ weapon_mastery_from a disparu de class.json.")

    out = [
        "<!-- GENERATED — dérivé de fh-srd class.json + class-progression.json + "
        "weapon.json (run=%s). Ne pas éditer. -->" % classes.get("import_run", "?"),
        '<div class="fh-srd-cite fh-srd-cite--index">',
        '<p class="fh-srd-cite__label">Derived from <strong>%s</strong> — the %d classes '
        "that grant mastery, and what each may choose from</p>"
        % (html.escape(classes.get("layer_label", "SRD")), len(lignes)),
        '<dl class="fh-srd-cite__list">',
    ]
    for nom, combien, noms, total in lignes:
        out.append("<dt>%s <span>· %s</span></dt>"
                   % (html.escape(nom), html.escape(combien)))
        out.append("<dd><em>%d weapons to choose from</em> — %s</dd>"
                   % (total, html.escape(", ".join(noms))))
    out.append("</dl>")
    attr = classes["records"][0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


def _srd_feats(lang="en", sauf=None):
    """Les dons du SRD, groupés par catégorie et cités.

    Une table ne convient pas : la description d'un don est un paragraphe, pas
    une cellule. On garde donc la forme d'une citation — terme puis texte — et
    on ajoute le prérequis, qui vit dans son propre champ et se perdrait sinon.
    ⚠️ Le prérequis peut être ABSENT (un don d'origine n'en a pas) : « absent »
    se teste explicitement, il ne se déduit pas d'une chaîne vide.
    """
    doc = _srd_load("feat", lang)
    libelles = {"origin": "Origin feats", "general": "General feats",
                "fighting-style": "Fighting Style feats", "epic-boon": "Epic Boons"}
    groupes = {}
    for r in _ecarter(doc["records"], "feat", sauf, "feat-list"):
        groupes.setdefault(r["data"].get("category") or "other", []).append(r)
    inconnus = [c for c in groupes if c not in libelles]
    if inconnus:
        raise SrdCiteError(
            "{{srd:feat-list}} : catégorie inattendue %s — la source a changé de "
            "forme, le groupement mentirait." % ", ".join(sorted(inconnus)))
    pages = sorted({r.get("source_locator", "") for r in doc["records"]} - {""})
    out = [
        "<!-- GENERATED — cité depuis fh-srd feat.json (run=%s). Ne pas éditer. -->"
        % doc.get("import_run", "?"),
        '<div class="fh-srd-cite">',
        '<p class="fh-srd-cite__label"><strong>%s</strong>%s — all %d, '
        "as printed</p>"
        % (html.escape(doc.get("layer_label", "SRD")),
           (" · " + html.escape(" et ".join(pages))) if pages else "",
           doc.get("count", len(doc["records"]))),
    ]
    for cle in ("origin", "general", "fighting-style", "epic-boon"):
        if cle not in groupes:
            continue
        out.append('<p class="fh-srd-cite__group">%s</p>' % html.escape(libelles[cle]))
        out.append('<dl class="fh-srd-cite__list">')
        for r in sorted(groupes[cle], key=lambda x: x["name"]):
            d = r["data"]
            prereq = d.get("prerequisite")
            out.append("<dt>%s%s</dt>" % (
                html.escape(r["name"]),
                (' <span>· %s</span>' % html.escape(prereq)) if prereq else ""))
            out.append("<dd>%s</dd>" % html.escape(d.get("description") or "—"))
        out.append("</dl>")
    attr = doc["records"][0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


def _srd_spells(lang="en", niveaux=None):
    """Les sorts du SRD, groupés par niveau.

    Un sort n'est pas qu'un nom et un texte : il porte huit champs de forme
    (école, temps d'incantation, portée, composantes, durée, concentration,
    rituel, classes) qu'un joueur lit AVANT la description. On les rend donc
    sur une ligne de tête, et la description en dessous.
    ⚠️ `level` vaut ZÉRO pour un cantrip. « Absent » se teste explicitement —
    c'est le piège du jour, sous sa sixième forme.
    """
    doc = _srd_load("spell", lang)
    doc = dict(doc, records=_ecarter(doc["records"], "spell", None, "spell-list"))
    voulus = None
    if niveaux:
        voulus = set()
        for n in niveaux.split(","):
            n = n.strip()
            if not n.isdigit() or not 0 <= int(n) <= 9:
                raise SrdCiteError(
                    "{{srd:spell-list:%s}} : « %s » n'est pas un niveau de sort "
                    "(0 à 9)." % (niveaux, n))
            voulus.add(int(n))
    par_niveau = {}
    for r in doc["records"]:
        lvl = r["data"].get("level")
        if lvl is None:
            raise SrdCiteError(
                "{{srd:spell-list}} : %s n'a pas de niveau — la source a changé "
                "de forme." % r["name"])
        if voulus is None or lvl in voulus:
            par_niveau.setdefault(lvl, []).append(r)
    if not par_niveau:
        raise SrdCiteError("{{srd:spell-list}} : aucun sort à ce niveau.")

    def titre(lvl):
        return "Cantrips" if lvl == 0 else "Level %d" % lvl

    pages = sorted({r.get("source_locator", "") for r in doc["records"]} - {""})
    total = sum(len(v) for v in par_niveau.values())
    out = [
        "<!-- GENERATED — cité depuis fh-srd spell.json (run=%s). Ne pas éditer. -->"
        % doc.get("import_run", "?"),
        '<div class="fh-srd-cite fh-srd-cite--spells">',
        '<p class="fh-srd-cite__label"><strong>%s</strong>%s — %d spells, '
        "as printed</p>"
        % (html.escape(doc.get("layer_label", "SRD")),
           (" · " + html.escape(pages[0] + "–" + pages[-1])) if len(pages) > 1
           else (" · " + html.escape(pages[0]) if pages else ""),
           total),
    ]
    for lvl in sorted(par_niveau):
        out.append('<p class="fh-srd-cite__group">%s</p>' % titre(lvl))
        out.append('<dl class="fh-srd-cite__list">')
        for r in sorted(par_niveau[lvl], key=lambda x: x["name"]):
            d = r["data"]
            forme = [d.get("school") or ""]
            if d.get("ritual"):
                forme.append("ritual")
            if d.get("concentration"):
                forme.append("concentration")
            meta = " · ".join(x for x in [
                ", ".join(f for f in forme if f),
                d.get("casting_time"), d.get("range"),
                d.get("components"), d.get("duration"),
            ] if x)
            classes = d.get("classes")
            # 🔗 CHAQUE SORT PORTE SON ANCRE (`spell-<slug>`) — Eric, 2026-08-30,
            #    loi générale : *« dès qu'un skill, feat, trait, feature, spell,
            #    invocation, training apparaît, il y a un lien vers le site FH
            #    web »*. Un lien suppose une cible : sans ancre, le builder ne
            #    peut pointer qu'un chapitre entier. Même patron que `opt-<nom>`
            #    et `l<niveau>-<nom>` — prévisible, composable sans lire la page.
            out.append('<dt id="spell-%s">%s</dt>' % (
                re.sub(r"[^a-z0-9]+", "-", r["name"].lower()).strip("-"),
                html.escape(r["name"])))
            out.append('<dd><span class="fh-spell-meta">%s</span>%s%s</dd>' % (
                html.escape(meta),
                ('<span class="fh-spell-classes">%s</span>' % html.escape(
                    ", ".join(classes) if isinstance(classes, list) else str(classes))
                 ) if classes else "",
                html.escape(d.get("description") or "—")))
        out.append("</dl>")
    attr = doc["records"][0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


ITEM_LABELS = {
    "weapon": "Weapons", "armor": "Armor", "potion": "Potions", "ring": "Rings",
    "rod": "Rods", "scroll": "Scrolls", "staff": "Staves", "wand": "Wands",
    "wondrous-item": "Wondrous items",
}


def _srd_items(lang="en"):
    """Les objets magiques du SRD, groupés par catégorie.

    ⚠️ On groupe sur `category` (9 valeurs propres) et NON sur `rarity` : ce
    dernier est du texte libre — 30 valeurs distinctes, dont
    « Uncommon (+1), Rare (+2), or Very Rare (+3) (Requires Attunement by a
    Spellcaster) ». Grouper dessus produirait trente sections d'un objet.
    La rareté reste affichée telle quelle sur la ligne de tête : c'est une
    citation, on ne la normalise pas.
    """
    doc = _srd_load("item", lang)
    doc = dict(doc, records=_ecarter(doc["records"], "item", None, "item-list"))
    groupes = {}
    for r in doc["records"]:
        groupes.setdefault(r["data"].get("category") or "other", []).append(r)
    inconnus = [c for c in groupes if c not in ITEM_LABELS]
    if inconnus:
        raise SrdCiteError(
            "{{srd:item-list}} : catégorie inattendue %s — la source a changé de "
            "forme, le groupement mentirait." % ", ".join(sorted(inconnus)))
    pages = sorted({r.get("source_locator", "") for r in doc["records"]} - {""})
    out = [
        "<!-- GENERATED — cité depuis fh-srd item.json (run=%s). Ne pas éditer. -->"
        % doc.get("import_run", "?"),
        '<div class="fh-srd-cite fh-srd-cite--spells">',
        '<p class="fh-srd-cite__label"><strong>%s</strong>%s — all %d, '
        "as printed</p>"
        % (html.escape(doc.get("layer_label", "SRD")),
           (" · " + html.escape(pages[0] + "–" + pages[-1])) if len(pages) > 1
           else (" · " + html.escape(pages[0]) if pages else ""),
           doc.get("count", len(doc["records"]))),
    ]
    for cle in sorted(groupes, key=lambda c: ITEM_LABELS[c]):
        out.append('<p class="fh-srd-cite__group">%s <span>· %d</span></p>'
                   % (html.escape(ITEM_LABELS[cle]), len(groupes[cle])))
        out.append('<dl class="fh-srd-cite__list">')
        for r in sorted(groupes[cle], key=lambda x: x["name"]):
            d = r["data"]
            tete = [x for x in (d.get("rarity"), d.get("subtype")) if x]
            out.append("<dt>%s</dt>" % html.escape(r["name"]))
            out.append('<dd><span class="fh-spell-meta">%s</span>%s</dd>' % (
                html.escape(" · ".join(tete)), html.escape(d.get("description") or "—")))
        out.append("</dl>")
    attr = doc["records"][0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


def _srd_classes(lang="en"):
    """Les douze classes du SRD, en fiches citées.

    🔴 CE QUI EST DÉLIBÉRÉMENT ÉCARTÉ, et c'est le cœur de cette vue :
    `skill_proficiencies` et `skill_choice`. La ligne du SRD nomme **Perception**
    — que Fate's Hand a supprimée — et puise dans les 18 compétences du SRD au
    lieu des 26 de FH. La citer mettrait une compétence inexistante sur une page
    FH, et donnerait un second compte de points à côté de la table des points
    liés. C'est la même précaution que les sept exclusions du glossaire.
    ⚠️ `weapon_mastery_*` est écarté aussi : il est déjà cité dans *Equipment*,
    et une règle publiée deux fois est une règle qui divergera.
    """
    doc = _srd_load("class", lang)
    lignes = [
        ("Hit die",         lambda d: d.get("hit_point_die")),
        ("Primary ability", lambda d: d.get("primary_ability")),
        ("Saving throws",   lambda d: ", ".join(d.get("saving_throw_proficiencies") or []) or None),
        ("Armor training",  lambda d: d.get("armor_training")),
        ("Weapons",         lambda d: d.get("weapon_proficiencies")),
        ("Tools",           lambda d: d.get("tool_proficiencies")),
        ("Starting equipment", lambda d: d.get("starting_equipment")),
    ]
    out = [
        "<!-- GENERATED — cité depuis fh-srd class.json (run=%s). Ne pas éditer. -->"
        % doc.get("import_run", "?"),
        '<div class="fh-srd-cite fh-srd-cite--spells">',
        '<p class="fh-srd-cite__label"><strong>%s</strong> — all %d classes, '
        "as printed, minus their skill lines</p>"
        % (html.escape(doc.get("layer_label", "SRD")), doc.get("count", 0)),
    ]
    for r in sorted(doc["records"], key=lambda x: x["name"]):
        d = r["data"]
        out.append('<p class="fh-srd-cite__group">%s</p>' % html.escape(r["name"]))
        out.append('<dl class="fh-srd-cite__list">')
        for libelle, prendre in lignes:
            v = prendre(d)
            if v is None or v == "":
                continue
            out.append("<dt>%s</dt><dd>%s</dd>" % (html.escape(libelle), html.escape(str(v))))
        traits = d.get("features") or []
        if traits:
            out.append("<dt>Features</dt><dd>%s</dd>"
                       % html.escape(", ".join(f.get("name", "?") for f in traits)))
        out.append("</dl>")
    attr = doc["records"][0].get("attribution", "")
    if attr:
        if ATTR_PAR_BLOC:
            out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


# ══ PCFH — LE MANUEL DU JOUEUR, PAR CLASSE ══════════════════════════════════
# Eric, 2026-08-28 : *« ce que je voudrais avoir sur FH WEB, c'est un PCFH
# (Player Companion rules) joli à lire et COMPLET. En dessous, pour moi, c'est
# du synthétique SRFH+ rules. »* Puis : *« je veux un tableau de ce type et le
# texte comme ça pour chaque classe — tu dois intégrer dans le tableau destiny,
# free points, bound skills, bound tools, qu'on ait une vue globale et rapide
# de tout ce qu'il y a d'un coup »* · *« tu peux rajouter les images. »*
#
# ⭐ DEUX FORMATS, DEUX LECTEURS, ET C'EST LA DÉCISION : **PCFH** est le livre
#    qu'on LIT (table de progression enrichie, texte entier de chaque aptitude,
#    la sous-classe, l'image) ; **SRFH+** est la fiche qu'on CONSULTE — le
#    condensé du builder, qui reste tel quel. Le même contenu ne peut pas servir
#    les deux : l'un se parcourt, l'autre se cherche.
#
# ⛔ RIEN N'EST RETAPÉ. La progression vient de `class-progression.json`, les
#    aptitudes et leurs textes de `class.json`, les nombres Fate's Hand de
#    `fh-skills-en.layer.json` (le dépôt fhpc — c'est là qu'ils vivent
#    aujourd'hui, et c'est la seule source de ces chiffres).

FHPC_SKILLS_LAYER = pathlib.Path(
    os.environ.get("FH_FHPC", "/Users/Eric/tools/fhpc")) / "layers" / "fh-skills-en.layer.json"

_POOL_CACHE = {}


def _fh_pool(class_id):
    """Le pool Fate's Hand d'une classe — lu à la couche, jamais recopié."""
    if not _POOL_CACHE:
        try:
            data = json.loads(FHPC_SKILLS_LAYER.read_text(encoding="utf-8"))
        except OSError as err:
            raise SrdCiteError(
                "PCFH : la couche des points de classe est introuvable (%s). "
                "Sans elle, la table mentirait sur les points." % err) from None
        for cid, rec in (data.get("records", {}).get("class") or {}).items():
            pool = (rec.get("changes") or {}).get("data[fh_skill_pool]")
            if pool:
                _POOL_CACHE[cid] = pool
    return _POOL_CACHE.get(class_id)


def _fh_colonnes(pool, niveau, nom_classe):
    """Ce que Fate's Hand ajoute à la ligne d'un niveau : points libres CUMULÉS,
    points liés (skills, outils).

    ⭐ CUMULÉS, ET C'EST LE POINT : la règle dit *« vous recevez chaque palier
    TRAVERSÉ, pas seulement le dernier »*. Une colonne qui n'afficherait que le
    gain du niveau ferait compter le joueur ; celle-ci lui donne son total.
    ⛔ Deux échelles distinctes, jamais fondues : `by_level` compte sur le
    niveau de PERSONNAGE, `by_class_level` sur le niveau DE CLASSE (le +1 du
    barde). Elles coïncident tant qu'on ne multiclasse pas — cette table est
    celle d'une classe unique, et elle le dit en tête.
    """
    if not pool:
        return {}
    libres = int(pool.get("free_point_pool") or 0)
    lies = int(pool.get("bound_skill_points") or 0)
    outils = int(pool.get("bound_tool_points") or 0)
    for n, gain in (pool.get("by_level") or {}).items():
        if int(n) <= niveau:
            libres += int(gain)
    for n, gain in (pool.get("by_class_level") or {}).items():
        if int(n) <= niveau:
            libres += int(gain)
    for grant in (pool.get("grants") or []):
        if int(grant.get("level", 99)) <= niveau:
            libres += int(grant.get("points") or 0)
            lies += int(grant.get("boundSkill") or 0)
    return {"Free": str(libres), "Bound skill": str(lies), "Bound tool": str(outils)}


# ⚖️ LES LIBELLÉS QU'ERIC A RÉÉCRITS, ET EUX SEULS. Le SRD imprime « Rages »
#    et « Weapon Mastery » ; son croquis du 28/08 dit « Rages per Day » et
#    « Weapon Masteries ». Une table courte et NOMMÉE, plutôt qu'un renommage
#    en douce : ce qui n'y figure pas garde le mot du SRD, mot pour mot.
# ⭐ « Proficiency Bonus » RESTE — Eric, 2026-08-28 : *« tout est calculé
#    dessus, je ne vois pas l'utilité de changer le terme »*. Le bannissement du
#    28/08 au matin visait les TRAITS, où le bonus servait de compteur d'usages
#    (converti en échelle écrite) ; la colonne de progression, elle, nomme la
#    valeur que tout le système calcule. Deux emplois, deux sorts.
_LIBELLES_FH = {
    # 🔴 « per Long Rest » et non « per Day » — Eric, 2026-08-28, après que la
    #    mesure lui a montré l'écart : une rage revient au repos COURT, toutes
    #    au repos LONG. Le mot dit maintenant la règle.
    "Rages": "Rages per Long Rest",
    "Weapon Mastery": "Weapon Masteries",
}


def _empile(libelle):
    """« Rage Damage » -> « Rage<br>Damage » : deux mots l'un sur l'autre, DANS
    la même cellule. ⛔ Pas deux cellules — Eric : *« pas de séparation »*.
    La coupe se fait au PREMIER espace : « Rages per Day » donne « Rages » puis
    « per Day », et un libellé d'un seul mot reste entier."""
    mots = str(libelle).split(" ", 1)
    if len(mots) == 1:
        return html.escape(mots[0])
    return "%s<br>%s" % (html.escape(mots[0]), html.escape(mots[1]))


def _ancre(niveau, nom):
    """Un identifiant STABLE et PRÉVISIBLE pour une aptitude : `l3-primal-knowledge`.

    ⭐ Prévisible est le mot : le builder doit pouvoir FABRIQUER le lien sans
    lire la page. Niveau + nom en minuscules, tirets — rien qui dépende de
    l'ordre de rendu ni d'un compteur.
    """
    base = re.sub(r"[^a-z0-9]+", "-", str(nom or "").lower()).strip("-")
    return "l%s-%s" % (niveau, base) if niveau not in (None, "") else base


# ══ LES APTITUDES FH DE NIVEAU DE CLASSE ════════════════════════════════════
# 🔴 LE TROU MESURÉ PAR ERIC LE 2026-08-31 : *« au niveau 2 le rogue n'a pas été
#    édité »*. Vrai — la page rendait la progression du SRD, où le niveau 2 du
#    roublard ne porte que *Cunning Action*. **Sneak Critical**, l'aptitude FH
#    qui élargit la plage de critique, ne vivait QUE dans le callout de pied de
#    page : le lecteur qui lit sa ligne de niveau 2 ne la voyait jamais.
#
# ⭐ ERIC CLASSE : *« ça c'est du SRFH+ »*. Donc la réparation ne touche NI la
#    citation SRD (intouchable) NI le callout : l'aptitude REMONTE dans la
#    progression, à son niveau, marquée FH — là où les trois colonnes FH sont
#    déjà.
#
# ⛔ ET ELLE REMONTE, ELLE NE SE DUPLIQUE PAS. Une règle publiée s'écrit une
#    fois : ce qui monte dans la table est RETIRÉ du callout (`_promues()`).
#
# ⭐ LA SOURCE EST LE CHAPITRE DU VAULT, pas une seconde vérité : les entrées y
#    sont déjà écrites dans une forme régulière —
#    `> **<Nom>** *(level N)* *(FH)* — <texte>`.
#
# 🔴 LE FILTRE QUI ÉVITE LE MASSACRE : ne remonte QUE ce que le SRD ne nomme
#    nulle part dans sa progression. *Expertise*, *Primal Knowledge* et *Deft
#    Explorer* sont des aptitudes DU SRD que Fate's Hand commente — les remonter
#    dupliquerait une ligne existante. Mesuré sur les six entrées datées du
#    chapitre : une seule remonte, **Sneak Critical**. C'est exactement ce
#    qu'Eric a demandé de réparer, et le filtre dira de lui-même quand une
#    deuxième arrivera.
# ⚠️ DEUX FORMES POUR LA MÊME PASTILLE, et le motif doit lire les deux : le
#    vault écrit `*(FH)*`, le pipeline l'a déjà convertie en `<span…>` quand
#    `_promues()` passe. Un motif qui n'aurait connu que la première n'aurait
#    rien retiré du callout — mesuré, la règle s'affichait deux fois.
_FH_ENTREE = re.compile(
    r"^>\s*\*\*(?P<nom>[^*]+)\*\*\s*\*\(level (?P<niv>\d+)\)\*\s*"
    r"(?:\*\(FH\)\*|<span class=\"fh-tag\">FH</span>)\s*—\s*(?P<txt>.*)$")


def _md_leger(txt):
    """Le gras et l'italique d'une entrée FH, rendus — et rien d'autre.

    ⛔ Pas un moteur markdown : ce texte est du NÔTRE (le callout du vault), il
    n'emploie que `**gras**`, `*italique*` et `code`. Tout est échappé d'abord,
    donc rien de ce qui arrive ici ne peut injecter de balise.
    """
    t = html.escape(str(txt or ""))
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    return t
_FH_FEATURES = {}


def _fh_features(nom_classe):
    """Les aptitudes FH datées d'une classe, lues au chapitre du vault."""
    if not _FH_FEATURES:
        src = VAULT / MAP["classes.md"][0]
        classe, lignes = None, src.read_text(encoding="utf-8").splitlines()
        i = 0
        while i < len(lignes):
            ln = lignes[i]
            if ln.startswith("## "):
                classe = ln[3:].strip()
            m = _FH_ENTREE.match(ln) if classe else None
            if m:
                # Le texte d'une entrée court jusqu'à la ligne `>` vide qui suit.
                txt, j = [m.group("txt").strip()], i + 1
                while j < len(lignes) and lignes[j].startswith(">") \
                        and lignes[j].strip() != ">":
                    txt.append(lignes[j].lstrip("> ").strip())
                    j += 1
                _FH_FEATURES.setdefault(classe, []).append({
                    "name": m.group("nom").strip(),
                    "level": int(m.group("niv")),
                    "text": " ".join(x for x in txt if x),
                })
                i = j
                continue
            i += 1
        _FH_FEATURES.setdefault("", [])
    return _FH_FEATURES.get(nom_classe) or []


def _fh_a_promouvoir(nom_classe, noms_srd):
    """Celles que le SRD ne nomme nulle part — les seules à remonter."""
    connus = {str(n).lower() for n in noms_srd}
    return [f for f in _fh_features(nom_classe) if f["name"].lower() not in connus]


def _promues(texte):
    """Retire du callout les entrées remontées dans la table.

    Appelé sur `classes.md` APRÈS le rendu des shortcodes : le bloc
    « What Fate's Hand changes » est du markdown, la table est du HTML.
    """
    garde, sortie, i = None, [], 0
    lignes = texte.splitlines()
    promues = {f["name"].lower()
               for c, fs in _FH_FEATURES.items() for f in fs
               if f.get("promue")}
    while i < len(lignes):
        m = _FH_ENTREE.match(lignes[i])
        if m and m.group("nom").strip().lower() in promues:
            j = i + 1
            while j < len(lignes) and lignes[j].startswith(">") \
                    and lignes[j].strip() != ">":
                j += 1
            while j < len(lignes) and lignes[j].strip() == ">":
                j += 1
            i = j
            continue
        sortie.append(lignes[i])
        i += 1
    return "\n".join(sortie)


_LEGENDE_RESIDU = re.compile(r"^—+\s*Spell Slots per Spell Level\s*—*\s*")

# Un « lead-in » du SRD : un terme en tête de paragraphe, suivi d'un point, qui
# nomme la règle que la phrase énonce — « **Damage Resistance.** You have
# Resistance to… ». Le SRD l'imprime en gras ; l'export nous le rend en texte
# plat, et le paragraphe se lit alors comme une phrase parmi d'autres.
# 📏 MESURÉ sur les douze classes : 107 paragraphes, 65 termes distincts, et
#    ZÉRO faux positif — les mots de liaison admis (of, or, and, the, to, a,
#    per) suffisent à couvrir « No Concentration or Spells » et « Number of
#    Uses » sans jamais attraper une phrase ordinaire, qui commence par un verbe
#    ou un pronom non capitalisé (« You can imbue yourself… »).
_LEAD_IN = re.compile(
    r"^((?:[A-Z][\w’/+-]*|of|or|and|the|to|a|per)"
    r"(?: (?:[A-Z][\w’/+-]*|of|or|and|the|to|a|per)){0,4})\. (?=[A-Z“])")


def _prose_citee(txt, classe):
    """Un fragment de texte cité, échappé, où la table de la classe devient un lien.

    🔗 « …as shown in the Rages column of the **Barbarian Features table** » —
    cette table est juste au-dessus, elle porte `id="progression"`, et le
    lecteur n'avait aucun moyen d'y retourner. Le lien ne change pas un mot :
    il rend cliquable celui qui désigne déjà la cible.
    """
    s = html.escape(txt)
    if classe:
        nom = html.escape(classe)
        s = re.sub(r"\b%s Features table\b" % re.escape(nom),
                   '<a class="fh-lien" href="#progression">%s Features table</a>' % nom, s)
    return s


def _rendu_aptitude(paras, classe):
    """Le texte d'une aptitude, rendu LISIBLE sans qu'un mot bouge.

    🔴 Eric, 2026-08-28 : *« ce bloc texte est juste mais mochement présenté ;
    sans en changer le sens, rends-le plus digeste, aéré »*. La doctrine du
    chapitre l'autorise en toutes lettres — **citer contraint les MOTS, pas la
    PRÉSENTATION**. Ce qu'on rend ici, c'est la mise en forme que le SRD a
    perdue en traversant l'export : ses termes en gras et ses listes à puces.

    ⛔ Aucun mot ajouté, retiré ni réordonné. Trois gestes, tous typographiques :
    le lead-in reprend son gras, les puces redeviennent une liste, et la table
    citée devient le lien vers la table.
    """
    out = []
    for p in paras:
        if "•" in p:
            morceaux = [x.strip() for x in p.split("•")]
            tete, items = morceaux[0], [x for x in morceaux[1:] if x]
            if tete:
                out.append("<p>%s</p>" % _prose_citee(tete, classe))
            out.append('<ul class="fh-pcfh__puces">')
            out += ["<li>%s</li>" % _prose_citee(x, classe) for x in items]
            out.append("</ul>")
            continue
        m = _LEAD_IN.match(p)
        if m:
            terme = m.group(1)
            out.append('<p class="fh-pcfh__regle"><strong>%s.</strong> %s</p>'
                       % (html.escape(terme),
                          _prose_citee(p[len(terme) + 2:], classe)))
        else:
            out.append("<p>%s</p>" % _prose_citee(p, classe))
    return out


def _paragraphes_sans_table_plate(txt, classe):
    """Le texte d'une aptitude, DÉBARRASSÉ de la table de progression que le SRD
    y recolle en texte plat.

    🔴 Eric, 2026-08-28, sur la page du Barbare : *« Utilité de ceci ? car très
    moche »* — vingt et un paragraphes d'une ligne (« 7 +3 Feral Instinct,
    Instinctive Pounce 4 +2 3 ») qui répètent mot pour mot la table de
    progression rendue en tête de page. Aucune utilité : c'est la MÊME table,
    sans ses colonnes.

    ⚠️ ET ELLE EST INSÉRÉE AU MILIEU D'UNE PHRASE. Mesuré sur les onze : le SRD
    coupe « …to cast your level 1+ » / [table] / « spells. You regain all
    expended slots… ». Couper sans RECOLLER laisserait deux moitiés de phrase.
    Le titre « <Classe> Features » se retrouve lui aussi collé au bout du
    fragment gauche, et la légende « ——Spell Slots per Spell Level—— » au
    début du fragment droit. Trois coutures, pas une.

    ⛔ LE TÉMOIN EST « 1 À 20 », PAS LE NOM. Un premier filtre sur l'en-tête
    « Level Proficiency Bonus » n'attrapait que 4 classes sur 12 — une liste de
    motifs ne dit jamais qu'elle est incomplète. Le vrai signe qu'un bloc est LA
    progression d'une classe, c'est que ses lignes numérotent exactement 1..20.
    C'est ce qui sauve « Creating Spell Slots » du sorcier (1..5, une table de
    COÛTS que rien d'autre ne porte) : elle reste.
    """
    lignes = str(txt or "").split("\n")
    num = [i for i, l in enumerate(lignes) if re.match(r"^\d{1,2}\s", l)]
    niveaux = [int(re.match(r"^(\d{1,2})\s", lignes[i]).group(1)) for i in num]
    if niveaux != list(range(1, 21)):
        return [l.strip() for l in lignes if l.strip()]

    deb, fin = num[0], num[-1]
    # Remonter les lignes d'en-tête. Une ligne d'en-tête ne contient AUCUN point ;
    # une phrase, si. C'est ce qui empêche de mordre sur « Spell Slots. The
    # Sorcerer Features table shows… », qui porte le titre collé à son bout.
    i, remontees = deb - 1, 0
    while i >= 0 and remontees < 4:
        l = lignes[i].strip()
        if not l:
            i -= 1
            continue
        if "." in l:
            break
        deb, i, remontees = i, i - 1, remontees + 1

    avant = [l.strip() for l in lignes[:deb] if l.strip()]
    apres = [l.strip() for l in lignes[fin + 1:] if l.strip()]

    # ⚠️ LA DERNIÈRE LIGNE DE TABLE PEUT PORTER UNE QUEUE DE PROSE. Mesuré sur
    #    deux des onze : « 20 +6 Primal Champion 6 +4 4 While active, your Rage
    #    follows the rules below. » et « …2 2 1 1 one of your Bardic Inspiration
    #    dice. » Jeter la ligne entière perdait une phrase de règle — et le
    #    compte des paragraphes (31 → 9) ne l'aurait jamais dit. Une cellule de
    #    table est un nombre, un tiret, un bonus ou un dé ; ce qui suit le
    #    dernier de ceux-là est du texte, et il se rattache à ce qui précède.
    jetons = lignes[fin].split()
    der = max((i for i, j in enumerate(jetons)
               if re.fullmatch(r"[+-]?\d+|—|–|-|\d*[dD]\d+", j)), default=-1)
    queue = " ".join(jetons[der + 1:]).strip()
    if queue:
        apres.insert(0, queue)

    if avant:
        avant[-1] = re.sub(r"\s*%s Features\s*$" % re.escape(classe), "", avant[-1]).strip()
        if not avant[-1]:
            avant.pop()
    if apres:
        apres[0] = _LEGENDE_RESIDU.sub("", apres[0]).strip()
        if not apres[0]:
            apres.pop(0)

    # Recoller les deux moitiés SI la phrase était coupée — et seulement alors :
    # une gauche qui finit par un point est un paragraphe complet, pas une moitié.
    if avant and apres and not avant[-1].endswith((".", ":", "!", "?")):
        avant[-1] = "%s %s" % (avant[-1], apres.pop(0))
    return avant + apres


def _srd_class_full(slug, lang="en"):
    """UNE classe, en manuel de joueur : image, table de progression enrichie
    Fate's Hand, texte entier de chaque aptitude, puis la sous-classe."""
    doc = _srd_load("class", lang)
    voulu = slug.strip().lower()
    rec = next((r for r in doc["records"] if r["name"].strip().lower() == voulu), None)
    if rec is None:
        connus = ", ".join(sorted(r["name"] for r in doc["records"]))
        raise SrdCiteError(
            "{{srd:class-full:%s}} : le SRD ne porte pas cette classe. Connues : %s"
            % (slug, connus))
    prog_doc = _srd_load("class-progression", lang)
    prog = next((r for r in prog_doc["records"]
                 if r["data"].get("class") == rec["id"]), None)
    if prog is None:
        raise SrdCiteError(
            "{{srd:class-full:%s}} : le SRD porte la classe mais pas sa "
            "progression — une table de niveaux sans niveaux serait un mensonge." % slug)
    d = rec["data"]
    pool = _fh_pool(rec["id"])
    if pool is None:
        raise SrdCiteError(
            "{{srd:class-full:%s}} : aucun pool Fate's Hand pour cette classe. "
            "La table doit porter ses points ; sans eux elle n'est pas FH." % slug)

    out = ["<!-- GENERATED — SRD %s + fh-skills. Ne pas éditer. -->"
           % doc.get("import_run", "?"),
           '<div class="fh-pcfh">']

    # ⛔ PAS D'IMAGE ICI, ET C'EST UNE CORRECTION MESURÉE : une illustration
    #    Fate's Hand n'est pas du SRD — elle n'a rien à faire dans un bloc CITÉ.
    #    Et le chemin l'a prouvé : `descendre_dun_cran()` repointe les liens
    #    MARKDOWN d'une page fille (`](../assets` -> `](../../assets`), pas les
    #    attributs `src=` d'un HTML généré. L'image sortait donc d'un cran trop
    #    haut sur les douze pages. Elle vit dans le manuscrit, en markdown, là
    #    où le mécanisme existant la corrige déjà — comme pour Species.

    # ── la carte d'identité ────────────────────────────────────────────────
    identite = [
        ("Hit die", d.get("hit_point_die")),
        ("Primary ability", d.get("primary_ability")),
        ("Saving throws", ", ".join(d.get("saving_throw_proficiencies") or []) or None),
        ("Armor training", d.get("armor_training")),
        ("Weapons", d.get("weapon_proficiencies")),
        ("Tools", d.get("tool_proficiencies")),
        ("Starting equipment", d.get("starting_equipment")),
    ]
    out.append('<dl class="fh-pcfh__id">')
    for libelle, v in identite:
        if v:
            out.append("<dt>%s</dt><dd>%s</dd>" % (html.escape(libelle), html.escape(str(v))))
    out.append("</dl>")

    # ── LA TABLE DE PROGRESSION, EN-TÊTE À DEUX ÉTAGES ─────────────────────
    # 🔴 Eric, 2026-08-28, croquis annoté à l'appui : *« Level / proficiency
    # bonus (l'un au-dessus de l'autre, PAS DE SÉPARATION) / class features
    # (idem) / rages per day (idem) / … / skill points (le chapeau) »*, puis
    # sur la capture : *« cadré en haut »*.
    #
    # ⭐ UN SEUL TRAIT HORIZONTAL DANS TOUTE L'EN-TÊTE, et c'est le point : les
    #    libellés de deux mots s'EMPILENT dans une seule cellule (un retour à
    #    la ligne, pas une division), tandis que **Skill Points** chapeaute
    #    vraiment ses trois colonnes. Le seul trait qui apparaît est donc celui
    #    qui sépare le groupe FH de ses sous-colonnes — il se voit parce qu'il
    #    est le seul, et il dit exactement ce qu'il sépare.
    # ⛔ LE CROQUIS D'ERIC PRIME SUR SA PHRASE : il avait dit « Level centré
    #    vertical », son croquis annoté dit « cadré en haut » pour toute la
    #    rangée. C'est le croquis qui fait foi (loi du 26/08).
    cols_srd = prog["data"].get("resource_columns") or []
    hauts = ["Level", "Proficiency Bonus", "Class Features"] \
        + [_LIBELLES_FH.get(c["label"], c["label"]) for c in cols_srd]
    # 🔮 LES EMPLACEMENTS DE SORTS ENTRENT DANS LA TABLE. Ils n'y étaient pas :
    #    ils vivaient dans la table plate que le SRD recollait plus bas, et que
    #    l'on vient de retirer. Sans eux, sept classes perdraient l'information
    #    que leur propre texte leur dit d'aller chercher (« The Wizard Features
    #    table shows how many spell slots you have »). Ils prennent donc le même
    #    chapeau à deux étages que **Skill Points** — le format qu'Eric a ratifié
    #    sert ici une seconde fois, sans rien inventer.
    slots = prog["data"].get("spell_slot_levels") or 0
    # 📏 UNE TABLE QUI GAGNE NEUF COLONNES NE TIENT PLUS : mesuré chez le barde,
    #    1006 px demandés pour 930 disponibles à 1280. La classe `--dense` est
    #    une cote DONNÉE (« cette table porte des emplacements »), pas une
    #    déduction du style sur la largeur — et ce sont les vides qui cèdent :
    #    l'interlettrage des titres et le confort de la colonne d'aptitudes.
    dense = " fh-pcfh__table--dense" if slots else ""
    out.append('<table class="fh-pcfh__table%s" id="progression"><thead>' % dense)
    out.append("<tr>")
    for h in hauts:
        out.append('<th rowspan="2">%s</th>' % _empile(h))
    if slots:
        out.append('<th colspan="%d" class="fh-pcfh__group">Spell Slots per Spell Level</th>'
                   % slots)
    out.append('<th colspan="3" class="fh-pcfh__group fh">Skill Points</th>')
    out.append("</tr><tr>")
    for n in range(1, slots + 1):
        out.append('<th class="fh-pcfh__slot">%d</th>' % n)
    for h in ("Free Points", "Bound Skills", "Bound Tools"):
        out.append('<th class="fh">%s</th>' % _empile(h))
    out.append("</tr></thead><tbody>")
    # ⭐ LES APTITUDES FH QUI REMONTENT (voir `_fh_a_promouvoir`) — calculées
    #    avant la boucle : la table les cite, le fil des aptitudes les écrit,
    #    et le callout les perd. Un seul calcul pour les trois.
    noms_srd = {f.get("name") for f in (d.get("features") or [])}
    for _l in prog["data"].get("levels") or []:
        noms_srd |= set(_l.get("features") or [])
    fh_promues = _fh_a_promouvoir(rec["name"], noms_srd)
    fh_par_niveau = {}
    for _f in fh_promues:
        _f["promue"] = True
        fh_par_niveau.setdefault(_f["level"], []).append(_f)

    # où chaque aptitude est ÉCRITE (son premier niveau de texte)
    niveau_du_texte = {}
    for f in d.get("features") or []:
        nom_f = f.get("name")
        if nom_f and nom_f not in niveau_du_texte:
            niveau_du_texte[nom_f] = f.get("level")
    for ligne in prog["data"].get("levels") or []:
        niveau = int(ligne.get("level"))
        # 🔗 CHAQUE APTITUDE DE LA TABLE MÈNE À SON TEXTE — Eric, 2026-08-28 :
        #    *« il faut des liens du tableau vers les traits listés en dessous »*.
        #    ⭐ L'ancre est FABRIQUÉE, pas cherchée : `_ancre(niveau, nom)` donne
        #    la même chaîne des deux côtés, donc un lien ne peut pas viser une
        #    ancre qui n'existe pas — sauf pour les lignes que le SRD n'écrit
        #    pas comme des aptitudes (« Subclass feature », « Ability Score
        #    Improvement » à répétition), qui restent en texte simple.
        # ⚠️ ET LE LIEN VISE LE NIVEAU OÙ L'APTITUDE EST ÉCRITE, PAS CELUI DE
        #    LA LIGNE — mesuré : 43 liens morts sur 214 sans ça. « Ability
        #    Score Improvement » revient aux niveaux 8, 12 et 16 mais n'a QU'UN
        #    texte, au niveau 4 ; « Expertise » du barde est écrite au 2 et
        #    reparaît au 9. Une ancre par ligne aurait mené dans le vide trois
        #    fois sur dix. La carte dit où le texte VIT, une fois pour toutes.
        liees = []
        for nom_f in (ligne.get("features") or []):
            cible = niveau_du_texte.get(nom_f)
            if cible is not None:
                liees.append('<a class="fh-lien" href="#%s">%s</a>'
                             % (_ancre(cible, nom_f), html.escape(nom_f)))
            else:
                liees.append(html.escape(nom_f))
        # ⭐ L'APTITUDE FH SE POSE DANS LA CELLULE, MARQUÉE. Elle n'est pas
        #    glissée parmi les citations sans le dire : la pastille FH est la
        #    même que partout ailleurs sur le site.
        for _f in fh_par_niveau.get(niveau, ()):
            liees.append('<a class="fh-lien fh" href="#%s">%s</a>'
                         ' <span class="fh-tag">FH</span>'
                         % (_ancre(_f["level"], _f["name"]), html.escape(_f["name"])))
        cells = [str(niveau), "+%s" % ligne.get("proficiency_bonus", ""),
                 ", ".join(liees) or "—"]
        res = ligne.get("resources") or {}
        for c in cols_srd:
            v = res.get(c["key"])
            cells.append("—" if v in (None, "") else str(v))
        # Un emplacement à 0 s'écrit « — » : le SRD lui-même imprime le tiret,
        # et un zéro se lirait comme une valeur alors qu'il dit une absence.
        emplacements = ligne.get("spell_slots") or []
        for n in range(slots):
            v = emplacements[n] if n < len(emplacements) else 0
            cells.append("—" if not v else str(v))
        fh = _fh_colonnes(pool, niveau, rec["name"])
        cells += [fh.get("Free", "—"), fh.get("Bound skill", "—"), fh.get("Bound tool", "—")]
        # ⚠️ la 3ᵉ cellule porte des LIENS : elle est déjà échappée pièce par
        #    pièce ci-dessus. La ré-échapper afficherait le balisage en clair.
        premier_slot = 3 + len(cols_srd)
        def _classe(i):
            if i == 2:
                return ' class="fh-pcfh__feat"'
            if slots and premier_slot <= i < premier_slot + slots:
                return ' class="fh-pcfh__slot"'
            return ""
        out.append("<tr>%s</tr>" % "".join(
            "<td%s>%s</td>" % (_classe(i), c if i == 2 else html.escape(c))
            for i, c in enumerate(cells)))
    out.append("</tbody></table>")
    out.append('<p class="fh-pcfh__note">The last three columns are Fate\'s Hand. '
               "They show your <b>running total</b> at that level, not the gain — "
               "you keep every step you passed through.</p>")

    # ── LE TEXTE DE CHAQUE APTITUDE, AVEC SON ANCRE ────────────────────────
    # 🔴 Eric, 2026-08-28 : *« important d'avoir des tags de localisation »*.
    # ⭐ SANS ANCRE, RIEN NE PEUT POINTER ICI. Un titre écrit en HTML brut ne
    #    reçoit AUCUN identifiant de mkdocs (seul le markdown en gagne un) :
    #    ces vingt-quatre aptitudes étaient donc introuvables depuis le
    #    builder, qui doit pouvoir ouvrir « Rage » ou « Primal Knowledge » à
    #    la ligne près (NORMES §7 ter, la table des ancres de `liens-fh.mjs`).
    # ⛔ ET L'ANCRE PORTE LE NIVEAU, PAS SEULEMENT LE NOM : « Improved Brutal
    #    Strike » existe DEUX fois chez le barbare (13 et 17). Un identifiant
    #    par nom seul en aurait écrasé un — et le lien aurait mené au mauvais.
    # ⚠️ LES BLOCS FH S'INTERCALENT PAR NIVEAU, pas en fin de liste : une
    #    aptitude de niveau 2 se lit entre le 1 et le 3, sinon la page ment sur
    #    l'ordre où on la reçoit.
    restants = sorted(fh_promues, key=lambda x: x["level"])

    def _rendre_fh(jusqua):
        while restants and restants[0]["level"] <= jusqua:
            g = restants.pop(0)
            out.append('<h3 class="fh-pcfh__feature fh" id="%s">'
                       'Level %s: %s <span class="fh-tag">FH</span></h3>'
                       % (_ancre(g["level"], g["name"]), g["level"], html.escape(g["name"])))
            out.append("<p>%s</p>" % _md_leger(g["text"]))

    for f in d.get("features") or []:
        niv_f = f.get("level")
        if isinstance(niv_f, int):
            _rendre_fh(niv_f)
        titre = "Level %s: %s" % (f.get("level", "?"), f.get("name", "?"))
        out.append('<h3 class="fh-pcfh__feature" id="%s">%s</h3>'
                   % (_ancre(f.get("level"), f.get("name")), html.escape(titre)))
        out += _rendu_aptitude(
            _paragraphes_sans_table_plate(f.get("description"), rec["name"]), rec["name"])
    _rendre_fh(20)

    # ── LES OPTIONS DE CLASSE — invocations et metamagic ──────────────────
    # 🔴 LA PAGE PROMETTAIT UNE SECTION QUE PERSONNE NE FABRIQUAIT. Le texte
    #    SRD du Warlock dit « described in the “Eldritch Invocation Options”
    #    section later in this class's description », celui du Sorcerer renvoie
    #    à « Metamagic Options » — et l'extraction avait rangé ces options dans
    #    `class-option.json` sans que le rendu de classe ne les rappelle : 28
    #    invocations et 10 metamagic promis, zéro publié. Eric, 2026-08-29 :
    #    *« les invocations, si elles sont absentes des SRFH+ rules, il faut
    #    les écrire »*.
    # ⭐ C'EST UNE CITATION, PAS UN MANUSCRIT : les records viennent du même
    #    export SRD que le reste de la fiche, rendus par le même
    #    `_rendu_aptitude` — une règle publiée s'écrit une fois, ici la source
    #    est la machine. Le prérequis se rend en tête d'option, en italique,
    #    comme le SRD le met.
    # ⛔ ET CHAQUE OPTION PORTE SON ANCRE (`opt-<nom>`), pour la même raison que
    #    les aptitudes : le builder doit pouvoir ouvrir « Pact of the Tome » à
    #    la ligne près sans lire la page.
    for categorie, titre_section in _OPTIONS_DE_CLASSE.get(rec["name"], ()):
        options = [o for o in _srd_load("class-option", lang)["records"]
                   if (o.get("data") or {}).get("category") == categorie]
        if not options:
            continue
        # ⭐ RANG SECTION, PAS RANG FEATURE — Eric, 2026-08-29 : *« Eldritch
        #    invocations doit être une sous-section, au même titre que Intro /
        #    Tableau / Features »*. Rendue en `fh-pcfh__feature`, la section se
        #    noyait dans le fil des aptitudes, un « Level 20 » de plus.
        out.append('<h3 class="fh-pcfh__section" id="%s">%s</h3>'
                   % (_ancre(None, titre_section), html.escape(titre_section)))
        for o in sorted(options, key=lambda x: x["data"]["name"]):
            od = o["data"]
            out.append('<h4 class="fh-pcfh__feature" id="%s">%s</h4>'
                       % (_ancre(None, "opt-" + od["name"]), html.escape(od["name"])))
            if od.get("prerequisite"):
                out.append('<p class="fh-pcfh__prereq"><em>Prerequisite: %s</em></p>'
                           % html.escape(od["prerequisite"]))
            out += _rendu_aptitude(
                _paragraphes_sans_table_plate(od.get("description"), rec["name"]), rec["name"])

    # ── LA SOUS-CLASSE ─────────────────────────────────────────────────────
    sc = d.get("subclass")
    if isinstance(sc, dict) and sc.get("name"):
        # 🔴 CE TITRE ÉTAIT LE SEUL DU GÉNÉRATEUR SANS ANCRE — corrigé le
        #    2026-09-04. Tous ses voisins passent par `_ancre()` ; celui-ci
        #    avait été oublié, donc les 12 sous-classes du livre n'étaient
        #    atteignables par aucun lien : mesuré 12 titres, 0 ancre.
        #    ⛔ Rien ne pouvait rougir : une ancre absente ne casse pas une
        #       page, elle rend seulement une destination inatteignable.
        out.append('<h3 class="fh-pcfh__subclass" id="%s">%s subclass: %s</h3>'
                   % (_ancre(None, "subclass-" + sc["name"]),
                      html.escape(rec["name"]), html.escape(sc["name"])))
        out += _rendu_aptitude(
            _paragraphes_sans_table_plate(sc.get("description"), rec["name"]), rec["name"])
        for f in sc.get("features") or []:
            out.append('<h4 class="fh-pcfh__feature" id="%s">Level %s: %s</h4>'
                       % (_ancre(f.get("level"), f.get("name")),
                          html.escape(str(f.get("level", "?"))), html.escape(f.get("name", "?"))))
            out += _rendu_aptitude(
                _paragraphes_sans_table_plate(f.get("description"), rec["name"]), rec["name"])

    attr = rec.get("attribution", "")
    if attr:
        out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    corps = "\n".join(out)
    # 🔗 LA PROMESSE DEVIENT UN LIEN — Eric, 2026-08-29 : *« mérite un lien
    #    bleu »*. Le texte SRD cite la section entre guillemets courbes
    #    (« described in the “Eldritch Invocation Options” section ») : chaque
    #    mention, où qu'elle soit dans la page, saute à la section. On remplace
    #    APRÈS assemblage — la cible existe forcément, c'est nous qui venons de
    #    l'écrire ; une classe sans section déclarée n'est pas touchée.
    for _, titre_section in _OPTIONS_DE_CLASSE.get(rec["name"], ()):
        corps = corps.replace(
            "\u201c%s\u201d" % titre_section,
            '\u201c<a class="fh-lien" href="#%s">%s</a>\u201d'
            % (_ancre(None, titre_section), html.escape(titre_section)))
    return corps


# Quelles classes portent une section d'options, et sous quel titre — les DEUX
# seuls cas du SRD 5.2.1 ; une classe absente d'ici n'affiche rien.
_OPTIONS_DE_CLASSE = {
    "Warlock":  (("eldritch-invocation", "Eldritch Invocation Options"),),
    "Sorcerer": (("metamagic", "Metamagic Options"),),
}


def _srd_class_entry(slug, lang="en"):
    """UNE classe du SRD, ENTIÈRE, dans le fil de sa section.

    🔴 Eric, 2026-08-28 : *« je veux que dans les classes de FH WEB tu produises
    la classe EN ENTIER, SRD inclus — quand FH remplace, tu écrases le SRD. »*

    ⭐ CE QUI CHANGE PAR RAPPORT À `class-cards`, ET C'EST TOUT LE POINT : les
    douze fiches ne vivent plus dans UN bloc replié en fin de chapitre, où le
    lecteur devait aller les chercher loin de la classe qu'il lit. Chaque
    section appelle la sienne, et le texte Fate's Hand se lit à côté du SRD
    qu'il complète — la page redevient une classe, pas un composite.

    ⛔ CE QUI RESTE ÉCARTÉ, POUR LA RAISON D'AVANT : la ligne de compétences du
    SRD (elle nomme *Perception*, que FH n'a pas, et donne un second compte de
    points) et la maîtrise d'arme (citée dans *Equipment* — une règle publiée
    deux fois est une règle qui divergera). Ce que FH REMPLACE ne se cite donc
    jamais à côté de son remplaçant : il est écrasé, comme Eric le demande.

    ⚠️ ET LA FICHE NE SE REPLIE PAS. `_replier` existe pour les longues listes
    citées ; ici la fiche EST le contenu de la section, et un contenu replié
    par défaut serait un contenu qu'on ne lit pas.
    """
    doc = _srd_load("class", lang)
    voulu = slug.strip().lower()
    trouve = None
    for r in doc["records"]:
        if r["name"].strip().lower() == voulu:
            trouve = r
            break
    if trouve is None:
        connus = ", ".join(sorted(r["name"] for r in doc["records"]))
        raise SrdCiteError(
            "{{srd:class-entry:%s}} : le SRD ne porte pas cette classe. Connues : %s"
            % (slug, connus))
    d = trouve["data"]
    lignes = [
        ("Hit die",         lambda x: x.get("hit_point_die")),
        ("Primary ability", lambda x: x.get("primary_ability")),
        ("Saving throws",   lambda x: ", ".join(x.get("saving_throw_proficiencies") or []) or None),
        ("Armor training",  lambda x: x.get("armor_training")),
        ("Weapons",         lambda x: x.get("weapon_proficiencies")),
        ("Tools",           lambda x: x.get("tool_proficiencies")),
        ("Starting equipment", lambda x: x.get("starting_equipment")),
    ]
    out = [
        "<!-- GENERATED — cité depuis fh-srd class.json (run=%s). Ne pas éditer. -->"
        % doc.get("import_run", "?"),
        '<div class="fh-srd-cite fh-srd-cite--entry">',
        '<p class="fh-srd-cite__label"><strong>%s</strong> — as printed, '
        "minus the lines Fate's Hand replaces</p>"
        % html.escape(doc.get("layer_label", "SRD")),
        '<dl class="fh-srd-cite__list">',
    ]
    for libelle, prendre in lignes:
        v = prendre(d)
        if v is None or v == "":
            continue
        out.append("<dt>%s</dt><dd>%s</dd>" % (html.escape(libelle), html.escape(str(v))))
    traits = d.get("features") or []
    if traits:
        par_niveau = {}
        for f in traits:
            par_niveau.setdefault(f.get("level", "?"), []).append(f.get("name", "?"))
        rendu = " · ".join(
            "<b>%s</b> %s" % (n, html.escape(", ".join(par_niveau[n])))
            for n in sorted(par_niveau, key=lambda z: (z == "?", z)))
        out.append("<dt>Features by level</dt><dd>%s</dd>" % rendu)
    out.append("</dl>")
    attr = trouve.get("attribution", "")
    if attr and ATTR_PAR_BLOC:
        out.append('<p class="fh-srd-cite__attr">%s</p>' % html.escape(attr))
    out.append("</div>")
    return "\n".join(out)


# ── LE RAPPEL EN TÊTE DE CHAPITRE ───────────────────────────────────────────
# Eric, 2026-08-20 : « j'ai un peu peur de voir ma création noyée dans le SRD »,
# puis « peut-on donner ce job de rappel des règles FH en tête de chapitre, plus
# sous forme de menu avec des liens qu'un bloc de texte ? ». Table ratifiée le
# même jour : `0c. Canon/Chapitres et genres — Canon (ratifié 2026-08-20).md`.
#
# ⭐ IL EST GÉNÉRÉ, JAMAIS ÉCRIT. Un rappel écrit à la main pourrit — la journée
#    du 20/08 l'a prouvé deux fois : deux clauses dictées de mémoire par Eric
#    restituaient un état qu'il avait lui-même corrigé deux jours plus tôt. Un
#    rappel dérivé ne peut pas mentir : le jour où une couche cesse de patcher,
#    la ligne disparaît toute seule.
#
# ⭐ ET LE « — » N'EST PAS UN TROU, C'EST UNE RÉPONSE. Onze chapitres ne portent
#    aucun genre parce que le SRD ne dit RIEN de ces sujets. Le menu y écrit
#    « entirely Fate's Hand », et c'est la meilleure réponse à sa crainte.
CHAPTER_GENRES = {
    "skills-and-tools.md": ["skill", "tool", "training"],
    "classes.md":          ["class", "class-progression"],
    "species.md":          ["species"],
    "inheritance.md":      ["background", "training"],
    "equipment.md":        ["weapon", "weapon-property", "weapon-mastery", "armor", "gear", "tool"],
    "feats.md":            ["feat"],
    "trainings.md":        ["training"],
    "rules-glossary.md":   ["glossary"],
    "skills-synergies.md": ["skill"],
    "spells.md":           ["spell"],
    "magic-items.md":      ["item"],
    "crafting.md":         ["tool"],
    "chaos-tables.md":     ["monster"],
    # « — » : le SRD ne dit rien de ces sujets. Explicites, pas absents.
    "identity.md": [], "ability-scores.md": [], "fates-hand-mechanic.md": ["arcana"],
    "moonkeeper.md": [], "leveling-up.md": [], "battlefield.md": [],
    "dungeoneering.md": [], "magic.md": [], "dark-rituals.md": [],
    "soulforge-crafting.md": [], "primordial-forces.md": [],
}

# Ce que le builder retire, ajoute ou modifie, par genre.
# ⚠️ Les noms de genres sont ceux des exports SRD — SAUF DEUX, qui sont propres
#    à Fate's Hand et n'ont aucune contrepartie : `arcana` (22 arcanes) et
#    `training` (13, la troisième dépense du pool). Le SRD n'en dit rien, et
#    ce sont donc les deux genres où le menu dit le plus. ⏳ Produit par FHPC
# depuis ses couches ; le fichier n'existe pas encore.
# 🔴 SON ABSENCE NE SE DÉDUIT PAS EN SILENCE — c'est la leçon du 20/08. Tant
#    qu'il manque, le menu dit ce qu'il PEUT prouver et ne prétend rien sur ce
#    que FH change ; la passe l'annonce à l'écran.
# ── LE TROISIÈME ÉTAT : LE CHAPITRE MIXTE, DÉCLARÉ FAUTE D'ÊTRE MESURABLE ───
# Eric, 2026-09-06 : « on récrit à notre sauce et on cite en pied de page, as
# usual, ce qui change du SRD, et les refs habituelles tout en bas. »
#
# 🔴 CE QUI S'EST CASSÉ. `ability-scores.md` portait `[]`, donc « entirely
#    Fate's Hand ». Le 06/09 le chapitre a reçu `4d6` et le tableau standard —
#    DEUX méthodes du jeu de base (SRD 5.2.1, p. 21, relu dans le PDF source le
#    même jour). Le bandeau annonçait donc, noir sur blanc, une chose fausse.
#
# ⛔ ET LA MESURE NE PEUT PAS LE RATTRAPER. `fh-changes.json` compte des
#    RECORDS, par genre — et une caractéristique n'est pas un genre : les
#    exports du SRD n'en portent aucun (`skill`, `feat`, `spell`, `tool`… ;
#    aucun `ability`, vérifié). Glisser un genre voisin dans `CHAPTER_GENRES`
#    pour faire taire le bandeau lui ferait annoncer un nombre qui ne parle pas
#    du sujet de la page. Un chiffre faux est pire qu'une case vide.
#
# ⭐ D'OÙ LE TROISIÈME ÉTAT : ce que la mesure ne peut pas prouver, le chapitre
#    le DÉCLARE — ici, dans la machinerie, à un seul endroit, et le pied du
#    bandeau dit franchement que c'est déclaré et non mesuré. Ce n'est pas le
#    retour du rappel écrit à la main condamné le 20/08 : ce qui pourrissait,
#    c'est un rappel qui PRÉTENDAIT refléter des données changeantes. Ces
#    lignes-ci ne bougent que si Eric change une règle de sa propre page.
#
# 📌 Format d'une ligne : (sujet, classe du verdict, verdict, détail) — c'est
#    exactement le <li> du bandeau mesuré, donc le même rendu que `crafting` et
#    `feats`. Aucune classe CSS nouvelle : le format ne se négocie pas.
# ⛔ Ce qui n'est PAS ici et qui n'y entrera pas sans un mot d'Eric : le
#    Point Cost du jeu de base. Le builder ne l'offre pas, et son propre
#    commentaire dit pourquoi — « question posée à Eric, toujours ouverte ».
#    Un pied de page qui l'annoncerait « retiré » trancherait à sa place.
CHAPTER_STATED = {
    "ability-scores.md": [
        ("3d6 × 10", "added", "Fate’s Hand only",
         "ten rolls, six kept, two floors and no reroll, plus the Late Bloomer trait "
         "that hangs off the high floor. The base game has no such method."),
        ("free assignment", "added", "Fate’s Hand only",
         "sixteen values, 3 to 18, in a pool that never empties. "
         "The base game has no such method."),
        ("4d6 drop lowest", "same", "borrowed as-is",
         "the base game’s random option, dice untouched — SRD 5.2.1, p. 21."),
        ("standard array", "same", "borrowed as-is",
         "the base game’s six numbers, 15, 14, 13, 12, 10, 8 — SRD 5.2.1, p. 21."),
        ("around those two", "patched", "changes 2",
         "Inheritance points go on <b>any</b> abilities, where the base game’s background "
         "increases name three · at creation an ability tops out at <b>18</b>, all bonuses "
         "included, where the base game allows 20."),
    ],
}

FH_CHANGES = SRD_ROOT.parent / "fhpc" / "exports" / "fh-changes.json"
_CHANGES_CACHE = {}


def _fh_changes():
    if "d" not in _CHANGES_CACHE:
        if FH_CHANGES.exists():
            _CHANGES_CACHE["d"] = json.loads(FH_CHANGES.read_text(encoding="utf-8")).get("genres", {})
        else:
            _CHANGES_CACHE["d"] = None
    return _CHANGES_CACHE["d"]


def chapter_banner(dest):
    """Le menu de tête. Retourne "" pour un chapitre hors table.

    🔴 LA PHRASE QUI POUVAIT MENTIR, ET C'EST LA PARTIE QUI COMPTE.
    `fh-changes.json` mesure des RECORDS. Une règle qu'Eric écrit dans la PROSE
    d'un chapitre, sans record derrière, y est invisible. Cas vivant : le genre
    `spell` sort à trois listes vides alors que `Fate's Hand Spells` porte 737
    mots de sorts maison. Écrire « unchanged » ou « quoted from the SRD » sur
    cette page dirait au lecteur que rien n'y est d'Eric — **le noyage, commis
    par l'outil censé y répondre**.
    D'où deux précautions : le mot est « no record differs », jamais
    « unchanged » ; et un pied de bandeau rappelle ce que la mesure couvre.
    """
    if dest not in CHAPTER_GENRES:
        return ""
    genres = CHAPTER_GENRES[dest]
    declare = CHAPTER_STATED.get(dest) or []
    # ⭐ « — » ET RIEN DE DÉCLARÉ : alors seulement le chapitre est tout entier
    #    d'Eric. Une déclaration suffit à retirer cette phrase, et c'est le
    #    point : elle ne se dit plus que là où elle est encore vraie.
    if not genres and not declare:
        return (
            '<nav class="fh-layer fh-layer--own">\n'
            '<p><strong>Entirely Fate\u2019s Hand.</strong> The base game says nothing about this '
            "subject — every rule on this page is Eric's.</p>\n</nav>\n"
        )
    changes = _fh_changes()
    lignes, mesures, tout_vide = [], 0, True
    for sujet, classe, verdict, detail in declare:
        lignes.append('<li><span class="fh-layer__genre">%s</span> '
                      '<span class="fh-layer__%s">%s</span> — %s</li>'
                      % (html.escape(sujet), classe, html.escape(verdict), detail))
    for g in genres:
        info = (changes or {}).get(g)
        libelle = html.escape(g.replace("-", " "))
        if info is None:
            lignes.append('<li><span class="fh-layer__genre">%s</span> '
                          '<span class="fh-layer__unknown">not measured</span></li>' % libelle)
            continue
        mesures += 1
        morceaux = []
        for cle, mot in (("added", "adds"), ("patched", "changes"), ("removed", "removes")):
            noms = info.get(cle) or []
            if noms:
                morceaux.append('<span class="fh-layer__%s">%s %d</span> — %s%s'
                                % (cle, mot, len(noms),
                                   html.escape(", ".join(noms[:6])),
                                   "…" if len(noms) > 6 else ""))
        # ⭐ `renamed` mérite sa propre phrase : rangé dans `patched` sous son
        #    seul nom d'arrivée, « Gnome → Hoddon » deviendrait « FH retouche le
        #    Hoddon », et le mot Gnome quitterait le livre sans qu'une ligne le
        #    dise. C'est pourtant la phrase la plus forte du chapitre Species.
        for r in info.get("renamed") or []:
            morceaux.append('<span class="fh-layer__renamed">replaces</span> — %s → %s'
                            % (html.escape(str(r.get("from"))), html.escape(str(r.get("to")))))
        if morceaux:
            tout_vide = False
        lignes.append('<li><span class="fh-layer__genre">%s</span> %s</li>'
                      % (libelle, " · ".join(morceaux)
                         or '<span class="fh-layer__same">no record differs</span>'))

    out = ['<nav class="fh-layer">',
           '<p class="fh-layer__label">What Fate\u2019s Hand does here</p>', "<ul>"]
    out += lignes
    out.append("</ul>")
    if mesures and tout_vide:
        # Le cas dangereux : tout est vide côté données. On le dit d'abord, et
        # on dit surtout ce que ça ne veut PAS dire.
        out.append('<p class="fh-layer__note"><strong>No entry on this page differs from the '
                   "base game’s data.</strong> That is not the same as saying nothing here is Fate\u2019s "
                   "Hand: rules this chapter states in its own words are not counted by the "
                   "measure — read the page.</p>")
    elif mesures:
        out.append('<p class="fh-layer__note">Measured against the base game\u2019s data. Rules this '
                   "chapter states in its own words are not counted here.</p>")
    if declare:
        # 🔴 La phrase la plus importante du troisième état : le lecteur doit
        #    savoir que ces lignes n'ont pas été comptées, mais écrites.
        out.append('<p class="fh-layer__note"><strong>Stated with the chapter, not measured.</strong> '
                   "Ability scores are not a kind of record, so the comparison that runs on the other "
                   "chapters has nothing to weigh here — these lines are declared alongside the rules "
                   "they describe, and change with them.</p>")
    out.append("</nav>")
    return "\n".join(out) + "\n"


def insert_banner_note(text, dest):
    """Pose la note de traduction juste sous le bandeau du chapitre."""
    note = note_de_traduction(dest)
    if not note:
        return text
    lignes = text.split("\n")
    for i, l in enumerate(lignes):
        if l.startswith("# "):
            return "\n".join(lignes[: i + 1] + ["", note] + lignes[i + 1 :])
    return note + "\n" + text


def insert_banner(text, dest):
    """Le rappel des écarts va EN FIN de chapitre.

    🔴 CORRIGÉ LE 2026-08-20, LE SOIR, PAR ERIC LUI-MÊME, après avoir lu le
    livre publié : *« le rappel de ce qui diffère EN FIN de chaque chapitre, là
    où quelques initiés veulent en savoir plus »*. Le matin il l'avait demandé
    en tête ; sa raison de le déplacer est dans sa phrase — le rappel s'adresse
    à **quelques initiés**, pas au joueur qui ouvre la page pour jouer. En tête,
    il imposait à tout le monde une comparaison qui n'intéresse presque
    personne, et il retardait sa voix d'un écran. **C'était le noyage qu'il
    craignait, commis par l'outil bâti contre lui.**

    ⚠️ Ne concerne QUE ce rappel. L'encadré « Reading the quotations on this
    page » s'adresse à qui va lire les citations : il reste AVANT elles.
    """
    banniere = chapter_banner(dest)
    if not banniere:
        return text
    return text.rstrip() + "\n\n---\n\n" + banniere


# Ce qu'il faut LIRE à la place d'un terme retiré, quand il survit dans une
# citation. ⛔ On ne rature pas un mot dans un texte cité — on le traduit.
# 📌 Seuls les termes SANS AMBIGUÏTÉ sont ici. « Sage » est un arrière-plan
#    retiré, mais c'est aussi une carte du Deck of Many Things : traduire
#    aveuglément dirait au lecteur qu'une carte est un arrière-plan. Le
#    détecteur le signale quand même à l'écran — c'est un œil qu'il faut, pas
#    une règle.
TRADUCTIONS = {
    "Perception": "read <strong>Vigilance</strong>, <strong>Delve</strong> or "
                  "<strong>Survival</strong> — Fate\u2019s Hand split it in three, "
                  "and which one applies depends on what you are looking at",
    "Musical Instrument": "read one of <strong>Instrument (Strings)</strong>, "
                          "<strong>(Wind)</strong> or <strong>(Other)</strong> — "
                          "Fate\u2019s Hand splits it in three, and each is bought separately",
    "Gaming Set": "read one of <strong>Card Set</strong>, <strong>Dice Set</strong>, "
                  "<strong>Dragonchess Set</strong> or <strong>Three-Dragon Ante</strong>",
}


def note_de_traduction(dest):
    """Le bloc « ce mot ne veut pas dire ça ici », posé sous le bandeau.

    🔴 Il est GÉNÉRÉ depuis ce que le détecteur a réellement trouvé dans les
    citations de CE chapitre. Écrit à la main dans quatre chapitres, il aurait
    pourri au premier terme qui bouge — et il en resterait un cinquième qu'on
    aurait oublié.
    """
    return _note_pour(sorted({f.split(" (")[0] for f in _FUITES.get(dest, set())}
                             & set(TRADUCTIONS)))


def _sans_bloc(lignes, ouvre, ferme):
    """Les lignes, privées du bloc qui va de `ouvre` à `ferme` (bornes comprises).

    ⚠️ Bornée : si l'ouverture n'a pas de fermeture, on ne coupe RIEN plutôt que
    de manger la fin du document. Une absence de fin n'autorise pas à tout jeter.
    """
    deb = next((i for i, l in enumerate(lignes) if ouvre in l), None)
    if deb is None:
        return list(lignes)
    fin = next((i for i in range(deb, len(lignes)) if ferme in lignes[i]), None)
    if fin is None:
        return list(lignes)
    return list(lignes[:deb]) + list(lignes[fin + 1:])


def note_pour_texte(txt):
    """La même note, mais calculée sur UN texte — celui d'une page fille.

    🔴 Eric, 2026-08-28 : le bandeau se posait en tête de `classes.md`, donc sur
    la page d'INDEX — qui ne cite rien. Les termes qu'il commente vivent sur les
    douze pages filles (*Perception* chez cinq d'entre elles, *Musical
    Instrument* chez le barde et le moine). Il expliquait comment lire des
    citations qui étaient ailleurs.
    """
    return _note_pour([nom for nom in sorted(TRADUCTIONS)
                       if re.search(r"\b%s\b" % re.escape(nom), txt or "")])


def _note_pour(trouves):
    if not trouves:
        return ""
    out = ['<aside class="fh-translate">',
           '<p class="fh-translate__label">Reading the quotations on this page</p>', "<ul>"]
    for nom in trouves:
        out.append("<li><strong>%s</strong> does not exist in Fate\u2019s Hand — %s.</li>"
                   % (html.escape(nom), TRADUCTIONS[nom]))
    out.append("</ul>")
    # \u00ab on this page \u00bb, pas \u00ab below \u00bb : la note se pose d\u00e9sormais aussi EN PIED.
    out.append("<p>The quotations on this page are the base game\u2019s, word for word. We do not edit a "
               "quotation to fit our rules — we tell you how to read it.</p>")
    out.append("</aside>")
    return "\n".join(out) + "\n"


_FUITES = {}


def _scanner_fuites(bloc, dest):
    """Un record retiré peut survivre DANS LE TEXTE d'un autre record.

    🔴 Le filtre par record ne l'attrape pas : la fiche du Barde porte
    « Tools: Choose 3 Musical Instruments », et *Musical Instrument* n'existe
    pas dans Fate's Hand. On ne peut pas raturer un mot à l'intérieur d'une
    citation sans la falsifier — donc on ne corrige pas, **on signale**, et la
    passe le dit à l'écran. C'est la moitié qui ne s'automatise pas, et elle
    doit se voir plutôt que de se deviner.
    """
    changes = _fh_changes() or {}
    for genre, info in changes.items():
        for nom in info.get("removed") or []:
            if nom in bloc:
                _FUITES.setdefault(dest, set()).add("%s (%s)" % (nom, genre))


SEUIL_REPLI = 25          # entrées
SEUIL_POIDS = 8000        # caractères


def _replier(bloc, quoi):
    """Replie une citation longue.

    🔴 Eric, 2026-08-20, après avoir lu le livre publié : *« je vois un
    composite SRD plus autre chose assez compliqué et chiant à lire […] pour un
    lecteur c'est moche et chiant à lire »*. La cause est mesurable : le bloc
    cité et sa prose avaient **le même poids visuel**, et sur `spells` 339
    entrées citées écrasaient 732 mots de lui.

    ⭐ LE PRINCIPE : **sa voix reste la page, le SRD devient la référence
    dessous.** Une citation courte se lit dans le fil ; une longue se replie et
    annonce ce qu'elle contient. Rien n'est retiré — tout reste à un clic, et
    la recherche du site continue de l'indexer.
    """
    # ⚠️ Une fiche de classe porte sept <dt> : compter les lignes annoncerait
    #    « 88 class entries » pour douze classes. On compte ce que le lecteur
    #    compte, pas ce que le HTML compte.
    if quoi == "class-cards":
        n = bloc.count('class="fh-srd-cite__group"')
    else:
        n = bloc.count("<dt>") + bloc.count("<tr><td>")
    # ⚠️ Deux critères, parce qu'un seul ment. Douze fiches de classe font
    #    douze « entrées » mais huit mille caractères : compter les entrées les
    #    laissait dépliées. On replie sur le NOMBRE ou sur la LONGUEUR — c'est
    #    la charge de lecture qui décide, pas la façon dont le bloc est découpé.
    if n <= SEUIL_REPLI and len(bloc) <= SEUIL_POIDS:
        return bloc
    quoi_lisible = {
        "spell-list": "spells", "item-list": "magic items", "glossary": "glossary entries",
        "weapon-table": "weapons", "gear-table": "pieces of gear", "tool-table": "tools",
        "feat-list": "feats", "class-cards": "class entries",
    }.get(quoi, "entries")
    # Le libellé ne nomme plus la source : la page le dit une fois, en bas.
    return ('<details class="fh-fold">\n<summary><strong>%d %s</strong> '
            "— open to read them</summary>\n%s\n</details>" % (n, quoi_lisible, bloc))


def _lire_arcanes():
    """Les 22 arcanes, lues depuis le chapitre — la même source qu'arcana.js.

    ⭐ Le teaser du chapitre *Destiny* est GÉNÉRÉ d'ici. Recopier trois cartes
    à la main dans un second chapitre en ferait une seconde version : le jour
    où Eric règle un pouvoir, l'exemple mentirait sans que rien ne le dise.
    """
    cartes, cur = [], None
    for line in ARCANA_SRC.read_text(encoding="utf-8").splitlines():
        h = re.match(r"^#{2,4}\s+([0IVXL]+)\.\s+(.+?)\s*$", line.strip())
        if h:
            cur = {"numeral": h.group(1), "name": h.group(2).strip(), "meaning": "",
                   "ability": "", "impact": "", "power": "", "vibration": ""}
            cartes.append(cur)
            continue
        if cur is None:
            continue
        f = re.match(r"^-\s+\*\*(.+?)\*\*\s+[—-]\s+(.+?)\s*$", line.strip())
        if f:
            k = ARCANA_FIELDS.get(f.group(1).strip().lower())
            if k:
                cur[k] = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", f.group(2)).strip()
    return cartes


# 🔴 LES 22 ILLUSTRATIONS NE SONT PAS CELLES D'ERIC. Eric, 2026-08-20 :
#    « les cartes ne sont pas finalisées encore ». `docs/assets/img/tarot/major/`
#    porte le tarot **Rider-Waite-Smith** (Pamela Colman Smith, 1909, domaine
#    public) comme bouche-trou — voir son SOURCE.txt.
# ⛔ Tant que ce drapeau est faux, le teaser du chapitre *Destiny* ne montre
#    AUCUNE image : présenter le jeu d'un autre comme exemple de ce qu'est une
#    carte de Fate's Hand est faux éditorialement, même si c'est légal.
#    Le dock, lui, garde les bouche-trous : il rend une carte tirée en jeu, il
#    ne prétend pas montrer l'identité visuelle du livre.
# ✅ Le jour où ses 22 fichiers arrivent, sous les mêmes noms de numéral :
#    passer ce drapeau à True. Une ligne, et les trois exemples s'illustrent.
# 2026-08-29, Eric : "Mets toutes les cartes avec leurs images. Je ne limite
#    plus a trois cartes publiees." Les 22 fichiers sont les siens : 16 masters
#    v2 (pilotes + vagues A/B/C de l'archive Tarot) et 6 cartes v1 (XIV, XV,
#    XVII, XVIII, XX, XXI - en attente de refonte v2). Voir SOURCE.txt.
ARCANA_ART_READY = True


def arcana_teaser(noms):
    """Trois cartes montrées en exemple, côté joueur.

    ⚠️ Eric, 2026-08-20 : *« le joueur les découvre au fur et à mesure qu'il les
    tire »*, ET *« dans Destiny pour les joueurs il peut y avoir une explication
    sur les arcanes, et justement 3 exemples »*. Les deux tiennent ensemble : on
    montre **trois** cartes pour dire ce qu'est une carte, et les dix-neuf autres
    se découvrent en les tirant. C'est un échange assumé — trois sur vingt-deux.
    🔴 Une carte nommée ici et absente du chapitre CASSE la construction : un
       exemple qui pointe vers rien est pire que pas d'exemple.
    """
    par_nom = {c["name"].lower(): c for c in _lire_arcanes()}
    voulus = [n.strip() for n in noms.split(",") if n.strip()]
    manquants = [n for n in voulus if n.lower() not in par_nom]
    if manquants:
        raise SrdCiteError(
            "{{arcana:%s}} : %s n'est pas une carte du chapitre (disponibles : %s)."
            % (noms, ", ".join(manquants), ", ".join(sorted(par_nom))))
    # ⛔ PLUS AUCUN RENDU — Eric, 2026-08-29 : « les trois en gros format,
    #    enlève-les, elles embolisent la page générale ». La directive reste
    #    dans le vault parce qu'elle est la SOURCE des trois cartes de départ
    #    (arcana.js / le builder) — la validation ci-dessus continue de crier
    #    si une carte nommée disparaît du chapitre. Le rendu, lui, est vide.
    return ""


ARCANA_RE = re.compile(r"^\{\{arcana:([^}]+)\}\}[ \t]*$", re.M)


def inject_arcana(text, dest):
    def one(m):
        try:
            return arcana_teaser(m.group(1))
        except SrdCiteError as err:
            raise SrdCiteError("%s : %s" % (dest, err)) from None
    return ARCANA_RE.sub(one, text)


def inject_srd_citations(text, dest):
    def one(m):
        try:
            if m.group(3) and m.group(1) in ("weapons-by-mastery", "mastery-by-class", "class-cards"):
                raise SrdCiteError(
                    "{{srd:%s}} : une vue calculée ne prend pas d'exclusion — "
                    "elle dérive d'une relation, pas d'une liste." % m.group(1))
            if m.group(1) == "feat-list":
                b = _srd_feats(sauf=m.group(3)); _scanner_fuites(b, dest); return _replier(b, 'feat-list')
            if m.group(1) in SRD_TABLES:
                if m.group(2):
                    raise SrdCiteError(
                        "{{srd:%s}} ne prend pas de sous-sélection." % m.group(1))
                b = _srd_table(m.group(1), sauf=m.group(3)); _scanner_fuites(b, dest); return _replier(b, m.group(1))
            if m.group(1) in SRD_TABLES:
                if m.group(2):
                    raise SrdCiteError(
                        "{{srd:%s}} ne prend pas de sous-sélection." % m.group(1)
                    )
                return _srd_table(m.group(1))
            if m.group(1) == "class-full":
                if not m.group(2):
                    raise SrdCiteError(
                        "{{srd:class-full}} attend une classe : {{srd:class-full:barbarian}}")
                b = _srd_class_full(m.group(2)); _scanner_fuites(b, dest); return b
            if m.group(1) == "class-entry":
                if not m.group(2):
                    raise SrdCiteError(
                        "{{srd:class-entry}} attend une classe : {{srd:class-entry:barbarian}}")
                b = _srd_class_entry(m.group(2)); _scanner_fuites(b, dest); return b
            if m.group(1) == "class-cards":
                b = _srd_classes(); _scanner_fuites(b, dest); return _replier(b, 'class-cards')
            if m.group(1) == "item-list":
                b = _srd_items(); _scanner_fuites(b, dest); return _replier(b, 'item-list')
            if m.group(1) == "spell-list":
                b = _srd_spells(niveaux=m.group(2)); _scanner_fuites(b, dest); return _replier(b, 'spell-list')
            if m.group(1) == "feat-list":
                return _srd_feats()
            if m.group(1) == "mastery-by-class":
                return _srd_mastery_by_class()
            if m.group(1) == "weapons-by-mastery":
                if m.group(2):
                    raise SrdCiteError(
                        "{{srd:weapons-by-mastery}} ne prend pas de sous-sélection."
                    )
                return _srd_weapons_by_mastery()
            bloc = _srd_block(m.group(1), m.group(2), sauf=m.group(3))
            _scanner_fuites(bloc, dest)
            return _replier(bloc, m.group(1))
        except SrdCiteError as err:
            raise SrdCiteError("%s : %s" % (dest, err)) from None

    return CITE_RE.sub(one, text)


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
    # ── REFONTE 2026-08-19 — les six chapitres neufs. Ils sont VIDES de règle
    #    (des emplacements), mais ils passent par ICI comme tous les autres :
    #    une page publiée sans source dans le vault serait une page que
    #    personne ne pourrait plus corriger à la source. Une seule vérité.
    "identity.md":            ("1. Build a Character/Identity.md",                          "Identity"),
    "trainings.md":           ("2. At the Table/Trainings.md",                                            "Trainings"),
    "magic.md":               ("3. Magic & Soulforging/Magic.md",                                        "Magic"),
    "crafting.md":            ("3. Magic & Soulforging/Crafting.md",                                     "Crafting"),
    "equipment.md":           ("1. Build a Character/Equipment.md",                                       "Equipment"),
    "leveling-up.md":         ("2. At the Table/Leveling Up.md",                                     "Leveling Up"),

    "ability-scores.md":      ("1. Build a Character/D&D 5+ Character stat generation.md", "Ability Scores"),
    "inheritance.md":         ("1. Build a Character/Inheritance.md",                     "Inheritance"),
    "moonkeeper.md":          ("1. Build a Character/Moonkeeper.md",                "Moonkeeper"),
    "college-of-banners.md":  ("1. Build a Character/College of Banners.md",  "College of Banners"),
    "silent-blade.md":        ("1. Build a Character/Silent Blade.md",          "Silent Blade"),
    "spell-rigger.md":        ("1. Build a Character/Spell Rigger.md",          "Spell Rigger"),
    "species.md":             ("1. Build a Character/D&D 5+ Races & Species.md",              "Species"),
    "skills-and-tools.md":    ("1. Build a Character/Skills & Tools — Player Guide.md",                       "Skills & Tools"),
    "feats.md":               ("2. At the Table/Feats.md",                                                "Feats"),
    "skills-synergies.md":    ("2. At the Table/4. Skills and synergies.md",              "Skills, Synergies & DCs"),
    "fates-hand-mechanic.md": ("1. Build a Character/D&D 5+ Fate’s Hand Mechanic.md",               "Destiny & Arcana"),
    "battlefield.md":         ("2. At the Table/Battlefield Rules.md",                              "Battlefield Rules"),
    "dungeoneering.md":       ("2. At the Table/Dungeoneering.md",                                  "Dungeoneering"),
    # Le glossaire des règles — créé le 2026-08-20 pour fermer le trou le plus grave
    # du survol : les chapitres employaient des termes majuscules (Prone, Advantage,
    # l'action Search) sans qu'aucune page ne les définisse.
    "rules-glossary.md":      ("2. At the Table/Rules Glossary.md",                                 "Rules Glossary"),
    "classes.md":             ("1. Build a Character/Class Modifications.md",                   "Classes"),
    "spells.md":              ("3. Magic & Soulforging/Fate’s Hand Spells.md",                          "New Spells"),
    "soulforge-crafting.md":  ("3. Magic & Soulforging/Soulforge Crafting.md",                          "Soulforge Crafting"),
    "dark-rituals.md":        ("3. Magic & Soulforging/Dark Rituals.md",                                "Dark Rituals"),
    # ⛔ CIRCLE MAGIC NE PUBLIE PLUS — Eric, 2026-08-18 : « Circle Magic dégage,
    #    ça vient de Faerûn ». Le chapitre reste dans le vault, intact : c'est
    #    son contenu, et le retirer du site ne le détruit pas.
    # "circle-magic.md":      ("6. Spells & Magic/Circle Magic.md",                                "Circle Magic"),
    "magic-items.md":         ("3. Magic & Soulforging/Magic Items.md",                                 "Magic Items"),
    "primordial-forces.md":   ("4. World/Nymedes's Primordial Forces.md",                 "Nymedes's Primordial Forces"),
    "chaos-tables.md":        ("5. Dungeon Master Vault/Tables de Fatalité par Attribut.md",           "Chaos Tables"),
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
    # L'illustration libérée par la carte Destiny (elle a fondu dans Build a
    # Character) descend ICI, dans le chapitre — Eric, 2026-08-20.
    "chaos-tables.md": [
        ("## The Chaos Tables",
         "![When fate turns](../assets/img/card-destiny.jpg){ .fh-illus }"),
    ],
    "ability-scores.md": [
        ("## The 3d6 × 10 method",
         '!!! tip "Try it live"\n'
         "    Real crypto-RNG rolls, the two floors applied for you — no reroll — and a spot to assign your\n"
         "    six kept scores before you open the D&D Beyond builder.\n\n"
         "    [Open the Ability Score Roller ↗](../stat-roller.html){ .md-button target=_blank }"),
    ],
}


# La bannière du chapitre Arcana — quatre cartes maîtresses en bandeau,
# composée depuis docs/assets/img/tarot/major/ (Eric, 2026-08-29 : « belle
# image »). Les images DES cartes, elles, sont posées par `split_arcana()`.
CHAPTER_IMAGES["major-arcana.md"] = [
    ("# Arcana",
     "![The Major Arcana](../assets/img/arcana-banner.jpg){ .fh-illus .fh-banner }"),
]

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
    "2. At the Table/Feats.md":                 ("feats.md",            "Feats"),
    "8. Other rules/Battlefield Rules.md": ("battlefield.md",     "Battlefield Rules"),
    "8. Other rules/Dungeoneering.md":   ("dungeoneering.md",    "Dungeoneering"),
    "2. At the Table/Battlefield Rules.md": ("battlefield.md",     "Battlefield Rules"),
    "2. At the Table/Dungeoneering.md":   ("dungeoneering.md",    "Dungeoneering"),
    "7. Classes/Class Modifications.md": ("classes.md",          "Classes"),
    "1. Build a Character/Class Modifications.md": ("classes.md", "Classes"),
    "6. Spells/Fate's Hand Spells.md":   ("spells.md",           "Spells"),
    "6. Spells & Magic/Fate's Hand Spells.md": ("spells.md",     "Spells"),
    "3. Magic & Soulforging/Soulforge Crafting.md": ("soulforge-crafting.md", "Soulforge Crafting"),
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


# ── LES MARQUEURS DE SECRET ─────────────────────────────────────────────────
# 🔴 Le 2026-08-20, un secret de table a tenu à UN SEUL MOT. Le chapitre Hoddon
#    porte « un enfant hoddon sur deux naît GOBELIN », qu'Eric a explicitement
#    interdit de publier. Il n'était protégé que parce que son callout portait
#    aussi le mot CANONICAL — un mot qu'on écrit pour dire « note d'atelier »,
#    pas pour dire « secret ». **Le même secret, écrit dans un blockquote sans
#    ce mot, partait en ligne.**
# ⭐ D'où deux gardes, et la seconde est la vraie : on retire aussi les callouts
#    marqués comme secrets, ET on REFUSE DE CONSTRUIRE si une de ces phrases
#    survit dans la sortie. Un secret ne doit pas dépendre de la mémoire de
#    celui qui écrit le callout.
# ⚠️ Ajouter une formule ici est sans risque ; en retirer une ne l'est pas.
# ⭐ ERIC A DÉFINI LE MOT LE 2026-08-20 : *« secret = t'as le droit de regarder,
#    mais faut pas le mettre dans les infos générales »*. Ce n'est donc PAS une
#    interdiction de publication — c'est une interdiction de DESTINATION.
#      face joueur / chapitres généraux → retiré
#      The Dungeon Masters' Secrets     → c'est LÀ qu'il va
#    La première version de cette garde supprimait partout : elle aurait empêché
#    le bloc d'arriver à l'endroit où il est demandé, et cassé la passe si
#    quelqu'un l'écrivait hors callout pour contourner. Une garde qui réclame
#    qu'on cache ce qu'on veut montrer.
MARQUEURS_SECRET = (
    "NE JAMAIS PUBLIER", "NE PAS PUBLIER", "VAULT ONLY", "VAULT-ONLY",
    "NE SORT JAMAIS DU VAULT", "NE DOIT PAS ÊTRE SUR LE SITE",
    "SECRET DE TABLE", "LE SECRET", "DM ONLY", "NEVER PUBLISH",
    "SPOILER",           # 2 occurrences mesurées dans le vault
    "CÔTÉ MJ",           # 3 — ⚠️ marqueur de ROUTAGE, pas de suppression
)


def _est_secret(ligne: str) -> bool:
    haut = ligne.upper()
    return any(m in haut for m in MARQUEURS_SECRET)


_SECRETS = {}


def strip_callouts(text: str, dest=None) -> str:
    """Drop the editorial CANONICAL callouts and anything marked as a secret;
    pass every other Obsidian callout through verbatim so the mkdocs-callouts
    plugin renders it."""
    out, i, lines = [], 0, text.splitlines()
    head = re.compile(r"^>\s*\[!\w+\]")
    while i < len(lines):
        if head.match(lines[i]) and ("CANONICAL" in lines[i].upper() or _est_secret(lines[i])):
            # ⭐ Un callout SECRET est mis de côté pour le DM vault ; un callout
            #    CANONICAL est une note d'atelier et disparaît pour de bon. Les
            #    deux se ressemblent et ne vont pas au même endroit.
            # ⚠️ LE MARQUEUR DE SECRET PRIME SUR « CANONICAL ». Le bloc du héron
            #    porte les deux : Eric a écrit CANONICAL parce que c'est le mot
            #    qui empêche de publier, pas parce que c'est une note d'atelier.
            #    Exiger l'absence de CANONICAL jetait précisément le seul bloc
            #    qu'il fallait router. Mesuré : ça donnait zéro secret collecté.
            # 🔴 « VAULT ONLY » N'EST PAS LE SIGNAL DE ROUTAGE. Mesuré le
            #    2026-08-20 : species.md porte 13 callouts marqués vault only,
            #    et ONZE sont des notes d'atelier — « sources », « à ratifier »,
            #    « décisions & réserves », « notes d'édition ». Router sur cette
            #    formule aurait publié les brouillons non ratifiés d'Eric sur une
            #    page ouverte. **Le signal est le mot SECRET dans l'en-tête**, ou
            #    une marque MJ explicite. Le reste reste une note d'atelier et
            #    disparaît pour de bon.
            haut = lines[i].upper()
            secret = ("SECRET" in haut) or ("DM ONLY" in haut) or ("CÔTÉ MJ" in haut)
            bloc = [lines[i]]
            i += 1
            while i < len(lines) and lines[i].lstrip().startswith(">"):
                bloc.append(lines[i]); i += 1
            if secret and dest:
                _SECRETS.setdefault(dest, []).append("\n".join(bloc))
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


def alleger_labels_repetes(body: str) -> str:
    """Une seule ligne, en bas de page, et aucun label dans le corps.

    Eric, 2026-08-21, en cinq remarques successives : « on n'a pas besoin de
    mettre quoted from SRD toutes les 10 lignes » · « au moins 5 fois dans la
    page équipement » · « sérieux » · « et de n'en mettre qu'une en pied de
    page » · puis la formulation elle-même : **« some of the text above in this
    page is SRD content »**.

    Les labels par bloc disparaissent tous. La page qui cite quoi que ce soit
    porte UNE ligne à la fin, discrète, et c'est tout. Le lecteur n'a pas besoin
    qu'on lui montre la couture à chaque paragraphe — il a besoin de savoir, une
    fois, que la page n'est pas entièrement de l'auteur.

    ⚠️ Sans rapport avec la licence : celle-ci est au pied de page global du
    site (voir ATTR_PAR_BLOC et `copyright:` dans mkdocs.yml).
    """
    corps = re.sub(r'<p class="fh-srd-cite__label">.*?</p>\n?', "", body, flags=re.S)
    if corps == body and "fh-srd-cite" not in body:
        return body
    if "fh-srd-cite" in corps:
        corps = corps.rstrip() + (
            '\n\n<p class="fh-srd-note">Some of the text above in this page '
            'is SRD content.</p>\n'
        )
    return corps


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

# ══ LES DOUZE CLASSES, ET LEUR DÉCOUPAGE ══════════════════════════════════
# Eric, 2026-08-28 : *« organisation des classes comme dans species : un blurb
# résumé plus image sur un overview, et des liens vers classes individuelles »*,
# puis *« je veux un PCFH joli à lire et COMPLET »*.
# ⭐ LE DÉCOUPAGE CESSE D'ÊTRE UN CONFORT, IL DEVIENT NÉCESSAIRE : une classe
#    PCFH porte sa table de 20 niveaux, le texte entier de ses ~24 aptitudes et
#    sa sous-classe. Douze sur une page feraient un mur que personne ne lit —
#    exactement le défaut qu'Eric nomme depuis le 20/08.
# ⛔ Une seule liste, comme SPECIES : elle sert le découpage ET les vignettes,
#    pour qu'ils ne puissent jamais se contredire.
CLASSES = [
    ("barbarian", "## Barbarian", "Barbarian"),
    ("bard",      "## Bard",      "Bard"),
    ("cleric",    "## Cleric",    "Cleric"),
    ("druid",     "## Druid",     "Druid"),
    ("fighter",   "## Fighter",   "Fighter"),
    ("monk",      "## Monk",      "Monk"),
    ("paladin",   "## Paladin",   "Paladin"),
    ("ranger",    "## Ranger",    "Ranger"),
    ("rogue",     "## Rogue",     "Rogue"),
    ("sorcerer",  "## Sorcerer",  "Sorcerer"),
    ("warlock",   "## Warlock",   "Warlock"),
    ("wizard",    "## Wizard",    "Wizard"),
]
CLASSES_DIR = DOCS / "classes"
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
        # 🔴 CORRIGÉ LE 2026-09-04 — CETTE LIGNE MANGEAIT UNE LETTRE.
        #    Elle disait `block[0][4:]` : quatre caractères coupés, alors que
        #    `## ` en fait trois. Le quatrième retiré était la PREMIÈRE LETTRE
        #    du titre. Mesuré en production sur les douze pages d'espèce :
        #      `## Araag`         ->  `# raag`     ->  <h1 id="raag">raag
        #      `## [Elf](…)`      ->  `# Elf](…)`  ->  le crochet avalé
        #    ⚠️ Et le commentaire d'origine annonçait `[Elf](…)`, c'est-à-dire
        #       le résultat VOULU, pas le résultat obtenu. Un commentaire qui
        #       décrit l'intention se relit comme une preuve — il a couvert le
        #       défaut aussi longtemps que le défaut a vécu.
        #    ⛔ On ne recompte pas : on retire les dièses et l'espace par motif.
        #       Un décompte de caractères se retrouve faux le jour où la forme
        #       du titre change d'un cran.
        titre = re.sub(r"^#+\s*", "", block[0]).strip()
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


def split_classes():
    """`classes.md` -> un overview + douze pages. Le jumeau de `split_species()`.

    ⭐ ÉCRIT À CÔTÉ PLUTÔT QUE PARAMÉTRÉ, ET C'EST UN CHOIX QUI SE DIT : les
    deux découpages partagent la forme mais pas les règles — une espèce porte
    une vignette `.jpg` et son blurb, une classe porte une vignette `.webp`, un
    blurb ET sa table de points. Paramétrer `split_species` aurait demandé six
    drapeaux ; deux fonctions courtes se lisent mieux qu'une longue à options.
    ⛔ Le jour où elles divergeront pour de bon, on sera content qu'elles soient
    séparées ; le jour où elles convergeront, on les fondra en connaissance.
    """
    src_ = DOCS / "classes.md"
    if not src_.exists():
        print("  !! MISSING classes.md — class pages not split")
        return
    lines = src_.read_text(encoding="utf-8").splitlines()

    starts = []
    for i, ln in enumerate(lines):
        for slug_, head, name in CLASSES:
            if ln.startswith(head):
                starts.append((i, slug_, name))
                break

    # 🔴 LE MÊME GARDE QUE SPECIES : on n'écrit rien plutôt que de publier un
    #    chapitre amputé en silence.
    if len(starts) != len(CLASSES):
        trouve = {s[1] for s in starts}
        manque = [s for s, _, _ in CLASSES if s not in trouve]
        print(f"  !! class split ABORTED: {len(starts)}/{len(CLASSES)} headings"
              f" found, missing {manque} — classes.md left whole")
        return

    end = len(lines)
    for i in range(len(lines) - 1, starts[-1][0], -1):
        if lines[i].strip() == "---":
            end = i
            break
    tail = "\n".join(lines[end:]).strip()

    bornes = [s[0] for s in starts] + [end]
    preamble = [ln for ln in lines[:starts[0][0]]
                if not ln.startswith(MENU_DROP_PREFIX)]

    # ⛔ LA NOTE DE LECTURE QUITTE L'INDEX. `insert_banner_note()` l'avait posée
    #    sous le « # Classes » du chapitre entier ; après le découpage, cet index
    #    ne porte que douze blurbs — pas une seule citation à lire. Elle repart
    #    en pied des pages filles qui citent vraiment (voir plus bas).
    CLASSES_DIR.mkdir(parents=True, exist_ok=True)
    menu = _sans_bloc("\n".join(preamble).rstrip().splitlines(),
                      '<aside class="fh-translate">', "</aside>")

    for n, (i, slug_, name) in enumerate(starts):
        block = lines[i:bornes[n + 1]]
        titre = block[0][3:].strip()
        corps = "\n".join(block[1:]).strip()
        corps = descendre_dun_cran(corps)
        # 🔴 DEUX BLOCS EN PIED, ET RIEN D'AUTRE. Eric, 2026-08-28, devant les
        #    CINQ qui s'y empilaient : *« beaucoup de choses redondantes là
        #    dedans ; seules deux choses bien distinctes et c'est tout — What
        #    Fate's Hand changes, et la ref au SRD en tout petit »*.
        #
        #    Ce qui part, et pourquoi :
        #    · le callout « What Fate's Hand adds to the <Classe> » — mesuré :
        #      pas une information que le bloc au-dessus ne portait déjà, plus
        #      quatre lignes qui ne disent rien (« as printed », « nothing », et
        #      l'échelle commune aux douze, qui vit au chapitre Skills) ;
        #    · le nav « What Fate's Hand does here » — un INSTRUMENT DE MESURE du
        #      chapitre entier, qui annonce « class changes 12 » sur la page
        #      d'UNE classe. Il reste sur l'index, où il est vrai ;
        #    · la note « Reading the quotations » — *« ce qui va dans les skills
        #      va dans les skills, pas besoin de se répéter sur Perception »*.
        #      Le chapitre Skills porte « The Perception split ».
        # ⭐ ET L'ATTRIBUTION PASSE EN DERNIER. Elle fermait le bloc cité, donc
        #    elle tombait AVANT « What Fate's Hand changes » : cinq lignes de
        #    licence en travers de la page, juste avant ce que le lecteur est
        #    venu chercher. Elle reste sur la page — la licence l'exige — mais
        #    en pied et en tout petit, comme Eric l'a demandé.
        attr = re.search(r'<p class="fh-srd-cite__attr">.*?</p>\n?', corps, re.S)
        if attr:
            corps = corps.replace(attr.group(0), "")
            corps = corps.rstrip() + "\n\n" + attr.group(0).strip() + "\n"
        page = f"# {titre}\n\n{corps}\n"
        (CLASSES_DIR / f"{slug_}.md").write_text(page, encoding="utf-8")

        menu.append("")
        menu.append(block[0])
        menu.append("")
        menu.append(f"![{name}](../assets/img/class-{slug_}.webp){{ .fh-thumb }}")
        menu.append("")
        menu.append(_lead_paragraph(block))
        menu.append("")
        menu.append(f"[Read the full entry →](classes/{slug_}.md)")

    menu += ["", tail, ""]
    src_.write_text("\n".join(menu), encoding="utf-8")
    print(f"  ok  classes.md            -> menu + {len(starts)} pages in chapters/classes/")


_PROPORTIONS = []


def mesurer_proportion(dest, avant, apres):
    """Combien de mots sont d'Eric, combien viennent du SRD.

    ⭐ Idée de l'archi FHPC, 2026-08-20, et elle vaut mieux qu'un « test de
    lisibilité ». Ses deux corrections du soir — *« moche et chiant à lire »*,
    *« le rappel en fin de chapitre »* — avaient une cause MÉCANIQUE une fois
    nommée. Ce n'est pas le jugement qui manquait : **c'est la mesure qui
    n'avait jamais été prise.** 339 entrées citées contre 732 mots de lui,
    personne ne l'avait compté avant de le compter.

    ⛔ Ça ne rougit pas et ça ne bloque rien : ça se LIT. Un humain interprète.
    C'est la différence entre une garde et un instrument.

    📌 Et mon propre piège de ce soir est l'argument : j'ai replié sur le NOMBRE
    d'entrées, et douze fiches de classe sont passées à travers avec huit mille
    caractères. Un tableau de proportions me l'aurait donné sans que je me fasse
    avoir.
    """
    cite = len(re.sub(r"<[^>]+>", " ", "".join(re.findall(
        r'<div class="fh-srd-cite.*?</div>', apres, re.S))).split())
    propre = len(re.sub(r"<[^>]+>", " ", avant).split())
    replie = apres.count('<details class="fh-fold">')
    if cite or propre:
        _PROPORTIONS.append((dest, propre, cite, replie))


def afficher_proportions():
    if not _PROPORTIONS:
        return
    print()
    print("  ── proportions : mots d'Eric contre mots cités ──────────────────")
    print("  %-24s %7s %8s %7s  %s" % ("chapitre", "à lui", "cités", "replis", "part citée"))
    tot_p = tot_c = 0
    for dest, propre, cite, replie in sorted(_PROPORTIONS, key=lambda x: -x[2]):
        tot_p += propre; tot_c += cite
        if not cite:
            continue
        part = cite / (propre + cite) * 100
        alerte = " ⚠️" if part > 80 and not replie else ""
        print("  %-24s %7d %8d %7s  %5.1f %%%s"
              % (dest, propre, cite, replie or "—", part, alerte))
    part = tot_c / (tot_p + tot_c) * 100 if (tot_p + tot_c) else 0
    print("  %-24s %7d %8d %7s  %5.1f %%" % ("TOTAL", tot_p, tot_c, "", part))
    print("  ⚠️ = plus de 80 % de la page est cité ET rien n'est replié.")


def main():
    try:
        _construire()
    except SrdCiteError as err:
        # Une citation qui ne résout pas est une erreur d'AUTEUR, pas un bug :
        # elle mérite une phrase, pas une pile d'appels. La trace n'apprend rien
        # que le message ne dise déjà, et elle cache le message.
        raise SystemExit("\n🔴 CITATION IMPOSSIBLE — rien n'a été réécrit.\n   %s\n"
                         % err) from None


def _construire():
    DOCS.mkdir(parents=True, exist_ok=True)
    for dest, (rel, title) in MAP.items():
        src = VAULT / rel
        if not src.exists():
            print(f"  !! MISSING {src}")
            continue
        body = src.read_text(encoding="utf-8")
        body = strip_frontmatter(body)
        body = strip_callouts(body, dest)
        body = strip_liens(body)
        body = fix_path_refs(body)
        body = convert_wikilinks(body)
        body = mark_fh_tags(body)
        # 🔴 LA PASTILLE FH VAUT POUR TOUS LES CHAPITRES — Eric, 2026-08-28 :
        # *« dans le texte, tu mets le petit logo FH quand c'est FH »*, pour les
        # classes. Elle ne vivait que dans `split_species()` : les onze autres
        # chapitres écrivaient `*(FH)*` et le publiaient TEL QUEL — mesuré sur
        # `classes.md`, 29 marques dans la note, ZÉRO pastille sur la page.
        # ⭐ Elle monte donc au pipeline commun, là où toutes les conversions de
        # texte vivent. Species ne change pas d'un pixel : sa propre passe est
        # idempotente (elle ne trouve plus rien à remplacer).
        body = normalize_headings(body)
        body = ensure_h1(body, title)
        avant_citations = body
        body = inject_srd_citations(body, dest)
        # ⛔ APRÈS les citations, jamais avant : c'est le rendu des classes qui
        #    décide quelles aptitudes FH remontent dans la progression, et
        #    `_promues()` retire du callout exactement celles-là. Inversé,
        #    l'ordre ne retirerait rien et la page dirait deux fois la même
        #    règle.
        if dest == "classes.md":
            body = _promues(body)
        body = inject_arcana(body, dest)
        body = alleger_labels_repetes(body)
        mesurer_proportion(dest, avant_citations, body)
        body = insert_banner_note(body, dest)
        body = insert_banner(body, dest)
        body = insert_images(body, dest)
        body = space_before_lists(body)
        body = collapse_blanks(body)
        fuite = [l for l in body.splitlines() if _est_secret(l)]
        if fuite:
            raise SystemExit(
                "\n🔴 REFUS DE PUBLIER — %s porte un marqueur de secret dans le texte\n"
                "   qui SORT vers le site :\n     %s\n"
                "   Un secret ne se publie pas. Mets-le dans un callout marqué "
                "(> [!info]+ CANONICAL — … ne jamais publier), ou retire-le de la source.\n"
                % (dest, "\n     ".join(l[:150] for l in fuite[:3])))
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
    afficher_proportions()
    if _FUITES:
        print("  !! records retirés par FH, survivants DANS du texte cité :")
        for d, noms in sorted(_FUITES.items()):
            print("     %-22s %s" % (d, " · ".join(sorted(noms))))
        print("     (on ne rature pas un mot dans une citation — le chapitre doit "
              "traduire, voir Class Modifications)")
    if _fh_changes() is None:
        print("  ?? fh-changes.json absent (%s) — le menu de tête ne dit "
              "encore RIEN de ce que FH change" % FH_CHANGES)
    split_species()
    split_classes()
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
# ══ LES 22 ARCANES, ET LEUR DÉCOUPAGE ════════════════════════════════════
# Eric, 2026-08-29 : « Mets toutes les cartes avec leur images et leur
# descriptif complet dans le site. Fais quelque chose de joli. Tu peux
# utiliser la logique species et classes sur l'architecture du chapitre. »
# ⛔ Une seule liste, comme SPECIES et CLASSES : elle sert le découpage ET
#    les vignettes, pour qu'ils ne puissent jamais se contredire.
ARCANA22 = [
    ("the-fool",           "### 0. The Fool",             "0",     "The Fool"),
    ("the-magician",       "### I. The Magician",         "I",     "The Magician"),
    ("the-high-priestess", "### II. The High Priestess",  "II",    "The High Priestess"),
    ("the-empress",        "### III. The Empress",        "III",   "The Empress"),
    ("the-emperor",        "### IV. The Emperor",         "IV",    "The Emperor"),
    ("the-hierophant",     "### V. The Hierophant",       "V",     "The Hierophant"),
    ("the-lovers",         "### VI. The Lovers",          "VI",    "The Lovers"),
    ("the-chariot",        "### VII. The Chariot",        "VII",   "The Chariot"),
    ("strength",           "### VIII. Strength",          "VIII",  "Strength"),
    ("the-hermit",         "### IX. The Hermit",          "IX",    "The Hermit"),
    ("wheel-of-fortune",   "### X. Wheel of Fortune",     "X",     "Wheel of Fortune"),
    ("justice",            "### XI. Justice",             "XI",    "Justice"),
    ("the-hanged-man",     "### XII. The Hanged Man",     "XII",   "The Hanged Man"),
    ("death",              "### XIII. Death",             "XIII",  "Death"),
    ("temperance",         "### XIV. Temperance",         "XIV",   "Temperance"),
    ("the-devil",          "### XV. The Devil",           "XV",    "The Devil"),
    ("the-tower",          "### XVI. The Tower",          "XVI",   "The Tower"),
    ("the-star",           "### XVII. The Star",          "XVII",  "The Star"),
    ("the-moon",           "### XVIII. The Moon",         "XVIII", "The Moon"),
    ("the-sun",            "### XIX. The Sun",            "XIX",   "The Sun"),
    ("judgement",          "### XX. Judgement",           "XX",    "Judgement"),
    ("the-world",          "### XXI. The World",          "XXI",   "The World"),
]
ARCANA_DIR = DOCS / "arcana"


def split_arcana():
    """`major-arcana.md` -> un menu-galerie + vingt-deux pages de carte.

    Le troisième jumeau (species, puis classes le 2026-08-28). Ses règles
    propres : la vignette est LA CARTE elle-même (`tarot/major/<num>.jpg`),
    le blurb est le champ **Meaning**, et la page complète ouvre sur la
    carte en grand (`.fh-card-illus`) avant le descriptif.
    ⚠️ TOURNE APRÈS `build_arcana()` : arcana.js lit la page ENTIÈRE ; le
    découpage la remplace par le menu-galerie."""
    src = DOCS / "fates-hand-mechanic.md"
    if not src.exists():
        print("  !! MISSING fates-hand-mechanic.md — arcana pages not split")
        return
    lines = src.read_text(encoding="utf-8").splitlines()

    starts = []
    for i, ln in enumerate(lines):
        for slug_, head, num, name in ARCANA22:
            if ln.startswith(head):
                starts.append((i, slug_, num, name))
                break

    # 🔴 LE MÊME GARDE QUE SPECIES : on n'écrit rien plutôt que de publier un
    #    chapitre amputé en silence.
    if len(starts) != len(ARCANA22):
        trouve = {s[1] for s in starts}
        manque = [s for s, _, _, _ in ARCANA22 if s not in trouve]
        print(f"  !! arcana split ABORTED: {len(starts)}/{len(ARCANA22)} headings"
              f" found, missing {manque} — major-arcana.md left whole")
        return

    # ⚠️ LES CARTES VIVENT AU MILIEU DU CHAPITRE (fusion du 2026-08-29) : la
    #    suite (## 3. Destiny Score… → Final Notes) doit SURVIVRE au découpage.
    end = len(lines)
    for j in range(starts[-1][0] + 1, len(lines)):
        if lines[j].startswith("## "):
            end = j
            break
    bornes = [s[0] for s in starts] + [end]
    preamble = lines[:starts[0][0]]
    suite = lines[end:]

    ARCANA_DIR.mkdir(parents=True, exist_ok=True)
    menu = "\n".join(preamble).rstrip().splitlines()

    for n, (i, slug_, num, name) in enumerate(starts):
        block = lines[i:bornes[n + 1]]
        titre = block[0][3:].strip()
        corps = "\n".join(block[1:]).strip()
        corps = descendre_dun_cran(corps)
        img = ("![%s — Fate's Hand tarot](../../assets/img/tarot/major/%s.jpg)"
               "{ .fh-card-illus }" % (name, num))
        # la table des six ne se serre pas contre la carte flottante : le
        # titre « Vibrations of… » clear le float, la table respire dessous.
        corps = re.sub(r"^(#### Vibrations of .+)$", r"\1 { .fh-clear }", corps, flags=re.M)
        page = f"# {titre}\n\n{img}\n\n{corps}\n"
        (ARCANA_DIR / f"{slug_}.md").write_text(page, encoding="utf-8")

        # ── son entrée au menu, le format de species : titre, vignette
        #    flottante, blurb (le Meaning), lien vers la page complète ──
        meaning = ""
        for ln in block:
            f = re.match(r"^- \*\*Meaning\*\* — (.+)$", ln.strip())
            if f:
                meaning = re.sub(r"\*{1,2}", "", f.group(1)).strip()
                break
        menu.append("")
        menu.append(block[0])
        menu.append("")
        # Eric, 2026-08-29 : « plutôt que de faire moche, découpe une partie de
        # l'image pour avoir un carré » — la vignette du Deck est un CROP carré
        # (thumbs/), la carte entière reste sur la page dédiée.
        menu.append(f"![{name}](../assets/img/tarot/major/thumbs/{num}.jpg){{ .fh-thumb }}")
        menu.append("")
        menu.append(meaning)
        menu.append("")
        menu.append(f"[Read the full entry →](arcana/{slug_}.md)")

    menu.append("")
    menu += suite
    src.write_text("\n".join(menu) + "\n", encoding="utf-8")
    print(f"  ok  fates-hand-mechanic.md -> Deck menu + {len(starts)} pages in chapters/arcana/")


# 🔴 LA SOURCE EST LE VAULT, PAS LA PAGE PUBLIÉE — mesuré au 2e run du
#    2026-08-29 : `split_arcana()` remplace docs/major-arcana.md par le
#    menu-galerie, et au run SUIVANT le lecteur y trouvait 0 carte — le teaser
#    du chapitre Destiny refusait ses trois exemples. Un lecteur qui lit un
#    artefact de build lit l'état du build PRÉCÉDENT.
ARCANA_SRC = VAULT / MAP["fates-hand-mechanic.md"][0]  # le chapitre fusionné Destiny & Arcana
ARCANA_DST = ROOT / "docs" / "javascripts" / "arcana.js"
ARCANA_COUNT = 22
ARCANA_FIELDS = {"meaning": "meaning", "signature ability": "ability", "destiny impact": "impact", "power": "power", "vibration": "vibration"}


def _cartes_de_depart():
    """Les trois arcanes montrées au joueur — LA décision, lue à un seul endroit.

    🔴 POURQUOI ÇA N'EST PAS UNE CONSTANTE ÉCRITE ICI. Eric, 2026-08-20 :
    *« on peut laisser 3 cartes par défaut, que les joueurs choisissent. Et
    après c'est les tirages. »* Ces trois-là sont donc **les mêmes** que les
    trois exemples du chapitre *Destiny* — une seule décision, pas deux. Une
    liste côté site et une liste côté builder divergeraient le jour où Eric en
    change une, et personne ne le verrait.

    ⭐ La source est donc **la directive du chapitre elle-même** : ce que le
    joueur lit et ce que la machine expose ne peuvent pas se contredire, parce
    que c'est la même ligne.
    """
    src = VAULT / MAP["fates-hand-mechanic.md"][0]
    if not src.exists():
        return []
    m = ARCANA_RE.search(src.read_text(encoding="utf-8"))
    return [n.strip() for n in m.group(1).split(",") if n.strip()] if m else []


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
                       "meaning": "", "ability": "", "impact": "", "power": "", "vibration": ""}
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
    # ⚠️ `numeral` est une CLÉ DE JOINTURE, pas un champ d'affichage : c'est par
    #    lui que FH_ARCANA_STARTERS se résout, et que le builder retrouvera la
    #    carte. Deux cartes au même numéral, ou une qui le perd, ne casseraient
    #    rien — la jointure deviendrait silencieusement FAUSSE, ce qui est pire.
    numeraux = [c["numeral"] for c in cards]
    if len(set(numeraux)) != len(numeraux):
        doublons = sorted({n for n in numeraux if numeraux.count(n) > 1})
        print("  !! numéraux d'arcane en double : %s — arcana.js not rebuilt"
              % ", ".join(doublons))
        return
    if len(cards) != ARCANA_COUNT:
        print(f"  !! Found {len(cards)} Major Arcana, expected {ARCANA_COUNT} — arcana.js not rebuilt")
        return
    depart = _cartes_de_depart()
    par_nom = {c["name"].lower(): c for c in cards}
    inconnus = [n for n in depart if n.lower() not in par_nom]
    if inconnus:
        print("  !! cartes de départ inconnues : %s — arcana.js not rebuilt"
              % ", ".join(inconnus))
        return
    numerals = [par_nom[n.lower()]["numeral"] for n in depart]
    ARCANA_DST.write_text(
        "window.FH_ARCANA = " + json.dumps(cards, ensure_ascii=False, separators=(",", ":")) + ";\n"
        + "/* Les trois cartes montrées au joueur, DÉRIVÉES de la directive du\n"
          "   chapitre Destiny — pas une seconde liste. Eric, 2026-08-20 :\n"
          "   « 3 cartes par défaut, que les joueurs choisissent ». */\n"
        + "window.FH_ARCANA_STARTERS = "
        + json.dumps(numerals, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    print(f"  ok  arcana.js              <- major-arcana.md ({len(cards)} cards, "
          f"{len(numerals)} de départ : {', '.join(depart)})")



# ══ CE QUI SORT DE CE DÉPÔT SE DIT, AVANT DE SE FAIRE ══════════════════════
# 🔴 L'INCIDENT, 2026-08-21. Cette passe écrit un fichier d'un AUTRE dépôt :
#    `fhpc/layers/fh-lore-en.layer.json`. Trois fils ont cherché qui salissait
#    la copie de travail de `fhpc` ; le coupable était une publication du PHB.
#
# ⚠️ LA MESURE, PAS LA DOCTRINE. Le geste n'était pas SILENCIEUX — il imprimait
#    `ok  fh-lore-en.layer.json`. Il était ANONYME : un nom de fichier nu se lit
#    comme un fichier d'ici. La nuance dit où porter le remède — nommer le
#    DÉPÔT, pas ajouter une ligne de plus.
#
# ⭐ CE QUE ÇA POSE.
#    · la passe DÉCLARE en préambule ce qu'elle peut écrire dehors et d'où elle
#      lit — avant de rien faire, pas dans son rapport de fin ;
#    · une écriture hors dépôt se nomme avec sa RACINE, la branche du voisin et
#      l'état de la copie de travail qu'elle va salir ;
#    · elle NE SE FAIT PAS si l'octet à écrire est celui qui est déjà là — une
#      publication qui ne change rien ne touche personne ;
#    · la fin de passe récapitule, et redit d'avertir le voisin si ça a bougé ;
#    · un garde qui refuse l'écriture le DIT dans ce récapitulatif : « pas
#      atteinte » et « inchangée » sont deux états différents, et les confondre
#      est exactement la faute que la maison connaît — une absence n'est jamais
#      une réponse.
#
# ⛔ CE QUE ÇA NE CHANGE PAS. Aucun contenu produit. Les gardes en dessous
#    décident toujours seules s'il y a quelque chose à écrire ; ceci ne fait que
#    le dire tout haut. `FH_NO_CROSS_WRITE=1` empêche la sortie — pour publier
#    le site sans jamais toucher au voisin.
DEPOT_ICI = pathlib.Path(__file__).resolve().parent
NO_CROSS_WRITE = os.environ.get("FH_NO_CROSS_WRITE") == "1"

# Une entrée par fichier écrit hors d'ici. C'est CETTE liste que le préambule
# récite : le jour où une seconde sortie apparaît, elle s'annonce toute seule,
# ou elle n'existe pas.
SORTIES_ETRANGERES = []


def _racine_depot(p):
    """La racine git qui contient `p`, ou son dossier si rien n'est suivi."""
    for parent in list(p.parents):
        if (parent / ".git").exists():
            return parent
    return p.parent


def _etat_git(racine):
    """Ce que le voisin a sur les bras AVANT qu'on y touche."""
    import subprocess
    try:
        br = subprocess.run(["git", "-C", str(racine), "branch", "--show-current"],
                            capture_output=True, text=True, timeout=10)
        st = subprocess.run(["git", "-C", str(racine), "status", "--porcelain"],
                            capture_output=True, text=True, timeout=10)
        if br.returncode or st.returncode:
            return "pas un dépôt git"
        sales = [l for l in st.stdout.splitlines() if l.strip()]
        return (f"branche {br.stdout.strip() or '(détachée)'}, "
                f"{len(sales)} fichier(s) déjà modifié(s) chez lui")
    except Exception as e:                          # git absent, dépôt cassé…
        return f"état git illisible ({e.__class__.__name__})"


def declarer_sortie(chemin, quoi):
    """Inscrit une écriture hors dépôt au tableau. À appeler à l'import."""
    racine = _racine_depot(chemin)
    sortie = {
        "chemin": chemin,
        "racine": racine,
        "rel": chemin.relative_to(racine) if racine in chemin.parents else chemin,
        "quoi": quoi,
        # ⛔ L'état de départ n'est pas « rien » : c'est « on n'y est jamais
        #    arrivé ». Un garde plus haut peut arrêter la passe avant.
        "etat": "PAS ATTEINTE (un garde a arrêté avant l'écriture)",
    }
    SORTIES_ETRANGERES.append(sortie)
    return sortie


def ecrire_hors_depot(sortie, contenu, detail=""):
    """Écrit `contenu` dans un fichier d'un autre dépôt, à voix haute.

    Renvoie True seulement si l'octet a bougé sur le disque."""
    chemin, racine = sortie["chemin"], sortie["racine"]
    print(f"  ⚠  ÉCRITURE HORS DÉPÔT → {racine}")
    print(f"     fichier : {sortie['rel']}")
    print(f"     contenu : {detail or sortie['quoi']}")
    print(f"     voisin  : {_etat_git(racine)}")

    if NO_CROSS_WRITE:
        sortie["etat"] = "SAUTÉE (FH_NO_CROSS_WRITE=1)"
        print("     état    : SAUTÉE — FH_NO_CROSS_WRITE=1, le voisin ne bouge pas")
        return False

    ancien = chemin.read_text(encoding="utf-8") if chemin.exists() else None
    if ancien == contenu:
        sortie["etat"] = "inchangée, RIEN ÉCRIT"
        print("     état    : inchangée, RIEN ÉCRIT — le voisin ne bouge pas")
        return False

    chemin.write_text(contenu, encoding="utf-8")
    delta = len(contenu.encode("utf-8")) - (len(ancien.encode("utf-8")) if ancien else 0)
    sortie["etat"] = f"ÉCRITE ({delta:+d} octets)"
    print(f"     état    : ÉCRITE ({delta:+d} octets) — la copie de travail de "
          f"« {racine.name} » a bougé")
    return True


def _sources_lues():
    """D'où cette passe se nourrit. Une lecture ne salit personne, mais
    l'ignorer coûte le même temps qu'une écriture anonyme."""
    return [
        (VAULT,        "les chapitres — le manuscrit"),
        (SF_TOOLS,     "les données Soulforge"),
        (SRD_EXPORTS,  "les exports SRD, cités à la construction"),
        (FH_CHANGES,   "fh-changes.json — ce que FH retire, pour ne pas le citer"),
        (BUILDER_SRC,  "les deux pages-outils (builder, roller)"),
    ]


def preambule():
    """Ce que la passe VA toucher — dit avant, pas après."""
    print("  ┌─ ce que cette passe touche ────────────────────────────────")
    print(f"  │  ici    ✎ {DEPOT_ICI}")
    print( "  │           docs/ est RÉÉCRIT INTÉGRALEMENT à chaque passe")
    for s in SORTIES_ETRANGERES:
        print(f"  │  DEHORS ✎ {s['racine']}  ←  {s['rel']}")
        print(f"  │           {s['quoi']}")
    if SORTIES_ETRANGERES:
        print("  │           " + ("FH_NO_CROSS_WRITE=1 : aucune sortie ne se fera"
                                  if NO_CROSS_WRITE
                                  else "FH_NO_CROSS_WRITE=1 pour l'en empêcher"))
    vus = set()
    for p, quoi in _sources_lues():
        r = _racine_depot(p) if p.suffix else p
        if str(r) in vus:
            continue
        vus.add(str(r))
        print(f"  │  lit    ↦ {r}")
        print(f"  │           {quoi}")
    print("  └────────────────────────────────────────────────────────────")


def recapitulatif():
    """Et ce qu'elle a VRAIMENT touché dehors."""
    if not SORTIES_ETRANGERES:
        return
    print("  ┌─ dépôts voisins, après la passe ───────────────────────────")
    for s in SORTIES_ETRANGERES:
        print(f"  │  {s['racine'].name} / {s['rel']}")
        print(f"  │     → {s['etat']}")
    bouge = sorted({s["racine"].name for s in SORTIES_ETRANGERES
                    if s["etat"].startswith("ÉCRITE")})
    if bouge:
        print("  │")
        print(f"  │  🔴 PRÉVIENS LE FIL « {', '.join(bouge)} » : sa copie de travail")
        print( "  │     a bougé, et ce n'est pas lui qui l'a fait. Le commit lui")
        print( "  │     revient — ce dépôt-ci ne commite pas chez le voisin.")
    print("  └────────────────────────────────────────────────────────────")


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
SORTIE_LORE = declarer_sortie(
    LORE_LAYER,
    "le lore d'espèce, importé depuis les chapitres species/ de ce site")
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


# ══ ET MAINTENANT LE CHAPITRE ENTIER, PAS SEULEMENT SON AMBIANCE ═══════════
# Eric, 2026-08-18 : le builder n'affichait qu'un blurb de prose par espèce.
# Il lui faut LE CHAPITRE — les traits, les tables de lignage, tout.
#
# ⭐ ADDITIF, ET C'EST LA CONDITION DU LOT. `data.lore.text` NE BOUGE PAS :
#    c'est l'intro en prose, `lore.mjs` la découpe en nœuds texte et des
#    gardes en dépendent. Ce qui suit s'AJOUTE À CÔTÉ, dans
#    `data.lore.sections`, et ne relit jamais ce que `text` porte déjà.
#
# 📐 LA FORME EST ARRÊTÉE PAR ERIC, PAS DEVINÉE ICI :
#      sections = [ {heading, text} | {heading, table:{columns, rows}} , … ]
#    · l'ordre est celui du chapitre, de haut en bas — une LISTE, pas un
#      objet : deux sections peuvent porter le même titre, l'ordre non ;
#    · un bloc porte SOIT `text` SOIT `table`, jamais les deux ;
#    · pas de section vide, et pas de `sections: []` — un chapitre qui n'a
#      rien de plus que sa prose n'a PAS le champ.
#
# ⚠️ ICI LE BALISAGE INLINE RESTE, contrairement à `_plain()` juste au-dessus.
#    Ce n'est pas une incohérence, c'est une décision d'Eric : `*Faerie Fire*`
#    et `**Drow**` sont ce qu'une cellule de lignage DIT, et c'est son écran
#    qui les rend. Les aplatir ici déciderait à sa place, et un balisage
#    aplati ne se remet pas.
_TITRE_RE = re.compile(r"^\*\*([^*]+)\*\*$")        # `**Traits**`, seul sur sa ligne
_SEP_RE = re.compile(r"^\|[\s:|-]+\|$")             # `|---|---|`
_ITALIQUE_SEULE_RE = re.compile(r"^\*[^*].*\*$")    # la ligne d'attribution, en pied
_FH_TAG = '<span class="fh-tag">FH</span>'


def _inline(md: str) -> str:
    """Le balisage inline du chapitre, GARDÉ — sauf ce qui n'existe que sur le site.

    ⛔ LA PASTILLE REDEVIENT DU MARKDOWN. `mark_fh_tags()` fabrique le
    `<span class="fh-tag">` pour la PAGE ; le vault, lui, écrit `*(FH)*`. La
    couche n'est pas la page : y laisser du HTML obligerait le builder à un
    `innerHTML`, et aucun `innerHTML` ne traverse ce dépôt-là. On rend donc au
    marqueur la forme que la source lui donne — rien n'est perdu.

    ⛔ ET UN LIEN TOMBE SUR SON TEXTE. `[skill points](../skills-and-tools.md)`
    est un chemin RELATIF AU SITE : dans le builder il ne mène nulle part. On
    garde ce qu'il dit, on jette où il pointe. C'est le SEUL balisage aplati."""
    md = md.replace(_FH_TAG, "*(FH)*")
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)   # [texte](url) -> texte
    return md.strip()


def _cellules(ligne: str) -> list:
    ligne = ligne.strip()
    if ligne.startswith("|"):
        ligne = ligne[1:]
    if ligne.endswith("|"):
        ligne = ligne[:-1]
    return [_inline(c) for c in ligne.split("|")]


def _table(lignes: list) -> dict:
    """Une table Markdown -> `{columns, rows}`, cellules balisées comprises.

    ⭐ LA TABLE « EN DEUX COLONNES DE JOURNAL » SE REMET À PLAT. Le Dragonborn
    imprime `| Dragon | Damage | Dragon | Damage |` : dix dragons rangés en
    cinq lignes de deux paires. C'est une MISE EN PAGE, pas une donnée à
    quatre colonnes — un écran qui la reprendrait telle quelle afficherait
    deux fois la même colonne. On la relit donc demi par demi, de haut en bas :
    le demi gauche d'abord, le demi droit ensuite. C'est l'ordre où les dix
    dragons ressortent alphabétiques, Black → White, celui qu'on lit à l'œil.

    ⛔ ET SEULEMENT SI L'EN-TÊTE SE RÉPÈTE À L'IDENTIQUE. Une vraie table à
    quatre colonnes distinctes (les lignages de l'elfe) n'y touche pas."""
    entete = _cellules(lignes[0])
    corps = [_cellules(l) for l in lignes[2:]]      # lignes[1] = le séparateur
    n = len(entete)
    base = n
    for taille in range(1, n):
        if n % taille == 0 and entete == entete[:taille] * (n // taille):
            base = taille
            break
    if base == n:
        return {"columns": entete, "rows": corps}
    rangs = []
    for demi in range(n // base):
        for r in corps:
            tranche = r[demi * base:(demi + 1) * base]
            if any(c for c in tranche):
                rangs.append(tranche)
    return {"columns": entete[:base], "rows": rangs}


def _paragraphes(lignes: list) -> list:
    """Les lignes de prose d'une section -> des paragraphes.

    ⭐ UNE PUCE EST UN PARAGRAPHE, ET ELLE GARDE SON TIRET. Les traits sont
    une liste (`- **Darkvision** — 60 feet.`) : les recoller en un pavé
    rendrait dix traits en une phrase. Chacun sort séparément — le champ dit
    « paragraphes séparés par une ligne vide », et c'est ce qu'un rendu naïf
    saura poser — et le tiret reste, parce que c'est lui qui dit « liste » à
    l'écran qui voudra en faire des puces.

    Une suite de lignes qui ne sont PAS des puces se recolle, elle : c'est un
    paragraphe replié par l'éditeur, pas plusieurs."""
    paras, groupe = [], []

    def vider():
        if not groupe:
            return
        if all(l.lstrip().startswith("- ") for l in groupe):
            paras.extend(_inline(l.strip()) for l in groupe)
        else:
            paras.append(_inline(" ".join(l.strip() for l in groupe)))
        groupe.clear()

    for ln in lignes:
        if ln.strip() == "":
            vider()
            continue
        groupe.append(ln)
    vider()
    return [p for p in paras if p]


def _sans_bords_vides(lignes: list) -> list:
    while lignes and lignes[0].strip() == "":
        lignes = lignes[1:]
    while lignes and lignes[-1].strip() == "":
        lignes = lignes[:-1]
    return lignes


def _runs(lignes: list) -> list:
    """Le corps d'une section, coupé entre ce qui est une table et ce qui ne
    l'est pas — parce qu'un bloc porte SOIT `text` SOIT `table`.

    Sur les douze chapitres d'aujourd'hui, chaque section n'en donne qu'un
    seul. Le jour où l'une mêlera prose et table, elle sortira en DEUX blocs
    sous le même titre — dans l'ordre — plutôt que d'en perdre la moitié en
    silence."""
    runs, courant, table = [], [], None
    for ln in lignes:
        if ln.strip() == "":
            courant.append(ln)
            continue
        est = ln.strip().startswith("|")
        if table is not None and est != table:
            runs.append(_sans_bords_vides(courant))
            courant = []
        table = est
        courant.append(ln)
    if courant:
        runs.append(_sans_bords_vides(courant))
    return [r for r in runs if r]


def _sections_du_chapitre(lignes: list) -> list:
    """La page d'une espèce -> ses sections, de `**Traits**` au pied de page.

    ⭐ CE QUI OUVRE LES SECTIONS EST CE QUI FERME LA PROSE : le premier titre
    en gras seul sur sa ligne. Au-dessus c'est `data.lore.text`, et il ne
    bouge pas ; au-dessous, tout descend. Un seul point de coupe pour les
    deux champs — ils ne peuvent donc ni se chevaucher ni laisser un trou.

    ⛔ LE PIED NE DESCEND PAS. Les douze pages finissent, avant la règle
    horizontale, sur UNE ligne en italique qui dit d'où vient le texte
    (`*Base SRD text: …*`, `*Les Araag … no SRD counterpart.*`). C'est de la
    PROVENANCE, et la couche la porte déjà — champ `provenance` du record,
    `attribution` de la couche. La règle horizontale qui suit ouvre la licence
    CC-BY que `split_species()` recopie sur chaque page : elle non plus."""
    blocs, titre, corps = [], None, []

    def fermer():
        nonlocal corps
        if titre is not None:
            for run in _runs(corps):
                if len(run) >= 2 and run[0].strip().startswith("|") \
                        and _SEP_RE.match(run[1].strip()):
                    blocs.append({"heading": titre, "table": _table(run)})
                    continue
                paras = _paragraphes(run)
                if paras:
                    blocs.append({"heading": titre, "text": "\n\n".join(paras)})
        corps = []

    for ln in lignes:
        if ln.strip() == "---":
            break
        t = _TITRE_RE.match(ln.strip())
        if t:
            fermer()
            titre = t.group(1).strip()
            continue
        if titre is None:
            continue          # au-dessus du premier titre : c'est `lore.text`
        corps.append(ln)
    fermer()

    if blocs and "text" in blocs[-1]:
        paras = blocs[-1]["text"].split("\n\n")
        if paras and _ITALIQUE_SEULE_RE.match(paras[-1]):
            paras.pop()
            if paras:
                blocs[-1]["text"] = "\n\n".join(paras)
            else:
                blocs.pop()
    return blocs


def build_species_lore():
    import json
    if not LORE_LAYER.exists():
        SORTIE_LORE["etat"] = "impossible : le fichier du voisin n'existe pas"
        print(f"  !! MISSING {LORE_LAYER} — lore d'espèce non importé")
        return
    couche = json.loads(LORE_LAYER.read_text(encoding="utf-8"))
    especes = couche.get("records", {}).get("species")
    if not isinstance(especes, dict):
        SORTIE_LORE["etat"] = "impossible : le voisin n'a pas de records.species"
        print("  !! fh-lore-en n'a pas de records.species — lore non importé")
        return

    faits, manques, blocs_total = 0, [], 0
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
        lore = {
            "text": texte,
            # La provenance dit D'OÙ, pas QUI : c'est ce que le garde des
            # provenances de `fiche-360` sait déjà lire.
            "provenance": "fh-original"
        }
        # ⛔ `sections` N'APPARAÎT QUE S'IL Y A QUELQUE CHOSE DEDANS. Un
        #    `sections: []` obligerait chaque lecteur à distinguer « pas de
        #    sections » de « une liste vide » — deux façons de dire la même
        #    chose, donc une de trop (loi §0.5, un état illisible se refuse).
        sections = _sections_du_chapitre(lignes[1:])   # on saute le H1
        if sections:
            lore["sections"] = sections
        entree.setdefault("changes", {})["data.lore"] = lore
        blocs_total += len(sections)
        faits += 1

    # 🔴 UN GARDE, PAS UNE SUPPOSITION : on n'écrit rien plutôt que de publier
    #    une couche à moitié importée, dont la moitié restante daterait d'avant.
    if faits != len(SPECIES):
        SORTIE_LORE["etat"] = (f"REFUSÉE par le garde : {faits}/{len(SPECIES)} "
                               f"importés, manque {manques}")
        print(f"  !! lore d'espèce ABORTED : {faits}/{len(SPECIES)} importés, manque {manques}")
        return
    ecrire_hors_depot(
        SORTIE_LORE,
        json.dumps(couche, indent=2, ensure_ascii=False) + "\n",
        detail=(f"lore d'espèce ← docs/chapters/species/ "
                f"({faits} espèces, {blocs_total} sections)"))


# ══ L'ARBRE DU MENU, DÉRIVÉ ════════════════════════════════════════════════
# ⛔ PAS UN TROISIÈME GESTE. La doctrine dit deux gestes — sync puis déploiement.
#    Un `build_nav.py` qu'on lancerait à la main serait oublié un jour, et le
#    menu vieillirait sans que rien ne le dise : exactement le défaut qu'il
#    répare. Il entre donc DANS la passe.
# ⚠️ Il a besoin de `yaml` et de `markdown`, que le python système n'a pas —
#    on l'exécute avec l'interpréteur du venv, celui qui construit le site.
def build_nav():
    import subprocess, sys
    py = ROOT / ".venv" / "bin" / "python"
    if not py.exists():
        print("  !! .venv absent — arbre du menu NON régénéré, il vieillit")
        return
    r = subprocess.run([str(py), str(ROOT / "build_nav.py")],
                       capture_output=True, text=True)
    print((r.stdout or "").rstrip() or f"  !! build_nav a échoué : {r.stderr.strip()[:200]}")


if __name__ == "__main__":
    print("Syncing FH PHB chapters from vault…")
    preambule()
    main()
    build_chaos_tables()
    build_arcana()
    split_arcana()
    build_species_lore()
    build_nav()
    recapitulatif()
    print("Done.")
