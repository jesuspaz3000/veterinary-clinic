package com.veterinaria.backend.pet.service;

import com.veterinaria.backend.pet.dto.CreatePetDTO;
import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.pet.dto.UpdatePetDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PetService {
    List<PetDTO> getAllPets(String search, UUID ownerId);
    Page<PetDTO> getAllPetsPaginated(String search, UUID ownerId, String status, Pageable pageable);
    PetDTO getPetById(UUID id);
    PetDTO createPet(CreatePetDTO dto);
    PetDTO updatePet(UUID id, UpdatePetDTO dto);
    void deletePet(UUID id);
    void reactivatePet(UUID id);
}
