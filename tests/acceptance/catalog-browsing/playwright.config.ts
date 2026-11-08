import { defineConfig, devices } from "@playwright/test";

const PORT = 5180;

// Acceptance e2e config: run with
//   bunx playwright test -c tests/acceptance/catalog-browsing/playwright.config.ts
// The store is rebuilt and the fixture in seed.ts loaded before the server starts.
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.e2e\.ts/,
  reporter: "list",
  workers: 1,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -f sqlite.db sqlite.db-shm sqlite.db-wal && bun --bun tests/acceptance/catalog-browsing/seed.ts && bun --bun ./node_modules/vite/bin/vite.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
