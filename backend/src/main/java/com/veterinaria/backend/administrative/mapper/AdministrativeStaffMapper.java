package com.veterinaria.backend.administrative.mapper;

import com.veterinaria.backend.administrative.dto.AdministrativeAreaDTO;
import com.veterinaria.backend.administrative.dto.AdministrativePositionDTO;
import com.veterinaria.backend.administrative.dto.AdministrativeStaffDTO;
import com.veterinaria.backend.administrative.model.AdministrativeStaff;
import com.veterinaria.backend.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AdministrativeStaffMapper {
    private final UserMapper userMapper;
    private final AdministrativePositionMapper positionMapper;
    private final AdministrativeAreaMapper areaMapper;

    public AdministrativeStaffDTO toDTO(AdministrativeStaff staff) {
        if (staff == null) return null;

        Set<AdministrativePositionDTO> positionDTOs = staff.getPositions() != null
                ? staff.getPositions().stream().map(p -> positionMapper.toDTO(p, 0, null)).collect(Collectors.toSet())
                : Set.of();

        AdministrativeAreaDTO areaDTO = staff.getAssignedArea() != null
                ? areaMapper.toDTO(staff.getAssignedArea(), 0, null)
                : null;

        return AdministrativeStaffDTO.builder()
                .id(staff.getId())
                .user(userMapper.toDTO(staff.getUser()))
                .positions(positionDTOs)
                .assignedArea(areaDTO)
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }
}
