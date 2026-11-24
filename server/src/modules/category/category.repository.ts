import { db } from "../../db/db.js";
import { categories } from "../../db/schema.js";
import { eq } from "drizzle-orm";

type NewCategory = typeof categories.$inferInsert;
type Category = typeof categories.$inferSelect;

export class CategoryRepository {
  async findBySlug(slug: string) {
    return await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
  }

  async findById(id: string) {
    return await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  }

  async create(data: NewCategory): Promise<Category> {
    const [row] = await db.insert(categories).values(data).returning();
    if (!row) throw new Error("Failed to create category in database");
    return row;
  }

  async update(id: string, data: Partial<NewCategory>): Promise<Category> {
    const [row] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    if (!row) throw new Error("Failed to update category in database");
    return row;
  }

  async getAll() {
    const rows = await db.select().from(categories);
    if (rows.length === 0) throw new Error("Failed to fetch categories from database");
    return rows;
  }

  async delete(id:string){
    const [row] = await db.delete(categories).where(eq(categories.id,id)).returning();
    if(!row) throw new Error("Failed to delete category from database");
    return row;
  }
}