package com.avaliacaoservice.auth.entity.userDto;

import lombok.Builder;

@Builder
public record UserResponse(

        Long id,
        String user,
        String password,
        String role,
        Long baseId
) {
}


