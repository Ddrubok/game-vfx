# Implementation and export

Read the route relevant to the task. These are selection guidelines, not claims that each engine has been tested by this skill.

## Match the project's renderer

| Environment | Start with | Check before claiming integration |
| --- | --- | --- |
| Web 2D | Existing Canvas/SVG/particle system; the bundled HTML for an isolated prototype | Logical canvas size versus backing resolution, device scaling, input routing, cleanup, compositing |
| Web 3D | Existing scene engine, particles, materials, ribbons or meshes | Engine version, shader language, coordinate space, depth, transparency order, color management |
| Flutter / Flame | Existing Canvas/CustomPainter or Flame components, particles, or sprite animation | Installed APIs, repaint/update ownership, logical size, asset declarations, disposal, actual device behavior |
| Unity | Existing particle/trail systems and materials; VFX Graph only where the project's pipeline supports it | Editor and package versions, render pipeline, sorting/depth, serialized references, build/device support |
| Godot | Project's 2D/3D particles, shaders, animation resources | Engine version, rendering backend, texture import, bounds/culling, resource paths, signal/lifetime ownership |
| Unreal | Existing Niagara/material systems and editor workflows | Project version, assets/modules, local/world simulation, attachment, culling, scalability, target platform |

Do not install a new stack merely because it appears in this table. Existing native resources are preferable when they meet the request. Avoid editing opaque/binary assets as text. If editor work cannot be applied, give the known target, properties, intended result, and verification steps as an unapplied specification.

For an unfamiliar API or pipeline, inspect the installed version and primary documentation. Do not substitute guessed method names or serialize an editor asset without understanding its format.

## Choose geometry and behavior

- **Smooth 2D/vector:** rings, arcs, ribbons, silhouettes, gradients and masks. Keep scale and edge behavior appropriate for the reference.
- **Particles:** sparks, dust, smoke or debris whose lifetimes and trajectories matter. Use appropriate spawn rate, bounds and cleanup; pooling is conditional on observed need or existing infrastructure.
- **Shader/material:** distortion, dissolve, flow or surface animation that depends on the scene. Check available textures, color space, blend/depth state, and render pipeline. A shader source file is not evidence it compiled or rendered.
- **3D geometry/volume:** use actual world-space assets, attachment, depth and lighting. A flat preview does not validate these.
- **Baked frames:** useful for fixed-view effects. Costs include texture memory and limited runtime lighting/recoloring; choose dimensions and frame count from intended screen coverage and motion rather than a universal preset.

Keep simulation reproducible for inspection: fixed seeds and recorded time samples. Use the engine's fixed-step or elapsed-time update where applicable. Seeking an evolving simulation requires replay/reset or an analytic time function; changing only a time variable may not reproduce it.

Do not replace authoritative collision, damage, success or reward events with visual timing. A visual impact may be scheduled from an actual hit event; the artwork must not create a hit by itself.

## Bundled 2D example

Copy `assets/canvas-impact.html` from this skill into a task-owned output directory, then open that copy in a browser. No package installation or external network resource is needed. `drawImpact(context, timeSeconds, options)` is the editable effect; the rest is a small preview/export UI.

The same editable page contains three distinct shape/motion examples: a radial impact, tapered directional slash, and a looping field of rising embers. These are sample briefs, not universal genre presets. Reduced-motion embers are static. Recoloring remains possible but is not the only variation.

The logical drawing canvas stays 512 ? 512. Output size is selectable at 64/128/256/512 pixels; frame count at 4?60; duration at 0.1?5 seconds. FPS is frame count divided by duration. The default remains a 512px, 20-frame, 0.8-second impact. Limits bound this demonstration's atlas allocation, not other projects' quality budgets. The displayed RGBA8 byte estimate is pixel arithmetic without mipmaps or engine overhead, not measured GPU usage. Choose actual size from target coverage and inspect it there.

The background is CSS and excluded from PNGs. All three examples use source-over alpha, not scene-aware additive/HDR lighting. `makeSheet()` packs interval-midpoint samples and returns a custom metadata object. PNG and JSON save separately; save both using identical settings. Input validation rejects invalid allocation/timing values. A one-shot becomes empty at its endpoint; the ember loop wraps without inserting a duplicate endpoint.

The JSON is `game-vfx-sheet-v1`, **not Aseprite JSON**. It records row-major rectangles, playback `timeSeconds`, visual `sampleTimeSeconds`, frame duration, total duration, actual center pivot in output pixels, loop flag, blend and options. Importers play the saved frames for their durations; sample times are not playback delays. Different shapes may become fully transparent during their final fade. The separate repository Canvas checkers exercise default and parameterized outputs; the optional Godot sheet project exercises native playback. Read [engine-adapters.md](engine-adapters.md) only for an import task.

## Export without losing meaning

For an exported sequence/sheet, record the information needed to reproduce it:

- Frame dimensions, count, order, frame duration or fps, and whether it loops.
- Logical scale, coordinate origin/pivot, padding or trimming, and whether frames share the same pivot.
- Palette/seed/options used; direction and attachment information when relevant.
- Alpha and blend assumptions, texture filtering, and any separate light/mask passes.

For fixed-rate export, choose frame count and fps that represent the intended duration. Record playback time separately from the visual sampling time. This example samples each interval at `(i + 0.5) / fps` so its first exported frame is visible, while playback still starts at `i / fps` and holds each frame for `1 / fps`. Do not repeat the loop's starting frame as an extra endpoint. If durations vary, store them explicitly and use an importer that honors them. A one-shot may become empty after its last displayed frame; document disposal rather than adding an unintended pause.

Inspect exported frames on light/dark backdrops and reopen the exact saved file. Distinguish straight and premultiplied alpha in the rendering/import pipeline to diagnose halos; do not claim a PNG alone specifies how the engine will blend it. A glow baked into ordinary alpha does not reproduce additive light on every background. Separate passes or native materials may be necessary.

Check texture padding/bleeding, atlas bounds, filtering, pivot stability and clipping. Add padding/extrusion only as needed by the target importer and scale. Preserve the intended smooth edges; nearest-neighbor filtering is not a universal default outside pixel art.

PNG sequences/sheets are a practical fallback for transparency. Do not promise that GIF or an arbitrary MP4 supports full alpha. If a video is requested, verify the actual encoder, container, alpha support and playback path; retain transparent source frames where needed.

Where import tools are available, test the exported output in the target engine. Otherwise deliver it as **export checked; target import unverified**, with concrete next steps. Do not treat a browser preview as proof of Unity, Flutter, Godot or Unreal compatibility.

Technical references when needed: [Canvas compositing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation), [Canvas PNG export](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).
