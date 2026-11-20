# GTA VI Trophy Guide & Tracker — Road to the Platinum

![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/yannyonn94/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/yannyonn94/gta6-trophy-guide-01/reward.svg)

An offline, open-source trophy guide and tracker for Grand Theft Auto VI on PlayStation 5 — built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Tracker** — a checklist over all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze), with progress saved in the browser (localStorage), export to JSON and import back, filters by grade, kind and earned status, and text search.
- **Guides** — a short guide in the author's own words for every trophy, each citing the official description as its source. No text is copied from any other guide.
- **Roadmap** — a 6-phase path to the platinum: story, missables, activities, collectibles & exploration, combat/heists/money, then the platinum itself.
- **Missables** — the 5 trophies that depend on a partner, a story choice, or a one-off moment, flagged so you clear them before the final mission.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them (on by default).

## Sources

Names, descriptions and grades are the official GTA VI trophy list as published on PSN and Exophase (frozen 2026-11-18). Kinds and missable flags are derived from the official descriptions. This is an unofficial fan-made tracker; no Rockstar logo or artwork is used.

## Run it

Serve `app/` with any static server, for example:

```sh
node serve.ts
```

then open http://localhost:8080. Everything works offline — the page loads nothing from the network.
