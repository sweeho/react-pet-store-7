import { render } from "@testing-library/react";
import { MemoryRouter, Outlet, useRoutes, type RouteObject } from "react-router";
import type { ComponentType } from "react";

/**
 * Renders the application's real page modules (src/pages) at a URL, the way
 * vite-plugin-pages mounts them, which vitest does not load. Contract:
 *  - a page module exports its component as default;
 *  - `src/pages/_layout.tsx`, when present, wraps every page and renders an <Outlet/>;
 *  - the shared empty frame carries data-testid="empty-frame";
 *  - the shared error frame carries data-testid="error-frame" and contains a
 *    button named "Retry".
 */
const modules = import.meta.glob<{ default?: ComponentType }>(
  ["/src/pages/**/*.tsx", "!/src/pages/**/*.test.tsx"],
  { eager: true },
);

function toPath(file: string): string {
  return file
    .replace("/src/pages/", "")
    .replace(/\.tsx$/, "")
    .replace(/(^|\/)index$/, "")
    .replace(/\[\.\.\.[^\]]+\]/g, "*")
    .replace(/\[([^\]]+)\]/g, ":$1");
}

function buildRoutes(): RouteObject[] {
  const Layout = modules["/src/pages/_layout.tsx"]?.default;
  const children: RouteObject[] = Object.entries(modules)
    .filter(([file]) => !file.endsWith("/_layout.tsx") && modules[file].default)
    .map(([file, mod]) => {
      const Page = mod.default!;
      return { path: toPath(file) || undefined, index: toPath(file) === "", element: <Page /> };
    });
  return Layout
    ? [{ path: "/", element: <Layout />, children }]
    : [{ path: "/", element: <Outlet />, children }];
}

function Routes() {
  return useRoutes(buildRoutes());
}

export function renderApp(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes />
    </MemoryRouter>,
  );
}
