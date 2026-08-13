import { useState, useCallback } from "react";
import { PermissionsService } from "../services/permissions.service";
import { Permission, RoleRequest } from "../types/rolesTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export const usePermissions = () => {
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState<PaginationResponse<Permission> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetchPermissions = useCallback(async (params?: RoleRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await PermissionsService.getAllPermissions(params);
            setPermissions(data);
        } catch (error) {
            console.error(error);
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        permissions,
        loading,
        fetchPermissions,
        error
    }
}