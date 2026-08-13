import { useState, useCallback } from "react";
import { GroomingService } from "../service/grooming.service";
import { GroomingStaffResponse, GroomingStaffRequest } from "../type/groomingTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export const useGroomingStaff = () => {
    const [loading, setLoading] = useState(true);
    const [groomingStaff, setGroomingStaff] = useState<PaginationResponse<GroomingStaffResponse> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetchGroomingStaff = useCallback(async (params?: GroomingStaffRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await GroomingService.getAllGroomingStaff(params);
            setGroomingStaff(data);
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        groomingStaff,
        loading,
        fetchGroomingStaff,
        error,
    };
};
