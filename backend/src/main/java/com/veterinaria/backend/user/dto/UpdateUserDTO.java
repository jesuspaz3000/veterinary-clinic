package com.veterinaria.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDTO {
    @NotBlank(message = "Username cannot be null")
    private String username;

    @NotBlank(message = "Email cannot be null")
    @Email(message = "Email must be valid")
    private String email;

    private String firstName;
    private String lastName;

    @NotNull(message = "Role ID cannot be null")
    private UUID roleId;
    @jakarta.validation.constraints.Pattern(regexp = "^$|^\\+?[1-9]\\d{6,14}$", message = "Formato de teléfono no válido")
    private String phone;
    private MultipartFile avatar;

    @Builder.Default
    private Boolean removeAvatar = false;
}
