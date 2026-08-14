import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
  InvoiceResponse,
  CreateInvoiceRequest,
  CreateInvoicePaymentRequest,
  InvoiceFilters,
} from "../types/salesTypes";

export const SalesService = {
  getInvoices: async (filters?: InvoiceFilters): Promise<PaginationResponse<InvoiceResponse>> => {
    const response = await ApiService.get<PaginationResponse<InvoiceResponse>>("/sales", {
      params: filters,
    });
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<InvoiceResponse> => {
    const response = await ApiService.get<InvoiceResponse>(`/sales/${id}`);
    return response.data;
  },

  createInvoice: async (request: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    const response = await ApiService.post<InvoiceResponse>("/sales", request);
    return response.data;
  },

  registerPayment: async (invoiceId: string, request: CreateInvoicePaymentRequest): Promise<InvoiceResponse> => {
    const response = await ApiService.post<InvoiceResponse>(`/sales/${invoiceId}/payments`, request);
    return response.data;
  },
};
