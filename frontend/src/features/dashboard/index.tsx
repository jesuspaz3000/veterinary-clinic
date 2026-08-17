"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Paper, Alert, Skeleton } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import StatCard from "./components/StatCard";
import { DashboardService } from "./service/dashboard.service";
import { DashboardStats } from "./type/dashboardTypes";

const currencyFormatter = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

const STATUS_LABELS: Record<string, string> = {
    pendiente: "Pendientes",
    confirmada: "Confirmadas",
    completada: "Completadas",
    cancelada: "Canceladas",
};

const STATUS_COLORS: Record<string, string> = {
    pendiente: "#F5A623",
    confirmada: "#2ABFBF",
    completada: "#3FB950",
    cancelada: "#E5484D",
};

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        DashboardService.getStats()
            .then((data) => {
                if (!cancelled) setStats(data);
            })
            .catch((error: unknown) => {
                console.error("Error loading dashboard stats:", error);
                if (!cancelled) {
                    const err = error as { response?: { data?: { message?: string } }; message?: string };
                    setErrorMessage(err.response?.data?.message || err.message || "Error al cargar el dashboard.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const appointmentsByStatus = Object.entries(stats?.appointmentsByStatusLast7Days ?? {}).map(([status, count]) => ({
        id: status,
        label: STATUS_LABELS[status] || status,
        value: count,
        color: STATUS_COLORS[status],
    }));

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700, color: "text.primary", mb: 1, letterSpacing: "-0.02em" }}
                >
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Resumen general de la actividad de la clínica.
                </Typography>
            </Box>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
                    gap: 2.5,
                }}
            >
                <StatCard
                    label="Citas de hoy"
                    value={stats?.appointmentsToday ?? 0}
                    icon={CalendarMonthRoundedIcon}
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    label="Mascotas activas"
                    value={stats?.activePets ?? 0}
                    icon={PetsRoundedIcon}
                    color="secondary"
                    loading={loading}
                />
                <StatCard
                    label="Dueños activos"
                    value={stats?.activeOwners ?? 0}
                    icon={GroupRoundedIcon}
                    color="info"
                    loading={loading}
                />
                <StatCard
                    label="Hospitalizados"
                    value={stats?.hospitalizedPets ?? 0}
                    icon={LocalHospitalRoundedIcon}
                    color="error"
                    loading={loading}
                    highlight={!!stats?.hospitalizedPets}
                />
                <StatCard
                    label="Cirugías de hoy"
                    value={stats?.surgeriesToday ?? 0}
                    icon={MedicalServicesRoundedIcon}
                    color="warning"
                    loading={loading}
                />
                <StatCard
                    label="Vacunas por vencer (7 días)"
                    value={stats?.vaccinationsDueSoon ?? 0}
                    icon={VaccinesRoundedIcon}
                    color="success"
                    loading={loading}
                />
                <StatCard
                    label="Desparasitaciones por vencer (7 días)"
                    value={stats?.dewormingsDueSoon ?? 0}
                    icon={BugReportRoundedIcon}
                    color="success"
                    loading={loading}
                />
                <StatCard
                    label="Ingresos del mes"
                    value={loading ? 0 : currencyFormatter.format(stats?.revenueThisMonth ?? 0)}
                    icon={PaidRoundedIcon}
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    label="Facturas pendientes de pago"
                    value={stats?.pendingInvoices ?? 0}
                    icon={ReceiptLongRoundedIcon}
                    color="warning"
                    loading={loading}
                    highlight={!!stats?.pendingInvoices}
                />
                <StatCard
                    label="Productos con stock bajo"
                    value={stats?.lowStockProducts ?? 0}
                    icon={Inventory2RoundedIcon}
                    color="error"
                    loading={loading}
                    highlight={!!stats?.lowStockProducts}
                />
                <StatCard
                    label="Lotes por vencer (30 días)"
                    value={stats?.expiringLots ?? 0}
                    icon={EventBusyRoundedIcon}
                    color="error"
                    loading={loading}
                    highlight={!!stats?.expiringLots}
                />
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
                    gap: 2.5,
                }}
            >
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "16px" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Citas de los últimos 7 días
                    </Typography>
                    {loading ? (
                        <Skeleton variant="rounded" height={260} />
                    ) : (
                        <BarChart
                            height={260}
                            series={[
                                {
                                    data: (stats?.appointmentsLast7Days ?? []).map((p) => p.value),
                                    label: "Citas",
                                    color: "#2ABFBF",
                                },
                            ]}
                            xAxis={[
                                {
                                    scaleType: "band",
                                    data: (stats?.appointmentsLast7Days ?? []).map((p) => p.label),
                                },
                            ]}
                            yAxis={[{ tickMinStep: 1 }]}
                            hideLegend
                        />
                    )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "16px" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Citas de los últimos 7 días por estado
                    </Typography>
                    {loading ? (
                        <Skeleton variant="rounded" height={260} />
                    ) : appointmentsByStatus.length === 0 ? (
                        <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                No hay citas registradas en los últimos 7 días.
                            </Typography>
                        </Box>
                    ) : (
                        <PieChart
                            height={260}
                            series={[
                                {
                                    data: appointmentsByStatus,
                                    innerRadius: 45,
                                    paddingAngle: 2,
                                    cornerRadius: 4,
                                },
                            ]}
                        />
                    )}
                </Paper>
            </Box>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "16px" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Ingresos de los últimos 7 días
                </Typography>
                {loading ? (
                    <Skeleton variant="rounded" height={260} />
                ) : (
                    <LineChart
                        height={260}
                        series={[
                            {
                                data: (stats?.revenueLast7Days ?? []).map((p) => p.value),
                                label: "Ingresos (S/)",
                                color: "#2ABFBF",
                                area: true,
                                showMark: true,
                            },
                        ]}
                        xAxis={[
                            {
                                scaleType: "point",
                                data: (stats?.revenueLast7Days ?? []).map((p) => p.label),
                            },
                        ]}
                        hideLegend
                    />
                )}
            </Paper>
        </Box>
    );
}
