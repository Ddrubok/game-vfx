# 실제 VFX 검증 — v0.4.0, 2026-11-05

[English](practical-validation-2026-11-05.md) | [한국어](practical-validation-2026-11-05.ko.md)

기준 커밋: `b487d6813209adc26807cc3b553f3f6a0352cadf`. [스냅샷](practical-validation-2026-11-05-snapshot.json)은 당시 소스·검사기·네이티브 프로젝트 파일을 식별합니다. 과거 v0.3.1 결과의 해시는 그대로 보존합니다.

## 변경 사항

기존 Canvas 예제에 방사형 충격파, 방향성 리본 베기, 반복 상승 불씨를 제공합니다. 출력 설정은 64/128/256/512px 프레임, 4–60장, 0.1–5초입니다. 메타데이터에는 지속 시간, 중간 표본, 재생 시점, 기준점, 반복 여부를 보존합니다. 잘못된 입력은 메모리 할당 전에 거부합니다. 기본값은 512px, 20장, 0.8초입니다. 합성은 source-over 알파이며, 세 가지 형태가 임의의 아트 스타일 품질을 입증하지는 않습니다.

기본 아틀라스 2560×2048은 **RGBA8 픽셀 데이터 20 MiB**입니다. 기록한 128px 변형은 충격파·베기 512×384(**0.75 MiB**), 불씨 512×512(**1 MiB**)입니다. 이는 가로×세로×4 산술값이며 GPU 실측, 동등한 품질, 성능 향상 주장이 아닙니다. 실제 표시 크기에 맞게 출력 크기를 고르세요.

## 실행 근거

| 검사 | 결과 | 근거·범위 |
| --- | --- | --- |
| 기본 Canvas 출력·재생 | 25개 통과, 시트 20/20장이 개별 PNG와 정확히 일치 | [JSON](evidence/practical-2026-11-05/canvas-default/validation.json), 기존 512px 기본값 |
| 조절 가능한 스타일 | 18개 통과 | [JSON](evidence/practical-2026-11-05/variants/validation.json), 실제 UI·다운로드, 128px 변형, 경계·반복·동작 감소 |
| 로컬 이벤트 어댑터 | Node 13개 통과 | `node --test examples/event-replay/events.test.mjs`, 신뢰하는 로컬 이벤트 |
| 렌더링 이벤트 재생 | 11개 통과 | [JSON](evidence/practical-2026-11-05/event-replay/validation.json), 당시 Canvas 렌더러 |
| Godot 네이티브 장면 | 16개 통과 | [JSON](evidence/practical-2026-11-05/godot-rendered-final/results.json), GL Compatibility, Windows, 실제 네이티브 렌더러 |
| bettermakegame 공통 예제 | 온라인 17개 / 전체 Node 42개 통과 | 새 소유자·세대 완료 검사, 해시는 스냅샷에 기록 |

브라우저는 Node 22.18.0, Playwright 1.62.1, Chrome 156.0.8078.80입니다. 네이티브 환경은 Godot `4.4.1.stable.official.49a5bc7b6`, NVIDIA RTX 3080 Laptop GPU, OpenGL 3.3, 드라이버 617.42입니다. [공식 Windows 릴리스](https://github.com/godotengine/godot/releases/tag/4.4.1-stable)는 별도 다운로드했으며 번들에 포함하지 않습니다. 로컬 ZIP SHA-256은 `1c729738f42e43036a7147838aa9fa56d62101cf90884f315e1ab525e8e69d61`, 크기는 69,065,928바이트입니다. 릴리스 메타데이터에 해시가 없어 로컬 출처 기록이며 게시자 체크섬과의 독립 대조는 아닙니다.

작은 변형은 처음에 PNG 왕복 변환 후 원래 RGB 바이트 완전 일치 검사에 실패했습니다. 최종 검사는 **알파 완전 일치**와 **알파를 곱한 RGB의 8비트 차이 ≤1**을 요구하며 정확히 일치한 개수와 차이를 기록합니다. 기본 512px는 더 엄격한 완전 일치를 유지합니다. 이 허용치는 관측한 인코딩·반올림 차이를 반영한 것이며 시각 품질 점수나 프레임·알파 오류를 무시할 근거가 아닙니다.

관리 에이전트가 [네이티브 캡처](evidence/practical-2026-11-05/godot-rendered-final/godot-effects.png), [베기](evidence/practical-2026-11-05/variants/slash-preview.png), [불씨](evidence/practical-2026-11-05/variants/embers-preview.png)를 실제 열었습니다. 정지 화면은 동작의 편안함이나 사람의 선호를 평가하지 않습니다. 네이티브 종료 신호는 선언 0.6/0.4초에 0.582783/0.382836초였고, 당시 검사는 오차 0.10초 미만을 허용했습니다. [Godot 재현 방법과 한계](../examples/godot-sheet/README.ko.md)를 참고하세요. 사용자가 이전에 보고한 시간 차이는 원인을 규명하지 못했으며 네이티브 파티클 재현을 주장하지 않습니다.

## 공동 사례와 에이전트 평가

[실제 프로모션 컴포넌트 사례](https://github.com/Ddrubok/kill-game-slop/tree/main/evals/real/promotion-2026-11-05)는 절제된 닫기 피드백과 동작 감소 시 정적인 선택 상태를 사용합니다. 새 장식 효과는 필요하지 않았습니다. 세 스킬 역할의 제한된 동일 세션 적용이며 독립적인 분산 전달 시험은 아닙니다.

[새로운 네 세션 비교](https://github.com/Ddrubok/bettermakegame/tree/main/evals/discovery-2026-11-05)에서는 짧은 지침과 전체 묶음 모두 선택 동작을 수정하고 정상적인 축하 효과를 보존했습니다. 추가 정확도 우위는 확인하지 못했습니다. 전용 연계/U/V 평가는 미실행입니다. 기존 3D 28개 검사는 이번에 다시 실행하지 않았고 소스도 변경하지 않았습니다. Unity/Unreal/모바일/Godot 배포 빌드, 실제 서비스 네트워크, 사람 플레이테스트, 성능 실측은 당시 미실행입니다.

## 최종 패키지 검사

[기계 판독 요약](practical-validation-2026-11-05-results.json): 세 스킬의 메타데이터가 기존 검사기를 통과했습니다. 선택한 실행 지침의 로컬 링크·라이선스, 저장소 Markdown 파일 대상, `git diff --check`를 통과했습니다. 새 텍스트의 공백도 별도로 검사했습니다. 정적 검사만으로 Markdown 앵커 렌더링이나 에이전트 행동을 입증하지는 않습니다. 고정한 비교용 실행 지침은 최종 지침과 바이트 단위로 일치하며, 스냅샷에는 여러 운영체제의 체크아웃을 위한 LF 정규화 해시도 포함합니다.
