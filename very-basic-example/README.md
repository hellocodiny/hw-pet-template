# VeryBasic

![VeryBasic](./main/public/logo.png)

An example containing the minimum basic implementation of a hardware iframe for the Codiny service.
This project is kept upgraded to the latest dependency versions, so it also serves as the reference for new projects.

## Technical stacks

- nodejs@^20.19 (Next 16 최소 요구 20.9, oxlint/oxfmt 요구 ^20.19)
- nextjs@16 (Turbopack, App Router)
- react@19
- workspace with turborepo@2
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

Other commands (run at the project root):

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `pnpm build`        | Production build (`main/out` for static export) |
| `pnpm lint`         | Lint with oxlint                                |
| `pnpm format`       | Format `js, jsx, ts, tsx, md` files with oxfmt  |
| `pnpm format:check` | Check formatting without modifying files        |

## Some Command Examples

```js
// rest
hw.foo(); // response 'bar'
await hw.echo('hello'); // response 'hello'
```

## Folder Structure

- `main/`
  - Contains the content of the iframe to be embedded in the Codiny service.
  - Includes the source code of the web page written in NextJS.
  - `main/src/hw/` - Hardware connection and control commands.
- `sub/typescript-config/`
  - Contains TypeScript configurations.
- `sub/ui/`
  - Contains ui components.

## Source Code Modification

- There is no need to modify the `sub/` folder.
- The parts to be modified in the source code of the `main/` folder are as follows:
  - `main/public/logo.png` - Register hardware image
  - `main/src/constant.ts` - Set hardware ID and name
  - `main/src/hw/CommandRunnerBase.ts` - Implement the hardware connection
  - `main/src/hw/CommandRunner.ts` - Add hardware control commands

That's all.

### Registering Hardware Image

To replace the logo file, save the file at the following path with the filename `logo.png`:

- `main/public/logo.png`
- The height of the logo file is fixed at `200px`. The width of the image is appropriate between `150~300px`.

### Setting Hardware ID and Name

Please modify the `main/src/constant.ts` file.

```js
// file: main/src/constant.ts

/**
 * hardware id
 */
export const HW_ID = 'veryBasic';

/**
 * hardware name
 */
export const HW_NAME = {
  en: 'VeryBasic',
  ko: '기본',
};
```

### Adding Hardware Control Commands

The command code is split into two files in `main/src/hw/`:

- `CommandRunnerBase.ts` - Connection state, lifecycle, and the connect/disconnect commands.
- `CommandRunner.ts` - Extends `CommandRunnerBase`. Hardware control commands are added here.

Write the method names the same as the commands used in the blocks.

#### Implementing the Connection

`CommandRunnerBase.ts` implements the methods that every hardware must provide:

- Lifecycle methods (called automatically): `init()`, `destroy()`
- Mandatory commands: `getConnectionState()`, `getHwId()`, `connect()`, `disconnect()`

The template uses `fakeConnect()` and `fakeDisconnect()` from `command-util.ts`. Replace them with the real connection code of your hardware.

```js
// file: main/src/hw/CommandRunnerBase.ts

connect = async (): Promise<boolean> => {
  await fakeConnect() // replace with the real hardware connection

  // When changing the connection state, be sure to call updateConnectionState_()
  this.updateConnectionState_('connected')
  return true
}

disconnect = async () => {
  await fakeDisconnect().catch((err) => {
    // ignore error
  })

  // When changing the connection state, be sure to call updateConnectionState_()
  this.updateConnectionState_('disconnected')
}
```

`updateConnectionState_()` emits the connection state event and notifies the parent frame (CODINY) only when the state has changed.

#### Connection State Listener

- Event listeners such as connection state listeners are recommended to be registered in the `init()` function.
- Write the code to unregister event listeners in the `destroy()` function.

For example, you can do it as follows:

```js
export class CommandRunnerBase implements IHPetCommandRunner {
  // ...

  init = async (): Promise<void> => {
    // add event listener
  }

  destroy = async () => {
    // remove event listener
  }
}
```

#### Adding a Command

Add the necessary commands to `CommandRunner.ts`. The return value is automatically sent to the parent frame (CODINY). For example, you can do it as follows:

```js
// file: main/src/hw/CommandRunner.ts

export class CommandRunner extends CommandRunnerBase {
  /**
   * command: foo
   * @returns 'bar'
   */
  foo = async (): Promise<string> => {
    return 'bar'
  }

  /**
   * command: echo
   * @param what - string to echo
   * @returns echo string
   */
  echo = async (what: string): Promise<string> => {
    return what
  }
}
```

## Testing in IFRAME Playground

- You can test in the IFRAME playground of the Codiny Block Workshop.
- Prepare functioning hardware.
- Visit the following address and enter the IFRAME URL as http://localhost:3000 to test:
  - https://aicodiny.com/simul/hw-playground
- You can test in the IFRAME Playground even if you haven't registered blocks in Codiny's Block Workshop.

### Demo Videos

Please refer to the IFRAME Playground demo videos.

- The video shows hardware named `Marty` being operated in conjunction with Codiny.
- You can observe the process of the Codiny operational server connecting with the developer's local host.

- Marty Playground Demo
  - https://www.youtube.com/watch?v=89DEb8h49EA
- Marty Execution Demo
  - https://www.youtube.com/watch?v=ZYi-DQNnnLQ

End.
