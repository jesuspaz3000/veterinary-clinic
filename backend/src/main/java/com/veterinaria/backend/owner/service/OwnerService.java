package com.veterinaria.backend.owner.service;

import com.veterinaria.backend.owner.dto.CreateOwnerDTO;
import com.veterinaria.backend.owner.dto.OwnerDTO;
import com.veterinaria.backend.owner.dto.UpdateOwnerDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OwnerService {
    List<OwnerDTO> getAllOwners(String search);
    Page<OwnerDTO> getAllOwnersPaginated(String search, String status, Pageable pageable);
    OwnerDTO getOwnerById(UUID id);
    OwnerDTO createOwner(CreateOwnerDTO dto);
    OwnerDTO updateOwner(UUID id, UpdateOwnerDTO dto);
    void deleteOwner(UUID id);
    void reactivateOwner(UUID id);
}
