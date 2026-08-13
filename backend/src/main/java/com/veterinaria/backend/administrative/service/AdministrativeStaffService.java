package com.veterinaria.backend.administrative.service;

import com.veterinaria.backend.administrative.dto.AdministrativeStaffDTO;
import com.veterinaria.backend.administrative.dto.CreateAdministrativeStaffDTO;
import com.veterinaria.backend.administrative.dto.UpdateAdministrativeStaffDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AdministrativeStaffService {
    List<AdministrativeStaffDTO> getAllAdministrativeStaff(String search);
    Page<AdministrativeStaffDTO> getAllAdministrativeStaffPaginated(String search, Pageable pageable);
    AdministrativeStaffDTO getAdministrativeStaffById(UUID id);

    AdministrativeStaffDTO createAdministrativeStaff(CreateAdministrativeStaffDTO dto);
    AdministrativeStaffDTO updateAdministrativeStaff(UUID id, UpdateAdministrativeStaffDTO dto);
    void deleteAdministrativeStaff(UUID id);
}
