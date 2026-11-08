// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  ADMIN,
  NOT_AUTHORISED,
  NO_ITEMS,
  USER,
  inv,
  makeTopic,
} from "./inventory-management-contract";

const svc = (
  m: Awaited<ReturnType<typeof inv>>,
  topic = makeTopic(),
  onStep?: (s: string) => void,
) => m.createInventoryService({ invoiceTopic: topic, hooks: onStep ? { onStep } : undefined });

describe("inventory management (integration)", () => {
  // case: SWHR6-C-0085@v1
  it("[SWHR6-C-0085] unreadable stock shows no-items message", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    const s = svc(m, makeTopic(), (step) => {
      if (step === "read") throw new Error("read failed");
    });
    expect(s.displayInventory(ADMIN)).toEqual({ kind: "message", message: NO_ITEMS });
  });

  // case: SWHR6-C-0086@v1
  it("[SWHR6-C-0086] non-administrator sees not-authorised message", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    const out = svc(m).displayInventory(USER);
    expect(out).toEqual({ kind: "message", message: NOT_AUTHORISED });
  });

  // case: SWHR6-C-0090@v1
  it("[SWHR6-C-0090] ticked row replaces quantity 5 with 12", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    svc(m).submitChanges(ADMIN, [{ itemId: "EST-1", update: true, newQuantity: "12" }]);
    expect(m.stockOf("EST-1")).toBe(12);
  });

  // case: SWHR6-C-0091@v1
  it("[SWHR6-C-0091] blank or negative new quantity ignored", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    const s = svc(m);
    s.submitChanges(ADMIN, [{ itemId: "EST-1", update: true, newQuantity: "" }]);
    expect(m.stockOf("EST-1")).toBe(5);
    s.submitChanges(ADMIN, [{ itemId: "EST-1", update: true, newQuantity: "-3" }]);
    expect(m.stockOf("EST-1")).toBe(5);
  });

  // case: SWHR6-C-0092@v1
  it("[SWHR6-C-0092] unticked row ignored", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    svc(m).submitChanges(ADMIN, [{ itemId: "EST-1", update: false, newQuantity: "12" }]);
    expect(m.stockOf("EST-1")).toBe(5);
  });

  // case: SWHR6-C-0093@v1
  it("[SWHR6-C-0093] second stock record for same item rejected", async () => {
    const m = await inv();
    m.createStockRecord("X", 3);
    expect(() => m.createStockRecord("X", 4)).toThrow();
    expect(m.stockRecordCount("X")).toBe(1);
    expect(m.stockOf("X")).toBe(3);
  });

  // case: SWHR6-C-0094@v1
  it("[SWHR6-C-0094] stock record without quantity rejected", async () => {
    const m = await inv();
    expect(() => m.createStockRecord("Y")).toThrow();
    expect(m.stockOf("Y")).toBeUndefined();
  });

  // case: SWHR6-C-0095@v1
  it("[SWHR6-C-0095] negative quantity rejected, value unchanged", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    expect(() => m.setStockQuantity("EST-1", -1)).toThrow();
    expect(m.stockOf("EST-1")).toBe(5);
  });

  // case: SWHR6-C-0096@v1
  it("[SWHR6-C-0096] stock update fulfils pending order and publishes invoice", async () => {
    const m = await inv();
    m.seedStock("EST-1", 0);
    m.seedPendingOrder({ id: "PO-1", lines: [{ item: "EST-1", quantity: 2 }] });
    const topic = makeTopic();
    const page = svc(m, topic).submitChanges(ADMIN, [
      { itemId: "EST-1", update: true, newQuantity: "5" },
    ]);
    expect(m.orderState("PO-1").status).toBe("COMPLETED");
    expect(topic.messages).toHaveLength(1);
    expect(topic.messages[0]).toContain("PO-1");
    expect(page.message).toBe("Inventory was updated successfully");
    expect(page.options.join(" ")).toMatch(/display inventory/i);
    expect(page.options.join(" ")).toMatch(/log ?out/i);
  });

  // case: SWHR6-C-0097@v1
  it("[SWHR6-C-0097] failure rolls back stock, re-attempt and invoice", async () => {
    for (const failing of ["reattempt", "publish"]) {
      const m = await inv();
      m.seedStock("EST-1", 0);
      m.seedPendingOrder({ id: "PO-1", lines: [{ item: "EST-1", quantity: 2 }] });
      const topic = makeTopic();
      const s = svc(m, topic, (step) => {
        if (step === failing) throw new Error("boom");
      });
      try {
        s.submitChanges(ADMIN, [{ itemId: "EST-1", update: true, newQuantity: "5" }]);
      } catch {
        /* the failure may surface as a throw */
      }
      expect(m.stockOf("EST-1")).toBe(0);
      expect(m.orderState("PO-1").status).toBe("PENDING");
      expect(topic.messages).toHaveLength(0);
    }
  });

  // case: SWHR6-C-0098@v1
  it("[SWHR6-C-0098] non-integer quantity fails the request", async () => {
    const m = await inv();
    m.seedStock("EST-1", 5);
    expect(() =>
      svc(m).submitChanges(ADMIN, [{ itemId: "EST-1", update: true, newQuantity: "abc" }]),
    ).toThrow();
    expect(m.stockOf("EST-1")).toBe(5);
  });
});
