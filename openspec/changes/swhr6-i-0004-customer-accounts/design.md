# Legacy implementation notes: customer-accounts

- Customer, Account, Profile, ContactInfo, Address and CreditCard are EJB 2.x CMP entity beans (`components/customer`, `address`, `creditcard`). `CustomerEJB.ejbPostCreate` creates Account (status constant in `AccountLocalHome`) and Profile via JNDI lookup. All operations run in a Required transaction and need no role.
- Schema (`db/schema`): customer keyed by sign-on user name; account, contact, address and card mandatory columns; card number stored in clear text; expiry free text such as `04/04`; account status has no CHECK constraint; second street line optional.
- Petstore web layer: `signon.jsp` form posts to `createuser.do` (CreateUserEJBAction maps CreateException to DuplicateAccountException, routed to `duplicate_account.jsp`); `createcustomer.do` (CustomerHTMLAction, CustomerEJBAction CREATE) creates the customer, sets session signed-on and `CreateUserFlowHandler` forwards to the original URL, or main screen when it was `customer.do`.
- `customer.do` action=update (edit_customer.jsp) overwrites contact, card, profile and sets session locale.
- `extractContactInfo` is duplicated in CustomerHTMLAction and OrderHTMLAction; it stores a MissingFormDataException in a request attribute that no page reads (suspected defect: the user sees no "Missing Address Data" message). `extractCreditCard` checks only the card number.
- Option lists live in create_customer.jsp, edit_customer.jsp, customer.jsp and enter_order_information.jsp per locale copy. Stored values disagree: "Meow Club" (create en), "Blue Jay Club" (create ja/zh), "Meow Card" (edit); "USA" versus "United States"; expiry years 2001-2004 on create versus 2002-2005 on edit.
- `customer.jsp` renders the card number unmasked and links to `update_customer.screen`.
- `mylist.jsp` limit of 10 is a literal; `advice_banner.jsp` uses BannerHelper (lower-cased category, dogs fallback), included only on main and cart screens.
- Card XML exchange: element CreditCard (CardNumber, CardType, ExpiryDate); address XML: element Address; each rejects other root elements. Expiry month/year defaults "01"/"2010" when no "/".
