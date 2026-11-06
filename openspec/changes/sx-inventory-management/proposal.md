# Proposal: inventory-management

## Why

The supplier keeps a stock count per item. A stock clerk edits those counts on a web screen, and saving them retries every waiting supplier order. The rebuild must reproduce these rules.

## What changes

- Specify the per-item stock record and its non-negative invariant.
- Specify the inventory display and update screens, the supplier home and confirmation screen, the update rules and the follow-up fulfilment workflow.

## Impact

Capability `inventory-management`. It depends on `order-fulfillment` for the order retry logic.
