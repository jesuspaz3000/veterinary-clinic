import { GroomingStaffResponse } from "@/features/grooming/type/groomingTypes";
import { UserResponse } from "@/features/users/type/usersTypes";
import { VeterinarianResponse } from "@/features/veterinarians/type/veterinariansTypes";
import { AppointmentResponse } from "../type/appointmentsTypes";

export type ProfessionalKind = "veterinarian" | "grooming";

/** Opción unificada para el selector/filtro de profesional (veterinario o grooming) */
export interface ProfessionalOption {
    kind: ProfessionalKind;
    id: string;
    label: string;
}

export const PROFESSIONAL_GROUP_LABELS: Record<ProfessionalKind, string> = {
    veterinarian: "Veterinarios",
    grooming: "Personal de grooming",
};

export function getUserDisplayName(
    user: UserResponse | null | undefined,
    fallback: string
): string {
    if (!user) return fallback;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return name || user.username || fallback;
}

/** Combina veterinarios y personal de grooming en una lista agrupable */
export function buildProfessionalOptions(
    vets: VeterinarianResponse[],
    groomers: GroomingStaffResponse[]
): ProfessionalOption[] {
    return [
        ...vets.map<ProfessionalOption>((v) => ({
            kind: "veterinarian",
            id: v.id,
            label: getUserDisplayName(v.user, "Veterinario"),
        })),
        ...groomers.map<ProfessionalOption>((g) => ({
            kind: "grooming",
            id: g.id,
            label: getUserDisplayName(g.user, "Grooming"),
        })),
    ];
}

/** Profesional asignado a una cita (veterinario o grooming), o null si no tiene */
export function getAppointmentProfessional(
    appointment: AppointmentResponse
): ProfessionalOption | null {
    if (appointment.veterinarian) {
        return {
            kind: "veterinarian",
            id: appointment.veterinarian.id,
            label: getUserDisplayName(appointment.veterinarian.user, "Veterinario"),
        };
    }
    if (appointment.groomingStaff) {
        return {
            kind: "grooming",
            id: appointment.groomingStaff.id,
            label: getUserDisplayName(appointment.groomingStaff.user, "Grooming"),
        };
    }
    return null;
}
