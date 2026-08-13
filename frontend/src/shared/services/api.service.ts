import api from "@/lib/axios";
import { AxiosResponse, AxiosRequestConfig } from "axios";

type BodyData = object | FormData;

export const ApiService = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return api.get<T>(url, config);
    },

    post: <T>(url: string, data?: BodyData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return api.post<T>(url, data, config);
    },

    put: <T>(url: string, data?: BodyData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return api.put<T>(url, data, config);
    },

    patch: <T>(url: string, data?: BodyData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return api.patch<T>(url, data, config);
    },

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return api.delete<T>(url, config);
    },
};