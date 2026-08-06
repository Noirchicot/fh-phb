#!/usr/bin/env node
/* FH mirror server — banc de test complet, zéro cloud.
   - Sert le site construit (site/) en statique sur le port 8130 (0.0.0.0,
     donc joignable depuis l'iPad sur le LAN).
   - Injecte tools/mirror-shim.js dans chaque page HTML servie : toute
     requête du site vers le Worker de prod est réécrite vers /api/... ici.
   - /api/* est traité par LE VRAI code du Worker (~/tools/fh-worker/src/
     worker.js, surchargeable via FH_WORKER_SRC), exécuté en Node avec un
     KV émulé persisté dans tools/mirror-data/kv.json. Fidélité maximale à
     la prod, isolation totale : rien ne sort de cette machine.
   - Campagne de test : FHTEST (via CAMPAIGN_CODES). GM token : FHTEST-GM.
   - Au premier démarrage (ou après reset), un personnage "Test" est semé
     via le vrai POST /builds, pour que le dock ait quelque chose à montrer.
   Zéro dépendance npm. Node >= 18 (Request/Response/fetch natifs). */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url)); // tools/
const ROOT = path.dirname(HERE);                           // racine du worktree
const SITE = path.join(ROOT, "site");
const DATA_DIR = path.join(HERE, "mirror-data");
const KV_FILE = path.join(DATA_DIR, "kv.json");
const SHIM_FILE = path.join(HERE, "mirror-shim.js");

const PORT = Number(process.env.FH_MIRROR_PORT || 8130);
const WORKER_SRC = process.env.FH_WORKER_SRC ||
  path.join(os.homedir(), "tools", "fh-worker", "src", "worker.js");

const CAMPAIGN = "FHTEST";
const GM_TOKEN = "FHTEST-GM";

// ---------- KV émulé, persisté en JSON ----------
class MemKV {
  constructor(file) {
    this.file = file;
    this.map = new Map();
    this.timer = null;
    if (fs.existsSync(file)) {
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      Object.entries(raw).forEach(([k, v]) => this.map.set(k, v));
    }
  }
  async get(name) { return this.map.has(name) ? this.map.get(name) : null; }
  async put(name, value) { this.map.set(name, String(value)); this.persist(); }
  async delete(name) { this.map.delete(name); this.persist(); }
  // Comme Cloudflare : ordre lexicographique, et notre liste est toujours
  // complète (pas de pagination à émuler côté données locales).
  async list({ prefix = "" } = {}) {
    const keys = [...this.map.keys()].filter((k) => k.startsWith(prefix)).sort()
      .map((name) => ({ name }));
    return { keys, list_complete: true, cursor: undefined };
  }
  persist() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 250);
  }
  flush() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(Object.fromEntries(this.map), null, 1));
  }
}

if (!fs.existsSync(WORKER_SRC)) {
  console.error(`✗ Worker introuvable : ${WORKER_SRC}\n  (surcharger avec FH_WORKER_SRC=/chemin/vers/worker.js)`);
  process.exit(1);
}
if (!fs.existsSync(path.join(SITE, "index.html"))) {
  console.error(`✗ site/ absent ou vide — lancer d'abord le build (tools/mirror.sh s'en charge).`);
  process.exit(1);
}

const worker = (await import(pathToFileURL(WORKER_SRC).href)).default;
const kv = new MemKV(KV_FILE);
const env = { BUILDS: kv, GM_TOKEN, CAMPAIGN_CODES: CAMPAIGN, ADMIN_ORIGINS: "" };

// ---------- appel du vrai Worker ----------
async function callWorker(method, apiPath, headers = {}, body = null) {
  const request = new Request(`https://fh-mirror.local${apiPath}`, {
    method,
    headers,
    ...(body != null ? { body } : {}),
  });
  return worker.fetch(request, env);
}

// ---------- graine : un personnage jouable dès le premier démarrage ----------
async function seed() {
  if (await kv.get(`build:${CAMPAIGN}:Test`)) return;
  const build = {
    meta: { class: "Wizard", level: 5, species: "Human" },
    character: {
      name: "Test",
      abilityScores: { STR: 10, DEX: 14, CON: 13, INT: 18, WIS: 12, CHA: 9 },
    },
    nativeSkillTiers: {
      Arcana: "expert", History: "proficient", Vigilance: "proficient",
      Insight: "proficient", "Tool - Soulforging": "proficient",
    },
    destiny: { score: 8, arcana: { name: "The Hermit" } },
  };
  const res = await callWorker("POST", "/builds",
    { "Content-Type": "application/json" },
    JSON.stringify({ pseudo: "Test", campaign: CAMPAIGN, revision: 0, build }));
  const out = await res.json();
  if (!res.ok) console.error("✗ graine refusée :", res.status, out);
  else console.log(`✓ personnage de test semé : ${CAMPAIGN} / Test (rev ${out.revision})`);
}
await seed();
kv.flush();

// ---------- statique ----------
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff": "font/woff",
  ".woff2": "font/woff2", ".ttf": "font/ttf", ".map": "application/json",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
  ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav",
};

function injectShim(html) {
  // Après la balise <head ...> : le shim doit courir avant tout script de page.
  const tag = "<script src=\"/mirror-shim.js\"></script>";
  const m = /<head[^>]*>/i.exec(html);
  if (m) return html.slice(0, m.index + m[0].length) + tag + html.slice(m.index + m[0].length);
  return tag + html; // page sans <head> (improbable) : shim en tête
}

function serveStatic(pathname, res) {
  let rel = decodeURIComponent(pathname);
  if (rel.includes("..")) { res.writeHead(400); res.end("bad path"); return; }
  if (rel === "/mirror-shim.js") {
    res.writeHead(200, { "Content-Type": MIME[".js"], "Cache-Control": "no-store" });
    res.end(fs.readFileSync(SHIM_FILE));
    return;
  }
  let file = path.join(SITE, rel);
  if (rel.endsWith("/")) file = path.join(file, "index.html");
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    // mkdocs use_directory_urls : /player -> /player/index.html
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file)) {
    const fallback = path.join(SITE, "404.html");
    res.writeHead(404, { "Content-Type": MIME[".html"] });
    res.end(fs.existsSync(fallback) ? injectShim(fs.readFileSync(fallback, "utf8")) : "404");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const headers = { "Content-Type": type, "Cache-Control": "no-store" };
  if (ext === ".html") {
    res.writeHead(200, headers);
    res.end(injectShim(fs.readFileSync(file, "utf8")));
  } else {
    res.writeHead(200, headers);
    res.end(fs.readFileSync(file));
  }
}

// ---------- serveur ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : null;
    const headers = {};
    ["content-type", "authorization", "origin"].forEach((h) => {
      if (req.headers[h]) headers[h] = req.headers[h];
    });
    try {
      const apiPath = url.pathname.slice(4) || "/";
      const out = await callWorker(req.method, apiPath + url.search, headers, body);
      const outHeaders = {};
      out.headers.forEach((v, k) => { outHeaders[k] = v; });
      res.writeHead(out.status, outHeaders);
      res.end(Buffer.from(await out.arrayBuffer()));
    } catch (err) {
      console.error("✗ /api :", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "mirror worker error", detail: String(err) }));
    }
    return;
  }
  serveStatic(url.pathname, res);
});

server.listen(PORT, "0.0.0.0", () => {
  const ips = Object.values(os.networkInterfaces()).flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
  console.log(`FH mirror — site miroir + Worker local (campagne ${CAMPAIGN}, GM token ${GM_TOKEN})`);
  console.log(`  Mac    : http://localhost:${PORT}/`);
  ips.forEach((ip) => console.log(`  iPad   : http://${ip}:${PORT}/  (même Wi-Fi)`));
  console.log(`  Données: ${KV_FILE}`);
  console.log(`  Worker : ${WORKER_SRC}`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => { kv.flush(); server.close(); process.exit(0); });
}
