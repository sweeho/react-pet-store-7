## ADDED Requirements

### Requirement: Batch approval decisions

ID: SWHR6-R-0011
Recovered from: APPR-WF-0006
The system SHALL accept approval decisions as a batch of (order, new status) pairs; for each pending order in the batch it SHALL set the order status to the decided status, SHALL send a supplier purchase order for each order decided APPROVED, SHALL send no supplier purchase order for an order decided DENIED, and SHALL pass the list of applied decisions on for customer notification.

#### Scenario: Mixed batch

- **GIVEN** two pending orders, one decided APPROVED and one decided DENIED
- **WHEN** the batch is processed
- **THEN** both statuses are updated, one supplier purchase order is sent for the approved order only, and both decisions are passed on for customer notification

### Requirement: en_US automatic approval

The system SHALL automatically approve an order placed in the en_US locale whose total price is strictly less than 500, and SHALL leave every other en_US order pending administrator approval.

#### Scenario: Below the limit

- **GIVEN** an en_US order with total 499.99
- **WHEN** it is received
- **THEN** it is approved automatically

#### Scenario: At the limit

- **GIVEN** an en_US order with total exactly 500
- **WHEN** it is received
- **THEN** it stays PENDING

### Requirement: ja_JP automatic approval

The system SHALL automatically approve an order placed in the ja_JP locale whose total price is strictly less than 50000, and SHALL leave every other ja_JP order pending administrator approval.

#### Scenario: Below and at the limit

- **GIVEN** ja_JP orders with totals 49999 and 50000
- **WHEN** they are received
- **THEN** the first is approved automatically and the second stays PENDING

### Requirement: No automatic approval for other locales

The system SHALL NOT automatically approve an order whose locale is neither en_US nor ja_JP, whatever its total.

#### Scenario: Chinese locale order

- **GIVEN** a zh_CN order of any value
- **WHEN** it is received
- **THEN** it stays PENDING until an administrator approves or denies it

### Requirement: Initial pending state and shared approval path

The system SHALL record every received order with status PENDING before any approval decision, and an automatic approval SHALL be issued as an approval decision through the same path as an administrator's decision.

#### Scenario: Automatic approval is treated like an administrator approval

- **GIVEN** an order that qualifies for automatic approval
- **WHEN** it is received
- **THEN** it is first recorded PENDING, then approved through the decision path, so the supplier receives the order and the customer is notified

### Requirement: Decisions apply only to pending orders

The system SHALL apply an approval or denial only to an order whose current status is PENDING.

#### Scenario: Decision on an already decided order

- **GIVEN** an order already APPROVED, DENIED or COMPLETED
- **WHEN** an approval decision for it arrives
- **THEN** the decision is ignored, no status change is made, no supplier order is sent and no customer notice is produced for it

### Requirement: Order status values

The system SHALL hold the processing state of each order in a record whose status is one of PENDING, APPROVED, DENIED or COMPLETED, and SHALL reject any other value.

#### Scenario: Unlisted status

- **GIVEN** an order processing record
- **WHEN** a status other than the four listed is stored
- **THEN** the store is rejected

### Requirement: Approval document format

The system SHALL represent a batch of order status changes as an OrderApproval document holding one or more Order entries, each with an order id and an order status, and SHALL read such documents back, validating them against the document definition by default.

#### Scenario: Empty batch

- **GIVEN** an OrderApproval document with no Order entries
- **WHEN** it is read with validation on
- **THEN** it is rejected as invalid
