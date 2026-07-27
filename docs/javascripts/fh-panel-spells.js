/* Fate's Hand — Companion belt panel: SPELLS.
   The spell list: what is prepared, what slots remain, and casting straight from the panel.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and
   onClick, if the panel needs one) and nothing outside this file changes.

   The full contract is documented at the top of fh-panel-features.js.
   ctx.store("spells") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "spells",
    label: "Spells",
    tint: "#6b4a8c",
    order: 40,
    showsRoller: true,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Prepared spells, remaining slots, and casting without leaving the dock.</p>" +
        "<small>Not built yet.</small></div>";
    }
  });
})();
