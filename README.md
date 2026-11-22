# best-card-game-20261122-1826

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Victorcollin123/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Victorcollin123/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Ember Court — an original duel card game. Four suits in a ring (Ember ▲ beats Thorn ◆, Thorn ◆ beats Tide ●, Tide ● beats Star ★, Star ★ beats Ember ▲), values 1–8, 20 life each. Higher value wins the round and deals damage equal to the difference; the suit ring breaks tied values and adds +2 damage. You duel Sable, the Thorn Queen, whose plays you can read and counter. Playable offline in a desktop browser from static files — no network request, no build step.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Click a card (or press 1–5), then PLAY (or press Enter). R duels again, M toggles sound.

## How it plays

- Each round you and Sable each play one card from a hand of five; hands refill after every round from a 32-card deck.
- Higher value wins the round; the winner deals damage equal to the difference.
- Tied values: the suit ring decides, and the ring winner deals 2 damage. Same suit, same value: both take 1.
- A ring win on a higher value adds +2 damage.
- First duelist to 0 life loses. Sable saves her best cards and spends her lowest winning card — watch her hand and counter it.

## Files

- `game/` — the playable game as static files (`index.html`, `styles.css`, `src/`).
- `game/src/deck.js` — the 32-card deck and suits; `rules.js` — the duel rules; `ai.js` — Sable's choices; `state.js` — the duel state machine; `render.js` — the table; `input.js` — mouse + keyboard; `audio.js` — synthesized sounds; `random.js` — seeded shuffle; `shots.js` — screenshot presets; `main.js` — boot.
- `screenshots/` — title, table, win and loss screens, real renders of the game.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to the output directory and writes `dossier.json`.
- `shots.json` — the four screenshot URLs (`?shot=title|play|win|loss&seed=7`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=qp17c3xn&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
