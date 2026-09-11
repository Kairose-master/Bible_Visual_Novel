# Verification — 2026-09-11

- Higgsfield production build: TypeScript + Vite SSR/client PASS (commit 96b3b0f).
- Portable Vite production build: PASS.
- Bun unit tests: 6 tests, 426 assertions PASS. All 63 choices, panel transitions, three reflective endings, observation gates and duplicate/stale input tested.
- Chromium WebGL / SwiftShader: complete 24-observation/24-response playthrough at widths 1440, 390, 320. Every chapter loaded its GLB root, rendered geometry, and reached final reflection. No page errors or horizontal overflow. This is software-rendered CI evidence, not a mobile GPU performance benchmark.
- First-scene camera rotation/zoom/reset, notes with all four layers, chapter interludes, 4 ending cards and reload-to-cover checked.
- Keyboard observation and numeric response, font125%, lower-quality reload, blocked future observation, failed-GLB text fallback checked.
- axe-core WCAG2A/AA/2.1AA scan on mobile reader: zero violations in tested state. Not a comprehensive accessibility certification.
- localStorage/sessionStorage/cookies: empty throughout tested playthroughs.
- Blender preview and all six WebGL scenes visually inspected. Scene artifact: 6 roots, 466 meshes, 2,101,112-byte GLB. Runtime batches by material to roughly 13–26 draw calls in sampled balanced views; shadows increase triangle render counts.
- Known limitations: stylized sculptural characters without skeletal animation, no physics or lip-sync; no real-device Safari/GPU matrix; first WebGL download adds about2.1MB and Three.js chunk; no professional theological sign-off.
