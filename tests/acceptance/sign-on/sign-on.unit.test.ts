// @vitest-environment node
import { describe, expect, it } from "vitest";

import { customerDb, signOnDb } from "./sign-on-contract";

describe("sign-on unit", () => {
  // case: SWHR6-C-0016@v1
  it("SWHR6-C-0016 customer component methods do not check roles", async () => {
    const db = await customerDb();
    const sdb = await signOnDb();
    sdb.createSignOnUser("norole", "pw");
    // no caller context / role is supplied anywhere
    expect(() => db.createCustomer("norole")).not.toThrow();
    expect(() => db.getCustomer("norole")).not.toThrow();
    expect(() => db.listCustomers()).not.toThrow();
    expect(() => db.removeCustomer("norole")).not.toThrow();
  });

  // case: SWHR6-C-0023@v1
  it("SWHR6-C-0023 credential lookup by user name returns record and password", async () => {
    const db = await signOnDb();
    db.createSignOnUser("shopper", "abc");
    db.createSignOnUser("other", "zzz");
    const rec = db.getSignOnUser("shopper");
    expect(rec.userName).toBe("shopper");
    expect(rec.password).toBe("abc");
  });

  // case: SWHR6-C-0024@v1
  it("SWHR6-C-0024 matching credentials authenticate", async () => {
    const db = await signOnDb();
    db.createSignOnUser("shopper", "abc");
    expect(db.authenticate("shopper", "abc")).toBe(true);
  });

  // case: SWHR6-C-0025@v1
  it("SWHR6-C-0025 wrong-case password or unknown user fails", async () => {
    const db = await signOnDb();
    db.createSignOnUser("shopper", "abc");
    expect(db.authenticate("shopper", "ABC")).toBe(false);
    expect(db.authenticate("nobody", "abc")).toBe(false);
  });

  // case: SWHR6-C-0028@v1
  it("SWHR6-C-0028 user name with forbidden character rejected", async () => {
    const db = await signOnDb();
    expect(() => db.createSignOnUser("ab*c", "pw")).toThrow();
    expect(() => db.createSignOnUser("ab%c", "pw")).toThrow();
    expect(db.countSignOnUsers("ab*c")).toBe(0);
  });

  // case: SWHR6-C-0029@v1
  it("SWHR6-C-0029 26-character user name rejected", async () => {
    const db = await signOnDb();
    const name = "a".repeat(26);
    expect(() => db.createSignOnUser(name, "pw")).toThrow();
    expect(db.countSignOnUsers(name)).toBe(0);
  });
});
