import { useState, useCallback } from "react";
import { MedicalRecordsService } from "../service/medicalRecords.service";
import { MedicalRecordQueryParams, MedicalRecordResponse } from "../type/medicalRecordsTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useMedicalRecords() {
    const [records, setRecords] = useState<PaginationResponse<MedicalRecordResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecords = useCallback(async (params?: MedicalRecordQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await MedicalRecordsService.getMedicalRecords(params);
            setRecords(data);
        } catch (err: unknown) {
            console.error("Error fetching medical records:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { records, loading, error, fetchRecords };
}
