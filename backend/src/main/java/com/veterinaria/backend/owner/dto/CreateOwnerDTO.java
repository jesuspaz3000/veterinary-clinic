package com.veterinaria.backend.owner.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOwnerDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede exceder los 100 caracteres")
    private String lastName;

    @Size(max = 20, message = "El tipo de documento no puede exceder los 20 caracteres")
    private String documentType;

    @Size(max = 30, message = "El número de documento no puede exceder los 30 caracteres")
    private String documentNumber;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20, message = "El teléfono no puede exceder los 20 caracteres")
    private String phone;

    @Email(message = "El correo electrónico debe ser válido")
    @Size(max = 100, message = "El correo no puede exceder los 100 caracteres")
    private String email;

    @Size(max = 255, message = "La dirección no puede exceder los 255 caracteres")
    private String address;
}
