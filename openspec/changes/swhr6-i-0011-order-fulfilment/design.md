# Design notes: legacy implementation of order-fulfillment

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## How the legacy application implements it
- Supplier side (`apps/supplier`): a message-driven bean receives the OPC's SupplierOrder XML on a queue, calls a facade that parses it, creates the CMP supplier order entity (status hard-set to PENDING in `SupplierOrderEJB.ejbCreate`), then runs fulfilment. A non-null invoice string is published to the invoice topic by a transition delegate. The whole receipt is one container transaction, so any failure rolls back and the message is redelivered.
- Fulfilment is all-or-nothing per line: a line ships only if stock >= full line quantity; there is no partial-line shipment. Lines already fully shipped are skipped, which makes re-processing idempotent. A missing stock record counts as not available. The order becomes COMPLETED only when no remaining line was short. The invoice contains only lines shipped in that pass, a shipping date equal to the pass time, and a fixed addressee text ("Dear PetStore Customer").
- Supplier order component (`components/supplierpo`): entity bean with CMR to contact info and line items (cascade delete), finders by id and by status, DTD `SupplierOrder.dtd` as interchange form. Missing or unparseable order date is replaced by the current date on read.
- Line item component (`components/lineitem`): entity with immutable identifying fields; only quantity shipped is settable. XML LineItem has a fixed element order.
- OPC side (`apps/opc`, `components/purchaseorder`, `components/xmldocuments`): builds SupplierOrder XML per approved order, consumes Invoice XML (namespace-checked root), adds shipped quantities to order lines, sets COMPLETED when every line's quantity equals shipped, otherwise SHIPPED_PART. Schema catalog is published at a fixed address. Each incoming message is processed in one transaction.
- Database (`db/schema`): `po_line_item` keyed by (po_id, line_number) with quantity_shipped NOT NULL; `order_manager` has one status row per order (varchar 20, no CHECK) with a status index

## Open conflicts (for SME / Intent)
- C1: DDL restricts supplier order status to PENDING or COMPLETED, while the supplier entity documents PENDING, APPROVED, DENIED, COMPLETED and the OPC uses SHIPPED_PART. Likely different statuses on different sides (supplier vs OPC); not confirmed.
- C2: A CHECK that quantity shipped may not exceed quantity ordered is stated by one pass only.
- C3: Record keys repeat across pass A and pass B with different meanings; see recommendations file.
- C4: The XML schema's positive-quantity rule is validation-only and applies only when validation is on.
