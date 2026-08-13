import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";

export const DEWORMING_TYPES = ["interna", "externa", "ambas"] as const;
export type DewormingType = (typeof DEWORMING_TYPES)[number];

export const DEWORMING_TYPE_LABELS: Record<DewormingType, string> = {
    interna: "Interna",
    externa: "Externa",
    ambas: "Interna y externa",
};

export interface DewormingRecordResponse {
    id: string;
    pet: PetResponse;
    medicalRecordId: string | null;
    productId: string;
    productName: string;
    productBrand: string | null;
    veterinarian: VeterinarianResponse;
    dosage: string;
    applicationDate: string;
    nextApplicationDate: string | null;
    dewormingType: DewormingType;
    observations: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface DewormingRecordRequest {
    petId: string;
    medicalRecordId?: string | null;
    productId: string;
    veterinarianId: string;
    dosage: string;
    applicationDate: string;
    nextApplicationDate?: string | null;
    dewormingType: string;
    observations?: string | null;
}

export interface DewormingRecordQueryParams {
    petId?: string;
    veterinarianId?: string;
    dewormingType?: string;
    applicationFrom?: string;
    applicationTo?: string;
    nextApplicationFrom?: string;
    nextApplicationTo?: string;
    limit?: number;
    offset?: number;
}
