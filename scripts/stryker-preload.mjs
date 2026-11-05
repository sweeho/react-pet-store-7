// Bun preload for `bun run test:mutation`.
// Stryker's instrumenter loads @babel/core, which installs an
// Error.prepareStackTrace hook. Under Bun that hook makes Error.captureStackTrace
// throw "First argument must be an Error object" when Vite (pulled in by the
// vitest runner) builds its error classes at import time, so the plugin fails
// to load. Importing the runner first evaluates Vite before the hook exists.
await import("@stryker-mutator/vitest-runner");
