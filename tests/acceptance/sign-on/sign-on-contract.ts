/**
 * Module contract assumed by the sign-on acceptance tests (the repository has no
 * sign-on code yet). Implementations must export these names.
 *
 * db/signon.ts  (SQLite via db/client.ts; synchronous, throws on any rejection)
 *   resetSignOnData(): void
 *   createSignOnUser(userName: string, password: string): void
 *       rejects: duplicate user name, user name > 25 chars, user name containing '%' or '*'
 *   getSignOnUser(userName: string): { userName: string, password: string } | undefined
 *   countSignOnUsers(userName: string): number
 *   authenticate(userName: string, password: string): boolean   // exact, case-sensitive
 *
 * db/customer.ts: customer component (see customer-accounts contract), callable with no
 *   caller/role context: createCustomer, getCustomer, listCustomers, removeCustomer.
 *
 * src/utils/signon.ts  (pure, in-memory, injectable clock in epoch milliseconds)
 *   createSessionStore({ now: () => number }): SessionStore
 *     SessionStore.create(kind: "storefront" | "supplier"): Session
 *     SessionStore.resolve(id: string): Session & { expired: boolean }
 *         idle storefront session expires at 15 min, supplier at 54 min; an expired id
 *         resolves to a NEW, not-signed-on session with expired: true
 *     Session: { id, kind, signedOn: boolean, userName?: string, roles: string[], rememberedUrl?: string }
 *   guardStorefront(req: { path: string, session: Session }, config: { protectedPatterns: string[] }):
 *       { action: "pass" } | { action: "signon", rememberedUrl: string }
 *       (exact equality on the path; signed-on sessions of any role pass)
 *   guardSupplier(req: { screen: "home"|"inventory-display"|"inventory-update"|"logout", session: Session }):
 *       { allowed: true } | { allowed: false, page: "supplier-signin" }
 *       (requires role "administrator")
 *   submitSignOn(form: { userName: string, password: string, remember?: boolean },
 *                ctx: { session: Session, existingCookie?: string }):
 *       { authenticated: boolean, redirectTo: string,
 *         cookie: { name: "bp_signon", value: string, maxAge: number } | null }
 *       (cookie is decided before authentication: maxAge 2678400 when remember, 0 when an
 *        existing cookie is present and remember is absent)
 *
 * Browser contract (e2e): see sign-on.e2e.ts and seed.ts.
 */
import path from "node:path";

export const ROOT = path.resolve(__dirname, "../../..");

export type Mod = Record<string, (...args: any[]) => any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const signOnDb = async () => {
  const mod = (await import(/* @vite-ignore */ path.join(ROOT, "db/signon.ts"))) as Mod;
  mod.resetSignOnData();
  return mod;
};
export const customerDb = async () => {
  const mod = (await import(/* @vite-ignore */ path.join(ROOT, "db/customer.ts"))) as Mod;
  mod.resetCustomerData();
  return mod;
};
export const signOnMod = async () =>
  (await import(/* @vite-ignore */ path.join(ROOT, "src/utils/signon.ts"))) as Mod;

export const MIN = 60_000;

/** A store whose clock the test controls. */
export async function clockedStore() {
  const { createSessionStore } = await signOnMod();
  const clock = { t: 1_000_000 };
  const store = createSessionStore({ now: () => clock.t });
  return { store, clock };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signedOn = (store: any, kind: "storefront" | "supplier", roles: string[]) => {
  const s = store.create(kind);
  s.signedOn = true;
  s.userName = "someone";
  s.roles = roles;
  return s;
};
