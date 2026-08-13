package com.veterinaria.backend.grooming.service;

import com.veterinaria.backend.grooming.dto.CreateGroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.dto.GroomingSpecialtyDTO;
import com.veterinaria.backend.grooming.dto.UpdateGroomingSpecialtyDTO;

import java.util.List;
import java.util.UUID;

public interface GroomingSpecialtyService {
    List<GroomingSpecialtyDTO> getAllSpecialties();
    GroomingSpecialtyDTO getSpecialtyById(UUID id);
    GroomingSpecialtyDTO createSpecialty(CreateGroomingSpecialtyDTO dto);
    GroomingSpecialtyDTO updateSpecialty(UUID id, UpdateGroomingSpecialtyDTO dto);
    void deleteSpecialty(UUID id);
}
