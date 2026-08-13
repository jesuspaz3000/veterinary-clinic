export interface AdministrativeAreaResponse {
    id: string;
    name: string;
    description: string | null;
    assignedCount: number;
    assignedStaffNames: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AdministrativeAreaCreateRequest {
    name: string;
    description?: string | null;
}

export interface AdministrativeAreaUpdateRequest {
    name: string;
    description?: string | null;
}
