// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  L,
  ful,
  invoiceXml,
  lineItemXml,
  mkOrder,
  mkPo,
  orderXml,
} from "./order-fulfillment-contract";

describe("order fulfillment (unit)", () => {
  // case: SWHR6-C-0128@v1
  it("[SWHR6-C-0128] well-formed document converts to order with contact and lines", async () => {
    const m = await ful();
    const o = m.parseSupplierOrderXml(
      orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(o.id).toBe("S1");
    expect(o.date.toISOString().slice(0, 10)).toBe("2004-05-06");
    expect(o.contact).toMatchObject({
      firstName: "Ann",
      lastName: "Lee",
      street1: "1 Main St",
      city: "Springfield",
      state: "CA",
      country: "USA",
      zip: "94000",
      email: "ann@example.com",
      phone: "555-0100",
    });
    expect(o.lines).toHaveLength(2);
    expect(o.lines[0]).toMatchObject({
      category: "Dogs",
      product: "P1",
      item: "EST-1",
      lineNum: 1,
      quantity: 2,
      unitPrice: 10,
    });
    expect(o.lines[1]).toMatchObject({ item: "EST-2", lineNum: 2, quantity: 3, unitPrice: 20 });
  });

  // case: SWHR6-C-0246@v1
  it("[SWHR6-C-0246] well-formed document converts to order with contact and lines", async () => {
    const m = await ful();
    const o = m.parseSupplierOrderXml(
      orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(o.id).toBe("S1");
    expect(o.date.toISOString().slice(0, 10)).toBe("2004-05-06");
    expect(o.contact).toMatchObject({
      firstName: "Ann",
      lastName: "Lee",
      street1: "1 Main St",
      city: "Springfield",
      state: "CA",
      country: "USA",
      zip: "94000",
      email: "ann@example.com",
      phone: "555-0100",
    });
    expect(o.lines).toHaveLength(2);
    expect(o.lines[0]).toMatchObject({
      category: "Dogs",
      product: "P1",
      item: "EST-1",
      lineNum: 1,
      quantity: 2,
      unitPrice: 10,
    });
    expect(o.lines[1]).toMatchObject({ item: "EST-2", lineNum: 2, quantity: 3, unitPrice: 20 });
  });

  // case: SWHR6-C-0247@v1
  it("[SWHR6-C-0247] unparseable document rejected", async () => {
    const m = await ful();
    expect(() => m.parseSupplierOrderXml("<SupplierOrder><OrderId>S1</OrderId>")).toThrow();
    expect(() => m.parseSupplierOrderXml("not xml at all <<")).toThrow();
  });

  // case: SWHR6-C-0249@v1
  it("[SWHR6-C-0249] status change leaves exactly one status", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "PENDING" }));
    m.setOrderStatus("A", "APPROVED");
    m.setOrderStatus("A", "COMPLETED");
    expect(m.getOrderStatuses("A")).toEqual(["COMPLETED"]);
  });

  // case: SWHR6-C-0137@v1
  it("[SWHR6-C-0137] one line short means order not complete", async () => {
    const m = await ful();
    expect(
      m.isFullyShipped([
        { quantity: 2, shipped: 2 },
        { quantity: 3, shipped: 2 },
      ]),
    ).toBe(false);
    expect(
      m.isFullyShipped([
        { quantity: 2, shipped: 2 },
        { quantity: 3, shipped: 3 },
      ]),
    ).toBe(true);
  });

  // case: SWHR6-C-0255@v1
  it("[SWHR6-C-0255] one line short means order not complete", async () => {
    const m = await ful();
    expect(
      m.isFullyShipped([
        { quantity: 2, shipped: 2 },
        { quantity: 3, shipped: 2 },
      ]),
    ).toBe(false);
    expect(
      m.isFullyShipped([
        { quantity: 2, shipped: 2 },
        { quantity: 3, shipped: 3 },
      ]),
    ).toBe(true);
  });

  // case: SWHR6-C-0138@v1
  it("[SWHR6-C-0138] line copy resets shipped to 0", async () => {
    const m = await ful();
    const li = m.createLineItem({ ...L(1, { quantity: 5 }), shipped: 5 });
    const copy = m.copyLineItem(li, 0);
    expect(li.shipped).toBe(5);
    expect(copy.shipped).toBe(0);
    expect(copy.snapshot()).toEqual(li.snapshot());
  });

  // case: SWHR6-C-0256@v1
  it("[SWHR6-C-0256] line copy resets shipped to 0", async () => {
    const m = await ful();
    const li = m.createLineItem({ ...L(1, { quantity: 5 }), shipped: 5 });
    const copy = m.copyLineItem(li, 0);
    expect(li.shipped).toBe(5);
    expect(copy.shipped).toBe(0);
    expect(copy.snapshot()).toEqual(li.snapshot());
  });

  // case: SWHR6-C-0139@v1
  it("[SWHR6-C-0139] new order from COMPLETED data starts PENDING", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)], { status: "COMPLETED" }));
    expect(m.getSupplierOrder("S1")!.status).toBe("PENDING");
  });

  // case: SWHR6-C-0257@v1
  it("[SWHR6-C-0257] new order from COMPLETED data starts PENDING", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)], { status: "COMPLETED" }));
    expect(m.getSupplierOrder("S1")!.status).toBe("PENDING");
  });

  // case: SWHR6-C-0141@v1
  it("[SWHR6-C-0141] wrong root rejected with SupplierOrder-expected error", async () => {
    const m = await ful();
    expect(() =>
      m.parseSupplierOrderXml("<Other><OrderId>S1</OrderId></Other>", { validate: false }),
    ).toThrow(/SupplierOrder/);
  });

  // case: SWHR6-C-0259@v1
  it("[SWHR6-C-0259] wrong root rejected with SupplierOrder-expected error", async () => {
    const m = await ful();
    expect(() =>
      m.parseSupplierOrderXml("<Other><OrderId>S1</OrderId></Other>", { validate: false }),
    ).toThrow(/SupplierOrder/);
  });

  // case: SWHR6-C-0142@v1
  it("[SWHR6-C-0142] mismatched document type raises Document not of type", async () => {
    const m = await ful();
    expect(() => m.parseSupplierOrderXml(invoiceXml("S1", [L(1)]), { validate: true })).toThrow(
      /Document not of type/,
    );
  });

  // case: SWHR6-C-0260@v1
  it("[SWHR6-C-0260] mismatched document type raises Document not of type", async () => {
    const m = await ful();
    expect(() => m.parseSupplierOrderXml(invoiceXml("S1", [L(1)]), { validate: true })).toThrow(
      /Document not of type/,
    );
  });

  // case: SWHR6-C-0143@v1
  it("[SWHR6-C-0143] non-LineItem root rejected", async () => {
    const m = await ful();
    expect(m.parseLineItemXml(lineItemXml(L(1)))).toMatchObject({ item: "EST-1", lineNum: 1 });
    expect(() => m.parseLineItemXml("<Other><ItemId>EST-1</ItemId></Other>")).toThrow();
  });

  // case: SWHR6-C-0261@v1
  it("[SWHR6-C-0261] non-LineItem root rejected", async () => {
    const m = await ful();
    expect(m.parseLineItemXml(lineItemXml(L(1)))).toMatchObject({ item: "EST-1", lineNum: 1 });
    expect(() => m.parseLineItemXml("<Other><ItemId>EST-1</ItemId></Other>")).toThrow();
  });

  // case: SWHR6-C-0144@v1
  it("[SWHR6-C-0144] order document element order and date format", async () => {
    const m = await ful();
    const xml = m.buildSupplierOrderXml(mkPo({ id: "PO-1" }));
    expect(xml).toContain("<OrderDate>2004-05-06</OrderDate>");
    const at = (t: string) => xml.indexOf(t);
    const order = [at("<OrderId>"), at("<OrderDate>"), at("<ShippingAddress>"), at("<LineItem>")];
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  // case: SWHR6-C-0262@v1
  it("[SWHR6-C-0262] order document element order and date format", async () => {
    const m = await ful();
    const xml = m.buildSupplierOrderXml(mkPo({ id: "PO-1" }));
    expect(xml).toContain("<OrderDate>2004-05-06</OrderDate>");
    const at = (t: string) => xml.indexOf(t);
    const order = [at("<OrderId>"), at("<OrderDate>"), at("<ShippingAddress>"), at("<LineItem>")];
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  // case: SWHR6-C-0145@v1
  it("[SWHR6-C-0145] updated shipped quantity stored", async () => {
    const m = await ful();
    const li = m.createLineItem({ ...L(1, { quantity: 5 }), shipped: 0 });
    li.setShipped(3);
    expect(li.shipped).toBe(3);
  });

  // case: SWHR6-C-0263@v1
  it("[SWHR6-C-0263] updated shipped quantity stored", async () => {
    const m = await ful();
    const li = m.createLineItem({ ...L(1, { quantity: 5 }), shipped: 0 });
    li.setShipped(3);
    expect(li.shipped).toBe(3);
  });

  // case: SWHR6-C-0146@v1
  it("[SWHR6-C-0146] line interface offers no price change", async () => {
    const m = await ful();
    const li = m.createLineItem({ ...L(1), shipped: 0 });
    const names = new Set<string>();
    for (let o: object | null = li; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
      Object.getOwnPropertyNames(o).forEach((n) => names.add(n));
    }
    expect(names.has("setShipped")).toBe(true);
    expect([...names].filter((n) => /^set(?!Shipped$)/i.test(n))).toEqual([]);
  });

  // case: SWHR6-C-0264@v1
  it("[SWHR6-C-0264] line interface offers no price change", async () => {
    const m = await ful();
    const li = m.createLineItem({ ...L(1), shipped: 0 });
    const names = new Set<string>();
    for (let o: object | null = li; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
      Object.getOwnPropertyNames(o).forEach((n) => names.add(n));
    }
    expect(names.has("setShipped")).toBe(true);
    expect([...names].filter((n) => /^set(?!Shipped$)/i.test(n))).toEqual([]);
  });

  // case: SWHR6-C-0147@v1
  it("[SWHR6-C-0147] snapshot excludes shipped quantity", async () => {
    const m = await ful();
    const snap = m.createLineItem({ ...L(1, { quantity: 4 }), shipped: 3 }).snapshot();
    expect(snap).toEqual(L(1, { quantity: 4 }));
    expect("shipped" in snap).toBe(false);
  });

  // case: SWHR6-C-0265@v1
  it("[SWHR6-C-0265] snapshot excludes shipped quantity", async () => {
    const m = await ful();
    const snap = m.createLineItem({ ...L(1, { quantity: 4 }), shipped: 3 }).snapshot();
    expect(snap).toEqual(L(1, { quantity: 4 }));
    expect("shipped" in snap).toBe(false);
  });

  // case: SWHR6-C-0266@v1
  it("[SWHR6-C-0266] new supplier order is PENDING with given id and date", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S2", [L(1)], { date: new Date("2010-01-02T12:00:00Z") }));
    const o = m.getSupplierOrder("S2")!;
    expect(o.status).toBe("PENDING");
    expect(o.id).toBe("S2");
    expect(o.date.toISOString().slice(0, 10)).toBe("2010-01-02");
  });

  // case: SWHR6-C-0269@v1
  it("[SWHR6-C-0269] denying pending order sets DENIED", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "PENDING" }));
    m.denyOrder("A");
    expect(m.getPurchaseOrder("A")!.status).toBe("DENIED");
  });

  // case: SWHR6-C-0158@v1
  it("[SWHR6-C-0158] valid TPA invoice read for order id and shipped items", async () => {
    const m = await ful();
    const inv = m.parseInvoiceXml(
      invoiceXml("PO-1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(inv.orderId).toBe("PO-1");
    expect(inv.items).toEqual([
      { item: "EST-1", quantity: 2 },
      { item: "EST-2", quantity: 3 },
    ]);
  });

  // case: SWHR6-C-0276@v1
  it("[SWHR6-C-0276] valid TPA invoice read for order id and shipped items", async () => {
    const m = await ful();
    const inv = m.parseInvoiceXml(
      invoiceXml("PO-1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(inv.orderId).toBe("PO-1");
    expect(inv.items).toEqual([
      { item: "EST-1", quantity: 2 },
      { item: "EST-2", quantity: 3 },
    ]);
  });

  // case: SWHR6-C-0159@v1
  it("[SWHR6-C-0159] non-Invoice root rejected", async () => {
    const m = await ful();
    expect(() => m.parseInvoiceXml(invoiceXml("PO-1", [L(1)], "Receipt"))).toThrow();
  });

  // case: SWHR6-C-0277@v1
  it("[SWHR6-C-0277] non-Invoice root rejected", async () => {
    const m = await ful();
    expect(() => m.parseInvoiceXml(invoiceXml("PO-1", [L(1)], "Receipt"))).toThrow();
  });

  // case: SWHR6-C-0171@v1
  it("[SWHR6-C-0171] duplicate item ids fail validation", async () => {
    const m = await ful();
    expect(() =>
      m.parseSupplierOrderXml(orderXml("S1", [L(1), L(2)]), { validate: true }),
    ).not.toThrow();
    expect(() =>
      m.parseSupplierOrderXml(orderXml("S1", [L(1), L(2, { item: "EST-1" })]), { validate: true }),
    ).toThrow();
  });

  // case: SWHR6-C-0289@v1
  it("[SWHR6-C-0289] duplicate item ids fail validation", async () => {
    const m = await ful();
    expect(() =>
      m.parseSupplierOrderXml(orderXml("S1", [L(1), L(2)]), { validate: true }),
    ).not.toThrow();
    expect(() =>
      m.parseSupplierOrderXml(orderXml("S1", [L(1), L(2, { item: "EST-1" })]), { validate: true }),
    ).toThrow();
  });

  // case: SWHR6-C-0172@v1
  it("[SWHR6-C-0172] zero quantity fails validation", async () => {
    const m = await ful();
    expect(() => m.parseSupplierOrderXml(orderXml("S1", [L(1)]), { validate: true })).not.toThrow();
    expect(() =>
      m.parseSupplierOrderXml(orderXml("S1", [L(1, { quantity: 0 })]), { validate: true }),
    ).toThrow();
  });

  // case: SWHR6-C-0290@v1
  it("[SWHR6-C-0290] zero quantity fails validation", async () => {
    const m = await ful();
    expect(() => m.parseSupplierOrderXml(orderXml("S1", [L(1)]), { validate: true })).not.toThrow();
    expect(() =>
      m.parseSupplierOrderXml(orderXml("S1", [L(1, { quantity: 0 })]), { validate: true }),
    ).toThrow();
  });

  // case: SWHR6-C-0174@v1
  it("[SWHR6-C-0174] invoice document element order and date format", async () => {
    const m = await ful();
    const xml = m.buildInvoiceXml({
      orderId: "PO-1",
      userId: "u1",
      orderDate: new Date("2004-05-01T12:00:00Z"),
      shippingDate: new Date("2004-05-06T12:00:00Z"),
      lines: [L(1, { quantity: 2 })],
    });
    expect(xml).toContain("<ShippingDate>2004-05-06</ShippingDate>");
    const at = (t: string) => xml.indexOf(t);
    const order = [
      at("<OrderId>"),
      at("<UserId>"),
      at("<OrderDate>"),
      at("<ShippingDate>"),
      at("<LineItem>"),
    ];
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  // case: SWHR6-C-0292@v1
  it("[SWHR6-C-0292] invoice document element order and date format", async () => {
    const m = await ful();
    const xml = m.buildInvoiceXml({
      orderId: "PO-1",
      userId: "u1",
      orderDate: new Date("2004-05-01T12:00:00Z"),
      shippingDate: new Date("2004-05-06T12:00:00Z"),
      lines: [L(1, { quantity: 2 })],
    });
    expect(xml).toContain("<ShippingDate>2004-05-06</ShippingDate>");
    const at = (t: string) => xml.indexOf(t);
    const order = [
      at("<OrderId>"),
      at("<UserId>"),
      at("<OrderDate>"),
      at("<ShippingDate>"),
      at("<LineItem>"),
    ];
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
