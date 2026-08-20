/* Fate's Hand TOC extras:
   1. "⌂ Home" link at the top of the table of contents (every page).
   2. Destiny-group cross TOC: on the three Destiny System pages, the TOC
      lists all three chapter H1s with their key H2s; the current page's
      native TOC is nested under its own H1. */
(function () {
  /* Each entry is one nav group: its pages' H1s + their key H2s, so the TOC
     of any page lets you jump to every H1/H2 in the group. */
  var GROUPS = [
    [ /* Build a Character */
      { slug: "identity", title: "Identity", items: [] },
      { slug: "species", title: "Species", items: [] },
      { slug: "inheritance", title: "Inheritance", items: [] },
      { slug: "fates-hand-mechanic", title: "Destiny System", items: [
        ["1. Destiny Score, Points & Dice", "1-destiny-score-points-dice"],
        ["2. Recovery & Erosion", "2-recovery-erosion"],
        ["3. Using Destiny Dice", "3-using-destiny-dice"],
        ["4. The Chaos Effect", "4-the-chaos-effect"],
        ["5. Arcane Awakening", "5-arcane-awakening"]
      ]},
      { slug: "classes", title: "Class Modifications", items: [
        ["Rogue", "rogue"],
        ["Fighter, Ranger & Paladin", "fighter-ranger-paladin"],
        ["Monk", "monk"],
        ["Assassin (Rogue)", "assassin-rogue"]
      ]},
      { slug: "moonkeeper", title: "Moonkeeper", items: [
        ["Level 3 — Lunar Embodiment", "level-3-lunar-embodiment"],
        ["Level 6", "level-6"],
        ["Level 14", "level-14"],
        ["Level 18", "level-18"]
      ]},
      { slug: "ability-scores", title: "Rolling Ability Scores", items: [
        ["The 3d6 × 10 method", "the-3d6-10-method"],
        ["Why roll?", "why-roll"],
        ["3d6 probability", "3d6-probability"]
      ]},
      { slug: "skills-and-tools", title: "Skills & Tools", items: [
        ["1. The quick version", "1-the-quick-version"],
        ["2. Building at character creation", "2-building-at-character-creation"],
        ["3. Levelling up & evolution", "3-levelling-up-evolution"],
        ["4. The 26 Skills", "4-the-26-skills"],
        ["5. The Tools", "5-the-tools"],
        ["6. Key reminders", "6-key-reminders"],
        ["7. Detailed notes on complex skills", "7-detailed-notes-on-complex-skills"]
      ]},
      { slug: "equipment", title: "Equipment", items: [] }
    ],
    [ /* At the Table */
      { slug: "leveling-up", title: "Leveling up", items: [] },
      { slug: "feats", title: "Feats", items: [
        ["Skill feats", "skill-feats"],
        ["Combat feats", "combat-feats"],
        ["Command feats", "command-feats"],
        ["Soulforge feats", "soulforge-feats"]
      ]},
      { slug: "trainings", title: "Trainings", items: [] },
      { slug: "skills-synergies", title: "Synergies", items: [
        ["Overview", "overview"],
        ["How Much You Get", "how-much-you-get"],
        ["Examples", "examples"],
        ["Tips for Players", "tips-for-players"]
      ]},
      { slug: "battlefield", title: "Battlefield", items: [
        ["Combat ranges", "combat-ranges"],
        ["Surprise", "surprise"],
        ["Strategy", "strategy"],
        ["Fatigue", "fatigue"],
        ["Falling in combat or Dying", "falling-in-combat-or-dying"],
        ["Grappling-range maneuvers", "grappling-range-maneuvers"]
      ]},
      { slug: "dungeoneering", title: "Dungeoneering", items: [] }
    ],
    [ /* Magic & Soulforging */
      { slug: "magic", title: "Magic", items: [] },
      { slug: "spells", title: "New Spells", items: [
        ["Bless", "bless"],
        ["Guidance", "guidance"],
        ["Appease the Chaos", "appease-the-chaos"],
        ["Devil-Vision", "devil-vision"],
        ["Consecration", "consecration"],
        ["Transfer Essence", "transfer-essence"],
        ["Identify", "identify"],
        ["Gentle Repose", "gentle-repose"]
      ]},
      { slug: "dark-rituals", title: "Dark Rituals", items: [
        ["How a ritual resolves", "1-how-a-ritual-resolves-the-template"],
        ["The Rituals", "2-the-rituals"]
      ]},
      { slug: "crafting", title: "Crafting", items: [] },
      { slug: "soulforge-crafting", title: "Soulforging", items: [
        ["Power Budget & Item Equilibrium", "power-budget-item-equilibrium"],
        ["The four phases", "the-four-phases"],
        ["Soulforge mishaps & boons", "soulforge-mishaps-boons"],
        ["Growing an item", "growing-an-item-evolve-never-replace"],
        ["Attunement & reanimation", "attunement-reanimation"],
        ["Body Forging", "body-forging-fuse-a-gem-into-your-flesh"],
        ["Appendix — components", "appendix-components-by-creature-type"]
      ]},
      { slug: "magic-items", title: "Magic Items", items: [
        ["Harvest Chalice", "harvest-chalice"]
      ]}
    ],
    [ /* World */
      { slug: "primordial-forces", title: "Primordial Forces", items: [
        ["Part 1 — The White Void", "part-1-the-white-void"],
        ["Part 2 — The Crimson Shroud", "part-2-the-crimson-shroud"]
      ]}
    ],
    [ /* The Dungeon Masters' Secrets */
      { slug: "chaos-tables", title: "Chaos Tables", items: [
        ["The Chaos Tables", "the-chaos-tables"]
      ]}
    ]
  ];
  /* landing-card title for each group (shown under the TOC) */
  GROUPS[0].name = "Build a Character";
  GROUPS[1].name = "At the Table";
  GROUPS[2].name = "Magic & Soulforging";
  GROUPS[3].name = "World";
  GROUPS[4].name = "The Dungeon Masters' Secrets";

  document.addEventListener("DOMContentLoaded", function () {
    /* landing page (has the contents cartouche) → hide the header bar */
    if (document.querySelector(".fh-toc")) {
      document.body.classList.add("fh-home-page");
    }

    /* floating ⌂ button back to the menu — mobile, where the TOC is hidden */
    var logoBtn = document.querySelector(".md-header__button.md-logo");
    if (!document.querySelector(".fh-toc")) {
      var fab = document.createElement("a");
      fab.className = "fh-home--fab";
      fab.href = logoBtn ? logoBtn.href : "/";
      fab.setAttribute("aria-label", "Home");
      fab.innerHTML = "&#8962;";
      document.body.appendChild(fab);
    }

    var toc = document.querySelector(".md-sidebar--secondary .md-nav--secondary");
    if (!toc) return;

    /* 1 — ⌂ Home pill. A page-level breadcrumb already provides the same
       action on the few utility pages that define one explicitly. */
    var logo = document.querySelector(".md-header__button.md-logo");
    if (!document.querySelector("main .fh-home")) {
      var homeLink = document.createElement("a");
      homeLink.className = "fh-home fh-home--toc";
      homeLink.href = logo ? logo.href : "/";
      homeLink.innerHTML = "&#8962; Home";
      toc.insertBefore(homeLink, toc.firstChild);
    }

    /* 2 — group cross TOC (lists every sibling H1 + its H2s) */
    var path = window.location.pathname;
    var GROUP = null, current = null;
    GROUPS.forEach(function (g) {
      g.forEach(function (p) {
        if (path.indexOf("/" + p.slug + "/") !== -1) { GROUP = g; current = p; }
      });
    });
    if (!current) return;

    var nativeList = toc.querySelector("ul.md-nav__list");
    var group = document.createElement("ul");
    group.className = "md-nav__list fh-group";

    GROUP.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "md-nav__item";
      var a = document.createElement("a");
      a.className = "md-nav__link fh-group__h1" +
                    (p === current ? " fh-group__h1--current" : "");
      a.href = (p === current) ? "#" : "../" + p.slug + "/";
      a.textContent = p.title;
      li.appendChild(a);

      if (p === current && nativeList) {
        nativeList.classList.add("fh-group__subs");
        li.appendChild(nativeList);           /* full native TOC nests here */
      } else {
        var ul = document.createElement("ul");
        ul.className = "md-nav__list fh-group__subs";
        p.items.forEach(function (it) {
          var sli = document.createElement("li");
          sli.className = "md-nav__item";
          var sa = document.createElement("a");
          sa.className = "md-nav__link";
          sa.href = "../" + p.slug + "/#" + it[1];
          sa.textContent = it[0];
          sli.appendChild(sa);
          ul.appendChild(sli);
        });
        li.appendChild(ul);
      }
      group.appendChild(li);
    });
    toc.appendChild(group);

    /* chapter's landing-card title, at the top of the TOC (under ⌂ Home) */
    if (GROUP.name) {
      var cap = document.createElement("a");
      cap.className = "fh-group__card";
      cap.href = (logo ? logo.href : "/");
      cap.textContent = GROUP.name;
      toc.insertBefore(cap, group);
    }
  });

  /* Fast rules lookup during play: / and Ctrl/Cmd+K open and focus Material's
     native indexed search. Ignore / while the player is typing in a field. */
  document.addEventListener("keydown", function (event) {
    var tag = event.target && event.target.tagName;
    var isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (event.target && event.target.isContentEditable);
    var slash = event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey;
    var commandK = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);
    if (!slash && !commandK) return;

    var toggle = document.getElementById("__search");
    var query = document.querySelector('[data-md-component="search-query"]');
    if (!toggle || !query) return;

    event.preventDefault();
    toggle.checked = true;
    window.setTimeout(function () { query.focus(); }, 0);
  });
})();
