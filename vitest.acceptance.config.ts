import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.config";

// The locked acceptance suite (tests/acceptance/**). It is written before the
// product code and stays red until the Build phase makes it pass, so the default
// `bun run test` excludes it and it runs only through `bun run test:acceptance`.
// Browser specs under tests/acceptance/<capability>/e2e/ belong to
// playwright.acceptance.config.ts and are never collected here.
//
// Same split as vitest.config.ts: .test.tsx (UI) runs in jsdom, .test.ts in node,
// where db/client.ts's bun:sqlite import can resolve.
export default mergeConfig(
  { plugins: base.plugins, resolve: base.resolve },
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "acceptance-ui",
            environment: "jsdom",
            setupFiles: ["./src/test/setup.ts"],
            css: false,
            include: ["tests/acceptance/**/*.test.tsx"],
            exclude: ["tests/acceptance/**/e2e/**"],
          },
        },
        {
          extends: true,
          test: {
            name: "acceptance",
            environment: "node",
            include: ["tests/acceptance/**/*.test.ts"],
            exclude: ["tests/acceptance/**/e2e/**"],
          },
        },
      ],
    },
  }),
);
