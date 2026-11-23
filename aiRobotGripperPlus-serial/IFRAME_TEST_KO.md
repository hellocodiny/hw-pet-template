# 3단계 새 기능 시험

새 폴더에서 pnpm.cmd install --frozen-lockfile → pnpm.cmd test → pnpm.cmd dev 순서로 실행합니다.
기존 서버는 Ctrl+C로 종료합니다. localhost 페이지의 USB 동글 버튼으로 로봇을 연결합니다.
기존과 같은 IFRAME Playground에서 localhost 주소를 연결하고, hw 객체가 준비된 JavaScript code 창에서 아래 코드를 각각 실행합니다.
블록 등록 및 makerKit 라우팅 확인과는 별도의 CommandRunner API 시험입니다.

## 1. 센서 표시 (로봇을 움직이지 않음)
```js
await hw.monitorSensor('distance');
await hw.monitorSensor('left');
await hw.monitorSensor('right');
logger.log('교구창의 블록 센서 모니터를 확인하세요.');
```
교구창 하단 '블록 센서 모니터'에 값3개가 나타나고 물체를 이동하면 값이 바뀌어야 합니다.

## 2. 센서 매핑 (로봇을 움직이지 않음)
```js
for (let i = 0; i < 10; i++) {
  logger.log(await hw.mapSensor('distance', 5, 50, 0, 180));
  await hw.waitSeconds(0.5);
}
```
5~50cm를0~180으로 환산하고 양 끝 밖은0/180으로 제한합니다. 초음파0은 반사파 미수신일 수 있습니다.
로그 중간에 거리를 바꾸면 변환값이 갱신되어야 합니다.

## 3. 표시 지우기
```js
await hw.clearMonitors();
```
기존 진단용 센서값 영역은 유지하고, 블록으로 만든 모니터만 지웁니다.

## 4. 취소 확인
```js
await hw.waitSeconds(10);
logger.log('10초 대기 완료');
```
실행 중 교구창의 '전체 출력 정지'를 누르면 취소 오류가 나고 뒤 로그가 실행되지 않아야 합니다.
코디니 상단 정지 버튼 연결 여부는 별도 KT 확인 사항입니다.

기존2단계 제어 함수와 다중 대상 선택 기능도 유지됩니다. 이번 단계에는 로컬 블록 편집기를 추가하지 않았습니다.
