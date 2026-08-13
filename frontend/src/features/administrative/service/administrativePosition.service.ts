import { ApiService } from "@/shared/services/api.service";
import {
    AdministrativePositionResponse,
    AdministrativePositionCreateRequest,
    AdministrativePositionUpdateRequest,
} from "../type/administrativePositionTypes";

export const AdministrativePositionsService = {
    getAllPositions: async (): Promise<AdministrativePositionResponse[]> => {
        const response = await ApiService.get<AdministrativePositionResponse[]>("/administrative-positions");
        return response.data;
    },

    getPositionById: async (id: string): Promise<AdministrativePositionResponse> => {
        const response = await ApiService.get<AdministrativePositionResponse>(`/administrative-positions/${id}`);
        return response.data;
    },

    createPosition: async (
        request: AdministrativePositionCreateRequest
    ): Promise<AdministrativePositionResponse> => {
        const response = await ApiService.post<AdministrativePositionResponse>(
            "/administrative-positions",
            request
        );
        return response.data;
    },

    updatePosition: async (
        id: string,
        request: AdministrativePositionUpdateRequest
    ): Promise<AdministrativePositionResponse> => {
        const response = await ApiService.put<AdministrativePositionResponse>(
            `/administrative-positions/${id}`,
            request
        );
        return response.data;
    },

    deletePosition: async (id: string): Promise<void> => {
        await ApiService.delete(`/administrative-positions/${id}`);
    },
};
