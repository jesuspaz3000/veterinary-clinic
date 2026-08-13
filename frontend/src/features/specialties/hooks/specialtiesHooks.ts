import { useState, useCallback } from "react";
import { SpecialtiesService } from "../service/specialties.service";
import { SpecialtyResponse } from "../type/specialtiesTypes";

export const useSpecialties = () => {
    const [loading, setLoading] = useState(true);
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [error, setError] = useState<Error | null>(null);

    const fetchSpecialties = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await SpecialtiesService.getAllSpecialties();
            setSpecialties(data || []);
        } catch (err) {
            console.error(err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        specialties,
        loading,
        fetchSpecialties,
        error,
    };
};
