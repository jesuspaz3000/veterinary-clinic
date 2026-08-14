import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
  ProductResponse,
  ProductFilterRequest,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/productTypes";

function buildProductFormData(request: CreateProductRequest | UpdateProductRequest): FormData {
  const formData = new FormData();
  formData.append("categoryId", request.categoryId);
  if (request.brandId) formData.append("brandId", request.brandId);
  formData.append("name", request.name);
  if (request.activeIngredient) formData.append("activeIngredient", request.activeIngredient);
  if (request.targetSpecies) formData.append("targetSpecies", request.targetSpecies);
  if (request.description) formData.append("description", request.description);
  formData.append("requiresPrescription", String(Boolean(request.requiresPrescription)));
  formData.append("allowsFractioning", String(Boolean(request.allowsFractioning)));

  if (request.image) {
    formData.append("image", request.image);
  }

  const updateReq = request as UpdateProductRequest;
  if (updateReq.removeImage) {
    formData.append("removeImage", "true");
  }

  // Append variants as indexed form data or JSON
  if (request.variants && request.variants.length > 0) {
    request.variants.forEach((v, index) => {
      if (v.sku) formData.append(`variants[${index}].sku`, v.sku);
      if (v.barcode) formData.append(`variants[${index}].barcode`, v.barcode);
      formData.append(`variants[${index}].name`, v.name);
      formData.append(`variants[${index}].salePrice`, String(v.salePrice));
      formData.append(`variants[${index}].costPrice`, String(v.costPrice));
      formData.append(`variants[${index}].stock`, String(v.stock));
      if (v.minStock !== undefined) formData.append(`variants[${index}].minStock`, String(v.minStock));
      formData.append(`variants[${index}].unitMeasure`, v.unitMeasure);
      formData.append(`variants[${index}].administrationRoute`, v.administrationRoute);
      if (v.weightOrVolume !== undefined && v.weightOrVolume !== null) {
        formData.append(`variants[${index}].weightOrVolume`, String(v.weightOrVolume));
      }

      if (v.lots && v.lots.length > 0) {
        v.lots.forEach((lot, lotIndex) => {
          formData.append(`variants[${index}].lots[${lotIndex}].lotNumber`, lot.lotNumber);
          formData.append(`variants[${index}].lots[${lotIndex}].expirationDate`, lot.expirationDate);
          formData.append(`variants[${index}].lots[${lotIndex}].quantity`, String(lot.quantity));
          if (lot.costPrice) formData.append(`variants[${index}].lots[${lotIndex}].costPrice`, String(lot.costPrice));
        });
      }
    });
  }

  return formData;
}

export const ProductsService = {
  getAllProducts: async (params?: ProductFilterRequest): Promise<PaginationResponse<ProductResponse>> => {
    const response = await ApiService.get<PaginationResponse<ProductResponse>>("/products", { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await ApiService.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (dto: CreateProductRequest): Promise<ProductResponse> => {
    const formData = buildProductFormData(dto);
    const response = await ApiService.post<ProductResponse>("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProduct: async (id: string, dto: UpdateProductRequest): Promise<ProductResponse> => {
    const formData = buildProductFormData(dto);
    const response = await ApiService.put<ProductResponse>(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await ApiService.delete(`/products/${id}`);
  },
};
