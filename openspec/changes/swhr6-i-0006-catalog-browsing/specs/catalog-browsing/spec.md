## ADDED Requirements

### Requirement: Catalog hierarchy and product identity

ID: SWHR6-R-0007
Recovered from: CAT-ENT-0001
The system SHALL store each product with a mandatory 10-character product identifier and a mandatory category identifier, and SHALL reject a product whose category does not exist.

#### Scenario: Product with unknown category

- **GIVEN** no category with identifier X exists
- **WHEN** a product referencing category X is stored
- **THEN** the product is rejected

#### Scenario: Product without category

- **GIVEN** a product with no category identifier
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Product details per locale

ID: SWHR6-R-0008
Recovered from: CAT-ENT-0002
The system SHALL hold product name, image and description per locale, keyed by product and locale, SHALL require a name for every product/locale row, and SHALL treat image and description as optional.

#### Scenario: Product row without name

- **GIVEN** a product and a locale
- **WHEN** a detail row is stored without a name
- **THEN** it is rejected

#### Scenario: Product row without image or description

- **GIVEN** a product and a locale
- **WHEN** a detail row is stored with a name only
- **THEN** it is accepted

### Requirement: Item details per locale

ID: SWHR6-R-0001
Recovered from: CAT-ENT-0003
The system SHALL hold item list price, unit cost, image and description per locale, keyed by item and locale, SHALL require all of these, and SHALL allow up to five optional attributes of up to 80 characters.

#### Scenario: Item row missing a price

- **GIVEN** an item and a locale
- **WHEN** a detail row is stored without a unit cost
- **THEN** it is rejected

#### Scenario: Item row with attributes

- **GIVEN** an item detail row with all mandatory fields
- **WHEN** it is stored with up to five attributes of 80 characters
- **THEN** it is accepted

### Requirement: Category, product and item hierarchy

The system SHALL keep the catalog as categories, products and items, where each product belongs to exactly one category and each item belongs to exactly one product, with list price and unit cost as two-decimal amounts of up to 10 digits.

#### Scenario: Item belongs to one product

- **GIVEN** an item
- **WHEN** its parent is read
- **THEN** exactly one product is returned

### Requirement: Catalog navigation and paged lists

ID: SWHR6-R-0009
Recovered from: CAT-SCR-0001
The system SHALL let a visitor navigate category -> product list -> item list -> item detail, and SHALL show product and item lists 2 rows at a time, starting at the first row whenever a list is opened without paging parameters, with Previous and Next links shown only when an earlier or later page exists.

#### Scenario: List opened without paging parameters

- **GIVEN** a product with 5 items
- **WHEN** its item list is opened without paging parameters
- **THEN** items 1 and 2 are shown with a Next link and no Previous link

#### Scenario: Last page

- **GIVEN** a product with 5 items viewed on its third page
- **WHEN** the page is displayed
- **THEN** item 5 is shown with a Previous link and no Next link

### Requirement: Home page category entry points

The home page SHALL let the shopper open each of the five pet categories: Fish, Dogs, Reptiles, Cats and Birds.

#### Scenario: Open a category from the home page

- **GIVEN** the storefront home page
- **WHEN** the shopper chooses Dogs
- **THEN** the product list of the Dogs category is displayed

### Requirement: Item detail screen

The item detail screen SHALL show the item's name and attribute, its image, a "List Price" taken from the item's list price and a "Your Price" taken from the item's unit cost, both formatted as currency for the page's locale, and an Add to Cart link for that item.

#### Scenario: Item displayed

- **GIVEN** an item with list price and unit cost in the page locale
- **WHEN** its detail screen is displayed
- **THEN** name, attribute, image, List Price, Your Price and an Add to Cart link are shown

### Requirement: Category sidebar

The side navigation SHALL list the first 5 catalog categories in the page language, each linking to that category's product list.

#### Scenario: Sidebar displayed

- **GIVEN** a catalog with more than 5 categories
- **WHEN** any storefront page is displayed
- **THEN** 5 category links are shown, each opening that category's product list

### Requirement: Price shown per list

The product's item list SHALL show each item's list price, while keyword search results SHALL show each item's unit cost ("Your Price") and the cart SHALL show the unit cost.

#### Scenario: Price in item list versus search

- **GIVEN** an item with list price 20.00 and unit cost 15.00
- **WHEN** it appears in a product item list and in search results
- **THEN** the item list shows 20.00 and the search results show 15.00

### Requirement: Keyword search

The system SHALL split the search text on whitespace into keywords and SHALL return the items, in the shopper's current locale, whose product name, category id or item description contains ANY of the keywords.

#### Scenario: Any keyword matches

- **GIVEN** items matching "bird" and others matching "fish"
- **WHEN** the shopper searches "bird fish"
- **THEN** items matching either keyword are returned

#### Scenario: No results

- **GIVEN** the search text is empty or nothing matches
- **WHEN** the search runs
- **THEN** the page shows "No results were found for your search."

### Requirement: Storefront locales

ID: SWHR6-R-0006
Recovered from: CAT-BR-0005
The system SHALL serve every storefront page in English (en_US), Japanese (ja_JP) or Chinese (zh_CN), SHALL default to en_US, and SHALL show catalog names, descriptions and prices from the catalog content of the page's locale.

#### Scenario: Default locale

- **GIVEN** a visitor who has chosen no language
- **WHEN** a catalog page is displayed
- **THEN** en_US catalog content is shown

#### Scenario: Japanese locale

- **GIVEN** the page locale is ja_JP
- **WHEN** an item is displayed
- **THEN** its Japanese name, description and price are shown

### Requirement: Language switching

The system SHALL let a shopper switch the storefront language to English, Japanese or Chinese from any page, and SHALL apply the chosen language to the shopper's cart as well.

#### Scenario: Switch to Chinese

- **GIVEN** a shopper with items in the cart
- **WHEN** the shopper chooses Chinese
- **THEN** the page and the cart are shown in zh_CN

### Requirement: Catalog list caching

The system SHALL cache the rendered category navigation and product item lists for 5 minutes per page and request parameters, shared by all visitors, so catalog changes MAY take up to 5 minutes to appear on those pages.

#### Scenario: Change within cache window

- **GIVEN** a cached product list less than 5 minutes old
- **WHEN** a catalog item changes and the list is requested
- **THEN** the cached list MAY still be shown

### Requirement: Request character encoding

The system SHALL interpret the character encoding of every incoming storefront request as UTF-8 before any request parameter is read, and SHALL pass the request and response on unaltered.

#### Scenario: Japanese search text

- **GIVEN** a search submitted with Japanese characters
- **WHEN** the request is read
- **THEN** the characters are decoded as UTF-8

### Requirement: Catalog lookup indexes

The system SHALL support retrieval of products by category and items by product efficiently via secondary indexes on product category and item product.

#### Scenario: Items by product

- **GIVEN** a large catalog
- **WHEN** items of one product are requested
- **THEN** they are retrieved by index
