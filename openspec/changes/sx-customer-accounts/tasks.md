## 1. Data model

- [ ] 1.1 Define customer keyed by user id with one account and one profile
- [ ] 1.2 Define account status (active, disabled), contact information and address
- [ ] 1.3 Define payment card (number, type, expiry text) and profile (language, favourite category, my-list, banner)
- [ ] 1.4 Implement cascading removal of account, profile, contact, address and card

## 2. Customer lifecycle

- [ ] 2.1 Create account (active) and default profile on customer creation
- [ ] 2.2 Create empty contact and card records with each new account
- [ ] 2.3 Implement list-all-customers
- [ ] 2.4 Run all customer operations transactionally

## 3. Card and address handling

- [ ] 3.1 Implement expiry month/year derivation with the 01/2010 fallback
- [ ] 3.2 Implement XML exchange for card and address with root-element rejection
- [ ] 3.3 Implement required-field check on contact details

## 4. Sign-up and account edit

- [ ] 4.1 Implement sign-up with duplicate user name message
- [ ] 4.2 Implement customer details creation, auto sign-in and return to requested screen
- [ ] 4.3 Implement account edit overwrite and locale switch
- [ ] 4.4 Provide fixed option lists for card types, expiry, states, countries, languages, categories

## 5. Screens and preferences

- [ ] 5.1 Build the account screen with edit link
- [ ] 5.2 Implement MyList panel and pet-tips banner behaviour
