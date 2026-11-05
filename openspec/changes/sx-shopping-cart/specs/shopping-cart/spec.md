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

Recovered from: CART-BR-0001
The system SHALL let a shopper add one item to the cart from the item, product-list or search page, remove an item from the cart, and update the quantities of all cart lines in one submission.

#### Scenario: Add an item

- **GIVEN** an item shown on a product list
- **WHEN** the shopper chooses Add to Cart
- **THEN** the item is added to the cart

#### Scenario: Remove an item

- **GIVEN** a cart containing an item
- **WHEN** the shopper chooses Remove on its line
- **THEN** the line is removed from the cart

#### Scenario: Update all quantities

- **GIVEN** a cart with several lines
- **WHEN** the shopper submits Update Cart with new quantities
- **THEN** every line's quantity is updated in that one submission

### Requirement: Non-numeric quantity treated as zero

Recovered from: CART-BR-0002
The system SHALL treat a line quantity that is not a whole number as 0 when the cart is updated.

#### Scenario: Non-numeric quantity

- **GIVEN** a cart line with quantity field entered as "abc"
- **WHEN** the shopper updates the cart
- **THEN** that line's quantity is taken as 0

### Requirement: Add to cart shows the cart

Recovered from: CART-REQ-0001
The system SHALL add one unit of an item to the shopper's cart when the shopper chooses Add to Cart from a product item list, an item page or search results, and SHALL then show the cart.

#### Scenario: Add from product list

- **GIVEN** a product item list
- **WHEN** the shopper chooses Add to Cart on an item
- **THEN** the item is in the cart and the cart screen is displayed

### Requirement: Remove cart line

Recovered from: CART-REQ-0002
The system SHALL remove an item line from the cart when the shopper chooses Remove on that line.

#### Scenario: Remove line

- **GIVEN** a cart with two lines
- **WHEN** the shopper chooses Remove on one line
- **THEN** only that line is removed

### Requirement: Bulk quantity update

Recovered from: CART-BR-0003
The system SHALL update the quantity of every cart line from the quantities the shopper enters when Update Cart is chosen, and SHALL treat a quantity that is not a whole number as 0.

#### Scenario: Quantities changed

- **GIVEN** a cart with two lines
- **WHEN** the shopper enters 3 and 5 and chooses Update Cart
- **THEN** the lines hold quantities 3 and 5

#### Scenario: Non-whole quantity

- **GIVEN** a cart line
- **WHEN** the shopper enters "2.5" and chooses Update Cart
- **THEN** that quantity is treated as 0

### Requirement: Cart display

Recovered from: CART-SCR-0004
The system SHALL show the cart with, for each line, the item description linking to the item page, a Remove action, an editable quantity and the unit price, followed by the cart total and a Check Out link, and SHALL show "Your Shopping Cart is Empty." instead when the cart has no items.

#### Scenario: Cart with items

- **GIVEN** a cart with items
- **WHEN** the cart is shown
- **THEN** each line shows description link, Remove, editable quantity and unit price, then the total (no tax or shipping) and Check Out

#### Scenario: Empty cart

- **GIVEN** a cart with no items
- **WHEN** the cart is shown
- **THEN** "Your Shopping Cart is Empty." is shown

### Requirement: Cart usable without sign-on

Recovered from: CART-REQ-0005
The system SHALL let a shopper browse, add to, update and view the cart without signing on, and sign-on SHALL only be demanded on reaching checkout.

#### Scenario: Anonymous cart use

- **GIVEN** a shopper who has not signed on
- **WHEN** they add to and view the cart
- **THEN** no sign-on is requested

#### Scenario: Checkout requires sign-on

- **GIVEN** an anonymous shopper with items in the cart
- **WHEN** they choose Check Out
- **THEN** sign-on is demanded
