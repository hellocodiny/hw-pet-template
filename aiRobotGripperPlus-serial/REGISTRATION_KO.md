# AI로봇집게+ 블록 등록 안내

## 완료 범위

- PC 프로그램의 교구 전용 블록19종을 기준으로 정의/제너레이터를 작성했습니다.
- 각 블록에서 호출하는 CommandRunner 함수 구현과 자동 검사를 완료했습니다.
- 개인 초음파 블록 1종의 저장·표시를 확인했습니다. 교구 서버 배포 및 실제 블록 실행은 미확인입니다.

## 파일 구성

- blockcoding/definitions.json: 전체 블록 정의 배열.
- blockcoding/generators.js: 전체 제너레이터 모음.
- blockcoding/flyout.json: 블록 순서와 숫자 기본값.
- blockcoding/manifest.json: PC 블록명, 카테고리, 호출 메서드 대응 목록. 코디니 자체 일괄 가져오기 규격으로 보장하는 파일이 아닙니다.
- blockcoding/airobotgripperplus_*.json 및 .js: 블록별 정의와 제너레이터.
- blockcoding/legacy/*.js: 편집기가 Blockly.JavaScript['type'] 형식을 사용하는 경우의 동일 기능 제너레이터.

## 진행 순서 및 현재 상태

1. 연동 소스와 블록 19종 초안을 별도 PR로 제출합니다. 개인 블록 등록은 PR의 선행 조건이 아닙니다.
2. KT 담당자에게 교구 등록·배포, 호출 접두어 및 블록 반영 주체/방법을 확인합니다.
3. 확정된 등록 규칙에 맞춰 블록을 반영하고 실제 연결된 작품에서 시험합니다.
4. 전체 정지/재시작과 센서 갱신을 확인한 후 배포를 진행합니다.

개인 공작소 로봇집게+(yf61)에 `yf61_airobotgripperplus_ultrasonic` 한 종을 저장하고 Flyout 및 Block Playground에 표시했습니다. 실제 하드웨어 목록에 제품이 없어 블록 실행은 미검증입니다.
저장 시 개인 블록 이름은 `yf61_`로 시작해야 한다는 검증 오류를 확인했습니다.
제출 파일은 계정에 종속되지 않는 `airobotgripperplus_` 초안 이름을 유지합니다. 개인 공작소에 반영할 때 정의 type, 제너레이터 키, Flyout 참조를 동일하게 수정해야 합니다. `yf61_`는 블록 식별자이며 하드웨어 호출 접두어 `aiRobotGripperPlus`와 다릅니다.
편집기는 `javascriptGenerator.forBlock` / `Order` 형식이며 저장 창 왼쪽에서 제너레이터를 입력합니다.

## KT 확인 항목

- IFRAME 교구 ID: aiRobotGripperPlus-serial (제안)
- 호출 접두어: aiRobotGripperPlus (제안)
- makerKit.hw.run(routineContext, 'aiRobotGripperPlus.method', ...args) → 해당 IFRAME CommandRunner 라우팅
- 제작 프로그램의 전체 정지/재시작 시 교구에 전달하는 실제 이벤트/함수
- 배포 경로 및 블록 배포/파트너 등록 절차

하드웨어창의 전체 출력 정지는 대기 중인 wait/moveForBlock/playNoteBlock을 취소 오류로 끝내도록 구현했습니다.
코디니 프로그램 전체 정지 버튼이 이 stop()을 호출하는지는 아직 확인되지 않았습니다. 두 정지 버튼이 자동으로 동일하게 동작한다고 가정하지 마세요.
취소 오류가 실제 코디니 실행기에서 후속 블록을 중단시키는지도 등록 후 검증해야 합니다.
'제어 재개/출력 정지' 사용자 블록은 추가하지 않았습니다. 바퀴 정지 블록은 바퀴 전용입니다.

공식 참고: https://ktaicoder.github.io/post-frame/hw-pc-dev-how-to-use-with-simul
이 문서는 PC 프로그램 연동 가이드(2023-03-14)입니다. IFRAME 서비스 ID/정지 라이프사이클 확정 자료로 사용하지 않습니다.
