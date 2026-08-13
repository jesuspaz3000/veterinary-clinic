import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";

export const SURGERY_TYPES = ["esterilizacion", "trauma", "tumor"] as const;
export type SurgeryType = (typeof SURGERY_TYPES)[number];

export const SURGERY_TYPE_LABELS: Record<SurgeryType, string> = {
    esterilizacion: "Esterilización",
    trauma: "Trauma",
    tumor: "Tumor",
};

export const SURGERY_STATUSES = ["programada", "en_proceso", "completada", "cancelada"] as const;
export type SurgeryStatus = (typeof SURGERY_STATUSES)[number];

export const SURGERY_STATUS_LABELS: Record<SurgeryStatus, string> = {
    programada: "Programada",
    en_proceso: "En proceso",
    completada: "Completada",
    cancelada: "Cancelada",
};

export interface SurgeryRecordResponse {
    id: string;
    pet: PetResponse;
    medicalRecordId: string;
    surgeryType: SurgeryType;
    surgeryDate: string;
    veterinarian: VeterinarianResponse;
    assistantVeterinarian: VeterinarianResponse | null;
    anesthesiaType: string | null;
    durationMinutes: number | null;
    preSurgeryNotes: string | null;
    surgeryNotes: string | null;
    postSurgeryNotes: string | null;
    complications: string | null;
    status: SurgeryStatus;
    createdAt: string;
    updatedAt: string | null;
}

export interface SurgeryRecordRequest {
    petId: string;
    medicalRecordId: string;
    surgeryType: string;
    surgeryDate: string;
    veterinarianId: string;
    assistantVeterinarianId?: string | null;
    anesthesiaType?: string | null;
    durationMinutes?: number | null;
    preSurgeryNotes?: string | null;
    surgeryNotes?: string | null;
    postSurgeryNotes?: string | null;
    complications?: string | null;
    status?: string;
}

export interface SurgeryRecordQueryParams {
    petId?: string;
    veterinarianId?: string;
    surgeryType?: string;
    status?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}
