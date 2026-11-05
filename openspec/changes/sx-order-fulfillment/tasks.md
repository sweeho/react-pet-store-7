## 1. Data model

- [ ] 1.1 Define the supplier order entity (id, date, status, shipping contact, line items) with PENDING default on creation
- [ ] 1.2 Define the supplier line item with quantity shipped starting at 0 and immutable identifying fields
- [ ] 1.3 Define the OPC purchase order and line items with shipped quantity not exceeding ordered quantity
- [ ] 1.4 Define the per-order workflow status record and its allowed values
- [ ] 1.5 Cascade removal of contact and line items with the supplier order

## 2. Supplier fulfilment

- [ ] 2.1 Receive supplier orders from a message channel and persist them as PENDING
- [ ] 2.2 Implement the all-or-nothing per-line stock check and stock reduction
- [ ] 2.3 Skip already fully shipped lines on re-processing
- [ ] 2.4 Treat lines with no stock record as unavailable
- [ ] 2.5 Complete the order only when no remaining line was short
- [ ] 2.6 Build and publish one invoice per pass containing only lines shipped in that pass
- [ ] 2.7 Look up supplier orders by id and by status

## 3. Order processing center

- [ ] 3.1 Send a supplier order for each approved order
- [ ] 3.2 Receive invoices, validate root element and namespace, add shipped quantities
- [ ] 3.3 Set COMPLETED or SHIPPED_PART and trigger completed-order notification
- [ ] 3.4 Retrieve purchase orders by order-date range, inclusive

## 4. XML interchange

- [ ] 4.1 Produce and parse SupplierOrder documents with fixed element order
- [ ] 4.2 Produce Invoice documents
- [ ] 4.3 Produce and parse LineItem documents
- [ ] 4.4 Substitute current date for missing or unparseable order date
- [ ] 4.5 Reject documents of the wrong root type
- [ ] 4.6 Publish schema catalog at a fixed address

## 5. Reliability

- [ ] 5.1 Process each message in one unit of work with rollback and redelivery on failure
