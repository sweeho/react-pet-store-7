// @vitest-environment node
import { describe, expect, it } from "vitest";

import { at, sales, toMap } from "./sales-reporting-contract";

const START = at(2026, 3, 1, 0);
const END = at(2026, 3, 31, 23);
const line = (category: string, item: string, quantity: number, unitPrice: number) => ({
  category,
  item,
  quantity,
  unitPrice,
});

describe("sales reporting", () => {
  // case: SWHR6-C-0099@v1
  it("[SWHR6-C-0099] orders by status returns only that status with formatted fields", async () => {
    const s = await sales();
    s.seedSalesOrder({
      id: "A1",
      userId: "u1",
      date: at(2026, 3, 5),
      value: 10.5,
      status: "APPROVED",
    });
    s.seedSalesOrder({
      id: "A2",
      userId: "u2",
      date: at(2026, 12, 25),
      value: 20,
      status: "APPROVED",
    });
    s.seedSalesOrder({
      id: "A3",
      userId: "u3",
      date: at(2026, 1, 9),
      value: 30,
      status: "APPROVED",
    });
    s.seedSalesOrder({ id: "D1", userId: "u4", date: at(2026, 3, 6), value: 40, status: "DENIED" });
    s.seedSalesOrder({ id: "D2", userId: "u5", date: at(2026, 3, 7), value: 50, status: "DENIED" });
    const rows = s.ordersByStatus("APPROVED");
    expect(rows.map((r) => r.id).sort()).toEqual(["A1", "A2", "A3"]);
    const a1 = rows.find((r) => r.id === "A1")!;
    expect(a1).toMatchObject({ userId: "u1", date: "3/5/2026", value: 10.5, status: "APPROVED" });
    expect(rows.find((r) => r.id === "A2")!.date).toBe("12/25/2026");
    expect(rows.find((r) => r.id === "A3")!.date).toBe("1/9/2026");
  });

  // case: SWHR6-C-0100@v1
  it("[SWHR6-C-0100] status with no orders returns an empty list when orders exist only in other statuses", async () => {
    const s = await sales();
    s.seedSalesOrder({ id: "D1", date: at(2026, 3, 6), status: "DENIED" });
    s.seedSalesOrder({ id: "P1", date: at(2026, 3, 6), status: "PENDING" });
    expect(s.ordersByStatus("APPROVED")).toEqual([]);
  });

  // case: SWHR6-C-0100@v1
  it("[SWHR6-C-0100] status with no orders returns an empty list when there are no orders at all", async () => {
    const s = await sales();
    expect(s.ordersByStatus("APPROVED")).toEqual([]);
  });

  // case: SWHR6-C-0101@v1
  it("[SWHR6-C-0101] status view lists order with status record", async () => {
    const s = await sales();
    s.seedSalesOrder({
      id: "V1",
      userId: "u-v1",
      date: at(2026, 3, 5),
      value: 99.5,
      status: "APPROVED",
    });
    const row = s.orderStatusView().find((r) => r.id === "V1");
    expect(row).toBeDefined();
    expect(row).toMatchObject({ id: "V1", userId: "u-v1", value: 99.5, status: "APPROVED" });
    expect(row!.date).toBeDefined();
  });

  // case: SWHR6-C-0102@v1
  it("[SWHR6-C-0102] status view omits order lacking status record", async () => {
    const s = await sales();
    s.seedSalesOrder({ id: "HAS", date: at(2026, 3, 5), status: "APPROVED" });
    s.seedSalesOrder({ id: "NOREC", date: at(2026, 3, 5), status: "NONE" });
    const ids = s.orderStatusView().map((r) => r.id);
    expect(ids).toContain("HAS");
    expect(ids).not.toContain("NOREC");
  });

  // case: SWHR6-C-0103@v1
  it("[SWHR6-C-0103] revenue by category sums quantity x price including denied", async () => {
    const s = await sales();
    s.seedSalesOrder({
      id: "O1",
      date: at(2026, 3, 10),
      status: "APPROVED",
      lines: [line("FISH", "F1", 2, 10), line("DOGS", "D1", 1, 7.5)],
    });
    s.seedSalesOrder({
      id: "O2",
      date: at(2026, 3, 11),
      status: "DENIED",
      lines: [line("FISH", "F2", 3, 4)],
    });
    const totals = toMap(s.revenueReport({ start: START, end: END }), (r) => r.total);
    expect(totals).toEqual({ FISH: 2 * 10 + 3 * 4, DOGS: 7.5 });
  });

  // case: SWHR6-C-0104@v1
  it("[SWHR6-C-0104] revenue by item within category A only", async () => {
    const s = await sales();
    s.seedSalesOrder({
      id: "O1",
      date: at(2026, 3, 10),
      status: "APPROVED",
      lines: [line("A", "A1", 2, 10), line("B", "B1", 5, 100)],
    });
    s.seedSalesOrder({
      id: "O2",
      date: at(2026, 3, 12),
      status: "PENDING",
      lines: [line("A", "A1", 1, 10), line("A", "A2", 4, 2.5), line("B", "B2", 1, 1)],
    });
    const totals = toMap(
      s.revenueReport({ start: START, end: END, category: "A" }),
      (r) => r.total,
    );
    expect(totals).toEqual({ A1: 30, A2: 10 });
  });

  // case: SWHR6-C-0105@v1
  it("[SWHR6-C-0105] revenue period boundaries are inclusive", async () => {
    const s = await sales();
    const start = at(2026, 4, 1, 0);
    const end = at(2026, 4, 30, 23);
    s.seedSalesOrder({ id: "S", date: start, status: "APPROVED", lines: [line("A", "A1", 1, 10)] });
    s.seedSalesOrder({ id: "E", date: end, status: "APPROVED", lines: [line("A", "A1", 1, 100)] });
    s.seedSalesOrder({
      id: "BEFORE",
      date: new Date(start.getTime() - 1),
      status: "APPROVED",
      lines: [line("A", "A1", 1, 1000)],
    });
    s.seedSalesOrder({
      id: "AFTER",
      date: new Date(end.getTime() + 1),
      status: "APPROVED",
      lines: [line("A", "A1", 1, 10000)],
    });
    const totals = toMap(s.revenueReport({ start, end }), (r) => r.total);
    expect(totals).toEqual({ A: 110 });
  });

  // case: SWHR6-C-0106@v1
  it("[SWHR6-C-0106] chart shows units per category, not order count", async () => {
    const s = await sales();
    s.seedSalesOrder({
      id: "O1",
      date: at(2026, 3, 10),
      status: "APPROVED",
      lines: [line("A", "A1", 2, 10)],
    });
    s.seedSalesOrder({
      id: "O2",
      date: at(2026, 3, 11),
      status: "DENIED",
      lines: [line("A", "A1", 3, 10)],
    });
    const units = toMap(s.ordersChart({ start: START, end: END }), (r) => r.units);
    expect(units).toEqual({ A: 5 });
  });

  // case: SWHR6-C-0107@v1
  it("[SWHR6-C-0107] chart per item for category A lines only", async () => {
    const s = await sales();
    s.seedSalesOrder({
      id: "O1",
      date: at(2026, 3, 10),
      status: "APPROVED",
      lines: [line("A", "A1", 2, 10), line("B", "B1", 9, 1)],
    });
    s.seedSalesOrder({
      id: "O2",
      date: at(2026, 3, 11),
      status: "APPROVED",
      lines: [line("A", "A1", 3, 10), line("A", "A2", 4, 1), line("B", "B2", 7, 1)],
    });
    const units = toMap(s.ordersChart({ start: START, end: END, category: "A" }), (r) => r.units);
    expect(units).toEqual({ A1: 5, A2: 4 });
  });

  // case: SWHR6-C-0108@v1
  it("[SWHR6-C-0108] order lookups use user id and order date indexes", async () => {
    const s = await sales();
    for (let i = 0; i < 500; i++) {
      s.seedSalesOrder({
        id: `L${i}`,
        userId: `user-${i % 50}`,
        date: at(2026, 1 + (i % 12), 1 + (i % 28)),
        status: "APPROVED",
      });
    }
    const byUser = s.explainOrdersByUser("user-7").join("\n");
    expect(byUser).toMatch(/USING (COVERING )?INDEX \S*user/i);
    expect(byUser).not.toMatch(/SCAN/i);
    const byDate = s.explainOrdersByDateRange(at(2026, 2, 1, 0), at(2026, 2, 28, 23)).join("\n");
    expect(byDate).toMatch(/USING (COVERING )?INDEX \S*date/i);
    expect(byDate).not.toMatch(/SCAN/i);
  });
});
