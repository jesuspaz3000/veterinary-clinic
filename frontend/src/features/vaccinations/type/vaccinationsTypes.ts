import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";

export interface VaccinationRecordResponse {
    id: string;
    pet: PetResponse;
    medicalRecordId: string | null;
    productId: string;
    productName: string | null;
    productVariantId: string | null;
    productVariantName: string | null;
    veterinarian: VeterinarianResponse;
    vaccineName: string;
    vaccineBrand: string | null;
    batchNumber: string | null;
    applicationDate: string;
    nextDoseDate: string | null;
    observations: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface VaccinationRecordRequest {
    petId: string;
    medicalRecordId?: string | null;
    productId: string;
    /** Solo se admite (y se exige) al crear; una vez aplicada la vacuna, la presentación queda fija. */
    productVariantId?: string;
    veterinarianId: string;
    batchNumber?: string | null;
    applicationDate: string;
    nextDoseDate?: string | null;
    observations?: string | null;
}

export const VACCINATION_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface VaccinationRecordQueryParams {
    petId?: string;
    veterinarianId?: string;
    applicationFrom?: string;
    applicationTo?: string;
    nextDoseFrom?: string;
    nextDoseTo?: string;
    status?: string;
    limit?: number;
    offset?: number;
}
