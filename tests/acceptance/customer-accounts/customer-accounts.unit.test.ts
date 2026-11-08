import { describe, expect, it } from "vitest";

import { address, addressMod, customerMod } from "./customer-accounts-contract";

describe("customer-accounts unit", () => {
  // case: SWHR6-C-0072@v1
  it("SWHR6-C-0072 empty street line 2 writes one street element", async () => {
    const { addressToXml } = await addressMod();
    const xml: string = addressToXml({ ...address, street2: "" });
    expect(xml.match(/<StreetName\d?>/g)?.length).toBe(1);
  });

  // case: SWHR6-C-0073@v1
  it("SWHR6-C-0073 address created from existing copies all six values", async () => {
    const { createAddress, createAddressFrom } = await addressMod();
    const source = createAddress({
      street1: "a",
      street2: "b",
      city: "c",
      state: "d",
      zip: "e",
      country: "f",
    });
    const copy = createAddressFrom(source);
    for (const k of ["street1", "street2", "city", "state", "zip", "country"]) {
      expect(copy[k]).toBe(source[k]);
    }
    expect(Object.values(copy)).toEqual(expect.arrayContaining(["a", "b", "c", "d", "e", "f"]));
  });

  // case: SWHR6-C-0080@v1
  it("SWHR6-C-0080 detail-less account creation attaches empty contact and card", async () => {
    const { createAccountWithoutDetails } = await customerMod();
    const acct = createAccountWithoutDetails();
    expect(acct.contact).toBeDefined();
    expect(acct.card).toBeDefined();
    expect(Object.values(acct.contact).every((v) => v === "" || v == null)).toBe(true);
    expect(Object.values(acct.card).every((v) => v === "" || v == null)).toBe(true);
  });

  // case: SWHR6-C-0082@v1
  it("SWHR6-C-0082 new profile defaults", async () => {
    const { newProfile } = await customerMod();
    const p = newProfile();
    expect(p.language).toBe("en_US");
    expect(p.favoriteCategory ?? "").toBe("");
    expect(p.myList).toBe(true);
    expect(p.banners).toBe(true);
  });
});
