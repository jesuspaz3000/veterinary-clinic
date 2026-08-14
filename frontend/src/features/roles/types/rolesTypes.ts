export interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
    action: string;
    labelEs: string;
    descriptionEs: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    permissionsCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoleCreateUpdateDTO {
    name: string;
    description: string;
    permissionIds: string[];
}

export const ROLE_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface RoleRequest {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
}