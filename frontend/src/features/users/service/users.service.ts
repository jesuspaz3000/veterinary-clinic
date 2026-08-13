import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import { UserResponse, UserCreateRequest, UserUpdateRequest, UserRequest, UserResetPassword } from "../type/usersTypes";

function appendCommonFields(formData: FormData, request: { username: string; email: string; roleId: string; firstName: string | null; lastName: string | null; phone: string | null }) {
    formData.append("username", request.username);
    formData.append("email", request.email);
    formData.append("roleId", request.roleId);
    if (request.firstName) formData.append("firstName", request.firstName);
    if (request.lastName) formData.append("lastName", request.lastName);
    if (request.phone) formData.append("phone", request.phone);
}

function buildUserCreateFormData(request: UserCreateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    formData.append("password", request.password);
    if (request.avatar) formData.append("avatar", request.avatar);
    return formData;
}

function buildUserUpdateFormData(request: UserUpdateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    if (request.avatar) {
        formData.append("avatar", request.avatar);
    } else if (request.removeAvatar) {
        formData.append("removeAvatar", "true");
    }
    return formData;
}

export const UsersService = {
    getAllUsers: async (params?: UserRequest): Promise<PaginationResponse<UserResponse>> => {
        const response = await ApiService.get<PaginationResponse<UserResponse>>("/users", { params });
        return response.data;
    },
    getUserById: async (id: string): Promise<UserResponse> => {
        const response = await ApiService.get<UserResponse>(`/users/${id}`);
        return response.data;
    },
    createUser: async (request: UserCreateRequest): Promise<UserResponse> => {
        const formData = buildUserCreateFormData(request);
        const response = await ApiService.post<UserResponse>("/users", formData);
        return response.data;
    },
    updateUser: async (id: string, request: UserUpdateRequest): Promise<UserResponse> => {
        const formData = buildUserUpdateFormData(request);
        const response = await ApiService.put<UserResponse>(`/users/${id}`, formData);
        return response.data;
    },
    deleteUser: async (id: string): Promise<void> => {
        await ApiService.delete(`/users/${id}`);
    },
    resetUserPassword: async(id: string, request: UserResetPassword): Promise<void> => {
        await ApiService.put(`/users/${id}/reset-password`, request);
    }
}