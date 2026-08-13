import { useState, useCallback } from "react";
import { VeterinariansService } from "../service/veterinarians.service";
import { VeterinarianResponse, VeterinarianRequest } from "../type/veterinariansTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export const useVeterinarians = () => {
    const [loading, setLoading] = useState(true);
    const [veterinarians, setVeterinarians] = useState<PaginationResponse<VeterinarianResponse> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetchVeterinarians = useCallback(async (params?: VeterinarianRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await VeterinariansService.getAllVeterinarians(params);
            setVeterinarians(data);
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        veterinarians,
        loading,
        fetchVeterinarians,
        error,
    };
};
