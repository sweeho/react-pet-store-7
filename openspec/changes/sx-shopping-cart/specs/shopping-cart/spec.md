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

### Requirement: Cart line operations

Recovered from: CART-BR-0001
The system SHALL let a shopper add one item to the cart from the item, product-list or search page, remove an item from the cart, and update the quantities of all cart lines in one submission, and SHALL then show the cart.

#### Scenario: Add an item

- **GIVEN** a shopper viewing a product item list
- **WHEN** the shopper chooses Add to Cart on an item
- **THEN** one unit of the item is added to the cart and the cart is shown

#### Scenario: Remove a line

- **GIVEN** a cart containing an item
- **WHEN** the shopper chooses Remove on that line
- **THEN** the line is removed from the cart

#### Scenario: Update all quantities

- **GIVEN** a cart with several lines and edited quantities
- **WHEN** the shopper chooses Update Cart
- **THEN** every line's quantity is updated from the submitted values in one submission

### Requirement: Non-numeric quantity

Recovered from: CART-BR-0002
The system SHALL treat a cart line quantity that is not a whole number as 0 when the cart is updated.

#### Scenario: Text entered as a quantity

- **GIVEN** a cart line whose quantity field contains "abc"
- **WHEN** the shopper chooses Update Cart
- **THEN** that line's quantity is treated as 0

### Requirement: Anonymous per-session cart

Recovered from: CART-BR-0004
The system SHALL give every visitor session its own cart from the start of the session, without sign-on, SHALL keep that cart for the life of the session, and SHALL demand sign-on only on reaching checkout.

#### Scenario: New visitor adds an item

- **GIVEN** a visitor who has not signed on and has just started a session
- **WHEN** the visitor adds an item to the cart
- **THEN** the item is held in that session's cart and no sign-on is requested

#### Scenario: Checkout requires sign-on

- **GIVEN** an anonymous visitor with a non-empty cart
- **WHEN** the visitor follows Check Out
- **THEN** sign-on is demanded before the order information screen is shown
