// @vitest-environment node
import { describe, expect, it } from "vitest";

import { approval } from "./order-approval-contract";

describe("order approval (unit)", () => {
  // case: SWHR6-C-0032@v1
  it("[SWHR6-C-0032] OrderApproval document with no Order entries is invalid", async () => {
    const m = await approval();
    const xml = `<?xml version="1.0" encoding="UTF-8"?><OrderApproval></OrderApproval>`;
    expect(() => m.readOrderApproval(xml)).toThrow();
    expect(() => m.readOrderApproval(xml, { validate: true })).toThrow();
  });
});
