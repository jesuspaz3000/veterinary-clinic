package com.veterinaria.backend.clinicalhistory.service.Impl;

import com.veterinaria.backend.appointment.model.Appointment;
import com.veterinaria.backend.appointment.repository.AppointmentRepository;
import com.veterinaria.backend.clinicalhistory.dto.ClinicalHistoryEntryDTO;
import com.veterinaria.backend.clinicalhistory.service.ClinicalHistoryService;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.deworming.model.DewormingRecord;
import com.veterinaria.backend.deworming.repository.DewormingRecordRepository;
import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.hospitalization.model.HospitalizationRecord;
import com.veterinaria.backend.hospitalization.repository.HospitalizationRecordRepository;
import com.veterinaria.backend.medicalrecord.model.MedicalRecord;
import com.veterinaria.backend.medicalrecord.repository.MedicalRecordRepository;
import com.veterinaria.backend.pet.repository.PetRepository;
import com.veterinaria.backend.surgery.model.SurgeryRecord;
import com.veterinaria.backend.surgery.repository.SurgeryRecordRepository;
import com.veterinaria.backend.user.model.User;
import com.veterinaria.backend.vaccination.model.VaccinationRecord;
import com.veterinaria.backend.vaccination.repository.VaccinationRecordRepository;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalHistoryServiceImpl implements ClinicalHistoryService {

    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final DewormingRecordRepository dewormingRecordRepository;
    private final SurgeryRecordRepository surgeryRecordRepository;
    private final HospitalizationRecordRepository hospitalizationRecordRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ClinicalHistoryEntryDTO> getClinicalHistory(UUID petId) {
        if (!petRepository.existsById(petId)) {
            throw new NotFoundException("Mascota no encontrada");
        }

        List<ClinicalHistoryEntryDTO> entries = new ArrayList<>();

        for (Appointment a : appointmentRepository.findByPetIdOrderByDateDescStartTimeDesc(petId)) {
            entries.add(ClinicalHistoryEntryDTO.builder()
                    .type("appointment")
                    .id(a.getId())
                    .date(a.getDate().atTime(a.getStartTime()).atZone(ZoneId.systemDefault()).toInstant())
                    .title("Cita: " + a.getServiceType())
                    .subtitle(professionalName(a.getVeterinarian(), a.getGroomingStaff()))
                    .status(a.getStatus())
                    .description(a.getNotes())
                    .build());
        }

        for (MedicalRecord m : medicalRecordRepository.findByPetIdOrderByRecordDateDesc(petId)) {
            entries.add(ClinicalHistoryEntryDTO.builder()
                    .type("medical_record")
                    .id(m.getId())
                    .date(m.getRecordDate())
                    .title("Registro médico: " + labelOrRaw(m.getRecordType()))
                    .subtitle(vetName(m.getVeterinarian()))
                    .status(m.getStatus())
                    .description(joinNonBlank(m.getDiagnosis(), m.getTreatment(), m.getReason()))
                    .build());
        }

        for (VaccinationRecord v : vaccinationRecordRepository.findByPetIdAndIsActiveTrueOrderByApplicationDateDesc(petId)) {
            entries.add(ClinicalHistoryEntryDTO.builder()
                    .type("vaccination")
                    .id(v.getId())
                    .date(v.getApplicationDate().atStartOfDay(ZoneId.systemDefault()).toInstant())
                    .title("Vacunación: " + v.getVaccineName())
                    .subtitle(vetName(v.getVeterinarian()))
                    .status(v.getNextDoseDate() != null ? "Próxima dosis: " + v.getNextDoseDate() : null)
                    .description(v.getObservations())
                    .build());
        }

        for (DewormingRecord d : dewormingRecordRepository.findByPetIdAndIsActiveTrueOrderByApplicationDateDesc(petId)) {
            entries.add(ClinicalHistoryEntryDTO.builder()
                    .type("deworming")
                    .id(d.getId())
                    .date(d.getApplicationDate().atStartOfDay(ZoneId.systemDefault()).toInstant())
                    .title("Desparasitación: " + d.getProductName())
                    .subtitle(vetName(d.getVeterinarian()))
                    .status(d.getNextApplicationDate() != null ? "Próxima dosis: " + d.getNextApplicationDate() : null)
                    .description(d.getObservations())
                    .build());
        }

        for (SurgeryRecord s : surgeryRecordRepository.findByPetIdAndIsActiveTrueOrderBySurgeryDateDesc(petId)) {
            entries.add(ClinicalHistoryEntryDTO.builder()
                    .type("surgery")
                    .id(s.getId())
                    .date(s.getSurgeryDate())
                    .title("Cirugía: " + labelOrRaw(s.getSurgeryType()))
                    .subtitle(vetName(s.getVeterinarian()))
                    .status(s.getStatus())
                    .description(joinNonBlank(s.getSurgeryNotes(), s.getComplications()))
                    .build());
        }

        for (HospitalizationRecord h : hospitalizationRecordRepository.findByPetIdAndIsActiveTrueOrderByAdmissionDateDesc(petId)) {
            entries.add(ClinicalHistoryEntryDTO.builder()
                    .type("hospitalization")
                    .id(h.getId())
                    .date(h.getAdmissionDate())
                    .title("Hospitalización: " + h.getReason())
                    .subtitle(vetName(h.getVeterinarian()))
                    .status(h.getStatus())
                    .description(joinNonBlank(h.getFinalDiagnosis(), h.getDischargeNotes()))
                    .build());
        }

        entries.sort(Comparator.comparing(ClinicalHistoryEntryDTO::getDate).reversed());
        return entries;
    }

    private String professionalName(Veterinarian veterinarian, GroomingStaff groomingStaff) {
        if (veterinarian != null) return vetName(veterinarian);
        if (groomingStaff != null) return userName(groomingStaff.getUser(), "Grooming");
        return "Sin asignar";
    }

    private String vetName(Veterinarian veterinarian) {
        return veterinarian != null ? userName(veterinarian.getUser(), "Veterinario") : null;
    }

    private String userName(User user, String fallback) {
        if (user == null) return fallback;
        String full = ((user.getFirstName() != null ? user.getFirstName() : "")
                + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (!full.isEmpty()) return full;
        return user.getUsername() != null ? user.getUsername() : fallback;
    }

    private String labelOrRaw(String value) {
        return value != null ? value : "";
    }

    private String joinNonBlank(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part != null && !part.isBlank()) {
                if (sb.length() > 0) sb.append(" — ");
                sb.append(part.trim());
            }
        }
        return sb.length() > 0 ? sb.toString() : null;
    }
}
