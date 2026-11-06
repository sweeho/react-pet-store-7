## 1. Data model

- [ ] 1.1 Define the order processing record with status restricted to PENDING, APPROVED, DENIED, COMPLETED and indexed on status
- [ ] 1.2 Define the OrderApproval batch document (one or more entries of order id and status)

## 2. Automatic approval

- [ ] 2.1 Record every received order as PENDING before any decision
- [ ] 2.2 Implement en_US auto-approval below 500 and ja_JP below 50000, other locales never
- [ ] 2.3 Route automatic approvals through the same decision path as administrator decisions

## 3. Decision processing

- [ ] 3.1 Accept a batch of (order, new status) decisions and validate the document
- [ ] 3.2 Apply decisions only to PENDING orders and ignore others silently
- [ ] 3.3 Send a supplier purchase order for each APPROVED order and none for DENIED
- [ ] 3.4 Pass the applied decisions on for customer notification

## 4. Verification

- [ ] 4.1 Test the boundary totals 499.99 and 500 and the zh_CN case
- [ ] 4.2 Test that a decision on a non-PENDING order changes nothing
