## 1. Order placement

- [ ] 1.1 Implement order submission that builds a purchase order from the signed-on user, billing e-mail, current time, contacts, card, locale and cart lines
- [ ] 1.2 Generate order identifiers from a named counter, creating it at zero when absent
- [ ] 1.3 Refuse empty-cart submission with the empty-cart error
- [ ] 1.4 Compute order total as sum of unit price x quantity with 0-based line numbers
- [ ] 1.5 Send the order document asynchronously to order processing and empty the cart
- [ ] 1.6 Decide and implement the payment card source (legacy hard-codes a placeholder card)

## 2. Screens

- [ ] 2.1 Build the order information form with pre-filled billing and shipping blocks and required-field checks
- [ ] 2.2 Build fixed state and country choices per store language
- [ ] 2.3 Build the order-complete page
- [ ] 2.4 Build the empty-cart error page
- [ ] 2.5 Build the general error page

## 3. Data model

- [ ] 3.1 Define purchase order, contact, card and line item with mandatory relations and line constraints
- [ ] 3.2 Define the counter store
- [ ] 3.3 Define the order XML exchange document

## 4. Order receipt

- [ ] 4.1 Receive the order document asynchronously, store it and validate only when switched on
- [ ] 4.2 Create contact, card and line items with shipped quantity 0 and abort on failure
