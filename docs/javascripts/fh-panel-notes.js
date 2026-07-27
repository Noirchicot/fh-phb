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

  function formatSavedAt(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  window.FH.panels.push({
    id: "notes",
    label: "Notes",
    tint: "#3a5a8c",
    order: 60,
    showsRoller: false,
    render: function (ctx) {
      var store = ctx.store("notes");
      var text = store.text || "";
      var status = store.savedAt ?
        "Saved " + ctx.esc(formatSavedAt(store.savedAt)) :
        "Not saved yet";
      return "<div class=\"fh-cd-zone fh-cd-notes\">" +
        "<textarea class=\"fh-cd-notes-input\" data-notes-input rows=\"10\" " +
        "placeholder=\"Write down whatever the table needs to remember…\">" +
        ctx.esc(text) + "</textarea>" +
        "<div class=\"fh-cd-notes-bar\">" +
        "<button class=\"fh-cd-notes-save\" type=\"button\" data-notes-save>Save</button>" +
        "<small class=\"fh-cd-notes-status\">" + status + "</small>" +
        "</div></div>";
    },
    onClick: function (event, ctx) {
      var button = event.target.closest("button");
      if (!button || button.dataset.notesSave === undefined) return false;
      var body = event.target.closest("[data-panel-body=\"notes\"]");
      var input = body && body.querySelector("[data-notes-input]");
      var store = ctx.store("notes");
      store.text = input ? input.value : "";
      store.savedAt = new Date().toISOString();
      ctx.save();
      ctx.note("Notes saved.", "note");
      ctx.refresh();
      return true;
    }
  });
})();
