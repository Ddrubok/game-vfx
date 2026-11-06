extends SceneTree
var checks: Array = []
func check(label: String, value: bool) -> void:
    checks.append({"name": label, "pass": value})
func _initialize() -> void:
    call_deferred("run_checks")
func run_checks() -> void:
    var Effect = load("res://sheet_effect.gd")
    var effect = Effect.new()
    root.add_child(effect)
    for item: String in ["impact", "slash", "embers"]:
        check(item + " imported", effect.configure("res://assets/" + item + ".png", "res://assets/" + item + ".json"))
        var meta: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/" + item + ".json"))
        check(item + " duration and loop", effect.declared_duration == meta["durationSeconds"] and effect.is_loop == meta["loop"])
    effect.configure("res://assets/impact.png", "res://assets/impact.json")
    effect.start_effect()
    var original: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/impact.json"))
    var cases: Array = []
    for key: String in ["frames", "pivotPixels", "fps", "durationSeconds", "loop", "width"]:
        var missing := original.duplicate(true)
        missing.erase(key)
        cases.append(missing)
        var wrong := original.duplicate(true)
        wrong[key] = "invalid"
        cases.append(wrong)
    for pivot: Variant in [{"x": 1e300, "y": 64}, {"x": [], "y": 64}, {"y": 64}]:
        var bad := original.duplicate(true)
        bad["pivotPixels"] = pivot
        cases.append(bad)
    for entries: Variant in [[], [null], [{}], ["invalid"]]:
        var bad := original.duplicate(true)
        bad["frames"] = entries
        cases.append(bad)
    for key: String in ["durationMs", "width", "x"]:
        var bad := original.duplicate(true)
        bad["frames"][0][key] = 1e300
        cases.append(bad)
    var mismatch := original.duplicate(true)
    mismatch["durationSeconds"] = 0.9
    cases.append(mismatch)
    var numeric_string := original.duplicate(true)
    numeric_string["frames"][0]["durationMs"] = "50"
    cases.append(numeric_string)
    var old_frames = effect.sprite_frames
    var old_offset = effect.offset
    var old_duration = effect.declared_duration
    var old_loop = effect.is_loop
    for i: int in range(cases.size()):
        var f := FileAccess.open("user://heldout.json", FileAccess.WRITE)
        f.store_string(JSON.stringify(cases[i])); f.close()
        var result = effect.configure("res://assets/impact.png", "user://heldout.json")
        check("invalid rejected " + str(i), result == false)
        check("state preserved " + str(i), effect.sprite_frames == old_frames and effect.offset == old_offset and effect.declared_duration == old_duration and effect.is_loop == old_loop and effect.is_playing() and effect.visible)
    var f := FileAccess.open("res://heldout-results.json", FileAccess.WRITE)
    f.store_string(JSON.stringify(checks, "  ")); f.close()
    quit(0)
