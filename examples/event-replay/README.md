# Event lifetime replay / 이벤트 수명 재생

This example connects the existing Canvas effect to a local trusted-event adapter. It covers pending/confirmed color, an active correction, duplicates, a finished effect, owner disposal and round changes. It has no server, collision, damage, audio or real network validation. The sample policy closes an expired or rejected one-shot even if a higher revision arrives; adapt that policy to an actual protocol, rather than inventing one for a game.

기존 Canvas 효과를 로컬 이벤트 예제에 연결했습니다. 처리 중/확정 색상, 실행 중 정정, 중복, 종료한 효과, 소유자 폐기, 라운드 변경을 다룹니다. 서버·충돌·피해량·소리·실제 네트워크 검증은 없습니다. 종료·거절된 효과를 높은 revision으로 재생하지 않는 예제 정책이며, 실제 게임에서는 기존 프로토콜을 확인해야 합니다.

From the repository root / 저장소 루트에서:

```sh
node --test examples/event-replay/events.test.mjs
python -m http.server 8000 --bind 127.0.0.1
```

Use an installed Python 3 executable or an existing local HTTP server. Open `http://127.0.0.1:8000/examples/event-replay/`; file URLs cannot reliably import modules or access the shared iframe. Stop the server after use. The rendered checker starts its own temporary local server:

설치된 Python 3 또는 기존 로컬 HTTP 서버를 사용하세요. 위 주소로 열고 사용 후 서버를 종료하세요. 파일 URL은 모듈·iframe 접근이 제한됩니다. 브라우저 검사는 자체 임시 로컬 서버를 시작하고 종료합니다.

```sh
node examples/event-replay/verify.mjs /path/to/output
```

The browser checker uses existing Playwright tooling. Set `VFX_TOOL_ROOT` to a directory whose `node_modules` contains Playwright, and optionally `VFX_BROWSER_PATH` to an installed Chromium executable. The normal skill needs neither. No output proves agent adherence, player preference or real engine/network behavior.

브라우저 검사는 기존 Playwright를 사용합니다. `VFX_TOOL_ROOT`는 Playwright가 들어 있는 `node_modules`의 상위 디렉터리, `VFX_BROWSER_PATH`는 선택적으로 지정할 Chromium 실행 파일입니다. 일반 스킬 사용에는 필요하지 않습니다. 이 결과는 에이전트의 지침 준수·사용자 선호·실제 엔진/네트워크 성능을 입증하지 않습니다.
