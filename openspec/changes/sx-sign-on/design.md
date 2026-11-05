# Legacy implementation notes: sign-on

## Credentials and authentication

- Table `signon_user(username pk varchar2(50), password varchar2(50) not null)`; header comment says the password is plain text. `UserEJB` is a CMP entity keyed by user name.
- `SignOnEJB.authenticate` does `findByPrimaryKey`; `FinderException` returns false. `UserEJB.matchPassword` is `String.equals`.
- `UserEJB.ejbCreate` rejects user names over 25 chars (MAX_USERID_LENGTH), over-long passwords (MAX_PASSWD_LENGTH value is redacted in the source), and names containing `%` or `*`. No minimum length or empty check; nulls would NPE.

## Storefront filter

- `SignOnFilter` is mapped `/*`; it compares the last path segment with `url-pattern` values from `WEB-INF/signon-config.xml` by exact equality. Protected: customer.screen, customer.do, enter_order_information.screen, signon_welcome.screen. `auth-constraint` roles are parsed but never checked.
- On success it sets session attributes `j_signon_username` and `j_signon`, then redirects to `j_signon_original_url`. If the form is posted with no prior protected visit the original URL is null and `sendRedirect(null)` is called. The session id is not regenerated at login.
- Cookie `bp_signon` is written before authentication is checked (maxAge 2678400), so it is set even on failure.
- `SignOnNotifier` (attribute listener on `j_signon=true`) loads the customer into session `customer` and sets locale from preferred language; `SignOnEJBAction` also applies it.
- Sign-out: `SignOffHTMLAction` invalidates the session, creates a new one, copies the locale, re-inits the component manager (new cart). The `SignOffEvent -> SignOffEJBAction` mapping in mappings.xml names classes not in the tree and looks dead (reachability unresolved).
- Session timeout 15 minutes in the storefront web.xml. `signon_create` screen uses a missing `/create_user.jsp` and may be dead.
- Pages: `signon.jsp` (posts to `j_signon_check`; reads cookie `bp_signon`, otherwise `waf:input` default "j2ee"), `signon_failed.jsp`, `banner.jsp` (`c:choose` on `${j_signon == true}`).

## Supplier application

- `web.xml` security-constraint on `/RcvrRequestProcessor` (GET, POST), role `administrator`, FORM login (`login.jsp` posts `j_username`/`j_password` to `j_security_check`, `error.jsp` as error page), transport-guarantee NONE. Role mapping in sun-j2ee-ri.xml; the inventory JSP re-checks the role programmatically. `/Populate`, index.html etc. are not covered by the constraint.
- Session timeout 54 minutes: bare literal, no explanation.
- Logout: `RcvrRequestProcessor` forwards `currentScreen=logout` to `logout.jsp`, which invalidates the session.
- `login.jsp` ships with user id/password "supplier"/"supplier" as value attributes.

## Order processing centre

- No role checks on any bean method (ejb-jar.xml); the customer component likewise requires no role (CUSTACC-REQ-0002). Protection depends on callers.

## Findings carried

- Passwords stored and compared in plain text; CreateUserServlet prints user name and password to stdout.
- Sample users j2ee, j2ee-ja, shopper, j2ee-zh are created by the initial load (passwords redacted in source).
- The sign-up form asks for the password twice (`j_password_2`) but no comparison is visible.
- Account `disabled` status is never checked in this module.
