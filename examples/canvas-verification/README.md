# Canvas export checks / Canvas 내보내기 검사

This portable maintainer script checks the shipped HTML, actual downloaded PNG/JSON, all packed frames, alpha, deterministic sampling, playback and narrow layout. It writes captures and `validation.json` to the chosen output directory. It is not required to use the skill and does not assess artistic preference or an engine import.

포함된 HTML, 실제 저장한 PNG/JSON, 시트의 모든 프레임, 투명도, 재현성, 재생과 좁은 화면을 검사합니다. 지정한 출력 폴더에 캡처와 `validation.json`을 남깁니다. 일반 스킬 사용에는 필요하지 않으며 미적 선호나 엔진 가져오기를 판정하지 않습니다.

From the repository root / 저장소 루트에서:

```sh
node examples/canvas-verification/verify.mjs /path/to/output
```

Use an existing Playwright installation. If it is outside normal Node resolution, set `VFX_TOOL_ROOT` to the parent of its `node_modules`; optionally set `VFX_BROWSER_PATH` to an installed Chromium executable. Without that override Playwright uses its installed browser. `VFX_INPUT` optionally selects another local HTML with the same example API for regression diagnosis. No private Orca path is required. The recorded run used Node 22, Playwright 1.62.1 and Chrome 156; other versions have not all been tested.

기존 Playwright를 사용하세요. Node가 찾을 수 없는 위치라면 `VFX_TOOL_ROOT`에 `node_modules` 상위 폴더를 지정하고, 필요하면 `VFX_BROWSER_PATH`에 설치된 Chromium 실행 파일을 지정합니다. 지정하지 않으면 Playwright의 브라우저를 사용합니다. `VFX_INPUT`은 같은 예제 API를 갖춘 다른 로컬 HTML을 검사할 때만 사용합니다. 비공개 Orca 경로는 필요하지 않습니다. 기록한 실행은 Node 22·Playwright 1.62.1·Chrome 156 기준이며 모든 버전 조합을 검증하지는 않았습니다.

## Configurable styles / 조절 가능한 스타일

```sh
node examples/canvas-verification/variants.mjs /path/to/variant-output
```

The additional checker uses the same installed tools, changes the real export controls, and checks three 128 px variants. Packed alpha must match exactly; premultiplied RGB may differ by at most one 8-bit unit after browser PNG roundtrips. This is not raw RGB byte equality. The default 512 px checker retains its stricter pixel-for-pixel requirement. Parameter validation, visible first frames, loop continuity and reduced motion are separate checks. See the [current record](../../docs/practical-validation-2026-11-05.md).

같은 도구로 실제 출력 설정을 바꾸어 세 가지 128px 변형을 검사합니다. 투명도는 정확히 일치해야 하며, 투명도를 곱한 RGB는 PNG 왕복 변환 후 8비트 기준 최대 1 차이를 허용합니다. 원래 RGB 바이트가 전부 같다는 뜻은 아닙니다. 기본 512px 검사는 기존의 픽셀 완전 일치 조건을 유지합니다. 입력값·첫 프레임·반복·동작 감소는 별도로 확인합니다.
