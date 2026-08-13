import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    AppointmentResponse,
    AppointmentQueryParams,
    AppointmentPaginatedRequest,
    AppointmentCreateRequest,
    AppointmentUpdateRequest,
} from "../type/appointmentsTypes";

export const AppointmentService = {
    getAllAppointmentsPaginated: async (
        params?: AppointmentPaginatedRequest
    ): Promise<PaginationResponse<AppointmentResponse>> => {
        const response = await ApiService.get<PaginationResponse<AppointmentResponse>>(
            "/appointments",
            { params }
        );
        return response.data;
    },

    getAllAppointments: async (
        params?: AppointmentQueryParams
    ): Promise<AppointmentResponse[]> => {
        const response = await ApiService.get<AppointmentResponse[]>("/appointments/all", {
            params,
        });
        return response.data;
    },

    /** Obtiene todas las citas de un conjunto de fechas (ej. los 7 días de una semana) */
    getWeekAppointments: async (dates: string[]): Promise<AppointmentResponse[]> => {
        const results = await Promise.all(
            dates.map((date) => AppointmentService.getAllAppointments({ date }))
        );
        return results.flat();
    },

    getAppointmentById: async (id: string): Promise<AppointmentResponse> => {
        const response = await ApiService.get<AppointmentResponse>(`/appointments/${id}`);
        return response.data;
    },

    createAppointment: async (
        request: AppointmentCreateRequest
    ): Promise<AppointmentResponse> => {
        const response = await ApiService.post<AppointmentResponse>("/appointments", request);
        return response.data;
    },

    updateAppointment: async (
        id: string,
        request: AppointmentUpdateRequest
    ): Promise<AppointmentResponse> => {
        const response = await ApiService.put<AppointmentResponse>(
            `/appointments/${id}`,
            request
        );
        return response.data;
    },

    cancelAppointment: async (id: string): Promise<void> => {
        await ApiService.delete(`/appointments/${id}`);
    },
};
