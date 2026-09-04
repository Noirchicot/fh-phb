---
hide:
  - navigation
  - toc
---

<!-- ⛔ PAS d'attribut `markdown` sur ce bloc, et c'est la correction du 2026-09-04.
     Avec `markdown`, l'image écrite en syntaxe Markdown est enveloppée dans un `<p>`,
     et le `<p>` porte la mesure de lisibilité de la PROSE — `.md-typeset p { max-width: 65ch }`,
     soit 639 px à 17 px. Le bandeau sortait donc à 639 px dans 1188 disponibles, collé à
     gauche. Une image n'est pas de la prose : elle n'a rien à faire dans la mesure du texte.
     🔴 C'est exactement le défaut du LOT 113 (le bouton de reprise, 639 px pour 1188), même
     cause et même remède — l'attribut `markdown` retiré, l'élément redevient lui-même. -->
<div class="fh-cover">
  <img class="fh-banner" src="assets/img/cover-fates-hand.jpg"
       alt="Fate's Hand — a hand of fate over the Demon Forest">
  <h1 class="fh-cover-title">Fate's Hand — Player's Handbook</h1>
</div>

<!-- ⭐ « What makes Fate's Hand different? » EN HAUT, à la place du paragraphe
     d'intro — Eric, 2026-09-04 : « House rules for the fate's hand system…
     enlève tout ça » puis « met what makes FH different en haut à la place ».
     📌 Ça remet la page sur son propre croquis : `croquis/2026-08-31-home-page-portes.jpg`
     plaçait déjà ce bloc AU-DESSUS des six portes. La page avait dérivé, pas le plan.
     ⛔ La classe `fh-home-intro` reste dans la feuille : `docs/dm.md` s'en sert. -->
<section class="fh-difference" aria-labelledby="fh-difference-title">
  <p class="fh-difference-kicker">THE 5+ LAYER</p>
  <h2 id="fh-difference-title">What makes Fate's Hand different?</h2>
  <div class="fh-difference-grid">
    <div><b>More ways to be skilled</b><span>Expanded skills, tools, expertise and synergies.</span></div>
    <div><b>Destiny matters</b><span>Spend, recover and risk Destiny when the moment turns.</span></div>
    <div><b>Arcana shape characters</b><span>A Major Arcana gives every hero a distinct thread of fate.</span></div>
    <div><b>Monsters become gear</b><span>Identify, harvest, prepare and Soulforge what you defeat.</span></div>
  </div>
</section>

<div class="fh-home-actions fh-home-actions--six" markdown>

<a class="fh-home-action fh-home-action--gold" href="https://noirchicot.github.io/fhpc/ui/builder/" data-fh-widget>
  <span class="fh-home-action__icon">✦</span>
  <span><b>Create a character</b><small>Guided level 1 builder</small></span>
</a>

<a class="fh-home-action" href="rules/">
  <span class="fh-home-action__icon">📖</span>
  <span><b>Fate's Hand PHB</b><small>Every rule, by the question it answers</small></span>
</a>

<a class="fh-home-action" href="chapters/primordial-forces/">
  <span class="fh-home-action__icon">🜂</span>
  <span><b>The lore of the world</b><small>Primordial forces · cosmology</small></span>
</a>

<a class="fh-home-action fh-home-action--soon" aria-disabled="true">
  <span class="fh-home-action__icon">👤</span>
  <span><b>Your characters</b><small>Coming — the sheet returns here</small></span>
</a>

<a class="fh-home-action" href="https://noirchicot.github.io/fh-srd/" target="_blank" rel="noopener">
  <span class="fh-home-action__icon">⚖</span>
  <span><b>SRD rules</b><small>The base layer, EN &amp; FR</small></span>
</a>

<a class="fh-home-action fh-home-action--lock" href="dm/">
  <span class="fh-home-action__icon">🔒</span>
  <span><b>The DM's table</b><small>Companion · the vault behind the lock</small></span>
</a>

</div>

<!-- ⭐ DEUX BOUTONS DE SECONDE RANGÉE — Eric, 2026-09-04 : « fait un bouton pour
     ça, tu le met à droite de finish building your character ». La Bible quitte
     le paragraphe de bas de page et devient une porte, au même gabarit que les six.
     ⚠️ LE CHIFFRE ÉTAIT PÉRIMÉ : le paragraphe disait « 21 open contradictions »,
        `bible/a-trancher.md` en porte VINGT-DEUX (C1 → C22, comptées) et le dit
        lui-même en toutes lettres à sa troisième ligne. Un compte recopié à la main
        sur une page qui n'est pas sa source dérive sans que rien ne rougisse — celui-ci
        redérivera. ⛔ Ne pas le corriger à l'aveugle la prochaine fois : compter.
     ⛔ Le lien vers `a-trancher` n'est pas perdu en fondant dans le sous-titre :
        `bible/lois.md` y renvoie 18 fois. -->
<div class="fh-home-resume">
<a class="fh-home-action fh-home-action--resume" href="https://noirchicot.github.io/fhpc/ui/builder/" data-fh-widget data-fh-resume>
  <span class="fh-home-action__icon">↩</span>
  <span><b>Finish building your character</b><small>Pick up where you left off</small></span>
</a>

<a class="fh-home-action" href="bible/lois/">
  <span class="fh-home-action__icon">📖</span>
  <span><b>The Interface Bible</b><small>The rules the builder is held to · 22 open contradictions</small></span>
</a>
</div>

