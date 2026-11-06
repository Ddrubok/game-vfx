# Canvas 내보내기 검사

[English](README.md) | [한국어](README.ko.md)

포함된 HTML, 실제 저장한 PNG/JSON, 시트의 모든 프레임, 투명도, 재현성, 재생과 좁은 화면을 검사하는 이식 가능한 관리자용 스크립트입니다. 지정한 출력 폴더에 캡처와 `validation.json`을 남깁니다. 일반 스킬 사용에는 필요하지 않으며 미적 선호나 엔진 가져오기를 판정하지 않습니다.

저장소 루트에서:

```sh
node examples/canvas-verification/verify.mjs /path/to/output
```

기존 Playwright를 사용하세요. Node가 찾을 수 없는 위치라면 `VFX_TOOL_ROOT`에 `node_modules` 상위 폴더를 지정하고, 필요하면 `VFX_BROWSER_PATH`에 설치된 Chromium 실행 파일을 지정합니다. 지정하지 않으면 Playwright의 브라우저를 사용합니다. `VFX_INPUT`은 같은 예제 API를 갖춘 다른 로컬 HTML로 회귀를 진단할 때 사용합니다. 비공개 Orca 경로는 필요하지 않습니다. 기록한 실행은 Node 22·Playwright 1.62.1·Chrome 156 기준이며 모든 버전 조합을 검증하지는 않았습니다.

## 조절 가능한 스타일

```sh
node examples/canvas-verification/variants.mjs /path/to/variant-output
```

같은 도구로 실제 출력 설정을 바꾸어 세 가지 128px 변형을 검사합니다. 투명도는 정확히 일치해야 하며, 투명도를 곱한 RGB는 PNG 왕복 변환 후 8비트 기준 최대 1 차이를 허용합니다. 원래 RGB 바이트가 전부 같다는 뜻은 아닙니다. 기본 512px 검사는 기존의 픽셀 완전 일치 조건을 유지합니다. 입력값·첫 프레임·반복·동작 감소는 별도로 확인합니다. [현재 기록](../../docs/practical-validation-2026-11-05.ko.md)을 참고하세요.
