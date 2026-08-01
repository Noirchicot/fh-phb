/* Fate's Hand — Companion belt panel: TRAITS.
   Abilities, traits and feats. The build/DDB payload does not currently expose
   any of those as structured data, so V1 is deliberately manual rather than
   guessing at a source. Entries live in ctx.store("traits").

   Store schema (v1):
     {version:1, editingId:"", items:[
       {id, name, details, maxUses, remaining, recharge}
     ]}
   recharge is one of none | short | long | day.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];

  var rechargeLabels = {
    none: "Manual",
    short: "Short Rest",
    long: "Long Rest",
    day: "Daily"
  };

  function integer(value, fallback) {
    var parsed = parseInt(value, 10);
    return isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function makeId() {
    return "trait-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 7);
  }

  function normalizeItem(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    var maxUses = clamp(integer(raw.maxUses, 1), 0, 99);
    var recharge = rechargeLabels[raw.recharge] ? raw.recharge :
      (maxUses ? "long" : "none");
    return {
      id: String(raw.id || makeId()),
      name: String(raw.name || "Untitled trait"),
      details: String(raw.details || ""),
      maxUses: maxUses,
      remaining: clamp(integer(raw.remaining, maxUses), 0, maxUses),
      recharge: recharge
    };
  }

  function getStore(ctx) {
    var store = ctx.store("traits");
    store.version = 1;
    store.editingId = String(store.editingId || "");
    store.items = Array.isArray(store.items) ? store.items.map(normalizeItem) : [];
    return store;
  }

  function findItem(store, id) {
    for (var i = 0; i < store.items.length; i++) {
      if (store.items[i].id === id) return store.items[i];
    }
    return null;
  }

  function option(ctx, value, current, label) {
    return "<option value=\"" + value + "\"" +
      (value === current ? " selected" : "") + ">" + ctx.esc(label) + "</option>";
  }

  function renderEditor(ctx, item) {
    return "<article class=\"fh-cd-trait-card is-editing\" data-trait-id=\"" +
      ctx.esc(item.id) + "\">" +
      "<label class=\"fh-cd-trait-field is-wide\"><span>Name</span>" +
      "<input type=\"text\" maxlength=\"80\" data-trait-field=\"name\" value=\"" +
      ctx.esc(item.name) + "\"></label>" +
      "<div class=\"fh-cd-trait-formrow\">" +
      "<label class=\"fh-cd-trait-field\"><span>Max uses</span>" +
      "<input type=\"number\" min=\"0\" max=\"99\" inputmode=\"numeric\" " +
      "data-trait-field=\"maxUses\" value=\"" + item.maxUses + "\"></label>" +
      "<label class=\"fh-cd-trait-field\"><span>Recovers</span>" +
      "<select data-trait-field=\"recharge\">" +
      option(ctx, "none", item.recharge, "Manually") +
      option(ctx, "short", item.recharge, "Short Rest") +
      option(ctx, "long", item.recharge, "Long Rest") +
      option(ctx, "day", item.recharge, "Daily") +
      "</select></label></div>" +
      "<label class=\"fh-cd-trait-field is-wide\"><span>Rules / reminder</span>" +
      "<textarea rows=\"3\" maxlength=\"1000\" data-trait-field=\"details\" " +
      "placeholder=\"What does it do?\">" + ctx.esc(item.details) + "</textarea></label>" +
      "<div class=\"fh-cd-trait-editacts\">" +
      "<button type=\"button\" data-trait-done>Done</button>" +
      "<button type=\"button\" class=\"is-danger\" data-trait-delete>Delete</button>" +
      "</div></article>";
  }

  function renderPips(item) {
    var html = "";
    for (var i = 0; i < item.maxUses; i++) {
      html += "<i class=\"" + (i < item.remaining ? "is-full" : "") + "\"></i>";
    }
    return html;
  }

  function renderItem(ctx, item) {
    var exhausted = item.maxUses > 0 && item.remaining === 0;
    return "<article class=\"fh-cd-trait-card" + (exhausted ? " is-empty" : "") +
      "\" data-trait-id=\"" + ctx.esc(item.id) + "\">" +
      "<div class=\"fh-cd-trait-title\"><div><h3>" + ctx.esc(item.name) + "</h3>" +
      "<small>" + ctx.esc(item.maxUses ? rechargeLabels[item.recharge] : "Passive") +
      "</small></div><button type=\"button\" data-trait-edit aria-label=\"Edit " +
      ctx.esc(item.name) + "\">Edit</button></div>" +
      (item.details ? "<p>" + ctx.esc(item.details) + "</p>" : "") +
      (item.maxUses ?
        "<div class=\"fh-cd-trait-tracker\"><div class=\"fh-cd-trait-pips\" aria-hidden=\"true\">" +
        renderPips(item) + "</div><strong aria-live=\"polite\">" + item.remaining + " / " + item.maxUses +
        "</strong><button type=\"button\" data-trait-spend" +
        (exhausted ? " disabled" : "") + " aria-label=\"Spend one use of " +
        ctx.esc(item.name) + "\">Use</button>" +
        "<button type=\"button\" data-trait-restore" +
        (item.remaining >= item.maxUses ? " disabled" : "") +
        " aria-label=\"Restore one use of " + ctx.esc(item.name) + "\">+</button></div>" :
        "<div class=\"fh-cd-trait-passive\">Always available</div>") +
      "</article>";
  }

  function resetItems(store, kind) {
    var count = 0;
    store.items.forEach(function (item) {
      var matches = kind === "short" ? item.recharge === "short" :
        kind === "long" ? item.recharge === "short" || item.recharge === "long" :
        item.recharge === "day";
      if (matches && item.remaining < item.maxUses) {
        item.remaining = item.maxUses;
        count += 1;
      }
    });
    return count;
  }

  function itemFromEvent(event, store) {
    var card = event.target.closest("[data-trait-id]");
    return card ? findItem(store, card.dataset.traitId) : null;
  }

  function persist(ctx, message) {
    ctx.save();
    if (message) ctx.note(message, "note");
    ctx.refresh();
  }

  window.FH.panels.push({
    id: "traits",
    label: "Traits",
    tint: "#4a7a3a",
    order: 20,
    showsRoller: false,
    render: function (ctx) {
      var store = getStore(ctx);
      var cards = store.items.map(function (item) {
        return store.editingId === item.id ? renderEditor(ctx, item) : renderItem(ctx, item);
      }).join("");
      return "<div class=\"fh-cd-zone fh-cd-traits\">" +
        "<div class=\"fh-cd-traits-head\"><div><b>Manual tracker</b>" +
        "<small>Trait data is not supplied by the character record yet.</small></div>" +
        "<button type=\"button\" data-trait-add>+ Add</button></div>" +
        "<div class=\"fh-cd-traits-resets\"><span>Recover:</span>" +
        "<button type=\"button\" data-trait-reset=\"short\">Short Rest</button>" +
        "<button type=\"button\" data-trait-reset=\"long\">Long Rest</button>" +
        "<button type=\"button\" data-trait-reset=\"day\">Daily</button></div>" +
        "<div class=\"fh-cd-traits-list\">" +
        (cards || "<div class=\"fh-cd-traits-empty\"><b>No traits tracked yet.</b>" +
          "<span>Add class features, species traits or feats — including passive ones.</span></div>") +
        "</div></div>";
    },
    onClick: function (event, ctx) {
      var button = event.target.closest("button");
      if (!button) return false;
      var store = getStore(ctx);
      var item;

      if (button.dataset.traitAdd !== undefined) {
        item = normalizeItem({id: makeId(), name: "New trait", maxUses: 1,
          remaining: 1, recharge: "long"});
        store.items.push(item);
        store.editingId = item.id;
        persist(ctx);
        return true;
      }
      if (button.dataset.traitReset !== undefined) {
        var resetKind = button.dataset.traitReset;
        var resetCount = resetItems(store, resetKind);
        var resetLabel = resetKind === "short" ? "Short Rest" :
          resetKind === "long" ? "Long Rest" : "Daily reset";
        persist(ctx, resetLabel + ": " + resetCount +
          (resetCount === 1 ? " trait recovered." : " traits recovered."));
        return true;
      }

      item = itemFromEvent(event, store);
      if (!item) return false;
      if (button.dataset.traitEdit !== undefined) {
        store.editingId = item.id;
      } else if (button.dataset.traitDone !== undefined) {
        store.editingId = "";
      } else if (button.dataset.traitDelete !== undefined) {
        store.items = store.items.filter(function (candidate) { return candidate.id !== item.id; });
        store.editingId = "";
      } else if (button.dataset.traitSpend !== undefined) {
        if (item.remaining > 0) item.remaining -= 1;
        persist(ctx, item.name + " used (" + item.remaining + "/" + item.maxUses + " left).");
        return true;
      } else if (button.dataset.traitRestore !== undefined) {
        if (item.remaining < item.maxUses) item.remaining += 1;
      } else {
        return false;
      }
      persist(ctx);
      return true;
    },
    onInput: function (event, ctx) {
      var field = event.target.closest("[data-trait-field]");
      if (!field) return false;
      var store = getStore(ctx);
      var item = itemFromEvent(event, store);
      if (!item) return false;
      if (field.dataset.traitField === "name" || field.dataset.traitField === "details") {
        item[field.dataset.traitField] = String(field.value || "");
      } else if (field.dataset.traitField === "maxUses") {
        var oldMax = item.maxUses;
        var nextMax = clamp(integer(field.value, oldMax), 0, 99);
        item.maxUses = nextMax;
        item.remaining = oldMax === item.remaining ? nextMax : clamp(item.remaining, 0, nextMax);
        if (!nextMax) item.recharge = "none";
      } else if (field.dataset.traitField === "recharge") {
        item.recharge = rechargeLabels[field.value] ? field.value : "none";
      } else {
        return false;
      }
      ctx.save();
      return true;
    },
    onChange: function (event, ctx) {
      var field = event.target.closest("[data-trait-field]");
      if (!field) return false;
      var store = getStore(ctx);
      var item = itemFromEvent(event, store);
      if (!item) return false;
      if (field.dataset.traitField === "maxUses") {
        var oldMax = item.maxUses;
        var nextMax = clamp(integer(field.value, oldMax), 0, 99);
        item.maxUses = nextMax;
        item.remaining = oldMax === item.remaining ? nextMax : clamp(item.remaining, 0, nextMax);
        if (!nextMax) item.recharge = "none";
      } else if (field.dataset.traitField === "recharge") {
        item.recharge = rechargeLabels[field.value] ? field.value : "none";
      } else {
        return false;
      }
      persist(ctx);
      return true;
    }
  });
})();
