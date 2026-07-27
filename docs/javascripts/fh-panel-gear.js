/* Fate's Hand — Companion belt panel: GEAR.
   Carried gear and the party stash.
   NOTE: an inventory pop and a full party-inventory tool ALREADY EXIST
   (data-open-pop="inventory", loadInventory(), docs/party-inventory.html).
   Surface that data on the belt rather than rebuilding it.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and
   the event hooks, if the panel needs them) and nothing outside this file
   changes.

   The full contract is documented at the top of fh-panel-traits.js.
   ctx.store("gear") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "gear",
    label: "Gear",
    tint: "#8a5a2a",
    order: 50,
    showsRoller: false,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Carried gear and the party stash.</p>" +
        "<div class=\"fh-cd-soonacts\">" +
        "<button type=\"button\" data-open-pop=\"inventory\">Open inventory</button>" +
        "</div>" +
        "<small>Panel not built yet — this opens the existing tool.</small></div>";
    }
  });
})();
