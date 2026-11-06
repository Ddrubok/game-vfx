# Single-run paired comparison

Twelve independent Sol/medium sessions: six requests, baseline and full v0.4.1 skill once each. Source fixtures and user requests are identical within each pair. Full includes the skill's bundled assets and conditional references; baseline has a one-sentence workflow. The comparison tests the whole package, not prose alone. All sessions have the same local tools and approximately four minutes requested effort; the shared runner has an 11-minute hard process timeout. Execution order was randomized before any outcomes. Four sessions run concurrently on one host.

Held-out verification is written by the coordinator while producers run. Producers cannot read it by instruction. Workspaces and task context are separate but filesystem isolation is instruction based, not enforced. The Codex host may expose a skill catalog; logs must be inspected for actual baseline loading of the full skill. Global settings are unchanged.

Criteria fixed before reading submissions:

- Recolor: visible, deterministic, transparent endpoint, duration unchanged, exact alpha/geometry at three timestamps, teal on >98% of sufficiently opaque pixels (RGB tolerance 5).
- Style: visible, deterministic, transparent endpoint, 0.6-second duration; condition-blinded judgment against flat paper-garden reference, 64px landing readability, palette/material fit and unwanted spectacle.
- Loop: duration 1.2, loop flag, visible across periods, deterministic periodic output, mean RGBA difference under 1/255 at times 1 ms either side of seam, static reduced-motion output. Exact periodic pixels are strict and failures must be inspected for floating-point raster noise.
- Reduced motion: both states visible, different alpha silhouettes, identical frames at .1/.4/.7 seconds in reduced mode, transparent endpoint.
- Godot: three valid imports, duration/loop preserved, 24 malformed inputs return false and preserve live state, no script errors. Clean import and runtime exit are reported separately.
- Events: late and near-expiry confirmation starts a full phase, one burst per identity, corrections preserve age, pending completion token cannot close confirmed replacement, terminal rejection/completion, owner/round isolation, input rejection and bounded state.

Report all attempted cells, errors, elapsed time, token usage, self-reported revisions, raw checks and evidence. A CLI SUCCESS is not correctness. No repair of submitted implementations before scoring. One blinded AI reviewer can assess captured visual fit, not human preference or continuous perceived motion. One sample per cell cannot establish statistical significance, broad production superiority or mobile/other-engine compatibility.

Harness correction during execution: event age equality .4 was replaced with absolute tolerance 1e-9 after observing 0.3999999999999999. No submitted code changed. Original results preserved in verification-before-float-fix.json; both event arms use the corrected check.
