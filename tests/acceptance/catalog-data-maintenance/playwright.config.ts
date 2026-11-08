import { defineConfig, devices } from "@playwright/test";

const PORT = 5179;

// Acceptance e2e config: run with
//   bunx playwright test -c tests/acceptance/catalog-data-maintenance/playwright.config.ts
// The server is always started fresh on its own port, after removing any
// sqlite.db, so the initial load runs against an empty store.
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.e2e\.ts/,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -f sqlite.db sqlite.db-shm sqlite.db-wal && bun --bun ./node_modules/vite/bin/vite.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
