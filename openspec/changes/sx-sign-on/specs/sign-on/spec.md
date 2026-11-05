## ADDED Requirements

### Requirement: Sign-on credential record

The system SHALL keep exactly one sign-on credential record per user name, holding the user name and a password, both mandatory.

#### Scenario: Duplicate user name

- **GIVEN** a credential record for user name "shopper"
- **WHEN** another record with user name "shopper" is created
- **THEN** the creation is rejected

### Requirement: User creation limits

The system SHALL reject creation of a user whose user name exceeds 25 characters, whose password exceeds the maximum password length, or whose user name contains '%' or '\*'.

#### Scenario: Forbidden character

- **GIVEN** a new user name "ab\*c"
- **WHEN** the user is created
- **THEN** creation is rejected

#### Scenario: Name too long

- **GIVEN** a user name of 26 characters
- **WHEN** the user is created
- **THEN** creation is rejected

### Requirement: Credential authentication

The system SHALL authenticate a sign-on attempt by looking up the user by user name and comparing the supplied password for exact, case-sensitive equality with the stored password, and an unknown user name SHALL fail authentication.

#### Scenario: Matching password

- **GIVEN** user "j2ee" with password "j2ee"
- **WHEN** "j2ee"/"j2ee" is submitted
- **THEN** authentication succeeds

#### Scenario: Unknown user or wrong case

- **GIVEN** user "j2ee" with password "j2ee"
- **WHEN** "nobody"/"x" or "j2ee"/"J2EE" is submitted
- **THEN** authentication fails

### Requirement: Sign-on outcome

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

When a customer signs on the system SHALL load that customer's account and switch the storefront and the cart to the customer's preferred language.

#### Scenario: Preferred language applied

- **GIVEN** a customer whose preferred language is Japanese
- **WHEN** the customer signs on
- **THEN** the storefront and cart use Japanese

### Requirement: Storefront protected resources

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

When a customer signs out the system SHALL end the session, discarding the signed-on state and the cart, start a new session that keeps the current language, and show "You are signed out." with a link to sign in again.

#### Scenario: Sign out

- **GIVEN** a signed-on customer with items in the cart and Japanese selected
- **WHEN** the customer signs out
- **THEN** the cart is empty, the visitor is not signed on, Japanese is kept and the message is shown

### Requirement: Storefront idle timeout

The system SHALL end an idle storefront session after 15 minutes of inactivity.

#### Scenario: Idle session

- **GIVEN** a storefront session with no activity for 15 minutes
- **WHEN** the next request arrives
- **THEN** the session has expired

### Requirement: Supplier administrator access

The system SHALL require sign-on with the administrator role for every request to the supplier inventory application, using a sign-in form, and a signed-in user without that role SHALL see "You are not authorised to update the status of orders." instead of the inventory table.

#### Scenario: Not signed in

- **GIVEN** an unauthenticated user
- **WHEN** the inventory application is requested
- **THEN** the supplier sign-in screen is shown

#### Scenario: Signed in without role

- **GIVEN** a signed-in user without the administrator role
- **WHEN** the inventory screen is opened
- **THEN** the not-authorised message is shown

### Requirement: Supplier logout

When the supplier chooses Logout the system SHALL end the session and offer a link to sign in again.

#### Scenario: Logout

- **GIVEN** a signed-in supplier
- **WHEN** Logout is chosen
- **THEN** the session ends and a sign-in link is shown

### Requirement: Supplier idle timeout

The system SHALL end an idle supplier session after 54 minutes.

#### Scenario: Idle supplier session

- **GIVEN** a supplier session inactive for 54 minutes
- **WHEN** the next request arrives
- **THEN** the user must sign in again

### Requirement: Order processing centre role checks

The order processing centre SHALL NOT itself restrict by role who may invoke its component methods, and the customer data component SHALL NOT require any role.

#### Scenario: Caller without role

- **GIVEN** a client that can reach the component
- **WHEN** a method is invoked
- **THEN** no role check is performed

### Requirement: Sample sign-on users

The initial data load SHALL create the sign-on users j2ee, j2ee-ja, shopper and j2ee-zh with matching customer details.

#### Scenario: Initial load

- **GIVEN** an empty database
- **WHEN** the initial load runs
- **THEN** the four sample users exist

### Requirement: Storefront sign-in screen

The storefront sign-in screen SHALL offer a returning-customer form (user name, password, "Remember My User Name") and a new-customer sign-up form; the user name SHALL be pre-filled and the password blank when a remembered user name exists, otherwise both fields SHALL be pre-filled with the sample credentials "j2ee"/"j2ee"; and when sign-in fails it SHALL show "There were errors signing you in..." and offer to try again.

#### Scenario: Remembered user name

- **GIVEN** a remembered user name
- **WHEN** the screen is displayed
- **THEN** the user name is pre-filled and the password is empty

#### Scenario: No remembered name

- **GIVEN** no remembered user name
- **WHEN** the screen is displayed
- **THEN** both fields contain "j2ee"

#### Scenario: Rejected credentials

- **GIVEN** a user name and password not found
- **WHEN** the customer signs in
- **THEN** the error message is shown with a way to try again

### Requirement: Storefront page header

Every storefront page header SHALL show a search box and links to Account and Cart, and SHALL show "Sign out" when the visitor is signed on and "Sign in" otherwise.

#### Scenario: Signed-on visitor

- **GIVEN** a signed-on visitor
- **WHEN** any page is displayed
- **THEN** the header shows search, Account, Cart and Sign out

#### Scenario: Anonymous visitor

- **GIVEN** a visitor not signed on
- **WHEN** any page is displayed
- **THEN** the header shows Sign in instead of Sign out

### Requirement: Supplier sign-in screen

The supplier sign-in screen SHALL ask for user id and password pre-filled with "supplier" and "supplier", and when credentials are rejected a Login Error screen SHALL state "You could not be authenticated with the information provided. Please check your Username and Password." with a link back to sign in.

#### Scenario: Screen displayed

- **GIVEN** an unauthenticated supplier user
- **WHEN** the sign-in screen is displayed
- **THEN** user id and password fields are shown containing "supplier"

#### Scenario: Wrong password

- **GIVEN** a wrong password
- **WHEN** the form is submitted
- **THEN** the Login Error screen is shown with a link back to sign in
