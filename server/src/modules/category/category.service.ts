import slugify from "slugify";
import { CategoryRepository } from "./category.repository.js";
import { ApiError } from "../../utils/apiError.js";

export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  // create category
  async create(data: { name: string; parentId?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const exists = await this.repository.findBySlug(slug);
    if (exists) {
      throw new ApiError(400, "Category already exists");
    }
    return await this.repository.create({
      name: data.name,
      slug,
      parentId: data.parentId,
    });
  }

  async update(id: string, data: { name: string }) {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new ApiError(404, "Category not found");
    }
    const slug = slugify(data.name, { lower: true, strict: true });
    const updatedCategory = await this.repository.update(id, {
      name: data.name,
      slug,
    });
    return updatedCategory;
  }

  async getAll() {
    const categories = await this.repository.getAll();
    if (categories.length === 0) {
      throw new ApiError(404, "No categories found");
    }
    return categories;
  }

  async getBySlug(slug: string) {
    const category = await this.repository.findBySlug(slug);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return category;
  }

  async delete(id: string) {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new ApiError(404, "Category not found");
    }
    const deletedCategory = await this.repository.delete(id);
    return deletedCategory;
  }
}
