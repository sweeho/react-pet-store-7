import { expect, test, type Page } from "@playwright/test";

// Contract assumed: sign-on at a "Sign In" link with Username/Password fields
// (demo user j2ee/j2ee, override with E2E_USER/E2E_PASS); cart at /cart with a
// "Check Out" link; checkout form at /checkout with "Billing Information" and
// "Shipping Information" groups whose fields are labelled "First Name",
// "Last Name", "Address 1", "Address 2", "City", "State", "Zip", "Country",
// "Phone", "E-mail"; submit button "Continue"/"Place Order"; the order is
// POSTed to /api/orders; failures render the error page.

const USER = process.env.E2E_USER ?? "j2ee";
const PASS = process.env.E2E_PASS ?? "j2ee";
const EMPTY_ORDER = "The Shopping Cart is Empty and the order could not be placed.";
const submit = (page: Page) => page.getByRole("button", { name: /continue|place order|submit/i });

async function signOn(page: Page) {
  await page.goto("/");
  await page
    .getByRole("link", { name: /sign[\s-]?in|sign[\s-]?on|log[\s-]?in/i })
    .first()
    .click();
  await page.getByLabel(/^(user ?name|user id)$/i).fill(USER);
  await page.getByLabel(/^password$/i).fill(PASS);
  await page.getByRole("button", { name: /sign[\s-]?in|sign[\s-]?on|log[\s-]?in/i }).click();
  await page.waitForLoadState("networkidle");
}

async function addAnItem(page: Page) {
  await page.goto("/");
  const add = page
    .getByRole("link", { name: /add to cart/i })
    .or(page.getByRole("button", { name: /add to cart/i }));
  for (let d = 0; d < 4 && (await add.count()) === 0; d++) {
    await page
      .getByRole("main")
      .getByRole("link", { name: /^(?!.*cart)(?!.*check)(?!.*sign).+/i })
      .first()
      .click();
    await page.waitForLoadState("networkidle");
  }
  await add.first().click();
  await page.waitForURL(/cart/i);
}

async function toCheckout(page: Page) {
  await page
    .getByRole("main")
    .getByRole("link", { name: /^check ?out$/i })
    .click();
  await page.waitForURL(/checkout/i);
}

test.describe("checkout", () => {
  // case: SWHR6-C-0205@v1
  test("SWHR6-C-0205 successful order placement", async ({ page }) => {
    await signOn(page);
    await addAnItem(page);
    await toCheckout(page);
    const email = await page
      .getByRole("group", { name: /billing/i })
      .getByLabel(/^e-?mail$/i)
      .inputValue();
    const posted = page.waitForRequest(
      (r) => /\/api\/orders/.test(r.url()) && r.method() === "POST",
    );
    await submit(page).click();
    const req = await posted;
    expect(req.postData() ?? "").toContain(email);
    await expect(page.getByText("Your Order is Complete")).toBeVisible();
    await expect(page.getByText(email, { exact: true }).first()).toBeVisible();
    await page.goto("/cart");
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
  });

  // case: SWHR6-C-0207@v1
  test("SWHR6-C-0207 submitting with empty cart creates no order", async ({ page }) => {
    await signOn(page);
    await page.goto("/checkout");
    let posts = 0;
    page.on("response", (r) => {
      if (/\/api\/orders/.test(r.url()) && r.request().method() === "POST" && r.ok()) posts++;
    });
    await submit(page).click();
    await expect(page.getByText(EMPTY_ORDER)).toBeVisible();
    expect(posts).toBe(0);
  });

  // case: SWHR6-C-0212@v1
  test("SWHR6-C-0212 order complete screen content", async ({ page }) => {
    await signOn(page);
    await addAnItem(page);
    await toCheckout(page);
    const email = await page
      .getByRole("group", { name: /billing/i })
      .getByLabel(/^e-?mail$/i)
      .inputValue();
    await submit(page).click();
    await expect(page.getByText("Your Order is Complete")).toBeVisible();
    await expect(page.getByText(/order\s*(id|number|#)\s*:?\s*#?\d+/i).first()).toBeVisible();
    await expect(page.getByText(email, { exact: true }).first()).toBeVisible();
  });

  // case: SWHR6-C-0216@v1
  test("SWHR6-C-0216 order form prefilled for signed-on shopper", async ({ page }) => {
    await signOn(page);
    await addAnItem(page);
    await toCheckout(page);
    for (const block of [/billing information/i, /shipping information/i]) {
      const g = page.getByRole("group", { name: block });
      await expect(g).toBeVisible();
      for (const f of [
        /first name/i,
        /last name/i,
        /address 1|street.*1/i,
        /address 2|street.*2/i,
        /city/i,
        /state|province/i,
        /zip|postal/i,
        /country/i,
        /phone/i,
        /e-?mail/i,
      ]) {
        await expect(g.getByLabel(f).first()).toBeVisible();
      }
      await expect(g.getByLabel(/^first name$/i)).not.toHaveValue("");
      await expect(g.getByLabel(/^last name$/i)).not.toHaveValue("");
      await expect(g.getByLabel(/^e-?mail$/i)).not.toHaveValue("");
    }
  });

  // case: SWHR6-C-0217@v1
  test("SWHR6-C-0217 blank required field blocks submission", async ({ page }) => {
    await signOn(page);
    await addAnItem(page);
    await toCheckout(page);
    let posts = 0;
    page.on("request", (r) => {
      if (/\/api\/orders/.test(r.url()) && r.method() === "POST") posts++;
    });
    await page
      .getByRole("group", { name: /billing/i })
      .getByLabel(/^city$/i)
      .fill("");
    await submit(page).click();
    await expect(
      page
        .getByText(/city/i)
        .filter({ hasText: /empty|required/i })
        .first(),
    ).toBeVisible();
    expect(posts).toBe(0);
    await expect(page).toHaveURL(/checkout/i);
  });

  // case: SWHR6-C-0220@v1
  test("SWHR6-C-0220 error page shows message, trace and notify request", async ({ page }) => {
    await signOn(page);
    await addAnItem(page);
    await toCheckout(page);
    await page.route(/\/api\/orders/, (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Boom" }),
      }),
    );
    await submit(page).click();
    await expect(page.getByText(/boom/i).first()).toBeVisible();
    await expect(page.getByText(/stack trace|trace:|\n\s*at .+\(/i).first()).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: /notify.*administrator/i })
        .or(page.getByRole("link", { name: /notify.*administrator/i }))
        .first(),
    ).toBeVisible();
  });
});
