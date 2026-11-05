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
