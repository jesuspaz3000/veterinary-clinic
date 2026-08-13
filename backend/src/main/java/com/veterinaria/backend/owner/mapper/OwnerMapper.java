package com.veterinaria.backend.owner.mapper;

import com.veterinaria.backend.owner.dto.OwnerDTO;
import com.veterinaria.backend.owner.model.Owner;
import org.springframework.stereotype.Component;

@Component
public class OwnerMapper {

    public OwnerDTO toDTO(Owner owner) {
        return toDTO(owner, 0);
    }

    public OwnerDTO toDTO(Owner owner, long petsCount) {
        if (owner == null) return null;

        String fullName = (owner.getFirstName() != null ? owner.getFirstName().trim() : "") +
                " " +
                (owner.getLastName() != null ? owner.getLastName().trim() : "");

        return OwnerDTO.builder()
                .id(owner.getId())
                .firstName(owner.getFirstName())
                .lastName(owner.getLastName())
                .fullName(fullName.trim())
                .documentType(owner.getDocumentType())
                .documentNumber(owner.getDocumentNumber())
                .phone(owner.getPhone())
                .email(owner.getEmail())
                .address(owner.getAddress())
                .isActive(owner.getIsActive())
                .petsCount(petsCount)
                .createdAt(owner.getCreatedAt())
                .updatedAt(owner.getUpdatedAt())
                .build();
    }
}
