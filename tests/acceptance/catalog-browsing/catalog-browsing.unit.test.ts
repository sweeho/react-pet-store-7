// @vitest-environment node
import { describe, expect, it } from "vitest";

import { catalogDb, encodingMod, makeItem } from "./catalog-browsing-contract";

describe("catalog browsing unit", () => {
  // case: SWHR6-C-0191@v1
  it("SWHR6-C-0191 item parent is exactly one product", async () => {
    const c = await catalogDb();
    const itemId = await makeItem();
    const parents = c.getItemParents(itemId);
    expect(parents).toHaveLength(1);
    expect(typeof parents[0].id).toBe("string");
  });

  // case: SWHR6-C-0200@v1
  it("SWHR6-C-0200 encoding filter passes request and response on unaltered", async () => {
    const { encodingFilter } = await encodingMod();
    const req = { url: "/search?q=x" };
    const res = { status: 200, headers: { a: "b" } };
    const resBefore = structuredClone(res);
    const received: unknown[] = [];
    encodingFilter(req, res, (r: unknown, s: unknown) => received.push(r, s));
    expect(received).toHaveLength(2);
    expect(received[0]).toBe(req);
    expect(received[1]).toBe(res);
    expect(req.url).toBe("/search?q=x");
    expect(res).toEqual(resBefore);
  });
});
