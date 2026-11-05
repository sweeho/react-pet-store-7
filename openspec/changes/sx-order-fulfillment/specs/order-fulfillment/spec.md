## ADDED Requirements

### Requirement: Supplier order intake and fulfilment workflow

ID: SWHR6-R-0012
Recovered from: FUL-WF-0001
The system SHALL, on receiving a supplier purchase order message, record the order, immediately attempt to ship it from stock, and, WHEN at least one line was shipped by that attempt, send an invoice for the shipped lines back to the order processing center; WHEN nothing could be shipped, the order SHALL be kept for a later attempt and no invoice SHALL be sent.

#### Scenario: Some stock available

- **GIVEN** a received order with stock for at least one line
- **WHEN** the order is processed
- **THEN** the order is recorded, the stocked lines ship and an invoice for them is sent

#### Scenario: No stock available

- **GIVEN** a received order with no stock for any line
- **WHEN** the order is processed
- **THEN** the order is recorded, no invoice is sent and the order awaits a later attempt

### Requirement: Order status tracking

ID: SWHR6-R-0003
Recovered from: OFU-ENT-0001
The system SHALL track one status of up to 20 characters per order in the order manager, one row per order identifier, and SHALL support lookup of orders by status.

#### Scenario: One status per order

- **GIVEN** an order with a recorded status
- **WHEN** the status is changed
- **THEN** exactly one status exists for that order

#### Scenario: Lookup by status

- **GIVEN** orders in several statuses
- **WHEN** orders are requested by one status
- **THEN** only orders in that status are returned

### Requirement: Supplier order record

The system SHALL persist a supplier purchase order identified by a unique order id, with a mandatory order date, a status, one shipping contact with address, and one or more line items.

#### Scenario: Order stored

- **GIVEN** a valid incoming order with two lines
- **WHEN** it is stored
- **THEN** the order, its shipping contact and both lines are retrievable by order id

### Requirement: New supplier orders start pending

The system SHALL give every newly created supplier order the status PENDING, regardless of any status held by the incoming data, and SHALL store the supplied order id and order date.

#### Scenario: Incoming status ignored

- **GIVEN** incoming order data carrying a status other than PENDING
- **WHEN** the order is created
- **THEN** its status is PENDING

### Requirement: Supplier order statuses

The system SHALL recognise the supplier order statuses PENDING, APPROVED, DENIED and COMPLETED, with the documented progression PENDING to APPROVED to COMPLETED or PENDING to DENIED, and SHALL allow the status of a stored order to be changed.

#### Scenario: Status changed

- **GIVEN** a stored pending supplier order
- **WHEN** its status is set to COMPLETED
- **THEN** the stored order reports COMPLETED

### Requirement: Supplier order contact and line copies

The system SHALL, when a supplier order is created, store a copy of its shipping contact and one stored line item per incoming line, each with quantity shipped 0, linked to the order, and SHALL remove the contact and line items when the order is removed.

#### Scenario: Creation copies children

- **GIVEN** an incoming order with three lines
- **WHEN** it is created
- **THEN** three stored lines with shipped quantity 0 and one contact copy are linked to it

#### Scenario: Removal cascades

- **GIVEN** a stored order with a contact and lines
- **WHEN** the order is removed
- **THEN** its contact and lines are removed too

### Requirement: Supplier order lookup

The system SHALL allow supplier orders to be looked up by order id and to be listed by status, returning each distinct order whose status equals the one requested.

#### Scenario: List by status

- **GIVEN** two PENDING orders and one COMPLETED order
- **WHEN** PENDING orders are listed
- **THEN** exactly the two pending orders are returned

### Requirement: Whole-line shipment only

The system SHALL ship an order line only when stock on hand for the line's item is at least the full ordered quantity, and SHALL then reduce stock by that quantity and record the whole line quantity as shipped.

#### Scenario: Insufficient stock

- **GIVEN** a line of 5 with stock of 3
- **WHEN** the order is processed
- **THEN** nothing is shipped for the line and stock stays 3

#### Scenario: Sufficient stock

- **GIVEN** a line of 5 with stock of 8
- **WHEN** the order is processed
- **THEN** stock becomes 3 and shipped quantity is 5

### Requirement: Already shipped lines are skipped

The system SHALL skip any line whose shipped quantity equals its ordered quantity, and SHALL NOT take stock or invoice it again.

#### Scenario: Reprocessing

- **GIVEN** a fully shipped line
- **WHEN** the order is processed again
- **THEN** no stock is taken and the line is not invoiced

### Requirement: Item without stock record

The system SHALL treat a line whose item has no stock record at the supplier as not available, ship nothing for it and keep the order pending rather than reject it.

#### Scenario: Unknown stock item

- **GIVEN** a line for an item with no stock record
- **WHEN** the order is processed
- **THEN** the line ships nothing and the order remains pending

### Requirement: Partial shipment and completion

The system SHALL ship every line with enough stock in one pass, and SHALL set the supplier order status to COMPLETED only when every line not yet shipped could be shipped in that pass; otherwise the status SHALL remain unchanged.

#### Scenario: One line short

- **GIVEN** two lines, one with stock and one without
- **WHEN** the order is processed
- **THEN** the first line ships and the order stays pending

#### Scenario: All lines ship

- **GIVEN** two lines both with stock
- **WHEN** the order is processed
- **THEN** both ship and the order is COMPLETED

### Requirement: Invoice content per pass

The system SHALL, WHEN at least one line ships in a pass, produce one invoice containing the order id, the original order date, a shipping date equal to the pass time, a fixed addressee text, and for each line shipped in that pass only its category, product, item, line number, quantity and unit price; WHEN no line ships it SHALL produce none.

#### Scenario: Second pass

- **GIVEN** line 1 shipped earlier and line 2 shipping now
- **WHEN** the order is processed
- **THEN** the invoice lists only line 2

### Requirement: Invoice publication

The system SHALL publish each invoice as one XML text message to the invoice topic consumed by the order processing center, and SHALL publish nothing when no invoice is produced.

#### Scenario: Invoice published

- **GIVEN** a pass that produced an invoice
- **WHEN** the pass completes
- **THEN** one XML message is published to the invoice topic

### Requirement: Supplier order receipt channel and mapping

The system SHALL receive each supplier purchase order as an asynchronous text message carrying an XML document in the trading-partner SupplierOrder format and map it to its own order record (order id, date, shipping contact, and per line category, product, item, line number, quantity, unit price), rejecting a document that cannot be parsed or converted.

#### Scenario: Unparseable document

- **GIVEN** a message whose body is not a valid supplier order
- **WHEN** it is received
- **THEN** it is rejected and not stored

### Requirement: Unit of work per message

The system SHALL process each incoming order, approval batch, invoice and notification message as one unit of work; IF any step fails THEN none of its status changes, stock reductions, shipped quantities or outgoing messages SHALL take effect and the message SHALL be redelivered.

#### Scenario: Invoice publication fails

- **GIVEN** an order that would ship a line
- **WHEN** publishing the invoice fails
- **THEN** the stored order, stock reduction and shipped quantity are undone and the message is redelivered

### Requirement: Supplier order sent for approved orders

The system SHALL send the supplier, for each approved order, a purchase order carrying the order id, order date, ship-to name, street, city, state, country, postal code, e-mail and telephone, and per line item its category, product, item, line number, quantity and unit price.

#### Scenario: Approved order sent

- **GIVEN** an approved order with two lines
- **WHEN** it is sent
- **THEN** the supplier receives one purchase order with both lines and the ship-to details

### Requirement: Invoice receipt and shipment accounting

The system SHALL receive supplier invoices as XML documents from the invoice topic, SHALL reject a document whose root is not an Invoice in the TPA invoice namespace, and SHALL add the shipped quantity of each invoiced item to the quantity already shipped on the matching order line.

#### Scenario: Wrong root

- **GIVEN** a document whose root element is not an Invoice
- **WHEN** it is received
- **THEN** it is rejected

#### Scenario: Quantities accumulate

- **GIVEN** a line with 2 already shipped
- **WHEN** an invoice reports 3 more shipped
- **THEN** the line shows 5 shipped

### Requirement: Order completion status at the order processing center

The system SHALL treat an order as completely fulfilled only when every line's quantity equals its shipped quantity; WHEN an invoice has been applied, it SHALL set the order status to COMPLETED and trigger the completed-order notification if fully shipped, otherwise SHIPPED_PART.

#### Scenario: Partly shipped

- **GIVEN** an order where one line remains unshipped after an invoice
- **WHEN** the invoice is applied
- **THEN** the status is SHIPPED_PART

#### Scenario: Fully shipped

- **GIVEN** an order where all lines are shipped after an invoice
- **WHEN** the invoice is applied
- **THEN** the status is COMPLETED and the notification is triggered

### Requirement: Order workflow status values

The system SHALL keep exactly one workflow status per order id, taking the values PENDING, APPROVED, DENIED, SHIPPED_PART or COMPLETED.

#### Scenario: Single status

- **GIVEN** an order whose status changes twice
- **WHEN** its status is read
- **THEN** exactly one current value is returned

### Requirement: Purchase order record at the order processing center

The system SHALL store each purchase order with a unique order id, mandatory order date, mandatory order value, customer user id, e-mail and locale, a contact, a payment card, and line items.

#### Scenario: Missing order date

- **GIVEN** a purchase order without an order date
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Purchase order line shipped quantity bound

The system SHALL record each purchase order line with category, product, item, quantity, unit price and quantity shipped, identified by order id and line number, and SHALL NOT allow quantity shipped to exceed quantity ordered.

#### Scenario: Over-shipment

- **GIVEN** a line of quantity 5
- **WHEN** shipped quantity is set to 6
- **THEN** the change is rejected

### Requirement: Supplier order status restriction in the database

The system SHALL restrict a stored supplier order status to PENDING or COMPLETED and SHALL link each supplier order to a contact. This conflicts with the wider status set and is flagged for decision.

#### Scenario: Other status rejected

- **GIVEN** a supplier order record
- **WHEN** a status other than PENDING or COMPLETED is stored
- **THEN** the store is rejected

### Requirement: Purchase orders by date range

The system SHALL allow retrieval of purchase orders whose order date falls between two given instants, inclusive.

#### Scenario: Boundary dates

- **GIVEN** an order dated exactly at the range start
- **WHEN** the range is queried
- **THEN** the order is returned

### Requirement: Line item record and creation

The system SHALL keep for each order line item the category id, product id, item id, line number, ordered quantity, unit price and quantity shipped, and SHALL allow creating a line item from explicit values or by copying an existing line's identity, quantity and unit price with a separately supplied shipped quantity.

#### Scenario: Copy with new shipped quantity

- **GIVEN** an existing line shipped 4
- **WHEN** a copy is created with shipped quantity 0
- **THEN** the copy has the same identity, quantity and unit price and shipped quantity 0

### Requirement: Line item mutability

The system SHALL allow only the shipped quantity of a line item to be updated after creation, and SHALL provide a snapshot of the other fields without shipped quantity.

#### Scenario: Identity fields immutable

- **GIVEN** an existing line item
- **WHEN** a change to its unit price is attempted through the public interface
- **THEN** no such change is possible

### Requirement: Order document interchange

The system SHALL build and read a supplier order XML document in the TPA SupplierOrder namespace containing, in order, the order id, the order date (yyyy-MM-dd), the shipping contact and one or more line items, SHALL validate incoming documents by default, and SHALL build an invoice document in the TPA Invoice namespace with order id, user id, order date, shipping date and one or more line items.

#### Scenario: Date formatting

- **GIVEN** an order dated 2002-03-04
- **WHEN** the order document is built
- **THEN** the order date reads 2002-03-04

### Requirement: Order date fallback

The system SHALL substitute the current date and continue WHEN an incoming supplier order document's order date is missing or unparseable.

#### Scenario: Missing date

- **GIVEN** a supplier order document with no order date
- **WHEN** it is read
- **THEN** the order date is the current date

### Requirement: Document type rejection

The system SHALL reject a document whose root element is not the expected type (SupplierOrder, LineItem or Invoice) with an error naming the expected element.

#### Scenario: Wrong root element

- **GIVEN** a document with root element Foo
- **WHEN** it is read as a supplier order
- **THEN** it is rejected stating a SupplierOrder element was expected

### Requirement: Line item XML format

The system SHALL exchange a line item as an XML LineItem element with CategoryId, ProductId, ItemId, LineNum, Quantity and UnitPrice in that fixed order, and WHEN schema validation applies, quantity SHALL be a positive integer, line number a non-negative integer and unit price a decimal of at least 0.

#### Scenario: Zero quantity under validation

- **GIVEN** a line item document with quantity 0 and validation on
- **WHEN** it is read
- **THEN** it is rejected

### Requirement: Schema catalog publication

The system SHALL publish at a fixed web address a catalog mapping the public identifiers of the supplier-order, invoice and line-item DTD and XSD schemas to downloadable schema locations.

#### Scenario: Schema lookup

- **GIVEN** a public schema identifier
- **WHEN** the catalog is requested
- **THEN** it maps the identifier to a downloadable location
