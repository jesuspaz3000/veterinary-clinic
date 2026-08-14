import { OwnerResponse } from "@/features/owners/type/ownersTypes";

export interface PetResponse {
    id: string;
    owner: OwnerResponse;
    name: string;
    species: string;
    breed: string | null;
    color: string | null;
    sex: string;
    birthDate: string | null;
    age: string;
    weight: number | null;
    microchipNumber: string | null;
    sterilized: boolean;
    photoUrl: string | null;
    status: string;
    specialNotes: string | null;
    createdAt: string;
    updatedAt: string;
}

export const PET_STATUS_FILTERS = [
    { value: "activo", label: "Activas" },
    { value: "inactivo", label: "Inactivas" },
    { value: "todos", label: "Todas" },
] as const;

export interface PetRequest {
    limit?: number;
    offset?: number;
    search?: string;
    ownerId?: string;
    status?: string;
}

export interface PetCreateRequest {
    ownerId: string;
    name: string;
    species: string;
    breed?: string | null;
    color?: string | null;
    sex: string;
    birthDate?: string | null;
    weight?: number | null;
    microchipNumber?: string | null;
    sterilized?: boolean;
    photo?: File | null;
    status?: string | null;
    specialNotes?: string | null;
}

export interface PetUpdateRequest {
    ownerId: string;
    name: string;
    species: string;
    breed?: string | null;
    color?: string | null;
    sex: string;
    birthDate?: string | null;
    weight?: number | null;
    microchipNumber?: string | null;
    sterilized?: boolean;
    photo?: File | null;
    removePhoto?: boolean;
    status?: string | null;
    specialNotes?: string | null;
}
