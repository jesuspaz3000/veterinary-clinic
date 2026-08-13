import { useEffect, useState, useCallback } from "react";
import { BrandsService } from "../service/brands.service";
import { BrandResponse } from "../types/productTypes";

export function useBrands() {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BrandsService.getAllBrands();
      setBrands(data || []);
    } catch (err) {
      console.error("Error loading brands list:", err);
      setError("Error al cargar las marcas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await BrandsService.getAllBrands();
        if (isMounted) {
          setBrands(data || []);
        }
      } catch (err) {
        console.error("Error loading brands list:", err);
        if (isMounted) {
          setError("Error al cargar las marcas.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    brands,
    loading,
    error,
    reload: fetchBrands,
  };
}
