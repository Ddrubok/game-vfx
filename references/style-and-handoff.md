# Game style and VFX handoff

Read for game-style matching, a meaningful change of visual direction, or coordination with `bettermakegame`. A simple export or already-specified color adjustment does not need this full process. A VFX brief is task context for the same agent, not a service call, an installed integration, or permission to change gameplay.

## Use evidence for the visual direction

Start with the user's current direction and designated reference, then the relevant project art guide, actual scene, and existing effects. Inspect images with an available image tool. Existing code and filenames can explain implementation but cannot prove the game's visible style. Use video or runtime observation for claims about rhythm and timing; a still can support only spatial/visual observations at that moment.

An explicit redesign may supersede an older reference within the requested scope. If authoritative sources conflict in a way that changes the result, identify the conflict and ask one narrow question; continue independent work. Do not silently combine incompatible visual languages or treat an unapproved alternative as the new standard. Where evidence is absent, label a bounded direction provisional and disclose which scene/reference would validate it.

Translate references into useful constraints rather than an adjective such as "premium" or "fantasy":

| Aspect | What to observe | Consequence for the effect |
| --- | --- | --- |
| Shape and edge | Rounded, angular, torn, geometric, soft or hard silhouettes | Ring shape, shard silhouettes, trail taper and edge treatment |
| Surface and light | Painted, matte, paper-like, polished, emissive; how the scene handles light | Texture, opacity, highlights, glow and material choice |
| Color meaning | Main/supporting colors and reserved team, damage, rarity or state cues | Palette and contrast that preserve meaning; color is not the only signal |
| Motion and rhythm | Existing onset, acceleration, hold and decay, with observed or documented timing | Curves and event alignment; still-image-based timing remains a proposal |
| Hierarchy and repetition | Routine action, important result or climax; actual frequency/overlap | Relative intensity, screen coverage and repeat behavior |
| Camera and scale | Gameplay distance, perspective, 2D/3D space, background and UI overlap | World/screen units, attachment, depth and detail that survives the real view |

Read the actual game, not a genre stereotype: a cozy game may deliberately celebrate loudly, and an action game may use restrained effects. Preserve intentional extravagance when it serves the provided direction. Neither realism nor more particles is an automatic improvement.

## Reuse or write a short VFX brief

Use an existing brief from `bettermakegame`, the user or the project. Fill only gaps that affect implementation. For a small effect one paragraph is enough; no separate file, schema, fixed table or approval round is required. Relevant fields are:

- **Event and scope:** trigger, actor/target, state being communicated, purpose, and asset-only / integration / review-only scope.
- **References and status:** actual paths/captures/documents; which decisions are specified, observed or provisional. A file path alone is not evidence it was viewed.
- **Style decisions:** relevant shape, surface, palette semantics, motion and emphasis, with reasons tied to those references.
- **Preserve:** gameplay/authority, meaningful silhouettes, semantic colors, existing identity, important information and accessibility behavior.
- **Runtime and output:** actual engine/version, camera/scale, target platform, known performance constraints, and requested format. Trial budgets remain trial values until measured.
- **Checks:** what should become clearer, what must stay intact, and the scene/state/repetition conditions that can verify it.

Keep required constraints separate from optional proposals. Respect explicit user direction over the brief's inferred defaults. Do not interpret a style brief as authority to change hit timing, hidden information, animation locks or simulation clocks. If aesthetic choices would change those things, find a presentation-only option or resolve that specific scope decision.

When the brief comes from a `kill-game-slop` finding, retain its ID, judgment, evidence provenance and unknowns. Do not promote an optional proposal to a defect or a reported symptom to a reproduction. For event integration, carry only relevant identity, owner/round, state-order and cancellation details from [event-integration.md](event-integration.md); no fixed contract or extra report is required.

## Convert style into an implementation

Map each consequential choice to a rendering decision: a painted reference may suggest irregular textured shapes; a hard mechanical reference may suggest segmented geometry. Neither is mandatory without evidence. Choose native materials, meshes, particles or baked textures based on the target runtime and view. Adapt or replace the bundled demonstration's rings, particles and dome when they do not suit the reference; its appearance is not the skill's default art style.

A recolor is sufficient when color is the only requested or mismatched property. Do not equate recoloring with a complete style adaptation when shape, surface or motion still differ. Conversely, do not manufacture extra differences to justify redesigning an effect that already fits.

When the direction is clear, make one coherent version. When a meaningful choice remains, propose a small number of bounded alternatives and state the gains, losses and invariants. Keep the current version as an option. Do not force variant production for every request or claim all proposed variants were rendered.

These are hypothetical examples, not genre presets or evaluated results:

| Supplied direction for the same confirmed contact event | Possible treatment | What must be checked |
| --- | --- | --- |
| Rounded matte wooden pieces; existing cues settle gently; frequent contacts | Low local arc and a few rounded dust shapes with restrained highlights | Piece identity and next move remain visible; effect does not imply broken pieces |
| Painted magical world; authored effects use uneven ink edges and layered wisps | Irregular sweep and textured wisps following the existing accent colors | Painted edges survive gameplay scale; status colors and targets remain distinct |
| Hard-edged industrial scene; existing effects use sharp sparks and directional motion | Directional sparks and a brief local contact response | Confirmed impact location, depth, surface alignment and repeated-event density |

## Return evidence and review in context

Return a concise **VFX result** alongside the deliverable: brief/reference used; files and relevant parameters; applied choices and departures; actual visual/motion/export/integration evidence; remaining differences or blockers. Use existing output rather than writing a second report with the same facts.

For a joint task, review that result with the `bettermakegame` intent and preservation conditions in the same session. Do not restart style analysis or recursively ask each skill to invoke the other. Revisit only new evidence, changed requirements or a demonstrated mismatch.

Evaluate style fit, functional behavior and runtime cost separately. A rendered isolated effect can be described as matching specific reference properties observed there; **fit in the game remains unverified without the game scene**. Source inspection, compilation or a favorable description cannot substitute for that comparison. A style discrepancy is not automatically a functional defect, and explaining a departure does not approve it.

When fit is weak, revise the relevant shape, surface, timing or emphasis, or retain the baseline. Do not change the whole game's style to accommodate a new effect unless that redesign was requested. Report which conditions were actually seen; do not infer human preference or quantify a quality gain from the handoff itself.
