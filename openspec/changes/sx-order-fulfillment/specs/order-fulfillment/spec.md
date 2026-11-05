## ADDED Requirements

### Requirement: Supplier order intake and fulfilment workflow

ID: SWHR6-R-0012
Recovered from: FUL-WF-0001
The system SHALL, on receiving a supplier purchase order message, record the order, immediately attempt to ship it from stock, and, WHEN at least one line was shipped by that attempt, send an invoice for the shipped lines back to the order processing center; WHEN nothing could be shipped, the order SHALL be kept for a later attempt and no invoice SHALL be sent.

#### Scenario: Something ships

- **GIVEN** an order whose lines are partly in stock
- **WHEN** the order message is received
- **THEN** the order is recorded, in-stock lines ship and an invoice for them is sent

#### Scenario: Nothing ships

- **GIVEN** an order whose lines are all out of stock
- **WHEN** the order message is received
- **THEN** the order is recorded as pending and no invoice is sent

### Requirement: Whole-line shipment only

ID: SWHR6-R-0129
Recovered from: FUL-BR-0002
The system SHALL ship an order line only when the stock on hand for its item is at least the full line quantity, and SHALL then reduce the stock by the line quantity and record the whole line quantity as shipped.

#### Scenario: Line in stock

- **GIVEN** stock of 10 and a line quantity of 4
- **WHEN** the order is processed
- **THEN** stock becomes 6 and the line shipped quantity is 4

#### Scenario: Line short of stock

- **GIVEN** stock of 3 and a line quantity of 4, and another line in stock
- **WHEN** the order is processed
- **THEN** the short line ships nothing and stock is unchanged, while the other line still ships

### Requirement: Order completion on fulfilment

ID: SWHR6-R-0130
Recovered from: FUL-BR-0004
The system SHALL set a supplier order's status to COMPLETED when, during a fulfilment attempt, no remaining unshipped line was short of stock.

#### Scenario: All lines shipped

- **GIVEN** every unshipped line is in stock
- **WHEN** the attempt ends
- **THEN** the order status is COMPLETED

#### Scenario: A line is short

- **GIVEN** at least one line could not be shipped
- **WHEN** the attempt ends
- **THEN** the order status remains pending so a later attempt picks it up

### Requirement: Item without stock record

ID: SWHR6-R-0078
Recovered from: FUL-BR-0005
The system SHALL treat an order line for an item that has no stock record at the supplier as not available, ship nothing for it, and leave the order pending.

#### Scenario: No stock record

- **GIVEN** a line for an item with no stock record
- **WHEN** the order is processed
- **THEN** nothing ships for the line and the order stays pending

### Requirement: Supplier order receipt channel

ID: SWHR6-R-0080
Recovered from: FUL-INT-0001
The system SHALL receive each supplier purchase order from the order processing center as an asynchronous text message carrying the order as an XML document, and SHALL process every received order (persist it and attempt to fulfil it).

#### Scenario: Order message received

- **GIVEN** a text message carrying a supplier order XML document
- **WHEN** it arrives on the supplier order channel
- **THEN** the order is persisted and fulfilment is attempted

### Requirement: Invoice publication

ID: SWHR6-R-0023
Recovered from: FUL-INT-0007
The system SHALL publish each invoice as an XML text message to the invoice topic consumed by the order processing center, one message per invoice.

#### Scenario: Invoice produced

- **GIVEN** a fulfilment attempt that produced an invoice
- **WHEN** the invoice is published
- **THEN** one XML text message is sent to the invoice topic

### Requirement: Supplier order document mapping

ID: SWHR6-R-0081
Recovered from: FUL-INT-0008
The system SHALL accept supplier orders in the trading-partner supplier order XML format and convert them to the internal supplier order (shipping contact and address, e-mail, phone, and lines with category, product, item, line number, quantity and unit price); a document that cannot be parsed or converted SHALL be rejected rather than recorded.

#### Scenario: Valid document

- **GIVEN** a well-formed supplier order document
- **WHEN** it is received
- **THEN** it is converted to an internal order with contact and lines

#### Scenario: Unparseable document

- **GIVEN** a document that cannot be parsed
- **WHEN** it is received
- **THEN** it is rejected and no order is recorded

### Requirement: Atomic order receipt

ID: SWHR6-R-0079
Recovered from: FUL-BR-0009
The system SHALL record an incoming supplier order, apply its stock reductions and shipped quantities, and publish its invoice as one unit of work.

#### Scenario: Step fails

- **GIVEN** an order message whose processing fails at any step
- **WHEN** the message is processed
- **THEN** the work is undone and the message is redelivered for another attempt

### Requirement: Supplier order sent for approved orders

ID: SWHR6-R-0132
Recovered from: FULF-INT-0001
For each approved order the system SHALL send the supplier a purchase order carrying the order id, the order date, the ship-to name (given and family), street line 1, city, state, country, postal code, e-mail and telephone, and for each line item its category, product, item, line number, quantity and unit price.

#### Scenario: Order approved

- **GIVEN** an approved order with two lines
- **WHEN** approval is processed
- **THEN** a supplier order with all listed fields is sent to the supplier

### Requirement: Invoice receipt format

ID: SWHR6-R-0133
Recovered from: FULF-INT-0002
The system SHALL receive supplier invoices as XML documents published to the invoice topic, each carrying an order id and a list of shipped line items identified by item id with a shipped quantity, and SHALL reject a document whose root element is not an Invoice in the TPA invoice namespace.

#### Scenario: Valid invoice

- **GIVEN** an Invoice document in the TPA invoice namespace
- **WHEN** it is received
- **THEN** its order id and shipped items are read

#### Scenario: Wrong root

- **GIVEN** a document whose root is not Invoice
- **WHEN** it is received
- **THEN** it is rejected

### Requirement: Invoice receipt and shipment accounting

ID: SWHR6-R-0086
Recovered from: FULF-WF-0003
WHEN an invoice for an order is received the system SHALL record the shipped items against the order; IF every item of the order has then been shipped the system SHALL set the order status to COMPLETED and SHALL trigger the completed-order notification; OTHERWISE it SHALL set the order status to SHIPPED_PART.

#### Scenario: Final invoice

- **GIVEN** an invoice covering the last unshipped items
- **WHEN** it is received
- **THEN** status is COMPLETED and the completed-order notification is triggered

#### Scenario: Partial invoice

- **GIVEN** an invoice leaving items unshipped
- **WHEN** it is received
- **THEN** status is SHIPPED_PART

### Requirement: Schema catalog publication

ID: SWHR6-R-0084
Recovered from: FULF-INT-0004
The system SHALL publish, at a fixed web address, a catalog that maps the public identifiers of the supplier-order, invoice and line-item document schemas (DTD and XSD) to downloadable schema locations, so that exchanged documents can be validated by either party.

#### Scenario: Catalog requested

- **GIVEN** the catalog address
- **WHEN** it is requested
- **THEN** public identifiers are mapped to schema locations

### Requirement: Order workflow status values

ID: SWHR6-R-0083
Recovered from: FULF-ENT-0005
The system SHALL keep exactly one workflow status per order, keyed by order id, taking the values PENDING, APPROVED, DENIED, SHIPPED_PART or COMPLETED.

#### Scenario: Status change

- **GIVEN** an order with a status
- **WHEN** its status changes
- **THEN** the order has still exactly one status

### Requirement: Order status tracking

ID: SWHR6-R-0003
Recovered from: OFU-ENT-0001
The system SHALL track one status of up to 20 characters per order in the order manager, one row per order identifier, and SHALL support lookup of orders by status.

#### Scenario: Lookup by status

- **GIVEN** orders in several statuses
- **WHEN** orders with status APPROVED are requested
- **THEN** only those orders are returned

### Requirement: Supplier order status restriction in the database

ID: SWHR6-R-0131
Recovered from: FULF-ENT-0001
The system SHALL record each order received by the supplier as a supplier order with its date, a status of PENDING or COMPLETED (any other value rejected) and a contact, and SHALL record its lines with the same shape as purchase-order lines.

#### Scenario: Other status

- **GIVEN** a supplier order
- **WHEN** status APPROVED is stored in the database
- **THEN** the value is rejected

### Requirement: Unit of work per message

ID: SWHR6-R-0085
Recovered from: FULF-REQ-0007
The system SHALL process each incoming order, approval batch, invoice and notification message as one unit of work: IF any step fails THEN none of that message's status changes or outgoing messages SHALL take effect and the message SHALL be returned for redelivery.

#### Scenario: Invoice processing fails

- **GIVEN** an invoice message whose processing fails
- **WHEN** it is processed
- **THEN** no status change or outgoing message takes effect and it is redelivered

### Requirement: Invoice quantity accumulation

ID: SWHR6-R-0087
Recovered from: ORD-REQ-0003
The system SHALL, when processing a supplier invoice for an order, add the shipped quantity for each invoiced item to the quantity already shipped on the matching order line item.

#### Scenario: Second invoice

- **GIVEN** a line with 2 already shipped
- **WHEN** an invoice ships 3 more
- **THEN** the shipped quantity is 5

### Requirement: Complete fulfilment test

ID: SWHR6-R-0088
Recovered from: ORD-REQ-0004
The system SHALL treat an order as completely fulfilled only when every line item's quantity equals its quantity shipped.

#### Scenario: One line short

- **GIVEN** two lines, one fully shipped and one not
- **WHEN** completeness is evaluated
- **THEN** the order is not complete

### Requirement: Line item creation

ID: SWHR6-R-0089
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0001
The system SHALL allow a line item to be created either from explicit values with a given shipped quantity, or by copying an existing line item's identifying data, ordered quantity and unit price and setting its shipped quantity to a separately supplied value; and SHALL give every newly created supplier order the status PENDING, regardless of any status held by the incoming order data.

#### Scenario: Copy

- **GIVEN** an existing line with shipped 5
- **WHEN** a copy is created with shipped 0
- **THEN** the copy has shipped 0

#### Scenario: New order status

- **GIVEN** incoming order data carrying status COMPLETED
- **WHEN** the order is created
- **THEN** its status is PENDING

### Requirement: Supplier order statuses

ID: SWHR6-R-0090
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0002
The system SHALL recognise the supplier order statuses PENDING, APPROVED, DENIED and COMPLETED, and SHALL allow the status of a stored order to be changed through the order's status setter.

#### Scenario: Status set

- **GIVEN** a stored order
- **WHEN** its status is set to COMPLETED
- **THEN** the stored status is COMPLETED

### Requirement: Supplier order root element check

ID: SWHR6-R-0091
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0004
GIVEN an incoming document whose root element is not a supplier order, WHEN it is read, the system SHALL reject it with an error stating a SupplierOrder element was expected.

#### Scenario: Wrong root

- **GIVEN** a document with another root element
- **WHEN** it is read
- **THEN** it is rejected with a SupplierOrder-expected error

### Requirement: Document type rejection

ID: SWHR6-R-0092
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0005
GIVEN a document that is parsed with validation on, WHEN its document type does not match the expected type, THEN the system SHALL reject it with a "Document not of type" error.

#### Scenario: Type mismatch

- **GIVEN** validation on and a mismatched document type
- **WHEN** it is parsed
- **THEN** a "Document not of type" error is raised

### Requirement: Order document interchange

ID: SWHR6-R-0093
Recovered from: ORDER-FULFILLMENT-INTEGRATION-0001
The system SHALL exchange a line item as an XML LineItem element containing, in this fixed order, CategoryId, ProductId, ItemId, LineNum, Quantity and UnitPrice, and SHALL reject input whose root element is not LineItem; it SHALL exchange a supplier order as an XML document containing, in order, the order id, order date, shipping contact and one or more line items, validated by default; and the order processing center SHALL build a supplier order document in the TPA SupplierOrder namespace with the order date formatted yyyy-MM-dd and a shipping address (first name, last name, street, city, state, country, zip code, email, phone).

#### Scenario: Line item wrong root

- **GIVEN** input whose root is not LineItem
- **WHEN** it is read
- **THEN** it is rejected

#### Scenario: Order document built

- **GIVEN** an approved order
- **WHEN** the document is built
- **THEN** it lists order id, yyyy-MM-dd date, address and lines in that order

### Requirement: Line item mutability

ID: SWHR6-R-0094
Recovered from: ORDER-FULFILLMENT-REQUIREMENT-0001
The system SHALL allow the shipped quantity of a line item to be read and updated after the line is created, and SHALL NOT allow category, product, item, line number, quantity or unit price to be changed after creation through the public line item interface; it SHALL also allow supplier orders to be looked up by order id and listed by status.

#### Scenario: Update shipped

- **GIVEN** a created line
- **WHEN** its shipped quantity is updated
- **THEN** the new value is stored

#### Scenario: Change price

- **GIVEN** a created line
- **WHEN** a price change is attempted
- **THEN** the interface offers no such operation

### Requirement: Line item snapshot

ID: SWHR6-R-0095
Recovered from: ORDER-FULFILLMENT-REQUIREMENT-0002
The system SHALL provide a snapshot of a line item's category, product, item, line number, quantity and unit price without its shipped quantity.

#### Scenario: Snapshot

- **GIVEN** a line item
- **WHEN** a snapshot is requested
- **THEN** it excludes the shipped quantity

### Requirement: Supplier order lookup

ID: SWHR6-R-0135
Recovered from: ORDF-REQ-0002
The system SHALL allow supplier orders to be looked up by status.

#### Scenario: By status

- **GIVEN** orders PENDING and COMPLETED
- **WHEN** PENDING is requested
- **THEN** only PENDING orders are returned

### Requirement: Supplier order record structure

ID: SWHR6-R-0134
Recovered from: ORDF-ENT-0001
The system SHALL keep a supplier purchase order record with an order id, an order date and an order status, one shipping contact, and one or more line items.

#### Scenario: Order stored

- **GIVEN** an order with contact and lines
- **WHEN** it is stored
- **THEN** all parts are kept

### Requirement: New supplier orders start pending

ID: SWHR6-R-0096
Recovered from: ORDF-BR-0001
The system SHALL set the status of every newly created supplier order to PENDING, and SHALL store the order id and order date supplied with it.

#### Scenario: Creation

- **GIVEN** a new order
- **WHEN** it is created
- **THEN** status is PENDING with the supplied id and date

### Requirement: Order status progression

ID: SWHR6-R-0099
Recovered from: ORDF-WF-0001
The system SHALL recognise the order statuses PENDING, APPROVED, DENIED and COMPLETED, with the documented progression PENDING to APPROVED to COMPLETED, or PENDING to DENIED.

#### Scenario: Denied path

- **GIVEN** a pending order
- **WHEN** it is denied
- **THEN** its status is DENIED

### Requirement: Supplier order contact and line copies

ID: SWHR6-R-0097
Recovered from: ORDF-REQ-0001
The system SHALL, when a supplier order is created, store a copy of its shipping contact and a copy of each of its line items, each line item starting with quantity shipped 0.

#### Scenario: Creation copies

- **GIVEN** an incoming order with two lines
- **WHEN** it is created
- **THEN** a contact copy and two line copies with shipped 0 are stored

### Requirement: Supplier order removal cascade

ID: SWHR6-R-0098
Recovered from: ORDF-REQ-0003
The system SHALL, when a supplier order is removed, also remove its shipping contact and its line items.

#### Scenario: Removal

- **GIVEN** an order with a contact and lines
- **WHEN** it is removed
- **THEN** contact and lines are removed too

### Requirement: Supplier order line storage

ID: SWHR6-R-0082
Recovered from: FULF-ENT-0002
The system SHALL store supplier order lines keyed by order and line number, each with mandatory category, product, item, quantity, unit price and quantity shipped, and SHALL reject a line whose supplier order does not exist.

#### Scenario: Supplier order line storage

- **GIVEN** a line for an unknown supplier order
- **WHEN** it is stored
- **THEN** it is rejected
