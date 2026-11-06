# Feedback repairs

[English](feedback-repair-2026-11-05.md) | [한국어](feedback-repair-2026-11-05.ko.md)

Date: 2026-11-05. Local instruction and example changes; no new agent comparison.

## Changed

- Closed one-shot lifetimes explicitly reject higher revisions; owner-generation tokens prevent old completion callbacks from finishing a reused effect. The optional adapter and rendered replay make this concrete. Rejection/expiration closing a lifetime is this sample's policy, not a universal server protocol.
- Exported frame zero now samples 0.02 s; playback still starts at 0 with 20 × 40 ms frames. `timeSeconds` remains playback position and `sampleTimeSeconds` is the visual sample. The last 0.78 s sample fades to zero at 8-bit precision; it still has its 40 ms duration. The analytic renderer is unchanged at its empty endpoints.
- Published the portable Canvas checker. Added engine identification, a link to the existing 3D source, Godot import reference code and a memory/timing investigation path. The Godot code is NOT RUN.
- Corrected direct/via-bettermakegame handoff wording, conditional routing order and stale publication labels. Historical results and hashes were not replaced with new passes.

## Executed

| Check | Observed result | Scope |
| --- | --- | --- |
| Canvas browser/export | 25 PASS; all 20 saved frames match individual PNG roundtrips | Chrome 156.0.8078.80, Playwright 1.62.1; first frame visible, last fade transparent |
| Event adapter Node regression | 13 PASS | Local event model, including fractional-time expiry, higher revision after finish, round/owner reuse and cancellation |
| Rendered event replay | 11 PASS | Actual Canvas pixels, pending/confirmed change, correction, duplicate, finish, late revision, teardown and elapsed playback |
| Shared bettermakegame online-impact | 13 PASS | Exact source at `fd3c15df5cbbd9226003233e573af67cf8da0c85`; no real network or skill-use claim |

The first new checker run exposed a fractional-time expiry boundary (`0.1 + 0.7`) and an overbroad test that required every fade frame to contain visible pixels. The expiry now uses a floating-point precision tolerance and has a regression case. The export assertion now tests the actual requirement: a visible **first** frame; it reports the transparent final fade rather than hiding it. Final runs above were made after those changes.

Final contact-sheet, light-background and active-correction captures were opened with an image tool. This is static inspection and automated playback, not a human motion/preference study. Evidence and source hashes are in [results](feedback-repair-2026-11-05-results.json) and [snapshot](feedback-repair-2026-11-05-snapshot.json).

## Remaining limits

- User-reported Godot 4.4.1 execution is attributed evidence, not our rerun. No suitable engine executable was found in PATH or checked common install directories. Import/parsing, 0.75 s finish timing and native dot-versus-streak appearance remain NOT RUN / unresolved. The project/import settings behind that observation were not available to this run.
- 2560 × 2048 RGBA8 is 20 MiB before mipmaps; approximately 26.7 MiB with a full chain is arithmetic, not measured GPU memory or the confirmed cause of the reported 28 MB. See [engine guidance](../references/engine-adapters.md) and its official sources.
- Additive blending, extra art styles, native engine integration and the 3D renderer were not added/retested. A single source-over shockwave remains the example's stated scope. No all-engine support is promised.
- New style/event/handoff agent behavior, human playtests, real devices/networks and kill-game-slop U/V: **NOT RUN**. Example correctness does not establish improved skill output.
