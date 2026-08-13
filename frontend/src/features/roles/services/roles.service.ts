import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import { Role, RoleCreateUpdateDTO, RoleRequest } from "../types/rolesTypes";

export const RolesService = {
    getAllRoles: async (params?: RoleRequest): Promise<PaginationResponse<Role>> => {
        const response = await ApiService.get<PaginationResponse<Role>>("/roles", { params });
        return response.data;
    },
    getRoleById: async (id: string): Promise<Role> => {
        const response = await ApiService.get<Role>(`/roles/${id}`);
        return response.data;
    },
    createRole: async (request: RoleCreateUpdateDTO): Promise<Role> => {
        const response = await ApiService.post<Role>("/roles", request);
        return response.data;
    },
    updateRole: async (id: string, request: RoleCreateUpdateDTO): Promise<Role> => {
        const response = await ApiService.put<Role>(`/roles/${id}`, request);
        return response.data;
    },
    deleteRole: async (id: string): Promise<void> => {
        await ApiService.delete(`/roles/${id}`);
    }
}
