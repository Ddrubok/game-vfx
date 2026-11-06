# Review follow-up, 2026-11-06 (v0.4.1)

Later update: the [12-session paired pilot](comparison-2026-11-06.md) is now complete. Both conditions passed 90/90 functional checks; one blinded style review preferred the baseline. No general quality advantage was established. NOT RUN entries below describe the earlier repair-validation stage.

Based on the supplied review of commit 8e9ea86. Changes are local; no commit, push or release was performed. Historical evidence remains historical.

| Finding | Change and evidence |
| --- | --- |
| F01 | Fixed replay route allowlist, realpath containment, loopback binding retained. Real temporary dummy-file/junction test passes. Local assets must remain stable during the run; this is not a public file server. |
| F02 | ID/round accept nonblank strings up to 128 UTF-16 code units or safe integers; reject invalid identity before mutation. Zero is valid; string and numeric IDs remain distinct. |
| F03 | Validate metadata types, required fields, bounded numbers, frame structure and in-frame pivot; commit configuration only after validation. Godot rejects 24 malformed cases, including 1e300 pivot, and preserves prior live state in every case. Image decoding is still trusted-local-asset scope. |
| F04 | Configurable maxActive=128/maxHistory=4096. Visual overflow becomes a closed record; history saturation refuses new identities, retaining existing records until real round teardown. 100,000-event test stays bounded. This bounds retained state, not incoming transport CPU/rate. |
| F05 | Preserve the documented closed lifetime because no real game transport contract was supplied. Explicitly document separate pending/confirmation/deduplication lifetimes and test .79/.81-second arrivals. Late feedback remains intentionally suppressible; mandatory confirmation feedback requires a project-specific adapter. |
| F06 | Replace 100 ms timing acceptance with metadata sum, three warmed trials per one-shot, ordered frame progression and measured frame tolerance. A frame interval above 25 ms fails independently. Headless timing is not rendered timing. |
| F07 | Dashed pending ring versus solid confirmed diamond, plus state text; shapes persist with reduced motion. Browser checks alpha masks without color and captures were opened. No human accessibility study was performed. |
| F08 | Preserve the limited claim: these changes improve demonstrated validation gaps, not proven artistic quality. The controlled six-task comparison below is NOT RUN. |
| F09 | Repair size/range separators in the export reference. |

Validation of final changed paths:

- Node: 18 tests pass (17 event tests, 1 server boundary test).
- Chromium 147.0.7727.15: 14 replay checks pass; [results](evidence/review-2026-11-06/event-replay/validation.json), [pending](evidence/review-2026-11-06/event-replay/pending-reduced.png), [confirmed](evidence/review-2026-11-06/event-replay/confirmed-reduced.png).
- Godot 4.7.1 Windows headless: 84 checks pass; [results](evidence/review-2026-11-06/godot-headless/results.json). Six warmed playback errors were below 1 ms in this run; the acceptance bound uses observed frame intervals. This is not cross-engine or device certification. The editor import invocation exited 1 without a diagnostic; the subsequent runtime parsed the changed scripts, loaded all three existing imported textures, and completed successfully. Clean import from a fresh cache was not established.
- Skill validator passes with Python UTF-8 mode and PyYAML supplied through uv. The initially selected system Python lacked PyYAML; the validator's locale-default decoding also required UTF-8 mode.
- No new Godot rendered run, production network test, Unity/Unreal/mobile test or independent model comparison. The unchanged Canvas exporter/3D implementation was not rerun.

## Controlled comparison protocol (not results)

Compare a minimal baseline (create the requested effect, preserve game rules, inspect the output) with the complete revised skill. Keep model/version, tools, input project snapshot, request, time budget and available references identical. Record exact skill/reference hashes, files read, elapsed time, revisions and failures. Do not expose the other arm's outputs or reviewer conclusions to the producing run.

Use six task pairs: existing effect recolor, style-matched creation for an unfamiliar scene, seamless loop, reduced-motion adaptation retaining state meaning, Godot sheet import including malformed metadata, and delayed/duplicated/reordered event integration. Keep example-copy tasks separate from unseen-game tasks. Supply the actual event contract for the last task, including whether late confirmation must remain visible.

Randomize artifact labels/order for an independent reviewer. Score style fit and state readability against supplied scene references; count integration defects against the actual requirements; record time and rework separately. Include playable outputs, exact exported files and runtime evidence rather than screenshots alone. Publish all attempts and unrun/blocked cases, including ties. Rerun affected pairs after skill changes. A prepared protocol or passing example tests are not evidence that the full skill beats the baseline.
