# PingPong G1 G2 G3 G4

![PingPong Gcube](./main/public/logo.png)

PingPong G1~G4

## Technical stacks

- nodejs@^20.19 (Next 16 최소 요구 20.9, oxlint/oxfmt 요구 ^20.19)
- nextjs@16 (Turbopack, App Router)
- react@19
- workspace with turborepo
- pnpm@12
- typescript@7
- @mui/material@9, @mui/material-nextjs@9
- oxlint, oxfmt

## Build and Run

```sh
pnpm install

# run dev mode
pnpm dev

# open url http://localhost:3000
```

그 밖의 명령어(프로젝트 루트에서 실행):

| 명령어              | 설명                                       |
| ------------------- | ------------------------------------------ |
| `pnpm build`        | 프로덕션 빌드                              |
| `pnpm lint`         | oxlint로 린트                              |
| `pnpm format`       | oxfmt로 `js, jsx, ts, tsx, md` 파일 포매팅 |
| `pnpm format:check` | 파일을 수정하지 않고 포매팅 검사           |

## 폴더 구조

- `main/`
  - 코디니 서비스 내에 임베딩될 iframe의 내용 부분입니다.
  - NextJS로 작성된 웹페이지의 소스코드입니다.
  - `main/app/` - 페이지. `/`(G1~G4 선택), `/g1`, `/g2`, `/g3`, `/g4`
  - `main/src/hw/` - 하드웨어 연결과 제어 명령
- `sub/typescript-config/`
  - TypeScript 설정이 포함되어 있습니다.
- `sub/ui/`
  - UI 컴포넌트 및 간단한 유틸리티 함수들이 포함되어 있습니다.

## 소스 코드 수정

- 기본적으로 `sub/` 폴더는 수정할 필요가 없습니다.
- 하지만 규모가 큰 프로젝트의 경우 기능의 일부를 라이브러리로 만들어 `sub/` 폴더에 넣을 수 있습니다
  - 이 프로젝트는 `sub/ui` 라이브러리를 추가하였습니다.
- `main/` 폴더의 소스코드에서 수정할 부분은 다음과 같습니다.
  - `main/public/logo.png` - 하드웨어 이미지 파일
  - `main/src/constant.ts` - 하드웨어 ID와 이름 설정
  - `main/src/hw/CommandRunnerBase.ts` - 연결 상태, 생명주기, 공통 연결 처리
  - `main/src/hw/CommandRunnerG1.ts` ~ `CommandRunnerG4.ts` - 모델별 연결과 제어 명령

### 하드웨어 이미지 파일 등록

하드웨어 이미지를 교체하기 위해 아래 경로에 있는 이미지를 교체해주세요. 파일명은 `logo.png` 로 해야 합니다.

- `main/public/logo.png`
- 이미지의 높이는 `200px`로 설정해야 합니다. `200px`이 아닌 경우 승인이 거부됩니다. 이미지의 너비는 `150~300px`이 적당합니다.

## 단일 페이지 vs 다중 페이지

대부분의 하드웨어는 단일 페이지로 개발하며, 접속 주소는 `http://localhost:3000/` 입니다.

하지만 PingPong 하드웨어는 다중 페이지로 구성하는 것이 좋을 것 같습니다. G1,2,3,4 별로 페이지를 구성할 수 있습니다.

### 다중 페이지 - 접속 주소

- `G1`의 접속주소는 `http://localhost:3000/g1`
- `G2`의 접속주소는 `http://localhost:3000/g2`
- `G3`의 접속주소는 `http://localhost:3000/g3`
- `G4`의 접속주소는 `http://localhost:3000/g4`

입니다.

### 다중 페이지 - 소스코드

- `G1`의 페이지 소스코드는 `main/app/g1/page.tsx`
- `G2`의 페이지 소스코드는 `main/app/g2/page.tsx`
- `G3`의 페이지 소스코드는 `main/app/g3/page.tsx`
- `G4`의 페이지 소스코드는 `main/app/g4/page.tsx`

입니다. 페이지가 프로그램의 진입점이므로 가장 먼저 살펴볼 소스 코드라고 할 수 있습니다.

### 다중 페이지 - CommandRunner

여러 페이지가 같은 `CommandRunner`를 사용할 수도 있지만, 다른 `CommandRunner`를 사용할 수도 있습니다.

- `G1`의 CommandRunner는 `main/src/hw/CommandRunnerG1.ts`
- `G2`의 CommandRunner는 `main/src/hw/CommandRunnerG2.ts`
- `G3`의 CommandRunner는 `main/src/hw/CommandRunnerG3.ts`
- `G4`의 CommandRunner는 `main/src/hw/CommandRunnerG4.ts`

입니다.

### 다중 페이지 - 로고

각 페이지 별로 로고 파일을 설정할 수 있습니다. 각 페이지의 `MainUi`에 `logoImageUrl`로 전달합니다. 다음과 같이 설정하고 있습니다.

- `G1`의 로고 파일은 `main/public/G1.png`입니다.
- `G2`의 로고 파일은 `main/public/G2.png`입니다. 연결 상태에 따라 `G2_1.png`, `G2_2.png`로 바뀝니다.
- `G3`의 로고 파일은 `main/public/G3.png`입니다.
- `G4`의 로고 파일은 `main/public/G4.png`입니다.
- `/` 페이지의 모델 선택 이미지는 `main/public/pingpong1.png` ~ `pingpong4.png`입니다.

### 하드웨어의 ID와 이름

`main/src/constant.ts` 파일에서 하드웨어 ID와 이름을 설정해주세요.

```js
// file: main/src/constant.ts

/**
 * hardware id
 */
export const HW_ID = 'pingpong-ble'

/**
 * hardware name
 */
export const HW_NAME = {
  en: 'PingPong Robot',
  ko: '핑퐁로봇',
}
```

- 하드웨어 ID는 원하는 ID로 설정할 수 있으나, 규칙에 어긋난 경우 승인이 거부됩니다.
- 영문 소문자로 시작하며 camelCase 규칙으로 설정해주세요.
- `web ble`로 연결하는 경우 하드웨어 ID는 `-ble`로 끝나야 합니다.
- `web serial`로 연결하는 경우 하드웨어 ID는 `-serial`로 끝나야 합니다.

### 하드웨어 제어 명령 추가

명령 코드는 `main/src/hw/`의 파일들로 나뉩니다.

- `CommandRunnerBase.ts` - 연결 상태, 생명주기(`init()`, `destroy()`), 공통 `getConnectionState()`, `getHwId()`, `connect()`, `disconnect()`를 구현합니다.
- `CommandRunnerG1.ts` ~ `CommandRunnerG4.ts` - `CommandRunnerBase`를 상속합니다. 모델별 BLE 연결과 제어 명령이 있습니다.

메서드의 이름이 명령어입니다. 예를 들어 블록코딩에서 `move`라는 명령어를 실행하려면 해당 모델의 `CommandRunnerGx`에 `move()` 메서드를 작성하시면 됩니다.

#### 연결 상태 변경

연결 상태를 바꿀 때는 반드시 `updateConnectionState_()`를 호출하세요. 상태가 바뀐 경우에만 이벤트를 발생시키고 부모 프레임(CODINY)에 알립니다.

```js
// file: main/src/hw/CommandRunnerG1.ts

connect = async (): Promise<boolean> => {
  // ... BLE 장치 연결

  this.updateConnectionState_('connected')
  return true
}

disconnect = async () => {
  // ... BLE 장치 연결 해제

  this.updateConnectionState_('disconnected')
}
```

#### 연결 상태 리스너

- 연결 상태 리스너 같은 이벤트 리스너들은 `init()` 에서 등록하는 것을 권장합니다.
- 그리고 `destroy()` 메서드에서 이벤트 리스너들을 해제하세요.

#### 명령어 추가

필요할 명령어들을 해당 모델의 `CommandRunnerGx.ts` 파일에 추가하세요. 메서드의 반환값은 자동으로 부모 프레임(CODINY)에 전달됩니다. 예를 들면 아래와 같이 할 수 있습니다.

```js
// file: main/src/hw/CommandRunnerG1.ts

export class CommandRunnerG1 extends CommandRunnerBase {
  // ... omit

  /**
   * 명령어: echo
   * @param what - string to echo
   * @returns echo string
   */
  echo = async (what: string): Promise<string> => {
    return what
  }
}
```

## IFRAME 플레이 그라운드에서 테스트

- 코디니 블록 공작소의 IFRAME 플레이 그라운드에서 실행해볼 수 있습니다.
- 동작하는 하드웨어를 준비하세요.
- 아래의 주소에 접속하여 IFRAME URL을 `http://localhost:3000`으로 입력하여 테스트 할 수 있습니다.
  - https://aicodiny.com/simul/hw-playground
- 코디니의 블록 공작소에 등록한 블록이 없어도 IFRAME 플레이 그라운드에서 테스트 할 수 있습니다.

### 데모 영상

IFRAME 플레이그라운드 데모 영상을 참고해주세요.

- `Marty`라는 하드웨어가 코디니와 연동하여 실행되는 영상입니다.
- 개발자의 로컬 호스트에서 코디니 운영 서버가 연동하는 과정을 확인할 수 있습니다.

- Marty Playground 데모
  - https://www.youtube.com/watch?v=89DEb8h49EA
- Marty 실행 데모
  - https://www.youtube.com/watch?v=ZYi-DQNnnLQ

## 기타

### `pingpong-utils.ts` 개선 의견

G1,2,3,4 네 개의 CommandRunner에서 `main/src/hw/pingpong-utils.ts` 을 사용하고 있어서 의견을 드립니다.

소스 코드의 여러 곳에서 사용되고 있어서 개선 의견을 드립니다만, 무시해도 괜찮습니다.

현재 아래와 같이 사용하고 있습니다.

```js
import { PingPongUtill } from './pingpong-util'
export class CommandRunnerG1 {
  pingpongutill = new PingPongUtill()

  someFn() {
    // 이런 식으로 사용하고 있습니다.
    this.pingpongutill.byteToString('....')
  }
}
```

#### 개선 1안

`main/src/hw/pingpong-utils.ts` 파일의 `class PingPongUtil`은 클래스로 만들 필요가 없습니다. 파일 자체가 이미 모듈이므로 함수로 작성하는 것이 좋습니다.

```js
import { byteToString } from './pingpong-util'
export class CommandRunnerG1 {
  someFn() {
    // 이런 식으로 사용할 수 있습니다.
    byteToString('....')
  }
}
```

#### 개선 2안

아래와 같이 클래스처럼 사용할 수도 있습니다.

```js
import * as PingPongUtil from './pingpong-utils'
export class CommandRunnerG1 {
  someFn() {
    // 이런 식으로 사용할 수 있습니다.
    PingPongUtil.byteToString('....')
  }
}
```

#### 개선 3안

어떤 이유로 `PingPongUtill`을 클래스로 만들고 싶다면, 메서드를 static으로 작성하는 것이 좋습니다.

### 배포

- PR을 보내기 전에 소스 코드를 포매팅해주세요

```sh
$  pnpm format
```

- 빌드 오류를 확인해주세요.

./_export.sh를 실행하여 에러가 없음을 확인해주세요.

```sh
$  ./_export.sh
```

End.
