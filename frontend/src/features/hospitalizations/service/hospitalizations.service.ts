import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    HospitalizationRecordResponse,
    CreateHospitalizationRecordRequest,
    UpdateHospitalizationRecordRequest,
    HospitalizationQueryParams,
    HospitalizationEvolutionResponse,
    HospitalizationEvolutionRequest,
} from "../type/hospitalizationsTypes";

export const HospitalizationsService = {
    getHospitalizations: async (
        params?: HospitalizationQueryParams
    ): Promise<PaginationResponse<HospitalizationRecordResponse>> => {
        const response = await ApiService.get<PaginationResponse<HospitalizationRecordResponse>>(
            "/hospitalizations",
            { params }
        );
        return response.data;
    },

    getHospitalizationById: async (id: string): Promise<HospitalizationRecordResponse> => {
        const response = await ApiService.get<HospitalizationRecordResponse>(`/hospitalizations/${id}`);
        return response.data;
    },

    createHospitalization: async (
        request: CreateHospitalizationRecordRequest
    ): Promise<HospitalizationRecordResponse> => {
        const response = await ApiService.post<HospitalizationRecordResponse>("/hospitalizations", request);
        return response.data;
    },

    updateHospitalization: async (
        id: string,
        request: UpdateHospitalizationRecordRequest
    ): Promise<HospitalizationRecordResponse> => {
        const response = await ApiService.put<HospitalizationRecordResponse>(`/hospitalizations/${id}`, request);
        return response.data;
    },

    deleteHospitalization: async (id: string): Promise<void> => {
        await ApiService.delete(`/hospitalizations/${id}`);
    },

    reactivateHospitalization: async (id: string): Promise<void> => {
        await ApiService.post(`/hospitalizations/${id}/reactivate`);
    },

    addEvolution: async (
        hospitalizationId: string,
        request: HospitalizationEvolutionRequest
    ): Promise<HospitalizationEvolutionResponse> => {
        const response = await ApiService.post<HospitalizationEvolutionResponse>(
            `/hospitalizations/${hospitalizationId}/evolutions`,
            request
        );
        return response.data;
    },

    deleteEvolution: async (hospitalizationId: string, evolutionId: string): Promise<void> => {
        await ApiService.delete(`/hospitalizations/${hospitalizationId}/evolutions/${evolutionId}`);
    },
};
