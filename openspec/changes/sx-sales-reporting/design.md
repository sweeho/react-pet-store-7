# Design notes: legacy implementation of sales reporting

These notes describe how the LEGACY application implements this capability. They do not describe a replacement.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The user guide mentions a "View Non-Pending Orders" panel with a Refresh button fed by the status listing, but no screen record was extracted from it.

## Legacy implementation

- All reporting is served by the OPC admin facade (`OPCAdminFacadeEJB`, remote stateless session bean, transaction attribute Required). Calls reach it with no role check in the order centre; access control lives in the separate admin web app (see sign-on capability).
- `getOrdersByStatus`: asks the process manager for orders in a status, loads each purchase order and builds an order-details row. The date is built with deprecated `Date` getters in the server time zone, as M/D/YYYY with no zero padding.
- `getChartInfo`: takes a request kind (javadoc: ORDERS or REVENUE), start and end dates (mm/dd/yyyy), and an optional category. Orders come from the `findPOBetweenDates` finder (`poDate >= ? AND poDate <= ?`, epoch longs). Any request string other than "REVENUE" takes the quantity branch.
- Revenue sums are held as `java.lang.Float` (single precision); `po_line_item.unit_price` is DOUBLE in the Cloudscape DDL and NUMBER(12,2) in the Oracle DDL.
- Indexes `ix_po_user` (po_user_id) and `ix_po_date` (po_date) exist on `purchase_order` in both DDL scripts; the consuming queries were not read, so their purpose is inferred and may serve order-batch-operations as well.

## Suspected defects / open questions

- Charts include orders of every status, so denied and pending orders count as revenue.
- The "orders" chart sums unit quantities rather than counting orders.
- Revenue accumulated in single-precision floating point.
- Status listing date format is server-time-zone dependent.
- `findPOBetweenDates` callers are outside the module examined; live use unconfirmed.

## Order-status view (RPT-REQ-0001)

The legacy schema scripts define `v_order_status` as an inner join of `purchase_order` to `order_manager` on order id, so orders lacking an order-manager row are excluded. Consumers of the view were not read.
