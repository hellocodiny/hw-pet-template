# 제출용 검증 결과

2026-11-22, Linux, Node.js 24.22.3, pnpm 8.15.4

- _export.sh 실행 완료: frozen-lockfile 설치 및 배포 빌드 성공.
- 컴파일, lint/타입 검사, 정적 페이지 생성 통과. main/out/index.html 생성 확인.
- 통신/제어 회귀 검사 22개 통과 (제출용과 동일한 소스).
- 제출용 블록 검사 12개 통과 (네오픽셀 모두 끄기와 삭제 블록 부재 포함).
- 로컬 Blockly 화면 미포함. 펌웨어 변경 없음.
- 운영 코디니 등록, 라우팅, 전체 실행/정지 이벤트와 새 블록 실물 시험은 미완료.
- GitHub push, PR 생성 및 메일 발송은 수행하지 않음.

## 의존성 업그레이드 (2026-11-23)

- React 19, Next 16, MUI 9, TypeScript 7, turbo 2, oxlint/oxfmt 적용. ESLint/Prettier 제거.
- `pnpm audit`: 취약점 0건.
- `pnpm typecheck`, `pnpm test`(22개), `node --test tests/blocks.cjs`(12개), `pnpm format:check`, `pnpm lint`(경고 0건), `pnpm build`(BASE_PATH `/`와 `.env.production` 값) 통과.
- 실제 로봇과 USB 연결은 이 변경 후 확인하지 않았습니다.
