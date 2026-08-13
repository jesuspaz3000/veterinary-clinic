import axios from "axios";

import { useAuthStore } from "@/store/auth.store";
import { AuthResponse } from "@/features/auth/types/authTypes";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// When the body is FormData, let the browser set Content-Type automatically
// (it must include the multipart boundary, which axios/browser generates).
// Forcing "application/json" on FormData requests causes the backend to reject them.
api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

interface FailedRequest {
    resolve: (value: string | null) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Evitar bucle infinito si falla el propio endpoint de refresh
            if (originalRequest.url?.includes("/auth/refresh-token")) {
                useAuthStore.getState().clearSession();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string | null>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err: unknown) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Al tener withCredentials: true, el navegador envía la cookie HttpOnly refresh_token automáticamente
                const response = await api.post<{ user: AuthResponse }>("/auth/refresh-token");
                const user = response.data.user;
                
                useAuthStore.getState().setSession(user);

                processQueue(null);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                // Si falla el refresco (refresh token expirado), forzar deslogueo
                useAuthStore.getState().clearSession();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        const message = error.response?.data?.message ?? error.message;
        return Promise.reject(new Error(message));
    }
);

export default api;