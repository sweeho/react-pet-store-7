## 1. Credential model

- [ ] 1.1 Define the sign-on credential record (unique user name, mandatory password)
- [ ] 1.2 Implement user creation validation (name length 25, forbidden `%` and `*`, password max length)

## 2. Authentication

- [ ] 2.1 Implement exact, case-sensitive credential check with unknown-user failure
- [ ] 2.2 Implement post-authentication session state and redirect to originally requested page
- [ ] 2.3 Implement failure redirect to the sign-in error page
- [ ] 2.4 Load the customer and apply preferred language on sign-on

## 3. Access gating

- [ ] 3.1 Implement protected-resource list with exact matching and original-URL memory
- [ ] 3.2 Implement supplier administrator-role gating and not-authorised message
- [ ] 3.3 Implement storefront 15-minute and supplier 54-minute idle timeouts

## 4. Remember user name and sign-out

- [ ] 4.1 Implement remember-user-name cookie with 31-day lifetime and expiry when unset
- [ ] 4.2 Implement storefront sign-out keeping the language and emptying the cart
- [ ] 4.3 Implement supplier logout

## 5. Screens

- [ ] 5.1 Build the storefront sign-in screen with returning and sign-up forms and error message
- [ ] 5.2 Build the storefront header with search, Account, Cart, Sign in/Sign out
- [ ] 5.3 Build the supplier sign-in and login-error screens
