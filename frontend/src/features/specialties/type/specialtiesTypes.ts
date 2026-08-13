export interface SpecialtyResponse {
    id: string;
    name: string;
    description: string | null;
    veterinariansCount: number;
    assignedVeterinarians: string[];
    createdAt: string;
    updatedAt: string;
}

export interface SpecialtyCreateRequest {
    name: string;
    description?: string | null;
}

export interface SpecialtyUpdateRequest {
    name: string;
    description?: string | null;
}
