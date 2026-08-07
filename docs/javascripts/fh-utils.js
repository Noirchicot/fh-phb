/* Fate's Hand — utilitaires purs.
   Extrait de fh-player-sheet.js le 2026-08-07. Aucune de ces fonctions ne
   touche `state`, ne lit le DOM, ni n'appelle le reste du dock : entrée →
   sortie, rien d'autre. Chargé AVANT le dock (voir mkdocs.yml). */
(function () {
  "use strict";
  var FH = (window.FH = window.FH || {});

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function numberOr(value,fallback){return value!==null&&value!==""&&isFinite(Number(value))?Number(value):fallback;}
  function mod(score) { return Math.floor(((Number(score) || 10) - 10) / 2); }
  function signed(value) { value = Number(value) || 0; return (value >= 0 ? "+" : "") + value; }
  function pbFor(level) { return 2 + Math.floor((Math.max(1, Number(level) || 1) - 1) / 4); }
  function uuid() { return window.crypto && crypto.randomUUID ? crypto.randomUUID() : "fh-" + Date.now() + "-" + Math.random().toString(16).slice(2); }
  function nowLabel(iso) { return new Date(iso).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
  function rollDie(sides) {
    sides = Math.max(2, Number(sides) || 20);
    if (window.crypto && crypto.getRandomValues) {
      var max = Math.floor(0x100000000 / sides) * sides;
      var bucket = new Uint32Array(1);
      do { crypto.getRandomValues(bucket); } while (bucket[0] >= max);
      return (bucket[0] % sides) + 1;
    }
    return 1 + Math.floor(Math.random() * sides);
  }
  FH.utils = {
    esc: esc, clamp: clamp, numberOr: numberOr, mod: mod, signed: signed,
    pbFor: pbFor, uuid: uuid, nowLabel: nowLabel, rollDie: rollDie
  };
})();
