## 1. Data model

- [ ] 1.1 Define the stock record: one per item id, mandatory whole-number quantity
- [ ] 1.2 Enforce quantity >= 0 at the storage level

## 2. Inventory screens

- [ ] 2.1 Build the inventory screen with administrator-only list, entry fields, update tick boxes and submit
- [ ] 2.2 Show the no-items and not-authorised messages
- [ ] 2.3 Build the supplier home screen and the update confirmation screen
- [ ] 2.4 Return the home screen for plain navigation to the entry point

## 3. Stock update

- [ ] 3.1 Apply ticked rows with non-empty values by replacing quantity
- [ ] 3.2 Ignore negative values silently and unticked rows
- [ ] 3.3 Decide and implement handling of non-numeric input

## 4. Follow-up fulfilment

- [ ] 4.1 Run the update, pending-order retry and invoice publishing as one unit of work
- [ ] 4.2 Show confirmation after commit
- [ ] 4.3 Resolve the guide-versus-code dispute on OPC notification with an SME
