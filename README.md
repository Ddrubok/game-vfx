# Game VFX

[English](README.md) | [한국어](README.ko.md) · **v0.4.0**

An AI agent skill for making game effects that fit the project's art direction and actual events. It covers smooth 2D effects, particles, trails, shaders, and 3D effects using the project's renderer.

The agent starts with the game scene or visual references, makes an effect, renders it, inspects the result, and adjusts it. It then checks the requested export or integration. The package contains instructions and an editable 2D example; this repository also includes a standalone 3D example. It is not a catalog of finished effects or a guarantee that every engine is supported.

![3D shockwave example](docs/shockwave-3d.png)

## Try the examples

Download or clone the repository, then open these HTML files in a suitable browser. GitHub's file viewer shows source; open the downloaded file to run it.

| Example | What it does |
| --- | --- |
| [2D styles](assets/canvas-impact.html) | Impact, ribbon slash and looping embers; adjust size, frame count, duration, color and seed; export PNG/custom JSON. |
| [Godot native scene](examples/godot-sheet/README.md) | Import and play all three exports; check finish, pause, replay and owner cleanup. |
| [Event replay](examples/event-replay/index.html) | Local event ownership, corrections, completion and round cleanup; requires the local server described in its README. |
| [3D shockwave](examples/shockwave-3d/shockwave-3d.html) | Rotate the camera around a hemisphere, rings, and particles; inspect occlusion; show 1, 3, or 6 effects. |

The 2D and 3D standalone examples run offline; the event replay uses a local HTTP server. The 3D example requires WebGL2. Its PNG button saves the current camera view, not a 3D model or a transparent effect asset. Read its [source and build guide](examples/shockwave-3d/README.md) to modify it.

## Fit the game's style

The skill examines useful evidence for shape, surface, color meaning, motion, emphasis, and camera scale. It preserves the game's actual event and rules. It does not assume that every effect needs glow, camera shake, hit-stop, or more particles.

For work with [bettermakegame](https://github.com/Ddrubok/bettermakegame):

1. **Define the moment.** Better Make Game records the event, intended feeling, references, and preservation conditions in a short VFX brief.
2. **Produce the effect.** Game VFX uses that brief to choose a renderer, create the effect, and inspect the output.
3. **Review in context.** Compare the result in the actual scene, keeping style fit, functional correctness, runtime cost, and player preference separate.

Each skill works alone. This handoff uses instructions in the same session; it does not launch extra agents or require a service. If a reference or runtime is missing, the agent must say which choices are provisional and which checks remain unverified. A palette change alone is not proof of a style match. See [style-and-handoff.md](references/style-and-handoff.md).

## Install and use

Keep `SKILL.md`, `LICENSE`, `agents/`, `references/`, and `assets/` together in a folder named `game-vfx` in a skill location recognized by your agent. Download this repository or clone it:

```sh
git clone https://github.com/Ddrubok/game-vfx.git
```

The maintainer's Orca setup recognizes `~/.codex/skills/game-vfx`. Other configurations may use another directory. Use your host's supported location, preserve local changes when updating, and avoid duplicate installations. The repository's `examples/` and `docs/` are optional demonstration and maintainer material, not instructions that every task must read.

The instruction package needs no separate API key or MCP server. It still needs an agent with access to the project and suitable editing, rendering, and image-viewing tools. Other hosts, including Claude and Gemini, can be given the Markdown files; automatic discovery and activation have not been tested across hosts. `agents/openai.yaml` is optional Codex display metadata.

These are messages to an agent, not shell commands. The `$skill-name` notation is a Codex invocation example.

```text
$game-vfx Create a smooth ice-impact effect for this project.
Use its existing art direction and renderer. Preserve collision rules.
Show a preview and check the requested integration; report untested parts.
```

```text
$bettermakegame $game-vfx
Use this game's design references and scene to make a matching collision
effect. Keep turn rules and selection cues readable during repeated hits.
```

```text
$game-vfx Review this effect against the supplied style reference.
Report differences and evidence without modifying the game.
```

## What has been checked

- The updated 2D export passed 25 browser/export checks on 2026-11-05, including a visible first frame, unchanged 0.8-second playback duration, and all 20 saved frames matching individual exports. The final fade sample is fully transparent in this 8-bit export. The earlier 23-check run remains historical.
- The 3D example passed 28 automated checks, including a controlled occlusion comparison, playback, six simultaneous effects, and repeated creation/cleanup. Its tracked resource counts did not grow during the sampled cycles.
- Final static captures were opened for visual inspection. The linked skill instructions passed metadata, relative-link, and whitespace checks.

These results are limited to the recorded examples and conditions. They do not prove subjective motion quality, general leak freedom, mobile performance, or general Unity/Godot/Unreal/Flutter integration. The separate v0.4.0 Godot scene below has a narrower native test record. **Independent end-to-end evaluation of the new style handoff is NOT RUN.** See the [validation record](docs/validation.md) for evidence and limits.

## Version 0.3.1

Fixes the blank first exported frame by separating playback time from interval-midpoint sampling. Adds an optional event adapter and rendered replay, a portable Canvas checker, engine-identification/import guidance, and a Godot reference snippet marked **NOT RUN**. Finished effects stay closed even on a higher revision; callbacks carry owner generation. Source-over blending and the single shockwave style remain deliberate example limits.

The local event adapter passed 13 Node tests and 11 rendered-browser checks. The corrected shared bettermakegame fixture passed 13 tests; the previous nine-test evidence is preserved with its missed regressions disclosed. The engine snippet, real network/device runs and skill-handoff behavior are not verified by these passes. See the [repair record](docs/feedback-repair-2026-11-05.md), [Canvas checker](examples/canvas-verification/README.md), and [event replay](examples/event-replay/README.md).

## Version 0.3.0

Version 0.3.0 adds [event integration guidance](references/event-integration.md): pending versus confirmed cues, duplicate/reordered events, corrections and owner/round cleanup. Findings from kill-game-slop may arrive directly or through a bettermakegame brief; both routes retain judgment, scope and evidence limits. A local effect does not require all three skills. See the [update record](docs/update-2026-11-05.md) for checks and remaining evaluations; the earlier example results do not validate the new instructions.

## Files and license

- [SKILL.md](SKILL.md): task scope, workflow, and evidence rules.
- [style-and-handoff.md](references/style-and-handoff.md): visual direction and brief/result exchange.
- [engine-adapters.md](references/engine-adapters.md): engine identification, optional examples and the tested Godot sheet scene with disclosed limits.
- [event-integration.md](references/event-integration.md): state truth, ordering, lifetime and bounded integration checks.
- [implementation-and-export.md](references/implementation-and-export.md): renderer selection and export details.
- [visual-validation.md](references/visual-validation.md): visual, motion, integration, and performance checks.

This repository's original material is MIT licensed. The 3D example includes Three.js under its MIT license. Workflow inspiration and third-party notices are in [NOTICE.md](NOTICE.md). No pixelfx code, effects, or fonts are bundled.

## Practical follow-up — 2026-11-05

See the [current repair and evidence record](docs/practical-validation-2026-11-05.md). This pass fixes the shared fixture's stale completion callback, preserves historical results, and publishes a real game-component repair plus a fresh four-session comparison. Both short and full-skill conditions repaired the selection task and preserved the normal celebration; no added accuracy advantage was demonstrated. The original game project was not edited. Human/device/network tests and the dedicated U/V/handoff sets remain unrun.

## Version 0.4.0

The [2D example](assets/canvas-impact.html) now exports impact, ribbon slash and looping embers with configurable resolution, frame count and duration. A [Godot 4.4.1 native project](examples/godot-sheet/README.md) imports all three; 16 native checks passed. Default Canvas checks (25), configurable exports (18), local event tests (13) and rendered replay (11) passed. These are example checks, not general engine support or proof of style quality. The recorded small atlases contain 0.75–1 MiB of RGBA8 pixels versus the default 20 MiB; actual GPU memory and equal perceived quality were not measured.

[2026-11-06 review follow-up / v0.4.1](docs/review-followup-2026-11-06.md): input validation, bounded events, atomic Godot import, timing checks and non-color state cues.

[Paired comparison and score tables / 2026-11-06](docs/comparison-2026-11-06.md): 12 sessions; both conditions passed 90/90 functional checks. The single blinded style review preferred the baseline; no general skill advantage was established.
