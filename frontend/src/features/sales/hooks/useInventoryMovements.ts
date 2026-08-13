import { useEffect, useState, useCallback } from "react";
import { InventoryMovementsService } from "../service/inventoryMovements.service";
import { InventoryMovementResponse, InventoryMovementFilters } from "../types/salesTypes";

export function useInventoryMovements(initialFilters?: InventoryMovementFilters) {
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryMovementFilters>(initialFilters || { limit: 10, offset: 0 });

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await InventoryMovementsService.getMovements(filters);
      setMovements(response?.results || []);
      setTotalCount(response?.count || 0);
    } catch (err: unknown) {
      console.error("Error loading inventory movements:", err);
      setError("Error al cargar los movimientos del Kardex de inventario.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await InventoryMovementsService.getMovements(filters);
        if (isMounted) {
          setMovements(response?.results || []);
          setTotalCount(response?.count || 0);
        }
      } catch (err: unknown) {
        console.error("Error loading inventory movements:", err);
        if (isMounted) {
          setError("Error al cargar los movimientos del Kardex de inventario.");
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
  }, [filters]);

  return {
    movements,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    reload: fetchMovements,
  };
}
