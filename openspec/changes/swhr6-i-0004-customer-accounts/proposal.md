# Customer accounts

## Why

Records the behaviour of the legacy customer, account, profile, contact, address and payment-card handling, plus the sign-up, account-edit and account-display surfaces, so the rebuild can match it.

## What changes

- Customer creation always yields one active account and one default profile.
- Account holds contact information, an address and one payment card.
- Sign-up, account edit and the account screen; MyList and pet-tips banner preferences.
- Cascading removal, fixed option lists, and unvalidated storage of card and address data.

## Impact

Source records: CUSTACC-_, CUST-_, CUSTACCT-_, ACCT-_, SIGNON-REQ-0006. Sign-on credentials and checkout are separate capabilities.
