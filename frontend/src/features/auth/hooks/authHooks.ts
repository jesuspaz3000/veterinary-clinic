import { useState } from "react";
import { AuthService } from "@/features/auth/services/auth.service";
import { AuthLogin, AuthResponse } from "@/features/auth/types/authTypes";

export const useAuthLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<AuthResponse | null>(null);

    const login = async (request: AuthLogin) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await AuthService.login(request);
            setData(response);
            return response;
        } catch (error) {
            setError(error as Error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        login,
        isLoading,
        error,
        data
    }
}