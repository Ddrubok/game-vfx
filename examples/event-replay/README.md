# Event lifetime replay

[English](README.md) | [한국어](README.ko.md)

This example connects the existing Canvas effect to a local trusted-event adapter. It covers pending/confirmed color, an active correction, duplicates, a finished effect, owner disposal and round changes. It has no server, collision, damage, audio or real network validation. The sample policy closes an expired or rejected one-shot even if a higher revision arrives; adapt that policy to an actual protocol, rather than inventing one for a game.

From the repository root:

```sh
node --test examples/event-replay/events.test.mjs
node examples/event-replay/server.mjs
```

Open `http://127.0.0.1:8000/examples/event-replay/index.html`. This Node server uses the same allowlist and real-path check as the rendered checker. Stop it after use; file URLs cannot reliably import modules or access the shared iframe. The rendered checker starts its own temporary local server:

```sh
node examples/event-replay/verify.mjs /path/to/output
```

The browser checker uses existing Playwright tooling. Set `VFX_TOOL_ROOT` to a directory whose `node_modules` contains Playwright, and optionally `VFX_BROWSER_PATH` to an installed Chromium executable. The normal skill needs neither. No output proves agent adherence, player preference or real engine/network behavior.

Version 0.4.1 adds bounded IDs, maxActive/maxHistory capacity policy, non-color pending/confirmed shapes, reduced-motion checks, and an allowlisted loopback server with real-path containment. See references/event-integration.md for saturation and late-confirmation tradeoffs. Run `node --test examples/event-replay/*.test.mjs` from the repository root. The server assumes local assets do not change during verification; it is not a public server.
