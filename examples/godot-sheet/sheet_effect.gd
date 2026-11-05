extends AnimatedSprite2D

var declared_duration := 0.0
var is_loop := false

func configure(png_path: String, json_path: String) -> bool:
    var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(json_path))
    if not parsed is Dictionary or parsed.get("format") != "game-vfx-sheet-v1":
        return false
    var data: Dictionary = parsed
    var texture := load(png_path) as Texture2D
    if texture == null:
        return false
    if texture.get_width() != int(data.get("width", 0)) or texture.get_height() != int(data.get("height", 0)):
        return false
    var fps := float(data.get("fps", 0))
    if not is_finite(fps) or fps <= 0:
        return false
    var entries: Array = data.get("frames", [])
    if entries.is_empty():
        return false
    var frames := SpriteFrames.new()
    frames.remove_animation(&"default")
    frames.add_animation(&"effect")
    frames.set_animation_speed(&"effect", fps)
    is_loop = bool(data.get("loop", false))
    frames.set_animation_loop(&"effect", is_loop)
    var total := 0.0
    for entry: Dictionary in entries:
        var rect := Rect2i(int(entry["x"]), int(entry["y"]), int(entry["width"]), int(entry["height"]))
        var seconds := float(entry["durationMs"]) / 1000.0
        if rect.size.x <= 0 or rect.size.y <= 0 or not Rect2i(Vector2i.ZERO, Vector2i(texture.get_size())).encloses(rect) or not is_finite(seconds) or seconds <= 0:
            return false
        var region := AtlasTexture.new()
        region.atlas = texture
        region.region = Rect2(rect)
        frames.add_frame(&"effect", region, seconds * fps)
        total += seconds
    declared_duration = float(data.get("durationSeconds", 0))
    if abs(total - declared_duration) > 0.000001:
        return false
    sprite_frames = frames
    centered = false
    var pivot: Dictionary = data["pivotPixels"]
    offset = -Vector2(float(pivot["x"]), float(pivot["y"]))
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
