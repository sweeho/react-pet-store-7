import { expect, test, type Page } from "@playwright/test";

// Contract: see inventory-management-contract.ts (test ids, fixture in seed.ts).

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: "role", value: "administrator", url: baseURL! }]);
});

async function openInventory(page: Page) {
  await page.goto("/supplier");
  await page
    .getByRole("link", { name: "Display Inventory" })
    .or(page.getByRole("button", { name: "Display Inventory" }))
    .first()
    .click();
  await expect(page.getByTestId("inventory-screen")).toBeVisible();
}

test.describe("inventory management (e2e)", () => {
  // case: SWHR6-C-0084@v1
  test("[SWHR6-C-0084] administrator sees stock rows with edit controls", async ({ page }) => {
    await openInventory(page);
    const rows = page.getByTestId("inventory-row");
    await expect(rows).toHaveCount(3);
    const first = rows.filter({ hasText: "EST-1" });
    await expect(first.getByTestId("item-id")).toHaveText("EST-1");
    await expect(first.getByTestId("existing-quantity")).toHaveText("5");
    await expect(first.locator('input[name="qty_EST-1"]')).toBeVisible();
    await expect(first.locator('input[type="checkbox"][name="item_EST-1"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /submit|update/i })).toBeVisible();
  });

  // case: SWHR6-C-0087@v1
  test("[SWHR6-C-0087] supplier entry point shows home with two actions", async ({ page }) => {
    await page.goto("/supplier");
    await expect(
      page
        .getByRole("link", { name: "Display Inventory" })
        .or(page.getByRole("button", { name: "Display Inventory" }))
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: "Logout" })
        .or(page.getByRole("button", { name: "Logout" }))
        .first(),
    ).toBeVisible();
  });

  // case: SWHR6-C-0088@v1
  test("[SWHR6-C-0088] Display Inventory action opens inventory screen", async ({ page }) => {
    await openInventory(page);
    await expect(page.getByTestId("inventory-screen")).toBeVisible();
  });

  // case: SWHR6-C-0089@v1
  test("[SWHR6-C-0089] Logout action opens logout page", async ({ page }) => {
    await page.goto("/supplier");
    await page
      .getByRole("link", { name: "Logout" })
      .or(page.getByRole("button", { name: "Logout" }))
      .first()
      .click();
    await expect(page.getByTestId("logout-page")).toBeVisible();
  });
});
