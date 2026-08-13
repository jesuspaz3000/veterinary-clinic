export interface AuthLogin {
    email: string;
    password: string;
}

export interface AuthResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    direction: string;
    permissions: string[];
    permissionsCount: number;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LogoutRequest {
    refreshToken: string;
    accessToken: string;
}