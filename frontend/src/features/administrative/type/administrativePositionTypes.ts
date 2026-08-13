export interface AdministrativePositionResponse {
    id: string;
    name: string;
    description: string | null;
    assignedCount: number;
    assignedStaffNames: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AdministrativePositionCreateRequest {
    name: string;
    description?: string | null;
}

export interface AdministrativePositionUpdateRequest {
    name: string;
    description?: string | null;
}
