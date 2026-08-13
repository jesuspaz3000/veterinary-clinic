import { useState, useCallback } from "react";
import { OwnerService } from "../service/owners.service";
import { OwnerResponse, OwnerRequest } from "../type/ownersTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useOwners() {
    const [owners, setOwners] = useState<PaginationResponse<OwnerResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchOwners = useCallback(async (params?: OwnerRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await OwnerService.getAllOwnersPaginated(params);
            setOwners(data);
        } catch (err: unknown) {
            console.error("Error fetching owners:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        owners,
        loading,
        error,
        fetchOwners,
    };
}
