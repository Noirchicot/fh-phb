"use strict";

/* The roll vocabulary (UI-ROLL-VOCABULARY.md), held from three angles:

   1. the source table is the ONLY declaration of a source, and no source is
      distinguishable by colour alone;
   2. badges are DERIVED from a condition table, not pushed at render sites;
   3. the Ruling is a verdict plus the account of what it cost, derived from
      the entry like the badges.

   Plus the two things this lot is forbidden to break: the die-class renames
   must be complete, and the pending Destiny die must still blink forever. */

const assert = require("node:assert/strict");
const crypto = require("node:crypto").webcrypto;
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "docs", "javascripts", "fh-player-sheet.js");
const source = fs.readFileSync(sourcePath, "utf8");
const cssPath = path.join(__dirname, "..", "docs", "stylesheets", "companion-dock.css");
const css = fs.readFileSync(cssPath, "utf8");

const instrumented = source.replace(/\}\)\(\);\s*$/, `
  globalThis.__fhRollVocabulary = {
    ROLL_SOURCES, SEALABLE_SOURCES, SOURCE_GLYPHS, ROLL_BADGE_RULES, ROLL_VERDICTS,
    rollSource, sourceGlyphSvg, bonusSourceMark, sourceToneClass, bonusSourceFor,
    rollBadges, rollRuling, rollVocabulary, rollVerdict, outcomeFor,
    rollVerdictText, rollDetailText, sealLabel, visualDie
  };
})();
`);
assert.notEqual(instrumented, source, "the test hook was injected into the module tail");

const storage = new Map();
const sandbox = {
  URL, clearTimeout, console, crypto, setTimeout,
  fetch: () => Promise.reject(new Error("Network disabled in unit test")),
  localStorage: {getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => storage.set(key, String(value))},
  window: {crypto, setTimeout, clearTimeout, location:{href:"https://example.invalid/player/"}, history:{replaceState(){}}}
};
sandbox.document = {addEventListener() {}};
sandbox.globalThis = sandbox;
vm.runInNewContext(instrumented, sandbox, {filename: sourcePath});
const t = sandbox.__fhRollVocabulary;
/* The module runs in its own vm realm, so its arrays are not this realm's
   Array — strict deep equality would compare prototypes and fail on values
   that are identical. Cross the boundary explicitly. */
const plain = value => JSON.parse(JSON.stringify(value));

/* ── §1 Source tokens ───────────────────────────────────────────────── */

const EXPECTED_SOURCES = {
  destiny : {label:"Destiny",   tone:"destiny" , mark:"glyph"},
  guidance: {label:"Guidance",  tone:"guidance", mark:"glyph"},
  bardic  : {label:"Bardic",    tone:"bardic"  , mark:"glyph"},
  tactical: {label:"Tactical",  tone:"tactical", mark:"glyph"},
  "other-1":{label:"Bonus I",   tone:"bonus"   , mark:"I"},
  "other-2":{label:"Bonus II",  tone:"bonus"   , mark:"II"},
  "other-3":{label:"Bonus III", tone:"bonus"   , mark:"III"}
};
assert.deepEqual(Object.keys(t.ROLL_SOURCES), Object.keys(EXPECTED_SOURCES),
  "the five sources of UI-ROLL-VOCABULARY.md §1 are declared, once, in one table");

Object.entries(EXPECTED_SOURCES).forEach(([key, want]) => {
  const token = t.ROLL_SOURCES[key];
  assert.equal(token.label, want.label, key + " carries its ratified name");
  assert.equal(token.tone, want.tone, key + " carries its tone");
  /* The rule that outlives every other one here: THE GLYPH CARRIES THE
     IDENTITY. A token with a tone and no mark would be a source told apart by
     colour alone, which at 12px is not tellable apart at all. */
  assert.ok(token.glyph || token.letter, key + " carries a mark, never a colour alone");
  if (want.mark === "glyph") assert.ok(t.SOURCE_GLYPHS[token.glyph], key + " has a drawn glyph");
  else assert.equal(token.letter, want.mark, key + " uses its Roman numeral");
});

// Five distinct silhouettes: a source that borrowed another's glyph would be
// indistinguishable the moment the room got dark.
const glyphNames = Object.values(plain(t.ROLL_SOURCES)).filter(s => s.glyph).map(s => s.glyph);
assert.equal(new Set(glyphNames).size, glyphNames.length, "no two sources share a glyph");
const letters = Object.values(plain(t.ROLL_SOURCES)).filter(s => s.letter).map(s => s.letter);
assert.deepEqual(plain(letters), ["I", "II", "III"], "the bonus dice use I · II · III and nothing else");

/* Drawn FOR 12px. iconSvg's 1.65 stroke on a 24 grid is 0.8 device px in the
   tray — a hairline — so a source glyph is either filled or stroked heavy. */
Object.entries(plain(t.SOURCE_GLYPHS)).forEach(([name, body]) => {
  const stroked = /stroke-width="([\d.]+)"/.exec(body);
  if (stroked) assert.ok(Number(stroked[1]) >= 3, name + " is stroked heavy (>=3 on a 24 grid), not at icon weight");
  else assert.ok(!/stroke=/.test(body), name + " is a filled silhouette, so it survives being reduced to a smudge");
});
// The lemniscate is one continuous path, not the three unmeeting arcs of the
// first mockup: exactly one M, and it closes.
const destinyPath = /d="([^"]+)"/.exec(t.SOURCE_GLYPHS.destiny)[1];
assert.equal((destinyPath.match(/M/g) || []).length, 1, "Destiny's ∞ is ONE continuous subpath");
assert.match(destinyPath, /Z$/, "Destiny's ∞ closes on itself");
// ∞ is the only HORIZONTAL mark in the set, which is what makes it unmistakable
// beside a star and a note. Its two arcs sweep opposite ways: that is the
// crossing, and losing it would make it a circle.
assert.match(destinyPath, /a5\.6 5\.6 0 1 0[^a]*a5\.6 5\.6 0 1 1/, "the two loops sweep opposite ways, so the lemniscate crosses");

// Reading the table is the only way to get a mark, and an unknown source still
// gets one rather than rendering an empty slot.
assert.match(t.bonusSourceMark("guidance"), /<svg/, "Guidance renders its star");
assert.equal(t.bonusSourceMark("other-2"), "<b>II</b>", "a bonus die renders the numeral .fh-cd-src b was built for");
assert.match(t.bonusSourceMark("tactical"), /<svg/, "Tactical is now declared and drawable — it was not, before this lot");
assert.match(t.bonusSourceMark("nonsense"), /<svg/, "an unknown source still shows a mark rather than nothing");
assert.equal(t.rollSource("nonsense").tone, "bonus", "an unknown source falls back to the grey bonus tone");
assert.equal(t.sourceToneClass("bardic"), "is-src-bardic", "the tone travels as a class, beside the glyph");

// Every tone has exactly one colour, declared in one place.
["destiny","guidance","bardic","tactical","bonus"].forEach(tone => {
  assert.match(css, new RegExp("--cd-src-" + tone + ":#[0-9a-f]{6}"), tone + " has a declared source colour");
  assert.match(css, new RegExp("\\.fh-cd-src\\.is-src-" + tone + "[^{]*\\{color:var\\(--cd-src-" + tone + "\\)\\}"),
    tone + " is painted from that one variable");
});
// The numeral slot used to pin --cd-gold-bright, which is why every source icon
// in the dock was gold whatever it was.
assert.match(css, /\.fh-cd-src b\{[^}]*color:inherit/, ".fh-cd-src b inherits the token's tone instead of hard-coding gold");
assert.doesNotMatch(css, /\.fh-cd-src b\{[^}]*--cd-gold-bright/, "the numeral slot no longer forces gold");

// The seal card is the table read out loud, not a second hand-kept list.
assert.deepEqual(plain(t.SEALABLE_SOURCES), ["guidance","bardic","tactical","other-1","other-2","other-3"],
  "every source but Destiny can seal a bonus die — Destiny comes from the pool, it is not a sticker");
t.SEALABLE_SOURCES.forEach(key => assert.ok(t.ROLL_SOURCES[key], key + " is a declared source"));
assert.equal(t.sealLabel("tactical"), "Tactical", "a sealed die takes its name from the table");
assert.equal(t.sealLabel("other-3"), "Bonus III", "a bonus die takes its name from the table");

// REWRITTEN (Eric, ratified 2026-08-03, wired 2026-08-04): the seal IS the
// die — provenance rides the tint (data-material), the 12px slot is empty
// and merely names the source on hover. The glyph table above still serves
// the seal card and the console pickers.
const destinyDie = t.visualDie({sides:8, result:6, dieRole:"destiny", label:"Destiny"}, 0, 1, false);
assert.match(destinyDie, /data-material="gold"/, "a Destiny die is gold — the tint is the token");
assert.doesNotMatch(destinyDie, /fh-cd-src is-src-/, "no separate token rides the die any more");
assert.match(destinyDie, /fh-cd-src" title="Destiny"/, "the empty slot still names the source on hover");
const bardicDie = t.visualDie({sides:6, result:3, dieRole:"bonus", sourceIcon:"bardic", label:"Bardic"}, 0, 1, false);
assert.match(bardicDie, /data-material="violet"/, "Bardic rolls violet — its ratified tint, not gold, not green");
assert.doesNotMatch(bardicDie, /is-src-bardic/, "and wears no token either");

/* ── §3 Badges are derived, not emitted ─────────────────────────────── */

// Thirteen badges, five visual families. The count is the point: it is what
// used to be thirteen separate badges.push() calls inside the render path.
assert.equal(t.ROLL_BADGE_RULES.length, 13, "thirteen declared rules, one per badge");
assert.deepEqual([...new Set(Array.from(t.ROLL_BADGE_RULES, rule => rule.k))].sort(),
  ["adjusted","chaos","destiny","manual","n20"], "the five visual families of §3");
assert.equal(new Set(Array.from(t.ROLL_BADGE_RULES, rule => rule.id)).size, 13, "rule ids are unique");
t.ROLL_BADGE_RULES.forEach(rule => {
  assert.equal(typeof rule.when, "function", rule.id + " declares its condition");
  assert.equal(typeof rule.text, "function", rule.id + " declares its text");
});

/* The render path must no longer be able to invent a badge. This is the actual
   defect being fixed: with pushes scattered through rendering, nothing made
   the Tray and the Stream agree about the same roll — and since the Dice Tray
   became the shared surface, a disagreement is something the whole table sees. */
assert.equal((source.match(/badges\.push\(\{/g) || []).length, 1,
  "exactly one push survives — the one inside rollBadges that walks the rule table; thirteen scattered through the render path is the defect");
assert.match(source, /ROLL_BADGE_RULES\.forEach\(function\(rule\)\{[\s\S]*?badges\.push\(/,
  "and that push is the table walk, not a render site");

// One entry, everything at once: the full thirteen fire together and in the
// declared order.
const loudEntry = {
  kind:"d20", name:"Arcana", ability:"INT", baseBonus:3, natural:20, natChoice:"chaos",
  d20s:[20], kept:20, total:31, dc:15, exhaustion:2, adjusted:true, awakening:true,
  chaosRoll:[4,5], chaosRow:"The Weave shudders", d20Forced:true, bonusDice:[],
  destinyPointChange:{reason:"Awakening", after:0},
  destiny:{sides:8, result:8, criticalSuccess:true, pointsBefore:6, pointsAfter:5,
    arcaneChoice:"chaos", chaos:{overreach:3, dc:14}}
};
const loud = t.rollVocabulary(loudEntry);
assert.deepEqual(plain(loud.badges).map(b => b.id), [
  "natural-20","fate-refused","chaos-roll","chaos-row","exhaustion","destiny-spend",
  "arcane-fate-refused","overreach","destiny-points","awakening","manual","adjusted"
], "every rule that applies fires, in the declared reading order");
assert.equal(loud.badges.find(b => b.id === "natural-20").t, "NATURAL 20");
assert.equal(loud.badges.find(b => b.id === "chaos-roll").t, "Chaos 2d6 = 9");
assert.equal(loud.badges.find(b => b.id === "exhaustion").t, "Exhaustion 2 · −2");
assert.equal(loud.badges.find(b => b.id === "destiny-spend").t, "Arcane Critical Success · -1 pt → 5");
assert.equal(loud.badges.find(b => b.id === "overreach").t, "Overreach 3 · save DC 14");

/* The spoiler flag rides ON the badge, so a surface hiding an unrevealed
   result never needs its own copy of which families are spoilers. */
const spoilerById = Object.fromEntries(plain(loud.badges).map(b => [b.id, b.spoiler]));
assert.equal(spoilerById["natural-20"], true, "a natural 20 is a spoiler while the dice are still in the air");
assert.equal(spoilerById["destiny-spend"], true, "what Destiny gave is a spoiler");
assert.equal(spoilerById["manual"], false, "MANUAL describes construction, not outcome — never a spoiler");
assert.equal(spoilerById["adjusted"], false, "adjusted describes construction, not outcome");

// A quiet roll produces no badges at all rather than defaulting to something.
assert.deepEqual(plain(t.rollBadges({kind:"d20", name:"Stealth", baseBonus:2, natural:11, kept:11, total:13, dc:"", bonusDice:[]})), [],
  "an ordinary roll carries no badges");
assert.deepEqual(plain(t.rollBadges(null)), [], "no entry, no badges — never a crash at a render site");

// Derivation is a pure reading of the entry: two surfaces asking the same
// question get the same answer, which is the whole point of the lot.
assert.deepEqual(plain(t.rollBadges(loudEntry)), plain(t.rollBadges(loudEntry)), "the same entry always derives the same badges");

/* ── §5 The Ruling ──────────────────────────────────────────────────── */

// One verdict table feeds two readings, so the machine-facing `outcome` the
// feed and the tones already match on cannot drift from what the Ruling says.
assert.equal(t.ROLL_VERDICTS.length, 8, "eight verdicts, in ruling order");
t.ROLL_VERDICTS.forEach(rule => {
  assert.ok(rule.outcome, rule.id + " declares the machine-facing outcome");
  assert.ok(rule.verdict, rule.id + " declares what the Ruling says out loud");
});
// These exact strings are what outcomeTone and feedTone match on. Changing one
// silently repaints every result in the Stream and the shared tray.
assert.equal(t.outcomeFor(loudEntry), "Critical success", "the outcome string is unchanged by this lot");
assert.equal(t.outcomeFor({natural:20, dc:"", bonusDice:[]}), "Natural 20");
assert.equal(t.outcomeFor({natural:1, natChoice:"accept", dc:"", bonusDice:[]}), "Critical failure · Fate accepted");
assert.equal(t.outcomeFor({natural:11, total:13, dc:15, bonusDice:[]}), "Failure");
assert.equal(t.outcomeFor({natural:11, total:18, dc:15, bonusDice:[]}), "Success");
assert.equal(t.outcomeFor({natural:11, total:18, dc:"", bonusDice:[]}), "", "nothing decided, nothing claimed");

// The example from the spec: a verdict, then the account of what it cost.
const spent = {
  kind:"destiny", name:"Destiny d8", total:8, dc:"",
  destiny:{sides:8, result:8, criticalSuccess:true, pointsBefore:6, pointsAfter:5}
};
const ruling = t.rollRuling(spent);
assert.equal(ruling.verdict, "ARCANE CRITICAL SUCCESS", "the verdict is the engine's decision, said out loud");
assert.ok(plain(ruling.account).includes("Lost 1 Destiny Point"), "the account states what it cost, in points");
assert.ok(plain(ruling.account).includes("Current 5"), "and where it leaves you");
assert.ok(plain(ruling.account).includes("Destiny d8 8"), "and what was rolled");
// Never flavour: every line of the account is a fact with a number in it.
plain(ruling.account).forEach(line => assert.match(line, /\d/, "an account line is a record, never prose: " + line));

// A verdict moves the roll's identity into the account, so nothing is lost and
// nothing is said twice.
assert.equal(t.rollVerdictText(spent), "ARCANE CRITICAL SUCCESS", "the heading is the verdict when there is one");
assert.equal(ruling.account[0], "Destiny d8 8", "and the identity leads the account");
const undecided = {kind:"d20", name:"Stealth", baseBonus:2, natural:11, kept:11, total:13, dc:"", bonusDice:[]};
const quietRuling = t.rollRuling(undecided);
assert.equal(quietRuling.verdict, "", "an undecided roll gets no verdict rather than a guessed one");
assert.equal(t.rollVerdictText(undecided), "Stealth 13", "the heading falls back to the roll's identity");
assert.ok(!t.rollDetailText(undecided).startsWith("Stealth 13"), "which is then not repeated in the account");

// A DC the player was rolling against belongs in the account either way.
assert.ok(t.rollRuling({kind:"d20", name:"Arcana", baseBonus:3, natural:11, kept:11, total:14, dc:15, bonusDice:[]})
  .account.indexOf("DC 15") >= 0, "the account states what was being beaten");

// Derived, never written at render time.
assert.deepEqual(plain(t.rollRuling(spent)), plain(t.rollRuling(spent)), "the same entry always derives the same Ruling");
assert.deepEqual(plain(t.rollRuling(null)), {verdict:"", title:"Roll", account:[], display:[]}, "no entry, no ruling — and no crash");

/* Lot texte T1 (Eric, 2026-08-04): the on-screen `display` account drops the
   per-die enumeration — the dice speak for themselves — and keeps the
   title-fallback, the Destiny cost and the DC. `account` stays the full
   record, for the Stream and the hover title. */
const shown = t.rollRuling({kind:"d20", name:"Arcana", baseBonus:3, natural:11, kept:11, total:14, dc:15, bonusDice:[]});
assert.ok(shown.display.indexOf("DC 15") >= 0, "display keeps the DC");
assert.ok(!shown.display.some(line => /^d20/.test(line)), "and drops the dice enumeration");
assert.ok(shown.account.some(line => /^d20/.test(line)), "which the full account still records");

/* The Ruling's classes are granted by equality with the derived verdict, so a
   Chaos prompt written into the same slot cannot borrow the oxblood authority
   of an engine ruling. */
/* REWRITTEN (dock-dice-tray, 2026-08-03): the frame's status line became the
   tray line's tier 3 (trayTiersHtml) — the equality rule moved with it,
   wearing the tray's own class names. The claim is unchanged: the oxblood
   verdict classes are granted by equality with the derived verdict, never by
   a flag someone could forget to clear. */
assert.match(source, /var isRuling=!quiet&&!!state\.trayVerdict&&heading===state\.trayVerdict;/,
  "the verdict styling is earned by equality, not by a flag someone could forget to clear");
assert.match(css, /\.fh-cd-tray-verdict\{/, "the verdict has its own class");
assert.match(css, /\.fh-cd-tray-account\{/, "the account has its own class");

/* ── The renames, and the trap not to wake ──────────────────────────── */

// Die classes are named by function now. REWRITTEN together with the class
// assertions in static-dice.test.js and player-sheet.integration.test.js.
[["fh-cd-ddie","fh-cd-picker-die"], ["fh-cd-wdie","fh-cd-calling-die"], ["fh-cd-static3d","fh-cd-static-die"]]
  .forEach(([before, after]) => {
    assert.ok(!source.includes(before) && !css.includes(before), before + " is gone from the core and the stylesheet");
    assert.ok(source.includes(after) || css.includes(after), after + " is what replaced it");
  });

/* fh-cd-dieglow is NOT a die type — it is the name of a keyframes animation
   (the gold glow on a selected picker die). It appeared in an early inventory
   as if it were a fourth kind of die; renaming it as one would have broken the
   animation while looking like tidying. */
assert.match(css, /@keyframes fh-cd-dieglow\{/, "fh-cd-dieglow is still an animation name, not a die type");
assert.match(css, /animation:fh-cd-dieglow /, "and the selected picker die still references it");

/* The pending Destiny die blinks and NEVER STOPS, unlike every other animation
   in the dock. That is deliberate: what it announces is a cost that has not
   been paid yet. Do not "fix" it. */
assert.match(css, /\.fh-cd-diewrap\.is-flashing \.fh-cd-die\{animation:fh-cd-flash [^}]*infinite\}/,
  "the waiting Destiny die still blinks forever — it is announcing an unpaid cost");

console.log("roll-vocabulary: ok");
