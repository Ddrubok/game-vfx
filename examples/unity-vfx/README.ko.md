# Unity VFX 실험

[English](README.md) | [한국어](README.ko.md)

번들 충격파·베기·불씨 PNG 시트와 네이티브 Particle System 버스트를 실제 Unity Editor Play Mode에서 검사합니다. 기본 렌더러, Direct3D11, Windows 환경입니다. 설치된 Unity 6000.4.0f1과 6000.5.7f1에서 실행했으며 저장된 프로젝트 버전은 6000.5.7f1입니다. 외부 패키지나 테스트 프레임워크는 필요하지 않습니다.

설치·라이선스 설정을 마친 에디터로 실행하세요. 절대 경로는 환경에 맞게 바꿉니다.

```text
Unity.exe -batchmode -force-d3d11 -projectPath <absolute-project-folder> -executeMethod VfxExperiment.Run -vfxOutput <absolute-output-folder> -logFile <absolute-log-file>
```

실제 GPU 프레임을 렌더링하므로 `-nographics`를 사용하지 마세요. `-quit`도 추가하지 마세요. Play Mode 실행기가 완료 후 종료하며 검사 실패나 오류 로그가 있으면 0이 아닌 종료 코드를 반환합니다. `VfxExperiment.Run`은 이 예제의 Experiment 장면을 생성·교체하고 샘플 텍스처 가져오기 설정을 지정합니다. 별개의 게임 프로젝트 대신 이 독립 예제 프로젝트에서 실행하세요.

신뢰하는 시트용 어댑터는 전용 JSON에서 SpriteRenderer 프레임을 생성합니다. 아틀라스 왼쪽 위 기준 좌표·기준점을 Unity의 왼쪽 아래 텍스처 원점으로 변환하고, 프레임 시간과 재시작·일시정지·취소·소유자 정리를 처리합니다. `TextureImporterNPOTScale.None`으로 512×384 크기를 보존합니다. 기본 NPOT 크기 조절은 기존 사각 영역 좌표를 무효화합니다. 악의적 입력용 범용 가져오기 도구나 실제 서비스의 이벤트·네트워크 어댑터는 아닙니다.

원래 텍스처 크기·기준점·시간, 두 번의 완전한 반복, 일시정지·재개, 밝고 어두운 배경, 정리, 24개 중첩, 네이티브 파티클의 12개 버스트·만료·64개 한도·취소를 검사합니다. 일회성 효과별 워밍업 후 3회 측정하며, 허용 오차는 해당 반복에서 관측한 최대 프레임 간격의 2배 + 5ms입니다. 별도로 간격이 50ms를 넘으면 실패합니다. PNG 캡처는 시간 측정에서 제외합니다. `maxFrameSeconds`는 이후 캡처 작업까지 포함할 수 있는 넓은 진단값이며 성능 벤치마크가 아닙니다.

두 버전 모두 기능 검사 32개는 통과했지만 UnityEditor.Search 시작 예외가 기록되어 전체 결과는 의도적으로 `passed: false`입니다. [보고서](../../docs/unity-experiment-2026-11-06.ko.md)를 참고하세요. 오류 없는 엔진 인증으로 표현하지 않습니다. 출력 로그·캡처·캐시는 Git에서 제외하며 선택한 근거는 docs/evidence에 보존합니다.
