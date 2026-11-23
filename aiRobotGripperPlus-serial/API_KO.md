# 2단계 제어 함수

화면과 추후 코디니 블록에서 같은 CommandRunner 함수를 사용합니다.
실제 makerKit.hw.run 라우팅 접두어는 KT 등록 확인 전입니다.

| 함수                              | 인자                                                                  |
| --------------------------------- | --------------------------------------------------------------------- |
| setTargets(ids)                   | 최초 검색된 로봇 번호 배열. 직접 연결 로봇은 자동 포함                |
| servo(channel, angle)             | 관절1상하/2좌우/3집게, 각도0~180                                      |
| pixel(target,r,g,b)               | target0왼묶음/1오른묶음/2전체/3~6개별1~4, RGB0~255                    |
| motor(direction, speed?)          | 0정지/1전진/2후진/3좌/4우. speed 생략은 기본동작, 지정0~255는 1/3/4만 |
| moveFor(direction,seconds,speed?) | 지정 시간 이동 후 바퀴 정지                                           |
| playNote(octave,note,seconds)     | 옥타브2~6, 반음번호0~11, 시간0~3600초; 최대2040Hz                     |
| toneOff()                         | 부저 정지                                                             |
| stop()                            | 전체 출력 정지, 대기 명령 취소                                        |
| sensor(name)                      | left/right 원시0~1, distance 초음파cm. 오래된 값은 오류               |
| disconnect()                      | 출력 정지 후 BLE 연결 해제 명령 및 USB 스트림 닫기                    |

펌웨어를 바꾸거나 사용자용 제어 재개/출력 정지 블록을 추가하지 않았습니다. 현재 정지는 하드웨어 시험 화면 버튼입니다.

## 3단계 추가

| 함수                                      | 동작                                                       |
| ----------------------------------------- | ---------------------------------------------------------- |
| pixelIndex(index,r,g,b)                   | 개별LED1~4, 번호 반올림 후 wire target3~6 변환             |
| mapSensor(name,inMin,inMax,outMin,outMax) | sensor값을 지정 범위로 매핑. 범위 밖 제한/역방향/소수 지원 |
| monitorSensor(name)                       | 교구창의 센서 모니터에 최신값 표시. 중복 등록 없음         |
| clearMonitors()                           | 블록 센서 모니터만 지움                                    |
| waitSeconds(seconds)                      | 0~3600초 대기. 교구창 stop/연결 변경 시 취소 오류          |
| moveForBlock(direction,seconds,speed?)    | moveFor와 동일 제어. 교구 정지/대상 변경 시 취소 오류      |
| playNoteBlock(octave,note,seconds)        | playNote와 동일 제어. 교구 정지/대상 변경 시 취소 오류     |

블록 제너레이터는 시간 지정 명령에 Block 함수를 사용하여 정지 후 후속 코드가 정상 완료로 이어지지 않도록 합니다. 실제 코디니 실행기의 오류 처리 및 전체 정지 이벤트 연동은 서비스 등록 후 검증 대상입니다.
