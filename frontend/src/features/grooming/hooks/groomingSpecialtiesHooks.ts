import { useState, useCallback } from "react";
import { GroomingSpecialtiesService } from "../service/groomingSpecialties.service";
import { GroomingSpecialtyResponse } from "../type/groomingSpecialtiesTypes";

export const useGroomingSpecialties = () => {
  const [specialties, setSpecialties] = useState<GroomingSpecialtyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GroomingSpecialtiesService.getAllSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error("Error fetching grooming specialties:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    specialties,
    loading,
    error,
    fetchSpecialties,
  };
};
