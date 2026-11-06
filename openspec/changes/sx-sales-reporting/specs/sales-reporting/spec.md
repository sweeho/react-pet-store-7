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

### Requirement: Revenue by period

ID: SWHR6-R-0186
Recovered from: REPT-BR-0002
The system SHALL, when revenue is requested for a period, sum quantity times unit price over every line item of every order dated within the period, both ends inclusive, grouped by category; when a category is also given it SHALL instead group by item, counting only lines of that category. Orders of every status MUST be included.

#### Scenario: Revenue grouped by category

- **GIVEN** orders in the period with lines in two categories, one order being DENIED
- **WHEN** revenue is requested for the period without a category
- **THEN** each category total is the sum of quantity times unit price over all lines, including the denied order

#### Scenario: Revenue grouped by item within a category

- **GIVEN** orders in the period with lines in categories A and B
- **WHEN** revenue is requested for the period with category A
- **THEN** totals are grouped by item and only lines of category A are counted

#### Scenario: Period boundaries are inclusive

- **GIVEN** an order dated exactly at the period start and one exactly at the period end
- **WHEN** revenue is requested for the period
- **THEN** both orders are counted

### Requirement: Quantity chart by period

ID: SWHR6-R-0187
Recovered from: REPT-BR-0003
The system SHALL, when any chart other than revenue is requested for a period, sum the ordered quantities of every line item of every order dated within the period, grouped by category, or by item within a given category. Orders of every status MUST be included.

#### Scenario: Units per category

- **GIVEN** orders in the period with line quantities 2 and 3 in category A
- **WHEN** the orders chart is requested without a category
- **THEN** category A shows 5 units, not the number of orders

#### Scenario: Units per item within a category

- **GIVEN** orders in the period with lines in categories A and B
- **WHEN** the orders chart is requested with category A
- **THEN** quantities are summed per item for category A lines only

### Requirement: Order retrieval by user and date

ID: SWHR6-R-0188
Recovered from: SAL-REQ-0001
The system SHALL support retrieval of purchase orders by ordering user and by order date efficiently, by indexing the purchase order user and date columns.

#### Scenario: Orders looked up by user or date

- **GIVEN** a large set of purchase orders
- **WHEN** orders are retrieved by user id or by an order date range
- **THEN** the lookup uses an index on the user id or order date column respectively
