# Feedback repairs / 피드백 수정

Date: 2026-11-05. Local instruction and example changes; no new agent comparison.

## Changed / 변경

- Closed one-shot lifetimes explicitly reject higher revisions; owner-generation tokens prevent old completion callbacks from finishing a reused effect. The optional adapter and rendered replay make this concrete. Rejection/expiration closing a lifetime is this sample's policy, not a universal server protocol.
- Exported frame zero now samples 0.02 s; playback still starts at 0 with 20 × 40 ms frames. `timeSeconds` remains playback position and `sampleTimeSeconds` is the visual sample. The last 0.78 s sample fades to zero at 8-bit precision; it still has its 40 ms duration. The analytic renderer is unchanged at its empty endpoints.
- Published the portable Canvas checker. Added engine identification, a link to the existing 3D source, Godot import reference code and a memory/timing investigation path. The Godot code is NOT RUN.
- Corrected direct/via-bettermakegame handoff wording, conditional routing order and stale publication labels. Historical results and hashes were not replaced with new passes.

종료 후 높은 revision·재사용 전 콜백의 동작을 명시하고, 실제 Canvas 렌더러와 연결한 로컬 예제를 추가했습니다. 첫 저장 장면은 0.02초로 바꾸되 20장 × 40ms = 0.8초 재생은 보존했습니다. 마지막 표본은 8비트 투명도에서 사라지지만 마지막 장의 시간은 남습니다. 공개 검사기·엔진 판별·3D 연결·Godot 참조 코드를 추가하고 전달 경로와 과거 기록 표기를 바로잡았습니다.

## Executed / 실행한 검사

| Check | Observed result | Scope |
| --- | --- | --- |
| Canvas browser/export | 25 PASS; all 20 saved frames match individual PNG roundtrips | Chrome 156.0.8078.80, Playwright 1.62.1; first frame visible, last fade transparent |
| Event adapter Node regression | 13 PASS | Local event model, including fractional-time expiry, higher revision after finish, round/owner reuse and cancellation |
| Rendered event replay | 11 PASS | Actual Canvas pixels, pending/confirmed change, correction, duplicate, finish, late revision, teardown and elapsed playback |
| Shared bettermakegame online-impact | 13 PASS | Exact source at `fd3c15df5cbbd9226003233e573af67cf8da0c85`; no real network or skill-use claim |

The first new checker run exposed a fractional-time expiry boundary (`0.1 + 0.7`) and an overbroad test that required every fade frame to contain visible pixels. The expiry now uses a floating-point precision tolerance and has a regression case. The export assertion now tests the actual requirement: a visible **first** frame; it reports the transparent final fade rather than hiding it. Final runs above were made after those changes.

추가 검사 초기에 소수 시간 누적의 종료 경계 문제와 모든 페이드 프레임이 보여야 한다는 과도한 검사 조건을 발견했습니다. 종료 경계는 부동소수점 정밀도 보정·회귀 검사로 수정했습니다. 내보내기 검사는 실제 요구인 첫 프레임 표시를 확인하고, 마지막 페이드가 투명하다는 결과도 공개합니다. 위 표는 수정 후 실행입니다.

Final contact-sheet, light-background and active-correction captures were opened with an image tool. This is static inspection and automated playback, not a human motion/preference study. Evidence and source hashes are in [results](feedback-repair-2026-11-05-results.json) and [snapshot](feedback-repair-2026-11-05-snapshot.json).

최종 프레임 모음·밝은 배경·정정 장면 이미지를 직접 열었습니다. 정지 화면 확인과 자동 재생 검사이며 사람의 움직임·선호 평가는 아닙니다.

## Remaining limits / 남은 한계

- User-reported Godot 4.4.1 execution is attributed evidence, not our rerun. No suitable engine executable was found in PATH or checked common install directories. Import/parsing, 0.75 s finish timing and native dot-versus-streak appearance remain NOT RUN / unresolved. The project/import settings behind that observation were not available to this run.
- 2560 × 2048 RGBA8 is 20 MiB before mipmaps; approximately 26.7 MiB with a full chain is arithmetic, not measured GPU memory or the confirmed cause of the reported 28 MB. See [engine guidance](../references/engine-adapters.md) and its official sources.
- Additive blending, extra art styles, native engine integration and the 3D renderer were not added/retested. A single source-over shockwave remains the example's stated scope. No all-engine support is promised.
- New style/event/handoff agent behavior, human playtests, real devices/networks and kill-game-slop U/V: **NOT RUN**. Example correctness does not establish improved skill output.

Godot 결과는 사용자 제공 관찰로 구분했습니다. 설치 확인 범위에서 실행 파일을 찾지 못해 엔진 코드·종료 시각·입자 모양은 재검증하지 않았습니다. 메모리 수치는 조건부 산술일 뿐 진단이 아닙니다. 추가 스타일·가산 합성·네이티브 엔진 연동·3D 재검사는 이번에 수행하지 않았고, 스킬 행동·사람·기기·실네트워크·U/V 평가는 미실행입니다.
