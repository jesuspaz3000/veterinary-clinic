package com.veterinaria.backend.grooming.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.grooming.dto.CreateGroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.dto.GroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.dto.UpdateGroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.mapper.GroomingSpecialtyMapper;
import com.veterinaria.backend.grooming.model.GroomingSpecialty;
import com.veterinaria.backend.grooming.repository.GroomingSpecialtyRepository;
import com.veterinaria.backend.grooming.service.GroomingSpecialtyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroomingSpecialtyServiceImpl implements GroomingSpecialtyService {

    private final GroomingSpecialtyRepository specialtyRepository;
    private final GroomingSpecialtyMapper specialtyMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GroomingSpecialtyDTO> getAllSpecialties() {
        return specialtyRepository.findAll().stream().map(specialty -> {
            long count = specialtyRepository.countGroomingStaffBySpecialtyId(specialty.getId());
            List<String> names = specialtyRepository.findAssignedStaffNames(specialty.getId());
            return specialtyMapper.toDTO(specialty, count, names);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GroomingSpecialtyDTO getSpecialtyById(UUID id) {
        GroomingSpecialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Grooming specialty not found"));
        long count = specialtyRepository.countGroomingStaffBySpecialtyId(id);
        List<String> names = specialtyRepository.findAssignedStaffNames(id);
        return specialtyMapper.toDTO(specialty, count, names);
    }

    @Override
    @Transactional
    public GroomingSpecialtyDTO createSpecialty(CreateGroomingSpecialtyDTO dto) {
        String trimmedName = dto.getName().trim();
        if (specialtyRepository.existsByName(trimmedName)) {
            throw new ConflictException("La especialidad de peluquería '" + trimmedName + "' ya existe");
        }

        GroomingSpecialty specialty = GroomingSpecialty.builder()
                .name(trimmedName)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .build();

        GroomingSpecialty saved = specialtyRepository.saveAndFlush(specialty);
        log.info("Grooming specialty created: {}", saved.getName());
        return specialtyMapper.toDTO(saved, 0, List.of());
    }

    @Override
    @Transactional
    public GroomingSpecialtyDTO updateSpecialty(UUID id, UpdateGroomingSpecialtyDTO dto) {
        GroomingSpecialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Grooming specialty not found"));

        String newName = dto.getName().trim();
        if (!specialty.getName().equalsIgnoreCase(newName)) {
            if (specialtyRepository.existsByName(newName)) {
                throw new ConflictException("La especialidad de peluquería '" + newName + "' ya existe");
            }
        }

        specialty.setName(newName);
        specialty.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        GroomingSpecialty updated = specialtyRepository.saveAndFlush(specialty);
        long count = specialtyRepository.countGroomingStaffBySpecialtyId(id);
        List<String> names = specialtyRepository.findAssignedStaffNames(id);
        log.info("Grooming specialty updated: {}", updated.getName());
        return specialtyMapper.toDTO(updated, count, names);
    }

    @Override
    @Transactional
    public void deleteSpecialty(UUID id) {
        GroomingSpecialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Grooming specialty not found"));

        long count = specialtyRepository.countGroomingStaffBySpecialtyId(id);
        if (count > 0) {
            throw new BusinessException("No se puede eliminar la especialidad de peluquería '" + specialty.getName() +
                    "' porque está asignada a " + count + " personal(es) de grooming.");
        }

        specialtyRepository.delete(specialty);
        log.info("Grooming specialty deleted: {}", specialty.getName());
    }
}
