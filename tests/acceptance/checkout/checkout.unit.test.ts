import { describe, expect, it } from "vitest";

import { card, cardMod, orderXml, xmlMod } from "./checkout-contract";

describe("checkout unit", () => {
  // case: SWHR6-C-0203@v1
  it("SWHR6-C-0203 order document without locale defaults to en_US", async () => {
    const { parseOrderXml } = await xmlMod();
    expect(parseOrderXml(orderXml()).locale).toBe("en_US");
  });

  // case: SWHR6-C-0211@v1
  it("SWHR6-C-0211 well-formed expiry yields month and year", async () => {
    const { cardExpiryMonth, cardExpiryYear } = await cardMod();
    expect(cardExpiryMonth("10/2001")).toBe("10");
    expect(cardExpiryYear("10/2001")).toBe("2001");
  });

  // case: SWHR6-C-0218@v1
  it("SWHR6-C-0218 malformed expiry defaults to 01/2010", async () => {
    const { cardExpiryMonth, cardExpiryYear } = await cardMod();
    expect(cardExpiryMonth("1099")).toBe("01");
    expect(cardExpiryYear("1099")).toBe("2010");
  });

  // case: SWHR6-C-0225@v1
  it("SWHR6-C-0225 card XML holds CardNumber, CardType, ExpiryDate in order", async () => {
    const { createCard, cardToXml } = await cardMod();
    const xml: string = cardToXml(createCard(card.number, card.type, card.expiry));
    const a = xml.indexOf("<CardNumber>");
    const b = xml.indexOf("<CardType>");
    const c = xml.indexOf("<ExpiryDate>");
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  // case: SWHR6-C-0226@v1
  it("SWHR6-C-0226 card number is copied unchanged without validation", async () => {
    const { createCard } = await cardMod();
    const created = createCard("abc 123", card.type, card.expiry);
    expect(created.number ?? created.cardNumber).toBe("abc 123");
  });
});
