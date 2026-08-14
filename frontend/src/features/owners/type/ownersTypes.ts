export interface OwnerResponse {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    documentType: string | null;
    documentNumber: string | null;
    phone: string;
    email: string | null;
    address: string | null;
    isActive: boolean;
    petsCount: number;
    createdAt: string;
    updatedAt: string;
}

export const OWNER_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface OwnerRequest {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
}

export interface OwnerCreateRequest {
    firstName: string;
    lastName: string;
    documentType?: string | null;
    documentNumber?: string | null;
    phone: string;
    email?: string | null;
    address?: string | null;
}

export interface OwnerUpdateRequest {
    firstName: string;
    lastName: string;
    documentType?: string | null;
    documentNumber?: string | null;
    phone: string;
    email?: string | null;
    address?: string | null;
}
