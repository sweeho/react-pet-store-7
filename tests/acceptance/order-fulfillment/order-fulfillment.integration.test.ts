// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  L,
  Row,
  ful,
  invoiceXml,
  makeTopic,
  mkOpc,
  mkOrder,
  mkPo,
  mkSvc,
  orderXml,
} from "./order-fulfillment-contract";

describe("order fulfillment (integration)", () => {
  // case: SWHR6-C-0121@v1
  it("[SWHR6-C-0121] lookup by APPROVED returns only approved orders", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "APPROVED" }));
    m.createPurchaseOrder(mkPo({ id: "A2", status: "APPROVED" }));
    m.createPurchaseOrder(mkPo({ id: "B", status: "PENDING" }));
    m.createPurchaseOrder(mkPo({ id: "C", status: "COMPLETED" }));
    expect(m.ordersByStatus("APPROVED").sort()).toEqual(["A", "A2"]);
  });

  // case: SWHR6-C-0239@v1
  it("[SWHR6-C-0239] lookup by APPROVED returns only approved orders", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "APPROVED" }));
    m.createPurchaseOrder(mkPo({ id: "A2", status: "APPROVED" }));
    m.createPurchaseOrder(mkPo({ id: "B", status: "PENDING" }));
    m.createPurchaseOrder(mkPo({ id: "C", status: "COMPLETED" }));
    expect(m.ordersByStatus("APPROVED").sort()).toEqual(["A", "A2"]);
  });

  // case: SWHR6-C-0122@v1
  it("[SWHR6-C-0122] partly in-stock order is recorded, in-stock line ships, invoice sent", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    const topic = makeTopic();
    const res = mkSvc(m, topic).onOrderMessage(
      orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(res.redelivered).toBe(false);
    const o = m.getSupplierOrder("S1")!;
    expect(o).toBeDefined();
    expect(o.lines.find((l: Row) => l.item === "EST-1")!.shipped).toBe(2);
    expect(o.lines.find((l: Row) => l.item === "EST-2")!.shipped).toBe(0);
    expect(m.stockOf("EST-1")).toBe(3);
    expect(topic.messages).toHaveLength(1);
    expect(topic.messages[0]).toContain("<ItemId>EST-1</ItemId>");
    expect(topic.messages[0]).not.toContain("EST-2");
  });

  // case: SWHR6-C-0240@v1
  it("[SWHR6-C-0240] partly in-stock order is recorded, in-stock line ships, invoice sent", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    const topic = makeTopic();
    const res = mkSvc(m, topic).onOrderMessage(
      orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(res.redelivered).toBe(false);
    const o = m.getSupplierOrder("S1")!;
    expect(o).toBeDefined();
    expect(o.lines.find((l: Row) => l.item === "EST-1")!.shipped).toBe(2);
    expect(o.lines.find((l: Row) => l.item === "EST-2")!.shipped).toBe(0);
    expect(m.stockOf("EST-1")).toBe(3);
    expect(topic.messages).toHaveLength(1);
    expect(topic.messages[0]).toContain("<ItemId>EST-1</ItemId>");
    expect(topic.messages[0]).not.toContain("EST-2");
  });

  // case: SWHR6-C-0123@v1
  it("[SWHR6-C-0123] all lines out of stock: pending, no invoice", async () => {
    const m = await ful();
    m.seedStock("EST-1", 0);
    m.seedStock("EST-2", 1);
    const topic = makeTopic();
    mkSvc(m, topic).onOrderMessage(orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.status).toBe("PENDING");
    expect(o.lines.every((l: Row) => l.shipped === 0)).toBe(true);
    expect(topic.messages).toHaveLength(0);
  });

  // case: SWHR6-C-0241@v1
  it("[SWHR6-C-0241] all lines out of stock: pending, no invoice", async () => {
    const m = await ful();
    m.seedStock("EST-1", 0);
    m.seedStock("EST-2", 1);
    const topic = makeTopic();
    mkSvc(m, topic).onOrderMessage(orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.status).toBe("PENDING");
    expect(o.lines.every((l: Row) => l.shipped === 0)).toBe(true);
    expect(topic.messages).toHaveLength(0);
  });

  // case: SWHR6-C-0124@v1
  it("[SWHR6-C-0124] invoice published as one XML text message", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.seedStock("EST-2", 5);
    const topic = makeTopic();
    mkSvc(m, topic).onOrderMessage(orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    expect(topic.messages).toHaveLength(1);
    expect(typeof topic.messages[0]).toBe("string");
    expect(topic.messages[0].trimStart().startsWith("<")).toBe(true);
    expect(m.parseInvoiceXml(topic.messages[0]).orderId).toBe("S1");
  });

  // case: SWHR6-C-0242@v1
  it("[SWHR6-C-0242] invoice published as one XML text message", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.seedStock("EST-2", 5);
    const topic = makeTopic();
    mkSvc(m, topic).onOrderMessage(orderXml("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    expect(topic.messages).toHaveLength(1);
    expect(typeof topic.messages[0]).toBe("string");
    expect(topic.messages[0].trimStart().startsWith("<")).toBe(true);
    expect(m.parseInvoiceXml(topic.messages[0]).orderId).toBe("S1");
  });

  // case: SWHR6-C-0125@v1
  it("[SWHR6-C-0125] line without stock record ships nothing, order pending", async () => {
    const m = await ful();
    expect(m.stockOf("EST-9")).toBeUndefined();
    const topic = makeTopic();
    mkSvc(m, topic).onOrderMessage(orderXml("S1", [L(9, { quantity: 1 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.lines[0].shipped).toBe(0);
    expect(o.status).toBe("PENDING");
    expect(topic.messages).toHaveLength(0);
  });

  // case: SWHR6-C-0243@v1
  it("[SWHR6-C-0243] line without stock record ships nothing, order pending", async () => {
    const m = await ful();
    expect(m.stockOf("EST-9")).toBeUndefined();
    const topic = makeTopic();
    mkSvc(m, topic).onOrderMessage(orderXml("S1", [L(9, { quantity: 1 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.lines[0].shipped).toBe(0);
    expect(o.status).toBe("PENDING");
    expect(topic.messages).toHaveLength(0);
  });

  // case: SWHR6-C-0126@v1
  it("[SWHR6-C-0126] failing step undoes work and redelivers message", async () => {
    const m = await ful();
    for (const step of ["record", "ship", "publish"] as const) {
      m.resetFulfillmentData();
      m.seedStock("EST-1", 5);
      const topic = makeTopic();
      const svc = mkSvc(m, topic, {
        hooks: {
          onStep: (s: string) => {
            if (s === step) throw new Error("injected " + step);
          },
        },
      });
      const res = svc.onOrderMessage(orderXml("S1", [L(1, { quantity: 2 })]));
      expect(res.redelivered).toBe(true);
      expect(m.getSupplierOrder("S1")).toBeUndefined();
      expect(m.stockOf("EST-1")).toBe(5);
      expect(topic.messages).toHaveLength(0);
    }
  });

  // case: SWHR6-C-0244@v1
  it("[SWHR6-C-0244] failing step undoes work and redelivers message", async () => {
    const m = await ful();
    for (const step of ["record", "ship", "publish"] as const) {
      m.resetFulfillmentData();
      m.seedStock("EST-1", 5);
      const topic = makeTopic();
      const svc = mkSvc(m, topic, {
        hooks: {
          onStep: (s: string) => {
            if (s === step) throw new Error("injected " + step);
          },
        },
      });
      const res = svc.onOrderMessage(orderXml("S1", [L(1, { quantity: 2 })]));
      expect(res.redelivered).toBe(true);
      expect(m.getSupplierOrder("S1")).toBeUndefined();
      expect(m.stockOf("EST-1")).toBe(5);
      expect(topic.messages).toHaveLength(0);
    }
  });

  // case: SWHR6-C-0127@v1
  it("[SWHR6-C-0127] order message persists order and attempts fulfilment", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    mkSvc(m, makeTopic()).onOrderMessage(orderXml("S1", [L(1, { quantity: 2 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o).toBeDefined();
    expect(o.lines[0].shipped).toBe(2);
    expect(m.stockOf("EST-1")).toBe(3);
  });

  // case: SWHR6-C-0245@v1
  it("[SWHR6-C-0245] order message persists order and attempts fulfilment", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    mkSvc(m, makeTopic()).onOrderMessage(orderXml("S1", [L(1, { quantity: 2 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o).toBeDefined();
    expect(o.lines[0].shipped).toBe(2);
    expect(m.stockOf("EST-1")).toBe(3);
  });

  // case: SWHR6-C-0129@v1
  it("[SWHR6-C-0129] unparseable document rejected, no order recorded", async () => {
    const m = await ful();
    const svc = mkSvc(m, makeTopic());
    try {
      svc.onOrderMessage("<SupplierOrder><OrderId>S1</OrderId>");
    } catch {
      // rejection by throwing is allowed
    }
    expect(m.supplierOrdersByStatus("PENDING")).toEqual([]);
    expect(m.supplierOrdersByStatus("COMPLETED")).toEqual([]);
    expect(m.getSupplierOrder("S1")).toBeUndefined();
  });

  // case: SWHR6-C-0130@v1
  it("[SWHR6-C-0130] line for unknown supplier order rejected", async () => {
    const m = await ful();
    expect(() => m.storeSupplierOrderLine("MISSING", L(1))).toThrow();
    expect(m.dependentsOf("MISSING").lines).toBe(0);
  });

  // case: SWHR6-C-0248@v1
  it("[SWHR6-C-0248] line for unknown supplier order rejected", async () => {
    const m = await ful();
    expect(() => m.storeSupplierOrderLine("MISSING", L(1))).toThrow();
    expect(m.dependentsOf("MISSING").lines).toBe(0);
  });

  // case: SWHR6-C-0131@v1
  it("[SWHR6-C-0131] status change leaves exactly one status", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "PENDING" }));
    m.setOrderStatus("A", "APPROVED");
    expect(m.getOrderStatuses("A")).toEqual(["APPROVED"]);
  });

  // case: SWHR6-C-0132@v1
  it("[SWHR6-C-0132] catalog maps public identifiers to schema locations", async () => {
    const m = await ful();
    const { entries } = m.schemaCatalog();
    expect(entries.length).toBeGreaterThanOrEqual(3);
    for (const e of entries) {
      expect(e.publicId.length).toBeGreaterThan(0);
      expect(e.location.length).toBeGreaterThan(0);
    }
    const ids = entries.map((e: { publicId: string }) => e.publicId).join("\n");
    expect(ids).toMatch(/SupplierOrder/i);
    expect(ids).toMatch(/Invoice/i);
    expect(ids).toMatch(/LineItem/i);
  });

  // case: SWHR6-C-0250@v1
  it("[SWHR6-C-0250] catalog maps public identifiers to schema locations", async () => {
    const m = await ful();
    const { entries } = m.schemaCatalog();
    expect(entries.length).toBeGreaterThanOrEqual(3);
    for (const e of entries) {
      expect(e.publicId.length).toBeGreaterThan(0);
      expect(e.location.length).toBeGreaterThan(0);
    }
    const ids = entries.map((e: { publicId: string }) => e.publicId).join("\n");
    expect(ids).toMatch(/SupplierOrder/i);
    expect(ids).toMatch(/Invoice/i);
    expect(ids).toMatch(/LineItem/i);
  });

  // case: SWHR6-C-0133@v1
  it("[SWHR6-C-0133] failing invoice message has no effect and is redelivered", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const completed: string[] = [];
    const opc = mkOpc(m, undefined, completed, {
      hooks: {
        onStep: (s: string) => {
          if (s === "notify") throw new Error("injected");
        },
      },
    });
    const res = opc.onInvoiceMessage(
      invoiceXml("PO-1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(res.redelivered).toBe(true);
    expect(m.getOrderStatuses("PO-1")).toEqual(["APPROVED"]);
    expect(m.getPurchaseOrder("PO-1")!.lines.every((l: Row) => l.shipped === 0)).toBe(true);
    expect(completed).toEqual([]);
  });

  // case: SWHR6-C-0251@v1
  it("[SWHR6-C-0251] failing invoice message has no effect and is redelivered", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const completed: string[] = [];
    const opc = mkOpc(m, undefined, completed, {
      hooks: {
        onStep: (s: string) => {
          if (s === "notify") throw new Error("injected");
        },
      },
    });
    const res = opc.onInvoiceMessage(
      invoiceXml("PO-1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(res.redelivered).toBe(true);
    expect(m.getOrderStatuses("PO-1")).toEqual(["APPROVED"]);
    expect(m.getPurchaseOrder("PO-1")!.lines.every((l: Row) => l.shipped === 0)).toBe(true);
    expect(completed).toEqual([]);
  });

  // case: SWHR6-C-0134@v1
  it("[SWHR6-C-0134] final invoice sets COMPLETED and triggers notification", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const completed: string[] = [];
    const res = mkOpc(m, undefined, completed).onInvoiceMessage(
      invoiceXml("PO-1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(res.redelivered).toBe(false);
    expect(m.getOrderStatuses("PO-1")).toEqual(["COMPLETED"]);
    expect(completed).toEqual(["PO-1"]);
  });

  // case: SWHR6-C-0252@v1
  it("[SWHR6-C-0252] final invoice sets COMPLETED and triggers notification", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const completed: string[] = [];
    const res = mkOpc(m, undefined, completed).onInvoiceMessage(
      invoiceXml("PO-1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]),
    );
    expect(res.redelivered).toBe(false);
    expect(m.getOrderStatuses("PO-1")).toEqual(["COMPLETED"]);
    expect(completed).toEqual(["PO-1"]);
  });

  // case: SWHR6-C-0135@v1
  it("[SWHR6-C-0135] partial invoice sets SHIPPED_PART", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const completed: string[] = [];
    mkOpc(m, undefined, completed).onInvoiceMessage(invoiceXml("PO-1", [L(1, { quantity: 2 })]));
    expect(m.getOrderStatuses("PO-1")).toEqual(["SHIPPED_PART"]);
    expect(completed).toEqual([]);
  });

  // case: SWHR6-C-0253@v1
  it("[SWHR6-C-0253] partial invoice sets SHIPPED_PART", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const completed: string[] = [];
    mkOpc(m, undefined, completed).onInvoiceMessage(invoiceXml("PO-1", [L(1, { quantity: 2 })]));
    expect(m.getOrderStatuses("PO-1")).toEqual(["SHIPPED_PART"]);
    expect(completed).toEqual([]);
  });

  // case: SWHR6-C-0136@v1
  it("[SWHR6-C-0136] shipped quantity accumulates 2 + 3 = 5", async () => {
    const m = await ful();
    m.createPurchaseOrder(
      mkPo({
        id: "PO-1",
        status: "SHIPPED_PART",
        lines: [{ ...L(1, { quantity: 5 }), shipped: 2 }],
      }),
    );
    mkOpc(m).onInvoiceMessage(invoiceXml("PO-1", [L(1, { quantity: 3 })]));
    expect(m.getPurchaseOrder("PO-1")!.lines[0].shipped).toBe(5);
  });

  // case: SWHR6-C-0254@v1
  it("[SWHR6-C-0254] shipped quantity accumulates 2 + 3 = 5", async () => {
    const m = await ful();
    m.createPurchaseOrder(
      mkPo({
        id: "PO-1",
        status: "SHIPPED_PART",
        lines: [{ ...L(1, { quantity: 5 }), shipped: 2 }],
      }),
    );
    mkOpc(m).onInvoiceMessage(invoiceXml("PO-1", [L(1, { quantity: 3 })]));
    expect(m.getPurchaseOrder("PO-1")!.lines[0].shipped).toBe(5);
  });

  // case: SWHR6-C-0140@v1
  it("[SWHR6-C-0140] setting status COMPLETED is stored", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    m.setSupplierOrderStatus("S1", "COMPLETED");
    expect(m.getSupplierOrder("S1")!.status).toBe("COMPLETED");
  });

  // case: SWHR6-C-0258@v1
  it("[SWHR6-C-0258] setting status COMPLETED is stored", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    m.setSupplierOrderStatus("S1", "COMPLETED");
    expect(m.getSupplierOrder("S1")!.status).toBe("COMPLETED");
  });

  // case: SWHR6-C-0148@v1
  it("[SWHR6-C-0148] new supplier order is PENDING with given id and date", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.status).toBe("PENDING");
    expect(o.id).toBe("S1");
    expect(o.date.toISOString().slice(0, 10)).toBe("2004-05-06");
  });

  // case: SWHR6-C-0149@v1
  it("[SWHR6-C-0149] creation stores contact copy and two zero-shipped line copies", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.contact).toMatchObject({ firstName: "Ann", email: "ann@example.com" });
    expect(o.lines).toHaveLength(2);
    expect(o.lines.map((l: Row) => l.shipped)).toEqual([0, 0]);
    expect(m.dependentsOf("S1")).toEqual({ contacts: 1, lines: 2 });
  });

  // case: SWHR6-C-0267@v1
  it("[SWHR6-C-0267] creation stores contact copy and two zero-shipped line copies", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.contact).toMatchObject({ firstName: "Ann", email: "ann@example.com" });
    expect(o.lines).toHaveLength(2);
    expect(o.lines.map((l: Row) => l.shipped)).toEqual([0, 0]);
    expect(m.dependentsOf("S1")).toEqual({ contacts: 1, lines: 2 });
  });

  // case: SWHR6-C-0150@v1
  it("[SWHR6-C-0150] removing order removes contact and lines", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1), L(2)]));
    expect(m.dependentsOf("S1")).toEqual({ contacts: 1, lines: 2 });
    m.removeSupplierOrder("S1");
    expect(m.getSupplierOrder("S1")).toBeUndefined();
    expect(m.dependentsOf("S1")).toEqual({ contacts: 0, lines: 0 });
  });

  // case: SWHR6-C-0268@v1
  it("[SWHR6-C-0268] removing order removes contact and lines", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1), L(2)]));
    expect(m.dependentsOf("S1")).toEqual({ contacts: 1, lines: 2 });
    m.removeSupplierOrder("S1");
    expect(m.getSupplierOrder("S1")).toBeUndefined();
    expect(m.dependentsOf("S1")).toEqual({ contacts: 0, lines: 0 });
  });

  // case: SWHR6-C-0151@v1
  it("[SWHR6-C-0151] denying pending order sets DENIED", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "PENDING" }));
    m.denyOrder("A");
    expect(m.getOrderStatuses("A")).toEqual(["DENIED"]);
  });

  // case: SWHR6-C-0152@v1
  it("[SWHR6-C-0152] in-stock line ships whole: stock 10 to 6", async () => {
    const m = await ful();
    m.seedStock("EST-1", 10);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 4 })]));
    mkSvc(m, makeTopic()).fulfil("S1");
    expect(m.stockOf("EST-1")).toBe(6);
    expect(m.getSupplierOrder("S1")!.lines[0].shipped).toBe(4);
  });

  // case: SWHR6-C-0270@v1
  it("[SWHR6-C-0270] in-stock line ships whole: stock 10 to 6", async () => {
    const m = await ful();
    m.seedStock("EST-1", 10);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 4 })]));
    mkSvc(m, makeTopic()).fulfil("S1");
    expect(m.stockOf("EST-1")).toBe(6);
    expect(m.getSupplierOrder("S1")!.lines[0].shipped).toBe(4);
  });

  // case: SWHR6-C-0153@v1
  it("[SWHR6-C-0153] short line ships nothing while other line ships", async () => {
    const m = await ful();
    m.seedStock("EST-1", 3);
    m.seedStock("EST-2", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 4 }), L(2, { quantity: 2 })]));
    mkSvc(m, makeTopic()).fulfil("S1");
    const o = m.getSupplierOrder("S1")!;
    expect(o.lines.find((l: Row) => l.item === "EST-1")!.shipped).toBe(0);
    expect(m.stockOf("EST-1")).toBe(3);
    expect(o.lines.find((l: Row) => l.item === "EST-2")!.shipped).toBe(2);
    expect(m.stockOf("EST-2")).toBe(3);
  });

  // case: SWHR6-C-0271@v1
  it("[SWHR6-C-0271] short line ships nothing while other line ships", async () => {
    const m = await ful();
    m.seedStock("EST-1", 3);
    m.seedStock("EST-2", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 4 }), L(2, { quantity: 2 })]));
    mkSvc(m, makeTopic()).fulfil("S1");
    const o = m.getSupplierOrder("S1")!;
    expect(o.lines.find((l: Row) => l.item === "EST-1")!.shipped).toBe(0);
    expect(m.stockOf("EST-1")).toBe(3);
    expect(o.lines.find((l: Row) => l.item === "EST-2")!.shipped).toBe(2);
    expect(m.stockOf("EST-2")).toBe(3);
  });

  // case: SWHR6-C-0154@v1
  it("[SWHR6-C-0154] all lines shipped makes order COMPLETED", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.seedStock("EST-2", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    mkSvc(m, makeTopic()).fulfil("S1");
    expect(m.getSupplierOrder("S1")!.status).toBe("COMPLETED");
  });

  // case: SWHR6-C-0272@v1
  it("[SWHR6-C-0272] all lines shipped makes order COMPLETED", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.seedStock("EST-2", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    mkSvc(m, makeTopic()).fulfil("S1");
    expect(m.getSupplierOrder("S1")!.status).toBe("COMPLETED");
  });

  // case: SWHR6-C-0155@v1
  it("[SWHR6-C-0155] short line leaves order pending for later attempt", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.seedStock("EST-2", 1);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const svc = mkSvc(m, makeTopic());
    svc.fulfil("S1");
    expect(m.getSupplierOrder("S1")!.status).toBe("PENDING");
    expect(m.supplierOrdersByStatus("PENDING")).toEqual(["S1"]);
    m.seedStock("EST-2", 3);
    svc.fulfil("S1");
    const o = m.getSupplierOrder("S1")!;
    expect(o.lines.map((l: Row) => l.shipped)).toEqual([2, 3]);
    expect(o.status).toBe("COMPLETED");
  });

  // case: SWHR6-C-0273@v1
  it("[SWHR6-C-0273] short line leaves order pending for later attempt", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.seedStock("EST-2", 1);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const svc = mkSvc(m, makeTopic());
    svc.fulfil("S1");
    expect(m.getSupplierOrder("S1")!.status).toBe("PENDING");
    expect(m.supplierOrdersByStatus("PENDING")).toEqual(["S1"]);
    m.seedStock("EST-2", 3);
    svc.fulfil("S1");
    const o = m.getSupplierOrder("S1")!;
    expect(o.lines.map((l: Row) => l.shipped)).toEqual([2, 3]);
    expect(o.status).toBe("COMPLETED");
  });

  // case: SWHR6-C-0156@v1
  it("[SWHR6-C-0156] database rejects supplier order status APPROVED", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    expect(() => m.setSupplierOrderStatus("S1", "APPROVED")).toThrow();
    expect(m.getSupplierOrder("S1")!.status).toBe("PENDING");
  });

  // case: SWHR6-C-0274@v1
  it("[SWHR6-C-0274] database rejects supplier order status APPROVED", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    expect(() => m.setSupplierOrderStatus("S1", "APPROVED")).toThrow();
    expect(m.getSupplierOrder("S1")!.status).toBe("PENDING");
  });

  // case: SWHR6-C-0157@v1
  it("[SWHR6-C-0157] approval sends supplier order with all fields", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const sent: string[] = [];
    const res = mkOpc(m, { send: (t: string) => void sent.push(t) }).processApproval("PO-1");
    expect(res.redelivered).toBe(false);
    expect(sent).toHaveLength(1);
    const o = m.parseSupplierOrderXml(sent[0]);
    expect(o.id).toBe("PO-1");
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

  // case: SWHR6-C-0275@v1
  it("[SWHR6-C-0275] approval sends supplier order with all fields", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", status: "APPROVED" }));
    const sent: string[] = [];
    const res = mkOpc(m, { send: (t: string) => void sent.push(t) }).processApproval("PO-1");
    expect(res.redelivered).toBe(false);
    expect(sent).toHaveLength(1);
    const o = m.parseSupplierOrderXml(sent[0]);
    expect(o.id).toBe("PO-1");
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

  // case: SWHR6-C-0160@v1
  it("[SWHR6-C-0160] order with contact and lines keeps all parts", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.id).toBe("S1");
    expect(o.contact).toMatchObject({
      firstName: "Ann",
      lastName: "Lee",
      street1: "1 Main St",
      city: "Springfield",
      zip: "94000",
      phone: "555-0100",
    });
    expect(o.lines).toHaveLength(2);
    expect(o.lines[1]).toMatchObject({
      category: "Dogs",
      product: "P2",
      item: "EST-2",
      lineNum: 2,
      quantity: 3,
      unitPrice: 20,
    });
  });

  // case: SWHR6-C-0278@v1
  it("[SWHR6-C-0278] order with contact and lines keeps all parts", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.id).toBe("S1");
    expect(o.contact).toMatchObject({
      firstName: "Ann",
      lastName: "Lee",
      street1: "1 Main St",
      city: "Springfield",
      zip: "94000",
      phone: "555-0100",
    });
    expect(o.lines).toHaveLength(2);
    expect(o.lines[1]).toMatchObject({
      category: "Dogs",
      product: "P2",
      item: "EST-2",
      lineNum: 2,
      quantity: 3,
      unitPrice: 20,
    });
  });

  // case: SWHR6-C-0161@v1
  it("[SWHR6-C-0161] lookup PENDING returns only pending supplier orders", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    m.createSupplierOrder(mkOrder("S2", [L(1)]));
    m.createSupplierOrder(mkOrder("S3", [L(1)]));
    m.setSupplierOrderStatus("S3", "COMPLETED");
    expect(m.supplierOrdersByStatus("PENDING").sort()).toEqual(["S1", "S2"]);
  });

  // case: SWHR6-C-0279@v1
  it("[SWHR6-C-0279] lookup PENDING returns only pending supplier orders", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1)]));
    m.createSupplierOrder(mkOrder("S2", [L(1)]));
    m.createSupplierOrder(mkOrder("S3", [L(1)]));
    m.setSupplierOrderStatus("S3", "COMPLETED");
    expect(m.supplierOrdersByStatus("PENDING").sort()).toEqual(["S1", "S2"]);
  });

  // case: SWHR6-C-0162@v1
  it("[SWHR6-C-0162] fully shipped line skipped on retry", async () => {
    const m = await ful();
    m.seedStock("EST-1", 10);
    m.seedStock("EST-2", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 4 }), L(2, { quantity: 2 })]));
    m.setLineShipped("S1", 1, 4);
    const topic = makeTopic();
    const svc = mkSvc(m, topic);
    svc.fulfil("S1");
    expect(svc.stockChecks).not.toContain("EST-1");
    expect(m.stockOf("EST-1")).toBe(10);
    expect(m.getSupplierOrder("S1")!.lines[0].shipped).toBe(4);
    expect(topic.messages).toHaveLength(1);
    expect(topic.messages[0]).not.toContain("EST-1");
    expect(topic.messages[0]).toContain("<ItemId>EST-2</ItemId>");
  });

  // case: SWHR6-C-0280@v1
  it("[SWHR6-C-0280] fully shipped line skipped on retry", async () => {
    const m = await ful();
    m.seedStock("EST-1", 10);
    m.seedStock("EST-2", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 4 }), L(2, { quantity: 2 })]));
    m.setLineShipped("S1", 1, 4);
    const topic = makeTopic();
    const svc = mkSvc(m, topic);
    svc.fulfil("S1");
    expect(svc.stockChecks).not.toContain("EST-1");
    expect(m.stockOf("EST-1")).toBe(10);
    expect(m.getSupplierOrder("S1")!.lines[0].shipped).toBe(4);
    expect(topic.messages).toHaveLength(1);
    expect(topic.messages[0]).not.toContain("EST-1");
    expect(topic.messages[0]).toContain("<ItemId>EST-2</ItemId>");
  });

  // case: SWHR6-C-0163@v1
  it("[SWHR6-C-0163] partial shipment invoice lists only shipped line", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const topic = makeTopic();
    mkSvc(m, topic).fulfil("S1");
    expect(topic.messages).toHaveLength(1);
    const xml = topic.messages[0];
    expect(xml).toContain("<ItemId>EST-1</ItemId>");
    expect(xml).not.toContain("EST-2");
    expect(xml).toContain("<ShippingDate>2026-06-15</ShippingDate>");
    expect(xml).toContain("<OrderDate>2004-05-06</OrderDate>");
    expect(xml).toContain("Dear PetStore Customer");
  });

  // case: SWHR6-C-0281@v1
  it("[SWHR6-C-0281] partial shipment invoice lists only shipped line", async () => {
    const m = await ful();
    m.seedStock("EST-1", 5);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const topic = makeTopic();
    mkSvc(m, topic).fulfil("S1");
    expect(topic.messages).toHaveLength(1);
    const xml = topic.messages[0];
    expect(xml).toContain("<ItemId>EST-1</ItemId>");
    expect(xml).not.toContain("EST-2");
    expect(xml).toContain("<ShippingDate>2026-06-15</ShippingDate>");
    expect(xml).toContain("<OrderDate>2004-05-06</OrderDate>");
    expect(xml).toContain("Dear PetStore Customer");
  });

  // case: SWHR6-C-0164@v1
  it("[SWHR6-C-0164] nothing shipped produces no invoice", async () => {
    const m = await ful();
    m.seedStock("EST-1", 1);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 })]));
    const topic = makeTopic();
    mkSvc(m, topic).fulfil("S1");
    expect(m.getSupplierOrder("S1")!.lines[0].shipped).toBe(0);
    expect(topic.messages).toHaveLength(0);
  });

  // case: SWHR6-C-0282@v1
  it("[SWHR6-C-0282] nothing shipped produces no invoice", async () => {
    const m = await ful();
    m.seedStock("EST-1", 1);
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 })]));
    const topic = makeTopic();
    mkSvc(m, topic).fulfil("S1");
    expect(m.getSupplierOrder("S1")!.lines[0].shipped).toBe(0);
    expect(topic.messages).toHaveLength(0);
  });

  // case: SWHR6-C-0165@v1
  it("[SWHR6-C-0165] purchase order missing date or value rejected", async () => {
    const m = await ful();
    expect(() => m.createPurchaseOrder(mkPo({ id: "OK" }))).not.toThrow();
    expect(() => m.createPurchaseOrder(mkPo({ id: "ND", date: undefined }))).toThrow();
    expect(() => m.createPurchaseOrder(mkPo({ id: "NV", value: undefined }))).toThrow();
    expect(m.getPurchaseOrder("ND")).toBeUndefined();
    expect(m.getPurchaseOrder("NV")).toBeUndefined();
  });

  // case: SWHR6-C-0283@v1
  it("[SWHR6-C-0283] purchase order missing date or value rejected", async () => {
    const m = await ful();
    expect(() => m.createPurchaseOrder(mkPo({ id: "OK" }))).not.toThrow();
    expect(() => m.createPurchaseOrder(mkPo({ id: "ND", date: undefined }))).toThrow();
    expect(() => m.createPurchaseOrder(mkPo({ id: "NV", value: undefined }))).toThrow();
    expect(m.getPurchaseOrder("ND")).toBeUndefined();
    expect(m.getPurchaseOrder("NV")).toBeUndefined();
  });

  // case: SWHR6-C-0166@v1
  it("[SWHR6-C-0166] duplicate purchase order id rejected", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "X", value: 100 }));
    expect(() => m.createPurchaseOrder(mkPo({ id: "X", value: 200 }))).toThrow();
    expect(m.getPurchaseOrder("X")!.value).toBe(100);
  });

  // case: SWHR6-C-0284@v1
  it("[SWHR6-C-0284] duplicate purchase order id rejected", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "X", value: 100 }));
    expect(() => m.createPurchaseOrder(mkPo({ id: "X", value: 200 }))).toThrow();
    expect(m.getPurchaseOrder("X")!.value).toBe(100);
  });

  // case: SWHR6-C-0167@v1
  it("[SWHR6-C-0167] shipped greater than ordered rejected", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", lines: [{ ...L(1, { quantity: 2 }), shipped: 0 }] }));
    expect(() => m.setPurchaseOrderLineShipped("PO-1", 1, 3)).toThrow();
    expect(m.getPurchaseOrder("PO-1")!.lines[0].shipped).toBe(0);
  });

  // case: SWHR6-C-0285@v1
  it("[SWHR6-C-0285] shipped greater than ordered rejected", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "PO-1", lines: [{ ...L(1, { quantity: 2 }), shipped: 0 }] }));
    expect(() => m.setPurchaseOrderLineShipped("PO-1", 1, 3)).toThrow();
    expect(m.getPurchaseOrder("PO-1")!.lines[0].shipped).toBe(0);
  });

  // case: SWHR6-C-0168@v1
  it("[SWHR6-C-0168] supplier order stored with all parts and unique id", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.date.toISOString().slice(0, 10)).toBe("2004-05-06");
    expect(o.status).toBe("PENDING");
    expect(o.contact.email).toBe("ann@example.com");
    expect(o.lines).toHaveLength(2);
    expect(() => m.createSupplierOrder(mkOrder("S1", [L(1)]))).toThrow();
    expect(m.getSupplierOrder("S1")!.lines).toHaveLength(2);
  });

  // case: SWHR6-C-0286@v1
  it("[SWHR6-C-0286] supplier order stored with all parts and unique id", async () => {
    const m = await ful();
    m.createSupplierOrder(mkOrder("S1", [L(1, { quantity: 2 }), L(2, { quantity: 3 })]));
    const o = m.getSupplierOrder("S1")!;
    expect(o.date.toISOString().slice(0, 10)).toBe("2004-05-06");
    expect(o.status).toBe("PENDING");
    expect(o.contact.email).toBe("ann@example.com");
    expect(o.lines).toHaveLength(2);
    expect(() => m.createSupplierOrder(mkOrder("S1", [L(1)]))).toThrow();
    expect(m.getSupplierOrder("S1")!.lines).toHaveLength(2);
  });

  // case: SWHR6-C-0169@v1
  it("[SWHR6-C-0169] search by order date returns matching orders", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", date: new Date("2004-05-06T12:00:00Z") }));
    m.createPurchaseOrder(mkPo({ id: "B", date: new Date("2004-05-06T12:00:00Z") }));
    m.createPurchaseOrder(mkPo({ id: "C", date: new Date("2005-01-01T12:00:00Z") }));
    expect(m.purchaseOrdersByDate(new Date("2004-05-06T12:00:00Z")).sort()).toEqual(["A", "B"]);
  });

  // case: SWHR6-C-0287@v1
  it("[SWHR6-C-0287] search by order date returns matching orders", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", date: new Date("2004-05-06T12:00:00Z") }));
    m.createPurchaseOrder(mkPo({ id: "B", date: new Date("2004-05-06T12:00:00Z") }));
    m.createPurchaseOrder(mkPo({ id: "C", date: new Date("2005-01-01T12:00:00Z") }));
    expect(m.purchaseOrdersByDate(new Date("2004-05-06T12:00:00Z")).sort()).toEqual(["A", "B"]);
  });

  // case: SWHR6-C-0170@v1
  it("[SWHR6-C-0170] search managed orders by status", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "PENDING" }));
    m.createPurchaseOrder(mkPo({ id: "B", status: "SHIPPED_PART" }));
    m.createPurchaseOrder(mkPo({ id: "C", status: "SHIPPED_PART" }));
    expect(m.ordersByStatus("SHIPPED_PART").sort()).toEqual(["B", "C"]);
    expect(m.ordersByStatus("PENDING")).toEqual(["A"]);
  });

  // case: SWHR6-C-0288@v1
  it("[SWHR6-C-0288] search managed orders by status", async () => {
    const m = await ful();
    m.createPurchaseOrder(mkPo({ id: "A", status: "PENDING" }));
    m.createPurchaseOrder(mkPo({ id: "B", status: "SHIPPED_PART" }));
    m.createPurchaseOrder(mkPo({ id: "C", status: "SHIPPED_PART" }));
    expect(m.ordersByStatus("SHIPPED_PART").sort()).toEqual(["B", "C"]);
    expect(m.ordersByStatus("PENDING")).toEqual(["A"]);
  });

  // case: SWHR6-C-0173@v1
  it("[SWHR6-C-0173] order line keeps all seven fields", async () => {
    const m = await ful();
    m.createPurchaseOrder(
      mkPo({
        id: "PO-1",
        lines: [
          {
            category: "Cats",
            product: "Persian",
            item: "EST-7",
            lineNum: 4,
            quantity: 6,
            unitPrice: 12.5,
            shipped: 2,
          },
        ],
      }),
    );
    expect(m.getPurchaseOrder("PO-1")!.lines[0]).toMatchObject({
      category: "Cats",
      product: "Persian",
      item: "EST-7",
      lineNum: 4,
      quantity: 6,
      unitPrice: 12.5,
      shipped: 2,
    });
  });

  // case: SWHR6-C-0291@v1
  it("[SWHR6-C-0291] order line keeps all seven fields", async () => {
    const m = await ful();
    m.createPurchaseOrder(
      mkPo({
        id: "PO-1",
        lines: [
          {
            category: "Cats",
            product: "Persian",
            item: "EST-7",
            lineNum: 4,
            quantity: 6,
            unitPrice: 12.5,
            shipped: 2,
          },
        ],
      }),
    );
    expect(m.getPurchaseOrder("PO-1")!.lines[0]).toMatchObject({
      category: "Cats",
      product: "Persian",
      item: "EST-7",
      lineNum: 4,
      quantity: 6,
      unitPrice: 12.5,
      shipped: 2,
    });
  });
});
