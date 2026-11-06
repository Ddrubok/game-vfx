# Unity VFX experiment

Actual Unity Editor Play Mode tests of the bundled impact/slash/embers PNG sheets plus a native Particle System burst. Built-in renderer, Direct3D11, Windows. Tested with installed Unity 6000.4.0f1 and 6000.5.7f1; the saved project version is 6000.5.7f1. No external packages or test framework are required.

Use an installed, licensed editor (replace absolute paths):

```text
Unity.exe -batchmode -force-d3d11 -projectPath <absolute-project-folder> -executeMethod VfxExperiment.Run -vfxOutput <absolute-output-folder> -logFile <absolute-log-file>
```

Do not use `-nographics`: the experiment renders real GPU frames. Do not add `-quit`: the Play Mode runner exits after finishing and returns nonzero if a check fails or an error is logged. `VfxExperiment.Run` creates/replaces this example's Experiment scene and sets the sample texture import options. Use this isolated example project, not an unrelated game project.

The trusted-sheet adapter creates SpriteRenderer frames from the custom JSON. It maps top-left atlas coordinates/pivot to Unity's bottom-left texture origin, respects frame durations, and implements restart/pause/cancel/owner cleanup. `TextureImporterNPOTScale.None` preserves the 512x384 sheet; default NPOT scaling otherwise invalidates its rectangles. This is not a general hostile-input importer or a production event/network adapter.

Checks cover original texture dimensions/pivot/timing, two completed loop periods, pause/resume, light/dark rendering, cleanup, 24 overlapping instances, and native particles (12-particle burst, expiry, 64-particle budget and cancellation). Timing uses three warmed trials per one-shot, with tolerance of twice the trial's observed maximum frame interval plus 5 ms, and a separate 50 ms frame-interval ceiling. PNG capture work is excluded from the timing trials. `maxFrameSeconds` is a broader diagnostic that can include later capture work, not a performance benchmark.

Both tested versions passed 32 functional checks but logged a UnityEditor.Search startup exception, so both overall reports intentionally say `passed: false`. See the [report](../../docs/unity-experiment-2026-11-06.md). Do not describe these runs as error-free engine certification. Output logs/captures and caches are ignored; selected evidence is retained under docs/evidence.
