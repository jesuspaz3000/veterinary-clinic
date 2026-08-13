export interface ScheduleResponse {
    id: string;
    /** 0 = Domingo, 1 = Lunes, ..., 6 = Sábado */
    dayOfWeek: number;
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleRequest {
    dayOfWeek: number;
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    isAvailable: boolean;
}

export type ScheduleProfessionalKind = "veterinarian" | "grooming";

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
};

/** Días en orden de visualización (Lunes primero) */
export const WEEK_DAYS_ORDERED: number[] = [1, 2, 3, 4, 5, 6, 0];
