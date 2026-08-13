import { ApiService } from "@/shared/services/api.service";
import {
  GroomingSpecialtyResponse,
  CreateGroomingSpecialtyRequest,
  UpdateGroomingSpecialtyRequest,
} from "../type/groomingSpecialtiesTypes";

export const GroomingSpecialtiesService = {
  getAllSpecialties: async (): Promise<GroomingSpecialtyResponse[]> => {
    const response = await ApiService.get<GroomingSpecialtyResponse[]>("/grooming-specialties");
    return response.data;
  },

  getSpecialtyById: async (id: string): Promise<GroomingSpecialtyResponse> => {
    const response = await ApiService.get<GroomingSpecialtyResponse>(`/grooming-specialties/${id}`);
    return response.data;
  },

  createSpecialty: async (
    request: CreateGroomingSpecialtyRequest
  ): Promise<GroomingSpecialtyResponse> => {
    const response = await ApiService.post<GroomingSpecialtyResponse>(
      "/grooming-specialties",
      request
    );
    return response.data;
  },

  updateSpecialty: async (
    id: string,
    request: UpdateGroomingSpecialtyRequest
  ): Promise<GroomingSpecialtyResponse> => {
    const response = await ApiService.put<GroomingSpecialtyResponse>(
      `/grooming-specialties/${id}`,
      request
    );
    return response.data;
  },

  deleteSpecialty: async (id: string): Promise<void> => {
    await ApiService.delete(`/grooming-specialties/${id}`);
  },
};
