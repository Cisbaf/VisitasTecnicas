package com.authservice.entity.userDto;

import com.authservice.entity.UserEntity;
import lombok.Builder;

import java.io.Serializable;

/**
 * DTO for {@link UserEntity}
 */
@Builder
public record UserResponse(Long id, String user, String password, String role) implements Serializable {
}