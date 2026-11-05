import { defineConfig, devices } from "@playwright/test";

import base from "./playwright.config";

// Browser specs of the locked acceptance suite (tests/acceptance/<capability>/e2e/).
// Red until the Build phase makes them pass; run only via `bun run test:acceptance:e2e`.
//
// Timeouts stay generous on purpose: the merge gate reads this run on every Build
// ticket, and a sign-in-and-checkout flow takes several seconds on a CI runner.
// Shorter waits failed working flows by timeout.
// retries: 0 — the merge gate reads one run, and a retry hides an unreliable test.
export default defineConfig({
  ...base,
  testDir: "./tests/acceptance",
  testMatch: "**/e2e/**/*.spec.ts",
  timeout: 15_000,
  expect: { timeout: 5_000 },
  retries: 0,
  reporter: process.env.CI
    ? [["list"], ["junit", { outputFile: ".vortex-results/acceptance/e2e-junit.xml" }]]
    : "list",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // An agent container's small /dev/shm hangs Chromium.
        launchOptions: { args: ["--disable-dev-shm-usage"] },
      },
    },
  ],
});
