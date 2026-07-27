/* Fate's Hand — Companion belt panel: FEATURES.
   Abilities, traits and feats. The point of this panel is a real tracker for
   everything that recharges: per short rest, per long rest, per day, N uses.

   NOT BUILT YET — package 5 in COMPANION-BUILD-PLAN.md. This file exists so the
   belt already has its tab and the next chat has its file. Fill in render()
   (and onClick, if the panel needs one) and nothing outside this file changes.

   ── The contract ───────────────────────────────────────────────────────────
   id           must stay "features": it is the belt tab and the store key
   label/tint   what the belt shows, and its colour when lit
   order        belt position
   showsRoller  true -> core draws Destiny + Console + Tray under the panel
   render(ctx)  return the panel body's HTML (a string)
   onClick(event, ctx)  optional; return true when you handled the click

   ctx is the only surface a panel may touch:
     ctx.character      effective character (D&D Beyond + manual overrides)
     ctx.destiny        score, points, dice pool
     ctx.profile        the saved profile
     ctx.esc            HTML-escape — use it on everything you interpolate
     ctx.icon(name)     core's icon set
     ctx.signed(n)      "+3" / "-1"
     ctx.mod(score)     ability score -> modifier
     ctx.roll(name, ability, bonus, note)              immediate flat d20
     ctx.openConsole(name, ability, bonus, note, dc)   the advanced console
     ctx.note(text, kind)   write a line into the event stream
     ctx.store("features")  your own persisted object — yours alone, survives reload
     ctx.save()             persist after writing to the store
     ctx.refresh()          re-render the dock
*/
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "features",
    label: "Features",
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
