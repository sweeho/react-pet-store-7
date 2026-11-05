## ADDED Requirements

### Requirement: Stock record per item

The system SHALL keep exactly one stock record per item, identified uniquely by the item id, holding a mandatory whole-number quantity on hand.

#### Scenario: One record per item

- **GIVEN** a stock record exists for an item
- **WHEN** a second record for the same item id is created
- **THEN** the creation is rejected

### Requirement: Stock quantity is never negative

The system SHALL NOT allow a stock quantity below zero.

#### Scenario: Negative quantity stored

- **GIVEN** an item with a stock record
- **WHEN** a quantity below zero is stored for it
- **THEN** the store is rejected and the quantity is unchanged

### Requirement: Inventory screen

ID: SWHR6-R-0010
Recovered from: INV-SCR-0002
The system SHALL provide an inventory screen that, for a user in the administrator role, lists every item with its id and existing quantity, a new-quantity entry field and an update tick box, and a submit button. GIVEN no stock records can be read THEN it SHALL show "There are no items in inventory at all". GIVEN the user is not an administrator THEN it SHALL show "You are not authorised to update the status of orders." instead of the list.

#### Scenario: Administrator views stock

- **GIVEN** an administrator and several stock records
- **WHEN** the inventory screen is displayed
- **THEN** each item shows its id, existing quantity, a new-quantity field and an update tick box, with a submit button

#### Scenario: Stock cannot be read

- **GIVEN** an administrator and stock records that cannot be read
- **WHEN** the inventory screen is displayed
- **THEN** the message "There are no items in inventory at all" is shown

#### Scenario: Non-administrator

- **GIVEN** a user who is not an administrator
- **WHEN** the inventory screen is displayed
- **THEN** the message "You are not authorised to update the status of orders." is shown instead of the list

### Requirement: Supplier home and confirmation screen

The system SHALL provide a supplier home screen explaining that it is used to update inventory so that back-ordered items can be filled, with a "Display Inventory" action and a "Logout" action, and SHALL show this home screen for any plain navigation (GET) to the supplier application entry point. After a successful stock update it SHALL show "Inventory was updated successfully" with the same two actions.

#### Scenario: Home screen on navigation

- **GIVEN** a user navigating to the supplier entry point
- **WHEN** the page is requested
- **THEN** the home screen is shown with Display Inventory and Logout actions

#### Scenario: Confirmation after update

- **GIVEN** a stock update that committed
- **WHEN** the result is displayed
- **THEN** "Inventory was updated successfully" is shown with Display Inventory and Logout actions

### Requirement: Stock update rules

WHEN the stock clerk submits the inventory update screen THEN the system SHALL, for each row whose update box is ticked and whose new quantity is not empty, replace the item's stock quantity with the entered value. GIVEN the entered value is negative THEN that row SHALL be ignored without a message. GIVEN a row is not ticked THEN its entered value SHALL be ignored.

#### Scenario: Ticked row with a value

- **GIVEN** item A with quantity 5, ticked, new quantity 12
- **WHEN** the form is submitted
- **THEN** item A's quantity is 12

#### Scenario: Negative value

- **GIVEN** item A with quantity 5, ticked, new quantity -3
- **WHEN** the form is submitted
- **THEN** item A's quantity remains 5 and no message is shown

#### Scenario: Unticked row

- **GIVEN** item A with quantity 5, not ticked, new quantity 12
- **WHEN** the form is submitted
- **THEN** item A's quantity remains 5

### Requirement: Retry pending orders after stock update

WHEN the stock clerk submits stock changes THEN the system SHALL, as one unit of work, apply the changes, re-attempt fulfilment of every supplier order still PENDING, publish an invoice to the order processing center for each order that shipped something, and then show a confirmation that the inventory was updated.

#### Scenario: Waiting order now shippable

- **GIVEN** a PENDING supplier order whose item had no stock
- **WHEN** the clerk raises that item's stock to cover the line and submits
- **THEN** the line ships, an invoice is published and the confirmation is shown

#### Scenario: No pending order ships

- **GIVEN** no PENDING order can ship after the update
- **WHEN** the clerk submits
- **THEN** no invoice is published and the confirmation is shown
