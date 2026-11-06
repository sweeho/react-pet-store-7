# Design notes: legacy implementation of inventory-management

## Legacy implementation

- Entity: `InventoryEJB` (CMP 2.x), fields itemId (pk) and quantity. The container-generated table (`sun-j2ee-ri.xml`) has `quantity INTEGER NOT NULL` and no CHECK. The hand-written Oracle DDL (`db/schema/petstore_oracle.sql`) adds `ck_inventory_qty CHECK (quantity >= 0)` and no foreign key to item. The two schemas differ on the non-negative rule.
- Servlet `RcvrRequestProcessor` dispatches on the `currentScreen` parameter (logout, displayinventory, updateinventory). GET forwards to `index.jsp`.
- `displayinventory.jsp` checks `isUserInRole("administrator")`, reads the session-scoped `DisplayInventoryBean`, and posts `qty_<itemId>` inputs and `item_<itemId>` check boxes. The "no items" message shows only when the collection is null (a finder error), not when it is empty.
- `updateInventory` reads only ticked rows (unticked check boxes are not posted). A negative value is skipped silently. A non-numeric value throws an unhandled NumberFormatException. `addQuantity` on the entity is commented out, so the update sets the value.
- Update flow: bean-managed `UserTransaction` around updateInventory, `processPendingPO`, `sendInvoices`, then forward to `back.jsp`.
- Invoices go out through the supplier transition delegate (see order-fulfillment).

## Disputes and open points

- The user guide says the supplier notifies the OPC after every update and the OPC re-checks orders. The code instead retries supplier orders itself and sends invoices only. An SME decides which is intended.
- The `administrator` role check exists only in the display JSP. The update path in the servlet has no role check in the extracted records.
