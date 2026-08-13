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

export interface RoleRequest {
    limit?: number;
    offset?: number;
    search?: string;
}