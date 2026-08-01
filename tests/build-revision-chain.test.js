"use strict";

// Dedicated suite for the POST /builds revision-chain fix. The Worker treats a
// missing `revision` as 0 (fh-worker src/worker.js: `clampInt(body.revision,
// 0, 1_000_000_000, 0)`), so a second send of a character already at revision
// 1+ was silently rejected with 409 -- the old skill-builder.html never sent a
// revision at all. This loads the REAL docs/skill-builder.html (full DOM +
// inline script, via linkedom) so the test drives the actual "Send to GM"
// button rather than a reimplementation of its logic.
// Install linkedom first, same as player-sheet.integration.test.js:
//   npm install --prefix /tmp/fh-player-test linkedom@0.18.12
const assert = require("node:assert/strict");
const webcrypto = require("node:crypto").webcrypto;
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("/tmp/fh-player-test/node_modules/linkedom");

const htmlPath = path.join(__dirname, "..", "docs", "skill-builder.html");
const html = fs.readFileSync(htmlPath, "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error("skill-builder.html: inline <script> block not found");
const inlineScript = scriptMatch[1];

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

// A fresh env == a fresh page load: new document, new script execution, new
// in-memory state. Passing the same `storage` Map across envs simulates what
// actually survives a real reload -- localStorage, nothing else.
function createEnv(storage) {
  const {window, document} = parseHTML(html);
  let fetchLog = [];
  let queue = [];
  function mockFetch(url, options) {
    fetchLog.push({url, body: options && options.body ? JSON.parse(options.body) : null});
    const next = queue.shift() || {status: 200, body: {}};
    return Promise.resolve({
      ok: next.status < 300,
      status: next.status,
      json: async () => next.body
    });
  }
  const sandbox = {
    window, document, console,
    crypto: {
      randomUUID: () => webcrypto.randomUUID(),
      getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; }
    },
    localStorage: {
      getItem: k => storage.has(k) ? storage.get(k) : null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: k => storage.delete(k)
    },
    fetch: (...args) => mockFetch(...args),
    navigator: {clipboard: {writeText: () => Promise.resolve()}},
    URL: {createObjectURL: () => "blob:x", revokeObjectURL: () => {}},
    Blob: function () {},
    setTimeout, clearTimeout,
    alert: () => {},
    confirm: () => true,
    requestAnimationFrame: fn => setTimeout(fn, 0)
  };
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(inlineScript, sandbox, {filename: "skill-builder-inline.js"});

  async function send(pseudo, campCode, response) {
    document.getElementById("sendPseudo").value = pseudo;
    document.getElementById("sendCampCode").value = campCode;
    queue = [response];
    fetchLog = [];
    document.getElementById("sendGM").dispatchEvent(new window.Event("click"));
    await flush(); await flush(); await flush();
    return {
      calls: fetchLog.length,
      body: fetchLog[0] ? fetchLog[0].body : null,
      note: document.getElementById("sendNote").textContent,
      noteClass: document.getElementById("sendNote").className
    };
  }
  return {document, send};
}

function storedRevisions(storage) {
  try { return JSON.parse(storage.get("fh-send-revisions") || "{}"); } catch (e) { return {}; }
}

(async () => {
  // 1. First-ever send for a campaign+pseudo pair carries revision 0 -- no
  // prior knowledge exists yet.
  {
    const storage = new Map();
    const env = createEnv(storage);
    const result = await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 1}});
    assert.equal(result.calls, 1, "one POST /builds for the first send");
    assert.equal(result.body.revision, 0, "the very first send for a pair states revision 0, the Worker's own default for an unknown record");
    assert.match(result.note, /Sent/, "success note shown");
    assert.equal(storedRevisions(storage)["FH1::Awki"], 1, "the revision the Worker returned is remembered against this exact pair");
  }

  // 2. A second send for the SAME pair states the revision the first send
  // actually received -- not 0, which is exactly the bug being fixed (the old
  // code never sent a revision field at all, so the Worker always saw 0).
  {
    const storage = new Map();
    const env = createEnv(storage);
    await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 1}});
    const second = await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:05:00.000Z", revision: 2}});
    assert.equal(second.body.revision, 1, "the second send states the revision the first send returned");
    assert.equal(storedRevisions(storage)["FH1::Awki"], 2, "the second send's own returned revision is now remembered");
  }

  // 3. Persistence after reload: a brand-new script execution (new `env`, as
  // if the page were reloaded) against the SAME storage must still pick up
  // the revision from the earlier session -- nothing may live only in memory.
  {
    const storage = new Map();
    const first = createEnv(storage);
    await first.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 1}});
    const reloaded = createEnv(storage); // fresh page load, same localStorage
    const afterReload = await reloaded.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:05:00.000Z", revision: 2}});
    assert.equal(afterReload.body.revision, 1, "after a reload, the known revision still comes from localStorage, not a JS variable that reset with the page");
  }

  // 4. Isolation: a revision known for one campaign+pseudo pair must never
  // leak into a send for a different character or a different campaign.
  {
    const storage = new Map();
    const env = createEnv(storage);
    await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 5}});

    const otherPseudo = await env.send("Nodren", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 1}});
    assert.equal(otherPseudo.body.revision, 0, "a different pseudo in the same campaign starts at revision 0, never Awki's 5");

    const otherCampaign = await env.send("Awki", "FH2", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 1}});
    assert.equal(otherCampaign.body.revision, 0, "the same pseudo in a different campaign starts at revision 0, never FH1's 5");

    assert.equal(storedRevisions(storage)["FH1::Awki"], 5, "Awki@FH1's own revision is untouched by the other two sends");
  }

  // 5. A real 409 is never retried and never overwrites the locally-known
  // revision, and the player sees a clear "changed elsewhere" message.
  {
    const storage = new Map();
    const env = createEnv(storage);
    await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 3}});
    const conflict = await env.send("Awki", "FH1", {status: 409, body: {error: "conflict", currentRevision: 9, current: {}}});
    assert.equal(conflict.calls, 1, "no automatic retry of a rejected write");
    assert.match(conflict.note, /changed elsewhere/i, "the 409 message plainly states the character was changed elsewhere");
    assert.equal(conflict.noteClass, "note err", "a 409 is shown as an error, not silently accepted");
    assert.equal(storedRevisions(storage)["FH1::Awki"], 3, "a 409 never overwrites the last known-good revision");
  }

  // 6. A malformed or revision-less 200 response must not throw -- it must
  // degrade to a visible note, and must never corrupt the stored revision
  // with a missing or non-numeric value.
  {
    const storage = new Map();
    const env = createEnv(storage);
    await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:00:00.000Z", revision: 3}});

    const noRevision = await env.send("Awki", "FH1", {status: 200, body: {ok: true}}); // no revision, no updatedAt
    assert.equal(noRevision.calls, 1, "the malformed response is still a single call, no crash-triggered retry");
    assert.equal(storedRevisions(storage)["FH1::Awki"], 3, "a response without a usable revision leaves the last known-good revision untouched");
    assert.ok(noRevision.note, "a note is shown -- the missing updatedAt is caught, not left as an uncaught exception");

    const nonNumeric = await env.send("Awki", "FH1", {status: 200, body: {ok: true, updatedAt: "2026-08-01T00:10:00.000Z", revision: "not-a-number"}});
    assert.equal(nonNumeric.calls, 1, "a non-numeric revision does not crash the send");
    assert.equal(storedRevisions(storage)["FH1::Awki"], 3, "a non-numeric revision is rejected, not stored");
  }

  console.log("Build revision chain tests passed.");
  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
