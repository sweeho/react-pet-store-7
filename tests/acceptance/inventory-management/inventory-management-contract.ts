/**
 * Contract assumed by the inventory-management acceptance tests (the repository has no
 * inventory code yet). Implementations must export these names.
 *
 * db/inventory.ts  (SQLite via db/client.ts; synchronous; no real broker)
 *   resetInventoryData(): void                    // empties stock, pending supplier orders and their lines
 *   seedStock(item: string, quantity: number): void
 *   stockOf(item: string): number | undefined     // undefined = no stock record
 *   stockRecordCount(item: string): number
 *   createStockRecord(item: string, quantity?: number): void   // duplicate item, missing or negative quantity throws
 *   setStockQuantity(item: string, quantity: number): void     // negative throws, value unchanged
 *   seedPendingOrder(o: { id: string, lines: { item: string, quantity: number }[] }): void
 *   orderState(id: string): { status: "PENDING" | "COMPLETED", shipped: Record<string, number> }
 *   createInventoryService(deps: {
 *     invoiceTopic: { send(text: string): void },
 *     hooks?: { onStep?(step: "read" | "stock" | "reattempt" | "publish"): void },   // a throwing hook fails that step
 *   }): {
 *     displayInventory(user: { roles: string[] }):
 *       | { kind: "list", rows: { itemId: string, quantity: number }[] }
 *       | { kind: "message", message: string }
 *     submitChanges(user: { roles: string[] }, rows: { itemId: string, update: boolean, newQuantity: string }[]):
 *       { message: string, options: string[] }     // throws on a non-whole-number ticked quantity
 *   }
 *
 * UI (Playwright, base URL from the local playwright.config.ts, fixture in seed.ts)
 *   /supplier                      supplier home: links/buttons "Display Inventory" and "Logout"
 *   inventory screen               data-testid="inventory-screen"; per item data-testid="inventory-row" with
 *                                  data-testid="item-id", data-testid="existing-quantity", input name="qty_<id>",
 *                                  checkbox name="item_<id>"; a submit button
 *   logout page                    data-testid="logout-page"
 *   administrator session          cookie `role=administrator` on the base URL
 */
export const ADMIN = { roles: ["administrator"] };
export const USER = { roles: ["customer"] };

export const NO_ITEMS = "There are no items in inventory at all";
export const NOT_AUTHORISED = "You are not authorised to update the status of orders.";

export const inv = async () => {
  const mod = await import("../../../db/inventory");
  mod.resetInventoryData();
  return mod;
};

export const makeTopic = () => {
  const messages: string[] = [];
  return { messages, send: (t: string) => void messages.push(t) };
};
