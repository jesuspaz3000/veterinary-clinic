package com.veterinaria.backend.grooming.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class CreateGroomingStaffDTO {

    @NotBlank(message = "Username cannot be null")
    private String username;

    @NotBlank(message = "Email cannot be null")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password cannot be null")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    private String firstName;

    private String lastName;

    @Pattern(regexp = "^$|^\\+?[1-9]\\d{6,14}$", message = "Formato de teléfono no válido")
    private String phone;

    private MultipartFile avatar;

    @Builder.Default
    private Set<UUID> specialtyIds = new HashSet<>();

    private Integer experienceYears;

    private LocalDate hireDate;
}
