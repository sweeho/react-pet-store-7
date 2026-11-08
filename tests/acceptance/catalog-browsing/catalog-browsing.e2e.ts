import { expect, test, type Page } from "@playwright/test";

// Contract: see catalog-browsing-contract.ts (test ids, language links, fixture in seed.ts).

const sidebar = (page: Page) => page.getByTestId("category-sidebar");
const next = (page: Page) => page.getByRole("link", { name: /next/i });
const previous = (page: Page) => page.getByRole("link", { name: /previous/i });
const addToCart = (page: Page) =>
  page
    .getByRole("link", { name: /add to cart/i })
    .or(page.getByRole("button", { name: /add to cart/i }));

const LANG = {
  en_US: /^(english|en)$/i,
  ja_JP: /japanese|日本語/i,
  zh_CN: /chinese|中文/i,
};
async function chooseLanguage(page: Page, locale: keyof typeof LANG) {
  await page
    .getByRole("link", { name: LANG[locale] })
    .or(page.getByRole("button", { name: LANG[locale] }))
    .first()
    .click();
  await page.waitForLoadState("networkidle");
}

async function categoryNames(page: Page, locale: string): Promise<string[]> {
  const res = await page.request.get(`/api/categories?locale=${locale}`);
  const rows = (await res.json()) as { name: string }[];
  return rows.map((r) => r.name);
}

/** From the home page: Dogs -> the "Paging Hounds" product (paging through the product list) -> its item list. */
async function openHoundList(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /dogs/i }).first().click();
  const link = page.getByRole("link", { name: "Paging Hounds" });
  for (let i = 0; i < 5 && (await link.count()) === 0; i++) await next(page).click();
  await link.click();
  await expect(page.getByTestId("item-row").first()).toBeVisible();
}

const row = (page: Page, name: string) => page.getByTestId("item-row").filter({ hasText: name });

async function openHoundDetail(page: Page, name = "Hound 1") {
  await openHoundList(page);
  await row(page, name).getByRole("link", { name }).click();
  await expect(page.getByTestId("item-detail")).toBeVisible();
}

test.describe("catalog browsing: locales", () => {
  // case: SWHR6-C-0179@v1
  test("SWHR6-C-0179 default locale shows en_US content", async ({ page }) => {
    await page.goto("/");
    for (const name of await categoryNames(page, "en_US")) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
    for (const name of await categoryNames(page, "ja_JP")) {
      await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    }
    await openHoundList(page);
    await expect(row(page, "Hound 1")).toBeVisible();
  });

  // case: SWHR6-C-0180@v1
  test("SWHR6-C-0180 ja_JP item shows Japanese name, description and price", async ({ page }) => {
    await openHoundDetail(page);
    await chooseLanguage(page, "ja_JP");
    const detail = page.getByTestId("item-detail");
    await expect(detail).toContainText("ハウンド1");
    await expect(detail).toContainText("ハウンド1の説明");
    await expect(detail).toContainText(/[¥￥]\s?1,?800/);
    await expect(detail).not.toContainText("Hound 1");
  });

  // case: SWHR6-C-0201@v1
  test("SWHR6-C-0201 ja_JP price is shown as yen and not converted", async ({ page }) => {
    await openHoundDetail(page);
    await chooseLanguage(page, "ja_JP");
    const text = (await page.getByTestId("item-detail").innerText()) ?? "";
    expect(text).toMatch(/[¥￥]\s?1,?800\b/); // stored ja_JP unit cost
    expect(text).toMatch(/[¥￥]\s?2,?400\b/); // stored ja_JP list price
    expect(text).not.toMatch(/15\.00/); // not the en_US price
    expect(text).not.toContain("$");
  });

  // case: SWHR6-C-0194@v1
  test("SWHR6-C-0194 switching to Chinese localises page and cart", async ({ page }) => {
    await openHoundDetail(page);
    await addToCart(page).first().click();
    await page.waitForURL(/cart/i);
    await expect(page.getByText("Hound 1")).toBeVisible();
    await chooseLanguage(page, "zh_CN");
    await page.goto("/cart");
    await expect(page.getByText("猎犬1")).toBeVisible();
    await expect(page.getByText("Hound 1")).toHaveCount(0);
    const zhCategories = await categoryNames(page, "zh_CN");
    await expect(page.getByText(zhCategories[0], { exact: true }).first()).toBeVisible();
  });
});

test.describe("catalog browsing: navigation and lists", () => {
  // case: SWHR6-C-0185@v1
  test("SWHR6-C-0185 item list without paging parameters shows items 1 and 2 with Next only", async ({
    page,
  }) => {
    await openHoundList(page);
    await expect(page.getByTestId("item-row")).toHaveCount(2);
    await expect(row(page, "Hound 1")).toBeVisible();
    await expect(row(page, "Hound 2")).toBeVisible();
    await expect(next(page)).toBeVisible();
    await expect(previous(page)).toHaveCount(0);
  });

  // case: SWHR6-C-0186@v1
  test("SWHR6-C-0186 third page shows the last item with Previous only", async ({ page }) => {
    await openHoundList(page);
    await next(page).click();
    await next(page).click();
    await expect(page.getByTestId("item-row")).toHaveCount(1);
    await expect(row(page, "Hound 5")).toBeVisible();
    await expect(previous(page)).toBeVisible();
    await expect(next(page)).toHaveCount(0);
  });

  // case: SWHR6-C-0193@v1
  test("SWHR6-C-0193 choosing Dogs on the home page opens the Dogs product list", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /dogs/i }).first().click();
    await expect(page.getByTestId("product-row").first()).toBeVisible();
    const link = page.getByRole("link", { name: "Paging Hounds" });
    for (let i = 0; i < 5 && (await link.count()) === 0; i++) await next(page).click();
    await expect(link).toBeVisible();
  });

  // case: SWHR6-C-0189@v1
  test("SWHR6-C-0189 sidebar shows 5 category links that open product lists", async ({ page }) => {
    await page.goto("/");
    const links = sidebar(page).getByRole("link");
    await expect(links).toHaveCount(5);
    const target = (await links.first().innerText()).trim();
    await links.first().click();
    await expect(page.getByTestId("product-row").first()).toBeVisible();
    expect(target.length).toBeGreaterThan(0);
  });
});

test.describe("catalog browsing: item detail and prices", () => {
  // case: SWHR6-C-0187@v1
  test("SWHR6-C-0187 item detail screen shows all elements", async ({ page }) => {
    await openHoundDetail(page);
    const detail = page.getByTestId("item-detail");
    await expect(detail).toContainText("Hound 1");
    await expect(detail).toContainText("Loud barker");
    await expect(detail.getByRole("img").first()).toBeVisible();
    await expect(detail).toContainText(/List Price/i);
    await expect(detail).toContainText(/\$20\.00/);
    await expect(detail).toContainText(/Your Price/i);
    await expect(detail).toContainText(/\$15\.00/);
    await expect(addToCart(page).first()).toBeVisible();
  });

  // case: SWHR6-C-0188@v1
  test("SWHR6-C-0188 list shows list price while search shows unit cost", async ({ page }) => {
    await openHoundList(page);
    await expect(row(page, "Hound 1")).toContainText("20.00");
    await expect(row(page, "Hound 1")).not.toContainText("15.00");

    await page.goto("/");
    await page.getByRole("searchbox").first().fill("Hound 1");
    await page.keyboard.press("Enter");
    await expect(row(page, "Hound 1")).toBeVisible();
    await expect(row(page, "Hound 1")).toContainText("15.00");
    await expect(row(page, "Hound 1")).not.toContainText("20.00");
  });
});

test.describe("catalog browsing: search", () => {
  // case: SWHR6-C-0197@v1
  test("SWHR6-C-0197 empty or unmatched search shows the no-results message", async ({ page }) => {
    const message = page.getByText("No results were found for your search.");
    await page.goto("/");
    await page.getByRole("searchbox").first().fill("");
    await page.keyboard.press("Enter");
    await expect(message).toBeVisible();

    await page.goto("/");
    await page.getByRole("searchbox").first().fill("zzzznomatchzzzz");
    await page.keyboard.press("Enter");
    await expect(message).toBeVisible();
  });
});
