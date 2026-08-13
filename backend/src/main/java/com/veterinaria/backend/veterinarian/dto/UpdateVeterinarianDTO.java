package com.veterinaria.backend.veterinarian.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVeterinarianDTO {
    // User fields
    @NotBlank(message = "Username cannot be null")
    private String username;

    @NotBlank(message = "Email cannot be null")
    @Email(message = "Email must be valid")
    private String email;

    private String firstName;
    private String lastName;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^\\+?[1-9]\\d{6,14}$", message = "Formato de teléfono no válido")
    private String phone;
    private MultipartFile avatar;

    @Builder.Default
    private Boolean removeAvatar = false;

    // Veterinarian specific fields
    @NotBlank(message = "License number cannot be null")
    private String licenseNumber;

    @Builder.Default
    private Set<UUID> specialtyIds = new HashSet<>();

    private LocalDate hireDate;

    @NotBlank(message = "Status cannot be null")
    private String status;
}
