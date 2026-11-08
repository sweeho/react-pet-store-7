/**
 * Module contract assumed by the order-batch-operations acceptance tests (the
 * repository has no batch code yet). Implementations must export these names.
 *
 * db/batch.ts  (SQLite via db/client.ts; synchronous)
 *   resetBatchData(): void                       // empties orders and every dependent/supporting table
 *   seedOrder(o: SeedOrder): void                // inserts purchase order, workflow (manager) record, line items,
 *                                                // supplier order, contact/address/card as the fields say
 *   seedInventoryItem(i: SeedItem): void
 *   orderStatusView(): { id: string, userId: string, date: string|Date, value: number, status: string }[]
 *   agingReport(now: Date): {
 *     stuck: { orderId: string, userId: string, locale: string, value: number, status: string, flag: "STUCK" }[]  // oldest first
 *     statusCounts: { status: string, count: number }[]                                                        // ordered by status
 *     mismatches: { orderId: string, managerStatus: string, supplierStatus: string, flag: "MISMATCH" }[]
 *   }
 *   inventoryReport(opts: { threshold: number }): {
 *     items: { itemId: string, productId: string, description: string, quantity: number }[]  // lowest quantity first, then item id
 *     trackedItems: number, totalUnits: number
 *   }
 *   backupDatabase(opts: { backupDir: string, datedRoot: string, now: Date }): { backupFile: string, datedDir: string }
 *       writes the backup into backupDir, then moves it into a dated folder under datedRoot
 *   nightlyBatchCycle(deps?: { onRun?: (job: "extract"|"purge"|"backup"|"aging"|"inventory") => void }, opts?: { now?: Date, outDir: string }): string[]
 *       runs the cycle, returns jobs in start order
 *   extractOrders(opts: { now: Date, outDir: string }): { file: string }   // CSV, UTF-8, header-less or with header, double-quote delimiter
 *   purgeOrders(opts: { now: Date }): { purged: string[] }                 // single transaction, retention 180 days
 *   orderRecords(orderId: string): { order?: object, managerRecord?: object, lines: object[], supplierOrders: object[],
 *                                    supplierLines: object[], contacts: object[], addresses: object[], cards: object[] }
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export type SeedOrder = {
  id: string;
  userId?: string;
  date: Date;
  locale?: string;
  value?: number;
  lineCount?: number;
  status: string; // workflow (order manager) status; "NONE" means: no manager record
  supplierStatus?: string; // creates a supplier order with that status
  withContact?: boolean; // default true
};
export type SeedItem = {
  itemId: string;
  productId: string;
  quantity: number;
  description?: string | null;
};

export const HOUR = 3600_000;
export const DAY = 24 * HOUR;
export const NOW = new Date("2026-06-15T12:00:00Z");
export const ago = (ms: number, from = NOW) => new Date(from.getTime() - ms);

export const batch = async () => {
  const mod = await import("../../../db/batch");
  mod.resetBatchData();
  return mod;
};

export const tmp = () => mkdtempSync(path.join(tmpdir(), "swhr6-batch-"));
export const read = (f: string) => readFileSync(f, "utf8");

/** Minimal CSV parser honouring the double-quote text delimiter. */
export const parseCsv = (text: string): string[][] =>
  text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .map((l) => {
      const out: string[] = [];
      let cur = "";
      let q = false;
      for (let i = 0; i < l.length; i++) {
        const ch = l[i];
        if (q) {
          if (ch === '"' && l[i + 1] === '"') {
            cur += '"';
            i++;
          } else if (ch === '"') q = false;
          else cur += ch;
        } else if (ch === '"') q = true;
        else if (ch === ",") {
          out.push(cur);
          cur = "";
        } else cur += ch;
      }
      out.push(cur);
      return out;
    });
