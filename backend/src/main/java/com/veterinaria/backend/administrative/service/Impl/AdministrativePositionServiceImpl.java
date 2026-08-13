package com.veterinaria.backend.administrative.service.Impl;

import com.veterinaria.backend.administrative.dto.AdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativePositionDTO;
import com.veterinaria.backend.administrative.mapper.AdministrativePositionMapper;
import com.veterinaria.backend.administrative.model.AdministrativePosition;
import com.veterinaria.backend.administrative.repository.AdministrativePositionRepository;
import com.veterinaria.backend.administrative.service.AdministrativePositionService;
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
public class AdministrativePositionServiceImpl implements AdministrativePositionService {

    private final AdministrativePositionRepository positionRepository;
    private final AdministrativePositionMapper positionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AdministrativePositionDTO> getAllPositions() {
        return positionRepository.findAll().stream().map(position -> {
            long count = positionRepository.countStaffByPositionId(position.getId());
            List<String> names = positionRepository.findAssignedStaffNames(position.getId());
            return positionMapper.toDTO(position, count, names);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdministrativePositionDTO getPositionById(UUID id) {
        AdministrativePosition position = positionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative position not found"));
        long count = positionRepository.countStaffByPositionId(id);
        List<String> names = positionRepository.findAssignedStaffNames(id);
        return positionMapper.toDTO(position, count, names);
    }

    @Override
    @Transactional
    public AdministrativePositionDTO createPosition(CreateAdministrativePositionDTO dto) {
        String trimmedName = dto.getName().trim();
        if (positionRepository.existsByName(trimmedName)) {
            throw new ConflictException("El cargo administrativo '" + trimmedName + "' ya existe");
        }

        AdministrativePosition position = AdministrativePosition.builder()
                .name(trimmedName)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .build();

        AdministrativePosition saved = positionRepository.saveAndFlush(position);
        log.info("Administrative position created: {}", saved.getName());
        return positionMapper.toDTO(saved, 0, List.of());
    }

    @Override
    @Transactional
    public AdministrativePositionDTO updatePosition(UUID id, UpdateAdministrativePositionDTO dto) {
        AdministrativePosition position = positionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative position not found"));

        String newName = dto.getName().trim();
        if (!position.getName().equalsIgnoreCase(newName)) {
            if (positionRepository.existsByName(newName)) {
                throw new ConflictException("El cargo administrativo '" + newName + "' ya existe");
            }
        }

        position.setName(newName);
        position.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);

        AdministrativePosition updated = positionRepository.saveAndFlush(position);
        long count = positionRepository.countStaffByPositionId(id);
        List<String> names = positionRepository.findAssignedStaffNames(id);
        log.info("Administrative position updated: {}", updated.getName());
        return positionMapper.toDTO(updated, count, names);
    }

    @Override
    @Transactional
    public void deletePosition(UUID id) {
        AdministrativePosition position = positionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrative position not found"));

        long count = positionRepository.countStaffByPositionId(id);
        if (count > 0) {
            throw new BusinessException("No se puede eliminar el cargo '" + position.getName() +
                    "' porque está asignado a " + count + " personal(es) administrativo(s).");
        }

        positionRepository.delete(position);
        log.info("Administrative position deleted: {}", position.getName());
    }
}
