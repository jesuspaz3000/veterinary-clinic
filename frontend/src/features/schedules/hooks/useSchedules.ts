import { useState, useCallback } from "react";
import { SchedulesService } from "../service/schedules.service";
import { ScheduleProfessionalKind, ScheduleResponse, ScheduleStatusFilter } from "../type/schedulesTypes";

export function useSchedules() {
    const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchSchedules = useCallback(
        async (kind: ScheduleProfessionalKind, professionalId: string, status?: ScheduleStatusFilter) => {
            setLoading(true);
            setError(null);
            try {
                const data = await SchedulesService.getSchedules(kind, professionalId, status);
                setSchedules(data);
            } catch (err: unknown) {
                console.error("Error fetching schedules:", err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const clearSchedules = useCallback(() => {
        setSchedules([]);
        setError(null);
    }, []);

    return {
        schedules,
        loading,
        error,
        fetchSchedules,
        clearSchedules,
    };
}
