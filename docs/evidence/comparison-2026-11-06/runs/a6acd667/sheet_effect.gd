extends AnimatedSprite2D

var declared_duration := 0.0
var is_loop := false

# pivotPixels is a finite point in each frame's local pixel coordinates, measured
# from its top-left corner. It must lie inside (or on the edge of) every frame.
# The point is placed at this node's origin by the negative sprite offset.
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
    if not _whole_positive(data["width"]) or not _whole_positive(data["height"]):
        return false
    if not _finite_number(data["fps"]) or float(data["fps"]) <= 0.0:
        return false
    if not _finite_number(data["durationSeconds"]) or float(data["durationSeconds"]) <= 0.0:
        return false
    if typeof(data["loop"]) != TYPE_BOOL or not data["pivotPixels"] is Dictionary or not data["frames"] is Array:
        return false

    var pivot: Dictionary = data["pivotPixels"]
    if not pivot.has("x") or not pivot.has("y"):
        return false
    if not _finite_number(pivot["x"]) or not _finite_number(pivot["y"]):
        return false
    var pivot_x := float(pivot["x"])
    var pivot_y := float(pivot["y"])
    if pivot_x < 0.0 or pivot_y < 0.0:
        return false

    var entries: Array = data["frames"]
    if entries.is_empty():
        return false
    var texture := load(png_path) as Texture2D
    if texture == null:
        return false
    var sheet_width := texture.get_width()
    var sheet_height := texture.get_height()
    if float(data["width"]) != float(sheet_width) or float(data["height"]) != float(sheet_height):
        return false

    var fps := float(data["fps"])
    var next_frames := SpriteFrames.new()
    next_frames.remove_animation(&"default")
    next_frames.add_animation(&"effect")
    next_frames.set_animation_speed(&"effect", fps)
    next_frames.set_animation_loop(&"effect", data["loop"])
    var total := 0.0
    for raw_entry: Variant in entries:
        if not raw_entry is Dictionary:
            return false
        var entry: Dictionary = raw_entry
        for key: String in ["x", "y", "width", "height", "durationMs"]:
            if not entry.has(key):
                return false
        if not _whole_nonnegative(entry["x"]) or not _whole_nonnegative(entry["y"]):
            return false
        if not _whole_positive(entry["width"]) or not _whole_positive(entry["height"]):
            return false
        if not _finite_number(entry["durationMs"]) or float(entry["durationMs"]) <= 0.0:
            return false
        var x := float(entry["x"])
        var y := float(entry["y"])
        var width := float(entry["width"])
        var height := float(entry["height"])
        if x >= sheet_width or y >= sheet_height or width > sheet_width - x or height > sheet_height - y:
            return false
        if pivot_x > width or pivot_y > height:
            return false
        var seconds := float(entry["durationMs"]) / 1000.0
        total += seconds
        var frame_weight := seconds * fps
        if not is_finite(total) or not is_finite(frame_weight) or frame_weight <= 0.0:
            return false
        var region := AtlasTexture.new()
        region.atlas = texture
        region.region = Rect2(x, y, width, height)
        next_frames.add_frame(&"effect", region, frame_weight)
    var next_duration := float(data["durationSeconds"])
    if abs(total - next_duration) > 0.000001:
        return false

    # Commit only after all input has passed validation.
    sprite_frames = next_frames
    centered = false
    offset = -Vector2(pivot_x, pivot_y)
    declared_duration = next_duration
    is_loop = data["loop"]
    speed_scale = 1.0
    if not animation_finished.is_connected(_on_finished):
        animation_finished.connect(_on_finished)
    return true

func _finite_number(value: Variant) -> bool:
    return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _whole_nonnegative(value: Variant) -> bool:
    return _finite_number(value) and float(value) >= 0.0 and floor(float(value)) == float(value)

func _whole_positive(value: Variant) -> bool:
    return _whole_nonnegative(value) and float(value) > 0.0

func start_effect() -> void:
    stop()
    show()
    play(&"effect")

func cancel_effect() -> void:
    stop()
    hide()

func _on_finished() -> void:
    hide()
