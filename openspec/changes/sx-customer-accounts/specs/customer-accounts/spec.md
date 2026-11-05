## ADDED Requirements

### Requirement: Visitor sign-up

ID: SWHR6-R-0020
Recovered from: ACCT-WF-0001
The system SHALL let a new visitor sign up by entering a user name, a password and the password repeated, SHALL create the sign-on user, and SHALL then show the customer details form; WHEN the user name is already taken or the user cannot be created, the system SHALL show "The User name you have chosen is in use. Please choose another username."

#### Scenario: Visitor sign-up

- **GIVEN** user name "shopper" already exists
- **WHEN** a visitor submits it at sign-up
- **THEN** the in-use message is shown and no user is created

### Requirement: Sign-up asks for account information

Recovered from: ACCT-REQ-0001
The system SHALL let a new visitor sign up by choosing a user name and password entered twice and SHALL then ask for their account information; WHEN the chosen user name already exists, the system SHALL show the in-use message and SHALL NOT create the account.

#### Scenario: Sign-up asks for account information

- **GIVEN** an unused user name
- **WHEN** the visitor submits sign-up
- **THEN** the account information form is shown

### Requirement: New-user creation outcome

Recovered from: SIGNON-REQ-0006
WHEN a new-user form is submitted with user name and password, the system SHALL create the user credentials and continue; WHEN creation is rejected, the system SHALL go to the user creation error page.

#### Scenario: New-user creation outcome

- **GIVEN** user creation is rejected
- **WHEN** the new-user form is submitted
- **THEN** the user creation error page is shown

### Requirement: Customer details submission

ID: SWHR6-R-0054
Recovered from: ACCT-WF-0002
WHEN a new user submits the customer details form, the system SHALL create the customer record for that user, store the contact, card and profile details, mark the user as signed on, switch the storefront to the chosen preferred language, and return the user to the screen they were trying to reach before signing up (or the home screen if that was the account screen).

#### Scenario: Customer details submission

- **GIVEN** a new user redirected to sign-on from the cart
- **WHEN** the details form is submitted
- **THEN** the user is signed on, the storefront uses the chosen language and the cart is shown

### Requirement: Account creation captures details

Recovered from: ACCT-REQ-0002
The system SHALL capture, when a customer account is created, contact information (first name, last name, street address lines 1 and 2, city, state or province, postal code, country, telephone, e-mail), one payment card (number, card type, expiry month and year) and storefront preferences (preferred language, favourite category, MyList on/off, banners on/off).

#### Scenario: Account creation captures details

- **GIVEN** the customer details form
- **WHEN** it is displayed
- **THEN** fields for contact, card and preferences are offered

### Requirement: Required contact fields

ID: SWHR6-R-0048
Recovered from: ACCT-BR-0003
The system SHALL treat last name, first name, street address, city, state or province, postal code and telephone as required contact fields, and street address line 2 and e-mail as optional, when an account is created or updated; WHEN a required contact field is blank, the system records the missing fields but does not show them to the customer and does not stop the request (suspected defect).

#### Scenario: Required contact fields

- **GIVEN** a form with city blank
- **WHEN** it is submitted
- **THEN** the missing field is recorded but the customer is shown no message

### Requirement: Contact form input and checks

Recovered from: ACCT-BR-0004
The system SHALL limit account form input to 30 characters for first name, last name and card number, 70 characters for street address lines, city, telephone and e-mail, and 12 characters for postal code; and, per the other pass, WHEN a required field is blank the system SHALL record a "Missing Address Data" error naming the fields and not build the contact details, both for accounts and for order billing and shipping addresses.

#### Scenario: Contact form input and checks

- **GIVEN** a postal code of 13 characters
- **WHEN** it is typed into the form
- **THEN** input is limited to 12 characters

### Requirement: Card form options

Recovered from: ACCT-BR-0005
The system SHALL offer card types "Java(TM) Card", "Duke Express" and "Meow Card", expiry months 01-12 and expiry years 2001-2004 at sign-up and 2002-2005 on account edit, and SHALL check only that the card number is not blank.

#### Scenario: Card form options

- **GIVEN** card number "abc"
- **WHEN** the form is submitted
- **THEN** it is accepted

### Requirement: Profile preference options

ID: SWHR6-R-0049
Recovered from: ACCT-BR-0006
The system SHALL let a customer choose a preferred language (English, Japanese, Chinese) and a favourite category (Birds, Cats, Dogs, Fish, Reptiles), and turn MyList and pet-tips banners on or off; WHEN a preference box is left unticked the preference SHALL be saved as off.

#### Scenario: Profile preference options

- **GIVEN** the MyList box is unticked
- **WHEN** the form is submitted
- **THEN** MyList is saved as off

### Requirement: Account edit saves and switches language

ID: SWHR6-R-0050
Recovered from: ACCT-BR-0007
WHEN a signed-on customer saves changes to their account, the system SHALL overwrite the stored contact, card and profile details with the submitted values and switch the storefront to the saved preferred language.

#### Scenario: Account edit saves and switches language

- **GIVEN** a signed-on customer
- **WHEN** they save with language ja_JP
- **THEN** details are replaced and the storefront is Japanese

### Requirement: MyList panel on storefront pages

Recovered from: ACCT-BR-0008
The system SHALL show a "My List" panel of up to 10 products from the customer's favourite category, each linking to its product page, on storefront pages when the customer has turned MyList on.

#### Scenario: MyList panel on storefront pages

- **GIVEN** MyList on and favourite category Dogs
- **WHEN** a storefront page is shown
- **THEN** up to 10 Dogs products are listed

### Requirement: MyList panel

ID: SWHR6-R-0051
Recovered from: ACCT-BR-0009
WHEN a signed-on customer has MyList on and a page with the MyList panel is shown, the system SHALL list up to 10 products of the favourite category, each linking to its item list.

#### Scenario: MyList panel

- **GIVEN** MyList on and 14 products in the favourite category
- **WHEN** the home page is shown
- **THEN** 10 products are listed, each linking to its item list

### Requirement: Pet-tips banner

ID: SWHR6-R-0052
Recovered from: ACCT-BR-0010
WHEN a signed-on customer has banners on and the home or cart screen is shown, the system SHALL show the banner for the favourite category (dogs, cats, reptiles, birds or fish), and SHALL show the dogs banner when the category is not one of those.

#### Scenario: Pet-tips banner

- **GIVEN** banners on and an unrecognised favourite category
- **WHEN** the cart is shown
- **THEN** the dogs banner is shown

### Requirement: Address list options

ID: SWHR6-R-0053
Recovered from: ACCT-BR-0011
The address forms SHALL offer a fixed, locale-specific list of states or provinces (English: California, New York, Texas; Japanese: Tokyo, Osaka, Nagano; Chinese: Beijing, Shanghai, Jiangsu) and of countries (United States, Canada, Japan, China in the page's language).

#### Scenario: Address list options

- **GIVEN** the English address form
- **WHEN** it is displayed
- **THEN** the state list holds California, New York and Texas

### Requirement: Customer data keyed by user name

Recovered from: ACCT-ENT-0003
The system SHALL keep for each customer, keyed by user name, contact information, one credit card (number, card type, expiry as "MM/YYYY") and a profile of four preferences.

#### Scenario: Customer data keyed by user name

- **GIVEN** an existing customer
- **WHEN** the record is read
- **THEN** contact, card and profile are available

### Requirement: One customer record per user id

Recovered from: ACCT-ENT-0010
The system SHALL keep one customer record per user id, holding an account (contact information with one address, and one payment card) and a profile.

#### Scenario: One customer record per user id

- **GIVEN** two customers with different user ids
- **WHEN** they are stored
- **THEN** each has its own account and profile

### Requirement: View and edit account

Recovered from: ACCT-REQ-0006
The system SHALL let a signed-on customer view their account information (contact, payment card, preferences) and edit and save all of it.

#### Scenario: View and edit account

- **GIVEN** a signed-on customer
- **WHEN** they open the account and save edits
- **THEN** the changes are stored

### Requirement: Account screen display

Recovered from: ACCT-SCR-0008
The account screen SHALL show the signed-on customer's contact information, card type, full card number, expiry month and year, and profile preferences, and SHALL offer a link to edit the account.

#### Scenario: Account screen display

- **GIVEN** a signed-on customer
- **WHEN** the account screen is displayed
- **THEN** contact, card type, full card number, expiry month and year, preferences and an edit link are shown

### Requirement: Address stored without validation

ID: SWHR6-R-0055
Recovered from: CUST-BR-0001
The system SHALL store an address exactly as supplied, accepting any combination of values including empty or null, with no check of required fields, length or format at creation.

#### Scenario: Address stored without validation

- **GIVEN** an address with null or empty values
- **WHEN** it is created
- **THEN** it is accepted unchanged

### Requirement: Payment card storage rule

ID: SWHR6-R-0021
Recovered from: CUST-BR-0002
The system SHALL store a payment card as card number, card type and expiry date, all mandatory, with the number held in clear text and the expiry as free text (for example 04/04) with no format or date check. (The address pass states a different rule under this key: any caller may create, read, change and remove an address without a role check.)

#### Scenario: Payment card storage rule

- **GIVEN** a card with expiry "04/04"
- **WHEN** it is stored
- **THEN** the text is kept unchanged

### Requirement: Profile mandatory fields

ID: SWHR6-R-0056
Recovered from: CUST-BR-0003
The system SHALL keep per customer a storefront profile with a mandatory preferred language, an optional favourite category, and mandatory my-list and banner preference flags.

#### Scenario: Profile mandatory fields

- **GIVEN** a profile with no favourite category
- **WHEN** it is stored
- **THEN** it is accepted

### Requirement: Account status mandatory

Recovered from: CUST-BR-0004
The system SHALL record a mandatory status on every account, with no restriction in the schema on its permitted values.

#### Scenario: Account status mandatory

- **GIVEN** an account without status
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Customer, address, card and profile entities

ID: SWHR6-R-0022
Recovered from: CUST-ENT-0001
The system SHALL represent a customer as a record keyed by the sign-on user name linked to exactly one account and one profile, the account linking to contact information and one payment card; an address SHALL be six text fields (street line 1, street line 2, city, state, zip code, country) persisted as a stand-alone record with line 2 optional; a payment card SHALL be card number, card type and expiry date with no length, format or checksum constraint; and a profile SHALL require preferred language, my-list and banner flags with favourite category optional.

#### Scenario: Customer, address, card and profile entities

- **GIVEN** a customer
- **WHEN** its record is read
- **THEN** one account, one profile, contact, address and card are reachable

### Requirement: Contact information entity

Recovered from: CUST-ENT-0002
The system SHALL store contact information with mandatory family name, given name, telephone and e-mail, and SHALL require each contact to reference an existing address.

#### Scenario: Contact information entity

- **GIVEN** a contact referencing no address
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Payment card entity

Recovered from: CUST-ENT-0003
The system SHALL store a payment card with mandatory card number, card type and expiry date (up to 10 characters), identified by a unique card identifier.

#### Scenario: Payment card entity

- **GIVEN** a card with all three values
- **WHEN** it is stored
- **THEN** it gets a unique identifier

### Requirement: Account entity

ID: SWHR6-R-0057
Recovered from: CUST-ENT-0004
The system SHALL store an account with a mandatory status, and SHALL require each account to reference an existing contact and an existing payment card.

#### Scenario: Account entity

- **GIVEN** an account referencing a missing card
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Customer references

ID: SWHR6-R-0058
Recovered from: CUST-ENT-0005
The system SHALL identify a customer by the sign-on user name, and SHALL require each customer to reference an existing sign-on user, an existing account and an existing profile.

#### Scenario: Customer references

- **GIVEN** a customer whose sign-on user does not exist
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Address XML output

ID: SWHR6-R-0059
Recovered from: CUST-INT-0001
The system SHALL write an address as an XML element Address containing a street name, then the second street name only when non-empty, then city, state, zip code and country, in that order.

#### Scenario: Address XML output

- **GIVEN** an address with empty street line 2
- **WHEN** it is written as XML
- **THEN** only one street name element is written

### Requirement: Address XML input

Recovered from: CUST-INT-0002
WHEN an incoming XML document is read as an address, the system SHALL require the root element to be Address and street name, city, state, zip code and country elements in order, with a second street name optional, and SHALL reject anything else as an XML document error.

#### Scenario: Address XML input

- **GIVEN** a document with root element Order
- **WHEN** it is read as an address
- **THEN** it is rejected

### Requirement: Address creation forms

ID: SWHR6-R-0060
Recovered from: CUST-REQ-0001
The system SHALL allow an address to be created from six values, from an existing address, or empty, and SHALL return all six stored values on request.

#### Scenario: Address creation forms

- **GIVEN** an existing address
- **WHEN** an address is created from it
- **THEN** all six values are copied

### Requirement: Payment card creation forms

Recovered from: CUST-REQ-0002
The system SHALL allow a payment card to be created empty, from its three values, or from a copy of an existing card, copying card number, card type and expiry date unchanged without validation.

#### Scenario: Payment card creation forms

- **GIVEN** an existing card
- **WHEN** a card is created from it
- **THEN** number, type and expiry are copied unchanged

### Requirement: Card XML exchange

Recovered from: CUST-REQ-0005
The system SHALL exchange a payment card as an XML element CreditCard containing, in order, CardNumber, CardType and ExpiryDate, and SHALL reject any document whose root element is not CreditCard.

#### Scenario: Card XML exchange

- **GIVEN** a document whose root is not CreditCard
- **WHEN** it is read as a card
- **THEN** it is rejected

### Requirement: Card expiry month and year

Recovered from: CUST-RULE-0003
The system SHALL derive the expiry month as the text before the first "/" in the stored expiry date, and the expiry year as the text after it.

#### Scenario: Card expiry month and year

- **GIVEN** expiry date "04/2005"
- **WHEN** month and year are requested
- **THEN** "04" and "2005" are returned

### Requirement: Card expiry defaults

Recovered from: CUST-RULE-0004
WHEN a card's expiry date is absent or contains no "/", the system SHALL return month "01" and year "2010".

#### Scenario: Card expiry defaults

- **GIVEN** expiry date "0405"
- **WHEN** month and year are requested
- **THEN** "01" and "2010" are returned

### Requirement: Card operations transactional, no role

Recovered from: CUST-RULE-0006
The system SHALL permit any caller to create, read, change and remove stored payment cards without a role check, and SHALL run each such operation within a transaction.

#### Scenario: Card operations transactional, no role

- **GIVEN** a caller with no role
- **WHEN** it creates a card
- **THEN** the operation is permitted

### Requirement: Account status values

ID: SWHR6-R-0061
Recovered from: CUSTACC-BR-0001
The system SHALL give an account a status that is either "active" or "disabled", and SHALL create new accounts as "active".

#### Scenario: Account status values

- **GIVEN** a new account
- **WHEN** it is created
- **THEN** its status is "active"

### Requirement: Default account status and profile

ID: SWHR6-R-0122
Recovered from: CUSTACC-BR-0002
The system SHALL create a new account with status "active" and default a new profile to language "en_US", no favourite category, "my list" enabled and banners enabled.

#### Scenario: Default account status and profile

- **GIVEN** a newly created profile
- **WHEN** it is read
- **THEN** language is en_US, favourite category empty, my-list on, banners on

### Requirement: Cascading customer removal

ID: SWHR6-R-0062
Recovered from: CUSTACC-BR-0003
WHEN a customer is removed, the system SHALL also remove its account and profile, removing an account SHALL remove its contact information and credit card, and removing contact information SHALL remove its address.

#### Scenario: Cascading customer removal

- **GIVEN** a customer with account, profile, contact, address and card
- **WHEN** the customer is removed
- **THEN** all dependent records are removed

### Requirement: Default profile preferences

Recovered from: CUSTACC-BR-0004
The system SHALL give a new customer profile preferred language "en_US", no favourite category, "my list" on and banner on.

#### Scenario: Default profile preferences

- **GIVEN** a new customer
- **WHEN** its profile is read
- **THEN** the defaults are present

### Requirement: Customer removal cascade

Recovered from: CUSTACC-BR-0006
WHEN a customer is removed, the system SHALL also remove its account, profile, contact information, address and payment card.

#### Scenario: Customer removal cascade

- **GIVEN** a customer with all dependents
- **WHEN** it is removed
- **THEN** none of its dependents remain

### Requirement: Transactional customer operations

Recovered from: CUSTACC-BR-0007
The system SHALL perform every customer, account and profile operation inside a transaction.

#### Scenario: Transactional customer operations

- **GIVEN** a customer operation that fails midway
- **WHEN** it fails
- **THEN** no partial change is kept

### Requirement: Customer owns account and profile

ID: SWHR6-R-0123
Recovered from: CUSTACC-ENT-0001
The system SHALL represent a customer as a record identified by a unique user id, owning exactly one account (status active or disabled) and exactly one profile.

#### Scenario: Customer owns account and profile

- **GIVEN** an existing customer
- **WHEN** it is read
- **THEN** one account and one profile are available

### Requirement: Profile fields

ID: SWHR6-R-0063
Recovered from: CUSTACC-ENT-0002
The system SHALL hold per customer a profile with preferred language, favourite category, a "my list" preference and a banner preference.

#### Scenario: Profile fields

- **GIVEN** a customer
- **WHEN** its profile is read
- **THEN** the four preferences are present

### Requirement: Account contact and card

Recovered from: CUSTACC-ENT-0003
The system SHALL hold for each account contact information (given name, family name, telephone, email, address) and a credit card (type, number, expiry date).

#### Scenario: Account contact and card

- **GIVEN** an account
- **WHEN** it is read
- **THEN** contact and card are present

### Requirement: Customer data model

Recovered from: CUSTACC-ENT-0005
The system SHALL keep per customer a unique user id, an account (status), contact information, a payment card, and a profile of four storefront preferences.

#### Scenario: Customer data model

- **GIVEN** an existing customer
- **WHEN** the record is read
- **THEN** account, contact, card and profile are available

### Requirement: Customer creation and listing

ID: SWHR6-R-0064
Recovered from: CUSTACC-REQ-0001
The system SHALL create exactly one account and one profile for every new customer, linked to that customer, and SHALL be able to list all customers.

#### Scenario: Customer creation and listing

- **GIVEN** three customers
- **WHEN** all customers are requested
- **THEN** three customers are returned

### Requirement: Empty contact and card with account

Recovered from: CUSTACC-REQ-0003
The system SHALL create, with each new account, one empty contact-information record and one empty payment-card record linked to it.

#### Scenario: Empty contact and card with account

- **GIVEN** a new account
- **WHEN** it is created
- **THEN** empty contact and card records exist

### Requirement: Customer creation provisions account

Recovered from: CUSTACC-RULE-0001
WHEN a customer record is created, the system SHALL also create an account with status "active" and a profile with default preferences.

#### Scenario: Customer creation provisions account

- **GIVEN** a new user id
- **WHEN** the customer is created
- **THEN** an active account and default profile exist

### Requirement: Profile defaults

Recovered from: CUSTACC-RULE-0002
The system SHALL give a new profile preferred language en_US, no favourite category, my-list enabled and banner enabled.

#### Scenario: Profile defaults

- **GIVEN** a new profile
- **WHEN** it is read
- **THEN** the defaults apply

### Requirement: Empty contact and card when none supplied

ID: SWHR6-R-0065
Recovered from: CUSTACC-RULE-0003
WHEN an account is created without supplied contact and card details, the system SHALL create empty contact-information and credit-card records and attach them to the account.

#### Scenario: Empty contact and card when none supplied

- **GIVEN** an account created without details
- **WHEN** it is created
- **THEN** empty contact and card are attached

### Requirement: Customer deletion cascade

Recovered from: CUSTACC-RULE-0004
WHEN a customer is deleted, the system SHALL also delete its account, profile, contact information, address and credit card.

#### Scenario: Customer deletion cascade

- **GIVEN** a customer with dependents
- **WHEN** it is deleted
- **THEN** dependents are deleted

### Requirement: Customer creation workflow

ID: SWHR6-R-0066
Recovered from: CUSTACC-WFL-0001
WHEN a customer is created, the system SHALL create an account with status "active" and a profile with default preferences, and attach both to the customer.

#### Scenario: Customer creation workflow

- **GIVEN** a new customer
- **WHEN** it is created
- **THEN** account and profile are attached

### Requirement: Account creation without details

ID: SWHR6-R-0067
Recovered from: CUSTACC-WFL-0002
WHEN an account is created without supplied contact information and credit card, the system SHALL create empty ones and attach them.

#### Scenario: Account creation without details

- **GIVEN** an account created without details
- **WHEN** it is created
- **THEN** empty contact and card are attached

### Requirement: Customer keyed by sign-on user name

ID: SWHR6-R-0068
Recovered from: CUSTACCT-ENT-0001
The system SHALL represent a customer as a record keyed by the sign-on user name, linked to exactly one account and exactly one profile.

#### Scenario: Customer keyed by sign-on user name

- **GIVEN** a sign-on user name
- **WHEN** a customer is created
- **THEN** it is linked to one account and one profile

### Requirement: Account mandatory parts

Recovered from: CUSTACCT-ENT-0002
The system SHALL keep for each account a status, one contact record and one payment card, all mandatory, where the contact has family name, given name, telephone, e-mail and an address, and the address has street, city, state, postal code and country mandatory with a second street line optional.

#### Scenario: Account mandatory parts

- **GIVEN** an account without a card
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Card storage in schema

Recovered from: CUSTACCT-ENT-0003
The system SHALL store a payment card as card number, card type and expiry date (free text such as 04/04), all mandatory, with the card number held unencrypted.

#### Scenario: Card storage in schema

- **GIVEN** a card number
- **WHEN** it is stored
- **THEN** it is held in clear text

### Requirement: Profile schema

Recovered from: CUSTACCT-ENT-0004
The system SHALL store per customer a profile with a mandatory preferred language, an optional favorite category, and mandatory on/off flags for the my-list and banner preferences.

#### Scenario: Profile schema

- **GIVEN** a profile with no language
- **WHEN** it is stored
- **THEN** it is rejected
