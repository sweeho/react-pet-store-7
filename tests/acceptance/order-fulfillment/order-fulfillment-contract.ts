/**
 * Module contract assumed by the order-fulfillment acceptance tests (the repository has
 * no fulfilment code yet). Implementations must export these names.
 *
 * db/order-fulfillment.ts  (SQLite via db/client.ts; synchronous; no real broker or network)
 *   resetFulfillmentData(): void                       // empties every table this capability owns
 *   Line  = { category, product, item, lineNum, quantity, unitPrice }
 *   Contact = { firstName, lastName, street1, street2?, city, state, country, zip, email, phone }
 *
 * Supplier side
 *   seedStock(item: string, quantity: number): void    // creates or overwrites the stock record
 *   stockOf(item: string): number | undefined          // undefined = no stock record
 *   createSupplierOrder({ id, date: Date, status?: string, contact, lines: Line[] }): void
 *       status is ignored: a new order is PENDING; contact and each line are copied, line shipped = 0;
 *       duplicate id throws
 *   getSupplierOrder(id): { id, date: Date, status: "PENDING"|"COMPLETED", contact,
 *                           lines: (Line & { shipped: number })[] } | undefined
 *   supplierOrdersByStatus(status): string[]           // order ids
 *   setSupplierOrderStatus(id, status): void           // anything other than PENDING/COMPLETED throws
 *   storeSupplierOrderLine(orderId, line: Line): void  // throws when the supplier order does not exist
 *   setLineShipped(orderId, lineNum, shipped): void    // supplier order line
 *   removeSupplierOrder(id): void
 *   dependentsOf(id): { contacts: number, lines: number }   // rows still stored for a supplier order id
 *   createSupplierService({ invoiceTopic: { send(text: string): void }, now?: () => Date,
 *                           hooks?: { onStep?(step: "record" | "ship" | "publish"): void } }): {
 *       onOrderMessage(text: string): { redelivered: boolean }
 *           // one unit of work: parse, record, fulfil, publish invoice. A thrown hook step, or any failure,
 *           // rolls back records, stock and shipped quantities, publishes nothing, and returns redelivered: true.
 *           // Text that is not a valid SupplierOrder document is rejected (throws or redelivered) and records nothing.
 *       fulfil(orderId): void                      // one fulfilment attempt on a stored order (publishes its invoice)
 *       stockChecks: string[]                      // item ids whose stock was looked up, in order
 *   }
 *
 * Order processing center side
 *   PurchaseOrder = { id, userId, email, locale, date: Date, value: number, status?: string, contact,
 *                     card: { number, type, expiry }, lines: (Line & { shipped: number })[] }
 *   createPurchaseOrder(po): void                      // missing date/value or duplicate id throws; status defaults PENDING
 *   getPurchaseOrder(id): PurchaseOrder | undefined
 *   purchaseOrdersByDate(date: Date): string[]         // order ids
 *   setPurchaseOrderLineShipped(orderId, lineNum, shipped): void   // shipped > quantity throws
 *   setOrderStatus(id, status): void                   // order manager: exactly one status row per order
 *   getOrderStatuses(id): string[]
 *   ordersByStatus(status): string[]                   // order ids
 *   denyOrder(id): void                                // PENDING -> DENIED
 *   createOpcService({ supplierQueue: { send(text: string): void }, onOrderCompleted?: (orderId) => void,
 *                      hooks?: { onStep?(step: "record" | "status" | "notify"): void } }): {
 *       processApproval(orderId): { redelivered: boolean }       // sends the supplier order document
 *       onInvoiceMessage(text: string): { redelivered: boolean } // one unit of work; failure leaves nothing changed
 *   }
 *
 * Line items (pure)
 *   createLineItem(Line & { shipped: number }): { category, product, item, lineNum, quantity, unitPrice, shipped,
 *       setShipped(n): void, snapshot(): Line }       // no other setters
 *   copyLineItem(li, shipped: number): same shape
 *   isFullyShipped(lines: { quantity, shipped }[]): boolean
 *
 * XML documents (pure)  namespaces SO_NS / INV_NS below
 *   buildSupplierOrderXml(po: PurchaseOrder): string
 *       <SupplierOrder><OrderId/><OrderDate>yyyy-MM-dd</OrderDate><ShippingAddress><FirstName/><LastName/><Street1/>
 *       <City/><State/><Country/><ZipCode/><Email/><Phone/></ShippingAddress><LineItem>...</LineItem>+</SupplierOrder>
 *   parseSupplierOrderXml(xml, opts?: { validate?: boolean (default true) }): { id, date: Date, contact, lines: Line[] }
 *       wrong root => Error mentioning "SupplierOrder"; with validate, a document of another type => "Document not of type";
 *       validation also rejects duplicate item ids and quantity < 1
 *   buildInvoiceXml({ orderId, userId, orderDate: Date, shippingDate: Date, lines: Line[] }): string
 *       <Invoice><OrderId/><UserId/><OrderDate/><ShippingDate/><LineItem>...</LineItem>*</Invoice>, dates yyyy-MM-dd
 *   parseInvoiceXml(xml): { orderId, items: { item: string, quantity: number }[] }   // wrong root/namespace throws
 *   parseLineItemXml(xml): Line   // <LineItem><CategoryId/><ProductId/><ItemId/><LineNum/><Quantity/><UnitPrice/>; other root throws
 *   schemaCatalog(): { entries: { publicId: string, location: string }[] }
 */
export type Line = {
  category: string;
  product: string;
  item: string;
  lineNum: number;
  quantity: number;
  unitPrice: number;
};

export const SO_NS = "http://blueprints.j2ee.sun.com/TPASupplierOrder";
export const INV_NS = "http://blueprints.j2ee.sun.com/TPAInvoice";

export const DATE = new Date("2004-05-06T12:00:00Z");
export const NOW = new Date("2026-06-15T12:00:00Z");

export const CONTACT = {
  firstName: "Ann",
  lastName: "Lee",
  street1: "1 Main St",
  street2: "Apt 2",
  city: "Springfield",
  state: "CA",
  country: "USA",
  zip: "94000",
  email: "ann@example.com",
  phone: "555-0100",
};

export const L = (n: number, over: Partial<Line> = {}): Line => ({
  category: "Dogs",
  product: `P${n}`,
  item: `EST-${n}`,
  lineNum: n,
  quantity: 1,
  unitPrice: 10 * n,
  ...over,
});

export const ful = async () => {
  const mod = await import("../../../db/order-fulfillment");
  mod.resetFulfillmentData();
  return mod;
};

export type Row = { item: string; shipped: number };
type Fulfillment = Awaited<ReturnType<typeof ful>>;

export const makeTopic = () => {
  const messages: string[] = [];
  return { messages, send: (t: string) => void messages.push(t) };
};

export const mkOrder = (id: string, lines: Line[], over: Record<string, unknown> = {}) => ({
  id,
  date: DATE,
  contact: CONTACT,
  lines,
  ...over,
});

export const mkPo = (over: Record<string, unknown> = {}) => ({
  id: "PO-1",
  userId: "u1",
  email: "u1@example.com",
  locale: "en_US",
  date: DATE,
  value: 100,
  status: "APPROVED",
  contact: CONTACT,
  card: { number: "4111111111111111", type: "VISA", expiry: "12/2030" },
  lines: [
    { ...L(1, { quantity: 2 }), shipped: 0 },
    { ...L(2, { quantity: 3 }), shipped: 0 },
  ],
  ...over,
});

const day = (d: Date) => d.toISOString().slice(0, 10);
const lineXml = (l: Line) =>
  "<LineItem><CategoryId>" +
  l.category +
  "</CategoryId><ProductId>" +
  l.product +
  "</ProductId><ItemId>" +
  l.item +
  "</ItemId><LineNum>" +
  l.lineNum +
  "</LineNum><Quantity>" +
  l.quantity +
  "</Quantity><UnitPrice>" +
  l.unitPrice +
  "</UnitPrice></LineItem>";

export const lineItemXml = lineXml;

export const orderXml = (id: string, lines: Line[], date = DATE) =>
  '<?xml version="1.0" encoding="UTF-8"?><SupplierOrder xmlns="' +
  SO_NS +
  '"><OrderId>' +
  id +
  "</OrderId><OrderDate>" +
  day(date) +
  "</OrderDate><ShippingAddress><FirstName>" +
  CONTACT.firstName +
  "</FirstName><LastName>" +
  CONTACT.lastName +
  "</LastName><Street1>" +
  CONTACT.street1 +
  "</Street1><City>" +
  CONTACT.city +
  "</City><State>" +
  CONTACT.state +
  "</State><Country>" +
  CONTACT.country +
  "</Country><ZipCode>" +
  CONTACT.zip +
  "</ZipCode><Email>" +
  CONTACT.email +
  "</Email><Phone>" +
  CONTACT.phone +
  "</Phone></ShippingAddress>" +
  lines.map(lineXml).join("") +
  "</SupplierOrder>";

/** Invoice as the supplier publishes it; each line's quantity is the shipped quantity. */
export const invoiceXml = (orderId: string, lines: Line[], root = "Invoice", ns = INV_NS) =>
  '<?xml version="1.0" encoding="UTF-8"?><' +
  root +
  ' xmlns="' +
  ns +
  '"><OrderId>' +
  orderId +
  "</OrderId><UserId>u1</UserId><OrderDate>" +
  day(DATE) +
  "</OrderDate><ShippingDate>" +
  day(NOW) +
  "</ShippingDate>" +
  lines.map(lineXml).join("") +
  "</" +
  root +
  ">";

export const mkSvc = (
  m: Fulfillment,
  topic: { send(t: string): void },
  extra: Record<string, unknown> = {},
) => m.createSupplierService({ invoiceTopic: topic, now: () => NOW, ...extra });

export const mkOpc = (
  m: Fulfillment,
  queue: { send(t: string): void } = { send: () => {} },
  completed: string[] = [],
  extra: Record<string, unknown> = {},
) =>
  m.createOpcService({
    supplierQueue: queue,
    onOrderCompleted: (id: string) => void completed.push(id),
    ...extra,
  });
