import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    VaccinationRecordResponse,
    VaccinationRecordRequest,
    VaccinationRecordQueryParams,
} from "../type/vaccinationsTypes";

export const VaccinationsService = {
    getVaccinationRecords: async (
        params?: VaccinationRecordQueryParams
    ): Promise<PaginationResponse<VaccinationRecordResponse>> => {
        const response = await ApiService.get<PaginationResponse<VaccinationRecordResponse>>(
            "/vaccinations",
            { params }
        );
        return response.data;
    },

    getVaccinationRecordById: async (id: string): Promise<VaccinationRecordResponse> => {
        const response = await ApiService.get<VaccinationRecordResponse>(`/vaccinations/${id}`);
        return response.data;
    },

    createVaccinationRecord: async (
        request: VaccinationRecordRequest
    ): Promise<VaccinationRecordResponse> => {
        const response = await ApiService.post<VaccinationRecordResponse>("/vaccinations", request);
        return response.data;
    },

    updateVaccinationRecord: async (
        id: string,
        request: VaccinationRecordRequest
    ): Promise<VaccinationRecordResponse> => {
        const response = await ApiService.put<VaccinationRecordResponse>(`/vaccinations/${id}`, request);
        return response.data;
    },

    deleteVaccinationRecord: async (id: string): Promise<void> => {
        await ApiService.delete(`/vaccinations/${id}`);
    },

    reactivateVaccinationRecord: async (id: string): Promise<void> => {
        await ApiService.post(`/vaccinations/${id}/reactivate`);
    },
};
