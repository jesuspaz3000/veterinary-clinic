import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    OwnerResponse,
    OwnerRequest,
    OwnerCreateRequest,
    OwnerUpdateRequest,
} from "../type/ownersTypes";

export const OwnerService = {
    getAllOwnersPaginated: async (
        params?: OwnerRequest
    ): Promise<PaginationResponse<OwnerResponse>> => {
        const response = await ApiService.get<PaginationResponse<OwnerResponse>>(
            "/owners",
            { params }
        );
        return response.data;
    },

    getAllOwners: async (search?: string): Promise<OwnerResponse[]> => {
        const response = await ApiService.get<OwnerResponse[]>("/owners/all", {
            params: search ? { search } : undefined,
        });
        return response.data;
    },

    getOwnerById: async (id: string): Promise<OwnerResponse> => {
        const response = await ApiService.get<OwnerResponse>(`/owners/${id}`);
        return response.data;
    },

    createOwner: async (request: OwnerCreateRequest): Promise<OwnerResponse> => {
        const response = await ApiService.post<OwnerResponse>("/owners", request);
        return response.data;
    },

    updateOwner: async (
        id: string,
        request: OwnerUpdateRequest
    ): Promise<OwnerResponse> => {
        const response = await ApiService.put<OwnerResponse>(
            `/owners/${id}`,
            request
        );
        return response.data;
    },

    deleteOwner: async (id: string): Promise<void> => {
        await ApiService.delete(`/owners/${id}`);
    },
};
