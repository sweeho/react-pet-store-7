## ADDED Requirements

### Requirement: Order information screen

ID: SWHR6-R-0121
Recovered from: CHK-SCR-0001
The order information screen SHALL show Billing Information and Shipping Information blocks, each asking for first name, last name, street address lines 1 and 2, city, state or province, postal code, country, telephone and e-mail, SHALL pre-fill both blocks from the signed-on customer's account contact information, and SHALL refuse to submit in the browser while a required field is empty.

#### Scenario: Form displayed to a signed-on shopper

- **GIVEN** a signed-on shopper with account contact information
- **WHEN** the shopper proceeds to checkout
- **THEN** both blocks are shown with the listed fields, filled from the account

#### Scenario: Required field left empty

- **GIVEN** the form with a required field (any field except street line 2 and the selection lists) blank
- **WHEN** the shopper submits
- **THEN** the submission is stopped in the browser and the empty field is named

### Requirement: Order complete screen

ID: SWHR6-R-0046
Recovered from: CHK-SCR-0009
After an order is placed the order complete screen SHALL show the order id and SHALL state that a confirmation e-mail will be sent to the billing e-mail address.

#### Scenario: Order placed

- **GIVEN** an order has just been placed
- **WHEN** the confirmation page is displayed
- **THEN** it shows "Your Order is Complete", the order id and the billing e-mail address

### Requirement: General error screen

ID: SWHR6-R-0150
Recovered from: CHK-SCR-0010
The system SHALL show a General Error page when a request fails unexpectedly, displaying the error message and the technical error trace and asking the user to notify the administrator. Which failures reach this page is unresolved in the legacy source.

#### Scenario: Unexpected failure

- **GIVEN** a request that fails unexpectedly and is routed to the error page
- **WHEN** the page is displayed
- **THEN** the error message, the technical trace and a request to notify the administrator are shown

### Requirement: Order placement workflow

ID: SWHR6-R-0018
Recovered from: CHK-WF-0005
When a shopper submits the order information the system SHALL create a purchase order with a new order number from the order counter, the signed-on user id, the billing e-mail as the order e-mail, the current date and time, the billing and shipping details, the card, the shopper's current language and the cart lines, SHALL send it as an XML purchase-order message to order processing without waiting for a reply, SHALL empty the cart, and SHALL show the order complete screen.

#### Scenario: Successful order

- **GIVEN** a signed-on shopper with items in the cart
- **WHEN** the order information is submitted
- **THEN** a purchase order with all listed data is created and sent, the cart is emptied and the order complete screen is shown with the order number and e-mail address

### Requirement: Empty cart refusal

ID: SWHR6-R-0041
Recovered from: CHK-BR-0002
The system SHALL refuse to place an order when the cart is empty.

#### Scenario: Empty or re-submitted order

- **GIVEN** the shopper's cart has no items
- **WHEN** an order is submitted
- **THEN** no order is created and "The Shopping Cart is Empty and the order could not be placed." is shown, explaining that a re-submitted order has already been placed

### Requirement: Order total calculation

ID: SWHR6-R-0149
Recovered from: CHK-BR-0004
The system SHALL compute the order total as the sum over cart lines of unit cost multiplied by quantity, with no tax, shipping or discount, accumulated in single-precision floating point with no explicit rounding, and SHALL record each line with its category, product, item, a line number starting at 0 in cart order, the quantity and the unit cost.

#### Scenario: Two lines

- **GIVEN** a cart of 2 units at 10.00 and 1 unit at 5.50
- **WHEN** the order is placed
- **THEN** the total is 25.50 and the lines are numbered 0 and 1

### Requirement: Cart emptied after order hand-off

ID: SWHR6-R-0153
Recovered from: CHK-BR-0008
The system SHALL empty the shopper's cart once the order has been handed off for sending, whether or not the send succeeded.

#### Scenario: Order handed off

- **GIVEN** a placed order
- **WHEN** it has been handed off for sending
- **THEN** the cart contains no items

### Requirement: Purchase order creation with related records

ID: SWHR6-R-0151
Recovered from: CHK-BR-0001
When a purchase order is created the system SHALL also create and attach a contact record from the order's shipping information, a payment card record from its card, and one line item record per line with quantity shipped 0, and SHALL abort creation of the order if a required service cannot be located.

#### Scenario: Related records created

- **GIVEN** a purchase order with two lines
- **WHEN** it is created
- **THEN** one contact, one card and two lines with quantity shipped 0 exist for it

#### Scenario: Lookup failure

- **GIVEN** a required service cannot be located
- **WHEN** a purchase order is created
- **THEN** creation fails and no order is stored

### Requirement: Purchase order relations

ID: SWHR6-R-0152
Recovered from: CHK-BR-0003
The system SHALL require every purchase order to relate to exactly one contact record, exactly one payment card record and one or more line items, and SHALL delete an order's line items when the order is removed.

#### Scenario: Order removed

- **GIVEN** a purchase order with line items
- **WHEN** the order is removed
- **THEN** its line items are deleted

### Requirement: Purchase order record

ID: SWHR6-R-0016
Recovered from: CHK-ENT-0001
The system SHALL persist each purchase order with an order id (primary key), user id, e-mail address, order date, locale and total value, associated with exactly one contact, exactly one payment card and one or more line items, each line carrying category, product, item, quantity, unit price and quantity shipped, identified by order and line number.

#### Scenario: Order missing its card

- **GIVEN** a purchase order without a payment card
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Purchase order storage constraints

ID: SWHR6-R-0019
Recovered from: CHKO-ENT-0001
The system SHALL store a purchase order with a unique identifier, ordering user, e-mail, order date in epoch milliseconds, locale, order total with two decimals, contact information and a payment card, all mandatory, and its lines keyed by order and line number.

#### Scenario: Duplicate order id

- **GIVEN** a stored order with id X
- **WHEN** a second order with id X is stored
- **THEN** the store is rejected

### Requirement: Order line quantity constraints

ID: SWHR6-R-0157
Recovered from: CHKO-BR-0002
The system SHALL reject any purchase order line whose quantity is not greater than zero, and any line whose quantity shipped exceeds its quantity.

#### Scenario: Zero quantity

- **GIVEN** a line with quantity 0
- **WHEN** it is stored
- **THEN** it is rejected

#### Scenario: Over-shipped line

- **GIVEN** a line with quantity 2 and quantity shipped 3
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Purchase order XML exchange

ID: SWHR6-R-0017
Recovered from: CHK-INT-0001
The system SHALL exchange a purchase order as an XML document containing, in order, order id, user id, e-mail id, order date, shipping info, billing info, total price, payment card and one or more line items, with a locale attribute defaulting to en_US, and the receiving side SHALL store the order and validate the document against its schema only when purchase-order validation is switched on.

#### Scenario: Locale omitted

- **GIVEN** an order document with no locale attribute
- **WHEN** it is read
- **THEN** the locale is en_US

#### Scenario: Validation off

- **GIVEN** purchase-order validation is switched off
- **WHEN** an order document is received
- **THEN** the order is stored without schema validation

### Requirement: Payment card XML exchange

ID: SWHR6-R-0154
Recovered from: CHK-INT-0002
The system SHALL exchange payment card data as an XML document with elements CardNumber, CardType and ExpiryDate, in that order.

#### Scenario: Card serialised

- **GIVEN** a card with number, type and expiry
- **WHEN** it is exchanged
- **THEN** the document holds CardNumber, CardType and ExpiryDate in that order

### Requirement: Payment card creation

ID: SWHR6-R-0155
Recovered from: CHK-REQ-0003
The system SHALL create a payment card from either a card data object or from separate card number, card type and expiry date values, copying all three without validation.

#### Scenario: Unvalidated values

- **GIVEN** a card number of any text
- **WHEN** a card is created
- **THEN** the value is copied unchanged

### Requirement: Payment card expiry month and year

ID: SWHR6-R-0045
Recovered from: CHK-RULE-0004
The system SHALL derive the expiry month as the text before the "/" in the expiry date and the expiry year as the text after it.

#### Scenario: Well-formed expiry

- **GIVEN** an expiry date "10/2001"
- **WHEN** month and year are requested
- **THEN** "10" and "2001" are returned

### Requirement: Payment card expiry default

ID: SWHR6-R-0148
Recovered from: CHK-RULE-0005
When the expiry date is missing or has no "/", the system SHALL return month "01" and year "2010".

#### Scenario: Malformed expiry

- **GIVEN** an expiry date "1099"
- **WHEN** month and year are requested
- **THEN** "01" and "2010" are returned

### Requirement: Unrestricted use of identifier generator and card component

ID: SWHR6-R-0156
Recovered from: CHK-REQ-0006
The system SHALL make the identifier generator and the payment card component available to any caller within the application without a role restriction.

#### Scenario: Caller without a role

- **GIVEN** a caller with no role
- **WHEN** it requests an identifier or creates a card
- **THEN** the request is accepted

### Requirement: Order identifier generation

ID: SWHR6-R-0119
Recovered from: CHK-REQ-0001
The system SHALL generate each new order identifier by incrementing a named counter by one and returning the counter name immediately followed by the new counter value as text, with no separator or padding.

#### Scenario: Next identifier

- **GIVEN** a counter named "1001" holding 5
- **WHEN** an identifier is requested
- **THEN** "10016" is returned and the counter holds 6

### Requirement: Counter creation on first use

ID: SWHR6-R-0120
Recovered from: CHK-REQ-0002
When no counter exists for a prefix the system SHALL create it starting at zero and return the first identifier using value 1.

#### Scenario: First identifier for a prefix

- **GIVEN** no counter exists for prefix "1001"
- **WHEN** an identifier is requested
- **THEN** a counter is created at 0 and "10011" is returned

### Requirement: Identifier issued in a transaction

ID: SWHR6-R-0043
Recovered from: CHK-REQ-0004
The system SHALL perform counter lookup, creation and increment inside one transaction so that the increment and the returned identifier are committed together.

#### Scenario: Failure mid-issue

- **GIVEN** an identifier request that fails after incrementing
- **WHEN** the transaction ends
- **THEN** the increment is not committed

### Requirement: Identifier generation failure

ID: SWHR6-R-0044
Recovered from: CHK-REQ-0005
When a counter cannot be created or the counter registry cannot be located, the system SHALL fail the request with a system error and SHALL NOT return an identifier.

#### Scenario: Counter unavailable

- **GIVEN** the counter cannot be created or located
- **WHEN** an identifier is requested
- **THEN** the request fails with a system error and no identifier is returned

### Requirement: Identifier counter record

ID: SWHR6-R-0042
Recovered from: CHK-ENT-0003
The system SHALL persist each identifier sequence as a record holding a unique name of up to 40 characters and a whole-number current value, both mandatory.

#### Scenario: Duplicate counter name

- **GIVEN** a counter named "1001" exists
- **WHEN** a second counter named "1001" is stored
- **THEN** the store is rejected

### Requirement: Identifier counter table

ID: SWHR6-R-0047
Recovered from: CHKO-BR-0003
The system SHALL generate order and purchase-order identifiers from a named counter table holding one integer per counter name.

#### Scenario: One value per name

- **GIVEN** a counter table
- **WHEN** two identifiers are issued for the same name
- **THEN** both draw from the same single integer
