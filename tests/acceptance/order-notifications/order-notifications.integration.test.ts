// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  APPROVAL,
  COMPLETED,
  SHIPMENT,
  makeBroker,
  makeMail,
  makeTx,
  notif,
  order,
  services,
} from "./order-notifications-contract";

describe("order notifications (integration)", () => {
  // case: SWHR6-C-0039@v1
  it("[SWHR6-C-0039] approval with mail on sends one status e-mail", async () => {
    const { mail, svc } = await services({});
    svc.orderDecided(order(), "APPROVED");
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].subject).toBe("Java Pet Store Order Status: ORD-1");
    expect(mail.sent[0].to).toBe("buyer@example.com");
  });

  // case: SWHR6-C-0040@v1
  it("[SWHR6-C-0040] mail switch off sends nothing on approve or deny", async () => {
    const { mail, svc } = await services({ [APPROVAL]: false });
    svc.orderDecided(order({ id: "A" }), "APPROVED");
    svc.orderDecided(order({ id: "B" }), "DENIED");
    expect(mail.sent).toEqual([]);
  });

  // case: SWHR6-C-0047@v1
  it("[SWHR6-C-0047] rolled-back caller transaction drops queued message", async () => {
    const m = await notif();
    const b = makeBroker();
    const sender = m.createAsyncSender({ queue: b.queue, connectionFactory: b.connectionFactory });
    const tx = makeTx();
    sender.sendAMessage("hello", tx);
    tx.rollback();
    tx.commit();
    expect(b.state.messages).toEqual([]);
  });

  // case: SWHR6-C-0048@v1
  it("[SWHR6-C-0048] submitted text message lands on queue once", async () => {
    const m = await notif();
    const b = makeBroker();
    const sender = m.createAsyncSender({ queue: b.queue, connectionFactory: b.connectionFactory });
    sender.sendAMessage("hello");
    expect(b.state.messages).toEqual(["hello"]);
  });

  // case: SWHR6-C-0049@v1
  it("[SWHR6-C-0049] queue failure surfaces error and releases connection", async () => {
    const m = await notif();
    const b = makeBroker(true);
    const sender = m.createAsyncSender({ queue: b.queue, connectionFactory: b.connectionFactory });
    expect(() => sender.sendAMessage("hello")).toThrow();
    expect(b.state.opened).toBe(1);
    expect(b.state.closed).toBe(1);
  });

  // case: SWHR6-C-0050@v1
  it("[SWHR6-C-0050] two e-mails are delivered as two messages", async () => {
    const m = await notif();
    const mail = makeMail();
    const emails = [
      { to: "a@example.com", subject: "S1", html: "<p>1</p>" },
      { to: "b@example.com", subject: "S2", html: "<p>2</p>" },
    ];
    m.deliverEmails(emails, mail);
    expect(mail.sent).toEqual(emails);
  });

  // case: SWHR6-C-0051@v1
  it("[SWHR6-C-0051] partial shipment e-mail lists shipment lines", async () => {
    const { mail, svc } = await services({});
    const o = order();
    svc.invoiceReceived({ order: o, lines: [o.lines[0]], completesOrder: false });
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].subject).toBe("Java Pet Store Order Shipped: ORD-1");
    expect(mail.sent[0].to).toBe("buyer@example.com");
    expect(mail.sent[0].html).toContain("Bulldog");
    expect(mail.sent[0].html).not.toContain("Persian");
    expect(mail.sent.some((x) => x.subject.includes("COMPLETED"))).toBe(false);
  });

  // case: SWHR6-C-0052@v1
  it("[SWHR6-C-0052] final shipment sends shipment and completed-order e-mails", async () => {
    const { mail, svc } = await services({});
    const o = order();
    svc.invoiceReceived({ order: o, lines: o.lines, completesOrder: true });
    const subjects = mail.sent.map((x) => x.subject).sort();
    expect(subjects).toEqual([
      "Java Pet Store Order COMPLETED: ORD-1",
      "Java Pet Store Order Shipped: ORD-1",
    ]);
  });

  // case: SWHR6-C-0053@v1
  it("[SWHR6-C-0053] completed order e-mail lists every line", async () => {
    const { mail, svc } = await services({});
    svc.orderCompleted(order());
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].subject).toBe("Java Pet Store Order COMPLETED: ORD-1");
    expect(mail.sent[0].to).toBe("buyer@example.com");
    expect(mail.sent[0].html).toContain("Bulldog");
    expect(mail.sent[0].html).toContain("Persian");
  });

  // case: SWHR6-C-0056@v1
  it("[SWHR6-C-0056] approval switch off, shipment switch on", async () => {
    const { mail, svc } = await services({
      [APPROVAL]: false,
      [SHIPMENT]: true,
      [COMPLETED]: true,
    });
    const o = order();
    svc.orderDecided(o, "APPROVED");
    expect(mail.sent).toEqual([]);
    svc.invoiceReceived({ order: o, lines: [o.lines[0]], completesOrder: false });
    expect(mail.sent.map((x) => x.subject)).toEqual(["Java Pet Store Order Shipped: ORD-1"]);
  });

  // case: SWHR6-C-0057@v1
  it("[SWHR6-C-0057] running service ignores later switch change", async () => {
    const { reg, mail, svc } = await services({ [APPROVAL]: true });
    reg.set(APPROVAL, false);
    svc.orderDecided(order(), "APPROVED");
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].subject).toBe("Java Pet Store Order Status: ORD-1");
  });
});
