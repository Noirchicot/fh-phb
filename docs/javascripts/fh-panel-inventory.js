/* Fate's Hand — Companion belt panel: INVENTORY.
   Carried gear and the party inventory.
   NOTE: an inventory pop and a full party-inventory tool ALREADY EXIST in core
   (data-open-pop="inventory", loadInventory(), and docs/party-inventory.html).
   This panel should surface that existing data on the belt, not rebuild it.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and
   onClick, if the panel needs one) and nothing outside this file changes.

   The full contract is documented at the top of fh-panel-features.js.
   ctx.store("inventory") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "inventory",
    label: "Inventory",
    tint: "#2f6b6b",
    order: 50,
    showsRoller: false,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Carried gear and the party stash — surfacing the inventory that already exists behind the satchel button.</p>" +
        "<small>Not built yet.</small></div>";
    }
  });
})();
