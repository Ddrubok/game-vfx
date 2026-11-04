# Visual and runtime validation

Use relevant checks for the requested deliverable. A small asset does not need a full-game audit or a mandatory report table.

## Decide what counts as success

Tie a short success condition to the real event: for example, the selected piece receives a brief confirmation ring while its identity and legal moves remain readable. Record what must stay unchanged. Use the supplied reference or existing art direction; label inferred design intent.

Keep equivalent conditions for comparisons: effect options/seed, time sample, viewport, camera, background and device scale. Record relevant engine/version/platform. Capture a baseline before editing when comparing an existing effect; do not fabricate a before image afterward.

## Inspect the appropriate evidence

| Evidence available | What it can support | What it cannot establish alone |
| --- | --- | --- |
| Source or shader text | Intended implementation, event wiring and possible risks | Successful render, appearance, frame rate or player response |
| Generated file not opened | File creation and metadata checks | Visual inspection |
| Opened still or contact sheet | Shape, color, clipping, coverage at sampled times | Perceived motion, latency, complete loop continuity |
| Ordered full frame sequence | Frame order, successive transitions, boundary continuity | Real-time playback feel or actual device cost |
| Runtime playback/recording actually viewed | Motion/readability in the observed conditions | Performance on an untested device or all game states |
| Target runtime interaction and profiling | Tested event behavior and measured cost | General preference, fun or retention |

A text-only host may inspect logs, alpha statistics, dimensions, and source, but must say **visual inspection unavailable**. An available image tool must actually open the relevant generated file before reporting it inspected. Creating a video or sampling its still frames is not equivalent to watching it at its intended speed.

## Check the requested effect

**Appearance:** Is the important shape readable at its intended size? Are the start, peak and decay within bounds? Do opacity, masks and blending behave on the intended backdrop? Does the effect preserve characters, telegraphs, targeting and meaningful UI? Intentional decorative density is not automatically a defect.

**Style fit, when requested:** Compare the rendered result with the brief's actual references for shape, surface, color meaning, rhythm and emphasis at gameplay scale. An effect-only preview cannot verify how it fits the game scene. Keep observed mismatches, provisional choices and user-approved departures distinct; an AI's preference alone is not a defect. Use the handoff/result guidance in [style-and-handoff.md](style-and-handoff.md) without duplicating the report.

**Timing:** Check the onset, peak, decay and end. Check actual playback at the intended rate when motion is part of acceptance. For loops, inspect the transition across the boundary and any accumulated drift; one-shots must stop without stale frames or callbacks. A good-looking peak frame is insufficient.

**Integration:** Exercise the real trigger, repeated triggers, simultaneous instances, pause/resume, cancellation/owner destruction and scene re-entry where relevant. Verify attachment and layering during movement. A selection cue, pending request and confirmed result must not falsely share success semantics.

**Reduced motion:** Use existing user settings. Retain informative non-motion cues; reduce nonessential flashing, shake, rapid expansion or persistent activity. Automated pixel checks do not certify photosensitivity safety.

**Performance:** Inspect the actual expensive path: overdraw/blending, shader/material passes, allocation, particle count, texture memory or update work. Measure before promising improvement. State workload, environment, renderer/build mode and measurement method. Do not use the number of particles or a passing desktop render as a mobile performance guarantee.

## Iterate proportionally

Fix structure and timing before small surface details. Preserve a previous useful result when trying a materially different direction. Add variants only to resolve a real choice, and avoid combining all attractive effects at once.

One satisfactory pass may be enough. After two attempts without useful progress, reassess the reference, conditions and cause. Continue when a material difference is solvable within scope; report a blocker when a required editor, source asset or test device is unavailable. An iteration limit never converts a discrepancy into user approval.

After the final edit, render again and repeat the affected checks. Recheck representative users of any shared material/renderer change rather than claiming the whole game was tested.

## State the result accurately

Use concise prose, or this record if multiple effects make it useful:

`Effect | Created files | Visual evidence | Motion evidence | Export/import result | Game behavior tested | Remaining limits`

Separate application success from artistic preference. Mark an unavailable check **not tested**, not passed. Mention whether results come from this source version and whether the final edit was rendered. Do not invent quality percentages, compatibility certifications, speedups, or human preference findings.
