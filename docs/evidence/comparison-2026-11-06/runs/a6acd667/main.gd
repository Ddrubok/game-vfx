extends Node2D

const SheetEffect = preload("res://sheet_effect.gd")
var checks: Array[String] = []
var failures: Array[String] = []
var timings: Dictionary = {}
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
    # Do not charge asset/startup time to the first animation frame.
    await get_tree().process_frame
    if DisplayServer.get_name() != "headless":
        await RenderingServer.frame_post_draw
    for i: int in range(effects.size()):
        var name: String = names[i]
        var started := Time.get_ticks_usec()
        effects[i].animation_finished.connect(func(): timings[name] = float(Time.get_ticks_usec() - started) / 1000000.0)
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
        check(name + ": finish signal near declared duration", elapsed > 0 and abs(elapsed - effects[i].declared_duration) < 0.10)
        check(name + ": one-shot hidden on completion", not effects[i].visible)
    check("loop is playing and has no one-shot completion", ember.is_playing() and ember.visible and not timings.has("embers"))
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
        "one_shot_elapsed_seconds": timings, "passed": failures.is_empty(),
        "scope": "Native sheet decoding, SpriteFrames playback and owner lifecycle. Synthetic local scene; not a shipped game, device performance or agent comparison."}
    var file := FileAccess.open(destination.path_join("results.json"), FileAccess.WRITE)
    file.store_string(JSON.stringify(report, "  ") + "\n")
    print(JSON.stringify(report))
    get_tree().quit(0 if failures.is_empty() else 1)
