# 3D 충격파 예제

[English](README.md) | [한국어](README.ko.md)

## 실행

**shockwave-3d.ko.html**을 내려받아 WebGL2를 지원하는 브라우저로 여세요. 한국어 화면이며 처음에는 중간 장면이 정지되어 있습니다. **다시 재생**을 누르면 한 번 재생합니다. 실행 코드가 포함되어 있어 인터넷이나 Node 설치 없이 볼 수 있습니다. 영문판은 **shockwave-3d.html**이며 장면 위의 언어 링크로 전환할 수 있습니다.

| 조작 | 기능 |
| --- | --- |
| 드래그, 방향키 | 카메라 회전 |
| 휠 | 확대·축소 |
| 사선 / 측면 / 위에서 | 카메라 위치 선택 |
| 시간 막대 | 효과의 시점 이동 |
| 가림 확인용 기둥 | 가림 확인용 물체 켜기·끄기 |
| 움직임 줄이기 | 확산·입자 대신 사라지는 확인 고리 표시 |
| 현재 화면 PNG | 현재 장면의 2D PNG 저장 |

PNG 저장은 화면 캡처이며 3D 모델이나 투명 효과 에셋 내보내기가 아닙니다. 충돌·피해량·서버 판정은 구현하지 않았습니다. 밝은 표면 표현이 주변 물체를 비추는 동적 조명으로 작동하는 것은 아닙니다.

## 소스 수정과 빌드

| 파일 | 역할 |
| --- | --- |
| shockwave.js | 효과의 모양·셰이더·시간 변화·정리 |
| app.js | 장면·카메라·조작·효과 관리와 언어별 실행 메시지 |
| template.html / template.ko.html | 영어 / 한국어 화면 구성 |
| build.mjs | 두 언어의 오프라인 HTML 생성 |
| verify.mjs | 브라우저 검사 |

이 폴더에서 고정한 개발 도구와 호환되는 Node를 사용해 실행합니다.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
```

Three.js 0.187.0과 esbuild 0.25.10을 고정했습니다. Three.js 라이선스는 두 HTML과 `vendor/LICENSE-three.txt`에 있습니다. `createShockwave()`는 장면에 추가할 그룹, 경과 초를 받는 갱신 함수, 정리 함수를 돌려줍니다. 다른 엔진으로 옮기려면 해당 엔진에 맞는 구현과 재검증이 필요합니다.

## 검사 재실행

Playwright Chromium이 없다면 설치한 뒤 검사를 실행합니다.

```sh
npx playwright install chromium
npm run check
node verify.mjs ko
```

첫 검사는 영문판, 두 번째는 한국어판을 실행합니다. 기존 Chrome/Chromium을 사용하려면 `VFX_BROWSER_EXECUTABLE`에 호환되는 브라우저 실행 파일 경로를 지정하세요. 관리자는 이미 설치된 Chrome을 사용했고 공개 과정에서 위 브라우저 다운로드 명령은 실행하지 않았습니다. 검사 결과와 캡처는 Git에서 제외한 `evidence/en/`과 `evidence/ko/` 폴더에 저장됩니다.

[검증 기록](../../docs/validation.ko.md)에 실제 환경과 한계를 적었습니다. 이 검사는 사람의 움직임 선호나 휴대폰 성능을 인증하지 않습니다.
