import { useState, useCallback } from "react";
import { RolesService } from "../services/roles.service";
import { Role, RoleRequest } from "../types/rolesTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export const useRoles = () => {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<PaginationResponse<Role> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetchRoles = useCallback(async (params?: RoleRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await RolesService.getAllRoles(params);
            setRoles(data);
        } catch (error) {
            console.error(error);
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        roles,
        loading,
        fetchRoles,
        error
    }
}