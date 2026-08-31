/* Lunar Sorcerer — "The sky is the limit" roller.
   Rolls 1d10 for each moon and shows the number on its coloured disc,
   with the resulting state (absent / present / dominant). */
(function () {
  var MOONS = [
    { name: "Telva",   bg: "linear-gradient(135deg,#c9a227 0 50%,#8a8780 50% 100%)", note: "Aulmyria (gold) / Ur-Nozgul (grey)" },
    { name: "Trien",   bg: "#4a7c40", note: "Transmutation / Conjuration" },
    { name: "Forgon",  bg: "#9c2b1b", note: "Evocation" },
    { name: "Ono",     bg: "#2f5d8a", note: "Divination" },
    { name: "Cerkato", bg: "#2b2b2b", note: "Necromancy" }
  ];

  function stateOf(n) {
    if (n <= 2)  return ["absent",   "fh-moon--absent"];
    if (n === 10) return ["dominant", "fh-moon--dominant"];
    return ["present", ""];
  }

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("fh-sky");
    if (!host) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fh-sky__roll";
    btn.textContent = "🎲 Roll the sky";

    var grid = document.createElement("div");
    grid.className = "fh-sky__grid";

    var cells = MOONS.map(function (m) {
      var cell = document.createElement("div");
      cell.className = "fh-moon";
      cell.title = m.note;
      var disc = document.createElement("div");
      disc.className = "fh-moon__disc";
      disc.style.background = m.bg;
      disc.textContent = "–";
      var name = document.createElement("div");
      name.className = "fh-moon__name";
      name.textContent = m.name;
      var st = document.createElement("div");
      st.className = "fh-moon__state";
      cell.appendChild(disc);
      cell.appendChild(name);
      cell.appendChild(st);
      grid.appendChild(cell);
      return { cell: cell, disc: disc, st: st, bg: m.bg };
    });

    function roll() {
      cells.forEach(function (c) {
        var n = 1 + Math.floor(Math.random() * 10);
        var s = stateOf(n);
        c.disc.textContent = n;
        c.cell.className = "fh-moon " + s[1];
        c.st.textContent = s[0];
      });
    }

    btn.addEventListener("click", roll);
    host.appendChild(btn);
    host.appendChild(grid);
  });
})();
