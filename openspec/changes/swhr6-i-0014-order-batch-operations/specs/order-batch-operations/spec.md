## ADDED Requirements

### Requirement: Order status view and indexes

ID: SWHR6-R-0072
Recovered from: BATCH-ENT-0001
The system SHALL provide an order status view listing for each order its id, user, date, value and processing status, and SHALL index orders by user and date and processing status by status.

#### Scenario: Status view lists orders

- **GIVEN** orders that each have a workflow record
- **WHEN** the order status view is queried
- **THEN** one row per order is returned with id, user, date, value and status

### Requirement: Stuck order report

ID: SWHR6-R-0073
Recovered from: OBO-REQ-0002
The system SHALL report as STUCK every order whose workflow status is PENDING or APPROVED and whose order date is earlier than now minus 24 hours, listing order id, user id, locale, value and status, oldest first.

#### Scenario: Old pending order

- **GIVEN** a PENDING order placed 30 hours ago and an APPROVED order placed 2 hours ago
- **WHEN** the aging report runs
- **THEN** only the 30-hour-old order is listed as STUCK

### Requirement: Orders per status count

ID: SWHR6-R-0074
Recovered from: OBO-REQ-0003
The system SHALL include in the aging report a count of orders per workflow status.

#### Scenario: Status counts

- **GIVEN** orders in several statuses
- **WHEN** the aging report runs
- **THEN** each status is listed with its order count, ordered by status

### Requirement: Supplier invoice mismatch

ID: SWHR6-R-0075
Recovered from: OBO-REQ-0004
The aging report SHALL list as a MISMATCH, with order id, manager status and supplier status, every order whose supplier order is COMPLETED while its order manager status is not COMPLETED.

#### Scenario: Lost invoice message

- **GIVEN** a supplier order COMPLETED and the manager status APPROVED
- **WHEN** the aging report runs
- **THEN** the order is listed as MISMATCH with both statuses

### Requirement: Low stock report

ID: SWHR6-R-0076
Recovered from: OBO-REQ-0005
The system SHALL list inventory items whose quantity is below the low-stock threshold, showing item id, product id, English description and quantity, lowest quantity first then by item id, followed by the number of tracked items and total units in stock.

#### Scenario: Items below threshold

- **GIVEN** a threshold of 10 and items with quantities 3, 10 and 7
- **WHEN** the inventory report runs
- **THEN** the items with 3 and 7 are listed, lowest first, followed by the tracked-item count and total units

#### Scenario: Item lacking English description

- **GIVEN** a low-stock item with no en_US description
- **WHEN** the inventory report runs
- **THEN** the item is omitted from the list

### Requirement: Database backup

ID: SWHR6-R-0077
Recovered from: OBO-REQ-0008
The system SHALL perform an online backup of the order database into a backup folder, to be moved into a dated folder.

#### Scenario: Scheduled backup

- **GIVEN** the database is online
- **WHEN** the backup job runs
- **THEN** a backup is written to the backup folder and moved to a dated folder

### Requirement: Nightly order extract

ID: SWHR6-R-0173
Recovered from: OBO-REQ-0001
The system SHALL export every purchase order whose date is on or after yesterday 00:00 and before today 00:00 to a comma-separated UTF-8 file with double-quote text delimiter, ordered by order id, with columns order id, user id, order date, locale, order value, line-item count and order status.

#### Scenario: Yesterday's orders exported

- **GIVEN** orders placed yesterday and today
- **WHEN** the nightly extract runs
- **THEN** only yesterday's orders are written, ordered by order id, with the seven columns

#### Scenario: Order without manager record

- **GIVEN** an order in the window that has no order manager record
- **WHEN** the nightly extract runs
- **THEN** the order is not included in the file

### Requirement: Old finished order purge

ID: SWHR6-R-0174
Recovered from: OBO-REQ-0006
The system SHALL delete orders whose workflow status is COMPLETED or DENIED and whose order date is earlier than the retention cutoff (180 days), together with their supplier line items, supplier orders, order line items, order manager record, purchase order, and the contact, address and credit card records the order referenced, in a single transaction.

#### Scenario: Old completed order purged

- **GIVEN** a COMPLETED order older than 180 days and a PENDING order older than 180 days
- **WHEN** the purge runs
- **THEN** the completed order and its dependent records are removed together and the pending order remains

#### Scenario: Order without contact record

- **GIVEN** a COMPLETED order older than 180 days with no contact record
- **WHEN** the purge runs
- **THEN** the order is not purged

### Requirement: Purge follows extract

ID: SWHR6-R-0172
Recovered from: OBO-REQ-0007
The system SHALL run the order purge only after the order extract has run, so that purged orders have already been exported.

#### Scenario: Purge ordering

- **GIVEN** the nightly batch cycle
- **WHEN** the purge is scheduled
- **THEN** it starts only after the order extract has run
