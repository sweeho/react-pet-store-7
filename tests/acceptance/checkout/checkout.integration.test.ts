// @vitest-environment node
import { describe, expect, it } from "vitest";

import { card, checkoutDb, contact, orderInput, orderXml, uid } from "./checkout-contract";

const line = (over: Record<string, unknown> = {}) => ({
  lineNumber: 0,
  category: "FISH",
  product: "FI-SW-01",
  item: "EST-1",
  quantity: 1,
  unitPrice: 10,
  quantityShipped: 0,
  ...over,
});

describe("checkout integration", () => {
  // case: SWHR6-C-0202@v1
  it("SWHR6-C-0202 order without payment card is rejected", async () => {
    const db = await checkoutDb();
    const o = orderInput({ card: undefined });
    expect(() => db.storeOrder(o)).toThrow();
    expect(db.getOrderRecords(o.id).order).toBeUndefined();
  });

  // case: SWHR6-C-0204@v1
  it("SWHR6-C-0204 validation off stores order without schema validation", async () => {
    const db = await checkoutDb();
    const xml = orderXml({ extra: "<NotInSchema/>" });
    const id = /<OrderId>(.*?)<\/OrderId>/.exec(xml)![1];
    expect(() => db.receiveOrderXml(xml, { validate: false })).not.toThrow();
    expect(db.getOrderRecords(id).order).toBeDefined();
  });

  // case: SWHR6-C-0206@v1
  it("SWHR6-C-0206 duplicate order id is rejected", async () => {
    const db = await checkoutDb();
    const o = orderInput();
    db.storeOrder(o);
    expect(() => db.storeOrder({ ...o })).toThrow();
  });

  // case: SWHR6-C-0208@v1
  it("SWHR6-C-0208 duplicate counter name is rejected", async () => {
    const db = await checkoutDb();
    const name = uid("C");
    db.insertCounter(name, 0);
    expect(() => db.insertCounter(name, 0)).toThrow();
  });

  // case: SWHR6-C-0209@v1
  it("SWHR6-C-0209 failure after increment rolls back counter", async () => {
    const db = await checkoutDb();
    const name = uid("C");
    db.insertCounter(name, 7);
    expect(() => db.issueOrderId(name, { fault: "after-increment" })).toThrow();
    expect(db.readCounter(name)).toBe(7);
  });

  // case: SWHR6-C-0210@v1
  it("SWHR6-C-0210 unavailable counter fails the request with no identifier", async () => {
    const db = await checkoutDb();
    let id: unknown;
    expect(() => {
      id = db.issueOrderId(uid("C"), { fault: "counter-unavailable" });
    }).toThrow();
    expect(id).toBeUndefined();
  });

  // case: SWHR6-C-0213@v1
  it("SWHR6-C-0213 same name shares one counter value", async () => {
    const db = await checkoutDb();
    const name = uid("C");
    db.insertCounter(name, 0);
    const a = db.issueOrderId(name);
    const b = db.issueOrderId(name);
    expect(a).toBe(`${name}1`);
    expect(b).toBe(`${name}2`);
    expect(db.readCounter(name)).toBe(2);
  });

  // case: SWHR6-C-0214@v1
  it("SWHR6-C-0214 next identifier from counter at 5", async () => {
    const db = await checkoutDb();
    const name = uid("C");
    db.insertCounter(name, 5);
    expect(db.issueOrderId(name)).toBe(`${name}6`);
    expect(db.readCounter(name)).toBe(6);
  });

  // case: SWHR6-C-0215@v1
  it("SWHR6-C-0215 first identifier creates counter", async () => {
    const db = await checkoutDb();
    const name = uid("C");
    expect(db.readCounter(name)).toBeUndefined();
    expect(db.issueOrderId(name)).toBe(`${name}1`);
    expect(db.readCounter(name)).toBe(1);
  });

  // case: SWHR6-C-0219@v1
  it("SWHR6-C-0219 order total and line numbering for two lines", async () => {
    const db = await checkoutDb();
    const cart = {
      lines: [
        { category: "FISH", product: "FI-SW-01", item: "EST-1", quantity: 2, unitPrice: 10 },
        { category: "DOGS", product: "K9-BD-01", item: "EST-6", quantity: 1, unitPrice: 5.5 },
      ],
      empty() {
        this.lines = [];
      },
    };
    const res = db.placeOrder(
      { userId: "j2ee", billing: contact, shipping: contact, card, locale: "en_US" },
      { cart, send: () => {} },
    );
    expect(res.total).toBeCloseTo(25.5, 2);
    expect(
      res.lines.map((l: { lineNumber: number; quantityShipped: number }) => l.lineNumber),
    ).toEqual([0, 1]);
  });

  // case: SWHR6-C-0221@v1
  it("SWHR6-C-0221 order with two lines creates related records", async () => {
    const db = await checkoutDb();
    const o = orderInput();
    db.createPurchaseOrder(o);
    const r = db.getOrderRecords(o.id);
    expect(r.contacts).toHaveLength(1);
    expect(r.cards).toHaveLength(1);
    expect(r.lines).toHaveLength(2);
    expect(
      r.lines.every(
        (l: { lineNumber: number; quantityShipped: number }) => l.quantityShipped === 0,
      ),
    ).toBe(true);
  });

  // case: SWHR6-C-0222@v1
  it("SWHR6-C-0222 service lookup failure stores no order", async () => {
    const db = await checkoutDb();
    const o = orderInput();
    expect(() => db.createPurchaseOrder(o, { fault: "service-lookup" })).toThrow();
    const r = db.getOrderRecords(o.id);
    expect(r.order).toBeUndefined();
    expect(r.lines).toHaveLength(0);
  });

  // case: SWHR6-C-0223@v1
  it("SWHR6-C-0223 removing order deletes its lines", async () => {
    const db = await checkoutDb();
    const o = orderInput();
    db.createPurchaseOrder(o);
    expect(db.getOrderRecords(o.id).lines).toHaveLength(2);
    db.removeOrder(o.id);
    expect(db.getOrderRecords(o.id).lines).toHaveLength(0);
  });

  // case: SWHR6-C-0224@v1
  it("SWHR6-C-0224 cart empty after hand-off", async () => {
    const db = await checkoutDb();
    const sent: string[] = [];
    const cart = {
      lines: [{ category: "FISH", product: "FI-SW-01", item: "EST-1", quantity: 1, unitPrice: 10 }],
      empty() {
        this.lines = [];
      },
    };
    db.placeOrder(
      { userId: "j2ee", billing: contact, shipping: contact, card, locale: "en_US" },
      { cart, send: (x: string) => sent.push(x) },
    );
    expect(sent).toHaveLength(1);
    expect(cart.lines).toHaveLength(0);
  });

  // case: SWHR6-C-0227@v1
  it("SWHR6-C-0227 roleless caller can request identifier and create card", async () => {
    const db = await checkoutDb();
    const { cardMod } = await import("./checkout-contract");
    const { createCard } = await cardMod();
    const name = uid("C");
    expect(() => db.issueOrderId(name)).not.toThrow();
    expect(() => createCard(card.number, card.type, card.expiry)).not.toThrow();
  });

  // case: SWHR6-C-0228@v1
  it("SWHR6-C-0228 zero-quantity line is rejected", async () => {
    const db = await checkoutDb();
    const o = orderInput();
    db.storeOrder(o);
    expect(() =>
      db.storeOrderLine({ orderId: o.id, ...line({ lineNumber: 5, quantity: 0 }) }),
    ).toThrow();
  });

  // case: SWHR6-C-0229@v1
  it("SWHR6-C-0229 over-shipped line is rejected", async () => {
    const db = await checkoutDb();
    const o = orderInput();
    db.storeOrder(o);
    expect(() =>
      db.storeOrderLine({
        orderId: o.id,
        ...line({ lineNumber: 5, quantity: 2, quantityShipped: 3 }),
      }),
    ).toThrow();
  });
});
