package com.veterinaria.backend.administrative.service.Impl;

import com.veterinaria.backend.administrative.dto.AdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativeAreaDTO;
import com.veterinaria.backend.administrative.mapper.AdministrativeAreaMapper;
import com.veterinaria.backend.administrative.model.AdministrativeArea;
import com.veterinaria.backend.administrative.repository.AdministrativeAreaRepository;
import com.veterinaria.backend.administrative.service.AdministrativeAreaService;
import com.veterinaria.backend.common.exception.BusinessException;
import com.veterinaria.backend.common.exception.ConflictException;
import com.veterinaria.backend.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdministrativeAreaServiceImpl implements AdministrativeAreaService {

    private final AdministrativeAreaRepository areaRepository;
    private final AdministrativeAreaMapper areaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AdministrativeAreaDTO> getAllAreas() {
        return areaRepository.findAll().stream().map(area -> {
            long count = areaRepository.countStaffByAreaId(area.getId());
            List<String> names = areaRepository.findAssignedStaffNames(area.getId());
            return areaMapper.toDTO(area, count, names);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdministrativeAreaDTO getAreaById(UUID id) {
        AdministrativeArea area = areaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative area not found"));
        long count = areaRepository.countStaffByAreaId(id);
        List<String> names = areaRepository.findAssignedStaffNames(id);
        return areaMapper.toDTO(area, count, names);
    }

    @Override
    @Transactional
    public AdministrativeAreaDTO createArea(CreateAdministrativeAreaDTO dto) {
        String trimmedName = dto.getName().trim();
        if (areaRepository.existsByName(trimmedName)) {
            throw new ConflictException("El área administrativa '" + trimmedName + "' ya existe");
        }

        AdministrativeArea area = AdministrativeArea.builder()
                .name(trimmedName)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .build();

        AdministrativeArea saved = areaRepository.saveAndFlush(area);
        log.info("Administrative area created: {}", saved.getName());
        return areaMapper.toDTO(saved, 0, List.of());
    }

    @Override
    @Transactional
    public AdministrativeAreaDTO updateArea(UUID id, UpdateAdministrativeAreaDTO dto) {
        AdministrativeArea area = areaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative area not found"));

        String newName = dto.getName().trim();
        if (!area.getName().equalsIgnoreCase(newName)) {
            if (areaRepository.existsByName(newName)) {
                throw new ConflictException("El área administrativa '" + newName + "' ya existe");
            }
        }

        area.setName(newName);
        area.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        AdministrativeArea updated = areaRepository.saveAndFlush(area);
        long count = areaRepository.countStaffByAreaId(id);
        List<String> names = areaRepository.findAssignedStaffNames(id);
        log.info("Administrative area updated: {}", updated.getName());
        return areaMapper.toDTO(updated, count, names);
    }

    @Override
    @Transactional
    public void deleteArea(UUID id) {
        AdministrativeArea area = areaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative area not found"));

        long count = areaRepository.countStaffByAreaId(id);
        if (count > 0) {
            throw new BusinessException("No se puede eliminar el área '" + area.getName() +
                    "' porque está asignada a " + count + " personal(es) administrativo(s).");
        }

        areaRepository.delete(area);
        log.info("Administrative area deleted: {}", area.getName());
    }
}
