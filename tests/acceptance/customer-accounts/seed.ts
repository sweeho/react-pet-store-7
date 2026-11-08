// Fixture for the customer-accounts e2e run: executed with bun before the server starts.
// Contract: see customer-accounts-contract.ts (db/customer.ts).
import {
  createCustomer,
  createSignOnUser,
  resetCustomerData,
  submitPreferences,
} from "../../../db/customer";

resetCustomerData();
createSignOnUser("shopper");
// Customers with preset preferences; each signs on with password "pass" (E2E contract).
for (const [name, prefs] of [
  ["mylistuser", { favoriteCategory: "DOGS", myList: true, banners: false }],
  ["bannerless", { favoriteCategory: "UNKNOWN-CAT", myList: false, banners: true }],
  ["editor", { favoriteCategory: "CATS", myList: true, banners: true }],
] as const) {
  createSignOnUser(name);
  createCustomer(name, { withDetails: true });
  submitPreferences(name, prefs);
}
