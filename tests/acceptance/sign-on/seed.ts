// Fixture for the sign-on e2e run: executed with bun before the server starts.
// Contract: see sign-on-contract.ts (db/signon.ts, db/customer.ts).
import { createCustomer, resetCustomerData, submitPreferences } from "../../../db/customer";
import { createSignOnUser } from "../../../db/signon";

resetCustomerData();
// Each seeded customer signs on with password "pass".
for (const name of ["shopper", "jpuser"]) {
  createSignOnUser(name, "pass");
  createCustomer(name, { withDetails: true });
}
submitPreferences("jpuser", { language: "ja_JP", myList: true, banners: true });
