import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    VeterinarianResponse,
    VeterinarianRequest,
    VeterinarianCreateRequest,
    VeterinarianUpdateRequest,
} from "../type/veterinariansTypes";

function appendCommonFields(
    formData: FormData,
    request: {
        username: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        licenseNumber: string;
        specialtyIds: string[];
        hireDate: string | null;
    }
) {
    formData.append("username", request.username);
    formData.append("email", request.email);
    formData.append("licenseNumber", request.licenseNumber);
    if (request.firstName) formData.append("firstName", request.firstName);
    if (request.lastName) formData.append("lastName", request.lastName);
    if (request.phone) formData.append("phone", request.phone);
    if (request.specialtyIds && request.specialtyIds.length > 0) {
        request.specialtyIds.forEach((id) => formData.append("specialtyIds", id));
    }
    if (request.hireDate) formData.append("hireDate", request.hireDate);
}

function buildVeterinarianCreateFormData(request: VeterinarianCreateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    formData.append("password", request.password);
    if (request.avatar) formData.append("avatar", request.avatar);
    return formData;
}

function buildVeterinarianUpdateFormData(request: VeterinarianUpdateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    formData.append("status", request.status);
    if (request.avatar) {
        formData.append("avatar", request.avatar);
    } else if (request.removeAvatar) {
        formData.append("removeAvatar", "true");
    }
    return formData;
}

export const VeterinariansService = {
    getAllVeterinarians: async (
        params?: VeterinarianRequest
    ): Promise<PaginationResponse<VeterinarianResponse>> => {
        const response = await ApiService.get<PaginationResponse<VeterinarianResponse>>(
            "/veterinarians",
            { params }
        );
        return response.data;
    },

    getVeterinarianById: async (id: string): Promise<VeterinarianResponse> => {
        const response = await ApiService.get<VeterinarianResponse>(`/veterinarians/${id}`);
        return response.data;
    },

    createVeterinarian: async (
        request: VeterinarianCreateRequest
    ): Promise<VeterinarianResponse> => {
        const formData = buildVeterinarianCreateFormData(request);
        const response = await ApiService.post<VeterinarianResponse>("/veterinarians", formData);
        return response.data;
    },

    updateVeterinarian: async (
        id: string,
        request: VeterinarianUpdateRequest
    ): Promise<VeterinarianResponse> => {
        const formData = buildVeterinarianUpdateFormData(request);
        const response = await ApiService.put<VeterinarianResponse>(
            `/veterinarians/${id}`,
            formData
        );
        return response.data;
    },

    deleteVeterinarian: async (id: string): Promise<void> => {
        await ApiService.delete(`/veterinarians/${id}`);
    },

    reactivateVeterinarian: async (id: string): Promise<void> => {
        await ApiService.post(`/veterinarians/${id}/reactivate`);
    },
};
