import { useState, useCallback } from "react";
import { PetService } from "../service/pets.service";
import { PetResponse, PetRequest } from "../type/petsTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function usePets() {
    const [pets, setPets] = useState<PaginationResponse<PetResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPets = useCallback(async (params?: PetRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await PetService.getAllPetsPaginated(params);
            setPets(data);
        } catch (err: unknown) {
            console.error("Error fetching pets:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        pets,
        loading,
        error,
        fetchPets,
    };
}
