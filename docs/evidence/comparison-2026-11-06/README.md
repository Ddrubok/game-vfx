# Paired comparison evidence

See the [report and score tables](../../comparison-2026-11-06.md) and [protocol](PROTOCOL.md). `runs/<label>/` contains the twelve unchanged submissions and requests; `manifest.json` maps labels to tasks and conditions. `blind-review/gallery.png` and `score.json` contain the separate blinded visual review. `submission-audit.json` records source hashes, usage, self-reported revisions, files read and command counts.

The original result JSON files are historical evidence. Personal machine paths, session IDs, raw shell commands and host logs are omitted from the public copies. The full local transcripts were retained. This package does not automatically start model sessions; it reproduces the common checks on their saved outputs.

From this directory, use an existing Node/Playwright installation:

```sh
node verify.mjs
```

If Playwright is installed elsewhere, set `VFX_TOOL_ROOT` to the directory containing its `node_modules`. Set `VFX_BROWSER_PATH` to use an installed Chromium executable. For the Godot checks, set `VFX_GODOT_PATH` to an installed Godot 4 executable, or place `godot` on PATH:

```sh
node verify-godot.mjs
```

The original engine was Godot 4.7.1. New runs write `recheck-verification.json`, `recheck-godot-verification.json` and captures/logs under ignored `recheck/`. Godot also generates ignored imports and a held-out test script in each Godot run directory. The scripts exit nonzero on failed checks. Original `verification.json` and `godot-verification.json` remain unchanged.

The browser verifier checks saved frames and sampled timing, not human motion preference. The Godot verifier runs headlessly. The comparison has one sample per arm/task and cannot establish general superiority.

Both verifiers now require all 12 unique task/condition cells and successful execution records before starting; final check names must match the historical check inventory. Missing, duplicate or unfinished cases fail rather than silently passing. The browser server uses the shared allowlisted handler from `examples/event-replay/server.mjs`; run from a full repository checkout.

The later pending-completion regression is separate from the historical 90/90 scores. Run `node --test checks.test.mjs callback.test.mjs` here. The callback test confirms the original full submission's failure and verifies `pending-callback.patch` in memory without altering either submission. A passing regression test means the historical defect was reproduced and the separate correction worked, not that the original passed the new contract case.
