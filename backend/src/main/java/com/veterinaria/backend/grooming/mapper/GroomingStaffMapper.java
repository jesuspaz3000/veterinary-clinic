package com.veterinaria.backend.grooming.mapper;

import com.veterinaria.backend.grooming.dto.GroomingStaffDTO;
import com.veterinaria.backend.grooming.model.GroomingStaff;
import com.veterinaria.backend.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class GroomingStaffMapper {
    private final UserMapper userMapper;
    private final GroomingSpecialtyMapper specialtyMapper;

    public GroomingStaffDTO toDTO(GroomingStaff staff) {
        if (staff == null) return null;

        var specialtyDTOs = staff.getSpecialties() != null
                ? staff.getSpecialties().stream()
                    .map(s -> specialtyMapper.toDTO(s, 0, List.of()))
                    .collect(Collectors.toSet())
                : java.util.Collections.<com.veterinaria.backend.grooming.dto.GroomingSpecialtyDTO>emptySet();

        return GroomingStaffDTO.builder()
                .id(staff.getId())
                .user(userMapper.toDTO(staff.getUser()))
                .specialties(specialtyDTOs)
                .experienceYears(staff.getExperienceYears())
                .hireDate(staff.getHireDate())
                .status(staff.getStatus())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }
}
