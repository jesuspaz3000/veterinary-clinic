import { ApiService } from "@/shared/services/api.service";
import { DashboardStats } from "../type/dashboardTypes";

export const DashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await ApiService.get<DashboardStats>("/dashboard/stats");
        return response.data;
    },
};
