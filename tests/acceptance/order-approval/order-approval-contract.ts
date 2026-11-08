/**
 * Module contract assumed by the order-approval acceptance tests (the
 * repository has no approval code yet). Implementations must export these names.
 *
 * db/approval.ts  (SQLite via db/client.ts; synchronous)
 *   resetApprovalData(): void                    // empties orders, status history, outbound supplier/notification messages
 *   seedOrder(o: { id: string, locale?: string, value?: number, status: Status }): void
 *                                                // inserts an order directly in the given status (no auto-approval)
 *   receiveOrder(o: { id: string, userId?: string, locale: string, value: number }): void
 *                                                // receipt of a new order: records PENDING, then applies the
 *                                                // auto-approval rule through the shared decision path
 *   processApprovalBatch(decisions: { orderId: string, status: "APPROVED" | "DENIED" }[]): void
 *                                                // the shared decision path (administrator decisions)
 *   orderStatus(orderId: string): Status | undefined
 *   statusHistory(orderId: string): Status[]     // every status the order has held, oldest first
 *   supplierMessages(): { orderId: string }[]    // supplier purchase orders sent, in send order
 *   notificationMessages(): { orderId: string, status: Status }[]   // applied decisions passed on for customer notice
 *   readOrderApproval(xml: string, opts?: { validate?: boolean }): { orders: { orderId: string, status: string }[] }
 *                                                // validate defaults to true; throws on an invalid document
 */
export type Status = "PENDING" | "APPROVED" | "DENIED" | "COMPLETED";

export const approval = async () => {
  const mod = await import("../../../db/approval");
  mod.resetApprovalData();
  return mod;
};
