# Engine selection and adapter boundaries

Read for import or in-game work, not for a standalone recolor. Identify the actual project before selecting an adapter: `project.godot` plus the installed Godot version; Unity `ProjectSettings/ProjectVersion.txt` and package/render-pipeline assets; Unreal `.uproject` and its selected engine; Web `package.json` plus renderer imports; Flutter `pubspec.yaml` plus its rendering code. A filename is a clue, not proof of which executable/version ran. Multiple clients may use different renderers.

Keep the existing event authority and add a presentation boundary: accepted event → owned effect → update/correct → finish/cancel → owner teardown. Map coordinate space, clock, reduced motion, blend/depth, resource ownership and completion into that engine's real APIs. The optional [event template](../assets/event-impact.mjs) and repository `examples/event-replay/` implement only a trusted local Web example. Do not port its sample event schema into a server protocol.

## Web 2D and 3D

Use [canvas-impact.html](../assets/canvas-impact.html) for a small 2D source/export example. In an existing game call its analytic `drawImpact` from the presentation clock, within the correct owner transform, then clear/remove at completion. The replay example binds that renderer to event lifetimes; its README lists commands. Source-over is intentional in this example. Additive scene lighting would need an explicit material/compositing choice and fresh light/dark checks; a glow PNG cannot promise it.

For WebGL2, the optional repository example is [shockwave-3d](https://github.com/Ddrubok/game-vfx/tree/main/examples/shockwave-3d), with editable source, build and browser-check commands. It is not bundled into every installed runtime folder. Reuse the project's engine/version; the offline demonstration does not establish compatibility with another Three.js version or an in-game event connection. It remains one shockwave, not a catalog of art styles.

## Godot 4 sheet adapter

The optional repository [Godot project](https://github.com/Ddrubok/game-vfx/tree/main/examples/godot-sheet) supplies an actual importer and a native test scene for all three exported styles. It uses imported `Texture2D` resources and atlas rectangles, maps `durationMs` to SpriteFrames' relative duration at the stated FPS, applies the pivot, respects loop flags, and handles finish/replay/cancel/owner removal. This remains a synthetic native scene, not a shipped-game or Android/iOS certification. Keep JSON files in export include filters; packaged game exports require their own test.

Record the installed version with `godot --version`; import with `godot --headless --path "project" --editor --import --quit`, then run `godot --path "project"`. The project README lists automated evidence commands. Headless import does not inspect rendered appearance. The verified native sample is Godot 4.4.1, Windows, GL Compatibility; Unity/Unreal execution is still unverified.

Record animation FPS, per-frame durations, speed scale, start phase and actual finish signal when diagnosing timing. Starting during initial scene loading can charge a previous frame's delta to the first animation step; warm the render before measuring, and disclose frame-boundary uncertainty and observed wall time. Do not silently shorten metadata to fit a timer observation. The earlier user's 0.75 s versus 0.8 s observation has no captured project here and remains an unconfirmed diagnosis.

For version-specific details use [SpriteFrames](https://docs.godotengine.org/en/4.4/classes/class_spriteframes.html) and [AnimatedSprite2D](https://docs.godotengine.org/en/4.4/classes/class_animatedsprite2d.html). Animation completion differs from entering the last frame; retain its duration. Do not let an old owner's callback hide a pooled replacement. The local event template shows the lifetime boundary separately from the engine adapter.

## Memory and native recreation

The sample atlas is 2560 × 2048. Uncompressed RGBA8 pixels require 20 MiB; a full mip chain is approximately 26.7 MiB (28.0 MB), excluding engine overhead. This arithmetic is a possible explanation for a reported 28 MB texture, **not a measurement or a confirmed diagnosis**. Inspect actual format, mipmaps, compression, duplicated resources and target size. PNG download size does not equal GPU memory. Godot's [image import settings](https://docs.godotengine.org/en/4.4/tutorials/assets_pipeline/importing_images.html) describe these tradeoffs; do not disable mipmaps universally or reduce resolution without comparing the target view.

The Canvas sparks are line segments with length, width and direction. A native emitter using point sprites may preserve count while losing that silhouette. Compare particle geometry/trail or quad orientation, length over life, blend and coordinate scale against ordered source frames. This is an inspection path, not a confirmed explanation of an unseen engine project. Unity/Unreal native implementations require their actual renderer/editor setup; no engine sample or successful execution is claimed here.
