package com.avaliacaoservice.auth.entity.userDto;

import jakarta.validation.constraints.NotBlank;

public record UserRequest(
        @NotBlank(message = "Username é requerido")
        String user,
        @NotBlank(message = "Senha é requerida")
        String password,
        @NotBlank(message = "Cargo é requerido")
        String role,
        Long baseId
) {

}
