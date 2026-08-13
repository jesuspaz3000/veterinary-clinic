import { useState, useCallback } from "react";
import { DewormingService } from "../service/deworming.service";
import { DewormingRecordQueryParams, DewormingRecordResponse } from "../type/dewormingTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useDeworming() {
    const [records, setRecords] = useState<PaginationResponse<DewormingRecordResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecords = useCallback(async (params?: DewormingRecordQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await DewormingService.getDewormingRecords(params);
            setRecords(data);
        } catch (err: unknown) {
            console.error("Error fetching deworming records:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { records, loading, error, fetchRecords };
}
