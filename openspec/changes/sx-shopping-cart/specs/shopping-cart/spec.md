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
