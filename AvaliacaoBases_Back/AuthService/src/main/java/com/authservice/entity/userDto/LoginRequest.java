package com.authservice.entity.userDto;

import com.authservice.entity.UserEntity;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;

/**
 * DTO for {@link UserEntity}
 */
public record LoginRequest(@NotBlank(message = "Username é requerido") String user,
                           @NotBlank String password) implements Serializable {
}