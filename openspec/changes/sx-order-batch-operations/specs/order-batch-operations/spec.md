## ADDED Requirements

### Requirement: Order status view and indexes

The system SHALL provide an order status view listing for each order its id, user, date, value and processing status, and SHALL index orders by user and date and processing status by status.

#### Scenario: Status view lists orders

- **GIVEN** orders that each have a workflow record
- **WHEN** the order status view is queried
- **THEN** one row per order is returned with id, user, date, value and status

### Requirement: Daily order extract for Finance

The system SHALL export every purchase order dated on or after yesterday 00:00 and before today 00:00 to a comma-separated UTF-8 file with double-quote text delimiter, ordered by order id, with columns order id, user id, order date, locale, order value, line-item count and order status.

#### Scenario: Yesterday's orders exported

- **GIVEN** orders dated yesterday and orders dated today
- **WHEN** the nightly extract runs
- **THEN** only yesterday's orders appear, ordered by order id, with line-item count and status

#### Scenario: Order without workflow record

- **GIVEN** a purchase order from yesterday with no workflow record
- **WHEN** the extract runs
- **THEN** the order is not included in the file

### Requirement: Stuck order report

The system SHALL report as STUCK every order whose workflow status is PENDING or APPROVED and whose order date is earlier than now minus 24 hours, listing order id, user id, locale, value and status, oldest first.

#### Scenario: Old pending order

- **GIVEN** a PENDING order placed 30 hours ago and an APPROVED order placed 2 hours ago
- **WHEN** the aging report runs
- **THEN** only the 30-hour-old order is listed as STUCK

### Requirement: Orders per status count

The system SHALL include in the aging report a count of orders per workflow status.

#### Scenario: Status counts

- **GIVEN** orders in several statuses
- **WHEN** the aging report runs
- **THEN** each status is listed with its order count, ordered by status

### Requirement: Supplier invoice mismatch

The aging report SHALL list as a MISMATCH, with order id, manager status and supplier status, every order whose supplier order is COMPLETED while its order manager status is not COMPLETED.

#### Scenario: Lost invoice message

- **GIVEN** a supplier order COMPLETED and the manager status APPROVED
- **WHEN** the aging report runs
- **THEN** the order is listed as MISMATCH with both statuses

### Requirement: Low stock report

The system SHALL list inventory items whose quantity is below the low-stock threshold, showing item id, product id, English description and quantity, lowest quantity first then by item id, followed by the number of tracked items and total units in stock.

#### Scenario: Items below threshold

- **GIVEN** a threshold of 10 and items with quantities 3, 10 and 7
- **WHEN** the inventory report runs
- **THEN** the items with 3 and 7 are listed, lowest first, followed by the tracked-item count and total units

#### Scenario: Item lacking English description

- **GIVEN** a low-stock item with no en_US description
- **WHEN** the inventory report runs
- **THEN** the item is omitted from the list

### Requirement: Retention purge

The system SHALL delete orders whose workflow status is COMPLETED or DENIED and whose order date is earlier than the 180-day retention cutoff, together with their supplier line items, supplier orders, order line items, order manager record, purchase order, and the contact, address and credit card records referenced, in a single transaction.

#### Scenario: Old completed order purged

- **GIVEN** a COMPLETED order 200 days old and a COMPLETED order 30 days old
- **WHEN** the purge runs
- **THEN** the old order and its related records are removed and the recent order is kept

#### Scenario: Failure mid-purge

- **GIVEN** a purge that fails part-way
- **WHEN** the transaction ends
- **THEN** no deletion is retained

### Requirement: Purge follows extract

The system SHALL run the order purge only after the order extract has run, so that purged orders have already been exported.

#### Scenario: Purge ordering

- **GIVEN** the nightly batch cycle
- **WHEN** the purge is scheduled
- **THEN** it starts only after the extract has run

### Requirement: Database backup

The system SHALL perform an online backup of the order database into a backup folder, to be moved into a dated folder.

#### Scenario: Scheduled backup

- **GIVEN** the database is online
- **WHEN** the backup job runs
- **THEN** a backup is written to the backup folder and moved to a dated folder
