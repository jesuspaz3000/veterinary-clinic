import { useState, useCallback } from "react";
import { HospitalizationsService } from "../service/hospitalizations.service";
import { HospitalizationQueryParams, HospitalizationRecordResponse } from "../type/hospitalizationsTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useHospitalizations() {
    const [records, setRecords] = useState<PaginationResponse<HospitalizationRecordResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecords = useCallback(async (params?: HospitalizationQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await HospitalizationsService.getHospitalizations(params);
            setRecords(data);
        } catch (err: unknown) {
            console.error("Error fetching hospitalization records:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { records, loading, error, fetchRecords };
}
