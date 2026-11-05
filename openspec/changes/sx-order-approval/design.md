## Context

Legacy implementation notes for order approval (no target design is proposed here).

## Legacy implementation

- Receipt: `PurchaseOrderMDB.doWork` stores the order, creates a manager record as PENDING, and, when `canIApprove` is true, emits an OrderApproval document with one APPROVED entry to the same approval queue the admin client uses.
- `canIApprove`: bare literals, `< 500` for Locale.US, `< 50000` for Locale.JAPAN, otherwise false. A code comment calls it a demo stub for currency conversion. No configuration entry.
- Decisions: `OrderApprovalMDB.doWork` skips non-PENDING orders, calls `updateStatus` with whatever status the message carries, builds a supplier PO per APPROVED order. `OrderApprovalTD` sends supplier POs and one OrderApproval of applied decisions to the mail queue.
- Document: OrderApproval DTD (`Order+`, `OrderId`, `OrderStatus` as free PCDATA); reader validates by default.
- Schema: `order_manager(order_id, status)` with a CHECK on four values and an index; no foreign key to `purchase_order`.
- Authorisation: the OPC declares all its beans unchecked; access control lives in the separate admin web application (see sign-on capability).

## Open points

- Exactly 500 in en_US: code holds pending, user guide says pending only when "greater than $500".
- zh_CN orders are never auto-approved, contradicting the guide's "all orders under $500".
- Fulfilment code writes SHIPPED_PART, which the four-value CHECK does not list; a conflict between sources to be settled.
- Env-entry values (mail switches, validation switches, transition delegate class) are redacted in the descriptor; production defaults are unknown.
- Record key APPR-BR-0001 is used by two different records (OPC rule and schema status rule).

## User interface

No screen records were extracted for this capability; its user interface is unspecified.
