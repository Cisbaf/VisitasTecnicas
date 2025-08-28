package com.authservice.entity.userDto;

import com.authservice.entity.UserEntity;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;

/**
 * DTO for {@link UserEntity}
 */
public record UserRequest(
        @NotBlank(message = "Username é requerido") String user,
        @NotBlank(message = "Senha é requerida") String password,
        @NotBlank(message = "Cargo é requerido")String role,
        Long baseId
) implements Serializable {}