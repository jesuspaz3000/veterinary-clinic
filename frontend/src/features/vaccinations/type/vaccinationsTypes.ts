import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";

export interface VaccinationRecordResponse {
    id: string;
    pet: PetResponse;
    medicalRecordId: string | null;
    productId: string;
    productName: string | null;
    veterinarian: VeterinarianResponse;
    vaccineName: string;
    vaccineBrand: string | null;
    batchNumber: string | null;
    applicationDate: string;
    nextDoseDate: string | null;
    observations: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface VaccinationRecordRequest {
    petId: string;
    medicalRecordId?: string | null;
    productId: string;
    veterinarianId: string;
    batchNumber?: string | null;
    applicationDate: string;
    nextDoseDate?: string | null;
    observations?: string | null;
}

export interface VaccinationRecordQueryParams {
    petId?: string;
    veterinarianId?: string;
    applicationFrom?: string;
    applicationTo?: string;
    nextDoseFrom?: string;
    nextDoseTo?: string;
    limit?: number;
    offset?: number;
}
