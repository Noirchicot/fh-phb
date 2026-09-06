# Ability Scores

In Fate's Hand, rolling is the house method: you roll your ability scores, kept fair by a floor rule, with the thrill of a possible 17 or 18 at level 1. The builder also offers the base game's own ways — 4d6 drop lowest, and the standard array — plus a free assignment of its own; they are described below.

## The 3d6 × 10 method

!!! tip "Try it live"
    Real crypto-RNG rolls, the two floors applied for you — no reroll — and a spot to assign your
    six kept scores before you open the D&D Beyond builder.

    [Open the Ability Score Roller ↗](../stat-roller.html){ .md-button target=_blank }

1. Roll 3d6, ten times.
2. Keep your six highest results.
3. Two floors then apply, and there is no reroll:
   - if your highest kept roll falls short of 14, it becomes 14;
   - your lowest kept roll always becomes 8.
4. Add your **Inheritance** points — +2/+1 or +1/+1/+1 on any abilities of your choice.
   Species grant no ability bonuses.

> [!note] There is no reroll
> The old rule — *"keep only if one of the six is 15 or higher, otherwise reroll the whole set"* —
> is gone. Nothing is ever thrown away: the two floors do the work a reroll used to do, and
> they do it without asking you to abandon a set you have already rolled.

> [!note] Caps
> At creation, an ability can reach at most 18, all bonuses included — the bonuses are in, not
> on top. In play the ceiling is 20 — only **boons** can push a score beyond it.

> [!tip] Late Bloomer — when the floor had to catch you
> If no natural roll reached 14 — so the high floor had to step in, which happens to
> 17 % of characters — you gain the **Late Bloomer** trait. It is an **Inheritance trait**, and it
> gives two things:
> - +2 free points, straight into your free point pool;
> - **the option to buy Expertise at level 1** — an option, never an obligation.
>
> The dice were unkind; the character learned faster somewhere else.
>
> Two points is exactly what one Expertise costs (see [Skills & Tools — Player Guide](skills-and-tools.md)), so
> Late Bloomer pays for an Expertise if you already hold the skill at **Adept**. Spend them elsewhere
> and stay Adept everywhere — that is yours to decide.
>

> [!danger] Draft — the other three methods, awaiting ratification
> The three sections below describe the `4D6`, `ARRAY` and `FREE` buttons of the character
> builder. They were written on 2026-09-06 **from the builder's implementation**, because no
> dictated rule existed for them: every line marked ⚠️ was read in the code and nowhere else.
> Two calls are Eric's alone, and neither is made here:
> - `4d6` and the standard array are the **base game's own** methods, while this chapter is
>   declared *entirely Fate's Hand* — they may not belong in this chapter at all;
> - the opening line above says Fate's Hand rolls *"rather than using Point Buy or the Standard
>   Array"*, and the builder now offers the array.

## The 4d6 method

The builder's `4D6` button. The roll is the base game's own random option (SRD 5.2.1, *Generate Your Scores* — *Random Generation*), and Fate's Hand does not change it.

1. Roll 4d6 and drop the lowest die; the three that remain are your score.
2. Do this six times — six rolls, six scores. Nothing is set aside, so there is nothing to keep or discard.
3. Assign the six scores to whichever abilities you like.
4. Add your **Inheritance** points — the same step as above.

> [!warning] No floors here, and no Late Bloomer
> The two floors belong to the 3d6 × 10 method and to it alone. Your highest is **not** raised to
> 14, your lowest is **not** brought down to 8, and an unlucky set stays unlucky.
> Late Bloomer follows the high floor, so this method never grants it.
> ⚠️ Read in the implementation, not ratified.

> [!note] What Fate's Hand still changes around it
> The dice are the base game's; the two rules that surround them are not.
> - Your Inheritance points go on **any** abilities you choose — the base game confines its
>   background increases to three named abilities.
> - At creation an ability tops out at **18, all bonuses included** — the base game caps those
>   increases at 20 instead.

> [!note] What it averages
> One 4d6-drop-lowest score averages **12.24**, so six of them average **73.5** before Inheritance
> — a shade above the 3d6 × 10 method (**71.8**) and above the standard array (**72**). It pays
> for that with risk: **48.6 %** of sets contain a score of 8 or lower, and in **7.2 %** of sets no
> roll reaches 14 — with no floor to catch either one.

## The standard array

The builder's `ARRAY` button. The six numbers are the base game's standard array (SRD 5.2.1, *Generate Your Scores*), unchanged: **15, 14, 13, 12, 10, 8**.

1. You are handed those six scores. Nothing is rolled.
2. Assign them to whichever abilities you like.
3. Add your **Inheritance** points — the same step as above.

> [!note] What it gives
> 72 points across six abilities — exactly **12** each on average, and the same total for every
> character at the table. No floor is needed, because nothing can go wrong. Set against **71.8**
> for the 3d6 × 10 method and **73.5** for 4d6, the three sit within two points of one another;
> what separates them is the spread, not the sum.

> [!warning] No Late Bloomer
> Late Bloomer is handed out by the high floor of the 3d6 × 10 method. Nothing is rolled here, so
> nothing can fall short of 14, and the trait is never granted.
> ⚠️ Read in the implementation, not ratified.

> [!note] What Fate's Hand still changes around it
> The same two, and only those two: Inheritance points on **any** abilities rather than three
> named ones, and a creation ceiling of **18 all-in** rather than 20.

## Free assignment

The builder's `FREE` button. This one has no counterpart in the base game — no roll, no array, no budget. It is Fate's Hand's own, and it is the only method that guarantees nothing and costs nothing.

1. Sixteen values sit in front of you, **3 to 18** — the whole span a base score may take at creation.
2. Take any value and place it on any ability. The pool never empties: you may take 14 six times over.
3. Add your **Inheritance** points — the same step as above.

> [!warning] Nothing here holds it back
> Nothing is rolled, no floor applies, no budget is spent, and nothing stops six 18s. Late Bloomer
> is never granted here either — there is no roll to fall short.
> ⚠️ Read in the implementation, not ratified: the builder offers `FREE` to anyone, with no
> condition attached. Whether it needs one — a GM's permission, a table agreement, or nothing
> at all — has not been decided, and this page does not decide it.

> [!note] Why the span stops at 3 and 18
> 3 and 18 are the lowest and the highest a **base** score may be at creation, before Inheritance
> (Eric, 2026-08-15). The chapter's ceiling then applies to the result: at creation an ability
> reaches at most 18, all bonuses included — so a base 18 taken from the pool leaves no room for
> an Inheritance point on that ability.
> ⚠️ That last consequence is drawn from the *Caps* rule above, not dictated — and the builder
> does not enforce it today.

## Why roll?

| Method | Average per ability |
|---|---|
| D&D 2024 Point Buy / Standard Array (+3 points) | ~12.5 |
| Fate's Hand 3d6 × 10 (+3 Inheritance points) | ~12.5 |

The two land in the same place — 12.46 against 12.5 — but rolling can spike high (or low), which static methods can't. The two floors guard against an all-low set — your best is never under 14, your worst is always 8 — so you get fairness *and* the excitement of a standout score.

## 3d6 probability

A single 3d6 roll lands a 17 about 1.39 % of the time and an 18 about 0.46 % — small odds, but across ten rolls there's a real chance of a high result.

| Sum | Ways | Chance |
|:---:|:---:|:---:|
| 3 | 1 / 216 | 0.46 % |
| 4 | 3 / 216 | 1.39 % |
| 5 | 6 / 216 | 2.78 % |
| 6 | 10 / 216 | 4.63 % |
| 7 | 15 / 216 | 6.94 % |
| 8 | 21 / 216 | 9.72 % |
| 9 | 25 / 216 | 11.57 % |
| 10 | 27 / 216 | 12.50 % |
| 11 | 27 / 216 | 12.50 % |
| 12 | 25 / 216 | 11.57 % |
| 13 | 21 / 216 | 9.72 % |
| 14 | 15 / 216 | 6.94 % |
| 15 | 10 / 216 | 4.63 % |
| 16 | 6 / 216 | 2.78 % |
| 17 | 3 / 216 | 1.39 % |
| 18 | 1 / 216 | 0.46 % |

---

<nav class="fh-layer fh-layer--own">
<p><strong>Entirely Fate’s Hand.</strong> The base game says nothing about this subject — every rule on this page is Eric's.</p>
</nav>