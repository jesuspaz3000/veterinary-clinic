import { useEffect, useState, useCallback } from "react";
import { CreditNotesService } from "../service/creditNotes.service";
import { CreditNoteResponse } from "../types/salesTypes";

export function useCreditNotes(limit = 10, offset = 0) {
  const [creditNotes, setCreditNotes] = useState<CreditNoteResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CreditNotesService.getCreditNotes(limit, offset);
      setCreditNotes(response?.results || []);
      setTotalCount(response?.count || 0);
    } catch (err: unknown) {
      console.error("Error loading credit notes:", err);
      setError("Error al cargar las notas de crédito.");
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await CreditNotesService.getCreditNotes(limit, offset);
        if (isMounted) {
          setCreditNotes(response?.results || []);
          setTotalCount(response?.count || 0);
        }
      } catch (err: unknown) {
        console.error("Error loading credit notes:", err);
        if (isMounted) {
          setError("Error al cargar las notas de crédito.");
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
  }, [limit, offset]);

  return {
    creditNotes,
    totalCount,
    loading,
    error,
    reload: fetchCreditNotes,
  };
}
