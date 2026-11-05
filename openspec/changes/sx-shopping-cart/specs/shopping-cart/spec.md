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
