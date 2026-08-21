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
            out.append("<dt>%s</dt>" % html.escape(r["name"]))
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
    "major-arcana.md":     ["arcana"],
    "feats.md":            ["feat"],
    "trainings.md":        ["training"],
    "rules-glossary.md":   ["glossary"],
    "skills-synergies.md": ["skill"],
    "spells.md":           ["spell"],
    "magic-items.md":      ["item"],
    "crafting.md":         ["tool"],
    "chaos-tables.md":     ["monster"],
    # « — » : le SRD ne dit rien de ces sujets. Explicites, pas absents.
    "identity.md": [], "ability-scores.md": [], "fates-hand-mechanic.md": [],
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
    if not genres:
        return (
            '<nav class="fh-layer fh-layer--own">\n'
            '<p><strong>Entirely Fate\u2019s Hand.</strong> The base game says nothing about this '
            "subject — every rule on this page is Eric's.</p>\n</nav>\n"
        )
    changes = _fh_changes()
    lignes, mesures, tout_vide = [], 0, True
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
    trouves = sorted({f.split(" (")[0] for f in _FUITES.get(dest, set())}
                     & set(TRADUCTIONS))
    if not trouves:
        return ""
    out = ['<aside class="fh-translate">',
           '<p class="fh-translate__label">Reading the quotations on this page</p>', "<ul>"]
    for nom in trouves:
        out.append("<li><strong>%s</strong> does not exist in Fate\u2019s Hand — %s.</li>"
                   % (html.escape(nom), TRADUCTIONS[nom]))
    out.append("</ul>")
    out.append("<p>The quotations below are the base game\u2019s, word for word. We do not edit a "
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
            cur = {"numeral": h.group(1), "name": h.group(2).strip(),
                   "meaning": "", "impact": "", "power": "", "vibration": ""}
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
ARCANA_ART_READY = False


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
    out = ['<div class="fh-arcana-teaser">']
    for n in voulus:
        c = par_nom[n.lower()]
        out.append('<figure class="fh-arcana-card%s">'
                   % ("" if ARCANA_ART_READY else " fh-arcana-card--noart"))
        if ARCANA_ART_READY:
            out.append('<img src="../../assets/img/tarot/major/%s.jpg" alt="%s" loading="lazy">'
                       % (html.escape(c["numeral"]), html.escape(c["name"])))
        out.append('<figcaption><span class="fh-arcana-num">%s</span> %s</figcaption>'
                   % (html.escape(c["numeral"]), html.escape(c["name"])))
        out.append("<dl>")
        for libelle, cle in (("Meaning", "meaning"), ("Impact", "impact"),
                             ("Power", "power"), ("Vibration", "vibration")):
            if c.get(cle):
                out.append("<dt>%s</dt><dd>%s</dd>" % (libelle, html.escape(c[cle])))
        out.append("</dl></figure>")
    if not ARCANA_ART_READY:
        out.append('<p class="fh-arcana-note">The twenty-two cards are being '
                   "painted. These three are shown by their text alone until "
                   "the deck is finished.</p>")
    out.append("</div>")
    return "\n".join(out)


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
    "species.md":             ("1. Build a Character/D&D 5+ Races & Species.md",              "Species"),
    "skills-and-tools.md":    ("1. Build a Character/Skills & Tools — Player Guide.md",                       "Skills & Tools"),
    "feats.md":               ("2. At the Table/Feats.md",                                                "Feats"),
    "skills-synergies.md":    ("2. At the Table/4. Skills and synergies.md",              "Skills, Synergies & DCs"),
    "fates-hand-mechanic.md": ("1. Build a Character/D&D 5+ Fate’s Hand Mechanic.md",               "Destiny System"),
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
    "major-arcana.md":        ("1. Build a Character/The Major Arcana.md",                          "Arcana"),
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
        body = normalize_headings(body)
        body = ensure_h1(body, title)
        avant_citations = body
        body = inject_srd_citations(body, dest)
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


if __name__ == "__main__":
    print("Syncing FH PHB chapters from vault…")
    preambule()
    main()
    build_chaos_tables()
    build_arcana()
    build_species_lore()
    recapitulatif()
    print("Done.")
