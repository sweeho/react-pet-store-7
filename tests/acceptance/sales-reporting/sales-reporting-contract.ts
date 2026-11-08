/**
 * Module contract assumed by the sales-reporting acceptance tests (the
 * repository has no reporting code yet). Implementations must export these names.
 *
 * db/sales-reporting.ts  (SQLite via db/client.ts; synchronous)
 *   resetSalesData(): void                       // empties orders, order-manager rows and line items
 *   seedSalesOrder(o: SeedSalesOrder): void      // inserts purchase order, its line items and (unless status is "NONE") an order-manager row
 *   ordersByStatus(status: string): { id: string, userId: string, date: string, value: number, status: string }[]
 *       date is M/D/YYYY in local time, no zero padding; an unmatched status returns [] (never throws)
 *   orderStatusView(): { id: string, userId: string, date: string|Date, value: number, status: string }[]
 *   revenueReport(opts: { start: Date, end: Date, category?: string }): { key: string, total: number }[]
 *       key = category, or item id when category is given; sum(quantity * unitPrice); both ends inclusive; every status
 *   ordersChart(opts: { start: Date, end: Date, category?: string }): { key: string, units: number }[]
 *       key = category, or item id when category is given; sum(quantity); both ends inclusive; every status
 *   explainOrdersByUser(userId: string): string[]                       // EXPLAIN QUERY PLAN detail lines of the user lookup
 *   explainOrdersByDateRange(start: Date, end: Date): string[]          // same for the order-date range lookup
 */
export type SeedLine = { category: string; item: string; quantity: number; unitPrice: number };
export type SeedSalesOrder = {
  id: string;
  userId?: string;
  date: Date;
  value?: number;
  status: string; // order-manager status; "NONE" means no order-manager row
  lines?: SeedLine[];
};

export const sales = async () => {
  const mod = await import("../../../db/sales-reporting");
  mod.resetSalesData();
  return mod;
};

export const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0, 0);
export const toMap = <T extends { key: string }>(rows: T[], f: (r: T) => number) =>
  Object.fromEntries(rows.map((r) => [r.key, f(r)]));
