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
