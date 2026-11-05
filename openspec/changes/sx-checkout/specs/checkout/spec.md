## ADDED Requirements

### Requirement: Order information screen

The order information screen SHALL show Billing Information and Shipping Information blocks, each asking for first name, last name, street address lines 1 and 2, city, state or province, postal code, country, telephone and e-mail, SHALL pre-fill both blocks from the signed-on customer's account contact information, and SHALL refuse to submit in the browser while a required field is empty.

#### Scenario: Form displayed to a signed-on shopper

- **GIVEN** a signed-on shopper with account contact information
- **WHEN** the shopper proceeds to checkout
- **THEN** both blocks are shown with the fields listed above, filled from the account

#### Scenario: Required field left empty

- **GIVEN** the form with a required field (any field except street line 2 and the selection lists) blank
- **WHEN** the shopper submits
- **THEN** the submission is stopped in the browser and the empty field is named

#### Scenario: Fixed choices

- **GIVEN** the English store
- **WHEN** the state and country selections are displayed
- **THEN** states are California, New York, Texas; billing countries are United States, Canada, Japan, China; shipping countries are United States, Canada, Japan

### Requirement: Order complete screen

The order complete screen SHALL show the order id and state that a confirmation e-mail will be sent to the billing e-mail address.

#### Scenario: Order placed

- **GIVEN** an order has just been placed
- **WHEN** the confirmation page is displayed
- **THEN** it shows "Your Order is Complete", the order id and the billing e-mail address

### Requirement: General error screen

The system SHALL show a General Error page for an unexpected failure, displaying the error message and technical trace and asking the user to notify the administrator.

#### Scenario: Unexpected failure

- **GIVEN** a request that fails unexpectedly and is routed to the error page
- **WHEN** the page is displayed
- **THEN** the error message, the technical trace and a request to tell the administrator are shown

### Requirement: Order placement

When a shopper submits the order information, the system SHALL create a purchase order carrying a new unique order id, the signed-on user id, the billing e-mail as order e-mail, the current date and time, billing and shipping contacts, a payment card, the shopper's locale, one line per cart item (category, product, item, line number, quantity, unit price) and the total price, and SHALL then empty the cart.

#### Scenario: Successful order

- **GIVEN** a signed-on shopper with items in the cart
- **WHEN** the order is submitted
- **THEN** a purchase order with all listed data is created, sent for processing, the cart is emptied and the complete page is shown

### Requirement: Empty cart refusal

The system SHALL refuse to place an order when the cart is empty.

#### Scenario: Empty or re-submitted order

- **GIVEN** the cart has no items
- **WHEN** the order is submitted
- **THEN** no order is created and "The Shopping Cart is Empty and the order could not be placed." is shown, explaining that a re-submitted order has already been placed

### Requirement: Order total calculation

The system SHALL compute the order total as the sum over cart lines of unit price multiplied by quantity, with no tax, shipping or discount, and SHALL number order lines sequentially from 0 in cart order.

#### Scenario: Two lines

- **GIVEN** a cart of 2 units at 10.00 and 1 unit at 5.50
- **WHEN** the order is placed
- **THEN** the total is 25.50 and the lines are numbered 0 and 1

### Requirement: Payment card attached to orders

The system SHALL attach to every order the fixed card number "1234-2334", type "Duke Express" and expiry "10/2001", regardless of the card held on the customer's account.

#### Scenario: Any customer

- **GIVEN** a customer with a stored card
- **WHEN** an order is placed
- **THEN** the order carries the fixed card, not the stored one

### Requirement: Checkout required contact fields

The system SHALL treat last name, first name, street address, city, state or province, postal code and telephone as required in both blocks, and street address line 2 as optional.

#### Scenario: Blank field reaching the server

- **GIVEN** a required field submitted blank
- **WHEN** the server handles the order
- **THEN** legacy behaviour records the missing field without telling the shopper and continues (suspected defect, awaiting a decision)

### Requirement: Order identifier generation

The system SHALL generate each order identifier by incrementing a named counter by one inside a transaction and returning the counter name immediately followed by the new value, and SHALL create a missing counter at zero so the first identifier uses value 1.

#### Scenario: First identifier for a prefix

- **GIVEN** no counter exists for prefix "1001"
- **WHEN** an identifier is requested
- **THEN** a counter is created at 0 and "10011" is returned

#### Scenario: Counter cannot be obtained

- **GIVEN** the counter cannot be created or located
- **WHEN** an identifier is requested
- **THEN** the request fails with a system error and no identifier is returned

### Requirement: Identifier counter storage

The system SHALL persist each counter as a mandatory unique name of up to 40 characters and a mandatory whole-number value.

#### Scenario: Duplicate counter name

- **GIVEN** a counter named "1001" exists
- **WHEN** a second counter named "1001" is stored
- **THEN** the store is rejected

### Requirement: Purchase order storage

The system SHALL persist each purchase order with a unique order id, user id, e-mail, order date in epoch milliseconds, locale, total value, exactly one contact and exactly one payment card, and one or more lines keyed by order and line number with category, product, item, quantity, unit price and quantity shipped.

#### Scenario: Order missing its card

- **GIVEN** a purchase order without a payment card
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Order line quantity constraints

The system SHALL reject a line whose quantity is not greater than zero or whose quantity shipped exceeds its quantity.

#### Scenario: Zero quantity

- **GIVEN** a line with quantity 0
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Purchase order creation with related records

When a purchase order is created the system SHALL also create its contact from the shipping information, its card, and one line per item with quantity shipped 0, SHALL abort creation if a required service cannot be located, and SHALL delete an order's lines when the order is removed.

#### Scenario: Lookup failure

- **GIVEN** a required service cannot be located
- **WHEN** a purchase order is created
- **THEN** creation fails and no order is stored

### Requirement: Purchase order XML exchange

The system SHALL exchange a purchase order as an XML document containing, in order, order id, user id, e-mail id, order date, shipping info, billing info, total price, credit card and one or more line items, with a locale attribute defaulting to en_US.

#### Scenario: Locale omitted

- **GIVEN** an order document with no locale attribute
- **WHEN** it is read
- **THEN** the locale is en_US

### Requirement: Asynchronous order hand-off

The system SHALL send each placed order as an XML document asynchronously to the order processing queue, SHALL NOT wait for processing before confirming to the shopper, and on receipt SHALL store the order and validate the document only when purchase-order validation is switched on.

#### Scenario: Send failure

- **GIVEN** the send to the queue fails
- **WHEN** an order is placed
- **THEN** the shopper is still shown the complete page and the cart is emptied (legacy behaviour, suspected defect)

### Requirement: Payment card data handling

The system SHALL store a payment card as card number, card type and expiry date text, copy them without validation, derive expiry month as the text before "/" and year as the text after it, and return month "01" and year "2010" when the expiry is missing or has no "/".

#### Scenario: Malformed expiry

- **GIVEN** an expiry date "1099"
- **WHEN** month and year are requested
- **THEN** "01" and "2010" are returned

### Requirement: Stock quantity non-negative

The system SHALL keep one stock quantity per item and reject any quantity below zero.

#### Scenario: Negative stock

- **GIVEN** an item
- **WHEN** a stock quantity of -1 is stored
- **THEN** it is rejected
