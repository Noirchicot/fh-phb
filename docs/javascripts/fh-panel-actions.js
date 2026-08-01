/* Fate's Hand — Companion belt panel: ACTIONS.
   Manual-first turn economy and action launcher. The character snapshot does
   not yet expose trustworthy weapons, actions or features, so this panel owns
   only SRD reference actions and entries the player configures themselves.
*/
(function () {
  "use strict";

  var SCHEMA = "fh-actions/1";
  var ECONOMIES = ["action", "bonus", "reaction"];
  var CATEGORIES = ["Attack", "Check", "Damage", "Utility"];
  var ABILITIES = ["", "STR", "DEX", "CON", "INT", "WIS", "CHA"];
  var SOURCES = ["SRD", "PHB", "FH", "Manual"];
  var DEFAULTS = [
    ["srd-attack", "Attack", "action", "Attack", "STR", "Make a weapon attack."],
    ["srd-dash", "Dash", "action", "Utility", "", "Use the Dash action."],
    ["srd-disengage", "Disengage", "action", "Utility", "", "Use the Disengage action."],
    ["srd-dodge", "Dodge", "action", "Utility", "", "Use the Dodge action."],
    ["srd-help", "Help", "action", "Utility", "", "Use the Help action."],
    ["srd-hide", "Hide", "action", "Utility", "", "Use the Hide action; resolve any check the table calls for."],
    ["srd-influence", "Influence", "action", "Utility", "", "Use the Influence action; resolve any check the table calls for."],
    ["srd-magic", "Magic", "action", "Utility", "", "Use the Magic action."],
    ["srd-ready", "Ready", "action", "Utility", "", "Ready an action and state its trigger."],
    ["srd-search", "Search", "action", "Utility", "", "Use the Search action; resolve any check the table calls for."],
    ["srd-study", "Study", "action", "Utility", "", "Use the Study action; resolve any check the table calls for."],
    ["srd-utilize", "Utilize", "action", "Utility", "", "Use the Utilize action."],
    ["srd-opportunity", "Opportunity Attack", "reaction", "Attack", "STR", "Make an Opportunity Attack."],
    ["srd-readied", "Readied Action", "reaction", "Utility", "", "Use the action you readied when its trigger occurs."]
  ];
  var RESERVED_IDS = DEFAULTS.reduce(function (ids, row) { ids[row[0]] = true; return ids; }, Object.create(null));

  function text(value, fallback, limit) {
    if (typeof value !== "string") value = fallback || "";
    value = value.trim();
    return value.slice(0, limit || 240);
  }

  function number(value, fallback, min, max) {
    value = Number(value);
    if (!isFinite(value)) value = fallback;
    return Math.max(min, Math.min(max, value));
  }

  function defaultEntry(row) {
    return {
      id: row[0], name: row[1], economy: row[2], category: row[3],
      ability: row[4], bonus: 0, dc: null, note: row[5], source: "SRD",
      custom: false
    };
  }

  function normalizeEntry(raw, fallbackId, custom) {
    raw = raw && typeof raw === "object" ? raw : {};
    var economy = ECONOMIES.indexOf(raw.economy) >= 0 ? raw.economy : "action";
    var category = CATEGORIES.indexOf(raw.category) >= 0 ? raw.category : "Utility";
    var ability = ABILITIES.indexOf(raw.ability) >= 0 ? raw.ability : "";
    var source = SOURCES.indexOf(raw.source) >= 0 ? raw.source : (custom ? "Manual" : "SRD");
    var dc = raw.dc === "" || raw.dc == null ? null : number(raw.dc, 0, 0, 99);
    return {
      id: text(raw.id, fallbackId, 80) || fallbackId,
      name: text(raw.name, "Untitled action", 100),
      economy: economy,
      category: category,
      ability: ability,
      bonus: number(raw.bonus, 0, -99, 99),
      dc: dc,
      note: text(raw.note, "", 500),
      source: source,
      custom: custom === undefined ? raw.custom !== false : !!custom
    };
  }

  function normalizeStore(store) {
    var rawEntries = Array.isArray(store.entries) ? store.entries : [];
    var byId = Object.create(null), entries = [];

    function recoveryId(index) {
      var base = "manual-recovered-" + index, id = base, suffix = 2;
      while (byId[id] || RESERVED_IDS[id]) { id = base + "-" + suffix; suffix += 1; }
      return id;
    }

    rawEntries.forEach(function (raw, index) {
      raw = raw && typeof raw === "object" ? raw : {};
      var requestedId = text(raw.id, "", 80);
      var canonicalReserved = !!(requestedId && RESERVED_IDS[requestedId] && raw.custom === false && !byId[requestedId]);
      var id = requestedId && !byId[requestedId] && (!RESERVED_IDS[requestedId] || canonicalReserved) ? requestedId : recoveryId(index);
      var entry = normalizeEntry(raw, id, !canonicalReserved);
      /* The allocated id is authoritative. normalizeEntry also accepts a
         fallback for ordinary callers, but must never resurrect raw.id after
         this function has rejected it as duplicate or reserved. */
      entry.id = id;
      byId[id] = true;
      entries.push(entry);
    });
    DEFAULTS.forEach(function (row) {
      if (byId[row[0]]) {
        entries = entries.map(function (entry) {
          return entry.id === row[0] ? normalizeEntry(entry, row[0], false) : entry;
        });
      } else {
        entries.push(defaultEntry(row));
      }
    });
    var rawTurn = store.turn && typeof store.turn === "object" ? store.turn : {};
    var attackMax = Math.round(number(rawTurn.attackMax, 1, 1, 6));
    store.schema = SCHEMA;
    store.entries = entries;
    store.turn = {
      attackMax: attackMax,
      attackUsed: Math.round(number(rawTurn.attackUsed, 0, 0, attackMax)),
      bonusUsed: !!rawTurn.bonusUsed,
      reactionUsed: !!rawTurn.reactionUsed,
      nickAvailable: !!rawTurn.nickAvailable,
      nickUsed: !!rawTurn.nickUsed,
      vexReady: !!rawTurn.vexReady
    };
    if (!store.editor || typeof store.editor !== "object") store.editor = {id: ""};
    store.editor.id = text(store.editor.id, "", 80);
    if (!entries.some(function (entry) { return entry.id === store.editor.id; })) store.editor.id = "";
    return store;
  }

  function entryById(store, id) {
    for (var i = 0; i < store.entries.length; i += 1) {
      if (store.entries[i].id === id) return store.entries[i];
    }
    return null;
  }

  function newManualId(store) {
    var base = "manual-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    var id = base, suffix = 2;
    while (RESERVED_IDS[id] || entryById(store, id)) { id = base + "-" + suffix; suffix += 1; }
    return id;
  }

  function selected(current, value) {
    return current === value ? " selected" : "";
  }

  function option(ctx, value, label, current) {
    return "<option value=\"" + ctx.esc(value) + "\"" + selected(current, value) + ">" + ctx.esc(label) + "</option>";
  }

  function economyAvailable(turn, economy, category) {
    if (economy === "bonus") return !turn.bonusUsed;
    if (economy === "reaction") return !turn.reactionUsed;
    if (category === "Attack") return turn.attackUsed < turn.attackMax;
    return turn.attackUsed === 0;
  }

  function consume(turn, entry) {
    if (!economyAvailable(turn, entry.economy, entry.category)) return false;
    if (entry.economy === "bonus") turn.bonusUsed = true;
    else if (entry.economy === "reaction") turn.reactionUsed = true;
    else if (entry.category === "Attack") turn.attackUsed += 1;
    else turn.attackUsed = turn.attackMax;
    return true;
  }

  function economyName(value) {
    return value === "bonus" ? "Bonus Action" : value === "reaction" ? "Reaction" : "Action";
  }

  function rollCategory(entry) {
    return entry.category === "Attack" || entry.category === "Check";
  }

  function runEntry(ctx, store, entry, quick) {
    if (!consume(store.turn, entry)) {
      ctx.note(economyName(entry.economy) + " unavailable — start a new turn or correct the tracker.", "warn");
      ctx.refresh();
      return;
    }
    var note = entry.note;
    if (entry.category === "Attack" && store.turn.vexReady) {
      store.turn.vexReady = false;
      note = (note ? note + " · " : "") + "Vex ready: manually confirm Advantage only if this is the same target.";
    }
    ctx.save();
    if (rollCategory(entry)) {
      if (quick) ctx.roll(entry.name, entry.ability, entry.bonus, note);
      else ctx.openConsole(entry.name, entry.ability, entry.bonus, note, entry.dc);
    } else {
      ctx.note(entry.name + " used" + (entry.note ? " — " + entry.note : "") + ".", entry.category === "Damage" ? "damage" : "note");
      ctx.refresh();
    }
  }

  function turnTracker(ctx, turn) {
    var attacks = "";
    for (var i = 1; i <= turn.attackMax; i += 1) {
      attacks += "<button type=\"button\" class=\"fh-cd-actions-slot" + (i <= turn.attackUsed ? " is-used" : "") +
        "\" data-actions-attack-slot=\"" + i + "\" aria-pressed=\"" + (i <= turn.attackUsed) + "\">ATK " + i + "</button>";
    }
    return "<div class=\"fh-cd-actions-turn\" aria-label=\"Turn tracker\">" +
      "<div class=\"fh-cd-actions-turnline\">" + attacks +
      "<button type=\"button\" class=\"fh-cd-actions-slot" + (turn.bonusUsed ? " is-used" : "") + "\" data-actions-toggle=\"bonus\" aria-pressed=\"" + turn.bonusUsed + "\">BA</button>" +
      "<button type=\"button\" class=\"fh-cd-actions-slot" + (turn.reactionUsed ? " is-used" : "") + "\" data-actions-toggle=\"reaction\" aria-pressed=\"" + turn.reactionUsed + "\">R</button>" +
      "<button type=\"button\" class=\"fh-cd-actions-new-turn\" data-actions-new-turn>NEW TURN</button></div>" +
      "<div class=\"fh-cd-actions-tools\"><label>ATTACKS <input type=\"number\" min=\"1\" max=\"6\" value=\"" + turn.attackMax + "\" data-actions-attack-max></label>" +
      "<button type=\"button\" class=\"fh-cd-actions-state" + (turn.vexReady ? " is-ready" : "") + "\" data-actions-vex aria-pressed=\"" + turn.vexReady + "\">" + (turn.vexReady ? "VEX READY · CANCEL" : "ARM VEX") + "</button>" +
      "<button type=\"button\" class=\"fh-cd-actions-state" + (turn.nickAvailable ? " is-ready" : "") + "\" data-actions-light aria-pressed=\"" + turn.nickAvailable + "\"" + (turn.attackUsed < 1 || turn.nickUsed ? " disabled" : "") + ">LIGHT FOLLOW-UP</button>" +
      "<button type=\"button\" class=\"fh-cd-actions-state" + (turn.nickUsed ? " is-used" : "") + "\" data-actions-nick" + (!turn.nickAvailable || turn.nickUsed ? " disabled" : "") + ">" + (turn.nickUsed ? "NICK USED" : "USE NICK") + "</button></div>" +
      "<p class=\"fh-cd-actions-rule-note\">Vex and Light/Nick are manual until attack-result and weapon hooks exist.</p></div>";
  }

  function card(ctx, entry, turn) {
    var available = economyAvailable(turn, entry.economy, entry.category);
    var details = [entry.source, entry.category];
    if (entry.ability) details.push(entry.ability + " " + ctx.signed(entry.bonus));
    else if (entry.bonus) details.push(ctx.signed(entry.bonus));
    if (entry.dc != null) details.push("DC " + entry.dc);
    var buttons = "";
    if (rollCategory(entry)) {
      buttons += "<button type=\"button\" data-actions-run=\"" + ctx.esc(entry.id) + "\"" + (available ? "" : " disabled") + ">CONSOLE</button>" +
        "<button type=\"button\" data-actions-quick=\"" + ctx.esc(entry.id) + "\"" + (available ? "" : " disabled") + ">QUICK</button>";
    } else {
      buttons += "<button type=\"button\" data-actions-use=\"" + ctx.esc(entry.id) + "\"" + (available ? "" : " disabled") + ">USE</button>";
    }
    buttons += "<button type=\"button\" class=\"fh-cd-actions-secondary\" data-actions-mark=\"" + ctx.esc(entry.id) + "\"" + (available ? "" : " disabled") + ">MARK USED</button>" +
      "<button type=\"button\" class=\"fh-cd-actions-icon\" data-actions-edit=\"" + ctx.esc(entry.id) + "\" aria-label=\"Edit " + ctx.esc(entry.name) + "\">EDIT</button>";
    if (entry.custom) buttons += "<button type=\"button\" class=\"fh-cd-actions-icon is-danger\" data-actions-delete=\"" + ctx.esc(entry.id) + "\" aria-label=\"Delete " + ctx.esc(entry.name) + "\">DELETE</button>";
    return "<article class=\"fh-cd-actions-card" + (available ? "" : " is-used") + "\" data-actions-card=\"" + ctx.esc(entry.id) + "\">" +
      "<div class=\"fh-cd-actions-cardhead\"><h4>" + ctx.esc(entry.name) + "</h4><span>" + ctx.esc(details.join(" · ")) + "</span></div>" +
      (entry.note ? "<p>" + ctx.esc(entry.note) + "</p>" : "") +
      "<div class=\"fh-cd-actions-cardbuttons\">" + buttons + "</div></article>";
  }

  function column(ctx, store, economy, title) {
    var entries = store.entries.filter(function (entry) { return entry.economy === economy; });
    return "<section class=\"fh-cd-actions-column\" data-actions-economy=\"" + economy + "\"><h3>" + title + " <span>" + entries.length + "</span></h3>" +
      (entries.length ? entries.map(function (entry) { return card(ctx, entry, store.turn); }).join("") : "<p class=\"fh-cd-actions-empty\">No universal Bonus Action. Add only what this character can actually do.</p>") + "</section>";
  }

  function editor(ctx, store) {
    var editing = entryById(store, store.editor.id);
    var entry = editing || {id: "", name: "", economy: "action", category: "Attack", ability: "", bonus: 0, dc: null, note: "", source: "Manual", custom: true};
    return "<details class=\"fh-cd-actions-editor-wrap\"" + (editing ? " open" : "") + "><summary>" + (editing ? "EDIT ACTION · " + ctx.esc(entry.name) : "+ ADD CUSTOM ACTION") + "</summary>" +
      "<form class=\"fh-cd-actions-editor\" data-actions-editor>" +
      "<div class=\"fh-cd-actions-editor-title\"><h3>" + (editing ? "EDIT ACTION" : "ADD CUSTOM ACTION") + "</h3>" +
      (editing ? "<button type=\"button\" data-actions-cancel-edit>CANCEL</button>" : "") + "</div>" +
      "<input type=\"hidden\" data-actions-field=\"id\" value=\"" + ctx.esc(entry.id) + "\">" +
      "<div class=\"fh-cd-actions-formgrid\">" +
      "<label class=\"is-wide\"><span>NAME</span><input required maxlength=\"100\" data-actions-field=\"name\" value=\"" + ctx.esc(entry.name) + "\" placeholder=\"Longsword, Second Wind…\"></label>" +
      "<label><span>ECONOMY</span><select data-actions-field=\"economy\">" + ECONOMIES.map(function (value) { return option(ctx, value, economyName(value), entry.economy); }).join("") + "</select></label>" +
      "<label><span>CATEGORY</span><select data-actions-field=\"category\">" + CATEGORIES.map(function (value) { return option(ctx, value, value, entry.category); }).join("") + "</select></label>" +
      "<label><span>ABILITY</span><select data-actions-field=\"ability\">" + ABILITIES.map(function (value) { return option(ctx, value, value || "None", entry.ability); }).join("") + "</select></label>" +
      "<label><span>BONUS</span><input type=\"number\" min=\"-99\" max=\"99\" data-actions-field=\"bonus\" value=\"" + entry.bonus + "\"></label>" +
      "<label><span>DC (OPTIONAL)</span><input type=\"number\" min=\"0\" max=\"99\" data-actions-field=\"dc\" value=\"" + (entry.dc == null ? "" : entry.dc) + "\"></label>" +
      "<label><span>SOURCE</span><select data-actions-field=\"source\">" + SOURCES.map(function (value) { return option(ctx, value, value, entry.source); }).join("") + "</select></label>" +
      "<label class=\"is-wide\"><span>NOTE</span><textarea maxlength=\"500\" rows=\"2\" data-actions-field=\"note\" placeholder=\"Damage, target reminder, trigger…\">" + ctx.esc(entry.note) + "</textarea></label></div>" +
      "<div class=\"fh-cd-actions-editor-buttons\"><button type=\"button\" data-actions-save>SAVE</button><button type=\"button\" data-actions-save-run>SAVE &amp; USE</button></div>" +
      "<p>CONSOLE prepares the shared d20 console; QUICK rolls immediately. Damage and Utility log their use without inventing a d20.</p></form></details>";
  }

  function readField(form, name) {
    var input = form && form.querySelector("[data-actions-field=\"" + name + "\"]");
    return input ? input.value : "";
  }

  function saveEditor(event, ctx, store, runAfter) {
    var body = event.target.closest("[data-panel-body=\"actions\"]");
    var form = body && body.querySelector("[data-actions-editor]");
    var id = text(readField(form, "id"), "", 80);
    var existing = id ? entryById(store, id) : null;
    var name = text(readField(form, "name"), "", 100);
    if (!name) {
      ctx.note("Action name is required.", "warn");
      return null;
    }
    if (!existing) {
      id = newManualId(store);
      existing = {id: id, custom: true};
      store.entries.push(existing);
    }
    var next = normalizeEntry({
      id: existing.id, name: name, economy: readField(form, "economy"), category: readField(form, "category"),
      ability: readField(form, "ability"), bonus: readField(form, "bonus"), dc: readField(form, "dc"),
      note: readField(form, "note"), source: readField(form, "source"), custom: existing.custom
    }, existing.id, existing.custom);
    Object.keys(next).forEach(function (key) { existing[key] = next[key]; });
    store.editor.id = "";
    ctx.save();
    if (runAfter) runEntry(ctx, store, existing, false);
    else ctx.refresh();
    return existing;
  }

  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "actions",
    label: "Actions",
    tint: "#9f2f31",
    order: 30,
    showsRoller: true,
    render: function (ctx) {
      var store = normalizeStore(ctx.store("actions"));
      return "<div class=\"fh-cd-zone fh-cd-actions\" data-actions-schema=\"" + SCHEMA + "\">" +
        turnTracker(ctx, store.turn) +
        "<div class=\"fh-cd-actions-board\">" + column(ctx, store, "action", "ACTION") + column(ctx, store, "bonus", "BONUS ACTION") + column(ctx, store, "reaction", "REACTION") + "</div>" +
        editor(ctx, store) + "</div>";
    },
    onClick: function (event, ctx) {
      var button = event.target.closest("button");
      if (!button) return false;
      var store = normalizeStore(ctx.store("actions"));
      var turn = store.turn, entry, id;
      if (button.dataset.actionsNewTurn !== undefined) {
        turn.attackUsed = 0; turn.bonusUsed = false; turn.reactionUsed = false;
        turn.nickAvailable = false; turn.nickUsed = false; turn.vexReady = false;
        ctx.save(); ctx.note("New turn — Action, Bonus Action and Reaction restored.", "note"); ctx.refresh(); return true;
      }
      if (button.dataset.actionsAttackSlot !== undefined) {
        var slot = number(button.dataset.actionsAttackSlot, 1, 1, turn.attackMax);
        turn.attackUsed = slot <= turn.attackUsed ? slot - 1 : slot;
        ctx.save(); ctx.refresh(); return true;
      }
      if (button.dataset.actionsToggle === "bonus") { turn.bonusUsed = !turn.bonusUsed; ctx.save(); ctx.refresh(); return true; }
      if (button.dataset.actionsToggle === "reaction") { turn.reactionUsed = !turn.reactionUsed; ctx.save(); ctx.refresh(); return true; }
      if (button.dataset.actionsVex !== undefined) { turn.vexReady = !turn.vexReady; ctx.save(); ctx.refresh(); return true; }
      if (button.dataset.actionsLight !== undefined) {
        if (turn.attackUsed > 0 && !turn.nickUsed) turn.nickAvailable = !turn.nickAvailable;
        ctx.save(); ctx.refresh(); return true;
      }
      if (button.dataset.actionsNick !== undefined) {
        if (turn.nickAvailable && !turn.nickUsed) { turn.nickAvailable = false; turn.nickUsed = true; ctx.save(); ctx.note("Nick used — the Light follow-up stays inside the Attack action.", "note"); ctx.refresh(); }
        return true;
      }
      if (button.dataset.actionsEdit !== undefined) { store.editor.id = button.dataset.actionsEdit; ctx.refresh(); return true; }
      if (button.dataset.actionsCancelEdit !== undefined) { store.editor.id = ""; ctx.refresh(); return true; }
      if (button.dataset.actionsDelete !== undefined) {
        id = button.dataset.actionsDelete; entry = entryById(store, id);
        if (entry && entry.custom) { store.entries = store.entries.filter(function (item) { return item.id !== id; }); if (store.editor.id === id) store.editor.id = ""; ctx.save(); ctx.refresh(); }
        return true;
      }
      if (button.dataset.actionsSave !== undefined) { saveEditor(event, ctx, store, false); return true; }
      if (button.dataset.actionsSaveRun !== undefined) { saveEditor(event, ctx, store, true); return true; }
      id = button.dataset.actionsRun || button.dataset.actionsQuick || button.dataset.actionsUse || button.dataset.actionsMark;
      if (id) {
        entry = entryById(store, id);
        if (!entry) return true;
        if (button.dataset.actionsMark) { if (consume(turn, entry)) { ctx.save(); ctx.refresh(); } }
        else runEntry(ctx, store, entry, button.dataset.actionsQuick !== undefined);
        return true;
      }
      return false;
    },
    onChange: function (event, ctx) {
      if (!event.target || event.target.dataset.actionsAttackMax === undefined) return false;
      var store = normalizeStore(ctx.store("actions"));
      store.turn.attackMax = Math.round(number(event.target.value, 1, 1, 6));
      store.turn.attackUsed = Math.min(store.turn.attackUsed, store.turn.attackMax);
      ctx.save(); ctx.refresh(); return true;
    }
  });
})();
