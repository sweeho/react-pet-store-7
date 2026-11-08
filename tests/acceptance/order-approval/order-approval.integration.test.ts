// @vitest-environment node
import { describe, expect, it } from "vitest";

import { approval } from "./order-approval-contract";

describe("order approval", () => {
  // case: SWHR6-C-0030@v1
  it("[SWHR6-C-0030] mixed approve/deny batch updates both and sends one supplier PO", async () => {
    const m = await approval();
    m.seedOrder({ id: "A", locale: "zh_CN", value: 10, status: "PENDING" });
    m.seedOrder({ id: "B", locale: "zh_CN", value: 10, status: "PENDING" });
    m.processApprovalBatch([
      { orderId: "A", status: "APPROVED" },
      { orderId: "B", status: "DENIED" },
    ]);
    expect(m.orderStatus("A")).toBe("APPROVED");
    expect(m.orderStatus("B")).toBe("DENIED");
    expect(m.supplierMessages().map((s) => s.orderId)).toEqual(["A"]);
    expect(
      m
        .notificationMessages()
        .map((n) => [n.orderId, n.status])
        .sort(),
    ).toEqual([
      ["A", "APPROVED"],
      ["B", "DENIED"],
    ]);
  });

  // case: SWHR6-C-0031@v1
  it("[SWHR6-C-0031] decision on already decided order is ignored", async () => {
    const m = await approval();
    const statuses = ["APPROVED", "DENIED", "COMPLETED"] as const;
    for (const s of statuses) m.seedOrder({ id: s, locale: "zh_CN", value: 10, status: s });
    m.processApprovalBatch(
      statuses.flatMap((s) => [
        { orderId: s, status: "APPROVED" as const },
        { orderId: s, status: "DENIED" as const },
      ]),
    );
    for (const s of statuses) {
      expect(m.orderStatus(s)).toBe(s);
      expect(m.statusHistory(s)).toEqual([s]);
    }
    expect(m.supplierMessages()).toHaveLength(0);
    expect(m.notificationMessages()).toHaveLength(0);
  });

  // case: SWHR6-C-0033@v1
  it("[SWHR6-C-0033] en_US order of 499.99 is auto-approved", async () => {
    const m = await approval();
    m.receiveOrder({ id: "E1", locale: "en_US", value: 499.99 });
    expect(m.orderStatus("E1")).toBe("APPROVED");
  });

  // case: SWHR6-C-0034@v1
  it("[SWHR6-C-0034] en_US order of exactly 500 stays PENDING", async () => {
    const m = await approval();
    m.receiveOrder({ id: "E2", locale: "en_US", value: 500 });
    expect(m.orderStatus("E2")).toBe("PENDING");
  });

  // case: SWHR6-C-0035@v1
  it("[SWHR6-C-0035] auto-approval records PENDING then approves via decision path", async () => {
    const m = await approval();
    m.receiveOrder({ id: "E3", locale: "en_US", value: 100 });
    expect(m.statusHistory("E3")).toEqual(["PENDING", "APPROVED"]);
    expect(m.supplierMessages().map((s) => s.orderId)).toEqual(["E3"]);
    expect(m.notificationMessages()).toEqual([{ orderId: "E3", status: "APPROVED" }]);
  });

  // case: SWHR6-C-0036@v1
  it("[SWHR6-C-0036] ja_JP order of 49999 is auto-approved", async () => {
    const m = await approval();
    m.receiveOrder({ id: "J1", locale: "ja_JP", value: 49999 });
    expect(m.orderStatus("J1")).toBe("APPROVED");
  });

  // case: SWHR6-C-0037@v1
  it("[SWHR6-C-0037] ja_JP order of exactly 50000 stays PENDING", async () => {
    const m = await approval();
    m.receiveOrder({ id: "J2", locale: "ja_JP", value: 50000 });
    expect(m.orderStatus("J2")).toBe("PENDING");
  });

  // case: SWHR6-C-0038@v1
  it("[SWHR6-C-0038] zh_CN order stays PENDING until administrator decides", async () => {
    const m = await approval();
    m.receiveOrder({ id: "Z1", locale: "zh_CN", value: 1 });
    m.receiveOrder({ id: "Z2", locale: "zh_CN", value: 1_000_000 });
    expect(m.orderStatus("Z1")).toBe("PENDING");
    expect(m.orderStatus("Z2")).toBe("PENDING");
    m.processApprovalBatch([
      { orderId: "Z1", status: "APPROVED" },
      { orderId: "Z2", status: "DENIED" },
    ]);
    expect(m.orderStatus("Z1")).toBe("APPROVED");
    expect(m.orderStatus("Z2")).toBe("DENIED");
  });
});
