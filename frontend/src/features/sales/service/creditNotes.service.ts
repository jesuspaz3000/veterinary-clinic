import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
  CreditNoteResponse,
  CreateCreditNoteRequest,
} from "../types/salesTypes";

export const CreditNotesService = {
  getCreditNotes: async (limit = 10, offset = 0): Promise<PaginationResponse<CreditNoteResponse>> => {
    const response = await ApiService.get<PaginationResponse<CreditNoteResponse>>("/credit-notes", {
      params: { limit, offset },
    });
    return response.data;
  },

  getCreditNoteById: async (id: string): Promise<CreditNoteResponse> => {
    const response = await ApiService.get<CreditNoteResponse>(`/credit-notes/${id}`);
    return response.data;
  },

  createCreditNote: async (request: CreateCreditNoteRequest): Promise<CreditNoteResponse> => {
    const response = await ApiService.post<CreditNoteResponse>("/credit-notes", request);
    return response.data;
  },
};
