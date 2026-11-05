# Event ownership and integration

Read when connecting an effect to gameplay, a pending request, networking, or a reusable scene owner. A standalone asset/recolor does not require this protocol. Adapt to the project's real event model; these concepts are not a new required schema or network architecture.

## Identify the boundary before drawing

Record the event source and its trust boundary; identity; actor/target; owner/round lifetime; state being communicated; coordinate space/contact point; presentation clock; and cancellation/overlap policy where relevant. Reuse existing IDs and revisions instead of adding a second source of truth.

An input can produce immediate acknowledgement without asserting success. A prediction can produce clearly provisional feedback if the game supports it. Damage, commitment, reward and success cues must follow the actual authority. Do not infer server approval from a local collision callback or an effect finishing. Never accept an arbitrary client message as an authoritative outcome merely because it has an event ID.

For a joint brief, `bettermakegame` owns the event meaning and preservation conditions, while this skill implements and checks the effect path. A `kill-game-slop` finding keeps its original judgment and provenance. Missing evidence stays missing; “optional style proposal” does not become “confirmed defect.”

## Exercise the paths the game supports

| Path | Expected presentation behavior | Preservation check |
| --- | --- | --- |
| Pending / predicted | Acknowledgement or explicitly provisional cue, if designed | No confirmed damage, reward or commitment invented |
| Confirmed | Create or promote the relevant cue once | Same event identity, owner and authoritative contact/result |
| Repeated delivery / persistent contact | Existing deduplication or contact-phase policy | No unintended new burst, sound or accumulating camera offset |
| Rejected / corrected / rollback | Cancel or reconcile according to the actual protocol | No stale success cue; no visual callback writes a compensating gameplay result |
| Correction after a one-shot finished | Keep its presentation lifetime closed, even for a higher revision; update authoritative state elsewhere | No replay or new burst unless the real protocol explicitly defines a new presentation lifetime |
| Reordered response | Respect the protocol's ordering/revision rules | An older confirmation must not revive a newer rejected/closed state |
| Owner destroyed / round changes / scene re-entry | Retire owned effects and stale callbacks | Prior-round IDs cannot affect a new round; another live owner's effects survive |
| Pause / reduced motion / mute | Apply the existing clock and settings policy | Simulation and required information continue as specified |

Do not assume all projects support rollback or revisions. If ordering is unknown, inspect the actual transport/state owner and report that limit. Do not invent a server protocol to make a demonstration pass.

A completion callback must identify its owner generation and round as well as the event. A callback captured before pooled reuse must not finish the new instance. A later confirmation after a provisional cue expired follows the project's explicit policy: do not silently invent a replay policy.

Tie deduplication history to the protocol's retention/replay horizon. Finishing a particle instance must not immediately make an old message eligible again; keeping every ID forever is also unsuitable. Clear or bound history at a justified lifetime boundary. Distinguish a new contact from a repeated report of the same contact.

Keep cosmetic state and randomness outside authoritative simulation. Make presentation cancellation idempotent; ensure a stale callback cannot change a newly reused pooled owner. Restore only offsets/settings owned by the effect, not a newer pause/camera/mix state. Shared VFX and sound should consume the same meaningful event; coordinating them does not authorize adding unrequested audio or hit stop.

## Verify without overstating the result

Use the existing runtime or replayable harness. A small optional [trusted-event adapter](../assets/event-impact.mjs) demonstrates a closed one-shot lifetime and generation-aware completion; it is a local template, not an authentication layer or a server protocol. The repository's `examples/event-replay/` contains its rendered replay and regression tests; these maintainer files are not required by ordinary asset tasks. Record input order, initial state, relevant timing/round IDs, final world state and visible/audio result. Compare effects enabled/disabled when this can detect gameplay interference. Exercise the actual final code after editing.

A synthetic event adapter can verify local deduplication and state mapping. It cannot establish real packet behavior, physics synchronization, visual fit, latency or sound quality. Separate model checks, rendered captures, real playback and device/network results in the existing [VFX result](style-and-handoff.md). Missing integration evidence is a remaining check even if exported assets look correct.
