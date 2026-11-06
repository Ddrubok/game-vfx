# Practical VFX validation — v0.4.0, 2026-11-05

[English](practical-validation-2026-11-05.md) | [한국어](practical-validation-2026-11-05.ko.md)

Base: `b487d6813209adc26807cc3b553f3f6a0352cadf`. [Snapshot](practical-validation-2026-11-05-snapshot.json) binds the current source, checker and native project files. Historical v0.3.1 results retain their original hashes.

## What changed

The existing Canvas example now offers radial impact, directional ribbon slash and looping rising embers. Export controls select 64/128/256/512 px frames, 4–60 frames and 0.1–5 seconds. Metadata preserves duration, midpoint samples, playback times, pivot and looping. Invalid values are rejected before allocation. Defaults remain 512 px, 20 frames, 0.8 seconds. Source-over alpha is still the sample's blend mode; three example forms do not establish arbitrary art-style quality.

The default atlas is 2560×2048, **20 MiB of RGBA8 pixel data**. Recorded 128 px variants use 512×384 atlases for impact/slash (**0.75 MiB**) and 512×512 for embers (**1 MiB**). These are width×height×4 calculations, not observed GPU memory, quality equivalence or a performance improvement claim. Choose output size for the actual rendered scale.

## Executed evidence

| Check | Result | Evidence / scope |
| --- | --- | --- |
| Default Canvas export/playback | 25 checks passed; 20/20 packed frames exactly match individual PNG exports | [JSON](evidence/practical-2026-11-05/canvas-default/validation.json), existing 512 px default |
| Configurable styles | 18 checks passed | [JSON](evidence/practical-2026-11-05/variants/validation.json), actual UI/downloads, 128 px variants, bounds/loop/reduced motion |
| Local event adapter | 13 Node tests passed | `node --test examples/event-replay/events.test.mjs`; trusted local events only |
| Rendered event replay | 11 checks passed | [JSON](evidence/practical-2026-11-05/event-replay/validation.json), current Canvas renderer |
| Godot native scene | 16 checks passed | [JSON](evidence/practical-2026-11-05/godot-rendered-final/results.json), GL Compatibility, Windows, actual native renderer |
| Shared bettermakegame fixture | 17 online / 42 total Node checks passed | New owner/generation completion checks; hashes in snapshot |

Browser environment: Node 22.18.0, Playwright 1.62.1, Chrome 156.0.8078.80. Native: Godot `4.4.1.stable.official.49a5bc7b6`, NVIDIA RTX 3080 Laptop GPU, OpenGL 3.3, driver 617.42. The [official Windows release](https://github.com/godotengine/godot/releases/tag/4.4.1-stable) was downloaded separately, not bundled; local ZIP SHA-256 `1c729738f42e43036a7147838aa9fa56d62101cf90884f315e1ab525e8e69d61` (69,065,928 bytes). The release metadata provided no digest, so this is a local provenance hash, not independent publisher-checksum verification.

The smaller variants initially failed raw RGB byte equality after PNG roundtrips. Final checks require **identical alpha** and **premultiplied RGB difference ≤1 in 8-bit units**, recording exact-match counts and deltas rather than claiming byte equality. Default 512 px keeps the stricter exact check. This tolerance accounts for the observed encoding/rounding differences; it is not a perceptual score or license to ignore frame/alpha errors.

The [native capture](evidence/practical-2026-11-05/godot-rendered-final/godot-effects.png), [slash preview](evidence/practical-2026-11-05/variants/slash-preview.png) and [ember preview](evidence/practical-2026-11-05/variants/embers-preview.png) were actually opened by the maintaining agent. Still-image inspection does not assess animation comfort or player preference. Native one-shot signals were 0.582783/0.382836 s for declared 0.6/0.4 s; the coarse test permits <0.10 s error. See [Godot reproduction and limits](../examples/godot-sheet/README.md). The prior user's timing discrepancy remains undiagnosed; no native particle recreation is claimed.

## Joint case and agent evaluation

The [actual promotion component case](https://github.com/Ddrubok/kill-game-slop/tree/main/evals/real/promotion-2026-11-05) uses restrained closing feedback and static selected state under reduced motion. No new decorative effect was necessary. It tests a limited same-session application of the three skill roles, not an independent distributed handoff.

The [fresh four-session comparison](https://github.com/Ddrubok/bettermakegame/tree/main/evals/discovery-2026-11-05) found both short and full bundles repaired selection and preserved valid celebration. No additional accuracy advantage was demonstrated. Existing dedicated handoff/U/V sets remain NOT RUN. The old 3D 28-check record was not rerun this pass; its source was unchanged. Unity/Unreal/mobile/packaged Godot exports, production networks, human playtests and measured performance remain NOT RUN.

## Final package checks

[Machine-readable summary](practical-validation-2026-11-05-results.json): all three skill frontmatters passed the existing validator; selected runtime local file links and licenses passed the maintainer checker; repository Markdown file targets and `git diff --check` passed. New text whitespace was checked separately. Markdown anchor rendering and agent behavior are not established by those static checks. The frozen comparison runtime matches the final runtime byte-for-byte; snapshots also include LF-normalized hashes for cross-platform checkouts.
