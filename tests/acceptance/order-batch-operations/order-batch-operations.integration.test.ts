// @vitest-environment node
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DAY, HOUR, NOW, ago, batch, parseCsv, read, tmp } from "./order-batch-operations-contract";

describe("order batch operations", () => {
  // case: SWHR6-C-0109@v1
  it("SWHR6-C-0109 order status view returns one row per order", async () => {
    const b = await batch();
    for (const [id, status] of [
      ["A1", "PENDING"],
      ["A2", "APPROVED"],
      ["A3", "COMPLETED"],
    ] as const) {
      b.seedOrder({ id, userId: `u-${id}`, date: ago(HOUR), value: 10, status });
    }
    const rows = b.orderStatusView();
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.id).sort()).toEqual(["A1", "A2", "A3"]);
    const a2 = rows.find((r) => r.id === "A2")!;
    expect(a2.userId).toBe("u-A2");
    expect(a2.status).toBe("APPROVED");
    expect(a2.value).toBe(10);
    expect(a2.date).toBeDefined();
  });

  // case: SWHR6-C-0110@v1
  it("SWHR6-C-0110 aging report flags only 30-hour-old pending order as STUCK", async () => {
    const b = await batch();
    b.seedOrder({ id: "OLD", date: ago(30 * HOUR), status: "PENDING" });
    b.seedOrder({ id: "NEW", date: ago(2 * HOUR), status: "APPROVED" });
    const { stuck } = b.agingReport(NOW);
    expect(stuck.map((s) => s.orderId)).toEqual(["OLD"]);
    expect(stuck[0].flag).toBe("STUCK");
  });

  // case: SWHR6-C-0111@v1
  it("SWHR6-C-0111 aging report lists status counts ordered by status", async () => {
    const b = await batch();
    b.seedOrder({ id: "1", date: ago(HOUR), status: "PENDING" });
    b.seedOrder({ id: "2", date: ago(HOUR), status: "PENDING" });
    b.seedOrder({ id: "3", date: ago(HOUR), status: "APPROVED" });
    b.seedOrder({ id: "4", date: ago(HOUR), status: "COMPLETED" });
    const { statusCounts } = b.agingReport(NOW);
    expect(statusCounts).toEqual([
      { status: "APPROVED", count: 1 },
      { status: "COMPLETED", count: 1 },
      { status: "PENDING", count: 2 },
    ]);
  });

  // case: SWHR6-C-0112@v1
  it("SWHR6-C-0112 completed supplier order vs APPROVED manager status is MISMATCH", async () => {
    const b = await batch();
    b.seedOrder({ id: "M1", date: ago(HOUR), status: "APPROVED", supplierStatus: "COMPLETED" });
    b.seedOrder({ id: "OK", date: ago(HOUR), status: "COMPLETED", supplierStatus: "COMPLETED" });
    const { mismatches } = b.agingReport(NOW);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toMatchObject({
      orderId: "M1",
      managerStatus: "APPROVED",
      supplierStatus: "COMPLETED",
      flag: "MISMATCH",
    });
  });

  // case: SWHR6-C-0113@v1
  it("SWHR6-C-0113 low stock report lists items below threshold with totals", async () => {
    const b = await batch();
    b.seedInventoryItem({ itemId: "I-3", productId: "P1", quantity: 3, description: "Three" });
    b.seedInventoryItem({ itemId: "I-10", productId: "P2", quantity: 10, description: "Ten" });
    b.seedInventoryItem({ itemId: "I-7", productId: "P3", quantity: 7, description: "Seven" });
    const r = b.inventoryReport({ threshold: 10 });
    expect(r.items.map((i) => i.quantity)).toEqual([3, 7]);
    expect(r.items.map((i) => i.itemId)).toEqual(["I-3", "I-7"]);
    expect(r.items[0]).toMatchObject({ productId: "P1", description: "Three" });
    expect(r.trackedItems).toBe(3);
    expect(r.totalUnits).toBe(20);
  });

  // case: SWHR6-C-0114@v1
  it("SWHR6-C-0114 low-stock item without en_US description omitted", async () => {
    const b = await batch();
    b.seedInventoryItem({ itemId: "I-1", productId: "P1", quantity: 2, description: null });
    b.seedInventoryItem({ itemId: "I-2", productId: "P2", quantity: 4, description: "Has text" });
    const r = b.inventoryReport({ threshold: 10 });
    expect(r.items.map((i) => i.itemId)).toEqual(["I-2"]);
  });

  // case: SWHR6-C-0115@v1
  it("SWHR6-C-0115 backup job writes backup and moves to dated folder", async () => {
    const b = await batch();
    const backupDir = tmp();
    const datedRoot = tmp();
    const res = b.backupDatabase({ backupDir, datedRoot, now: NOW });
    expect(existsSync(res.backupFile)).toBe(true);
    expect(path.dirname(res.backupFile)).toBe(res.datedDir);
    expect(path.dirname(res.datedDir)).toBe(datedRoot);
    expect(readdirSync(res.datedDir).length).toBeGreaterThan(0);
    // moved out of the backup folder
    expect(readdirSync(backupDir)).not.toContain(path.basename(res.backupFile));
  });

  // case: SWHR6-C-0116@v1
  it("SWHR6-C-0116 purge scheduled only after order extract", async () => {
    const b = await batch();
    const order = b.nightlyBatchCycle({}, { now: NOW, outDir: tmp() });
    expect(order).toContain("extract");
    expect(order).toContain("purge");
    expect(order.indexOf("extract")).toBeLessThan(order.indexOf("purge"));
  });

  // case: SWHR6-C-0117@v1
  it("SWHR6-C-0117 extract writes only yesterday's orders, seven columns, by id", async () => {
    const b = await batch();
    const midnight = new Date("2026-06-15T00:00:00");
    const yest = (h: number) => new Date(midnight.getTime() - DAY + h * HOUR);
    b.seedOrder({
      id: "30",
      userId: "u3",
      date: yest(9),
      status: "APPROVED",
      value: 30,
      lineCount: 2,
      locale: "en_US",
    });
    b.seedOrder({
      id: "10",
      userId: "u1",
      date: yest(1),
      status: "PENDING",
      value: 10,
      lineCount: 1,
      locale: "en_US",
    });
    b.seedOrder({
      id: "20",
      userId: "u2",
      date: new Date(midnight.getTime() + 2 * HOUR),
      status: "PENDING",
      value: 20,
    });
    b.seedOrder({
      id: "05",
      userId: "u0",
      date: new Date(midnight.getTime() - DAY - HOUR),
      status: "PENDING",
      value: 5,
    });
    const { file } = b.extractOrders({
      now: new Date(midnight.getTime() + 12 * HOUR),
      outDir: tmp(),
    });
    let rows = parseCsv(read(file));
    if (rows.length && rows[0][0] && !/^\d/.test(rows[0][0])) rows = rows.slice(1); // tolerate a header row
    expect(rows.map((r) => r[0])).toEqual(["10", "30"]);
    for (const r of rows) expect(r).toHaveLength(7);
    expect(rows[0][1]).toBe("u1");
    expect(rows[0][3]).toBe("en_US");
    expect(rows[0][4]).toBe("10");
    expect(rows[0][5]).toBe("1");
    expect(rows[0][6]).toBe("PENDING");
  });

  // case: SWHR6-C-0118@v1
  it("SWHR6-C-0118 extract skips order lacking manager record", async () => {
    const b = await batch();
    const midnight = new Date("2026-06-15T00:00:00");
    const at = new Date(midnight.getTime() - 5 * HOUR);
    b.seedOrder({ id: "WITH", date: at, status: "PENDING" });
    b.seedOrder({ id: "WITHOUT", date: at, status: "NONE" });
    const { file } = b.extractOrders({
      now: new Date(midnight.getTime() + 12 * HOUR),
      outDir: tmp(),
    });
    const ids = parseCsv(read(file)).map((r) => r[0]);
    expect(ids).toContain("WITH");
    expect(ids).not.toContain("WITHOUT");
  });

  // case: SWHR6-C-0119@v1
  it("SWHR6-C-0119 purge removes old completed order with dependents, keeps pending", async () => {
    const b = await batch();
    b.seedOrder({
      id: "DONE",
      date: ago(200 * DAY),
      status: "COMPLETED",
      supplierStatus: "COMPLETED",
      lineCount: 2,
    });
    b.seedOrder({ id: "WAIT", date: ago(200 * DAY), status: "PENDING", lineCount: 1 });
    const res = b.purgeOrders({ now: NOW });
    expect(res.purged).toEqual(["DONE"]);
    const gone = b.orderRecords("DONE");
    expect(gone.order).toBeUndefined();
    expect(gone.managerRecord).toBeUndefined();
    for (const k of [
      "lines",
      "supplierOrders",
      "supplierLines",
      "contacts",
      "addresses",
      "cards",
    ] as const) {
      expect(gone[k], k).toHaveLength(0);
    }
    const kept = b.orderRecords("WAIT");
    expect(kept.order).toBeDefined();
    expect(kept.lines.length).toBeGreaterThan(0);
  });

  // case: SWHR6-C-0120@v1
  it("SWHR6-C-0120 old completed order without contact record not purged", async () => {
    const b = await batch();
    b.seedOrder({ id: "NOCONTACT", date: ago(200 * DAY), status: "COMPLETED", withContact: false });
    const res = b.purgeOrders({ now: NOW });
    expect(res.purged).not.toContain("NOCONTACT");
    expect(b.orderRecords("NOCONTACT").order).toBeDefined();
  });
});
