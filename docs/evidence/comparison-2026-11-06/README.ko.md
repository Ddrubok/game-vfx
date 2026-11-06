# 쌍별 비교 실험 근거

[English](README.md) | [한국어](README.ko.md)

[보고서와 채점표](../../comparison-2026-11-06.ko.md), [실험 절차 원문(영문)](PROTOCOL.md)을 참고하세요. `runs/<label>/`에는 변경하지 않은 12개 제출물과 요청이 있으며, `manifest.json`은 과제·조건 대응표입니다. `blind-review/gallery.png`와 `score.json`은 별도 블라인드 시각 평가입니다. `submission-audit.json`은 소스 해시, 사용량, 자체 보고 수정 횟수, 읽은 파일, 명령 수를 기록합니다.

원래 결과 JSON은 과거 근거입니다. 개인 PC 경로·세션 ID·원시 셸 명령·호스트 로그는 공개 사본에서 제외하고 전체 로컬 기록은 보존했습니다. 이 묶음은 모델 세션을 자동 실행하지 않으며 저장된 결과물에 공통 검사를 재현합니다.

이 폴더에서 기존 Node·Playwright로 실행합니다.

```sh
node verify.mjs
```

Playwright가 다른 곳에 설치되어 있으면 `VFX_TOOL_ROOT`에 해당 `node_modules`의 상위 폴더를 지정하세요. `VFX_BROWSER_PATH`는 설치된 Chromium 실행 파일입니다. Godot 검사는 `VFX_GODOT_PATH`에 설치된 Godot 4 실행 파일을 지정하거나 PATH에서 `godot`을 찾을 수 있어야 합니다.

```sh
node verify-godot.mjs
```

원래 엔진은 Godot 4.7.1입니다. 새 검사는 `recheck-verification.json`, `recheck-godot-verification.json`과 Git에서 제외한 `recheck/`의 캡처·로그를 만듭니다. Godot 과제 폴더에는 제외된 가져오기 파일과 별도 검사 스크립트도 생성됩니다. 검사 실패 시 0이 아닌 종료 코드를 반환하며 원래 `verification.json`·`godot-verification.json`은 바꾸지 않습니다.

브라우저 검사는 저장 프레임·표본 시점을 확인하며 사람의 움직임 선호를 평가하지 않습니다. Godot은 headless입니다. 과제·조건별 표본이 하나라 일반적인 우위를 입증하지 못합니다.

두 검증기는 시작 전에 12개의 고유 과제·조건과 성공한 실행 기록을 모두 요구합니다. 최종 검사 이름도 기존 검사 목록과 일치해야 합니다. 누락·중복·미완료는 통과하지 않습니다. 브라우저 서버는 `examples/event-replay/server.mjs`의 허용 목록 처리기를 공유하므로 전체 저장소에서 실행하세요.

후속 pending 완료 회귀는 과거 90/90 점수와 별도입니다. 여기서 `node --test checks.test.mjs callback.test.mjs`를 실행합니다. 콜백 검사는 원래 전체 스킬 제출물의 실패를 재현하고 `pending-callback.patch`를 메모리에만 적용해 검사합니다. 원본 제출물은 바꾸지 않습니다. 이 회귀 검사의 통과는 과거 결함의 재현과 별도 수정의 성공이며 원본이 새 계약 사례를 통과했다는 뜻이 아닙니다.
