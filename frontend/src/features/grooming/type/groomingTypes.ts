import { UserResponse } from "@/features/users/type/usersTypes";
import { GroomingSpecialtyResponse } from "./groomingSpecialtiesTypes";

export interface GroomingStaffResponse {
    id: string;
    user: UserResponse;
    specialties: GroomingSpecialtyResponse[];
    experienceYears: number | null;
    hireDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface GroomingStaffRequest {
    limit?: number;
    offset?: number;
    search?: string;
}

export interface GroomingStaffCreateRequest {
    username: string;
    email: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar?: File | null;
    specialtyIds?: string[];
    experienceYears: number | null;
    hireDate: string | null;
}

export interface GroomingStaffUpdateRequest {
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar: File | null;
    removeAvatar?: boolean;
    specialtyIds?: string[];
    experienceYears: number | null;
    hireDate: string | null;
    status: string;
}
