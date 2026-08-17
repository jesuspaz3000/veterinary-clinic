export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
}

export interface BrandResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateBrandRequest {
  name: string;
  description?: string | null;
}

export interface InventoryLotResponse {
  id: string;
  variantId: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  costPrice: number | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateInventoryLotRequest {
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  costPrice?: number | null;
}

export const ADMINISTRATION_ROUTES = [
  { value: "oral", label: "Oral" },
  { value: "inyectable", label: "Inyectable" },
  { value: "topico", label: "Tópico" },
  { value: "otro", label: "Otro" },
] as const;

export interface ProductVariantResponse {
  id: string;
  productId: string;
  sku: string | null;
  barcode: string | null;
  name: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unitMeasure: string;
  administrationRoute: string;
  weightOrVolume: number | null;
  isActive: boolean;
  lots: InventoryLotResponse[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductVariantRequest {
  id?: string;
  sku?: string | null;
  barcode?: string | null;
  name: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  minStock?: number;
  unitMeasure: string;
  administrationRoute: string;
  weightOrVolume?: number | null;
  lots?: CreateInventoryLotRequest[];
}

export interface ProductResponse {
  id: string;
  category: CategoryResponse;
  brand: BrandResponse | null;
  name: string;
  activeIngredient: string | null;
  targetSpecies: string | null;
  description: string | null;
  requiresPrescription: boolean;
  allowsFractioning: boolean;
  imageUrl: string | null;
  isActive: boolean;
  variants: ProductVariantResponse[];
  totalStock: number;
  createdAt: string;
  updatedAt: string | null;
}

export const PRODUCT_STATUS_FILTERS = [
  { value: "activo", label: "Activos" },
  { value: "inactivo", label: "Inactivos" },
  { value: "todos", label: "Todos" },
] as const;

export interface ProductFilterRequest {
  limit?: number;
  offset?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  targetSpecies?: string;
  requiresPrescription?: boolean;
  isLowStock?: boolean;
  status?: string;
}

export interface CreateProductRequest {
  categoryId: string;
  brandId?: string | null;
  name: string;
  activeIngredient?: string | null;
  targetSpecies?: string | null;
  description?: string | null;
  requiresPrescription?: boolean;
  allowsFractioning?: boolean;
  image?: File | null;
  variants: CreateProductVariantRequest[];
}

export interface UpdateProductRequest extends CreateProductRequest {
  removeImage?: boolean;
}
