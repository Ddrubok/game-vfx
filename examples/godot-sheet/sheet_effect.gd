extends AnimatedSprite2D

var declared_duration := 0.0
var is_loop := false

func number_in(value: Variant, low: float, high: float) -> bool:
    return (value is float or value is int) and is_finite(float(value)) and value >= low and value <= high

func integer_in(value: Variant, low: int, high: int) -> bool:
    return number_in(value, low, high) and float(value) == floor(float(value))

func configure(png_path: String, json_path: String) -> bool:
    var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(json_path))
    if not parsed is Dictionary or parsed.get("format") != "game-vfx-sheet-v1":
        return false
    var data: Dictionary = parsed
    if not integer_in(data.get("width"), 1, 16384) or not integer_in(data.get("height"), 1, 16384):
        return false
    if not number_in(data.get("fps"), 0.001, 1000) or not number_in(data.get("durationSeconds"), 0.001, 3600):
        return false
    if not data.get("loop") is bool or not data.get("frames") is Array or not data.get("pivotPixels") is Dictionary:
        return false
    var entries: Array = data["frames"]
    var pivot: Dictionary = data["pivotPixels"]
    if entries.is_empty() or entries.size() > 4096:
        return false
    # This adapter accepts an untrimmed pivot inside every frame, including edges.
    if not number_in(pivot.get("x"), 0, 16384) or not number_in(pivot.get("y"), 0, 16384):
        return false
    var next_offset := -Vector2(float(pivot["x"]), float(pivot["y"]))
    if not next_offset.is_finite():
        return false
    var texture := load(png_path) as Texture2D
    if texture == null or texture.get_width() != int(data["width"]) or texture.get_height() != int(data["height"]):
        return false
    var fps := float(data["fps"])
    var next_duration := float(data["durationSeconds"])
    var frames := SpriteFrames.new()
    frames.remove_animation(&"default")
    frames.add_animation(&"effect")
    frames.set_animation_speed(&"effect", fps)
    frames.set_animation_loop(&"effect", data["loop"])
    var total := 0.0
    for entry: Variant in entries:
        if not entry is Dictionary:
            return false
        for key: String in ["x", "y", "width", "height"]:
            if not integer_in(entry.get(key), 0 if key in ["x", "y"] else 1, 16384):
                return false
        if not number_in(entry.get("durationMs"), 0.001, 3600000):
            return false
        var rect := Rect2i(int(entry["x"]), int(entry["y"]), int(entry["width"]), int(entry["height"]))
        var seconds := float(entry["durationMs"]) / 1000.0
        var relative_duration := seconds * fps
        if not Rect2i(Vector2i.ZERO, Vector2i(texture.get_size())).encloses(rect) or pivot["x"] > rect.size.x or pivot["y"] > rect.size.y:
            return false
        if not is_finite(relative_duration) or relative_duration <= 0:
            return false
        var region := AtlasTexture.new()
        region.atlas = texture
        region.region = Rect2(rect)
        frames.add_frame(&"effect", region, relative_duration)
        total += seconds
    if not is_finite(total) or abs(total - next_duration) > 0.000001:
        return false
    # Commit only after every check; a rejected reconfiguration preserves live playback.
    sprite_frames = frames
    is_loop = data["loop"]
    declared_duration = next_duration
    centered = false
    offset = next_offset
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
