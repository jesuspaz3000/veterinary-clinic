package com.veterinaria.backend.veterinarian.mapper;

import com.veterinaria.backend.specialty.dto.SpecialtyDTO;
import com.veterinaria.backend.specialty.mapper.SpecialtyMapper;
import com.veterinaria.backend.user.mapper.UserMapper;
import com.veterinaria.backend.veterinarian.dto.VeterinarianDTO;
import com.veterinaria.backend.veterinarian.model.Veterinarian;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VeterinarianMapper {
    private final UserMapper userMapper;
    private final SpecialtyMapper specialtyMapper;

    public VeterinarianDTO toDTO(Veterinarian vet) {
        if (vet == null) return null;

        Set<SpecialtyDTO> specialtyDTOs = vet.getSpecialties() != null
                ? vet.getSpecialties().stream()
                .map(s -> specialtyMapper.toDTO(s, 0, null))
                .collect(Collectors.toSet())
                : Set.of();

        return VeterinarianDTO.builder()
                .id(vet.getId())
                .user(userMapper.toDTO(vet.getUser()))
                .licenseNumber(vet.getLicenseNumber())
                .specialties(specialtyDTOs)
                .hireDate(vet.getHireDate())
                .status(vet.getStatus())
                .createdAt(vet.getCreatedAt())
                .updatedAt(vet.getUpdatedAt())
                .build();
    }
}
