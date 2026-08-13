import { ApiService } from "@/shared/services/api.service";
import { CategoryResponse, CreateCategoryRequest } from "../types/productTypes";

export const CategoriesService = {
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    const response = await ApiService.get<CategoryResponse[]>("/categories");
    return response.data;
  },

  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await ApiService.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (dto: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await ApiService.post<CategoryResponse>("/categories", dto);
    return response.data;
  },

  updateCategory: async (id: string, dto: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await ApiService.put<CategoryResponse>(`/categories/${id}`, dto);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await ApiService.delete(`/categories/${id}`);
  },
};
