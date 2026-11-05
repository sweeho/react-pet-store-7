## ADDED Requirements

### Requirement: Orders listed by status

ID: SWHR6-R-0004
Recovered from: REPT-REQ-0001
The system SHALL return, for a requested order status, every order in that status with its order id, the customer's user id, the order date formatted as M/D/YYYY, the order value and the status.

#### Scenario: Orders requested for a status

- **GIVEN** three orders in status APPROVED and two in status DENIED
- **WHEN** orders with status APPROVED are requested
- **THEN** exactly the three approved orders are returned, each with order id, user id, date as M/D/YYYY with no zero padding, value and status

#### Scenario: No orders in the status

- **GIVEN** no order is in the requested status
- **WHEN** orders for that status are requested
- **THEN** an empty list is returned

### Requirement: Revenue chart

Recovered from: REPT-BR-0002

The system SHALL, when revenue is requested for a period, sum quantity times unit price over every line item of every order dated within the period, both ends inclusive, grouped by category, or grouped by item counting only lines of that category when a category is also given, and orders of every status SHALL be included.

#### Scenario: Revenue by category

- **GIVEN** orders in the period with lines in categories FISH and DOGS
- **WHEN** revenue is requested for the period without a category
- **THEN** one total per category is returned, each the sum of quantity times unit price

#### Scenario: Revenue by item within a category

- **GIVEN** orders in the period with lines in FISH and DOGS
- **WHEN** revenue is requested for the period with category FISH
- **THEN** one total per FISH item is returned and DOGS lines are not counted

#### Scenario: Period boundaries

- **GIVEN** an order dated exactly at the period start and one exactly at the period end
- **WHEN** revenue is requested
- **THEN** both orders are included

#### Scenario: Denied order

- **GIVEN** a denied order dated in the period
- **WHEN** revenue is requested
- **THEN** the denied order's lines are included in the totals

### Requirement: Units-ordered chart

Recovered from: REPT-BR-0003

The system SHALL, when any chart other than revenue is requested for a period, sum the ordered quantities of every line item of every order dated within the period, grouped by category, or by item within a given category, and orders of every status SHALL be included.

#### Scenario: Units by category

- **GIVEN** orders in the period whose lines total 10 units in FISH and 4 in DOGS
- **WHEN** the orders chart is requested without a category
- **THEN** FISH is 10 and DOGS is 4

#### Scenario: Units by item within a category

- **GIVEN** FISH lines for two different items in the period
- **WHEN** the orders chart is requested with category FISH
- **THEN** a quantity total per FISH item is returned

### Requirement: Orders by date range

Recovered from: SAL-REQ-0005

The system SHALL allow retrieving purchase orders whose order date falls between two given instants, inclusive.

#### Scenario: Orders in range

- **GIVEN** orders dated before, at the start, inside, at the end, and after a range
- **WHEN** orders between the start and end are requested
- **THEN** the orders at the start, inside and at the end are returned

### Requirement: Order lookup by user and date

Recovered from: SAL-REQ-0001

The system SHALL support retrieval of purchase orders by ordering user and by order date efficiently, using secondary indexes on the order's user id and order date.

#### Scenario: Indexes present

- **GIVEN** the order store
- **WHEN** it is created
- **THEN** secondary indexes exist on the ordering user id and on the order date

### Requirement: Order status view

ID: SWHR6-R-0108
Recovered from: RPT-REQ-0001
The system SHALL provide an order-status view that lists, for each purchase order, its identifier, user, date, value and the current status held by the order manager.

#### Scenario: Order with a status record

- **GIVEN** a purchase order that has an order-manager status record
- **WHEN** the order-status view is read
- **THEN** it lists the order identifier, user, date, value and the current status

#### Scenario: Order without a status record

- **GIVEN** a purchase order with no order-manager row
- **WHEN** the order-status view is read
- **THEN** that order is not listed
