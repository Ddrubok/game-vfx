# Canvas export checks

[English](README.md) | [한국어](README.ko.md)

This portable maintainer script checks the shipped HTML, actual downloaded PNG/JSON, all packed frames, alpha, deterministic sampling, playback and narrow layout. It writes captures and `validation.json` to the chosen output directory. It is not required to use the skill and does not assess artistic preference or an engine import.

From the repository root:

```sh
node examples/canvas-verification/verify.mjs /path/to/output
```

Use an existing Playwright installation. If it is outside normal Node resolution, set `VFX_TOOL_ROOT` to the parent of its `node_modules`; optionally set `VFX_BROWSER_PATH` to an installed Chromium executable. Without that override Playwright uses its installed browser. `VFX_INPUT` optionally selects another local HTML with the same example API for regression diagnosis. No private Orca path is required. The recorded run used Node 22, Playwright 1.62.1 and Chrome 156; other versions have not all been tested.

## Configurable styles

```sh
node examples/canvas-verification/variants.mjs /path/to/variant-output
```

The additional checker uses the same installed tools, changes the real export controls, and checks three 128 px variants. Packed alpha must match exactly; premultiplied RGB may differ by at most one 8-bit unit after browser PNG roundtrips. This is not raw RGB byte equality. The default 512 px checker retains its stricter pixel-for-pixel requirement. Parameter validation, visible first frames, loop continuity and reduced motion are separate checks. See the [current record](../../docs/practical-validation-2026-11-05.md).
