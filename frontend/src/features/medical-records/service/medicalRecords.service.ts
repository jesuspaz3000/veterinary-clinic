import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
    MedicalRecordResponse,
    MedicalRecordQueryParams,
    MedicalRecordRequest,
    MedicalDocumentResponse,
} from "../type/medicalRecordsTypes";

export const MedicalRecordsService = {
    getMedicalRecords: async (
        params?: MedicalRecordQueryParams
    ): Promise<PaginationResponse<MedicalRecordResponse>> => {
        const response = await ApiService.get<PaginationResponse<MedicalRecordResponse>>(
            "/medical-records",
            { params }
        );
        return response.data;
    },

    getMedicalRecordById: async (id: string): Promise<MedicalRecordResponse> => {
        const response = await ApiService.get<MedicalRecordResponse>(`/medical-records/${id}`);
        return response.data;
    },

    createMedicalRecord: async (request: MedicalRecordRequest): Promise<MedicalRecordResponse> => {
        const response = await ApiService.post<MedicalRecordResponse>("/medical-records", request);
        return response.data;
    },

    updateMedicalRecord: async (
        id: string,
        request: MedicalRecordRequest
    ): Promise<MedicalRecordResponse> => {
        const response = await ApiService.put<MedicalRecordResponse>(`/medical-records/${id}`, request);
        return response.data;
    },

    deleteMedicalRecord: async (id: string): Promise<void> => {
        await ApiService.delete(`/medical-records/${id}`);
    },

    uploadDocument: async (
        recordId: string,
        file: File,
        documentType: string,
        description?: string
    ): Promise<MedicalDocumentResponse> => {
        const form = new FormData();
        form.append("file", file);
        form.append("documentType", documentType);
        if (description && description.trim()) form.append("description", description.trim());
        const response = await ApiService.post<MedicalDocumentResponse>(
            `/medical-records/${recordId}/documents`,
            form,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },

    deleteDocument: async (recordId: string, documentId: string): Promise<void> => {
        await ApiService.delete(`/medical-records/${recordId}/documents/${documentId}`);
    },
};
