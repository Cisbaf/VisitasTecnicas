package com.avaliacaoservice.auth.entity.userDto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record LoginRequest(

        @NotBlank(message = "Username é requerido")
        String user,
        @NotBlank
        String password
) {


}

