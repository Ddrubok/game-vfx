# v0.4.1 재검토 반영 — v0.4.2 수정

[English](recheck-followup-2026-11-06.md) | [한국어](recheck-followup-2026-11-06.ko.md)

검토 대상 `f7cecaf` 이후의 수정이다. 기존 비교 제출물·해시·90/90 기록은 변경하지 않았다.

| 항목 | 처리 |
| --- | --- |
| N01 | replay, 비교 검증, 수동 실행이 기존 허용 목록·실경로 검사 함수를 공유한다. 비교 서버는 지정된 preview.html/effect.mjs만 제공한다. Python 서버 안내를 제거했다. |
| N02 | 원본 전체 스킬 제출물의 pending 완료 콜백 실패를 재현했다. [한 줄 패치](evidence/comparison-2026-11-06/pending-callback.patch)를 별도로 제공하고 [회귀 검사](evidence/comparison-2026-11-06/callback.test.mjs)에서 메모리에만 적용한다. |
| N03 | 기본 어댑터는 좌표의 x/y만 저장한다. 1MB extra 필드와 중첩 참조가 보존되지 않음을 검사했다. |
| N04 | 실행 전에 12개 과제·조건, 고유 label, 성공한 실행 기록을 요구한다. 실행 후 셀과 검사 이름을 원래 검사 목록에 대조한다. 빈 결과·누락·중복·실패 실행을 거부한다. Godot은 이전 결과 파일을 지우고 새 결과만 읽는다. |
| N05 | 문서화된 포화 정책은 유지한다. 실제 게임의 라운드·재전송 계약이 없어 임의의 기록 만료나 계측 체계를 추가하지 않았다. 기존 호스트 진단에서 history.size/maxHistory를 확인하도록 명시했다. |
| N06 | 추가 모델 실험은 수행하지 않았다. 기존 스타일 평가와 한계를 유지하고 새 콜백 반례를 비교 보고서 상단에 표시했다. |

README 버전과 Godot 한국어 과거 시간 설명을 바로잡았다. 비교 브라우저 검증기에 기존 `VFX_BROWSER_PATH` 옵션을 맞췄다. 스킬 본문에는 사례를 추가하지 않고 관련 참조만 보완했다.

## 추가 콜백 사례

| 제출물 | pending 타이머 종료 후 확정 | pending 완료 콜백 후 확정 |
| --- | --- | --- |
| 기본 원본 | 통과 | 통과 |
| 전체 스킬 원본 | 통과 | **실패** |
| 전체 스킬 + 별도 패치 | 통과 | 통과 |

패치 검사에는 옛 토큰의 confirmed 종료 차단, 0.8초 확정 단계, confirmed 완료 및 거절 이후 재생 차단도 포함했다. 이 표는 당시 90개 검사에 없던 경로이며, 기존 점수를 소급 변경하거나 수정본을 원래 제출물로 취급하지 않는다.

검증: Node 회귀 검사 22개 통과, replay 브라우저 14개 통과, 비교 Web/이벤트 양쪽 각 36/36 및 Godot 양쪽 각 54/54 통과. 수동 서버 CLI의 정상 파일 제공·허용 외 파일 차단, 패치 적용 가능 여부, 스킬 형식도 확인했다. 비교 원본 12개의 소스 해시가 그대로임을 확인했다. Godot은 headless 검사이며 새 실기기·실제 네트워크·사람 평가를 수행한 것은 아니다.

저장소 루트에서 회귀 검사:

```sh
node --test examples/event-replay/events.test.mjs examples/event-replay/server.test.mjs docs/evidence/comparison-2026-11-06/checks.test.mjs docs/evidence/comparison-2026-11-06/callback.test.mjs
```
