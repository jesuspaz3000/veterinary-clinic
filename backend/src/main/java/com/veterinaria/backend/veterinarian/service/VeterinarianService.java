package com.veterinaria.backend.veterinarian.service;

import com.veterinaria.backend.veterinarian.dto.CreateVeterinarianDTO;
import com.veterinaria.backend.veterinarian.dto.UpdateVeterinarianDTO;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VeterinarianService {
    List<VeterinarianDTO> getAllVeterinarians(String search);
    Page<VeterinarianDTO> getAllVeterinariansPaginated(String search, Pageable pageable);
    VeterinarianDTO getVeterinarianById(UUID id);

    VeterinarianDTO createVeterinarian(CreateVeterinarianDTO dto);
    VeterinarianDTO updateVeterinarian(UUID id, UpdateVeterinarianDTO dto);
    void deleteVeterinarian(UUID id);
}
