# Paired comparison evidence

See the [report and score tables](../../comparison-2026-11-06.md) and [protocol](PROTOCOL.md). `runs/<label>/` contains the twelve unchanged submissions and requests; `manifest.json` maps labels to tasks and conditions. `blind-review/gallery.png` and `score.json` contain the separate blinded visual review. `submission-audit.json` records source hashes, usage, self-reported revisions, files read and command counts.

The original result JSON files are historical evidence. Personal machine paths, session IDs, raw shell commands and host logs are omitted from the public copies. The full local transcripts were retained. This package does not automatically start model sessions; it reproduces the common checks on their saved outputs.

From this directory, use an existing Node/Playwright installation:

```sh
node verify.mjs
```

If Playwright is installed elsewhere, set `VFX_TOOL_ROOT` to the directory containing its `node_modules`. For the Godot checks, set `VFX_GODOT_PATH` to an installed Godot 4 executable, or place `godot` on PATH:

```sh
node verify-godot.mjs
```

The original engine was Godot 4.7.1. New runs write `recheck-verification.json`, `recheck-godot-verification.json` and captures/logs under ignored `recheck/`. Godot also generates ignored imports and a held-out test script in each Godot run directory. The scripts exit nonzero on failed checks. Original `verification.json` and `godot-verification.json` remain unchanged.

The browser verifier checks saved frames and sampled timing, not human motion preference. The Godot verifier runs headlessly. The comparison has one sample per arm/task and cannot establish general superiority.
