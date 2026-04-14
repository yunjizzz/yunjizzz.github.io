# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"이 집.. 진짜 맛집일까?" — A static front-end demo that analyzes Naver restaurant reviews to detect fake/manipulated reviews. It scores restaurants on 5 metrics and renders a verdict (genuine, ambiguous, or suspicious). Currently runs with 5 hardcoded sample restaurants (no backend).

## Development

No build system, bundler, or package manager. Open `index.html` directly in a browser or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server
```

## Architecture

Three files, loaded in order by `index.html`:

1. **`data.js`** — Defines the global `RESTAURANTS` array. Each entry has metadata (`name`, `category`, `address`, `thumbnail`) and a `reviews[]` array. Review schema fields (documented at top of file) include reviewer activity stats, receipt verification, photo hashes, and visit counts — all used by the scoring heuristics.

2. **`app.js`** — All analysis logic and DOM rendering in one file:
   - **5 scoring functions** that operate on a restaurant's `reviews[]`:
     - `reviewCredibility()` — weighted score (0–100) from reviewer activity, diversity, receipt verification, text quality, emoji density
     - `regularRatio()` — percentage of reviewers with 2+ visits
     - `photoAuthenticity()` — uniqueness ratio of perceptual photo hashes (duplicate hashes = reused promo images)
     - `visitHourHistogram()` + `describeVisitPattern()` — 24-hour visit distribution; off-peak clustering suggests coordinated visits
     - `ratingVariance()` — low variance + high mean = rating manipulation; high variance = polarized
   - `verdict()` — combines the 5 metrics into a final tag: good / warn / bad
   - `reviewFlag()` — per-review flags shown in the UI (체험단 의심, 찬양 단문, 편향 리뷰어, 검증된 단골)
   - `render()` — builds the entire result section via innerHTML
   - Search: matches query against `name`, `category`, `address` (case-insensitive substring)

3. **`styles.css`** — Dark theme with CSS custom properties (`--good`, `--warn`, `--bad` for traffic-light coloring). 2-column metric grid collapses to 1-column at 640px.

## Key Design Decisions

- All scoring weights and thresholds are hardcoded constants inside the scoring functions (not configurable). Tuning them requires editing `app.js` directly.
- The `verdict()` composite score uses fixed weights: credibility 45%, regular ratio 25%, photo authenticity 20%, plus bonus/penalty for rating distribution.
- Photo hash deduplication works by counting hash collisions across reviews — identical `photoHashes` entries across different reviews indicate reused promotional images.
- The UI language is Korean throughout.
