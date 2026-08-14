
export interface UserResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    permissions: string[];
    permissionsCount: number;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const USER_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface UserRequest {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
}

export interface UserCreateRequest {
    username: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    password: string;
    phone: string | null;
    roleId: string;
    avatar?: File | null;
}

export interface UserUpdateRequest {
    username: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    roleId: string;
    avatar: File | null;
    removeAvatar?: boolean;
}

export interface UserResetPassword {
    newPassword: string;
}