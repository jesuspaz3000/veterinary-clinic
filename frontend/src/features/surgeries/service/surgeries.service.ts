import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    SurgeryRecordResponse,
    SurgeryRecordRequest,
    SurgeryRecordQueryParams,
} from "../type/surgeriesTypes";

export const SurgeriesService = {
    getSurgeryRecords: async (
        params?: SurgeryRecordQueryParams
    ): Promise<PaginationResponse<SurgeryRecordResponse>> => {
        const response = await ApiService.get<PaginationResponse<SurgeryRecordResponse>>(
            "/surgeries",
            { params }
        );
        return response.data;
    },

    getSurgeryRecordById: async (id: string): Promise<SurgeryRecordResponse> => {
        const response = await ApiService.get<SurgeryRecordResponse>(`/surgeries/${id}`);
        return response.data;
    },

    createSurgeryRecord: async (
        request: SurgeryRecordRequest
    ): Promise<SurgeryRecordResponse> => {
        const response = await ApiService.post<SurgeryRecordResponse>("/surgeries", request);
        return response.data;
    },

    updateSurgeryRecord: async (
        id: string,
        request: SurgeryRecordRequest
    ): Promise<SurgeryRecordResponse> => {
        const response = await ApiService.put<SurgeryRecordResponse>(`/surgeries/${id}`, request);
        return response.data;
    },

    deleteSurgeryRecord: async (id: string): Promise<void> => {
        await ApiService.delete(`/surgeries/${id}`);
    },

    reactivateSurgeryRecord: async (id: string): Promise<void> => {
        await ApiService.post(`/surgeries/${id}/reactivate`);
    },
};
