# Engine selection and adapter boundaries

Read for import or in-game work, not for a standalone recolor. Identify the actual project before selecting an adapter: `project.godot` plus the installed Godot version; Unity `ProjectSettings/ProjectVersion.txt` and package/render-pipeline assets; Unreal `.uproject` and its selected engine; Web `package.json` plus renderer imports; Flutter `pubspec.yaml` plus its rendering code. A filename is a clue, not proof of which executable/version ran. Multiple clients may use different renderers.

Keep the existing event authority and add a presentation boundary: accepted event → owned effect → update/correct → finish/cancel → owner teardown. Map coordinate space, clock, reduced motion, blend/depth, resource ownership and completion into that engine's real APIs. The optional [event template](../assets/event-impact.mjs) and repository `examples/event-replay/` implement only a trusted local Web example. Do not port its sample event schema into a server protocol.

## Web 2D and 3D

Use [canvas-impact.html](../assets/canvas-impact.html) for a small 2D source/export example. In an existing game call its analytic `drawImpact` from the presentation clock, within the correct owner transform, then clear/remove at completion. The replay example binds that renderer to event lifetimes; its README lists commands. Source-over is intentional in this example. Additive scene lighting would need an explicit material/compositing choice and fresh light/dark checks; a glow PNG cannot promise it.

For WebGL2, the optional repository example is [shockwave-3d](https://github.com/Ddrubok/game-vfx/tree/main/examples/shockwave-3d), with editable source, build and browser-check commands. It is not bundled into every installed runtime folder. Reuse the project's engine/version; the offline demonstration does not establish compatibility with another Three.js version or an in-game event connection. It remains one shockwave, not a catalog of art styles.

## Godot 4 sheet adapter (reference snippet; NOT RUN)

The exported JSON is custom, not a native Godot resource. After importing the PNG, attach an `AnimatedSprite2D` to the intended presentation owner. For the sample's center pivot, create atlas regions and respect **duration**, not the frame's sample time:

```gdscript
# Reference for Godot 4.4 APIs, not an engine-tested integration.
func configure_sheet(sprite: AnimatedSprite2D, texture: Texture2D, data: Dictionary) -> void:
    assert(data["format"] == "game-vfx-sheet-v1")
    var frames := SpriteFrames.new()
    frames.remove_animation(&"default")
    frames.add_animation(&"impact")
    frames.set_animation_loop(&"impact", false)
    frames.set_animation_speed(&"impact", 1.0)
    for item in data["frames"]:
        var region := AtlasTexture.new()
        region.atlas = texture
        region.region = Rect2(item["x"], item["y"], item["width"], item["height"])
        frames.add_frame(&"impact", region, float(item["durationMs"]) / 1000.0)
    sprite.sprite_frames = frames
    sprite.centered = true # This sample has a center pivot; adapt other pivots.
    sprite.speed_scale = 1.0
    sprite.animation_finished.connect(sprite.hide, CONNECT_ONE_SHOT)
    sprite.show()
    sprite.play(&"impact")
```

With animation speed 1 frame/s, each frame's relative duration above equals its seconds. Connect cleanup once per new playback; for pooled reuse disconnect obsolete callbacks and validate generation/owner. This snippet assumes a valid sample export; a production importer also validates dimensions, bounds, pivot, durations and resource availability. Do not count `frame_changed` on entry to the final frame as full completion; the final frame still has a duration. These APIs are documented in [SpriteFrames](https://docs.godotengine.org/en/4.4/classes/class_spriteframes.html) and [AnimatedSprite2D](https://docs.godotengine.org/en/4.4/classes/class_animatedsprite2d.html). Check the installed version before use.

If Godot is already available, record `godot --version`, then use `godot --headless --path "project" --editor --import` for import/parsing and `godot --path "project"` for actual playback. Headless import is not a viewed render. Record start time, frame durations, speed scales, pause policy and the actual finish signal when diagnosing timing. A user-reported 0.75 s finish versus 0.8 s metadata remains unexplained until reproduced; do not silently change metadata to match it.

## Memory and native recreation

The sample atlas is 2560 × 2048. Uncompressed RGBA8 pixels require 20 MiB; a full mip chain is approximately 26.7 MiB (28.0 MB), excluding engine overhead. This arithmetic is a possible explanation for a reported 28 MB texture, **not a measurement or a confirmed diagnosis**. Inspect actual format, mipmaps, compression, duplicated resources and target size. PNG download size does not equal GPU memory. Godot's [image import settings](https://docs.godotengine.org/en/4.4/tutorials/assets_pipeline/importing_images.html) describe these tradeoffs; do not disable mipmaps universally or reduce resolution without comparing the target view.

The Canvas sparks are line segments with length, width and direction. A native emitter using point sprites may preserve count while losing that silhouette. Compare particle geometry/trail or quad orientation, length over life, blend and coordinate scale against ordered source frames. This is an inspection path, not a confirmed explanation of an unseen engine project. Unity/Unreal native implementations require their actual renderer/editor setup; no engine sample or successful execution is claimed here.
