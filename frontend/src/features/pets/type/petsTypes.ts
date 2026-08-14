import { OwnerResponse } from "@/features/owners/type/ownersTypes";

export interface PetPhotoResponse {
    id: string;
    photoUrl: string;
    description: string | null;
    uploadedAt: string;
}

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
    photos: PetPhotoResponse[];
    createdAt: string;
    updatedAt: string;
}

export type ClinicalHistoryEntryType =
    | "appointment"
    | "medical_record"
    | "vaccination"
    | "deworming"
    | "surgery"
    | "hospitalization";

export interface ClinicalHistoryEntry {
    type: ClinicalHistoryEntryType;
    id: string;
    date: string;
    title: string;
    subtitle: string | null;
    status: string | null;
    description: string | null;
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
