# Proposal: order-fulfillment

## Why

The legacy pet-store supplier application receives approved purchase orders from the order processing center (OPC), ships them from stock, invoices the OPC, and the OPC records shipments until the order completes. These rules are recovered here so the rebuild can match them.

## What changes

- Supplier order and line-item records, with creation defaults and status values.
- Supplier-side fulfilment: stock check, partial shipment, completion, invoicing.
- OPC-side invoice receipt, shipped-quantity accounting and order status.
- XML interchange of supplier orders, invoices and line items.
- Transactional, redeliverable message processing.

## Scope notes

- 42 IR records were ingested; no `kind: screen` records exist, so no screen requirements are written.
- Records approved by an SME carry IDs; the rest are drafts without IDs awaiting SME decision.
- Where sources disagree (status sets), the conflict is recorded in design.md and left open.
