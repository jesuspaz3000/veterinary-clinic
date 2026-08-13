import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    GroomingStaffResponse,
    GroomingStaffRequest,
    GroomingStaffCreateRequest,
    GroomingStaffUpdateRequest,
} from "../type/groomingTypes";

function appendCommonFields(
    formData: FormData,
    request: {
        username: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        specialtyIds?: string[];
        experienceYears: number | null;
        hireDate: string | null;
    }
) {
    formData.append("username", request.username);
    formData.append("email", request.email);
    if (request.firstName) formData.append("firstName", request.firstName);
    if (request.lastName) formData.append("lastName", request.lastName);
    if (request.phone) formData.append("phone", request.phone);
    if (request.specialtyIds && request.specialtyIds.length > 0) {
        request.specialtyIds.forEach((id) => formData.append("specialtyIds", id));
    }
    if (request.experienceYears !== null && request.experienceYears !== undefined) {
        formData.append("experienceYears", request.experienceYears.toString());
    }
    if (request.hireDate) formData.append("hireDate", request.hireDate);
}

function buildCreateFormData(request: GroomingStaffCreateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    formData.append("password", request.password);
    if (request.avatar) formData.append("avatar", request.avatar);
    return formData;
}

function buildUpdateFormData(request: GroomingStaffUpdateRequest): FormData {
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

export const GroomingService = {
    getAllGroomingStaff: async (
        params?: GroomingStaffRequest
    ): Promise<PaginationResponse<GroomingStaffResponse>> => {
        const response = await ApiService.get<PaginationResponse<GroomingStaffResponse>>(
            "/grooming-staff",
            { params }
        );
        return response.data;
    },

    getGroomingStaffById: async (id: string): Promise<GroomingStaffResponse> => {
        const response = await ApiService.get<GroomingStaffResponse>(`/grooming-staff/${id}`);
        return response.data;
    },

    createGroomingStaff: async (
        request: GroomingStaffCreateRequest
    ): Promise<GroomingStaffResponse> => {
        const formData = buildCreateFormData(request);
        const response = await ApiService.post<GroomingStaffResponse>("/grooming-staff", formData);
        return response.data;
    },

    updateGroomingStaff: async (
        id: string,
        request: GroomingStaffUpdateRequest
    ): Promise<GroomingStaffResponse> => {
        const formData = buildUpdateFormData(request);
        const response = await ApiService.put<GroomingStaffResponse>(
            `/grooming-staff/${id}`,
            formData
        );
        return response.data;
    },

    deleteGroomingStaff: async (id: string): Promise<void> => {
        await ApiService.delete(`/grooming-staff/${id}`);
    },
};
