extends AnimatedSprite2D

var declared_duration := 0.0
var is_loop := false

# pivotPixels is measured from each untrimmed frame's top-left corner, in pixels.
# All frames have the same size. A pivot on an edge (0 or size) is valid.
func _number(value: Variant) -> bool:
    return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _integer(value: Variant) -> bool:
    return _number(value) and float(value) == floor(float(value))

func configure(png_path: String, json_path: String) -> bool:
    if not FileAccess.file_exists(json_path):
        return false
    var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(json_path))
    if not parsed is Dictionary:
        return false
    var data: Dictionary = parsed
    if data.get("format") != "game-vfx-sheet-v1":
        return false
    for key: String in ["width", "height", "fps", "durationSeconds", "loop", "pivotPixels", "frames"]:
        if not data.has(key):
            return false
    if not _integer(data.width) or not _integer(data.height):
        return false
    if float(data.width) < 1.0 or float(data.width) > 16384.0 or float(data.height) < 1.0 or float(data.height) > 16384.0:
        return false
    var sheet_width := int(data.width)
    var sheet_height := int(data.height)
    if not _number(data.fps) or not _number(data.durationSeconds):
        return false
    var fps := float(data.fps)
    var duration := float(data.durationSeconds)
    if fps < 0.001 or fps > 1000.0 or duration < 0.001 or duration > 3600.0:
        return false
    if typeof(data.loop) != TYPE_BOOL or not data.pivotPixels is Dictionary or not data.frames is Array:
        return false
    var pivot: Dictionary = data.pivotPixels
    if not pivot.has("x") or not pivot.has("y") or not _number(pivot.x) or not _number(pivot.y):
        return false
    var entries: Array = data.frames
    if entries.is_empty() or entries.size() > 4096:
        return false

    var frame_width := -1
    var frame_height := -1
    var total := 0.0
    var regions: Array[Rect2i] = []
    var weights: Array[float] = []
    for item: Variant in entries:
        if not item is Dictionary:
            return false
        var entry: Dictionary = item
        for key: String in ["x", "y", "width", "height", "durationMs"]:
            if not entry.has(key):
                return false
        if not _integer(entry.x) or not _integer(entry.y) or not _integer(entry.width) or not _integer(entry.height) or not _number(entry.durationMs):
            return false
        if float(entry.x) < 0.0 or float(entry.y) < 0.0 or float(entry.width) < 1.0 or float(entry.height) < 1.0:
            return false
        if float(entry.x) > sheet_width or float(entry.y) > sheet_height or float(entry.width) > sheet_width or float(entry.height) > sheet_height:
            return false
        var x := int(entry.x)
        var y := int(entry.y)
        var w := int(entry.width)
        var h := int(entry.height)
        if x < 0 or y < 0 or w < 1 or h < 1 or w > sheet_width or h > sheet_height:
            return false
        if x > sheet_width - w or y > sheet_height - h:
            return false
        if frame_width == -1:
            frame_width = w
            frame_height = h
        elif w != frame_width or h != frame_height:
            return false
        var seconds := float(entry.durationMs) / 1000.0
        if not is_finite(seconds) or seconds <= 0.0 or seconds > 3600.0:
            return false
        total += seconds
        if not is_finite(total) or total > 3600.0:
            return false
        regions.append(Rect2i(x, y, w, h))
        weights.append(seconds * fps)
    if abs(total - duration) > 0.000001:
        return false
    var pivot_x := float(pivot.x)
    var pivot_y := float(pivot.y)
    if pivot_x < 0.0 or pivot_x > frame_width or pivot_y < 0.0 or pivot_y > frame_height:
        return false

    var texture := load(png_path) as Texture2D
    if texture == null or texture.get_width() != sheet_width or texture.get_height() != sheet_height:
        return false
    var frames := SpriteFrames.new()
    frames.remove_animation(&"default")
    frames.add_animation(&"effect")
    frames.set_animation_speed(&"effect", fps)
    frames.set_animation_loop(&"effect", data.loop)
    for i: int in range(regions.size()):
        var region := AtlasTexture.new()
        region.atlas = texture
        region.region = Rect2(regions[i])
        frames.add_frame(&"effect", region, weights[i])

    # Commit only after the full JSON and texture have passed validation.
    sprite_frames = frames
    centered = false
    offset = -Vector2(pivot_x, pivot_y)
    declared_duration = duration
    is_loop = data.loop
    speed_scale = 1.0
    if not animation_finished.is_connected(_on_finished):
        animation_finished.connect(_on_finished)
    return true

func start_effect() -> void:
    stop()
    show()
    play(&"effect")

func cancel_effect() -> void:
    stop()
    hide()

func _on_finished() -> void:
    hide()
