import { useState, useCallback } from "react";
import { AppointmentService } from "../service/appointments.service";
import {
    AppointmentResponse,
    AppointmentPaginatedRequest,
} from "../type/appointmentsTypes";
import { PaginationResponse } from "@/shared/types/pagination";

export function useAppointments() {
    const [appointments, setAppointments] =
        useState<PaginationResponse<AppointmentResponse> | null>(null);
    const [weekAppointments, setWeekAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAppointments = useCallback(async (params?: AppointmentPaginatedRequest) => {
        setLoading(true);
        setError(null);
        try {
            const data = await AppointmentService.getAllAppointmentsPaginated(params);
            setAppointments(data);
        } catch (err: unknown) {
            console.error("Error fetching appointments:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWeekAppointments = useCallback(async (dates: string[]) => {
        setLoading(true);
        setError(null);
        try {
            const data = await AppointmentService.getWeekAppointments(dates);
            setWeekAppointments(data);
        } catch (err: unknown) {
            console.error("Error fetching week appointments:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        appointments,
        weekAppointments,
        loading,
        error,
        fetchAppointments,
        fetchWeekAppointments,
    };
}
