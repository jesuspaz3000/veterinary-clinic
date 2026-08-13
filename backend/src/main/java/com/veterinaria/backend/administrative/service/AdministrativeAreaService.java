package com.veterinaria.backend.administrative.service;

import com.veterinaria.backend.administrative.dto.AdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativeAreaDTO;

import java.util.List;
import java.util.UUID;

public interface AdministrativeAreaService {
    List<AdministrativeAreaDTO> getAllAreas();
    AdministrativeAreaDTO getAreaById(UUID id);
    AdministrativeAreaDTO createArea(CreateAdministrativeAreaDTO dto);
    AdministrativeAreaDTO updateArea(UUID id, UpdateAdministrativeAreaDTO dto);
    void deleteArea(UUID id);
}
