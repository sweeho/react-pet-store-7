import { expect, test, type Page } from "@playwright/test";

// Primary areas per the change's design.md; matched by accessible link name.
const PRIMARY_AREAS: Array<{ key: string; name: RegExp }> = [
  { key: "sign-on", name: /sign[\s-]?on|sign[\s-]?in|log[\s-]?in/i },
  { key: "customer-accounts", name: /account/i },
  { key: "catalog-browsing", name: /catalog/i },
  { key: "shopping-cart", name: /cart/i },
  { key: "checkout", name: /checkout/i },
  { key: "inventory-management", name: /inventory/i },
];

async function expectNotNotFound(page: Page) {
  await expect(page.getByRole("heading", { name: "Not Found" })).toHaveCount(0);
}

test.describe("site-shell", () => {
  // case: SWHR6-C-0293@v1
  test("SWHR6-C-0293 root route shows landing page linking to all primary areas", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNotNotFound(page);

    const main = page.getByRole("main");
    for (const area of PRIMARY_AREAS) {
      const link = main.getByRole("link", { name: area.name }).first();
      await expect(link, `landing page links to ${area.key}`).toBeVisible();
      const href = await link.getAttribute("href");
      expect(href, `${area.key} link has a route`).toMatch(/^\/[^#]+/);

      await page.goto(href!);
      await expectNotNotFound(page);
      await page.goto("/");
    }
  });

  // case: SWHR6-C-0294@v1
  test("SWHR6-C-0294 global navigation with home link appears on every page", async ({ page }) => {
    await page.goto("/");
    const hrefs = new Set<string>(["/"]);
    const landingNav = page.getByRole("navigation").first();
    await expect(landingNav).toBeVisible();
    for (const area of PRIMARY_AREAS) {
      const href = await landingNav
        .getByRole("link", { name: area.name })
        .first()
        .getAttribute("href");
      expect(href, `navigation has an entry for ${area.key}`).toBeTruthy();
      hrefs.add(href!);
    }
    expect(hrefs.size).toBeGreaterThan(1);

    for (const href of hrefs) {
      await page.goto(href);
      const nav = page.getByRole("navigation").first();
      await expect(nav, `navigation on ${href}`).toBeVisible();
      await expect(
        nav.getByRole("link", { name: /home|landing|^vortex$|logo/i }).first(),
      ).toBeVisible();
    }

    const other = [...hrefs].find((h) => h !== "/")!;
    await page.goto(other);
    await page
      .getByRole("navigation")
      .first()
      .getByRole("link", { name: /home|landing|^vortex$|logo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
