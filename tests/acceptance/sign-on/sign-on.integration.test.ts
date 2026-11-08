// @vitest-environment node
import { describe, expect, it } from "vitest";

import { clockedStore, MIN, signedOn, signOnDb, signOnMod } from "./sign-on-contract";

const config = { protectedPatterns: ["/account"] };
const SCREENS = ["home", "inventory-display", "inventory-update", "logout"];

describe("sign-on integration", () => {
  // case: SWHR6-C-0003@v1
  it("SWHR6-C-0003 supplier screens require the administrator role", async () => {
    const { guardSupplier } = await signOnMod();
    const { store } = await clockedStore();
    const anonymous = store.create("supplier");
    const noRole = signedOn(store, "supplier", ["customer"]);
    const clerk = signedOn(store, "supplier", ["administrator"]);
    clerk.userName = "stockclerk";
    for (const screen of SCREENS) {
      for (const s of [anonymous, noRole]) {
        expect(guardSupplier({ screen, session: s })).toEqual({
          allowed: false,
          page: "supplier-signin",
        });
      }
      expect(guardSupplier({ screen, session: clerk }).allowed).toBe(true);
    }
  });

  // case: SWHR6-C-0004@v1
  it("SWHR6-C-0004 signed-on visitor of any role reaches protected pages", async () => {
    const { guardStorefront } = await signOnMod();
    const { store } = await clockedStore();
    for (const roles of [[], ["customer"], ["administrator"]]) {
      const session = signedOn(store, "storefront", roles);
      expect(guardStorefront({ path: "/account", session }, config)).toEqual({ action: "pass" });
    }
  });

  // case: SWHR6-C-0005@v1
  it("SWHR6-C-0005 creating a duplicate user name is rejected", async () => {
    const db = await signOnDb();
    db.createSignOnUser("shopper", "abc");
    expect(() => db.createSignOnUser("shopper", "other")).toThrow();
    expect(db.countSignOnUsers("shopper")).toBe(1);
    expect(db.getSignOnUser("shopper").password).toBe("abc");
  });

  // case: SWHR6-C-0008@v1
  it("SWHR6-C-0008 storefront session expires after 15 idle minutes", async () => {
    const { store, clock } = await clockedStore();
    const s = signedOn(store, "storefront", ["customer"]);
    clock.t += 15 * MIN;
    const next = store.resolve(s.id);
    expect(next.expired).toBe(true);
    expect(next.signedOn).toBe(false);
    expect(next.id).not.toBe(s.id);
  });

  // case: SWHR6-C-0013@v1
  it("SWHR6-C-0013 remember option sets 31-day cookie even on failed auth", async () => {
    const db = await signOnDb();
    db.createSignOnUser("shopper", "abc");
    const { submitSignOn } = await signOnMod();
    const { store } = await clockedStore();
    for (const password of ["abc", "wrong"]) {
      const res = submitSignOn(
        { userName: "shopper", password, remember: true },
        { session: store.create("storefront") },
      );
      expect(res.authenticated).toBe(password === "abc");
      expect(res.cookie.name).toBe("bp_signon");
      expect(res.cookie.value).toBe("shopper");
      expect(res.cookie.maxAge).toBe(2678400);
    }
  });

  // case: SWHR6-C-0014@v1
  it("SWHR6-C-0014 submitting without remember option expires the cookie", async () => {
    const db = await signOnDb();
    db.createSignOnUser("shopper", "abc");
    const { submitSignOn } = await signOnMod();
    const { store } = await clockedStore();
    const res = submitSignOn(
      { userName: "shopper", password: "abc" },
      { session: store.create("storefront"), existingCookie: "shopper" },
    );
    expect(res.cookie.name).toBe("bp_signon");
    expect(res.cookie.maxAge).toBe(0);
  });

  // case: SWHR6-C-0015@v1
  it("SWHR6-C-0015 supplier idle 54 minutes must sign in again", async () => {
    const { guardSupplier } = await signOnMod();
    const { store, clock } = await clockedStore();
    const s = signedOn(store, "supplier", ["administrator"]);
    clock.t += 54 * MIN;
    const session = store.resolve(s.id);
    expect(guardSupplier({ screen: "home", session })).toEqual({
      allowed: false,
      page: "supplier-signin",
    });
  });

  // case: SWHR6-C-0017@v1
  it("SWHR6-C-0017 supplier session expires after 54 idle minutes", async () => {
    const { store, clock } = await clockedStore();
    const s = signedOn(store, "supplier", ["administrator"]);
    clock.t += 54 * MIN;
    const next = store.resolve(s.id);
    expect(next.expired).toBe(true);
    expect(next.signedOn).toBe(false);
  });

  // case: SWHR6-C-0026@v1
  it("SWHR6-C-0026 exact protected URL is remembered and sign-on shown", async () => {
    const { guardStorefront } = await signOnMod();
    const { store } = await clockedStore();
    const session = store.create("storefront");
    expect(guardStorefront({ path: "/account", session }, config)).toEqual({
      action: "signon",
      rememberedUrl: "/account",
    });
  });

  // case: SWHR6-C-0027@v1
  it("SWHR6-C-0027 look-alike URL passes through", async () => {
    const { guardStorefront } = await signOnMod();
    const { store } = await clockedStore();
    const session = store.create("storefront");
    for (const path of ["/account/", "/account/extra", "/Account", "/accounts"]) {
      expect(guardStorefront({ path, session }, config)).toEqual({ action: "pass" });
    }
  });
});
