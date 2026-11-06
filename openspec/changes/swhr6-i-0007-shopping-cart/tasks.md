## 1. Cart model

- [ ] 1.1 Create one cart per visitor session at session start, usable without sign-on
- [ ] 1.2 Implement add item, remove item and update quantities on the cart
- [ ] 1.3 Compute the cart subtotal from line unit cost and quantity
- [ ] 1.4 Settle with an SME the effect of quantity 0, negative quantities and repeat adds

## 2. Cart actions

- [ ] 2.1 Expose add, remove and update-all operations
- [ ] 2.2 Parse every per-line quantity and treat a non-whole number as 0
- [ ] 2.3 Return the shopper to the cart view after each operation

## 3. Cart screen

- [ ] 3.1 Show the empty-cart message when the cart has no lines
- [ ] 3.2 Show each line with item link, Remove link, editable quantity and unit cost
- [ ] 3.3 Show Update Cart button, cart total and Check Out link
- [ ] 3.4 Add Add-to-cart links on item, product list and search pages

## 4. Verification

- [ ] 4.1 Write scenario tests for each requirement in spec.md
