package com.baseservice.entity;

import lombok.Builder;

import java.io.Serializable;

/**
 * DTO for {@link BaseEntity}
 */
@Builder
public record BaseResponse(
        Long id,
        String nome,
        String endereco,
        String bairro,
        String municipio,
        String telefone,
        String email,
        String tipoBase
) implements Serializable {
}