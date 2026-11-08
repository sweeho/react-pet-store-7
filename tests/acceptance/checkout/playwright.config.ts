import { defineConfig, devices } from "@playwright/test";

const PORT = 5178;

// Acceptance e2e config: run with
//   bunx playwright test -c tests/acceptance/checkout/playwright.config.ts
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.e2e\.ts/,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bun --bun ./node_modules/vite/bin/vite.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
