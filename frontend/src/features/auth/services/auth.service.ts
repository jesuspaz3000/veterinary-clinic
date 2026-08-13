import { ApiService } from "@/shared/services/api.service";
import { AuthLogin, AuthResponse, LogoutRequest } from "@/features/auth/types/authTypes";
import { useAuthStore } from "@/store/auth.store";

export const AuthService = {
    login: async (request: AuthLogin): Promise<AuthResponse> => {
        const response = await ApiService.post<{ user: AuthResponse }>("/auth/login", request);
        useAuthStore.getState().setSession(response.data.user);
        return response.data.user;
    },

    logout: async (request: LogoutRequest): Promise<void> => {
        try {
            await ApiService.post("/auth/logout", request);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            useAuthStore.getState().clearSession();
        }
    },

    refreshToken: async (): Promise<AuthResponse> => {
        const response = await ApiService.post<{ user: AuthResponse }>("/auth/refresh-token");
        useAuthStore.getState().setSession(response.data.user);
        return response.data.user;
    }
}