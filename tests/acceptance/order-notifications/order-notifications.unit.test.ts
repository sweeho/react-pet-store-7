// @vitest-environment node
import { describe, expect, it } from "vitest";

import { APPROVAL, makeRegistry, notif, order } from "./order-notifications-contract";

const CJK = /[぀-ヿ一-鿿]/;

describe("order notifications (unit)", () => {
  // case: SWHR6-C-0041@v1
  it("[SWHR6-C-0041] ja_JP e-mail is Japanese with yen format", async () => {
    const m = await notif();
    const o = order({
      locale: "ja_JP",
      lines: [{ category: "Dogs", product: "Bulldog", quantity: 1, unitPrice: 12345 }],
    });
    const mail = m.renderShipmentEmail(o, o.lines);
    expect(mail.html).toMatch(CJK);
    expect(mail.html).toContain("￥12,345");
    expect(mail.html).not.toContain("12,345.00");
    expect(mail.html).not.toContain("$12,345");
  });

  // case: SWHR6-C-0042@v1
  it("[SWHR6-C-0042] locale without template fails and no default used", async () => {
    const m = await notif();
    expect(() => m.renderStatusEmail(order({ locale: "fr_FR" }), "APPROVED")).toThrow();
    expect(() => m.renderCompletedEmail(order({ locale: "fr_FR" }))).toThrow();
  });

  // case: SWHR6-C-0043@v1
  it("[SWHR6-C-0043] denied zh_CN order has Chinese body and English subject", async () => {
    const m = await notif();
    const mail = m.renderStatusEmail(order({ locale: "zh_CN" }), "DENIED");
    expect(mail.subject).toBe("Java Pet Store Order Status: ORD-1");
    expect(mail.html).toMatch(CJK);
    expect(mail.html).not.toContain("denied unfortunately");
    expect(mail.html).not.toContain("approved!");
  });

  // case: SWHR6-C-0044@v1
  it("[SWHR6-C-0044] undefined switch read raises locator error", async () => {
    const m = await notif();
    const loc = m.createLocator(makeRegistry({}));
    expect(() => loc.getBoolean(APPROVAL)).toThrow(m.LocatorError);
  });

  // case: SWHR6-C-0045@v1
  it("[SWHR6-C-0045] boolean entry re-read returns changed value", async () => {
    const m = await notif();
    const reg = makeRegistry({ [APPROVAL]: true });
    const loc = m.createLocator(reg);
    expect(loc.getBoolean(APPROVAL)).toBe(true);
    reg.set(APPROVAL, false);
    expect(loc.getBoolean(APPROVAL)).toBe(false);
  });

  // case: SWHR6-C-0046@v1
  it("[SWHR6-C-0046] unconfigured name error exposes cause", async () => {
    const m = await notif();
    const reg = makeRegistry({});
    const boom = new Error("lookup exploded");
    reg.state.failWith = boom;
    const loc = m.createLocator(reg);
    let caught: unknown;
    try {
      loc.getString("missing/name");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(m.LocatorError);
    const err = caught as InstanceType<typeof m.LocatorError>;
    expect(err.cause).toBe(boom);
    expect(err.message).toBe("lookup exploded");
  });

  // case: SWHR6-C-0054@v1
  it("[SWHR6-C-0054] queue resolved by configured name", async () => {
    const m = await notif();
    const q = { name: "jms/opc/MailQueue" };
    const loc = m.createLocator(makeRegistry({ "jms/opc/MailQueue": q }));
    expect(loc.getQueue("jms/opc/MailQueue")).toBe(q);
  });

  // case: SWHR6-C-0055@v1
  it("[SWHR6-C-0055] repeated queue lookup returns cached object", async () => {
    const m = await notif();
    const reg = makeRegistry({ "jms/opc/MailQueue": { name: "q" } });
    const loc = m.createLocator(reg);
    const first = loc.getQueue("jms/opc/MailQueue");
    const before = reg.state.lookups;
    const second = loc.getQueue("jms/opc/MailQueue");
    expect(second).toBe(first);
    expect(reg.state.lookups).toBe(before);
  });
});
