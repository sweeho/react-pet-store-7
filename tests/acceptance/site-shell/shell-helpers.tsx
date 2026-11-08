import type { ComponentType } from "react";

/**
 * Locates the shell's shared components by file name under src/components,
 * so the tests do not depend on a single directory layout. Contract:
 *  - a layout module (file name contains "layout") exporting a component that
 *    renders its `children` (or a router <Outlet/>) inside header/nav/footer;
 *  - an empty-frame module (file name contains "empty"), default or named export;
 *  - an error-frame module (file name contains "error") taking `onRetry`.
 */
const modules = import.meta.glob<Record<string, unknown>>(
  ["/src/components/**/*.tsx", "!/src/components/**/*.test.tsx"],
  { eager: true },
);

export function findShared(fileHint: RegExp): ComponentType<Record<string, unknown>> {
  const entry = Object.entries(modules).find(([path]) =>
    fileHint.test(path.split("/").pop() ?? ""),
  );
  if (!entry) throw new Error(`No shared component file matching ${fileHint} under src/components`);
  const mod = entry[1];
  const exported =
    mod.default ??
    Object.entries(mod).find(([k, v]) => typeof v === "function" && fileHint.test(k))?.[1] ??
    Object.values(mod).find((v) => typeof v === "function");
  if (typeof exported !== "function") throw new Error(`${entry[0]} exports no component`);
  return exported as ComponentType<Record<string, unknown>>;
}
