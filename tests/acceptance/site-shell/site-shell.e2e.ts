import { expect, test } from "@playwright/test";

// Primary areas per the change's design.md; each is routed at /<key>.
const PRIMARY_AREAS = [
  "sign-on",
  "customer-accounts",
  "catalog-browsing",
  "shopping-cart",
  "checkout",
  "inventory-management",
];

test.describe("site-shell", () => {
  // case: SWHR6-C-0293@v1
  test("SWHR6-C-0293 root route shows landing page linking to all primary areas", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();

    const main = page.getByRole("main");
    for (const key of PRIMARY_AREAS) {
      await expect(main.locator(`a[href="/${key}"]`), `landing page links to ${key}`).toBeVisible();
    }
  });

  // case: SWHR6-C-0294@v1
  test("SWHR6-C-0294 global navigation with home link appears on every page", async ({ page }) => {
    // Discover every page reachable through the global navigation, starting at "/".
    const nav = () => page.getByRole("navigation", { name: "Global" });
    const visited = new Set<string>();
    const queue = ["/"];
    while (queue.length > 0) {
      const path = queue.shift()!;
      if (visited.has(path)) continue;
      visited.add(path);

      await page.goto(path);
      await expect(nav(), `global navigation on ${path}`).toBeVisible();
      await expect(nav().locator('a[href="/"]'), `home link on ${path}`).not.toHaveCount(0);

      const hrefs = await nav()
        .locator("a")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        if (href.startsWith("/") && !visited.has(href)) queue.push(href);
      }
    }
    expect(visited.size, "navigation reaches more than the landing page").toBeGreaterThan(1);

    const other = [...visited].find((p) => p !== "/")!;
    await page.goto(other);
    await nav().locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);
  });
});
