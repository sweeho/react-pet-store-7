## ADDED Requirements

### Requirement: Stock record per item

ID: SWHR6-R-0125
Recovered from: INV-ENT-0001
The system SHALL keep one stock record per item, identified uniquely by the item id, holding a mandatory whole-number quantity on hand.

#### Scenario: One record per item
ID: SWHR6-R-0125.01

- **GIVEN** a stock record exists for an item
- **WHEN** a second record for the same item id is created
- **THEN** the creation is rejected

#### Scenario: Quantity is mandatory
ID: SWHR6-R-0125.02

- **GIVEN** a new stock record for an item
- **WHEN** it is stored without a quantity
- **THEN** the store is rejected

### Requirement: Stock quantity is never negative

ID: SWHR6-R-0126
Recovered from: INVM-BR-0001
The system SHALL keep one stock quantity per item and SHALL reject any stock quantity below zero.

#### Scenario: Negative quantity stored
ID: SWHR6-R-0126.01

- **GIVEN** an item with a stock record
- **WHEN** a quantity below zero is stored for it
- **THEN** the store is rejected and the quantity is unchanged

### Requirement: Inventory screen

ID: SWHR6-R-0010
Recovered from: INV-SCR-0002
The system SHALL provide an inventory screen that, for a user in the administrator role, lists every item with its id and existing quantity, a new-quantity entry field and an update tick box, and a submit button. GIVEN no stock records can be read THEN it SHALL show "There are no items in inventory at all". GIVEN the user is not an administrator THEN it SHALL show "You are not authorised to update the status of orders." instead of the list.

#### Scenario: Administrator views stock
ID: SWHR6-R-0010.01

- **GIVEN** an administrator and several stock records
- **WHEN** the inventory screen is displayed
- **THEN** each item shows its id, existing quantity, a new-quantity field and an update tick box, with a submit button

#### Scenario: Stock cannot be read
ID: SWHR6-R-0010.02

- **GIVEN** an administrator and stock records that cannot be read
- **WHEN** the inventory screen is displayed
- **THEN** the message "There are no items in inventory at all" is shown

#### Scenario: Non-administrator
ID: SWHR6-R-0010.03

- **GIVEN** a user who is not an administrator
- **WHEN** the inventory screen is displayed
- **THEN** the message "You are not authorised to update the status of orders." is shown instead of the list

### Requirement: Supplier home screen

ID: SWHR6-R-0069
Recovered from: INV-SCR-0006
The system SHALL show a supplier home page explaining that it is used to update inventory so that back-ordered items can be filled, with a "Display Inventory" action and a "Logout" action; a direct (GET) visit to the supplier entry point SHALL always show this home page, and submitted actions SHALL be routed to the inventory screen, the inventory update, or logout according to the action chosen.

#### Scenario: Plain navigation
ID: SWHR6-R-0069.01

- **GIVEN** a user navigating directly to the supplier entry point
- **WHEN** the page is requested
- **THEN** the home page is shown with a "Display Inventory" action and a "Logout" action

#### Scenario: Display Inventory chosen
ID: SWHR6-R-0069.02

- **GIVEN** the supplier home page
- **WHEN** the user chooses "Display Inventory"
- **THEN** the inventory screen is shown

#### Scenario: Logout chosen
ID: SWHR6-R-0069.03

- **GIVEN** the supplier home page
- **WHEN** the user chooses "Logout"
- **THEN** the logout page is shown

### Requirement: Stock update rules

ID: SWHR6-R-0124
Recovered from: INV-BR-0003
The system SHALL, when inventory changes are submitted, replace the stock quantity of each item whose update box is ticked with the entered new quantity. GIVEN a ticked row with an empty new quantity THEN that item SHALL be left unchanged. GIVEN a negative new quantity THEN that item SHALL be left unchanged. GIVEN an unticked row THEN its entered quantity SHALL be ignored.

#### Scenario: Ticked row replaces quantity
ID: SWHR6-R-0124.01

- **GIVEN** an item with quantity 5
- **WHEN** a ticked row with new quantity 12 is submitted
- **THEN** the item's quantity is 12

#### Scenario: Blank or negative ignored
ID: SWHR6-R-0124.02

- **GIVEN** an item with quantity 5
- **WHEN** a ticked row with an empty or negative new quantity is submitted
- **THEN** the quantity remains 5

#### Scenario: Unticked row ignored
ID: SWHR6-R-0124.03

- **GIVEN** an item with quantity 5
- **WHEN** an unticked row with new quantity 12 is submitted
- **THEN** the quantity remains 5

### Requirement: Non-numeric quantity fails the update

ID: SWHR6-R-0169
Recovered from: INV-BR-0004
The system SHALL, GIVEN a ticked row whose new quantity is not a whole number WHEN inventory changes are submitted, fail the request with an error and SHALL NOT show the success page.

#### Scenario: Non-integer quantity
ID: SWHR6-R-0169.01

- **GIVEN** a ticked row whose new quantity is "abc"
- **WHEN** inventory changes are submitted
- **THEN** the request fails with an error and the success page is not shown

### Requirement: Order re-fulfilment and invoicing after inventory update

ID: SWHR6-R-0168
Recovered from: INV-WF-0005
The system SHALL, after applying submitted inventory changes, re-attempt fulfilment of every pending supplier order, publish an invoice for each order that shipped at least one line in that attempt, and then show the message "Inventory was updated successfully" with options to display inventory again or log out; the stock changes, the re-attempt and the invoice publication SHALL be performed in one transaction.

#### Scenario: Pending order now shippable
ID: SWHR6-R-0168.01

- **GIVEN** a pending order whose lines can be shipped after the stock change
- **WHEN** inventory changes are submitted
- **THEN** the order is fulfilled, an invoice is published, and the confirmation message is shown with options to display inventory again or log out

#### Scenario: Atomic update
ID: SWHR6-R-0168.02

- **GIVEN** submitted inventory changes
- **WHEN** the re-attempt or invoice publication fails
- **THEN** the stock changes, the re-attempt and the invoice publication are not committed
