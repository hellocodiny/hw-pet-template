# AI로봇집게 — AI Codiny Web Serial

기존 Arduino Nano 펌웨어를 유지하여 USB 115200bps로 관절 3개, 네오픽셀 2개, 파란 LED, 부저 및 센서 5개를 제어합니다.

## 개발 실행 (Windows PowerShell)
```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```
Chrome에서 http://localhost:3000 을 열어 USB 연결합니다. 별도 로컬 Blockly 시험 화면은 포함하지 않습니다.

## 빌드 및 검사
Node.js와 pnpm 8.15.4를 사용합니다.
```powershell
pnpm.cmd test
node --test tests/blocks.cjs
pnpm.cmd build
```
Linux 배포 확인: `bash _export.sh`. 산출물은 main/out 입니다.

## 블록
blockcoding/에 13종 정의·제너레이터·Flyout이 있습니다. 제어 재개/출력 정지 블록은 제외했습니다. LED 모두 끄기는 pixel(2,0,0,0)으로 네오픽셀만 끕니다. 내부 start()/stop() API는 유지합니다.

## KT 등록 시 확인 필요
- IFRAME ID: aiRobotGripper-serial
- 블록 라우팅 접두어 제안: aiRobotGripper
- 배포 경로 제안: /aimk-server/d_/hw-iframe/aiRobotGripper-serial
- 프로그램 시작 시 start(), 정지 시 stop()의 실제 서비스 연동 규격은 KT 확인 및 실물 검증 필요. 현재 공개 서비스의 전체 정지/재시작 연동이 완료된 상태는 아닙니다.
- stop()은 LED/부저를 끄고 마지막 관절 목표각을 유지합니다. USB 연결은 유지합니다.

USB/관절/LED/부저/센서 및 구형 부트로더 첫 연결은 사용자 실물 시험으로 확인했습니다. 새 블록 전체의 운영 코디니 실행은 등록 후 확인해야 합니다.
