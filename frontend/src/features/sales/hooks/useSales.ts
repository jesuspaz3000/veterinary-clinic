import { useEffect, useState, useCallback } from "react";
import { SalesService } from "../service/sales.service";
import { InvoiceResponse, InvoiceFilters } from "../types/salesTypes";

export function useSales(initialFilters?: InvoiceFilters) {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>(initialFilters || { limit: 10, offset: 0 });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SalesService.getInvoices(filters);
      setInvoices(response?.results || []);
      setTotalCount(response?.count || 0);
    } catch (err: unknown) {
      console.error("Error loading invoices:", err);
      setError("Error al cargar la lista de ventas y comprobantes.");
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
        const response = await SalesService.getInvoices(filters);
        if (isMounted) {
          setInvoices(response?.results || []);
          setTotalCount(response?.count || 0);
        }
      } catch (err: unknown) {
        console.error("Error loading invoices:", err);
        if (isMounted) {
          setError("Error al cargar la lista de ventas y comprobantes.");
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
    invoices,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    reload: fetchInvoices,
  };
}
