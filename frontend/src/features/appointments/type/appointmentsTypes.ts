import { PetResponse } from "@/features/pets/type/petsTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { GroomingStaffResponse } from "@/features/grooming/type/groomingTypes";

export type AppointmentStatus = "pendiente" | "confirmada" | "completada" | "cancelada";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
    "pendiente",
    "confirmada",
    "completada",
    "cancelada",
];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
};

export const SERVICE_TYPE_OPTIONS = [
    "Consulta general",
    "Control / Seguimiento",
    "Vacunación",
    "Desparasitación",
    "Cirugía",
    "Emergencia",
    "Peluquería / Baño",
    "Examen de laboratorio",
];

export interface AppointmentResponse {
    id: string;
    pet: PetResponse;
    veterinarian: VeterinarianResponse | null;
    groomingStaff: GroomingStaffResponse | null;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    serviceType: string;
    status: AppointmentStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentQueryParams {
    date?: string;
    /** Inicio del rango de fechas (inclusive), YYYY-MM-DD */
    from?: string;
    /** Fin del rango de fechas (inclusive), YYYY-MM-DD */
    to?: string;
    veterinarianId?: string;
    petId?: string;
    status?: string;
}

export interface AppointmentPaginatedRequest extends AppointmentQueryParams {
    limit?: number;
    offset?: number;
}

export interface AppointmentCreateRequest {
    petId: string;
    veterinarianId?: string | null;
    groomingStaffId?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    serviceType: string;
    notes?: string | null;
}

export interface AppointmentUpdateRequest {
    petId: string;
    veterinarianId?: string | null;
    groomingStaffId?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    serviceType: string;
    status: AppointmentStatus;
    notes?: string | null;
}
