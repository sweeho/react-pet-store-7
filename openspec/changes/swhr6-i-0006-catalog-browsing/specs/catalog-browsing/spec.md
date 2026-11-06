## ADDED Requirements

### Requirement: Catalog hierarchy and product identity

ID: SWHR6-R-0007
Recovered from: CAT-ENT-0001
The system SHALL store each product with a mandatory 10-character product identifier and a mandatory category identifier, and SHALL reject a product whose category does not exist.

#### Scenario: Product with unknown category
ID: SWHR6-R-0007.01

- **GIVEN** no category with identifier X exists
- **WHEN** a product referencing category X is stored
- **THEN** the product is rejected

#### Scenario: Product without category
ID: SWHR6-R-0007.02

- **GIVEN** a product with no category identifier
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Product details per locale

ID: SWHR6-R-0008
Recovered from: CAT-ENT-0002
The system SHALL hold product name, image and description per locale, keyed by product and locale, SHALL require a name for every product/locale row, and SHALL treat image and description as optional.

#### Scenario: Product row without name
ID: SWHR6-R-0008.01

- **GIVEN** a product and a locale
- **WHEN** a detail row is stored without a name
- **THEN** it is rejected

#### Scenario: Product row without image or description
ID: SWHR6-R-0008.02

- **GIVEN** a product and a locale
- **WHEN** a detail row is stored with a name only
- **THEN** it is accepted

### Requirement: Item details per locale

ID: SWHR6-R-0001
Recovered from: CAT-ENT-0003
The system SHALL hold item list price, unit cost, image and description per locale, keyed by item and locale, SHALL require all of these, and SHALL allow up to five optional attributes of up to 80 characters.

#### Scenario: Item row missing a price
ID: SWHR6-R-0001.01

- **GIVEN** an item and a locale
- **WHEN** a detail row is stored without a unit cost
- **THEN** it is rejected

#### Scenario: Item row with attributes
ID: SWHR6-R-0001.02

- **GIVEN** an item detail row with all mandatory fields
- **WHEN** it is stored with up to five attributes of 80 characters
- **THEN** it is accepted

### Requirement: Category, product and item hierarchy

ID: SWHR6-R-0029
Recovered from: CATALOG-ENT-0001
The system SHALL keep the catalog as categories, products and items, where each product belongs to exactly one category and each item belongs to exactly one product, with list price and unit cost as two-decimal amounts of up to 10 digits.

#### Scenario: Item belongs to one product
ID: SWHR6-R-0029.01

- **GIVEN** an item
- **WHEN** its parent is read
- **THEN** exactly one product is returned

### Requirement: Catalog navigation and paged lists

ID: SWHR6-R-0009
Recovered from: CAT-SCR-0001
The system SHALL let a visitor navigate category -> product list -> item list -> item detail, and SHALL show product and item lists 2 rows at a time, starting at the first row whenever a list is opened without paging parameters, with Previous and Next links shown only when an earlier or later page exists.

#### Scenario: List opened without paging parameters
ID: SWHR6-R-0009.01

- **GIVEN** a product with 5 items
- **WHEN** its item list is opened without paging parameters
- **THEN** items 1 and 2 are shown with a Next link and no Previous link

#### Scenario: Last page
ID: SWHR6-R-0009.02

- **GIVEN** a product with 5 items viewed on its third page
- **WHEN** the page is displayed
- **THEN** item 5 is shown with a Previous link and no Next link

### Requirement: Home page category entry points

ID: SWHR6-R-0031
Recovered from: CATB-SCR-0001
The home page SHALL let the shopper open each of the five pet categories: Fish, Dogs, Reptiles, Cats and Birds.

#### Scenario: Open a category from the home page
ID: SWHR6-R-0031.01

- **GIVEN** the storefront home page
- **WHEN** the shopper chooses Dogs
- **THEN** the product list of the Dogs category is displayed

### Requirement: Item detail screen

ID: SWHR6-R-0014
Recovered from: CAT-SCR-0002
The item detail screen SHALL show the item's name and attribute, its image, a "List Price" taken from the item's list price and a "Your Price" taken from the item's unit cost, both formatted as currency for the page's locale, and an Add to Cart link for that item.

#### Scenario: Item displayed
ID: SWHR6-R-0014.01

- **GIVEN** an item with list price and unit cost in the page locale
- **WHEN** its detail screen is displayed
- **THEN** name, attribute, image, List Price, Your Price and an Add to Cart link are shown

### Requirement: Category sidebar

ID: SWHR6-R-0027
Recovered from: CAT-BR-0007
The side navigation SHALL list the first 5 catalog categories in the page language, each linking to that category's product list.

#### Scenario: Sidebar displayed
ID: SWHR6-R-0027.01

- **GIVEN** a catalog with more than 5 categories
- **WHEN** any storefront page is displayed
- **THEN** 5 category links are shown, each opening that category's product list

### Requirement: Price shown per list

ID: SWHR6-R-0026
Recovered from: CAT-BR-0003
The product's item list SHALL show each item's list price, while keyword search results SHALL show each item's unit cost ("Your Price") and the cart SHALL show the unit cost.

#### Scenario: Price in item list versus search
ID: SWHR6-R-0026.01

- **GIVEN** an item with list price 20.00 and unit cost 15.00
- **WHEN** it appears in a product item list and in search results
- **THEN** the item list shows 20.00 and the search results show 15.00

### Requirement: Keyword search

ID: SWHR6-R-0141
Recovered from: CAT-BR-0004
The system SHALL split the search text on whitespace into keywords and SHALL return the items, in the shopper's current locale, whose product name, category id or item description contains ANY of the keywords.

#### Scenario: Any keyword matches
ID: SWHR6-R-0141.01

- **GIVEN** items matching "bird" and others matching "fish"
- **WHEN** the shopper searches "bird fish"
- **THEN** items matching either keyword are returned

#### Scenario: No results
ID: SWHR6-R-0141.02

- **GIVEN** the search text is empty or nothing matches
- **WHEN** the search runs
- **THEN** the page shows "No results were found for your search."

### Requirement: Storefront locales

ID: SWHR6-R-0006
Recovered from: CAT-BR-0005
The system SHALL serve every storefront page in English (en_US), Japanese (ja_JP) or Chinese (zh_CN), SHALL default to en_US, and SHALL show catalog names, descriptions and prices from the catalog content of the page's locale.

#### Scenario: Default locale
ID: SWHR6-R-0006.01

- **GIVEN** a visitor who has chosen no language
- **WHEN** a catalog page is displayed
- **THEN** en_US catalog content is shown

#### Scenario: Japanese locale
ID: SWHR6-R-0006.02

- **GIVEN** the page locale is ja_JP
- **WHEN** an item is displayed
- **THEN** its Japanese name, description and price are shown

### Requirement: Language switching

ID: SWHR6-R-0116
Recovered from: CAT-BR-0006
The system SHALL let a shopper switch the storefront language to English, Japanese or Chinese from any page, and SHALL apply the chosen language to the shopper's cart as well.

#### Scenario: Switch to Chinese
ID: SWHR6-R-0116.01

- **GIVEN** a shopper with items in the cart
- **WHEN** the shopper chooses Chinese
- **THEN** the page and the cart are shown in zh_CN

### Requirement: Catalog list caching

ID: SWHR6-R-0028
Recovered from: CAT-BR-0008
The system SHALL cache the rendered category navigation and product item lists for 5 minutes per page and request parameters, shared by all visitors, so catalog changes MAY take up to 5 minutes to appear on those pages.

#### Scenario: Change within cache window
ID: SWHR6-R-0028.01

- **GIVEN** a cached product list less than 5 minutes old
- **WHEN** a catalog item changes and the list is requested
- **THEN** the cached list MAY still be shown

### Requirement: Request character encoding

ID: SWHR6-R-0030
Recovered from: CATB-REQ-0001
The system SHALL interpret the character encoding of every incoming storefront request as UTF-8 before any request parameter is read, and SHALL pass the request and response on unaltered.

#### Scenario: Japanese search text
ID: SWHR6-R-0030.01

- **GIVEN** a search submitted with Japanese characters
- **WHEN** the request is read
- **THEN** the characters are decoded as UTF-8

### Requirement: Catalog lookup indexes

ID: SWHR6-R-0143
Recovered from: CAT-REQ-0004
The system SHALL support retrieval of products by category and items by product efficiently via secondary indexes on product category and item product.

#### Scenario: Items by product
ID: SWHR6-R-0143.01

- **GIVEN** a large catalog
- **WHEN** items of one product are requested
- **THEN** they are retrieved by index

### Requirement: Localised catalog details

ID: SWHR6-R-0117
Recovered from: CATB-ENT-0001
The system SHALL store the catalog as category, product and item, each product belonging to exactly one category and each item to exactly one product, with localised name, image and description held per locale as one row per category, product or item and locale.

#### Scenario: One detail row per locale
ID: SWHR6-R-0117.01

- **GIVEN** a category available in en_US and ja_JP
- **WHEN** its details are stored
- **THEN** one detail row exists for each locale

### Requirement: Encoding filter pass-through

ID: SWHR6-R-0144
Recovered from: CATB-BR-0002
The system SHALL, once the encoding has been set, pass the same request and response on to the next filter in the chain without altering the response.

#### Scenario: Request continues after encoding is set
ID: SWHR6-R-0144.01

- **GIVEN** a request that reaches the encoding filter
- **WHEN** the filter has finished setting the encoding
- **THEN** the same request and response are passed on unaltered

### Requirement: Product category lookup index

ID: SWHR6-R-0142
Recovered from: CAT-REQ-0001
The system SHALL support fast lookup of products by category identifier, for listing the products of a category.

#### Scenario: Products of a category
ID: SWHR6-R-0142.01

- **GIVEN** a large catalog
- **WHEN** the products of one category are listed
- **THEN** they are retrieved through the category index

### Requirement: Per-locale pricing and currency

ID: SWHR6-R-0145
Recovered from: CATB-BR-0011
The system SHALL price each item separately for each locale, in that locale's currency, and SHALL format displayed prices as currency of the page locale (US dollars for en_US, yen for ja_JP, yuan for zh_CN).

#### Scenario: Japanese price
ID: SWHR6-R-0145.01

- **GIVEN** an item with a ja_JP price row
- **WHEN** it is displayed in ja_JP
- **THEN** its own ja_JP price is shown formatted as yen, not converted from another locale
