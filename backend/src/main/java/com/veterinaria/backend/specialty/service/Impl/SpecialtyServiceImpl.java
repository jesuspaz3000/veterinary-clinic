package com.veterinaria.backend.specialty.service.Impl;

import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import com.veterinaria.backend.specialty.dto.CreateSpecialtyDTO;
import com.veterinaria.backend.specialty.dto.SpecialtyDTO;
import com.veterinaria.backend.specialty.dto.UpdateSpecialtyDTO;
import com.veterinaria.backend.specialty.mapper.SpecialtyMapper;
import com.veterinaria.backend.specialty.model.Specialty;
import com.veterinaria.backend.specialty.repository.SpecialtyRepository;
import com.veterinaria.backend.specialty.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final SpecialtyMapper specialtyMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyDTO> getAllSpecialties() {
        return specialtyRepository.findAll().stream().map(specialty -> {
            long count = specialtyRepository.countVeterinariansBySpecialtyId(specialty.getId());
            List<String> names = specialtyRepository.findAssignedVeterinarianNames(specialty.getId());
            return specialtyMapper.toDTO(specialty, count, names);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialtyDTO getSpecialtyById(UUID id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Specialty not found"));
        long count = specialtyRepository.countVeterinariansBySpecialtyId(id);
        List<String> names = specialtyRepository.findAssignedVeterinarianNames(id);
        return specialtyMapper.toDTO(specialty, count, names);
    }

    @Override
    @Transactional
    public SpecialtyDTO createSpecialty(CreateSpecialtyDTO dto) {
        String trimmedName = dto.getName().trim();
        if (specialtyRepository.existsByName(trimmedName)) {
            throw new ConflictException("La especialidad '" + trimmedName + "' ya existe");
        }

        Specialty specialty = Specialty.builder()
                .name(trimmedName)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .build();

        Specialty saved = specialtyRepository.saveAndFlush(specialty);
        log.info("Specialty created: {}", saved.getName());
        return specialtyMapper.toDTO(saved, 0, List.of());
    }

    @Override
    @Transactional
    public SpecialtyDTO updateSpecialty(UUID id, UpdateSpecialtyDTO dto) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Specialty not found"));

        String newName = dto.getName().trim();
        if (!specialty.getName().equalsIgnoreCase(newName)) {
            if (specialtyRepository.existsByName(newName)) {
                throw new ConflictException("La especialidad '" + newName + "' ya existe");
            }
        }

        specialty.setName(newName);
        specialty.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        Specialty updated = specialtyRepository.saveAndFlush(specialty);
        long count = specialtyRepository.countVeterinariansBySpecialtyId(id);
        List<String> names = specialtyRepository.findAssignedVeterinarianNames(id);
        log.info("Specialty updated: {}", updated.getName());
        return specialtyMapper.toDTO(updated, count, names);
    }

    @Override
    @Transactional
    public void deleteSpecialty(UUID id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Specialty not found"));

        long count = specialtyRepository.countVeterinariansBySpecialtyId(id);
        if (count > 0) {
            throw new BusinessException("No se puede eliminar la especialidad '" + specialty.getName() +
                    "' porque está asignada a " + count + " veterinario(s).");
        }

        specialtyRepository.delete(specialty);
        log.info("Specialty deleted: {}", specialty.getName());
    }
}
