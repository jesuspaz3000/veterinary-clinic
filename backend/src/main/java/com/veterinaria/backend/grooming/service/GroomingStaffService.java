package com.veterinaria.backend.grooming.service;

import com.veterinaria.backend.grooming.dto.CreateGroomingStaffDTO;
import com.veterinaria.backend.grooming.dto.GroomingStaffDTO;
import com.veterinaria.backend.grooming.dto.UpdateGroomingStaffDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface GroomingStaffService {
    Page<GroomingStaffDTO> getAllGroomingStaffPaginated(String search, Pageable pageable);
    List<GroomingStaffDTO> getAllGroomingStaff(String search);
    GroomingStaffDTO getGroomingStaffById(UUID id);
    GroomingStaffDTO createGroomingStaff(CreateGroomingStaffDTO dto);
    GroomingStaffDTO updateGroomingStaff(UUID id, UpdateGroomingStaffDTO dto);
    void deleteGroomingStaff(UUID id);
}
