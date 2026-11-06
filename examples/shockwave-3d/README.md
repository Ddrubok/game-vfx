# 3D shockwave example

[English](README.md) | [한국어](README.ko.md)

## Run

Download and open **shockwave-3d.html** in a browser with WebGL2. This English page includes its runtime and works offline. It initially shows a paused frame; press **Replay** to play once. No Node installation is needed to view the HTML. The Korean page is **shockwave-3d.ko.html**; use the language link above the scene to switch.

| Control | Function |
| --- | --- |
| Drag, arrow keys | Orbit the camera |
| Wheel | Zoom |
| Isometric / Side / Top | Camera presets |
| Time slider | Seek through the effect |
| Occlusion pillars | Toggle occluders |
| Reduced motion | Replace expansion/particles with a fading marker |
| Save view PNG | Save the camera view as a 2D PNG |

The PNG export is a screenshot, not a 3D model or transparent VFX asset. The example does not implement collision, damage or server authority. Its bright surfaces do not act as dynamic lights on nearby objects.

## Edit and rebuild

| File | Role |
| --- | --- |
| shockwave.js | Effect geometry, shader, analytic motion, disposal |
| app.js | Scene, camera, controls, effect ownership and localized runtime messages |
| template.html / template.ko.html | English / Korean page layout |
| build.mjs | Bundle both offline HTML pages |
| verify.mjs | Browser checks |

From this directory, with a Node version compatible with the pinned development tools:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
```

Three.js 0.187.0 and esbuild 0.25.10 are pinned. The Three.js license is preserved in both HTML files and `vendor/LICENSE-three.txt`. The `createShockwave()` function returns a group, an update function taking elapsed seconds, and disposal. Porting to another engine needs an implementation in that engine and new verification.

## Repeat checks

Install Playwright's Chromium if it is not already available, then run the checks:

```sh
npx playwright install chromium
npm run check
node verify.mjs ko
```

The first check runs the English page; the second runs Korean. Alternatively, set `VFX_BROWSER_EXECUTABLE` to an existing compatible Chrome/Chromium executable. The maintainer used an installed Chrome and did not run the browser-download command for publication. Results and captures are written to the ignored `evidence/en/` and `evidence/ko/` directories.

The [validation record](../../docs/validation.md) describes the observed environment and limits. These checks do not evaluate human motion preference or certify mobile performance.
