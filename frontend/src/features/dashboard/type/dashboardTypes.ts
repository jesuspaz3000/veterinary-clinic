export interface DashboardChartPoint {
    label: string;
    value: number;
}

export interface DashboardStats {
    appointmentsToday: number;
    activePets: number;
    activeOwners: number;
    hospitalizedPets: number;
    lowStockProducts: number;
    expiringLots: number;
    pendingInvoices: number;
    surgeriesToday: number;
    vaccinationsDueSoon: number;
    dewormingsDueSoon: number;
    revenueThisMonth: number;
    appointmentsLast7Days: DashboardChartPoint[];
    revenueLast7Days: DashboardChartPoint[];
    appointmentsByStatusToday: Record<string, number>;
}
