# Validation

[English](validation.md) | [한국어](validation.ko.md)

Date: 2026-11-04. Keep package validation, example execution, and the effectiveness of a skill separate.

## Package and handoff

The installed game-vfx v0.2.0 and bettermakegame handoff instructions passed the skill validator, YAML parsing, local reference checks, and whitespace checks. The publication copies are checked against the installed skill files. This establishes packaging consistency, not successful cross-host activation or better artistic judgment.

Independent end-to-end style handoff evaluation: **NOT RUN**. No before/after quality percentage, user preference, or performance gain is claimed.

## 2D example

The [Canvas record](evidence/canvas-2026-11-04.json) contains 23 checks from Chrome 156.0.8078.80. They cover seeded/time-based reproducibility, empty start/end, sampled frame bounds, partial/zero alpha, playback/pause/replay, downloads, dimensions, metadata, and frame order. Each saved sheet frame matched its individually exported PNG after equivalent PNG roundtrips. Final contact-sheet and page captures were opened with an image-viewing tool.

![Sampled 2D frames](canvas-frames.png)

This is a historical same-day run of the bundled example, not a new behavioral evaluation of v0.2.0. It does not establish real-time motion preference or import into another engine.

## 3D example

The [3D record](evidence/shockwave-3d-2026-11-04.json) records 28 browser checks. The observed setup used Windows, Chrome 156.0.8078.80, Three.js 0.187.0, and ANGLE Direct3D11 on Intel UHD Graphics. The portable test entrypoint and dependency lock are included with the example.

- A front-pillar mask selected 13,228 interior pixels. With the pillar present, toggling the effect changed none of those sampled pixels; removing it revealed effect differences at 6,658 of them.
- Six separate effect owners rendered simultaneously.
- Twenty clear/recreate cycles returned to one requested owner. Tracked geometries stayed at 10, textures at 1, and shader programs at 6.
- Other checks cover seeking, empty endpoints, playback/pause/replay, reduced motion, pointer/keyboard camera movement, PNG export, narrow layout, teardown/re-entry, offline operation, and logged errors.

Final isometric, side, six-effect, and narrow-layout images were opened for visual inspection. Occlusion was tested at a fixed camera/time/radius, not every combination. Constant resource counters are not a complete heap/GPU leak audit. Actual playback feel, real phone performance, engine ports, and game event integration remain unverified.
