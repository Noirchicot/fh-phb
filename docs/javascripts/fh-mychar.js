/* Fate's Hand — My Character cockpit.
   The build saved by Send to GM remains the source of FH creation choices.
   A normalized public D&D Beyond snapshot can refresh level, abilities, custom
   FH skills and spells through the fh-builds Worker (never browser -> DDB). */
(function () {
  "use strict";

  var API = "https://fh-builds.noirchicot.workers.dev";
  var ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  var ABILITY_NAMES = { STR:"Strength", DEX:"Dexterity", CON:"Constitution", INT:"Intelligence", WIS:"Wisdom", CHA:"Charisma" };
  var CREATURES = ["Aberration", "Beast", "Celestial", "Construct", "Dragon", "Elemental", "Fey", "Fiend", "Giant", "Humanoid", "Monstrosity", "Ooze", "Plant", "Undead"];
  var KNOWLEDGE = {
    Aberration:["Arcana"], Beast:["Nature"], Celestial:["Religion"], Construct:["Investigation"],
    Dragon:["History"], Elemental:["Arcana"], Fey:["History"], Fiend:["Religion"],
    Giant:["Medicine"], Humanoid:["Medicine", "History"], Monstrosity:["Investigation"],
    Ooze:["Nature"], Plant:["Nature"], Undead:["Religion", "Medicine"]
  };
  var SKILL_ABILITY = {
    Arcana:"INT", History:"INT", Investigation:"INT", Nature:"INT", Religion:"INT",
    Medicine:"WIS", Hunting:"WIS", Leadership:"CHA", "Tool - Soulforging":"CHA"
  };
  var ESSENTIAL = ["Arcana", "History", "Hunting", "Investigation", "Leadership", "Medicine", "Nature", "Religion", "Tool - Soulforging"];
  var TIERS = { none:0, half:.5, proficient:1, expert:2 };
  var TIER_LABEL = { none:"Untrained", half:"Half", proficient:"Proficient", expert:"Expert" };
  var CLASS_NAMES = ["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
  var state = { code:"", pseudo:"", record:null, profile:null, open:"identify", target:"Aberration", cr:"1" };
  var root, setup, panel, status;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"}[c];
    });
  }
  function api(path, options) {
    return fetch(API + path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || ("HTTP " + response.status));
          error.status = response.status;
          throw error;
        }
        return data;
      });
    });
  }
  function post(path, body) {
    return api(path, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
  }
  function canonicalDdbUrl(value) {
    var text = String(value || "").trim();
    var idMatch = text.match(/^\d+$/);
    if (idMatch) return "https://www.dndbeyond.com/characters/" + idMatch[0];

    var parsed;
    try { parsed = new URL(text); }
    catch (error) { throw new Error("Paste a valid D&D Beyond character link."); }

    var host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    var pathMatch = parsed.pathname.match(/(?:^|\/)characters\/(\d+)(?:\/[a-z0-9_-]+)?(?:\/|$)/i);
    if (host !== "dndbeyond.com" || !pathMatch) {
      throw new Error("Use a public D&D Beyond character link.");
    }
    /* The production Worker follows D&D Beyond redirects from the stable
       numeric URL. Keep this tested contract instead of persisting share tokens. */
    return "https://www.dndbeyond.com/characters/" + pathMatch[1];
  }
  function mod(score) { return Math.floor(((Number(score) || 10) - 10) / 2); }
  function signed(value) { return (value >= 0 ? "+" : "") + value; }
  function pbFor(level) { return 2 + Math.floor((Math.max(1, level) - 1) / 4); }
  function tierName(value) {
    if (value === "prof" || value === "proficient" || value === 3) return "proficient";
    if (value === "exp" || value === "expert" || value === 4) return "expert";
    if (value === "half" || value === 2) return "half";
    return "none";
  }
  function crNumber(value) {
    var text = String(value || "0").trim();
    if (/^\d+\s*\/\s*\d+$/.test(text)) {
      var bits = text.split("/");
      return Number(bits[0]) / Math.max(1, Number(bits[1]));
    }
    var number = Number(text);
    return isFinite(number) ? Math.max(0, number) : 0;
  }
  function uuid() {
    return window.crypto && crypto.randomUUID ? crypto.randomUUID() : "manual-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function emptyProfile() {
    return { ddbLinked:false, snapshot:null, preparation:{transferEssence:false,identify:false,tools:[]}, levelUps:[] };
  }

  function effectiveCharacter() {
    var build = (state.record && state.record.build) || {};
    var character = build.character || {};
    var meta = build.meta || {};
    var profile = state.profile || emptyProfile();
    var snap = profile.snapshot || null;
    var pending = Array.isArray(profile.levelUps) ? profile.levelUps : [];
    var classes = snap && Array.isArray(snap.classes) && snap.classes.length
      ? snap.classes.map(function (entry) { return {name:entry.name, level:Number(entry.level)||1}; })
      : [{name:meta.class || "Class", level:Number(meta.level)||1}];
    pending.forEach(function (entry) {
      var found = classes.find(function (item) { return item.name === entry.className; });
      if (found) found.level += 1;
      else classes.push({name:entry.className, level:1});
    });
    var liveLevel = snap ? Number(snap.level)||1 : Number(meta.level)||1;
    var level = pending.reduce(function (max, entry) { return Math.max(max, Number(entry.targetLevel)||max); }, liveLevel);
    var abilities = {};
    ABILITIES.forEach(function (key) {
      abilities[key] = Number((snap && snap.abilityScores && snap.abilityScores[key]) || (character.abilityScores && character.abilityScores[key]) || 10);
    });
    pending.forEach(function (entry) {
      ABILITIES.forEach(function (key) { abilities[key] += Number(entry.abilityIncreases && entry.abilityIncreases[key]) || 0; });
    });

    var skills = {};
    Object.keys(build.nativeSkillTiers || {}).forEach(function (name) {
      skills[name] = {name:name, ability:SKILL_ABILITY[name], tier:tierName(build.nativeSkillTiers[name])};
    });
    (build.skills || []).forEach(function (skill) {
      skills[skill.name] = {name:skill.name, ability:ABILITIES[(Number(skill.statId)||1)-1], tier:tierName(skill.proficiencyLevel)};
    });
    if (snap) (snap.customSkills || []).forEach(function (skill) {
      skills[skill.name] = {name:skill.name, ability:skill.ability || SKILL_ABILITY[skill.name], tier:tierName(skill.tier)};
    });
    pending.forEach(function (entry) {
      (entry.essentialSkills || []).forEach(function (skill) {
        skills[skill.name] = {name:skill.name, ability:SKILL_ABILITY[skill.name], tier:tierName(skill.tier)};
      });
    });
    ESSENTIAL.forEach(function (name) {
      if (!skills[name]) skills[name] = {name:name, ability:SKILL_ABILITY[name], tier:"none"};
    });

    var spellMap = {};
    if (snap) (snap.spells || []).forEach(function (spell) { spellMap[spell.name.toLowerCase()] = {name:spell.name, level:spell.level}; });
    pending.forEach(function (entry) {
      (entry.spells || []).forEach(function (name) { spellMap[name.toLowerCase()] = {name:name, level:null}; });
    });
    var spells = Object.keys(spellMap).map(function (key) { return spellMap[key]; }).sort(function (a,b) {
      return (Number(a.level)||0) - (Number(b.level)||0) || a.name.localeCompare(b.name);
    });
    var preparation = profile.preparation || {transferEssence:false,identify:false,tools:[]};
    return {
      name:(snap && snap.name) || character.name || state.pseudo,
      species:(snap && snap.species) || meta.species || "Unknown species",
      avatarUrl:snap && snap.avatarUrl,
      classes:classes,
      level:level,
      liveLevel:liveLevel,
      pb:pbFor(level),
      abilities:abilities,
      skills:skills,
      spells:spells,
      preparation:preparation,
      syncedAt:snap && snap.syncedAt,
      pending:pending
    };
  }

  function skillInfo(name, character, extra) {
    var skill = character.skills[name] || {name:name, ability:SKILL_ABILITY[name], tier:"none"};
    var ability = skill.ability || SKILL_ABILITY[name] || "INT";
    var tier = tierName(skill.tier);
    var proficiency = TIERS[tier] === .5 ? Math.floor(character.pb / 2) : character.pb * TIERS[tier];
    return { name:name, ability:ability, tier:tier, bonus:mod(character.abilities[ability]) + proficiency + (extra || 0) };
  }

  function skillLine(name, character, extra, note, starred) {
    var skill = skillInfo(name, character, extra);
    var id = (name + (extra || 0)).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    return "<div class=\"fh-mc-skill" + (starred ? " is-active" : "") + "\">" +
      "<span class=\"fh-mc-star\" aria-hidden=\"true\">" + (starred ? "★" : "") + "</span>" +
      "<span class=\"fh-mc-skill-name\"><b>" + esc(name.replace("Tool - ", "")) + "</b><small>" + esc(skill.ability) + " · " + esc(TIER_LABEL[skill.tier]) + (note ? " · " + esc(note) : "") + "</small></span>" +
      "<strong class=\"fh-mc-bonus\">" + signed(skill.bonus) + "</strong>" +
      "<button class=\"fh-mc-die\" type=\"button\" data-roll=\"" + esc(id) + "\" data-bonus=\"" + skill.bonus + "\" aria-label=\"Roll " + esc(name) + "\">d20</button>" +
      "<span class=\"fh-mc-result\" id=\"fhMcRoll-" + esc(id) + "\" aria-live=\"polite\"></span>" +
    "</div>";
  }

  function section(id, icon, title, summary, body) {
    var open = state.open === id;
    return "<section class=\"fh-mc-accordion" + (open ? " is-open" : "") + "\">" +
      "<button class=\"fh-mc-accordion-head\" type=\"button\" data-open=\"" + id + "\" aria-expanded=\"" + open + "\">" +
        "<span class=\"fh-mc-step-icon\">" + icon + "</span><span><b>" + title + "</b><small>" + summary + "</small></span><span class=\"fh-mc-chevron\">⌄</span>" +
      "</button>" +
      "<div class=\"fh-mc-accordion-body\">" + body + "</div>" +
    "</section>";
  }

  function toolUrl(kind, fallback) {
    var raw = (root && root.dataset && root.dataset[kind]) || fallback;
    try {
      var url = new URL(raw, window.location.href);
      if (state.code) url.searchParams.set("campaign", state.code);
      return url.href;
    } catch (error) { return raw; }
  }

  function friendlyPullError(error) {
    if (error && error.status === 404) return "D&D Beyond could not open this sheet. Confirm that the character is public or shared, then try its D&D Beyond link again.";
    if (error && (error.status === 502 || error.status === 503 || error.status === 504)) return "D&D Beyond did not answer in time. Your link may be fine — wait a moment, then try Sync again.";
    if (error && error.status === 403) return "This character or campaign is not accessible. Check the campaign code and confirm that the D&D Beyond sheet is shared.";
    return (error && error.message) || "The D&D Beyond pull failed. Confirm that the sheet is shared, then try again.";
  }

  function renderPanel() {
    if (!state.record) {
      panel.innerHTML = "<div class=\"fh-mc-empty\">Enter your campaign code, then choose your character.</div>";
      return;
    }
    var ch = effectiveCharacter();
    var knowledge = KNOWLEDGE[state.target] || ["Arcana"];
    var specialist = knowledge.some(function (name) { return TIERS[skillInfo(name, ch).tier] >= 1; });
    var harvestExtra = specialist ? 2 : 0;
    var dc = 12 + crNumber(state.cr);
    var creatureOptions = CREATURES.map(function (name) { return "<option" + (name === state.target ? " selected" : "") + ">" + name + "</option>"; }).join("");
    var classes = ch.classes.map(function (entry) { return entry.name + " " + entry.level; }).join(" / ");
    var abilityCells = ABILITIES.map(function (key) {
      return "<span class=\"fh-mc-ability\"><small>" + key + "</small><b>" + ch.abilities[key] + "</b><i>" + signed(mod(ch.abilities[key])) + "</i></span>";
    }).join("");
    var fallbackPortrait = "assets/img/species-" + String(ch.species).toLowerCase().replace(/\s*\(fh\)\s*/g, "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "") + ".jpg";
    var portrait = ch.avatarUrl || fallbackPortrait;
    var sync = ch.syncedAt ? "Pulled " + new Date(ch.syncedAt).toLocaleString([], {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "Build snapshot";
    var identifyBody = knowledge.map(function (name) {
      return skillLine(name, ch, 0, state.target, true);
    }).join("") + "<p class=\"fh-mc-rule\">The selected creature lights the relevant Specialist Knowledge. For overlapping types, choose the approach that fits the scene.</p>";
    var harvestBody = skillLine("Hunting", ch, harvestExtra, specialist ? "specialist synergy +2" : "no specialist synergy", specialist) +
      "<div class=\"fh-mc-dc\"><span>Harvest DC</span><strong>" + dc + "</strong><small>12 + CR · +1 part per 5 above DC</small></div>";
    var spellNames = ch.spells.map(function (spell) { return spell.name.toLowerCase(); });
    var hasIdentify = ch.preparation.identify || spellNames.indexOf("identify") >= 0;
    var hasTransfer = ch.preparation.transferEssence || spellNames.indexOf("transfer essence") >= 0;
    var spellChips = ch.spells.length ? ch.spells.map(function (spell) {
      return "<span class=\"fh-mc-chip\">" + esc(spell.name) + (spell.level != null ? " · " + (spell.level ? "L" + spell.level : "Cantrip") : "") + "</span>";
    }).join("") : "<span class=\"fh-mc-muted\">No essential spells recorded.</span>";
    var prepareBody =
      "<div class=\"fh-mc-checks\">" +
        "<label><input type=\"checkbox\" data-prep=\"transferEssence\"" + (hasTransfer ? " checked" : "") + "> <span>Transfer Essence</span></label>" +
        "<label><input type=\"checkbox\" data-prep=\"identify\"" + (hasIdentify ? " checked" : "") + "> <span>Identify</span></label>" +
      "</div>" +
      "<label class=\"fh-mc-field\"><span>Crafting tools available</span><input id=\"fhMcTools\" value=\"" + esc((ch.preparation.tools || []).join(", ")) + "\" placeholder=\"Smith's, Jeweler's…\"></label>" +
      "<div class=\"fh-mc-spells\"><small>Possessed spells</small><div>" + spellChips + "</div></div>";
    var soulforgeBody = skillLine("Tool - Soulforging", ch, 0, "forge check", true) +
      "<p class=\"fh-mc-rule\">The Workbench will use this bonus by default. A different forger can still override it inside the Soulforge.</p>";

    var isLinked = !!(state.profile && state.profile.ddbLinked);
    panel.innerHTML =
      "<div class=\"fh-mc-identity\">" +
        "<img class=\"fh-mc-portrait\" src=\"" + esc(portrait) + "\" alt=\"\" onerror=\"this.style.display='none'\">" +
        "<span class=\"fh-mc-person\"><b>" + esc(ch.name) + "</b><small>" + esc(ch.species) + " · " + esc(classes) + "</small><i>" + esc(sync) + (ch.pending.length ? " · " + ch.pending.length + " pending level-up" + (ch.pending.length > 1 ? "s" : "") : "") + "</i></span>" +
        "<span class=\"fh-mc-badges\"><span><small>LEVEL</small><b>" + ch.level + "</b></span><span><small>PB</small><b>+" + ch.pb + "</b></span></span>" +
        "<span class=\"fh-mc-actions\"><button type=\"button\" id=\"fhMcPull\">⟳ <span>" + (isLinked ? "Sync DDB" : "Connect DDB") + "</span></button>" +
        (isLinked ? "<button type=\"button\" id=\"fhMcRelink\">↗ <span>Change link</span></button>" : "") +
        "<button type=\"button\" id=\"fhMcLevel\">＋ <span>Level Up</span></button></span>" +
      "</div>" +
      "<div class=\"fh-mc-abilities\">" + abilityCells + "</div>" +
      "<div class=\"fh-mc-target\"><label><span>Target creature</span><select id=\"fhMcTarget\">" + creatureOptions + "</select></label><label><span>CR</span><input id=\"fhMcCr\" value=\"" + esc(state.cr) + "\" inputmode=\"decimal\"></label></div>" +
      "<div class=\"fh-mc-accordions\">" +
        section("identify", "⌕", "Identify", knowledge.join(" / ") + " · " + state.target, identifyBody) +
        section("harvest", "♜", "Harvest", "Hunting · DC " + dc + (specialist ? " · +2" : ""), harvestBody) +
        section("prepare", "⚗", "Prepare", (hasTransfer || hasIdentify ? "rites ready" : "spells & tools"), prepareBody) +
        section("soulforge", "⚒", "Soulforge", signed(skillInfo("Tool - Soulforging", ch).bonus), soulforgeBody) +
      "</div>" +
      "<div class=\"fh-mc-footer\"><a href=\"" + esc(toolUrl("inventory", "party-inventory.html")) + "\">▣ My Inventory</a><a class=\"is-primary\" href=\"" + esc(toolUrl("soulforge", "soulforge-tool.html")) + "\">⚒ Open Soulforge</a></div>";
    wirePanel(ch);
  }

  function showModal(html) {
    var overlay = document.createElement("div");
    overlay.className = "fh-mc-modal-wrap";
    overlay.innerHTML = "<div class=\"fh-mc-modal\" role=\"dialog\" aria-modal=\"true\"><button class=\"fh-mc-modal-x\" type=\"button\" aria-label=\"Close\">×</button>" + html + "</div>";
    function close() { overlay.remove(); }
    overlay.addEventListener("click", function (event) { if (event.target === overlay || event.target.closest(".fh-mc-modal-x")) close(); });
    document.body.appendChild(overlay);
    return { element:overlay, close:close };
  }

  function openPull(forceLink) {
    if (!forceLink && state.profile && state.profile.ddbLinked) { pullDdb(null); return; }
    var modal = showModal(
      "<p class=\"fh-mc-modal-kicker\">D&D BEYOND</p><h3>Connect the public sheet</h3>" +
      "<p>Paste the character's <b>public or Shareable Link</b>. Fate's Hand sends the stable numeric character URL through its server-side pull service.</p>" +
      "<label><span>D&D Beyond character link</span><input id=\"fhMcDdbUrl\" type=\"text\" inputmode=\"url\" autocomplete=\"url\" placeholder=\"https://www.dndbeyond.com/characters/123456789\"></label>" +
      "<p class=\"fh-mc-modal-note\">Only the numeric character ID is retained for later syncs. The sheet must be accessible to D&D Beyond's public page.</p>" +
      "<p class=\"fh-mc-modal-error\" id=\"fhMcModalError\"></p><button class=\"fh-mc-modal-save\" id=\"fhMcDdbSave\" type=\"button\">Connect & Pull</button>"
    );
    var input = modal.element.querySelector("#fhMcDdbUrl");
    modal.element.querySelector("#fhMcDdbSave").addEventListener("click", function () {
      var value = input.value.trim();
      if (!value) return;
      pullDdb(value, modal);
    });
    input.focus();
  }

  function pullDdb(url, modal) {
    var canonicalUrl = null;
    if (url) {
      try { canonicalUrl = canonicalDdbUrl(url); }
      catch (error) {
        if (modal) modal.element.querySelector("#fhMcModalError").textContent = error.message;
        else setStatus(error.message, "err");
        return;
      }
    }
    var button = document.getElementById("fhMcPull");
    if (button) { button.disabled = true; button.textContent = "Syncing…"; }
    var body = canonicalUrl ? {shareUrl:canonicalUrl} : {};
    post("/profile/" + encodeURIComponent(state.code) + "/" + encodeURIComponent(state.pseudo) + "/pull", body)
      .then(function (data) {
        state.profile = data.profile;
        if (modal) modal.close();
        renderPanel();
        setStatus("Character refreshed from D&D Beyond.", "ok");
      })
      .catch(function (error) {
        var message = friendlyPullError(error);
        if (modal) modal.element.querySelector("#fhMcModalError").textContent = message;
        else setStatus(message, "err");
        renderPanel();
      });
  }

  function openLevelUp(ch) {
    var classes = CLASS_NAMES.slice();
    ch.classes.forEach(function (entry) { if (classes.indexOf(entry.name) < 0) classes.unshift(entry.name); });
    var classOptions = classes.map(function (name) { return "<option" + (ch.classes[0] && ch.classes[0].name === name ? " selected" : "") + ">" + esc(name) + "</option>"; }).join("");
    var statOptions = "<option value=\"\">No increase</option>" + ABILITIES.map(function (key) { return "<option value=\"" + key + "\">" + key + " — " + ABILITY_NAMES[key] + "</option>"; }).join("");
    var skillOptions = "<option value=\"\">No essential skill</option>" + ESSENTIAL.map(function (name) { return "<option>" + esc(name) + "</option>"; }).join("");
    var pending = ch.pending.length ? "<div class=\"fh-mc-pending\"><small>Pending until D&D Beyond reaches the same level</small>" + ch.pending.map(function (entry) { return "<span>Level " + entry.targetLevel + " · " + esc(entry.className) + "</span>"; }).join("") + "<button type=\"button\" id=\"fhMcClearPending\">Clear pending changes</button></div>" : "";
    var modal = showModal(
      "<p class=\"fh-mc-modal-kicker\">LEVEL " + (ch.level + 1) + "</p><h3>What gains a level?</h3>" +
      "<label><span>Class</span><select id=\"fhMcLevelClass\">" + classOptions + "</select></label>" +
      "<div class=\"fh-mc-modal-grid\"><label><span>Ability increase 1</span><select id=\"fhMcStat1\">" + statOptions + "</select></label><label><span>Ability increase 2</span><select id=\"fhMcStat2\">" + statOptions + "</select></label></div>" +
      "<div class=\"fh-mc-modal-grid\"><label><span>Essential skill</span><select id=\"fhMcSkill1\">" + skillOptions + "</select></label><label><span>New tier</span><select id=\"fhMcTier1\"><option value=\"half\">Half</option><option value=\"proficient\" selected>Proficient</option><option value=\"expert\">Expert</option></select></label></div>" +
      "<div class=\"fh-mc-modal-grid\"><label><span>Second essential skill</span><select id=\"fhMcSkill2\">" + skillOptions + "</select></label><label><span>New tier</span><select id=\"fhMcTier2\"><option value=\"half\">Half</option><option value=\"proficient\" selected>Proficient</option><option value=\"expert\">Expert</option></select></label></div>" +
      "<label><span>New essential spells</span><textarea id=\"fhMcNewSpells\" placeholder=\"One per line, or comma-separated\"></textarea></label>" + pending +
      "<p class=\"fh-mc-modal-error\" id=\"fhMcModalError\"></p><button class=\"fh-mc-modal-save\" id=\"fhMcLevelSave\" type=\"button\">Apply Level Up</button>"
    );
    var clear = modal.element.querySelector("#fhMcClearPending");
    if (clear) clear.addEventListener("click", function () {
      saveProfile({levelUps:[]}).then(function () { modal.close(); renderPanel(); });
    });
    modal.element.querySelector("#fhMcLevelSave").addEventListener("click", function () {
      var abilityIncreases = {};
      ["#fhMcStat1", "#fhMcStat2"].forEach(function (selector) {
        var value = modal.element.querySelector(selector).value;
        if (value) abilityIncreases[value] = (abilityIncreases[value] || 0) + 1;
      });
      var essentialSkills = [];
      [["#fhMcSkill1", "#fhMcTier1"], ["#fhMcSkill2", "#fhMcTier2"]].forEach(function (pair) {
        var name = modal.element.querySelector(pair[0]).value;
        if (name) essentialSkills.push({name:name, tier:modal.element.querySelector(pair[1]).value});
      });
      var spells = modal.element.querySelector("#fhMcNewSpells").value.split(/[\n,]+/).map(function (x) { return x.trim(); }).filter(Boolean);
      var entry = { id:uuid(), targetLevel:ch.level + 1, className:modal.element.querySelector("#fhMcLevelClass").value, abilityIncreases:abilityIncreases, essentialSkills:essentialSkills, spells:spells, createdAt:new Date().toISOString() };
      var next = (state.profile.levelUps || []).concat([entry]);
      saveProfile({levelUps:next}).then(function () { modal.close(); renderPanel(); setStatus("Level-up saved. PB updated automatically.", "ok"); }).catch(function (error) {
        modal.element.querySelector("#fhMcModalError").textContent = error.message;
      });
    });
  }

  function saveProfile(patch) {
    return post("/profile/" + encodeURIComponent(state.code) + "/" + encodeURIComponent(state.pseudo), patch).then(function (data) {
      state.profile = data.profile;
      return data.profile;
    });
  }

  function savePreparation() {
    var prep = state.profile.preparation || {};
    saveProfile({preparation:prep}).catch(function (error) { setStatus(error.message, "err"); });
  }

  function wirePanel(ch) {
    document.getElementById("fhMcPull").addEventListener("click", function () { openPull(false); });
    var relink = document.getElementById("fhMcRelink");
    if (relink) relink.addEventListener("click", function () { openPull(true); });
    document.getElementById("fhMcLevel").addEventListener("click", function () { openLevelUp(ch); });
    document.getElementById("fhMcTarget").addEventListener("change", function (event) { state.target = event.target.value; renderPanel(); });
    document.getElementById("fhMcCr").addEventListener("change", function (event) { state.cr = event.target.value || "0"; renderPanel(); });
    panel.querySelectorAll("[data-open]").forEach(function (button) {
      button.addEventListener("click", function () { state.open = button.dataset.open; renderPanel(); });
    });
    panel.querySelectorAll("[data-roll]").forEach(function (button) {
      button.addEventListener("click", function () {
        var natural = 1 + Math.floor(Math.random() * 20);
        var total = natural + Number(button.dataset.bonus || 0);
        var output = document.getElementById("fhMcRoll-" + button.dataset.roll);
        output.className = "fh-mc-result" + (natural === 20 ? " is-crit" : natural === 1 ? " is-fail" : "");
        output.textContent = natural + " → " + total;
      });
    });
    panel.querySelectorAll("[data-prep]").forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        state.profile.preparation = state.profile.preparation || {tools:[]};
        state.profile.preparation[checkbox.dataset.prep] = checkbox.checked;
        savePreparation();
      });
    });
    var tools = document.getElementById("fhMcTools");
    if (tools) tools.addEventListener("change", function () {
      state.profile.preparation = state.profile.preparation || {};
      state.profile.preparation.tools = tools.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      savePreparation();
    });
  }

  function setStatus(message, kind) {
    status.textContent = message || "";
    status.className = "fh-mc-status" + (kind ? " is-" + kind : "");
  }

  function loadBuild() {
    var who = setup.querySelector("#fhMcWho").value;
    if (!state.code || !who) return;
    state.pseudo = who;
    setStatus("Loading " + who + "…");
    try { localStorage.setItem("fh-my-pseudo", who); } catch (e) {}
    Promise.all([
      api("/party/" + encodeURIComponent(state.code) + "/" + encodeURIComponent(who)),
      api("/profile/" + encodeURIComponent(state.code) + "/" + encodeURIComponent(who)).catch(function () { return {profile:emptyProfile()}; })
    ]).then(function (results) {
      state.record = results[0];
      state.profile = results[1].profile || emptyProfile();
      setStatus("");
      renderPanel();
    }).catch(function (error) { state.record = null; setStatus(error.message || "Could not load this character.", "err"); renderPanel(); });
  }

  function loadParty() {
    var code = setup.querySelector("#fhMcCode").value.trim();
    var select = setup.querySelector("#fhMcWho");
    state.code = code;
    state.record = null;
    state.profile = null;
    select.innerHTML = "<option value=\"\">— character —</option>";
    renderPanel();
    if (!code) { setStatus("Enter your campaign code."); return; }
    setStatus("Looking up the party…");
    api("/party/" + encodeURIComponent(code)).then(function (data) {
      try { localStorage.setItem("fh-my-campcode", code); } catch (e) {}
      var last = "";
      try { last = localStorage.getItem("fh-my-pseudo") || ""; } catch (e) {}
      (data.builds || []).forEach(function (entry) {
        var option = document.createElement("option");
        option.value = entry.pseudo;
        option.textContent = entry.pseudo;
        option.selected = entry.pseudo === last;
        select.appendChild(option);
      });
      if (!data.builds || !data.builds.length) setStatus("No characters in this campaign yet.");
      else if (select.value) loadBuild();
      else setStatus("Choose your character.");
    }).catch(function (error) { setStatus(error.message || "Could not reach the campaign server.", "err"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    root = document.getElementById("fhMyChar");
    if (!root) return;
    if (root.classList.contains("fh-mychar--player")) document.body.classList.add("fh-player-body");
    root.innerHTML =
      "<span class=\"fh-mc-shell\"><span class=\"fh-mc-brand\"><i></i><b>CHARACTER · FATE'S HAND</b><i></i></span>" +
      "<span class=\"fh-mc-setup\" id=\"fhMcSetup\"><input id=\"fhMcCode\" placeholder=\"Campaign code\" autocomplete=\"off\"><select id=\"fhMcWho\"><option value=\"\">— character —</option></select></span>" +
      "<span class=\"fh-mc-status\" id=\"fhMcStatus\"></span><span class=\"fh-mc-panel\" id=\"fhMcPanel\"></span></span>";
    setup = document.getElementById("fhMcSetup");
    panel = document.getElementById("fhMcPanel");
    status = document.getElementById("fhMcStatus");
    setup.querySelector("#fhMcCode").addEventListener("change", loadParty);
    setup.querySelector("#fhMcCode").addEventListener("keydown", function (event) { if (event.key === "Enter") loadParty(); });
    setup.querySelector("#fhMcWho").addEventListener("change", loadBuild);
    try { setup.querySelector("#fhMcCode").value = localStorage.getItem("fh-my-campcode") || ""; } catch (e) {}
    renderPanel();
    if (setup.querySelector("#fhMcCode").value) loadParty();
  });
})();
