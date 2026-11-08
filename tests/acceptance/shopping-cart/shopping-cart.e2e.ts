import { expect, test, type Page } from "@playwright/test";

// Contract assumed: the cart screen lives at /cart; Add to Cart is a link or
// button named "Add to Cart"; catalog pages are reached from the landing page.

const EMPTY_MESSAGE = "Your Shopping Cart is Empty.";

async function openCart(page: Page) {
  await page.goto("/cart");
}

/** Navigate from the landing page into the catalog until an Add to Cart control is visible. */
async function gotoListWithAddToCart(page: Page) {
  await page.goto("/");
  const add = page
    .getByRole("link", { name: /add to cart/i })
    .or(page.getByRole("button", { name: /add to cart/i }));
  for (let depth = 0; depth < 4 && (await add.count()) === 0; depth++) {
    const next = page
      .getByRole("main")
      .getByRole("link", { name: /^(?!.*cart)(?!.*check)(?!.*sign).+/i })
      .first();
    await next.click();
    await page.waitForLoadState("networkidle");
  }
  await expect(add.first()).toBeVisible();
  return add;
}

async function addFirstItem(page: Page) {
  const add = await gotoListWithAddToCart(page);
  await add.first().click();
  await page.waitForURL(/cart/i);
}

/** Put two different items in the cart. */
async function addTwoItems(page: Page) {
  await addFirstItem(page);
  const add = await gotoListWithAddToCart(page);
  const count = await add.count();
  await add.nth(count > 1 ? 1 : 0).click();
  await page.waitForURL(/cart/i);
}

const qtyInputs = (page: Page) => page.getByRole("textbox", { name: /quantity/i });
const removeLinks = (page: Page) => page.getByRole("link", { name: /remove/i });
const updateButton = (page: Page) => page.getByRole("button", { name: /update cart/i });

test.describe("shopping-cart", () => {
  // case: SWHR6-C-0230@v1
  test("SWHR6-C-0230 empty cart shows empty message instead of a line list", async ({ page }) => {
    await openCart(page);
    await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible();
    await expect(qtyInputs(page)).toHaveCount(0);
    await expect(removeLinks(page)).toHaveCount(0);
  });

  // case: SWHR6-C-0231@v1
  test("SWHR6-C-0231 cart with two lines shows item link, Remove, quantity, unit cost, Update, total, Check Out", async ({
    page,
  }) => {
    await addTwoItems(page);
    await openCart(page);

    await expect(page.getByText(EMPTY_MESSAGE)).toHaveCount(0);
    const rows = page.getByRole("row").filter({ has: qtyInputs(page) });
    await expect(rows).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const row = rows.nth(i);
      await expect(row.getByRole("link").first()).toBeVisible();
      await expect(row.getByRole("link", { name: /remove/i })).toBeVisible();
      const qty = qtyInputs(row);
      await expect(qty).toBeEditable();
      await expect(qty).toHaveAttribute("maxlength", "10");
      await expect(row.getByText(/[$€£]\s?\d[\d,]*\.\d{2}/).first()).toBeVisible();
    }
    await expect(updateButton(page)).toBeVisible();
    await expect(
      page
        .getByText(/total/i)
        .locator("xpath=..")
        .getByText(/[$€£]\s?\d[\d,]*\.\d{2}/)
        .first(),
    ).toBeVisible();
    const checkOut = page.getByRole("link", { name: /check\s?out/i });
    await expect(checkOut).toBeVisible();
    await expect(checkOut).toHaveAttribute("href", /order/i);
  });

  // case: SWHR6-C-0232@v1
  test("SWHR6-C-0232 new session has an empty usable cart without sign-on", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await openCart(page);
    await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible();
    await addFirstItem(page);
    await expect(page.getByText(EMPTY_MESSAGE)).toHaveCount(0);
    await expect(qtyInputs(page)).toHaveCount(1);
    await context.close();
  });

  // case: SWHR6-C-0233@v1
  test("SWHR6-C-0233 cart contents persist across pages in a session", async ({ page }) => {
    await addTwoItems(page);
    await openCart(page);
    const before = await qtyInputs(page).evaluateAll((els) =>
      els.map((e) => (e as HTMLInputElement).name + "=" + (e as HTMLInputElement).value),
    );
    expect(before).toHaveLength(2);

    await page.goto("/");
    await page.goto("/about");
    await page.goBack();
    await openCart(page);
    const after = await qtyInputs(page).evaluateAll((els) =>
      els.map((e) => (e as HTMLInputElement).name + "=" + (e as HTMLInputElement).value),
    );
    expect(after).toEqual(before);
  });

  // case: SWHR6-C-0234@v1
  test("SWHR6-C-0234 Add to Cart adds the item from item, list and search pages", async ({
    page,
  }) => {
    // product list
    await addFirstItem(page);
    await expect(qtyInputs(page)).toHaveCount(1);

    // item page: follow the first item link from the cart
    await page
      .getByRole("row")
      .filter({ has: qtyInputs(page) })
      .first()
      .getByRole("link")
      .first()
      .click();
    await page.waitForLoadState("networkidle");
    const addOnItem = page
      .getByRole("link", { name: /add to cart/i })
      .or(page.getByRole("button", { name: /add to cart/i }));
    await expect(addOnItem.first()).toBeVisible();
    await addOnItem.first().click();
    await page.waitForURL(/cart/i);
    await expect(qtyInputs(page).first()).toHaveValue("2");

    // search results
    await page.goto("/");
    const search = page.getByRole("searchbox").or(page.getByRole("textbox", { name: /search/i }));
    await search.first().fill("a");
    await search.first().press("Enter");
    await page.waitForLoadState("networkidle");
    const addOnSearch = page
      .getByRole("link", { name: /add to cart/i })
      .or(page.getByRole("button", { name: /add to cart/i }));
    await expect(addOnSearch.first()).toBeVisible();
    await addOnSearch.first().click();
    await page.waitForURL(/cart/i);
    await expect(page.getByText(EMPTY_MESSAGE)).toHaveCount(0);
  });

  // case: SWHR6-C-0235@v1
  test("SWHR6-C-0235 Update Cart changes every line quantity in one submission", async ({
    page,
  }) => {
    await addTwoItems(page);
    await openCart(page);
    const inputs = qtyInputs(page);
    await expect(inputs).toHaveCount(2);
    await inputs.nth(0).fill("3");
    await inputs.nth(1).fill("5");
    await updateButton(page).click();
    await page.waitForLoadState("networkidle");
    await expect(qtyInputs(page).nth(0)).toHaveValue("3");
    await expect(qtyInputs(page).nth(1)).toHaveValue("5");
  });

  // case: SWHR6-C-0236@v1
  // The case is a unit-level rule; it is exercised through the cart's public
  // interface (the Update Cart form), as no module path is specified.
  for (const bad of ["abc", "1.5"]) {
    test(`SWHR6-C-0236 non-whole-number quantity "${bad}" is treated as 0`, async ({ page }) => {
      await addFirstItem(page);
      await openCart(page);
      await qtyInputs(page).first().fill(bad);
      await updateButton(page).click();
      await page.waitForLoadState("networkidle");
      const inputs = qtyInputs(page);
      const n = await inputs.count();
      if (n > 0) {
        await expect(inputs.first()).toHaveValue("0");
      } else {
        // a zero-quantity line may be dropped from the cart
        await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible();
      }
    });
  }

  // case: SWHR6-C-0237@v1
  test("SWHR6-C-0237 Add to Cart from item list adds one unit and shows the cart screen", async ({
    page,
  }) => {
    const add = await gotoListWithAddToCart(page);
    await add.first().click();
    await page.waitForURL(/cart/i);
    await expect(qtyInputs(page)).toHaveCount(1);
    await expect(qtyInputs(page).first()).toHaveValue("1");
    await expect(updateButton(page)).toBeVisible();
  });

  // case: SWHR6-C-0238@v1
  test("SWHR6-C-0238 Remove deletes the cart line", async ({ page }) => {
    await addTwoItems(page);
    await openCart(page);
    await expect(qtyInputs(page)).toHaveCount(2);
    await removeLinks(page).first().click();
    await page.waitForLoadState("networkidle");
    await expect(qtyInputs(page)).toHaveCount(1);
  });
});
