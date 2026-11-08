import { expect, test, type Page } from "@playwright/test";

// Browser contract (fixture in seed.ts, db/signon.ts):
//  - customer sign-on at /signon: fields "User Name"/"Password", checkbox "Remember My User Name",
//    button /sign in|sign on/; seeded customers "shopper" and "jpuser" (ja_JP), password "pass"
//  - unauthenticated /account and /checkout (order information) redirect to /signon
//    and the requested address is remembered (returned to after sign-on)
//  - failure shows "There were errors signing you in..." with a "Try again" link
//  - header: link "Sign in" when anonymous, "Sign out" when signed on, plus search, "Account", "Cart"
//  - sign-out shows "You are signed out."; cart at /cart; <html lang> reflects the language
//  - cookie "bp_signon" holds the remembered user name
//  - supplier screens under /supplier; their sign-in page has "User id"/"Password" inputs and,
//    on rejection, the authentication error message and a link back to sign in
//  - Add to Cart is a link or button named "Add to Cart" reachable from "/"

const USER_RE = /^user ?(name|id)$/i;
const SIGN_IN_BTN = /sign[\s-]?(on|in)|log[\s-]?in/i;
const AUTH_ERROR = "There were errors signing you in";

async function signOn(page: Page, user = "shopper", password = "pass") {
  await page.goto("/signon");
  await page.getByLabel(USER_RE).fill(user);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: SIGN_IN_BTN }).click();
  await page.waitForLoadState("networkidle");
}

async function addFirstItem(page: Page) {
  await page.goto("/");
  const add = page
    .getByRole("link", { name: /add to cart/i })
    .or(page.getByRole("button", { name: /add to cart/i }));
  for (let depth = 0; depth < 4 && (await add.count()) === 0; depth++) {
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

test.describe("sign-on (e2e)", () => {
  // case: SWHR6-C-0001@v2
  test("SWHR6-C-0001 anonymous checkout order-info request redirects to sign-in and remembers address", async ({
    page,
  }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/signon/i);
    await page.getByLabel(USER_RE).fill("shopper");
    await page.getByLabel(/^password$/i).fill("pass");
    await page.getByRole("button", { name: SIGN_IN_BTN }).click();
    await page.waitForLoadState("networkidle");
    // the remembered address is returned to after sign-on
    await expect(page).toHaveURL(/checkout/i);
  });

  // case: SWHR6-C-0002@v1
  test("SWHR6-C-0002 anonymous visitor can open the cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByRole("button", { name: SIGN_IN_BTN })).toHaveCount(0);
  });

  // case: SWHR6-C-0006@v1
  test("SWHR6-C-0006 Japanese preferred language applied after sign-on", async ({ page }) => {
    await signOn(page, "jpuser");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
    await page.goto("/cart");
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
  });

  // case: SWHR6-C-0007@v1
  test("SWHR6-C-0007 sign out clears cart and session but keeps language", async ({ page }) => {
    await signOn(page, "jpuser");
    await addFirstItem(page);
    await page.getByRole("link", { name: /sign out|ログアウト|サインアウト/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("You are signed out.")).toBeVisible();
    await page.goto("/cart");
    await expect(page.getByRole("textbox", { name: /quantity/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /sign out/i })).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", /^ja/);
  });

  // case: SWHR6-C-0009@v1
  test("SWHR6-C-0009 header for signed-on visitor", async ({ page }) => {
    await signOn(page);
    await page.goto("/");
    await expect(
      page
        .getByRole("searchbox")
        .or(page.getByRole("textbox", { name: /search/i }))
        .first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /account/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /cart/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign out/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toHaveCount(0);
  });

  // case: SWHR6-C-0010@v1
  test("SWHR6-C-0010 header for anonymous visitor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign out/i })).toHaveCount(0);
  });

  // case: SWHR6-C-0011@v1
  test("SWHR6-C-0011 valid sign-on after protected request lands on account page", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/signon/i);
    await page.getByLabel(USER_RE).fill("shopper");
    await page.getByLabel(/^password$/i).fill("pass");
    await page.getByRole("button", { name: SIGN_IN_BTN }).click();
    await page.waitForURL(/\/account/);
    await expect(page.getByRole("link", { name: /sign out/i })).toBeVisible();
  });

  // case: SWHR6-C-0012@v1
  test("SWHR6-C-0012 invalid credentials show sign-on error page", async ({ page }) => {
    await signOn(page, "shopper", "wrong");
    await expect(page.getByText(AUTH_ERROR)).toBeVisible();
    await expect(page.getByRole("link", { name: /sign out/i })).toHaveCount(0);
  });

  // case: SWHR6-C-0018@v1
  test("SWHR6-C-0018 remembered user name pre-filled, password blank", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: "bp_signon", value: "shopper", url: baseURL! }]);
    await page.goto("/signon");
    await expect(page.getByLabel(USER_RE)).toHaveValue("shopper");
    await expect(page.getByLabel(/^password$/i)).toHaveValue("");
  });

  // case: SWHR6-C-0019@v1
  test("SWHR6-C-0019 default sample credentials pre-filled", async ({ page }) => {
    await page.goto("/signon");
    await expect(page.getByLabel(USER_RE)).toHaveValue("j2ee");
    await expect(page.getByLabel(/^password$/i)).toHaveValue("j2ee");
  });

  // case: SWHR6-C-0020@v1
  test("SWHR6-C-0020 unknown credentials show error with retry", async ({ page }) => {
    await signOn(page, "nobody-here", "nope");
    await expect(page.getByText(AUTH_ERROR)).toBeVisible();
    await expect(page.getByRole("link", { name: /try again/i })).toBeVisible();
  });

  // case: SWHR6-C-0021@v1
  test("SWHR6-C-0021 supplier sign-in page pre-filled with supplier", async ({ page }) => {
    await page.goto("/supplier");
    await expect(page.getByLabel(USER_RE)).toHaveValue("supplier");
    await expect(page.getByLabel(/^password$/i)).toHaveValue("supplier");
  });

  // case: SWHR6-C-0022@v1
  test("SWHR6-C-0022 wrong supplier credentials show error and link back", async ({ page }) => {
    await page.goto("/supplier");
    await page.getByLabel(USER_RE).fill("supplier");
    await page.getByLabel(/^password$/i).fill("not-the-password");
    await page.getByRole("button", { name: SIGN_IN_BTN }).click();
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(
        "You could not be authenticated with the information provided. Please check your Username and Password.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign[\s-]?in|log[\s-]?in|back/i })).toBeVisible();
  });
});
