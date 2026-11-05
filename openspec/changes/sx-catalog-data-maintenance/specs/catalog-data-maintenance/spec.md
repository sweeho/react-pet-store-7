## ADDED Requirements

### Requirement: Supplier stock load

ID: SWHR6-R-0032
Recovered from: CAT-BR-0001
The system SHALL load the supplier's initial stock records from the supplier inventory data file only when no stock records exist yet, unless a forced load is requested; on load each listed item SHALL replace any existing record for that item, and an item whose quantity is missing or not a whole number SHALL be loaded with quantity 0.

#### Scenario: Stock already present without force

- **GIVEN** stock records already exist
- **WHEN** a load is requested without force
- **THEN** no stock record is changed

#### Scenario: Forced load replaces by item

- **GIVEN** an existing stock record for a listed item
- **WHEN** a forced load runs
- **THEN** that record is replaced by the file's record, and an item with a missing or non-numeric quantity is loaded with quantity 0

### Requirement: Named counters

ID: SWHR6-R-0033
Recovered from: CAT-ENT-0004
The system SHALL keep named integer counters, one per unique counter name, each with a mandatory value.

#### Scenario: Duplicate counter name

- **GIVEN** a counter named "order" exists
- **WHEN** another counter named "order" is stored
- **THEN** the store is rejected as a duplicate name

### Requirement: Supplier load redirects

ID: SWHR6-R-0034
Recovered from: CAT-WF-0002
The system SHALL, after a supplier stock load, send the user to the requested success page, or failing that back to the referring page; GIVEN the load fails and an error page was requested THEN it SHALL send the user to the error page, otherwise it SHALL report a server error. A loading page SHALL show "Please wait while the Java Pet Store Supplier Application is being populated..." and start the load, returning to the storefront home page on success.

#### Scenario: Load succeeds with success page

- **GIVEN** a success page was requested
- **WHEN** the load completes
- **THEN** the user is sent to the success page

#### Scenario: Load fails without error page

- **GIVEN** no error page was requested
- **WHEN** the load fails
- **THEN** a server error is reported

### Requirement: No price-versus-cost check

ID: SWHR6-R-0146
Recovered from: CATB-BR-0003
The system SHALL accept an item whose list price is below its unit cost when catalog data is stored, because the schema carries no price-versus-cost check.

#### Scenario: Price below cost

- **GIVEN** an item whose list price is below its unit cost
- **WHEN** catalog data is stored
- **THEN** the item is accepted

### Requirement: Supplier seed content

ID: SWHR6-R-0035
Recovered from: CDM-BR-0002
The system SHALL seed the supplier stock with 29 items, EST-1 through EST-29, each with a quantity of 10000.

#### Scenario: Seed on empty stock

- **GIVEN** an empty supplier stock
- **WHEN** the seed load runs
- **THEN** 29 items EST-1 through EST-29 exist, each with quantity 10000

### Requirement: Supplier seed load on request

ID: SWHR6-R-0036
Recovered from: CDM-REQ-0001
The system SHALL load the supplier's initial stock from a seed data file on request, only when no stock records exist yet, unless a forced reload is requested. WHEN a load runs THEN for each item in the file the system SHALL replace any existing stock record for that item with the file's quantity. GIVEN the existing stock cannot be read THEN the system SHALL treat it as empty and load. The system SHALL also check that every category has at least one product (C1) and every product has at least one item (C2), and SHALL fail the integrity job when any such row is found.

#### Scenario: Unreadable existing stock

- **GIVEN** the existing stock cannot be read
- **WHEN** a load is requested without force
- **THEN** the stock is treated as empty and the file is loaded

#### Scenario: Category without products

- **GIVEN** a category with no product
- **WHEN** the integrity job runs
- **THEN** the job fails

### Requirement: Integrity check for price and description

ID: SWHR6-R-0147
Recovered from: CDM-REQ-0002
The system SHALL flag any item detail whose list price is lower than its unit cost (C3), and any item lacking a description for a locale defined for its category (C4).

#### Scenario: Price below cost flagged

- **GIVEN** an item detail with list price below unit cost
- **WHEN** the integrity job runs
- **THEN** the item detail is flagged

#### Scenario: Missing description for a locale

- **GIVEN** an item with no description for a locale defined for its category
- **WHEN** the integrity job runs
- **THEN** the item is flagged

### Requirement: Integrity check for supplier inventory and counts

ID: SWHR6-R-0037
Recovered from: CDM-REQ-0003
The system SHALL flag any catalog item that has no supplier inventory record (C5), and SHALL log the total category and item counts.

#### Scenario: Item without inventory record

- **GIVEN** a catalog item with no supplier inventory record
- **WHEN** the integrity job runs
- **THEN** the item is flagged and the category and item totals are logged

### Requirement: Populate function access and redirects

ID: SWHR6-R-0038
Recovered from: DATA-BR-0002
The populate function SHALL be reachable by HTTP GET or POST without sign-on, SHALL end the caller's session, and SHALL redirect to the given success page, or else to the referring page; GIVEN loading fails THEN it SHALL redirect to the given error page or report a server error.

#### Scenario: Populate without sign-on

- **GIVEN** an unauthenticated caller
- **WHEN** the populate function is requested with a success page
- **THEN** the caller's session is ended and the caller is redirected to the success page

#### Scenario: Populate fails

- **GIVEN** loading fails and an error page was given
- **WHEN** the populate function runs
- **THEN** the caller is redirected to the error page

### Requirement: Seed users and customers replaced on load

ID: SWHR6-R-0039
Recovered from: DATA-BR-0003
The system SHALL, when loading seed users and customers, replace any existing user or customer with the same id (and that customer's account and profile) with the seeded version, leaving other users and customers untouched.

#### Scenario: Reload demo data

- **GIVEN** an existing customer with a seeded id and another customer with a different id
- **WHEN** the seed users and customers are loaded
- **THEN** the seeded-id customer is replaced and the other customer is unchanged

### Requirement: Initial seed content

ID: SWHR6-R-0002
Recovered from: DATA-BR-0005
The initial load SHALL create the sign-on users j2ee, j2ee-ja, shopper and j2ee-zh with matching customers, and the five categories FISH, DOGS, REPTILES, CATS and BIRDS each with English, Japanese and Chinese details.

#### Scenario: Initial load on an empty store

- **GIVEN** an empty store
- **WHEN** the initial load runs
- **THEN** the four users with matching customers and the five categories with details in three locales exist

### Requirement: Catalog item storage

ID: SWHR6-R-0015
Recovered from: DATA-ENT-0004
The catalog SHALL store items keyed by item id, each belonging to exactly one product, with per-locale item details keyed by (item id, locale) holding a list price and a unit cost as decimals with 2 places (both required), an image, a description and up to five attributes.

#### Scenario: Item detail stored

- **GIVEN** an item with a detail for locale en
- **WHEN** a second detail for the same item and locale is stored
- **THEN** it is rejected as a duplicate key

### Requirement: Chained storefront and supplier load

ID: SWHR6-R-0040
Recovered from: DATA-INT-0003
WHEN the storefront is entered from the welcome page THEN the system SHALL run the storefront data load and then the supplier application's data load with the same force setting, showing "Please wait while the Java Pet Store Application is being populated..." meanwhile.

#### Scenario: Entering from welcome page

- **GIVEN** the welcome page
- **WHEN** the storefront is entered
- **THEN** the storefront load runs, then the supplier load with the same force setting, with the wait message shown

### Requirement: Conditional storefront populate

ID: SWHR6-R-0118
Recovered from: DATA-WF-0001
WHEN the populate function is requested without force THEN the system SHALL check whether the catalog tables, users and customers already hold data and, if all do, SHALL change nothing. WHEN it is requested with force, or any of those checks fails, THEN the system SHALL drop and recreate the catalog tables and load the catalog, users and customers from the bundled data file, replacing any existing user or customer with the same id.

#### Scenario: Already populated without force

- **GIVEN** catalog tables, users and customers all hold data
- **WHEN** populate is requested without force
- **THEN** nothing changes

#### Scenario: Forced populate

- **GIVEN** an existing catalog
- **WHEN** populate is requested with force
- **THEN** the catalog tables are dropped, recreated and reloaded
