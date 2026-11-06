# v0.4.1 recheck follow-up — v0.4.2 corrections

[English](recheck-followup-2026-11-06.md) | [한국어](recheck-followup-2026-11-06.ko.md)

These changes follow reviewed commit `f7cecaf`. Original comparison submissions, hashes and 90/90 records remain unchanged.

| Item | Resolution |
| --- | --- |
| N01 | Replay, comparison verification and manual serving share the existing allowlist/realpath handler. The comparison server serves only designated preview.html/effect.mjs files. Removed Python-server instructions. |
| N02 | Reproduced the original full-skill submission's pending-completion callback failure. A separate [one-line patch](evidence/comparison-2026-11-06/pending-callback.patch) is applied only in memory by the [regression check](evidence/comparison-2026-11-06/callback.test.mjs). |
| N03 | The default adapter stores only point x/y. Checks verify that a 1 MB extra field and nested references are not retained. |
| N04 | Before execution, require all twelve task/condition cells, unique labels and successful execution records. Afterward, compare cells and check names against the original inventory. Reject empty, missing, duplicate or failed cases. Godot deletes stale result files before reading newly generated results. |
| N05 | Retain the documented saturation policy. Without a real game's round/retransmission contract, no arbitrary history expiry or instrumentation system was added. Existing host diagnostics should inspect history.size/maxHistory. |
| N06 | No additional model experiment was performed. Existing style judgments and limits remain, with the new callback counterexample disclosed at the top of the comparison report. |

Corrected README versions and the Korean description of historical Godot timing. The comparison browser checker now supports the existing `VFX_BROWSER_PATH` option. Only relevant references were expanded; no extra case was added to the skill body.

## Additional callback case

| Submission | Confirmation after pending timer expiry | Confirmation after pending completion callback |
| --- | --- | --- |
| Original baseline | Pass | Pass |
| Original full skill | Pass | **Fail** |
| Full skill + separate patch | Pass | Pass |

The patch check also covers stale-token rejection during confirmed playback, the full 0.8-second confirmed phase, confirmed completion and no replay after rejection. These paths were absent from the original ninety checks. Historical scores are not revised retroactively, and the patched version is not treated as the original submission.

Validation: 22 Node regression tests, 14 replay browser checks, 36/36 Web/event checks per comparison condition and 54/54 Godot checks per condition passed. Manual server CLI serving/denial, patch applicability and skill format were checked. All twelve original submission source hashes remain unchanged. Godot checks were headless; no new physical-device, real-network or human evaluation was performed.

Run regression checks from the repository root:

```sh
node --test examples/event-replay/events.test.mjs examples/event-replay/server.test.mjs docs/evidence/comparison-2026-11-06/checks.test.mjs docs/evidence/comparison-2026-11-06/callback.test.mjs
```
