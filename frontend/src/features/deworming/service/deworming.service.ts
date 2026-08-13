import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    DewormingRecordResponse,
    DewormingRecordRequest,
    DewormingRecordQueryParams,
} from "../type/dewormingTypes";

export const DewormingService = {
    getDewormingRecords: async (
        params?: DewormingRecordQueryParams
    ): Promise<PaginationResponse<DewormingRecordResponse>> => {
        const response = await ApiService.get<PaginationResponse<DewormingRecordResponse>>(
            "/deworming",
            { params }
        );
        return response.data;
    },

    getDewormingRecordById: async (id: string): Promise<DewormingRecordResponse> => {
        const response = await ApiService.get<DewormingRecordResponse>(`/deworming/${id}`);
        return response.data;
    },

    createDewormingRecord: async (
        request: DewormingRecordRequest
    ): Promise<DewormingRecordResponse> => {
        const response = await ApiService.post<DewormingRecordResponse>("/deworming", request);
        return response.data;
    },

    updateDewormingRecord: async (
        id: string,
        request: DewormingRecordRequest
    ): Promise<DewormingRecordResponse> => {
        const response = await ApiService.put<DewormingRecordResponse>(`/deworming/${id}`, request);
        return response.data;
    },

    deleteDewormingRecord: async (id: string): Promise<void> => {
        await ApiService.delete(`/deworming/${id}`);
    },
};
