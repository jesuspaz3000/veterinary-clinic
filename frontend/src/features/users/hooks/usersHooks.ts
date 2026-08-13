import { useState, useCallback } from "react";
import { UsersService } from "../service/users.service";
import { UserResponse, UserRequest } from "../type/usersTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export const useUsers = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<PaginationResponse<UserResponse> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetchUsers = useCallback(async (params?: UserRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await UsersService.getAllUsers(params);
            setUsers(data);
        } catch (error) {
            console.error(error);
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        loading,
        fetchUsers,
        error
    }
}