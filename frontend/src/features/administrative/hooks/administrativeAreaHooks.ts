import { useState, useCallback } from "react";
import { AdministrativeAreasService } from "../service/administrativeArea.service";
import { AdministrativeAreaResponse } from "../type/administrativeAreaTypes";

export function useAdministrativeAreas() {
    const [areas, setAreas] = useState<AdministrativeAreaResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAreas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdministrativeAreasService.getAllAreas();
            setAreas(data || []);
        } catch (err: unknown) {
            console.error("Error fetching administrative areas:", err);
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || errorObj.message || "Error al cargar el catálogo de áreas.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        areas,
        loading,
        error,
        fetchAreas,
    };
}
