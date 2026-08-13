import { ApiService } from "@/shared/services/api.service";
import {
    SpecialtyResponse,
    SpecialtyCreateRequest,
    SpecialtyUpdateRequest,
} from "../type/specialtiesTypes";

export const SpecialtiesService = {
    getAllSpecialties: async (): Promise<SpecialtyResponse[]> => {
        const response = await ApiService.get<SpecialtyResponse[]>("/specialties");
        return response.data;
    },
    getSpecialtyById: async (id: string): Promise<SpecialtyResponse> => {
        const response = await ApiService.get<SpecialtyResponse>(`/specialties/${id}`);
        return response.data;
    },
    createSpecialty: async (request: SpecialtyCreateRequest): Promise<SpecialtyResponse> => {
        const response = await ApiService.post<SpecialtyResponse>("/specialties", request);
        return response.data;
    },
    updateSpecialty: async (id: string, request: SpecialtyUpdateRequest): Promise<SpecialtyResponse> => {
        const response = await ApiService.put<SpecialtyResponse>(`/specialties/${id}`, request);
        return response.data;
    },
    deleteSpecialty: async (id: string): Promise<void> => {
        await ApiService.delete(`/specialties/${id}`);
    },
};
