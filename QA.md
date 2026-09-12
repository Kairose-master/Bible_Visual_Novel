# Verification — 2026-09-12 composition update

- Higgsfield production build: TypeScript + Vite SSR/client PASS, source commit 2fbba98.
- Portable Vite production build PASS; Bun 6 tests / 426 assertions PASS.
- Real Chromium WebGL / SwiftShader: all 24 investigations and responses completed at widths 1440, 390 and 320; all six chapter GLBs loaded with embedded textures, four ending cards present, no page/console errors or horizontal overflow.
- Additional 960px breakpoint test: first chapter completed with the desktop narrative overlay.
- Expanded-scene mode hides/restores the narrative; rotation and reset work. Each current investigation unlocks responses, premature choice remains disabled.
- Mobile 125% font and keyboard observation/response PASS. axe-core WCAG2A/AA/2.1AA: zero violations in the tested reader state.
- Low quality mode reloaded actual geometry and textures. Blocked chapter-GLB request correctly offered the explicit text fallback.
- Blender delivery render and all six final browser scenes visually inspected. Unsupported masonry removed; arch spans joined; broad horizon ridges replace repeated display stones.
- Master GLB: 4,740,132 bytes. Runtime chapters: 547,616 / 1,446,080 / 1,222,672 / 880,432 / 882,604 / 790,612 bytes. Only the current chapter downloads.
- The rendering telemetry in qa/browser-results.json proves geometry and textures are present. SwiftShader frame rates are not a real-device GPU benchmark.
- Known limits: stylized sculptural models, no skeletal animation/lip-sync/physics; no full Safari/Android hardware matrix; no professional theological sign-off.

Run qa/playthrough.cjs and qa/accessibility.cjs as described in qa/README.md.


## 설명 애니메이션 추가 검증 (2026-09-12)
- 6편, 37컷 탐색 및 완료 상태 확인.
- 1440/390/320px 전체 24패널 완주, 960px 첫 장 검증. 설명을 건너뛴 뒤의 진행, 장별 다시 보기, 상태 유지 확인.
- 모바일 axe WCAG 2 A/AA 및 2.1 AA 위반 0건. 정지/재생/스크럽/ESC/동작 줄이기/3D 로딩 실패 대본 경로 확인.
- 모의 음성 엔진으로 발화 종료까지 컷 유지 및 정지·닫기의 취소 동작 검증. 실제 한국어 음성 품질은 기기별입니다.
- 기본 게임 테스트 6개, 426개 assertion 통과. 소프트웨어 WebGL 검증이며 실제 휴대폰 프레임률 보장은 하지 않습니다.


## 시네마틱/음성 출시 검증
6개 실제 한국어 MP3와 6개 H.264 영상의 로딩, 자동 재생 정책 처리, 음소거, 정지, 탐색, 37컷 종료, 닫기 시 음성 정리 통과. 모바일 axe 위반 0건. 자막 타이밍은 발화 대조 후 조정했으며 단어 단위 립싱크는 아닙니다.
