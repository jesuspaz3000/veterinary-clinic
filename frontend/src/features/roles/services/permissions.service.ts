import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import { Permission, RoleRequest } from "../types/rolesTypes";

export const PermissionsService = {
    getAllPermissions: async (params?: RoleRequest): Promise<PaginationResponse<Permission>> => {
        const response = await ApiService.get<PaginationResponse<Permission>>("/permissions", { params });
        return response.data;
    },
}