/* "My Character" landing card: campaign code → party dropdown → mini stat card.
   Data comes from the fh-builds Worker (same one the builder's "Send to GM" posts to). */
(function () {
  var API = "https://fh-builds.noirchicot.workers.dev";

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("fhMyChar");
    if (!root) return;
    /* the slot in index.md is an empty inline span (a raw block div would break
       the markdown card list) — the widget DOM is built here */
    root.innerHTML =
      "<span class=\"fh-mc-row\">" +
        "<input id=\"fhMcCode\" type=\"text\" placeholder=\"Campaign code\" autocomplete=\"off\">" +
        "<select id=\"fhMcWho\"><option value=\"\">— character —</option></select>" +
      "</span>" +
      "<span class=\"fh-mc-stats\" id=\"fhMcStats\">Enter your campaign code to load your character.</span>" +
      "<span class=\"fh-mc-btns\">" +
        "<a href=\"inventory/\">My Inventory</a>" +
        "<a href=\"soulforge/\">Go to the Soulforge</a>" +
        "<a class=\"fh-mc-off\" title=\"Coming soon — campaign lore unlocked by your GM\">Secrets</a>" +
      "</span>";
    var codeIn = document.getElementById("fhMcCode");
    var whoSel = document.getElementById("fhMcWho");
    var stats = document.getElementById("fhMcStats");

    var say = function (msg, cls) {
      stats.className = "fh-mc-stats" + (cls ? " " + cls : "");
      stats.innerHTML = msg;
    };

    var mod = function (v) {
      var m = Math.floor((v - 10) / 2);
      return (m >= 0 ? "+" : "") + m;
    };

    function renderBuild(rec) {
      var b = rec.build || {};
      var ch = b.character || {};
      var meta = b.meta || {};
      var dest = b.destiny || {};
      var ab = ch.abilityScores || {};
      var order = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
      var cells = order.map(function (k) {
        var v = ab[k];
        return "<span class=\"fh-mc-ab\"><b>" + k + "</b> " +
          (v == null ? "—" : v + " <i>" + mod(v) + "</i>") + "</span>";
      }).join("");
      var arc = dest.arcana ? dest.arcana.name : null;
      say(
        "<div class=\"fh-mc-name\">" + (ch.name || rec.pseudo) + "</div>" +
        "<div class=\"fh-mc-sub\">Level " + (meta.level || 1) +
          (meta.species ? " · " + meta.species : "") +
          (meta.class ? " · " + meta.class : "") + "</div>" +
        "<div class=\"fh-mc-abs\">" + cells + "</div>" +
        (dest.score != null
          ? "<div class=\"fh-mc-dest\">Destiny <b>" + dest.score + "</b>" +
            (arc ? " — " + arc : "") + "</div>"
          : "")
      );
    }

    function loadBuild() {
      var code = codeIn.value.trim(), who = whoSel.value;
      if (!code || !who) return;
      try {
        localStorage.setItem("fh-my-pseudo", who);
      } catch (e) {}
      say("Loading " + who + "…");
      fetch(API + "/party/" + encodeURIComponent(code) + "/" + encodeURIComponent(who))
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(renderBuild)
        .catch(function () { say("Could not load this character.", "err"); });
    }

    function loadParty() {
      var code = codeIn.value.trim();
      whoSel.innerHTML = "<option value=\"\">— character —</option>";
      if (!code) { say("Enter your campaign code to load your character."); return; }
      say("Looking up the party…");
      fetch(API + "/party/" + encodeURIComponent(code))
        .then(function (r) {
          if (r.status === 403) throw new Error("Unknown campaign code — ask your GM.");
          if (!r.ok) throw new Error("Could not reach the campaign server.");
          return r.json();
        })
        .then(function (data) {
          try {
            localStorage.setItem("fh-my-campcode", code);
          } catch (e) {}
          if (!data.builds.length) {
            say("No characters in this campaign yet — build one and hit <b>Send to GM</b>!");
            return;
          }
          var last = "";
          try { last = localStorage.getItem("fh-my-pseudo") || ""; } catch (e) {}
          data.builds.forEach(function (bld) {
            var o = document.createElement("option");
            o.value = bld.pseudo;
            o.textContent = bld.pseudo;
            if (bld.pseudo === last) o.selected = true;
            whoSel.appendChild(o);
          });
          if (whoSel.value) loadBuild();
          else say("Pick your character in the list.");
        })
        .catch(function (e) { say(e.message, "err"); });
    }

    codeIn.addEventListener("change", loadParty);
    codeIn.addEventListener("keydown", function (e) { if (e.key === "Enter") loadParty(); });
    whoSel.addEventListener("change", loadBuild);

    try {
      codeIn.value = localStorage.getItem("fh-my-campcode") || "";
    } catch (e) {}
    if (codeIn.value) loadParty();
  });
})();
