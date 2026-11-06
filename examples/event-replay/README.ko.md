# 이벤트 수명 재생

[English](README.md) | [한국어](README.ko.md)

기존 Canvas 효과를 신뢰할 수 있는 로컬 이벤트 어댑터에 연결했습니다. 처리 중/확정 색상, 실행 중 정정, 중복, 종료한 효과, 소유자 폐기, 라운드 변경을 다룹니다. 게임 서버·충돌·피해량·소리·실제 네트워크 검증은 없습니다. 종료·거절된 일회성 효과를 높은 revision으로 재생하지 않는 예제 정책이며, 실제 게임에서는 기존 프로토콜을 확인해야 합니다.

저장소 루트에서:

```sh
node --test examples/event-replay/events.test.mjs
node examples/event-replay/server.mjs
```

`http://127.0.0.1:8000/examples/event-replay/index.html?lang=ko`로 여세요. 이 Node 서버는 브라우저 검사와 같은 허용 목록·실경로 검사를 사용합니다. 사용 후 서버를 종료하세요. 파일 URL은 모듈·공유 iframe 접근이 제한됩니다. 브라우저 검사는 자체 임시 로컬 서버를 시작하고 종료합니다.

```sh
node examples/event-replay/verify.mjs /path/to/output
```

브라우저 검사는 기존 Playwright를 사용합니다. `VFX_TOOL_ROOT`는 Playwright가 들어 있는 `node_modules`의 상위 디렉터리, `VFX_BROWSER_PATH`는 선택적으로 지정할 Chromium 실행 파일입니다. 일반 스킬 사용에는 필요하지 않습니다. 이 결과는 에이전트의 지침 준수·사용자 선호·실제 엔진/네트워크 성능을 입증하지 않습니다.

v0.4.1은 ID 제한, maxActive/maxHistory 용량 정책, 색상 외의 처리 중/확정 모양, 동작 감소 검사, 실경로 포함 여부를 검사하는 허용 목록 기반 로컬 서버를 추가했습니다. 포화 상태와 늦은 확정의 절충은 [이벤트 연결 지침](../../references/event-integration.md)에 있습니다. 저장소 루트에서 `node --test examples/event-replay/*.test.mjs`로 검사합니다. 서버는 검사 중 로컬 에셋이 바뀌지 않는다고 가정하며 공개 서버가 아닙니다.
