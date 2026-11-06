## ADDED Requirements

### Requirement: Cart screen

ID: SWHR6-R-0005
Recovered from: CART-SCR-0003
The cart screen SHALL show "Your Shopping Cart is Empty." when the cart has no lines; otherwise it SHALL list each line with a link to the item, a Remove link, an editable quantity (up to 10 characters) and the unit cost, an Update Cart button, the cart total, and a Check Out link to the order information screen.

#### Scenario: Empty cart

- **GIVEN** a cart with no lines
- **WHEN** the cart screen is displayed
- **THEN** the message "Your Shopping Cart is Empty." is shown instead of a line list

#### Scenario: Cart with lines

- **GIVEN** a cart with two lines
- **WHEN** the cart screen is displayed
- **THEN** each line shows an item link, a Remove link, an editable quantity of at most 10 characters and the unit cost
- **AND** an Update Cart button, the cart total as currency and a Check Out link to the order information screen are shown

### Requirement: Anonymous per-session cart

ID: SWHR6-R-0109
Recovered from: CART-BR-0004
The system SHALL give every visitor session its own cart from the start of the session, without sign-on, and SHALL keep that cart for the life of the session.

#### Scenario: Visitor arrives

- **GIVEN** a visitor who has not signed on
- **WHEN** a new session starts
- **THEN** an empty cart exists for that session and the visitor can use it

#### Scenario: Cart persists within session

- **GIVEN** a session whose cart holds items
- **WHEN** the visitor navigates between pages in the same session
- **THEN** the same cart contents are retained

### Requirement: Cart operations

ID: SWHR6-R-0189
Recovered from: CART-BR-0001
The system SHALL let a shopper add one item to the cart from the item, product-list or search page, remove an item from the cart, and update the quantities of all cart lines in one submission.

#### Scenario: Add an item

- **GIVEN** a shopper viewing an item, product list or search results
- **WHEN** the shopper chooses Add to Cart for an item
- **THEN** the item is added to the cart

#### Scenario: Update all quantities at once

- **GIVEN** a cart with several lines
- **WHEN** the shopper edits quantities and chooses Update Cart
- **THEN** every line's quantity is updated in one submission

### Requirement: Non-numeric quantity treated as zero

ID: SWHR6-R-0190
Recovered from: CART-BR-0002
The system SHALL treat a line's quantity as 0 when a quantity entered during a cart update is not a whole number.

#### Scenario: Non-numeric quantity

- **GIVEN** a shopper updates the cart
- **WHEN** a quantity entered is not a whole number
- **THEN** that line's quantity is treated as 0

### Requirement: Add to cart

ID: SWHR6-R-0191
Recovered from: CART-REQ-0001
The system SHALL add one unit of an item to the shopper's cart when the shopper chooses Add to Cart from a product item list, an item page or search results, and SHALL then show the cart.

#### Scenario: Add to Cart chosen

- **GIVEN** a shopper viewing a product item list
- **WHEN** the shopper chooses Add to Cart on an item
- **THEN** one unit of the item is added and the cart screen is shown

### Requirement: Remove cart line

ID: SWHR6-R-0192
Recovered from: CART-REQ-0002
The system SHALL remove an item line from the cart when the shopper chooses Remove on that line.

#### Scenario: Remove chosen

- **GIVEN** a cart containing a line for an item
- **WHEN** the shopper chooses Remove on that line
- **THEN** the line is no longer in the cart

### Requirement: Cart quantity update

Recovered from: CART-BR-0003
The system SHALL update the quantity of every cart line from the quantities the shopper enters when Update Cart is chosen, and SHALL treat a quantity that is not a whole number as 0.

#### Scenario: Quantities submitted

- **GIVEN** a cart with several lines
- **WHEN** the shopper enters new quantities and chooses Update Cart
- **THEN** every line is updated from the quantity entered for it

#### Scenario: Non-whole-number quantity

- **GIVEN** a shopper updating the cart
- **WHEN** a quantity entered is not a whole number
- **THEN** that quantity is treated as 0

### Requirement: Cart page layout

Recovered from: CART-SCR-0004
The system SHALL show the cart with, for each line, the item description linking to the item page, a Remove action, an editable quantity and the unit price, followed by the cart total and a Check Out link, and SHALL show "Your Shopping Cart is Empty." instead when the cart has no items.

#### Scenario: Cart with items

- **GIVEN** a cart with items
- **WHEN** the cart is shown
- **THEN** each line shows the item description as a link, a Remove action, an editable quantity and the unit price
- **AND** the cart total and a Check Out link follow the lines; no tax or shipping is shown

#### Scenario: Empty cart

- **GIVEN** a cart with no items
- **WHEN** the cart is shown
- **THEN** "Your Shopping Cart is Empty." is shown instead

### Requirement: Cart usable without sign-on

Recovered from: CART-REQ-0005
The system SHALL let a shopper browse, add to, update and view the cart without signing on, and SHALL demand sign-on only on reaching checkout.

#### Scenario: Anonymous cart use

- **GIVEN** a visitor who has not signed on
- **WHEN** the visitor adds to, updates or views the cart
- **THEN** no sign-on is requested

#### Scenario: Reaching checkout

- **GIVEN** a visitor who has not signed on and has items in the cart
- **WHEN** the visitor follows Check Out to the order information screen
- **THEN** sign-on is requested
