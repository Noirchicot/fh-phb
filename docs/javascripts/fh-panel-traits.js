/* Fate's Hand — Companion belt panel: TRAITS.
   Abilities, traits and feats. The point of this panel is a real tracker for
   everything that recharges: per short rest, per long rest, per day, N uses.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and
   the event hooks, if the panel needs them) and nothing outside this file
   changes.

   The full contract is documented at the top of fh-panel-traits.js.
   ctx.store("traits") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "traits",
    label: "Traits",
    tint: "#4a7a3a",
    order: 20,
    showsRoller: false,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Abilities, traits and feats — with a tracker for everything that recharges on a rest.</p>" +
        "<small>Not built yet.</small></div>";
    }
  });
})();
