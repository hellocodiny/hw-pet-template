# HW PET TEMPLATE

> 기존의 GITHUB 계정을 분실하였습니다.
> 그래서 새로운 계정(hellocodiny)을 만들고, 기존의 GITHUB 리포지토리를 fork 하여 이 프로젝트를 생성하였습니다.
> 앞으로는 여기서 프로젝트를 진행하겠습니다.
> 
> 2024년 11월 07일

> I have lost access to my previous GitHub account.
> Therefore, I created a new account (hellocodiny) and forked the existing GitHub repository to set up this project.
> From now on, I will continue working on this project here.
>
> November 7, 2024

This GitHub repository collects hardware control programs that are integrated with the AI Codiny service.

The subfolders in this repository contain source code for independent deployable web pages, each integrating with a specific hardware.

To add hardware to the AI Codiny service, it is recommended to copy and modify one of the subfolders.

## Hardware examples

The currently registered hardware includes the following:

- [very-basic-example](./very-basic-example/README.md) - An example containing the minimum basic implementation.
- [saeonAltinoLite-ble](./saeonAltinoLite-ble/README.md) - `알티노 라이트` 하드웨어 제어(한글 설명).
- [saeonSmartFarm-serial](./saeonSmartFarm-serial/README.md) - `스마트팜` 하드웨어 제어(한글 설명).
- [marty](./marty/README.md) - Code for controlling the `Marty(ble)` hardware.
- [exMarsCube](./exMarsCube/README.md) - Code for controlling the `exMarsCube(ble)` hardware.

> `very-basic-example`은 의존성을 최신 버전으로 계속 업그레이드합니다. 신규 프로젝트를 작성하거나 기존 프로젝트의 의존성을 올릴 때 `package.json`, 설정 파일, 소스 코드를 참고하세요. 나머지 하위 프로젝트는 이전 버전의 의존성을 사용할 수 있습니다.

> `very-basic-example` is kept upgraded to the latest dependency versions. When creating a new project or upgrading the dependencies of an existing one, refer to its `package.json`, configuration files, and source code. The other subfolders may use older dependency versions.

## Code Deployment

The code written by each company is deployed to the AI Codiny server by the AI Codiny administrator. If you wish to deploy, please send a deployment request email.

When deploying, the AI Codiny administrator executes the `_export.sh` command. Before sending the deployment request email, please execute `_export.sh` to ensure there are no issues.

## Development Guidelines

In general, we do not interfere with the source code of each company. It just needs to work.

However, it is recommended to run lint on the source code before committing.

```sh
cd main
pnpm lint
```

End.
