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
    productVariantId: string | null;
    productVariantName: string | null;
    veterinarian: VeterinarianResponse;
    dosage: string;
    applicationDate: string;
    nextApplicationDate: string | null;
    dewormingType: DewormingType;
    observations: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface DewormingRecordRequest {
    petId: string;
    medicalRecordId?: string | null;
    productId: string;
    /** Solo se admite (y se exige) al crear; una vez aplicada, la presentación queda fija. */
    productVariantId?: string;
    veterinarianId: string;
    dosage: string;
    applicationDate: string;
    nextApplicationDate?: string | null;
    dewormingType: string;
    observations?: string | null;
}

export const DEWORMING_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface DewormingRecordQueryParams {
    petId?: string;
    veterinarianId?: string;
    dewormingType?: string;
    applicationFrom?: string;
    applicationTo?: string;
    nextApplicationFrom?: string;
    nextApplicationTo?: string;
    status?: string;
    limit?: number;
    offset?: number;
}
