/**
 * Module contract assumed by the catalog-browsing acceptance tests (the
 * repository has no catalog code yet). Implementations must provide:
 *
 * db/catalog.ts  (SQLite via db/client.ts; synchronous; every store function throws on rejection)
 *   insertCategory(id: string): void
 *   insertCategoryDetail(d: { categoryId, locale, name, image?, description? }): void
 *   getCategoryDetails(categoryId: string): { locale: string, name: string }[]
 *   insertProduct(p: { id: string /* 10 chars *\/, categoryId?: string }): void
 *   insertProductDetail(d: { productId, locale, name?, image?, description? }): void
 *   getProductDetails(productId: string): { locale, name, image?, description? }[]
 *   insertItem(i: { id: string, productId: string }): void
 *   insertItemDetail(d: { itemId, locale, listPrice?, unitCost?, image?, description?, attr1?..attr5? }): void
 *   getItemDetails(itemId: string): { locale, listPrice, unitCost, attr1?..attr5? }[]
 *   getItemParents(itemId: string): { id: string }[]            // exactly one product
 *   searchItems(text: string, locale: string): { itemId: string }[]
 *   listProducts(categoryId: string, locale: string, opts?: { now?: number }): { id: string, name: string }[]
 *       cached per args for 5 minutes (opts.now is a test clock)
 *   tables: products(id, category_id), items(id, product_id) with secondary indexes
 *           on products.category_id and items.product_id
 *
 * src/utils/encoding-filter.ts
 *   encodingFilter(req: { characterEncoding?: string | null }, res: object,
 *                  chain: (req, res) => void): void   // sets req.characterEncoding = "UTF-8", then chain(req, res)
 *
 * routes/api/search.get.ts   GET ?q=<text> -> { query: string, items: { itemId }[] }
 *
 * UI (data-testid contract): category-sidebar (links), product-row, item-row (each row
 * contains its name and price), item-detail. Next/Previous are links named "Next"/"Previous".
 * Language links: "English", "日本語"/"Japanese", "中文"/"Chinese". Search box: a searchbox.
 * Add to Cart is a link or button named "Add to Cart"; the cart lives at /cart.
 *
 * Fixture (seed.ts in this folder, run before the e2e server): after initialLoad(), DOGS holds
 * product PG-HOUND01 "Paging Hounds" with items HOUND-1..5 (names "Hound 1".."Hound 5").
 * HOUND-1: en_US list 20.00 / unit 15.00, attr1 "Loud barker"; ja_JP name ハウンド1, list 2400 / unit 1800;
 * zh_CN name 猎犬1. Categories EXTRA-1..3 make the catalog larger than 5 categories.
 */
import path from "node:path";

export const ROOT = path.resolve(__dirname, "../../..");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mod = Record<string, (...args: any[]) => any>;

export async function catalogDb() {
  return (await import(/* @vite-ignore */ path.join(ROOT, "db/catalog.ts"))) as Mod;
}
export async function encodingMod() {
  return (await import(/* @vite-ignore */ path.join(ROOT, "src/utils/encoding-filter.ts"))) as Mod;
}
export async function clientDb() {
  return (await import(/* @vite-ignore */ path.join(ROOT, "db/client.ts"))) as {
    db: { all: <T>(q: unknown) => T[] };
  };
}

let seq = 0;
/** Unique 10-character identifier (product ids are exactly 10 characters). */
export const pid = () =>
  `T${String(++seq).padStart(3, "0")}${String(Date.now() % 1_000_000).padStart(6, "0")}`;
export const uid = (p: string) => `${p}-${Date.now() % 1_000_000}-${++seq}`;

export async function makeCategory(id = uid("CAT"), locales = ["en_US"]) {
  const c = await catalogDb();
  c.insertCategory(id);
  for (const locale of locales)
    c.insertCategoryDetail({ categoryId: id, locale, name: `${id} ${locale}` });
  return id;
}
export async function makeProduct(categoryId?: string, locales = ["en_US"]) {
  const c = await catalogDb();
  const id = pid();
  c.insertProduct({ id, categoryId: categoryId ?? (await makeCategory()) });
  for (const locale of locales)
    c.insertProductDetail({ productId: id, locale, name: `Product ${id} ${locale}` });
  return id;
}
export const itemDetail = (itemId: string, over: Record<string, unknown> = {}) => ({
  itemId,
  locale: "en_US",
  listPrice: 20,
  unitCost: 15,
  image: "img/item.gif",
  description: "An item",
  ...over,
});
export async function makeItem(productId?: string) {
  const c = await catalogDb();
  const id = uid("ITM");
  c.insertItem({ id, productId: productId ?? (await makeProduct()) });
  return id;
}
