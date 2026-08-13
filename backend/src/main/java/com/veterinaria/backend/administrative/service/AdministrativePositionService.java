package com.veterinaria.backend.administrative.service;

import com.veterinaria.backend.administrative.dto.AdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativePositionDTO;

import java.util.List;
import java.util.UUID;

public interface AdministrativePositionService {
    List<AdministrativePositionDTO> getAllPositions();
    AdministrativePositionDTO getPositionById(UUID id);
    AdministrativePositionDTO createPosition(CreateAdministrativePositionDTO dto);
    AdministrativePositionDTO updatePosition(UUID id, UpdateAdministrativePositionDTO dto);
    void deletePosition(UUID id);
}
