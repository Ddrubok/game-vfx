---
name: game-vfx
description: >-
  Create, adapt, export, and integrate game visual effects beyond pixel art:
  smooth 2D effects, particles, trails, shaders, and 3D effects using the
  project's renderer and art direction, including VFX briefs from bettermakegame.
  Use for 게임풍에 맞는 이펙트, 게임 이펙트 제작, 비픽셀 이펙트, 마법/타격 효과,
  VFX, particles, shockwaves, or sprite-sheet export. Not a general game
  generator, whole-game polish audit, or cinematic video production skill.
metadata:
  version: "0.4.0"
---

# Game VFX

Make an effect for an actual game event. Develop it as **draft → render → inspect → refine**, then verify its export or integration. Smooth vector shapes, translucent particles, textured sprites, meshes, and shaders are choices; do not force pixel art or a particular engine.

This is a production workflow with one editable Canvas example, not a ready-made effects library or a guarantee of quality across engines. It uses the tools available in its host; no particular AI vendor, plugin, MCP server, or paid service is required by the instructions.

## Establish the deliverable

Distinguish asset creation, in-game implementation, and review-only requests. A review reports findings without editing. An asset request does not authorize changes to an unrelated game. Use existing project context and clear user instructions without repeating approval questions.

Record briefly: the triggering event, intended feeling, visual reference/style, target engine and platform, intended scale/background, and output needed. Add timing, attachment point, layering, and concurrency when they affect the result. Infer minor defaults explicitly; ask only about missing decisions that materially change the deliverable. A short effect does not need a separate specification file.

If a project exists, inspect its renderer/version, effect resources, gameplay event, and import conventions first. Reuse suitable effects and native systems. If no engine is specified, a portable 2D preview is a reasonable declared starting point; do not present it as an engine-integrated or 3D result.

## Match the game's style and feedback

For a style-matching request or a VFX brief from `bettermakegame`, read [style-and-handoff.md](references/style-and-handoff.md). Reuse existing direction rather than repeating a project-wide survey. Derive shape, material, color semantics, motion and emphasis from the actual references and event; genre labels or a palette change alone do not establish a match. Treat missing evidence as a provisional design choice, not an observed property of the game.

When both skills are selected, `bettermakegame` establishes the event's meaning, game intent and preservation conditions; `game-vfx` translates the brief into an effect and returns source, evidence and remaining differences for an in-scene review. Apply these instructions in the same session; this does not launch agents or authorize extra edits. For an effect-only request, `game-vfx` can produce its own brief and complete the work independently. Do not require another skill for a routine recolor or export.

Locate a named companion through the host's available skills when needed. Do not hardcode install paths, assume a tool with that name exists, or bounce the task repeatedly between skills. If a companion is unavailable, use the local brief guidance and disclose that limit only when relevant. `kill-game-slop` remains an optional reviewer of demonstrated readability problems, not a mandatory final audit.

## Choose the smallest suitable production path

Read [implementation-and-export.md](references/implementation-and-export.md) for the selected renderer or export route; ignore unrelated routes.

- Prefer existing engine particles, animation, materials, trails, and shaders when the effect needs world interaction, attachment, lighting, or per-instance control.
- Use a sprite sheet or transparent frames when a baked 2D animation fits. A baked glow does not preserve arbitrary additive blending or scene lighting.
- For a self-contained 2D prototype, copy [canvas-impact.html](assets/canvas-impact.html) into the task's output folder and adapt it there. It opens without a build, previews a shockwave, directional slash or looping embers, and exports a transparent frame or PNG sheet plus separate JSON metadata with adjustable size, frame count and duration. It is not a 3D renderer or a production effects framework.
- When a painted texture or other bitmap asset is needed, use an available image-generation/editing workflow or licensed project asset. Verify that the tool exists; do not claim a texture was generated if only a prompt was written. A still image does not establish animation coherence.
- Check actual editor/CLI/image-viewing capabilities. If an editor or renderer is unavailable, deliver the source or a precise unapplied specification appropriate to the request and identify the missing verification. Do not invent successful imports, API calls, or tool names.

For engine identification or an importer adapter, use the selected route in [engine-adapters.md](references/engine-adapters.md). For gameplay/event integration, read [event-integration.md](references/event-integration.md) only for the affected paths. Preserve pending/confirmed meaning, event ordering, duplicate protection and owner/round cleanup without changing authority or clocks. Carry any companion finding's original judgment and evidence limits; a synthetic event test is not real network or rendered-game verification.

Do not add an engine, package, external service, or general VFX framework merely to produce a small effect. Check version-specific APIs in installed code or official documentation when uncertain.

## Build the effect around the event

Give the effect a readable silhouette, focal point, and appropriate lifetime. Choose relevant stages such as anticipation, impact, secondary motion, and recovery; immediate UI acknowledgement need not wait for a wind-up. Match the supplied art direction rather than applying universal glow, shake, white flashes, or particle counts.

Keep only useful controls, such as duration, scale, palette, intensity, seed, and direction. Use seeded variation for reproducible comparisons. Use elapsed time or the engine's simulation mechanism rather than adding a fixed amount per rendered frame. Distinguish screen pixels, logical units, world units, and capture resolution.

For integration, align presentation with the real trigger and coordinate space. Preserve gameplay rules, hit timing, server authority, physics, and input responsiveness. Cosmetic work must not silently introduce global hit-stop, change the simulation clock, or signal success while a request is pending. Use the project's explicit presentation clock if a pause effect is already authorized.

Handle replay, pause/resume, cancellation, owner destruction, scene exit, and pooled reuse as relevant. One-shots must finish or be disposed; loops must have intentional continuous boundaries. Effects must not block input unintentionally. Respect existing motion/intensity settings and retain meaningful cues when optional spectacle is reduced.

## Inspect and refine

Read [visual-validation.md](references/visual-validation.md) before judging rendered work.

First check silhouette, coverage, scale, timing, and layer placement. Then adjust curves, spacing, opacity, textures, color, and secondary motion. View the effect at its intended size against the real scene when available. Test light and dark backgrounds when transparency or broad reuse matters, without treating success there as proof for every scene.

Render and actually open generated captures. Inspect ordered frames for shape and continuity; use runtime playback or a playable recording to judge perceived motion. A contact sheet alone cannot establish real-time feel. If visual tools are unavailable, continue useful code/export checks and mark visual judgment unverified.

Use a single draft when direction is clear. Offer a small number of alternatives only when they resolve a real design choice. Do not impose a fixed number of revisions. After repeated non-improvement, inspect the reference, rendering conditions, timing, or tool limits instead of adding more spectacle. Re-render after the last change; otherwise label the final visual state unverified.

## Verify and deliver

Use the target project's normal checks for changed code. Verify repeat triggers and cleanup, and inspect overlapping effects in the relevant scene. Profile on the target or a disclosed test environment before claiming a frame-rate, memory, or performance improvement. A desktop preview cannot certify a phone or a different renderer.

For exported assets, reopen the PNG and metadata, check alpha, frame order, dimensions, pivot, timing, and the actual importer when available. Never claim a custom JSON file is directly compatible with an engine without checking its importer. Preserve source attribution and licenses for reused assets/code.

Deliver the editable source and requested runtime asset, with concise tuning/import instructions. For style-directed work, return the reference/brief used, relevant design decisions, and any unmet style or preservation conditions. Separate **created**, **visually inspected**, **motion checked**, **export checked**, and **integrated/tested in game**. Report actual evidence and outstanding conditions; an untested shader or a working standalone preview is not a completed game integration. No similarity score or checklist alone proves artistic quality or player preference.

Workflow inspiration: [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx). This package does not bundle pixelfx code, effects, or fonts.
