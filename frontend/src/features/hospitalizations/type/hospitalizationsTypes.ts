import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";

export const HOSPITALIZATION_STATUSES = ["activo", "alta", "transferido"] as const;
export type HospitalizationStatus = (typeof HOSPITALIZATION_STATUSES)[number];

export const HOSPITALIZATION_STATUS_LABELS: Record<HospitalizationStatus, string> = {
    activo: "Activo",
    alta: "Alta",
    transferido: "Transferido",
};

export const INTAKE_OPTIONS = ["bueno", "regular", "malo", "no_comio"] as const;
export type IntakeOption = (typeof INTAKE_OPTIONS)[number];
export const INTAKE_LABELS: Record<IntakeOption, string> = {
    bueno: "Bueno",
    regular: "Regular",
    malo: "Malo",
    no_comio: "No comió / bebió",
};

export const URINATION_OPTIONS = ["normal", "aumentada", "disminuida", "ausente"] as const;
export type UrinationOption = (typeof URINATION_OPTIONS)[number];
export const URINATION_LABELS: Record<UrinationOption, string> = {
    normal: "Normal",
    aumentada: "Aumentada",
    disminuida: "Disminuida",
    ausente: "Ausente",
};

export const DEFECATION_OPTIONS = ["normal", "diarrea", "estreñimiento", "ausente"] as const;
export type DefecationOption = (typeof DEFECATION_OPTIONS)[number];
export const DEFECATION_LABELS: Record<DefecationOption, string> = {
    normal: "Normal",
    diarrea: "Diarrea",
    estreñimiento: "Estreñimiento",
    ausente: "Ausente",
};

export const ACTIVITY_LEVEL_OPTIONS = ["activo", "letargico", "postrado"] as const;
export type ActivityLevelOption = (typeof ACTIVITY_LEVEL_OPTIONS)[number];
export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevelOption, string> = {
    activo: "Activo",
    letargico: "Letárgico",
    postrado: "Postrado",
};

export interface HospitalizationEvolutionResponse {
    id: string;
    evolutionDate: string;
    veterinarian: VeterinarianResponse;
    weight: number | null;
    temperature: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    foodIntake: string | null;
    waterIntake: string | null;
    urination: string | null;
    defecation: string | null;
    activityLevel: string | null;
    medicationAdministered: string | null;
    proceduresPerformed: string | null;
    observations: string | null;
    createdAt: string;
}

export interface HospitalizationEvolutionRequest {
    evolutionDate: string;
    veterinarianId: string;
    weight?: number | null;
    temperature?: number | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
    foodIntake?: string | null;
    waterIntake?: string | null;
    urination?: string | null;
    defecation?: string | null;
    activityLevel?: string | null;
    medicationAdministered?: string | null;
    proceduresPerformed?: string | null;
    observations?: string | null;
}

export interface HospitalizationRecordResponse {
    id: string;
    pet: PetResponse;
    medicalRecordId: string;
    admissionDate: string;
    dischargeDate: string | null;
    reason: string;
    cageNumber: string | null;
    veterinarian: VeterinarianResponse;
    status: HospitalizationStatus;
    finalDiagnosis: string | null;
    dischargeNotes: string | null;
    evolutions: HospitalizationEvolutionResponse[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateHospitalizationRecordRequest {
    petId: string;
    medicalRecordId: string;
    admissionDate: string;
    reason: string;
    cageNumber?: string | null;
    veterinarianId: string;
}

export interface UpdateHospitalizationRecordRequest {
    petId: string;
    medicalRecordId: string;
    admissionDate: string;
    dischargeDate?: string | null;
    reason: string;
    cageNumber?: string | null;
    veterinarianId: string;
    status: string;
    finalDiagnosis?: string | null;
    dischargeNotes?: string | null;
}

export const HOSPITALIZATION_ACTIVE_STATUS_FILTERS = [
    { value: "activo", label: "Activos" },
    { value: "inactivo", label: "Inactivos" },
    { value: "todos", label: "Todos" },
] as const;

export interface HospitalizationQueryParams {
    petId?: string;
    status?: string;
    from?: string;
    to?: string;
    activeStatus?: string;
    limit?: number;
    offset?: number;
}
