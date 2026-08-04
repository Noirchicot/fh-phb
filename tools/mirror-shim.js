/* FH mirror shim — injecté par mirror-server.mjs dans chaque page HTML servie.
   Rôle : rendre le site 100 % isolé de la prod. Toute requête que le code du
   site adresse au Worker de prod (https://fh-builds.noirchicot.workers.dev)
   est réécrite vers /api/... sur ce même serveur miroir, qui la traite avec
   le vrai code du Worker mais un stockage local (tools/mirror-data/kv.json).
   Rien ne part jamais vers Cloudflare. Ce fichier ne doit JAMAIS être
   référencé par une page committée : il n'existe qu'à la volée, côté miroir. */
(function () {
  "use strict";
  var PROD = "https://fh-builds.noirchicot.workers.dev";
  var origFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    try {
      var url = typeof input === "string" ? input
        : (input instanceof URL) ? String(input)
        : (input && input.url) || "";
      if (url.indexOf(PROD) === 0) {
        var rewritten = "/api" + url.slice(PROD.length);
        if (typeof input === "string" || input instanceof URL) {
          return origFetch(rewritten, init);
        }
        // Request object : on reconstruit sur l'URL réécrite en gardant tout.
        return origFetch(new Request(rewritten, input), init);
      }
      // Ceinture et bretelles : tout autre workers.dev est refusé net plutôt
      // que laissé filer vers un cloud — le miroir ne parle qu'à lui-même.
      if (/https?:\/\/[^/]*workers\.dev/.test(url)) {
        return Promise.reject(new Error("fh-mirror: requête cloud bloquée — " + url));
      }
    } catch (e) { /* en cas de doute, comportement normal */ }
    return origFetch(input, init);
  };

  // Campagne de test par défaut : le dock s'ouvre directement sur FHTEST.
  // Uniquement si rien n'est déjà choisi sur CETTE origine (le localStorage
  // du miroir est de toute façon distinct de celui du site de prod).
  try {
    if (!localStorage.getItem("fh-my-campcode")) {
      localStorage.setItem("fh-my-campcode", "FHTEST");
    }
  } catch (e) {}

  // Ruban visible : impossible de confondre le miroir avec la prod.
  function banner() {
    if (document.getElementById("fh-mirror-banner")) return;
    var el = document.createElement("div");
    el.id = "fh-mirror-banner";
    el.textContent = "MIROIR DE TEST · FHTEST";
    el.style.cssText = "position:fixed;top:0;left:50%;transform:translateX(-50%);" +
      "z-index:2147483647;background:#7a1f1f;color:#ffe9c9;font:600 11px/1 " +
      "-apple-system,Helvetica,Arial,sans-serif;padding:4px 10px;" +
      "border-radius:0 0 6px 6px;letter-spacing:.08em;pointer-events:none;opacity:.92";
    document.body.appendChild(el);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", banner);
  } else { banner(); }
})();
