import { useEffect, useState, useCallback } from "react";
import { CategoriesService } from "../service/categories.service";
import { CategoryResponse } from "../types/productTypes";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoriesService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Error loading categories list:", err);
      setError("Error al cargar las categorías.");
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
        const data = await CategoriesService.getAllCategories();
        if (isMounted) {
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Error loading categories list:", err);
        if (isMounted) {
          setError("Error al cargar las categorías.");
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
    categories,
    loading,
    error,
    reload: fetchCategories,
  };
}
