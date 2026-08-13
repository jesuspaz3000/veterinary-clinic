import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    AdministrativeStaffResponse,
    AdministrativeStaffRequest,
    AdministrativeStaffCreateRequest,
    AdministrativeStaffUpdateRequest,
} from "../type/administrativeTypes";

function appendCommonFields(
    formData: FormData,
    request: {
        username: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        positionIds?: string[];
        areaId?: string | null;
    }
) {
    formData.append("username", request.username);
    formData.append("email", request.email);
    if (request.firstName) formData.append("firstName", request.firstName);
    if (request.lastName) formData.append("lastName", request.lastName);
    if (request.phone) formData.append("phone", request.phone);
    if (request.positionIds && request.positionIds.length > 0) {
        request.positionIds.forEach((id) => formData.append("positionIds", id));
    }
    if (request.areaId) formData.append("areaId", request.areaId);
}

function buildCreateFormData(request: AdministrativeStaffCreateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    formData.append("password", request.password);
    if (request.avatar) formData.append("avatar", request.avatar);
    return formData;
}

function buildUpdateFormData(request: AdministrativeStaffUpdateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    if (request.avatar) {
        formData.append("avatar", request.avatar);
    } else if (request.removeAvatar) {
        formData.append("removeAvatar", "true");
    }
    return formData;
}

export const AdministrativeService = {
    getAllAdministrativeStaff: async (
        params?: AdministrativeStaffRequest
    ): Promise<PaginationResponse<AdministrativeStaffResponse>> => {
        const response = await ApiService.get<PaginationResponse<AdministrativeStaffResponse>>(
            "/administrative-staff",
            { params }
        );
        return response.data;
    },

    getAdministrativeStaffById: async (id: string): Promise<AdministrativeStaffResponse> => {
        const response = await ApiService.get<AdministrativeStaffResponse>(`/administrative-staff/${id}`);
        return response.data;
    },

    createAdministrativeStaff: async (
        request: AdministrativeStaffCreateRequest
    ): Promise<AdministrativeStaffResponse> => {
        const formData = buildCreateFormData(request);
        const response = await ApiService.post<AdministrativeStaffResponse>("/administrative-staff", formData);
        return response.data;
    },

    updateAdministrativeStaff: async (
        id: string,
        request: AdministrativeStaffUpdateRequest
    ): Promise<AdministrativeStaffResponse> => {
        const formData = buildUpdateFormData(request);
        const response = await ApiService.put<AdministrativeStaffResponse>(
            `/administrative-staff/${id}`,
            formData
        );
        return response.data;
    },

    deleteAdministrativeStaff: async (id: string): Promise<void> => {
        await ApiService.delete(`/administrative-staff/${id}`);
    },
};
