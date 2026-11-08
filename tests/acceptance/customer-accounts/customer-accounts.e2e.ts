import { expect, test, type Page } from "@playwright/test";

// Browser contract (fixture in seed.ts, db/customer.ts):
//  - sign-up at /signup: fields "User Name", "Password", "Repeat Password", button "Sign Up"; an
//    existing name shows a message matching /already (in use|exists|taken)/i
//  - GET /api/signon-users -> { users: [{ userName }] }
//  - details form (after sign-up) fields "First Name", "Last Name", "Address 1", "City", "State",
//    "Zip", "Country", "Phone", "E-mail", "Card Number", "Language", checkboxes "MyList"/"Banners",
//    button "Save"/"Submit"; account edit at /account/edit with the same fields
//  - sign-on at /signon with "User Name"/"Password" (seeded users use password "pass")
//  - cart at /cart; storefront root "/" has data-testid "mylist" (entries are links
//    data-testid "mylist-entry"), "banner" (data-banner="dogs|cats|..."), and <html lang>
//  - address form at /address with a "State" select

const save = (page: Page) => page.getByRole("button", { name: /^(save|submit|continue)/i });

async function signOn(page: Page, user: string) {
  await page.goto("/signon");
  await page.getByLabel(/^user ?name$/i).fill(user);
  await page.getByLabel(/^password$/i).fill("pass");
  await page.getByRole("button", { name: /sign[\s-]?(on|in)|log[\s-]?in/i }).click();
  await page.waitForLoadState("networkidle");
}

async function fillDetails(page: Page, over: Record<string, string> = {}) {
  const f: Record<string, string> = {
    "First Name": "Duke",
    "Last Name": "Java",
    "Address 1": "1 Main St",
    City: "Santa Clara",
    Zip: "95054",
    Phone: "555-0100",
    "E-mail": "duke@example.com",
    "Card Number": "4111-1111",
    ...over,
  };
  for (const [label, value] of Object.entries(f)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
}

async function signUp(page: Page, name: string) {
  await page.goto("/signup");
  await page.getByLabel(/^user ?name$/i).fill(name);
  await page.getByLabel(/^password$/i).fill("pass");
  await page.getByLabel(/repeat password/i).fill("pass");
  await page.getByRole("button", { name: /sign ?up|create|submit/i }).click();
}

test.describe("customer-accounts (e2e)", () => {
  // case: SWHR6-C-0058@v1
  test("[SWHR6-C-0058] sign-up with existing user name shows in-use message", async ({
    page,
    request,
  }) => {
    const count = async () =>
      (
        (await (await request.get("/api/signon-users")).json()).users as { userName: string }[]
      ).filter((u) => u.userName === "shopper").length;
    const before = await count();
    await signUp(page, "shopper");
    await expect(page.getByText(/already (in use|exists|taken)/i)).toBeVisible();
    expect(await count()).toBe(before);
  });

  // case: SWHR6-C-0061@v1
  test("[SWHR6-C-0061] blank city shows the customer no message", async ({ page }) => {
    await signUp(page, "newcity");
    await fillDetails(page, { City: "" });
    await save(page).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/missing|required|address data/i)).toHaveCount(0);
  });

  // case: SWHR6-C-0063@v1
  test("[SWHR6-C-0063] account edit with ja_JP replaces details and switches language", async ({
    page,
  }) => {
    await signOn(page, "editor");
    await page.goto("/account/edit");
    await fillDetails(page, { City: "Osaka-edited" });
    await page.getByLabel("Language", { exact: true }).selectOption("ja_JP");
    await save(page).click();
    await page.waitForLoadState("networkidle");
    await page.goto("/account");
    await expect(page.getByText("Osaka-edited")).toBeVisible();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
  });

  // case: SWHR6-C-0064@v1
  test("[SWHR6-C-0064] MyList shows 10 of 14 products with links", async ({ page }) => {
    await signOn(page, "mylistuser");
    await page.goto("/");
    const entries = page.getByTestId("mylist").getByTestId("mylist-entry");
    await expect(entries).toHaveCount(10);
    for (const e of await entries.all()) {
      await expect(e).toHaveAttribute("href", /.+/);
    }
  });

  // case: SWHR6-C-0065@v1
  test("[SWHR6-C-0065] unrecognised favourite category shows dogs banner", async ({ page }) => {
    await signOn(page, "bannerless");
    await page.goto("/cart");
    await expect(page.getByTestId("banner")).toHaveAttribute("data-banner", "dogs");
  });

  // case: SWHR6-C-0066@v1
  test("[SWHR6-C-0066] English address form state list", async ({ page }) => {
    await page.goto("/address");
    const options = await page
      .getByLabel("State", { exact: true })
      .locator("option")
      .allTextContents();
    expect(options.map((o) => o.trim())).toEqual(
      expect.arrayContaining(["California", "New York", "Texas"]),
    );
  });

  // case: SWHR6-C-0067@v1
  test("[SWHR6-C-0067] new user details submit signs on and returns to cart", async ({ page }) => {
    await page.goto("/cart");
    // anonymous visitor is redirected to sign-on, then signs up
    await page
      .getByRole("link", { name: /sign ?up|create/i })
      .first()
      .click();
    await page.getByLabel(/^user ?name$/i).fill("cartbuyer");
    await page.getByLabel(/^password$/i).fill("pass");
    await page.getByLabel(/repeat password/i).fill("pass");
    await page.getByRole("button", { name: /sign ?up|create|submit/i }).click();
    await fillDetails(page);
    await page.getByLabel("Language", { exact: true }).selectOption("ja_JP");
    await save(page).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
    await expect(page.getByRole("link", { name: /sign ?(out|off)|log ?out/i })).toBeVisible();
  });
});
