// @vitest-environment node
import { sql } from "drizzle-orm";
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import {
  catalogDb,
  clientDb,
  itemDetail,
  makeCategory,
  makeItem,
  makeProduct,
  pid,
  uid,
} from "./catalog-browsing-contract";

describe("catalog browsing integration: item details", () => {
  // case: SWHR6-C-0177@v1
  it("SWHR6-C-0177 item detail row without unit cost is rejected", async () => {
    const c = await catalogDb();
    const itemId = await makeItem();
    expect(() => c.insertItemDetail(itemDetail(itemId, { unitCost: undefined }))).toThrow();
    expect(c.getItemDetails(itemId)).toHaveLength(0);
  });

  // case: SWHR6-C-0178@v1
  it("SWHR6-C-0178 item detail row with five 80-character attributes is accepted", async () => {
    const c = await catalogDb();
    const itemId = await makeItem();
    const attrs = Object.fromEntries(
      [1, 2, 3, 4, 5].map((n) => [`attr${n}`, String(n).repeat(80)]),
    );
    expect(() => c.insertItemDetail(itemDetail(itemId, attrs))).not.toThrow();
    const [row] = c.getItemDetails(itemId);
    for (const [k, v] of Object.entries(attrs)) expect(row[k]).toBe(v);
  });
});

describe("catalog browsing integration: products", () => {
  // case: SWHR6-C-0181@v1
  it("SWHR6-C-0181 product referencing unknown category is rejected", async () => {
    const c = await catalogDb();
    const id = pid();
    expect(() => c.insertProduct({ id, categoryId: uid("NOSUCH") })).toThrow();
    const { db } = await clientDb();
    expect(db.all(sql`SELECT id FROM products WHERE id = ${id}`)).toHaveLength(0);
  });

  // case: SWHR6-C-0182@v1
  it("SWHR6-C-0182 product without category identifier is rejected", async () => {
    const c = await catalogDb();
    const id = pid();
    expect(() => c.insertProduct({ id })).toThrow();
    const { db } = await clientDb();
    expect(db.all(sql`SELECT id FROM products WHERE id = ${id}`)).toHaveLength(0);
  });

  // case: SWHR6-C-0183@v1
  it("SWHR6-C-0183 product detail row without name is rejected", async () => {
    const c = await catalogDb();
    const productId = await makeProduct(undefined, []);
    expect(() => c.insertProductDetail({ productId, locale: "en_US" })).toThrow();
    expect(c.getProductDetails(productId)).toHaveLength(0);
  });

  // case: SWHR6-C-0184@v1
  it("SWHR6-C-0184 product detail row with name only is accepted", async () => {
    const c = await catalogDb();
    const productId = await makeProduct(undefined, []);
    expect(() =>
      c.insertProductDetail({ productId, locale: "en_US", name: "Only a name" }),
    ).not.toThrow();
    const rows = c.getProductDetails(productId);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Only a name");
  });
});

describe("catalog browsing integration: caching", () => {
  // case: SWHR6-C-0190@v1
  it("SWHR6-C-0190 cached product list may remain stale within 5 minutes", async () => {
    const c = await catalogDb();
    const categoryId = await makeCategory();
    const productId = await makeProduct(categoryId);
    const t0 = Date.now();
    const before = c.listProducts(categoryId, "en_US", { now: t0 });
    expect(before.map((p: { id: string }) => p.id)).toContain(productId);
    const newcomer = await makeProduct(categoryId);
    const idsAt = (now: number) =>
      (c.listProducts(categoryId, "en_US", { now }) as { id: string }[]).map((p) => p.id);
    // Within the 5-minute window the cached (stale) list is served.
    const within = idsAt(t0 + 60_000);
    expect(within).not.toContain(newcomer);
    expect(within).toEqual(before.map((p: { id: string }) => p.id));
    // After the window the cache has expired and the fresh list is served.
    const expired = idsAt(t0 + 5 * 60_000 + 1_000);
    expect(expired).toContain(newcomer);
    expect(expired).toContain(productId);
  });
});

describe("catalog browsing integration: localised details", () => {
  // case: SWHR6-C-0195@v1
  it("SWHR6-C-0195 one detail row per locale for a category", async () => {
    const c = await catalogDb();
    const id = await makeCategory(uid("CAT"), []);
    c.insertCategoryDetail({ categoryId: id, locale: "en_US", name: "Birds" });
    c.insertCategoryDetail({ categoryId: id, locale: "ja_JP", name: "鳥" });
    const rows = c.getCategoryDetails(id) as { locale: string }[];
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.locale).sort()).toEqual(["en_US", "ja_JP"]);
  });
});

describe("catalog browsing integration: search", () => {
  // case: SWHR6-C-0196@v1
  it("SWHR6-C-0196 multi-keyword search matches either keyword", async () => {
    const c = await catalogDb();
    const product = await makeProduct();
    const bird = await makeItem(product);
    const fish = await makeItem(product);
    const rock = await makeItem(product);
    c.insertItemDetail(itemDetail(bird, { description: "a small bird" }));
    c.insertItemDetail(itemDetail(fish, { description: "a tiny fish" }));
    c.insertItemDetail(itemDetail(rock, { description: "a plain rock" }));
    const ids = (c.searchItems("bird fish", "en_US") as { itemId: string }[]).map((r) => r.itemId);
    expect(ids).toContain(bird);
    expect(ids).toContain(fish);
    expect(ids).not.toContain(rock);
  });

  // case: SWHR6-C-0192@v1
  it("SWHR6-C-0192 Japanese search text is decoded as UTF-8", async () => {
    const handler = (await import(/* @vite-ignore */ "../../../routes/api/search.get")).default;
    const text = "犬 鳥";
    const event = new H3Event(
      new Request(`http://localhost/api/search?q=${encodeURIComponent(text)}`),
    );
    const result = (await handler(event)) as { query: string };
    expect(result.query).toBe(text);
  });
});

describe("catalog browsing integration: lookup indexes", () => {
  async function largeCatalog() {
    const c = await catalogDb();
    const cats: string[] = [];
    for (let i = 0; i < 20; i++) cats.push(await makeCategory());
    const prods: string[] = [];
    for (let i = 0; i < 200; i++) prods.push(await makeProduct(cats[i % cats.length]));
    for (let i = 0; i < 400; i++)
      c.insertItem({ id: uid("BIG"), productId: prods[i % prods.length] });
    return { cats, prods };
  }
  const plan = async (query: ReturnType<typeof sql>) => {
    const { db } = await clientDb();
    return db
      .all<{ detail: string }>(query)
      .map((r) => r.detail)
      .join(" | ");
  };

  // case: SWHR6-C-0198@v1
  it("SWHR6-C-0198 category products are retrieved through the category index", async () => {
    const { cats } = await largeCatalog();
    const detail = await plan(
      sql`EXPLAIN QUERY PLAN SELECT id FROM products WHERE category_id = ${cats[0]}`,
    );
    expect(detail).toMatch(/USING (COVERING )?INDEX/i);
    expect(detail).not.toMatch(/SCAN products/i);
  });

  // case: SWHR6-C-0199@v1
  it("SWHR6-C-0199 items of a product are retrieved by index", async () => {
    const { prods } = await largeCatalog();
    const detail = await plan(
      sql`EXPLAIN QUERY PLAN SELECT id FROM items WHERE product_id = ${prods[0]}`,
    );
    expect(detail).toMatch(/USING (COVERING )?INDEX/i);
    expect(detail).not.toMatch(/SCAN items/i);
  });
});
