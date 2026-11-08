import { expect, test } from "@playwright/test";

// Contract assumed: the app runs the initial load on startup when the store is
// empty. GET /api/categories?locale=<locale> returns a JSON array of the
// categories in that locale; GET /api/users returns a JSON array of users,
// each exposing `username`; the four sign-on users have matching customers.
const LOCALES = ["en_US", "ja_JP", "zh_CN"];

test.describe("catalog data maintenance: initial load on new install", () => {
  // case: SWHR6-C-0176@v1
  test("SWHR6-C-0176 clean start shows five categories per locale and four users", async ({
    request,
  }) => {
    for (const locale of LOCALES) {
      const res = await request.get(`/api/categories?locale=${locale}`);
      expect(res.ok(), locale).toBeTruthy();
      expect(await res.json(), locale).toHaveLength(5);
    }
    const res = await request.get("/api/users");
    expect(res.ok()).toBeTruthy();
    const users = (await res.json()) as { username: string }[];
    expect(users.map((u) => u.username).sort()).toEqual(["j2ee", "j2ee-ja", "j2ee-zh", "shopper"]);
  });
});
