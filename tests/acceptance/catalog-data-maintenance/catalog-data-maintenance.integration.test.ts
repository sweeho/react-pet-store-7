// @vitest-environment node
import { sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

// Contract assumed (the repository has no seed code yet). Implementations must provide:
//   db/seed.ts   export function initialLoad(): void
//       runs the initial load against the db exported by db/client.ts
//   tables: users(id, ...), customers(id, user_id -> users.id, ...),
//           categories(id, name, ...), category_details(category_id -> categories.id, locale, ...)
//   users carry a sign-on name in `username`.
const run = async () => {
  const { db } = await import("../../../db/client");
  const seed = (await import("../../../db/seed")) as { initialLoad: () => void };
  // Empty store: clear whatever db/client.ts may have seeded on its own.
  for (const t of ["category_details", "categories", "customers", "users"]) {
    db.run(sql.raw(`DELETE FROM ${t}`));
  }
  seed.initialLoad();
  return db;
};

describe("catalog data maintenance: initial load", () => {
  let db: Awaited<ReturnType<typeof run>>;
  beforeAll(async () => {
    db = await run();
  });

  // case: SWHR6-C-0175@v1
  it("SWHR6-C-0175 initial load seeds users, customers, categories and locale details", () => {
    const users = db.all<{ id: number; username: string }>(sql`SELECT id, username FROM users`);
    expect(users.map((u) => u.username).sort()).toEqual(["j2ee", "j2ee-ja", "j2ee-zh", "shopper"]);

    const customers = db.all<{ user_id: number }>(sql`SELECT user_id FROM customers`);
    expect(customers).toHaveLength(4);
    expect(customers.map((c) => c.user_id).sort()).toEqual(users.map((u) => u.id).sort());

    const cats = db.all<{ id: number; name: string }>(sql`SELECT id, name FROM categories`);
    expect(cats.map((c) => c.name).sort()).toEqual(["BIRDS", "CATS", "DOGS", "FISH", "REPTILES"]);

    for (const c of cats) {
      const locales = db.all<{ locale: string }>(
        sql`SELECT DISTINCT locale FROM category_details WHERE category_id = ${c.id}`,
      );
      expect(locales, c.name).toHaveLength(3);
    }
    const total = db.all<{ n: number }>(sql`SELECT COUNT(*) AS n FROM category_details`);
    expect(total[0].n).toBe(15);
  });
});
