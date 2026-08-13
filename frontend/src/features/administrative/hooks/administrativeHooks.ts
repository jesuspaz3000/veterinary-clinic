import { useState, useCallback } from "react";
import { AdministrativeService } from "../service/administrative.service";
import { AdministrativeStaffResponse, AdministrativeStaffRequest } from "../type/administrativeTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export const useAdministrativeStaff = () => {
  const [loading, setLoading] = useState(true);
  const [administrativeStaff, setAdministrativeStaff] = useState<PaginationResponse<AdministrativeStaffResponse> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchAdministrativeStaff = useCallback(async (params?: AdministrativeStaffRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdministrativeService.getAllAdministrativeStaff(params);
      setAdministrativeStaff(data);
    } catch (err) {
      console.error(err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    administrativeStaff,
    loading,
    fetchAdministrativeStaff,
    error,
  };
};
