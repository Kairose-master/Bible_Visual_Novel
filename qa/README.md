Run npm install --no-save playwright @axe-core/playwright then npx playwright install chromium. Start bun run dev, then node qa/playthrough.cjs and node qa/accessibility.cjs. Set APP_URL to target a deployment; set CHROMIUM_PATH only for a custom browser executable. Generated screenshots are local QA artifacts.


최신 시네마틱 버전: `qa/premium.cjs`가 영상·음성·37컷·접근성·실패 경로를, `qa/playthrough.cjs`가 전체 게임 진행을 검증합니다. 두 스크립트는 APP_URL과 CHROMIUM_PATH를 지원합니다. 이전 기기 음성용 animation 스크립트는 제거했습니다.
