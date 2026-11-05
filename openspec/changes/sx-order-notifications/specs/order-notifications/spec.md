## ADDED Requirements

### Requirement: Order status e-mail

ID: SWHR6-R-0013
Recovered from: NOTIF-REQ-0001
When order-status mail is switched on, the system SHALL send each customer whose order has just been approved or denied (automatically or by an administrator) one e-mail to the e-mail address held on the order, with subject "Java Pet Store Order Status: <order id>" and a body rendered in the order's locale. When it is switched off, no such e-mail SHALL be sent.

#### Scenario: Switch on

- **GIVEN** order-status mail is switched on and an order has just been approved
- **WHEN** the approval is processed
- **THEN** one e-mail with subject "Java Pet Store Order Status: <order id>" is sent to the order's e-mail address

#### Scenario: Switch off

- **GIVEN** order-status mail is switched off
- **WHEN** an order is approved or denied
- **THEN** no e-mail is sent

### Requirement: Shipment e-mail

Recovered from: NOTIF-REQ-0002
When shipment mail is switched on, the system SHALL send the customer an e-mail for every supplier invoice received for their order, including the final one, with subject "Java Pet Store Order Shipped: <order id>" and a body listing category, product, quantity and unit price of each line in that shipment, rendered in the order's locale.

#### Scenario: Partial shipment

- **GIVEN** shipment mail is switched on and an invoice covers part of an order
- **WHEN** the invoice is received
- **THEN** the customer receives an e-mail listing that shipment's lines

#### Scenario: Final shipment

- **GIVEN** shipment mail is switched on and the invoice completes the order
- **WHEN** the invoice is received
- **THEN** the customer receives the shipment e-mail as well as the completed-order e-mail

### Requirement: Completed-order e-mail

Recovered from: NOTIF-REQ-0003
When completed-order mail is switched on and an order becomes COMPLETED, the system SHALL send the customer one e-mail with subject "Java Pet Store Order COMPLETED: <order id>" stating that the entire order has shipped and listing every line of the order (category, product, quantity, unit price), rendered in the order's locale.

#### Scenario: Order completes

- **GIVEN** completed-order mail is switched on
- **WHEN** an order becomes COMPLETED
- **THEN** one e-mail listing every order line is sent to the order's e-mail address

### Requirement: Locale templates and price format

Recovered from: NOTIF-BR-0004
The system SHALL render each customer e-mail body from a template for the order's locale, with templates for en_US, ja_JP and zh_CN and a default English template used when the order has no recognisable locale. Prices SHALL be shown as "$#,##0.00" in en_US, zh_CN and default templates and as "￥#,##0" in ja_JP.

#### Scenario: Japanese order

- **GIVEN** an order with locale ja_JP
- **WHEN** an e-mail is generated
- **THEN** the body is Japanese and prices use the yen format without decimals

#### Scenario: Unsupported locale

- **GIVEN** an order locale with no template, such as fr_FR
- **WHEN** an e-mail is generated
- **THEN** generation fails and the default template is not used

### Requirement: Status wording and subject language

Recovered from: NOTIF-BR-0005
The system SHALL word the order-status e-mail as an approval ("approved! We will now fulfill your order.") when the decision is APPROVED and as a refusal ("denied unfortunately. Sorry we could not place your order.") when DENIED, with equivalent wording in ja_JP and zh_CN, and subject lines SHALL be in English for every locale.

#### Scenario: Denied order in Chinese

- **GIVEN** a denied order with locale zh_CN
- **WHEN** the status e-mail is generated
- **THEN** the body carries the Chinese refusal wording and the subject is English

### Requirement: Hand-off to mail service

Recovered from: NOTIF-INT-0006
The system SHALL hand every customer e-mail to the mail service as one message carrying the recipient address, subject and an HTML body.

#### Scenario: Two e-mails

- **GIVEN** two e-mails are produced for a batch
- **WHEN** they are delivered onward
- **THEN** two separate messages are passed to the mail service

### Requirement: Asynchronous message hand-off

Recovered from: ORDNOT-INT-0001
The system SHALL provide a stateless asynchronous-send service that accepts a text message and delivers it as a single text message onto a configured point-to-point queue for later processing.

#### Scenario: Message queued

- **GIVEN** the queue is configured
- **WHEN** a text message is submitted
- **THEN** one text message is placed on the queue

### Requirement: Asynchronous send failure

Recovered from: ORDNOT-REQ-0002
The system SHALL fail creation of the sender when the queue or connection factory cannot be resolved, and SHALL report any send failure to the caller as an error and release the queue connection.

#### Scenario: Send fails

- **GIVEN** the queue connection fails during a send
- **WHEN** the send runs
- **THEN** the caller receives an error and the connection is released

### Requirement: Asynchronous send transaction and access

Recovered from: ORDNOT-BR-0003
The system SHALL execute the asynchronous send within the caller's transaction, or start one, and SHALL permit any caller to invoke it without role restriction.

#### Scenario: Caller rolls back

- **GIVEN** a caller queued a message in its transaction
- **WHEN** the caller's transaction rolls back
- **THEN** the message is not delivered

### Requirement: Named resource lookup

Recovered from: ORDER-NOTIFICATIONS-INT-0001
The system SHALL resolve named infrastructure resources (EJB homes, queue and topic connection factories, queues, topics, data sources, and URL, boolean and string configuration entries) by name through a single lookup facility and return the resolved object.

#### Scenario: Queue lookup

- **GIVEN** a queue is configured under a name
- **WHEN** it is requested by name
- **THEN** the resolved queue is returned

### Requirement: Lookup caching

Recovered from: ORDER-NOTIFICATIONS-REQ-0002
The web-tier lookup facility SHALL be a single shared instance and SHALL return a previously resolved home, factory, queue, topic or data source for a repeated name without a new lookup.

#### Scenario: Repeated name

- **GIVEN** a queue was already resolved by name
- **WHEN** the same name is requested again
- **THEN** the cached object is returned

### Requirement: Configuration entries not cached

Recovered from: ORDER-NOTIFICATIONS-REQ-0003
The system SHALL perform a fresh lookup each time a URL, boolean or string configuration entry is requested from the web tier and MUST NOT cache it.

#### Scenario: Switch changed

- **GIVEN** a boolean entry was read and its configured value then changed
- **WHEN** it is requested again
- **THEN** the new value is returned

### Requirement: Lookup failure reporting

Recovered from: ORDER-NOTIFICATIONS-REQ-0004
The system SHALL report any failure to resolve a named resource as a single locator error type that retains the underlying cause, whose root cause is the innermost cause and whose text is that of the wrapped cause.

#### Scenario: Name missing

- **GIVEN** a name that is not configured
- **WHEN** it is requested
- **THEN** a locator error is raised exposing the underlying reason

### Requirement: Configuration switches read by name

Recovered from: ONT-REQ-0003
The system SHALL read configuration switches such as the confirmation-mail switch as boolean entries by name, and SHALL supply string and URL entries by name.

#### Scenario: Missing switch

- **GIVEN** a switch is not defined in configuration
- **WHEN** it is read
- **THEN** a locator error is raised
