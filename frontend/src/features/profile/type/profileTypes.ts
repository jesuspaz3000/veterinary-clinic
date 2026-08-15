export interface MyProfileResponse {
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

export interface UpdateMyProfileRequest {
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar?: File | null;
    removeAvatar?: boolean;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
