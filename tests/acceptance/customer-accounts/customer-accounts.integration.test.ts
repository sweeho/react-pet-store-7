// @vitest-environment node
import { describe, expect, it } from "vitest";

import { address, card, customerDb } from "./customer-accounts-contract";

const withDetails = { withDetails: true };

describe("customer-accounts integration", () => {
  // case: SWHR6-C-0059@v1
  it("SWHR6-C-0059 card expiry text stored unchanged", async () => {
    const db = await customerDb();
    const id = db.storeCard({ ...card, expiry: "04/04" });
    expect(db.readCard(id).expiry).toBe("04/04");
  });

  // case: SWHR6-C-0060@v1
  it("SWHR6-C-0060 customer record exposes account, profile, contact, address, card", async () => {
    const db = await customerDb();
    db.createSignOnUser("u60");
    db.createCustomer("u60", withDetails);
    const c = db.getCustomer("u60");
    expect(c.account).toBeDefined();
    expect(c.profile).toBeDefined();
    expect(c.account.contact).toBeDefined();
    expect(c.account.address).toBeDefined();
    expect(c.account.card).toBeDefined();
  });

  // case: SWHR6-C-0062@v1
  it("SWHR6-C-0062 unticked MyList saved as off", async () => {
    const db = await customerDb();
    db.createSignOnUser("u62");
    db.createCustomer("u62");
    db.submitPreferences("u62", { language: "en_US", banners: true });
    expect(db.getCustomer("u62").profile.myList).toBe(false);
  });

  // case: SWHR6-C-0068@v1
  it("SWHR6-C-0068 address with null or empty values accepted unchanged", async () => {
    const db = await customerDb();
    const id = db.storeAddress({
      street1: "",
      street2: null,
      city: null,
      state: "",
      zip: "",
      country: null,
    });
    const a = db.readAddress(id);
    expect(a.street1).toBe("");
    expect(a.street2).toBeNull();
    expect(a.city).toBeNull();
    expect(a.country).toBeNull();
  });

  // case: SWHR6-C-0069@v1
  it("SWHR6-C-0069 profile without favourite category accepted", async () => {
    const db = await customerDb();
    expect(() =>
      db.storeProfile({ language: "en_US", favoriteCategory: null, myList: true, banners: true }),
    ).not.toThrow();
  });

  // case: SWHR6-C-0070@v1
  it("SWHR6-C-0070 account referencing missing card rejected", async () => {
    const db = await customerDb();
    expect(() => db.storeAccount({ status: "active", cardId: "no-such-card" })).toThrow();
  });

  // case: SWHR6-C-0071@v1
  it("SWHR6-C-0071 customer with nonexistent sign-on user rejected", async () => {
    const db = await customerDb();
    const profileId = db.storeProfile({ language: "en_US", myList: true, banners: true });
    expect(() => db.storeCustomer({ userName: "ghost", profileId })).toThrow();
    expect(db.getCustomer("ghost")).toBeUndefined();
  });

  // case: SWHR6-C-0074@v1
  it("SWHR6-C-0074 new account status is active", async () => {
    const db = await customerDb();
    db.createSignOnUser("u74");
    db.createCustomer("u74");
    expect(db.getCustomer("u74").account.status).toBe("active");
  });

  // case: SWHR6-C-0075@v1
  it("SWHR6-C-0075 removing customer removes dependents", async () => {
    const db = await customerDb();
    db.createSignOnUser("u75");
    db.createCustomer("u75", withDetails);
    db.removeCustomer("u75");
    expect(db.getCustomer("u75")).toBeUndefined();
    expect(db.countDependents("u75")).toEqual({
      accounts: 0,
      profiles: 0,
      contacts: 0,
      addresses: 0,
      cards: 0,
    });
  });

  // case: SWHR6-C-0076@v1
  it("SWHR6-C-0076 profile exposes four preferences", async () => {
    const db = await customerDb();
    db.createSignOnUser("u76");
    db.createCustomer("u76");
    const p = db.getCustomer("u76").profile;
    for (const k of ["language", "favoriteCategory", "myList", "banners"]) {
      expect(p).toHaveProperty(k);
    }
  });

  // case: SWHR6-C-0077@v1
  it("SWHR6-C-0077 list returns all three customers", async () => {
    const db = await customerDb();
    for (const n of ["a77", "b77", "c77"]) {
      db.createSignOnUser(n);
      db.createCustomer(n);
    }
    expect(db.listCustomers()).toHaveLength(3);
  });

  // case: SWHR6-C-0078@v1
  it("SWHR6-C-0078 account created without details gets empty contact and card", async () => {
    const db = await customerDb();
    const acct = db.createAccount();
    expect(acct.contact).toBeDefined();
    expect(acct.card).toBeDefined();
  });

  // case: SWHR6-C-0079@v1
  it("SWHR6-C-0079 new customer gets account and profile", async () => {
    const db = await customerDb();
    db.createSignOnUser("u79");
    const c = db.createCustomer("u79");
    expect(c.account).toBeDefined();
    expect(c.profile).toBeDefined();
  });

  // case: SWHR6-C-0081@v1
  it("SWHR6-C-0081 customer keyed by user name links one account and one profile", async () => {
    const db = await customerDb();
    db.createSignOnUser("u81");
    db.createCustomer("u81");
    expect(db.getCustomer("u81").userName).toBe("u81");
    const d = db.countDependents("u81");
    expect(d.accounts).toBe(1);
    expect(d.profiles).toBe(1);
  });

  // case: SWHR6-C-0083@v1
  it("SWHR6-C-0083 customer read returns one account and one profile", async () => {
    const db = await customerDb();
    db.createSignOnUser("u83");
    db.createCustomer("u83", withDetails);
    const c = db.getCustomer("u83");
    expect(Array.isArray(c.account)).toBe(false);
    expect(Array.isArray(c.profile)).toBe(false);
    expect(c.account).toBeTruthy();
    expect(c.profile).toBeTruthy();
    expect(address.city).toBeTruthy();
  });
});

describe("customer-accounts contact form (integration)", () => {
  // case: SWHR6-C-0061@v1
  it("SWHR6-C-0061 blank city recorded as missing with no customer message", async () => {
    const db = await customerDb();
    const r = db.submitContactForm({
      firstName: "Duke",
      lastName: "Java",
      street1: "1 Main St",
      city: "",
      state: "CA",
      zip: "95054",
      phone: "555-0100",
    });
    expect(r.missing).toContain("city");
    expect(r.messages).toEqual([]);
  });
});
