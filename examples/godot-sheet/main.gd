extends Node2D

const SheetEffect = preload("res://sheet_effect.gd")
var checks: Array[String] = []
var failures: Array[String] = []
var timings: Dictionary = {}
var timing_samples: Array = []
var destination := "user://verification"
var interactive := false

func check(label: String, condition: bool) -> void:
    checks.append(label)
    if not condition:
        failures.append(label)

func _ready() -> void:
    for arg: String in OS.get_cmdline_user_args():
        if arg.begins_with("--output="):
            destination = arg.trim_prefix("--output=")
        if arg == "--interactive":
            interactive = true
    DirAccess.make_dir_recursive_absolute(destination)
    var effects: Array = []
    var names := ["impact", "slash", "embers"]
    var title := Label.new()
    title.text = "Canvas sheets in Godot: impact / slash / looping embers"
    title.position = Vector2(24, 24)
    add_child(title)
    for i: int in range(names.size()):
        var effect := SheetEffect.new()
        add_child(effect)
        var name: String = names[i]
        var valid: bool = effect.configure("res://assets/" + name + ".png", "res://assets/" + name + ".json")
        check(name + ": image/JSON imported", valid)
        if not valid:
            finish()
            return
        effect.position = Vector2(150 + i * 270, 250)
        effect.scale = Vector2(2, 2)
        var caption := Label.new()
        caption.text = name + " / " + str(effect.declared_duration) + " s"
        caption.position = Vector2(80 + i * 270, 400)
        add_child(caption)
        effect.hide()
        effects.append(effect)
        check(name + ": first frame exists", effect.sprite_frames.get_frame_texture(&"effect", 0) != null)
    check_import_failures(effects[0])
    # Do not charge asset/startup time to the first animation frame.
    await get_tree().process_frame
    if DisplayServer.get_name() != "headless":
        await RenderingServer.frame_post_draw
    for i: int in range(effects.size()):
        var name: String = names[i]
        var started := Time.get_ticks_usec()
        effects[i].animation_finished.connect(func(): timings[name] = float(Time.get_ticks_usec() - started) / 1000000.0, CONNECT_ONE_SHOT)
        effects[i].start_effect()
    if interactive:
        return
    await get_tree().create_timer(0.15).timeout
    if DisplayServer.get_name() != "headless":
        await RenderingServer.frame_post_draw
        var capture := get_viewport().get_texture().get_image()
        check("rendered capture saved", capture.save_png(destination.path_join("godot-effects.png")) == OK)
    else:
        check("headless run identified as nonvisual", true)
    var ember: AnimatedSprite2D = effects[2]
    ember.pause()
    var paused_frame := ember.frame
    var paused_progress := ember.frame_progress
    await get_tree().create_timer(0.15).timeout
    check("pause freezes frame and progress", ember.frame == paused_frame and ember.frame_progress == paused_progress)
    ember.play()
    await get_tree().create_timer(0.75).timeout
    for i: int in [0, 1]:
        var name: String = names[i]
        var elapsed := float(timings.get(name, -1))
        check(name + ": finish signal observed", elapsed > 0)
        check(name + ": one-shot hidden on completion", not effects[i].visible)
    check("loop is playing and has no one-shot completion", ember.is_playing() and ember.visible and not timings.has("embers"))
    for i: int in [0, 1]:
        await measure_timing(effects[i], names[i])
    effects[0].start_effect()
    await get_tree().process_frame
    check("replay restarts completed effect", effects[0].visible and effects[0].is_playing())
    effects[0].cancel_effect()
    check("cancel stops and hides owned effect", not effects[0].visible and not effects[0].is_playing())
    effects[1].queue_free()
    await get_tree().process_frame
    check("owner removal leaves loop alive", not is_instance_valid(effects[1]) and is_instance_valid(ember) and ember.is_playing())
    finish()

func finish() -> void:
    var report := {"engine": Engine.get_version_info()["string"], "display_driver": DisplayServer.get_name(),
        "renderer": RenderingServer.get_current_rendering_method(), "checks": checks, "failures": failures,
        "one_shot_elapsed_seconds": timings, "warmed_timing_samples": timing_samples, "passed": failures.is_empty(),
        "scope": "Native sheet decoding, SpriteFrames playback and owner lifecycle. Synthetic local scene; not a shipped game, device performance or agent comparison."}
    var file := FileAccess.open(destination.path_join("results.json"), FileAccess.WRITE)
    file.store_string(JSON.stringify(report, "  ") + "\n")
    print(JSON.stringify(report))
    get_tree().quit(0 if failures.is_empty() else 1)

func check_import_failures(effect: AnimatedSprite2D) -> void:
    var original: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/impact.json"))
    var cases: Array = []
    for key: String in ["frames", "pivotPixels", "fps", "durationSeconds", "loop", "width"]:
        var missing := original.duplicate(true)
        missing.erase(key)
        cases.append(missing)
        var wrong := original.duplicate(true)
        wrong[key] = "wrong type"
        cases.append(wrong)
    for pivot: Variant in [{"x": 1e300, "y": 64}, {"x": -1, "y": 64}, {"x": 129, "y": 64}, {"y": 64}, {"x": [], "y": 64}]:
        var bad := original.duplicate(true)
        bad["pivotPixels"] = pivot
        cases.append(bad)
    for frames: Variant in [[], [null], [{}], ["invalid"]]:
        var bad := original.duplicate(true)
        bad["frames"] = frames
        cases.append(bad)
    for field: String in ["x", "width", "durationMs"]:
        var bad := original.duplicate(true)
        bad["frames"][0][field] = 1e300
        cases.append(bad)
    effect.start_effect()
    var old_frames = effect.sprite_frames
    var old_offset = effect.offset
    var old_duration = effect.declared_duration
    var old_loop = effect.is_loop
    for i: int in range(cases.size()):
        var file := FileAccess.open("user://invalid-sheet.json", FileAccess.WRITE)
        file.store_string(JSON.stringify(cases[i]))
        file.close()
        check("invalid metadata rejected " + str(i), not effect.configure("res://assets/impact.png", "user://invalid-sheet.json"))
        check("failed configure preserves playback " + str(i), effect.sprite_frames == old_frames and effect.offset == old_offset and effect.declared_duration == old_duration and effect.is_loop == old_loop and effect.is_playing() and effect.visible)
    effect.cancel_effect()

func measure_timing(effect: AnimatedSprite2D, label: String) -> void:
    var metadata_total := 0.0
    for i: int in range(effect.sprite_frames.get_frame_count(&"effect")):
        metadata_total += effect.sprite_frames.get_frame_duration(&"effect", i) / effect.sprite_frames.get_animation_speed(&"effect")
    check(label + ": metadata duration sum", abs(metadata_total - effect.declared_duration) < 0.000001)
    for trial: int in range(3):
        for warmup: int in range(8):
            await get_tree().process_frame
        var started := Time.get_ticks_usec()
        var previous := started
        var max_interval := 0.0
        var visited: Array = [0]
        effect.start_effect()
        while effect.is_playing() and float(Time.get_ticks_usec() - started) / 1000000.0 < 2.0:
            await get_tree().process_frame
            var now := Time.get_ticks_usec()
            max_interval = max(max_interval, float(now - previous) / 1000000.0)
            previous = now
            if not visited.has(effect.frame):
                visited.append(effect.frame)
        var elapsed := float(Time.get_ticks_usec() - started) / 1000000.0
        # Two observed scheduling boundaries, capped by the explicit 25 ms frame budget.
        var tolerance := 2.0 * max_interval + 0.002
        var sample := {"effect": label, "trial": trial, "declared": effect.declared_duration, "elapsed": elapsed, "max_frame_interval": max_interval, "tolerance": tolerance, "visited_frames": visited}
        timing_samples.append(sample)
        check(label + ": stable frame budget " + str(trial), max_interval <= 0.025)
        check(label + ": warmed completion " + str(trial), not effect.is_playing() and abs(elapsed - effect.declared_duration) <= tolerance)
        check(label + ": ordered frame progression " + str(trial), visited == range(effect.sprite_frames.get_frame_count(&"effect")))
