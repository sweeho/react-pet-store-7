// Fixture for the catalog-browsing e2e run: executed with bun before the server starts.
// Contract: see catalog-browsing-contract.ts (db/catalog.ts, db/seed.ts).
import { initialLoad } from "../../../db/seed";
import * as c from "../../../db/catalog";

initialLoad();
for (const n of [1, 2, 3]) {
  c.insertCategory(`EXTRA-${n}`);
  for (const locale of ["en_US", "ja_JP", "zh_CN"]) {
    c.insertCategoryDetail({ categoryId: `EXTRA-${n}`, locale, name: `Extra ${n} ${locale}` });
  }
}
c.insertProduct({ id: "PG-HOUND01", categoryId: "DOGS" });
const names = {
  en_US: (n: number) => `Hound ${n}`,
  ja_JP: (n: number) => `ハウンド${n}`,
  zh_CN: (n: number) => `猎犬${n}`,
};
c.insertProductDetail({
  productId: "PG-HOUND01",
  locale: "en_US",
  name: "Paging Hounds",
  image: "img/hound.gif",
});
c.insertProductDetail({
  productId: "PG-HOUND01",
  locale: "ja_JP",
  name: "ページング犬",
  image: "img/hound.gif",
});
c.insertProductDetail({
  productId: "PG-HOUND01",
  locale: "zh_CN",
  name: "分页猎犬",
  image: "img/hound.gif",
});
for (let n = 1; n <= 5; n++) {
  const id = `HOUND-${n}`;
  c.insertItem({ id, productId: "PG-HOUND01" });
  c.insertItemDetail({
    itemId: id,
    locale: "en_US",
    listPrice: 20,
    unitCost: 15,
    image: "img/hound.gif",
    description: names.en_US(n),
    attr1: "Loud barker",
  });
  c.insertItemDetail({
    itemId: id,
    locale: "ja_JP",
    listPrice: 2400,
    unitCost: 1800,
    image: "img/hound.gif",
    description: `${names.ja_JP(n)}の説明`,
    attr1: "よく吠える",
  });
  c.insertItemDetail({
    itemId: id,
    locale: "zh_CN",
    listPrice: 140,
    unitCost: 100,
    image: "img/hound.gif",
    description: names.zh_CN(n),
    attr1: "爱叫",
  });
}
