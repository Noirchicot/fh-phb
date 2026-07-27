/* Fate's Hand — Companion belt panel: ACTIONS.
   What you can do on your turn: Action, Bonus Action, Reaction — each one a clickable roll.
   This panel carries the roller (showsRoller: true), so Destiny + Console + Tray sit under it
   exactly as they do under Skills.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and
   onClick, if the panel needs one) and nothing outside this file changes.

   The full contract is documented at the top of fh-panel-features.js.
   ctx.store("actions") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "actions",
    label: "Actions",
    tint: "#9f2f31",
    order: 30,
    showsRoller: true,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Action, Bonus Action and Reaction — every one of them a clickable roll.</p>" +
        "<small>Not built yet.</small></div>";
    }
  });
})();
