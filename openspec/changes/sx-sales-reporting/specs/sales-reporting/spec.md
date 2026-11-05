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
