# BrokenRanks Tools

A single-file reference page for Broken Ranks, live at https://ddrake1984.github.io/BrokenRanks/.

- **Key bindings** — every key rebindable. Click a slot and press the key; modifiers alone (Shift, Ctrl, Alt) bind on release; right-click clears. Saved in that browser only: each person keeps their own.
- **Champions**, **Flasks**, **Shards** — reference tables. These are **shared**: a correction shows for everyone.

## Shared corrections

The tables built into `index.html` are the defaults. Corrections live in a Cloudflare Worker + D1
database (`worker/`) and are laid over the defaults when the page loads. If the Worker can't be
reached, the page shows the defaults.

- Anyone can read. Only the PIN holder can save: **Unlock editing**, enter the PIN, then click any
  underlined value. Enter saves for everyone, Escape cancels, an empty value restores the original.
- Corrected values look like any other; hover one to see the original.
- Lists (areas, set names) are edited separated by semicolons.

## NPCs

Your own list of NPC names and locations, shared like the corrections (`npcs/<id>/name` and
`npcs/<id>/location` keys). With editing unlocked: **Add NPC** adds a line, click a name or location
to change it, **Delete** (click twice) removes a line. Everyone can search it.

## Dungeons

38 dungeons (instances) with bosses, boss rares and loot for the three paths: Discovery (Poznanie),
Adventure (Przygoda), Challenge (Wyzwanie). Researched 2026-11-01 from the official patch notes,
wikibr.pl and the Broken Ranks fandom wikis; each dungeon shows its sources and a confidence level.
The game only shows full per-path loot tables in the instance entry window, so the per-path lists
hold what sources mention; Discovery loot is mostly unknown. Collapsible, searchable by dungeon,
boss or item; corrections and added dungeons are shared (`dungeons/<id>/<field>` keys, PIN).
Entries read off the in-game instance window are marked "verified in game" (so far: Bandit Tower, Puppet Forest, Ichtion's Ship).
Each dungeon has a suggested level per difficulty (`dungeons/<id>/lvl/<mode>`, PIN to fill in); the
summary line shows them once any is known, otherwise the researched level.

Loot shows each item once with D A C marks for the paths that list it. Items with known stats
(`ITEMS` in `index.html`, copied from the game's tooltips) render as full cards in their rarity
colour: blue for rares, yellow for epics. A search that doesn't match a dungeon's name, location
or bosses narrows the loot to matching items, so `power` lists only the gear with Power on it.
## Pets

36 pets (Polish: zwierzaki) researched 2026-11-03, mostly from wikibr.pl and the official Polish
patch notes: standard, guild-cage (I–III), single-use (Imperials), recipe and unique pets. Each card
gives how to get it, cost, level, role, attacks, buffs, debuffs, skills and base stats, with sources
and a confidence level; "How pets work" collects the general rules. No source gives skill numbers
or per-level growth, and the August 2026 Imperial price cuts are unknown. Sortable by name, level,
rank, role or attacks (remembered per browser), searchable on every field;
corrections and added pets are shared (`pets/<id>/<field>` keys, PIN).

## Respawn timers

Each champion has a **Start** button: click it when the champion dies. It counts down to the earliest
respawn (amber), then shows how long the respawn window stays open (green), then "should be up" for an
hour. Click again to restart, right-click to clear.

With editing unlocked, a timer is stored in the Worker (`timers/…` keys) and everyone sees it; other
open pages pick it up within 30 seconds. Without the PIN, a timer lives only in that browser. When
both exist, the newer one shows, tagged "mine" or "shared".

### Worker

API at `https://brokenranks-edits.ddrake1984.workers.dev`, callable from the GitHub Pages origin only.

| Route | Who | Does |
|---|---|---|
| `GET /api/edits` | anyone | all corrections, `{ edits: { key: value } }` |
| `PUT /api/edits` | PIN | `{ key, value }` saves one correction |
| `DELETE /api/edits` | PIN | `{ key }` restores one default |
| `POST /api/check` | PIN | checks the PIN |

The PIN is a Worker secret, never a file. To set or change it, from `worker/`:

```
wrangler secret put EDIT_PIN
```

Deploy with `wrangler deploy` from `worker/`. The schema is `worker/schema.sql`.

