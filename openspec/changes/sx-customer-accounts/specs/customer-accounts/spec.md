## ADDED Requirements

### Requirement: Customer creation provisions account and profile

When a customer is created, the system SHALL create exactly one account with status "active" and one profile with default preferences, linked to that customer, and an account created without supplied details SHALL receive empty contact information and an empty payment card.

#### Scenario: New customer

- **GIVEN** a new user id
- **WHEN** the customer is created
- **THEN** an active account, a default profile, empty contact information and an empty payment card exist for that customer

### Requirement: Default profile preferences

The system SHALL default a new profile to preferred language "en_US", no favourite category, "my list" enabled and banner enabled.

#### Scenario: Defaults applied

- **GIVEN** a newly created profile
- **WHEN** it is read
- **THEN** language is en_US, favourite category is empty, my-list is on and banner is on

### Requirement: Account status values

The system SHALL give an account a status of either "active" or "disabled".

#### Scenario: Status on creation

- **GIVEN** a new account
- **WHEN** it is created
- **THEN** its status is "active"

### Requirement: Customer data model

The system SHALL keep per customer a unique user id, one account, contact information (given name, family name, telephone, e-mail, address), one payment card and a profile of four preferences.

#### Scenario: Customer record read

- **GIVEN** an existing customer
- **WHEN** the record is read
- **THEN** the account, contact, address, card and profile are available

### Requirement: Cascading customer removal

When a customer is removed, the system SHALL also remove its account, profile, contact information, address and payment card.

#### Scenario: Customer deleted

- **GIVEN** a customer with account, profile, contact, address and card
- **WHEN** the customer is removed
- **THEN** all dependent records are removed

### Requirement: List customers

The system SHALL be able to list all customers.

#### Scenario: List

- **GIVEN** three customers
- **WHEN** all customers are requested
- **THEN** three customers are returned

### Requirement: Transactional operations without role check

The system SHALL perform every customer, account, profile, address and payment-card operation within a transaction and SHALL NOT require any role to invoke them.

#### Scenario: Unprivileged caller

- **GIVEN** a caller with no role
- **WHEN** it creates or reads a payment card
- **THEN** the operation is permitted

### Requirement: Address storage without validation

The system SHALL represent an address as street line 1, street line 2, city, state, postal code and country, and SHALL store it exactly as supplied, with no required-field, length or format check, creatable from six values, from an existing address, or empty.

#### Scenario: Empty address

- **GIVEN** an address with null or empty values
- **WHEN** it is stored
- **THEN** it is accepted unchanged

### Requirement: Address XML exchange

The system SHALL write an address as an XML element Address and SHALL reject an incoming document whose root element is not Address.

#### Scenario: Wrong root

- **GIVEN** an XML document with root element Order
- **WHEN** it is read as an address
- **THEN** it is rejected

### Requirement: Payment card storage

The system SHALL store a payment card as card number, card type and expiry date text, all mandatory at the data level, copying them unchanged without length, format, checksum or date validation; a card MAY be created empty, from three values, or from another card.

#### Scenario: Copy a card

- **GIVEN** an existing card
- **WHEN** a card is created from it
- **THEN** number, type and expiry are copied unchanged

### Requirement: Card expiry month and year derivation

The system SHALL derive the expiry month as the text before the first "/" in the expiry date and the year as the text after it, and SHALL return month "01" and year "2010" when the expiry date is absent or has no "/".

#### Scenario: Normal expiry

- **GIVEN** expiry date "04/2005"
- **WHEN** month and year are requested
- **THEN** "04" and "2005" are returned

#### Scenario: Missing slash

- **GIVEN** expiry date "0405"
- **WHEN** month and year are requested
- **THEN** "01" and "2010" are returned

### Requirement: Card XML exchange

The system SHALL exchange a payment card as an XML element CreditCard containing CardNumber, CardType and ExpiryDate in order, and SHALL reject a document whose root is not CreditCard.

#### Scenario: Wrong root

- **GIVEN** an XML document whose root is not CreditCard
- **WHEN** it is read as a card
- **THEN** it is rejected

### Requirement: New user sign-up

The system SHALL let a visitor sign up with a user name, a password and the password repeated, create the sign-on user and show the customer details form, and when the user name is taken SHALL show "The User name you have chosen is in use. Please choose another username."

#### Scenario: Taken user name

- **GIVEN** user name "shopper" already exists
- **WHEN** a visitor submits it at sign-up
- **THEN** the in-use message is shown

### Requirement: Customer details submission

When a new user submits the customer details form, the system SHALL create the customer, store contact, card and profile details, mark the user signed on, switch the storefront to the chosen language, and return the user to the screen previously requested (the home screen if that was the account screen).

#### Scenario: Sign-up completes

- **GIVEN** a new user who was redirected to sign-on from the cart
- **WHEN** the details form is submitted
- **THEN** the user is signed on and returned to the cart

### Requirement: Required contact fields

The system SHALL require first name, last name, street line 1, city, state or province, postal code and telephone, SHALL treat street line 2 and e-mail as optional, and when a required field is blank SHALL record a "Missing Address Data" error naming the fields and not build the contact details.

#### Scenario: Blank city

- **GIVEN** a form with city blank
- **WHEN** it is submitted
- **THEN** a "Missing Address Data" error naming City is recorded and no contact details are built

### Requirement: Card form options

The system SHALL offer card types "Java(TM) Card", "Duke Express" and "Meow Card", expiry months 01-12 and expiry years 2001-2004 at sign-up and 2002-2005 on edit, and SHALL check only that the card number is not blank.

#### Scenario: Non-numeric card number

- **GIVEN** card number "abc"
- **WHEN** the form is submitted
- **THEN** it is accepted

### Requirement: Profile preference options

The system SHALL let a customer choose preferred language (English, Japanese, Chinese), favourite category (Birds, Cats, Dogs, Fish, Reptiles) and MyList and banner on or off, and an unticked preference box SHALL be saved as off.

#### Scenario: Unticked box

- **GIVEN** the MyList box is unticked
- **WHEN** the form is submitted
- **THEN** MyList is saved as off

### Requirement: Account edit

When a signed-on customer saves account changes, the system SHALL overwrite stored contact, card and profile details with the submitted values and switch the storefront to the saved preferred language.

#### Scenario: Language change

- **GIVEN** a signed-on customer
- **WHEN** they save with language ja_JP
- **THEN** details are replaced and the storefront is Japanese

### Requirement: Address list options

The address forms SHALL offer fixed locale-specific states or provinces (English: California, New York, Texas; Japanese: Tokyo, Osaka, Nagano; Chinese: Beijing, Shanghai, Jiangsu) and countries (United States, Canada, Japan, China in the page language).

#### Scenario: English form

- **GIVEN** the English address form
- **WHEN** it is displayed
- **THEN** the state list holds California, New York and Texas

### Requirement: Account screen display

The account screen SHALL display the signed-on customer's contact information, card type, full card number, expiry month and year, and profile preferences, and SHALL offer a link to edit the account.

#### Scenario: Account displayed

- **GIVEN** a signed-on customer
- **WHEN** the account screen is displayed
- **THEN** contact, card details, preferences and an edit link are shown

### Requirement: MyList panel

When a signed-on customer has MyList on, a page with the MyList panel SHALL list up to 10 products of the favourite category, each linking to its item list.

#### Scenario: MyList on

- **GIVEN** MyList on and favourite category Dogs
- **WHEN** the home page is shown
- **THEN** up to 10 Dogs products are listed

### Requirement: Pet-tips banner

When a signed-on customer has banners on, the home and cart screens SHALL show the banner for the favourite category, and the dogs banner when the category is not dogs, cats, reptiles, birds or fish.

#### Scenario: Unknown category

- **GIVEN** banners on and an unrecognised favourite category
- **WHEN** the cart is shown
- **THEN** the dogs banner is shown

### Requirement: New user creation outcome

When a new-user form is submitted, the system SHALL create the user credentials and continue, and when creation is rejected SHALL go to the user creation error page.

#### Scenario: Rejected

- **GIVEN** creation is rejected
- **WHEN** the form is submitted
- **THEN** the error page is shown
