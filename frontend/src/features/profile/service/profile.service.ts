import { ApiService } from "@/shared/services/api.service";
import { ChangePasswordRequest, MyProfileResponse, UpdateMyProfileRequest } from "../type/profileTypes";

function buildUpdateFormData(request: UpdateMyProfileRequest): FormData {
    const formData = new FormData();
    formData.append("username", request.username);
    formData.append("email", request.email);
    if (request.firstName) formData.append("firstName", request.firstName);
    if (request.lastName) formData.append("lastName", request.lastName);
    if (request.phone) formData.append("phone", request.phone);
    if (request.avatar) {
        formData.append("avatar", request.avatar);
    } else if (request.removeAvatar) {
        formData.append("removeAvatar", "true");
    }
    return formData;
}

export const ProfileService = {
    getMyProfile: async (): Promise<MyProfileResponse> => {
        const response = await ApiService.get<MyProfileResponse>("/users/me");
        return response.data;
    },

    updateMyProfile: async (request: UpdateMyProfileRequest): Promise<MyProfileResponse> => {
        const formData = buildUpdateFormData(request);
        const response = await ApiService.put<MyProfileResponse>("/users/me", formData);
        return response.data;
    },

    changeMyPassword: async (request: ChangePasswordRequest): Promise<void> => {
        await ApiService.put("/users/me/password", request);
    },
};
