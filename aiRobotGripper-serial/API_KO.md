# 코디니 CommandRunner API

모든 함수는 Promise를 반환합니다. 아래는 IFRAME Playground의 `hw` 객체가 준비된 후 호출하는 예시이며, 블록 정의는 다음 단계에서 작성합니다.

| 함수                                           | 의미                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| connect()                                      | 사용자 포트 선택 및 센서 확인, 성공 true / 실패 false                      |
| disconnect()                                   | 출력 끄기 시도 후 포트 종료                                                |
| getHwId()                                      | aiRobotGripper-serial                                                      |
| getConnectionState()                           | disconnected / connecting / connected                                      |
| start()                                        | 정지 상태 해제 (이미 연결된 경우)                                          |
| stop()                                         | LED/부저 끄기, 마지막 목표각 유지, 후속 제어 차단, 주기 송신 유지          |
| servo(channel, angle)                          | channel 1=상하, 2=좌우, 3=집게; 각도 0~180                                 |
| servos(ud, lr, gr)                             | 관절 3개 목표각 동시 설정                                                  |
| pixel(index, r, g, b)                          | index 0=1번, 1=2번, 2=전체; RGB 0~255                                      |
| blue(value)                                    | 파란 LED 0~255                                                             |
| tone(hz)                                       | 0=끄기; 최대2040Hz, 8Hz 단위로 반올림                                      |
| sensor(index)                                  | 0=상하 가변저항, 1=좌우, 2=집게, 3=왼쪽 조도, 4=오른쪽 조도; 0~1023 환산값 |
| playNote(octave, semitone, seconds)            | 옥타브 2~6, 도=0~시=11(반음 포함), 0초 초과~8초; 연주 후 자동 꺼짐         |
| mapSensor(index, inMin, inMax, outMin, outMax) | 최신 센서값을 지정 출력 범위로 변환; 범위 밖은 제한, 소수점 유지           |
| echo(message)                                  | 메시지를 그대로 반환 (로봇 연결 없이 호출 가능)                            |

```js
// 먼저 화면의 USB 연결 버튼으로 연결합니다.
await hw.start();
await hw.servo(1, 90);
await hw.pixel(2, 255, 0, 0);
await hw.tone(440);
await hw.tone(0);
await hw.sensor(3);
await hw.stop();
```

숫자는 실제 number로 전달합니다. NaN/Infinity, 잘못된 채널은 오류입니다. 유효한 각도/RGB/밝기 범위 밖의 숫자는 범위 내로 제한합니다.
정지 후 servo/pixel/tone/blue/servos 호출은 오류이며 start()로 재개합니다. 센서는 정지 중에도 읽을 수 있습니다.
연결되지 않았거나 센서가 오래되면 sensor()는 오류를 반환합니다.
명령 완료는 상태 갱신을 의미하며 물리적인 서보 이동 완료 응답은 아닙니다.

패킷 TX: FF 55 01 UD LR GR PIXEL R G B BUZZER BLUE_LED
패킷 RX: FF 55 POT_UD POT_LR POT_GR CDS1 CDS2
