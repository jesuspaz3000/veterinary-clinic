
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

export interface UserRequest {
    limit?: number;
    offset?: number;
    search?: string;
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