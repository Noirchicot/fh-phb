/* Fate's Hand — Companion belt panel: SPELLS.
   Manual V1: prepared spells, slot tracking, and casting through the shared
   roller when a spell attack is required.

   ctx.character.spells supplies a minimal name + level catalogue. It does not
   supply slots, preparation, attack/save numbers or damage, so those remain
   explicit manual state in ctx.store("spells"). The frozen panel contract also
   has no spell-intent/feed hook. Casts retain the exact pending `spell` intent
   in the panel store and say plainly that delivery is unavailable until core
   exposes a hook; this file does not silently claim that the table saw it.
*/
(function () {
  "use strict";

  var ABILITIES = ["INT", "WIS", "CHA", "STR", "DEX", "CON"];
  var AREA_SHAPES = ["", "cone", "cube", "cylinder", "line", "sphere"];
  var CAST_TYPES = ["none", "attack", "save"];

  function number(value, fallback) {
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : fallback;
  }

  function integer(value, fallback, min, max) {
    var parsed = Math.floor(number(value, fallback));
    return Math.max(min, Math.min(max, parsed));
  }

  function string(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function oneOf(value, values) {
    return values.indexOf(value) >= 0 ? value : null;
  }

  function spellLevel(value) {
    if ((typeof value !== "number" && typeof value !== "string") ||
        (typeof value === "string" && !value.trim())) return null;
    var parsed = Number(value);
    return isFinite(parsed) && Math.floor(parsed) === parsed && parsed >= 0 && parsed <= 9 ? parsed : null;
  }

  function optionalNumber(value) {
    if ((typeof value !== "number" && typeof value !== "string") ||
        (typeof value === "string" && !value.trim())) return null;
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : null;
  }

  function normalizeSlots(value) {
    var normalized = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) return normalized;
    Object.keys(value).forEach(function (key) {
      var level = Number(key);
      var current = value[key];
      if (String(level) !== key || Math.floor(level) !== level || level < 1 || level > 9 ||
          !current || typeof current !== "object" || Array.isArray(current)) return;
      var maximumValue = optionalNumber(current.max);
      var usedValue = optionalNumber(current.used);
      if (maximumValue === null) return;
      var maximum = integer(maximumValue, 0, 0, 20);
      if (!maximum) return;
      normalized[key] = {max: maximum, used: usedValue === null ? 0 : integer(usedValue, 0, 0, maximum)};
    });
    return normalized;
  }

  function normalizeStoredSpell(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    var name = string(value.name);
    if (!name) return null;
    var level = spellLevel(value.level);
    var ability = oneOf(string(value.ability).toUpperCase(), ABILITIES);
    var castType = oneOf(value.castType, CAST_TYPES);
    var areaShape = oneOf(value.areaShape, AREA_SHAPES);
    var attackBonus = optionalNumber(value.attackBonus);
    var saveDc = optionalNumber(value.saveDc);
    var areaSize = optionalNumber(value.areaSize);
    return {
      id: string(value.id),
      source: value.source === "character" ? "character" : "manual",
      name: name,
      level: level,
      prepared: typeof value.prepared === "boolean" ? value.prepared : null,
      castType: castType,
      ability: ability,
      attackBonus: attackBonus !== null ? integer(attackBonus, 0, -20, 30) : null,
      saveDc: saveDc !== null ? integer(saveDc, 10, 0, 40) : null,
      saveEffect: oneOf(value.saveEffect, ["none", "half"]),
      areaShape: areaShape,
      areaSize: areaSize !== null && areaSize > 0 ? areaSize : null,
      areaUnit: value.areaUnit === "ft" ? "ft" : null,
      damageDice: string(value.damageDice),
      damageType: string(value.damageType).toLowerCase(),
      notes: string(value.notes)
    };
  }

  function normalizeSpells(value, nextIdValue) {
    var raw = Array.isArray(value) ? value : [];
    var seen = Object.create(null);
    var highest = 0;
    raw.forEach(function (spell) {
      var id = spell && typeof spell === "object" ? string(spell.id) : "";
      var match = /^manual-(\d+)$/.exec(id);
      var numericId = match ? Number(match[1]) : 0;
      if (numericId <= Number.MAX_SAFE_INTEGER) highest = Math.max(highest, numericId);
    });
    var requested = optionalNumber(nextIdValue);
    var nextId = requested !== null && Math.floor(requested) === requested && requested > 0 &&
      requested <= Number.MAX_SAFE_INTEGER ? requested : 1;
    nextId = Math.max(nextId, highest + 1);

    var spells = [];
    raw.forEach(function (value) {
      var spell = normalizeStoredSpell(value);
      if (!spell) return;
      if (!spell.id || seen[spell.id]) {
        while (seen["manual-" + nextId]) nextId += 1;
        spell.id = "manual-" + nextId++;
      }
      seen[spell.id] = true;
      spells.push(spell);
    });
    while (seen["manual-" + nextId]) nextId += 1;
    return {spells: spells, nextId: nextId};
  }

  function characterSpells(character) {
    var source = character && Array.isArray(character.spells) ? character.spells : [];
    var seen = Object.create(null);
    return source.map(function (value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) return null;
      var name = string(value.name);
      var level = spellLevel(value.level);
      var key = name.toLowerCase() + "\u0000" + level;
      if (!name || level === null || seen[key]) return null;
      seen[key] = true;
      return {name: name, level: level};
    }).filter(Boolean);
  }

  function castConfigured(spell) {
    return oneOf(spell.castType, CAST_TYPES) !== null &&
      (spell.castType !== "attack" || (spell.ability && spell.attackBonus !== null)) &&
      (spell.castType !== "save" || (spell.ability && spell.saveDc !== null && spell.saveEffect));
  }

  function panelStore(ctx) {
    var store = ctx.store("spells");
    var normalized = normalizeSpells(store.spells, store.nextId);
    store.spells = normalized.spells;
    store.slots = normalizeSlots(store.slots);
    store.nextId = normalized.nextId;
    store.version = 1;
    return store;
  }

  function option(ctx, value, label, selected) {
    return "<option value=\"" + ctx.esc(value) + "\"" +
      (String(value) === String(selected) ? " selected" : "") + ">" +
      ctx.esc(label) + "</option>";
  }

  function slot(store, level) {
    var current = store.slots[String(level)] || {};
    var maximum = integer(current.max, 0, 0, 20);
    return {max: maximum, used: integer(current.used, 0, 0, maximum)};
  }

  function remainingSlots(store, level) {
    var current = slot(store, level);
    return Math.max(0, current.max - current.used);
  }

  function spellIntent(spell) {
    var intent = {kind: "spell", name: spell.name, level: spell.level};
    if (spell.areaShape && spell.areaSize && spell.areaUnit) {
      intent.area = {shape: spell.areaShape, size: spell.areaSize, unit: spell.areaUnit};
    }
    if (spell.castType === "save") {
      intent.save = {
        ability: spell.ability,
        dc: spell.saveDc,
        effect: spell.saveEffect
      };
    }
    if (spell.damageDice && spell.damageType) {
      intent.damage = [{dice: spell.damageDice, type: spell.damageType}];
    }
    return intent;
  }

  function castSummary(spell, intent) {
    var parts = [spell.name, spell.level === 0 ? "cantrip" : "level " + spell.level];
    if (intent.area) parts.push(intent.area.size + " " + intent.area.unit + " " + intent.area.shape);
    if (intent.save) parts.push(intent.save.ability + " save DC " + intent.save.dc +
      (intent.save.effect === "half" ? " (half)" : ""));
    if (intent.damage && intent.damage.length) parts.push(intent.damage[0].dice + " " + intent.damage[0].type);
    return parts.join(" · ");
  }

  function renderSlots(ctx, store) {
    var chips = "";
    for (var level = 1; level <= 9; level += 1) {
      var current = slot(store, level);
      if (!current.max) continue;
      chips += "<div class=\"fh-cd-spell-slot\"><b>L" + level + "</b><span>" +
        (current.max - current.used) + "/" + current.max + "</span>" +
        "<button type=\"button\" data-spell-action=\"slot-use\" data-level=\"" + level +
        "\" aria-label=\"Use a level " + level + " slot\">−</button>" +
        "<button type=\"button\" data-spell-action=\"slot-restore\" data-level=\"" + level +
        "\" aria-label=\"Restore a level " + level + " slot\">+</button></div>";
    }
    if (!chips) chips = "<small class=\"fh-cd-spell-empty\">No spell slots configured.</small>";
    var levels = "";
    for (var i = 1; i <= 9; i += 1) levels += option(ctx, i, "Level " + i, 1);
    return "<section class=\"fh-cd-spell-slots\"><div class=\"fh-cd-spell-head\"><b>SLOTS</b>" +
      "<small>remaining / maximum</small></div><div class=\"fh-cd-spell-slotlist\">" + chips + "</div>" +
      "<details class=\"fh-cd-spell-config\"><summary>Configure slots</summary><div>" +
      "<select data-spell-slot-level aria-label=\"Slot level\">" + levels + "</select>" +
      "<input data-spell-slot-max type=\"number\" min=\"0\" max=\"20\" value=\"4\" aria-label=\"Maximum slots\">" +
      "<button type=\"button\" data-spell-action=\"slot-set\">Set</button></div></details></section>";
  }

  function renderSpell(ctx, store, spell) {
    var level = spell.level;
    var levelKnown = level !== null;
    var remaining = levelKnown && level > 0 ? remainingSlots(store, level) : null;
    var configured = castConfigured(spell);
    var unavailable = !levelKnown || spell.prepared !== true || !configured || (level > 0 && remaining < 1);
    var meta = !levelKnown ? "LEVEL NOT SET" : (level ? "LEVEL " + level : "CANTRIP");
    if (spell.castType === "attack") meta += " · SPELL ATTACK";
    if (spell.castType === "save" && spell.ability && spell.saveDc !== null) {
      meta += " · " + ctx.esc(spell.ability) + " SAVE DC " + spell.saveDc;
    }
    if (!configured) meta += " · CAST DETAILS NEEDED";
    return "<article class=\"fh-cd-spell-card" + (spell.prepared ? " is-prepared" : "") + "\">" +
      "<div class=\"fh-cd-spell-title\"><button type=\"button\" class=\"fh-cd-spell-prep\" " +
      "data-spell-action=\"prepare\" data-spell-id=\"" + ctx.esc(spell.id) + "\" aria-pressed=\"" +
      (spell.prepared === true ? "true" : "false") + "\" title=\"Toggle prepared\">" +
      (spell.prepared === true ? "◆" : "◇") + "</button><div><b>" + ctx.esc(spell.name) + "</b><small>" + meta +
      "</small></div><button type=\"button\" class=\"fh-cd-spell-delete\" data-spell-action=\"delete\" " +
      "data-spell-id=\"" + ctx.esc(spell.id) + "\" aria-label=\"Delete " + ctx.esc(spell.name) + "\">×</button></div>" +
      (spell.notes ? "<p>" + ctx.esc(spell.notes) + "</p>" : "") +
      "<div class=\"fh-cd-spell-castrow\"><span>" + (!levelKnown ? "Level required" :
        (level ? remaining + " slot" + (remaining === 1 ? "" : "s") + " left" : "At will")) +
      "</span><button type=\"button\" data-spell-action=\"cast\" data-spell-id=\"" + ctx.esc(spell.id) + "\"" +
      (unavailable ? " disabled" : "") + ">" + (spell.castType === "attack" ? "Prepare attack" : "Cast") +
      "</button></div></article>";
  }

  function renderCharacterSpell(ctx, spell) {
    var level = spell.level ? "LEVEL " + spell.level : "CANTRIP";
    return "<article class=\"fh-cd-spell-card fh-cd-spell-import\"><div class=\"fh-cd-spell-title\">" +
      "<div><b>" + ctx.esc(spell.name) + "</b><small>" + level + " · CHARACTER LIST</small></div></div>" +
      "<p>Preparation, slots and casting details are not provided. Add it below to configure casting.</p></article>";
  }

  function renderAddForm(ctx) {
    var levels = option(ctx, 0, "Cantrip", 0);
    var abilities = "";
    var shapes = "";
    for (var level = 1; level <= 9; level += 1) levels += option(ctx, level, "Level " + level, 0);
    ABILITIES.forEach(function (ability) { abilities += option(ctx, ability, ability, "INT"); });
    AREA_SHAPES.forEach(function (shape) { shapes += option(ctx, shape, shape || "No area", ""); });
    return "<details class=\"fh-cd-spell-add\"><summary>Add a spell</summary><div class=\"fh-cd-spell-form\">" +
      "<label class=\"is-wide\">Name<input data-spell-field=\"name\" maxlength=\"80\" placeholder=\"Burning Hands\"></label>" +
      "<label>Level<select data-spell-field=\"level\">" + levels + "</select></label>" +
      "<label>Casting<select data-spell-field=\"castType\"><option value=\"none\">No roll</option>" +
      "<option value=\"attack\">Spell attack</option><option value=\"save\">Saving throw</option></select></label>" +
      "<label>Ability<select data-spell-field=\"ability\">" + abilities + "</select></label>" +
      "<label>Attack bonus<input data-spell-field=\"attackBonus\" type=\"number\" min=\"-20\" max=\"30\" value=\"0\"></label>" +
      "<label>Save DC<input data-spell-field=\"saveDc\" type=\"number\" min=\"0\" max=\"40\" value=\"10\"></label>" +
      "<label>Save effect<select data-spell-field=\"saveEffect\"><option value=\"none\">None</option>" +
      "<option value=\"half\">Half</option></select></label>" +
      "<label>Area<select data-spell-field=\"areaShape\">" + shapes + "</select></label>" +
      "<label>Area size<input data-spell-field=\"areaSize\" type=\"number\" min=\"0\" max=\"1000\" value=\"0\"></label>" +
      "<label>Damage dice<input data-spell-field=\"damageDice\" maxlength=\"24\" placeholder=\"3d6\"></label>" +
      "<label>Damage type<input data-spell-field=\"damageType\" maxlength=\"32\" placeholder=\"fire\"></label>" +
      "<label class=\"is-wide\">Notes<input data-spell-field=\"notes\" maxlength=\"160\" placeholder=\"Range, components, reminder…\"></label>" +
      "<label class=\"fh-cd-spell-check is-wide\"><input data-spell-field=\"prepared\" type=\"checkbox\" checked> Prepared</label>" +
      "<button type=\"button\" class=\"is-wide\" data-spell-action=\"add\">Add spell</button></div></details>";
  }

  function field(body, name) {
    return body && body.querySelector("[data-spell-field=\"" + name + "\"]");
  }

  function findSpell(store, id) {
    for (var i = 0; i < store.spells.length; i += 1) {
      if (String(store.spells[i].id) === String(id)) return store.spells[i];
    }
    return null;
  }

  function saveAndRefresh(ctx) {
    ctx.save();
    ctx.refresh();
  }

  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "spells",
    label: "Spells",
    tint: "#6b4a8c",
    order: 40,
    showsRoller: true,
    render: function (ctx) {
      var store = panelStore(ctx);
      var catalogue = characterSpells(ctx.character);
      var configured = Object.create(null);
      store.spells.forEach(function (spell) {
        if (spell.level !== null) configured[spell.name.toLowerCase() + "\u0000" + spell.level] = true;
      });
      var catalogueCards = catalogue.filter(function (spell) {
        return !configured[spell.name.toLowerCase() + "\u0000" + spell.level];
      }).map(function (spell) { return renderCharacterSpell(ctx, spell); }).join("");
      var cards = catalogueCards + store.spells.map(function (spell) { return renderSpell(ctx, store, spell); }).join("");
      if (!cards) cards = "<div class=\"fh-cd-spell-empty fh-cd-spell-empty-list\"><b>No spells yet.</b>" +
        "<span>Add the character's spells manually.</span></div>";
      var pending = store.lastCast && store.lastCast.delivery === "core-hook-missing" ?
        "<div class=\"fh-cd-spell-feedgap\"><b>LOCAL CAST</b> Spell intent is saved, but the current core cannot send it to the table feed.</div>" : "";
      var source = catalogue.length ?
        "<div class=\"fh-cd-spell-source\"><b>CHARACTER LIST</b><span>" + catalogue.length +
          " spell" + (catalogue.length === 1 ? "" : "s") + " provide name and level only; tracking and cast details are manual.</span></div>" :
        "<div class=\"fh-cd-spell-source\"><b>MANUAL V1</b><span>No character spell catalogue is available; slots and cast details are manual.</span></div>";
      return "<div class=\"fh-cd-zone fh-cd-spells\">" +
        source + pending + renderSlots(ctx, store) +
        "<section class=\"fh-cd-spell-book\"><div class=\"fh-cd-spell-head\"><b>SPELLBOOK</b><small>◆ prepared</small></div>" +
        cards + renderAddForm(ctx) + "</section></div>";
    },
    onClick: function (event, ctx) {
      var button = event.target.closest("button");
      if (!button || !button.dataset.spellAction) return false;
      var body = event.target.closest("[data-panel-body=\"spells\"]");
      var store = panelStore(ctx);
      var action = button.dataset.spellAction;
      var level;
      var current;

      if (action === "slot-set") {
        level = integer(body.querySelector("[data-spell-slot-level]").value, 1, 1, 9);
        var maximum = integer(body.querySelector("[data-spell-slot-max]").value, 0, 0, 20);
        if (!maximum) delete store.slots[String(level)];
        else store.slots[String(level)] = {max: maximum, used: Math.min(slot(store, level).used, maximum)};
        saveAndRefresh(ctx);
        return true;
      }

      if (action === "slot-use" || action === "slot-restore") {
        level = integer(button.dataset.level, 1, 1, 9);
        current = slot(store, level);
        current.used = action === "slot-use" ? Math.min(current.max, current.used + 1) : Math.max(0, current.used - 1);
        store.slots[String(level)] = current;
        saveAndRefresh(ctx);
        return true;
      }

      if (action === "add") {
        var nameInput = field(body, "name");
        var name = nameInput ? nameInput.value.trim() : "";
        if (!name) {
          ctx.note("A spell needs a name before it can be added.", "warning");
          return true;
        }
        store.spells.push({
          id: "manual-" + store.nextId++, source: "manual", name: name,
          level: integer(field(body, "level").value, 0, 0, 9),
          prepared: !!field(body, "prepared").checked,
          castType: field(body, "castType").value,
          ability: field(body, "ability").value,
          attackBonus: integer(field(body, "attackBonus").value, 0, -20, 30),
          saveDc: integer(field(body, "saveDc").value, 10, 0, 40),
          saveEffect: field(body, "saveEffect").value,
          areaShape: field(body, "areaShape").value,
          areaSize: number(field(body, "areaSize").value, 0), areaUnit: "ft",
          damageDice: field(body, "damageDice").value.trim(),
          damageType: field(body, "damageType").value.trim().toLowerCase(),
          notes: field(body, "notes").value.trim()
        });
        saveAndRefresh(ctx);
        ctx.note(name + " added to the manual spellbook.", "note");
        return true;
      }

      var spell = findSpell(store, button.dataset.spellId);
      if (!spell) return false;
      if (action === "prepare") {
        spell.prepared = !spell.prepared;
        saveAndRefresh(ctx);
        return true;
      }
      if (action === "delete") {
        store.spells = store.spells.filter(function (candidate) { return candidate !== spell; });
        saveAndRefresh(ctx);
        return true;
      }
      if (action === "cast") {
        level = spell.level;
        if (level === null || spell.prepared !== true || !castConfigured(spell) ||
            (level > 0 && remainingSlots(store, level) < 1)) {
          ctx.note(spell.name + " cannot be cast: complete its details, prepare it and check its remaining slots.", "warning");
          return true;
        }
        if (level) {
          current = slot(store, level);
          current.used += 1;
          store.slots[String(level)] = current;
        }
        var intent = spellIntent(spell);
        store.lastCast = {at: new Date().toISOString(), delivery: "core-hook-missing", intent: intent};
        ctx.save();
        ctx.note(castSummary(spell, intent) + " · LOCAL ONLY — spell feed intent unavailable in core.", "warning");
        if (spell.castType === "attack") {
          ctx.openConsole(spell.name, spell.ability, spell.attackBonus, "Spell attack", null);
        }
        ctx.refresh();
        return true;
      }
      return false;
    }
  });
})();
