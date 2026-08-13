import { useState, useCallback } from "react";
import { VaccinationsService } from "../service/vaccinations.service";
import { VaccinationRecordQueryParams, VaccinationRecordResponse } from "../type/vaccinationsTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useVaccinations() {
    const [records, setRecords] = useState<PaginationResponse<VaccinationRecordResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecords = useCallback(async (params?: VaccinationRecordQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await VaccinationsService.getVaccinationRecords(params);
            setRecords(data);
        } catch (err: unknown) {
            console.error("Error fetching vaccination records:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { records, loading, error, fetchRecords };
}
