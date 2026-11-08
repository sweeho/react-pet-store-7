/**
 * Module contract assumed by the order-notifications acceptance tests (the
 * repository has no notification code yet). Implementations must export these names.
 *
 * db/order-notifications.ts  (synchronous; no real network or queue broker)
 *   type Line = { category: string; product: string; quantity: number; unitPrice: number }
 *   type Order = { id: string; email: string; locale: string; lines: Line[] }
 *   type MailMessage = { to: string; subject: string; html: string }
 *
 *   class LocatorError extends Error { cause: unknown; rootCause: unknown }
 *       cause = the wrapped failure; rootCause = innermost cause; message = message of the wrapped cause
 *   createLocator(registry: { lookup(name: string): unknown }): {
 *       getBoolean(name): boolean; getString(name): string; getUrl(name): string   // fresh lookup every call, never cached
 *       getQueue(name): unknown                                                       // cached per name after first lookup
 *   }                                                                                // any registry failure => LocatorError
 *
 *   renderStatusEmail(order: Order, decision: "APPROVED" | "DENIED"): MailMessage    // throws for a locale without template
 *   renderShipmentEmail(order: Order, lines: Line[]): MailMessage                    // "Java Pet Store Order Shipped: <id>"
 *   renderCompletedEmail(order: Order): MailMessage                                  // "Java Pet Store Order COMPLETED: <id>"
 *       locales: en_US, ja_JP, zh_CN; ja_JP prices "￥#,##0", others "$#,##0.00"; subjects always English
 *
 *   deliverEmails(emails: MailMessage[], mailService: { submit(m: MailMessage): void }): void  // one submit per e-mail
 *
 *   createAsyncSender(opts: { queue: unknown; connectionFactory: { open(): QueueConnection } }): {
 *       sendAMessage(text: string, tx?: { onCommit(cb: () => void): void }): void   // with tx, queues only on commit; failures throw
 *   }
 *   QueueConnection = { send(queue: unknown, text: string): void; close(): void }
 *
 *   createNotificationService(opts: { locator: Locator; mailService: { submit(m: MailMessage): void } }): {
 *       orderDecided(order: Order, decision: "APPROVED" | "DENIED"): void
 *       invoiceReceived(inv: { order: Order; lines: Line[]; completesOrder: boolean }): void  // shipment e-mail, plus completed e-mail when completesOrder
 *       orderCompleted(order: Order): void
 *   }
 *   Switches are read ONCE at creation: param/SendApprovalMail, param/SendConfirmationMail, param/SendCompletedOrderMail.
 */
export type Line = { category: string; product: string; quantity: number; unitPrice: number };
export type Order = { id: string; email: string; locale: string; lines: Line[] };
export type MailMessage = { to: string; subject: string; html: string };

export const APPROVAL = "param/SendApprovalMail";
export const SHIPMENT = "param/SendConfirmationMail";
export const COMPLETED = "param/SendCompletedOrderMail";

export const notif = () => import("../../../db/order-notifications");

export const order = (over: Partial<Order> = {}): Order => ({
  id: "ORD-1",
  email: "buyer@example.com",
  locale: "en_US",
  lines: [
    { category: "Dogs", product: "Bulldog", quantity: 2, unitPrice: 12345 },
    { category: "Cats", product: "Persian", quantity: 1, unitPrice: 99 },
  ],
  ...over,
});

/** Mutable name registry; throws for unknown names and counts lookups. */
export const makeRegistry = (entries: Record<string, unknown>) => {
  const state = { entries: { ...entries }, lookups: 0, failWith: undefined as Error | undefined };
  return {
    state,
    set: (k: string, v: unknown) => {
      state.entries[k] = v;
    },
    lookup: (name: string): unknown => {
      state.lookups++;
      if (state.failWith) throw state.failWith;
      if (!(name in state.entries)) throw new Error(`name not found: ${name}`);
      return state.entries[name];
    },
  };
};

export const makeMail = () => {
  const sent: MailMessage[] = [];
  return { sent, submit: (m: MailMessage) => void sent.push(m) };
};

export const makeTx = () => {
  const cbs: (() => void)[] = [];
  return {
    onCommit: (cb: () => void) => void cbs.push(cb),
    commit: () => cbs.forEach((c) => c()),
    rollback: () => void (cbs.length = 0),
  };
};

export const makeBroker = (failSend = false) => {
  const queue = { name: "jms/opc/MailQueue" };
  const state = { messages: [] as string[], opened: 0, closed: 0 };
  const connectionFactory = {
    open: () => {
      state.opened++;
      return {
        send: (_q: unknown, text: string) => {
          if (failSend) throw new Error("connection lost");
          state.messages.push(text);
        },
        close: () => {
          state.closed++;
        },
      };
    },
  };
  return { queue, state, connectionFactory };
};

export const services = async (entries: Record<string, unknown>) => {
  const m = await notif();
  const reg = makeRegistry({ [APPROVAL]: true, [SHIPMENT]: true, [COMPLETED]: true, ...entries });
  const mail = makeMail();
  const svc = m.createNotificationService({ locator: m.createLocator(reg), mailService: mail });
  return { m, reg, mail, svc };
};
