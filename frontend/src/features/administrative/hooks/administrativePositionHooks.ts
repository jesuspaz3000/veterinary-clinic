import { useState, useCallback } from "react";
import { AdministrativePositionsService } from "../service/administrativePosition.service";
import { AdministrativePositionResponse } from "../type/administrativePositionTypes";

export function useAdministrativePositions() {
    const [positions, setPositions] = useState<AdministrativePositionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPositions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdministrativePositionsService.getAllPositions();
            setPositions(data || []);
        } catch (err: unknown) {
            console.error("Error fetching administrative positions:", err);
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || errorObj.message || "Error al cargar el catálogo de cargos.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        positions,
        loading,
        error,
        fetchPositions,
    };
}
