import { useState, useCallback } from "react";
import { SurgeriesService } from "../service/surgeries.service";
import { SurgeryRecordQueryParams, SurgeryRecordResponse } from "../type/surgeriesTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useSurgeries() {
    const [records, setRecords] = useState<PaginationResponse<SurgeryRecordResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecords = useCallback(async (params?: SurgeryRecordQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await SurgeriesService.getSurgeryRecords(params);
            setRecords(data);
        } catch (err: unknown) {
            console.error("Error fetching surgery records:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { records, loading, error, fetchRecords };
}
