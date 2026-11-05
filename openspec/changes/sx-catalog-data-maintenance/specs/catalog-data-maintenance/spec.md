## ADDED Requirements

### Requirement: Initial seed content

ID: SWHR6-R-0002
Recovered from: DATA-BR-0005
The initial load SHALL create the sign-on users j2ee, j2ee-ja, shopper and j2ee-zh with matching customers, and the five categories FISH, DOGS, REPTILES, CATS and BIRDS each with English, Japanese and Chinese details.

#### Scenario: Initial load on an empty store

- **GIVEN** an empty store
- **WHEN** the initial load runs
- **THEN** the four users with matching customers and the five categories with details in three locales exist

### Requirement: Storefront data load

The system SHALL, when the populate function is requested without force, check whether catalog tables, users and customers already hold data and change nothing if all do; WHEN requested with force or any check fails, it SHALL drop and recreate the catalog tables and load catalog, users and customers from the bundled data file, replacing any existing user or customer with the same id.

#### Scenario: Already populated

- **GIVEN** catalog, users and customers all hold data
- **WHEN** populate is requested without force
- **THEN** nothing is changed

#### Scenario: Forced reload

- **GIVEN** a populated store
- **WHEN** populate is requested with force
- **THEN** the catalog tables are recreated and reloaded and users and customers with the same ids are replaced

### Requirement: Data load access and redirect

The populate function SHALL be reachable by HTTP GET or POST without sign-on, SHALL end the caller's session, and SHALL redirect to the given success page or else the referring page; WHEN loading fails it SHALL redirect to the given error page or report a server error.

#### Scenario: Load fails with error page given

- **GIVEN** an error page was supplied
- **WHEN** loading fails
- **THEN** the caller is redirected to the error page

#### Scenario: Load fails without error page

- **GIVEN** no error page was supplied
- **WHEN** loading fails
- **THEN** a server error is reported

### Requirement: Storefront entry data load

WHEN the storefront is entered from the welcome page, the system SHALL run the storefront data load and then the supplier data load with the same force setting, displaying "Please wait while the Java Pet Store Application is being populated..." meanwhile.

#### Scenario: Entering the storefront

- **GIVEN** the welcome page
- **WHEN** the user enters the storefront
- **THEN** the wait message is shown, the storefront load runs, then the supplier load runs with the same force setting

### Requirement: Catalog item pricing storage

The catalog SHALL store items keyed by item id, each belonging to exactly one product, with per-locale details keyed by (item id, locale) holding a required list price and a required unit cost as decimals with 2 places, an image, a description and up to five attributes.

#### Scenario: Item detail stored

- **GIVEN** an item with a locale detail
- **WHEN** it is stored
- **THEN** list price and unit cost are held as 2-place decimals and both are required

### Requirement: No price-versus-cost constraint

The system SHALL accept an item whose list price is below its unit cost and SHALL NOT enforce that list price is at least unit cost when catalog data is stored.

#### Scenario: Price below cost

- **GIVEN** an item with list price 5.00 and unit cost 8.00
- **WHEN** it is stored
- **THEN** it is accepted

### Requirement: Supplier stock load

The system SHALL load the supplier's initial stock from the supplier data file only when no stock records exist, unless a forced load is requested; each listed item SHALL replace any existing record for that item, an item with missing or non-integer quantity SHALL load with quantity 0, and unreadable existing stock SHALL be treated as empty.

#### Scenario: Stock already present

- **GIVEN** stock records exist
- **WHEN** a load is requested without force
- **THEN** no stock is changed

#### Scenario: Non-numeric quantity

- **GIVEN** a listed item with a non-integer quantity
- **WHEN** the load runs
- **THEN** that item is stored with quantity 0

### Requirement: Supplier seed stock

The system SHALL seed supplier stock with 29 items, EST-1 through EST-29, each with quantity 10000.

#### Scenario: Seeded stock

- **GIVEN** an empty supplier stock
- **WHEN** the seed load runs
- **THEN** 29 items EST-1..EST-29 each have quantity 10000

### Requirement: Supplier load page and redirects

A supplier loading page SHALL show "Please wait while the Java Pet Store Supplier Application is being populated..." and start the load; on success the system SHALL redirect to the requested success page (the storefront main screen) or else the referring page; WHEN the load fails it SHALL redirect to the requested error page or report an error if none was given.

#### Scenario: Successful supplier load

- **GIVEN** the supplier loading page with a success page given
- **WHEN** the load succeeds
- **THEN** the user is redirected to the success page

#### Scenario: Failed supplier load without error page

- **GIVEN** no error page was given
- **WHEN** the load fails
- **THEN** an error is reported

### Requirement: Catalog structure integrity check

The system SHALL check that every category has at least one product (C1) and every product has at least one item (C2), and SHALL fail the integrity job when any violating row is found.

#### Scenario: Empty category

- **GIVEN** a category with no products
- **WHEN** the integrity job runs
- **THEN** the job fails

### Requirement: Catalog data quality flags

The system SHALL flag any item detail whose list price is lower than its unit cost (C3), any item lacking a description for a locale defined for its category (C4), and any catalog item with no supplier inventory record (C5), and SHALL log the total category and item counts.

#### Scenario: Item without inventory

- **GIVEN** a catalog item with no supplier inventory record
- **WHEN** the integrity job runs
- **THEN** the item is flagged under C5 and category and item totals are logged
