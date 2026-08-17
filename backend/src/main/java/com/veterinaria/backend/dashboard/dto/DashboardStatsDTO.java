package com.veterinaria.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long appointmentsToday;
    private long activePets;
    private long activeOwners;
    private long hospitalizedPets;
    private long lowStockProducts;
    private long expiringLots;
    private long pendingInvoices;
    private long surgeriesToday;
    private long vaccinationsDueSoon;
    private long dewormingsDueSoon;
    private BigDecimal revenueThisMonth;
    private List<DashboardChartPointDTO> appointmentsLast7Days;
    private List<DashboardChartPointDTO> revenueLast7Days;
    private Map<String, Long> appointmentsByStatusLast7Days;
}
