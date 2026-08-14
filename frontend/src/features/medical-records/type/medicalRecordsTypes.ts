import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";

export const RECORD_TYPES = [
    "consulta",
    "cirugia",
    "vacunacion",
    "desparasitacion",
    "emergencia",
    "hospitalizacion",
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
    consulta: "Consulta",
    cirugia: "Cirugía",
    vacunacion: "Vacunación",
    desparasitacion: "Desparasitación",
    emergencia: "Emergencia",
    hospitalizacion: "Hospitalización",
};

export const RECORD_STATUSES = ["completado", "pendiente_seguimiento"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
    completado: "Completado",
    pendiente_seguimiento: "Pendiente de seguimiento",
};

export const DOCUMENT_TYPES = [
    "radiografia",
    "examen_sangre",
    "ecografia",
    "receta",
    "otro",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    radiografia: "Radiografía",
    examen_sangre: "Examen de sangre",
    ecografia: "Ecografía",
    receta: "Receta",
    otro: "Otro",
};

export interface PrescriptionResponse {
    id: string;
    productId: string;
    productName: string | null;
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string | null;
    createdAt: string;
}

export interface MedicalDocumentResponse {
    id: string;
    documentType: string;
    documentUrl: string;
    fileName: string;
    description: string | null;
    uploadedAt: string;
}

export interface MedicalRecordResponse {
    id: string;
    pet: PetResponse;
    veterinarian: VeterinarianResponse;
    appointmentId: string | null;
    recordType: RecordType;
    recordDate: string;
    reason: string | null;
    symptoms: string | null;
    diagnosis: string | null;
    treatment: string | null;
    observations: string | null;
    weight: number | null;
    temperature: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    followUpDate: string | null;
    status: RecordStatus;
    prescriptions: PrescriptionResponse[];
    documents: MedicalDocumentResponse[];
    createdAt: string;
    updatedAt: string | null;
}

export interface PrescriptionItemRequest {
    productId: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string | null;
}

export interface MedicalRecordRequest {
    petId: string;
    veterinarianId: string;
    appointmentId: string | null;
    recordType: string;
    recordDate: string;
    reason: string | null;
    symptoms: string | null;
    diagnosis: string | null;
    treatment: string | null;
    observations: string | null;
    weight: number | null;
    temperature: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    followUpDate: string | null;
    status: string | null;
    prescriptions: PrescriptionItemRequest[];
}

/** Datos para precargar el formulario al crear un registro médico desde una cita completada */
export interface MedicalRecordAppointmentPrefill {
    appointmentId: string;
    pet: PetResponse;
    veterinarian: VeterinarianResponse;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm:ss
    serviceType: string;
}

export interface MedicalRecordQueryParams {
    petId?: string;
    veterinarianId?: string;
    recordType?: string;
    status?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}
