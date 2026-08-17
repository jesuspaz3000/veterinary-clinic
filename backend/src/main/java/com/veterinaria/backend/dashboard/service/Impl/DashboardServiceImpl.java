package com.veterinaria.backend.dashboard.service.Impl;

import com.veterinaria.backend.appointment.model.Appointment;
import com.veterinaria.backend.appointment.repository.AppointmentRepository;
import com.veterinaria.backend.dashboard.dto.DashboardChartPointDTO;
import com.veterinaria.backend.dashboard.dto.DashboardStatsDTO;
import com.veterinaria.backend.dashboard.service.DashboardService;
import com.veterinaria.backend.deworming.repository.DewormingRecordRepository;
import com.veterinaria.backend.hospitalization.repository.HospitalizationRecordRepository;
import com.veterinaria.backend.owner.repository.OwnerRepository;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.product.repository.InventoryLotRepository;
import com.veterinaria.backend.product.repository.ProductVariantRepository;
import com.veterinaria.backend.sales.model.Invoice;
import com.veterinaria.backend.sales.repository.InvoiceRepository;
import com.veterinaria.backend.surgery.repository.SurgeryRecordRepository;
import com.veterinaria.backend.vaccination.repository.VaccinationRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");
    private static final List<String> PENDING_PAYMENT_STATUSES = List.of("pendiente", "parcial");
    private static final int DUE_SOON_DAYS = 7;
    private static final int EXPIRING_LOT_DAYS = 30;

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final OwnerRepository ownerRepository;
    private final HospitalizationRecordRepository hospitalizationRecordRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryLotRepository inventoryLotRepository;
    private final InvoiceRepository invoiceRepository;
    private final SurgeryRecordRepository surgeryRecordRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final DewormingRecordRepository dewormingRecordRepository;

    @Override
    public DashboardStatsDTO getStats() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        Instant todayStart = today.atStartOfDay(zone).toInstant();
        Instant todayEnd = today.plusDays(1).atStartOfDay(zone).toInstant();

        long surgeriesToday = surgeryRecordRepository.countBySurgeryDateBetweenAndIsActiveTrue(todayStart, todayEnd);

        LocalDate monthStart = today.withDayOfMonth(1);
        List<Invoice> invoicesThisMonth = invoiceRepository.findByIssuedAtBetween(
                monthStart.atStartOfDay(zone).toInstant(), todayEnd);
        BigDecimal revenueThisMonth = sumRevenue(invoicesThisMonth);

        return DashboardStatsDTO.builder()
                .appointmentsToday(appointmentRepository.countByDate(today))
                .activePets(petRepository.countByStatus("activo"))
                .activeOwners(ownerRepository.countByIsActiveTrue())
                .hospitalizedPets(hospitalizationRecordRepository.countByStatusAndIsActiveTrue("activo"))
                .lowStockProducts(productVariantRepository.countLowStock())
                .expiringLots(inventoryLotRepository.findExpiringLots(today.plusDays(EXPIRING_LOT_DAYS)).size())
                .pendingInvoices(invoiceRepository.countByPaymentStatusIn(PENDING_PAYMENT_STATUSES))
                .surgeriesToday(surgeriesToday)
                .vaccinationsDueSoon(vaccinationRecordRepository.countByIsActiveTrueAndNextDoseDateBetween(
                        today, today.plusDays(DUE_SOON_DAYS)))
                .dewormingsDueSoon(dewormingRecordRepository.countByIsActiveTrueAndNextApplicationDateBetween(
                        today, today.plusDays(DUE_SOON_DAYS)))
                .revenueThisMonth(revenueThisMonth)
                .appointmentsLast7Days(buildAppointmentsLast7Days(today))
                .revenueLast7Days(buildRevenueLast7Days(today, zone))
                .appointmentsByStatusLast7Days(buildAppointmentsByStatusLast7Days(today))
                .build();
    }

    private BigDecimal sumRevenue(List<Invoice> invoices) {
        return invoices.stream()
                .filter(inv -> !"anulado".equals(inv.getPaymentStatus()))
                .map(Invoice::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<DashboardChartPointDTO> buildAppointmentsLast7Days(LocalDate today) {
        LocalDate start = today.minusDays(6);
        Map<LocalDate, Long> counts = appointmentRepository.findByDateBetweenOrderByDateAsc(start, today).stream()
                .collect(Collectors.groupingBy(Appointment::getDate, Collectors.counting()));

        List<DashboardChartPointDTO> result = new ArrayList<>();
        for (int i = 0; i <= 6; i++) {
            LocalDate day = start.plusDays(i);
            result.add(DashboardChartPointDTO.builder()
                    .label(day.format(DAY_LABEL))
                    .value(BigDecimal.valueOf(counts.getOrDefault(day, 0L)))
                    .build());
        }
        return result;
    }

    private List<DashboardChartPointDTO> buildRevenueLast7Days(LocalDate today, ZoneId zone) {
        LocalDate start = today.minusDays(6);
        List<Invoice> invoices = invoiceRepository.findByIssuedAtBetween(
                start.atStartOfDay(zone).toInstant(), today.plusDays(1).atStartOfDay(zone).toInstant());

        Map<LocalDate, BigDecimal> sums = new HashMap<>();
        for (Invoice invoice : invoices) {
            if ("anulado".equals(invoice.getPaymentStatus())) {
                continue;
            }
            LocalDate day = invoice.getIssuedAt().atZone(zone).toLocalDate();
            sums.merge(day, invoice.getTotal(), BigDecimal::add);
        }

        List<DashboardChartPointDTO> result = new ArrayList<>();
        for (int i = 0; i <= 6; i++) {
            LocalDate day = start.plusDays(i);
            result.add(DashboardChartPointDTO.builder()
                    .label(day.format(DAY_LABEL))
                    .value(sums.getOrDefault(day, BigDecimal.ZERO))
                    .build());
        }
        return result;
    }

    private Map<String, Long> buildAppointmentsByStatusLast7Days(LocalDate today) {
        LocalDate start = today.minusDays(6);
        return appointmentRepository.findByDateBetweenOrderByDateAsc(start, today).stream()
                .collect(Collectors.groupingBy(Appointment::getStatus, Collectors.counting()));
    }
}
