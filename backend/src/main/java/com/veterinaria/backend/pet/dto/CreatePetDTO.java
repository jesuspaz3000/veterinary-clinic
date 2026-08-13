package com.veterinaria.backend.pet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePetDTO {

    @NotNull(message = "El dueño es obligatorio")
    private UUID ownerId;

    @NotBlank(message = "El nombre de la mascota es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String name;

    @NotBlank(message = "La especie es obligatoria")
    @Size(max = 50, message = "La especie no puede exceder los 50 caracteres")
    private String species;

    @Size(max = 100, message = "La raza no puede exceder los 100 caracteres")
    private String breed;

    @Size(max = 50, message = "El color no puede exceder los 50 caracteres")
    private String color;

    @NotBlank(message = "El sexo es obligatorio")
    @Size(max = 20, message = "El sexo no puede exceder los 20 caracteres")
    private String sex;

    private LocalDate birthDate;

    private BigDecimal weight;

    @Size(max = 50, message = "El número de microchip no puede exceder los 50 caracteres")
    private String microchipNumber;

    private Boolean sterilized;

    private MultipartFile photo;

    @Size(max = 20, message = "El estado no puede exceder los 20 caracteres")
    private String status;

    @Size(max = 1000, message = "Las notas no pueden exceder los 1000 caracteres")
    private String specialNotes;
}
