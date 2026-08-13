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

export interface OwnerRequest {
    limit?: number;
    offset?: number;
    search?: string;
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
