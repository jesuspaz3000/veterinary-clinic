import { ApiService } from "@/shared/services/api.service";
import { PaginationResponse } from "@/shared/types/pagination";
import {
  InventoryMovementResponse,
  InventoryMovementFilters,
} from "../types/salesTypes";

export const InventoryMovementsService = {
  getMovements: async (filters?: InventoryMovementFilters): Promise<PaginationResponse<InventoryMovementResponse>> => {
    const response = await ApiService.get<PaginationResponse<InventoryMovementResponse>>("/inventory/movements", {
      params: filters,
    });
    return response.data;
  },
};
