import { ApiService } from "@/shared/services/api.service";
import { BrandResponse, CreateBrandRequest } from "../types/productTypes";

export const BrandsService = {
  getAllBrands: async (): Promise<BrandResponse[]> => {
    const response = await ApiService.get<BrandResponse[]>("/brands");
    return response.data;
  },

  getBrandById: async (id: string): Promise<BrandResponse> => {
    const response = await ApiService.get<BrandResponse>(`/brands/${id}`);
    return response.data;
  },

  createBrand: async (dto: CreateBrandRequest): Promise<BrandResponse> => {
    const response = await ApiService.post<BrandResponse>("/brands", dto);
    return response.data;
  },

  updateBrand: async (id: string, dto: CreateBrandRequest): Promise<BrandResponse> => {
    const response = await ApiService.put<BrandResponse>(`/brands/${id}`, dto);
    return response.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await ApiService.delete(`/brands/${id}`);
  },
};
