import asyncHandler from "../../utils/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse.js";
import { CategoryService } from "./category.service.js";


export class CategoryController {
  constructor(private service: CategoryService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.create(req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, "Category created successfully", category));
  });

  update = asyncHandler(
    async (
      req: Request<{ id: string }, {}, { name: string }>,
      res: Response,
    ) => {
      const id = req.params.id;
      const name  = req.body.name;
      if (!name || name.trim() === "") throw new Error("Name is required");

      const updatedCategory = await this.service.update(id, {name});
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Category updated successfully",
            updatedCategory,
          ),
        );
    },
  );

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const allCategories = await this.service.getAll();
    return res
      .status(201)
      .json(
        new ApiResponse(201, "Categories fetched successfully", allCategories),
      );
  });

  getBySlug = asyncHandler(async (req: Request<{ slug: string }>, res) => {
    const category = await this.service.getBySlug(req.params.slug);
    return res
      .status(201)
      .json(new ApiResponse(201, "Category fetched successfully", category));
  });

  delete = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const deletedCategory = await this.service.delete(id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Category deleted successfully", deletedCategory),
      );
  });
}
