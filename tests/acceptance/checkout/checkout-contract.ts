/**
 * Module contract assumed by the checkout acceptance tests (the repository has
 * no checkout code yet). Implementations must export these names.
 *
 * src/utils/card.ts
 *   createCard(number: string, type: string, expiry: string): Card  // copies unchanged
 *   cardExpiryMonth(expiry?: string): string   // "10/2001" -> "10"; missing or no "/" -> "01"
 *   cardExpiryYear(expiry?: string): string    // "10/2001" -> "2001"; missing or no "/" -> "2010"
 *   cardToXml(card: Card): string              // <CardNumber/><CardType/><ExpiryDate/> in order
 *
 * src/utils/order-xml.ts
 *   parseOrderXml(xml: string): { locale: string, ... }  // locale defaults to "en_US"
 *
 * db/checkout.ts  (SQLite via db/client.ts; synchronous, throws on any rejection)
 *   issueOrderId(counterName: string, opts?: { fault?: "after-increment" | "counter-unavailable" }): string
 *       one transaction; a throw rolls the increment back; accepts no caller role
 *   insertCounter(name: string, value: number): void   // unique name, <= 40 chars
 *   readCounter(name: string): number | undefined
 *   storeOrder(order: OrderInput): void                // rejects: missing card/contact, duplicate id
 *   storeOrderLine(line: LineInput): void              // rejects qty <= 0 and shipped > qty
 *   createPurchaseOrder(order: OrderInput, opts?: { fault?: "service-lookup" }): void
 *       also creates contact (from shipping), card and one line per line with shipped 0
 *   getOrderRecords(orderId: string): { order?: object, contacts: object[], cards: object[], lines: LineRecord[] }
 *   removeOrder(orderId: string): void                 // deletes its lines
 *   receiveOrderXml(xml: string, opts: { validate: boolean }): void  // stores; validates only when on
 *   placeOrder(input: PlaceOrderInput, deps: { cart: CartLike, send: (xml: string) => void }): { orderId: string, total: number, lines: LineRecord[] }
 *       counter "1001"; empties the cart via cart.empty() after hand-off
 *
 * LineRecord: { lineNumber: number, quantity: number, quantityShipped: number, unitPrice: number, ... }
 * CartLike:   { lines: { category, product, item, quantity, unitPrice }[], empty(): void }
 */
import path from "node:path";

export const ROOT = path.resolve(__dirname, "../../..");

export type Contact = {
  firstName: string;
  lastName: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
};

export const contact: Contact = {
  firstName: "Duke",
  lastName: "Java",
  street1: "1 Main St",
  street2: "",
  city: "Santa Clara",
  state: "CA",
  zip: "95054",
  country: "USA",
  phone: "555-0100",
  email: "duke@example.com",
};

export const card = { number: "1234-2334", type: "Duke Express", expiry: "10/2001" };

let seq = 0;
export const uid = (p = "O") => `${p}-${Date.now()}-${++seq}`;

export function orderInput(over: Record<string, unknown> = {}) {
  return {
    id: uid(),
    userId: "j2ee",
    email: contact.email,
    orderDate: Date.now(),
    locale: "en_US",
    total: 25.5,
    contact,
    card,
    lines: [
      {
        lineNumber: 0,
        category: "FISH",
        product: "FI-SW-01",
        item: "EST-1",
        quantity: 2,
        unitPrice: 10,
        quantityShipped: 0,
      },
      {
        lineNumber: 1,
        category: "DOGS",
        product: "K9-BD-01",
        item: "EST-6",
        quantity: 1,
        unitPrice: 5.5,
        quantityShipped: 0,
      },
    ],
    ...over,
  };
}

export async function checkoutDb() {
  return (await import(/* @vite-ignore */ path.join(ROOT, "db/checkout.ts"))) as Mod;
}
export async function cardMod() {
  return (await import(/* @vite-ignore */ path.join(ROOT, "src/utils/card.ts"))) as Mod;
}
export async function xmlMod() {
  return (await import(/* @vite-ignore */ path.join(ROOT, "src/utils/order-xml.ts"))) as Mod;
}

export function orderXml(opts: { locale?: string; extra?: string } = {}) {
  const c = (n: string) =>
    `<${n}><FirstName>${contact.firstName}</FirstName><LastName>${contact.lastName}</LastName><Street1>${contact.street1}</Street1><City>${contact.city}</City><State>${contact.state}</State><Zip>${contact.zip}</Zip><Country>${contact.country}</Country><Phone>${contact.phone}</Phone><Email>${contact.email}</Email></${n}>`;
  const loc = opts.locale ? ` locale="${opts.locale}"` : "";
  return `<?xml version="1.0"?><PurchaseOrder${loc}><OrderId>${uid("X")}</OrderId><UserId>j2ee</UserId><EmailId>${contact.email}</EmailId><OrderDate>${Date.now()}</OrderDate>${c("ShippingInfo")}${c("BillingInfo")}<TotalPrice>25.50</TotalPrice><CreditCard><CardNumber>${card.number}</CardNumber><CardType>${card.type}</CardType><ExpiryDate>${card.expiry}</ExpiryDate></CreditCard><LineItem><Category>FISH</Category><Product>FI-SW-01</Product><Item>EST-1</Item><LineNumber>0</LineNumber><Quantity>2</Quantity><UnitPrice>10.00</UnitPrice></LineItem>${opts.extra ?? ""}</PurchaseOrder>`;
}

// Loosely typed module surface: the implementation does not exist yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mod = Record<string, (...args: any[]) => any>;
