/**
 * Module contract assumed by the customer-accounts acceptance tests (the repository
 * has no customer code yet). Implementations must export these names.
 *
 * src/utils/address.ts
 *   createAddress(a: Partial<Address>): Address      // stores as supplied, no validation
 *   createAddressFrom(a: Address): Address           // copies all six values
 *   addressToXml(a: Address): string                 // <Address> with <StreetName1>, optional <StreetName2>,
 *                                                    //   <City>, <State>, <Zip>, <Country>; empty line 2 omitted
 *   Address: { street1, street2, city, state, zip, country }
 *
 * src/utils/customer.ts
 *   newProfile(): Profile        // { language: "en_US", favoriteCategory: "", myList: true, banners: true }
 *   createAccountWithoutDetails(): { status: string, contact: object, card: object }   // empty contact and card
 *
 * db/customer.ts  (SQLite via db/client.ts; synchronous, throws on any rejection)
 *   resetCustomerData(): void
 *   createSignOnUser(userName: string): void
 *   createCustomer(userName: string, opts?: { withDetails?: boolean }): CustomerRecord
 *       creates account (status "active") + profile; with withDetails also contact, address and card
 *   getCustomer(userName: string): CustomerRecord | undefined
 *   listCustomers(): CustomerRecord[]
 *   removeCustomer(userName: string): void           // cascades to account, profile, contact, address, card
 *   countDependents(userName: string): { accounts, profiles, contacts, addresses, cards: number }
 *   createAccount(): { status: string, contact: object, card: object }   // no details supplied
 *   storeCard(card: { number, type, expiry }): string          // returns id
 *   readCard(id: string): { number, type, expiry }
 *   storeAddress(a: Partial<Address>): string                  // returns id; accepts null/empty values
 *   readAddress(id: string): Address
 *   storeProfile(p: { language: string, favoriteCategory?: string | null, myList: boolean, banners: boolean }): string
 *   storeAccount(a: { status: string, contactId?: string, cardId: string }): string   // rejects missing refs
 *   storeCustomer(c: { userName: string, accountId?: string, profileId?: string }): void  // rejects missing refs
 *   submitPreferences(userName: string, form: { language?: string, favoriteCategory?: string,
 *       myList?: boolean, banners?: boolean }): Profile   // an unticked box is absent from the form -> saved off
 *   submitContactForm(form: Record<string, string>): { missing: string[], messages: string[] }
 *       missing fields are recorded in `missing`; `messages` (shown to the customer) stays empty
 *
 * CustomerRecord: { userName, account: { status, contact, address, card }, profile: Profile }
 *
 * Browser contract (e2e): see customer-accounts.e2e.ts and seed.ts.
 */
import path from "node:path";

export const ROOT = path.resolve(__dirname, "../../..");

export type Mod = Record<string, (...args: any[]) => any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const customerDb = async () => {
  const mod = (await import(/* @vite-ignore */ path.join(ROOT, "db/customer.ts"))) as Mod;
  mod.resetCustomerData();
  return mod;
};
export const addressMod = async () =>
  (await import(/* @vite-ignore */ path.join(ROOT, "src/utils/address.ts"))) as Mod;
export const customerMod = async () =>
  (await import(/* @vite-ignore */ path.join(ROOT, "src/utils/customer.ts"))) as Mod;

export const address = {
  street1: "1 Main St",
  street2: "Apt 2",
  city: "Santa Clara",
  state: "CA",
  zip: "95054",
  country: "USA",
};

export const card = { number: "4111-1111", type: "Duke Express", expiry: "04/04" };
