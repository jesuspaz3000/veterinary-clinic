import { ApiService } from "@/shared/services/api.service";
import {
    AdministrativeAreaResponse,
    AdministrativeAreaCreateRequest,
    AdministrativeAreaUpdateRequest,
} from "../type/administrativeAreaTypes";

export const AdministrativeAreasService = {
    getAllAreas: async (): Promise<AdministrativeAreaResponse[]> => {
        const response = await ApiService.get<AdministrativeAreaResponse[]>("/administrative-areas");
        return response.data;
    },

    getAreaById: async (id: string): Promise<AdministrativeAreaResponse> => {
        const response = await ApiService.get<AdministrativeAreaResponse>(`/administrative-areas/${id}`);
        return response.data;
    },

    createArea: async (
        request: AdministrativeAreaCreateRequest
    ): Promise<AdministrativeAreaResponse> => {
        const response = await ApiService.post<AdministrativeAreaResponse>(
            "/administrative-areas",
            request
        );
        return response.data;
    },

    updateArea: async (
        id: string,
        request: AdministrativeAreaUpdateRequest
    ): Promise<AdministrativeAreaResponse> => {
        const response = await ApiService.put<AdministrativeAreaResponse>(
            `/administrative-areas/${id}`,
            request
        );
        return response.data;
    },

    deleteArea: async (id: string): Promise<void> => {
        await ApiService.delete(`/administrative-areas/${id}`);
    },
};
