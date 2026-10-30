# BrokenRanks Settings

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
