import { UserResponse } from "@/features/users/type/usersTypes";
import { SpecialtyResponse } from "@/features/specialties/type/specialtiesTypes";

export interface VeterinarianResponse {
    id: string;
    user: UserResponse;
    licenseNumber: string;
    specialties: SpecialtyResponse[];
    hireDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface VeterinarianRequest {
    limit?: number;
    offset?: number;
    search?: string;
}

export interface VeterinarianCreateRequest {
    username: string;
    email: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar?: File | null;
    licenseNumber: string;
    specialtyIds: string[];
    hireDate: string | null;
}

export interface VeterinarianUpdateRequest {
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar: File | null;
    removeAvatar?: boolean;
    licenseNumber: string;
    specialtyIds: string[];
    hireDate: string | null;
    status: string;
}
