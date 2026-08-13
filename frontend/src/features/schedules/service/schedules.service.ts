import { ApiService } from "@/shared/services/api.service";
import {
    ScheduleProfessionalKind,
    ScheduleRequest,
    ScheduleResponse,
} from "../type/schedulesTypes";

const basePath = (kind: ScheduleProfessionalKind): string =>
    kind === "veterinarian" ? "/schedules/veterinarians" : "/schedules/grooming";

export const SchedulesService = {
    getSchedules: async (
        kind: ScheduleProfessionalKind,
        professionalId: string
    ): Promise<ScheduleResponse[]> => {
        const response = await ApiService.get<ScheduleResponse[]>(`${basePath(kind)}/${professionalId}`);
        return response.data;
    },

    createSchedule: async (
        kind: ScheduleProfessionalKind,
        professionalId: string,
        request: ScheduleRequest
    ): Promise<ScheduleResponse> => {
        const response = await ApiService.post<ScheduleResponse>(
            `${basePath(kind)}/${professionalId}`,
            request
        );
        return response.data;
    },

    updateSchedule: async (
        kind: ScheduleProfessionalKind,
        scheduleId: string,
        request: ScheduleRequest
    ): Promise<ScheduleResponse> => {
        const response = await ApiService.put<ScheduleResponse>(
            `${basePath(kind)}/${scheduleId}`,
            request
        );
        return response.data;
    },

    deleteSchedule: async (
        kind: ScheduleProfessionalKind,
        scheduleId: string
    ): Promise<void> => {
        await ApiService.delete(`${basePath(kind)}/${scheduleId}`);
    },
};
