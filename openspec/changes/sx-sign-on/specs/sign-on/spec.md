## ADDED Requirements

### Requirement: Sign-on credential record

ID: SWHR6-R-0025
Recovered from: SIGN-ENT-0001
The system SHALL keep exactly one sign-on credential record per user name, holding the user name and a password, both mandatory.

#### Scenario: Duplicate user name

- **GIVEN** a credential record for user name "shopper"
- **WHEN** another record with user name "shopper" is created
- **THEN** the creation is rejected

### Requirement: Sign-on outcome

ID: SWHR6-R-0114
Recovered from: SIGNON-REQ-0002
When authentication succeeds the system SHALL mark the session as signed on, record the user name in the session and redirect the user to the originally requested resource, and when it fails the system SHALL redirect to the sign-on error page.

#### Scenario: Success after a protected request

- **GIVEN** a visitor redirected to sign in from the account page
- **WHEN** valid credentials are submitted
- **THEN** the session is signed on and the visitor is taken to the account page

#### Scenario: Failure

- **GIVEN** a visitor on the sign-in screen
- **WHEN** invalid credentials are submitted
- **THEN** the sign-on error page is shown

### Requirement: Customer context on sign-on

ID: SWHR6-R-0110
Recovered from: SIGN-BR-0003
When a customer signs on the system SHALL load that customer's account and switch the storefront and the cart to the customer's preferred language.

#### Scenario: Preferred language applied

- **GIVEN** a customer whose preferred language is Japanese
- **WHEN** the customer signs on
- **THEN** the storefront and cart use Japanese

### Requirement: Storefront protected resources

ID: SWHR6-R-0024
Recovered from: SIGN-BR-0001
The system SHALL require sign-on before showing the account screen, performing an account action, showing the order information (checkout) screen or showing the sign-in welcome screen, matching the requested name by exact equality, and SHALL remember the requested address; all other storefront screens and actions, including the cart, order submission and account edit screen, SHALL be reachable without sign-on.

#### Scenario: Protected page, not signed on

- **GIVEN** a visitor who is not signed on
- **WHEN** the visitor requests the checkout order-information screen
- **THEN** the sign-in screen is shown and the requested address is remembered

#### Scenario: Open page

- **GIVEN** a visitor who is not signed on
- **WHEN** the visitor requests the cart
- **THEN** the cart is shown

#### Scenario: Supplier screen without the administrator role

- **GIVEN** a supplier user who is not signed on or lacks the administrator role
- **WHEN** a supplier screen (home, inventory display, inventory update, logout) is requested
- **THEN** the supplier sign-in page is shown, and the stock clerk account holding the role is admitted

#### Scenario: Signed-on visitor

- **GIVEN** a signed-on visitor with any role
- **WHEN** a protected page is requested
- **THEN** the page is shown

### Requirement: Remember user name

ID: SWHR6-R-0115
Recovered from: SIGNON-REQ-0004
When a sign-on form is submitted with the remember-user-name option the system SHALL store the user name in a cookie lasting 2678400 seconds (31 days), and when the option is absent it SHALL expire any existing sign-on cookie.

#### Scenario: Option selected

- **GIVEN** the sign-on form with "Remember My User Name" selected
- **WHEN** it is submitted
- **THEN** the cookie is set for 31 days, even if authentication fails

#### Scenario: Option not selected

- **GIVEN** an existing sign-on cookie
- **WHEN** the form is submitted without the option
- **THEN** the cookie is expired

### Requirement: Storefront sign-out

ID: SWHR6-R-0111
Recovered from: SIGN-BR-0004
When a customer signs out the system SHALL end the session, discarding the signed-on state and the cart, start a new session that keeps the current language, and show "You are signed out." with a link to sign in again.

#### Scenario: Sign out

- **GIVEN** a signed-on customer with items in the cart and Japanese selected
- **WHEN** the customer signs out
- **THEN** the cart is empty, the visitor is not signed on, Japanese is kept and the message is shown

### Requirement: Storefront idle timeout

ID: SWHR6-R-0112
Recovered from: SIGN-BR-0005
The system SHALL end an idle storefront session after 15 minutes of inactivity.

#### Scenario: Idle session

- **GIVEN** a storefront session with no activity for 15 minutes
- **WHEN** the next request arrives
- **THEN** the session has expired

### Requirement: Storefront page header

ID: SWHR6-R-0113
Recovered from: SIGN-SCR-0006
Every storefront page header SHALL show a search box and links to Account and Cart, and SHALL show "Sign out" when the visitor is signed on and "Sign in" otherwise.

#### Scenario: Signed-on visitor

- **GIVEN** a signed-on visitor
- **WHEN** any page is displayed
- **THEN** the header shows search, Account, Cart and Sign out

#### Scenario: Anonymous visitor

- **GIVEN** a visitor not signed on
- **WHEN** any page is displayed
- **THEN** the header shows Sign in instead of Sign out

### Requirement: Credential authentication

ID: SWHR6-R-0199
Recovered from: SIGNON-REQ-0001
The system SHALL authenticate a sign-on attempt by looking up the user by user name and comparing the supplied password for exact, case-sensitive equality with the stored password, and an unknown user name SHALL fail authentication.

#### Scenario: Matching credentials

- **GIVEN** a user "shopper" with password "abc"
- **WHEN** "shopper" and "abc" are submitted
- **THEN** authentication succeeds

#### Scenario: Wrong case or unknown user

- **GIVEN** a user "shopper" with password "abc"
- **WHEN** "shopper" and "ABC", or an unknown user name, are submitted
- **THEN** authentication fails

### Requirement: Protected URL matching

ID: SWHR6-R-0200
Recovered from: SIGNON-REQ-0003
When a user who is not signed on requests a resource whose URL exactly equals a protected URL pattern from the sign-on configuration, the system SHALL remember the requested URL and present the sign-on page instead, and all other requests and all requests from signed-on users SHALL pass through.

#### Scenario: Exact match

- **GIVEN** a visitor not signed on and a protected pattern for the account screen
- **WHEN** the account screen is requested
- **THEN** the URL is remembered and the sign-on page is presented

#### Scenario: Non-matching URL

- **GIVEN** a visitor not signed on
- **WHEN** a URL that merely resembles a protected pattern is requested
- **THEN** the request passes through

### Requirement: User creation validation

ID: SWHR6-R-0201
Recovered from: SIGNON-REQ-0005
The system SHALL reject creation of a user whose user name exceeds 25 characters, whose password exceeds the maximum password length, or whose user name contains '%' or '\*'.

#### Scenario: Forbidden character

- **GIVEN** a new-user request with user name "ab\*c"
- **WHEN** the user is created
- **THEN** creation is rejected

#### Scenario: Name too long

- **GIVEN** a user name of 26 characters
- **WHEN** the user is created
- **THEN** creation is rejected

### Requirement: Credential record keyed by user name

ID: SWHR6-R-0198
Recovered from: SIGNON-ENT-0001
The system SHALL keep a user credential record keyed by unique user name, holding the password.

#### Scenario: Lookup by user name

- **GIVEN** a credential record for "shopper"
- **WHEN** the record is looked up by "shopper"
- **THEN** that record and its password are returned

### Requirement: Supplier idle timeout

ID: SWHR6-R-0195
Recovered from: SIGN-BR-0002
The system SHALL end an idle supplier session after 54 minutes.

#### Scenario: Idle supplier session

- **GIVEN** a supplier session with no activity for 54 minutes
- **WHEN** the next request arrives
- **THEN** the session has expired

### Requirement: Supplier session expiry

ID: SWHR6-R-0193
Recovered from: SO-BR-0004
The system SHALL end an idle supplier session after 54 minutes.

#### Scenario: Supplier left idle

- **GIVEN** a signed-on supplier idle for 54 minutes
- **WHEN** the supplier next acts
- **THEN** sign-in is required again

### Requirement: Customer component access

ID: SWHR6-R-0194
Recovered from: CUSTACC-REQ-0002
The system SHALL NOT require any role to invoke the customer, profile, address, contact-information and credit-card component methods; protection comes from the screens that call them.

#### Scenario: Component invoked without a role

- **GIVEN** a caller holding no role
- **WHEN** a customer component method is invoked
- **THEN** no permission check rejects the call

### Requirement: Storefront sign-in screen

ID: SWHR6-R-0196
Recovered from: SIGN-SCR-0002
The sign-in screen SHALL offer a returning-customer form (user name, password, "Remember My User Name") and a new-customer sign-up form, and SHALL show "There were errors signing you in..." with an offer to try again when the user name and password are not found.

#### Scenario: Remembered user name

- **GIVEN** a remembered user name exists
- **WHEN** the screen is shown
- **THEN** the user name is pre-filled and the password is blank

#### Scenario: No remembered user name

- **GIVEN** no remembered user name
- **WHEN** the screen is shown
- **THEN** both fields are pre-filled with the sample credentials "j2ee"/"j2ee"

#### Scenario: Credentials not found

- **GIVEN** a user name and password not in the records
- **WHEN** the customer signs in
- **THEN** the error message is shown with an option to try again

### Requirement: Supplier sign-in screen

ID: SWHR6-R-0197
Recovered from: SIGN-SCR-0004
The supplier sign-in page SHALL ask for user id and password, pre-filled with user id "supplier" and password "supplier", and SHALL show "You could not be authenticated with the information provided. Please check your Username and Password." with a link back to sign in when credentials are rejected.

#### Scenario: Page displayed

- **GIVEN** a visitor requesting a supplier screen
- **WHEN** the sign-in page is displayed
- **THEN** user id and password inputs are shown pre-filled with "supplier"

#### Scenario: Credentials rejected

- **GIVEN** wrong credentials
- **WHEN** they are submitted
- **THEN** the authentication error message and a link back to sign in are shown
