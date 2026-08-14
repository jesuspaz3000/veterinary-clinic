import { UserResponse } from "@/features/users/type/usersTypes";
import { AdministrativePositionResponse } from "./administrativePositionTypes";
import { AdministrativeAreaResponse } from "./administrativeAreaTypes";

export interface AdministrativeStaffResponse {
    id: string;
    user: UserResponse;
    positions: AdministrativePositionResponse[];
    assignedArea: AdministrativeAreaResponse | null;
    createdAt: string;
    updatedAt: string;
}

export const ADMINISTRATIVE_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface AdministrativeStaffRequest {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
}

export interface AdministrativeStaffCreateRequest {
    username: string;
    email: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar?: File | null;
    positionIds?: string[];
    areaId?: string | null;
}

export interface AdministrativeStaffUpdateRequest {
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar: File | null;
    removeAvatar?: boolean;
    positionIds?: string[];
    areaId?: string | null;
}
