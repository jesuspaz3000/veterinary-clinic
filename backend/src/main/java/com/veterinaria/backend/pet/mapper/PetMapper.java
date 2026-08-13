package com.veterinaria.backend.pet.mapper;

import com.veterinaria.backend.common.storage.StorageService;
import com.veterinaria.backend.owner.mapper.OwnerMapper;
import com.veterinaria.backend.pet.dto.PetDTO;
import com.veterinaria.backend.pet.model.Pet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

@Component
@RequiredArgsConstructor
public class PetMapper {

    private final OwnerMapper ownerMapper;
    private final StorageService storageService;

    public PetDTO toDTO(Pet pet) {
        if (pet == null) return null;

        String ageStr = calculateAge(pet.getBirthDate());

        return PetDTO.builder()
                .id(pet.getId())
                .owner(ownerMapper.toDTO(pet.getOwner()))
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .color(pet.getColor())
                .sex(pet.getSex())
                .birthDate(pet.getBirthDate())
                .age(ageStr)
                .weight(pet.getWeight())
                .microchipNumber(pet.getMicrochipNumber())
                .sterilized(pet.getSterilized())
                .photoUrl(storageService.resolveUrl(pet.getPhotoUrl()))
                .status(pet.getStatus())
                .specialNotes(pet.getSpecialNotes())
                .createdAt(pet.getCreatedAt())
                .updatedAt(pet.getUpdatedAt())
                .build();
    }

    private String calculateAge(LocalDate birthDate) {
        if (birthDate == null) return "Desconocida";
        LocalDate now = LocalDate.now();
        if (birthDate.isAfter(now)) return "Desconocida";

        Period period = Period.between(birthDate, now);
        int years = period.getYears();
        int months = period.getMonths();

        if (years == 0 && months == 0) {
            int days = period.getDays();
            return days + (days == 1 ? " día" : " días");
        }

        StringBuilder sb = new StringBuilder();
        if (years > 0) {
            sb.append(years).append(years == 1 ? " año" : " años");
        }
        if (months > 0) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(months).append(months == 1 ? " mes" : " meses");
        }

        return sb.toString();
    }
}
