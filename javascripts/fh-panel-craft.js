/* Fate's Hand — Companion belt panel: CRAFT.
   Soulforging: the Loop (the prep checklist — transfer essence, identify, tools)
   and the Forge itself. These were two separate header buttons before the belt;
   the Loop is the Forge's checklist, not a peer of it, so they live in one tab.

   NOT BUILT YET — see COMPANION-BUILD-PLAN.md. This file exists so the belt
   already has its tab and the next chat has its file. Fill in render() (and the
   event hooks, if the panel needs them) and nothing outside this file changes.

   Until then this panel opens the existing slide-over pops, so nothing that
   worked before the header was cleaned up is out of reach. Both pops are core's
   (`data-open-pop`), and core handles those clicks itself — this panel declares
   no onClick, so the click falls straight through to it.

   NOTE: the Soulforge already reads from the party inventory, and a full
   standalone workshop exists at docs/soulforge-tool.html (still linked from the
   ⋯ menu). Surface that work here; do not rebuild it.

   The full contract is documented at the top of fh-panel-traits.js.
   ctx.store("craft") is this panel's own persisted object.
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "craft",
    label: "Craft",
    tint: "#6b4a8c",
    order: 60,
    showsRoller: false,
    render: function () {
      return "<div class=\"fh-cd-zone fh-cd-soon\">" +
        "<p>Soulforging — the Loop, and the Forge.</p>" +
        "<div class=\"fh-cd-soonacts\">" +
        "<button type=\"button\" data-open-pop=\"loop\">Soulforging Loop</button>" +
        "<button type=\"button\" data-open-pop=\"forge\">Soulforge</button>" +
        "</div><small>Panel not built yet — these open the existing tools.</small></div>";
    }
  });
})();
