import { defineConfig, devices } from "@playwright/test";

const PORT = 5182;

// Acceptance e2e config: run with
//   bunx playwright test -c tests/acceptance/customer-accounts/playwright.config.ts
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.e2e\.ts/,
  reporter: "list",
  workers: 1,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -f sqlite.db sqlite.db-shm sqlite.db-wal && bun --bun tests/acceptance/customer-accounts/seed.ts && bun --bun ./node_modules/vite/bin/vite.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
