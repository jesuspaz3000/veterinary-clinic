import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    PetResponse,
    PetRequest,
    PetCreateRequest,
    PetUpdateRequest,
} from "../type/petsTypes";

function appendCommonFields(
    formData: FormData,
    request: {
        ownerId: string;
        name: string;
        species: string;
        breed?: string | null;
        color?: string | null;
        sex: string;
        birthDate?: string | null;
        weight?: number | null;
        microchipNumber?: string | null;
        sterilized?: boolean;
        status?: string | null;
        specialNotes?: string | null;
    }
) {
    formData.append("ownerId", request.ownerId);
    formData.append("name", request.name);
    formData.append("species", request.species);
    formData.append("sex", request.sex);

    if (request.breed) formData.append("breed", request.breed);
    if (request.color) formData.append("color", request.color);
    if (request.birthDate) formData.append("birthDate", request.birthDate);
    if (request.weight !== undefined && request.weight !== null) {
        formData.append("weight", request.weight.toString());
    }
    if (request.microchipNumber) formData.append("microchipNumber", request.microchipNumber);
    if (request.sterilized !== undefined && request.sterilized !== null) {
        formData.append("sterilized", request.sterilized ? "true" : "false");
    }
    if (request.status) formData.append("status", request.status);
    if (request.specialNotes) formData.append("specialNotes", request.specialNotes);
}

function buildCreateFormData(request: PetCreateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    if (request.photo) formData.append("photo", request.photo);
    return formData;
}

function buildUpdateFormData(request: PetUpdateRequest): FormData {
    const formData = new FormData();
    appendCommonFields(formData, request);
    if (request.photo) {
        formData.append("photo", request.photo);
    } else if (request.removePhoto) {
        formData.append("removePhoto", "true");
    }
    return formData;
}

export const PetService = {
    getAllPetsPaginated: async (
        params?: PetRequest
    ): Promise<PaginationResponse<PetResponse>> => {
        const response = await ApiService.get<PaginationResponse<PetResponse>>(
            "/pets",
            { params }
        );
        return response.data;
    },

    getAllPets: async (search?: string, ownerId?: string): Promise<PetResponse[]> => {
        const response = await ApiService.get<PetResponse[]>("/pets/all", {
            params: { search, ownerId },
        });
        return response.data;
    },

    getPetById: async (id: string): Promise<PetResponse> => {
        const response = await ApiService.get<PetResponse>(`/pets/${id}`);
        return response.data;
    },

    createPet: async (request: PetCreateRequest): Promise<PetResponse> => {
        const formData = buildCreateFormData(request);
        const response = await ApiService.post<PetResponse>("/pets", formData);
        return response.data;
    },

    updatePet: async (
        id: string,
        request: PetUpdateRequest
    ): Promise<PetResponse> => {
        const formData = buildUpdateFormData(request);
        const response = await ApiService.put<PetResponse>(
            `/pets/${id}`,
            formData
        );
        return response.data;
    },

    deletePet: async (id: string): Promise<void> => {
        await ApiService.delete(`/pets/${id}`);
    },
};
