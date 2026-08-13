import { useState, useCallback } from "react";
import { ProductsService } from "../service/products.service";
import { ProductResponse, ProductFilterRequest } from "../types/productTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PaginationResponse<ProductResponse> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async (params?: ProductFilterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductsService.getAllProducts(params);
      setProducts(data);
    } catch (err) {
      console.error("Error loading products list:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    error,
  };
}
