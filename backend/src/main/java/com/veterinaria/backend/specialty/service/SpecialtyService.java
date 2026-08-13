package com.veterinaria.backend.specialty.service;

import com.veterinaria.backend.specialty.dto.CreateSpecialtyDTO;
import com.veterinaria.backend.specialty.dto.SpecialtyDTO;
import com.veterinaria.backend.specialty.dto.UpdateSpecialtyDTO;

import java.util.List;
import java.util.UUID;

public interface SpecialtyService {
    List<SpecialtyDTO> getAllSpecialties();
    SpecialtyDTO getSpecialtyById(UUID id);
    SpecialtyDTO createSpecialty(CreateSpecialtyDTO dto);
    SpecialtyDTO updateSpecialty(UUID id, UpdateSpecialtyDTO dto);
    void deleteSpecialty(UUID id);
}
