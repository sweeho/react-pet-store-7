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
//  - GET /api/contact-missing -> { missing: string[] } lists the contact fields recorded as missing
//    for the signed-in customer's last details submit (e.g. "city"); never shown on any page
//  - address form at /address with a "State" select
//  - GET /api/products -> { products: [{ name }] } is the full catalogue (14 products); each
//    mylist-entry's text is a product name

const save = (page: Page) =>
  page.getByRole("main").getByRole("button", { name: /^(save|submit)$/i });

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
  await page.getByLabel(/^repeat password$/i).fill("pass");
  await page.getByRole("button", { name: /^sign ?up$/i }).click();
}

test.describe("customer-accounts (e2e)", () => {
  test.use({ locale: "en-US" });

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
    await expect(
      page
        .getByRole("main")
        .getByText(/already (in use|exists|taken)/i)
        .first(),
    ).toBeVisible();
    expect(await count()).toBe(before);
  });

  // case: SWHR6-C-0061@v1
  test("[SWHR6-C-0061] blank city recorded as missing, customer sees no message", async ({
    page,
  }) => {
    await signUp(page, "newcity");
    await fillDetails(page, { City: "" });
    await save(page).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main").getByText(/missing|required|address data/i)).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    const res = await page.request.get("/api/contact-missing");
    expect(((await res.json()) as { missing: string[] }).missing).toContain("city");
  });

  // case: SWHR6-C-0063@v1
  test("[SWHR6-C-0063] account edit with ja_JP replaces details and switches language", async ({
    page,
  }) => {
    await signOn(page, "editor");
    await page.goto("/account/edit");
    await fillDetails(page, { City: "Osaka-edited", "Address 1": "9 Edited Ave" });
    await page.getByLabel("Language", { exact: true }).selectOption("ja_JP");
    await save(page).click();
    await page.waitForLoadState("networkidle");
    await page.goto("/account");
    await expect(page.getByText("Osaka-edited", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("9 Edited Ave", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("1 Main St", { exact: true })).toHaveCount(0);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
  });

  // case: SWHR6-C-0064@v1
  test("[SWHR6-C-0064] MyList shows 10 of 14 products with links", async ({ page, request }) => {
    const catalogue = (
      (await (await request.get("/api/products")).json()).products as { name: string }[]
    ).map((p) => p.name);
    expect(catalogue).toHaveLength(14);
    await signOn(page, "mylistuser");
    await page.goto("/");
    const entries = page.getByTestId("mylist").getByTestId("mylist-entry");
    await expect(entries).toHaveCount(10);
    const shown: string[] = [];
    for (const e of await entries.all()) {
      await expect(e).toHaveAttribute("href", /.+/);
      shown.push(((await e.textContent()) ?? "").trim());
    }
    const matched = catalogue.filter((name) => shown.includes(name));
    expect(matched).toHaveLength(10);
    // the other 4 catalogue products are left out
    expect(catalogue.filter((name) => !matched.includes(name))).toHaveLength(4);
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
    await expect(page.locator("html")).toHaveAttribute("lang", /^en/);
    const options = (
      await page.getByLabel("State", { exact: true }).locator("option").allTextContents()
    )
      .map((o) => o.trim())
      .filter((o) => o !== "");
    const states = [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
    ];
    expect([...options].sort()).toEqual([...states].sort());
  });

  // case: SWHR6-C-0067@v1
  test("[SWHR6-C-0067] new user details submit signs on and returns to cart", async ({ page }) => {
    await page.goto("/cart");
    // anonymous visitor is redirected to sign-on, then signs up
    await page
      .getByRole("main")
      .getByRole("link", { name: /^sign ?up$/i })
      .click();
    await page.getByLabel(/^user ?name$/i).fill("cartbuyer");
    await page.getByLabel(/^password$/i).fill("pass");
    await page.getByLabel(/^repeat password$/i).fill("pass");
    await page.getByRole("button", { name: /^sign ?up$/i }).click();
    await fillDetails(page);
    await save(page).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/cart/);
    await expect(
      page
        .getByRole("banner")
        .getByRole("link", { name: /sign ?(out|off)|log ?out/i })
        .first(),
    ).toBeVisible();
  });
});
