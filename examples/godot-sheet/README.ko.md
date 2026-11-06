# Godot 시트 재생

[English](README.md) | [한국어](README.ko.md)

`assets/canvas-impact.html`에서 실제 내보낸 PNG·전용 JSON으로 충격파·방향성 리본 베기·반복 상승 불씨를 재생하는 선택적 프로젝트입니다. 가져온 Texture2D, AtlasTexture 영역, AnimatedSprite2D를 사용합니다. 엔진 검사 장면이며 출시 게임 연동이나 임의 JSON을 처리하는 범용 도구는 아닙니다.

## 실행

설치된 Godot 4를 사용합니다. 기록한 환경은 **4.4.1.stable.official.49a5bc7b6, Windows, GL Compatibility, RTX 3080 Laptop GPU**입니다. 저장소 루트에서 실행하며 필요한 경우 `godot`을 설치된 실행 파일 경로로 바꾸세요.

```sh
godot --version
godot --headless --path examples/godot-sheet --editor --import --quit
godot --path examples/godot-sheet --rendering-method gl_compatibility -- --output=/absolute/path/to/evidence
```

가져오기 명령은 시각 검증이 아닙니다. 세 번째 명령이 렌더링하고 `results.json`·`godot-effects.png`를 저장하며 실패 시 0이 아닌 종료 코드를 반환합니다. 실제 모습은 PNG를 열어 확인하세요. 출력 경로를 생략하면 `user://verification`에 저장하며 쓰기 가능한 위치를 지정해야 합니다. `--` 뒤에 `--interactive`를 붙이면 창을 유지합니다. 일회성 효과는 종료하고 불씨는 계속 반복합니다.

## 동작과 한계

v0.4.1부터 잘못된 메타데이터 24종을 거부하면서 기존 구성을 보존하는지 검사합니다. 시간 검사는 일회성 효과별 워밍업 후 3회 반복, 메타데이터 시간 합계, 프레임 순서를 확인합니다. 허용 오차는 관측한 최대 프레임 간격의 2배 + 2ms이며, 간격이 25ms를 넘으면 별도로 실패합니다. headless 결과는 화면 검증이 아닙니다. 아래 v0.4.0 시간 수치는 과거 기록입니다.

- JSON `durationMs`를 지정 FPS의 SpriteFrames 상대 시간에 대응시키고 반복 여부와 기준점을 보존합니다. 중간 표본 시점은 재생 시점과 다릅니다.
- 종료하면 일회성 효과를 숨기고, 재시작하면 처음부터 재생하며, 취소하면 정지·숨김 처리합니다. 한 소유자를 제거해도 다른 효과는 유지합니다. 서버·정정 프로토콜은 없습니다.
- v0.4.0의 워밍업 후 네이티브 종료 신호는 **선언 0.6초에 0.582783초**, **선언 0.4초에 0.382836초**였습니다. 당시 허용 오차는 **0.10초 미만**으로, 거친 회귀 검사이지 프레임 정확도 인증이 아닙니다. 다른 프로젝트의 0.75/0.8초 차이는 여전히 원인을 알 수 없습니다.
- 입력은 신뢰하는 번들 내보내기 메타데이터이며 악의적인 임의 JSON이 아닙니다. 배포 시 내보내기 필터에 `*.json`을 포함하세요. **배포 빌드는 미실행**입니다.
- source-over 알파와 128px 프레임입니다. 네이티브 파티클 재현, Android/iOS, Unity/Unreal, 사람의 선호, GPU 메모리 실측은 이 Godot 실험 범위에서 미실행입니다.

샘플은 자체 렌더러에서 생성한 MIT 자료이며 Godot은 포함하지 않습니다. [결과·해시·캡처](../../docs/practical-validation-2026-11-05.ko.md)를 참고하세요.
