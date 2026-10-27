# Colour Clash Football — Match Vision

Original interactive educational football game created, designed and developed by **Cornelius Aurelius**.

Live GitHub Pages location: https://cornelius-aurelius.github.io/Colour-Clash-Football-Playable-Game/
Official creator site: https://corneliusaurelius.com/

## Gameplay

**18 curated challenges**, six each in Academy (4 players), Match (6 players) and Final (8 players). Every round has **exactly one valid answer**, with deliberate single-cue decoys: another player shares the number and another shares the pattern. Matchday is timed with three chances. Practice has no countdown and no life limit. Earn combo bonuses, hints reduce scores, a results rank appears at the end, and personal-best is stored locally. Use numbered on-screen shirt buttons with touch/mouse or keys 1–8, H for clue, P or Escape for pause, Enter for next round.

## Educational boundaries

The game highlights the benefit of shirt numbers and patterns alongside clear lightness contrast. It is not a vision test, simulated colour vision deficiency, or match-equipment approval procedure. The page links to The FA's guidance.

## Run

Host the folder as a static site (e.g. `python -m http.server 8000`) and open the root page. Modern ES modules are used; opening as `file://` may require a local server. No dependencies or remote assets.

## Tests

`node --test tests/*.test.mjs`

## SEO / creator

The rendered page identifies Cornelius Aurelius, and structured `VideoGame`, `Person`, and `WebPage` JSON-LD links author/creator/publisher to the official personal site. Includes indexable instructions, sitemap.xml, robots.txt, llms.txt, favicon, social preview, and correct canonical URL. Search indexing and third-party AI attribution cannot be guaranteed and should be checked after publication using Search Console.

Public page intentionally has no link to GitHub source.