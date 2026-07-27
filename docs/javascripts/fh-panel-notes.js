/* Fate's Hand — Companion belt panel: NOTES.
   Table notes. The simplest panel, and the natural first proof that a panel can own
   persisted state: write into ctx.store("notes"), call ctx.save(), and it survives a reload.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and
   onClick, if the panel needs one) and nothing outside this file changes.

   The full contract is documented at the top of fh-panel-features.js.
   ctx.store("notes") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "notes",
    label: "Notes",
    tint: "#3a5a8c",
    order: 60,
    showsRoller: false,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Somewhere to write things down at the table.</p>" +
        "<small>Not built yet.</small></div>";
    }
  });
})();
